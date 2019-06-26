/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Feb 2019     Scott Anderson	NewGen Business Solutions, Inc.
 *
 */

var _M = NewGen.lib.math;
var _log = NewGen.lib.logging;
var _tools = NewGen.lib.tools;
var _NSFeatures = NewGen.lib.features;

var _url = NewGen.lib.url;

var USA_StateOptions = ["AL,Alabama","AK,Alaska","AZ,Arizona","AR,Arkansas","AA,Armed Forces Americas","AE,Armed Forces Europe","AP,Armed Forces Pacific","CA,California","CO,Colorado","CT,Connecticut","DE,Delaware","DC,District of Columbia","FL,Florida","GA,Georgia","HI,Hawaii","ID,Idaho","IL,Illinois","IN,Indiana","IA,Iowa","KS,Kansas","KY,Kentucky","LA,Louisiana","ME,Maine","MD,Maryland","MA,Massachusetts","MI,Michigan","MN,Minnesota","MS,Mississippi","MO,Missouri","MT,Montana","NE,Nebraska","NV,Nevada","NH,New Hampshire","NJ,New Jersey","NM,New Mexico","NY,New York","NC,North Carolina","ND,North Dakota","OH,Ohio","OK,Oklahoma","OR,Oregon","PA,Pennsylvania","PR,Puerto Rico","RI,Rhode Island","SC,South Carolina","SD,South Dakota","TN,Tennessee","TX,Texas","UT,Utah","VT,Vermont","VA,Virginia","WA,Washington","WV,West Virginia","WI,Wisconsin","WY,Wyoming"];
var CA_StateOptions = ["AB,Alberta","BC,British Columbia","MB,Manitoba","NB,New Brunswick","NL,Newfoundland","NT,Northwest Territories","NS,Nova Scotia","NU,Nunavut","ON,Ontario","PE,Prince Edward Island","QC,Quebec","SK,Saskatchewan","YT,Yukon"];
var PR_StateOptions = ["PR,Puerto Rico"];

var itemFulfillmentRec = null;

