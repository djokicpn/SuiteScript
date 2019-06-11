/**
 *
 * Customer Search Portlet
 *
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @author trungpv <trung@lexor.com>
 */
define(["N/search", "N/ui/serverWidget"], function(search, serverWidget) {
  function render(params) {
    var portlet = params.portlet;
    portlet.title = "Customer Search";
    var html = "";
    try {
      html += buildSalesRepsHTMLTable();
    } catch (error) {
      html = "Sorry, something went wrong.";
    }
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

  /**
   * Convert Name
   * @param {*} firstname
   * @param {*} middlename
   * @param {*} lastname
   */
  function getName(firstname, middlename, lastname) {
    var name = "";
    name += firstname !== "" ? firstname : "";
    name += middlename !== "" ? " " + middlename : "";
    name += lastname !== "" ? " " + lastname : "";
    return name;
  }

  /**
   * Build Sales Reps HTML Table
   */
  function buildSalesRepsHTMLTable() {
    var html = '<table style="width:100%">';
    const header = "<tr><th>SALES REP</th><th>EMAIL</th><th>Turn</th></tr>";
    const rowTemplate =
      "<tr><td>__NAME__</td><td>__EMAIL__</td><td>__TURN__</td></tr>";
    html += header;
    var salesReps = search.create({
      type: search.Type.EMPLOYEE,
      filters: [
        {
          name: "salesrep",
          operator: search.Operator.IS,
          values: "T"
        },
        {
          name: "isinactive",
          operator: search.Operator.IS,
          values: "F"
        }
      ],
      columns: ["firstname", "middlename", "lastname", "email"]
    });
    var searchResults = salesReps.run().getRange({ start: 0, end: 1000 });
    for (var index = 0; index < searchResults.length; index++) {
      var element = searchResults[index];
      var row = rowTemplate;
      row = replaceAll(
        row,
        "__NAME__",
        getName(
          element.getValue({ name: "firstname" }),
          element.getValue({ name: "middlename" }),
          element.getValue({ name: "lastname" })
        )
      );
      row = replaceAll(row, "__EMAIL__", element.getValue({ name: "email" }));
      row = replaceAll(row, "__TURN__", index + 1);
      html += row;
    }
    html += "</table>";
    return html;
  }

  return {
    render: render
  };
});
