/**
 * One Quote For One Customer Module
 *
 * https://trello.com/c/cYmEKul4/211-one-open-quote-for-1-customer
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(['N/record', 'N/ui/message', 'N/url', 'N/search', 'N/error'], function(
	record,
	message,
	url,
	search,
	error
) {
	var errorMsg = false;

	/**
	 * 
	 * @param {*} context 
	 * @param {*} serverWidget 
	 */
	function beforeLoad(context, serverWidget) {
		try {
			checkOnlyOneQuoteForCustomer(context, serverWidget);
		} catch (error) {
			log.error({
				title: 'Error oneQuoteForOneCustomer.js > checkOnlyOneQuoteForCustomer',
				details: error.message
			});
		}
	}

	/**
	 * 
	 * @param {*} context 
	 */
	function beforeSubmit(context) {
		if (!isQuoteValid(context)) {
			throw error.create({
				name: 'LEXOR_ERR_INVALID_DATA',
				message: 'Another Quote still open.',
				notifyOff: true
			});
		}
	}

	/**
	 * 
	 * @param {*} context 
	 * @param {*} serverWidget 
	 */
	function checkOnlyOneQuoteForCustomer(context, serverWidget) {
		try {
			var form = context.form;
			var newRecord = context.newRecord;
			var type = context.type;
			var customer = newRecord.getValue('entity');
			var quotes = getQuotesByCustomer(customer);
			if (
				type === context.UserEventType.CREATE &&
				customer &&
				customer != '' &&
				quotes.length > 0
			) {
				// Get data search
				const isQuoteExistsField = form.addField({
					id: 'custpage_is_quote_exists',
					type: serverWidget.FieldType.CHECKBOX,
					label: ' '
				});
				isQuoteExistsField.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.HIDDEN
				});
				isQuoteExistsField.defaultValue = 'T';

				const quotesExistsField = form.addField({
					id: 'custpage_quote_exists',
					type: serverWidget.FieldType.LONGTEXT,
					label: ' '
				});
				quotesExistsField.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.HIDDEN
				});
				quotesExistsField.defaultValue = JSON.stringify(quotes);
			}
		} catch (error) {
			log.error({
				title: 'Error oneQuoteForOneCustomer.js > checkOnlyOneQuoteForCustomer',
				details: error.message
			});
		}
	}

	/**
	 * get Quotes By Customer
	 * @param {*} customerId
	 */
	function getQuotesByCustomer(customerId) {
		var result = [];
		try {
			var listQuotes = search.create({
				type: search.Type.ESTIMATE,
				filters: [
					{
						name: 'entity',
						operator: search.Operator.IS,
						values: [customerId]
					},
					{
						name: 'mainline',
						operator: search.Operator.IS,
						values: ['T']
					}
				],
				columns: ['internalid', 'status', 'tranid']
			});
			listQuotes.run().each(function(item) {
				if (item.getValue('status') === 'open') {
					result.push([
						item.getValue('internalid'),
						item.getValue('status'),
						item.getValue('tranid')
					]);
				}
				return true;
			});
		} catch (error) {
			log.error({
				title: 'Error oneQuoteForOneCustomer.js > getQuotesByCustomer',
				details: error.message
			});
		}
		return result;
	}

	/**
	 *
	 * @param {*} context
	 */
	function isQuoteValid(context) {
		try {
			var form = context.form;
			var newRecord = context.newRecord;
			var type = context.type;
			var customer = newRecord.getValue('entity');
			var quotes = getQuotesByCustomer(customer);
			if (
				type === context.UserEventType.CREATE &&
				customer &&
				customer != '' &&
				quotes.length > 0
			) {
				return false;
			}
		} catch (error) {
			log.error({
				title: 'Error oneQuoteForOneCustomer.js > isQuoteValid',
				details: error.message
			});
			return false;
		}
		return true;
	}

	/**
	 *
	 * @param {*} context
	 */
	function vaildOneQuoteForCustomer(context) {
		try {
			if (errorMsg) {
				errorMsg.hide();
			}
			const currentRecord = context.currentRecord;
			var isQuoteExists = currentRecord.getValue('custpage_is_quote_exists');
			var quotesExists = currentRecord.getValue('custpage_quote_exists');
			console.log(isQuoteExists, quotesExists);
			if (isQuoteExists && quotesExists) {
				quotesExists = JSON.parse(quotesExists);
				var quotesStr = quotesExists.map(function(item) {
					var quoteURL = url.resolveRecord({
						recordType: record.Type.ESTIMATE,
						recordId: item[0]
					});
					return '<a href="' + quoteURL + '" target="_blank">' + item[2] + '</a>';
				});
				errorMsg = message.create({
					title: "Can't create new Quote",
					message: 'Quote: ' + quotesStr.join(', ') + ' still open.',
					type: message.Type.ERROR
				});

				errorMsg.show();
				return true;
			}
		} catch (error) {
			log.error({
				title: 'Error vaildOneQuoteForCustomer',
				details: error.message
			});
		}
		return false;
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		vaildOneQuoteForCustomer: vaildOneQuoteForCustomer
	};
});
