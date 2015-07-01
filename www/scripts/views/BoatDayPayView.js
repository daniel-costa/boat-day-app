define([
'views/BaseView',
'text!templates/BoatDayPayTemplate.html',
], function(BaseView, BoatDayPayTemplate){
	var BoatDayPayView = BaseView.extend({

		className: 'screen-boatday-chat modal',

		template: _.template(BoatDayPayTemplate),

		events: {
			'click .btn-pay': 'pay',
		},

		statusbar: true,
		
		drawer: false,

		pay: function(event) {
			
		}
		
	});
	return BoatDayPayView;
});