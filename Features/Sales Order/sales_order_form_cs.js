/**
 * Sales Order Form
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @NScriptType ClientScript
 * @author trungpv <trung@lexor.com>
 */
define([
  "/SuiteScripts/Module/shippingRates",
  "/SuiteScripts/Module/discountModule"
], function(_ShippingRates, _discountModule) {
  /* === VARS === */

  /* === EVENTS FUNCTIONS === */
  /**
   * Line Init
   * @param {*} context
   */
  function lineInit(context) {
    try {
      const sublistId = context.sublistId;
      const currentRecord = context.currentRecord;
      if (sublistId === "item") {
        const index = currentRecord.getCurrentSublistIndex({
          sublistId: "item"
        });
        try {
          var itempicked = currentRecord.getSublistValue({
            sublistId: "item",
            fieldId: "itempicked",
            line: index
          });
          var itempacked = currentRecord.getSublistValue({
            sublistId: "item",
            fieldId: "itempacked",
            line: index
          });
          var islinefulfilled = currentRecord.getSublistValue({
            sublistId: "item",
            fieldId: "islinefulfilled",
            line: index
          });
          if (
            itempicked === "T" ||
            itempacked === "T" ||
            islinefulfilled === "T"
          ) {
            disableCell("quantity", index, currentRecord);
            disableCell("item", index, currentRecord);
            disableCell("taxcode", index, currentRecord);
            disableCell("location", index, currentRecord);
            disableCell("commitinventory", index, currentRecord);
            disableCell("units", index, currentRecord);
          }
        } catch (error) {}
      }
    } catch (error) {
      console.log("lineInit Error: ", error);
    }
    return;
  }

  /**
   * Page Init
   * @param {*} context
   */
  function pageInit(context) {
    const currentRecord = context.currentRecord;
    try {
      removeOptionsShipAndBill();
      _ShippingRates.pageInit(currentRecord);
      _discountModule.pageInit(context);
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
        _ShippingRates.sublistChanged(currentRecord);
      } catch (error) {
        console.log("sublistChanged Error: ", error);
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
   * Disable Cell
   * @param {*} col
   * @param {*} row
   * @param {*} currentRecord
   */
  function disableCell(col, row, currentRecord) {
    var field = currentRecord.getSublistField({
      sublistId: "item",
      fieldId: col,
      line: row
    });
    if (field) {
      field.isDisabled = true;
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
  exports.lineInit = lineInit;
  return exports;
});
