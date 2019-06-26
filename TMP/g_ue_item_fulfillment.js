/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Feb 2019     Scott Anderson	NewGen Business Solutions, Inc.
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function ItemFulfillmentBeforeLoad(type, form, request){
	
	if(type == 'view'){
		
		var trigger = "'button'";
		
		form.addButton('custpage_rl_create_bol', 'R+L BOL', 'GetR_L_BOL(' + trigger + ')' );
		
		form.addButton('custpage_rl_print_bol', 'R+L Print BOL', 'printBOL()' );
		
		form.addButton('custpage_rl_print_bol_labels', 'R+L BOL Labels', 'printBOL_Labels()' );
		
		var htmlField = form.addField("custpage_cssmodal_generate_bol", "inlinehtml", "");
		
		if(type == 'view'){
			form.setScript('customscript_ng_cs_item_fulfillment');
		}

		// modal message box style definition (CSS)

		var html = "<style>\n";    

	    html += "	.overlay {\n";
	    html += "	 position: fixed;\n"
	    html += "	 top: 0;\n"
	    html += "	 bottom: 0;\n"
	    html += "	 left: 0;\n"
	    html += "	 right: 0;\n"
	    html += " 	 background: rgba(0, 0, 0, 0.7);\n"
	    html += "	 transition: opacity 500ms, visibility 500ms;\n"
	    html += " 	 visibility: hidden;\n"
	    html += "	 opacity: 0;\n"
	    html += "	 z-index: 1000;\n"
	    html += "	}\n"

	    html += "	.overlay_a {\n";
	    html += "	  visibility: visible;\n";
	    html += "	 opacity: 1;\n";
	    html += "	}\n";

	    html += "	.overlay_b {\n";
	    html += "	  visibility: hidden;\n";
	    html += " 	 opacity: 0;\n";
	    html += "	}\n";

	    html += "	.overlay:target {\n";
	    html += "	  visibility: visible;\n";
	    html += "	 opacity: 1;\n";
	    html += "	}\n";

	    html += "	.popup_modal {\n";
	    html += "	 margin: 25px auto;\n";
	    html += "	 padding: 20px;\n";
	    html += "	 background: #fff;\n";
	    html += "	 border-radius: 5px;\n";
	    html += "	 width: fit-content;\n";
	    html += "	 min-width: 40%;\n";
	    html += "	 position: relative;\n";
	    html += "	 transition: all 5s ease-in-out;\n";
	    //html += "	 transform: perspective(1px) translateY(50%);\n";
	    html += "	}\n";

	    html += "	.popup_modal h2 {\n";
	    html += "	 margin-top: 0;\n";
	    html += "	 color: #333;\n";
	    html += "	 font-family: Tahoma, Arial, sans-serif;\n";
	    html += "	 font-size: 16px;\n";
	    html += " 	}\n";

	    html += "	.popup_modal .close {\n";
	    html += "	 position: absolute;\n";
	    html += "	 top: 10px;\n";
	    html += "	 right: 10px;\n";
	    html += "	 transition: all 200ms;\n";
	    html += "	 font-size: 10px;\n";
	    html += "	 font-weight: bold;\n";
	    html += "	 text-decoration: none;\n";
	    html += "	 color: #333;\n";
	    html += "	}\n";

	    html += "	.popup_modal{\n";
	    html += "	  min-height: 20%;\n";
	    html += "	  max-height: 90%;\n";
	    html += "	  overflow: auto;\n";
	    html += "	}\n";

	    html += "	.popup_modal .close:hover {\n";
	    html += "	 color: #06D85F;\n";
	    html += "	}\n";

	    html += "	@media screen and (max-width: 1000px){\n";
	    html += "	  .box{\n";
	    html += "	 	width: 70%;\n";
	    html += "	  }\n";
	    html += "	  .popup_modal{\n";
	    html += "	    width: 70%;\n";
	    html += "	  }\n";
	    html += "	}\n";
	    
	    html += "	.lds-dual-ring {\n";
	    html += "	    display: inline-block;\n";
	    html += "	    width: 64px;\n";
	    html += "	    height: 64px;\n";
	    html += "	  }\n";
	    
	    html += "	.lds-dual-ring:after {\n";
	    html += " 	    content: \" \";\n";
	    html += "	    display: block;\n";
	    html += "	    width: 46px;\n";
	    html += "	    height: 46px;\n";
	    html += "	    margin: 1px;\n";
	    html += "	    border-radius: 50%;\n";
	    html += "	    border: 5px solid #000;\n";
	    html += "	    border-color: #000 transparent #000 transparent;\n";
	    html += "	    animation: lds-dual-ring 1.2s linear infinite;\n";
	    html += "	  }\n";
	    
	    html += "	  @keyframes lds-dual-ring {\n";
	    html += "	    0% {\n";
	    html += "	      transform: rotate(0deg);\n";
	    html += "	    }\n";
	    html += "	    100% {\n";
	    html += "	      transform: rotate(360deg);\n";
	    html += "	    }\n";
	    html += "	  }\n";

	    html += "	.divTable{\n";
	    html += "	  display: table;\n";
	    html += "	  width: 100%;\n";
	    html += "	}\n";
	    html += "	.divTableRow {\n";
	    html += "	  display: table-row;\n";
	    html += " 	}\n";
	    html += " 	.divTableHeading {\n";
	    html += " 	  background-color: #EEE;\n";
	    html += "	  display: table-header-group;\n";
	    html += "	}\n";
	    html += "	.divTableCell, .divTableHead {\n";
	    html += "	  border: 0px solid #999999;\n";
	    html += "	  display: table-cell;\n";
	    html += "	  padding: 1px 1px;\n";
	    html += "	  padding-bottom: 10px;\n";
	    html += "	  padding-left: 10px;\n";
	    html += "	  text-align: left;\n";
	    html += "	}\n";
	    html += "	.divTableHeading {\n";
	    html += "	  background-color: #EEE;\n";
	    html += "	  display: table-header-group;\n";
	    html += "	  font-weight: bold;\n";
	    html += "	}\n";
	    html += "	.divTableFoot {\n";
	    html += "	  background-color: #EEE;\n";
	    html += " 	  display: table-footer-group;\n";
	    html += "	  font-weight: bold;\n";
	    html += "	}\n";
	    html += "	.divTableBody {\n";
	    html += "	  display: table-row-group;\n";
	    html += "	}\n";

	    html += "	.sectionHeader {\n";
	    html += "	  width: 100%;\n";
	    html += "	  background-color: #607799;\n";
	    html += "	  padding-left: 5px;\n";
	    html += "	  color: #ffffff;\n";
	    html += "	  line-height: 30px;\n";
		html += "	  cursor: pointer;\n";		
		html += "	}\n";
		
		html += "	.toggle-content {\n";
		html += "	  display: none;\n";
		html += "	  height: 0;\n";
		html += "	  overflow: hidden;\n";
		html += "	  transition: height 350ms ease-in-out;\n";
		html += "	}\n";
		
		html += "	.toggle-content.is-visible {\n";
		html += "	  display: block;\n";
		html += "	  height: auto;\n";
		html += "	}\n";
		
		html += "	.radioSelect {\n";
		html += "  	  float: left;\n";
		html += "	  width: 25px;\n";
		html += "	  margin-right: auto;\n";
		html += "	}\n";
		
		html += "	.radioLabel {\n";
		html += "	  margin-left: 30px;\n";
		html += "	  font-weight: bold;\n";
		html += "	}\n";
		
		html += "	.radioDescription {\n";
		html += "	  font-weight: normal;\n";
		html += "	  padding-left: 10px;\n";
		html += "	  display: block;\n";
		html += "	}\n";

		html += "	.closeBtn {\n";
		html += "	  background-color: #e0e6ef;\n";
		html += "	  border: none;\n";
		html += "	  color: #607799;\n";
		html += "	  padding: 12px 16px;\n";
		html += "	  font-size: 16px;\n";
		html += "	  cursor: pointer;\n";
		html += "	}\n";
		
		html += "	.setItemDefaults {\n";
		html += "		float: right;\n";
		html += "		text-align: right;\n";
		//html += "		cursor: pointer;\n";
		html += "		color: #607799;\n";
		html += " 		padding: 10px;\n";
		html += "	}\n";
		
		html += "	textarea.special_instructions {\n";
		html += "		-webkit-box-sizing: border-box;\n";
		html += "		-moz-box-sizing: border-box;\n";
		html += "		box-sizing: border-box;\n";

		html += "		width: 100%;\n";
		html += "		height: 150px\n";
		html += "	}\n";
		
		html += "	div.itemList > div.itemRow:nth-of-type(even){\n";
		html += "	background: #f0f0f0;\n";
		html += "	}\n";	
		
		/* Darker background on mouse-over */
		html += "	.closeBtn:hover {\n";
		html += " 	  background-color: #607799;\n";
		html += " 	  color: #e0e6ef;\n";
		html += " 	}\n";
		
		html += " 	.addRowButton {\n";
		html += "  	  background-color: #607799;\n"; 
		html += "  	  border: none;\n";
		html += "  	  color: white;\n";
		html += "  	  padding: 6px;\n";
		html += "  	  text-align: center;\n";
		html += "  	  text-decoration: none;\n";
		html += "  	  display: inline-block;\n";
		html += "  	  font-size: 12px;\n";
		html += " 	  margin: 4px 2px;\n";
		html += "  	  cursor: pointer;\n";
		html += "  	  border-radius: 3px;\n";
		html += " 	}\n";
		
		html += " 	.setDefaultsBtn {\n";
		html += "  	  background-color: #607799;\n"; 
		html += "  	  border: none;\n";
		html += "  	  color: white;\n";
		html += "  	  padding: 5px;\n";
		html += "  	  text-align: center;\n";
		html += "  	  text-decoration: none;\n";
		html += "  	  display: inline-block;\n";
		html += "  	  font-size: 10px;\n";
		html += " 	  margin: 2px 2px;\n";
		html += "  	  cursor: pointer;\n";
		html += "  	  border-radius: 3px;\n";
		html += " 	}\n";
		
		html += " 	.submitBtn {\n";
		html += "  	  background-color: #066f51;\n"; 
		html += "  	  border: none;\n";
		html += "  	  color: white;\n";
		html += "  	  padding: 10px;\n";
		html += "  	  text-align: center;\n";
		html += "  	  text-decoration: none;\n";
		html += "  	  display: inline-block;\n";
		html += "  	  font-size: 14px;\n";
		html += " 	  margin: 4px 2px;\n";
		html += "  	  cursor: pointer;\n";
		html += "  	  border-radius: 3px;\n";
		html += "	  float: right;\n";
		html += " 	}\n";
		
		html += " 	@media screen and (max-width: 1150px){\n";
		html += " 	  .divTableCell, .divTableHead {\n";
		html += "	    border: 0px solid #999999;\n";
		html += "	    display: block;\n";
		html += "	    padding: 5px 1px;\n";
		html += "	  }\n";
		html += "	}\n";

	    html += "</style>\n";

	    html += "</style>\n";
	    
	    html += "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css\">\n";
	    html += "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js\"></script>\n";
	    
	    

	    // modal message box html

	    html += "<div id=\"popup_rl_bol\" class=\"overlay\">\n";

	    html += "     <div class=\"popup_modal\" id=\"popup_modal\">\n";

	    html += "            <a id=\"modalclose_rl_bol\" style=\"display:none;\" class=\"close\" onclick=\"closeModal('popup_rl_bol')\" href=\"#\">close</a>\n";

	    html += "            <div id=\"modalcontent\" class=\"content\">\n";

	    html += "                  <h2 style=\"width:100%; text-align:center;\"><span id=\"modal_message\"><br>Collecting Data<br><br><span></h2>\n";
	    
	    html += "					<div style=\"text-align:center;\"><div class=\"lds-dual-ring\"></div><br><br>\n"

	    html += "            </div>\n";

	    html += "     </div>\n";

	    html += "</div>\n";
	    
	    htmlField.setDefaultValue(html);
	}
 
}