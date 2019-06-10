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
    var item = form.getSublist({ id: "item" });
    if (item) {
      var amountCol = item.getField({ id: "amount" });
      if (amountCol) {
        amountCol.updateDisplayType({ displayType: "disabled" });
      }

      // Set Default Location
      var locationCol = item.getField({ id: "location" });
      if (locationCol) {
        var newRecord = context.newRecord;
        var location = newRecord.getValue({
          fieldId: "location"
        });
        locationCol.defaultValue = location;
      }
    }
  }

  function beforeSubmit(context) {}

  function afterSubmit(context) {
    var newRecord = context.newRecord;
    salesEffective.update(newRecord.id);
  }

  return {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit
  };
});
