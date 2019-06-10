/**
 * Sales Effective Module
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(["N/record", "N/search"], function(record, search) {
  function updateSalesEffective(salesOrderId) {
    if (salesOrderId) {
      try {
        var so = record.load({
          type: record.Type.SALES_ORDER,
          id: salesOrderId,
          isDynamic: true
        });
        const createdDate = so.getValue("createddate");
        const total = parseFloat(so.getValue("total"));
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
              var totalDepositedPercent = (totalDeposited / total) * 100;
              if (totalDepositedPercent >= 25) {
                salesEffectiveDate = custbody_date_deposited
                  ? new Date(custbody_date_deposited)
                  : new Date(trandate);
                return false;
              }
            }
            return true;
          });
          so.setValue({
            fieldId: "saleseffectivedate",
            value: salesEffectiveDate ? salesEffectiveDate : createdDate
          });
          so.save();
        }
      } catch (err) {
        log.error({
          title: "Error Sales Effective SO " + salesOrderId,
          details: err.message
        });
      }
    }
  }

  return {
    update: updateSalesEffective
  };
});