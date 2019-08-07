/**
 * Item Fulfillment Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(['N/record'], function(record) {
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
		try {
			var newRecord = context.newRecord;
			const form = context.form;
			try {
				const orderid = newRecord.getValue('orderid');
				var so = record.load({
					type: record.Type.SALES_ORDER,
					id: orderid,
					isDynamic: true
				});
				var obj = getTotalWeightByLocation(so);
				buildTableTotalWeight(newRecord, so, obj);
			} catch (err) {
				log.error({
					title: 'Error buildTableTotalWeight',
					details: err.message
				});
			}
			try {
				if (context.type === context.UserEventType.VIEW) {
					var script =
						"window.open(nlapiResolveURL('SUITELET', 'customscript_label_items_print_out_sl', 'customdeploy_label_items_print_out_sl') + '&customId=' + nlapiGetRecordId());";
					form.addButton({
						id: 'custpage_printitemlabel',
						label: 'Print Item labels',
						functionName: script
					});

					if (checkInventoryDetail(newRecord)) {
						var scriptSerialOnly =
							"window.open(nlapiResolveURL('SUITELET', 'customscript_items_print_out_serial_only', 'customdeploy_items_print_out_serial_only') + '&customId=' + nlapiGetRecordId());";
						form.addButton({
							id: 'custpage_printitemlabel_serial_only',
							label: 'Print Item labels Serial Only',
							functionName: scriptSerialOnly
						});
					}
				}
			} catch (err) {
				log.error({
					title: 'Error Add Print Item Label',
					details: err.message
				});
			}
		} catch (error) {
			log.error({
				title: 'Error beforeLoad',
				details: error.message
			});
		}
	}

	function afterSubmit(context) {
		const type = context.type;
		const newRecord = context.newRecord;
		try {
			// create = context.UserEventType.CREATE, delete = context.UserEventType.DELETE
			if (type === context.UserEventType.CREATE || type === context.UserEventType.DELETE) {
				const orderid = newRecord.getValue('orderid');
				var so = record.load({
					type: record.Type.SALES_ORDER,
					id: orderid,
					isDynamic: true
				});
				const totalLine = so.getLineCount({ sublistId: 'item' });
				var checked = false; // custbody_fulfilled
				for (var index = 0; index < totalLine; index++) {
					var itempicked = so.getSublistValue({
						sublistId: 'item',
						fieldId: 'itempicked',
						line: index
					});
					var itempacked = so.getSublistValue({
						sublistId: 'item',
						fieldId: 'itempacked',
						line: index
					});
					var islinefulfilled = so.getSublistValue({
						sublistId: 'item',
						fieldId: 'islinefulfilled',
						line: index
					});
					if (itempicked === 'T' || itempacked === 'T' || islinefulfilled === 'T') {
						checked = true;
						break;
					}
				}

				so.setValue({
					fieldId: 'custbody_fulfilled',
					value: checked
				});
				so.save();
			}
		} catch (error) {
			log.error({
				title: 'afterSubmit ' + type,
				details: error
			});
		}
	}

	/** HELPPER FUNCTIONS **/
	/**
	 * Build Table Total Weight for View Mode
	 * @param {*} newRecord
	 * @param {*} so
	 * @param {*} obj
	 */
	function buildTableTotalWeight(newRecord, so, obj) {
		const tableTotalWeight = obj.tableTotalWeight;
		// Add Util Function Replace All
		String.prototype.replaceAll = function(search, replacement) {
			return this.split(search).join(replacement);
		};

		var dataObj = getTableWeightDataJSON(so);

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
	 * Check Inventory Avail
	 * @param {*} record
	 */
	function checkInventoryDetail(newRecord) {
		var result = false;
		const totalLine = newRecord.getLineCount({ sublistId: 'item' });
		for (var index = 0; index < totalLine; index++) {
			var inventorydetailavail = newRecord.getSublistValue({
				fieldId: 'inventorydetailavail',
				sublistId: 'item',
				line: index
			});
			if (inventorydetailavail === 'T') {
				result = true;
				break;
			}
		}
		return result;
	}

	return {
		beforeLoad: beforeLoad,
		afterSubmit: afterSubmit
	};
});
