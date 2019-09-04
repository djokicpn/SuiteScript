/**
 * Sales Rep Module
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(['N/search'], function(search) {
	/**
	 * Before Load Event
	 * @param {*} currentRecord
	 */
	function beforeLoad(context) {
		var currentRecord = context.newRecord;
		if (context.type === context.UserEventType.VIEW) {
			return;
		}
		try {
			const HTML_TEMPLATE =
				'<select id="add_sales_rep">____OPTIONS____</select> <button type="button" class="button-blue-small" id="btnAddSalesRep" title="Add Sales Rep.">Add Sales Team</button><style>.button-blue-small{background-color:#607799;border:0.1rem solid #607799;border-radius:0.3rem;color:#fff;cursor:pointer;display:inline-block;font-size:0.8rem;height:2rem;letter-spacing:0.1rem;line-height:0.8rem;padding:0 0.5rem;text-align:center;text-decoration:none;white-space:nowrap}.button-blue-small:hover{background-color:#606c76;border-color:#606c76;color:#fff;outline:0}</style>';

			var HTML = '';
			var salesReps = search.create({
				type: search.Type.EMPLOYEE,
				filters: [
					{
						name: 'salesrep',
						operator: search.Operator.IS,
						values: 'T'
					},
					{
						name: 'isinactive',
						operator: search.Operator.IS,
						values: 'F'
					}
				],
				columns: ['internalid', 'firstname', 'middlename', 'lastname', 'email']
			});
			var OPTIONS = '';
			salesReps.run().each(function(item) {
				var internalid = item.getValue('internalid');
				var name = getName(
					item.getValue({ name: 'firstname' }),
					item.getValue({ name: 'middlename' }),
					item.getValue({ name: 'lastname' })
				);
				OPTIONS += '<option value="' + internalid + '">' + name + '</option>';
				return true;
			});
			HTML = HTML_TEMPLATE.replace('____OPTIONS____', OPTIONS);

			currentRecord.setValue({
				fieldId: 'custentity_sales_rep',
				value: HTML
			});
		} catch (error) {
			log.error({
				title: '[SALES_REP_MODULE] > beforeLoad',
				details: error
			});
		}
	}

	/**
	 * pageInit Event
	 * @param {*} context
	 */
	function pageInit(context) {
		try {
			const currentRecord = context.currentRecord;
			var btnAddSalesRep = document.getElementById('btnAddSalesRep');
			btnAddSalesRep.addEventListener('click', function(event) {
				var salesRep = document.getElementById('add_sales_rep');
				salesRep = salesRep != null ? salesRep.value : false;
				if (salesRep) {
					currentRecord.selectNewLine({ sublistId: 'salesteam' });
					currentRecord.setCurrentSublistValue({
						sublistId: 'salesteam',
						fieldId: 'employee',
						value: salesRep,
						forceSyncSourcing: true
					});
					currentRecord.setCurrentSublistValue({
						sublistId: 'salesteam',
						fieldId: 'salesrole',
						value: -2,
						forceSyncSourcing: true
					});
					currentRecord.commitLine({ sublistId: 'salesteam' });
				}
			});
		} catch (error) {
			log.error({
				title: '[SALES_REP_MODULE] > pageInit',
				details: error
			});
		}
	}

	/**
	 * Convert Name
	 * @param {*} firstname
	 * @param {*} middlename
	 * @param {*} lastname
	 */
	function getName(firstname, middlename, lastname) {
		var name = '';
		name += firstname !== '' ? firstname : '';
		name += middlename !== '' ? ' ' + middlename : '';
		name += lastname !== '' ? ' ' + lastname : '';
		return name;
	}

	return {
		beforeLoad: beforeLoad,
		pageInit: pageInit
	};
});
