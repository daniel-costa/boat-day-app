define([
'views/BaseView',
'text!templates/ProfileInfoTemplate.html'
], function(BaseView, ProfileInfoTemplate){
	var ProfileInfoView = BaseView.extend({

		className: 'screen-profile-info',

		template: _.template(ProfileInfoTemplate),

		events: { 
			'click .btn-save': 'save'
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

		save: function() {

			var self = this;

			var data = {
				status: "ready",
				displayName: this._input('displayName').val(),
				firstName: this._input('firstName').val(),
				lastName: this._input('lastName').val(),
				birthday: this._input('birthday').val() ? new Date(this._input('birthday').val()) : null,
				about: this._input('about').val()
			};
			
			var profileUpdateSuccess = function() {
				
				if( self.profileSetup ) {
					
					Parse.history.navigate("profile-picture", true);

				} else {

					Parse.history.navigate("profile-home", true);

				}

			};

			var profileUpdateError = function(error) {

				console.log(error);
				self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');

			};

			this.model.save(data).then(profileUpdateSuccess, profileUpdateError);

		}

	});
	return ProfileInfoView;
});