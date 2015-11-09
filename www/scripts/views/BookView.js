define([
'views/BaseView',
'views/PromoCodeView',
'views/PriceInfoView', 
'views/CreditCardView', 
'models/SeatRequestModel',
'text!templates/BookTemplate.html'
], function(BaseView, PromoCodeView, PriceInfoView, CreditCardView, SeatRequestModel, BookTemplate){
	var BookView = BaseView.extend({

		className: 'screen-book',

		template: _.template(BookTemplate),

		events: {
			'change [name="seats"]': 'updatePrice',
			'click .book': 'book',
			'click .info': 'info',
			'click .price-pay': 'info',
			'click .promo': '_promo',
			'click .payments': 'payments',
		},

		cards: {},

		promo: null,

		payments: function() {

			this.overlay(new CreditCardView({ parentView: this }));

		},
		
		_promo: function(event) {

			event.preventDefault();
			
			this.overlay(new PromoCodeView({ parentView: this }));

		},

		info: function(event) {

			event.preventDefault();

			this.overlay(new PriceInfoView({ parentView: this }));

		}, 

		calculatePrice: function() {

			var data = {
				seats           : this._in('seats').val(),
				contribution    : this.model.get('price'),
				tsf             : Parse.Config.current().get("TRUST_AND_SAFETY_FEE"),
				discountPerSeat : Parse.Config.current().get("PRICE_SEAT_DISCOUNT_USD"),
				discount        : Parse.Config.current().get("PRICE_DISCOUNT_USD"),
				promo           : this.promo && !this.promo.perSeat ? this.promo.discount : 0,
				promoPerSeat    : this.promo && this.promo.perSeat ? this.promo.discount : 0,
			};
			
			data.fee = this.getGuestFee(data.contribution, this.getGuestRate(this.model.get('captain').get('host').get('type'))),
			data.total = Math.max(0, data.seats * (data.contribution + data.fee + data.tsf - data.discountPerSeat - data.promoPerSeat) - data.promo - data.discount);

			return data;
		},

		updatePrice: function() {
		
			this.$el.find('.with-price').attr('data-price', this.calculatePrice().total);
			
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			self._in('seats').change();

			Parse.User.current().get('profile').relation('cards').query().find().then(function(cards) {
				
				self.cards = {};

				if( cards.length == 0 ) {
					self.$el.find('.field-card').html('<p class="align-center">You don\'t have a credit card attach to your account. <a class="payments">Add Credit Card</a></p>')
					self.$el.find('.book').hide();
					return;
				}

				self._in('card').html('');

				_.each(cards, function(card) {
					self.cards[card.id] = card;
					self._in('card').append($('<option>').attr('value', card.id).text('•••• •••• •••• '+card.get('last4')));
				});

			});

			this.model.relation('boatdayPictures').query().first().then(function(fh) {
				self.$el.find('.boatday-picture').css({ backgroundImage: 'url(' + fh.get('file').url() + ')' });
			});

			var slidersConfig = { 
				tooltip: 'hide'
			};

			var departureTimeSlideEvent = function(slideEvt) {
				var maxDuration = Math.min(12, 24 - slideEvt.value);
				var duration = self._in('duration').slider('getValue');
				self._in('duration').slider({max: maxDuration}).slider('setValue', duration > maxDuration ? maxDuration : duration, true, false);
				self.$el.find('.preview-departureTime').text(slideEvt.value);
			};

			// this._in('departureTime').slider(slidersConfig).on("slide", departureTimeSlideEvent);

			self.updatePrice();

			return this;
		},

		book: function() {

			Parse.Analytics.track('book-click-confirmation');

			var self = this;
			navigator.notification.confirm(
				"You’re about to request " + self.calculatePrice().seats + " seat" + ( self.calculatePrice().seats == 1 ? '' : 's') + " for $" + self.calculatePrice().total + ", ready for #betterboating?",
				function(buttonIndex) {
					if( buttonIndex == 2 ) {
						self.bookSave();
					}
				},
				"Book Now!",
				["Cancel", "Confirm"]
			);
		},

		bookSave: function() {

			var self = this;

			if( self.loading('.book') ) {
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
				boatday: self.model,
				addToBoatDay: true,
			}).then(function(request) {
				
				Parse.User.current().get('profile').relation('requests').add(request);
				Parse.User.current().get('profile').save().then(function() {
					self.loading();
					self._info('Seat Request Submitted');

					if( self.model.get('bookingPolicy') == 'manually' ) {
						Parse.history.navigate('requests?subView=pending', true);
					} else {
						Parse.history.navigate('requests?subView=upcoming', true);
					}
				});

			}, function(error) {
				console.log(error);
				self.loading();
				Parse.Analytics.track('book-save-fail');
			});

		}

	});
	return BookView;
});