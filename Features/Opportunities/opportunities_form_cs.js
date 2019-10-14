/**
 * Opportunities Form
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @NScriptType ClientScript
 * @author trungpv <trung@lexor.com>
 */
define(['/SuiteScripts/Module/oneOpportunityForOneCustomer'], function(
	oneOpportunityForOneCustomer
) {
	/**
	 * Page Init
	 * @param {*} context
	 */
	function pageInit(context) {
		oneOpportunityForOneCustomer.vaildOneOpportunityForCustomer(context);
	}

	/**
	 * Save Record
	 * @param {*} context
	 */
	function saveRecord(context) {
		if (oneOpportunityForOneCustomer.vaildOneOpportunityForCustomer(context)) {
			return false;
		}
		return true; //Return true if you want to continue saving the record.
	}

	return {
		pageInit: pageInit,
		saveRecord: saveRecord
	};
});
