/**
 * Sales Order Form
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @NScriptType ClientScript
 * @author trungpv <trung@lexor.com>
 */
define([
  "N/https",
  "N/url",
  "/SuiteScripts/lib/micromodal.min",
  "/SuiteScripts/Module/parseTable"
], function(https, url, MicroModal, parser) {
  /* === VARS === */
  const UPS_SERVICES = {
    // domestic
    "03": "UPS Ground",
    "12": "UPS 3 Day Select",
    "02": "UPS 2nd Day Air",
    "59": "UPS 2nd Day Air A.M.",
    "13": "UPS Next Day Air Saver",
    "01": "UPS Next Day Air",
    "14": "UPS Next Day Air Early"
  };

  /* === EVENTS FUNCTIONS === */

  /**
   * Page Init
   * @param {*} context
   */
  function pageInit(context) {
    const currentRecord = context.currentRecord;
    try {
      buildTableTotalWeight(currentRecord, function() {
        loadData(currentRecord);
        bindingSelectShippingMethodEvents(currentRecord);
        openModal(currentRecord);
      });

      removeOptionsShipAndBill();

      // Intergrate Shipping Services
      loadCSSText(
        '.modal{font-family:-apple-system,BlinkMacSystemFont,avenir next,avenir,helvetica neue,helvetica,ubuntu,roboto,noto,segoe ui,arial,sans-serif}.modal__overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:flex;justify-content:center;align-items:center;z-index:1000}.modal__container{background-color:#fff;padding:30px;max-width:500px;max-height:100vh;border-radius:4px;overflow-y:auto;box-sizing:border-box}.modal__header{display:flex;justify-content:space-between;align-items:center}.modal__title{margin-top:0;margin-bottom:0;font-weight:600;font-size:1.25rem;line-height:1.25;color:#00449e;box-sizing:border-box}.modal__close{background:0 0;border:0}.modal__header .modal__close:before{content:"\\2715"}.modal__content{margin-top:2rem;line-height:1.5;color:rgba(0,0,0,.8)}.modal__btn{font-size:.875rem;padding-left:1rem;padding-right:1rem;padding-top:.5rem;padding-bottom:.5rem;background-color:#e6e6e6;color:rgba(0,0,0,.8);border-radius:.25rem;border-style:none;border-width:0;cursor:pointer;-webkit-appearance:button;text-transform:none;overflow:visible;line-height:1.15;margin:0;will-change:transform;-moz-osx-font-smoothing:grayscale;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-transform:translateZ(0);transform:translateZ(0);transition:-webkit-transform .25s ease-out;transition:transform .25s ease-out;transition:transform .25s ease-out,-webkit-transform .25s ease-out}.modal__btn:focus,.modal__btn:hover{-webkit-transform:scale(1.05);transform:scale(1.05)}.modal__btn-primary{background-color:#00449e;color:#fff}@keyframes mmfadeIn{from{opacity:0}to{opacity:1}}@keyframes mmfadeOut{from{opacity:1}to{opacity:0}}@keyframes mmslideIn{from{transform:translateY(15%)}to{transform:translateY(0)}}@keyframes mmslideOut{from{transform:translateY(0)}to{transform:translateY(-10%)}}.micromodal-slide{display:none}.micromodal-slide.is-open{display:block}.micromodal-slide[aria-hidden=false] .modal__overlay{animation:mmfadeIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=false] .modal__container{animation:mmslideIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__overlay{animation:mmfadeOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__container{animation:mmslideOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide .modal__container,.micromodal-slide .modal__overlay{will-change:transform}.modal__footer{margin-top: 2rem;}'
      );
      loadCSSText(
        ".lds-ripple{display:inline-block;position:relative;width:64px;height:64px;display: block;margin-left: auto;margin-right: auto;}.lds-ripple div{position:absolute;border:4px solid #000008;opacity:1;border-radius:50%;animation:lds-ripple 1s cubic-bezier(0,.2,.8,1) infinite}.lds-ripple div:nth-child(2){animation-delay:-.5s}@keyframes lds-ripple{0%{top:28px;left:28px;width:0;height:0;opacity:1}100%{top:-1px;left:-1px;width:58px;height:58px;opacity:0}}.row-shipping-method {display: flex;}.column-shipping-method {flex: 50%;}"
      );
      initModal();
    } catch (error) {
      console.log("pageInit Error: ", error);
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
    if (sublistId === "item") {
      try {
        buildTableTotalWeight(currentRecord, function() {
          bindingSelectShippingMethodEvents(currentRecord);
          openModal(currentRecord);
        });
        document.getElementById("tblFreightRate").innerHTML = 0;
        currentRecord.setValue({
          fieldId: "custbodytotal_freight_rate",
          value: ""
        });
      } catch (error) {
        console.log("pageInit Error: ", error);
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
      if (sublistId === "item") {
        const quantity = currentRecord.getCurrentSublistValue({
          sublistId: sublistId,
          fieldId: "quantity"
        });
        const itemWeight = currentRecord.getCurrentSublistValue({
          sublistId: sublistId,
          fieldId: "weightinlb"
        });
        currentRecord.setCurrentSublistValue({
          sublistId: sublistId,
          fieldId: "custcol_total_weight",
          value: quantity * itemWeight
        });
        // class
        const custcol_item_class = currentRecord.getCurrentSublistValue({
          sublistId: sublistId,
          fieldId: "custcol_item_class"
        });
      }
    } catch (error) {
      console.log("validateLine Error: ", error);
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
    if (
      sublistId === null &&
      (fieldId === "shipaddresslist" || fieldId === "billaddresslist")
    ) {
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

    const totalLine = currentRecord.getLineCount({ sublistId: "item" });
    var tableTotalWeight = {};
    var mapLocation = {};
    var totalWeight = 0;
    document.querySelector("#tableTotalWeight tbody").innerHTML = "";
    for (var index = 0; index < totalLine; index++) {
      const quantity = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "quantity",
        line: index
      });
      const weightinlb = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "weightinlb",
        line: index
      });
      const location = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "location_display",
        line: index
      });
      const locationId = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "location",
        line: index
      });
      if (location === "") {
        if (tableTotalWeight["None"] === undefined) {
          tableTotalWeight["None"] = 0;
        }
        tableTotalWeight["None"] =
          tableTotalWeight["None"] + quantity * weightinlb;
        mapLocation["None"] = 0;
      } else {
        if (tableTotalWeight[location] === undefined) {
          tableTotalWeight[location] = 0;
        }
        tableTotalWeight[location] =
          tableTotalWeight[location] + quantity * weightinlb;
        mapLocation[location] = locationId;
      }
      totalWeight += quantity * weightinlb;
    }
    // Set Total Weight
    currentRecord.setValue({
      fieldId: "custbody_total_weight",
      value: totalWeight
    });
    var htmlTableTotalWeight = "";
    for (var key in tableTotalWeight) {
      var tplRow = document.getElementById("tplTableTotalWeight").innerHTML;
      htmlTableTotalWeight += tplRow
        .replaceAll("____ID___", mapLocation[key])
        .replaceAll("____LOCATIN___", key)
        .replaceAll("____TOTAL_WEIGHT___", tableTotalWeight[key]);
    }
    document.querySelector(
      "#tableTotalWeight tbody"
    ).innerHTML = htmlTableTotalWeight;

    document.querySelector("#tblTotalWeight").innerHTML = totalWeight;

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
      typeof ftabs != "undefined" && ftabs[getFieldName(fieldName)] != null
        ? document.forms[ftabs[getFieldName(fieldName)] + "_form"]
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
    removeSelectOption("billaddresslist", "-1");
    removeSelectOption("billaddresslist", "-2");
    // Remove [New, Custom] options shipaddresslist
    removeSelectOption("shipaddresslist", "-1");
    removeSelectOption("shipaddresslist", "-2");

    // Hide Button
    document
      .getElementById("billaddresslist_popup_new")
      .setAttribute("style", "display:none !important");
    document
      .getElementById("billaddresslist_popup_link")
      .setAttribute("style", "display:none !important");
    document
      .getElementById("shipaddresslist_popup_new")
      .setAttribute("style", "display:none !important");
    document
      .getElementById("shipaddresslist_popup_link")
      .setAttribute("style", "display:none !important");
  }

  /**
   * Load CSS from Text
   * @param {*} str
   */
  function loadCSSText(str) {
    var fileref = document.createElement("style");
    fileref.innerHTML = str;
    document.head.appendChild(fileref);
  }

  /**
   * Init Modal
   * @param {*} str
   */
  function initModal() {
    var div = document.createElement("div");
    div.className = "modal micromodal-slide";
    div.id = "modal-shipping-method";
    div.setAttribute("aria-hidden", "true");
    var modalHTML =
      '<div class="modal__overlay" tabindex="-1" data-micromodal-close>';
    modalHTML +=
      '<div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-shipping-method-title">';
    modalHTML += '<header class="modal__header">';
    modalHTML += '<h2 class="modal__title" id="modal-shipping-method-title">';
    modalHTML += "Shipping Method: <span>R+L Carriers</span>";
    modalHTML += "</h2>";
    modalHTML +=
      '<button class="modal__close" aria-label="Close modal" data-micromodal-close></button>';
    modalHTML += "</header>";
    modalHTML +=
      '<main class="modal__content" id="modal-shipping-method-content">';
    modalHTML += '<div class="lds-ripple"><div></div><div></div></div>';
    modalHTML += "</main>";
    modalHTML += "</div>";
    modalHTML += "</div>";

    div.innerHTML = modalHTML;
    document.body.appendChild(div);
  }

  /**
   * Open Modal
   */
  function openModal(currentRecord) {
    var btnCal = document.querySelectorAll("#btnOpenShippingModal");
    for (var i = 0; i < btnCal.length; i++) {
      btnCal[i].addEventListener("click", function(event) {
        const id = this.getAttribute("data-id");
        const shippingMethodEl = document.getElementById(
          "shippingMethod-" + id
        );
        const shippingMethodId = shippingMethodEl.value;
        const customerShipping = getCustomer(currentRecord);
        const totalWeightEl = document.getElementById("totalWeight-" + id);
        const totalWeight = totalWeightEl.getAttribute("data-total-weight");
        const shippingMethod =
          shippingMethodEl.options[shippingMethodEl.selectedIndex].text;

        // Route Shipping Method
        switch (shippingMethodId) {
          case "ODFL":
            if (id !== "0") {
              showMicroModal(shippingMethod, false);
              setTimeout(function() {
                const freightRate = getFreightRateODFL(
                  id,
                  customerShipping,
                  totalWeight
                );
                updateUI(id, freightRate, currentRecord, function() {
                  MicroModal.close("modal-shipping-method");
                });
              }, 400);
            } else {
              showMicroModal(shippingMethod, function(modal) {
                document.querySelector(
                  "#modal-shipping-method-content"
                ).innerHTML = "<p>This location not available.</p>";
              });
              updateUI(id, "", currentRecord);
            }
            break;
          case "RL_CARRIERS":
            if (id !== "0") {
              showMicroModal(shippingMethod, false);
              setTimeout(function() {
                const freightRate = getFreightRateRLC(
                  id,
                  customerShipping,
                  totalWeight
                );
                if (parseInt(freightRate) != 0) {
                  updateUI(id, freightRate, currentRecord, function() {
                    MicroModal.close("modal-shipping-method");
                  });
                } else {
                  updateUI(id, "", currentRecord);
                }
              }, 400);
            } else {
              showMicroModal(shippingMethod, function(modal) {
                document.querySelector(
                  "#modal-shipping-method-content"
                ).innerHTML = "<p>This location not available.</p>";
              });
              updateUI(id, "", currentRecord);
            }

            break;
          case "UPS_PACKAGE":
            if (id !== "0") {
              showMicroModal(shippingMethod, false);
              setTimeout(function() {
                const dataObj = getFreightRateUPSPackage(
                  id,
                  customerShipping,
                  totalWeight
                );
                if (dataObj) {
                  if (dataObj.success) {
                    const htmlUPSServices = buildUPSPackageServices(
                      dataObj.data
                    );
                    document.querySelector(
                      "#modal-shipping-method-content"
                    ).innerHTML = htmlUPSServices;
                    bindingUPSPackageServices(id, currentRecord);
                  } else {
                    document.querySelector(
                      "#modal-shipping-method-content"
                    ).innerHTML = "<p>" + dataObj.message + "</p>";
                  }
                } else {
                  document.querySelector(
                    "#modal-shipping-method-content"
                  ).innerHTML =
                    "<p>Something went wrong. Please try again!</p>";
                }
              }, 400);
            } else {
              showMicroModal(shippingMethod, function(modal) {
                document.querySelector(
                  "#modal-shipping-method-content"
                ).innerHTML = "<p>This location not available.</p>";
              });
              updateUI(id, "", currentRecord);
            }
            break;
          case "LEXOR_TRUCK":
            updateUI(id, 100, currentRecord);
            break;
          default:
            updateUI(id, 0, currentRecord);
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
    var selectShippingMethod = document.querySelectorAll(
      "#tableTotalWeight .shippingMethod"
    );
    for (var i = 0; i < selectShippingMethod.length; i++) {
      selectShippingMethod[i].addEventListener("change", function(event) {
        const id = this.getAttribute("data-id");
        updateUI(id, "", currentRecord);
      });
    }
  }

  /**
   * Get Customer Address
   * @param {*} currentRecord
   */
  function getCustomer(currentRecord) {
    const result = {};
    result.addr1 = nlapiGetFieldValue("shipaddr1");
    result.country = currentRecord.getValue("shipcountry");
    result.city = nlapiGetFieldValue("shipcity");
    result.state = currentRecord.getValue("shipstate");
    result.zip = currentRecord.getValue("shipzip");
    if (result.country === "US") {
      result.countryCode = "USA";
    } else if (result.country === "CA") {
      result.countryCode = "CAN";
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
    var result = 0;
    const odflWSURL = url.resolveScript({
      scriptId: "customscript_rl_carriers_ws_rl",
      deploymentId: "customdeploy_rl_carriers_ws_rl"
    });
    var res = https.post({
      url: odflWSURL,
      body: {
        locationId: id,
        customer: customerShipping,
        weight: weight
      },
      headers: { "Content-Type": "application/json" }
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
   * get Freight Rate ODFL
   * @param {*} id
   * @param {*} customerShipping
   * @param {*} weight
   */
  function getFreightRateODFL(id, customerShipping, weight) {
    var result = 0;
    const odflWSURL = url.resolveScript({
      scriptId: "customscript_odfl_ws_rl",
      deploymentId: "customdeploy_odfl_ws_rl"
    });
    var res = https.post({
      url: odflWSURL,
      body: {
        locationId: id,
        customer: customerShipping,
        weight: weight
      },
      headers: { "Content-Type": "application/json" }
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
        scriptId: "customscript_ups_package_ws_rl",
        deploymentId: "customdeploy_ups_package_ws_rl"
      });
      var res = https.post({
        url: odflWSURL,
        body: {
          locationId: id,
          customer: customerShipping,
          weight: weight
        },
        headers: { "Content-Type": "application/json" }
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
  function updateUI(id, freightRate, currentRecord, done) {
    document.getElementById("freightRate-" + id).innerHTML = freightRate;
    document
      .getElementById("freightRate-" + id)
      .setAttribute("data-freight-rate", freightRate);

    // Update Total
    const freightRateRows = document.querySelectorAll(
      "#tableTotalWeight .freightRate"
    );
    var isDone = true;
    const arrayfreightRateRows = Array.prototype.map.call(
      freightRateRows,
      function(n) {
        var freightRate = parseFloat(
          n.getAttribute("data-freight-rate").trim()
        );
        if (isNaN(freightRate)) {
          isDone = false;
        }
        return !isNaN(freightRate) ? freightRate : 0;
      }
    );
    const totalFreightRate = arrayfreightRateRows.reduce(function(a, b) {
      return a + b;
    }, 0);
    document.getElementById("tblFreightRate").innerHTML = parseFloat(
      totalFreightRate
    ).toFixed(2);
    currentRecord.setValue({
      fieldId: "custbodytotal_freight_rate",
      value: isDone ? parseFloat(totalFreightRate).toFixed(2) : ""
    });

    saveData(currentRecord);

    if (done) {
      done();
    }
  }

  /**
   * Save Data
   * @param {*} currentRecord
   */
  function saveData(currentRecord) {
    var attributes = [
      "data-location",
      "data-freight-rate",
      "data-total-weight"
    ];
    const dataJSON = parser.parseTable(
      document.getElementById("tableTotalWeight"),
      attributes
    );
    currentRecord.setValue({
      fieldId: "custbody_table_total_weight_data",
      value: JSON.stringify(dataJSON)
    });
  }

  /**
   * Load data from JSON
   * @param {*} currentRecord
   */
  function loadData(currentRecord) {
    const dataJSON = currentRecord.getValue({
      fieldId: "custbody_table_total_weight_data"
    });
    try {
      const dataObj = JSON.parse(dataJSON);
      for (var index = 0; index < dataObj.length; index++) {
        const element = dataObj[index];
        document.getElementById("shippingMethod-" + element.LOCATION).value =
          element.SHIPPING_METHOD;
        updateUI(element.LOCATION, element.FREIGHT_RATE, currentRecord, false);
      }
    } catch (error) {
      console.log("Nothing to load :)");
    }
  }

  /**
   * Show Modal
   * @param {*} title
   * @param {*} onShow
   */
  function showMicroModal(title, onShow) {
    document.querySelector(
      "#modal-shipping-method-title span"
    ).innerHTML = title;
    MicroModal.show("modal-shipping-method", {
      disableScroll: true,
      closeTrigger: "data-micromodal-close",
      awaitCloseAnimation: true,
      onShow: onShow ? onShow : function(params) {},
      onClose: function(modal) {
        document.querySelector("#modal-shipping-method-content").innerHTML =
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
        '<p><input type="radio" id="upsServices-' +
        el.code +
        '" name="upsServices" value="' +
        el.total +
        '"> <label for="upsServices-' +
        el.code +
        '">' +
        UPS_SERVICES[el.code] +
        " ($" +
        el.total +
        ")</label></p>";
    }
    html += "</div>";
    return html;
  }

  /**
   * Binding Radio Button UPS
   */
  function bindingUPSPackageServices(id, currentRecord) {
    var UPSPackageServices = document.querySelectorAll(
      '.ups-package-services input[type="radio"]'
    );
    for (var i = 0; i < UPSPackageServices.length; i++) {
      UPSPackageServices[i].addEventListener("change", function(event) {
        const total = this.value;
        updateUI(id, total, currentRecord, function() {
          MicroModal.close("modal-shipping-method");
        });
      });
    }
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
