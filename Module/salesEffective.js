/**
 * Sales Effective Module
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(['N/record', 'N/search'], function(record, search) {
	const SALE_EFFECTIVE_RATE = 25;

	function updateSalesEffective(salesOrderId) {
		if (salesOrderId) {
			try {
				var so = record.load({
					type: record.Type.SALES_ORDER,
					id: salesOrderId,
					isDynamic: true
				});
				const createdDate = so.getValue('createddate');
				const total = parseFloat(so.getValue('total'));
				if (total > 0) {
					// https://trello.com/c/8kvQ8u6S/200-check-boxes-customer-deposit-0-and-sale-effective-day
					// 18 : Credit Memo
					// 7 : Prepaid
					const terms = so.getValue('terms');
					if (terms !== '7') {
						const isSaleEffective = so.getValue('custbody_sales_effective_checked');
						so.setValue({
							fieldId: 'custbody_cd_greater_than_zero',
							value: true
						});
						if (!isSaleEffective) {
							so.setValue({
								fieldId: 'saleseffectivedate',
								value: new Date()
							});
						}
						so.setValue({
							fieldId: 'custbody_sales_effective_checked',
							value: true
						});
					} else {
						var listDeposits = search.create({
							type: search.Type.CUSTOMER_DEPOSIT,
							filters: [
								{
									name: 'salesorder',
									operator: search.Operator.IS,
									values: [salesOrderId]
								}
							],
							columns: [
								search.createColumn({
									name: 'trandate',
									sort: search.Sort.ASC
								}),
								'amount',
								'custbody_date_deposited',
								'status',
								'custbody65',
								'custbody66'
							]
						});
						var totalDeposited = 0;
						var salesEffectiveDate = false;
						var customerDepositGreaterThanZero = false;
						listDeposits.run().each(function(item) {
							var status = item.getValue('status');
							var trandate = item.getValue('trandate');
							var custbody_date_deposited = item.getValue('custbody_date_deposited');
							var paymentReceived = item.getValue('custbody65');
							var dateReceived = item.getValue('custbody66');
							if (paymentReceived && status !== 'unapprovedPayment' && !isRefund(item.id)) {
								var totalValue = item.getValue('amount');
								totalDeposited = parseFloat(totalDeposited) + parseFloat(totalValue);
								if (totalDeposited > 0) {
									customerDepositGreaterThanZero = true;
								}
								var totalDepositedPercent = (totalDeposited / total) * 100;
								if (totalDepositedPercent >= SALE_EFFECTIVE_RATE) {
									salesEffectiveDate = dateReceived ? new Date(dateReceived) : new Date(trandate);
									return false;
								}
							}
							return true;
						});
						so.setValue({
							fieldId: 'custbody_cd_greater_than_zero',
							value: customerDepositGreaterThanZero
						});
						so.setValue({
							fieldId: 'custbody_sales_effective_checked',
							value: salesEffectiveDate ? true : false
						});
						so.setValue({
							fieldId: 'saleseffectivedate',
							value: salesEffectiveDate ? salesEffectiveDate : new Date(createdDate)
						});
					}

					so.save();
				}
			} catch (err) {
				log.error({
					title: 'Error Sales Effective SO ' + salesOrderId,
					details: err
				});
			}
		}
	}

	/**
	 * Is Refund
	 * @param {*} customerDepositId
	 */
	function isRefund(customerDepositId) {
		var result = false;
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
					columns: ['applyingtransaction']
				});

				if (
					listCustomerRefund.run().getRange({
						start: 0,
						end: 1000
					}).length > 0
				) {
					result = true;
					return false;
				}
				return true;
			});
		} catch (error) {
			log.error({
				title: '[ERROR] isRefund',
				details: error
			});
		}
		return result;
	}

	return {
		update: updateSalesEffective
	};
});
