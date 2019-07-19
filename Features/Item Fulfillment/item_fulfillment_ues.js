/**
 * Item Fulfillment Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(["N/record"], function(record) {
  function afterSubmit(context) {
    const type = context.type;
    const newRecord = context.newRecord;
    try {
      // create = context.UserEventType.CREATE, delete = context.UserEventType.DELETE
      if (
        type === context.UserEventType.CREATE ||
        type === context.UserEventType.DELETE
      ) {
        const orderid = newRecord.getValue("orderid");
        var so = record.load({
          type: record.Type.SALES_ORDER,
          id: orderid,
          isDynamic: true
        });
        const totalLine = so.getLineCount({ sublistId: "item" });
        var checked = false; // custbody_fulfilled
        for (var index = 0; index < totalLine; index++) {
          var itempicked = so.getSublistValue({
            sublistId: "item",
            fieldId: "itempicked",
            line: index
          });
          var itempacked = so.getSublistValue({
            sublistId: "item",
            fieldId: "itempacked",
            line: index
          });
          var islinefulfilled = so.getSublistValue({
            sublistId: "item",
            fieldId: "islinefulfilled",
            line: index
          });
          if (
            itempicked === "T" ||
            itempacked === "T" ||
            islinefulfilled === "T"
          ) {
            checked = true;
            break;
          }
        }

        so.setValue({
          fieldId: "custbody_fulfilled",
          value: checked
        });
        so.save();
      }
    } catch (error) {
      log.error({
        title: "afterSubmit " + type,
        details: error
      });
    }
  }

  return {
    afterSubmit: afterSubmit
  };
});
