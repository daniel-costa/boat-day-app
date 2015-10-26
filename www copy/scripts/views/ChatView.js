define([
'models/ReportModel',
'models/ChatMessageModel',
'views/BaseView',
'views/ReportView',
'text!templates/ChatTemplate.html',
'text!templates/CardChatTemplate.html',
], function(ReportModel, ChatMessageModel, BaseView, ReportView, ChatTemplate, CardChatTemplate){
	var ChatView = BaseView.extend({

		className: 'screen-chat',

		template: _.template(ChatTemplate),

		events: {
			'click .send': 'send',
			'keypress input': 'watchEnter',
		},

		lastMessage: null,

		initialize: function(data) {
			this.seatRequest = data.seatRequest;
		},

		watchEnter: function(event) {

			if( event.keyCode == 13 ) {
				event.preventDefault();
				this._in('text').blur();
				this.send(event);
			}

		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			var query = this.model.relation('chatMessages').query();
			query.include('profile');
			query.descending('createdAt');
			self.execQuery(query, false);

			setInterval(function() {
				if( self.lastMessage ) {
					var query = self.model.relation('chatMessages').query();
					query.include('profile');
					query.ascending('createdAt');
					query.greaterThan('createdAt', self.lastMessage.createdAt);
					self.execQuery(query, true);
				}
			}, 10000);

			return this;

		},

		afterRenderInsertedToDom: function() {
			
			this.$el.find('.list').scrollTop(this.$el.find('.list').prop('scrollHeight'));
			
		},

		execQuery: function(query, append) {

			var self = this;

			query.find().then(function(messages) {

				_.each(messages, function(message) {
					if(append) {
						self.appendMessage(message);
					} else {
						self.prependMessage(message);
					}

					if( self.lastMessage && self.lastMessage.createdAt < message.createdAt) {
						self.lastMessage = message;
					}
				});

				self.afterRenderInsertedToDom();

				self.seatRequest.save('guestLastRead', new Date());

			});

		},

		appendMessage: function(message) {

			this.$el.find('.list').append(_.template(CardChatTemplate)({ model: message }));

		},


		prependMessage: function(message) {

			this.$el.find('.list').prepend(_.template(CardChatTemplate)({ model: message }));

		},

		send: function(event) {

			event.preventDefault();

			var self = this;

			if( self.loading('.send') ) {
				return ;
			}

			if( this._in('text').val() == '' ) {
				self.loading();
				return;
			}

			new ChatMessageModel({
				message: this._in('text').val(),
				boatday: this.model,
				profile: Parse.User.current().get('profile'),
				addToBoatDay: true
			}).save().then(function(message) {
				self.loading();
				self.lastMessage = message;
				self._in('text').val('');
				self.appendMessage(message);
				self.afterRenderInsertedToDom();
			}, function(error) {
				
				Parse.Analytics.track('chat-save-fail');

				self.loading();
				console.log(error);
			});
		}
		
	});
	return ChatView;
});