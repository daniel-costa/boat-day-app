define([
'views/BaseView',
'views/ChatView',
'views/MapView',
'views/PayView',
'text!templates/BoatDayActiveTemplate.html'
], function(BaseView, ChatView, MapView, PayView, BoatDayActiveTemplate){
	var BoatDayActiveView = BaseView.extend({

		className: 'screen-boatday-active',

		template: _.template(BoatDayActiveTemplate),

		events: {
			'click .chat': 'chat',
			'click .call': 'call',
			'click .map': 'map',
			'click .emergency': 'emergency',
			'click .info': 'info',
			'click .close': 'close',
		},

		statusbar: false,
		drawer: false,

		initialize: function() {

			var self = this;
			var timeNow = new Date().getHours() + ( new Date().getMinutes() / 60 );
			var deltaHours = Math.max(0, this.model.get('boatday').get('arrivalTime') - timeNow);
			var deltaMiliSec = deltaHours * 3600000 + 61000; // We add 61 sec to be sure it doesn't reopen the screen. 

			setTimeout(function() {
				self.$el.find('.btn-close').closest('.option').show();
				self.modal(new PayView({ model : self.model }) );
			}, deltaMiliSec);

		},

		info: function() {

		},

		close: function() {
			
			Parse.Analytics.track('bd-active-click-close');
			
			Parse.history.loadUrl(Parse.history.fragment);

		},

		map: function() {
			
			Parse.Analytics.track('bd-active-click-map');
			
			this.modal(new MapView({ model : this.model.get('boatday'), precise: true, getdirection: true }), 'right');

		},

		call: function() {
			
			Parse.Analytics.track('bd-active-click-call');
			
			var tel = this.model.get('boatday').get('captain').get('host').get('phone').replace(/-/g, "").replace(/ /g, "").trim();

			if( tel.slice(0, 1) != '+') {
				tel = '+1'+tel;
			}

			window.open('tel:' + tel, '_system');

		},

		chat: function(event) {
			
			Parse.Analytics.track('bd-active-click-chat');
			
			event.preventDefault();
			this.modal(new ChatView({ model : this.model.get('boatday'), seatRequest: this.model }), 'right');
			
		},

		emergency: function(event) {
			
			Parse.Analytics.track('bd-active-click-emergency');

			var prompt = function(buttonIndex) {

				// Parse.Analytics.track('bd-active-emergency', { boatday: this.model.id, buttonIndex: buttonIndex });

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