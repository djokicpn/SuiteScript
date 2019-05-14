define([], function() {
  /**
   * Add Google Map for Address form
   * @NApiVersion 2.x
   * @NModuleScope Public
   * @NScriptType ClientScript
   */

  /* === VARS === */
  const API_KEY = "***REMOVED***";
  const GOOGLE_API =
    "https://maps.googleapis.com/maps/api/js?key=" +
    API_KEY +
    "&libraries=places";
  const HIDDEN_FORM = [
    "street_number",
    "route",
    "locality",
    "administrative_area_level_1",
    "country",
    "postal_code"
  ];
  const COMPONENT_FORM = {
    street_number: "short_name",
    route: "long_name",
    locality: "long_name",
    administrative_area_level_1: "short_name",
    country: "long_name",
    postal_code: "short_name"
  };

  /* === EVENTS FUNCTIONS === */

  /**
   * Page Init
   * @param {*} context
   */
  function pageInit(context) {
    var currentRecord = context.currentRecord;

    // Create Hidden Form
    for (var index = 0; index < HIDDEN_FORM.length; index++) {
      const element = HIDDEN_FORM[index];
      createEl(element);
    }
    // inject google map js
    var GoogleAPI = document.createElement("script");
    GoogleAPI.src = GOOGLE_API;
    document.head.appendChild(GoogleAPI);
    // Run when google api load
    GoogleAPI.onload = function() {
      var inputAddress = window.document.getElementById(
        "custentity_enter_address"
      );
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
          // Get each component of the address from the place details,
          // and then fill-in the corresponding field on the form.
          for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (COMPONENT_FORM[addressType]) {
              var val =
                place.address_components[i][COMPONENT_FORM[addressType]];
              document.getElementById(addressType).value = val;
            }
          }
          document.getElementById("custentity_address_verification").value =
            document.getElementById("street_number").value +
            " " +
            document.getElementById("route").value +
            "\n" +
            document.getElementById("locality").value +
            " " +
            document.getElementById("administrative_area_level_1").value +
            " " +
            document.getElementById("postal_code").value +
            "\n" +
            document.getElementById("country").value;
        }
      );
    };

    /**
     * Verify Address click
     */
    document.getElementById("custformbutton0").onclick = function() {
      if (document.getElementById("custentity6").value == "") {
        document.getElementById("custentity_verified_address").value = "";
        alert("Can't verify address");
      } else {
        document.getElementById("custentity_verified_address").value =
          "Address Verified";
        alert("Address was verified");
      }
    };

    return;
  }

  /** HELPER FUNCTIONS **/
  function createEl(name) {
    var inputAddress = document.createElement("INPUT");
    inputAddress.setAttribute("id", name);
    inputAddress.setAttribute("type", "text");
    document.body.appendChild(inputAddress);
    document.getElementById(name).style.visibility = "hidden";
  }

  /**
   * Export Events
   */
  var exports = {};
  exports.pageInit = pageInit;
  return exports;
});
