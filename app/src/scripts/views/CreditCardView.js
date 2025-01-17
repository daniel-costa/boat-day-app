define([
'stripe',
'views/BaseView',
'models/CreditCardModel',
'text!templates/CreditCardTemplate.html'
], function(Stripe, BaseView, CreditCardModel, CreditCardTemplate){
	var CreditCardView = BaseView.extend({

		className: 'screen-credit-card',

		template: _.template(CreditCardTemplate),

		events: {
			'keypress input': 'controlCSV',
			'click .save': 'save',
		},

		profileSetup: false,

		initialize: function() {

		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			// ToDo (check other files for it)
			// - we may not need this code. 
			// - In one of the last releases, we put this control in the render function of the BaseView
			// - Need to try & test before deleting it
			if( !this.drawer ) {
				this.$el.find('.btn-drawer').hide();
			}

			return this;
		},
		
		save: function() {

			var self = this;
			var err = false;
			var config = Parse.Config.current();

			if( self.loading('.save') ) {
				return ;
			}

			self.cleanForm();
			
			var number = this._input('number').val();
			var cvv = this._input('cvv').val();	
			var month = this._input('expiry').val().slice(-2);
			var year = this._input('expiry').val().slice(0, 4);

			Stripe.setPublishableKey(config.get('STRIPE_PUBLIC_KEY'));

			if( !Stripe.card.validateCardNumber(number) ) {
				err = true;
				self.fieldError('number', "Card number not valid");
			}

			if( !Stripe.card.validateExpiry(month, year) ) {
				err = true;
				self.fieldError('expiry', "Expiry date not valid.");
			}

			if( !Stripe.card.validateCVC(cvv) ) {
				err = true;
				self.fieldError('cvv', "CVV number not valid");
			}

			if( err ) {
				self.loading();
				return ;
			}

			var doSave = function() {

				Stripe.card.createToken({
					number: number,
					cvc: cvv,
					exp_month: month,
					exp_year: year
				}, function( status, response ) {

					if( response.error ) {

						switch(response.type)  {
							case 'invalid_number'       : self.fieldError('number', response.message); break;
							case 'invalid_expiry_month' : self.fieldError('expiry', response.message); break;
							case 'invalid_expiry_year'  : self.fieldError('expiry', response.message); break;
							case 'invalid_cvc'          : self.fieldError('cvc', response.message); break;
							case 'incorrect_number'     : self.fieldError('number', response.message); break;
							case 'expired_card'         : self.fieldError('expiry', response.message); break;
							case 'incorrect_cvc'        : self.fieldError('cvv', response.message); break;
							// case 'incorrect_zip'        : self.fieldError('', response.message); break;
							// case 'missing'              : self.fieldError('', response.message); break;
							// case 'processing_error'     : self.fieldError('', response.message); break;
							// case 'rate_limit'           : self.fieldError('', response.message); break;
							default : self._error(response.message); break; 
						}

						self.loading();
						return ;
					}


					new CreditCardModel().save({
						brand: response.card.brand,
						exp_month: response.card.exp_month,
						exp_year: response.card.exp_year,
						last4: response.card.last4,
						token: response.id,
						stripe: response
					}).then(function(card) {
						Parse.User.current().get('profile').relation('cards').add(card);
						Parse.User.current().get('profile').save().then(function() {
							if( self.isModal || self.isOverlay ) {
								self.loading();
								self.close({ render: true });
							} else {
								Parse.history.navigate("payments", true);
							}
						});
					}, function(error) {
						Parse.Analytics.track('payments-save-fail');
						self._error(error.message);
						self.loading();
					});

				});
			};

			navigator.notification.alert(
				'Hang in there while we verify and secure your information. This action may take a few minutes.',
				doSave,
				'Safety first...',
				'Got it!'
			);
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
	return CreditCardView;
});