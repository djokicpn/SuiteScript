/**
 * Lead / Prospect / Customer Scheduled Script
 *
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @author trungpv <trung@lexor.com>
 */
define(['N/search', '/SuiteScripts/Module/SalesFlow/Main'], function(search, salesFlow) {
	/* VARS */
	const AFTER_DAYS = 1;

	/**
	 * execute
	 * @param {*} context
	 */
	function execute(context) {
		try {
			var listLeads = search.create({
				type: search.Type.LEAD,
				filters: [
					{
						name: 'entitystatus',
						operator: search.Operator.IS,
						values: [6]
					}
				],
				columns: ['internalid', 'datecreated', 'entitystatus', 'custentity_start_date']
			});
			listLeads.run().each(function(item) {
				var startDate = item.getValue('custentity_start_date');
				startDate = startDate && startDate != '' ? startDate : item.getValue('datecreated');
				var diffDate = diffNow(new Date(startDate));
				if (diffDate) {
					if (diffDate.days >= AFTER_DAYS) {
						salesFlow.LPC.changeStatusLeadUnqualifiedById(item.id);
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

	return {
		execute: execute
	};
});
