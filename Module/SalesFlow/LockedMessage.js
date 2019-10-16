/**
 * Locked Message Module
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define(['N/ui/message'], function(message) {
	function show() {
		message
			.create({
				title: 'Locked Record',
				message: "You're not allow to change.",
				type: message.Type.ERROR
			})
			.show();
	}

	return {
		show: show
	};
});
