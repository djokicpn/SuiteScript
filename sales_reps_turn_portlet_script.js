/**
 *
 * Sales Reps Turn Portlet
 *
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @author trungpv <trung@lexor.com>
 */
define(["N/search"], function(search) {
  function render(params) {
    var portlet = params.portlet;
    portlet.title = "Sales Reps Turn";
    var html = '<table style="width:100%">';
    const header = "<tr><th>Firstname</th><th>Lastname</th></tr>";
    const rowTemplate =
      "<tr><td>__FIRST_NAME__</td><td>__LAST_NAME__</td></tr>";
    html += header;
    var salesReps = search.create({
      type: search.Type.EMPLOYEE,
      filters: [
        {
          name: "salesrole",
          operator: search.Operator.IS,
          values: "-2"
        },
        {
          name: "isinactive",
          operator: search.Operator.IS,
          values: "F"
        }
      ],
      columns: ["firstname", "lastname"]
    });
    var searchResults = salesReps.run().getRange({ start: 0, end: 1000 });
    for (var index = 0; index < searchResults.length; index++) {
      var element = searchResults[index];
      var row = rowTemplate;
      row = replaceAll(row, "__FIRST_NAME__", element.getValue({name: 'firstname'}));
      row = replaceAll(row, "__LAST_NAME__", element.getValue({name: 'lastname'}));
      html += row;
    }
    html += "</table>";
    portlet.html = html;
  }

  /**
   * Helper Functions
   */
  /**
   * Replace all
   * @param {*} string
   * @param {*} target
   * @param {*} replacement
   */
  function replaceAll(string, target, replacement) {
    return string.split(target).join(replacement);
  }

  return {
    render: render
  };
});
