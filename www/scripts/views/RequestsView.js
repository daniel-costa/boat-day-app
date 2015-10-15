define([
'Swiper',
'views/BaseView',
'text!templates/RequestsTemplate.html',
'text!templates/CardBoatDayPastTemplate.html',
'text!templates/CardBoatDayUpcomingTemplate.html',
'text!templates/CardBoatDayPendingTemplate.html',
'text!templates/CardBoatDayCancelledTemplate.html',
'text!templates/CardBoatDayFavoriteTemplate.html',
], function(Swiper, BaseView, RequestsTemplate, CardBoatDayPastTemplate, CardBoatDayUpcomingTemplate, CardBoatDayPendingTemplate, CardBoatDayCancelledTemplate, CardBoatDayFavoriteTemplate){
	var RequestsView = BaseView.extend({

		className: 'screen-requests',

		template: _.template(RequestsTemplate),

		events: {
			'click .boatdays-upcoming': 'renderUpcomingBoatDays',
			'click .boatdays-pending': 'renderPendingBoatDays',
			'click .boatdays-past': 'renderPastBoatDays',
			'click .boatdays-cancelled': 'renderCancelledBoatDays',
			'click .boatdays-favorite': 'renderFavoriteBoatDays',
			'click .content': 'debug',
		},

		requests: {},
		profiles: {},
		boatdays: {},

		debug: function() {
			alert('renew');
			new Swiper(this.$el.find('.categories .swiper-container'), {
				slidesPerView: 'auto',
				spaceBetween: 10
			});
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;


			self.$el.find('.boatdays-past').click();

			return this;

		},

		renderPastBoatDays: function() {

			var self = this;

			var innerQueryYesterday = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryYesterday.lessThan("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));

			var queryYesterday = Parse.User.current().get('profile').relation('requests').query();
			queryYesterday.matchesQuery("boatday", innerQueryYesterday);

			var innerQueryToday = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryToday.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));
			innerQueryToday.lessThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59, 599));
			innerQueryToday.lessThanOrEqualTo('arrivalTime', new Date().getHours() + ( new Date().getMinutes() > 30 ? 0.5 : 0 ));

			var queryPastToday = Parse.User.current().get('profile').relation('requests').query();
			queryPastToday.matchesQuery("boatday", innerQueryToday);

			var query = new Parse.Query.or(queryYesterday, queryPastToday);
			query.equalTo('status', 'approved');
			query.descending('date,departureTime');

			self.execQuerySeatRequests(query, CardBoatDayPastTemplate);
		},

		renderPendingBoatDays: function() {

			var self = this;

			self.$el.find('.content').html('renderPendingBoatDays');

		},

		renderCancelledBoatDays: function() {

			var self = this;

			var innerQueryCancelled = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryCancelled.equalTo('status', 'cancelled');

			var query = Parse.User.current().get('profile').relation('requests').query();
			query.matchesQuery("boatday", innerQueryCancelled);

			self.execQuerySeatRequests(query, BoatDaysCancelledCardTemplate);
		},

		renderUpcomingBoatDays: function() {
			var self = this;
			self.$el.find('.content').html('renderUpcomingBoatDays');
		},

		renderFavoriteBoatDays: function() {

			var self = this;

			self.$el.find('.content').html('renderFavoriteBoatDays');
		},

		execQuerySeatRequests: function(query, template, cbAfterCardRender) {

			var self = this;

			query.include('boatday');
			query.include('boatday.boat');
			query.include('boatday.captain');
			query.include('boatday.captain.host');
			query.include('promoCode');
			query.find().then(function(requests) {

				self.$el.find('.content').html("");

				console.log(requests);

				_.each(requests, function(request) {

					self.requests[request.id] = request;
					self.boatdays[request.get('boatday').id] = request.get('boatday');
					self.profiles[request.get('boatday').get('captain').id] = request.get('boatday').get('captain');

					self.$el.find('.content').append(_.template(template)({ self: self, model: request }));

					if( typeof cbAfterCardRender !== typeof undefined ) {
						cbAfterCardRender(request);
					}
				});

				// ToDo
				// - Add more explicit empty state
				if( requests.length == 0 ) {
					self.$el.find('.content').html('No BoatDays to display');
				}

			}, function(error) {
				console.log(error);
			});

		}

	});
	return RequestsView;
});
