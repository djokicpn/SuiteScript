define([], function() {
  /**
   * Sample Client Script
   * @NApiVersion 2.x
   * @NModuleScope Public
   * @NScriptType ClientScript
   */

  /* === VARS === */

  /* === EVENTS FUNCTIONS === */
  /**
   * Line Init
   * @param {*} context 
   */
  function lineInit(context) {
    console.log("lineInit Triggered!");
    return;
  }

  /**
   * Page Init
   * @param {*} context 
   */
  function pageInit(context) {
    console.log("pageInit Triggered!");
    return;
  }

  /**
   * Post Sourcing
   * @param {*} context 
   */
  function postSourcing(context) {
    console.log("postSourcing Triggered!");
    return;
  }

  /**
   * Save Record
   * @param {*} context 
   */
  function saveRecord(context) {
    console.log("saveRecord Triggered!");
    return true; //Return true if you want to continue saving the record.
  }

  /**
   * Sublist Changed
   * @param {*} context 
   */
  function sublistChanged(context) {
    console.log("sublistChanged Triggered!");
  }

  /**
   * Validate Delete
   * @param {*} context 
   */
  function validateDelete(context) {
    console.log("validateDelete Triggered!");
    return true; //Return true if the line deletion is valid.
  }

  /**
   * Validate Field
   * @param {*} context 
   */
  function validateField(context) {
    console.log("validateField Triggered!");
    return true; //Return true to continue with the change.
  }

  /**
   * Validate Insert
   * @param {*} context 
   */
  function validateInsert(context) {
    console.log("validateInsert Triggered!");
    return true; //Return true if the line insertion is valid.
  }

  /**
   * Validate Line
   * @param {*} context 
   */
  function validateLine(context) {
    console.log("validateLine Triggered!");
    return true; //Return true if the line is valid.
  }

  /**
   * Field Changed
   * @param {*} context 
   */
  function fieldChanged(context) {
    console.log("fieldChanged Triggered!");
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
