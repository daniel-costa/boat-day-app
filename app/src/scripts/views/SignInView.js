define([
'models/ProfileModel',
'views/BaseView',
'text!templates/SignInTemplate.html'
], function(ProfileModel, BaseView, SignInTemplate){
	var SignInView = BaseView.extend({

		className: 'screen-sign-in',

		template: _.template(SignInTemplate),

		checkForMissingInfo: false,

		events: {
			"click button.facebook" : "facebook", 
			"click button.sign-in"  : "signIn"
		},

		checkForMissingInfo: false,
		
		fieldFocus: function(target) {
			this.$el.find('header, footer, .header').fadeOut();
		},

		fieldBlur: function(target) {
			this.$el.find('header, footer, .header').fadeIn();
		},

		signIn: function(event) {

			Parse.Analytics.track('sign-in');

			var self = this;
			var err = false;

			if( self.loading('.sign-in') ) {
				return ;
			}

			self.cleanForm();

			if(this._in('email').val() == '') {
				self.fieldError("email", null);
				err = true;
			}

			if(this._in('password').val() == '') {
				self.fieldError("password", null);
				err = true;
			}

			if( err ) {
				self.loading();
				return; 
			}

			Parse.User.logIn(this._in('email').val(), this._in('password').val()).then(function() {
				self.createProfileForUser();
			}, function(error) {
				self.loading();
				switch(error.code) {
					case 101: 
						self.fieldError("email", null);
						self.fieldError("password", null);
						self._error("Invalid email/password"); 
						break;
					default: 
						self._error("An error occured, please try later");
						break;
				}
			});
		},

		facebook: function() {
			this.signUpSignInWithfacebook();
		},
	});
	return SignInView;
});