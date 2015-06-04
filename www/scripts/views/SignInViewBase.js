define([
'models/ProfileModel',
'views/BaseView',
'text!templates/SignInTemplate.html'
], function(ProfileModel, BaseView, SignInTemplate){
	var SignInView = BaseView.extend({

		className: 'screen-sign-in',

		template: _.template(SignInTemplate),

		events: {
			"click button.sign-in-facebook" : "signInFaceBook",
			"click button.sign-in-email" : "signInEmail",
			"click button.take-picture": "takePicture"
		},
		
		statusbar: true,
		
		drawer: true,

		render: function() {

			BaseView.prototype.render.call(this);

			this.$el.find('.block-sign-in').fadeIn();

			return this;
		},

		signIn: function() {

			var self = this;

			if( self.isLoading('button.sign-in') ) {
				return;
			}

			self.loading('button.sign-in');

			var fbLoginSuccess = function(userData) {

				if (!userData.authResponse){
					transferError("Cannot find the authResponse");
					return;
				}

				var authData = {
					id: String(userData.authResponse.userID),
					access_token: userData.authResponse.accessToken,
					expiration_date: new Date(new Date().getTime() + userData.authResponse.expiresIn * 1000).toISOString()
				};

				// if($(self.$el.find('video')).get(0).paused) {
				// 	$(self.$el.find('video')).get(0).play();
				// }

				fbLogged.resolve(authData);
				fbLoginSuccess = null;
			};

			var transferFbUserToParse = function (authData) {
				
				return Parse.FacebookUtils.logIn(authData);
			
			};

			var transferSuccess = function(user) {

				self.handleSignIn(user);

			};

			var transferError = function(error) {
				// Sometimes while a crash, the user stays log out and it 
				// may trigger this error
				// The best workarround  is to sign him out properly.
				Parse.history.navigate('sign-out', true);
			};


			var fbLogged = new Parse.Promise();
			
			facebookConnectPlugin.login(["public_profile", "email", "user_birthday"], fbLoginSuccess, transferError);

			fbLogged.then(transferFbUserToParse).then(transferSuccess, transferError);
			
		},

		handleSignIn: function(user) {

			var self = this;

			if( !user.get("profile") ) {

				self.createUserProfile(user);

			} else {

				var getProfileSuccess = function() {

					if(!user.get("profile").get("profilePicture")) {
						
						self.renderTakePicture();

					} else if(user.get("status") == 'creation') {

						self.renderGoProfile();

					} else {

						self.signInDone();

					}

				};

				var getProfileError = function(error) {
					// It can happen that the user is logged in 
					// and once we delete him from parse without a proper 
					// logout it stays blocked on the first page without any action possible or button displayed
					// To prevent that we do a natural logout
					// It must never happen but we never now
					Parse.history.navigate('sign-out', true);
				};

				user.get("profile").fetch().then(getProfileSuccess, getProfileError);
			}

		},

		signInDone: function() {

			Parse.history.navigate('discover', true);
			
		},


		createUserProfile: function(user) {

			var self = this;

			var handleErrors = function(error) {

				if(error.code == 209) {
					// It can happen that the user is logged in 
					// and once we delete him from parse without a proper 
					// logout it stays blocked on the first page without any action possible or button displayed
					// To prevent that we do a natural logout
					// It nust never happen but we never now
					Parse.history.navigate('sign-out', true);
				}

				self.loading();
				self._error("Oops... something wrong happen. Please, try later");

			};

			var takePicture = function() {

				self.renderTakePicture();

			};

			var facebookApiSuccess = function(me) {

				var profile = new ProfileModel({
					displayName: me.first_name,
					gender: me.gender,
					birthday: me.birthday
				});


				var updateUser = function() {
					user.save({ 
						status: "creation", 
						email: me.email, 
						profile: profile 
					}).then(takePicture, handleErrors);
				};

				profile.save().then(updateUser, handleErrors);

			};

			facebookConnectPlugin.api('/me', null, facebookApiSuccess, handleErrors);
		},

		renderTakePicture: function() {

			var self = this;

			var loadBlock = function() {
				self.$el.find('.block-take-picture').fadeIn();
			};

			self.$el.find('.block-sign-in, .block-go-profile').fadeOut({ complete: loadBlock });

		},

		renderGoProfile: function() {

			var self = this;

			var loadBlock = function() {
				self.$el.find('.block-go-profile').fadeIn();
			};

			self.$el.find('.block-take-picture, .block-sign-in').fadeOut({ complete: loadBlock });

		},

		takePicture: function() {

			var self = this;

			if( self.isLoading('button.take-picture') ) {
				return;
			}

			var picture;

			self.loading('button.take-picture');

			var pictureSaveSuccess = function(imageData) {

				picture = new Parse.File("picture.jpeg", { base64: imageData }, "image/jpeg");
				picture.save().then(profileUpdate, pictureSaveError);
				
			};

			var profileUpdate = function( ) {

				Parse.User.current().get("profile").save({ profilePicture : picture }).then(profileUpdateSuccess, pictureSaveError);

			};

			var profileUpdateSuccess = function() {

				self.renderGoProfile();

			};

			var pictureSaveError = function(error) {

				self.loading();
				self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');

			};

			navigator.camera.getPicture(pictureSaveSuccess, pictureSaveError, self.__GLOBAL_PICTURE_QUALITY__);

		}

	});
	return SignInView;
});
