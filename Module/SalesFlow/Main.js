/**
 * Sales Flow
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define([
	'/SuiteScripts/Module/SalesFlow/LeadProspectCustomer',
	'/SuiteScripts/Module/SalesFlow/Opportunities',
	'/SuiteScripts/Module/SalesFlow/Quotes'
], function(leadProspectCustomer, opportunities, quotes) {
	return {
		LPC: leadProspectCustomer,
		O: opportunities,
		Q: quotes
	};
});
