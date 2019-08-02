/**
 * Email Message User Event Script
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author trungpv <trung@lexor.com>
 */
define(['N/ui/serverWidget', 'N/search'], function(serverWidget, search) {
	/* === VARS === */

	/* === EVENTS FUNCTIONS === */
	function beforeLoad(context) {
		try {
			embedCSS(context);
			embedJS(context);
		} catch (error) {
			log.error({
				title: '[ERROR] beforeLoad',
				details: context.type
			});
		}
	}

	function beforeSubmit(context) {}

	function afterSubmit(context) {}

	/* === HELPER FUNCTIONS === */
	/**
	 * Embed JS beforeLoad
	 * @param {*} context
	 */
	function embedJS(context) {
		try {
			const form = context.form;
			const request = context.request;
			const newRecord = context.newRecord;
			const headers = request.hasOwnProperty('headers') ? request.headers : false;
			const referer = headers && headers.hasOwnProperty('referer') ? headers.referer : false;
			const refMessage = referer
				? '<p>Ref: <a href="' + referer + '">' + referer + '</a></p><br /><br />'
				: '';
			newRecord.setValue({
				fieldId: 'message',
				value: refMessage
			});

			var JS =
				'<script>!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.autocomplete=t()}(this,function(){"use strict";return function(a){var u,o,d=document,l=d.createElement("div"),s=l.style,e=navigator.userAgent,t=-1!==e.indexOf("Firefox")&&-1!==e.indexOf("Mobile"),i=a.debounceWaitMs||0,n=t?"input":"keyup",c=[],v="",r=2,f=a.showOnFocus,p=0;if(void 0!==a.minLength&&(r=a.minLength),!a.input)throw new Error("input undefined");var m=a.input;function h(){o&&window.clearTimeout(o)}function g(){return!!l.parentNode}function E(){p++,c=[],v="",u=void 0,function(){var e=l.parentNode;e&&e.removeChild(l)}()}function w(){for(;l.firstChild;)l.removeChild(l.firstChild);var o=function(e,t){var n=d.createElement("div");return n.textContent=e.label||"",n};a.render&&(o=a.render);var i=function(e,t){var n=d.createElement("div");return n.textContent=e,n};a.renderGroup&&(i=a.renderGroup);var r=d.createDocumentFragment(),f="#9?$";if(c.forEach(function(t){if(t.group&&t.group!==f){f=t.group;var e=i(t.group,v);e&&(e.className+=" group",r.appendChild(e))}var n=o(t,v);n&&(n.addEventListener("click",function(e){a.onSelect(t,m),E(),e.preventDefault(),e.stopPropagation()}),t===u&&(n.className+=" selected"),r.appendChild(n))}),l.appendChild(r),c.length<1){if(!a.emptyMsg)return void E();var e=d.createElement("div");e.className="empty",e.textContent=a.emptyMsg,l.appendChild(e)}l.parentNode||d.body.appendChild(l),function(){if(g()){s.height="auto",s.width=m.offsetWidth+"px";var e=m.getBoundingClientRect(),t=e.top+m.offsetHeight,n=window.innerHeight-t;n<0&&(n=0),s.top=t+"px",s.bottom="",s.left=e.left+"px",s.maxHeight=n+"px",a.customize&&a.customize(m,e,l,n)}}(),function(){var e=l.getElementsByClassName("selected");if(0<e.length){var t=e[0],n=t.previousElementSibling;if(n&&-1!==n.className.indexOf("group")&&!n.previousElementSibling&&(t=n),t.offsetTop<l.scrollTop)l.scrollTop=t.offsetTop;else{var o=t.offsetTop+t.offsetHeight,i=l.scrollTop+l.offsetHeight;i<o&&(l.scrollTop+=o-i)}}}()}function C(){g()&&w()}function L(){C()}function x(e){e.target!==l?C():e.preventDefault()}function y(e){for(var t=e.which||e.keyCode||0,n=0,o=[38,13,27,39,37,16,17,18,20,91,9];n<o.length;n++){if(t===o[n])return}40===t&&g()||T(0)}function b(e){var t=e.which||e.keyCode||0;if(38===t||40===t||27===t){var n=g();if(27===t)E();else{if(c.length<1)return;38===t?function(){if(c.length<1)u=void 0;else if(u===c[0])u=c[c.length-1];else for(var e=c.length-1;0<e;e--)if(u===c[e]||1===e){u=c[e-1];break}}():function(){if(c.length<1&&(u=void 0),u&&u!==c[c.length-1]){for(var e=0;e<c.length-1;e++)if(u===c[e]){u=c[e+1];break}}else u=c[0]}(),w()}return e.preventDefault(),void(n&&e.stopPropagation())}13===t&&u&&(a.onSelect(u,m),E(),e.preventDefault())}function N(){f&&T(1)}function T(e){var t=++p,n=m.value;n.length>=r||1===e?(h(),o=window.setTimeout(function(){a.fetch(n,function(e){p===t&&e&&(v=n,u=0<(c=e).length?c[0]:void 0,w())},0)},0===e?i:0)):E()}function k(){setTimeout(function(){d.activeElement!==m&&E()},200)}return l.className="autocomplete "+(a.className||""),s.position="fixed",l.addEventListener("mousedown",function(e){e.stopPropagation(),e.preventDefault()}),m.addEventListener("keydown",b),m.addEventListener(n,y),m.addEventListener("blur",k),m.addEventListener("focus",N),window.addEventListener("resize",L),d.addEventListener("scroll",x,!0),{destroy:function(){m.removeEventListener("focus",N),m.removeEventListener("keydown",b),m.removeEventListener(n,y),m.removeEventListener("blur",k),window.removeEventListener("resize",L),d.removeEventListener("scroll",x,!0),h(),E(),p++}}}});</script>';
			// Binding Event
			JS +=
				'<script>Array.prototype.fuzzySearch=function(e){var t=e.split(" ");return this.reduce((e,n)=>{var r=0;return t.forEach(e=>{var t=0;for(var a in n)n[a].indexOf(e)>-1&&t++;t>=1&&r++}),r==t.length&&e.push(n),e},[])},document.addEventListener("DOMContentLoaded",function(){var e=document.getElementById("recipientemail");autocomplete({input:e,fetch:function(e,t){var n=document.getElementById("custpage_email_search").value;t(n=(n=JSON.parse(n)).fuzzySearch(e))},render:function(e,t){var n=document.createElement("div"),r=\'<p><strong style="font-weight: bold;">\'+e.name+"</strong></p>";return r+=\'<p>Email: <strong style="font-weight: bold;">\'+e.email+"</strong></p>",n.innerHTML=r,n},onSelect:function(e){NS.jQuery("#recipientemail").val(e.email)}})});</script>';

			const injectJSField = form.addField({
				id: 'custpage_client_js',
				type: serverWidget.FieldType.INLINEHTML,
				label: ' '
			});
			injectJSField.defaultValue = JS;

			// Get data search
			const injectEmailSeachField = form.addField({
				id: 'custpage_email_search',
				type: serverWidget.FieldType.LONGTEXT,
				label: ' '
			});
			injectEmailSeachField.defaultValue = JSON.stringify(getEmailSearch());
			injectEmailSeachField.updateDisplayType({
				displayType: serverWidget.FieldDisplayType.HIDDEN
			});
		} catch (error) {
			log.error({
				title: '[ERROR] embedJS',
				details: error.message
			});
		}
	}

	/**
	 * Embed CSS beforeLoad
	 * @param {*} context
	 */
	function embedCSS(context) {
		try {
			const form = context.form;
			const CSS =
				'<style>.autocomplete{background:#fff;z-index:1000;overflow:auto;box-sizing:border-box;border:1px solid #ccc;font-size:13px}.autocomplete>div{padding:5px 5px;border-bottom:1px solid #ccc}.autocomplete .group{background:#eee}.autocomplete>div.selected,.autocomplete>div:hover:not(.group){background:#607799;cursor:pointer;color:#fff}</style>';
			const injectCSSField = form.addField({
				id: 'custpage_client_css',
				type: serverWidget.FieldType.INLINEHTML,
				label: ' '
			});
			injectCSSField.defaultValue = CSS;
		} catch (error) {
			log.error({
				title: '[ERROR] embedCSS',
				details: error.message
			});
		}
	}

	/**
	 * Get Data for Search
	 */
	function getEmailSearch() {
		var employeeArr = [];
		var searchPayload = search.create({
			type: search.Type.EMPLOYEE,
			filters: [['isinactive', search.Operator.IS, 'F']],
			columns: ['email', 'firstname', 'middlename', 'lastname']
		});
		var employeeSearch = searchPayload.run().getRange({
			start: 0,
			end: 1000
		});
		for (var index = 0; index < employeeSearch.length; index++) {
			var item = employeeSearch[index];
			employeeArr.push({
				name: getName(
					item.getValue('firstname'),
					item.getValue('middlename'),
					item.getValue('lastname')
				),
				email: item.getValue('email')
			});
		}
		return employeeArr;
	}

	/**
	 * Convert Name
	 * @param {*} firstname
	 * @param {*} middlename
	 * @param {*} lastname
	 */
	function getName(firstname, middlename, lastname) {
		var name = '';
		name += firstname !== '' ? firstname : '';
		name += middlename !== '' ? ' ' + middlename : '';
		name += lastname !== '' ? ' ' + lastname : '';
		return name;
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};
});
