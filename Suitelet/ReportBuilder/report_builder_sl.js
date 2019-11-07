/**
 * Report Builder
 *
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @author trungpv <trung@lexor.com>
 */
define(['N/search', 'N/ui/serverWidget', 'N/url'], function(s, ui, url) {
	var exports = {};

	/**
	 * onRequest
	 * @param {*} context
	 */
	function onRequest(context) {
		log.audit({ title: 'Request received.' });

		context.response.writePage({
			pageObject: renderList(translate(findCases()))
		});
	}

	/**
	 * renderList
	 * @param {*} results 
	 */
	function renderList(results) {
		log.audit({ title: 'Rendering list...' });

		var list = ui.createList({ title: 'High Priority Cases' });

		list.clientScriptModulePath = './suitelet-results-cl.js';

		list.addButton({
			id: 'custpage_btn_nextcase',
			label: 'Go to Next Case',
			functionName: 'goToNextCase'
		});

		list.addPageLink({
			type: ui.FormPageLinkType.CROSSLINK,
			title: 'List All Cases',
			url: '/app/crm/support/caselist.nl'
		});
		list.addPageLink({
			type: ui.FormPageLinkType.CROSSLINK,
			title: 'Search Cases',
			url: '/app/common/search/search.nl?searchtype=Case'
		});
		list.addPageLink({
			type: ui.FormPageLinkType.CROSSLINK,
			title: 'Learn JavaScript!',
			url: 'https://developer.mozilla.org/en-US/'
		});

		list
			.addColumn({
				id: 'recordurl',
				type: ui.FieldType.URL,
				label: 'Case Number'
			})
			.setURL({
				url: getBaseUrl()
			})
			.addParamToURL({
				param: 'id',
				value: 'internalid',
				dynamic: true
			})
			.addParamToURL({
				param: 'cf',
				value: -100
			});
		list.addColumn({
			id: 'status',
			type: ui.FieldType.TEXT,
			label: 'Status'
		});
		list.addColumn({
			id: 'priority',
			type: ui.FieldType.TEXT,
			label: 'Priority'
		});
		list.addColumn({
			id: 'title',
			type: ui.FieldType.TEXT,
			label: 'Subject'
		});
		list.addColumn({
			id: 'createddate',
			type: ui.FieldType.DATE,
			label: 'Date Created'
		});

		list.addRows({ rows: results });

		return list;
	}

	/**
	 * findCases
	 */
	function findCases() {
		log.audit({ title: 'Finding Cases...' });

		return s
			.create({
				type: s.Type.SUPPORT_CASE,
				filters: [
					['status', s.Operator.NONEOF, ['5']],
					'and', // Not Closed
					['priority', s.Operator.ANYOF, ['1']] // High Priority
				],
				columns: [
					'casenumber',
					'status',
					'priority',
					'title',
					{
						name: 'createddate',
						sort: s.Sort.ASC
					}
				]
			})
			.run()
			.getRange({ start: 0, end: 20 });
	}

	/**
	 * resultToObject
	 * @param {*} result 
	 */
	function resultToObject(result) {
		return {
			recordurl: result.getValue({ name: 'casenumber' }),
			status: result.getText({ name: 'status' }),
			priority: result.getText({ name: 'priority' }),
			title: result.getValue({ name: 'title' }),
			createddate: result.getValue({ name: 'createddate' }),
			internalid: result.id
		};
	}

	/**
	 * translate
	 * @param {*} results 
	 */
	function translate(results) {
		log.audit({ title: 'Translating results...' });
		return results.map(resultToObject);
	}

	/**
	 * getBaseUrl
	 */
	function getBaseUrl() {
		return url.resolveRecord({
			recordType: s.Type.SUPPORT_CASE
		});
	}

	exports.onRequest = onRequest;
	return exports;
});
