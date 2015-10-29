define([
'models/ProfileModel',
'views/BaseView',
'text!templates/SignInTemplate.html'
], function(ProfileModel, BaseView, SignInTemplate){
	var SignInView = BaseView.extend({

		className: 'screen-sign-in',

		template: _.template(SignInTemplate),

		events: {
			"click button.facebook" : "facebook", 
			"click button.sign-in"  : "signIn"
		},

		facebook: function() {

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
				
				var self = this;

				if( user.get("profile") ) {
				
					$(document).trigger('loadProfile', function() {
						Parse.history.navigate('boatdays', true);
					});

				} else {

					var handleErrors = function(error) {
						console.log("handleErrors");
						console.log(error);

						if(error.code == 209) {
							Parse.history.navigate('sign-out', true);
						}
						
						self.loading();
						self._error("Oops... something wrong happen. Please, try later");
					};

					new ProfileModel({ user: Parse.User.current() }).save().then(function( profile ) {
						user.save({ 
							profile: profile,
							type: "guest"
						}).then(function() {
							$(document).trigger('loadProfile', function() {
								self.loading();
								Parse.history.navigate('boatdays', true);
							});
						}, handleErrors);
					}, handleErrors);
					
				}
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

		signIn: function(event) {

			Parse.Analytics.track('sign-in');

			event.preventDefault();

			var self = this;

			if( self.loading('.sign-in') ) {
				return ;
			}

			if(this._in('email').val() == '') {
				self.fieldError("email", "Oops, you missed one");
				self.loading();
				return;
			}

			if(this._in('password').val() == '') {
				self.fieldError("password", "Oops, you missed one");
				self.loading();
				return;
			}

			Parse.User.logIn(this._in('email').val(), this._in('password').val()).then(function() {

				self.loading();

				$(document).trigger('loadProfile', function() {
					Parse.history.navigate('boatdays', true);
				});

			}, function(error) {

				self.loading();

				switch(error.code) {
					case 101: self._error("Invalid email/password"); break;
					default: self._error("An error occured, please try later"); break;
				}

			});

		},

	});
	return SignInView;
});