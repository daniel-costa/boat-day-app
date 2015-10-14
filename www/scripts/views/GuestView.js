define([
'models/ProfileModel',
'views/BaseView',
'text!templates/GuestTemplate.html', 
'text!templates/CardBoatDayGuestTemplate.html'
], function(ProfileModel, BaseView, GuestTemplate, CardBoatDayGuestTemplate){
	var SignInView = BaseView.extend({

		className: 'screen-guest',

		template: _.template(GuestTemplate),

		boatdays: {}, 

		events: {

			"click button.facebook" : "signInFacebook"
			
		},

		render: function() {

			BaseView.prototype.render.call(this);
			var self = this;

			var query = new Parse.Query(Parse.Object.extend('BoatDay'));
			query.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
			query.ascending('date, departureTime');
			query.include('boat');
			query.find().then(function(boatdays) {
				var tpl = _.template(CardBoatDayGuestTemplate);
				self.boatdays = {};
				self.$el.find('.content .boatdays').html('');

				_.each(boatdays, function(boatday) {

					self.boatdays[boatday.id] = boatday;
					self.$el.find('.content .boatdays').append(tpl({
							id: boatday.id,
							name: boatday.get('name'), 
							date: boatday.get('date'), 
							availableSeats: boatday.get('availableSeats'), 
							location: boatday.get('locationText')
					}));

					var queryBoatPicture = boatday.get('boat').relation('boatPictures').query();
					queryBoatPicture.ascending('order');
					queryBoatPicture.first().then(function (fileholder) {

						if( fileholder ) {
							self.$el.find('.boatday-card.card-'+boatday.id+' .picture').html(fileholder.get('file').url());
						}
					});
				});
			});

			return this;
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
	return SignInView;
});
