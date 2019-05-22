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

    if (sublistId === "addressbook") {
      const defaultbilling = currentRecord.getCurrentSublistValue({
        sublistId: sublistId,
        fieldId: "defaultbilling"
      });
      const defaultshipping = currentRecord.getCurrentSublistValue({
        sublistId: sublistId,
        fieldId: "defaultshipping"
      });

      if (operation === "remove") {
        // Reset Default Value when remove address
        if (defaultbilling) {
          currentRecord.setValue({
            fieldId: "defaultaddress",
            value: ""
          });
        }
        if (defaultshipping) {
          currentRecord.setValue({
            fieldId: "custentity_address_verification",
            value: ""
          });
        }
      } else {
        if (defaultshipping) {
          const addressbookaddress_text = currentRecord.getCurrentSublistValue({
            sublistId: sublistId,
            fieldId: "addressbookaddress_text"
          });
          var addressArr = addressbookaddress_text.split("\n");
          if (addressArr.length > 3) {
            currentRecord.setValue({
              fieldId: "custentity_address_verification",
              value: formatAddressStandardization(addressbookaddress_text)
            });
          } else {
            currentRecord.setValue({
              fieldId: "custentity_address_verification",
              value: ""
            });
          }
        }
      }
    }
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
  return exports;
});
