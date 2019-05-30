define(["N/search", "/SuiteScripts/lib/autocomplete"], function(
  search,
  autocomplete
) {
  /**
   * Call Center Lead Form
   * @NApiVersion 2.x
   * @NScriptType ClientScript
   * @author trungpv <trung@lexor.com>
   */

  /* === VARS === */

  /* === EVENTS FUNCTIONS === */

  /**
   * Sublist Changed
   * @param {*} context
   */
  function sublistChanged(context) {
    const currentRecord = context.currentRecord;
    const sublistId = context.sublistId;
    const operation = context.operation;

    if (sublistId === "addressbook") {
      const defaultbilling = currentRecord.getCurrentSublistValue({
        sublistId: sublistId,
        fieldId: "defaultbilling"
      });
      const defaultshipping = currentRecord.getCurrentSublistValue({
        sublistId: sublistId,
        fieldId: "defaultshipping"
      });

      if (operation === "remove") {
        // Reset Default Value when remove address
        if (defaultbilling) {
          currentRecord.setValue({
            fieldId: "defaultaddress",
            value: ""
          });
        }
        if (defaultshipping) {
          currentRecord.setValue({
            fieldId: "custentity_address_verification",
            value: ""
          });
        }
      } else {
        if (defaultshipping) {
          const addressbookaddress_text = currentRecord.getCurrentSublistValue({
            sublistId: sublistId,
            fieldId: "addressbookaddress_text"
          });
          var addressArr = addressbookaddress_text.split("\n");
          if (addressArr.length > 3) {
            currentRecord.setValue({
              fieldId: "custentity_address_verification",
              value: formatAddressStandardization(addressbookaddress_text)
            });
          } else {
            currentRecord.setValue({
              fieldId: "custentity_address_verification",
              value: ""
            });
          }
        }
      }
    }
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

    // var input = document.getElementById('custentity_search_phone');
    var mobilephone = document.getElementById("mobilephone");
    autocomplete({
      input: mobilephone,
      fetch: function(text, update) {
        // Start Search
        const types = ["Customer", "Lead", "Prospect"];
        search.global
          .promise({
            keywords: text
          })
          .then(function(result) {
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
                return o;
              }
            });
            update(result);
          })
          .catch(function onRejected(reason) {});
      },
      render: function(element, currentValue) {
        var div = document.createElement("div");
        var name = element.getValue({
          name: "name"
        });
        var type = element.getValue({
          name: "type"
        });
        var info1 = element.getValue({
          name: "info1"
        });
        var info2 = element.getValue({
          name: "info2"
        });
        var formatStr = "<p><strong>" + type + ": " + name + "</strong></p>";
        formatStr += info1 ? "<p> - " + info1 + "</p>" : "";
        formatStr += info2 ? "<p> - " + info2 + "</p>" : "";
        // div.textContent = item.label;
        div.innerHTML = formatStr;
        return div;
      },
      onSelect: function(item) {
        NS.jQuery("#mobilephone").val("");
        window.open("/app/common/entity/custjob.nl?id=" + item.id, "_blank");
      }
    });

    var phone = document.getElementById("phone");
    autocomplete({
      input: phone,
      fetch: function(text, update) {
        // Start Search
        const types = ["Customer", "Lead", "Prospect"];
        search.global
          .promise({
            keywords: text
          })
          .then(function(result) {
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
                return o;
              }
            });
            update(result);
          })
          .catch(function onRejected(reason) {});
      },
      render: function(element, currentValue) {
        var div = document.createElement("div");
        var name = element.getValue({
          name: "name"
        });
        var type = element.getValue({
          name: "type"
        });
        var info1 = element.getValue({
          name: "info1"
        });
        var info2 = element.getValue({
          name: "info2"
        });
        var formatStr = "<p><strong>" + type + ": " + name + "</strong></p>";
        formatStr += info1 ? "<p> - " + info1 + "</p>" : "";
        formatStr += info2 ? "<p> - " + info2 + "</p>" : "";
        // div.textContent = item.label;
        div.innerHTML = formatStr;
        return div;
      },
      onSelect: function(item) {
        NS.jQuery("#phone").val("");
        window.open("/app/common/entity/custjob.nl?id=" + item.id, "_blank");
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
   * Export Events
   */
  var exports = {};
  exports.pageInit = pageInit;
  exports.sublistChanged = sublistChanged;
  return exports;
});
