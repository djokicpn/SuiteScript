/**
 * Sales Order Form
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @NScriptType ClientScript
 * @author trungpv <trung@lexor.com>
 */
define(['N/https', 'N/search', '/SuiteScripts/lib/micromodal.min'], function(
	https,
	search,
	MicroModal
) {
	/* === VARS === */

	/* === EVENTS FUNCTIONS === */

	/**
	 * Page Init
	 * @param {*} context
	 */
	function pageInit(context) {
		const currentRecord = context.currentRecord;
		try {
			buildTableTotalWeight(currentRecord, function() {
				openModal(currentRecord);
			});

			removeOptionsShipAndBill();

			// Intergrate Shipping Services
			loadCSSText(
				'.modal{font-family:-apple-system,BlinkMacSystemFont,avenir next,avenir,helvetica neue,helvetica,ubuntu,roboto,noto,segoe ui,arial,sans-serif}.modal__overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:flex;justify-content:center;align-items:center;z-index:1000}.modal__container{background-color:#fff;padding:30px;max-width:500px;max-height:100vh;border-radius:4px;overflow-y:auto;box-sizing:border-box}.modal__header{display:flex;justify-content:space-between;align-items:center}.modal__title{margin-top:0;margin-bottom:0;font-weight:600;font-size:1.25rem;line-height:1.25;color:#00449e;box-sizing:border-box}.modal__close{background:0 0;border:0}.modal__header .modal__close:before{content:"\\2715"}.modal__content{margin-top:2rem;line-height:1.5;color:rgba(0,0,0,.8)}.modal__btn{font-size:.875rem;padding-left:1rem;padding-right:1rem;padding-top:.5rem;padding-bottom:.5rem;background-color:#e6e6e6;color:rgba(0,0,0,.8);border-radius:.25rem;border-style:none;border-width:0;cursor:pointer;-webkit-appearance:button;text-transform:none;overflow:visible;line-height:1.15;margin:0;will-change:transform;-moz-osx-font-smoothing:grayscale;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-transform:translateZ(0);transform:translateZ(0);transition:-webkit-transform .25s ease-out;transition:transform .25s ease-out;transition:transform .25s ease-out,-webkit-transform .25s ease-out}.modal__btn:focus,.modal__btn:hover{-webkit-transform:scale(1.05);transform:scale(1.05)}.modal__btn-primary{background-color:#00449e;color:#fff}@keyframes mmfadeIn{from{opacity:0}to{opacity:1}}@keyframes mmfadeOut{from{opacity:1}to{opacity:0}}@keyframes mmslideIn{from{transform:translateY(15%)}to{transform:translateY(0)}}@keyframes mmslideOut{from{transform:translateY(0)}to{transform:translateY(-10%)}}.micromodal-slide{display:none}.micromodal-slide.is-open{display:block}.micromodal-slide[aria-hidden=false] .modal__overlay{animation:mmfadeIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=false] .modal__container{animation:mmslideIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__overlay{animation:mmfadeOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__container{animation:mmslideOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide .modal__container,.micromodal-slide .modal__overlay{will-change:transform}.modal__footer{margin-top: 2rem;}'
			);
			loadCSSText(
				'.lds-ripple{display:inline-block;position:relative;width:64px;height:64px;display: block;margin-left: auto;margin-right: auto;}.lds-ripple div{position:absolute;border:4px solid #000008;opacity:1;border-radius:50%;animation:lds-ripple 1s cubic-bezier(0,.2,.8,1) infinite}.lds-ripple div:nth-child(2){animation-delay:-.5s}@keyframes lds-ripple{0%{top:28px;left:28px;width:0;height:0;opacity:1}100%{top:-1px;left:-1px;width:58px;height:58px;opacity:0}}.row-shipping-method {display: flex;}.column-shipping-method {flex: 50%;}'
			);
			initModal();
		} catch (error) {
			console.log('pageInit Error: ', error);
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
				buildTableTotalWeight(currentRecord, function() {
					openModal(currentRecord);
				});
			} catch (error) {
				console.log('pageInit Error: ', error);
			}
		}
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
				const location = currentRecord.getValue({
					fieldId: 'location'
				});
				if (location) {
					currentRecord.setCurrentSublistValue({
						sublistId: sublistId,
						fieldId: 'location',
						value: location
					});
				}
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
		return;
	}

	/** HELPPER FUNCTIONS **/

	/**
	 * Build HTML Table Total Weight
	 * @param {*} currentRecord
	 */
	function buildTableTotalWeight(currentRecord, done) {
		// Add Util Function Replace All
		String.prototype.replaceAll = function(search, replacement) {
			return this.split(search).join(replacement);
		};

		const totalLine = currentRecord.getLineCount({ sublistId: 'item' });
		var tableTotalWeight = {};
		var mapLocation = {};
		var totalWeight = 0;
		document.querySelector('#tableTotalWeight tbody').innerHTML = '';
		for (var index = 0; index < totalLine; index++) {
			const quantity = currentRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'quantity',
				line: index
			});
			const weightinlb = currentRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'weightinlb',
				line: index
			});
			const location = currentRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'location_display',
				line: index
			});
			const locationId = currentRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'location',
				line: index
			});
			if (location === '') {
				if (tableTotalWeight['None'] === undefined) {
					tableTotalWeight['None'] = 0;
				}
				tableTotalWeight['None'] = tableTotalWeight['None'] + quantity * weightinlb;
				mapLocation['None'] = 0;
			} else {
				if (tableTotalWeight[location] === undefined) {
					tableTotalWeight[location] = 0;
				}
				tableTotalWeight[location] = tableTotalWeight[location] + quantity * weightinlb;
				mapLocation[location] = locationId;
			}
			totalWeight += quantity * weightinlb;
		}
		// Set Total Weight
		currentRecord.setValue({
			fieldId: 'custbody_total_weight',
			value: totalWeight
		});
		var htmlTableTotalWeight = '';
		for (var key in tableTotalWeight) {
			var tplRow = document.getElementById('tplTableTotalWeight').innerHTML;
			htmlTableTotalWeight += tplRow
				.replaceAll('____ID___', mapLocation[key])
				.replaceAll('____LOCATIN___', key)
				.replaceAll('____TOTAL_WEIGHT___', tableTotalWeight[key]);
		}
		document.querySelector('#tableTotalWeight tbody').innerHTML = htmlTableTotalWeight;

		document.querySelector('#tblTotalWeight').innerHTML = totalWeight;

		// Callback
		if (done) {
			done();
		}
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
	 * Load CSS from Text
	 * @param {*} str
	 */
	function loadCSSText(str) {
		var fileref = document.createElement('style');
		fileref.innerHTML = str;
		document.head.appendChild(fileref);
	}

	/**
	 * Init Modal
	 * @param {*} str
	 */
	function initModal() {
		var div = document.createElement('div');
		div.className = 'modal micromodal-slide';
		div.id = 'modal-shipping-method';
		div.setAttribute('aria-hidden', 'true');
		var modalHTML = '<div class="modal__overlay" tabindex="-1" data-micromodal-close>';
		modalHTML +=
			'<div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-shipping-method-title">';
		modalHTML += '<header class="modal__header">';
		modalHTML += '<h2 class="modal__title" id="modal-shipping-method-title">';
		modalHTML += 'Shipping Method: <span>R+L Carriers</span>';
		modalHTML += '</h2>';
		modalHTML +=
			'<button class="modal__close" aria-label="Close modal" data-micromodal-close></button>';
		modalHTML += '</header>';
		modalHTML += '<main class="modal__content" id="modal-shipping-method-content">';
		modalHTML += '<div class="lds-ripple"><div></div><div></div></div>';
		modalHTML += '</main>';
		modalHTML += '</div>';
		modalHTML += '</div>';

		div.innerHTML = modalHTML;
		document.body.appendChild(div);
	}

	/**
	 * Open Modal
	 */
	function openModal(currentRecord) {
		var btnCal = document.querySelectorAll('#btnOpenShippingModal');
		for (var i = 0; i < btnCal.length; i++) {
			btnCal[i].addEventListener('click', function(event) {
				const id = this.getAttribute('data-id');
				const shippingMethodEl = document.getElementById('shippingMethod-' + id);
				const totalWeightEl = document.getElementById('totalWeight-' + id);
				const shippingMethod = shippingMethodEl.options[shippingMethodEl.selectedIndex].text;
				document.querySelector('#modal-shipping-method-title span').innerHTML = shippingMethod;
				MicroModal.show('modal-shipping-method', {
					disableScroll: true,
					closeTrigger: 'data-micromodal-close',
					awaitCloseAnimation: true,
					onShow: function(modal) {
						if (id !== '0') {
							search.lookupFields
								.promise({
									type: search.Type.LOCATION,
									id: id,
									columns: ['city', 'country', 'zip', 'state']
								})
								.then(function(originAddress) {
									const shippingMethodId = shippingMethodEl.value;
									const customerShipping = getCustomer(currentRecord);
									const totalWeight = totalWeightEl.getAttribute('data-total-weight');
									// Set countryCode
									if (originAddress.country === 'US') {
										originAddress.countryCode = 'USA';
									} else if (originAddress.country === 'CA') {
										originAddress.countryCode = 'CAN';
									}
									if (shippingMethodId === 'rlcarriers') {
										document.querySelector(
											'#modal-shipping-method-content'
										).innerHTML = buildFormRLCarriers(originAddress, customerShipping, totalWeight);
										document.getElementById('btnCalculate').addEventListener('click', function() {
											const classShip = document.getElementById('selectClass').value;
											getFreightRate(originAddress, customerShipping, classShip, totalWeight, id);
										});
									} else {
										document.querySelector('#modal-shipping-method-content').innerHTML =
											'<p>This shipping method not available.</p>';
									}
								});
						} else {
							document.querySelector('#modal-shipping-method-content').innerHTML =
								'<p>This location not available.</p>';
						}
					},
					onClose: function(modal) {
						document.querySelector('#modal-shipping-method-content').innerHTML =
							'<div class="lds-ripple"><div></div><div></div></div>';
					}
				});
			});
		}
	}

	/**
	 * Get Customer Address
	 * @param {*} currentRecord
	 */
	function getCustomer(currentRecord) {
		const result = {};
		result.country = currentRecord.getValue('shipcountry');
		result.city = nlapiGetFieldValue('shipcity');
		result.state = currentRecord.getValue('shipstate');
		result.zip = currentRecord.getValue('shipzip');
		if (result.country === 'US') {
			result.countryCode = 'USA';
		} else if (result.country === 'CA') {
			result.countryCode = 'CAN';
		}

		return result;
	}

	/**
	 * Build Payload Shipping Method http://www.rlcarriers.com/
	 */
	function requestPayload(origin, destination, classItem, weight) {
		var payload =
			'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rlc="http://www.rlcarriers.com/">';
		payload += '<soapenv:Header/>';
		payload += '<soapenv:Body>';
		payload += '    <rlc:GetRateQuote>';
		payload += '        <rlc:APIKey>***REMOVED***</rlc:APIKey>';
		payload += '            <rlc:request>';
		payload += '                <rlc:QuoteType>Domestic</rlc:QuoteType>';
		payload += '                <rlc:CODAmount>0</rlc:CODAmount>';
		payload += '                <rlc:Origin>';
		payload += '                    <rlc:City>' + origin.city + '</rlc:City>';
		payload +=
			'                    <rlc:StateOrProvince>' + origin.state + '</rlc:StateOrProvince>';
		payload += '                    <rlc:ZipOrPostalCode>' + origin.zip + '</rlc:ZipOrPostalCode>';
		payload += '                    <rlc:CountryCode>' + origin.countryCode + '</rlc:CountryCode>';
		payload += '                </rlc:Origin>';
		payload += '                <rlc:Destination>';
		payload += '                    <rlc:City>' + destination.city + '</rlc:City>';
		payload +=
			'                    <rlc:StateOrProvince>' + destination.state + '</rlc:StateOrProvince>';
		payload +=
			'                    <rlc:ZipOrPostalCode>' + destination.zip + '</rlc:ZipOrPostalCode>';
		payload +=
			'                    <rlc:CountryCode>' + destination.countryCode + '</rlc:CountryCode>';
		payload += '                </rlc:Destination>';
		payload += '                <rlc:Items>';
		payload += '                    <rlc:Item>';
		payload += '                        <rlc:Class>' + classItem + '</rlc:Class>';
		payload += '                        <rlc:Weight>' + weight + '</rlc:Weight>';
		payload += '                        <rlc:Width>0</rlc:Width>';
		payload += '                        <rlc:Height>0</rlc:Height>';
		payload += '                        <rlc:Length>0</rlc:Length>';
		payload += '                    </rlc:Item>';
		payload += '                </rlc:Items>';
		payload += '                <rlc:DeclaredValue>0</rlc:DeclaredValue>';
		payload += '                <rlc:Accessorials></rlc:Accessorials>';
		payload += '                <rlc:OverDimensionList></rlc:OverDimensionList>';
		payload += '                <rlc:Pallets></rlc:Pallets>';
		payload += '            </rlc:request>';
		payload += '        </rlc:GetRateQuote>';
		payload += '    </soapenv:Body>';
		payload += '</soapenv:Envelope>';
		return payload;
	}

	/**
	 * get Freight Rate
	 * @param {*} origin
	 * @param {*} destination
	 * @param {*} classItem
	 * @param {*} weight
	 */
	function getFreightRate(origin, destination, classItem, weight, id) {
		MicroModal.close('modal-shipping-method');
		const payload = requestPayload(origin, destination, classItem, weight);
		try {
			var res = https.post({
				url: 'https://api.rlcarriers.com/1.0.3/RateQuoteService.asmx',
				body: payload,
				headers: { 'Content-Type': 'text/xml; charset=UTF-8' }
			});
			if (res.code === 200) {
				var responseJSON = res.body;
				responseJSON = nlapiStringToXML(responseJSON);
				responseJSON = xmlToJson(responseJSON);
				var envelope = responseJSON['soap:Envelope'];
				var body = envelope['soap:Body'];

				var rateRequestResultSuccess =
					body.GetRateQuoteResponse.GetRateQuoteResult.WasSuccess['#text'];
				if (rateRequestResultSuccess == 'true') {
					var rateResultServiceLevels =
						body.GetRateQuoteResponse.GetRateQuoteResult.Result.ServiceLevels.ServiceLevel;
					var rate = 0;
					if (rateResultServiceLevels.length > 0) {
						for (i = 0; i < rateResultServiceLevels.length; i++) {
							var code = rateResultServiceLevels[i].Code['#text'];
							if (code == 'STD') {
								var NetCharge = rateResultServiceLevels[i].NetCharge['#text'].replace('$', '');
								rate = parseFloat(NetCharge);
								break;
							}
						}
					} else {
						var code = rateResultServiceLevels.Code['#text'];
						if (code == 'STD') {
							var NetCharge = rateResultServiceLevels.NetCharge['#text'].replace('$', '');
							rate = parseFloat(NetCharge);
						}
					}

					document.getElementById('freightRate-' + id).innerHTML = rate;
				}
			} else {
				document.querySelector('#modal-shipping-method-content').innerHTML =
					'<p>Something wrong with your payload or API.</p>';
			}
		} catch (error) {
			document.querySelector('#modal-shipping-method-content').innerHTML =
				'<p>Something wrong with your payload or API.</p>';
		}
	}

	/**
	 * Build Form R+L Carriers
	 */
	function buildFormRLCarriers(origin, destination, weight) {
		var result = '<div class="main-shipping-method">';
		var result = '<div class="row-shipping-method">';
		result += '<div class="column-shipping-method">';
		result += '<h3>Origin:</h3>';
		result += '<p>City: ' + origin.city + '</p>';
		result += '<p>State: ' + origin.state + '</p>';
		result += '<p>ZipCode: ' + origin.zip + '</p>';
		result += '<p>Country: ' + origin.countryCode + '</p>';
		result += '</div>';
		result += '<div class="column-shipping-method">';
		result += '<h3>Destination:</h3>';
		result += '<p>City: ' + destination.city + '</p>';
		result += '<p>State: ' + destination.state + '</p>';
		result += '<p>ZipCode: ' + destination.zip + '</p>';
		result += '<p>Country: ' + destination.countryCode + '</p>';
		result += '</div>';
		result += '</div>';
		result += '<hr>';
		result += '<h3>Class:</h3>';
		result += '<p><select id="selectClass" style="width: 100%;">';
		result +=
			'<option value="50.0">50.0</option><option value="55.0">55.0</option><option value="60.0">60.0</option><option value="65.0">65.0</option><option value="70.0">70.0</option><option value="77.5">77.5</option><option value="85.0">85.0</option><option value="92.5">92.5</option><option value="100.0">100.0</option><option value="110.0">110.0</option><option value="125.0">125.0</option><option value="150.0">150.0</option><option value="175.0">175.0</option><option value="200.0">200.0</option><option value="250.0">250.0</option><option value="300.0">300.0</option><option value="400.0">400.0</option><option value="500.0">500.0</option>';
		result += '</select></p>';
		result += '<h3>Total Weight: </h3>';
		result += '<input type="text" style="width: 100%;" value="' + weight + '" disabled/>';
		result += '</div>';
		result += '<footer class="modal__footer">';
		result += '<button class="modal__btn modal__btn-primary" id="btnCalculate">Calculate</button>';
		result +=
			'&nbsp;&nbsp;<button class="modal__btn" data-micromodal-close aria-label="Close this dialog window">Close</button>';
		result += '</footer>';

		return result;
	}

	/**
	 * XML TO Json
	 * @param {*} xml
	 */
	function xmlToJson(xml) {
		// Create the return object
		var obj = {};

		if (xml.nodeType == 1) {
			// element
			// do attributes
			if (xml.attributes.length > 0) {
				obj['@attributes'] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) {
			// text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for (var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof obj[nodeName] == 'undefined') {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof obj[nodeName].push == 'undefined') {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}
		return obj;
	}

	/**
	 * Export Events
	 */
	var exports = {};
	exports.pageInit = pageInit;
	exports.sublistChanged = sublistChanged;
	exports.validateLine = validateLine;
	exports.fieldChanged = fieldChanged;
	return exports;
});
