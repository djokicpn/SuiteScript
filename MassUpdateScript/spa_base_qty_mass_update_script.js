/**
 * Update Spa Base Qty for SO
 *
 * @NApiVersion 2.0
 * @NScriptType MassUpdateScript
 * @author trungpv <trung@lexor.com>
 */
define(['../Module/spaBaseQty'], function(spaBaseQty) {
	function updateRecord(context) {
		const type = context.type;
		const id = context.id;
		try {
			log.error({
				title: '====> Updating ' + type + ': ' + id,
				details: '[Done] Updated ' + type + ': ' + id
			});
			spaBaseQty.updateSalesOrderForMassUpdate(id);
			log.error({
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
