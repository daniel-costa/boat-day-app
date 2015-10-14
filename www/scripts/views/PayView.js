define([
'views/BaseView',
'text!templates/PayTemplate.html',
], function(BaseView, PayTemplate){
	var PayView = BaseView.extend({

		className: 'screen-boatday-pay',

		template: _.template(PayTemplate),

		events: {
			'click .btn-pay': 'pay',
			'click .stars .rating': 'rate',
			
			'click .btn-tip': 'tip',

			'click .btn-minus': 'decreasePrice',
			'click .btn-plus': 'increasePrice',

			'click .btn-adjust': 'showAdjust',
			'click .btn-details': 'showDetails',

			'blur [name="review"]': 'censorField',
		},

		rating: null,
		price: null,
		priceBase: null,

		mediaPlus: null,
		mediaMinus: null,

		tip: function(event) {

			Parse.Analytics.track('pay-click-tip');

			var e = $(event.currentTarget);
			var percent = e.attr('percent');

			if( percent == 0 ) {
				this.mediaMinus.play();
				this.$el.find('.btn-adjust').show();
			} else {
				this.mediaPlus.play();
				this.$el.find('.btn-adjust, .adjust-price').hide();
			}

			this.changePrice(Math.ceil(this.priceBase + this.priceBase * percent));
		},

		showAdjust: function() {

			Parse.Analytics.track('pay-click-adjust');

			if( this.$el.find('.adjust-price').is(':visible') ) {
				this.$el.find('.adjust-price').hide();
				this.$el.find('.btn-adjust .icon').removeClass('icon-up-nav');
				this.$el.find('.btn-adjust .icon').addClass('icon-down-nav');
			} else {
				this.$el.find('.adjust-price').show();
				this.$el.find('.btn-adjust .icon').removeClass('icon-down-nav');
				this.$el.find('.btn-adjust .icon').addClass('icon-up-nav');
			}
		},

		showDetails: function() {

			Parse.Analytics.track('pay-click-details');

			if( this.$el.find('.details').is(':visible') ) {
				this.$el.find('.details').hide();
				this.$el.find('.btn-details .icon').removeClass('icon-up-nav');
				this.$el.find('.btn-details .icon').addClass('icon-down-nav');
			} else {
				this.$el.find('.details').show();
				this.$el.find('.btn-details .icon').removeClass('icon-down-nav');
				this.$el.find('.btn-details .icon').addClass('icon-up-nav');
			}
		},

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
			this.mediaMinus = new Media("resources/sfx/minus-button.wav");
			this.mediaPlus = new Media("resources/sfx/plus-button.wav");

		},

		decreasePrice: function() {
			this.mediaMinus.play();
			this.changePrice(this.price -1);
		},

		increasePrice: function() {
			this.mediaPlus.play();
			this.changePrice(this.price + 1);
		},

		changePrice: function(price) {
			
			var min = this.model.get('boatday').get('captain').get('host').get('type') == 'business'
				? this.priceBase
				: this.model.get('seats') * Parse.Config.current().get("TRUST_AND_SAFETY_FEE");

			this.price = Math.max(price, min);
			this.$el.find('.total-to-pay').text(this.price);
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
					Parse.history.loadUrl(Parse.history.fragment);
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
			this.$el.find('.stars .rating').attr('src', 'resources/star.png');
			e.attr('src', 'resources/star-full.png');
			e.prevAll().attr('src', 'resources/star-full.png');
			this.rating = e.attr('data-rating');
		},
		
	});
	return PayView;
});