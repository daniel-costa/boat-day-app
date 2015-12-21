define([
'views/BaseView',
'text!templates/MissingInfoTemplate.html'
], function(BaseView, MissingInfoTemplate){
	var MissingInfoView = BaseView.extend({

		className: 'screen-missing-info',

		template: _.template(MissingInfoTemplate),

		checkForMissingInfo: false,

		events: {
			'click .save': 'save'
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			return this;
		},

		save: function() {
			var self = this;
			
			if( self.loading('.save') ) {
				return ;
			}

			var userData = {
				email: this._in('email').val(), 
			};

			var profileData = {
				firstName: this._in('firstName').val(), 
				lastName: this._in('lastName').val(), 
				phone: this._in('phone').val(), 
				birthDay: this._in('birthDay').val() ? new Date(this._input('birthDate').val()) : null
			};

			var profileSaveSuccess = function(profile) {
				profile.get('user').save(userData).then( function(user) {
					self.close();
				}, function(error) {
					console.log(error);
				});
			};

			var profileSaveError = function(error) {
				console.log(error);
			};

			Parse.User.current().get("profile").fetch().then(
				function(profile) {
					profile.save(profileData).then(profileSaveSuccess, profileSaveError);
				}, function(error) {

					console.log(error);
				}
			);
		}

	});
	return MissingInfoView;
});