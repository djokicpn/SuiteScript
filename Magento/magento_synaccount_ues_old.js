/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/https',
        '/SuiteScripts/Magento/oauth',
        '/SuiteScripts/Magento/secret',
        'N/search'
    ],
    function (record, https, oauth, secret, s) {


        function beforeSubmit(context) {
            if (context.type !== context.UserEventType.CREATE)
                return;
            var customerRecord = context.newRecord;
            if (!customerRecord.getValue('salesrep'))
                customerRecord.setValue('salesrep', 195233);

            if (!customerRecord.getValue('territory'))
                customerRecord.setValue('territory', 53);

            if (!customerRecord.getValue('pricelevel'))
                customerRecord.setValue('territory', 13);


            if (!customerRecord.getValue('terms'))
                customerRecord.setValue('terms', '');
        }

        function _getTextValueFromSearchData(searchData, key) {
            var _findData = {value: '', text: ''};
            try {
                if (typeof searchData === 'object' && searchData.hasOwnProperty(key)) {
                    _findData = searchData[key][0];
                }
            } catch (e) {
                _findData = {value: '', text: ''};
            }
            return _findData;
        }

        function afterSubmit(context) {
            if (context.type !== context.UserEventType.CREATE)
                return;
            var url = secret.host + 'indaba-netsuite-account/',
                method = 'POST', headers = oauth.getHeaders({
                    url: url,
                    method: method,
                    tokenKey: secret.token.public,
                    tokenSecret: secret.token.secret
                }), customerRecord = context.newRecord, recordId = customerRecord.getValue('id'),
                salerepsData, territoryData,
                priceLevelData, data,
                termData, restResponse;
            headers['Content-Type'] = 'application/json';
            if (!recordId)
                return;

            var lookUpdata = s.lookupFields({
                type: s.Type.CUSTOMER,
                id: recordId,
                columns: ["salesrep", "territory", "pricelevel", "terms"]
            });
            log.debug({
                title: 'SEARCH_DATA',
                details: lookUpdata
            });

            salerepsData = _getTextValueFromSearchData(lookUpdata, 'salesrep'),
                territoryData = _getTextValueFromSearchData(lookUpdata, 'territory'),
                priceLevelData = _getTextValueFromSearchData(lookUpdata, 'pricelevel'),
                termData = _getTextValueFromSearchData(lookUpdata, 'terms');


            try {
                if (recordId) {
                    data = {
                        net_suite_account: {
                            net_suite_account_id: recordId,
                            email: customerRecord.getValue('email'),
                            price_level_id: priceLevelData.value,
                            terms_id: termData.value,
                            sales_rep: salerepsData.text,
                            territory: territoryData.text,
                            price_level: priceLevelData.text,
                            terms: termData.text,
                        }
                    }
                    restResponse = https.post({
                        url: url,
                        headers: headers,
                        body: JSON.stringify(data)
                    });
                }
            } catch (e) {
                log.error({
                    title: 'ERROR WHEN CALL WEB MAGENTO API',
                    details: e
                });
            }

        }

        return {
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);