/**
 * Shipping Rates Module
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define([
	'N/runtime',
	'N/https',
	'N/url',
	'/SuiteScripts/lib/micromodal.min',
	'/SuiteScripts/Module/parseTable'
], function(runtime, https, url, MicroModal, parser) {
	/* === VARS === */
	//MODEL, MODEL: Lexor, MODEL: PSD
	const CLASSES_DISCOUNT = ['44', '45', '46'];

	//Shipping Discount By Manager
	const SD_BY_SALES_MANAGER = 100; //%
	const SD_BY_SALES_DIRECTOR = 100; //%

	const UPS_SERVICES = {
		// domestic
		'03': 'UPS Ground',
		'12': 'UPS 3 Day Select',
		'02': 'UPS 2nd Day Air',
		'59': 'UPS 2nd Day Air A.M.',
		'13': 'UPS Next Day Air Saver',
		'01': 'UPS Next Day Air',
		'14': 'UPS Next Day Air Early'
	};

	const SHIPPING_TYPES = {
		'-1': '',
		// domestic
		'03': 'UPS Ground',
		'12': 'UPS 3 Day Select',
		'02': 'UPS 2nd Day Air',
		'59': 'UPS 2nd Day Air A.M.',
		'13': 'UPS Next Day Air Saver',
		'01': 'UPS Next Day Air',
		'14': 'UPS Next Day Air Early'
	};

	const MAP_SHIPPING_METHODS = {
		INTERNATIONAL: 4757,
		RL_CARRIERS: 18,
		LEXOR_TRUCK: 4755,
		OCEAN_SERVICE: 4756,
		UPS_PACKAGE_02: 4761,
		UPS_PACKAGE_59: 4760,
		UPS_PACKAGE_12: 4759,
		UPS_PACKAGE_03: 4758,
		UPS_PACKAGE_01: 4764,
		UPS_PACKAGE_14: 4763,
		UPS_PACKAGE_13: 4762,
		WILL_CALL: 4754
	};

	/**
	 * pageInit EVENT
	 * init Data and UI for Shipping Method Module
	 * @param {*} currentRecord
	 */
	function pageInit(currentRecord) {
		removeButtonCalc();
		buildTableTotalWeight(currentRecord, function() {
			loadData(currentRecord);
			bindingSelectShippingMethodEvents(currentRecord);
			openModal(currentRecord);
		});
		// Intergrate Shipping Services
		loadCSSText(
			'.modal{font-family:-apple-system,BlinkMacSystemFont,avenir next,avenir,helvetica neue,helvetica,ubuntu,roboto,noto,segoe ui,arial,sans-serif}.modal__overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:flex;justify-content:center;align-items:center;z-index:1000}.modal__container{background-color:#fff;padding:30px;max-width:500px;max-height:100vh;border-radius:4px;overflow-y:auto;box-sizing:border-box}.modal__header{display:flex;justify-content:space-between;align-items:center}.modal__title{margin-top:0;margin-bottom:0;font-weight:600;font-size:1.25rem;line-height:1.25;color:#00449e;box-sizing:border-box}.modal__close{background:0 0;border:0}.modal__header .modal__close:before{content:"\\2715"}.modal__content{margin-top:2rem;line-height:1.5;color:rgba(0,0,0,.8)}.modal__btn{font-size:.875rem;padding-left:1rem;padding-right:1rem;padding-top:.5rem;padding-bottom:.5rem;background-color:#e6e6e6;color:rgba(0,0,0,.8);border-radius:.25rem;border-style:none;border-width:0;cursor:pointer;-webkit-appearance:button;text-transform:none;overflow:visible;line-height:1.15;margin:0;will-change:transform;-moz-osx-font-smoothing:grayscale;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-transform:translateZ(0);transform:translateZ(0);transition:-webkit-transform .25s ease-out;transition:transform .25s ease-out;transition:transform .25s ease-out,-webkit-transform .25s ease-out}.modal__btn:focus,.modal__btn:hover{-webkit-transform:scale(1.05);transform:scale(1.05)}.modal__btn-primary{background-color:#00449e;color:#fff}@keyframes mmfadeIn{from{opacity:0}to{opacity:1}}@keyframes mmfadeOut{from{opacity:1}to{opacity:0}}@keyframes mmslideIn{from{transform:translateY(15%)}to{transform:translateY(0)}}@keyframes mmslideOut{from{transform:translateY(0)}to{transform:translateY(-10%)}}.micromodal-slide{display:none}.micromodal-slide.is-open{display:block}.micromodal-slide[aria-hidden=false] .modal__overlay{animation:mmfadeIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=false] .modal__container{animation:mmslideIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__overlay{animation:mmfadeOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__container{animation:mmslideOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide .modal__container,.micromodal-slide .modal__overlay{will-change:transform}.modal__footer{margin-top: 2rem;}'
		);
		loadCSSText(
			'.lds-ripple{display:inline-block;position:relative;width:64px;height:64px;display: block;margin-left: auto;margin-right: auto;}.lds-ripple div{position:absolute;border:4px solid #000008;opacity:1;border-radius:50%;animation:lds-ripple 1s cubic-bezier(0,.2,.8,1) infinite}.lds-ripple div:nth-child(2){animation-delay:-.5s}@keyframes lds-ripple{0%{top:28px;left:28px;width:0;height:0;opacity:1}100%{top:-1px;left:-1px;width:58px;height:58px;opacity:0}}.row-shipping-method {display: flex;}.column-shipping-method {flex: 50%;}'
		);
		initModal();
	}

	/**
	 * sublistChanged EVENT
	 * @param {*} currentRecord
	 */
	function sublistChanged(currentRecord) {
		buildTableTotalWeight(currentRecord, function() {
			bindingSelectShippingMethodEvents(currentRecord);
			openModal(currentRecord);
		});
		document.getElementById('tblFreightRate').innerHTML = 0;
		currentRecord.setValue({
			fieldId: 'custbodytotal_freight_rate',
			value: ''
		});
		currentRecord.setValue({
			fieldId: 'shipmethod',
			value: 4494
		});
		document.getElementById('tblShippingDiscount').innerHTML = 0;
		currentRecord.setValue({
			fieldId: 'custbody_shipping_discount',
			value: 0
		});
		currentRecord.setValue({
			fieldId: 'custbodyshipping_discount_by_manager',
			value: 0
		});
		saveData(currentRecord);
	}

	/**
	 * fieldChanged Event
	 * @param {*} context
	 */
	function fieldChanged(context) {
		const fieldId = context.fieldId;
		const sublistId = context.sublistId;
		const currentRecord = context.currentRecord;
		// Min Max custbodyshipping_discount_by_manager
		if (sublistId === null && fieldId === 'custbodyshipping_discount_by_manager') {
			try {
				var discount = 0;
				var discountByManagerValue = currentRecord.getValue({
					fieldId: 'custbodyshipping_discount_by_manager'
				});
				var dataObj = getTableWeightDataJSON(currentRecord);
				if (dataObj) {
					var totalFreightRate = dataObj
						? dataObj.reduce(function(a, b) {
								return (
									(!isNaN(typeof a === 'number' ? a : a.FREIGHT_RATE)
										? parseFloat(typeof a === 'number' ? a : a.FREIGHT_RATE)
										: 0) +
									(!isNaN(typeof b === 'number' ? b : b.FREIGHT_RATE)
										? parseFloat(typeof b === 'number' ? b : b.FREIGHT_RATE)
										: 0)
								);
						  }, 0)
						: 0;
					totalFreightRate = isNaN(totalFreightRate) ? 0 : totalFreightRate;
					var totalDiscount = dataObj
						? dataObj.reduce(function(a, b) {
								return (
									(!isNaN(typeof a === 'number' ? a : a.DISCOUNT)
										? parseFloat(typeof a === 'number' ? a : a.DISCOUNT)
										: 0) +
									(!isNaN(typeof b === 'number' ? b : b.DISCOUNT)
										? parseFloat(typeof b === 'number' ? b : b.DISCOUNT)
										: 0)
								);
						  }, 0)
						: 0;
					totalDiscount = isNaN(totalDiscount) ? 0 : totalDiscount;

					var currentUser = runtime.getCurrentUser();
					const role = currentUser.role;
					// 3 Administrator
					// 1069	Lexor | Sales Director
					// 1037	Lexor | Sales Manager
					if (role === 3 || role === 1069) {
						var min = 0;
						var max =
							(parseFloat(totalFreightRate) - parseFloat(totalDiscount)) *
							(SD_BY_SALES_DIRECTOR / 100);
						if (max >= 0) {
							discount = parseFloat(Math.min(max, Math.max(min, discountByManagerValue))).toFixed(
								2
							);
							if (
								!isNaN(discountByManagerValue) &&
								(parseFloat(discountByManagerValue) < min ||
									parseFloat(discountByManagerValue) > max)
							) {
								alert('Value must be less than or equal to ' + parseFloat(max).toFixed(2) + '.');
							}
						}
					} else {
						var min = 0;
						var max =
							(parseFloat(totalFreightRate) - parseFloat(totalDiscount)) *
							(SD_BY_SALES_MANAGER / 100);
						if (max >= 0) {
							discount = parseFloat(Math.min(max, Math.max(min, discountByManagerValue))).toFixed(
								2
							);
							if (
								!isNaN(discountByManagerValue) &&
								(parseFloat(discountByManagerValue) < min ||
									parseFloat(discountByManagerValue) > max)
							) {
								alert('Value must be less than or equal to ' + parseFloat(max).toFixed(2) + '.');
							}
						}
					}
				}
				currentRecord.setValue({
					fieldId: 'custbodyshipping_discount_by_manager',
					value: discount,
					ignoreFieldChange: true
				});
			} catch (error) {
				currentRecord.setValue({
					fieldId: 'custbodyshipping_discount_by_manager',
					value: 0,
					ignoreFieldChange: true
				});
			}
			// Update Shipping Cost
			updateShippingCost(currentRecord);
		}
	}

	/** HELPPER FUNCTIONS **/

	/**
	 * Get data JSON
	 * @param {*} currentRecord
	 */
	function getTableWeightDataJSON(currentRecord) {
		const dataJSON = currentRecord.getValue({
			fieldId: 'custbody_table_total_weight_data'
		});
		var dataObj = false;
		try {
			dataObj = JSON.parse(dataJSON);
		} catch (error) {}
		return dataObj;
	}

	/**
	 * Build HTML Table Total Weight
	 * @param {*} currentRecord
	 */
	function buildTableTotalWeight(currentRecord, done) {
		// Add Util Function Replace All
		String.prototype.replaceAll = function(search, replacement) {
			return this.split(search).join(replacement);
		};

		// Default Location
		const defaultLocation = currentRecord.getValue({
			fieldId: 'location'
		});

		const totalLine = currentRecord.getLineCount({ sublistId: 'item' });
		var tableTotalWeight = {};
		var mapLocation = {};
		var mapDiscount = {};
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
			// class
			const custcol_item_class = currentRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_item_class',
				line: index
			});
			if (location === '') {
				if (tableTotalWeight['None'] === undefined) {
					tableTotalWeight['None'] = 0;
					mapDiscount['None'] = false;
				}
				tableTotalWeight['None'] = tableTotalWeight['None'] + quantity * weightinlb;
				mapLocation['None'] = 0;

				// Check Discount
				if (CLASSES_DISCOUNT.includes(custcol_item_class) && locationId == defaultLocation) {
					mapDiscount['None'] = true;
				}
			} else {
				if (tableTotalWeight[location] === undefined) {
					tableTotalWeight[location] = 0;
					mapDiscount[location] = false;
				}
				tableTotalWeight[location] = tableTotalWeight[location] + quantity * weightinlb;
				mapLocation[location] = locationId;

				// Check Discount
				if (CLASSES_DISCOUNT.includes(custcol_item_class) && locationId == defaultLocation) {
					mapDiscount[location] = true;
				}
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
			var trTable = tplRow
				.replaceAll('____ID___', mapLocation[key])
				.replaceAll('____LOCATIN___', key)
				.replaceAll('____TOTAL_WEIGHT___', tableTotalWeight[key])
				.replaceAll('____DISCOUNT___', mapDiscount[key]);
			// https://trello.com/c/THc0RaMT/176-update-shipping-table
			// Ocean Service, International only selected by Processing , admin and sale director.
			// 1086	Lexor | Processing
			// 1069	Lexor | Sales Director
			// 3 Administrator
			var currentUser = runtime.getCurrentUser();
			const role = currentUser.role;
			if (role === 3 || role === 1069 || role === 1086) {
				var htmlOptions =
					'<option value="OCEAN_SERVICE">Ocean Service</option><option value="INTERNATIONAL">International</option>';
				trTable = trTable.replaceAll('____DYNAMIC_OPTIONS____', htmlOptions);
			} else {
				trTable = trTable.replaceAll('____DYNAMIC_OPTIONS____', '');
			}
			htmlTableTotalWeight += trTable;
		}
		document.querySelector('#tableTotalWeight tbody').innerHTML = htmlTableTotalWeight;

		// https://trello.com/c/B7lzZDNw/181-no-none-location-for-get-shipping-fee
		// set no calculate button in none location line
		if (document.querySelector('button[data-id="0"]')) {
			document.querySelector('button[data-id="0"]').style.display = 'none';
		}
		document.querySelector('#tblTotalWeight').innerHTML = totalWeight;

		// Callback
		if (done) {
			done();
		}
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
		div.innerHTML =
			'<div class="modal__overlay" tabindex="-1" data-micromodal-close><div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-shipping-method-title"><header class="modal__header"><h2 class="modal__title" id="modal-shipping-method-title">Shipping Method: <span>LTL</span></h2><button class="modal__close" aria-label="Close modal" data-micromodal-close></button></header><main class="modal__content" id="modal-shipping-method-content"><div class="lds-ripple"><div></div><div></div></div></main></div></div>';
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
				const shippingMethodId = shippingMethodEl.value;
				const customerShipping = getCustomer(currentRecord);
				const totalWeightEl = document.getElementById('totalWeight-' + id);
				const totalWeight = totalWeightEl.getAttribute('data-total-weight');
				const shippingMethod = shippingMethodEl.options[shippingMethodEl.selectedIndex].text;

				// Route Shipping Method
				switch (shippingMethodId) {
					case 'ODFL':
						if (id !== '0') {
							showMicroModal(shippingMethod, false);
							setTimeout(function() {
								const freightRate = getFreightRateODFL(id, customerShipping, totalWeight);
								updateUI(id, freightRate, '-1', currentRecord, function() {
									MicroModal.close('modal-shipping-method');
								});
							}, 400);
						} else {
							showMicroModal(shippingMethod, function(modal) {
								document.querySelector('#modal-shipping-method-content').innerHTML =
									'<p>This location not available.</p>';
							});
							updateUI(id, '', '-1', currentRecord);
						}
						break;
					case 'RL_CARRIERS':
						if (id !== '0') {
							showMicroModal(shippingMethod, false);
							setTimeout(function() {
								const dataObj = getFreightRateRLC(id, customerShipping, totalWeight);
								if (dataObj) {
									if (dataObj.success) {
										if (parseInt(dataObj.freightRate) != 0) {
											updateUI(id, dataObj.freightRate, '-1', currentRecord, function() {
												MicroModal.close('modal-shipping-method');
											});
										} else {
											updateUI(id, '', '-1', currentRecord);
										}
									} else {
										document.querySelector('#modal-shipping-method-content').innerHTML =
											'<p>' + dataObj.message + '</p>';
									}
								} else {
									document.querySelector('#modal-shipping-method-content').innerHTML =
										'<p>Something went wrong. Please try again!</p>';
								}
							}, 400);
						} else {
							showMicroModal(shippingMethod, function(modal) {
								document.querySelector('#modal-shipping-method-content').innerHTML =
									'<p>This location not available.</p>';
							});
							updateUI(id, '', '-1', currentRecord);
						}

						break;
					case 'UPS_PACKAGE':
						if (id !== '0') {
							showMicroModal(shippingMethod, false);
							setTimeout(function() {
								const dataObj = getFreightRateUPSPackage(id, customerShipping, totalWeight);
								if (dataObj) {
									if (dataObj.success) {
										const htmlUPSServices = buildUPSPackageServices(dataObj.data);
										document.querySelector(
											'#modal-shipping-method-content'
										).innerHTML = htmlUPSServices;
										bindingUPSPackageServices(id, currentRecord);
									} else {
										document.querySelector('#modal-shipping-method-content').innerHTML =
											'<p>' + dataObj.message + '</p>';
									}
								} else {
									document.querySelector('#modal-shipping-method-content').innerHTML =
										'<p>Something went wrong. Please try again!</p>';
								}
							}, 400);
						} else {
							showMicroModal(shippingMethod, function(modal) {
								document.querySelector('#modal-shipping-method-content').innerHTML =
									'<p>This location not available.</p>';
							});
							updateUI(id, '', '-1', currentRecord);
						}
						break;
					case 'LEXOR_TRUCK':
						if (id !== '0') {
							updateUI(id, 100, '-1', currentRecord);
						} else {
							showMicroModal(shippingMethod, function(modal) {
								document.querySelector('#modal-shipping-method-content').innerHTML =
									'<p>This location not available.</p>';
							});
							updateUI(id, '', '-1', currentRecord);
						}
						break;
					default:
						if (id !== '0') {
							updateUI(id, 0, '-1', currentRecord);
						} else {
							showMicroModal(shippingMethod, function(modal) {
								document.querySelector('#modal-shipping-method-content').innerHTML =
									'<p>This location not available.</p>';
							});
							updateUI(id, '', '-1', currentRecord);
						}
						break;
				}
			});
		}
	}

	/**
	 * Binding Select Shipping Method Events
	 * @param {*} currentRecord
	 */
	function bindingSelectShippingMethodEvents(currentRecord) {
		var selectShippingMethod = document.querySelectorAll('#tableTotalWeight .shippingMethod');
		for (var i = 0; i < selectShippingMethod.length; i++) {
			selectShippingMethod[i].addEventListener('change', function(event) {
				const id = this.getAttribute('data-id');
				updateUI(id, '', '-1', currentRecord);
			});
		}
	}

	/**
	 * Get Customer Address
	 * @param {*} currentRecord
	 */
	function getCustomer(currentRecord) {
		const result = {};
		result.addr1 = nlapiGetFieldValue('shipaddr2');
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
	 * get Freight Rate R+L Carriers
	 * @param {*} id
	 * @param {*} destination
	 * @param {*} weight
	 */
	function getFreightRateRLC(id, customerShipping, weight) {
		try {
			var result = {
				success: false,
				freightRate: 0,
				message: '<p>Something went wrong. Please try again!</p>'
			};
			const odflWSURL = url.resolveScript({
				scriptId: 'customscript_rl_carriers_ws_rl',
				deploymentId: 'customdeploy_rl_carriers_ws_rl'
			});
			var res = https.post({
				url: odflWSURL,
				body: {
					locationId: id,
					customer: customerShipping,
					weight: weight
				},
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.code === 200) {
				var resObj = JSON.parse(JSON.parse(res.body));
				if (resObj.success) {
					result.freightRate = parseFloat(resObj.data.freightRate).toFixed(2);
					result.success = true;
					result.message = 'Success';
				} else {
					result.message = resObj.message;
				}
			}
			return result;
		} catch (error) {}
		return false;
	}

	/**
	 * get Freight Rate ODFL
	 * @param {*} id
	 * @param {*} customerShipping
	 * @param {*} weight
	 */
	function getFreightRateODFL(id, customerShipping, weight) {
		var result = 0;
		const odflWSURL = url.resolveScript({
			scriptId: 'customscript_odfl_ws_rl',
			deploymentId: 'customdeploy_odfl_ws_rl'
		});
		var res = https.post({
			url: odflWSURL,
			body: {
				locationId: id,
				customer: customerShipping,
				weight: weight
			},
			headers: { 'Content-Type': 'application/json' }
		});
		if (res.code === 200) {
			var resObj = JSON.parse(JSON.parse(res.body));
			if (resObj.success) {
				result = parseFloat(resObj.data.freightRate).toFixed(2);
			}
		}

		return result;
	}

	/**
	 *
	 * @param {*} id
	 * @param {*} customerShipping
	 * @param {*} weight
	 */
	function getFreightRateUPSPackage(id, customerShipping, weight) {
		try {
			const odflWSURL = url.resolveScript({
				scriptId: 'customscript_ups_package_ws_rl',
				deploymentId: 'customdeploy_ups_package_ws_rl'
			});
			var res = https.post({
				url: odflWSURL,
				body: {
					locationId: id,
					customer: customerShipping,
					weight: weight
				},
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.code === 200) {
				var resObj = JSON.parse(JSON.parse(res.body));
				return resObj;
			}
		} catch (error) {}
		return false;
	}

	/**
	 * Update UI
	 */
	function updateUI(id, freightRate, shippingType, currentRecord, done) {
		// Freight Rate Column
		updateFreightRate(id, freightRate, currentRecord);
		// Update Discount
		updateDiscount(id, freightRate, currentRecord);
		// Shipping Type
		updateShippingType(id, shippingType, currentRecord);
		//custbodyshipping_discount_by_manager
		currentRecord.setValue({
			fieldId: 'custbodyshipping_discount_by_manager',
			value: 0
		});

		updateShippingCost(currentRecord);

		// Save data to JSON
		saveData(currentRecord);

		if (done) {
			done();
		}
	}

	/**
	 * Update shipping cost
	 * Set check shipping cost = total freight rate - shipping discount - shipping discount by manager (sale Order and Quote )
	 * @param {*} currentRecord
	 */
	function updateShippingCost(currentRecord) {
		// custbodytotal_freight_rate
		var freightRate = currentRecord.getValue({
			fieldId: 'custbodytotal_freight_rate'
		});
		// custbody_shipping_discount
		var shippingDiscount = currentRecord.getValue({
			fieldId: 'custbody_shipping_discount'
		});
		// custbodyshipping_discount_by_manager
		var discountByManagerValue = currentRecord.getValue({
			fieldId: 'custbodyshipping_discount_by_manager'
		});

		// shippingcost
		currentRecord.setValue({
			fieldId: 'shippingcost',
			value: parseFloat(freightRate - shippingDiscount - discountByManagerValue).toFixed(2)
		});
	}

	/**
	 * Update Freight Rate
	 * @param {*} currentRecord
	 */
	function updateFreightRate(id, freightRate, currentRecord) {
		document.getElementById('freightRate-' + id).innerHTML = freightRate;
		document.getElementById('freightRate-' + id).setAttribute('data-freight-rate', freightRate);

		// Update Total
		const freightRateRows = document.querySelectorAll('#tableTotalWeight .freightRate');
		var isDone = true;
		const arrayfreightRateRows = Array.prototype.map.call(freightRateRows, function(n) {
			var freightRate = parseFloat(n.getAttribute('data-freight-rate').trim());
			if (isNaN(freightRate)) {
				isDone = false;
			}
			return !isNaN(freightRate) ? freightRate : 0;
		});
		const totalFreightRate = arrayfreightRateRows.reduce(function(a, b) {
			return a + b;
		}, 0);
		document.getElementById('tblFreightRate').innerHTML = parseFloat(totalFreightRate).toFixed(2);
		currentRecord.setValue({
			fieldId: 'custbodytotal_freight_rate',
			value: isDone ? parseFloat(totalFreightRate).toFixed(2) : ''
		});
	}

	/**
	 * Update Discount
	 * @param {*} id
	 * @param {*} freightRate
	 * @param {*} currentRecord
	 */
	function updateDiscount(id, freightRate, currentRecord) {
		const discountEl = document.getElementById('shippingDiscount-' + id);
		const isDiscount = discountEl.getAttribute('data-discount');
		if (isDiscount == 'true') {
			document.getElementById('shippingDiscount-' + id).innerHTML = freightRate;
			document
				.getElementById('shippingDiscount-' + id)
				.setAttribute('data-shipping-discount', freightRate);

			// Update Total
			const shippingDiscountRows = document.querySelectorAll('#tableTotalWeight .shippingDiscount');
			var isDone = true;
			const arrayshippingDiscountRows = Array.prototype.map.call(shippingDiscountRows, function(n) {
				var shippingDiscount = parseFloat(n.getAttribute('data-shipping-discount').trim());
				if (isNaN(shippingDiscount)) {
					isDone = false;
				}
				return !isNaN(shippingDiscount) ? shippingDiscount : 0;
			});
			const totalShippingDiscount = arrayshippingDiscountRows.reduce(function(a, b) {
				return a + b;
			}, 0);
			document.getElementById('tblShippingDiscount').innerHTML = parseFloat(
				totalShippingDiscount
			).toFixed(2);
			currentRecord.setValue({
				fieldId: 'custbody_shipping_discount',
				value: isDone ? parseFloat(totalShippingDiscount).toFixed(2) : ''
			});
		}
	}

	/**
	 * Update Shipping Type
	 */
	function updateShippingType(id, shippingType, currentRecord) {
		document.getElementById('shippingType-' + id).innerHTML =
			SHIPPING_TYPES[shippingType] === undefined ? '' : SHIPPING_TYPES[shippingType];
		document.getElementById('shippingType-' + id).setAttribute('data-shipping-type', shippingType);

		const locationRows = document.querySelectorAll('#tableTotalWeight .location');
		var isOtherShippingMethod = locationRows.length > 1;
		if (locationRows.length === 1) {
			const firstLocation = locationRows[0];
			const firstLocationId = firstLocation.getAttribute('data-location');
			const shippingMethod = document.getElementById('shippingMethod-' + firstLocationId).value;
			if (shippingMethod === 'UPS_PACKAGE') {
				var shippingType = document.getElementById('shippingType-' + firstLocationId);
				var shippingTypeId =
					shippingType !== null ? shippingType.getAttribute('data-shipping-type') : false;
				currentRecord.setValue({
					fieldId: 'shipmethod',
					value:
						shippingTypeId && MAP_SHIPPING_METHODS['UPS_PACKAGE_' + shippingTypeId] !== undefined
							? MAP_SHIPPING_METHODS['UPS_PACKAGE_' + shippingTypeId]
							: 4494
				});
			} else {
				currentRecord.setValue({
					fieldId: 'shipmethod',
					value:
						MAP_SHIPPING_METHODS[shippingMethod] === undefined
							? 4494
							: MAP_SHIPPING_METHODS[shippingMethod]
				});
			}
		} else {
			currentRecord.setValue({
				fieldId: 'shipmethod',
				value: 4494
			});
		}
	}

	/**
	 * Save Data
	 * @param {*} currentRecord
	 */
	function saveData(currentRecord) {
		var attributes = [
			'data-location',
			'data-freight-rate',
			'data-total-weight',
			'data-shipping-type'
		];
		const dataJSON = parser.parseTable(document.getElementById('tableTotalWeight'), attributes);
		currentRecord.setValue({
			fieldId: 'custbody_table_total_weight_data',
			value: JSON.stringify(dataJSON)
		});
	}

	/**
	 * Load data from JSON
	 * @param {*} currentRecord
	 */
	function loadData(currentRecord) {
		const dataJSON = currentRecord.getValue({
			fieldId: 'custbody_table_total_weight_data'
		});
		try {
			const dataObj = JSON.parse(dataJSON);
			for (var index = 0; index < dataObj.length; index++) {
				const element = dataObj[index];
				document.getElementById('shippingMethod-' + element.LOCATION).value =
					element.SHIPPING_METHOD;
				updateUI(
					element.LOCATION,
					element.FREIGHT_RATE,
					element.hasOwnProperty('SHIPPING_TYPE') ? element.SHIPPING_TYPE : '',
					currentRecord,
					false
				);
			}
		} catch (error) {}
	}

	/**
	 * Show Modal
	 * @param {*} title
	 * @param {*} onShow
	 */
	function showMicroModal(title, onShow) {
		document.querySelector('#modal-shipping-method-title span').innerHTML = title;
		MicroModal.show('modal-shipping-method', {
			disableScroll: true,
			closeTrigger: 'data-micromodal-close',
			awaitCloseAnimation: true,
			onShow: onShow ? onShow : function(params) {},
			onClose: function(modal) {
				document.querySelector('#modal-shipping-method-content').innerHTML =
					'<div class="lds-ripple"><div></div><div></div></div>';
			}
		});
	}

	/**
	 * Build UPS Package Services
	 * @param {*} data
	 */
	function buildUPSPackageServices(data) {
		var html = '<div class="ups-package-services">';
		for (var index = 0; index < data.length; index++) {
			var el = data[index];
			html +=
				'<p><input type="radio" data-id="' +
				el.code +
				'" id="upsServices-' +
				el.code +
				'" name="upsServices" value="' +
				el.total +
				'"> <label for="upsServices-' +
				el.code +
				'">' +
				UPS_SERVICES[el.code] +
				' ($' +
				el.total +
				')</label></p>';
		}
		html += '</div>';
		return html;
	}

	/**
	 * Binding Radio Button UPS
	 */
	function bindingUPSPackageServices(id, currentRecord) {
		var UPSPackageServices = document.querySelectorAll('.ups-package-services input[type="radio"]');
		for (var i = 0; i < UPSPackageServices.length; i++) {
			UPSPackageServices[i].addEventListener('change', function(event) {
				const total = this.value;
				const dataId = this.getAttribute('data-id');
				updateUI(id, total, dataId, currentRecord, function() {
					MicroModal.close('modal-shipping-method');
				});
			});
		}
	}

	/**
	 * Remove Button Calc
	 */
	function removeButtonCalc() {
		try {
			document
				.querySelector('#shippingcost_fs a[aria-label="Calculate"]')
				.setAttribute('style', 'display:none !important');
		} catch (error) {}
	}

	/**
	 * Exports
	 */
	return {
		pageInit: pageInit,
		sublistChanged: sublistChanged,
		fieldChanged: fieldChanged
	};
});
