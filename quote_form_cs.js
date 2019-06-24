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
          value: quantity * itemWeight,
          ignoreFieldChange: true
        });
      }
    } catch (error) {
      console.log("validateLine Error: ", error);
    }
    return true; //Return true if the line is valid.
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
      totalWeight += (quantity * weightinlb);
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
   * Export Events
   */
  var exports = {};
  exports.pageInit = pageInit;
  exports.sublistChanged = sublistChanged;
  exports.validateLine = validateLine;
  return exports;
});
