define([
'views/BaseView',
'views/AdjustPriceView',
'text!templates/PayTemplate.html',
], function(BaseView, AdjustPriceView, PayTemplate){
	var PayView = BaseView.extend({

		className: 'screen-pay',

		template: _.template(PayTemplate),

		events: {
			'click .pay': 'pay',
			'click .rating': 'rate',
			'click .tip': 'tip',
			'click .change-price': 'adjust',
			'blur [name="review"]': 'censorField',
		},

		rating: null,
		price: null,
		priceBase: null,

		initialize: function(data) {

			var guestRate = this.getGuestRate(this.model.get('boatday').get('captain').get('host').get('type'))
			this.guestPart = this.getGuestFee(this.model.get('boatday').get('price'), guestRate);
			var tsf = Parse.Config.current().get("TRUST_AND_SAFETY_FEE");
			var promoPerSeat = this.model.get('promoCode') && this.model.get('promoCode').get('perSeat') ? this.model.get('promoCode').get('discount') : 0;
			var discountPerSeat = this.model.get('bdDiscountPerSeat') ? this.model.get('bdDiscountPerSeat') : 0;
			var promo = this.model.get('promoCode') && !this.model.get('promoCode').get('perSeat') ? this.model.get('promoCode').get('discount') : 0;
			var discount = this.model.get('bdDiscount') ? this.model.get('bdDiscount') : 0;
			this.price = (this.model.get('boatday').get('price') + this.guestPart + tsf - discountPerSeat - promoPerSeat) * this.model.get('seats') - promo - discount;
			this.priceBase = this.price;

		},

		render: function() {
			
			BaseView.prototype.render.call(this);

			var self = this;

			this.model.get('boatday').get('boat').relation('boatPictures').query().first().then(function(fh) {
				self.$el.find('.boatday-picture').css({ backgroundImage: 'url(' + fh.get('file').url() +')' });
			});

			return this;

		},

		tip: function(event) {

			Parse.Analytics.track('pay-click-tip');

			this.$el.find('.bullet.active').removeClass('active');
			$(event.currentTarget).addClass('active');

			var e = $(event.currentTarget);
			var percent = e.attr('percent');

			this.changePrice(Math.ceil(this.priceBase + this.priceBase * percent));
			this.$el.find('.with-price').attr('data-price', this.price);
		},

		adjust: function(event) {

			Parse.Analytics.track('pay-click-adjust');

			this.$el.find('.bullet.active').removeClass('active');
			$(event.currentTarget).addClass('active');

			this.overlay(new AdjustPriceView({ model: this.model, parentView: this }));

		},

		changePrice: function(price) {
			
			var min = this.model.get('boatday').get('captain').get('host').get('type') == 'business'
				? this.priceBase
				: this.model.get('seats') * Parse.Config.current().get("TRUST_AND_SAFETY_FEE");

			this.price = Math.max(price, min);

			this.$el.find('.with-price').attr('data-price', this.price);

		},

		pay: function(event) {

			var self = this;
			var review = this._in('review').val();

			if( self.loading('.btn-pay') ) {
				return ;
			}

			self.cleanForm();

			if( !this.rating ) {
				self._error('Oops... You forgot to rate the BoatDay.');
				self.loading();
				return;
			}

			if( !self.model.get('contribution') ) {

				if( self.price < self.priceBase && review == '') {
					self.fieldError('review', '');
					self._error('Oops... You lower the expected contribution, please leave a review to explain why.');
					self.loading();
					return;
				}

				self.model.set('contribution', self.price);
			}

			self.model.save({
				ratingGuest: parseInt(self.rating),
				reviewGuest: review,
			}).then(function() {
				var profile = self.model.get('boatday').get('captain');
				var rating = typeof profile.get('rating') != typeof undefined && profile.get('rating') ? profile.get('rating') : 0;
				var ratingAmount = profile.get('ratingAmount');

				self.model.get('boatday').get('captain').save({
					rating : ( rating * ratingAmount  + parseInt(self.rating) ) / (ratingAmount + 1),
					ratingAmount: ratingAmount + 1
				}).then(function() {
					self.loading();
					console.log('change');
					Parse.history.navigate('requests?subView=past', true);
				}, function(error) {
					console.log(error);
				});
			}, function(error) {
				self.loading();
				console.log(error)
			});

		},

		rate: function(event) {
			
			var e = $(event.currentTarget);
			this.rating = e.attr('data-rating');
			this.$el.find('.rating').removeClass('active');
			e.addClass('active');
			e.prevAll().addClass('active');
			
		},
		
	});
	return PayView;
});