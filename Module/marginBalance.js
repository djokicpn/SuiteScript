/**
 * Margin Balance Module
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
			const custbodyMarginLeft = newRecord.getValue('custbody_margin_left');
			const totalLine = newRecord.getLineCount({ sublistId: 'item' });
			for (var index = 0; index < totalLine; index++) {
				if (index === 0) {
					newRecord.setSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_margin_balance',
						line: index,
						value: custbodyMarginLeft
					});
				} else {
					newRecord.setSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_margin_balance',
						line: index,
						value: 0
					});
				}
			}
		} catch (error) {
			log.error({
				title: '[MARGIN_BALANCE_MODULE] > beforeSubmit',
				details: error
			});
		}
	}

	/**
	 * updateSalesOrder
	 * @param {*} salesOrderId
	 */
	function updateSalesOrder(salesOrderId, isInvoiceDeleted) {
		try {
			var salesOrder = record.load({
				type: record.Type.SALES_ORDER,
				id: salesOrderId
			});
			const status = salesOrder.getValue('status');
			log.error({
				title: '[MARGIN_BALANCE_MODULE] > updateSalesOrder',
				details: status + ' - ' + isInvoiceDeleted
			});
			const custbodyMarginLeft = salesOrder.getValue('custbody_margin_left');
			const totalLine = salesOrder.getLineCount({ sublistId: 'item' });
			for (var index = 0; index < totalLine; index++) {
				if (index === 0) {
					if (status === 'Billed' && !isInvoiceDeleted) {
						salesOrder.setSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_margin_balance',
							line: index,
							value: custbodyMarginLeft
						});
					} else {
						salesOrder.setSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_margin_balance',
							line: index,
							value: 0
						});
					}
				} else {
					salesOrder.setSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_margin_balance',
						line: index,
						value: 0
					});
				}
			}

			salesOrder.save();
		} catch (error) {
			log.error({
				title: '[MARGIN_BALANCE_MODULE] > updateSalesOrder',
				details: error
			});
		}
	}

	return {
		beforeSubmit: beforeSubmit,
		updateSalesOrder: updateSalesOrder
	};
});
