/**
 * Sales Order Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(["./Module/salesEffective"], function(salesEffective) {
  function beforeLoad(context) {
    var form = context.form;
    var newRecord = context.newRecord;
    var item = form.getSublist({ id: "item" });
    if (item) {
      var amountCol = item.getField({ id: "amount" });
      if (amountCol) {
        amountCol.updateDisplayType({ displayType: "disabled" });
      }

      // Set Default Location
      var locationCol = item.getField({ id: "location" });
      if (locationCol) {
        var location = newRecord.getValue({
          fieldId: "location"
        });
        locationCol.defaultValue = location;
      }
    }

    // View Mode
    if (context.type === context.UserEventType.VIEW) {
      try {
        var newRecordObject = getTotalWeightByLocation(newRecord);

        buildTableTotalWeight(newRecord, newRecordObject.tableTotalWeight);
      } catch (err) {
        log.error({
          title: "Error buildTableTotalWeight",
          details: err.message
        });
      }
    }
  }

  function beforeSubmit(context) {
    const type = context.type;
    var newRecord = context.newRecord;
    var oldRecord = context.oldRecord;
    try {
      var newRecordObject = getTotalWeightByLocation(newRecord);
      if (type === context.UserEventType.CREATE) {
        updateTotalWeightByLocation(
          newRecord,
          newRecordObject.tableTotalWeight,
          newRecordObject.cacheItems
        );
      } else {
        if (oldRecord && newRecord) {
          var oldRecordObject = getTotalWeightByLocation(oldRecord);
          if (!deepEqual(newRecordObject, oldRecordObject)) {
            updateTotalWeightByLocation(
              newRecord,
              newRecordObject.tableTotalWeight,
              newRecordObject.cacheItems
            );
          }
        }
      }
    } catch (error) {
      log.error({
        title: "Error updateTotalWeightByLocation",
        details: error.message
      });
    }
  }

  function afterSubmit(context) {
    var newRecord = context.newRecord;
    salesEffective.update(newRecord.id);
  }

  /** HEPPER FUNCTIONS **/
  /**
   * Build Table Total Weight for View Mode
   * @param {*} newRecord
   * @param {*} tableTotalWeight
   */
  function buildTableTotalWeight(newRecord, tableTotalWeight) {
    // Add Util Function Replace All
    String.prototype.replaceAll = function(search, replacement) {
      return this.split(search).join(replacement);
    };
    var htmlTableTotalWeight =
      '<span class="smallgraytextnolink uir-label"><span class="smallgraytextnolink">Shipping Rates</span></span><table id="tableTotalWeight" class="lx-table"><thead><tr><th>Location</th><th>Total Weight</th><th>Shipping Method</th><th>Freight Rate</th></tr></thead><tbody>';
    for (var key in tableTotalWeight) {
      var tplRow =
        "<tr><td>____LOCATIN___</td><td>____TOTAL_WEIGHT___</td><td></td><td></td></tr>";
      htmlTableTotalWeight += tplRow
        .replaceAll("____LOCATIN___", key)
        .replaceAll("____TOTAL_WEIGHT___", tableTotalWeight[key]);
    }
    htmlTableTotalWeight +=
      "</tbody><tfoot><tr><td>Total</td><td></td><td></td><td></td></tr></tfoot></table>";
    htmlTableTotalWeight +=
      "<style>.lx-table{border:solid 1px #dee;border-collapse:collapse;border-spacing:0;font-size:12px}.lx-table thead th{background-color:#6688c2;border:solid 1px #dee;color:#fff;padding:10px;text-align:left}.lx-table tbody td{border:solid 1px #dee;color:#000;padding:10px}.lx-table tfoot td{border:solid 1px #dee;color:#000;padding:10px}</style>";
    newRecord.setValue({
      fieldId: "custbody_table_total_weight",
      value: htmlTableTotalWeight
    });
  }

  /**
   * Update Total Weight By Location
   * @param {*} newRecord
   * @param {*} tableTotalWeight
   * @param {*} cacheItems
   */
  function updateTotalWeightByLocation(
    newRecord,
    tableTotalWeight,
    cacheItems
  ) {
    // Update Data for each line
    for (var index = 0; index < Object.keys(cacheItems).length; index++) {
      var location = cacheItems[index];

      if (location === undefined || location === "") {
        newRecord.setSublistValue({
          sublistId: "item",
          fieldId: "custcol_total_weight_by_location",
          line: index,
          value: tableTotalWeight["None"]
        });
      } else {
        newRecord.setSublistValue({
          sublistId: "item",
          fieldId: "custcol_total_weight_by_location",
          line: index,
          value: tableTotalWeight[location]
        });
      }
      newRecord.setSublistValue({
        sublistId: "item",
        fieldId: "custcol_shipping_method",
        line: index,
        value: ""
      });
      newRecord.setSublistValue({
        sublistId: "item",
        fieldId: "custcol_freight_rate_by_location",
        line: index,
        value: ""
      });
    }
  }

  /**
   * Get Total Weight By Location
   * @param {*} record
   */
  function getTotalWeightByLocation(record) {
    const totalLine = record.getLineCount({ sublistId: "item" });
    var tableTotalWeight = {};
    var cacheItems = {};
    for (var index = 0; index < totalLine; index++) {
      var quantity = record.getSublistValue({
        sublistId: "item",
        fieldId: "quantity",
        line: index
      });
      var weightinlb = record.getSublistValue({
        sublistId: "item",
        fieldId: "custcol45", // weightinlb
        line: index
      });
      var location = record.getSublistValue({
        sublistId: "item",
        fieldId: "location_display",
        line: index
      });
      if (location === undefined || location === "") {
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
      cacheItems[index] = location;
      // Update Total Weight Each Line
      record.setSublistValue({
        sublistId: "item",
        fieldId: "custcol_total_weight",
        line: index,
        value: (quantity * weightinlb)
      });
    }

    return { tableTotalWeight: tableTotalWeight, cacheItems: cacheItems };
  }

  /**
   * Compare Object
   * @param {*} obj1
   * @param {*} obj2
   */
  function deepEqual(obj1, obj2) {
    if (obj1 === obj2) {
      return true;
    } else if (isObject(obj1) && isObject(obj2)) {
      if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
      }
      for (var prop in obj1) {
        if (!deepEqual(obj1[prop], obj2[prop])) {
          return false;
        }
      }
      return true;
    }

    // Private
    function isObject(obj) {
      if (typeof obj === "object" && obj != null) {
        return true;
      } else {
        return false;
      }
    }
  }

  return {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit
  };
});
