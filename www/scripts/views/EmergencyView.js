define([
'views/BaseView',
'text!templates/EmergencyTemplate.html'
], function(BaseView, EmergencyTemplate){
	var EmergencyView = BaseView.extend({

		className: 'screen-emergency',

		template: _.template(EmergencyTemplate),

		statusbar: true,
		
		drawer: true,

	});
	return EmergencyView;
});