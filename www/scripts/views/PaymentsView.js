define([
'views/BaseView',
'views/CreditCardView',
'text!templates/PaymentsTemplate.html',
'text!templates/CardCreditCardTemplate.html',
], function(BaseView, CreditCardView, PaymentsTemplate, CardCreditCardTemplate){
	var PaymentsView = BaseView.extend({

		className: 'screen-payments',

		template: _.template(PaymentsTemplate),

		events: {
			'click .add-card' : 'card'
		}, 

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			Parse.User.current().get('profile').relation('cards').query().find().then(function(cards) {

				_.each(cards, function(card) {
					
					self.$el.find('.list').append(_.template(CardCreditCardTemplate)({ model: card }));

				});

				if( cards.length == 0) {
					self.$el.find('.list').attr('no-data', 'You haven’t add a card yet.');
				} 
				
			});

			return this;
		}, 

		card: function(event) {

			event.preventDefault();
			
			this.modal(new CreditCardView());

		}

	});
	return PaymentsView;
});