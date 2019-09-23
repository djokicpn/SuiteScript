/**
 * Lead / Prospect / Customer Form User Event Script
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(['./Module/salesRepModule'], function(salesRepModule) {
	function beforeLoad(context) {
		try {
			var form = context.form;
			var addressbook = form.getSublist({ id: 'addressbook' });
			if (addressbook) {
				var labelCol = addressbook.getField({ id: 'label' });
				if (labelCol) {
					labelCol.updateDisplayType({ displayType: 'disabled' });
				}
			}
		} catch (error) {
			log.error({
				title: 'Error beforeLoad',
				details: error
			});
		}
		salesRepModule.beforeLoad(context);
	}

	function beforeSubmit(context) {}

	function afterSubmit(context) {}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});