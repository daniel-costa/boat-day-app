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
			BaseView.prototype.afterRenderInsertedToDom.call(this);

			var self = this;

			return this;
		},

		save: function() {
			var self = this;
			var profileData =  {};
			var userData = {};

			if( self.loading('.save') ) {
				return ;
			}

			if(this._in('firstName').val() == '') {
				self.fieldError("firstName", "Oops, you missed one");
				self.loading();
				return;
			}

			if(this._in('lastName').val() == '') {
				self.fieldError("lastName", "Oops, you missed one");
				self.loading();
				return;
			}


			if(this._in('email').val() == '') {
				self.fieldError("email", "Oops, you missed one");
				self.loading();
				return;
			}

			if(this._in('phone').val() == '') {
				self.fieldError("phone", "Oops, you missed one");
				self.loading();
				return;
			}

			if(this._in('birthday').val() == '') {
				self.fieldError("birthday", "Oops, you missed one");
				self.loading();
				return;
			}

	

			if(self.$el.find('main input[name="firstName"]').length !== 0){
				profileData.firstName =  this._in('firstName').val();
			}

			if(self.$el.find('main input[name="lastName"]').length !== 0){
				profileData.lastName =  this._in('lastName').val();
			}

			if(self.$el.find('main input[name="email"]').length !== 0){
				userData.email = this._in('email').val();
			}

			if(self.$el.find('main input[name="phone"]').length !== 0){
				profileData.phone =  this._in('phone').val();
			}

			if(self.$el.find('main input[name="birthday"]').length !== 0){
				profileData.birthday = new Date(this._in('birthday').val());
			}

			var profileSaveSuccess = function(profile) {
				profile.get('user').save(userData).then(function(user) {
					self._info('Profile saved');

					Parse.User.current().fetch().then(function(user){
						user.get('profile').fetch().then(function(profile){
							self.close();
						});
					});
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