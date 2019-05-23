define(["N/search", "/SuiteScripts/lib/lodash.min"], function(search, _) {
  /**
   * Add Google Map for Address form
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
    console.log("pageInit Triggered!", context);
    loadCSSText(
      ".autocomplete{position:relative;display:inline-block}.autocomplete-items{position:absolute;z-index:99;display:inline-block}.autocomplete-items div{padding:10px;cursor:pointer;background-color:#fff;border:1px solid #d4d4d4}.autocomplete-items div:hover{background-color:#e9e9e9}.autocomplete-active{background-color:#1e90ff!important;color:#fff}"
    );
    // jQuery(window.document).ready(function() {
    //   jQuery("#custentity_search_phone").keyup(function(e) {
    //     // Press Left Arrow
    //     if (e.which === 39) {
    //       const custentity_search_phone = jQuery(this).val();
    //       console.log(
    //         "custentity_search_phone = ",
    //         custentity_search_phone,
    //         search
    //       );
    //       /**--- */
    //       // var searchResults = search.global({
    //       //   keywords: custentity_search_phone
    //       // });
    //       // console.log("searchResults", searchResults);
    //       // for (var index = 0; index < searchResults.length; index++) {
    //       //   var element = searchResults[index];
    //       //   console.log(
    //       //     index,
    //       //     element.getValue({ name: "name" }),
    //       //     element.getValue({ name: "type" }),
    //       //     element.getValue({ name: "info1" }),
    //       //     element.getValue({ name: "info2" })
    //       //   );
    //       // }
    //       /**--- */
    //       const types = ["Customer", "Lead", "Prospect"];
    //       search.global
    //         .promise({
    //           keywords: custentity_search_phone
    //         })
    //         .then(function(result) {
    //           result = _.filter(result, function(o) {
    //             if (
    //               (o.getValue({ name: "info1" }) !== "" ||
    //                 o.getValue({ name: "info2" }) !== "") &&
    //               types.includes(o.getValue({ name: "type" }))
    //             ) {
    //               return o;
    //             }
    //           });
    //           console.log(result);
    //           for (var index = 0; index < result.length; index++) {
    //             var element = result[index];
    //             console.log(
    //               index,
    //               element.getValue({ name: "name" }),
    //               element.getValue({ name: "type" }),
    //               element.getValue({ name: "info1" }),
    //               element.getValue({ name: "info2" })
    //             );
    //           }
    //         })
    //         .catch(function onRejected(reason) {
    //           // do something on rejection
    //           console.log(reason);
    //         });
    //     }
    //   });
    // });

    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    var inp = document.getElementById("custentity_search_phone");
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("keyup", function(e) {
      // Press Left Arrow
      if (e.which === 39) {
        var a,
          b,
          i,
          val = this.value;
        var that = this;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
          return false;
        }

        // Start Search
        const types = ["Customer", "Lead", "Prospect"];
        search.global
          .promise({
            keywords: val
          })
          .then(function(result) {
            result = _.filter(result, function(o) {
              if (
                (o.getValue({ name: "info1" }) !== "" ||
                  o.getValue({ name: "info2" }) !== "") &&
                types.includes(o.getValue({ name: "type" }))
              ) {
                return o;
              }
            });
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            const inpPos = offset(inp);
            a.style.top = inpPos.top + 25 + "px";
            a.style.left = inpPos.left + "px";
            // a.style.display = "block";
            /*append the DIV element as a child of the autocomplete container:*/
            that.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < result.length; i++) {
              var element = result[i];
              var name = element.getValue({ name: "name" });
              var type = element.getValue({ name: "type" });
              var info1 = element.getValue({ name: "info1" });
              var info2 = element.getValue({ name: "info2" });
              var formatStr = "<p>" + type + ": " + name + '</p>';
              formatStr += info1 ? "<p> - " + info1 + '</p>' : '';
              formatStr += info2 ? "<p> - " + info2 + '</p>' : '';
              /*create a DIV element for each matching element:*/
              b = document.createElement("DIV");
              b.innerHTML = formatStr;
              /*insert a input field that will hold the current array item's value:*/
              b.innerHTML +=
                "<input type='hidden' value='" +
                formatStr;
              +"'>";
              /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                // inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
                closeAllLists();
              });
              a.appendChild(b);
            }
          })
          .catch(function onRejected(reason) {
            // do something on rejection
            console.log(reason);
          });
      }
    });
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function(e) {
      closeAllLists(e.target);
    });
    /**
     * Autocomplete
     */
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = x.length - 1;
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }

    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }

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
   * Load CSS File
   * @param {*} file
   */
  function loadCSS(file) {
    if (window.document) {
      var fileref = window.document.createElement("link");
      fileref.setAttribute("rel", "stylesheet");
      fileref.setAttribute("type", "text/css");
      fileref.setAttribute("href", file);
      window.document.head.appendChild(fileref);
    }
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

  function offset(el) {
    var rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
  }

  /**
   * Export Events
   */
  var exports = {};
  exports.pageInit = pageInit;
  exports.sublistChanged = sublistChanged;
  return exports;
});
