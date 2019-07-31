/**
 * Wipe out data for transactions
 *
 * @NApiVersion 2.0
 * @NScriptType MassUpdateScript
 * @author trungpv <trung@lexor.com>
 */
define(['N/record'], function(record) {
	function deleteRecord(context) {
		const type = context.type;
		const id = context.id;
		try {
			log.debug({
				title: '====> Deleting ' + type + ': ' + id,
				details: '====> Deleting ' + type + ': ' + id
			});
			// Delete record
			record.delete({
				type: type,
				id: id
			});
			log.debug({
				title: '[Done] Deleted ' + type + ': ' + id,
				details: '[Done] Deleted ' + type + ': ' + id
			});
		} catch (error) {
			log.error({
				title: '[Error] Delete ' + type + ': ' + id,
				details: error
			});
		}
	}

	return {
		each: deleteRecord
	};
});
