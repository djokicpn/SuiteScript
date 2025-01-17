/**
 * Quotes Scheduled Script
 *
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @author trungpv <trung@lexor.com>
 */
define(['N/search', '/SuiteScripts/Module/SalesFlow/Main'], function(search, salesFlow) {
	/* VARS */

	/**
	 * execute
	 * @param {*} context
	 */
	function execute(context) {
		try {
			var listLeads = search.create({
				type: search.Type.ESTIMATE,
				// filters: [
				// 	{
				// 		name: 'entitystatus',
				// 		operator: search.Operator.ISNOT,
				// 		values: [14, 16]
				// 	}
				// ],
				columns: ['internalid', 'custbody_expiration_date', 'entity', 'entitystatus']
			});
			listLeads.run().each(function(item) {
				var expirationDate = item.getValue('custbody_expiration_date');
				var entity = item.getValue('entity');
				var opportunity = item.getValue('opportunity');
				var entitystatus = item.getValue('entitystatus');
				if (entitystatus != '14' && entitystatus != '13') {
					var isExpired = isToday(new Date(expirationDate));
					if (isExpired) {
						salesFlow.Q.changeStatusToClosedLostById(item.id);
						if (opportunity) {
							salesFlow.O.changeStatusToClosedLostById(opportunity);
						}
						salesFlow.LPC.changeStatusLeadUnqualifiedById(entity);
					}
				}
				return true;
			});
		} catch (error) {
			log.error({
				title: 'ScheduledScript',
				details: error
			});
		}
	}

	/**
	 * Is Today
	 * @param {*} date
	 */
	function isToday(date) {
		const today = new Date();
		return (
			date.getDate() == today.getDate() &&
			date.getMonth() == today.getMonth() &&
			date.getFullYear() == today.getFullYear()
		);
	}

	return {
		execute: execute
	};
});
