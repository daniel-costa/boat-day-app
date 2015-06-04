define([
'views/BaseView',
'text!templates/NotificationsTemplate.html'
], function(BaseView, NotificationsTemplate){
	var NotificationsView = BaseView.extend({

		className: 'screen-notifications',

		template: _.template(NotificationsTemplate),

		statusbar: true,
		
		drawer: true,

	});
	return NotificationsView;
});