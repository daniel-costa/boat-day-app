define([
'views/BaseView',
'views/ProfilePaymentsAddView',
'views/CancellationView',
'views/TermsView',
'views/WaterPolicyView',
'models/SeatRequestModel',
'text!templates/BookTemplate.html'
], function(BaseView, ProfilePaymentsAddView, CancellationView, TermsView, WaterPolicyView, SeatRequestModel, BookTemplate){
	var BoatDayBookView = BaseView.extend({

		className: 'screen-boatday-book',

		template: _.template(BookTemplate),

		events: {
			'change [name="seats"]': 'updatePrice',
			'click .btn-book': 'book',
			'click .btn-payments': 'payments',
			'click .btn-terms': 'terms',
			'click .btn-cancellation': 'cancellation',
			'click .btn-water': 'water',
			'click .btn-promo': 'getPromo',
			'click .add-promo': 'showPromo',
		},

		cards: {},

		promo: null,

		showPromo: function() {

			Parse.Analytics.track('book-show-promo');

			var self = this;
			self.showOverlay({
				target: self.$el.find('.overlay'),
				closeBtn: true,
				cbClose: function(overlay) {
					overlay.find('input').val('');
				}
			});
		},

		payments: function() {

			Parse.Analytics.track('book-click-payments');

			this.modal(new ProfilePaymentsAddView());
		},

		cancellation: function() {
			
			Parse.Analytics.track('book-click-cancellation');
			
			this.modal(new CancellationView({ model : this.model }));
		},

		terms: function() {
			
			Parse.Analytics.track('book-click-terms');
			
			this.modal(new TermsView());
		},

		water: function() {
			
			Parse.Analytics.track('book-click-water-policy');
			
			this.modal(new WaterPolicyView());
		},

		getPromo: function() {

			var self = this;
			var code = self._in('promo').val();

			var query = new Parse.Query(Parse.Object.extend("Coupon"));
			query.equalTo('code', code.toUpperCase());
			query.equalTo('status', 'approved');
			query.greaterThan('expiration', new Date());
			query.first().then(function(promo) {

				if( typeof promo !== typeof undefined ) {

					var queryRequests = new Parse.Query(Parse.Object.extend('SeatRequest'));
					queryRequests.equalTo('profile', Parse.User.current().get('profile'));
					queryRequests.equalTo('promoCode', promo);
					queryRequests.count().then(function(promoUsed) {

						if( promoUsed == 0) {
							self.promo = {
								obj: promo,
								perSeat: promo.get('perSeat'),
								name: promo.get('name'),
								discount: promo.get('discount')
							};

							self.updatePrice();
							self.hideOverlay(self.$el.find('.overlay'));
							self.$el.find('.add-promo').hide();
						} else {
							self._error("Oops... you have already redeemed this coupon code.");
						}

					});
				} else {
					self._error("Oops... This promo code isn't valid.");
				}

			});

		},

		updatePrice: function() {

			var self = this;
			
			var seats = this._in('seats').val();
			self.$el.find('.amount-seats').text(seats + "x");

			var contribution = self.model.get('price');
			self.$el.find('.contribution .amount').text('$' + contribution);

			var fee = self.getGuestFee(contribution, self.getGuestRate(self.model.get('captain').get('host').get('type')));
			if( fee != 0 ) {
				self.$el.find('.fee').show();
				self.$el.find('.fee .amount').text('$' + fee);
			} else {
				self.$el.find('.fee').show();
			}

			var tsf = Parse.Config.current().get("TRUST_AND_SAFETY_FEE");
			if( tsf != 0 ) {
				self.$el.find('.tsf').show();
				self.$el.find('.tsf .amount').text('$' + tsf);
			} else {
				self.$el.find('.tsf').hide();
			}

			var discountPerSeat = Parse.Config.current().get("PRICE_SEAT_DISCOUNT_USD");
			if( discountPerSeat != 0 ) {
				self.$el.find('.discount-per-seat').show();
				self.$el.find('.discount-per-seat .label').text(Parse.Config.current().get("PRICE_SEAT_DISCOUNT_LABEL"));
				self.$el.find('.discount-per-seat .amount').text('-$' + discountPerSeat);
			} else {
				self.$el.find('.discount-per-seat').hide();
			}

			var discount = Parse.Config.current().get("PRICE_DISCOUNT_USD");
			if( discount != 0 ) {
				self.$el.find('.discount').show();
				self.$el.find('.discount .label').text(Parse.Config.current().get("PRICE_DISCOUNT_LABEL"));
				self.$el.find('.discount .amount').text('-$' + discount);
			} else {
				self.$el.find('.discount').hide();
			}

			
			var promo = 0;
			var promoPerSeat = 0;
			
			self.$el.find('.promo, .promo-per-seat').hide();

			if( self.promo ) {
				if( self.promo.perSeat ) {
					promoPerSeat = self.promo.discount;
					var promoClass = '.promo-per-seat';
				} else {
					promo = self.promo.discount;
					var promoClass = '.promo';
				}
				self.$el.find(promoClass).show();
				self.$el.find(promoClass+' .label').text(self.promo.name);
				self.$el.find(promoClass+' .amount').text('-$' + self.promo.discount);
			}

			var total = seats * (contribution + fee + tsf - discountPerSeat - promoPerSeat) - promo - discount;
			self.$el.find('.price-total').text('$'+total);
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			self._in('seats').change();

			Parse.User.current().get('profile').relation('cards').query().find().then(function(cards) {
				
				self.cards = {};

				if( cards.length == 0 ) {
					self.$el.find('.field-card').html('<p class="align-center">You don\'t have a credit card attach to your account.</p><a class="btn btn-block btn-default btn-payments">Add Credit Card</a>')
					self.$el.find('.submit-request').hide();
					return;
				}

				self._in('card').html('');

				_.each(cards, function(card) {
					self.cards[card.id] = card;
					var text = card.get('brand') + ' ...' + card.get('last4');
					var option = $('<option>').attr('value', card.id).text(text);
					self._in('card').append(option);
				});

			});

			return this;

		},

		book: function() {

			Parse.Analytics.track('book-click-confirmation');

			var self = this;
			navigator.notification.confirm(
				"You’re about to request " + self._in('seats').val() + " seat" + (self._in('seats').val() == 1 ? '' : 's') + " for " + self.$el.find('.price-total').text() + "! Ready for #BetterBoating?",
				function(buttonIndex) {

					// Parse.Analytics.track('book-confirmation', { });

					if( buttonIndex == 2 ) {
						self.bookSave();
					}
					
				},
				"Book Now!",
				["Cancel", "Continue"]
			);
		},

		bookSave: function() {

			var self = this;

			if( self.loading('.btn-book') ) {
				return ;
			}

			self.cleanForm();

			if( !self._in('card').val() ) {
				self.fieldError('card', '');
				self._error('Please, select a credit card to book a seat. You can add a credit card in the payment section.');
				self.loading();
				return;
			}
			
			new SeatRequestModel().save({
				user: Parse.User.current(),
				profile: Parse.User.current().get('profile'),
				seats: parseInt(self._in('seats').val()),
				card: self.cards[self._in('card').val()],
				promoCode: self.promo ? self.promo.obj : null,
				bdDiscount: Parse.Config.current().get("PRICE_DISCOUNT_USD"),
				bdDiscountLabel: Parse.Config.current().get("PRICE_DISCOUNT_LABEL"),
				bdDiscountPerSeat: Parse.Config.current().get("PRICE_SEAT_DISCOUNT_USD"),
				bdDiscountPerSeatLabel: Parse.Config.current().get("PRICE_SEAT_DISCOUNT_LABEL"),
				// message: self.cards[self._in('message').val()],
				boatday: self.model,
				addToBoatDay: true,
			}).then(function(request) {
				
				Parse.User.current().get('profile').relation('requests').add(request);
				Parse.User.current().get('profile').save().then(function() {
					self._info('Seat request submitted.');
					Parse.history.navigate('boatdays-upcoming', true);
				});

			}, function(error) {
				console.log(error);
				Parse.Analytics.track('book-save-fail');
			});

		}

	});
	return BoatDayBookView;
});