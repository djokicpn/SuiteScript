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
   * Field Changed
   * @param {*} context
   */
  function fieldChanged(context) {
    const currentRecord = context.currentRecord;
    const fieldId = context.fieldId;
    if (fieldId === "phone") {
      const phone = currentRecord.getValue({
        fieldId: "phone"
      });
      if (phone) {
        currentRecord.setValue({
          fieldId: "custevent_case_phone_number",
          value: phone
        });
      }
    }
    return;
  }

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
        text = phoneFormat(text);
        // Start Search
        const types = ["Case"];
        search.global
          .promise({
            keywords: "%" + text + "%"
          })
          .then(function(result) {
            var promises = [];
            result = arrayFilter(result, function(o) {
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
                  search.lookupFields.promise({
                    type: o.recordType,
                    id: o.id,
                    columns: [
                      "casenumber",
                      "title",
                      "status",
                      "stage",
                      "assigned",
                      "issue",
                      "custevent_case_phone_number"
                    ]
                  })
                );
                return o;
              }
            });
            Promise.all(promises)
              .then(function(results) {
                for (var index = 0; index < result.length; index++) {
                  var el = result[index];
                  results[index].id = el.id;
                }
                update(results);
              })
              .catch(function onRejected(reason) {});
          })
          .catch(function onRejected(reason) {});
      },
      render: function(el, currentValue) {
        var div = document.createElement("div");
        var formatStr =
          '<p>Case Number: <strong style="font-weight: bold;">' +
          el.casenumber +
          "</strong></p>";
        formatStr +=
          '<p>Name: <strong style="font-weight: bold;">' +
          el.title +
          "</strong></p>";
        formatStr +=
          '<p>Status: <strong style="font-weight: bold;">' +
          (el.status.length > 0 ? el.status[0].text : "None") +
          "</strong></p>";
        formatStr +=
          '<p>Case Issue: <strong style="font-weight: bold;">' +
          (el.issue.length > 0 ? el.issue[0].text : "None") +
          "</strong></p>";
        formatStr +=
          '<p>Assigned To: <strong style="font-weight: bold;">' +
          (el.assigned.length > 0 ? el.assigned[0].text : "None") +
          "</strong></p>";
        formatStr +=
          '<p>Phone: <strong style="font-weight: bold;">' +
          el.custevent_case_phone_number +
          "</strong></p>";
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
  function formatAddressStandardization(address) {
    address = address.split("\n");
    var result = "";
    if (address.length >= 4) {
      address.splice(0, 1);
      if (address.length === 4) {
        address.splice(1, 1);
      }
    }

    result = address.join("\n");
    return result;
  }

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
   * Format Phone Number
   * @param {*} val
   */
  function phoneFormat(val) {
    var extidx = val.search(/[A-Za-z]/);
    var ext = "";
    if (extidx >= 0) {
      ext = " " + val.substring(extidx);
      val = val.substring(0, extidx);
    }
    var re = /^[0-9()-.\s]+$/;
    var digits = val.replace(/[()-.\s]/g, "");
    if (re.test(val)) {
      var phoneformat = "(123) 456-7890".replace(
        new RegExp("[360]", "g"),
        String.fromCharCode(3)
      );
      if (digits.length == 7) {
        digits =
          phoneformat
            .replace(phoneformat.substring(0, phoneformat.indexOf("4")), "")
            .replace("45" + String.fromCharCode(3), digits.substring(0, 3))
            .replace("789" + String.fromCharCode(3), digits.substring(3)) + ext;
      } else if (digits.length == 10) {
        digits =
          phoneformat
            .replace("12" + String.fromCharCode(3), digits.substring(0, 3))
            .replace("45" + String.fromCharCode(3), digits.substring(3, 6))
            .replace("789" + String.fromCharCode(3), digits.substring(6)) + ext;
      } else if (digits.length == 11 && digits.substring(0, 1) == "1") {
        digits =
          "1 " +
          phoneformat
            .replace("12" + String.fromCharCode(3), digits.substring(1, 4))
            .replace("45" + String.fromCharCode(3), digits.substring(4, 7))
            .replace("789" + String.fromCharCode(3), digits.substring(7)) +
          ext;
      }
    }

    return digits;
  }

  /**
   * Export Events
   */
  var exports = {};
  exports.pageInit = pageInit;
  exports.fieldChanged = fieldChanged;
  return exports;
});
