define([
'views/BaseView',
'views/PromoCodeView',
'views/PriceInfoView', 
'models/SeatRequestModel',
'text!templates/BookTemplate.html'
], function(BaseView, PromoCodeView, PriceInfoView, SeatRequestModel, BookTemplate){
	var BookView = BaseView.extend({

		className: 'screen-book',

		template: _.template(BookTemplate),

		events: {
			'change [name="seats"]': 'updatePrice',
			'click .book': 'book',
			'click .info': 'info',
			'click .promo': '_promo'
		},

		cards: {},

		promo: null,

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
				promo           : this.promo &&  this.promo.perSeat ? this.promo.discount : 0,
				promoPerSeat    : this.promo && !this.promo.perSeat ? this.promo.discount : 0,
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
					self.$el.find('.field-card').html('<p class="align-center">You don\'t have a credit card attach to your account.</p><a class="btn-default btn-payments">Add Credit Card</a>')
					self.$el.find('.submit-request').hide();
					return;
				}

				self._in('card').html('');

				_.each(cards, function(card) {
					self.cards[card.id] = card;
					self._in('card').append($('<option>').attr('value', card.id).text('•••• •••• •••• '+card.get('last4')));
				});

			});

			this.model.get('boat').relation('boatPictures').query().first().then(function(fh) {
				self.$el.find('.boatday-picture').css({ backgroundImage: 'url(' + fh.get('file').url() + ')' });
			});

			self.updatePrice();

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
					self._info('Seat request submitted.');
					Parse.history.navigate('requests', true);
				});

			}, function(error) {
				console.log(error);
				Parse.Analytics.track('book-save-fail');
			});

		}

	});
	return BookView;
});