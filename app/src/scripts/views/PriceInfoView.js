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

			this.$el.find('.seats').text("for " + this.pricing.seats + " seat" + (this.pricing.seats == 1 ? '' : 's') );
			this.$el.find('.contribution .amount').text('$' + this.pricing.contribution * this.pricing.seats);
			this.$el.find('.fee .amount').text('$' + this.pricing.fee * this.pricing.seats);
			this.$el.find('.tsf .amount').text('$' + this.pricing.tsf * this.pricing.seats);

			if( this.pricing.discountPerSeat != 0 ) {
				this.$el.find('.discount-per-seat label').text(Parse.Config.current().get("PRICE_SEAT_DISCOUNT_LABEL"));
				this.$el.find('.discount-per-seat .amount').text('-$' + this.pricing.discountPerSeat * this.pricing.seats);
			} else {
				this.$el.find('.discount-per-seat').hide();
			}

			if( this.pricing.discount != 0 ) {
				this.$el.find('.discount label').text(Parse.Config.current().get("PRICE_DISCOUNT_LABEL"));
				this.$el.find('.discount .amount').text('-$' + this.pricing.discount);
			} else {
				this.$el.find('.discount').hide();
			}

			if( this.parentView.promo ) {
				this.$el.find( this.parentView.promo.perSeat ? '.promo' : '.promo-per-seat').hide();
				var promoClass = this.parentView.promo.perSeat ?  '.promo-per-seat' : '.promo';
				var multiplier = this.parentView.promo.perSeat ?  this.pricing.seats : 1;
				this.$el.find(promoClass + ' label').text(this.parentView.promo.name);
				this.$el.find(promoClass + ' .amount').text('-$' + this.parentView.promo.discount * multiplier);
			} else {
				this.$el.find('.promo, .promo-per-seat').hide();
			}

			return this;
		}

	});
	return PriceInfoView;
});