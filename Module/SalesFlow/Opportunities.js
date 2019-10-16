/**
 * Sales Flow > Opportunities Module
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define([
	'N/record',
	'N/redirect',
	'N/ui/serverWidget',
	'/SuiteScripts/Module/SalesFlow/LeadProspectCustomer'
], function(record, redirect, serverWidget, leadProspectCustomer) {
	const ACTIVE = true;
	const MODULE_NAME = '/SuiteScripts/Module/SalesFlow/Opportunities.js';

	/**
	 * ACTIVE MODULE
	 */
	const ACTIVE_LOCK_OPPORTUNITY = true;

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
				if (isLockOpportunity(newRecord)) {
					if (type === context.UserEventType.EDIT) {
						redirect.toRecord({
							type: record.Type.OPPORTUNITY,
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
				var type = context.type;
				var newRecord = context.newRecord;
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
				var type = context.type;
				var newRecord = context.newRecord;
				if (type === context.UserEventType.CREATE) {
					updateById(newRecord.id);
				}
				if (type !== context.UserEventType.DELETE) {
					whenCloseOpportunity(context);
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
	 * When User Close Opportunity
	 *
	 * @param {*} context
	 */
	function whenCloseOpportunity(context) {
		try {
			var newRecord = context.newRecord;
			var entitystatus = newRecord.getValue('entitystatus');
			// {"value":"14","text":"Closed Lost"},{"value":"16","text":"Lost Customer"}
			if (entitystatus == 14 || entitystatus == 16) {
				// Update OPP
				var id = newRecord.id;
				resetById(id);
				// Update CUSTOMER
				var entity = newRecord.getValue('entity');
				if (entity) {
					leadProspectCustomer.resetById(entity);
				}
			}
		} catch (error) {
			log.error({
				title: '[' + MODULE_NAME + '] > whenCloseOpportunity',
				details: error
			});
		}
	}

	/**
	 * Reset OPP By Id
	 * @param {*} id
	 */
	function resetById(id) {
		if (ACTIVE) {
			try {
				var currentRecord = record.load({
					type: record.Type.OPPORTUNITY,
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
	 * Update By Id
	 * @param {*} id
	 */
	function updateById(id) {
		if (ACTIVE) {
			try {
				var currentRecord = record.load({
					type: record.Type.OPPORTUNITY,
					id: id
				});
				if (currentRecord) {
					var entity = currentRecord.getValue('entity');
					var customer = record.load({
						type: record.Type.CUSTOMER,
						id: entity
					});
					if (customer) {
						var startDate = customer.getValue('custentity_start_date');
						var extend = customer.getValue('custentity_extend');
						var expirationDate = customer.getValue('custentity_expiration_date');
						if (!startDate || startDate == '') {
							leadProspectCustomer.updateDateFromNow(entity);
							customer = record.load({
								type: record.Type.CUSTOMER,
								id: entity
							});
						}

						currentRecord.setValue({
							fieldId: 'custbody_start_date',
							value: startDate
						});
						currentRecord.setValue({
							fieldId: 'custbody_expiration_date',
							value: expirationDate
						});
						currentRecord.setValue({
							fieldId: 'custbody_extends',
							value: extend
						});
						currentRecord.save();
					}
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
	 * Change Status to Closed Lost By Id
	 *
	 * {"value":"14","text":"Closed Lost"}
	 * @param {*} id
	 */
	function changeStatusToClosedLostById(id) {
		if (ACTIVE) {
			try {
				var currentRecord = record.load({
					type: record.Type.OPPORTUNITY,
					id: id
				});
				if (currentRecord) {
					currentRecord.setValue({
						fieldId: 'entitystatus',
						value: 14 // Closed Lost
					});
					currentRecord.setValue({
						fieldId: 'custbody_start_date',
						value: ''
					});
					currentRecord.setValue({
						fieldId: 'custbody_expiration_date',
						value: ''
					});
					currentRecord.setValue({
						fieldId: 'custbody_extends',
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
	 * Is Lock Opportunity
	 * @param {*} currentRecord
	 */
	function isLockOpportunity(currentRecord) {
		if (!ACTIVE_LOCK_OPPORTUNITY) {
			return false;
		}
		try {
			var entitystatus = currentRecord.getValue('entitystatus');
      const estimates = currentRecord.getLineCount({ sublistId: 'estimates' });
			// {"value":"14","text":"Closed Lost"},{"value":"16","text":"Lost Customer"}
			if (entitystatus == 14 || entitystatus == 16 || estimates > 0) {
				return true;
			}
		} catch (error) {
			log.error({
				title: '[' + MODULE_NAME + '] > isLockOpportunity',
				details: error
			});
		}
		return false;
	}

	return {
		resetById: resetById,
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit,
		changeStatusToClosedLostById: changeStatusToClosedLostById
	};
});
