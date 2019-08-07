/**
 * Purchase Order Form CLient Script
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @NScriptType ClientScript
 * @author trungpv <trung@lexor.com>
 */
define(['/SuiteScripts/lib/micromodal.min', 'N/search'], function(MicroModal, search) {
	/* === VARS === */

	/* === EVENTS FUNCTIONS === */
	/**
	 * Page Init
	 * @param {*} context
	 */
	function pageInit(context) {
		const mode = context.mode;
		const currentRecord = context.currentRecord;
		try {
			loadCSSText(
				'.modal{font-family:-apple-system,BlinkMacSystemFont,avenir next,avenir,helvetica neue,helvetica,ubuntu,roboto,noto,segoe ui,arial,sans-serif}.modal__overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:flex;justify-content:center;align-items:center;z-index:1000}.modal__container{background-color:#fff;padding:30px;max-width:500px;max-height:100vh;border-radius:4px;overflow-y:auto;box-sizing:border-box}.modal__header{display:flex;justify-content:space-between;align-items:center}.modal__title{margin-top:0;margin-bottom:0;font-weight:600;font-size:1.25rem;line-height:1.25;color:#00449e;box-sizing:border-box}.modal__close{background:0 0;border:0}.modal__header .modal__close:before{content:"\\2715"}.modal__content{margin-top:2rem;line-height:1.5;color:rgba(0,0,0,.8)}.modal__btn{font-size:.875rem;padding-left:1rem;padding-right:1rem;padding-top:.5rem;padding-bottom:.5rem;background-color:#e6e6e6;color:rgba(0,0,0,.8);border-radius:.25rem;border-style:none;border-width:0;cursor:pointer;-webkit-appearance:button;text-transform:none;overflow:visible;line-height:1.15;margin:0;will-change:transform;-moz-osx-font-smoothing:grayscale;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-transform:translateZ(0);transform:translateZ(0);transition:-webkit-transform .25s ease-out;transition:transform .25s ease-out;transition:transform .25s ease-out,-webkit-transform .25s ease-out}.modal__btn:focus,.modal__btn:hover{-webkit-transform:scale(1.05);transform:scale(1.05)}.modal__btn-primary{background-color:#00449e;color:#fff}@keyframes mmfadeIn{from{opacity:0}to{opacity:1}}@keyframes mmfadeOut{from{opacity:1}to{opacity:0}}@keyframes mmslideIn{from{transform:translateY(15%)}to{transform:translateY(0)}}@keyframes mmslideOut{from{transform:translateY(0)}to{transform:translateY(-10%)}}.micromodal-slide{display:none}.micromodal-slide.is-open{display:block}.micromodal-slide[aria-hidden=false] .modal__overlay{animation:mmfadeIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=false] .modal__container{animation:mmslideIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__overlay{animation:mmfadeOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__container{animation:mmslideOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide .modal__container,.micromodal-slide .modal__overlay{will-change:transform}.modal__footer{margin-top: 2rem;}'
			);
			loadCSSText(
				'.button-blue-small{background-color:#607799;border:.1rem solid #607799;border-radius:.3rem;color:#fff;cursor:pointer;display:inline-block;font-size:.8rem;height:2rem;letter-spacing:.1rem;line-height:.8rem;padding:0 .5rem;text-align:center;text-decoration:none;white-space:nowrap}.button-blue-small:hover{background-color:#606c76;border-color:#606c76;color:#fff;outline:0}.lds-ripple{display:inline-block;position:relative;width:64px;height:64px;display: block;margin-left: auto;margin-right: auto;}.lds-ripple div{position:absolute;border:4px solid #000008;opacity:1;border-radius:50%;animation:lds-ripple 1s cubic-bezier(0,.2,.8,1) infinite}.lds-ripple div:nth-child(2){animation-delay:-.5s}@keyframes lds-ripple{0%{top:28px;left:28px;width:0;height:0;opacity:1}100%{top:-1px;left:-1px;width:58px;height:58px;opacity:0}}.row-shipping-method {display: flex;}.column-shipping-method {flex: 50%;}'
			);
			addButtonImport(currentRecord);
			addButtonImportV1(currentRecord);
		} catch (error) {
			log.error({
				title: '[ERROR] pageInit',
				details: error
			});
		}
		return;
	}

	/**
	 * Add Button Import from Clipboard
	 * @param {*} currentRecord
	 */
	function addButtonImport(currentRecord) {
		initModalImport();
		var btnImport = document.getElementById('btnImport');
		btnImport.addEventListener('click', function(event) {
			showImport(function() {
				setTimeout(function() {
					const entity = currentRecord.getValue('entity');
					if (!entity || entity === '') {
						document.querySelector('#modal-import-content').innerHTML =
							'<p style="color: red">Make sure enter value(s) for: Vendor</p>';
					} else {
						const totalLine = currentRecord.getLineCount({
							sublistId: 'item'
						});
						var contentHTML = '<p>Select CSV File:</p>';
						contentHTML +=
							'<p style="margin-bottom: 10px;"><input id="csvImportFile" class="input" type="file" /></p>';
						// contentHTML +=
						// 	'<button type="button" class="button-blue-small" id="btnRunImport">Import Data</button>';
						document.querySelector('#modal-import-content').innerHTML = contentHTML;
						// Events Handing
						var fileInputCSVImport = document.getElementById('csvImportFile');
						fileInputCSVImport.addEventListener('change', function() {
							var reader = new FileReader();
							reader.onload = function() {
								// Loading
								document.querySelector('#modal-import-content').innerHTML =
									'<div class="lds-ripple"><div></div><div></div></div>';
								setTimeout(function() {
									const HEADER = [
										'VENDOR NAME',
										'INVENTORY DETAIL',
										'REV',
										'QUANTITY',
										'DESCRIPTION'
									];
									const TYPES = ['assemblyitem'];
									var lines = reader.result.split(/\n/);
									// Filter Header
									lines = lines.filter(function(line) {
										line = line.trim().split(',');
										return !HEADER.includes(line[0]);
									});
									lines = processingData(lines);
									var errorKeys = [];
									for (var i = 0; i < Object.keys(lines).length; i++) {
										const key = Object.keys(lines)[i];
										try {
											const item = lines[key];
											// Search by vendorname
											var results = search.global({
												keywords: key
											});
											results = results.filter(function(item) {
												return TYPES.includes(item.recordType);
											});
											if (results.length > 0) {
												var assemblyItem = results[0];
												currentRecord.selectNewLine({ sublistId: 'item' });
												currentRecord.setCurrentSublistValue({
													sublistId: 'item',
													fieldId: 'item',
													value: assemblyItem.id,
													forceSyncSourcing: true
												});
												currentRecord.setCurrentSublistValue({
													sublistId: 'item',
													fieldId: 'quantity',
													value: item.qty,
													forceSyncSourcing: true
												});

												// Set Rev and Description
												var revString = objToString(item.rev);
												if (item.description.trim() !== '') {
													revString = revString + ' - Description: ' + item.description;
												}
												currentRecord.setCurrentSublistValue({
													sublistId: 'item',
													fieldId: 'description',
													value: revString,
													forceSyncSourcing: true
												});

												currentRecord.commitLine({
													sublistId: 'item'
												});
											} else {
												errorKeys.push(key);
											}
										} catch (error) {
											errorKeys.push(key);
										}
									}
									if (errorKeys.length === 0) {
										MicroModal.close('modal-import');
									} else {
										document.querySelector('#modal-import-content').innerHTML =
											'<p style="color: red">Something went wrong with these items: ' +
											errorKeys.join(', ') +
											'</p>';
									}
								}, 400);
							};
							// start reading the file. When it is done, calls the onload event defined above.
							reader.readAsBinaryString(fileInputCSVImport.files[0]);
						});
					}
				}, 400);
			});
		});
	}

	/**
	 * Add button Import V1
	 * @param {*} currentRecord
	 */
	function addButtonImportV1(currentRecord) {
		// custpage_import_csv_v2
		var btnImportV1 = document.getElementById('custpage_import_csv_v2');
		btnImportV1.addEventListener('click', function(event) {
			showImport(function() {
				setTimeout(function() {
					const entity = currentRecord.getValue('entity');
					if (!entity || entity === '') {
						document.querySelector('#modal-import-content').innerHTML =
							'<p style="color: red">Make sure enter value(s) for: Vendor</p>';
					} else {
						var contentHTML = '<p>Select CSV File:</p>';
						contentHTML +=
							'<p style="margin-bottom: 10px;"><input id="csvImportFile" class="input" type="file" /></p>';
						// contentHTML +=
						// 	'<button type="button" class="button-blue-small" id="btnRunImport">Import Data</button>';
						document.querySelector('#modal-import-content').innerHTML = contentHTML;
						// Events Handing
						var fileInputCSVImport = document.getElementById('csvImportFile');
						fileInputCSVImport.addEventListener('change', function() {
							var reader = new FileReader();
							reader.onload = function() {
								// Loading
								document.querySelector('#modal-import-content').innerHTML =
									'<div class="lds-ripple"><div></div><div></div></div>';
								setTimeout(function() {
									const HEADER = [
										'VENDOR NAME',
										'INVENTORY DETAIL',
										'REV',
										'QUANTITY',
										'DESCRIPTION'
									];
									const TYPES = ['assemblyitem'];
									var lines = reader.result.split(/\n/);
									// Filter Header
									lines = lines.filter(function(line) {
										line = line.trim().split(',');
										return !HEADER.includes(line[0]);
									});
									var errorKeys = [];
									for (var i = 0; i < lines.length; i++) {
										const line = lines[i];
										try {
											if (/\S/.test(line)) {
												var item = line.trim().split(',');
												// Search by vendorname
												var results = search.global({
													keywords: item[0].trim()
												});
												results = results.filter(function(item) {
													return TYPES.includes(item.recordType);
												});
												if (results.length > 0) {
													var assemblyItem = results[0];
													currentRecord.selectNewLine({ sublistId: 'item' });
													currentRecord.setCurrentSublistValue({
														sublistId: 'item',
														fieldId: 'item',
														value: assemblyItem.id,
														forceSyncSourcing: true
													});
													currentRecord.setCurrentSublistValue({
														sublistId: 'item',
														fieldId: 'quantity',
														value: item.qty,
														forceSyncSourcing: true
													});

													// Set Rev and Description
													var revString = objToString(item.rev);
													if (item.description.trim() !== '') {
														revString = revString + ' - Description: ' + item.description;
													}
													currentRecord.setCurrentSublistValue({
														sublistId: 'item',
														fieldId: 'description',
														value: revString,
														forceSyncSourcing: true
													});

													currentRecord.commitLine({
														sublistId: 'item'
													});
												} else {
													errorKeys.push(key);
												}
											} else {
												errorKeys.push(key);
											}
										} catch (error) {
											errorKeys.push(key);
										}
									}
									if (errorKeys.length === 0) {
										MicroModal.close('modal-import');
									} else {
										document.querySelector('#modal-import-content').innerHTML =
											'<p style="color: red">Something went wrong with these items: ' +
											errorKeys.join(', ') +
											'</p>';
									}
								}, 400);
							};
							// start reading the file. When it is done, calls the onload event defined above.
							reader.readAsBinaryString(fileInputCSVImport.files[0]);
						});
					}
				}, 400);
			});
		});
	}

	/**
	 * Init Modal Import
	 */
	function initModalImport() {
		var div = document.createElement('div');
		div.className = 'modal micromodal-slide';
		div.id = 'modal-import';
		div.setAttribute('aria-hidden', 'true');
		div.innerHTML =
			'<div class="modal__overlay" tabindex="-1" data-micromodal-close><div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-import-title"><header class="modal__header"><h2 class="modal__title" id="modal-import-title">Import CSV</h2><button class="modal__close" aria-label="Close modal" data-micromodal-close></button></header><main class="modal__content" id="modal-import-content"><div class="lds-ripple"><div></div><div></div></div></main></div></div>';
		document.body.appendChild(div);
	}

	/**
	 * Show Modal
	 * @param {*} title
	 * @param {*} onShow
	 */
	function showImport(onShow) {
		MicroModal.show('modal-import', {
			disableScroll: true,
			closeTrigger: 'data-micromodal-close',
			awaitCloseAnimation: true,
			onShow: onShow ? onShow : function(params) {},
			onClose: function(modal) {
				document.querySelector('#modal-import-content').innerHTML =
					'<div class="lds-ripple"><div></div><div></div></div>';
			}
		});
	}

	/**
	 * Load CSS from Text
	 * @param {*} str
	 */
	function loadCSSText(str) {
		var fileref = document.createElement('style');
		fileref.innerHTML = str;
		document.head.appendChild(fileref);
	}

	/**
	 * Processing data
	 * @param {*} lines
	 */
	function processingData(lines) {
		var result = [];
		for (var i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (/\S/.test(line)) {
				var cols = line.trim().split(',');
				if (result[cols[0]] == undefined) {
					result[cols[0]] = {
						qty: 0,
						items: [],
						rev: {},
						description: ''
					};
				}
				if (result[cols[0]].items.indexOf(cols[1]) === -1) {
					result[cols[0]].items.push(cols[1]);
				}
				// Count Rev
				if (result[cols[0]].rev[cols[2]] === undefined) {
					result[cols[0]].rev[cols[2]] = 1;
				} else {
					result[cols[0]].rev[cols[2]]++;
				}

				result[cols[0]].qty = result[cols[0]].qty + parseFloat(cols[3]);
				result[cols[0]].description = cols[4];
			}
		}
		return result;
	}

	/**
	 * Obj to String
	 * @param {*} obj
	 */
	function objToString(obj) {
		var result = '';
		for (var i = 0; i < Object.keys(obj).length; i++) {
			const key = Object.keys(obj)[i];
			result += obj[key] + ' SET REV ' + key;
			if (i !== Object.keys(obj).length - 1) {
				result += ', ';
			}
		}
		return result;
	}

	/**
	 * Export Events
	 */
	var exports = {};
	exports.pageInit = pageInit;
	return exports;
});
