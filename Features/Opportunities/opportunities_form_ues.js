/**
 * Opportunities Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define([
	'N/ui/serverWidget',
	'/SuiteScripts/Module/oneOpportunityForOneCustomer',
	'/SuiteScripts/Module/SalesFlow/Main'
], function(serverWidget, oneOpportunityForOneCustomer, salesFlow) {
	function beforeLoad(context) {
		try {
			// https://trello.com/c/jTajsqiL/212-one-opp-for-1-customer
			oneOpportunityForOneCustomer.beforeLoad(context, serverWidget);
			salesFlow.O.beforeLoad(context);

			var form = context.form;
			var item = form.getSublist({ id: 'item' });
			if (item) {
				var amountCol = item.getField({ id: 'amount' });
				if (amountCol) {
					amountCol.updateDisplayType({ displayType: 'disabled' });
				}
			}
		} catch (error) {
			log.error({
				title: 'Error beforeLoad',
				details: error.message
			});
		}
	}

	/**
	 * beforeSubmit
	 * @param {*} context
	 */
	function beforeSubmit(context) {
		try {
			// https://trello.com/c/jTajsqiL/212-one-opp-for-1-customer
			oneOpportunityForOneCustomer.beforeSubmit(context);

			salesFlow.O.beforeSubmit(context);
		} catch (error) {
			log.error({
				title: 'Error beforeSubmit',
				details: error
			});
		}
	}

	/**
	 * afterSubmit
	 * @param {*} context
	 */
	function afterSubmit(context) {
		try {
			salesFlow.O.afterSubmit(context);
		} catch (error) {
			log.error({
				title: 'Error afterSubmit',
				details: error
			});
		}
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
