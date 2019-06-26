/**
 * Quote Form
 * custform_145_4283482_879
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @NScriptType ClientScript
 * @author trungpv <trung@lexor.com>
 */
define([], function() {
  /* === VARS === */

  /* === EVENTS FUNCTIONS === */

  /**
   * Page Init
   * @param {*} context
   */
  function pageInit(context) {
    const currentRecord = context.currentRecord;
    try {
      buildTableTotalWeight(currentRecord);

      removeOptionsShipAndBill();
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
        buildTableTotalWeight(currentRecord);
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
        const location = currentRecord.getValue({
          fieldId: "location"
        });
        if (location) {
          currentRecord.setCurrentSublistValue({
            sublistId: sublistId,
            fieldId: "location",
            value: location
          });
        }
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
  function buildTableTotalWeight(currentRecord) {
    // Add Util Function Replace All
    String.prototype.replaceAll = function(search, replacement) {
      return this.split(search).join(replacement);
    };

    const totalLine = currentRecord.getLineCount({ sublistId: "item" });
    var tableTotalWeight = {};
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
      if (location === "") {
        if (tableTotalWeight["None"] === undefined) {
          tableTotalWeight["None"] = 0;
        }
        tableTotalWeight["None"] =
          tableTotalWeight["None"] + quantity * weightinlb;
      } else {
        if (tableTotalWeight[location] === undefined) {
          tableTotalWeight[location] = 0;
        }
        tableTotalWeight[location] =
          tableTotalWeight[location] + quantity * weightinlb;
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
        .replaceAll("____LOCATIN___", key)
        .replaceAll("____TOTAL_WEIGHT___", tableTotalWeight[key]);
    }
    document.querySelector(
      "#tableTotalWeight tbody"
    ).innerHTML = htmlTableTotalWeight;
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
    document.getElementById('billaddresslist_popup_new').setAttribute('style', 'display:none !important');
    document.getElementById('billaddresslist_popup_link').setAttribute('style', 'display:none !important');
    document.getElementById('shipaddresslist_popup_new').setAttribute('style', 'display:none !important');
    document.getElementById('shipaddresslist_popup_link').setAttribute('style', 'display:none !important');
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
