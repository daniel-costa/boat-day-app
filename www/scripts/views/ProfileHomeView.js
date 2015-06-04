define([
'views/BaseView',
'text!templates/ProfileHomeTemplate.html'
], function(BaseView, ProfileHomeTemplate){
	var ProfileHomeView = BaseView.extend({

		className: 'screen-profile-home',

		template: _.template(ProfileHomeTemplate),

		events: {
			'click .profile-picture': 'profilePicture'
		},

		profileSetup: false,

		statusbar: true,
		
		drawer: true,

		initialize: function(data) {

			this.profileSetup = data.setup;

		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			if( this.profileSetup ) {
				
				this.$el.find('.btn-drawer').hide();

			}

			return this;
		},

		profilePicture: function() {
			Parse.history.navigate("profile-picture", true);
		}
	});
	return ProfileHomeView;
});