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
  const ADDITIONAL_FEES = 10; // 10%
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
        if (originAddress.state.length > 2) {
          originAddress.state = _U.abbrRegion(originAddress.state, "abbr");
        }
        if (context.customer.state.length > 2) {
          context.customer.state = _U.abbrRegion(
            context.customer.state,
            "abbr"
          );
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
   * Build Payload Shipping Method https://api.rlcarriers.com/1.0.3/RateQuoteService.asmx
   */
  function requestPayload(origin, destination, weight) {
    var payload =
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rlc="http://www.rlcarriers.com/">';
    payload += "<soapenv:Header/>";
    payload += "<soapenv:Body>";
    payload += "    <rlc:GetRateQuote>";
    payload += "        <rlc:APIKey>" + API_KEY + "</rlc:APIKey>";
    payload += "            <rlc:request>";
    payload += "                <rlc:QuoteType>Domestic</rlc:QuoteType>";
    payload += "                <rlc:CODAmount>0</rlc:CODAmount>";
    payload += "                <rlc:Origin>";
    payload += "                    <rlc:City>" + origin.city + "</rlc:City>";
    payload +=
      "                    <rlc:StateOrProvince>" +
      origin.state +
      "</rlc:StateOrProvince>";
    payload +=
      "                    <rlc:ZipOrPostalCode>" +
      origin.zip +
      "</rlc:ZipOrPostalCode>";
    payload +=
      "                    <rlc:CountryCode>" +
      origin.countryCode +
      "</rlc:CountryCode>";
    payload += "                </rlc:Origin>";
    payload += "                <rlc:Destination>";
    payload +=
      "                    <rlc:City>" + destination.city + "</rlc:City>";
    payload +=
      "                    <rlc:StateOrProvince>" +
      destination.state +
      "</rlc:StateOrProvince>";
    payload +=
      "                    <rlc:ZipOrPostalCode>" +
      destination.zip +
      "</rlc:ZipOrPostalCode>";
    payload +=
      "                    <rlc:CountryCode>" +
      destination.countryCode +
      "</rlc:CountryCode>";
    payload += "                </rlc:Destination>";
    payload += "                <rlc:Items>";
    payload += "                    <rlc:Item>";
    payload += "                        <rlc:Class>200.0</rlc:Class>";
    payload +=
      "                        <rlc:Weight>" + weight + "</rlc:Weight>";
    payload += "                        <rlc:Width>0</rlc:Width>";
    payload += "                        <rlc:Height>0</rlc:Height>";
    payload += "                        <rlc:Length>0</rlc:Length>";
    payload += "                    </rlc:Item>";
    payload += "                </rlc:Items>";
    payload += "                <rlc:DeclaredValue>0</rlc:DeclaredValue>";
    payload += "                <rlc:Accessorials></rlc:Accessorials>";
    payload +=
      "                <rlc:OverDimensionList></rlc:OverDimensionList>";
    payload += "                <rlc:Pallets></rlc:Pallets>";
    payload += "            </rlc:request>";
    payload += "        </rlc:GetRateQuote>";
    payload += "    </soapenv:Body>";
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
        url: "https://api.rlcarriers.com/1.0.3/RateQuoteService.asmx",
        body: payload,
        headers: { "Content-Type": "text/xml; charset=UTF-8" }
      });
      if (res.code === 200) {
        var resXML = xml.Parser.fromString({
          text: res.body
        });
        var ServiceLevels = resXML.getElementsByTagName({
          tagName: "ServiceLevels"
        });
        if (ServiceLevels.length > 0) {
          var NetCharge = ServiceLevels[0].getElementsByTagName({
            tagName: "NetCharge"
          });
          if (NetCharge.length > 0) {
            var nCharge = NetCharge[0].textContent.replace("$", "").replace(",", "");
            nCharge =
              parseFloat(nCharge) +
              parseFloat(nCharge) * (ADDITIONAL_FEES / 100);
            nCharge = parseFloat(nCharge).toFixed(2);
            return nCharge;
          }
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
