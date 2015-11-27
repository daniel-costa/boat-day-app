define([
'views/BaseView',
'text!templates/BoatDayActiveAboutTemplate.html'
], function(BaseView, BoatDayActiveAboutTemplate){
	var BoatDayActiveAboutView = BaseView.extend({

		className: 'screen-boatday-active-about',

		template: _.template(BoatDayActiveAboutTemplate),

	});
	
	return BoatDayActiveAboutView;
});