define([], function() {
  /**
   * Custom Assembly Unbuild Form
   * @NApiVersion 2.x
   * @NModuleScope Public
   * @NScriptType ClientScript
   * @author trungpv <trung@lexor.com>
   */

  /* === VARS === */
  const MODULE_NAME = 'CUSTOM_ASSEMBLY_UNBUILD';

  /* === EVENTS FUNCTIONS === */
  /**
   * Line Init
   * @param {*} context
   */
  function lineInit(context) {
    console.log(MODULE_NAME, "lineInit Triggered!", context);
    return;
  }

  /**
   * Page Init
   * @param {*} context
   */
  function pageInit(context) {
    const currentRecord = context.currentRecord;
    console.log(MODULE_NAME, "pageInit Triggered!", context);
    const component = currentRecord.getSublist({
        sublistId: 'component',
    });
    
    console.log(MODULE_NAME, "pageInit Triggered!", component);
    return;
  }

  /**
   * Post Sourcing
   * @param {*} context
   */
  function postSourcing(context) {
    console.log(MODULE_NAME, "postSourcing Triggered!", context);
    return;
  }

  /**
   * Save Record
   * @param {*} context
   */
  function saveRecord(context) {
    console.log(MODULE_NAME, "saveRecord Triggered!", context);
    return true; //Return true if you want to continue saving the record.
  }

  /**
   * Sublist Changed
   * @param {*} context
   */
  function sublistChanged(context) {
    console.log(MODULE_NAME, "sublistChanged Triggered!", context);
  }

  /**
   * Validate Delete
   * @param {*} context
   */
  function validateDelete(context) {
    console.log(MODULE_NAME, "validateDelete Triggered!", context);
    return true; //Return true if the line deletion is valid.
  }

  /**
   * Validate Field
   * @param {*} context
   */
  function validateField(context) {
    console.log(MODULE_NAME, "validateField Triggered!", context);
    return true; //Return true to continue with the change.
  }

  /**
   * Validate Insert
   * @param {*} context
   */
  function validateInsert(context) {
    console.log(MODULE_NAME, "validateInsert Triggered!", context);
    return true; //Return true if the line insertion is valid.
  }

  /**
   * Validate Line
   * @param {*} context
   */
  function validateLine(context) {
    console.log(MODULE_NAME, "validateLine Triggered!", context);
    return true; //Return true if the line is valid.
  }

  /**
   * Field Changed
   * @param {*} context
   */
  function fieldChanged(context) {
    console.log(MODULE_NAME, "fieldChanged Triggered!", context);
    return;
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
