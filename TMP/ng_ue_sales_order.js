/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Jan 2019     Scott Anderson	NewGen Business Solutions, Inc.
 *
 */

var _M = NewGen.lib.math;
var _log = NewGen.lib.logging;
var _tools = NewGen.lib.tools;
var _NSFeatures = NewGen.lib.features;

var _url = NewGen.lib.url;


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function SalesOrderBeforeLoad(type, form, request){
	
	nlapiLogExecution('Debug','Operation Type', type);
	
	if(type == 'create' || type == 'edit' || type == 'copy'){
		
		//form.setScript('customscript_ng_ue_sales_order_h_g');
		
		var trigger = "'button'";
		
		form.addButton('custpage_r_l_shipping_rate', 'R+L Ship Rate', 'GetR_L_ShippingRate(' + trigger + ')' );
		
		var htmlField = form.addField("custpage_cssmodal_rating_shipping", "inlinehtml", "");

		// modal message box style definition (CSS)

	    var html = "<style>\n";

	    html += ".overlay {\n position: fixed;\n top: 0;\n bottom: 0;\n left: 0;\n right: 0;\n background: rgba(0, 0, 0, 0.7);\n transition: opacity 500ms, visibility 500ms;\n visibility: hidden;\n opacity: 0;\n z-index: 1000;\n}\n";

	    html += "\n";

	    html += ".overlay_a {\n  visibility: visible;\n opacity: 1;\n}\n";

	    html += "\n";

	    html += ".overlay_b {\n  visibility: hidden;\n opacity: 0;\n}\n";

	    html += "\n";

	    html += ".overlay:target {\n  visibility: visible;\n opacity: 1;\n}\n";

	    html += "\n";

	    html += ".popup_modal {\n margin: 250px auto;\n padding: 20px;\n background: #fff;\n border-radius: 5px;\n width: 30%;\n position: relative;\n transition: all 5s ease-in-out;\n}\n";

	    html += "\n";

	    html += ".popup_modal h2 {\n margin-top: 0;\n color: #333;\n font-family: Tahoma, Arial, sans-serif;\n font-size: 16px;\n}\n";

	    html += "\n";

	    html += ".popup_modal .close {\n position: absolute;\n top: 10px;\n right: 10px;\n transition: all 200ms;\n font-size: 10px;\n font-weight: bold;\n text-decoration: none;\n color: #333;\n}\n";

	    html += "\n";

	    html += ".popup_modal .close:hover {\n color: #06D85F;\n}\n";

	    html += "\n";    

	    html += "@media screen and (max-width: 700px){\n";

	    html += "  .box{\n width: 70%;\n}\n";

	    html += "  .popup_modal{\n width: 70%;\n}\n";

	    html += "}\n";
	    
	    html += " .lds-dual-ring {\n";
	    html += "	  display: inline-block;\n";
	    html += "	  width: 64px;\n";
	    html += "	  height: 64px;\n";
	    html += "	}\n";
	    html += "	.lds-dual-ring:after {\n";
	    html += "	  content: \" \";\n";
	    html += "	  display: block;\n";
	    html += "	  width: 46px;\n";
	    html += "	  height: 46px;\n";
	    html += "	  margin: 1px;\n";
	    html += "	  border-radius: 50%;\n";
	    html += "	  border: 5px solid #000;\n";
	    html += " 	  border-color: #000 transparent #000 transparent;\n";
	    html += " 	  animation: lds-dual-ring 1.2s linear infinite;\n";
	    html += "	}\n";
	    html += " 	@keyframes lds-dual-ring {\n";
	    html += " 	  0% {\n";
	    html += "	    transform: rotate(0deg);\n";
	    html += "	  }\n";
	    html += " 	  100% {\n";
	    html += "	    transform: rotate(360deg);\n";
	    html += "	  }\n";
	    html += "	}\n";

	    html += "</style>\n";
	    
	    

	    // modal message box html

	    html += "<div id=\"popup_rating_shipping\" class=\"overlay\">\n";

	    html += "     <div class=\"popup_modal\">\n";

	    html += "            <a id=\"modalclose_rating_shipping\" style=\"display:none;\" class=\"close\" onclick=\"closeModal('popup_rating_shipping')\" href=\"#\">close</a>\n";

	    html += "            <div id=\"modalcontent\" style=\"max-height: 50%;\">\n";

	    html += "                  <h2 style=\"width:100%; text-align:center;\"><span id=\"modal_message\"><br>Rating Shipment<br><br><span></h2>\n";
	    
	    html += "					<div style=\"text-align:center;\"><div class=\"lds-dual-ring\"></div>\n"

	    html += "            </div>\n";

	    html += "     </div>\n";

	    html += "</div>\n";
	    
	    htmlField.setDefaultValue(html);
	}
 
}

