define([
'models/ProfileModel',
'views/BaseView',
'text!templates/SignUpTemplate.html'
], function(ProfileModel, BaseView, SignUpTemplate){
	var SignUpView = BaseView.extend({

		className: 'screen-sign-up',

		template: _.template(SignUpTemplate),

		checkForMissingInfo: false,

		events: {
			"click button.facebook" : "facebook", 
			"click button.sign-up"  : "signUp"
		},

		checkForMissingInfo: false,
		
		fieldFocus: function(target) {
			this.$el.find('header, footer, .header').fadeOut();
		},

		fieldBlur: function(target) {
			this.$el.find('header, footer, .header').fadeIn();
		},

		signUp: function(event) {

			Parse.Analytics.track('sign-in-sign-up');

			event.preventDefault();

			var self = this;
			var err = false;

			if( self.loading('.sign-up') ) {
				return ;
			}

			self.cleanForm();

			if(this._in('email').val() == "") {
				self.fieldError('email', "Oops, you missed one");
				err = true;
			}

			if(this._in('password').val() == "") {
				self.fieldError('password', "Oops, you missed one");
				err = true;
			}

			if( err ) {
				self.loading();
				return; 
			}

			new Parse.User().signUp({
				email: this._in('email').val(), 
				username: this._in('email').val(), 
				password: this._in('password').val(), 
				type: "guest",
			}).then(function(user) {
				self.createProfileForUser();
			}, function( error ) {
				self.loading();
				switch(error.code) {
					case 125: 
						self.fieldError('email', null);
						self._error("Please provide a valid email address.");
						break;
					case 202: 
						self.fieldError('email', null);
						self._error("This email is already taken");
						break;
					default:
						self._error("An error occured, please try again.");
						break;
				}
			});
		},

		facebook: function() {
			this.signUpSignInWithfacebook();
		},
	});
	return SignUpView;
});