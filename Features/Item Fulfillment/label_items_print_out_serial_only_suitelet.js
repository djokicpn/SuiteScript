/**
 * Print out Label Items with Serial Only
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
			var xmlTmplFile = file.load('SuiteScripts/Lexor_Advanced_PDF_Forms/Item_Labels_Only_Serial.xml');
			renderer.templateContent = xmlTmplFile.getContents();
			renderer.addRecord('record', itemFulfillment);

			// tranid
			const fileName = 'item-labels-' + itemFulfillment.getValue('tranid') + '.pdf';
			// Content-Disposition: attachment; filename="filename.jpg"
			response.setHeader({
				name: 'Content-type',
				value: 'application/pdf'
			});
			response.setHeader({
				name: 'Content-Disposition',
				value: 'attachment; filename="' + fileName + '"'
			});
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
