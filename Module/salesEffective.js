/**
 * Sales Effective Module
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(["N/record", "N/search"], function(record, search) {
  function updateSalesEffective(salesOrderId) {
    log.debug({
      title: "---- Update SO " + salesOrderId + " ----",
      details: "---- Update SO " + salesOrderId + " ----"
    });
    if (salesOrderId) {
      try {
        var so = record.load({
          type: record.Type.SALES_ORDER,
          id: salesOrderId,
          isDynamic: true
        });
        const total = parseFloat(so.getValue("total"));
        log.debug({
          title: "- Total: " + total,
          details: "- Total: " + total
        });
        if (total > 0) {
          var listDeposits = search.create({
            type: search.Type.CUSTOMER_DEPOSIT,
            filters: [
              {
                name: "salesorder",
                operator: search.Operator.IS,
                values: [salesOrderId]
              }
            ],
            columns: [
              search.createColumn({
                name: "trandate",
                sort: search.Sort.ASC
              }),
              "amount",
              "custbody_date_deposited",
              "status"
            ]
          });
          var totalDeposited = 0;
          var salesEffectiveDate = false;
          listDeposits.run().each(function(item) {
            var status = item.getValue("status");
            var trandate = item.getValue("trandate");
            var custbody_date_deposited = item.getValue(
              "custbody_date_deposited"
            );
            if (status === "deposited") {
              var totalValue = item.getValue("amount");
              totalDeposited =
                parseFloat(totalDeposited) + parseFloat(totalValue);
              log.debug({
                title:
                  "- Deposited: " +
                  totalValue +
                  " - " +
                  status +
                  " - " +
                  trandate +
                  " - " +
                  custbody_date_deposited,
                details:
                  "- Deposited: " +
                  totalValue +
                  " - " +
                  status +
                  " - " +
                  trandate +
                  " - " +
                  custbody_date_deposited
              });
              log.debug({
                title: "- Total Deposited: " + totalDeposited,
                details: "- Total Deposited: " + totalDeposited
              });
              var totalDepositedPercent = (totalDeposited / total) * 100;
              if (totalDepositedPercent >= 25) {
                salesEffectiveDate = custbody_date_deposited
                  ? new Date(custbody_date_deposited)
                  : new Date(trandate);
                log.debug({
                  title: "- * Set Sales Effective Date " + salesEffectiveDate,
                  details: "- * Set Sales Effective Date " + salesEffectiveDate
                });
                return false;
              }
            }
            return true;
          });
          so.setValue({
            fieldId: "saleseffectivedate",
            value: salesEffectiveDate ? salesEffectiveDate : null
          });
          so.save();
        }
        log.debug({
          title: "---- Done Update SO " + salesOrderId + " ----",
          details: "---- Done Update SO " + salesOrderId + " ----"
        });
      } catch (err) {
        log.debug({
          title: "---- Error SO " + salesOrderId + ": " + err.message + " ----",
          details:
            "---- Error SO " + salesOrderId + ": " + err.message + " ----"
        });
      }
    }
  }

  return {
    update: updateSalesEffective
  };
});
