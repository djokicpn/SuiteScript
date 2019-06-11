define(["N/search", "N/runtime"], function(search, runtime) {
  /**
   * Add Google Autocomplete for Address
   * @NApiVersion 2.x
   * @NScriptType ClientScript
   * @author trungpv <trung@lexor.com>
   */

  /* === VARS === */
  const API_KEY = "***REMOVED***";
  const GOOGLE_API =
    "https://maps.googleapis.com/maps/api/js?key=" +
    API_KEY +
    "&libraries=places";

  /* === EVENTS FUNCTIONS === */

  /**
   * Page Init
   * @param {*} context
   */
  function pageInit(context) {
    var currentRecord = context.currentRecord;
    var mode = context.mode;
    initUI(currentRecord);
    // Create el inject html page
    if (window.document) {
      var scriptGoogleAPI = window.document.createElement("script");
      // Run when google api load
      scriptGoogleAPI.onload = function() {
        var inputAddress = window.document.getElementById("addr1");
        var autocomplete = new google.maps.places.Autocomplete(inputAddress, {
          types: ["geocode"]
        });
        // Set initial restrict to the greater list of countries.
        autocomplete.setComponentRestrictions({
          country: ["us", "pr", "vi", "gu", "mp"]
        });
        google.maps.event.addListener(
          autocomplete,
          "place_changed",
          function fillInAddress() {
            var listAddressExists = window.document.getElementById(
              "listAddressExists"
            );
            listAddressExists.innerHTML = "";
            resetUI(currentRecord);
            // Callback when user choosed address
            var place = autocomplete.getPlace();
            if (place.address_components !== undefined) {
              var address = parseAddress(place.address_components);
              updateUI(currentRecord, address);
              currentRecord.setValue({
                fieldId: "addr1",
                value: place.formatted_address
              });

              var addr2 = window.document.getElementById("addr2");
              if (addr2) {
                checkAddress(addr2.value);
              }
            }
          }
        );
      };
      scriptGoogleAPI.src = GOOGLE_API;
      window.document.head.appendChild(scriptGoogleAPI);

      loadCSSText(
        ".autocomplete{background:#fff;z-index:1000;overflow:auto;box-sizing:border-box;border:1px solid #ccc;font-size:13px}.autocomplete>div{padding:5px 5px;border-bottom:1px solid #ccc}.autocomplete .group{background:#eee}.autocomplete>div.selected,.autocomplete>div:hover:not(.group){background:#607799;cursor:pointer;color:#fff}"
      );

      // Add List
      var trList = window.document.createElement("tr");
      trList.innerHTML =
        '<td style="font-size: 13px;"><div class="autocomplete" id="listAddressExists"></div></td>';
      var addrtextElm = window.document.getElementById("addrtext"); //div in your original code
      var selector = "tbody";
      var parent = findParentBySelector(addrtextElm, selector);
      parent.appendChild(trList);

      // Init Check Address
      var addr2 = window.document.getElementById("addr2");
      if (addr2 && addr2.value !== "") {
        checkAddress(addr2.value);
      }
    }
    return;
  }

  /* HELPER FUNCTIONS */
  /**
   * Init UI
   * @param {*} currentRecord
   */
  function initUI(currentRecord) {
    var addr2 = currentRecord.getField({
      fieldId: "addr2"
    });
    if (addr2) {
      addr2.isDisabled = true;
    }

    var inpt_dropdownstate2 = currentRecord.getField({
      fieldId: "inpt_dropdownstate2"
    });
    if (inpt_dropdownstate2) {
      inpt_dropdownstate2.isDisabled = true;
    }

    var city = currentRecord.getField({
      fieldId: "city"
    });
    if (city) {
      city.isDisabled = true;
    }

    var zip = currentRecord.getField({
      fieldId: "zip"
    });
    if (zip) {
      zip.isDisabled = true;
    }

    var currentUser = runtime.getCurrentUser();
    const role = currentUser.role;
    var override = currentRecord.getField({
      fieldId: "override"
    });
    if (override) {
      // 3 Administrator
      // 1069	Lexor | Sales Director
      // 1037	Lexor | Sales Manager
      if (!(role === 3 || role === 1069 || role === 1037)) {
        var addrtext = currentRecord.getField({
          fieldId: "addrtext"
        });
        if (addrtext) {
          addrtext.isDisabled = true;
        }
        override.isDisplay = false;
        addrtext.isDisabled = true;
      }
    }

    // Hide
    // defaultshipping
    hideField(currentRecord, "defaultshipping");
    // defaultbilling
    hideField(currentRecord, "defaultbilling");
    // isresidential
    hideField(currentRecord, "isresidential");
    // entity
    // hideField(currentRecord, 'entity');
    if (window.document) {
      var entity = window.document.getElementById("entity_lbl_uir_label");
      if (entity) {
        entity.parentNode.style.display = "none";
      }
    }
  }

  /**
   * Update UI
   * @param {*} currentRecord
   */
  function updateUI(currentRecord, address) {
    if (address["addr1"] !== undefined && address["addr2"] !== undefined) {
      currentRecord.setValue({
        fieldId: "addr2",
        value: address["addr1"] + " " + address["addr2"]
      });
    }

    if (address["inpt_dropdownstate2"] !== undefined) {
      currentRecord.setValue({
        fieldId: "inpt_dropdownstate2",
        value: address["inpt_dropdownstate2"]
      });
    }

    if (address["city"] !== undefined) {
      currentRecord.setValue({
        fieldId: "city",
        value: address["city"]
      });
    }

    if (address["zip"] !== undefined) {
      currentRecord.setValue({
        fieldId: "zip",
        value: address["zip"]
      });
    }
  }

  /**
   * Reset UI
   * @param {*} currentRecord
   */
  function resetUI(currentRecord) {
    const FORM_FIELDS = [
      "addr1",
      "addr2",
      "addr3",
      "inpt_dropdownstate2",
      "city",
      "zip"
    ];
    for (var index = 0; index < FORM_FIELDS.length; index++) {
      const fieldName = FORM_FIELDS[index];
      currentRecord.setValue({
        fieldId: fieldName,
        value: ""
      });
    }
  }

  /**
   * Hide Field
   * @param {*} currentRecord
   * @param {*} fieldName
   */
  function hideField(currentRecord, fieldName) {
    var field = currentRecord.getField({
      fieldId: fieldName
    });
    if (field) {
      field.isDisplay = false;
    }
  }

  /**
   * Parse Address
   * @param {*} address_components
   */
  function parseAddress(address_components) {
    var result = [];
    // Google API map fields
    const ADDRESS_COMPONENTS = {
      street_number: "short_name",
      route: "long_name",
      locality: "long_name",
      administrative_area_level_1: "short_name",
      postal_code: "short_name"
    };
    // Config Address Form
    const ADDRESS_FIELDS = {
      street_number: "addr1",
      route: "addr2",
      administrative_area_level_1: "inpt_dropdownstate2",
      locality: "city",
      postal_code: "zip"
    };
    for (var i = 0; i < address_components.length; i++) {
      var addressType = address_components[i].types[0];
      if (ADDRESS_COMPONENTS[addressType]) {
        var val = address_components[i][ADDRESS_COMPONENTS[addressType]];
        result[ADDRESS_FIELDS[addressType]] = val;
      }
    }
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
   * 
   * @param {*} a 
   * @param {*} b 
   */
  function collectionHas(a, b) {
    //helper function (see below)
    for (var i = 0, len = a.length; i < len; i++) {
      if (a[i] == b) return true;
    }
    return false;
  }

  /**
   * 
   * @param {*} elm 
   * @param {*} selector 
   */
  function findParentBySelector(elm, selector) {
    var all = document.querySelectorAll(selector);
    var cur = elm.parentNode;
    while (cur && !collectionHas(all, cur)) {
      //keep going up until you find a match
      cur = cur.parentNode; //go up
    }
    return cur; //will return null if not found
  }

  /**
   * Check Address
   * @param {*} text
   */
  function checkAddress(text) {
    // Start Search
    const types = ["Customer", "Lead", "Prospect"];
    search.global
      .promise({
        keywords: text
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
                  "firstname",
                  "middlename",
                  "lastname",
                  "companyname",
                  "custentity_address_verification",
                  "entitystatus"
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
              var name = el.getValue({
                name: "name"
              });
              var type = el.getValue({
                name: "type"
              });
              var info1 = el.getValue({
                name: "info1"
              });
              var info2 = el.getValue({
                name: "info2"
              });
              results[index].id = el.id;
              results[index].name = name;
              results[index].type = type;
              results[index].info1 = info1;
              results[index].info2 = info2;
            }
            updateSearchAddress(results);
          })
          .catch(function onRejected(reason) {});
      })
      .catch(function onRejected(reason) {});
  }

  /**
   * Update List Address
   * @param {*} results
   */
  function updateSearchAddress(results) {
    var listAddressExists = window.document.getElementById("listAddressExists");
    listAddressExists.innerHTML = "";
    for (var index = 0; index < results.length; index++) {
      var element = results[index];
      var divAddress = window.document.createElement("div");
      divAddress.onclick = function() {
        window.open("/app/common/entity/custjob.nl?id=" + element.id, "_blank");
      };
      var formatStr =
        "<p>" +
        element.type +
        ': <strong style="font-weight: bold;">' +
        element.name +
        "</strong></p>";
      formatStr +=
        '<p>Name: <strong style="font-weight: bold;">' +
        getName(element.firstname, element.middlename, element.lastname) +
        (element.companyname ? " (" + element.companyname + ")" : "") +
        "</strong></p>";
      formatStr +=
        '<p>Status: <strong style="font-weight: bold;">' +
        (element.entitystatus.length > 0
          ? element.entitystatus[0].text
          : "None") +
        "</strong></p>";
      formatStr +=
        '<p>Address: <strong style="font-weight: bold;">' +
        element.custentity_address_verification +
        "</strong></p>";
      formatStr +=
        '<p>Phone: <strong style="font-weight: bold;">' +
        element.info2 +
        "</strong></p>";
      divAddress.innerHTML = formatStr;
      listAddressExists.appendChild(divAddress);
    }
  }

  /**
   * Export Events
   */
  var exports = {};
  exports.pageInit = pageInit;
  return exports;
});
