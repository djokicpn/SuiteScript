/**
 * REST API for Support Cases
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @author trungpv <trung@lexor.com>
 */
define(["N/search", "N/record"], function(search, record) {
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
      var searchPayload = search.create({
        type: search.Type.SUPPORT_CASE,
        filters: [["custevent_case_phone_number", search.Operator.ISEMPTY, []]],
        columns: [
          search.createColumn({
            name: "casenumber",
            sort: search.Sort.DESC
          })
          // "title",
          // "stage",
          // "status",
          // "custevent_case_phone_number",
          // "customer.phone"
        ]
      });
      supportCases = [];
      errors = [];
      var data = searchPayload.run().getRange({ start: 0, end: 1000 });
      for (var index = 0; index < data.length; index++) {
        var supportCase = data[index];
        supportCase = record.load({
          type: record.Type.SUPPORT_CASE,
          id: supportCase.id
        });
        supportCaseJSON = supportCase.toJSON();
        try {
          // supportCase.setValue(
          //   "custevent_case_phone_number",
          //   supportCaseJSON.fields.phone
          // );
          // supportCase.save();
          supportCases.push(supportCase);
        } catch (error) {
          var errorArr = {};
          errorArr.casenumber = supportCaseJSON.fields.casenumber;
          errorArr.msg = error.message;
          supportCases.push(errorArr);
        }
      }
      result.count = supportCases.length;
      result.data = supportCases;
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
