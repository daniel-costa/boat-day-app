define([
'views/BaseView',
'text!templates/BoatDayChatTemplate.html'
], function(BaseView, BoatDayChatTemplate){
	var BoatDayChatView = BaseView.extend({

		className: 'screen-boatday-chat modal',

		template: _.template(BoatDayChatTemplate),

		events: {
			'click .btn-send': 'send'
		},

		statusbar: true,
		
		drawer: false,

		send: function() {

			new ChatMessageModel({
				message: this._in('text'),
				boatday: this.model,
				profile: Parse.User.current().get('profile')
			}).save().then(function(message) {
				
				self.appendMessage(message);

			}, function(error) {
				
				console.log(error);

			});
		}
		
	});
	return BoatDayChatView;
});