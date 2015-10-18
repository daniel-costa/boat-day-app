define([
'models/ProfileModel',
'views/BaseView',
'text!templates/SignUpTemplate.html'
], function(ProfileModel, BaseView, SignUpTemplate){
	var SignUpView = BaseView.extend({

		className: 'screen-sign-up',

		template: _.template(SignUpTemplate),

		events: {
			"click button.facebook" : "facebook", 
			"click button.sign-up"  : "signUp"
		},

		signUp: function(event) {

			Parse.Analytics.track('sign-in-sign-up');

			event.preventDefault();

			var self = this;

			if( self.loading('.sign-up') ) {
				return ;
			}

			if(this._in('email').val() == "") {
				self.fieldError('email', "Oops, you missed one");
				self.loading();
				return; 
			}

			if(this._in('password').val() == "") {
				self.fieldError('password', "Oops, you missed one");
				self.loading();
				return; 
			}

			new Parse.User().signUp({
				email: this._in('email').val(), 
				username: this._in('email').val(), 
				password: this._in('password').val(), 
				type: "guest",
			}).then(function(user) {

				new ProfileModel({ user: Parse.User.current() }).save().then(function(profile) {
					user.save({ 
						profile: profile,
						type: "guest"
					}).then(function() {
						$(document).trigger('loadProfile', function() {
							Parse.history.navigate('boatdays', true);
						});
					}, function(error) {
						console.log(error);
					});
				}, function(error) {
					console.log(error);
				});

				

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

	});
	return SignUpView;
});