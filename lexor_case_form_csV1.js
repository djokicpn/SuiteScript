define(["N/search", "/SuiteScripts/lib/autocomplete"], function(
  search,
  autocomplete
) {
  /**
   * Lexor Case Form
   * @NApiVersion 2.x
   * @NScriptType ClientScript
   * @author trungpv <trung@lexor.com>
   */

  /* === VARS === */

  /* === EVENTS FUNCTIONS === */

  /**
   * Page Init
   * @param {*} context
   */
  function pageInit(context) {
    const currentRecord = context.currentRecord;

    loadCSSText(
      ".autocomplete{background:#fff;z-index:1000;overflow:auto;box-sizing:border-box;border:1px solid #ccc;font-size:13px}.autocomplete>div{padding:5px 5px;border-bottom:1px solid #ccc}.autocomplete .group{background:#eee}.autocomplete>div.selected,.autocomplete>div:hover:not(.group){background:#607799;cursor:pointer;color:#fff}"
    );

    var phone = document.getElementById("phone");
    autocomplete({
      input: phone,
      fetch: function(text, update) {
        // Start Search
        search.global
          .promise({
            keywords: text
          })
          .then(function(globalSearchResults) {
            processSupportCases(globalSearchResults, function(supportCases) {
              loadSupportCase(supportCases, function(dataSupportCase) {
                getSupportCase(dataSupportCase, function(arrItems) {
                  var items = [];
                  for (var index = 0; index < arrItems.length; index++) {
                    var arrItem = arrItems[index].data;
                    items = items.concat(arrItem);
                  }
                  update(items);
                });
              });
            });
          })
          .catch(function onRejected(reason) {});
      },
      render: function(el, currentValue) {
        console.log(el);
        var div = document.createElement("div");
        var formatStr =
          '<p><strong style="font-weight: bold;">' +
          el.recordType +
          "</strong></p>";
        // formatStr +=
        //   '<p>Name: <strong style="font-weight: bold;">' +
        //   title +
        //   "</strong></p>";
        // formatStr +=
        //   '<p>Status: <strong style="font-weight: bold;">' +
        //   status +
        //   "</strong></p>";
        // formatStr +=
        //   '<p>Assigned To: <strong style="font-weight: bold;">' +
        //   assigned +
        //   "</strong></p>";
        // formatStr +=
        //   '<p>Phone: <strong style="font-weight: bold;">' +
        //   phone +
        //   "</strong></p>";
        div.innerHTML = formatStr;
        return div;
      },
      onSelect: function(item) {
        NS.jQuery("#phone").val("");
        window.open("/app/crm/support/supportcase.nl?id=" + item.id, "_blank");
      }
    });

    return;
  }

  /** HELPER FUNCTIONS **/

  /**
   * Load CSS from Text
   * @param {*} str
   */
  function loadCSSText(str) {
    if (window.document) {
      var fileref = window.document.createElement("style");
      fileref.innerHTML = str;
      window.document.head.appendChild(fileref);
    }
  }

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function arrayFilter(array, predicate) {
    var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
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
   * Process Support Cases
   * @param {*} globalSearchResults
   * @param {*} done
   */
  function processSupportCases(globalSearchResults, done) {
    const types = ["Customer", "Lead", "Prospect"];
    var promises = [];
    for (var index = 0; index < globalSearchResults.length; index++) {
      var o = globalSearchResults[index];
      if (
        (o.getValue({
          name: "info1"
        }) !== "" ||
          o.getValue({
            name: "info2"
          }) !== "") &&
        types.includes(
          o.getValue({
            name: "type"
          })
        )
      ) {
        promises.push(
          search.create.promise({
            type: search.Type.SUPPORT_CASE,
            filters: [["company.internalid", search.Operator.IS, [o.id]]],
            columns: [
              search.createColumn({
                name: "casenumber",
                sort: search.Sort.DESC
              }),
              // "title",
              // "stage",
              // "status",
              // "employee.firstname"
            ]
          })
        );
      }
    }
    Promise.all(promises)
      .then(done)
      .catch(function onRejected(reason) {
        console.log("processSupportCases", reason);
      });
  }

  /**
   * Load Support Case
   * @param {*} supportCase
   * @param {*} done
   */
  function loadSupportCase(supportCases, done) {
    var promises = [];
    for (var index = 0; index < supportCases.length; index++) {
      promises.push(supportCases[index].runPaged.promise());
    }
    Promise.all(promises)
      .then(done)
      .catch(function onRejected(reason) {
        console.log("loadSupportCase", reason);
      });
  }

  /**
   * Get Support Case Detail
   * @param {*} dataSupportCases
   * @param {*} done
   */
  function getSupportCase(dataSupportCase, done) {
    var promises = [];
    for (var index = 0; index < dataSupportCase.length; index++) {
      var _dSC = dataSupportCase[index];
      if (_dSC.pageRanges.length > 0) {
        for (var i = 0; i < _dSC.pageRanges.length; i++) {
          promises.push(
            _dSC.fetch.promise({
              index: i
            })
          );
        }
      }
    }
    Promise.all(promises)
      .then(done)
      .catch(function onRejected(reason) {
        console.log("getSupportCase", reason);
      });
  }

  /**
   * Export Events
   */
  var exports = {};
  exports.pageInit = pageInit;
  return exports;
});
