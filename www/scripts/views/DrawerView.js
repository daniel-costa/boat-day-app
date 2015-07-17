define([
'views/BaseView',
'text!templates/DrawerTemplate.html'
], function(BaseView, DrawerTemplate){
	var DrawerView = BaseView.extend({

		className: 'snap-drawers',

		template: _.template(DrawerTemplate),

		events: {
			'click .top': 'profile'
		},

		profile: function() {
			Parse.history.navigate('profile-picture', true);
		},

		render: function() {
			BaseView.prototype.render.call(this);
			$(document).trigger('updateNotificationsAmount', this.$el.find('.total-notifications'));
			return this;
		}
		
	});
	return DrawerView;
});