define([], function() {
  /**
   * Add Google Map for Address form
   * @NApiVersion 2.x
   * @NModuleScope Public
   * @NScriptType ClientScript
   */

  /* === VARS === */
  const SCRIPT_ID = "custform_lead_form_cs_google_api_address";

  /* === EVENTS FUNCTIONS === */

  /**
   * Line Init
   * @param {*} context
   */
  function lineInit(context) {
    console.log(SCRIPT_ID, "lineInit Triggered!", context);
    return;
  }

  /**
   * Page Init
   * @param {*} context
   */
  function pageInit(context) {
    console.log(SCRIPT_ID, "pageInit Triggered!", context);
    return;
  }

  /**
   * Post Sourcing
   * @param {*} context
   */
  function postSourcing(context) {
    console.log(SCRIPT_ID, "postSourcing Triggered!", context);
    return;
  }

  /**
   * Save Record
   * @param {*} context
   */
  function saveRecord(context) {
    console.log(SCRIPT_ID, "saveRecord Triggered!", context);
    return true; //Return true if you want to continue saving the record.
  }

  /**
   * Sublist Changed
   * @param {*} context
   */
  function sublistChanged(context) {
    const currentRecord = context.currentRecord;
    const sublistId = context.sublistId;
    const operation = context.operation;
    console.log(SCRIPT_ID, "sublistChanged Triggered!", context);

    if (sublistId === "addressbook" && operation === "remove") {
      const defaultbilling = currentRecord.getCurrentSublistValue({
        sublistId: sublistId,
        fieldId: "defaultbilling"
      });
      // Reset Default Value when remove address
      if (defaultbilling) {
        currentRecord.setValue({
          fieldId: "defaultaddress",
          value: ''
        });
        currentRecord.setValue({
          fieldId: "custentity_address_verification",
          value: ''
        });
      }
    }
  }

  /**
   * Validate Delete
   * @param {*} context
   */
  function validateDelete(context) {
    const currentRecord = context.currentRecord;
    const sublistId = context.sublistId;
    const fieldId = context.fieldId;
    const line = currentRecord.getCurrentSublistIndex({
      sublistId: sublistId
    });
    console.log(SCRIPT_ID, "validateDelete Triggered!", context);
    return true; //Return true if the line deletion is valid.
  }

  /**
   * Validate Field
   * @param {*} context
   */
  function validateField(context) {
    const sublistId = context.sublistId;
    const fieldId = context.fieldId;
    const line = context.line;
    const column = 0;
    const currentRecord = context.currentRecord;
    console.log(SCRIPT_ID, "validateField Triggered!", context);
    return true; //Return true to continue with the change.
  }

  /**
   * Validate Insert
   * @param {*} context
   */
  function validateInsert(context) {
    console.log(SCRIPT_ID, "validateInsert Triggered!", context);
    return true; //Return true if the line insertion is valid.
  }

  /**
   * Validate Line
   * @param {*} context
   */
  function validateLine(context) {
    console.log(SCRIPT_ID, "validateLine Triggered!", context);
    return true; //Return true if the line is valid.
  }

  /**
   * Field Changed
   * @param {*} context
   */
  function fieldChanged(context) {
    const sublistId = context.sublistId;
    const fieldId = context.fieldId;
    const line = context.line;
    const column = 0;
    const currentRecord = context.currentRecord;
    console.log(SCRIPT_ID, "fieldChanged Triggered!", context);
    if (fieldId === "defaultaddress") {
      const defaultaddress = currentRecord.getValue({ fieldId: fieldId });
      currentRecord.setValue({
        fieldId: "custentity_address_verification",
        value: formatAddressStandardization(defaultaddress)
      });
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
  exports.pageInit = pageInit;
  exports.lineInit = lineInit;
  exports.postSourcing = postSourcing;
  exports.saveRecord = saveRecord;
  exports.sublistChanged = sublistChanged;
  exports.validateDelete = validateDelete;
  exports.validateField = validateField;
  exports.validateInsert = validateInsert;
  exports.validateLine = validateLine;
  exports.fieldChanged = fieldChanged;
  return exports;
});
