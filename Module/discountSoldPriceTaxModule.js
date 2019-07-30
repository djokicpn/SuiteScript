/**
 * User Event Script for Discount, Sold Price and Tax (Sales Order & Quote)
 * https://trello.com/c/ii9HJeiK/164-add-column-discount-sold-price-and-tax-on-quote-and-sale-order-after-record-submit-save
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define([], function() {
	function beforeLoad(context) {
		// EDIT Mode Only
		if (context.type === context.UserEventType.EDIT) {
			var form = context.form;
			var item = form.getSublist({ id: 'item' });
			if (item) {
				// custcol_item_discount
				var itemDiscountCol = item.getField({ id: 'custcol_item_discount' });
				if (itemDiscountCol) {
					itemDiscountCol.updateDisplayType({ displayType: 'hidden' });
				}
				// custcol_sold_price
				var soldPriceCol = item.getField({ id: 'custcol_sold_price' });
				if (soldPriceCol) {
					soldPriceCol.updateDisplayType({ displayType: 'hidden' });
				}
				// custcol_item_tax
				var itemTaxCol = item.getField({ id: 'custcol_item_tax' });
				if (itemTaxCol) {
					itemTaxCol.updateDisplayType({ displayType: 'hidden' });
				}
			}
		}
	}

	function beforeSubmit(newRecord) {
		try {
			const subTotal = newRecord.getValue({
				fieldId: 'subtotal'
			});
			const discountRate = newRecord.getValue({
				fieldId: 'discountrate'
			});
			const discountRatePercent = subTotal != 0 ? Math.abs(discountRate) / subTotal : 0; // %
			// Loop items sublist
			const totalLine = newRecord.getLineCount({ sublistId: 'item' });
			for (var index = 0; index < totalLine; index++) {
				var quantity = newRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantity',
					line: index
				});
				if (quantity != '' && quantity > 0) {
					var amount = newRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'amount',
						line: index
					});
					var taxRate = newRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'taxrate1',
						line: index
					});
					taxRate = parseFloat(taxRate);
					taxRate = isNaN(taxRate) ? 0 : taxRate / 100;

					var itemDiscount = amount * discountRatePercent;
					var soldPrice = amount - itemDiscount;
					// Set Discount, Sold Price, Tax
					// custcol_item_discount
					newRecord.setSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_item_discount',
						line: index,
						value: itemDiscount
					});
					// custcol_sold_price
					newRecord.setSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_sold_price',
						line: index,
						value: soldPrice
					});
					// custcol_item_tax
					newRecord.setSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_item_tax',
						line: index,
						value: soldPrice * taxRate
					});
				}
			}
		} catch (error) {
			log.error({
				title: 'Error discountSoldPriceTaxModule',
				details: error
			});
		}
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit
	};
});
