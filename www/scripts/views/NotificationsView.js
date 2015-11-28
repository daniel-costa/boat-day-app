define([
'views/BaseView',
'views/ProfileView',
'views/BoatDayView',
'views/ChatView',
'text!templates/NotificationsTemplate.html',
'text!templates/CardNotificationTemplate.html',
], function(BaseView, ProfileView, BoatDayView, ChatView, NotificationsTemplate, CardNotificationTemplate){
	var NotificationsView = BaseView.extend({

		className: 'screen-notifications',

		template: _.template(NotificationsTemplate),

		events: {
			'click .host-picture': 'profile',
			'click .guest-picture': 'profile',
			'click .open-boatday': 'boatday',
			'click .open-chat': 'chat',
		},

		notifications: {},
		profiles: {},
		boatdays: {},

		profile: function(event) {
			if( $(event.currentTarget).attr('data-id') ) {
				Parse.Analytics.track('notifications-click-profile');
				this.modal(new ProfileView({ model: this.profiles[$(event.currentTarget).attr('data-id')] }), 'right');
			}
		},

		boatday: function(event) {
			if( $(event.currentTarget).attr('data-id') ) {
				Parse.Analytics.track('notifications-click-boatday');
				this.modal(new BoatDayView({ model : this.boatdays[$(event.currentTarget).attr('data-id')], fromUpcoming: false, queryString: "afterRenderScrollTo=.questions" }), 'right');
			}	
		},

		chat: function(event) {
			if( $(event.currentTarget).attr('data-id') ) {
				Parse.Analytics.track('notifications-click-chat');
				this.modal(new ChatView({ model : this.boatdays[$(event.currentTarget).attr('data-id')] }), 'right');
			}	
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;
			var unread = 0;

			var query = new Parse.Query(Parse.Object.extend('Notification'));
			query.descending('createdAt');
			query.equalTo("to", Parse.User.current().get("profile"));
			query.include('from');
			query.include('boat');
			query.include('boatday');
			query.include('boatday.boat');
			query.include('boatday.captain');
			query.include('boatday.captain.host');
			query.include('request');
			query.find().then(function(matches) {
				
				self.notifications = {};

				if( matches.length == 0) {
					self.$el.find('.list').attr('no-data', 'No notifications.');
				}

				var notificationsRead = [];

				_.each(matches, function(notification) {

					self.notifications[notification.id] = notification;

					console.log(notification.id);

					if( notification.get("from") ) {
						self.profiles[notification.get("from").id] = notification.get("from");
					}

					if( notification.get("boatday") ) {
						self.boatdays[notification.get("boatday").id] = notification.get("boatday");
					}
					
					self.$el.find('.list').append(_.template(CardNotificationTemplate)({ self: self, model: notification }));

					if(!notification.get("read")) {
						unread++;
						notification.set('read', new Date())
						notificationsRead.push(notification);
					}
				});

				self.$el.find('.list').scrollTop(1);

				self.$el.find('.unread').text("You have " + unread + " new notification" + (unread != 1 ? 's' : '') + ".");

				Parse.Object.saveAll(notificationsRead).then(function() {
					$(document).trigger('updateNotificationsAmount');
				})
			});

			return this;

		}

	});
	return NotificationsView;
});