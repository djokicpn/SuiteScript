/**
 * Report builder Client Script
 * 
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 * @author trungpv <trung@lexor.com>
 */
define(['N/search', 'N/url', 'N/record'], function(s, url, r) {
	var exports = {};

	function goToNextCase() {
		console.info('Go to Next Case clicked...');

		var nextCaseId = getNextCase();
		console.log('Next Case ID: ' + nextCaseId);

		var caseUrl = getCaseUrl(nextCaseId);
		console.log('Next Case URL: ' + caseUrl);

		window.location = caseUrl;
	}

	function getNextCase() {
		console.info('Retrieving next case...');

		return s
			.load({
				id: 'customsearch_cases_by_priority'
			})
			.run()
			.getRange({ start: 0, end: 1 })[0].id;
	}

	function getCaseUrl(caseId) {
		console.info('Generating URL...');

		return url.resolveRecord({
			recordType: r.Type.SUPPORT_CASE,
			recordId: caseId,
			isEditMode: true,
			params: {
				cf: -100
			}
		});
	}

	exports.goToNextCase = goToNextCase;
	return exports;
});
