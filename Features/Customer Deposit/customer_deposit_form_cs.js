/**
 * Customer Deposit Form Client Script
 * custform_248_4283482_820
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author trungpv <trung@lexor.com>
 */
define(['N/runtime'], function(runtime) {
	/* === VARS === */
	const LIST_PAYMENT_CARDS = ['6', '3', '4', '5'];

	/* === EVENTS FUNCTIONS === */
	/**
	 * Page Init
	 * @param {*} context
	 */
	function pageInit(context) {
		const currentRecord = context.currentRecord;
		try {
			// processDateDeposited(context);
			disabledFeatureByRoles(context);
			currentRecord.setValue({
				fieldId: 'payment',
				value: ''
			});
		} catch (error) {
			console.log(error);
			log.error({
				title: 'Error pageInit',
				details: error.message
			});
		}
		return;
	}

	/**
	 * Field Changed
	 * @param {*} context
	 */
	function fieldChanged(context) {
		try {
			const currentRecord = context.currentRecord;
			const fieldId = context.fieldId;
			// If Payment Method contain LIST_PAYMENT_CARDS
			if (fieldId === 'paymentmethod') {
				// paymentmethod
				const paymentMethod = currentRecord.getValue({ fieldId: 'paymentmethod' });
				if (paymentMethod && paymentMethod != '' && LIST_PAYMENT_CARDS.includes(paymentMethod)) {
					// custbody66 => DATE RECEIVED
					currentRecord.setValue({
						fieldId: 'custbody66',
						value: new Date()
					});
					// custbody65 => Checkbox PAYMENT RECEIVED
					currentRecord.setValue({
						fieldId: 'custbody65',
						value: true
					});
				} else {
					// custbody66 => DATE RECEIVED
					currentRecord.setValue({
						fieldId: 'custbody66',
						value: ''
					});
					// custbody65 => Checkbox PAYMENT RECEIVED
					currentRecord.setValue({
						fieldId: 'custbody65',
						value: false
					});
				}
			}

			// custbody65 => Checkbox PAYMENT RECEIVED
			if (fieldId === 'custbody65') {
				const paymentReceived = currentRecord.getValue({
					fieldId: 'custbody65'
				});
				if (!paymentReceived) {
					// custbody66 => DATE RECEIVED
					currentRecord.setValue({
						fieldId: 'custbody66',
						value: ''
					});
				}
			}

			// if (fieldId === "undepfunds" || fieldId === "account") {
			//   processDateDeposited(context);
			// }
		} catch (error) {
			console.log(error);
			log.error({
				title: 'Error pageInit',
				details: error.message
			});
		}
		return;
	}

	/* HELPER FUNCTIONS */

	function processDateDeposited(context) {
		const currentRecord = context.currentRecord;
		const undepfunds = currentRecord.getValue({
			fieldId: 'undepfunds'
		});
		if (undepfunds === 'F') {
			const account = currentRecord.getValue({
				fieldId: 'account'
			});
			if (account !== '') {
				currentRecord.setValue({
					fieldId: 'custbody_date_deposited',
					value: new Date()
				});
			}
		} else {
			currentRecord.setValue({
				fieldId: 'custbody_date_deposited',
				value: ''
			});
		}
	}

	/**
	 * Disable Fields with some Roles
	 */
	function disabledFeatureByRoles(context) {
		var account = document.querySelector('input[name="undepfunds"][value="F"]');
		if (account) {
			var currentUser = runtime.getCurrentUser();
			const role = currentUser.role;
			// 1036 Lexor| Sale
			// 1069	Lexor | Sales Director
			// 1037	Lexor | Sales Manager

			// set account and select account in customer deposit is disable and only these roles can change:
			// 3 Admin ,
			// 1042 Lexor | A/P Clerk,
			// 1043 Lexor | A/R Clerk,
			// 1045 Lexor | Accountant,
			// 1087 Lexor | Accountant Manager
			const LIST_ROLES = [3, 1042, 1043, 1045, 1087];
			if (!LIST_ROLES.includes(role)) {
				account.disabled = true;
			}
		}
	}

	/**
	 * Export Events
	 */
	var exports = {};
	exports.pageInit = pageInit;
	exports.fieldChanged = fieldChanged;
	return exports;
});
