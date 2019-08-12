/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @author trungpv <trung@lexor.com>
 */
define([
	'N/ui/serverWidget',
	'N/redirect',
	'N/record',
	'N/file',
	'N/encode',
	'N/search',
	'N/url'
], function(serverWidget, redirect, record, file, encode, search, url) {
	const MESSAGE_CODES = {
		MSG_01: 'You have uploaded an invalid file (*.csv).',
		MSG_02: 'Import successful. __CLICK_HERE__ to open record.',
		MSG_03: 'Something went wrong this these items: __ITEMS__. __CLICK_HERE__ to check it.',
		MSG_04: 'Something went wrong. Please import again.'
	};

	function onRequest(context) {
		const request = context.request;
		const response = context.response;

		try {
			if (request.method == 'GET') {
				var MSG_CODE = request.parameters.MSG_CODE;
				var LIST_ITEMS = request.parameters.LIST_ITEMS;
				var ID = request.parameters.ID;
				var vendorId = request.parameters.vendorId;

				var form = getImportForm(MSG_CODE, ID, LIST_ITEMS, vendorId);
				response.writePage(form);
				return;
			}

			if (request.method == 'POST') {
				var vendorId = request.parameters.custpage_vendor_id;
				var csv = request.files.custpage_csv_file;
				if (csv && csv.fileType === file.Type.CSV) {
					var content = csv.getContents();
					if (content !== undefined) {
						var purchaseOrder = record.create({
							type: record.Type.PURCHASE_ORDER,
							isDynamic: true,
							defaultValues: {
								entity: vendorId
							}
						});
						var lines = content.split(/\n/);
						// Filter Header
						lines = lines.filter(function(line) {
							return line.indexOf('VENDOR NAME') === -1;
						});
						var errorKeys = [];
						var cacheResults = [];
						for (var i = 0; i <= lines.length; i++) {
							var line = lines[i];
							if (line && /\S/.test(line)) {
								var item = line.trim().split(',');
								var assemblyItem = false;
								var key = item[0].trim();
								try {
									if (cacheResults[key] === undefined) {
										// Search by vendorname
										var results = search.global({
											keywords: key
										});
										results = results.filter(function(item) {
											return item.recordType === 'assemblyitem';
										});
										if (results.length > 0) {
											assemblyItem = results[0].id;
											cacheResults[key] = assemblyItem;
										}
									} else {
										assemblyItem = cacheResults[key];
									}

									if (assemblyItem) {
										purchaseOrder.selectNewLine({ sublistId: 'item' });
										purchaseOrder.setCurrentSublistValue({
											sublistId: 'item',
											fieldId: 'item',
											value: assemblyItem,
											forceSyncSourcing: true
										});
										purchaseOrder.setCurrentSublistValue({
											sublistId: 'item',
											fieldId: 'custcol_laclong_code',
											value: item[1].trim(),
											forceSyncSourcing: true
										});
										purchaseOrder.setCurrentSublistValue({
											sublistId: 'item',
											fieldId: 'custcol_laclong_rev',
											value: item[2].trim(),
											forceSyncSourcing: true
										});
										purchaseOrder.setCurrentSublistValue({
											sublistId: 'item',
											fieldId: 'quantity',
											value: parseFloat(item[3].trim()),
											forceSyncSourcing: true
										});

										// Set Description
										purchaseOrder.setCurrentSublistValue({
											sublistId: 'item',
											fieldId: 'description',
											value: item[4].trim(),
											forceSyncSourcing: true
										});

										purchaseOrder.commitLine({
											sublistId: 'item'
										});
									} else {
										errorKeys.push(key);
									}
								} catch (error) {
									errorKeys.push(key);
								}
							}
						}

						var recordId = '';
						if (errorKeys.length === 0) {
							redirectToSuitelet('MSG_02', recordId, false, vendorId);
						} else {
							redirectToSuitelet('MSG_03', recordId, toBase64(errorKeys.join(', ')), vendorId);
						}
					} else {
						redirectToSuitelet('MSG_04', false, false, vendorId);
					}
				} else {
					redirectToSuitelet('MSG_01', false, false, vendorId);
				}
				// redirectToTaskRecord(10260);
				return;
			}

			return;
		} catch (e) {
			log.error({
				title: '[ERROR] onRequest',
				details: e.toString()
			});
			response.write(e.toString());
		}
	}

	function getImportForm(MSG_CODE, ID, LIST_ITEMS, vendorId) {
		var form = serverWidget.createForm({
			title: 'Import CSV'
		});

		var csvFileField = form.addField({
			id: 'custpage_csv_file',
			type: serverWidget.FieldType.FILE,
			label: 'CSV File'
		});
		var msgField = form.addField({
			id: 'custpage_message',
			type: serverWidget.FieldType.INLINEHTML,
			label: ' '
		});
		if (MESSAGE_CODES[MSG_CODE] !== undefined) {
			var pHTML = MESSAGE_CODES[MSG_CODE];
			switch (MSG_CODE) {
				case 'MSG_02':
					var poURL = url.resolveRecord({
						recordType: record.Type.PURCHASE_ORDER,
						recordId: ID
					});
					pHTML = pHTML.replace('__CLICK_HERE__', '<a href="' + poURL + '">Click Here</a>');
					msgField.defaultValue =
						'<p style="padding-top: 10px;font-size: 13px; color:blue">' + pHTML + '</p>';
					break;
				case 'MSG_03':
					var poURL = url.resolveRecord({
						recordType: record.Type.PURCHASE_ORDER,
						recordId: ID
					});
					pHTML = pHTML.replace('__CLICK_HERE__', '<a href="' + poURL + '">Click Here</a>');
					msgField.defaultValue =
						'<p style="padding-top: 10px;font-size: 13px; color:red">' + pHTML + '</p>';
					break;

				default:
					msgField.defaultValue =
						'<p style="padding-top: 10px;font-size: 13px; color:red">' + pHTML + '</p>';
					break;
			}
		}
		form.addField({
			id: 'custpage_blank',
			type: serverWidget.FieldType.INLINEHTML,
			label: ' '
		});

		var fieldVendorId = form.addField({
			id: 'custpage_vendor_id',
			type: serverWidget.FieldType.TEXT,
			label: 'Vendor ID'
		});
		fieldVendorId.defaultValue = vendorId;
		fieldVendorId.updateDisplayType({
			displayType: serverWidget.FieldDisplayType.HIDDEN
		});
		var fieldVendor = form.addField({
			id: 'custpage_vendor',
			type: serverWidget.FieldType.TEXT,
			label: 'Vendor'
		});
		try {
			var recVendorId = record.load({
				type: record.Type.VENDOR,
				id: vendorId
			});
			if (recVendorId) {
				fieldVendor.defaultValue = recVendorId.getValue('companyname');
			}
		} catch (error) {
			log.error({
				title: '[ERROR] getImportForm > recVendorId',
				details: error
			});
		}
		fieldVendor.updateDisplayType({
			displayType: serverWidget.FieldDisplayType.DISABLED
		});
		form.addSubmitButton({
			label: 'Import'
		});

		return form;
	}

	/**
	 * Redirect to PO
	 * @param {*} purchaseId
	 */
	function redirectToTaskRecord(purchaseId) {
		redirect.toRecord({
			type: record.Type.PURCHASE_ORDER,
			id: purchaseId
		});
	}

	/**
	 * Redirect Suitelet
	 * @param {*} MSG_CODE
	 */
	function redirectToSuitelet(MSG_CODE, ID, LIST_ITEMS, vendorId) {
		var payload = { MSG_CODE: MSG_CODE, ID: ID, LIST_ITEMS: LIST_ITEMS, vendorId: vendorId };
		redirect.toSuitelet({
			scriptId: 'customscript_purchase_order_suitelet',
			deploymentId: 'customdeploy_purchase_order_suitelet',
			parameters: payload
		});
	}

	/**
	 * toBase64
	 * @param {*} stringInput
	 */
	function toBase64(stringInput) {
		return encode.convert({
			string: stringInput,
			inputEncoding: encode.Encoding.UTF_8,
			outputEncoding: encode.Encoding.BASE_64
		});
	}

	return {
		onRequest: onRequest
	};
});
