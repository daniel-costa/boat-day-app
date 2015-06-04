define([
'views/BaseView',
'text!templates/ProfilePaymentsTemplate.html'
], function(BaseView, ProfilePaymentsTemplate){
	var ProfilePaymentsView = BaseView.extend({

		className: 'screen-profile-payments',

		template: _.template(ProfilePaymentsTemplate),

		events: {
			'keypress input': 'controlCSV',
			'click .btn-save': 'save',
			'submit form': 'save'
		},

		profileSetup: false,

		statusbar: true,
		
		drawer: true,


		initialize: function(data) {

			this.profileSetup = data.setup;

		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			if( this.profileSetup ) {
				
				this.$el.find('.btn-drawer').hide();

			}

			return this;
		},
		
		save: function() {

			var self = this;

			var profileUpdateSuccess = function() {

				if( self.profileSetup ) {
					
					Parse.history.navigate("boatdays", true);

				} else {

					Parse.history.navigate("profile-home", true);

				}

			};

			var profileUpdateError = function(error) {

				console.log(error);
				self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');

			};

			Parse.User.current().get("profile").save({ braintreeId: 1234567890 }).then(profileUpdateSuccess, profileUpdateError);

		},

		controlCSV: function(event) {

			var f = $(event.currentTarget);

			if(f.attr('name') == 'cardCSV') {
				
				if( f.val().length > 3 && event.keyCode != 8 ) {
					event.preventDefault();
					return false;
				}
			}

			if(f.attr('name') == 'cardNumber') {

				if( f.val().length >= 16 && event.keyCode != 8 ) {
					event.preventDefault();
					return false;
				}

			}

		}

	});
	return ProfilePaymentsView;
});