/**
 * Customer Deposit Form User Event Script
 * custform_248_4283482_820
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(['./Module/salesEffective', 'N/record'], function(salesEffective, record) {
	function beforeLoad(context) {
		var form = context.form;
		// Set Under. Funds as Default
		var undepfunds = form.getField({ id: 'undepfunds' });
		if (undepfunds) {
			undepfunds.defaultValue = 'T';
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
					if (isunappvpymt) {
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

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
