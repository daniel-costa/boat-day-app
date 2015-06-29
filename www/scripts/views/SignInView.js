define([
'models/ProfileModel',
'views/BaseView',
'text!templates/SignInTemplate.html'
], function(ProfileModel, BaseView, SignInTemplate){
	var SignInView = BaseView.extend({

		className: 'screen-sign-in',

		template: _.template(SignInTemplate),

		events: {
			"click .icon.back": "showSignIn",
			"click button.create-account": "showSignUp",
			
			"click button.sign-in" : "signIn",
			"click button.sign-up" : "signUp",
			"click button.facebook" : "signInFacebook",
			"click button.twitter" : "signInTwitter",
		},

		statusbar: true,
		
		drawer: false,

		render: function() {

			BaseView.prototype.render.call(this);

			this.$el.find('.block-sign-in').show();

			return this;
		},

		showSignIn: function() {

			this.$el.find('.block-sign-up').hide();
			this.$el.find('.block-sign-in').show();

		},

		showSignUp: function() {

			this.$el.find('.block-sign-up').show();
			this.$el.find('.block-sign-in').hide();
			
		},

		signIn: function() {

			console.log("sign in with email");

		},

		signUp: function() {

			console.log("sign up with email");

		},

		signInTwitter: function() {

			console.log("sign in twitter");

		},

		signInFacebook: function() {

			var self = this;

			if( self.isLoading('button.facebook') ) {
				return;
			}

			self.loading('button.facebook');

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

				fbLogged.resolve(authData);
				fbLoginSuccess = null;
			};

			var transferFbUserToParse = function (authData) {
				console.log("** Transfer to parse");
				return Parse.FacebookUtils.logIn(authData);
			};

			var transferSuccess = function(user) {
				console.log("** Transfer success");
				self.handleSignIn("facebook", user);
			};

			var transferError = function(error) {
				console.log("** Login error:");
				console.log(error);
				// Sometimes while a crash, the user stays log out and it 
				// may trigger this error
				// The best workarround  is to sign him out properly.
				Parse.history.navigate('sign-out', true);
			};

			var fbLogged = new Parse.Promise();

			facebookConnectPlugin.login(["public_profile"], fbLoginSuccess, transferError);

			fbLogged.then(transferFbUserToParse, transferError).then(transferSuccess, transferError);
			
		},

		handleSignIn: function(type, user) {
			
			var self = this;

			if( user.get("profile") ) {
				Parse.User.current().get("profile").fetch().then(function() {
					Parse.history.navigate('boatdays', true);
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

		createUserProfileEmail: function() {

		},

		createUserProfileFacebook: function(user) {

			var self = this;

			var handleErrors = function(error) {

				console.log('** create User Profile error:');
				console.log(error);
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

			var userUpdated = function() {
				console.log('** User updated:');
				Parse.history.navigate('boatdays', true);

			};

			var facebookApiSuccess = function(me) {
				console.log('** FB Api success:');
				console.log(me);

				var updateUser = function( profile ) {
					user.save({ 
						email: me.email, 
						profile: profile,
						type: "guest"
					}).then(userUpdated, handleErrors);
				};

				if( me.birthday ) {
					var ds = me.birthday.split('/');	
				}

				var profile = new ProfileModel({
					firstName: me.first_name ? me.first_name : null,
					lastName: me.last_name ? me.last_name : null,
					gender: me.gender ? me.gender : null,
					birthday: me.birthday ? new Date(ds[2], ds[0]-1, ds[1]) : null,
					about: me.bio ? me.bio : null
				});

				profile.save().then(updateUser, handleErrors);

			};

			facebookConnectPlugin.api('/me?fields=email,first_name,last_name,gender,birthday,picture,bio', null, facebookApiSuccess, handleErrors);

		}

	});
	return SignInView;
});
