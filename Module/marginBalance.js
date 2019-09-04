/**
 * Margin Balance Module
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(['N/record'], function(record) {
	/**
	 * Before Submit Event
	 * @param {*} newRecord
	 */
	function beforeSubmit(newRecord) {
		try {
            const custbodyMarginLeft = newRecord.getValue('custbody_margin_left');
            const totalLine = newRecord.getLineCount({ sublistId: 'item' });
            for (var index = 0; index < totalLine; index++) {
				if(index === 0) {
                    newRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_margin_balance',
                        line: index,
                        value: custbodyMarginLeft
                    });
                } else {
                    newRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_margin_balance',
                        line: index,
                        value: 0
                    });
                }
			}
		} catch (error) {
			log.error({
				title: '[MARGIN_BALANCE_MODULE] > beforeSubmit',
				details: error
			});
		}
    }

	return {
		beforeSubmit: beforeSubmit
	};
});
