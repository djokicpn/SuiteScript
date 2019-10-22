/**
 * Customer Deposit Form User Event Script
 * custform_248_4283482_820
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(['./Module/salesEffective', 'N/record', 'N/search'], function(
	salesEffective,
	record,
	search
) {
	function beforeLoad(context) {
		var form = context.form;
		var newRecord = context.newRecord;
		try {
			// Set Under. Funds as Default
			var undepfunds = form.getField({ id: 'undepfunds' });
			if (undepfunds) {
				undepfunds.defaultValue = 'T';
			}

			newRecord.setValue({
				fieldId: 'custbody_remaining_balance',
				value: getRemainingBalance(newRecord.getValue('salesorder'))
			});
		} catch (error) {
			log.error({
				title: '[ERROR] beforeLoad',
				details: error.message
			});
		}
	}

	function beforeSubmit(context) {}

	function afterSubmit(context) {
		const type = context.type;
		var newRecord = context.newRecord;
		try {
			var newRecordSaleOrder = newRecord.getValue({
				fieldId: 'salesorder'
			});
			salesEffective.update(newRecordSaleOrder);
		} catch (error) {
			log.error({
				title: '[ERROR] afterSubmit > salesEffective',
				details: error.message
			});
		}

		// isunappvpymt:"T"
		// status:"Unapproved Payment"
		// statusRef:"unapprovedPayment"
		try {
			if (type === context.UserEventType.CREATE) {
				var cd = record.load({
					type: record.Type.CUSTOMER_DEPOSIT,
					id: newRecord.id
				});
				if (cd) {
					var isunappvpymt = cd.getValue({
						fieldId: 'isunappvpymt'
					});
					if (isunappvpymt === 'T') {
						cd.setValue({
							fieldId: 'undepfunds',
							value: 'T'
						});
						// custbody66 => DATE RECEIVED
						cd.setValue({
							fieldId: 'custbody66',
							value: ''
						});
						// custbody65 => Checkbox PAYMENT RECEIVED
						cd.setValue({
							fieldId: 'custbody65',
							value: false
						});
						cd.save();
					}
				}
			}
		} catch (error) {
			log.error({
				title: '[ERROR] afterSubmit > Check Unapproved Payment ',
				details: error.message
			});
		}
	}

	/**
	 * Get Remaining Balance
	 */
	function getRemainingBalance(salesOrderId) {
		var result = 0;
		try {
			var so = record.load({
				type: record.Type.SALES_ORDER,
				id: salesOrderId
			});
			const total = parseFloat(so.getValue('total'));
			if (total > 0) {
				var listDeposits = search.create({
					type: search.Type.CUSTOMER_DEPOSIT,
					filters: [
						{
							name: 'salesorder',
							operator: search.Operator.IS,
							values: [salesOrderId]
						}
					],
					columns: ['amount', 'status']
				});
				var totalDeposited = 0;
				listDeposits.run().each(function(item) {
					var status = item.getValue('status');
					if (status !== 'unapprovedPayment') {
						var totalValue = item.getValue('amount');
						var refund = isRefund(item.id);
						if (refund) {
							totalDeposited =
								parseFloat(totalDeposited) + parseFloat(totalValue) - parseFloat(refund);
						} else {
							totalDeposited = parseFloat(totalDeposited) + parseFloat(totalValue);
						}
					}
					return true;
				});
				result = parseFloat(total - totalDeposited).toFixed(2);
			}
		} catch (error) {
			log.error({
				title: '[ERROR] getRemainingBalance SO ',
				details: error
			});
		}
		return result;
	}

	/**
	 * Is Refund
	 * @param {*} customerDepositId
	 */
	function isRefund(customerDepositId) {
		var result = false;
		var totalRefund = 0;
		try {
			var listDepositApplication = search.create({
				type: search.Type.DEPOSIT_APPLICATION,
				filters: [
					{
						name: 'appliedtotransaction',
						operator: search.Operator.IS,
						values: [customerDepositId]
					}
				],
				columns: ['appliedtotransaction']
			});
			listDepositApplication.run().each(function(item) {
				var listCustomerRefund = search.create({
					type: search.Type.CUSTOMER_REFUND,
					filters: [
						{
							name: 'applyingtransaction',
							operator: search.Operator.IS,
							values: [item.id]
						}
					],
					columns: ['applyingtransaction', 'amount']
				});

				listCustomerRefund.run().each(function(refund) {
					totalRefund += parseFloat(refund.getValue('amount'));
					return true;
				});
				return true;
			});
		} catch (error) {
			log.error({
				title: '[ERROR] isRefund',
				details: error
			});
		}
		if (totalRefund > 0) {
			return totalRefund;
		}
		return result;
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
