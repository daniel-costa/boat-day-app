define([
'views/BaseView',
'text!templates/PaymentsTemplate.html'
], function(BaseView, PaymentsTemplate){
	var PaymentsView = BaseView.extend({

		className: 'screen-payments',

		template: _.template(PaymentsTemplate),

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			Parse.User.current().get('profile').relation('cards').query().find().then(function(cards) {
				
				self.$el.find('.loading').remove();
				
				if( cards.length == 0) {
					self.$el.find('.main-content').html('<img src="resources/logo-colors.png" class="logo-placeholder" /><p class="text-center">Skip for now and start <a href="#/boatdays">browsing BoatDays</a></p>');
				} else {
					self.$el.find('.cards-list').show();
				}

				_.each(cards, function(card) {
					switch( card.get('brand') ) {
						case "American Express" : var _cardName = "american-express"; break;
						case "Visa" : var _cardName = "visa"; break;
						case "MasterCard" : var _cardName = "mastercard"; break;
						default: var _cardName = "default"; break;
					}
					self.$el.find('.cards-list .table-view').append('<li class="table-view-cell"><img src="resources/cards/'+_cardName+'.png" /> <strong>* * * *   * * * *   * * * *</strong> '+card.get('last4')+'</li>');
				});

			});

			return this;
		}

	});
	return PaymentsView;
});