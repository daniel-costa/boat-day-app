define([
'views/BaseView',
'text!templates/BoatDayCancellationTemplate.html'
], function(BaseView, BoatDayCancellationTemplate){
	var BoatDayCancellationView = BaseView.extend({

		className: 'screen-boatday-cancellation',

		template: _.template(BoatDayCancellationTemplate),

	});
	return BoatDayCancellationView;
});