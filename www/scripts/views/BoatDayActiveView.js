define([
'views/BaseView',
'views/BoatDayChatView',
'views/MapView',
'text!templates/BoatDayActiveTemplate.html'
], function(BaseView, BoatDayChatView, MapView, BoatDayActiveTemplate){
	var BoatDayActiveView = BaseView.extend({

		className: 'screen-boatday-active',

		template: _.template(BoatDayActiveTemplate),

		events: {
			'click .btn-emergency': 'emergency',
			'click .btn-map': 'map',
			'click .btn-call': 'call',
			'click .btn-chat': 'chat',
			// 'click .btn-camera': 'camera',
		},

		statusbar: false,
		
		drawer: false,

		initialize: function() {

			var timeNow = new Date().getHours() + ( new Date().getMinutes() > 30 ? 0.5 : 0 );
			var deltaHours = this.model.get('boatday').get('arrivalTime') - timeNow;
			var deltaMiliSec = deltaHours * 3600000 + 20000; // We add 20 sec to be sure it doesn't reopen the screen. 

			setTimeout(function() {
				Parse.history.navigate('boatdays-past', true);
			}, deltaMiliSec);

		},

		map: function() {
			this.modal(new MapView({ model : this.model.get('boatday'), precise: true }));
		},

		call: function() {
			var tel = this.model.get('boatday').get('captain').get('host').get('phone').replace(/-/g, "").replace(/ /g, "").trim();

			if( tel.slice(0, 1) != '+') {
				tel = '+1'+tel;
			}

			window.open('tel:' + tel, '_system');
		},

		chat: function(event) {
			event.preventDefault();
			this.modal(new BoatDayChatView({ 
				model : this.model.get('boatday'),
				seatRequest: this.model
			}));
		},

		// camera: function() { },

		emergency: function(event) {
			var prompt = function(buttonIndex) {

				switch(buttonIndex) {
					case 1: 
						window.open('tel:+18003914869', '_system')
						break;
					case 2: 
						window.open('tel:+18003237233', '_system')
						break;
				}

				return ;
			};
			
			navigator.notification.confirm(
				"Call an emergency services provider:", 
				prompt, 
				"Emergency Services",
				["BoatUS (Towing)", "Coast Guard", "Cancel"]
			);
		},

	});
	return BoatDayActiveView;
});