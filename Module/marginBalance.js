/**
 * Margin Balance Module
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(["N/record"], function(record) {
    /**
     * Run update Margin Balance
     * @param {*} salesOrderId
     */
    function updateSO(salesOrderId) {
        try {
            var so = record.load({
                type: record.Type.SALES_ORDER,
                id: salesOrderId
            });
            const status = so.getValue("status");
            const custbodyMarginLeft = so.getValue("custbody_margin_left");
            const totalLine = so.getLineCount({ sublistId: "item" });
            const countItemsMarginBalance = getCountItemsMarginBalance(so);
            var avgMarginLeft = 0;
            if (status === "Billed") {
                avgMarginLeft =
                    countItemsMarginBalance > 0
                        ? parseFloat(custbodyMarginLeft / countItemsMarginBalance).toFixed(2)
                        : 0;
            }
            for (var index = 0; index < totalLine; index++) {
                // AVG Margin Balance
                so.setSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_margin_balance",
                    line: index,
                    value: avgMarginLeft
                });
            }
            so.save();
        } catch (err) {
            log.error({
                title: "Error Update Margin Balance SO " + salesOrderId,
                details: err.message
            });
        }
    }

    /**
     * Get Items for Margin Balance
     * @param {*} so
     */
    function getCountItemsMarginBalance(so) {
        var result = 0;
        try {
            const totalLine = so.getLineCount({ sublistId: "item" });
            for (var index = 0; index < totalLine; index++) {
                var weightinlb = so.getSublistValue({
                    sublistId: "item",
                    fieldId: "custcol45", // weightinlb
                    line: index
                });
                if (weightinlb !== "") {
                    result++;
                }
            }
        } catch (error) {
            return 0;
        }
        return result;
    }

    return {
        updateSO: updateSO
    };
});
