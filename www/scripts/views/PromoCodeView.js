define([
'views/BaseView',
'text!templates/PromoCodeTemplate.html'
], function(BaseView, PromoCodeTemplate){
	var PromoCodeView = BaseView.extend({

		className: 'screen-promo-code',

		template: _.template(PromoCodeTemplate),

		events: {
			'click .save' : 'save'
		}, 

		initialize: function(data) {
			
			this.parentView = data.parentView;

		},

		save: function() {

			var self = this;
			var code = self._in('promo').val().toUpperCase();

			var query = new Parse.Query(Parse.Object.extend("Coupon"));
			query.equalTo('code', code);
			query.equalTo('status', 'approved');
			query.greaterThan('expiration', new Date());
			query.first().then(function(promo) {
				if( typeof promo !== typeof undefined ) {
					var queryRequests = new Parse.Query(Parse.Object.extend('SeatRequest'));
					queryRequests.equalTo('profile', Parse.User.current().get('profile'));
					queryRequests.equalTo('promoCode', promo);
					queryRequests.count().then(function(promoUsed) {
						if( promoUsed == 0) {
							self.parentView.promo = {
								obj: promo,
								perSeat: promo.get('perSeat'),
								name: promo.get('name'),
								discount: promo.get('discount')
							};
							self.parentView.updatePrice();
							self.close();
							self._info("Promo Code accepted, enjoy your bargain!");
						} else {
							self._error("Oops... you have already redeemed this coupon code.");
						}
					});
				} else {
					self._error("Oops... This promo code isn't valid.");
				}
			});
		},

	});
	return PromoCodeView;
});