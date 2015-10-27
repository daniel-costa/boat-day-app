define([
'views/BaseView',
'views/AboutUsView', 
'views/MyPictureView', 
'text!templates/DrawerTemplate.html'
], function(BaseView, AboutUsView, MyPictureView, DrawerTemplate){
	var DrawerView = BaseView.extend({

		className: 'snap-drawers',

		template: _.template(DrawerTemplate),

		events: {
			'click .top'	: 'profile', 
			'click .about'	: 'aboutUs'
		},

		render: function() {
			BaseView.prototype.render.call(this);
			$(document).trigger('updateNotificationsAmount', this.$el.find('.total-notifications .amount'));
			return this;
		}, 


		profile: function(event) {

			event.preventDefault();
			this.modal(new MyPictureView({ model: Parse.User.current().get('profile') }));

		},

		aboutUs: function(event) {

			event.preventDefault();
			this.modal(new AboutUsView());
		
		}
		
	});
	return DrawerView;
});