/**
 *
 * Custom Assembly Unbuild Form
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(["N/record"], function(record) {
  const MODULE_NAME = "CUSTOM_ASSEMBLY_UNBUILD_UES";

  function beforeLoad(context) {
    const type = context.type;
    if (type !== context.UserEventType.CREATE) return;
    var unbuildRecord = context.newRecord;

    log.debug({
      title: MODULE_NAME + " Before Log",
      details: "action=" + context.type
    });

    const component = unbuildRecord.getSublist({
      sublistId: "component"
    });
    log.debug({
      title: MODULE_NAME + " Before Log",
      details: component
    });
  }

  function beforeSubmit(context) {
    log.debug({
      title: MODULE_NAME + " Before Submit",
      details: "action=" + context.type
    });
  }

  function afterSubmit(context) {
    log.debug({
      title: MODULE_NAME + " After Submit",
      details: "action=" + context.type
    });
  }

  /**
   * Export Events
   */
  var exports = {};
  exports.beforeLoad = beforeLoad;
  exports.beforeSubmit = beforeSubmit;
  exports.afterSubmit = afterSubmit;
  return exports;
});
