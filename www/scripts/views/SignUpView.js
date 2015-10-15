define([
'models/ProfileModel',
'views/BaseView',
'text!templates/SignUpTemplate.html'
], function(ProfileModel, BaseView, SignUpTemplate){
	var SignUpView = BaseView.extend({

		className: 'screen-signUp',

		template: _.template(SignUpTemplate),

		events: {
			"click button.facebook" : "signInFacebook", 
			"click button.sign-up"  : "signUp"
		},

		render: function() {

			BaseView.prototype.render.call(this);

			return this;
		}, 

		signUp: function(event) {

			Parse.Analytics.track('sign-in-sign-up');

			event.preventDefault();

			var self = this;

			if( self.loading('.sign-up') ) {
				return ;
			}

			if(this._in('signUpEmail').val() == "") {
				self.fieldError('signUpEmail', "Oops, you missed one");
				self.loading();
				return; 
			}

			if(this._in('signUpPassword').val() == "") {
				self.fieldError('signUpPassword', "Oops, you missed one");
				self.loading();
				return; 
			}

			new Parse.User().signUp({
				email: this._in('signUpEmail').val(), 
				username: this._in('signUpEmail').val(), 
				password: this._in('signUpPassword').val(), 
				type: "guest", 
				// ToDo : Bug fix, user is not saved in profile
				profile: new ProfileModel({ user: Parse.User.current() })
			}).then(signUpSuccess = function() {

				Parse.history.navigate('boatdays', true);

			}, function( error ) {

				self.loading();

				switch(error.code) {
					case 125: 
						self._error("Please provide a valid email address.");
						break;
					case 202: 
						self._error("This email is already taken");
						break;
					default:
						self._error("An error occured, please try again.");
						break;
				}

			});
		},

		signInFacebook: function() {

			Parse.Analytics.track('sign-in-facebook');

			var self = this;

			if( self.loading('.facebook') ) {
				return ;
			}
			
			var fbLoginSuccess = function(userData) {

				console.log("fbLoginSuccess");
				console.log(userData);

				if (!userData.authResponse){
					transferError("Cannot find the authResponse");
					return;
				}

				var authData = {
					id: String(userData.authResponse.userID),
					access_token: userData.authResponse.accessToken,
					expiration_date: new Date(new Date().getTime() + userData.authResponse.expiresIn * 1000).toISOString()
				};

				fbLogged.resolve(authData);
				fbLoginSuccess = null;
			};

			var transferFbUserToParse = function (authData) {
				console.log("transferFbUserToParse");
				console.log(authData);
				return Parse.FacebookUtils.logIn(authData);
			};

			var transferSuccess = function(user) {
				console.log("transferSuccess");
				console.log(user);
				self.handleSignIn("facebook", user);
			};

			var transferError = function(error, err) {
				console.log("transferError");
				console.log(error);
				console.log(err);
				self.loading();
				self._error("Oops... something wrong happen. Please, try later");
				// Sometimes while a crash, the user stays log out and it 
				// may trigger this error
				// The best workarround  is to sign him out properly.
				Parse.history.navigate('sign-out', true);
			};

			var fbLogged = new Parse.Promise();

			facebookConnectPlugin.login(["public_profile", "email", "user_about_me", "user_birthday", "user_friends"], fbLoginSuccess, transferError);

			fbLogged.then(transferFbUserToParse, transferError).then(transferSuccess, transferError);
			
		},

		handleSignIn: function(type, user) {
			
			var self = this;

			if( user.get("profile") ) {
				self.updateUserProfileFacebook(user, function() {
					$(document).trigger('loadProfile', function() {
						Parse.history.navigate('boatdays', true);
					});
				});
			} else {
				console.log('redirect to createProfile');
				switch(type) {
					case "facebook":
						self.createUserProfileFacebook(user);
						break;
					case "twitter":
						self.createUserProfileTwitter(user);
						break;
					case "email":
						self.createUserProfileEmail(user);	
						break;
				}
				
			}
		},

		updateUserProfileFacebook: function(user, cb) {
			console.log("updateUserProfileFacebook");
			console.log(user);

			var self = this;

			// Bug on Facebook SDK
			// For now, we skip it

			// var handleErrors = function(error) {
			// 	console.log("handleErrors");
			// 	console.log(error);
			// 	self.loading();
			// 	self._error("Oops... something wrong happen. Please, try later");
			// 	Parse.history.navigate('sign-out', true);
			// };

			// facebookConnectPlugin.api('/me?fields=email', ["public_profile", "email"], function(me) {
			// 	user.save({ 
			// 		email: me.email,
			// 	}).then(cb, handleErrors);
			// }, handleErrors);
	
			cb();
		},

		createUserProfileFacebook: function(user) {
			console.log("createUserProfileFacebook");
			console.log(user);

			var self = this;

			var handleErrors = function(error) {
				console.log("handleErrors");
				console.log(error);
				if(error.code == 209) {
					Parse.history.navigate('sign-out', true);
				}
				self.loading();
				self._error("Oops... something wrong happen. Please, try later");
			};

			var profile = new ProfileModel({ user: Parse.User.current() });

			profile.save().then(function( profile ) {
				user.save({ 
					profile: profile,
					type: "guest"
				}).then(function() {
					$(document).trigger('loadProfile', function() {
						Parse.history.navigate('boatdays', true);
					});
				}, handleErrors);
			}, handleErrors);
		}
	});
	return SignUpView;
});