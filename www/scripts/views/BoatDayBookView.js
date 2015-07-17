define([
'views/BaseView',
'views/ProfilePaymentsAddView',
'views/BoatDayCancellationView',
'views/TermsView',
'models/SeatRequestModel',
'text!templates/BoatDayBookTemplate.html'
], function(BaseView, ProfilePaymentsAddView, BoatDayCancellationView, TermsView, SeatRequestModel, BoatDayBookTemplate){
	var BoatDayBookView = BaseView.extend({

		className: 'screen-boatday-book modal',

		template: _.template(BoatDayBookTemplate),

		events: {
			'change [name="seats"]': 'updatePrice',
			'click .btn-book': 'book',
			'click .btn-payments': 'payments',
			'click .btn-terms': 'terms'
		},

		statusbar: true,
		
		drawer: false,

		cards: {},

		payments: function() {
			Parse.history.navigate("profile-payments", true);
		},

		cancellation: function() {
			this.modal(new BoatDayCancellationView({ model : this.model }));
		},

		terms: function() {
			this.modal(new TermsView());
		},

		updatePrice: function() {

			var self  = this;
			var seats = this._in('seats').val();
			var price = self.model.get('price');
			var guestPart = self.getGuestRate(self.model.get('captain').get('host').get('type'));
			var bdfee = self.getGuestFee(self.model.get('price'), guestPart)
			var fee   = Parse.Config.current().get("TRUST_AND_SAFETY_FEE");

			self.$el.find('.amount-seats').text(seats + "x");
			self.$el.find('.price').text(price);
			self.$el.find('.bdfee').text(bdfee);
			self.$el.find('.fee').text(fee);
			self.$el.find('.price-total').text(seats * (price + fee + bdfee));
			
			self.$el.find('.bdfee-label').text( bdfee < 0 ? 'BoatDay Discount' : 'BoatDay Fee');
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			self._in('seats').change();

			Parse.User.current().get('profile').relation('cards').query().find().then(function(cards) {
				
				self.cards = {};

				if( cards.length == 0 ) {
					self.$el.find('.field-card').html('<p class="align-center">You don\'t have a credit card attach to your account. You can add a credit card from the <a href="#/profile-payments-add">Payment Information</a> section.</p>')
					self.$el.find('.btn-action').hide();
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
					self._info('Seat request submited.');	
					Parse.history.navigate('boatdays-upcoming', true);
				});

			});

		}

	});
	return BoatDayBookView;
});