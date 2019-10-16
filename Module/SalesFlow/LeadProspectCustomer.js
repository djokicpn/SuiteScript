/**
 * Sales Flow > Lead/Prospect/Customer Module
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(['N/record', 'N/redirect', 'N/ui/serverWidget'], function(record, redirect, serverWidget) {
	const ACTIVE = true;
	const MODULE_NAME = '/SuiteScripts/Module/SalesFlow/LeadProspectCustomer.js';

	/**
	 * ACTIVE MODULE
	 */
	const ACTIVE_LOCK_LEAD = true;

	/**
	 * beforeLoad
	 * User Event Script
	 * @param {*} context
	 */
	function beforeLoad(context) {
		if (ACTIVE) {
			try {
				var type = context.type;
				var newRecord = context.newRecord;

				// Locked Record
				if (isLockLead(newRecord)) {
					if (type === context.UserEventType.EDIT) {
						redirect.toRecord({
							type: record.Type.LEAD,
							id: newRecord.id,
							parameters: {}
						});
					}

					if (type == context.UserEventType.VIEW) {
						// context.form.clientScriptModulePath = 'SuiteScripts/Module/SalesFlow/LockedMessage.js';
						var inline = context.form.addField({
							id: 'custpage_trigger_it',
							label: ' ',
							type: serverWidget.FieldType.INLINEHTML
						});
						inline.defaultValue =
							"<script>jQuery(function($){ require(['/SuiteScripts/Module/SalesFlow/LockedMessage.js'], function(lockedMessage){ console.log('loaded'); lockedMessage.show();});});</script>";
					}
				}
			} catch (error) {
				log.error({
					title: '[' + MODULE_NAME + '] > beforeLoad',
					details: error
				});
			}
		}
	}

	/**
	 * beforeSubmit
	 * User Event Script
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
	 * User Event Script
	 * @param {*} context
	 */
	function afterSubmit(context) {
		if (ACTIVE) {
			try {
				var newRecord = context.newRecord;
				var type = context.type;
				if (type === context.UserEventType.CREATE) {
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
	 * Update Date From Now
	 * @param {*} id
	 */
	function updateDateFromNow(id) {
		if (ACTIVE) {
			try {
				var currentRecord = record.load({
					type: record.Type.LEAD,
					id: id
				});
				if (currentRecord) {
					var datecreated = new Date();
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
		if (ACTIVE) {
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
	}

	/**
	 * Reset LEAD By Id
	 * @param {*} id
	 */
	function resetById(id) {
		if (ACTIVE) {
			try {
				var currentRecord = record.load({
					type: record.Type.LEAD,
					id: id
				});
				if (currentRecord) {
					currentRecord.setValue({
						fieldId: 'custentity_start_date',
						value: ''
					});
					currentRecord.setValue({
						fieldId: 'custentity_expiration_date',
						value: ''
					});
					currentRecord.setValue({
						fieldId: 'custentity_extend',
						value: 0
					});
					// Reset Sales Team
					resetSalesTeam(currentRecord);
					currentRecord.save();
				}
			} catch (error) {
				log.error({
					title: '[' + MODULE_NAME + '] > resetById',
					details: error
				});
			}
		}
	}

	/**
	 *
	 * @param {*} currentRecord
	 */
	function reset(currentRecord) {
		if (ACTIVE) {
			try {
				if (currentRecord) {
					currentRecord.setValue({
						fieldId: 'custentity_start_date',
						value: ''
					});
					currentRecord.setValue({
						fieldId: 'custentity_expiration_date',
						value: ''
					});
					currentRecord.setValue({
						fieldId: 'custentity_extend',
						value: 0
					});
					// Reset Sales Team
					resetSalesTeam(currentRecord);
					currentRecord.save();
				}
			} catch (error) {
				log.error({
					title: '[' + MODULE_NAME + '] > resetById',
					details: error
				});
			}
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
	 * Change Status to Lead-Unqualified By Id
	 * @param {*} id
	 */
	function changeStatusLeadUnqualifiedById(id) {
		if (ACTIVE) {
			try {
				var currentRecord = record.load({
					type: record.Type.LEAD,
					id: id
				});
				if (currentRecord) {
					currentRecord.setValue({
						fieldId: 'entitystatus',
						value: 7 // Lead-Unqualified
					});
					currentRecord.setValue({
						fieldId: 'custentity_start_date',
						value: ''
					});
					currentRecord.setValue({
						fieldId: 'custentity_expiration_date',
						value: ''
					});
					currentRecord.setValue({
						fieldId: 'custentity_extend',
						value: 0
					});
					// Reset Sales Team
					resetSalesTeam(currentRecord);
					currentRecord.save();
				}
			} catch (error) {
				log.error({
					title: '[' + MODULE_NAME + '] > resetById',
					details: error
				});
			}
		}
	}

	/**
	 * Is Lock LEAD
	 * @param {*} currentRecord
	 */
	function isLockLead(currentRecord) {
		if (!ACTIVE_LOCK_LEAD) {
			return false;
		}
		try {
			var salesrep = currentRecord.getValue('salesrep');
			if (salesrep == '') {
				return true;
			}
		} catch (error) {
			log.error({
				title: '[' + MODULE_NAME + '] > isLockLead',
				details: error
			});
		}
		return false;
	}

	return {
		updateDate: updateDate,
		updateDateFromNow: updateDateFromNow,
		resetSalesTeam: resetSalesTeam,
		resetById: resetById,
		changeStatusLeadUnqualifiedById: changeStatusLeadUnqualifiedById,
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
