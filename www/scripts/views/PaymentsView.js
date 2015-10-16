define([
'views/BaseView',
'views/CreditCardView',
'text!templates/PaymentsTemplate.html'
], function(BaseView, CreditCardView, PaymentsTemplate){
	var PaymentsView = BaseView.extend({

		className: 'screen-payments',

		template: _.template(PaymentsTemplate),

		events: {
			'click .add-card' : 'addCreditCard'
		}, 

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			Parse.User.current().get('profile').relation('cards').query().find().then(function(cards) {
				
				self.$el.find('.loading').remove();
				
				// if( cards.length == 0) {
				// 	// self.$el.find('.main-content').html('<img src="resources/logo-colors.png" class="logo-placeholder" /><p class="text-center">Skip for now and start <a href="#/boatdays">browsing BoatDays</a></p>');
				// 	self.$el.find('.header').html('<p class="text-center">You haven’t add a card yet.</p>');
				// } else {
				// 	self.$el.find('.cards-list').show();
				// }

				if( cards.length == 0) {
					// self.$el.find('.main-content').html('<img src="resources/logo-colors.png" class="logo-placeholder" /><p class="text-center">Skip for now and start <a href="#/boatdays">browsing BoatDays</a></p>');
					//self.$el.find('.list').html('<p class="text-center">You haven’t add a card yet.</p>');
					self.$el.find('.list').attr('no-data', 'You haven’t add a card yet.');
				} 
				_.each(cards, function(card) {
					switch( card.get('brand') ) {
						case "American Express" : var _cardName = "american-express"; break;
						case "Visa" : var _cardName = "visa"; break;
						case "MasterCard" : var _cardName = "mastercard"; break;
						default: var _cardName = "default"; break;
					}
					// self.$el.find('.cards-list .table-view').append('<li class="table-view-cell"><img src="resources/cards/'+_cardName+'.png" /> <strong>* * * *   * * * *   * * * *</strong> '+card.get('last4')+'</li>');
					self.$el.find('.list').append('<ul style="list-style-type: none;"><li><img src="resources/cards/'+_cardName+'.png" /> <strong>* * * *   * * * *   * * * *</strong> '+card.get('last4')+'</li></ul>');

				});

			});

			return this;
		}, 

		addCreditCard: function(event) {

			event.preventDefault();
			//To do this a overlay.
			this.modal(new CreditCardView(), 'left');
		}

	});
	return PaymentsView;
});