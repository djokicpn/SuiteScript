/**
 * Lead / Prospect / Customer Scheduled Script
 * 
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @author trungpv <trung@lexor.com>
 */
define([], function() {
	function execute(context) {
        log.debug({
            title: 'ScheduledScript',
            details: 'test'
        });
    }

	return {
		execute: execute
	};
});
