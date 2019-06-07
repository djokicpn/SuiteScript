define([], function() {
  /**
   * Customer Deposit Form Client Script
   * custform_248_4283482_820
   * @NApiVersion 2.x
   * @NScriptType ClientScript
   * @author trungpv <trung@lexor.com>
   */

  /* === VARS === */

  /* === EVENTS FUNCTIONS === */
  /**
   * Page Init
   * @param {*} context
   */
  function pageInit(context) {
    const currentRecord = context.currentRecord;
    processDateDeposited(currentRecord);
    return;
  }

  /**
   * Field Changed
   * @param {*} context
   */
  function fieldChanged(context) {
    const currentRecord = context.currentRecord;
    const fieldId = context.fieldId;
    if (fieldId === "undepfunds" || fieldId === "account") {
      processDateDeposited(currentRecord);
    }
    return;
  }

  /* HELPER FUNCTIONS */

  function processDateDeposited(currentRecord) {
    const undepfunds = currentRecord.getValue({
      fieldId: "undepfunds"
    });
    if (undepfunds === "F") {
      const account = currentRecord.getValue({
        fieldId: "account"
      });
      if (account !== "") {
        currentRecord.setValue({
          fieldId: "custbody_date_deposited",
          value: new Date()
        });
      }
    } else {
      currentRecord.setValue({
        fieldId: "custbody_date_deposited",
        value: ""
      });
    }
  }

  /**
   * Export Events
   */
  var exports = {};
  exports.pageInit = pageInit;
  exports.fieldChanged = fieldChanged;
  return exports;
});
