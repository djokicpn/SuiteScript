/**
 * REST API for Search Employee Email
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @author trungpv <trung@lexor.com>
 */
define(['N/search'], function(search) {
	/**
	 * GET
	 * @param {*} context
	 */
	function getAction(context) {
		var result = {};
		result.success = false;

		try {
			const validation = doValidation([context.keyword], ['keyword'], 'GET');
			if (validation.length === 0) {
				var employeeSearch = search.global({
					keywords: context.keyword
        });
        employeeSearch = employeeSearch.filter(function(e) {
					return 'employee' === e.recordType;
        })
				result.count = employeeSearch.length;
        result.data = employeeSearch;
        result.success = true;
				result.message = 'Success!';
			} else {
				result.message = 'Something went wrong with your params.';
				result.errors = validation;
			}
		} catch (err) {

			result.message = err.message;
		}
		return result;
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
				result.push('Missing a required argument: [' + argNames[i] + '] for method: ' + methodName);
			}
		}
		return result;
	}
	/**
	 * Export Events
	 */
	var exports = {};
	exports.get = getAction;
	return exports;
});
