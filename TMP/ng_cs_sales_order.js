/**
 * Module Description
 * 
 * Version    Date            Author           	Remarks
 * 1.00       06 Feb 2019     Scott Anderson	NewGen Business Solutions, Inc. 
 *
 */

var _M = NewGen.lib.math;
var _log = NewGen.lib.logging;
var _tools = NewGen.lib.tools;
var _NSFeatures = NewGen.lib.features;

var _url = NewGen.lib.url;

var customerRec;

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function SalesOrderFieldChanged(type, name, linenum){
	
	if(name == 'entity'){
		
		var customerID = nlapiGetFieldValue('entity');
		
		nlapiLogExecution('Debug','Customer ID', customerID);
		
		if(!_tools.isEmpty(customerID)){
			
			customerRec = nlapiLoadRecord('customer', customerID);
			
		}else{
			
			customerRec = null;
			
		}
		
		
	}else if(name =='shipmethod'){
		
		var shippingMethod = nlapiGetFieldValue('shipmethod');
		
		console.log('Shipping Method: ' + shippingMethod);
		
		if(shippingMethod == '206177'){
			GetR_L_ShippingRate('shipmethod');
		}
		
	}
 
}

function GetR_L_ShippingRate(trigger){
	
	try{
		console.log('Trigger: ' + trigger);
		
		var shippingMethod = nlapiGetFieldValue('shipmethod');
		
		if(!_tools.isEmpty(shippingMethod) && shippingMethod == '206177'){
			
			var closeFlag = true;
			
			var popup = document.getElementById("popup_rating_shipping");

		    if (popup != null){
		    	popup.className = "overlay overlay_a";
		    }  
		    
		    setTimeout(function(){
		    	
		    	try{
		    		var customerID = nlapiGetFieldValue('entity');
					
					nlapiLogExecution('Debug','Customer ID', customerID);
					
					if(!_tools.isEmpty(customerID)){
						
						customerRec = nlapiLoadRecord('customer', customerID);
						
					}else{
						
						customerRec = null;
						
					}
			    	
			    	
					var shippingData = {};
					
					var shipLocationID = nlapiGetFieldValue('location');
					console.log('Ship Location ID: ' + shipLocationID);
					if(!_tools.isEmpty(shipLocationID)){
						
						shippingData.shipLocationID = shipLocationID;

						var url = nlapiResolveURL('SUITELET','customscript_ng_sl_get_location_data','customdeploy_ng_sl_get_location_data') + '&rec_id=' + shipLocationID;
	    		    	var response = nlapiRequestURL(url);
	    		    	console.log(response);
	    		    	var locationData = JSON.parse(response.body);
	    		    	var billToKey = null;
	    				var returnAddrKey = null;

	    				if(locationData.status == 'success'){

	    					billToKey = locationData.billToKey;
	        				returnAddrKey = locationData.returnAddrKey;

		    				console.log('billToKey: ' + billToKey);
	        				console.log('returnAddrKey: ' + returnAddrKey)
	        				
	        				var addressKeys = [];
	        				var addressIDs = [];
	        				
	        				if(!_tools.isEmpty(billToKey)){
	        					addressKeys.push(billToKey);
	        				}
	        				
	        				if(!_tools.isEmpty(returnAddrKey)){
	        					addressKeys.push(returnAddrKey);
	        				}
	        				
	        				console.log(addressKeys);
							
							if(addressKeys.length > 0){
								var arrSearchFilters = null;
								var arrSearchColumns = null;
								var arrSearchResults = null;
								
								arrSearchFilters = [
									new nlobjSearchFilter('internalid', null,'anyof',addressKeys)
								];
								
								arrSearchColumns = [
	        						new nlobjSearchColumn('internalid',null,null),
	        						new nlobjSearchColumn('addressee',null,null),
	        						new nlobjSearchColumn('address1',null,null),
	        						new nlobjSearchColumn('address2',null,null),
	        						new nlobjSearchColumn('city',null,null),
	        						new nlobjSearchColumn('state',null,null),
	        						new nlobjSearchColumn('zip',null,null),
	        						new nlobjSearchColumn('country',null,null),
	        						new nlobjSearchColumn('countrycode',null,null)
	        					];
								
								
								try{
									var arrSearchResults = nlapiSearchRecord("address",null,arrSearchFilters,arrSearchColumns);
									console.log(arrSearchResults);
								}catch(err){
									console.log(err.message);
									nlapiLogExecution('ERROR','Error Search For Location Address',err.message);
								}
								
								if(!_tools.isEmpty(arrSearchResults)){

									console.log(arrSearchResults);
									
									var shipLocationData = {};

									if(!_tools.isEmpty(returnAddrKey)){
	        							returnAddrResult = arrSearchResults.filter(function(result){return returnAddrKey == result.getValue('internalid')})[0];
	        							
	        							if(!_tools.isEmpty(returnAddrResult)){	        								
	        								shipLocationData.city = returnAddrResult.getValue('city');
	        								shipLocationData.zip = returnAddrResult.getValue('zip');
	        								shipLocationData.state = returnAddrResult.getValue('state');
	        								if(!_tools.isEmpty(returnAddrResult.getValue('countrycode'))){
	        									if(returnAddrResult.getValue('countrycode') == 'US'){
													shipLocationData.countryCode = "USA";
												}else if(returnAddrResult.getValue('countrycode') == 'CA'){
													shipLocationData.countryCode = "CAN";
												}
	        								}	        								
	        							}
	        							
	        						}else if(!_tools.isEmpty(billToKey)){
	        							billToResult = arrSearchResults.filter(function(result){return billToKey == result.getValue('internalid')})[0];
	        							console.log(billToResult)
	        							if(!_tools.isEmpty(billToResult)){
	        								
	        								shipLocationData.city = billToResult.getValue('city');
	        								shipLocationData.zip = billToResult.getValue('zip');
	        								shipLocationData.state = billToResult.getValue('state');
	        								
	        								if(!_tools.isEmpty(billToResult.getValue('countrycode'))){
	        									if(billToResult.getValue('countrycode') == 'US'){
													shipLocationData.countryCode = "USA";
												}else if(billToResult.getValue('countrycode') == 'CA'){
													shipLocationData.countryCode = "CAN";
												}
	        								}
	        							}
	        							
	        						}
									/*
									if(!_tools.isEmpty(arrSearchResults[0].getValue('city','returnAddress'))){
										shipLocationData.city = arrSearchResults[0].getValue('city','returnAddress');
									}else{
										shipLocationData.city = arrSearchResults[0].getValue('city','address');
									}
									
									if(!_tools.isEmpty(arrSearchResults[0].getValue('state','returnAddress'))){
										shipLocationData.state = arrSearchResults[0].getValue('state','returnAddress');
									}else{
										shipLocationData.state = arrSearchResults[0].getValue('state','address');
									}
									
									if(!_tools.isEmpty(arrSearchResults[0].getValue('zip','returnAddress'))){
										shipLocationData.zip = arrSearchResults[0].getValue('zip','returnAddress');
									}else{
										shipLocationData.zip = arrSearchResults[0].getValue('zip','address');
									}
									
									if(!_tools.isEmpty(arrSearchResults[0].getValue('countrycode','returnAddress'))){
										if(arrSearchResults[0].getValue('countrycode','returnAddress') == 'US'){
											shipLocationData.countryCode = "USA";
										}else if(arrSearchResults[0].getValue('countrycode','returnAddress') == 'CA'){
											shipLocationData.countryCode = "CAN";
										}
										
									}else{
										if(arrSearchResults[0].getValue('countrycode','address') == 'US'){
											shipLocationData.countryCode = "USA";
										}else if(arrSearchResults[0].getValue('countrycode','address') == 'CA'){
											shipLocationData.countryCode = "CAN";
										}
									}
									*/
									shippingData.shipFrom = shipLocationData;
								}
							}

	    				}
    		    								
						
						var shipAddressID = nlapiGetFieldValue('shipaddresslist');	
				    	
				    	nlapiLogExecution('Debug','Shipping Address ID',shipAddressID);
				    	
				    	shippingData.shipAddressID = shipAddressID;
				    	
				    	if(!_tools.isEmpty(shipAddressID)){
				    		
				    		if(!_tools.isEmpty(customerRec)){

				    			var shipToAddress = {}
				    										
		    					shipToAddress.addressee = nlapiGetFieldValue('shipaddressee');
		    					shipToAddress.attention = nlapiGetFieldValue('shipattention');
		    					shipToAddress.address1 = nlapiGetFieldValue('shipaddr1');
		    					shipToAddress.address2 = nlapiGetFieldValue('shipaddr2');
		    					shipToAddress.address3 = nlapiGetFieldValue('shipaddr3');
		    					shipToAddress.city = nlapiGetFieldValue('shipcity');
		    					shipToAddress.state = nlapiGetFieldValue('shipstate');				
		    					shipToAddress.zip = nlapiGetFieldValue('shipzip');
		    					if(nlapiGetFieldValue('shipcountry') == 'US'){
		    						shipToAddress.countryCode = "USA";
		    					}else if(nlapiGetFieldValue('shipcountry') == 'CA'){
		    						shipToAddress.countryCode = "CAN";
		    					}
		    					
		    					shipToAddress.phone = nlapiGetFieldValue('shipphone');
		    					
		    					nlapiLogExecution('Debug','Addressee',shipToAddress.addressee);
		    					nlapiLogExecution('Debug','Attention',shipToAddress.attention);
		    					nlapiLogExecution('Debug','Address 1',shipToAddress.address1);
		    					nlapiLogExecution('Debug','Address 2',shipToAddress.address2);
		    					nlapiLogExecution('Debug','Address 3',shipToAddress.address3);
		    					nlapiLogExecution('Debug','City',shipToAddress.city);
		    					nlapiLogExecution('Debug','State',shipToAddress.state);
		    					nlapiLogExecution('Debug','Zip',shipToAddress.zip);
		    					nlapiLogExecution('Debug','Country',shipToAddress.countryCode);
		    					nlapiLogExecution('Debug','Phone',shipToAddress.phone);	
		    					
		    					shippingData.shipToAddress = shipToAddress
				    			
				    			/*
				    			var addressLineCount = customerRec.getLineItemCount('addressbook');
				    			
				    			for(i=1; i <= addressLineCount; i++){
				    				
				    				var addressID = customerRec.getLineItemValue('addressbook','id',i);
				    				
				    				nlapiLogExecution('Debug','Address ID', addressID);
				    				
				    				if(addressID == shipAddressID){
				    					
				    					var shipToAddress = {}
				    										
				    					shipToAddress.addressee = customerRec.getLineItemValue('addressbook', 'addressee', i);
				    					shipToAddress.attention = customerRec.getLineItemValue('addressbook','attention',i);
				    					shipToAddress.address1 = customerRec.getLineItemValue('addressbook', 'addr1', i);
				    					shipToAddress.address2 = customerRec.getLineItemValue('addressbook', 'addr2', i);
				    					shipToAddress.address3 = customerRec.getLineItemValue('addressbook', 'addr3', i);
				    					shipToAddress.city = customerRec.getLineItemValue('addressbook', 'city', i);
				    					shipToAddress.state = customerRec.getLineItemValue('addressbook', 'state', i);				
				    					shipToAddress.zip = customerRec.getLineItemValue('addressbook', 'zip', i);
				    					if(customerRec.getLineItemValue('addressbook', 'country', i) == 'US'){
				    						shipToAddress.countryCode = "USA";
				    					}else if(customerRec.getLineItemValue('addressbook', 'country', i) == 'CA'){
				    						shipToAddress.countryCode = "CAN";
				    					}
				    					
				    					shipToAddress.phone = customerRec.getLineItemValue('addressbook','phone',i);
				    					
				    					nlapiLogExecution('Debug','Addressee',shipToAddress.addressee);
				    					nlapiLogExecution('Debug','Attention',shipToAddress.attention);
				    					nlapiLogExecution('Debug','Address 1',shipToAddress.address1);
				    					nlapiLogExecution('Debug','Address 2',shipToAddress.address2);
				    					nlapiLogExecution('Debug','Address 3',shipToAddress.address3);
				    					nlapiLogExecution('Debug','City',shipToAddress.city);
				    					nlapiLogExecution('Debug','State',shipToAddress.state);
				    					nlapiLogExecution('Debug','Zip',shipToAddress.zip);
				    					nlapiLogExecution('Debug','Country',shipToAddress.countryCode);
				    					nlapiLogExecution('Debug','Phone',shipToAddress.phone);	
				    					
				    					shippingData.shipToAddress = shipToAddress
				    					
				    					break;
				    					
				    				}
				    			}
				    			*/


				    			var lineCount = nlapiGetLineItemCount('item');
				    			
				    			if(lineCount > 0){
										
			    					var itemIDs = [];
			    	    			shippingData.items = [];
			    	    			
			    	    			for(i=1; i <= lineCount; i++){
			    	    				
			    	    				var itemID = nlapiGetLineItemValue('item','item',i);
			    	    				nlapiLogExecution('Debug','Item ID',itemID);			
			    	    				
			    	    				var index = itemIDs.indexOf(itemID);
			    	    				nlapiLogExecution('Debug','Item ID Index', index); 	
			    	    				
			    	    				if(index == -1){
			    	    					itemIDs.push(itemID);
			    	    				}
			    	    			}
			    	    			
			    	    			nlapiLogExecution('Debug','Item IDs', itemIDs);
			    	    			
			    	    			//Search Item Records to Collect Data
			    	    			
			    	    			var arrSearchFilters = null;
			    	    			var arrSearchColumns = null;
			    	    			var arrSearchResults = null;
			    	    			
			    	    			arrSearchFilters = [
			    	    				new nlobjSearchFilter('internalid', null, 'anyof', itemIDs)
			    	    			];
			    	    			
			    	    			arrSearchColumns = [
			    	    				new nlobjSearchColumn('internalid',null,null),
			    	    				new nlobjSearchColumn('description',null,null),
			    	    				new nlobjSearchColumn('type',null,null),
			    	    				new nlobjSearchColumn('weight',null,null)
			    	    			];
			    	    			
			    	    			try{
			    	    				arrSearchResults = nlapiSearchRecord('item',null,arrSearchFilters,arrSearchColumns);
			    	    				nlapiLogExecution('Debug','Item Search Results',JSON.stringify(arrSearchResults));
			    	    			}catch(err){
			    	    				nlapiLogExecution('ERROR','Error searching for items data.', err.message);
			    	    			}
			    	    			
			    	    			for(i=1; i <= lineCount; i++){
			    	    				var item = {};
			        					
			        					item.itemID = nlapiGetLineItemValue('item','item',i);
			        					item.itemName = nlapiGetLineItemText('item','item',i);
			        					item.description = nlapiGetLineItemValue('item','description',i);
			        					item.line = i        					
			        					item.itemtype = nlapiGetLineItemValue('item','itemtype',i);
			        					item.quantity = nlapiGetLineItemValue('item','quantity',i);
			        					item.rate = nlapiGetLineItemValue('item','rate',i);
			        					item.amount = nlapiGetLineItemValue('item','amount',i);
			        					
			        					if(item.itemtype == 'InvtPart' || item.itemtype == 'Kit'){
			        						if(!_tools.isEmpty(arrSearchResults)){
				        						var itemResult = arrSearchResults.filter(function(result){return result.getValue('internalid') == item.itemID});
				        						
				        						if(!_tools.isEmpty(itemResult) && itemResult.length > 0){
				        							
				        							item.weight = itemResult[0].getValue('weight') || 1;
				        							item.weight = parseFloat(item.weight) * parseInt(item.quantity);
				        							
				        						}else{
				        							nlapiLogExecution('Debug','No Item Record Returned in Search', item.itemID);
				        						}
				        					}
				        					
				        					
				        					
				        					shippingData.items.push(item);
			        					}
			    	    			}
										
			    	    			nlapiLogExecution('Debug','Shipping Data',JSON.stringify(shippingData));
			    	    			console.log(shippingData);
			    	    			
			    	    			var dataXML = "";
			    	    			
			    	    			dataXML 	+=		'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rlc="http://www.rlcarriers.com/">';
			    	    		    dataXML		+=			'<soapenv:Header/>';
			    	    		    dataXML		+=			'<soapenv:Body>';
			    	    		    dataXML		+=				'<rlc:GetRateQuote>';
			    	    		    dataXML		+=					'<rlc:APIKey>MtMzZWEDZmY4IwYTMtZGZhZi00Mzc2LTg1NWMTQ2EzOGOzMGC</rlc:APIKey>';
			    	    		    dataXML		+=					'<rlc:request>';
			    	    		    dataXML		+=						'<rlc:CustomerData>8666713173</rlc:CustomerData>';
			    	    		    dataXML		+=						'<rlc:QuoteType>Domestic</rlc:QuoteType>';
			    	    		    dataXML		+=						'<rlc:CODAmount>0</rlc:CODAmount>';
			    	    		    dataXML		+=						'<rlc:Origin>';
			    	    		    dataXML		+=							'<rlc:City>' + shippingData.shipFrom.city + '</rlc:City>';
			    	    		    dataXML		+=							'<rlc:StateOrProvince>' + shippingData.shipFrom.state + '</rlc:StateOrProvince>';
			    	    		    dataXML		+=							'<rlc:ZipOrPostalCode>' + shippingData.shipFrom.zip + '</rlc:ZipOrPostalCode>';
			    	    		    dataXML		+=							'<rlc:CountryCode>' + shippingData.shipFrom.countryCode + '</rlc:CountryCode>';
			    	    		    dataXML		+=						'</rlc:Origin>';
			    	    		    dataXML		+=						'<rlc:Destination>';
			    	    		    dataXML		+=							'<rlc:City>' + shippingData.shipToAddress.city + '</rlc:City>';
			    	    		    dataXML		+=							'<rlc:StateOrProvince>' + shippingData.shipToAddress.state + '</rlc:StateOrProvince>';
			    	    		    dataXML		+=							'<rlc:ZipOrPostalCode>' + shippingData.shipToAddress.zip + '</rlc:ZipOrPostalCode>';
			    	    		    dataXML		+=							'<rlc:CountryCode>' + shippingData.shipToAddress.countryCode + '</rlc:CountryCode>';
			    	    		    dataXML		+=						'</rlc:Destination>';
			    	    		    dataXML		+=						'<rlc:Items>';
			    	    		    
			    	    		    for(i=0; i < shippingData.items.length; i++){
			    	    		    	
			    	    		    	dataXML		+=						'<rlc:Item>';
			    	    		    	dataXML		+=							'<rlc:Class>100.0</rlc:Class>';
			    	    		    	dataXML		+=							'<rlc:Weight>' + shippingData.items[i].weight + '</rlc:Weight>';
			    	    		    	dataXML		+=							'<rlc:Width>0</rlc:Width>';
			    	    		    	dataXML		+=							'<rlc:Height>0</rlc:Height>';
			    	    		    	dataXML		+= 							'<rlc:Length>0</rlc:Length>';
			    	    		    	dataXML		+=						'</rlc:Item>';
			    	    		    } 
			                        
			    	    		    dataXML		+=						'</rlc:Items>';
			                    
			    	    		    dataXML		+=						'<rlc:DeclaredValue>0</rlc:DeclaredValue>';
			    	    		    dataXML		+=						'<rlc:Accessorials></rlc:Accessorials>';
			    	    		    dataXML		+=						'<rlc:OverDimensionList></rlc:OverDimensionList>';
			    	    		    dataXML		+=						'<rlc:Pallets></rlc:Pallets>';
			    	    		    dataXML		+=					'</rlc:request>';
			    	    		    dataXML		+=				'</rlc:GetRateQuote>';
			    	    		    dataXML		+=			'</soapenv:Body>';
			    	    		    dataXML		+=		'</soapenv:Envelope>';
			    	    		    
			    	    		    var response = null;
			    	    		    
			    	    		    try{
			    	    		    	var response = nlapiRequestURL('https://api.rlcarriers.com/1.0.3/RateQuoteService.asmx',dataXML,{"Content-Type": "text/xml; charset=UTF-8"});
			    	    		    }catch(err){
			    	    		    	console.log(err.message);
			    	    		    	nlapiLogExecution('ERROR','Error Get Shipment Rate',err.message);
			    	    		    }
			    	    		    
			    	    		    if(!_tools.isEmpty(response.code) && response.code == 200){
			    	    		    	console.log('NS Request Success');
			    	    		    	console.log(response);
			    	    		    	
			    	    		    	var responseXML = nlapiStringToXML(response.body);
			    	    		    	console.log(responseXML);
			    	    		    	
			    	    		    	var responseJSON = xmlToJson(responseXML);
			    	    		    	console.log(responseJSON);
			    	    		    	
			    	    		    	var envelope = responseJSON["soap:Envelope"];
			    	    		    	var body = envelope["soap:Body"];
			    	    		    	
			    	    		    	var rateRequestResultSuccess = body.GetRateQuoteResponse.GetRateQuoteResult.WasSuccess["#text"];
			    	    		    	console.log('rateRequestResultSuccess: ' + rateRequestResultSuccess);
			    	    		    	
			    	    		    	if(rateRequestResultSuccess == 'true'){
			    	    		    		console.log('RL Rate Request Success');
			    	    		    		var rateResultServiceLevels = body.GetRateQuoteResponse.GetRateQuoteResult.Result.ServiceLevels.ServiceLevel;
			    	    		    		var rate = 0;
			    	    		    		console.log('rateResultServiceLevels');
			    	    		    		console.log(rateResultServiceLevels);
			    	    		    		
			    	    		    		if(!_tools.isEmpty(rateResultServiceLevels.length)){
			    	    		    			for(i=0; i < rateResultServiceLevels.length; i++){
				    	    		    			var code = rateResultServiceLevels[i].Code["#text"];
				    	    		    			console.log(code);
				    	    		    			if(code == "STD"){
				    	    		    				var NetCharge = rateResultServiceLevels[i].NetCharge["#text"].replace('$','');
				    	    		    				rate = parseFloat(NetCharge);
				    	    		    				break;
				    	    		    			}
				    	    		    		}
			    	    		    		}else{
			    	    		    			var code = rateResultServiceLevels.Code["#text"];
			    	    		    			if(code == "STD"){
			    	    		    				var NetCharge = rateResultServiceLevels.NetCharge["#text"].replace('$','');
			    	    		    				rate = parseFloat(NetCharge);
			    	    		    				
			    	    		    			}
			    	    		    		}
			    	    		    		
			    	    		    		
			    	    		    		console.log('Rate: ' + rate);
			    	    		    		
			    	    		    		nlapiSetFieldValue('custbody_ng_freight_cost',rate);
			    	    		    		
			    	    		    		var orderSubTotal = nlapiGetFieldValue('subtotal');
			    	    		    		console.log('Subtotal: ' + orderSubTotal);
			    	    		    		
			    	    		    		if(orderSubTotal < 1000){
			    	    		    			
			    	    		    			nlapiSetFieldValue('shippingcost',rate);
			    	    		    			
			    	    		    		}else{
			    	    		    			
			    	    		    			nlapiSetFieldValue('shippingcost',0.00);
			    	    		    			
			    	    		    		}
			    	    		    		
			    	    		    	}else{
			    	    		    		console.log('Failed');
			    	    		    		var message = "<h2 style=\"width:100%; text-align:center;\"><br />Rate request failed.<br /><br />Error Messages: <br /><br />";
			    	    		    		var messages = body.GetRateQuoteResponse.GetRateQuoteResult.Messages.string;
			    	    		    		console.log(messages);
			    	    		    		
			    	    		    		if(!_tools.isEmpty(messages.length)){
			    	    		    			for(m=0; m < messages.length; m++){
				    	    		    			message += messages[m]['#text'] + "<br />\n";
				    	    		    		};
			    	    		    		}else{
			    	    		    			message += messages['#text'];
			    	    		    		}
			    	    		    		
			    	    		    		
			    	    		    		message += "</h2>\n";
			    	    		    		
			    	    		    		nlapiLogExecution('Debug','Rate request failed.');
			    		        			closeFlag = false;
			    		        			document.getElementById('modalclose_rating_shipping').style.display = 'block';
			    		        			var popupContent = document.getElementById('modalcontent').innerHTML = message;
			    		        			
			    	    		    	}
			    	    		    	
			    	    		    }
			    	    		    
				    				
				    			}else{
				        			
				        			nlapiLogExecution('Debug','No Items Added to Order.');
				        			closeFlag = false;
				        			document.getElementById('modalclose_rating_shipping').style.display = 'block';
				        			var popupContent = document.getElementById('modalcontent').innerHTML = "<h2 style=\"width:100%; text-align:center;\"><br />No items have been added to the order yet. Please add an item and try again.<br /><br /></h2>\n";
				        			
				        			//alert('No items have been added to the order yet. Please add an item and try again.');    			
				        			
				        		}
				    			
				    		}else{
				    			
				    			nlapiLogExecution('Debug','No Customer Selected'); 
								closeFlag = false;
								document.getElementById('modalclose_rating_shipping').style.display = 'block';
								var popupContent = document.getElementById('modalcontent').innerHTML = "<h2 style=\"width:100%; text-align:center;\"><br />No Customer Selected. Please Select a Customer and Try Again.<br /><br /></h2>\n";
									    			
				    		}
				    	}else{
				    		
				    		nlapiLogExecution('Debug','No Ship To Address Selected'); 
							closeFlag = false;
							document.getElementById('modalclose_rating_shipping').style.display = 'block';
							var popupContent = document.getElementById('modalcontent').innerHTML = "<h2 style=\"width:100%; text-align:center;\"><br />No Ship To Address Selected. Please Select a Ship To Address and Try Again.<br /><br /></h2>\n";
							
				    		
				    		//alert('No Ship To Address Selected. Please Select a Ship To Address and Try Again.');
				    	}
				    	
				    	if(closeFlag){
							closeModal('popup_rating_shipping');
						}
						
						
					}else{
						
						nlapiLogExecution('Debug','No Location value found.'); 
						closeFlag = false;
						document.getElementById('modalclose_rating_shipping').style.display = 'block';
						var popupContent = document.getElementById('modalcontent').innerHTML = "<h2 style=\"width:100%; text-align:center;\"><br />No Location Selected. Please Select a Location and Try Again.<br /><br /></h2>\n";
						
						
					}
		    	}catch(err){
		    		console.log(err);
		    		nlapiLogExecution('Debug','Error Occurred During Rating Process'); 
		    		closeFlag = false;
		    		document.getElementById('modalclose_rating_shipping').style.display = 'block';
		    		var popupContent = document.getElementById('modalcontent').innerHTML = "<h2 style=\"width:100%; text-align:center;\"><br />Error Occurred During Rating Process<br /><br />Error Message:<br /><br />" + err.message +"<br /><br /></h2>\n";
		    		
		    	} 
		    },500);
			
			
			
		}else{
			if(trigger == 'button'){
				alert('Ship Via must be set to LTL Frieght.');
			}
			
		}
	}catch(err){
		console.log(err);
		nlapiLogExecution('Debug','Error Occurred During Rating Process'); 
		closeFlag = false;
		document.getElementById('modalclose_rating_shipping').style.display = 'block';
		var popupContent = document.getElementById('modalcontent').innerHTML = "<h2 style=\"width:100%; text-align:center;\"><br />Error Occurred During Rating Process<br /><br />Error Message:<br /><br />" + err.message +"<br /><br /></h2>\n";
		
	}
	
	
}

function closeModal(modalID){
	
	var popup = document.getElementById(modalID);
	
	if (popup != null){
    	popup.className = "overlay overlay_b";
    	setTimeout(function(){
    		document.getElementById('modalclose_rating_shipping').style.display = 'none';
        	var popupContent = document.getElementById('modalcontent').innerHTML = "<h2 style=\"width:100%; text-align:center;\"><br />Rating Shipment<br /><br /></h2>\n";
    	},500);
    	
    } 
	
}

function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};