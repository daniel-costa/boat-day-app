define([
'views/BaseView',
'text!templates/ProfileSettingsTemplate.html'
], function(BaseView, ProfileSettingsTemplate){
	var ProfileSettingsView = BaseView.extend({

		className: 'screen-profile-settings',

		template: _.template(ProfileSettingsTemplate),

		events: { },

		profileSetup: false,

		statusbar: true,
		
		drawer: true,

		save: function() {

			// var profileUpdateSuccess = function() {
				
			// 	if( this.profileSetup ) {
					
			// 		Parse.history.navigate("profile-payments", true);

			// 	} else {

			// 		Parse.history.navigate("profile", true);

			// 	}

			// };

			// var pictureSaveError = function(error) {

			// 	console.log(error);
			// 	self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');

			// };

		},
		
		initialize: function(data) {

			this.profileSetup = data.setup;
			
		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			if( this.profileSetup ) {
				
				this.$el.find('.btn-drawer').hide();

			}

			return this;
		}
	});
	return ProfileSettingsView;
});