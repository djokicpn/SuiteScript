/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(["N/search"], function(search) {
    /**
     * GET
     * @param {*} context
     */
    function getAction(context) {
      var result = {};
      result.success = false;
  
      try {
        result.success = true;
        result.message = "Success!";
      } catch (err) {
        result.message = err.message;
      }
      return result;
    }
  
    /**
     * POST
     * @param {*} context
     */
    function postAction(context) {
      var result = {};
      result.success = false;
  
      try {
        result.success = true;
        result.message = "Success!";
      } catch (err) {
        result.message = err.message;
      }
      return result;
    }
  
    /**
     * DELETE
     * @param {*} context
     */
    function deleteAction(context) {
      var result = {};
      result.success = false;
  
      try {
        result.success = true;
        result.message = "Success!";
      } catch (err) {
        result.message = err.message;
      }
      return result;
    }
  
    /**
     * PUT
     * @param {*} context
     */
    function putAction(context) {
      var result = {};
      result.success = false;
  
      try {
        result.success = true;
        result.message = "Success!";
      } catch (err) {
        result.message = err.message;
      }
      return result;
    }
  
    /**
     * Export Events
     */
    var exports = {};
    exports.get = getAction;
    exports.post = postAction;
    exports.delete = deleteAction;
    exports.put = putAction;
    return exports;
  });
  