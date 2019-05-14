define([], function() {
  /**
   * Add Google Autocomplete for Address
   * @NApiVersion 2.x
   * @NScriptType ClientScript
   */

  /* === VARS === */
  const API_KEY = "***REMOVED***";
  const GOOGLE_API =
    "https://maps.googleapis.com/maps/api/js?key=" +
    API_KEY +
    "&libraries=places";
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
    street_number: "addr2",
    route: "addr3",
    administrative_area_level_1: "inpt_dropdownstate2",
    locality: "city",
    postal_code: "zip"
  };

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
        google.maps.event.addListener(
          autocomplete,
          "place_changed",
          function fillInAddress() {
            // Callback when user choosed address
            var place = autocomplete.getPlace();
            // Fill Address Form
            for (var i = 0; i < place.address_components.length; i++) {
              var addressType = place.address_components[i].types[0];
              if (ADDRESS_COMPONENTS[addressType]) {
                var val =
                  place.address_components[i][ADDRESS_COMPONENTS[addressType]];
                // Set Data
                currentRecord.setValue({
                  fieldId: ADDRESS_FIELDS[addressType],
                  value: val
                });
              }
            }
            currentRecord.setValue({
              fieldId: 'addr1',
              value: window.document.getElementById("addr1").value
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

    var addr3 = currentRecord.getField({
      fieldId: "addr3"
    });
    if (addr3) {
      addr3.isDisabled = true;
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
   * Export Events
   */
  var exports = {};
  exports.pageInit = pageInit;
  return exports;
});