function GetR_L_BOL(trigger){
	
	
	
	var closeFlag = true;
	
	var popup = document.getElementById("popup_rl_bol");

    if (popup != null){
    	popup.className = "overlay overlay_a";
    }
    /*
    setTimeout(function(){
    	
    	try{
    		
    	}catch(err){
    		
    		nlapiLogExecution('Error','Error Generating BOL', err.message);
    		console.log(err.message)
    		
    		document.getElementById('modalclose_rl_bol').style.display = 'block';
        	document.getElementById('modalcontent').innerHTML = "<h2 style=\"width:100%; text-align:center;\"><span id=\"modal_message\"><br>Error: " + err.message + "<span><br><br></h2>\n";
    	}
    	
    },500)
	*/
    setTimeout(function (){
    	itemFulfillmentRec = nlapiLoadRecord('itemfulfillment',nlapiGetRecordId());
        
    	var BOL_Data = {};
    	
    	BOL_Data.itemFulfillmentID = nlapiGetRecordId();
    	
    	var recIF = nlapiLoadRecord('itemfulfillment',nlapiGetRecordId(),{recordmode: 'dynamic'});
    	
    	BOL_Data.date = nlapiGetFieldValue('trandate');
    	
    	BOL_Data.createdFromID = nlapiGetFieldValue('createdfrom');
    	
    	BOL_Data.customerData = {}
    	
    	BOL_Data.customerData.id = nlapiGetFieldValue('entity');
    	
    	if(!_tools.isEmpty(BOL_Data.customerData.id)){
    		
    		var customerFields = nlapiLookupField('customer',BOL_Data.customerData.id, ['mobilephone','phone','altphone','email']);
    		
    		if(!_tools.isEmpty(customerFields)){
    			if(!_tools.isEmpty(customerFields['mobilephone'])){
    				BOL_Data.customerData.phone = customerFields['mobilephone'];
    			}else if(!_tools.isEmpty(customerFields['phone'])){
    				BOL_Data.customerData.phone = customerFields['phone'];
    			}else if(!_tools.isEmpty(customerFields['altphone'])){
    				BOL_Data.customerData.phone = customerFields['altphone'];
    			}
    			
    			if(!_tools.isEmpty(customerFields['email'])){
    				BOL_Data.customerData.email = customerFields['email'];
    			}
    		}
    	}
    	
    	BOL_Data.shipAddress = {};
    	
    	var shipAddressID = nlapiGetFieldValue('shippingaddress_key');
    	
    	var arrSearchFilters = null;
    	var arrSearchColumns = null;
    	var arrSearchResults = null;
    	
    	arrSearchFilters = [
    		new nlobjSearchFilter('internalid',null,'is',shipAddressID)
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
    	
    	
    	
    	arrSearchResults = nlapiSearchRecord('address',null,arrSearchFilters,arrSearchColumns);
    	console.log('ship address search reuslts');
    	console.log(arrSearchResults);
    	
    	if(!_tools.isEmpty(arrSearchResults)){
    		BOL_Data.shipAddress.addressee = arrSearchResults[0].getValue('addressee');
    		BOL_Data.shipAddress.address1 = arrSearchResults[0].getValue('address1');
    		BOL_Data.shipAddress.address2 = arrSearchResults[0].getValue('address2');
    		BOL_Data.shipAddress.city = arrSearchResults[0].getValue('city');
    		BOL_Data.shipAddress.zip = arrSearchResults[0].getValue('zip');
    		BOL_Data.shipAddress.state = arrSearchResults[0].getValue('state');
    		BOL_Data.shipAddress.country = arrSearchResults[0].getValue('country');
    		BOL_Data.shipAddress.countrycode = arrSearchResults[0].getValue('countrycode');
    	}
    	
    	
    	BOL_Data.locationData = {};	
    	
    	if(!_tools.isEmpty(BOL_Data.createdFromID)){
    		var createdFromFields = nlapiLookupField('transaction',BOL_Data.createdFromID,['location','tranid']);
    		console.log(createdFromFields);
    		if(!_tools.isEmpty(createdFromFields)){
    			BOL_Data.createdFromTranID = createdFromFields['tranid'];
    			BOL_Data.createdFromLocationID = createdFromFields['location'];
    			
    			if(!_tools.isEmpty(BOL_Data.createdFromLocationID)){
    				
    				var url = nlapiResolveURL('SUITELET','customscript_ng_sl_get_location_data','customdeploy_ng_sl_get_location_data') + '&rec_id=' + BOL_Data.createdFromLocationID;
    		    	var response = nlapiRequestURL(url);
    		    	console.log(response);
    		    	var locationData = JSON.parse(response.body);
    		    	var billToKey = null;
    				var returnAddrKey = null;
    		    	if(locationData.status == 'success'){
    		    		billToKey = locationData.billToKey;
        				returnAddrKey = locationData.returnAddrKey;
        				
        				//var locationRec = nlapiLoadRecord('location', BOL_Data.createdFromLocationID);
        				//console.log(locationRec);
        				
        				BOL_Data.locationData.BillToAddress = {};
        				BOL_Data.locationData.ReturnAddress = {};
        				
        				//var billToKey = locationRec.getFieldValue('mainaddress_key');
        				//var returnAddrKey = locationRec.getFieldValue('returnaddress_key');
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
        						new nlobjSearchFilter('internalid',null,'anyof',addressKeys)
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
        					
        					
        					
        					arrSearchResults = nlapiSearchRecord('address',null,arrSearchFilters,arrSearchColumns);
        					
        					if(!_tools.isEmpty(arrSearchResults)){
        						console.log(arrSearchResults);
        						
        						if(!_tools.isEmpty(billToKey)){
        							billToResult = arrSearchResults.filter(function(result){return billToKey == result.getValue('internalid')})[0];
        							console.log(billToResult)
        							if(!_tools.isEmpty(billToResult)){
        								BOL_Data.locationData.BillToAddress.addressee = billToResult.getValue('addressee');
        								BOL_Data.locationData.BillToAddress.address1 = billToResult.getValue('address1');
        								BOL_Data.locationData.BillToAddress.address2 = billToResult.getValue('address2');
        								BOL_Data.locationData.BillToAddress.city = billToResult.getValue('city');
        								BOL_Data.locationData.BillToAddress.zip = billToResult.getValue('zip');
        								BOL_Data.locationData.BillToAddress.state = billToResult.getValue('state');
        								BOL_Data.locationData.BillToAddress.country = billToResult.getValue('country');
        								BOL_Data.locationData.BillToAddress.countrycode = billToResult.getValue('countrycode');
        							}
        							
        						}
        						
        						if(!_tools.isEmpty(returnAddrKey)){
        							returnAddrResult = arrSearchResults.filter(function(result){return returnAddrKey == result.getValue('internalid')})[0];
        							
        							if(!_tools.isEmpty(returnAddrResult)){
        								BOL_Data.locationData.ReturnAddress.addressee = returnAddrResult.getValue('addressee');
        								BOL_Data.locationData.ReturnAddress.address1 = returnAddrResult.getValue('address1');
        								BOL_Data.locationData.ReturnAddress.address2 = returnAddrResult.getValue('address2');
        								BOL_Data.locationData.ReturnAddress.city = returnAddrResult.getValue('city');
        								BOL_Data.locationData.ReturnAddress.zip = returnAddrResult.getValue('zip');
        								BOL_Data.locationData.ReturnAddress.state = returnAddrResult.getValue('state');
        								BOL_Data.locationData.ReturnAddress.country = returnAddrResult.getValue('country');
        								BOL_Data.locationData.ReturnAddress.countrycode = returnAddrResult.getValue('countrycode');
        							}
        							
        						}
        						
        					}
        				}
    		    	}else{
    		    		console.log('Not Successful.');
    			    	var message = '<h2 style=\"width:100%; text-align:center;\">Error retrieving location address data.</h2>\n';
    	    			_tools.createModalAlert(message);
    		    	}
    				
    				
    			}
    		}
    		
    		
    	}
    	console.log(BOL_Data);
    	
    	var returnAddress = recIF.getFieldValue('returnshippingaddress_key');
    	console.log('Return Address: ' + returnAddress);
    	
    	if(!_tools.isEmpty(returnAddress)){
    		BOL_Data.returnShip = {};
    		BOL_Data.returnShip.returnAddressKey = returnAddress;
    		
    		var arrSearchFilters2 = null;
    		var arrSearchColumns2 = null;
    		var arrSearchResults2 = null;
    		
    		arrSearchFilters2 = [
    			new nlobjSearchFilter('internalid',null,'anyof',returnAddress)
    		];
    		
    		arrSearchColumns2 = [
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
    		
    		arrSearchResults2 = nlapiSearchRecord('address',null,arrSearchFilters2,arrSearchColumns2);
    		
    		if(!_tools.isEmpty(arrSearchResults2)){
    			console.log('Test Point 1');
    			console.log(arrSearchResults2);
    			
    			BOL_Data.returnShip.addressee = arrSearchResults2[0].getValue('addressee');
    			BOL_Data.returnShip.address1 = arrSearchResults2[0].getValue('address1');
    			BOL_Data.returnShip.address2 = arrSearchResults2[0].getValue('address2');
    			BOL_Data.returnShip.city = arrSearchResults2[0].getValue('city');
    			BOL_Data.returnShip.zip = arrSearchResults2[0].getValue('zip');
    			BOL_Data.returnShip.state = arrSearchResults2[0].getValue('state');			
    			BOL_Data.returnShip.country = arrSearchResults2[0].getValue('country');
    			BOL_Data.returnShip.countrycode = arrSearchResults2[0].getValue('countrycode');
    			
    		}
    	}
    	
    	console.log(BOL_Data);
    	
    	var url = nlapiResolveURL('SUITELET','customscript_ng_sl_get_file_content','customdeploy_ng_sl_get_file_content') + '&file_id=1519127';
    	
    	var response = nlapiRequestURL(url);
    	console.log(response);
    	
    	
    	
    	var html = response.body;
    	
    	console.log(html);
    	setTimeout(function(){
    		document.getElementById('modalcontent').innerHTML = html;
    		document.getElementById('modalclose_rl_bol').style.display = 'block';
    		setTimeout(function(){
    			
    			var now = new Date();

    			var day = ("0" + now.getDate()).slice(-2);
    			var month = ("0" + (now.getMonth() + 1)).slice(-2);

    			var BOL_Date = now.getFullYear()+"-"+(month)+"-"+(day) ;
    			
    			document.getElementById('bol_date').value = BOL_Date;
    			
    			if(!_tools.isEmpty(BOL_Data.returnShip)){
    				console.log('Setting Shipper Data');
    				if(BOL_Data.returnShip.countrycode == 'US'){
    					document.getElementById('shipper_country').value = "USA";
    				}else if(BOL_Data.returnShip.countrycode == 'CA'){
    					document.getElementById('shipper_country').value = "CAN";
    				}else if(BOL_Data.returnShip.countrycode == "PR"){
    					document.getElementById('shipper_country').value = "PRI";
    				}
    				document.getElementById('shipper_country').onchange();
    				document.getElementById('shipper_name').value = BOL_Data.returnShip.addressee;
    				document.getElementById('shipper_addr1').value = BOL_Data.returnShip.address1;
    				document.getElementById('shipper_addr2').value = BOL_Data.returnShip.address2;
    				document.getElementById('shipper_city').value = BOL_Data.returnShip.city;
    				document.getElementById('shipper_state').value = BOL_Data.returnShip.state;
    				document.getElementById('shipper_zip').value = BOL_Data.returnShip.zip;
    				//document.getElementById('shipper_phone').value = '(423) 421-0254'
    				
    			}else if(!_tools.isEmpty(BOL_Data.locationData.ReturnAddress)){
    				console.log('Setting Shipper Data');
    				if(BOL_Data.locationData.ReturnAddress.countrycode == 'US'){
    					document.getElementById('shipper_country').value = "USA";
    				}else if(BOL_Data.locationData.ReturnAddress.countrycode == 'CA'){
    					document.getElementById('shipper_country').value = "CAN";
    				}else if(BOL_Data.locationData.ReturnAddress.countrycode == "PR"){
    					document.getElementById('shipper_country').value = "PRI";
    				}
    				document.getElementById('shipper_country').onchange();
    				document.getElementById('shipper_name').value = BOL_Data.locationData.ReturnAddress.addressee;
    				document.getElementById('shipper_addr1').value = BOL_Data.locationData.ReturnAddress.address1;
    				document.getElementById('shipper_addr2').value = BOL_Data.locationData.ReturnAddress.address2;
    				document.getElementById('shipper_city').value = BOL_Data.locationData.ReturnAddress.city;
    				document.getElementById('shipper_state').value = BOL_Data.locationData.ReturnAddress.state;
    				document.getElementById('shipper_zip').value = BOL_Data.locationData.ReturnAddress.zip;
    				//document.getElementById('shipper_phone').value = '888-230-5398';
    			}
    			
    			if(!_tools.isEmpty(BOL_Data.shipAddress)){
    				console.log('Setting Consignee Data');
    				if(BOL_Data.shipAddress.countrycode == 'US'){
    					document.getElementById('consignee_country').value = "USA";
    				}else if(BOL_Data.shipAddress.countrycode == 'CA'){
    					document.getElementById('consignee_country').value = "CAN";
    				}else if(BOL_Data.shipAddress.countrycode == "PR"){
    					document.getElementById('consignee_country').value = "PRI";
    				}
    				document.getElementById('consignee_country').onchange();
    				document.getElementById('consignee_name').value = BOL_Data.shipAddress.addressee;
    				if(!_tools.isEmpty(BOL_Data.customerData.email))
    				document.getElementById('consignee_email').value = BOL_Data.customerData.email;
    				document.getElementById('consignee_addr1').value = BOL_Data.shipAddress.address1;
    				document.getElementById('consignee_addr2').value = BOL_Data.shipAddress.address2;
    				document.getElementById('consignee_city').value = BOL_Data.shipAddress.city;
    				document.getElementById('consignee_state').value = BOL_Data.shipAddress.state;
    				document.getElementById('consignee_zip').value = BOL_Data.shipAddress.zip;
    				if(!_tools.isEmpty(BOL_Data.customerData.phone)){
    					document.getElementById('consignee_phone').value = BOL_Data.customerData.phone;
    				}
    				
    			}
    			
    			if(!_tools.isEmpty(BOL_Data.locationData.BillToAddress)){
    				console.log('Setting Bill To Data');
    				if(BOL_Data.locationData.BillToAddress.countrycode == 'US'){
    					document.getElementById('bill_to_country').value = "USA";
    				}else if(BOL_Data.locationData.BillToAddress.countrycode == 'CA'){
    					document.getElementById('bill_to_country').value = "CAN";
    				}else if(BOL_Data.locationData.BillToAddress.countrycode == "PR"){
    					document.getElementById('bill_to_country').value = "PRI";
    				}
    				document.getElementById('bill_to_country').onchange();
    				document.getElementById('bill_to_name').value = BOL_Data.locationData.BillToAddress.addressee;
    				document.getElementById('bill_to_addr1').value = BOL_Data.locationData.BillToAddress.address1;
    				document.getElementById('bill_to_addr2').value = BOL_Data.locationData.BillToAddress.address2;
    				document.getElementById('bill_to_city').value = BOL_Data.locationData.BillToAddress.city;
    				document.getElementById('bill_to_state').value = BOL_Data.locationData.BillToAddress.state;
    				document.getElementById('bill_to_zip').value = BOL_Data.locationData.BillToAddress.zip;
    				//document.getElementById('bill_to_phone').value = '888-230-5398';
    				
    			}
    			
    			var lineCount = itemFulfillmentRec.getLineItemCount('item');
    			
    			var itemsQty = 0;
    			
    			for(i=1; i <= lineCount; i++){
    				
    				if(itemFulfillmentRec.getLineItemValue('item','itemreceive',i) == 'T'){
    					var itemQty = parseFloat(itemFulfillmentRec.getLineItemValue('item','itemquantity',i));
    					itemsQty += itemQty;
    				}
    			}
    			console.log('Items Quantity: ' + itemsQty);	
    			
    			document.getElementById('shipper_number').value = BOL_Data.createdFromTranID;
    			
    			var openSections = ['shipInfoTableLabel','consigneeInfoTableLabel','billToInfoTableLabel','ServiceLevelTableLabel','ItemInfoTableLabel','referenceNumbersTableLabel'];
        
    			for(i=0; i < openSections.length; i++){
    				
    				document.getElementById(openSections[i]).click();
    			}	
    		},500);
    		
    	},1000);
    },250);
    
	
}


function closeModal(modalID){
	
	var popup = document.getElementById(modalID);
	
	if (popup != null){
    	popup.className = "overlay overlay_b";
    	setTimeout(function(){
    		document.getElementById('modalclose_rl_bol').style.display = 'none';
        	document.getElementById('modalcontent').innerHTML = "<h2 style=\"width:100%; text-align:center;\"><span id=\"modal_message\"><br>Collecting Data<span><br><br></h2>\n<div style=\"text-align:center;\"><div class=\"lds-dual-ring\"></div>\n";
    	},500);
    	
    } 
	
}

function formatTime(time) {
    time = time.split(":");
    var hours = time[0];
    var minutes = time[1];

    if(hours > 12){
      hours = hours - 12;
      var notation = "PM";
    }else{
      var notation = "AM";
    }

    var timeFormatted = hours + ':' + minutes + ' ' + notation;

    return timeFormatted
  } 

  function deleteRow(row){
    //alert('ItemRow_' + row);
	row = row.split('_')[1];
    var rowID = 'itemRow_' + row;
    var rowElement = document.getElementById(rowID);
    console.log(rowElement);
    rowElement.remove();
    
    var itemsCount = document.getElementsByName("itemRow").length;
    var itemLines = document.getElementsByName("itemRow");
    
    for(i=0; i < itemsCount; i++){
    	console.log(i);
    	console.log(itemLines[i]);
    	var lineNum = i + 1;
    	console.log('LineNum: ' + lineNum);
    	itemLines[i].id = 'itemRow_' + lineNum;
    	itemLines[i].querySelector("[name=setDefaultsBtn]").id = 'setDefaultsBtn_' + lineNum;
    	itemLines[i].querySelector("[name=itemPieces]").id = 'itemPieces_' + lineNum;
    	itemLines[i].querySelector("[name=itemPkgType]").id = 'itemPkgType_' + lineNum;
    	itemLines[i].querySelector("[name=itemNMFC]").id = 'itemNMFC_' + lineNum;
    	itemLines[i].querySelector("[name=itemNMFC_Sub]").id = 'itemNMFC_Sub_' + lineNum;
    	itemLines[i].querySelector("[name=itemClass]").id = 'itemClass_' + lineNum;
    	itemLines[i].querySelector("[name=itemWeight]").id = 'itemWeight_' + lineNum;
    	itemLines[i].querySelector("[name=itemHazmat]").id = 'itemHazmat_' + lineNum;
    	itemLines[i].querySelector("[name=itemDescription]").id = 'itemDescription_' + lineNum;
    	itemLines[i].querySelector("[name=deleteRowBtn]").id = 'deleteRowBtn_' + lineNum;
    	
    }
    
  }
  
  function setStateOptions(countryID, section){
    console.log(countryID + ", " + section);


    if(countryID == "USA"){
      console.log('Test-State-1');
      var stateOptions = "<option value=\"\"></option>";

      for(i=0; i < USA_StateOptions.length; i++){
        stateOption = USA_StateOptions[i].split(",");
        stateOptions += "<option value=\"" + stateOption[0] + "\">" + stateOption[1] + "</option>";
      }

      var sectionName = section.substring(0, section.lastIndexOf("_"));

      var fieldID = sectionName + "_state";
      console.log(fieldID);
      document.getElementById(fieldID).innerHTML = stateOptions;

    }else if(countryID == "CAN"){
      console.log('Test-State-2');
      var stateOptions = "<option value=\"\"></option>";

      for(i=0; i < CA_StateOptions.length; i++){
        stateOption = CA_StateOptions[i].split(",");
        stateOptions += "<option value=\"" + stateOption[0] + "\">" + stateOption[1] + "</option>";
      }

      var sectionName = section.substring(0, section.lastIndexOf("_"));

      var fieldID = sectionName + "_state";
      console.log(fieldID);
      document.getElementById(fieldID).innerHTML = stateOptions;

    }else if(countryID == "PRI"){
      console.log('Test-State-3');
      var stateOptions = "<option value=\"\"></option>";

       for(i=0; i < PR_StateOptions.length; i++){
        stateOption = PR_StateOptions[i].split(",");
        stateOptions += "<option value=\"" + stateOption[0] + "\">" + stateOption[1] + "</option>";
      }

      var sectionName = section.substring(0, section.lastIndexOf("_"));

      var fieldID = sectionName + "_state";
      console.log(fieldID);
      document.getElementById(fieldID).innerHTML = stateOptions;
    }
  }
  
  // Show an element
  var show = function (elem) {

    // Get the natural height of the element
    var getHeight = function () {
      elem.style.display = 'block'; // Make it visible
      var height = elem.scrollHeight + 'px'; // Get it's height
      elem.style.display = ''; //  Hide it again
      return height;
    };

    var height = getHeight(); // Get the natural height
    elem.classList.add('is-visible'); // Make the element visible
    elem.style.height = height; // Update the max-height

    // Once the transition is complete, remove the inline max-height so the content can scale responsively
    window.setTimeout(function () {
      elem.style.height = '';
    }, 350);

  };

  // Hide an element
  var hide = function (elem) {

    // Give the element a height to change from
    elem.style.height = elem.scrollHeight + 'px';

    // Set the height back to 0
    window.setTimeout(function () {
      elem.style.height = '0';
    }, 1);

    // When the transition is complete, hide it
    window.setTimeout(function () {
      elem.classList.remove('is-visible');
    }, 350);

  };

  // Toggle element visibility
  var toggle = function (elem, timing) {

    // If the element is visible, hide it
    if (elem.classList.contains('is-visible')) {
      hide(elem);
      return;
    }

    // Otherwise, show it
    show(elem);
    
  };

  function toggleSection(target){
    var content = document.getElementById(target);
    if(!content) return;

    toggle(content);
  }
  
  
  function itemRowAdd(){
	  
	  
	  var itemsCount = document.getElementsByName("itemRow").length;

	    itemsCount++;
	    var rowID = "itemRow_" + itemsCount;
	    var rowHTML = ""
	        //rowHTML +=  "<div class=\"divTableRow\" name=\"itemRow\">";
	    	rowHTML +=	"<span class=\"setItemDefaults\" >";
	    	rowHTML +=		"<input type=\"button\" name=\"setDefaultsBtn\" class=\"setDefaultsBtn\" id=\"itemDefaultsBtn_" + itemsCount + "\" onclick=\"setLineDefaults(this.id);\" value=\"Populate Defaults\">";
	        rowHTML +=      "<div class=\"divTableCell\">"; 
	        rowHTML +=        "Pieces<br>";
	        rowHTML +=        "<input type=\"text\" name=\"itemPieces\" id=\"itemPieces_" + itemsCount + "\" style=\"width: 50px;\">";                                         
	        rowHTML +=      "</div>"; 
	        rowHTML +=      "<div class=\"divTableCell\">";
	        rowHTML +=        "Pkg. Type<br>";
	        rowHTML +=        "<select name=\"itemPkgType\" id=\"itemPkgType_" + itemsCount +"\" style=\"width: 100px\">";
	        rowHTML +=          "<option value=\"\"></option>";
	        rowHTML +=          "<option value=\"BAG\">BAG</option>";
	        rowHTML +=          "<option value=\"BAR\">BAR</option>";
	        rowHTML +=          "<option value=\"BIN\">BIN</option>";
	        rowHTML +=          "<option value=\"BNDL\">BNDL</option>";
	        rowHTML +=          "<option value=\"Box\">BOX</option>";
	        rowHTML +=          "<option value=\"BSKT\">BSKT</option>";
	        rowHTML +=          "<option value=\"BULK\">BULK</option>";
	        rowHTML +=          "<option value=\"CARBOY\">CARBOY</option>";
	        rowHTML +=          "<option value=\"COIL\">COIL</option>";
	        rowHTML +=          "<option value=\"CPT\">CPT</option>";
	        rowHTML +=          "<option value=\"CRT\">CRT</option>";
	        rowHTML +=          "<option value=\"CTN\">CTN</option>";
	        rowHTML +=          "<option value=\"CYL\">CYL</option>";
	        rowHTML +=          "<option value=\"DAC\">DAC</option>";
	        rowHTML +=          "<option value=\"DRM\">DRM</option>";
	        rowHTML +=          "<option value=\"GAY\">GAY</option>";
	        rowHTML +=          "<option value=\"IBC\">IBC</option>";
	        rowHTML +=          "<option value=\"JER\">JER</option>";
	        rowHTML +=          "<option value=\"LSE\">LSE</option>";
	        rowHTML +=          "<option value=\"MLBG\">MLBG</option>";
	        rowHTML +=          "<option value=\"NSTD\">NSTD</option>";
	        rowHTML +=          "<option value=\"PAIL\">PAIL</option>";
	        rowHTML +=          "<option value=\"PIG\">PIG</option>";
	        rowHTML +=          "<option value=\"PLT\">PLT</option>";
	        rowHTML +=          "<option value=\"RACK\">RACK</option>";
	        rowHTML +=          "<option value=\"REEL\">REEL</option>";
	        rowHTML +=          "<option value=\"ROLL\">ROLL</option>";
	        rowHTML +=          "<option value=\"Skids\">SKD</option>";
	        rowHTML +=          "<option value=\"STK\">STK</option>";
	        rowHTML +=          "<option value=\"TL\">T/L</option>";
	        rowHTML +=          "<option value=\"TANK\">TANK</option>";
	        rowHTML +=          "<option value=\"TOTE\">TOTE</option>";
	        rowHTML +=          "<option value=\"UNIT\">UNIT</option>";
	        rowHTML +=        "</select>";                                        
	        rowHTML +=      "</div>";
	        rowHTML +=      "<div class=\"divTableCell\">"; 
	        rowHTML +=        "NMFC Item Number<br>";
	        rowHTML +=        "<input type=\"text\" name=\"itemNMFC\" id=\"itemNMFC_" + itemsCount + "\" style=\"width: 100px;\">  ";
	        rowHTML +=        "<input type=\"text\" name=\"itemNMFC_Sub\" id=\"itemNMFC_Sub_" + itemsCount + "\" style=\"width: 50px;\">";
	        rowHTML +=      "</div>"; 
	        rowHTML +=      "<div class=\"divTableCell\">";
	        rowHTML +=        "Class<br>";
	        rowHTML +=        "<select name=\"itemClass\" id=\"itemClass_" + itemsCount + "\" >";
	        rowHTML +=          "<option value=\"\"></option>";
	        rowHTML +=          "<option value=\"50\">50.0</option>";
	        rowHTML +=          "<option value=\"55\">55.0</option>";
	        rowHTML +=          "<option value=\"60\">60.0</option>";
	        rowHTML +=          "<option value=\"65\">65.0</option>";
	        rowHTML +=          "<option value=\"70\">70.0</option>";
	        rowHTML +=          "<option value=\"77.5\">77.5</option>";
	        rowHTML +=          "<option value=\"85\">85.0</option>";
	        rowHTML +=          "<option value=\"92.5\">92.5</option>";
	        rowHTML +=          "<option value=\"100\">100.0</option>";
	        rowHTML +=          "<option value=\"110\">110.0</option>";
	        rowHTML +=          "<option value=\"125\">125.0</option>";
	        rowHTML +=          "<option value=\"150\">150.0</option>";
	        rowHTML +=          "<option value=\"175\">175.0</option>";
	        rowHTML +=          "<option value=\"200\">200.0</option>";
	        rowHTML +=          "<option value=\"250\">250.0</option>";
	        rowHTML +=          "<option value=\"300\">300.0</option>";
	        rowHTML +=          "<option value=\"400\">400.0</option>";
	        rowHTML +=          "<option value=\"500\">500.0</option>";
	        rowHTML +=        "</select>";
	        rowHTML +=      "</div>";
	        rowHTML +=      "<div class=\"divTableCell\">";
	        rowHTML +=        "Weight<br>";
	        rowHTML +=        "<input type=\"text\" name=\"itemWeight\" id=\"itemWeight_" + itemsCount + "\" style=\"width: 50px;\">";
	        rowHTML +=      "</div>";
	        rowHTML +=      "<div class=\"divTableCell\">";
	        rowHTML +=        "Is Hazmat?<br>";
	        rowHTML +=        "<input type=\"checkbox\" name=\"itemHazmat\" id=\"itemHazmat_" + itemsCount + "\" onclick=\"checkHazmat();\">";
	        rowHTML +=    	"</div>"; 
	        rowHTML +=    	"<div class=\"divTableCell\">";
	        rowHTML +=      	"Description<br>";
	        rowHTML +=     	 	"<textarea name=\"itemDescription\" id=\"itemDescription_" + itemsCount + "\" style=\"height: 50px; width: 150;\"></textarea>";
	        rowHTML +=    	"</div>";
	        rowHTML +=    	"<div class=\"divTableCell\">";        
	        rowHTML +=      	"<br><button class=\"closeBtn\" name=\"deleteRowBtn\" id=\"deleteRowBtn_" + itemsCount + "\" onClick=\"deleteRow(this.id);\"><i class=\"fa fa-close\"></i></button>";
	        rowHTML +=    	"</div>";
	        rowHTML +=	"</span>"
	        

	         var itemRow = document.createElement('div');
	        itemRow.className = "divTableRow itemRow";
	        itemRow.setAttribute('name','itemRow');
	        itemRow.setAttribute('id','itemRow_' + itemsCount);
	        itemRow.innerHTML = rowHTML;

	        console.log(itemRow);
	        
	        var items = document.querySelector('#itemsList');
	        items.appendChild(itemRow);
	        
	        var popupModal = document.getElementById('popup_modal');
	        var itemsListBottom = popupModal.querySelector('#hazmatInfoTableLabel').offsetTop;
	        var modalHeight = popupModal.offsetHeight;
	        popupModal.scrollTop = (itemsListBottom - modalHeight);
  }
  
  function setLineDefaults(row){
	  
	  row = row.split('_')[1];	  
	  console.log('Set Line Defaults - Row: ' + row);	  
	  
	  document.getElementById('itemPkgType_' + row).value = "CTN";
	  document.getElementById('itemNMFC_' + row).value = "069420";
	  document.getElementById('itemNMFC_Sub_' + row).value = "06";
	  document.getElementById('itemClass_' + row).value = "100";
	  document.getElementById('itemWeight_' + row).value = "157";
	  document.getElementById('itemDescription_' + row).value = "Fireplaces or Imitation Fireplaces";
  } 
  
  function pickupRequest(checked){
	  var content = document.getElementById('pickupInfo');
	  if(checked){
		  var now = new Date();
		  
		  var day = ("0" + now.getDate()).slice(-2);
		  var month = ("0" + (now.getMonth() + 1)).slice(-2);

		  var BOL_Date = now.getFullYear()+"-"+(month)+"-"+(day) ;
		  
		  var hours = now.getHours();
		  if(hours < 10){
			  hours = '0' +  hours;
		  }
		  var minutes = now.getMinutes();
		  if(minutes < 10){
			  mintues = '0' + minutes;
		  }
		  
		  var time = hours + ":" + minutes;
		  console.log(time);
		  document.getElementById('pickup_date').value = BOL_Date;
		  document.getElementById('ready_time').value = time;
		  show(content);
	  }else{
		  document.getElementById('pickup_date').value = '';
		  document.getElementById('ready_time').value = '';
		  hide(content);
	  }
	  
  }
  
  function checkHazmat(){
	  console.log('test');
	  var hazmatCheckboxes = document.getElementsByName('itemHazmat')
	  console.log(hazmatCheckboxes);
	  var hazmatFlag = false;
	  for(i=0; i < hazmatCheckboxes.length; i++){
		  
		  if(hazmatCheckboxes[i].checked){
			  
			  hazmatFlag = true;
			  break;
			  
		  }
	  }
	  var content = document.getElementById('hazmatInfoTable');
	  if(hazmatFlag){
		  console.log('show hazmat')
		  show(content)
	  }else{
		  console.log('hide hazmat');
		  hide(content);
	  }
		
  }
  
  function submitBOLForm(){
	  
	  var BOL_Form_Data = {};
	  
	  console.log('Check for missing required Items.');
	  
	  var missingFields = [];
	  
	  var dateBOL = document.getElementById('bol_date').value;
	  if(_tools.isEmpty(dateBOL)){
		  missingFields.push('Date');
	  }else{
		  BOL_Form_Data.date = dateBOL;
	  }
	  
	  var charges = document.getElementsByName('charges');
	  
	  for(i=0; i < charges.length; i++){
		  if(charges[i].checked){
			  var charge = charges[i].value;
			  BOL_Form_Data.charge = charge;
		  }
	  }
	  
	//Start of Shipper Info Data Collection
	  
	  BOL_Form_Data.shipperInfo = {};
	  
	  var shipperName = document.getElementById('shipper_name').value;
	  if(_tools.isEmpty(shipperName)){
		  missingFields.push('Shipper Name');
	  }else{
		  BOL_Form_Data.shipperInfo.Name = shipperName;
	  }
	  
	  var shipperEmail = document.getElementById('shipper_email').value;
	  if(_tools.isEmpty(shipperEmail)){
		  missingFields.push('Shipper Email');
	  }else{
		  BOL_Form_Data.shipperInfo.Email = shipperEmail;
	  }
	  
	  var shipperAddr1 = document.getElementById('shipper_addr1').value;
	  if(_tools.isEmpty(shipperAddr1)){
		  missingFields.push('Shipper Address 1');
	  }else{
		  BOL_Form_Data.shipperInfo.Addr1 = shipperAddr1;
	  }
	  
	  var shipperAddr2 = document.getElementById('shipper_addr2').value;
	  if(_tools.isEmpty(shipperAddr2)){
		  BOL_Form_Data.shipperInfo.Addr2 = "";
	  }else{
		  BOL_Form_Data.shipperInfo.Addr2 = shipperAddr2;
	  }
	  
	  var shipperCity = document.getElementById('shipper_city').value;
	  if(_tools.isEmpty(shipperCity)){
		  missingFields.push('Shipper City');
	  }else{
		  BOL_Form_Data.shipperInfo.City = shipperCity;
	  }
	  
	  var shipperState = document.getElementById('shipper_state').value;
	  if(_tools.isEmpty(shipperState)){
		  missingFields.push('Shipper State');
	  }else{
		  BOL_Form_Data.shipperInfo.State = shipperState;
	  }
	  
	  var shipperCountry = document.getElementById('shipper_country').value;
	  if(_tools.isEmpty(shipperCountry)){
		  missingFields.push('Shipper Country');
	  }else{
		  BOL_Form_Data.shipperInfo.Country = shipperCountry;
	  }
	  
	  var shipperZip = document.getElementById('shipper_zip').value;
	  if(_tools.isEmpty(shipperZip)){
		  missingFields.push('Shipper Zip');
	  }else{
		  BOL_Form_Data.shipperInfo.Zip = shipperZip;
	  }
	  
	  var shipperPhone = document.getElementById('shipper_phone').value;
	  if(_tools.isEmpty(shipperPhone)){
		  missingFields.push('Shipper Phone');
	  }else{
		  BOL_Form_Data.shipperInfo.Phone = shipperPhone;
	  }
	  
	  var shipperPhoneExt = document.getElementById('shipper_phone_ext').value;
	  if(_tools.isEmpty(shipperPhoneExt)){
		  BOL_Form_Data.shipperInfo.PhoneExt = "";
	  }else{
		  BOL_Form_Data.shipperInfo.PhoneExt = shipperPhoneExt;
	  }
	  
	  //Start of Consignee Info Data Collection
	  
	  BOL_Form_Data.consigneeInfo = {};
	  
	  var consigneeName = document.getElementById('consignee_name').value;
	  if(_tools.isEmpty(consigneeName)){
		  missingFields.push('consignee Name');
	  }else{
		  BOL_Form_Data.consigneeInfo.Name = consigneeName;
	  }
	  
	  var consigneeAttn = document.getElementById('consignee_attn').value;
	  if(_tools.isEmpty(consigneeAttn)){
		  BOL_Form_Data.consigneeInfo.Attn = "";
	  }else{
		  BOL_Form_Data.consigneeInfo.Attn = consigneeAttn;
	  }
	  
	  var consigneeEmail = document.getElementById('consignee_email').value;
	  if(_tools.isEmpty(consigneeEmail)){
		  BOL_Form_Data.consigneeInfo.Email = "";
	  }else{
		  BOL_Form_Data.consigneeInfo.Email = consigneeEmail;
	  }
	  
	  var consigneeAddr1 = document.getElementById('consignee_addr1').value;
	  if(_tools.isEmpty(consigneeAddr1)){
		  missingFields.push('consignee Address 1');
	  }else{
		  BOL_Form_Data.consigneeInfo.Addr1 = consigneeAddr1;
	  }
	  
	  var consigneeAddr2 = document.getElementById('consignee_addr2').value;
	  if(_tools.isEmpty(consigneeAddr2)){
		  BOL_Form_Data.consigneeInfo.Addr2 = "";
	  }else{
		  BOL_Form_Data.consigneeInfo.Addr2 = consigneeAddr2;
	  }
	  
	  var consigneeCity = document.getElementById('consignee_city').value;
	  if(_tools.isEmpty(consigneeCity)){
		  missingFields.push('consignee City');
	  }else{
		  BOL_Form_Data.consigneeInfo.City = consigneeCity;
	  }
	  
	  var consigneeState = document.getElementById('consignee_state').value;
	  if(_tools.isEmpty(consigneeState)){
		  missingFields.push('consignee State');
	  }else{
		  BOL_Form_Data.consigneeInfo.State = consigneeState;
	  }
	  
	  var consigneeCountry = document.getElementById('consignee_country').value;
	  if(_tools.isEmpty(consigneeCountry)){
		  missingFields.push('consignee Country');
	  }else{
		  BOL_Form_Data.consigneeInfo.Country = consigneeCountry;
	  }
	  
	  var consigneeZip = document.getElementById('consignee_zip').value;
	  if(_tools.isEmpty(consigneeZip)){
		  missingFields.push('consignee Zip');
	  }else{
		  BOL_Form_Data.consigneeInfo.Zip = consigneeZip;
	  }
	  
	  var consigneePhone = document.getElementById('consignee_phone').value;
	  if(_tools.isEmpty(consigneePhone)){
		  BOL_Form_Data.consigneeInfo.Phone = "";
	  }else{
		  BOL_Form_Data.consigneeInfo.Phone = consigneePhone;
	  }
	  
	  var consigneePhoneExt = document.getElementById('consignee_phone_ext').value;
	  if(_tools.isEmpty(consigneePhoneExt)){
		  BOL_Form_Data.consigneeInfo.PhoneExt = "";
	  }else{
		  BOL_Form_Data.consigneeInfo.PhoneExt = consigneePhoneExt;
	  }
	  
	  //Start Bill To Info Data Collection
	  
	  BOL_Form_Data.bill_toInfo = {};
	  
	  var bill_toName = document.getElementById('bill_to_name').value;
	  if(_tools.isEmpty(bill_toName)){
		  BOL_Form_Data.bill_toInfo.Name = "";
	  }else{
		  BOL_Form_Data.bill_toInfo.Name = bill_toName;
	  }  
	  
	  var bill_toEmail = document.getElementById('bill_to_email').value;
	  if(_tools.isEmpty(bill_toEmail)){
		  BOL_Form_Data.bill_toInfo.Email = "";
	  }else{
		  BOL_Form_Data.bill_toInfo.Email = bill_toEmail;
	  }
	  
	  var bill_toAddr1 = document.getElementById('bill_to_addr1').value;
	  if(_tools.isEmpty(bill_toAddr1)){
		  BOL_Form_Data.bill_toInfo.Addr1 = "";
	  }else{
		  BOL_Form_Data.bill_toInfo.Addr1 = bill_toAddr1;
	  }
	  
	  var bill_toAddr2 = document.getElementById('bill_to_addr2').value;
	  if(_tools.isEmpty(bill_toAddr2)){
		  BOL_Form_Data.bill_toInfo.Addr2 = "";
	  }else{
		  BOL_Form_Data.bill_toInfo.Addr2 = bill_toAddr2;
	  }
	  
	  var bill_toCity = document.getElementById('bill_to_city').value;
	  if(_tools.isEmpty(bill_toCity)){
		  BOL_Form_Data.bill_toInfo.City = "";
	  }else{
		  BOL_Form_Data.bill_toInfo.City = bill_toCity;
	  }
	  
	  var bill_toState = document.getElementById('bill_to_state').value;
	  if(_tools.isEmpty(bill_toState)){
		  BOL_Form_Data.bill_toInfo.State = "";
	  }else{
		  BOL_Form_Data.bill_toInfo.State = bill_toState;
	  }
	  
	  var bill_toCountry = document.getElementById('bill_to_country').value;
	  if(_tools.isEmpty(bill_toCountry)){
		  BOL_Form_Data.bill_toInfo.Country = "";
	  }else{
		  BOL_Form_Data.bill_toInfo.Country = bill_toCountry;
	  }
	  
	  var bill_toZip = document.getElementById('bill_to_zip').value;
	  if(_tools.isEmpty(bill_toZip)){
		  BOL_Form_Data.bill_toInfo.Zip = "";
	  }else{
		  BOL_Form_Data.bill_toInfo.Zip = bill_toZip;
	  }
	  
	  var bill_toPhone = document.getElementById('bill_to_phone').value;
	  if(_tools.isEmpty(bill_toPhone)){
		  BOL_Form_Data.bill_toInfo.Phone = "";
	  }else{
		  BOL_Form_Data.bill_toInfo.Phone = bill_toPhone;
	  }
	  
	  var bill_toPhoneExt = document.getElementById('bill_to_phone_ext').value;
	  if(_tools.isEmpty(bill_toPhoneExt)){
		  BOL_Form_Data.bill_toInfo.PhoneExt = "";
	  }else{
		  BOL_Form_Data.bill_toInfo.PhoneExt = bill_toPhoneExt;
	  }
	  
	  //Start Broker Info Data Collection
	  
	  BOL_Form_Data.brokerInfo = {};
	  
	  var brokerName = document.getElementById('broker_name').value;
	  if(_tools.isEmpty(brokerName)){
		  BOL_Form_Data.brokerInfo.Name = "";
	  }else{
		  BOL_Form_Data.brokerInfo.Name = brokerName;
	  }  
	  
	  var brokerEmail = document.getElementById('broker_email').value;
	  if(_tools.isEmpty(brokerEmail)){
		  BOL_Form_Data.brokerInfo.Email = "";
	  }else{
		  BOL_Form_Data.brokerInfo.Email = brokerEmail;
	  }
	  
	  var brokerAddr1 = document.getElementById('broker_addr1').value;
	  if(_tools.isEmpty(brokerAddr1)){
		  BOL_Form_Data.brokerInfo.Addr1 = "";
	  }else{
		  BOL_Form_Data.brokerInfo.Addr1 = brokerAddr1;
	  }
	  
	  var brokerAddr2 = document.getElementById('broker_addr2').value;
	  if(_tools.isEmpty(brokerAddr2)){
		  BOL_Form_Data.brokerInfo.Addr2 = "";
	  }else{
		  BOL_Form_Data.brokerInfo.Addr2 = brokerAddr2;
	  }
	  
	  var brokerCity = document.getElementById('broker_city').value;
	  if(_tools.isEmpty(brokerCity)){
		  BOL_Form_Data.brokerInfo.City = "";
	  }else{
		  BOL_Form_Data.brokerInfo.City = brokerCity;
	  }
	  
	  var brokerState = document.getElementById('broker_state').value;
	  if(_tools.isEmpty(brokerState)){
		  BOL_Form_Data.brokerInfo.State = "";
	  }else{
		  BOL_Form_Data.brokerInfo.State = brokerState;
	  }
	  
	  var brokerCountry = document.getElementById('broker_country').value;
	  if(_tools.isEmpty(brokerCountry)){
		  BOL_Form_Data.brokerInfo.Country = "";
	  }else{
		  BOL_Form_Data.brokerInfo.Country = brokerCountry;
	  }
	  
	  var brokerZip = document.getElementById('broker_zip').value;
	  if(_tools.isEmpty(brokerZip)){
		  BOL_Form_Data.brokerInfo.Zip = "";
	  }else{
		  BOL_Form_Data.brokerInfo.Zip = brokerZip;
	  }
	  
	  var brokerPhone = document.getElementById('broker_phone').value;
	  if(_tools.isEmpty(brokerPhone)){
		  BOL_Form_Data.brokerInfo.Phone = "";
	  }else{
		  BOL_Form_Data.brokerInfo.Phone = brokerPhone;
	  }
	  
	  var brokerPhoneExt = document.getElementById('broker_phone_ext').value;
	  if(_tools.isEmpty(brokerPhoneExt)){
		  BOL_Form_Data.brokerInfo.PhoneExt = "";
	  }else{
		  BOL_Form_Data.brokerInfo.PhoneExt = brokerPhoneExt;
	  }
	  
	  //Start Remit COD Info Data Collection
	  
	  BOL_Form_Data.remit_codInfo = {};
	  
	  var remit_codAmount = document.getElementById('remit_cod_amount').value;
	  if(_tools.isEmpty(remit_codAmount)){
		  BOL_Form_Data.remit_codInfo.Amount = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.Amount = remit_codAmount;
	  } 
	  
	  var remit_codCheck = document.getElementById('remit_cod_check').value;
	  if(_tools.isEmpty(remit_codCheck)){
		  BOL_Form_Data.remit_codInfo.Check = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.Check = remit_codCheck;
	  }
	  
	  var remit_codFee = document.getElementById('remit_cod_fee').value;
	  if(_tools.isEmpty(remit_codFee)){
		  BOL_Form_Data.remit_codInfo.Fee = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.Fee = remit_codFee;
	  }
	  
	  var remit_codName = document.getElementById('remit_cod_name').value;
	  if(_tools.isEmpty(remit_codName)){
		  BOL_Form_Data.remit_codInfo.Name = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.Name = remit_codName;
	  }  
	  
	  var remit_codEmail = document.getElementById('remit_cod_email').value;
	  if(_tools.isEmpty(remit_codEmail)){
		  BOL_Form_Data.remit_codInfo.Email = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.Email = remit_codEmail;
	  }
	  
	  var remit_codAddr1 = document.getElementById('remit_cod_addr1').value;
	  if(_tools.isEmpty(remit_codAddr1)){
		  BOL_Form_Data.remit_codInfo.Addr1 = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.Addr1 = remit_codAddr1;
	  }
	  
	  var remit_codAddr2 = document.getElementById('remit_cod_addr2').value;
	  if(_tools.isEmpty(remit_codAddr2)){
		  BOL_Form_Data.remit_codInfo.Addr2 = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.Addr2 = remit_codAddr2;
	  }
	  
	  var remit_codCity = document.getElementById('remit_cod_city').value;
	  if(_tools.isEmpty(remit_codCity)){
		  BOL_Form_Data.remit_codInfo.City = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.City = remit_codCity;
	  }
	  
	  var remit_codState = document.getElementById('remit_cod_state').value;
	  if(_tools.isEmpty(remit_codState)){
		  BOL_Form_Data.remit_codInfo.State = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.State = remit_codState;
	  }
	  
	  var remit_codCountry = document.getElementById('remit_cod_country').value;
	  if(_tools.isEmpty(remit_codCountry)){
		  BOL_Form_Data.remit_codInfo.Country = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.Country = remit_codCountry;
	  }
	  
	  var remit_codZip = document.getElementById('remit_cod_zip').value;
	  if(_tools.isEmpty(remit_codZip)){
		  BOL_Form_Data.remit_codInfo.Zip = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.Zip = remit_codZip;
	  }
	  
	  var remit_codPhone = document.getElementById('remit_cod_phone').value;
	  if(_tools.isEmpty(remit_codPhone)){
		  BOL_Form_Data.remit_codInfo.Phone = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.Phone = remit_codPhone;
	  }
	  
	  var remit_codPhoneExt = document.getElementById('remit_cod_phone_ext').value;
	  if(_tools.isEmpty(remit_codPhoneExt)){
		  BOL_Form_Data.remit_codInfo.PhoneExt = "";
	  }else{
		  BOL_Form_Data.remit_codInfo.PhoneExt = brokerPhoneExt;
	  }
	  
	  //Start Additional Services Data Collection
	  
	  BOL_Form_Data.add_servInfo = {};
	  
	  var OriginLiftgate = document.getElementById('OriginLiftgate').checked;
	  if(_tools.isEmpty(OriginLiftgate)){
		  BOL_Form_Data.add_servInfo.OriginLiftgate = false
	  }else{
		  BOL_Form_Data.add_servInfo.OriginLiftgate = OriginLiftgate;
	  }
	  
	  var DestinationLiftgate = document.getElementById('DestinationLiftgate').checked;
	  if(_tools.isEmpty(DestinationLiftgate)){
		  BOL_Form_Data.add_servInfo.DestinationLiftgate = false
	  }else{
		  BOL_Form_Data.add_servInfo.DestinationLiftgate = DestinationLiftgate;
	  }
	  
	  var InsidePickup = document.getElementById('InsidePickup').checked;
	  if(_tools.isEmpty(InsidePickup)){
		  BOL_Form_Data.add_servInfo.InsidePickup = false
	  }else{
		  BOL_Form_Data.add_servInfo.InsidePickup = InsidePickup;
	  }
	  
	  var InsideDelivery = document.getElementById('InsideDelivery').checked;
	  if(_tools.isEmpty(InsideDelivery)){
		  BOL_Form_Data.add_servInfo.InsideDelivery = false
	  }else{
		  BOL_Form_Data.add_servInfo.InsideDelivery = InsideDelivery;
	  }
	  
	  var LimitedAccessPickup = document.getElementById('LimitedAccessPickup').checked;
	  if(_tools.isEmpty(LimitedAccessPickup)){
		  BOL_Form_Data.add_servInfo.LimitedAccessPickup = false
	  }else{
		  BOL_Form_Data.add_servInfo.LimitedAccessPickup = LimitedAccessPickup;
	  }
	  
	  var LimitedAccessDelivery = document.getElementById('LimitedAccessDelivery').checked;
	  if(_tools.isEmpty(LimitedAccessDelivery)){
		  BOL_Form_Data.add_servInfo.LimitedAccessDelivery = false
	  }else{
		  BOL_Form_Data.add_servInfo.LimitedAccessDelivery = LimitedAccessDelivery;
	  }
	  
	  var DeliveryNotification = document.getElementById('DeliveryNotification').checked;
	  if(_tools.isEmpty(DeliveryNotification)){
		  BOL_Form_Data.add_servInfo.DeliveryNotification = false;
	  }else{
		  BOL_Form_Data.add_servInfo.DeliveryNotification = DeliveryNotification;
	  }
	  
	  var FreezeProtection = document.getElementById('FreezeProtection').checked;
	  if(_tools.isEmpty(FreezeProtection)){
		  BOL_Form_Data.add_servInfo.FreezeProtection = false;
	  }else{
		  BOL_Form_Data.add_servInfo.FreezeProtection = FreezeProtection;
	  }
	  
	  //Start Service Level Data Collection
	  
	  BOL_Form_Data.serviceLevelInfo = {};
	  
	  var serviceLevels = document.getElementsByName('servicelevel');
	  
	  for(i=0; i < serviceLevels.length; i++){
		  if(serviceLevels[i].checked){
			  var serviceLevel = serviceLevels[i].value;
			  BOL_Form_Data.serviceLevelInfo.serviceLevel = serviceLevel;
			  
			  if(serviceLevel == 'GuaranteedHourlyWindow'){
				  var windowStart = document.getElementById('windowStart').value;
				  if(_tools.isEmpty(windowStart)){
					  missingFields.push('Window Start');
				  }else{
					  BOL_Form_Data.serviceLevelInfo.windowStart = formatTime(windowStart);
				  }
				  
				  var windowEnd = document.getElementById('windowEnd').value;
				  if(_tools.isEmpty(windowEnd)){
					  missingFields.push('Window End');
				  }else{
					  BOL_Form_Data.serviceLevelInfo.windowEnd = formatTime(windowEnd);
				  }
			  }else if(serviceLevel == 'ExpeditedService'){
				  var expeditedQuoteNumber = document.getElementById('expeditedQuoteNumber').value;
				  if(_tools.isEmpty(expeditedQuoteNumber)){
					  missingFields.push('Expedited Quote Number');
				  }else{
					  BOL_Form_Data.serviceLevelInfo.expeditedQuoteNumber = expeditedQuoteNumber;
				  }
			  }
		  }
	  }
	  
	  //Start Items Data Collection
	  BOL_Form_Data.totalPieces = 0;
	  BOL_Form_Data.items = [];
	  
	  var hazmatItem = false;
	  
	  var items = document.getElementsByName('itemRow');
	  
	  if(items.length > 0){
		  for(i=0; i < items.length; i++){
			  var row = i + 1;
			  var item = {};
			  var pieces = document.getElementById('itemPieces_' + row).value;
			  if(_tools.isEmpty(pieces)){
				  missingFields.push('Item Pieces is missing in row ' + row);
			  }else{
				  item.pieces = pieces;
				  BOL_Form_Data.totalPieces += parseInt(pieces);
			  }
			  
			  var packageType = document.getElementById('itemPkgType_' + row).value;
			  if(_tools.isEmpty(packageType)){
				  missingFields.push('Item package type is missing in row ' + row);
			  }else{
				  item.packageType = packageType;
			  }
			  
			  var nmfcNum = document.getElementById('itemNMFC_' + row).value;
			  if(_tools.isEmpty(nmfcNum)){
				  missingFields.push('Item NMFC # is missing in row ' + row);
			  }else{
				  item.nmfcNum = nmfcNum;
			  }
			  
			  var nmfcSubNum = document.getElementById('itemNMFC_Sub_' + row).value;
			  if(_tools.isEmpty(nmfcSubNum)){
				  missingFields.push('Item NMFC Sub # is missing in row ' + row);
			  }else{
				  item.nmfcSubNum = nmfcSubNum;
			  }
			  
			  var itemClass = document.getElementById('itemClass_' + row).value;
			  if(_tools.isEmpty(itemClass)){
				  missingFields.push('Item Class is missing in row ' + row);
			  }else{
				  item.itemClass = itemClass;
			  }
			  
			  var itemWeight = document.getElementById('itemWeight_' + row).value;
			  if(_tools.isEmpty(itemWeight)){
				  missingFields.push('Item Weight is missing in row ' + row);
			  }else{
				  item.itemWeight = itemWeight;
			  }
			  
			  var itemHazmat = document.getElementById('itemHazmat_' + row).checked;
			  if(_tools.isEmpty(itemHazmat) || !itemHazmat){
				  item.itemHazmat = false;
			  }else{
				  item.itemHazmat = itemHazmat;
				  hazmatItem = true;
			  }
			  
			  var itemDesc = document.getElementById('itemDescription_' + row).value;
			  if(_tools.isEmpty(itemDesc)){
				  missingFields.push('Item Description is missing in row ' + row);
			  }else{
				  item.itemDesc = itemDesc;
			  }
			  
			  BOL_Form_Data.items.push(item);
			  
		  }	  
		  
	  }else{
		  missingFields.push('No Item Lines have been added to the BOL');
	  }
	  
	  BOL_Form_Data.hazmatInfo = {};
	  
	  var hazmat_emerg_phone = document.getElementById('hazmat_emerg_phone').value;
	  if(_tools.isEmpty(hazmat_emerg_phone)){
		  if(hazmatItem){
			  missingFields.push('Hazmat Emerg. Phone is missing.'); 
		  }else{
			  BOL_Form_Data.hazmatInfo.hazmat_emerg_phone = "";
		  }
		 
	  }else{
		  BOL_Form_Data.hazmatInfo.hazmat_emerg_phone = hazmat_emerg_phone;
	  }
	  
	  var hazmat_emerg_phone_ext = document.getElementById('hazmat_emerg_phone_ext').value;
	  if(_tools.isEmpty(hazmat_emerg_phone_ext)){
		  BOL_Form_Data.hazmatInfo.hazmat_emerg_phone_ext = "";
		 
	  }else{
		  BOL_Form_Data.hazmatInfo.hazmat_emerg_phone_ext = hazmat_emerg_phone_ext;
	  }
	  
	  var hazmat_contract_num = document.getElementById('hazmat_contract_num').value;
	  if(_tools.isEmpty(hazmat_contract_num)){
		  BOL_Form_Data.hazmatInfo.hazmat_contract_num = "";
		 
	  }else{
		  BOL_Form_Data.hazmatInfo.hazmat_contract_num = hazmat_contract_num;
	  }
	  
	  var hazmat_offerer = document.getElementById('hazmat_offerer').value;
	  if(_tools.isEmpty(hazmat_offerer)){
		  BOL_Form_Data.hazmatInfo.hazmat_offerer = "";
		 
	  }else{
		  BOL_Form_Data.hazmatInfo.hazmat_offerer = hazmat_offerer;
	  }
	  
	  var declared_value_amount = document.getElementById('declared_value_amount').value;
	  if(_tools.isEmpty(declared_value_amount)){
		  BOL_Form_Data.declared_value_amount = "";
		 
	  }else{
		  BOL_Form_Data.declared_value_amount = declared_value_amount;
	  }
	  
	  var declared_value_measurment = document.getElementById('declared_value_measurment').value;
	  if(_tools.isEmpty(declared_value_measurment)){
		  BOL_Form_Data.declared_value_measurment = "";
		 
	  }else{
		  BOL_Form_Data.declared_value_measurment = declared_value_measurment;
	  }
	  
	  var special_instructions = document.getElementById('special_instructions').value;
	  if(_tools.isEmpty(special_instructions)){
		  BOL_Form_Data.special_instructions = "";
		 
	  }else{
		  BOL_Form_Data.special_instructions = special_instructions;
	  }
	  
	  var shipper_number = document.getElementById('shipper_number').value;
	  if(_tools.isEmpty(shipper_number)){
		  BOL_Form_Data.shipper_number = "";
		 
	  }else{
		  BOL_Form_Data.shipper_number = shipper_number;
	  }
	  
	  var quote_number = document.getElementById('quote_number').value;
	  if(_tools.isEmpty(quote_number)){
		  BOL_Form_Data.quote_number = ""; 
		 
	  }else{
		  BOL_Form_Data.quote_number = quote_number;
	  }
	  
	  var po_number = document.getElementById('po_number').value;
	  if(_tools.isEmpty(po_number)){
		  BOL_Form_Data.po_number = "";
		 
	  }else{
		  BOL_Form_Data.po_number = po_number;
	  }
	  
	  var schedulePickupRequest = document.getElementById('schedulePickupRequest').checked;
	  if(_tools.isEmpty(schedulePickupRequest) || !schedulePickupRequest){
		  BOL_Form_Data.schedulePickupRequest = false;
		  BOL_Form_Data.pickup_date = "";
		  BOL_Form_Data.ready_time = "";
		  BOL_Form_Data.close_time = "";
		  BOL_Form_Data.pickup_contact_phone = "";
		  BOL_Form_Data.pickup_contact_phone_ext = "";
		  BOL_Form_Data.pickup_contact_email = "";
		  BOL_Form_Data.pickup_contact_name = "";
		  BOL_Form_Data.pickup_company_name = "";
	  }else{
		  BOL_Form_Data.schedulePickupRequest = schedulePickupRequest;
		  
		  var pickup_date = document.getElementById('pickup_date').value;
		  if(_tools.isEmpty(pickup_date)){
			  missingFields.push('Pick-up date is missing for pick-up request.');
			 
		  }else{
			  BOL_Form_Data.pickup_date = pickup_date;
		  }	  
		  
		  var ready_time = document.getElementById('ready_time').value;
		  if(_tools.isEmpty(ready_time)){
			  missingFields.push('Ready time is missing for pick-up request.');
			 
		  }else{
			  BOL_Form_Data.ready_time = ready_time;
		  }
		  
		  var close_time = document.getElementById('close_time').value;
		  if(_tools.isEmpty(close_time)){
			  missingFields.push('Close time is missing for pick-up request.');
			 
		  }else{
			  BOL_Form_Data.close_time = close_time;
		  }
		  
		  var pickup_contact_phone = document.getElementById('pickup_contact_phone').value;
		  if(_tools.isEmpty(pickup_contact_phone)){
			  BOL_Form_Data.pickup_contact_phone = "";
			 
		  }else{
			  BOL_Form_Data.pickup_contact_phone = pickup_contact_phone;
		  }
		  
		  var pickup_contact_phone_ext = document.getElementById('pickup_contact_phone_ext').value;
		  if(_tools.isEmpty(pickup_contact_phone_ext)){
			  BOL_Form_Data.pickup_contact_phone_ext = "";
			 
		  }else{
			  BOL_Form_Data.pickup_contact_phone_ext = pickup_contact_phone_ext;
		  }
		  
		  var pickup_contact_email = document.getElementById('pickup_contact_email').value;
		  if(_tools.isEmpty(pickup_contact_email)){
			  BOL_Form_Data.pickup_contact_email = "";
			 
		  }else{
			  BOL_Form_Data.pickup_contact_email = pickup_contact_email;
		  }
		  
		  var pickup_contact_name = document.getElementById('pickup_contact_name').value;
		  if(_tools.isEmpty(pickup_contact_name)){
			  if(!_tools.isEmpty(pickup_contact_email) || !_tools.isEmpty(pickup_contact_phone) || !_tools.isEmpty(pickup_contact_phone_ext)){
				  missingFields.push('Pick-up Contact Name is missing from pick-up request.');
			  }else{
				  BOL_Form_Data.pickup_contact_name = "";
			  }
			 
		  }else{
			  BOL_Form_Data.pickup_contact_name = pickup_contact_name;
		  }
		  
		  var pickup_company_name = document.getElementById('pickup_company_name').value;
		  if(_tools.isEmpty(pickup_company_name)){
			  if(!_tools.isEmpty(pickup_contact_email) || !_tools.isEmpty(pickup_contact_phone) || !_tools.isEmpty(pickup_contact_phone_ext)){
				  missingFields.push('Pick-up Company Name is missing from pick-up request.')
			  }else{
				  BOL_Form_Data.pickup_company_name = "";
			  }
			 
		  }else{
			  BOL_Form_Data.pickup_company_name = pickup_company_name;
		  }
	  }
	  
	  console.log(BOL_Form_Data);
	  
	  console.log('Missing Required Fields: ');
	  console.log(missingFields);
	  
	  if(missingFields.length > 0){
		  var message = '<h2 style=\"width:100%; text-align:center;\"><u>Missing Required Fields</u></h2>\n';
		  
		  for(i=0; i < missingFields.length; i++){
			  message += '<span style=\"font-size: 16px;font-family: monospace;font-weight: normal; display: list-item;list-style-type: disc;list-style-position: inside;\">' +  missingFields[i] + '</span>'
		  }
		  
		  _tools.createModalAlert(message);
		  
	  }else{
		  
		  //Generate request XML
		 
		 var BOL_XML = "";
		 
		 	BOL_XML +=	"<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">";
		  	
		 	BOL_XML +=		"<soap:Body>";
		  	
		 	BOL_XML +=			"<CreateBillOfLading xmlns=\"http://www.rlcarriers.com/\">";
		   
		  	BOL_XML +=				"<APIKey>MtMzZWEDZmY4IwYTMtZGZhZi00Mzc2LTg1NWMTQ2EzOGOzMGC</APIKey>";
		   
		  	BOL_XML +=				"<request>";
		   
		  	BOL_XML +=					"<BillOfLading>";
		  	
		  									var dateMonth = BOL_Form_Data.date.split('-')[1];
		  									var dateDay = BOL_Form_Data.date.split('-')[2];
		  									var dateYear = BOL_Form_Data.date.split('-')[0];
		  	
		  									var reformattedDate = dateMonth + '/' + dateDay + '/' + dateYear;
		   
		  	BOL_XML +=						"<BOLDate>" + nlapiEscapeXML(reformattedDate) + "</BOLDate>"
		  	
		  	BOL_XML +=						"<Shipper>";
		  	 
		  	BOL_XML +=							"<Name>" + nlapiEscapeXML(BOL_Form_Data.shipperInfo.Name) + "</Name>"
		  	 
		  	BOL_XML +=							"<EmailAddress>" + nlapiEscapeXML(BOL_Form_Data.shipperInfo.Email) + "</EmailAddress>";
		  	 
		  	BOL_XML +=							"<AddressLine1>" + nlapiEscapeXML(BOL_Form_Data.shipperInfo.Addr1)+ "</AddressLine1>";		  	
		  	
		  	BOL_XML +=							"<AddressLine2>" + nlapiEscapeXML(BOL_Form_Data.shipperInfo.Addr2) + "</AddressLine2>";
		  	 
		  	BOL_XML +=							"<ISO3Country>" + nlapiEscapeXML(BOL_Form_Data.shipperInfo.Country) + "</ISO3Country>";
		  	 
		  	BOL_XML +=							"<ZipCode>" + nlapiEscapeXML(BOL_Form_Data.shipperInfo.Zip) + "</ZipCode>";
		  	 
		  	BOL_XML +=							"<City>" + nlapiEscapeXML(BOL_Form_Data.shipperInfo.City) + "</City>";
		  	 
		  	BOL_XML +=							"<State>" + nlapiEscapeXML(BOL_Form_Data.shipperInfo.State) + "</State>";
		  	 
		  	BOL_XML +=							"<PhoneNumber>" + nlapiEscapeXML(BOL_Form_Data.shipperInfo.Phone) + "</PhoneNumber>";
		  	 
		  	BOL_XML +=							"<PhoneExtension>" + nlapiEscapeXML(BOL_Form_Data.shipperInfo.PhoneExt) + "</PhoneExtension>";
		  	
		  	BOL_XML +=						"</Shipper>";
		  	
		  	BOL_XML +=						"<Consignee>";
		  	 
		  	BOL_XML +=							"<Name>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.Name) + "</Name>"
		  	
		  	BOL_XML +=							"<EmailAddress>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.Email) + "</EmailAddress>";
		  	 
		  	BOL_XML +=							"<AddressLine1>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.Addr1) + "</AddressLine1>";		  	
		  	
		  	BOL_XML +=							"<AddressLine2>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.Addr2) + "</AddressLine2>";
		  	 
		  	BOL_XML +=							"<ISO3Country>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.Country) + "</ISO3Country>";
		  	 
		  	BOL_XML +=							"<ZipCode>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.Zip) + "</ZipCode>";
		  	 
		  	BOL_XML +=							"<City>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.City) + "</City>";
		  	 
		  	BOL_XML +=							"<State>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.State) + "</State>";
		  	 
		  	BOL_XML +=							"<PhoneNumber>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.Phone) + "</PhoneNumber>";
		  	 
		  	BOL_XML +=							"<PhoneExtension>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.PhoneExt) + "</PhoneExtension>";
		  	
		  	BOL_XML +=							"<Attention>" + nlapiEscapeXML(BOL_Form_Data.consigneeInfo.Attn) + "</Attention>";
		  	
		  	BOL_XML +=						"</Consignee>";
		  	
		  	BOL_XML +=						"<BillTo>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.bill_toInfo.Name))		  	 
		  	BOL_XML +=							"<Name>" + nlapiEscapeXML(BOL_Form_Data.bill_toInfo.Name) + "</Name>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.bill_toInfo.Email))
		  	BOL_XML +=							"<EmailAddress>" + nlapiEscapeXML(BOL_Form_Data.bill_toInfo.Email) + "</EmailAddress>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.bill_toInfo.Addr1)) 
		  	BOL_XML +=							"<AddressLine1>" + nlapiEscapeXML(BOL_Form_Data.bill_toInfo.Addr1) + "</AddressLine1>";		  	
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.bill_toInfo.Addr2))
		  	BOL_XML +=							"<AddressLine2>" + nlapiEscapeXML(BOL_Form_Data.bill_toInfo.Addr2) + "</AddressLine2>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.bill_toInfo.Country))
		  	BOL_XML +=							"<ISO3Country>" + nlapiEscapeXML(BOL_Form_Data.bill_toInfo.Country) + "</ISO3Country>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.bill_toInfo.Zip))
		  	BOL_XML +=							"<ZipCode>" + nlapiEscapeXML(BOL_Form_Data.bill_toInfo.Zip) + "</ZipCode>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.bill_toInfo.City))
		  	BOL_XML +=							"<City>" + nlapiEscapeXML(BOL_Form_Data.bill_toInfo.City) + "</City>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.bill_toInfo.State))
		  	BOL_XML +=							"<State>" + nlapiEscapeXML(BOL_Form_Data.bill_toInfo.State) + "</State>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.bill_toInfo.Phone))
		  	BOL_XML +=							"<PhoneNumber>" + nlapiEscapeXML(BOL_Form_Data.bill_toInfo.Phone) + "</PhoneNumber>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.bill_toInfo.PhoneExt))
		  	BOL_XML +=							"<PhoneExtension>" + nlapiEscapeXML(BOL_Form_Data.bill_toInfo.PhoneExt) + "</PhoneExtension>";	  	
		  	
		  	BOL_XML +=						"</BillTo>";
		  	
		  	BOL_XML +=						"<Broker>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.brokerInfo.Name))
		  	BOL_XML +=							"<Name>" + nlapiEscapeXML(BOL_Form_Data.brokerInfo.Name) + "</Name>"
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.brokerInfo.Email))
		  	BOL_XML +=							"<EmailAddress>" + nlapiEscapeXML(BOL_Form_Data.brokerInfo.Email) + "</EmailAddress>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.brokerInfo.Addr1))
		  	BOL_XML +=							"<AddressLine1>" + nlapiEscapeXML(BOL_Form_Data.brokerInfo.Addr1) + "</AddressLine1>";		  	
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.brokerInfo.Addr2))
		  	BOL_XML +=							"<AddressLine2>" + nlapiEscapeXML(BOL_Form_Data.brokerInfo.Addr2) + "</AddressLine2>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.brokerInfo.Country))
		  	BOL_XML +=							"<ISO3Country>" + nlapiEscapeXML(BOL_Form_Data.brokerInfo.Country) + "</ISO3Country>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.brokerInfo.Zip))
		  	BOL_XML +=							"<ZipCode>" + nlapiEscapeXML(BOL_Form_Data.brokerInfo.Zip) + "</ZipCode>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.brokerInfo.City))
		  	BOL_XML +=							"<City>" + nlapiEscapeXML(BOL_Form_Data.brokerInfo.City) + "</City>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.brokerInfo.State))
		  	BOL_XML +=							"<State>" + nlapiEscapeXML(BOL_Form_Data.brokerInfo.State) + "</State>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.brokerInfo.Phone))
		  	BOL_XML +=							"<PhoneNumber>" + nlapiEscapeXML(BOL_Form_Data.brokerInfo.Phone) + "</PhoneNumber>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.brokerInfo.PhoneExt))
		  	BOL_XML +=							"<PhoneExtension>" + nlapiEscapeXML(BOL_Form_Data.brokerInfo.PhoneExt) + "</PhoneExtension>";	  	
		  	
		  	BOL_XML +=						"</Broker>";
		  	
		  	BOL_XML +=						"<RemitCOD>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Name))
		  	BOL_XML +=							"<Name>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.Name) + "</Name>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Email))
		  	BOL_XML +=							"<EmailAddress>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.Email) + "</EmailAddress>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Addr1))
		  	BOL_XML +=							"<AddressLine1>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.Addr1) + "</AddressLine1>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Addr2))
		  	BOL_XML +=							"<AddressLine2>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.Addr2) + "</AddressLine2>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Country))
		  	BOL_XML +=							"<ISO3Country>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.Country) + "</ISO3Country>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Zip))
		  	BOL_XML +=							"<ZipCode>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.Zip) + "</ZipCode>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.City))
		  	BOL_XML +=							"<City>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.City) + "</City>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.State))
		  	BOL_XML +=							"<State>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.State) + "</State>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Phone))
		  	BOL_XML +=							"<PhoneNumber>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.Phone) + "</PhoneNumber>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Name))
		  	BOL_XML +=							"<PhoneExtension>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.PhoneExt) + "</PhoneExtension>";

		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Amount))
		  	BOL_XML +=							"<CODAmount>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.Amount) + "</CODAmount>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Check))
		  	BOL_XML +=							"<CheckType>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.Check) + "</CheckType>";
		  	
		  	if(!_tools.isEmpty(BOL_Form_Data.remit_codInfo.Fee))
		  	BOL_XML +=							"<FeeType>" + nlapiEscapeXML(BOL_Form_Data.remit_codInfo.Fee) + "</FeeType>";
		  	
		  	BOL_XML +=						"</RemitCOD>";
		  	
		  	BOL_XML +=						"<AdditionalServices>";
		  	
											  	var addServiveFlag = false;
											  	
											  	if(BOL_Form_Data.add_servInfo.DeliveryNotification){
											  		addServiveFlag = true;
											  		BOL_XML +=					"<BOLAccessorial>DeliveryNotification</BOLAccessorial>";
											  	}
											  	
											  	if(BOL_Form_Data.add_servInfo.DestinationLiftgate){
											  		addServiveFlag = true;
											  		BOL_XML +=					"<BOLAccessorial>DestinationLiftgate</BOLAccessorial>";
											  	}
											  	
											  	if(BOL_Form_Data.add_servInfo.FreezeProtection){
											  		addServiveFlag = true;
											  		BOL_XML +=					"<BOLAccessorial>FreezeProtection</BOLAccessorial>";
											  	}
									
											  	if(BOL_Form_Data.add_servInfo.InsideDelivery){
											  		addServiveFlag = true;
											  		BOL_XML +=					"<BOLAccessorial>InsideDelivery</BOLAccessorial>";
											  	}
											  	
											  	if(BOL_Form_Data.add_servInfo.InsidePickup){
											  		addServiveFlag = true;
											  		BOL_XML +=					"<BOLAccessorial>InsidePickup</BOLAccessorial>";
											  	}
											  	
											  	if(BOL_Form_Data.add_servInfo.LimitedAccessDelivery){
											  		addServiveFlag = true;
											  		BOL_XML +=					"<BOLAccessorial>LimitedAccessDelivery</BOLAccessorial>";
											  	}
											  	
											  	if(BOL_Form_Data.add_servInfo.LimitedAccessPickup){
											  		addServiveFlag = true;
											  		BOL_XML +=					"<BOLAccessorial>LimitedAccessPickup</BOLAccessorial>";
											  	}
											  	
											  	if(BOL_Form_Data.add_servInfo.OriginLiftgate){
											  		addServiveFlag = true;
											  		BOL_XML +=					"<BOLAccessorial>OriginLiftgate</BOLAccessorial>";
											  	}	  	
		  	
		  	BOL_XML +=						"</AdditionalServices>";
		  	
		  	BOL_XML +=						"<ServiceLevel>" + nlapiEscapeXML(BOL_Form_Data.serviceLevelInfo.serviceLevel) + "</ServiceLevel>";
		  	
		  	BOL_XML +=						"<HourlyWindow>";
		  	
		  	BOL_XML +=							"<Start>";
		  	
		  											if(!_tools.isEmpty(BOL_Form_Data.serviceLevelInfo.windowStart)){
		  												BOL_XML += nlapiEscapeXML(BOL_Form_Data.serviceLevelInfo.windowStart);
		  											}
		  											
		  	BOL_XML +=							"</Start>";
		  	
	  		BOL_XML +=							"<End>";
		  	
													if(!_tools.isEmpty(BOL_Form_Data.serviceLevelInfo.windowEnd)){
														BOL_XML += nlapiEscapeXML(BOL_Form_Data.serviceLevelInfo.windowEnd);
													}
													
			BOL_XML +=							"</End>";
			BOL_XML +=						"</HourlyWindow>";
			
			BOL_XML +=						"<ExpeditedQuoteNumber>"
			
												if(!_tools.isEmpty(BOL_Form_Data.serviceLevelInfo.expeditedQuoteNumber)){
													BOL_XML += nlapiEscapeXML(BOL_Form_Data.serviceLevelInfo.expeditedQuoteNumber);
												}
			
			BOL_XML +=						"</ExpeditedQuoteNumber>";			
			
			BOL_XML +=						"<Items>";
			
											for(i=0; i < BOL_Form_Data.items.length; i++){
												
												BOL_XML += 	"<Item>";
												
												BOL_XML +=		"<IsHazmat>" + nlapiEscapeXML(BOL_Form_Data.items[i].itemHazmat) + "</IsHazmat>";
												
												BOL_XML +=		"<Pieces>" + nlapiEscapeXML(BOL_Form_Data.items[i].pieces) + "</Pieces>";
												
												BOL_XML +=		"<PackageType>" + nlapiEscapeXML(BOL_Form_Data.items[i].packageType) + "</PackageType>";
												
												BOL_XML +=		"<NMFCItemNumber>" + nlapiEscapeXML(BOL_Form_Data.items[i].nmfcNum) + "</NMFCItemNumber>";
												
												BOL_XML +=		"<NMFCClass>" + nlapiEscapeXML(BOL_Form_Data.items[i].nmfcSubNum) + "</NMFCClass>";
												
												BOL_XML +=		"<Class>" + nlapiEscapeXML(BOL_Form_Data.items[i].itemClass) + "</Class>";
												
												BOL_XML +=		"<Weight>" + nlapiEscapeXML(BOL_Form_Data.items[i].itemWeight) + "</Weight>";
												
												BOL_XML +=		"<Description>" + nlapiEscapeXML(BOL_Form_Data.items[i].itemDesc) + "</Description>";
													
												BOL_XML += 	"</Item>";
											}
			
			BOL_XML +=						"</Items>";
			
			BOL_XML +=						"<HazmatInformation>";
			
			if(!_tools.isEmpty(BOL_Form_Data.hazmatInfo.hazmat_emerg_phone))
			BOL_XML +=							"<EmergenyNumber>" + nlapiEscapeXML(BOL_Form_Data.hazmatInfo.hazmat_emerg_phone) + "</EmergenyNumber>";
			
			if(!_tools.isEmpty(BOL_Form_Data.hazmatInfo.hazmat_contract_num))
			BOL_XML +=							"<ContractNumber>" + nlapiEscapeXML(BOL_Form_Data.hazmatInfo.hazmat_contract_num) + "</ContractNumber>";
			
			if(!_tools.isEmpty(BOL_Form_Data.hazmatInfo.hazmat_offerer))
			BOL_XML +=							"<ContractHolder>" + nlapiEscapeXML(BOL_Form_Data.hazmatInfo.hazmat_offerer) + "</ContractHolder>";
			
			BOL_XML +=						"</HazmatInformation>";
			
			BOL_XML +=						"<DeclaredValue>";
			
			if(!_tools.isEmpty(BOL_Form_Data.declared_value_amount))
			BOL_XML +=							"<Value>" + nlapiEscapeXML(BOL_Form_Data.declared_value_amount) + "</Value>";
			
			if(!_tools.isEmpty(BOL_Form_Data.declared_value_measurment))
			BOL_XML +=							"<Per>" + nlapiEscapeXML(BOL_Form_Data.declared_value_measurment) + "</Per>";			
			
			BOL_XML +=						"</DeclaredValue>";
			
			BOL_XML +=						"<SpecialInstructions>" + nlapiEscapeXML(BOL_Form_Data.special_instructions) + "</SpecialInstructions>";
			
			BOL_XML +=						"<ReferenceNumbers>";
			
			if(!_tools.isEmpty(BOL_Form_Data.shipper_number))
			BOL_XML +=							"<ShipperNumber>" + nlapiEscapeXML(BOL_Form_Data.shipper_number) + "</ShipperNumber>";
			
			if(!_tools.isEmpty(BOL_Form_Data.quote_number))
			BOL_XML +=							"<QuoteNumber>" + nlapiEscapeXML(BOL_Form_Data.quote_number) + "</QuoteNumber>";
			
			if(!_tools.isEmpty(BOL_Form_Data.po_number))
			BOL_XML +=							"<PONumber>" + nlapiEscapeXML(BOL_Form_Data.po_number) + "</PONumber>";
			
			BOL_XML +=						"</ReferenceNumbers>";
			
			BOL_XML +=						"<FreightChargePaymentMethod>" + nlapiEscapeXML(BOL_Form_Data.charge) + "</FreightChargePaymentMethod>";
		  	
		  	BOL_XML +=					"</BillOfLading>";
		  	
		  	BOL_XML +=					"<AddPickupRequest>" + nlapiEscapeXML(schedulePickupRequest) + "</AddPickupRequest>";		  	
		  	
		  	BOL_XML +=					"<PickupRequestInfo>";
		  	
		  	if(schedulePickupRequest){
		  		
		  		BOL_XML +=						"<PickupDate>" + nlapiEscapeXML(BOL_Form_Data.pickup_date) + "</PickupDate>";
			  	
			  	BOL_XML +=						"<ReadyTime>" + nlapiEscapeXML(BOL_Form_Data.ready_time) + "</ReadyTime>";
			  	
			  	BOL_XML +=						"<CloseTime>" + nlapiEscapeXML(BOL_Form_Data.close_time) + "</CloseTime>";
			  	
			  	BOL_XML +=						"<AdditionalInstructions></AdditionalInstructions>";
			  	
			  	BOL_XML +=						"<ThirdParty>";
			  	
			  	BOL_XML +=							"<ContactName>" + nlapiEscapeXML(BOL_Form_Data.pickup_date) + "</ContactName>";
			  	
			  	BOL_XML +=							"<CompanyName>" + nlapiEscapeXML(BOL_Form_Data.pickup_date) + "</CompanyName>";
			  	
			  	BOL_XML +=							"<PhoneNumber>" + nlapiEscapeXML(BOL_Form_Data.pickup_contact_phone) + "</PhoneNumber>";
			  	
			  	BOL_XML +=							"<PhoneExtension>" + nlapiEscapeXML(BOL_Form_Data.pickup_contact_phone_ext) + "</PhoneExtension>";
			  	
			  	BOL_XML +=							"<EmailAddress>" + nlapiEscapeXML(BOL_Form_Data.pickup_contact_email) + "</EmailAddress>";
			  	
			  	BOL_XML +=						"</ThirdParty>";
			  	
		  	}	  	
		  	
		  	BOL_XML +=					"</PickupRequestInfo>";
		  	
		  	BOL_XML +=				"</request>";
		  	
		  	BOL_XML +=			"</CreateBillOfLading>";
		  	
		  	BOL_XML +=		"</soap:Body>";
		  	
		  	BOL_XML +=	"</soap:Envelope>";
		  	
		  	console.log(BOL_XML);
		  	
		  	var response = null;
		    
		    try{
		    	//var response = nlapiRequestURL('https://api.rlcarriers.com/sandbox/BillOfLadingService.asmx',BOL_XML,{"Content-Type": "text/xml; charset=UTF-8"});
		    	var response = nlapiRequestURL('https://api.rlcarriers.com/1.0.3/BillOfLadingService.asmx',BOL_XML,{"Content-Type": "text/xml; charset=UTF-8"});
		    	console.log(response);
		    }catch(err){
		    	console.log(err.message);
		    	nlapiLogExecution('ERROR','Error Generating BOL',err.message);
		    }
		    
		    if(!_tools.isEmpty(response.code) && response.code == 200){
		    	console.log('Request Post Successful');
		    	console.log(response);
		    	
		    	var responseXML = nlapiStringToXML(response.body);
		    	console.log(responseXML);
		    	
		    	var responseJSON = _tools.xmlToJSON(responseXML);
		    	console.log(responseJSON);
		    	
		    	var envelope = responseJSON["soap:Envelope"];
		    	var body = envelope["soap:Body"];
		    	
		    	var BOLRequestResultSuccess = body.CreateBillOfLadingResponse.CreateBillOfLadingResult.WasSuccess["#text"];
		    	
		    	if(BOLRequestResultSuccess == 'true'){
		    		
		    		console.log('BOL Creation Successful')
		    		
		    		var result = body.CreateBillOfLadingResponse.CreateBillOfLadingResult;
		    		
		    		var BolID = result.BolID['#text'];
		    		console.log('BOL ID: ' + BolID);
		    		
		    		var WebProNumber = result.WebProNumber['#text'];
		    		console.log('BOL Web Pro Number: ' + WebProNumber);
		    		
		    		console.log('BOL Total Pieces: ' + BOL_Form_Data.totalPieces);
		    		
		    		try{
		    			//nlapiSubmitField('itemfulfillment',nlapiGetRecordId(),['custbody_ng_rl_bol_id','custbody_ng_rl_bol_web_pro_num','custbody_ng_rl_bol_pieces'],[BolID, WebProNumber, BOL_Form_Data.totalPieces]);
		    			var recIF = nlapiLoadRecord('itemfulfillment',nlapiGetRecordId(), {recordmode: 'dynamic'});
		    			
		    			recIF.setFieldValue('custbody_ng_rl_bol_id', BolID);
		    			recIF.setFieldValue('custbody_ng_rl_bol_web_pro_num', WebProNumber);
		    			recIF.setFieldValue('custbody_ng_rl_bol_pieces', BOL_Form_Data.totalPieces);
		    			
		    			//Determine Package Sublist
		    			
		    			var packageListName = '';
		    			var suffix = '';
		    			var sublists = recIF.lineitems;
		    			
		    			var packageList = "package" in sublists;
		    			console.log('Package List: ' + packageList);
		    			var packageUPSList = "packageups" in sublists;
		    			console.log('Package UPS List: ' + packageUPSList);
		    			var packageFedExList = "packagefedex" in sublists;
		    			console.log('Package FedEx List: ' + packageFedExList);
		    			var packageUSPSList = "packageusps" in sublists;
		    			console.log('Package USPS List: ' + packageUSPSList);
		    			
		    			if(packageList){
		    				packageListName = 'package';
		    				suffix = '';
		    			}else if(packageUPSList){
		    				packageListName = 'packageups';	
		    				suffix = 'ups';
		    			}else if(packageList){
		    				packageListName = 'packagefedex';	
		    				suffix = 'fedex';
		    			}else if(packageUSPSList){
		    				packageListName = 'packageusps';	
		    				suffix = 'usps';
		    			}
		    			
		    			
		    			if(!_tools.isEmpty(packageListName)){
		    				
		    				console.log('Package Sublist Name: ' + packageListName);
			    			console.log('Suffix: ' + suffix);
		    				
		    				recIF.selectNewLineItem(packageListName);
		    				
		    				recIF.setCurrentLineItemValue(packageListName, 'packageweight' + suffix, 1);
		    				
		    				recIF.setCurrentLineItemValue(packageListName, 'packagetrackingnumber' + suffix, 'RL-Carriers-' + WebProNumber);
		    				
		    				recIF.commitLineItem(packageListName);
		    				
		    				try{
			    				nlapiSubmitRecord(recIF);
			    				console.log('Record Submitted');
			    			}catch(err){
			    				nlapiLogExecution('ERROR','Error Updating Item Fulfillment Record with Created BOL Info.', err.message);		    				
			    			}
		    			}
		    			
		    			
		    			
		    			var message = '<h2 style=\"width:100%; text-align:center;\">Bill Of Lading Created Successfully.</h2>\n';
		    			
		    			//document.getElementById('modalclose_rl_bol').style.display = 'block';
		            	document.getElementById('modalcontent').innerHTML = message;
		    		}catch(err){
		    			nlapiLogExecution('ERROR','Error Submitting BOL Values to Item Fulfillment', err.message);
		    			console.log(err.message);
		    			
		    			
		    			var message = '<h2 style=\"width:100%; text-align:center;\">' + err.message + '</h2>\n';
		    			_tools.createModalAlert(message);
		    			
		    		}
		    		
		    	}else{
		    		var message = '';
		    		var messages = body.CreateBillOfLadingResponse.CreateBillOfLadingResult.Messages.string;
		    		if(!_tools.isEmpty(messages.length)){
		    			for(m=0; m < messages.length; m++){
			    			message += '<h2 style=\"width:100%; text-align:center;\">' + messages[m]['#text'] + '</h2>\n';
			    		}
		    		}else{
		    			message = '<h2 style=\"width:100%; text-align:center;\">' + messages['#text'] + '</h2>\n';
		    		}
		    		
		    		
	    			_tools.createModalAlert(message);
	    			
		    	}
		    	
		    }else{
		    	console.log('Not Successful.');
		    	var message = '<h2 style=\"width:100%; text-align:center;\">Error occurred with the R + L Request</h2>\n';
    			_tools.createModalAlert(message);
		    }
	  }
  }
  
  function printBOL(){
	  console.log('Print ID Test'); 
		
	  var BOL_ID = nlapiLookupField('itemfulfillment', nlapiGetRecordId(),'custbody_ng_rl_bol_id');
	  console.log('BOL ID: ' + BOL_ID);
	  
	  if(!_tools.isEmpty(BOL_ID)){
		  var url = 'https://www2.rlcarriers.com/freight/shipping/bill-of-lading-show?bolid=' + BOL_ID;
		  
		  window.open(url, '_blank');
	  }
  }
  
  function printBOL_Labels(){
	  
	  console.log('Print Label Test');
	 
	  var fields = nlapiLookupField('itemfulfillment', nlapiGetRecordId(),['custbody_ng_rl_bol_id','custbody_ng_rl_bol_pieces']);
	  
	  var BOL_Pieces = fields['custbody_ng_rl_bol_pieces'];
	  console.log('Pieces Count: ' + BOL_Pieces);
	  
	  var BOL_ID = fields['custbody_ng_rl_bol_id'];
	  console.log('BOL ID: ' + BOL_ID);
	  
	  if(!_tools.isEmpty(BOL_Pieces) && !_tools.isEmpty(BOL_ID)){
		  var url = 'https://www2.rlcarriers.com/bill-of-lading-show-labels.aspx?bolid=' + BOL_ID + '&style=STYLE_4&start=1&quant=' + BOL_Pieces;
		  
		  window.open(url, '_blank');
	  }	  
  }