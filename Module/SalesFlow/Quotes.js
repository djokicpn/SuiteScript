/**
 * Sales Flow > Quotes Module
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define([
	'N/record',
	'N/redirect',
	'N/ui/serverWidget',
	'/SuiteScripts/Module/SalesFlow/LeadProspectCustomer',
	'/SuiteScripts/Module/SalesFlow/Opportunities'
], function(record, redirect, serverWidget, leadProspectCustomer, opportunities) {
	const ACTIVE = true;
	const MODULE_NAME = '/SuiteScripts/Module/SalesFlow/Quotes.js';
	const ACTIVE_CLOSE = true;

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

				// Closed Record
				if (isCloseQuote(newRecord)) {
					if (type === context.UserEventType.EDIT) {
						redirect.toRecord({
							type: record.Type.ESTIMATE,
							id: newRecord.id,
							parameters: {}
						});
					}

					if (type == context.UserEventType.VIEW) {
						var inline = context.form.addField({
							id: 'custpage_trigger_it',
							label: ' ',
							type: serverWidget.FieldType.INLINEHTML
						});
						inline.defaultValue =
							"<script>jQuery(function($){ require(['/SuiteScripts/Module/SalesFlow/ClosedMessage.js'], function(closedMessage){  closedMessage.show();});});</script>";
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
					whenCloseQuote(context);
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
	 * When User Close Quote
	 *
	 * @param {*} context
	 */
	function whenCloseQuote(context) {
		try {
			var newRecord = context.newRecord;
			if (isCloseQuote(newRecord)) {
				// Update OPP
				var id = newRecord.id;
				resetById(id);
				// Update OPP
				var opportunity = newRecord.getValue('opportunity');
				if (opportunity) {
					opportunities.resetById(opportunity);
				}
				// Update CUSTOMER
				var entity = newRecord.getValue('entity');
				if (entity) {
					leadProspectCustomer.changeStatusLeadUnqualifiedById(entity);
				}
			}
		} catch (error) {
			log.error({
				title: '[' + MODULE_NAME + '] > whenCloseQuote',
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
					type: record.Type.ESTIMATE,
					id: id
				});
				if (currentRecord) {
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
					type: record.Type.ESTIMATE,
					id: id
				});
				if (currentRecord) {
					var entity = currentRecord.getValue('entity');
					var opportunity = currentRecord.getValue('opportunity');
					var customer = record.load({
						type: record.Type.CUSTOMER,
						id: entity
					});
					if (customer) {
						var startDate = customer.getValue('custentity_start_date');
						var extend = customer.getValue('custentity_extend');
						var expirationDate = customer.getValue('custentity_expiration_date');
						if (!startDate || startDate == '') {
							if (opportunity) {
								opportunities.updateById(opportunity);
							} else {
								leadProspectCustomer.updateDateFromNow(entity);
							}
							customer = record.load({
								type: record.Type.CUSTOMER,
								id: entity
							});
							startDate = customer.getValue('custentity_start_date');
							extend = customer.getValue('custentity_extend');
							expirationDate = customer.getValue('custentity_expiration_date');
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
					type: record.Type.ESTIMATE,
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
					title: '[' + MODULE_NAME + '] > changeStatusToClosedLostById',
					details: error
				});
			}
		}
	}

	/**
	 * Is Close Quote
	 * @param {*} currentRecord
	 */
	function isCloseQuote(currentRecord) {
		if (!ACTIVE_CLOSE) {
			return false;
		}
		try {
			var entitystatus = currentRecord.getValue('entitystatus');
			// {"value":"14","text":"Closed Lost"}
			if (entitystatus == 14) {
				return true;
			}
		} catch (error) {
			log.error({
				title: '[' + MODULE_NAME + '] > isCloseQuote',
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
