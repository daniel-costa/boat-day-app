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
			query.find().then(function(matches){

				self.notifications = {};

				_.each(matches, function(notification) {

					self.notifications[notification.id] = notification;

					var data = {
						read:  notification.get("read"),
						fromTeam: notification.get("fromTeam"),
						action: notification.get("action"),
						message: notification.get("message") ? notification.get("message").replace(/\n/g, "<br>") : '',
						sender: notification.get('from'),
						boatId: notification.get("boat") ? notification.get("boat").id : null,
						boatName: notification.get("boat") ? notification.get("boat").get('name') : null,
						boatdayId: notification.get("boatday") ? notification.get("boatday").id : null,
						boatdayName: notification.get("boatday") ? notification.get("boatday").get('name') : null,
						
						profilePicture: notification.get("fromTeam") ? 'resources/ico-bd.png' : notification.get("from").get('profilePicture').url()
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