define([
'views/BaseView',
'text!templates/PriceInfoTemplate.html'
], function(BaseView, PriceInfoTemplate){
	var PriceInfoView = BaseView.extend({

		className: 'screen-price-info',

		template: _.template(PriceInfoTemplate),

		pricing: {},

		initialize: function(data) {

			this.parentView = data.parentView;
			this.pricing = this.parentView.calculatePrice();

		},

		render: function() {
			BaseView.prototype.render.call(this);

			this.$el.find('.seats').text(this.pricing.seats + " X");
			this.$el.find('.contribution .amount').text('$' + this.pricing.contribution);
			this.$el.find('.fee .amount').text('$' + this.pricing.fee);
			this.$el.find('.tsf .amount').text('$' + this.pricing.tsf);

			if( this.pricing.discountPerSeat != 0 ) {
				this.$el.find('.discount-per-seat label').text(Parse.Config.current().get("PRICE_SEAT_DISCOUNT_LABEL"));
				this.$el.find('.discount-per-seat .amount').text('-$' + this.pricing.discountPerSeat);
			} else {
				this.$el.find('.discount-per-seat').hide();
			}

			if( this.pricing.discount != 0 ) {
				this.$el.find('.discount label').text(Parse.Config.current().get("PRICE_DISCOUNT_LABEL"));
				this.$el.find('.discount .amount').text('-$' + this.pricing.discount);
			} else {
				this.$el.find('.discount').hide();
			}

			this.$el.find( this.parentView.promo && this.parentView.promo.perSeat ? '.promo' : '.promo-per-seat').hide();

			if( this.parentView.promo ) {
				var promoClass = this.parentView.promo.perSeat ?  '.promo-per-seat' : '.promo';
				this.$el.find(promoClass).show();
				this.$el.find(promoClass + ' label').text(this.parentView.promo.name);
				this.$el.find(promoClass + ' .amount').text('-$' + this.parentView.promo.discount);
			}

			return this;
		}

	});
	return PriceInfoView;
});