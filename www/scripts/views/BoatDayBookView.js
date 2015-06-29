define([
'views/BaseView',
'views/ProfilePaymentsAddView',
'models/SeatRequestModel',
'text!templates/BoatDayBookTemplate.html'
], function(BaseView, ProfilePaymentsAddView, SeatRequestModel, BoatDayBookTemplate){
	var BoatDayBookView = BaseView.extend({

		className: 'screen-boatday-book modal',

		template: _.template(BoatDayBookTemplate),

		events: {
			'change [name="seats"]': 'updatePrice',
			'click .btn-book': 'book',
			'click .btn-payments': 'payments'
		},

		statusbar: true,
		
		drawer: false,

		cards: {},

		payments: function() {
			
			// this.modal(new ProfilePaymentsAddView({ model : this.model, modal: true }));
			Parse.history.navigate('profile-payments', true);

		},

		updatePrice: function() {

			var self = this;
			var seats = this._in('seats').val();
			var fee = Parse.Config.current().get("TRUST_AND_SAFETY_FEE");
			var price = self.getGuestPrice(self.model.get('price'));

			self.$el.find('.price').text(seats + " x $" + price);
			self.$el.find('.fee').text(seats + " x $" + fee);
			self.$el.find('.price-total').text(seats * (price + fee));

		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			self._in('seats').change();

			Parse.User.current().get('profile').relation('cards').query().find().then(function(cards) {
				
				self.cards = {};

				self._in('card').html('');

				_.each(cards, function(card) {
					self.cards[card.id] = card;
					var text = card.get('brand') + ' **** **** **** ' + card.get('last4');
					var option = $('<option>').attr('value', card.id).text(text);
					self._in('card').html(option);
				});

			});

			return this;

		},

		book: function() {

			var self = this;

			self.cleanForm();
			self.loading('Saving');

			// Check if card not empty

			new SeatRequestModel().save({
				user: Parse.User.current(),
				profile: Parse.User.current().get('profile'),
				seats: parseInt(self._in('seats').val()),
				card: self.cards[self._in('card').val()],
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