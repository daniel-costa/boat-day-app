define([
'views/BaseView',
'text!templates/AdjustPriceTemplate.html'
], function(BaseView, AdjustPriceTemplate){
	var AdjustPriceView = BaseView.extend({

		className: 'screen-adjust-price',

		template: _.template(AdjustPriceTemplate),

		events: {
			'click .plus': 'increasePrice',
			'click .minus': 'decreasePrice',
		},

		parentView: null,

		initialize: function(data) {
			this.parentView = data.parentView;
		},

		render: function() {
			
			BaseView.prototype.render.call(this);

			var self = this;

			this.model.get('boatday').relation('boatdayPictures').query().first().then(function(fh) {
				console.log(fh);
				self.$el.find('.boatday-picture').css({ backgroundImage: 'url(' + fh.get('file').url() +')' });
			}, function(error) {
				console.log(error);
			});

			return this;

		},

		changePrice: function(price) {

			this.parentView.changePrice(price);
			this.$el.find('.with-price').attr('data-price', this.parentView.price);

		},

		decreasePrice: function() {
			
			this.changePrice(this.parentView.price -1);

		},

		increasePrice: function() {
			
			this.changePrice(this.parentView.price + 1);

		},

	});
	return AdjustPriceView;
});