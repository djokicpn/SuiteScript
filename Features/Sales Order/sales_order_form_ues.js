/**
 * Sales Order Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define([
	'N/runtime',
	'./Module/salesEffective',
	'./Module/discountSoldPriceTaxModule',
	'N/search',
	'./Module/marginBalance'
], function(runtime, salesEffective, discountSoldPriceTaxModule, search, marginBalance) {
	const SHIPPING_METHODS = {
		RL_CARRIERS: 'LTL',
		WILL_CALL: 'Will Call',
		LEXOR_TRUCK: 'Lexor Truck',
		ODFL: 'LTL',
		UPS_PACKAGE: 'UPS Package',
		RFQ: 'RFQ (Requesting a Freight Quote)',
		OCEAN_SERVICE: 'Ocean Service',
		INTERNATIONAL: 'International'
	};

	function beforeLoad(context) {
		var form = context.form;
		var newRecord = context.newRecord;
		try {
			var item = form.getSublist({ id: 'item' });
			var currentUser = runtime.getCurrentUser();
			const role = currentUser.role;
			if (item) {
				var amountCol = item.getField({ id: 'amount' });
				if (amountCol) {
					amountCol.updateDisplayType({ displayType: 'disabled' });
				}

				// 1036	Lexor | Sales Representative
				// 1032	Lexor | Customer Service Rep
				// https://trello.com/c/2hFT7AlH/188-disable-tax-rate-for-sale-rep
				if (role === 1036 || role === 1032) {
					var taxrate1Col = item.getField({ id: 'taxrate1' });
					if (taxrate1Col) {
						taxrate1Col.updateDisplayType({ displayType: 'disabled' });
					}
					var taxcodeCol = item.getField({ id: 'taxcode' });
					if (taxcodeCol) {
						taxcodeCol.updateDisplayType({ displayType: 'disabled' });
					}
				}

				// Set Default Location
				var locationCol = item.getField({ id: 'location' });
				if (locationCol) {
					var location = newRecord.getValue({
						fieldId: 'location'
					});
					locationCol.defaultValue = location;
				}
			}

			shippingDiscountByTheManager(context);

			// View Mode
			if (context.type === context.UserEventType.VIEW) {
				try {
					var obj = getTotalWeightByLocation(newRecord);
					buildTableTotalWeight(newRecord, obj);
				} catch (err) {
					log.error({
						title: 'Error buildTableTotalWeight',
						details: err.message
					});
				}
			}

			discountSoldPriceTaxModule.beforeLoad(context);
		} catch (error) {
			log.error({
				title: 'Error beforeLoad',
				details: error.message
			});
		}

		// Get Remaining Balance
		setRemainingBalance(newRecord);
	}

	function beforeSubmit(context) {
		var newRecord = context.newRecord;
		try {
			const totalLine = newRecord.getLineCount({ sublistId: 'item' });
			for (var index = 0; index < totalLine; index++) {
				var quantity = newRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantity',
					line: index
				});
				var weightinlb = newRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'custcol45', // weightinlb
					line: index
				});
				// Update Total Weight Each Line
				newRecord.setSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_total_weight',
					line: index,
					value: quantity * weightinlb
				});
			}
		} catch (error) {
			log.error({
				title: 'Error updateTotalWeightByLocation',
				details: error.message
			});
		}
		discountSoldPriceTaxModule.beforeSubmit(newRecord);
		marginBalance.beforeSubmit(newRecord);
	}

	function afterSubmit(context) {
		var newRecord = context.newRecord;
		try {
			salesEffective.update(newRecord.id);	
		} catch (error) {
			log.error({
				title: 'Error afterSubmit',
				details: error
			});
		}
	}

	/** HEPPER FUNCTIONS **/
	/**
	 * Build Table Total Weight for View Mode
	 * @param {*} newRecord
	 * @param {*} obj
	 */
	function buildTableTotalWeight(newRecord, obj) {
		const tableTotalWeight = obj.tableTotalWeight;
		// Add Util Function Replace All
		String.prototype.replaceAll = function(search, replacement) {
			return this.split(search).join(replacement);
		};

		var dataObj = getTableWeightDataJSON(newRecord);

		var htmlTableTotalWeight =
			'<span class="smallgraytextnolink uir-label"><span class="smallgraytextnolink">Shipping Rates</span></span><table id="tableTotalWeight" class="lx-table"><thead><tr><th>Location</th><th>Total Weight</th><th>Shipping Method</th><th>Freight Rate</th><th>Discount</th></tr></thead><tbody>';
		var totalWeight = 0;
		var totalFreightRate = dataObj
			? dataObj.reduce(function(a, b) {
					return (
						(!isNaN(typeof a === 'number' ? a : a.FREIGHT_RATE)
							? parseFloat(typeof a === 'number' ? a : a.FREIGHT_RATE)
							: 0) +
						(!isNaN(typeof b === 'number' ? b : b.FREIGHT_RATE)
							? parseFloat(typeof b === 'number' ? b : b.FREIGHT_RATE)
							: 0)
					);
			  }, 0)
			: 0;
		var totalDiscount = dataObj
			? dataObj.reduce(function(a, b) {
					return (
						(!isNaN(typeof a === 'number' ? a : a.DISCOUNT)
							? parseFloat(typeof a === 'number' ? a : a.DISCOUNT)
							: 0) +
						(!isNaN(typeof b === 'number' ? b : b.DISCOUNT)
							? parseFloat(typeof b === 'number' ? b : b.DISCOUNT)
							: 0)
					);
			  }, 0)
			: 0;
		for (var key in tableTotalWeight) {
			var tplRow =
				'<tr><td>____LOCATIN___</td><td style="text-align: center;">____TOTAL_WEIGHT___</td><td>____SHIPPING_METHOD___</td><td style="text-align: center;">____FREIGHT_RATE___</td><td style="text-align: center;">____SHIPPING_DISCOUNT___</td></tr>';
			tplRow = tplRow
				.replaceAll('____LOCATIN___', key)
				.replaceAll('____TOTAL_WEIGHT___', tableTotalWeight[key]);
			if (dataObj) {
				var locationId = obj.mapLocation[key];
				var row = dataObj.reduce(function(a, b) {
					return (a.LOCATION == locationId && a) || (b.LOCATION == locationId && b);
				});
				if (row) {
					tplRow = tplRow
						.replaceAll('____SHIPPING_METHOD___', SHIPPING_METHODS[row.SHIPPING_METHOD])
						.replaceAll(
							'____FREIGHT_RATE___',
							isNaN(row.FREIGHT_RATE) ? 0 : parseFloat(row.FREIGHT_RATE).toFixed(2)
						)
						.replaceAll(
							'____SHIPPING_DISCOUNT___',
							isNaN(row.DISCOUNT) ? 0 : parseFloat(row.DISCOUNT).toFixed(2)
						);
				} else {
					tplRow = tplRow
						.replaceAll('____SHIPPING_METHOD___', '')
						.replaceAll('____FREIGHT_RATE___', '')
						.replaceAll('____SHIPPING_DISCOUNT___', '');
				}
			} else {
				tplRow = tplRow
					.replaceAll('____SHIPPING_METHOD___', '')
					.replaceAll('____FREIGHT_RATE___', '')
					.replaceAll('____SHIPPING_DISCOUNT___', '');
			}

			htmlTableTotalWeight += tplRow;
			totalWeight += parseFloat(tableTotalWeight[key]);
		}
		htmlTableTotalWeight +=
			'</tbody><tfoot><tr><td>Total</td><td style="text-align: center;">' +
			totalWeight +
			'</td><td></td><td style="text-align: center;">' +
			totalFreightRate +
			'</td><td style="text-align: center;">' +
			totalDiscount +
			'</td></tr></tfoot></table>';
		htmlTableTotalWeight +=
			'<style>.lx-table{border:solid 1px #dee;border-collapse:collapse;border-spacing:0;font-size:12px}.lx-table thead th{background-color:#607799;border:solid 1px #dee;color:#fff;padding:10px;text-align:left}.lx-table tbody td{border:solid 1px #dee;color:#000;padding:10px}.lx-table tfoot td{border:solid 1px #dee;color:#000;padding:10px}</style>';
		newRecord.setValue({
			fieldId: 'custbody_table_total_weight',
			value: htmlTableTotalWeight
		});
	}

	/**
	 * Get data JSON
	 * @param {*} newRecord
	 */
	function getTableWeightDataJSON(newRecord) {
		const dataJSON = newRecord.getValue({
			fieldId: 'custbody_table_total_weight_data'
		});
		var dataObj = false;
		try {
			dataObj = JSON.parse(dataJSON);
		} catch (error) {}
		return dataObj;
	}

	/**
	 * Get Total Weight By Location
	 * @param {*} record
	 */
	function getTotalWeightByLocation(record) {
		const totalLine = record.getLineCount({ sublistId: 'item' });
		var tableTotalWeight = {};
		var mapLocation = {};
		for (var index = 0; index < totalLine; index++) {
			var quantity = record.getSublistValue({
				sublistId: 'item',
				fieldId: 'quantity',
				line: index
			});
			var weightinlb = record.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol45', // weightinlb
				line: index
			});
			var location = record.getSublistValue({
				sublistId: 'item',
				fieldId: 'location_display',
				line: index
			});
			var locationId = record.getSublistValue({
				sublistId: 'item',
				fieldId: 'location',
				line: index
			});
			if (location === undefined || location === '') {
				if (tableTotalWeight['None'] === undefined) {
					tableTotalWeight['None'] = 0;
				}
				tableTotalWeight['None'] = tableTotalWeight['None'] + quantity * weightinlb;
				mapLocation['None'] = 0;
			} else {
				if (tableTotalWeight[location] === undefined) {
					tableTotalWeight[location] = 0;
				}
				tableTotalWeight[location] = tableTotalWeight[location] + quantity * weightinlb;
				mapLocation[location] = locationId;
			}
		}

		return { tableTotalWeight: tableTotalWeight, mapLocation: mapLocation };
	}

	/**
	 * Active feature Shipping Discount By The Manager
	 * @param {*} context
	 */
	function shippingDiscountByTheManager(context) {
		try {
			var form = context.form;
			var newRecord = context.newRecord;
			var currentUser = runtime.getCurrentUser();
			const role = currentUser.role;

			// https://trello.com/c/RvSjr3Is/180-shipping-discount-for-customer-service-team
			// set shipping discount by manager is 100% for all role
			// var custbodyshipping_discount_by_manager = form.getField({
			// 	id: 'custbodyshipping_discount_by_manager'
			// });
			// if (custbodyshipping_discount_by_manager) {
			// 	// 3 Administrator
			// 	// 1069	Lexor | Sales Director
			// 	// 1037	Lexor | Sales Manager
			// 	if (role === 3 || role === 1069 || role === 1037) {
			// 		custbodyshipping_discount_by_manager.updateDisplayType({
			// 			displayType: 'NORMAL'
			// 		});
			// 	} else {
			// 		custbodyshipping_discount_by_manager.updateDisplayType({
			// 			displayType: 'disabled'
			// 		});
			// 	}
			// }
		} catch (error) {
			log.error({
				title: 'Error shippingDiscountByTheManager',
				details: error.message
			});
		}
	}

	/**
	 * set Remaining Balance
	 * @param {*} so
	 */
	function setRemainingBalance(so) {
		var result = 0;
		try {
			const total = parseFloat(so.getValue('total'));
			if (total > 0) {
				var listDeposits = search.create({
					type: search.Type.CUSTOMER_DEPOSIT,
					filters: [
						{
							name: 'salesorder',
							operator: search.Operator.IS,
							values: [so.id]
						}
					],
					columns: ['amount', 'status']
				});
				var totalDeposited = 0;
				listDeposits.run().each(function(item) {
					var status = item.getValue('status');
					if (status !== 'unapprovedPayment') {
						var totalValue = item.getValue('amount');
						totalDeposited = parseFloat(totalDeposited) + parseFloat(totalValue);
					}
					return true;
				});
				result = parseFloat(total - totalDeposited).toFixed(2);
			}
		} catch (error) {
			log.error({
				title: '[ERROR] getRemainingBalance SO ' + so.id,
				details: error.message
			});
		}
		so.setValue({
			fieldId: 'custbody_remaining_balance',
			value: result
		});
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
