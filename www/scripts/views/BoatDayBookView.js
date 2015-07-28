define([
'views/BaseView',
'views/ProfilePaymentsAddView',
'views/BoatDayCancellationView',
'views/TermsView',
'models/SeatRequestModel',
'text!templates/BoatDayBookTemplate.html'
], function(BaseView, ProfilePaymentsAddView, BoatDayCancellationView, TermsView, SeatRequestModel, BoatDayBookTemplate){
	var BoatDayBookView = BaseView.extend({

		className: 'screen-boatday-book',

		template: _.template(BoatDayBookTemplate),

		events: {
			'change [name="seats"]': 'updatePrice',
			'click .btn-book': 'book',
			'click .btn-payments': 'payments',
			'click .btn-terms': 'terms',
			'click .btn-cancellation': 'cancellation',
		},

		cards: {},

		payments: function() {
			this.modal(new ProfilePaymentsAddView());
		},

		cancellation: function() {
			this.modal(new BoatDayCancellationView({ model : this.model }));
		},

		terms: function() {
			this.modal(new TermsView());
		},

		updatePrice: function() {

			var self = this;
			
			var seats = this._in('seats').val();
			self.$el.find('.amount-seats').text(seats + "x");

			var contribution = self.model.get('price');
			self.$el.find('.contribution .amount').text('$' + contribution);

			var fee = self.getGuestFee(self.model.get('price'), self.getGuestRate(self.model.get('host').get('type')));
			if( fee != 0 ) {
				self.$el.find('.fee').show();
				self.$el.find('.fee .amount').text('$' + fee);
			}

			var tsf = Parse.Config.current().get("TRUST_AND_SAFETY_FEE");
			if( tsf != 0 ) {
				self.$el.find('.tsf').show();
				self.$el.find('.tsf .amount').text('$' + tsf);
			}

			var discountPerSeat = Parse.Config.current().get("PRICE_SEAT_DISCOUNT_USD");
			if( discountPerSeat != 0 ) {
				self.$el.find('.discount-per-seat').show();
				self.$el.find('.discount-per-seat .label').text(Parse.Config.current().get("PRICE_SEAT_DISCOUNT_LABEL"));
				self.$el.find('.discount-per-seat .amount').text('-$' + discountPerSeat);
			}

			var promoPerSeat = Parse.Config.current().get("TRUST_AND_SAFETY_FEE");
			if( promoPerSeat != 0 ) {
				self.$el.find('.promo-per-seat').show();
				self.$el.find('.promo-per-seat .label').text('Promo Code Per Seat');
				self.$el.find('.promo-per-seat .amount').text('-$' + promoPerSeat);
			}

			var discount  = Parse.Config.current().get("PRICE_DISCOUNT_USD");
			if( discount != 0 ) {
				self.$el.find('.discount').show();
				self.$el.find('.discount .label').text(Parse.Config.current().get("PRICE_DISCOUNT_LABEL"));
				self.$el.find('.discount .amount').text('-$' + discount);
			}

			var promo = Parse.Config.current().get("TRUST_AND_SAFETY_FEE");
			if( promo != 0 ) {
				self.$el.find('.promo').show();
				self.$el.find('.promo .label').text('Promo Code');
				self.$el.find('.promo .amount').text('-$' + promo);
			}

			var total = seats * (contribution + fee + tsf - discountPerSeat - promoPerSeat) - promo - discount;
			self.$el.find('.price-total').text(total);

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
			var self = this;
			navigator.notification.confirm(
				"You’re about to request " + self._in('seats').val() + " seat" + (self._in('seats').val() == 1 ? '' : 's') + " for $" + self.$el.find('.price-total').text() + "! Ready for #betterboating?",
				function(buttonIndex) {
					if( buttonIndex == 2 ) self.bookSave();
				},
				"Book Now!",
				["Cancel", "Continue"]
			);
		},

		bookSave: function() {

			var self = this;

			if( self.loading('.btn-book') ) {
				console.log('abort');
				return ;
			}
			self.cleanForm();

			if( !self._in('card').val() ) {
				self.fieldError('card', '');
				self._error('Please, select a credit card to book a seat. You can add a credit card in the payment section.');
			}
			
			new SeatRequestModel().save({
				user: Parse.User.current(),
				profile: Parse.User.current().get('profile'),
				seats: parseInt(self._in('seats').val()),
				card: self.cards[self._in('card').val()],
				// message: self.cards[self._in('message').val()],
				boatday: self.model,
				addToBoatDay: true,
			}).then(function(request) {
				
				Parse.User.current().get('profile').relation('requests').add(request);
				Parse.User.current().get('profile').save().then(function() {
					self._info('Seat request submitted.');
					Parse.history.navigate('boatdays-upcoming', true);
				});

			});

		}

	});
	return BoatDayBookView;
});