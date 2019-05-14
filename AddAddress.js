/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define([], function() {
  function initAutocomplete() {
    var autocomplete;

    var inputAddress = document.createElement("INPUT");
    inputAddress.setAttribute("id", "street_number");
    inputAddress.setAttribute("type", "text");
    document.body.appendChild(inputAddress);
    document.getElementById("street_number").style.visibility = "hidden";
    var inputAddress = document.createElement("INPUT");
    inputAddress.setAttribute("id", "route");
    inputAddress.setAttribute("type", "text");
    document.body.appendChild(inputAddress);
    document.getElementById("route").style.visibility = "hidden";
    var inputAddress = document.createElement("INPUT");
    inputAddress.setAttribute("id", "locality");
    inputAddress.setAttribute("type", "text");
    document.body.appendChild(inputAddress);
    document.getElementById("locality").style.visibility = "hidden";
    var inputAddress = document.createElement("INPUT");
    inputAddress.setAttribute("id", "administrative_area_level_1");
    inputAddress.setAttribute("type", "text");
    document.body.appendChild(inputAddress);
    document.getElementById("administrative_area_level_1").style.visibility =
      "hidden";
    var inputAddress = document.createElement("INPUT");
    inputAddress.setAttribute("id", "country");
    inputAddress.setAttribute("type", "text");
    document.body.appendChild(inputAddress);
    document.getElementById("country").style.visibility = "hidden";
    var inputAddress = document.createElement("INPUT");
    inputAddress.setAttribute("id", "postal_code");
    inputAddress.setAttribute("type", "text");
    document.body.appendChild(inputAddress);
    document.getElementById("postal_code").style.visibility = "hidden";

    var componentForm = {
      street_number: "short_name",
      route: "long_name",
      locality: "long_name",
      administrative_area_level_1: "short_name",
      country: "long_name",
      postal_code: "short_name"
    };
    var GoogleAPI = document.createElement("script");
    GoogleAPI.src =
      "https://maps.googleapis.com/maps/api/js?key=***REMOVED***&libraries=places";
    GoogleAPI.id =
      "https://maps.googleapis.com/maps/api/js?key=***REMOVED***&libraries=places";
    document.body.appendChild(GoogleAPI);

    document.getElementById("custentity_enter_address").onclick = function() {
      autocomplete = new google.maps.places.Autocomplete(
        document.getElementById("custentity_enter_address"),
        { types: ["geocode"] }
      );
      // autocomplete.setFields('address_components');
      autocomplete.addListener("place_changed", fillInAddress);
    };

    function fillInAddress() {
      // Get the place details from the autocomplete object.
      var place = autocomplete.getPlace();

      // Get each component of the address from the place details,
      // and then fill-in the corresponding field on the form.
      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
          var val = place.address_components[i][componentForm[addressType]];
          document.getElementById(addressType).value = val;
        }
      }
      custentity_address_verification;
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
    document.getElementById("custformbutton0").onclick = function() {
      if (document.getElementById("custentity6").value == "") {
        document.getElementById("custentity_verified_address").value = "";
        alert("Can't verify address");
      } else {
        if (
          document.getElementById("custentity_address_verification").value ==
          document.getElementById("custentity6").value
        ) {
          document.getElementById("custentity_verified_address").value =
            "Address Verified";
          alert("Address was verified");
        } else {
          document.getElementById("custentity_verified_address").value = "";
          alert("Can't verify address");
        }
      }
    };
  }
  return {
    pageInit: initAutocomplete
  };
});
