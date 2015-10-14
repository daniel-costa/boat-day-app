define([
'views/BaseView',
'views/ProfileView',
'views/BoatDayView',
'text!templates/NotificationsTemplate.html',
'text!templates/CardNotificationTemplate.html',
], function(BaseView, ProfileView, BoatDayView, NotificationsTemplate, CardNotificationTemplate){
	var NotificationsView = BaseView.extend({

		className: 'screen-notifications',

		template: _.template(NotificationsTemplate),

		notifications: {},

		events: {
			'click .profile-picture': 'profile',
			'click .open-boatday': 'boatday'
		},

		profiles: {},
		boatdays: {},

		profile: function(event) {
			if( $(event.currentTarget).attr('data-id') ) {
				Parse.Analytics.track('notifications-click-profile');
				this.modal(new ProfileView({ model: this.profiles[$(event.currentTarget).attr('data-id')] }));
			}
		},

		boatday: function(event) {
			if( $(event.currentTarget).attr('data-id') ) {
				Parse.Analytics.track('notifications-click-boatday');
				this.modal(new BoatDayView({ model : this.boatdays[$(event.currentTarget).attr('data-id')], fromUpcoming: false }));
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
			query.find().then(function(matches){

				self.notifications = {};

				self.$el.find('.loading').remove();

				if( matches.length == 0) {
					self.$el.find('.notification-list').hide();
				}

				var notificationsRead = [];

				_.each(matches, function(notification) {

					self.notifications[notification.id] = notification;

					var data = {
						self: self,
						read:  notification.get("read"),
						fromTeam: notification.get("fromTeam"),
						action: notification.get("action"),
						message: notification.get("message") ? notification.get("message").replace(/\n/g, "<br>") : '',
						from: notification.get("from"),
						boatday: notification.get('boatday'),
						request: notification.get('request'),
						notification: notification
					};

					if( notification.get("from") ) {
						self.profiles[notification.get("from").id] = notification.get("from");
					}
					

					if( notification.get("boatday") ) {
						self.boatdays[notification.get("boatday").id] = notification.get("boatday");
					}
					
					self.$el.find('.notification-list').append(_.template(CardNotificationTemplate)(data));

					if(!notification.get("read")) {
						unread++;
						notification.set('read', new Date())
						notificationsRead.push(notification);
					}
				});

				Parse.Object.saveAll(notificationsRead).then(function() {
					$(document).trigger('updateNotificationsAmount');
				})

				self.$el.find('.notifications-unread').text("You have " + unread + " new notification" + (unread != 1 ? 's' : '') + ".");
			});

			return this;

		}

	});
	return NotificationsView;
});