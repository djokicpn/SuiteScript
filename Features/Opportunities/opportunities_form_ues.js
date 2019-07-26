/**
 * Opportunities Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define([], function() {

    function beforeLoad(context) {
        try {
            var form = context.form;
            var item = form.getSublist({ id: "item" });
            if (item) {
                var amountCol = item.getField({ id: "amount" });
                if (amountCol) {
                    amountCol.updateDisplayType({ displayType: "disabled" });
                }
            }
        } catch (error) {
            log.error({
                title: "Error beforeLoad",
                details: error.message
            });
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});
