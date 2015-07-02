define([
'views/BaseView',
'text!templates/NotificationsTemplate.html',
'text!templates/NotificationTemplate.html',
], function(BaseView, NotificationsTemplate, NotificationTemplate){
	var NotificationsView = BaseView.extend({

		className: 'screen-notifications',

		template: _.template(NotificationsTemplate),

		statusbar: true,
		
		drawer: true,

		notifications: {},

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
			query.include('request');
			query.find().then(function(matches){

				self.notifications = {};

				self.$el.find('.loading').remove();

				if( matches.length == 0) {
					self.$el.find('.notification-list').hide();
				}

				_.each(matches, function(notification) {

					self.notifications[notification.id] = notification;

					var data = {
						read:  notification.get("read"),
						fromTeam: notification.get("fromTeam"),
						action: notification.get("action"),
						message: notification.get("message") ? notification.get("message").replace(/\n/g, "<br>") : '',
						from: notification.get("from"),
						boatday: notification.get('boatday'),
						request: notification.get('request'),
					};

					self.$el.find('.notification-list').append(_.template(NotificationTemplate)(data));

					if(!notification.get("read")) {
						unread++;
						notification.save({ read: new Date()});
					}
				});

				self.$el.find('.notifications-unread').text("You have " + unread + " new notification" + (unread != 1 ? 's' : '') + ".");
			});

			return this;

		}

	});
	return NotificationsView;
});