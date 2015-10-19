define([
'Swiper',
'views/BaseView',
'views/SignUpView',
'views/SignInView',
'text!templates/GuestTemplate.html', 
'text!templates/CardBoatDayGuestTemplate.html'
], function(Swiper, BaseView, SignUpView, SignInView, GuestTemplate, CardBoatDayGuestTemplate){
	var GuestView = BaseView.extend({

		className: 'screen-guest',

		template: _.template(GuestTemplate),

		events: {
			"click button.sign-up" : "signUp",
			"click button.sign-in" : "signIn",
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			var query = new Parse.Query(Parse.Object.extend('BoatDay'));
			query.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));
			query.ascending('date, departureTime');
			query.limit(5);
			query.find().then(function(boatdays) {

				self.$el.find('.list').html('');

				_.each(boatdays, function(boatday) {

					self.$el.find('.list').append(_.template(CardBoatDayGuestTemplate)({ model: boatday }));

					var queryBoatPicture = boatday.get('boat').relation('boatPictures').query();
					queryBoatPicture.ascending('order');
					queryBoatPicture.first().then(function (fileholder) {
						if( fileholder ) {
							self.$el.find('.boatday-card[data-id="'+boatday.id+'"] .picture').css({ backgroundImage: 'url(' + fileholder.get('file').url() + ')'});
						}
					});

				});

				var swiperBoatDays = new Swiper(self.$el.find('.swiper-container'), {
					pagination: self.$el.find('.swiper-pagination'),
					paginationClickable: true,
				});
			});




			return this;
		},

		signUp: function(event) {
			
			event.preventDefault();

			this.modal(new SignUpView(), 'left');

		},

		signIn: function(event) {
			
			event.preventDefault();

			this.modal(new SignInView(), 'left');

		}
	});
	return GuestView;
});