/**
 * Sales Reps Restlet API
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @author trungpv <trung@lexor.com>
 */
define(["N/search", "N/record"], function(search, record) {
  function _get(context) {
    var salesTerritories = search.create({
      type: search.Type.CUSTOM_RECORD,
      filters: [
        {
          name: "isinactive",
          operator: search.Operator.IS,
          values: "F"
        }
      ],
      columns: ["name"]
    });
    var searchResults = salesTerritories
      .run()
      .getRange({ start: 0, end: 1000 });
    return searchResults;
  }

  function _post(context) {}

  function _put(context) {}

  function _delete(context) {}

  return {
    get: _get,
    post: _post,
    put: _put,
    delete: _delete
  };
});
