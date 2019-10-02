/**
 *
 * Invoice Form User Event Script
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(['N/record', './Module/marginBalance', './Module/billedDate'], function(record, marginBalance, billedDate) {
	/**
	 * Before Submit Event
	 * @param {*} context 
	 */
	function beforeLoad(context) {
		const type = context.type;
		if (type !== context.UserEventType.CREATE) return;
		var invoiceRecord = context.newRecord;
		if (invoiceRecord.type === 'invoice') {
			try {
				// saleseffectivedate
				const saleOrderId = invoiceRecord.getValue('createdfrom');
				if (saleOrderId) {
					var so = record.load({
						type: record.Type.SALES_ORDER,
						id: saleOrderId,
						isDynamic: true
					});
					const saleseffectivedate = so.getValue('saleseffectivedate');
					invoiceRecord.setValue({
						fieldId: 'saleseffectivedate',
						value: saleseffectivedate
					});
				}
			} catch (error) {
				log.error({
					title: '---- Error beforeLoad Invoice ' + invoiceRecord.id,
					details: error.message
				});
			}
		}
	}

	/**
	 * beforeSubmit Event
	 * @param {*} context 
	 */
	function beforeSubmit(context) {
		var newRecord = context.newRecord;
		try {
			var trandate = newRecord.getValue('trandate');
			newRecord.setValue({
				fieldId: 'custbodybilled_date',
				value: trandate
			});
		} catch (error) {
			log.error({
				title: 'beforeSubmit',
				details: error.message
			});
		}
	}

	/**
	 * After Submit Event
	 * @param {*} context 
	 */
	function afterSubmit(context) {
		const type = context.type;
		var invoiceRecord = context.newRecord;
		if (invoiceRecord.type === 'invoice') {
			try {
				const saleOrderId = invoiceRecord.getValue('createdfrom');
				if (type === context.UserEventType.DELETE) {
					marginBalance.updateSalesOrder(saleOrderId, true);
					billedDate.updateSalesOrder(saleOrderId, true);
				} else {
					marginBalance.updateSalesOrder(saleOrderId, false);
					billedDate.updateSalesOrder(saleOrderId, false);
				}
			} catch (error) {
				log.error({
					title: '---- Error afterSubmit Invoice ' + invoiceRecord.id,
					details: error.message
				});
			}
		}
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
