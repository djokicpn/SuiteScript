/**
 * Purchase Order Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define([], function() {
	function beforeLoad(context) {
		try {
			const form = context.form;
			try {
				if (context.type === context.UserEventType.CREATE) {
					form.addButton({
						id: 'custpage_import_csv',
						label: 'Import CSV with serial number'
					});
				}
			} catch (err) {
				log.error({
					title: 'Error Add Import CSV Button',
					details: err.message
				});
			}
		} catch (error) {
			log.error({
				title: 'Error beforeLoad',
				details: error.message
			});
		}
	}

	return {
		beforeLoad: beforeLoad
	};
});
