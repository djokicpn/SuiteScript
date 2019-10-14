/**
 * One Opportunity For One Customer Module
 *
 * https://trello.com/c/jTajsqiL/212-one-opp-for-1-customer
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
			checkOnlyOneOpportunityForCustomer(context, serverWidget);
		} catch (error) {
			log.error({
				title: 'Error oneOpportunityForOneCustomer.js > checkOnlyOneOpportunityForCustomer',
				details: error.message
			});
		}
	}

	/**
	 * 
	 * @param {*} context 
	 */
	function beforeSubmit(context) {
		if (!isOpportunityValid(context)) {
			throw error.create({
				name: 'LEXOR_ERR_INVALID_DATA',
				message: 'Another Opportunity still open.',
				notifyOff: true
			});
		}
	}

	/**
	 * 
	 * @param {*} context 
	 * @param {*} serverWidget 
	 */
	function checkOnlyOneOpportunityForCustomer(context, serverWidget) {
		try {
			var form = context.form;
			var newRecord = context.newRecord;
			var type = context.type;
			var customer = newRecord.getValue('entity');
			var opportunities = getOpportunitiesByCustomer(customer);
			if (
				type === context.UserEventType.CREATE &&
				customer &&
				customer != '' &&
				opportunities.length > 0
			) {
				// Get data search
				const isOpportunityExistsField = form.addField({
					id: 'custpage_is_opportunity_exists',
					type: serverWidget.FieldType.CHECKBOX,
					label: ' '
				});
				isOpportunityExistsField.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.HIDDEN
				});
				isOpportunityExistsField.defaultValue = 'T';

				const opportunitiesExistsField = form.addField({
					id: 'custpage_opportunity_exists',
					type: serverWidget.FieldType.LONGTEXT,
					label: ' '
				});
				opportunitiesExistsField.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.HIDDEN
				});
				opportunitiesExistsField.defaultValue = JSON.stringify(opportunities);
			}
		} catch (error) {
			log.error({
				title: 'Error oneOpportunityForOneCustomer.js > checkOnlyOneOpportunityForCustomer',
				details: error.message
			});
		}
	}

	/**
	 * get Opportunities By Customer
	 * @param {*} customerId
	 */
	function getOpportunitiesByCustomer(customerId) {
		var result = [];
		try {
			var listOpportunities = search.create({
				type: search.Type.OPPORTUNITY,
				filters: [
					{
						name: 'entity',
						operator: search.Operator.IS,
						values: [customerId]
					}
				],
				columns: ['internalid', 'status', 'tranid']
			});
			listOpportunities.run().each(function(item) {
				log.error({
					title: 'item',
					details: item
				});
				if (item.getValue('status') === 'inProgress') {
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
				title: 'Error oneOpportunityForOneCustomer.js > getOpportunitiesByCustomer',
				details: error.message
			});
		}
		return result;
	}

	/**
	 *
	 * @param {*} context
	 */
	function isOpportunityValid(context) {
		try {
			var form = context.form;
			var newRecord = context.newRecord;
			var type = context.type;
			var customer = newRecord.getValue('entity');
			var opportunities = getOpportunitiesByCustomer(customer);
			if (
				type === context.UserEventType.CREATE &&
				customer &&
				customer != '' &&
				opportunities.length > 0
			) {
				return false;
			}
		} catch (error) {
			log.error({
				title: 'Error oneOpportunityForOneCustomer.js > isOpportunityValid',
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
	function vaildOneOpportunityForCustomer(context) {
		try {
			if (errorMsg) {
				errorMsg.hide();
			}
			const currentRecord = context.currentRecord;
			var isOpportunityExists = currentRecord.getValue('custpage_is_opportunity_exists');
			var opportunitiesExists = currentRecord.getValue('custpage_opportunity_exists');
			console.log(isOpportunityExists, opportunitiesExists);
			if (isOpportunityExists && opportunitiesExists) {
				opportunitiesExists = JSON.parse(opportunitiesExists);
				var opportunitiesStr = opportunitiesExists.map(function(item) {
					var opportunityURL = url.resolveRecord({
						recordType: record.Type.OPPORTUNITY,
						recordId: item[0]
					});
					return '<a href="' + opportunityURL + '" target="_blank">' + item[2] + '</a>';
				});
				errorMsg = message.create({
					title: "Can't create new Opportunity",
					message: 'Opportunities: ' + opportunitiesStr.join(', ') + ' still open.',
					type: message.Type.ERROR
				});

				errorMsg.show();
				return true;
			}
		} catch (error) {
			log.error({
				title: 'Error vaildOneOpportunityForCustomer',
				details: error.message
			});
		}
		return false;
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		vaildOneOpportunityForCustomer: vaildOneOpportunityForCustomer
	};
});
