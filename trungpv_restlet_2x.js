/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(
    [
        'N/search',
        'N/record',
        'N/cache',
        'N/format'
    ],
    function (search, record, cache, fmt) {
        function get (context) {
            try {
                return { test: 'Hello World' };
            } catch (err) {
                log.audit({
                    title: 'GET',
                    details: JSON.stringify(err)
                });

                return err;
            }
        }

        return {
            get: get,
            //delete: delete,
            //post: post,
            //put: put
        };
    }
);