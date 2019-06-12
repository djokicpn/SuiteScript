/**
 * Customer Deposit Form Client Script
 * custform_248_4283482_820
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author trungpv <trung@lexor.com>
 */
define(["N/runtime"], function(runtime) {
  /* === VARS === */

  /* === EVENTS FUNCTIONS === */
  /**
   * Page Init
   * @param {*} context
   */
  function pageInit(context) {
    // processDateDeposited(context);
    disabledFeatureRoles(context);
    return;
  }

  /**
   * Field Changed
   * @param {*} context
   */
  function fieldChanged(context) {
    // const fieldId = context.fieldId;
    // if (fieldId === "undepfunds" || fieldId === "account") {
    //   processDateDeposited(context);
    // }
    return;
  }

  /* HELPER FUNCTIONS */

  function processDateDeposited(context) {
    const currentRecord = context.currentRecord;
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
   * Disable Fields with some Roles
   */
  function disabledFeatureRoles(context) {
    var account = document.querySelector('input[name="undepfunds"][value="F"]');
    if (account) {
      var currentUser = runtime.getCurrentUser();
      const role = currentUser.role;
      // 1036 Lexor| Sale
      // 1069	Lexor | Sales Director
      // 1037	Lexor | Sales Manager
      if (role === 1036 || role === 1069 || role === 1037) {
        account.disabled = true;
      }
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
