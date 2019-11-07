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
			spaBaseQty.updateSalesOrderForMassUpdate(id);
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
