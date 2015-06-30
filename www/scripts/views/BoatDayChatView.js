define([
'views/BaseView',
'text!templates/BoatDayChatTemplate.html'
], function(BaseView, BoatDayChatTemplate){
	var BoatDayChatView = BaseView.extend({

		className: 'screen-boatday-chat modal',

		template: _.template(BoatDayChatTemplate),

		events: {
			
		},

		// statusbar: true,
		
		// drawer: false,

		
	});
	return BoatDayChatView;
});