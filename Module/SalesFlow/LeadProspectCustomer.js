/**
 * Sales Flow > Lead/Prospect/Customer Module
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(['N/record'], function(record) {
	const ACTIVE = true;
	const MODULE_NAME = '/SuiteScript/Module/SalesFlow/LeadProspectCustomer.js';

	/**
	 * beforeSubmit
	 * @param {*} context
	 */
	function beforeSubmit(context) {
		if (ACTIVE) {
			try {
			} catch (error) {
				log.error({
					title: '[' + MODULE_NAME + '] > beforeSubmit',
					details: error
				});
			}
		}
	}

	/**
	 * afterSubmit
	 * @param {*} context
	 */
	function afterSubmit(context) {
		if (ACTIVE) {
			try {
				var newRecord = context.newRecord;
				var type = context.type;
				if (type === context.UserEventType.CREATE || type === context.UserEventType.EDIT) {
					updateDate(newRecord.id);
					// changeStatusToLEADUnqualified(newRecord);
				}
			} catch (error) {
				log.error({
					title: '[' + MODULE_NAME + '] > afterSubmit',
					details: error
				});
			}
		}
	}

	/**
	 * Update Date
	 * @param {*} id
	 */
	function updateDate(id) {
		if (ACTIVE) {
			try {
				var currentRecord = record.load({
					type: record.Type.LEAD,
					id: id
				});
				if (currentRecord) {
					var datecreated = currentRecord.getValue('datecreated');
					currentRecord.setValue({
						fieldId: 'custentity_start_date',
						value: datecreated
					});
					var extend = currentRecord.getValue('custentity_extend');
					extend = extend > 0 ? extend : 0;
					var expirationDate = addDays(datecreated, extend + 30);
					currentRecord.setValue({
						fieldId: 'custentity_expiration_date',
						value: expirationDate
					});
					currentRecord.setValue({
						fieldId: 'custentity_extend',
						value: extend
					});
					currentRecord.save();
				}
			} catch (error) {
				log.error({
					title: '[' + MODULE_NAME + '] > updateDate',
					details: error
				});
			}
		}
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
				title: '[' + MODULE_NAME + '] > resetSalesTeam',
				details: error
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
	 * Diff date with Now
	 * @param {*} date
	 */
	function diffNow(date) {
		var now = new Date();
		if (date instanceof Date) {
			var ms = now - date;
			var diff = {};

			for (diff.years = 0; ms >= 31536000000; diff.years++, ms -= 31536000000);
			for (diff.months = 0; ms >= 2628000000; diff.months++, ms -= 2628000000);
			for (diff.days = 0; ms >= 86400000; diff.days++, ms -= 86400000);
			for (diff.hours = 0; ms >= 3600000; diff.hours++, ms -= 3600000);
			for (diff.minutes = 0; ms >= 60000; diff.minutes++, ms -= 60000);
			for (diff.seconds = 0; ms >= 1000; diff.seconds++, ms -= 1000);
			diff.milliseconds = ms;

			return diff;
		}

		return false;
	}

	/**
	 * Change Status To LEAD-Unqualified
	 * @param {*} currentRecord
	 */
	function changeStatusToLEADUnqualified(currentRecord) {
		try {
			// entitystatus
			var entitystatus = currentRecord.getValue('entitystatus');
			if (entitystatus == 6) {
				var startDate = currentRecord.getValue('custentity_start_date');
				log.error({
					title: '[' + MODULE_NAME + '] > startDate',
					details: startDate
				});
				var diffDate = diffNow(startDate);
				if (diffDate) {
					log.error({
						title: '[' + MODULE_NAME + '] > changeStatusToLEADUnqualified',
						details: diffDate
					});
				}
			}
		} catch (error) {
			log.error({
				title: '[' + MODULE_NAME + '] > changeStatusToLEADUnqualified',
				details: error
			});
		}
	}

	return {
		updateDate: updateDate,
		resetSalesTeam: resetSalesTeam,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
