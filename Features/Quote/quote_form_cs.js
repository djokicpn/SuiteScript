/**
 * Quote Form
 * custform_145_4283482_879
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @NScriptType ClientScript
 * @author trungpv <trung@lexor.com>
 */
define([
	'/SuiteScripts/Module/shippingRates',
	'/SuiteScripts/Module/discountModule',
	'/SuiteScripts/lib/micromodal.min',
	'/SuiteScripts/Module/oneQuoteForOneCustomer'
], function(_ShippingRates, _discountModule, MicroModal, oneQuoteForOneCustomer) {
	/* === VARS === */

	/* === EVENTS FUNCTIONS === */

	/**
	 * Page Init
	 * @param {*} context
	 */
	function pageInit(context) {
		oneQuoteForOneCustomer.vaildOneQuoteForCustomer(context);
		const mode = context.mode;
		const currentRecord = context.currentRecord;
		try {
			removeOptionsShipAndBill();
			_ShippingRates.pageInit(currentRecord);
			_discountModule.pageInit(context);
		} catch (error) {
			console.log('pageInit Error: ', error);
		}
		try {
			if (mode === 'edit' || mode === 'create' || mode === 'copy') {
				addButtonSetLocation(currentRecord);
			}
		} catch (error) {
			console.log('pageInit Only Edit Mode Error: ', error);
		}
		return;
	}

	/**
	 * Sublist Changed
	 * @param {*} context
	 */
	function sublistChanged(context) {
		const currentRecord = context.currentRecord;
		const sublistId = context.sublistId;
		if (sublistId === 'item') {
			try {
				_ShippingRates.sublistChanged(currentRecord);
			} catch (error) {
				console.log('sublistChanged Error: ', error);
			}
		}
		_discountModule.sublistChanged(context);

		return;
	}

	/**
	 * Validate Line
	 * @param {*} context
	 */
	function validateLine(context) {
		try {
			const sublistId = context.sublistId;
			const currentRecord = context.currentRecord;
			if (sublistId === 'item') {
				const quantity = currentRecord.getCurrentSublistValue({
					sublistId: sublistId,
					fieldId: 'quantity'
				});
				const itemWeight = currentRecord.getCurrentSublistValue({
					sublistId: sublistId,
					fieldId: 'weightinlb'
				});
				currentRecord.setCurrentSublistValue({
					sublistId: sublistId,
					fieldId: 'custcol_total_weight',
					value: quantity * itemWeight
				});
			}
		} catch (error) {
			console.log('validateLine Error: ', error);
		}
		return true; //Return true if the line is valid.
	}

	/**
	 * Field Changed
	 * @param {*} context
	 */
	function fieldChanged(context) {
		//shipaddresslist, billaddresslist
		const fieldId = context.fieldId;
		const sublistId = context.sublistId;
		if (sublistId === null && (fieldId === 'shipaddresslist' || fieldId === 'billaddresslist')) {
			removeOptionsShipAndBill();
		}

		_ShippingRates.fieldChanged(context);
		_discountModule.fieldChanged(context);

		return;
	}

	/**
	 * remove Select Option
	 * @param {*} fieldName
	 * @param {*} value
	 */
	function removeSelectOption(fieldName, value) {
		var form =
			typeof ftabs != 'undefined' && ftabs[getFieldName(fieldName)] != null
				? document.forms[ftabs[getFieldName(fieldName)] + '_form']
				: document.forms[0];
		var fld = getFormElement(form, getFieldName(fieldName));
		if (fld != null) {
			if (value != null) deleteOneSelectOption(fld, value);
			else deleteAllSelectOptions(fld, window);
		}
	}

	/**
	 * Remove Options Ship and Bill
	 */
	function removeOptionsShipAndBill() {
		// Remove [New, Custom] options billaddresslist
		removeSelectOption('billaddresslist', '-1');
		removeSelectOption('billaddresslist', '-2');
		// Remove [New, Custom] options shipaddresslist
		removeSelectOption('shipaddresslist', '-1');
		removeSelectOption('shipaddresslist', '-2');

		// Hide Button
		document
			.getElementById('billaddresslist_popup_new')
			.setAttribute('style', 'display:none !important');
		document
			.getElementById('billaddresslist_popup_link')
			.setAttribute('style', 'display:none !important');
		document
			.getElementById('shipaddresslist_popup_new')
			.setAttribute('style', 'display:none !important');
		document
			.getElementById('shipaddresslist_popup_link')
			.setAttribute('style', 'display:none !important');
	}

	/**
	 * Add Button Set Location
	 * @param {*} currentRecord
	 */
	function addButtonSetLocation(currentRecord) {
		initModalLoading();
		// <button type="button" class="button-blue-small" id="btnSetLocation" title="Set Location">Set Location</button>
		var btnSetLocation = document.createElement('button');
		btnSetLocation.className = 'button-blue-small';
		btnSetLocation.id = 'btnSetLocation';
		btnSetLocation.setAttribute('type', 'button');
		btnSetLocation.setAttribute('title', 'Set Location');
		btnSetLocation.setAttribute('style', 'height: 25px;margin-left: 10px;');
		btnSetLocation.textContent = 'Set Location';
		btnSetLocation.addEventListener('click', function(event) {
			var defaultLocation = currentRecord.getValue({
				fieldId: 'custbody_set_line_location'
			});
			var defaultLocationDisplay = currentRecord.getText({
				fieldId: 'custbody_set_line_location'
			});
			showLoading(function() {
				setTimeout(function() {
					const totalLine = currentRecord.getLineCount({ sublistId: 'item' });
					for (var index = 0; index < totalLine; index++) {
						var itempicked = currentRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'itempicked',
							line: index
						});
						var itempacked = currentRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'itempacked',
							line: index
						});
						var islinefulfilled = currentRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'islinefulfilled',
							line: index
						});
						if (itempicked !== 'T' && itempacked !== 'T' && islinefulfilled !== 'T') {
							currentRecord.selectLine({
								sublistId: 'item',
								line: index
							});
							currentRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'location',
								value: defaultLocation,
								ignoreFieldChange: true
							});
							currentRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'location_display',
								value: defaultLocationDisplay,
								ignoreFieldChange: true
							});
							currentRecord.commitLine({
								sublistId: 'item'
							});
						}
					}
					MicroModal.close('modal-loading');
				}, 400);
			});
		});
		document.getElementById('custbody_set_line_location_fs').appendChild(btnSetLocation);
	}

	/**
	 * Init Modal Loading
	 * @param {*} str
	 */
	function initModalLoading() {
		var div = document.createElement('div');
		div.className = 'modal micromodal-slide';
		div.id = 'modal-loading';
		div.setAttribute('aria-hidden', 'true');
		div.innerHTML =
			'<div class="modal__overlay" tabindex="-1" data-micromodal-close><div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-loading-title"><header class="modal__header"><h2 class="modal__title" id="modal-loading-title">Processing ...</h2><button class="modal__close" aria-label="Close modal" data-micromodal-close></button></header><main class="modal__content" id="modal-loading-content"><div class="lds-ripple"><div></div><div></div></div></main></div></div>';
		document.body.appendChild(div);
	}

	/**
	 * Show Modal
	 * @param {*} title
	 * @param {*} onShow
	 */
	function showLoading(onShow) {
		MicroModal.show('modal-loading', {
			disableScroll: true,
			closeTrigger: 'data-micromodal-close',
			awaitCloseAnimation: true,
			onShow: onShow ? onShow : function(params) {},
			onClose: function(modal) {
				document.querySelector('#modal-loading-content').innerHTML =
					'<div class="lds-ripple"><div></div><div></div></div>';
			}
		});
	}

	/**
	 * Save Record
	 * @param {*} context
	 */
	function saveRecord(context) {
		if (oneQuoteForOneCustomer.vaildOneQuoteForCustomer(context)) {
			return false;
		}
		return true; //Return true if you want to continue saving the record.
	}

	/**
	 * Export Events
	 */
	var exports = {};
	exports.pageInit = pageInit;
	exports.sublistChanged = sublistChanged;
	exports.validateLine = validateLine;
	exports.fieldChanged = fieldChanged;
	exports.saveRecord = saveRecord;
	return exports;
});
