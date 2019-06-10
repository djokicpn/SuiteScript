/**
 * Customer Deposit Form User Event Script
 * custform_248_4283482_820
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(["./Module/salesEffective"], function(salesEffective) {
  function beforeLoad(context) {
    var form = context.form;
    // Set Under. Funds as Default
    var undepfunds = form.getField({ id: "undepfunds" });
    if (undepfunds) {
      undepfunds.defaultValue = "T";
    }
  }

  function beforeSubmit(context) {}

  function afterSubmit(context) {
    var newRecord = context.newRecord;
    var newRecordSaleOrder = newRecord.getValue({
      fieldId: "salesorder"
    });
    salesEffective.update(newRecordSaleOrder);
  }

  return {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit
  };
});
