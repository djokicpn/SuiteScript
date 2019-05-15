define([], function() {
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
  const SCRIPT_ID = "google_api_address_client_script_2x";

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
            resetUI(currentRecord);
            // Callback when user choosed address
            var place = autocomplete.getPlace();
            var address = parseAddress(place.address_components);
            updateUI(currentRecord, address);
            currentRecord.setValue({
              fieldId: "addr1",
              value: place.formatted_address
            });
          }
        );
      };
      scriptGoogleAPI.src = GOOGLE_API;
      window.document.head.appendChild(scriptGoogleAPI);
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
   * Export Events
   */
  var exports = {};
  exports.pageInit = pageInit;
  return exports;
});
