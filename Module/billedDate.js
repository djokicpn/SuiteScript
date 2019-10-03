/**
 * Billed Date Module
 *
 * https://trello.com/c/vTi0HdLF/207-add-billed-date-in-sale-order-and-invoice-for-commission-report
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(['N/record'], function(record) {
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
			if (status === 'Billed' && !isInvoiceDeleted) {
				// Reset Billed Date
				salesOrder.setValue({
					fieldId: 'custbodybilled_date',
					value: ''
				});
				const totalLine = salesOrder.getLineCount({ sublistId: 'links' });
				for (var index = 0; index < totalLine; index++) {
					var type = salesOrder.getSublistValue({
						sublistId: 'links',
						fieldId: 'type',
						line: index
					});
					if (type === 'Invoice') {
						var invoiceId = salesOrder.getSublistValue({
							sublistId: 'links',
							fieldId: 'id',
							line: index
						});
						var invoice = record.load({
							type: record.Type.INVOICE,
							id: invoiceId
						});
						var billedDate = invoice.getValue('custbodybilled_date');
						var soBilledDate = salesOrder.getValue('custbodybilled_date');
						if (soBilledDate) {
							if (soBilledDate <= billedDate) {
								salesOrder.setValue({
									fieldId: 'custbodybilled_date',
									value: billedDate
								});
							}
						} else {
							salesOrder.setValue({
								fieldId: 'custbodybilled_date',
								value: billedDate
							});
						}
					}
				}
			} else {
				salesOrder.setValue({
					fieldId: 'custbodybilled_date',
					value: ''
				});
			}

			salesOrder.save();
		} catch (error) {
			log.error({
				title: '[BILLED_DATE_MODULE] > updateSalesOrder',
				details: error
			});
		}
	}

	/**
	 * update Sales Order for MassUpdate
	 * @param {*} salesOrderId
	 */
	function updateSalesOrderForMassUpdate(salesOrderId, isInvoiceDeleted) {
		try {
			var salesOrder = record.load({
				type: record.Type.SALES_ORDER,
				id: salesOrderId
			});
			const status = salesOrder.getValue('status');
			if (status === 'Billed' && !isInvoiceDeleted) {
				// Reset Billed Date
				salesOrder.setValue({
					fieldId: 'custbodybilled_date',
					value: ''
				});
				const totalLine = salesOrder.getLineCount({ sublistId: 'links' });
				for (var index = 0; index < totalLine; index++) {
					var type = salesOrder.getSublistValue({
						sublistId: 'links',
						fieldId: 'type',
						line: index
					});
					if (type === 'Invoice') {
						var invoiceId = salesOrder.getSublistValue({
							sublistId: 'links',
							fieldId: 'id',
							line: index
						});
						var invoice = record.load({
							type: record.Type.INVOICE,
							id: invoiceId
						});
						var trandate = invoice.getValue('trandate');
						invoice.setValue({
							fieldId: 'custbodybilled_date',
							value: trandate
						});
						invoice.save();
						var billedDate = invoice.getValue('custbodybilled_date');
						var soBilledDate = salesOrder.getValue('custbodybilled_date');
						if (soBilledDate) {
							if (soBilledDate <= billedDate) {
								salesOrder.setValue({
									fieldId: 'custbodybilled_date',
									value: billedDate
								});
							}
						} else {
							salesOrder.setValue({
								fieldId: 'custbodybilled_date',
								value: billedDate
							});
						}
					}
				}
			} else {
				salesOrder.setValue({
					fieldId: 'custbodybilled_date',
					value: ''
				});
			}

			// salesOrder.save();
		} catch (error) {
			log.error({
				title: '[BILLED_DATE_MODULE] > updateSalesOrder',
				details: error
			});
		}
	}

	return {
		updateSalesOrder: updateSalesOrder,
		updateSalesOrderForMassUpdate: updateSalesOrderForMassUpdate
	};
});
