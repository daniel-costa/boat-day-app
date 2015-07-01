define([
'views/BaseView',
'models/ChatMessageModel',
'text!templates/BoatDayChatTemplate.html',
'text!templates/BoatDayChatCardTemplate.html',
], function(BaseView, ChatMessageModel, BoatDayChatTemplate, BoatDayChatCardTemplate){
	var BoatDayChatView = BaseView.extend({

		className: 'screen-boatday-chat modal',

		template: _.template(BoatDayChatTemplate),

		events: {
			'click .btn-send': 'send',
			'keypress input': 'watchEnter',
		},

		statusbar: true,
		
		drawer: false,

		lastMessage: null,

		watchEnter: function(event) {
			console.log(event.keyCode);
			if( event.keyCode != 13 ) {
				event.preventDefault();
				self.send();
			}
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			var query = this.model.relation('chatMessages').query();
			query.include('profile');
			self.execQuery(query);

			setInterval(function() {
				if( self.lastMessage ) {
					console.log('exec with'+self.lastMessage.createdAt);
					query.greaterThan('createdAt', self.lastMessage.createdAt);
					self.execQuery(query);
				}
			}, 10000);

			return this;

		},

		execQuery: function(query) {

			var self = this;

			self.$el.find('.loading').hide();

			query.find().then(function(messages) {

				_.each(messages, function(message) {
					self.appendMessage(message);
					self.lastMessage = message;
				});

				self.$el.find('.content-padded').scrollTop(self.$el.find('.content-padded').prop('scrollHeight'));

			});

		},

		appendMessage: function(message) {

			var tpl = _.template(BoatDayChatCardTemplate);

			this.$el.find('.content-padded').append(tpl({ message: message }));

		},

		send: function(event) {

			event.preventDefault();

			var self = this;

			if( this._in('text').val() == '' ) {
				return;
			}

			new ChatMessageModel({
				message: this._in('text').val(),
				boatday: this.model,
				profile: Parse.User.current().get('profile'),
				addToBoatDay: true
			}).save().then(function(message) {
				
				self.lastMessage = message;
				self._in('text').val();
				self.appendMessage(message);

			}, function(error) {
				
				console.log(error);

			});
		}
		
	});
	return BoatDayChatView;
});