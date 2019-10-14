/**
 * Opportunities Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(['N/ui/serverWidget', '/SuiteScripts/Module/oneOpportunityForOneCustomer'], function(
	serverWidget,
	oneOpportunityForOneCustomer
) {
	function beforeLoad(context) {
		try {
			// https://trello.com/c/jTajsqiL/212-one-opp-for-1-customer
			oneOpportunityForOneCustomer.beforeLoad(context, serverWidget);

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

	function beforeSubmit(context) {
		// https://trello.com/c/jTajsqiL/212-one-opp-for-1-customer
		oneOpportunityForOneCustomer.beforeSubmit(context);
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit
	};
});
