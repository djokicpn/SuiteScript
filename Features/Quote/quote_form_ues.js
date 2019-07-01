/**
 * Quote Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define([], function() {
  const SHIPPING_METHODS = {
    RL_CARRIERS: "LTL",
    WILL_CALL: "Will Call",
    LEXOR_TRUCK: "Lexor Truck",
    ODFL: "LTL",
    UPS_PACKAGE: "UPS Package"
  };

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
        var obj = getTotalWeightByLocation(newRecord);
        buildTableTotalWeight(newRecord, obj);
      } catch (err) {
        log.error({
          title: "Error buildTableTotalWeight",
          details: err.message
        });
      }
    }
  }

  function beforeSubmit(context) {
    var newRecord = context.newRecord;
    try {
      const totalLine = newRecord.getLineCount({ sublistId: "item" });
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
        // Update Total Weight Each Line
        newRecord.setSublistValue({
          sublistId: "item",
          fieldId: "custcol_total_weight",
          line: index,
          value: quantity * weightinlb
        });
      }
    } catch (error) {
      log.error({
        title: "Error updateTotalWeightByLocation",
        details: error.message
      });
    }
  }

  function afterSubmit(context) {}

  /** HEPPER FUNCTIONS **/
  /**
   * Build Table Total Weight for View Mode
   * @param {*} newRecord
   * @param {*} obj
   */
  function buildTableTotalWeight(newRecord, obj) {
    const tableTotalWeight = obj.tableTotalWeight;
    // Add Util Function Replace All
    String.prototype.replaceAll = function(search, replacement) {
      return this.split(search).join(replacement);
    };

    var dataObj = getTableWeightDataJSON(newRecord);

    var htmlTableTotalWeight =
      '<span class="smallgraytextnolink uir-label"><span class="smallgraytextnolink">Shipping Rates</span></span><table id="tableTotalWeight" class="lx-table"><thead><tr><th>Location</th><th>Total Weight</th><th>Shipping Method</th><th>Freight Rate</th></tr></thead><tbody>';
    var totalWeight = 0;
    var totalFreightRate = dataObj ? dataObj.reduce(function(a, b) {
      return (
        (!isNaN(typeof a === "number" ? a : a.FREIGHT_RATE)
          ? parseFloat(typeof a === "number" ? a : a.FREIGHT_RATE)
          : 0) +
        (!isNaN(typeof b === "number" ? b : b.FREIGHT_RATE)
          ? parseFloat(typeof b === "number" ? b : b.FREIGHT_RATE)
          : 0)
      );
    }, 0) : 0;
    for (var key in tableTotalWeight) {
      var tplRow =
        '<tr><td>____LOCATIN___</td><td style="text-align: center;">____TOTAL_WEIGHT___</td><td>____SHIPPING_METHOD___</td><td style="text-align: center;">____FREIGHT_RATE___</td></tr>';
      tplRow = tplRow
        .replaceAll("____LOCATIN___", key)
        .replaceAll("____TOTAL_WEIGHT___", tableTotalWeight[key]);
      if (dataObj) {
        var locationId = obj.mapLocation[key];
        var row = dataObj.reduce(function(a, b) {
          return (
            (a.LOCATION == locationId && a) || (b.LOCATION == locationId && b)
          );
        });
        if (row) {
          tplRow = tplRow
            .replaceAll(
              "____SHIPPING_METHOD___",
              SHIPPING_METHODS[row.SHIPPING_METHOD]
            )
            .replaceAll("____FREIGHT_RATE___", parseFloat(row.FREIGHT_RATE).toFixed(2));
        } else {
          tplRow = tplRow
            .replaceAll("____SHIPPING_METHOD___", "")
            .replaceAll("____FREIGHT_RATE___", "");
        }
      } else {
        tplRow = tplRow
          .replaceAll("____SHIPPING_METHOD___", "")
          .replaceAll("____FREIGHT_RATE___", "");
      }

      htmlTableTotalWeight += tplRow;
      totalWeight += parseFloat(tableTotalWeight[key]);
    }
    htmlTableTotalWeight +=
      '</tbody><tfoot><tr><td>Total</td><td style="text-align: center;">' +
      totalWeight +
      '</td><td></td><td style="text-align: center;">' +
      totalFreightRate +
      "</td></tr></tfoot></table>";
    htmlTableTotalWeight +=
      "<style>.lx-table{border:solid 1px #dee;border-collapse:collapse;border-spacing:0;font-size:12px}.lx-table thead th{background-color:#607799;border:solid 1px #dee;color:#fff;padding:10px;text-align:left}.lx-table tbody td{border:solid 1px #dee;color:#000;padding:10px}.lx-table tfoot td{border:solid 1px #dee;color:#000;padding:10px}</style>";
    newRecord.setValue({
      fieldId: "custbody_table_total_weight",
      value: htmlTableTotalWeight
    });
  }

  /**
   * Get data JSON
   * @param {*} newRecord
   */
  function getTableWeightDataJSON(newRecord) {
    const dataJSON = newRecord.getValue({
      fieldId: "custbody_table_total_weight_data"
    });
    var dataObj = false;
    try {
      dataObj = JSON.parse(dataJSON);
    } catch (error) {}
    return dataObj;
  }

  /**
   * Get Total Weight By Location
   * @param {*} record
   */
  function getTotalWeightByLocation(record) {
    const totalLine = record.getLineCount({ sublistId: "item" });
    var tableTotalWeight = {};
    var mapLocation = {};
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
      var locationId = record.getSublistValue({
        sublistId: "item",
        fieldId: "location",
        line: index
      });
      if (location === undefined || location === "") {
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
    }

    return { tableTotalWeight: tableTotalWeight, mapLocation: mapLocation };
  }

  return {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit
  };
});
