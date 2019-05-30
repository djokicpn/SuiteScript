/**
 *  Custom lead form user event script
 * 
 *  @NApiVersion 2.x
 *  @NScriptType UserEventScript
 */
define([], function() {
  function beforeLoad(context) {
    const type = context.type;
    if (type === context.UserEventType.EDIT) {
      var form = context.form;
      var submitconvert = form.getButton({
        id: "submitconvert"
      });
      if (submitconvert) {
        submitconvert.isHidden = true;
      }
    }
  }

  function beforeSubmit(context) {}

  function afterSubmit(context) {}

  return {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit
  };
});
