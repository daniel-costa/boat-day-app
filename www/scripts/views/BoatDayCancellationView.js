define([
'views/BaseView',
'text!templates/BoatDayCancellationTemplate.html'
], function(BaseView, BoatDayCancellationTemplate){
	var BoatDayCancellationView = BaseView.extend({

		className: 'screen-boatday-cancellation modal',

		template: _.template(BoatDayCancellationTemplate),

		events: {
		},

		statusbar: true,
		
		drawer: false,

	});
	return BoatDayCancellationView;
});