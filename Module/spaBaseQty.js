/**
 * SPA BASE QTY Module
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(['N/record'], function(record) {
	/**
	 * Before Submit Event
	 * @param {*} newRecord
	 */
	function beforeSubmit(newRecord) {
		try {
			var spaBaseQty = 0;
			const totalLine = newRecord.getLineCount({ sublistId: 'item' });
			for (var index = 0; index < totalLine; index++) {
				var id = newRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'item',
					line: index
				});
				var qty = newRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantity',
					line: index
				});
				try {
					var item = record.load({
						type: record.Type.SERIALIZED_ASSEMBLY_ITEM,
						id: id
					});
					if (item) {
						var classes = item.getValue('class');
						// 45	Lexor.
						// 46	PSD.
						if (classes == 45 || classes == 46) {
							spaBaseQty = parseInt(spaBaseQty) + parseInt(qty);
						}
					}
				} catch (error) {
					log.error({
						title: '[SPA_BASE_QTY_MODULE] > item not found',
						details: id
					});
				}
			}
			newRecord.setValue({
				fieldId: 'custbody_spa_base_qty',
				value: parseInt(spaBaseQty)
			});
		} catch (error) {
			log.error({
				title: '[SPA_BASE_QTY_MODULE] > beforeSubmit',
				details: error
			});
		}
	}

	/**
	 * update Sales Order for MassUpdate
	 * @param {*} salesOrderId
	 */
	function updateSalesOrderForMassUpdate(salesOrderId) {
		try {
			var salesOrder = record.load({
				type: record.Type.SALES_ORDER,
				id: salesOrderId
			});
			if (salesOrder) {
				var spaBaseQty = 0;
				const totalLine = salesOrder.getLineCount({ sublistId: 'item' });
				for (var index = 0; index < totalLine; index++) {
					var id = salesOrder.getSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						line: index
					});
					var qty = salesOrder.getSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						line: index
					});
					try {
						var item = record.load({
							type: record.Type.SERIALIZED_ASSEMBLY_ITEM,
							id: id
						});
						if (item) {
							var classes = item.getValue('class');
							// 45	Lexor.
							// 46	PSD.
							if (classes == 45 || classes == 46) {
								spaBaseQty = parseInt(spaBaseQty) + parseInt(qty);
							}
						}
					} catch (error) {
						log.error({
							title: '[SPA_BASE_QTY_MODULE] > item not found',
							details: 'SO: ' + salesOrderId + ': ' + id
						});
					}
				}
				salesOrder.setValue({
					fieldId: 'custbody_spa_base_qty',
					value: parseInt(spaBaseQty)
				});
				salesOrder.save();
			} else {
				log.error({
					title: '[SPA_BASE_QTY_MODULE] > Sales Order not found',
					details: salesOrderId
				});
			}
		} catch (error) {
			log.error({
				title: '[SPA_BASE_QTY_MODULE] > updateSalesOrderForMassUpdate',
				details: error
			});
		}
	}

	return {
		beforeSubmit: beforeSubmit,
		updateSalesOrderForMassUpdate: updateSalesOrderForMassUpdate
	};
});
