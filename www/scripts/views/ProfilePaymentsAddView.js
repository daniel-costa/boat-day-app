define([
'views/BaseView',
'models/CreditCardModel',
'text!templates/ProfilePaymentsAddTemplate.html'
], function(BaseView, CreditCardModel, ProfilePaymentsAddTemplate){
	var ProfilePaymentsView = BaseView.extend({

		className: 'screen-profile-payments-add',

		template: _.template(ProfilePaymentsAddTemplate),

		events: {
			'keypress input': 'controlCSV',
			'click .save': 'save'
		},

		profileSetup: false,

		statusbar: true,
		
		drawer: true,

		initialize: function(data) {

			this.profileSetup = data ? data.setup : false;
			this.drawer = !this.profileSetup;

		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			if( !this.drawer ) {
				this.$el.find('.btn-drawer').hide();
			}

			return this;
		},
		
		save: function() {

			var self = this;

			this.cleanForm();

			var data = {
				holder: this._input('holder').val(),
				number: this._input('number').val(),
				expiry: this._input('expiry').val(),
				cvv: this._input('cvv').val(),
				profile: Parse.User.current().get('profile'),
				paymentId: null
			};

			var success = function(card) {
				Parse.User.current().get('profile').relation('cards').add(card);
				Parse.User.current().get('profile').save().then(function() {
					Parse.history.navigate("profile-payments", true);
				}, error);
			};

			var error = function(error) {

				if( error.type && error.type == 'model-validation' ) {
					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});
					self._error('One or more fields contain errors.');
				} else {
					self._error(error);
				}

			};

			new CreditCardModel().save(data).then(success, error);

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