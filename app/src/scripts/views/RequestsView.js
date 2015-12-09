define([
'Swiper',
'views/BaseView',
'views/ProfileView',
'views/PayView',
'views/ChatView',
'views/BoatDayView',
'text!templates/RequestsTemplate.html',
'text!templates/CardBoatDayPastTemplate.html',
'text!templates/CardBoatDayUpcomingTemplate.html',
'text!templates/CardBoatDayPendingTemplate.html',
'text!templates/CardBoatDayCancelledTemplate.html',
], function(Swiper, BaseView, ProfileView, PayView, ChatView, BoatDayView, RequestsTemplate, CardBoatDayPastTemplate, CardBoatDayUpcomingTemplate, CardBoatDayPendingTemplate, CardBoatDayCancelledTemplate){
	var RequestsView = BaseView.extend({

		className: 'screen-requests',

		template: _.template(RequestsTemplate),

		events: {
			'click .boatdays-upcoming': 'renderUpcomingBoatDays',
			'click .boatdays-pending': 'renderPendingBoatDays',
			'click .boatdays-past': 'renderPastBoatDays',
			'click .boatdays-cancelled': 'renderCancelledBoatDays',
			
			'click .boatday-card-past': 'pay',
			
			'click .boatday-card-upcoming .chat': 'chat',
			'click .boatday-card-upcoming .image': 'boatday', 
			'click .boatday-card-upcoming .details': 'boatday',
			'click .boatday-card-upcoming .share': 'share',
			
			'click .boatday-card-pending .image': 'boatdayFromPending',
			'click .boatday-card-pending .details': 'boatdayFromPending',
			'click .boatday-card-pending .approve': 'approve',
			'click .boatday-card-pending .deny': 'deny',
		},

		requests: {},
		profiles: {},
		boatdays: {},

		startingCard: 'upcoming',

		approve: function(event) {

			var self = this;

			Parse.Cloud.run('requestRescheduleGuestAnswer', {
				action: 'approve',
				request: $(event.currentTarget).closest('.boatday-card-pending').attr('data-id'),
			}).then(function(response) {
				self._info(response);
				self.$el.find('.boatdays-upcoming').click();
			}, function(error) {
				console.log(error);
			});

		},

		deny: function(event) {

			var self = this;

			Parse.Cloud.run('requestRescheduleGuestAnswer', {
				action: 'deny',
				request: $(event.currentTarget).closest('.boatday-card-pending').attr('data-id'),
			}).then(function(response) {
				self._info(response);
				self.$el.find('.boatdays-pending').click();
			}, function(error) {
				console.log(error);
			});

		},

		share: function(event) {
			
			var self = this;

			var boatday = self.requests[$(event.currentTarget).closest('.boatday-card-upcoming').attr('data-id')].get('boatday');
			var seats = boatday.get('availableSeats') - boatday.get('bookedSeats');

			var opts = {
				method: "share",
				href: "https://www.boatdayapp.com/dl/boatday/"+boatday.id,
			};

			facebookConnectPlugin.showDialog(opts, function() {
				console.log('success');
			}, function(error) {
				console.log(error);
			});

		},

		initialize: function(data) {
			if( data.queryString ) {
				this.startingCard = this.splitURLParams(data.queryString)['subView'];
			}
		},

		profile: function(event) {
			
			event.preventDefault();

			Parse.Analytics.track('boatday-click-profile');	
			
			this.modal(new ProfileView({ model: this.profiles[$(event.currentTarget).attr('data-id')] }));
		
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			new Swiper(this.$el.find('.categories .swiper-container'), {
				slidesPerView: 'auto',
   				slidesPerColumn: 1,
			});

			self.$el.find('.boatdays-'+this.startingCard).click();

			return this;

		},

		boatday: function(event) {
			event.preventDefault();
			Parse.Analytics.track('boatdays-click-boatday');
			this.modal(new BoatDayView({ seatRequest: this.requests[$(event.currentTarget).attr('data-id')], model : this.requests[$(event.currentTarget).attr('data-id')].get('boatday'), fromUpcoming: true }), 'right');
		}, 

		boatdayFromPending: function(event) {
			event.preventDefault();
			Parse.Analytics.track('boatdays-click-boatday');
			this.modal(new BoatDayView({ seatRequest: this.requests[$(event.currentTarget).attr('data-id')], model : this.requests[$(event.currentTarget).attr('data-id')].get('boatday'), fromUpcoming: false }), 'right');
		}, 

		chat: function(event) {

			this.modal(new ChatView({ model: this.requests[$(event.currentTarget).attr('data-id')].get('boatday'), seatRequest: this.requests[$(event.currentTarget).attr('data-id')], parentView: this, renderParent: true }));

		},

		changeActive: function(event) {

			this.$el.find('.categories .active').removeClass('active');
			$(event.currentTarget).addClass('active');

		},

		renderPastBoatDays: function(event) {

			var self = this;

			this.changeActive(event);



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

		renderPendingBoatDays: function(event) {

			var self = this;

			this.changeActive(event);

			var query = Parse.User.current().get('profile').relation('requests').query();
			query.containedIn('status', ['pending-guest', 'pending']);

			self.execQuerySeatRequests(query, CardBoatDayPendingTemplate, function(request) {
				request.get('boatday').relation('boatdayPictures').query().first().then(function(fh) {
					if( typeof fh !== typeof undefined ) {
						self.$el.find('.boatday-card-pending[data-id="'+request.id+'"] .image').css({ backgroundImage: 'url(' + fh.get('file').url() +')' })
					}
				});
			});

		},

		renderCancelledBoatDays: function(event) {

			var self = this;

			this.changeActive(event);

			var query = Parse.User.current().get('profile').relation('requests').query();
			query.containedIn('status', ['cancelled-host', 'cancelled-guest']);

			self.execQuerySeatRequests(query, CardBoatDayCancelledTemplate, function(request) {
				request.get('boatday').relation('boatdayPictures').query().first().then(function(fh) {
					if( typeof fh !== typeof undefined ) {
						self.$el.find('.boatday-card-cancelled[data-id="'+request.id+'"] .image').css({ backgroundImage: 'url(' + fh.get('file').url() +')' })
					}
				});
			});

		},

		renderUpcomingBoatDays: function(event) {
			
			var self = this;

			this.changeActive(event);
			
			var innerQueryToday = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryToday.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));
			innerQueryToday.lessThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59, 599));
			innerQueryToday.greaterThan('arrivalTime', new Date().getHours() + ( new Date().getMinutes() > 30 ? 0.5 : 0 ));

			var queryFutureToday = Parse.User.current().get('profile').relation('requests').query();
			queryFutureToday.matchesQuery("boatday", innerQueryToday);

			var innerQueryTomorrow = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryTomorrow.greaterThan("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59, 599));

			var queryTomorrow = Parse.User.current().get('profile').relation('requests').query();
			queryTomorrow.matchesQuery("boatday", innerQueryTomorrow);

			var query = new Parse.Query.or(queryFutureToday, queryTomorrow);
			query.equalTo('status', 'approved');

			self.execQuerySeatRequests(query, CardBoatDayUpcomingTemplate, function(request) {

				request.get('boatday').relation('boatdayPictures').query().first().then(function(fh) {
					if( typeof fh !== typeof undefined ) {
						self.$el.find('.boatday-card-upcoming[data-id="'+request.id+'"] .image').css({ backgroundImage: 'url(' + fh.get('file').url() +')' })
						self.$el.find('.boatday-card-upcoming[data-id="'+request.id+'"] .share').attr('data-image', fh.get('file').url() )
					}
				});

				var queryChatMsg = request.get('boatday').relation('chatMessages').query();
				queryChatMsg.notEqualTo('profile', Parse.User.current().get('profile'));

				if( typeof request.get('guestLastRead') !== undefined && request.get('guestLastRead')) {
					queryChatMsg.greaterThan('createdAt', request.get('guestLastRead'));	
				}
				
				var checkMessages = function() {
					queryChatMsg.count().then(function(total) {
						if( total == 0 ) {
							self.$el.find('.boatday-card-upcoming[data-id="' + request.id + '"] .unread').hide();
						} else {
							self.$el.find('.boatday-card-upcoming[data-id="' + request.id + '"] .unread').show().text('(' + total + ')');
						}
					}, function(error) {
						console.log(error);
					})
				};

				checkMessages();

				setInterval(function() {
					checkMessages();
				}, 10000);
			});
		},

		execQuerySeatRequests: function(query, template, cbAfterCardRender) {

			var self = this;

			query.include('boatday');
			query.include('boatday.boat');
			query.include('boatday.captain');
			query.include('boatday.captain.host');
			query.include('promoCode');
			query.find().then(function(requests) {

				self.$el.find('.list').html("");

				_.each(requests, function(request) {

					if( typeof request.get('boatday') === typeof undefined ) {
						return ;
					}

					self.requests[request.id] = request;
					self.boatdays[request.get('boatday').id] = request.get('boatday');
					self.profiles[request.get('boatday').get('captain').id] = request.get('boatday').get('captain');

					self.$el.find('.list').append(_.template(template)({ self: self, model: request }));

					if( typeof cbAfterCardRender !== typeof undefined ) {
						cbAfterCardRender(request);
					}

				});

				// ToDo
				// - Add more explicit empty state
				if( requests.length == 0 ) {
					self.$el.find('.list').attr('no-data', 'Currently no BoatDays in this category');
				} else {
					self.$el.find('.list').removeAttr('no-data');
				}
				

			}, function(error) {
				console.log(error);
			});

		},

		pay: function(event) {
			if( typeof this.requests[$(event.currentTarget).attr('data-id')].get('ratingGuest') === typeof undefined 
				|| !this.requests[$(event.currentTarget).attr('data-id')].get('ratingGuest') ) {
				this.modal(new PayView({ model: this.requests[$(event.currentTarget).attr('data-id')] }));
			}
		}

	});
	return RequestsView;
});
