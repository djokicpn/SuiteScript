/**
 * Quote Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(['N/runtime', './Module/discountSoldPriceTaxModule'], function(
	runtime,
	discountSoldPriceTaxModule
) {
	const SHIPPING_METHODS = {
		RL_CARRIERS: 'LTL',
		WILL_CALL: 'Will Call',
		LEXOR_TRUCK: 'Lexor Truck',
		ODFL: 'LTL',
		UPS_PACKAGE: 'UPS Package'
	};

	function beforeLoad(context) {
		try {
			var form = context.form;
			var newRecord = context.newRecord;
			var item = form.getSublist({ id: 'item' });
			if (item) {
				var amountCol = item.getField({ id: 'amount' });
				if (amountCol) {
					amountCol.updateDisplayType({ displayType: 'disabled' });
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
	}

	function beforeSubmit(context) {
		var newRecord = context.newRecord;
		try {
			var custbodyMarginLeft = newRecord.getValue({
				fieldId: 'custbody_margin_left'
			});
			const totalLine = newRecord.getLineCount({ sublistId: 'item' });
			const countItemsMarginBalance = getCountItemsMargenBalance(newRecord);
			const avgMarginLeft =
				countItemsMarginBalance > 0
					? parseFloat(custbodyMarginLeft / countItemsMarginBalance).toFixed(2)
					: 0;
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
				// AVG Margin Balance
				newRecord.setSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_margin_balance',
					line: index,
					value: avgMarginLeft
				});
			}
		} catch (error) {
			log.error({
				title: 'Error updateTotalWeightByLocation',
				details: error.message
			});
		}
		discountSoldPriceTaxModule.beforeSubmit(newRecord);
	}

	function afterSubmit(context) {}

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

			var custbodyshipping_discount_by_manager = form.getField({
				id: 'custbodyshipping_discount_by_manager'
			});
			if (custbodyshipping_discount_by_manager) {
				// 3 Administrator
				// 1069	Lexor | Sales Director
				// 1037	Lexor | Sales Manager
				if (role === 3 || role === 1069 || role === 1037) {
					custbodyshipping_discount_by_manager.updateDisplayType({
						displayType: 'NORMAL'
					});
				} else {
					custbodyshipping_discount_by_manager.updateDisplayType({
						displayType: 'disabled'
					});
				}
			}
		} catch (error) {
			log.error({
				title: 'Error shippingDiscountByTheManager',
				details: error.message
			});
		}
	}

	/**
	 *
	 */
	function getCountItemsMargenBalance(newRecord) {
		var result = 0;
		try {
			const totalLine = newRecord.getLineCount({ sublistId: 'item' });
			for (var index = 0; index < totalLine; index++) {
				var weightinlb = newRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'custcol45', // weightinlb
					line: index
				});
				// class
				var custcol_item_class = newRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_item_class',
					line: index
				});
				if (weightinlb !== '') {
					result++;
				}
			}
		} catch (error) {
			return 0;
		}
		return result;
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
