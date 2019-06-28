/**
 * REST API for R+L CARRIERS
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @author trungpv <trung@lexor.com>
 */
define(["N/https", "N/search", "N/xml", "/SuiteScripts/Module/Utils"], function(
  https,
  search,
  xml,
  _U
) {
  /** VARS **/
  const API_KEY = "***REMOVED***";

  /**
   * POST
   * @param {*} context
   */
  function postAction(context) {
    var result = {};
    result.success = false;

    try {
      const validation = doValidation(
        [context.locationId, context.customer, context.weight],
        ["locationId", "customer", "weight"],
        "POST"
      );
      if (validation.length === 0) {
        const originAddress = search.lookupFields({
          type: search.Type.LOCATION,
          id: context.locationId,
          columns: ["city", "country", "zip", "state"]
        });
        // Set countryCode
        if (originAddress.country === "US") {
          originAddress.countryCode = "USA";
        } else if (originAddress.country === "CA") {
          originAddress.countryCode = "CAN";
        }
        // Check State
        if(originAddress.state.length > 2) {
          originAddress.state = _U.abbrRegion(originAddress.state, 'abbr');
        }
        if(context.customer.state.length > 2) {
          context.customer.state = _U.abbrRegion(context.customer.state, 'abbr');
        }

        const freightRate = getFreightRate(
          originAddress,
          context.customer,
          context.weight
        );
        
        result.data = {
          freightRate: freightRate
        };
        result.success = true;
        result.message = "Success!";
      } else {
        result.message = "Something went wrong with your params.";
        result.errors = validation;
      }
    } catch (err) {
      result.message = err.message;
    }
    return JSON.stringify(result);
  }

  /** HEPPER FUNCTIONS **/

  /**
   * Validation params
   * @param {*} args
   * @param {*} argNames
   * @param {*} methodName
   */
  function doValidation(args, argNames, methodName) {
    const result = [];
    for (var i = 0; i < args.length; i++) {
      if (!args[i] && args[i] !== 0) {
        result.push(
          "Missing a required argument: [" +
            argNames[i] +
            "] for method: " +
            methodName
        );
      }
    }
    return result;
  }

  /**
   * Build Payload Shipping Method https://www.odfl.com
   */
  function requestPayload(origin, destination, weight) {
    var payload =
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:myr="http://myRate.ws.odfl.com/">';
    payload += "   <soapenv:Header/>";
    payload += "   <soapenv:Body>";
    payload += "      <myr:getLTLRateEstimate>";
    payload += "         <!--Optional:-->";
    payload += "         <arg0>";
    payload +=
      "  		  <destinationCountry>" +
      destination.countryCode +
      "</destinationCountry> ";
    payload +=
      "  		  <destinationPostalCode>" +
      destination.zip +
      "</destinationPostalCode>";
    payload +=
      "  		  <destinationCity>" +
      destination.city +
      "</destinationCity>            ";
    payload +=
      "            <destinationState>" +
      destination.state +
      "</destinationState>             ";
    payload += "		  <freightItems>  			";
    payload += "  			<ratedClass>200</ratedClass>  ";
    payload += "  			<weight>" + weight + "</weight> ";
    payload += "  		  </freightItems>  		  ";
    payload += "  		  <odfl4MePassword>" + PASSWORD + "</odfl4MePassword> ";
    payload += "            <odfl4MeUser>" + USERNAME + "</odfl4MeUser>";
    payload +=
      "            <odflCustomerAccount>" +
      CUS_ACCOUNT +
      "</odflCustomerAccount>  	";
    payload += "  		  <originCountry>" + origin.countryCode + "</originCountry> ";
    payload +=
      "  	       <originPostalCode>" + origin.zip + "</originPostalCode>";
    payload +=
      "  	       <originCity>" + origin.city + "</originCity>            ";
    payload +=
      "            <originState>" +
      origin.state +
      "</originState>             ";
    payload += "  		  <requestReferenceNumber>false</requestReferenceNumber>  		  ";
    payload += "         </arg0>";
    payload += "      </myr:getLTLRateEstimate>";
    payload += "   </soapenv:Body>";
    payload += "</soapenv:Envelope>";

    return payload;
  }

  /**
   * get Freight Rate
   * @param {*} origin
   * @param {*} destination
   * @param {*} weight
   */
  function getFreightRate(origin, destination, weight) {
    const payload = requestPayload(origin, destination, weight);
    try {
      var res = https.post({
        url: "https://www.odfl.com/wsRate_v6/RateService?xsd=1",
        body: payload,
        headers: { "Content-Type": "text/xml; charset=UTF-8" }
      });
      if (res.code === 200) {
        var resXML = xml.Parser.fromString({
          text: res.body
        });
        var netFreightCharge = resXML.getElementsByTagName({
            tagName : 'netFreightCharge'
        });
        if(netFreightCharge.length > 0) {
          return netFreightCharge[0].textContent;  
        }
      }
    } catch (error) {
      return 0;
    }
    return 0;
  }

  /**
   * Export Events
   */
  var exports = {};
  exports.post = postAction;
  return exports;
});
