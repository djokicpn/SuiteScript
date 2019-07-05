/**
 * Discount for SO & Quote Module Client Script
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define([], function() {
  /* === VARS === */
  const MODULE_NAME = "DISCOUNT_MODULE";
  const SALES_MANAGER_DISCOUNT = 10; //%
  const SALES_DIRECTOR_DISCOUNT = 100; //%

  /**
   * pageInit EVENT
   * @param {*} context
   */
  function pageInit(context) {
    try {
      const sublistId = context.sublistId;
      const currentRecord = context.currentRecord;
      const fieldId = context.fieldId;
    } catch (error) {
      console.error(MODULE_NAME, "pageInit", context, error);
    }
  }

  /**
   * sublistChanged EVENT
   * @param {*} context
   */
  function sublistChanged(context) {
    try {
      const sublistId = context.sublistId;
      const currentRecord = context.currentRecord;
      const fieldId = context.fieldId;
      if (sublistId === "item") {
        updateUI(currentRecord);
      }
    } catch (error) {
      console.error(MODULE_NAME, "sublistChanged", context, error);
    }
  }

  /**
   * fieldChanged EVENT
   * @param {*} context
   */
  function fieldChanged(context) {
    try {
      const sublistId = context.sublistId;
      const currentRecord = context.currentRecord;
      const fieldId = context.fieldId;
      if (fieldId === "custbody_margin_percentage") {
        updateUI(currentRecord);
      }
      if (fieldId === "discountrate") {
        updateUI(currentRecord);
      }
      if (fieldId === "custbody_checkbox_sale_manager") {
        var isSaleDirector = currentRecord.getValue({
          fieldId: "custbody_checkbox_sale_director"
        });
        if (isSaleDirector) {
          currentRecord.setValue({
            fieldId: "custbody_checkbox_sale_director",
            value: false,
            ignoreFieldChange: true
          });
        }
        updateUI(currentRecord);
      }
      if (fieldId === "custbody_checkbox_sale_director") {
        var isSaleManager = currentRecord.getValue({
          fieldId: "custbody_checkbox_sale_manager"
        });
        if (isSaleManager) {
          currentRecord.setValue({
            fieldId: "custbody_checkbox_sale_manager",
            value: false,
            ignoreFieldChange: true
          });
        }
        updateUI(currentRecord);
      }
    } catch (error) {
      console.error(MODULE_NAME, "fieldChanged", context, error);
    }
  }

  /** FUNCTIONS **/
  function updateUI(currentRecord) {
    updateMargin(currentRecord);
    updateDiscountRate(currentRecord);
    updateMarginLeft(currentRecord);
  }

  /**
   * Update Margin
   * @param {*} currentRecord
   */
  function updateMargin(currentRecord) {
    const subtotal = currentRecord.getValue({
      fieldId: "subtotal"
    });
    const custbody_margin_percentage = currentRecord.getValue({
      fieldId: "custbody_margin_percentage"
    });
    currentRecord.setValue({
      fieldId: "custbody_margin",
      value: parseFloat(subtotal * (custbody_margin_percentage / 100)).toFixed(
        2
      )
    });
  }

  /**
   * Update Margin Left
   * @param {*} currentRecord
   */
  function updateMarginLeft(currentRecord) {
    const custbody_margin = currentRecord.getValue({
      fieldId: "custbody_margin"
    });
    const discountrate = currentRecord.getValue({
      fieldId: "discountrate"
    });
    const custbody_margin_left = parseFloat(custbody_margin - Math.abs(discountrate));
    currentRecord.setValue({
      fieldId: "custbody_margin_left",
      value: custbody_margin_left < 0 ? 0 : custbody_margin_left.toFixed(2)
    });
  }

  /**
   * Update Discount Rate Field
   * @param {*} currentRecord
   */
  function updateDiscountRate(currentRecord) {
    const isSaleDirector = currentRecord.getValue({
      fieldId: "custbody_checkbox_sale_director"
    });
    const isSaleManager = currentRecord.getValue({
      fieldId: "custbody_checkbox_sale_manager"
    });
    var discountrate = Math.abs(
      currentRecord.getValue({
        fieldId: "discountrate"
      })
    );
    const custbody_margin = currentRecord.getValue({
      fieldId: "custbody_margin"
    });
    const subtotal = currentRecord.getValue({
      fieldId: "subtotal"
    });

    if (!isSaleDirector && !isSaleManager) {
      validateDiscountRate(currentRecord, discountrate, custbody_margin);
    } else if (isSaleDirector && !isSaleManager) {
      var max = subtotal * (SALES_DIRECTOR_DISCOUNT / 100);
      validateDiscountRate(currentRecord, discountrate, max);
    } else if (!isSaleDirector && isSaleManager) {
      var max = subtotal * (SALES_MANAGER_DISCOUNT / 100);
      validateDiscountRate(currentRecord, discountrate, max);
    } else {
      currentRecord.setValue({
        fieldId: "discountrate",
        value: 0,
        ignoreFieldChange: true
      });
    }
  }

  /**
   * Validate Discount Rate
   * @param {*} currentRecord
   * @param {*} discountrate
   * @param {*} max
   */
  function validateDiscountRate(currentRecord, discountrate, max) {
    var min = 0;
    max = parseFloat(max);
    if (
      !isNaN(discountrate) &&
      (parseFloat(discountrate) < min || parseFloat(discountrate) > max)
    ) {
      alert("Value must be less than or equal to " + max.toFixed(2) + ".");
      currentRecord.setValue({
        fieldId: "discountrate",
        value: 0,
        ignoreFieldChange: true
      });
    } else {
      currentRecord.setValue({
        fieldId: "discountrate",
        value: discountrate * -1,
        ignoreFieldChange: true
      });
    }
  }

  return {
    pageInit: pageInit,
    sublistChanged: sublistChanged,
    fieldChanged: fieldChanged
  };
});
