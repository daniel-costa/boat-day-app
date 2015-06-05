define([
'models/ProfileModel',
'views/BaseView',
'text!templates/SignInTemplate.html'
], function(ProfileModel, BaseView, SignInTemplate){
	var SignInView = BaseView.extend({

		className: 'screen-sign-in',

		template: _.template(SignInTemplate),

		events: {
			"click .icon.back": "showHome",
			"click button.sign-in": "showSignIn",
			"click button.create-account": "showCreateAccount",
			
			"click button.sign-in-facebook" : "signInFacebook",
			"click button.sign-up-facebook" : "signInFacebook",
			"click button.sign-in-email" : "signInEmail",
			"click button.sign-up-email" : "signUpEmail"
		},

		statusbar: false,
		
		drawer: false,

		render: function() {

			BaseView.prototype.render.call(this);

			this.$el.find('.block-home').show();

			return this;
		},

		showHome: function() {

			this.$el.find('.block-sign-in, .block-create-account, .bar-nav').hide();
			this.$el.find('.block-home').show();

		},

		showSignIn: function() {

			this.$el.find('.block-home').hide();
			this.$el.find('.block-sign-in, .bar-nav').show();
			
		},

		showCreateAccount: function() {

			this.$el.find('.block-home').hide();
			this.$el.find('.block-create-account, .bar-nav').show();
			
		},

		signInEmail: function() {

			console.log("sign in with email");

		},

		signUpEmail: function() {

			console.log("sign up with email");

		},

		signInFacebook: function() {

			var self = this;

			if( self.isLoading('button.sign-in-facebook') ) {
				return;
			}

			self.loading('button.sign-in-facebook');

			var fbLoginSuccess = function(userData) {

				console.log("** Login success");

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
				console.log("** Transfer to parse");
				return Parse.FacebookUtils.logIn(authData);
			
			};

			var transferSuccess = function(user) {
				console.log("** Transfer success");
				self.handleSignIn(user);

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

		handleSignIn: function(user) {
			console.log("** Handle sign in");
			console.log(user);
			var self = this;

			if( user.get("profile") ) {
				console.log('has profile');
				Parse.history.navigate('boatdays', true);

			} else {
				console.log('no profile');
				self.createUserProfile(user);
			}

		},


		createUserProfile: function(user) {

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
						profile: profile 
					}).then(userUpdated, handleErrors);
				};

				if( me.birthday ) {
					var ds = me.birthday.split('/');	
				}
				
				var profile = new ProfileModel({
					displayName: me.first_name ? me.first_name + (me.last_name ? ' '+me.last_name.slice(0,1)+'.' : '') : null,
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
