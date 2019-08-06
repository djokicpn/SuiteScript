/**
 * Print out Label Items
 *
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @author trungpv <trung@lexor.com>
 */
define(['N/record', 'N/render', 'N/file'], function(record, render, file) {
	function onRequest(context) {
		try {
			var response = context.response;
			var request = context.request;
			var customId = request.parameters.customId;
			if (!customId) {
				response.write('customId parameter missing');
			}
			// itemfulfillment ITEM_FULFILLMENT
			var itemFulfillment = record.load({
				type: record.Type.ITEM_FULFILLMENT,
				id: customId
			});

			var renderer = render.create();
			var xmlTmplFile = file.load('SuiteScripts/Lexor_Advanced_PDF_Forms/Item_Labels.xml');
			renderer.templateContent = xmlTmplFile.getContents();
			renderer.addRecord('record', itemFulfillment);

			response.renderPdf(renderer.renderAsString());
		} catch (err) {
			log.error({
				title: '[LINE_NUMBER]: ' + err.lineno,
				details: err
			});
		}
	}

	return {
		onRequest: onRequest
	};
});
