/**
 *
 * Invoice Form custform_239_4283482_558
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(["N/record"], function(record) {
  function beforeLoad(context) {
    const type = context.type;
    if (type !== context.UserEventType.CREATE) return;
    var invoiceRecord = context.newRecord;
    if (invoiceRecord.type === "invoice") {
      // saleseffectivedate
      const saleOrderId = invoiceRecord.getValue("createdfrom");
      if (saleOrderId) {
        var so = record.load({
          type: record.Type.SALES_ORDER,
          id: saleOrderId,
          isDynamic: true
        });
        const total = so.getValue("total");
        if(total > 0) {
          const totalLinks = so.getLineCount({ sublistId: "links" });
        var totalDeposited = 0;
        for (var index = 0; index < totalLinks; index++) {
          var totalValue = so.getSublistValue({
            sublistId: "links",
            fieldId: "total",
            line: index
          });
          var typeValue = so.getSublistValue({
            sublistId: "links",
            fieldId: "type",
            line: index
          });
          var trandateValue = so.getSublistValue({
            sublistId: "links",
            fieldId: "trandate",
            line: index
          });
          if (typeValue === "Customer Deposit") {
            totalDeposited = totalDeposited + totalValue;
            var totalDepositedPercent = (totalDeposited / total) * 100;
            if(totalDepositedPercent >= 25) {
              invoiceRecord.setValue({
                fieldId: "saleseffectivedate",
                value: trandateValue
              });
              break;
            }
          }
        }
        }
      }
    }
  }

  return {
    beforeLoad: beforeLoad
  };
});
