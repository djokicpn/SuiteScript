/**
 * Update Billed Date for transactions
 *
 * @NApiVersion 2.0
 * @NScriptType MassUpdateScript
 * @author trungpv <trung@lexor.com>
 */
define(['../Module/billedDate'], function(billedDate) {
	function updateRecord(context) {
		const type = context.type;
		const id = context.id;
		try {
			log.debug({
				title: '====> Updating ' + type + ': ' + id,
				details: '====> Updating ' + type + ': ' + id
			});
			billedDate.updateSalesOrder(id, false);
			log.debug({
				title: '[Done] Updated ' + type + ': ' + id,
				details: '[Done] Updated ' + type + ': ' + id
			});
		} catch (error) {
			log.error({
				title: '[Error] Update ' + type + ': ' + id,
				details: error
			});
		}
	}

	return {
		each: updateRecord
	};
});
