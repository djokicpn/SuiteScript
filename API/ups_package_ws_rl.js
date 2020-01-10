/**
 * REST API for UPS Package
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @author trungpv <trung@lexor.com>
 */
define(["N/https", "N/search", "/SuiteScripts/Module/Utils"], function(
  https,
  search,
  _U
) {
  /** VARS **/
  const USERNAME = "xxx";
  const PASSWORD = "xxx";
  const API_KEY = "xxx";
  const ADDITIONAL_FEES = 10; // 10%

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
          columns: ["address1", "city", "country", "zip", "state"]
        });
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

        // Get Data
        var data = getFreightRate(
          originAddress,
          context.customer,
          context.weight
        );
        if (data) {
          if (isArray(data)) {
            result.data = data;
            result.success = true;
            result.message = "Success!";
          } else {
            result.message = data;
          }
        } else {
          result.message = "Something went wrong with UPS API.";
        }
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

  function UPSSecurity() {
    return {
      UsernameToken: {
        Username: USERNAME,
        Password: PASSWORD
      },
      ServiceAccessToken: {
        AccessLicenseNumber: API_KEY
      }
    };
  }

  /**
   *
   * @param {*} origin
   * @param {*} destination
   * @param {*} weight
   */
  function requestPayload(origin, destination, weight) {
    var payload = {
      UPSSecurity: UPSSecurity(),
      RateRequest: {
        Request: {
          RequestOption: "Shop"
        },
        Shipment: {
          Shipper: {
            Name: "Shipper Name",
            Address: {
              AddressLine: origin.address1,
              City: origin.city,
              StateProvinceCode: origin.state,
              PostalCode: origin.zip,
              CountryCode: origin.country
            }
          },
          ShipTo: {
            Name: "Ship To Name",
            Address: {
              AddressLine: destination.addr1,
              City: destination.city,
              StateProvinceCode: destination.state,
              PostalCode: destination.zip,
              CountryCode: destination.country
            }
          },
          Package: {
            PackagingType: {
              Code: "02",
              Description: "Rate"
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "Lbs",
                Description: "pounds"
              },
              Weight: weight
            }
          },
          ShipmentRatingOptions: {
            NegotiatedRatesIndicator: ""
          }
        }
      }
    };

    return JSON.stringify(payload);
  }

  /**
   * Get Freight Rate
   * @param {*} origin
   * @param {*} destination
   * @param {*} weight
   */
  function getFreightRate(origin, destination, weight) {
    try {
      var payload = requestPayload(origin, destination, weight);
      var res = https.post({
        url: "https://onlinetools.ups.com/rest/Rate",
        body: payload,
        headers: { "Content-Type": "application/json; charset=UTF-8" }
      });
      const body = JSON.parse(res.body);
      if (
        body.hasOwnProperty("RateResponse") &&
        body.RateResponse.hasOwnProperty("RatedShipment")
      ) {
        var RatedShipment = body.RateResponse.RatedShipment;
        RatedShipment = RatedShipment.map(function(item) {
          var itemFilter = {};
          itemFilter.code = item.Service.Code;
          itemFilter.total =
            parseFloat(item.TotalCharges.MonetaryValue) +
            parseFloat(item.TotalCharges.MonetaryValue) *
              (ADDITIONAL_FEES / 100);
          itemFilter.total = parseFloat(itemFilter.total).toFixed(2);
          return itemFilter;
        });

        return RatedShipment;
      }

      if (body.hasOwnProperty("Fault")) {
        var PrimaryError =
          body.Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Description;

        return PrimaryError;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * is Array
   * @param {*} value
   */
  function isArray(value) {
    return value && typeof value === "object" && value.constructor === Array;
  }

  /**
   * Export Events
   */
  var exports = {};
  exports.post = postAction;
  return exports;
});
