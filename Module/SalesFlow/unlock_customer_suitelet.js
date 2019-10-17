/**
 * Unlock Lead/Prospect/Customer
 *
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @author trungpv <trung@lexor.com>
 */
define(['N/record', 'N/redirect', 'N/runtime'], function(record, redirect, runtime) {
	function onRequest(context) {
		try {
			var response = context.response;
			var request = context.request;
			var id = request.parameters.id;
			var type = request.parameters.type;
			if (!id || !type) {
				response.write('Something went wrong when you unlock record.');
			}
			var customer = record.load({
				type: type,
				id: id,
				isDynamic: true
			});
			if (customer) {
				var currentUser = runtime.getCurrentUser();
				var userId = currentUser.id;
				resetSalesTeam(customer);

				customer.selectNewLine({ sublistId: 'salesteam' });
				customer.setCurrentSublistValue({
					sublistId: 'salesteam',
					fieldId: 'employee',
					value: userId
				});
				customer.setCurrentSublistValue({
					sublistId: 'salesteam',
					fieldId: 'salesrole',
					value: -2
				});
				customer.setCurrentSublistValue({
					sublistId: 'salesteam',
					fieldId: 'isprimary',
					value: true
				});
				customer.setCurrentSublistValue({
					sublistId: 'salesteam',
					fieldId: 'contribution',
					value: 100
				});
				customer.commitLine({ sublistId: 'salesteam' });

				// Update Date
				var datecreated = new Date();
				customer.setValue({
					fieldId: 'custentity_start_date',
					value: datecreated
				});
				var extend = customer.getValue('custentity_extend');
				extend = extend > 0 ? extend : 0;
				var expirationDate = addDays(datecreated, extend + 30);
				customer.setValue({
					fieldId: 'custentity_expiration_date',
					value: expirationDate
				});
				customer.setValue({
					fieldId: 'custentity_extend',
					value: extend
				});

				customer.save();
			} else {
				log.error({
					title: 'Record: ' + id + ', Type: ' + type,
					details: 'Not Found'
				});
				response.write('The record not found.');
			}
			redirect.toRecord({
				type: type,
				id: id,
				parameters: {}
			});
		} catch (err) {
			log.error({
				title: '[ERROR]',
				details: err
			});
		}
	}

	/**
	 * Add Days
	 * @param {*} date
	 * @param {*} days
	 */
	function addDays(date, days) {
		const copy = new Date(Number(date));
		copy.setDate(date.getDate() + days);
		return copy;
	}

	/**
	 * Reset Sales Team
	 * @param {*} currentRecord
	 */
	function resetSalesTeam(currentRecord) {
		try {
			const totalLine = currentRecord.getLineCount({ sublistId: 'salesteam' });
			for (var line = 0; line < totalLine; line++) {
				currentRecord.removeLine({
					sublistId: 'salesteam',
					line: line,
					ignoreRecalc: true
				});
			}
		} catch (error) {
			log.error({
				title: 'resetSalesTeam',
				details: error
			});
		}
	}

	return {
		onRequest: onRequest
	};
});
