/**
 * Sales Reps Restlet API
 *
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @author trungpv <trung@lexor.com>
 */
define(['N/search', 'N/record'], function(search, record) {
	function _get(context) {
		try {
			var roleList = { internalid: 1036 };
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
					},
					{
						name: 'internalid',
						join: 'role',
						operator: search.Operator.ANYOF,
						values: JSON.parse(JSON.stringify(roleList))
					}
				],
				columns: ['internalid', 'firstname', 'middlename', 'lastname', 'email']
			});
			var searchResults = salesReps.run().getRange({ start: 0, end: 1000 });
			return searchResults;
		} catch (error) {
      return error;
    }
	}

	function _post(context) {}

	function _put(context) {}

	function _delete(context) {}

	return {
		get: _get,
		post: _post,
		put: _put,
		delete: _delete
	};
});
