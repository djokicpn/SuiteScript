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
        buildTableTotalWeight(newRecord);
      } catch (err) {
        log.error({
          title: "Error buildTableTotalWeight",
          details: err.message
        });
      }
    }
  }

  function beforeSubmit(context) {}

  function afterSubmit(context) {
    var newRecord = context.newRecord;
    salesEffective.update(newRecord.id);
  }

  /** HEPPER FUNCTIONS **/
  /**
   * Build Table Total Weight for View Mode
   * @param {*} newRecord
   */
  function buildTableTotalWeight(newRecord) {
    // Add Util Function Replace All
    String.prototype.replaceAll = function(search, replacement) {
      return this.split(search).join(replacement);
    };
    const totalLine = newRecord.getLineCount({ sublistId: "item" });
    var tableTotalWeight = {};
    for (var index = 0; index < totalLine; index++) {
      var quantity = newRecord.getSublistValue({
        sublistId: "item",
        fieldId: "quantity",
        line: index
      });
      var weightinlb = newRecord.getSublistValue({
        sublistId: "item",
        fieldId: "custcol45", // weightinlb
        line: index
      });
      var location = newRecord.getSublistValue({
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
    }
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

  return {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit
  };
});
