define([], function() {
  /**
   * Add Google Map for Address form
   * @NApiVersion 2.x
   * @NScriptType ClientScript
   * @author trungpv <trung@lexor.com>
   */

  /* === VARS === */

  /* === EVENTS FUNCTIONS === */

  /**
   * Sublist Changed
   * @param {*} context
   */
  function sublistChanged(context) {
    const currentRecord = context.currentRecord;
    const sublistId = context.sublistId;
    const operation = context.operation;

    if (sublistId === "addressbook" && operation === "remove") {
      const defaultbilling = currentRecord.getCurrentSublistValue({
        sublistId: sublistId,
        fieldId: "defaultbilling"
      });
      // Reset Default Value when remove address
      if (defaultbilling) {
        currentRecord.setValue({
          fieldId: "defaultaddress",
          value: ""
        });
        currentRecord.setValue({
          fieldId: "custentity_address_verification",
          value: ""
        });
      }
    }
  }

  /**
   * Field Changed
   * @param {*} context
   */
  function fieldChanged(context) {
    const fieldId = context.fieldId;
    const currentRecord = context.currentRecord;
    if (fieldId === "defaultaddress") {
      const defaultaddress = currentRecord.getValue({ fieldId: fieldId });
      var addressArr = defaultaddress.split("\n");
      if(addressArr.length > 3) {
        currentRecord.setValue({
          fieldId: "custentity_address_verification",
          value: formatAddressStandardization(defaultaddress)
        });
      } else {
        currentRecord.setValue({
          fieldId: "custentity_address_verification",
          value: ''
        });
      }
    }
    return;
  }

  /** HELPER FUNCTIONS **/
  function formatAddressStandardization(address) {
    address = address.split("\n");
    var result = "";
    if (address.length >= 4) {
      address.splice(0, 1);
      if (address.length === 4) {
        address.splice(1, 1);
      }
    }

    result = address.join("\n");
    return result;
  }

  /**
   * Export Events
   */
  var exports = {};
  exports.sublistChanged = sublistChanged;
  exports.fieldChanged = fieldChanged;
  return exports;
});
