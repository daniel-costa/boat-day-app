define([
'views/BaseView',
'views/BoatDayView',
'views/BoatDayChatView',
'text!templates/BoatDaysUpcomingTemplate.html',
'text!templates/BoatDaysUpcomingCardTemplate.html',
], function(BaseView, BoatDayView, BoatDayChatView, BoatDaysUpcomingTemplate, BoatDaysUpcomingCardTemplate){
	var BoatDaysUpcomingView = BaseView.extend({

		className: 'screen-boatdays-upcoming',

		template: _.template(BoatDaysUpcomingTemplate),

		events: {
			'click .btn-boatday': 'showBoatDay',
			'click .btn-chat': 'showChat',
		},
		
		boatdays: {},

		requests: {},

		showBoatDay: function(event) {

			event.preventDefault();
			this.modal(new BoatDayView({ 
				model : this.boatdays[$(event.currentTarget).closest('.boatday-card').attr('data-id')],
				fromUpcoming: true,
				seatRequest:  this.requests[$(event.currentTarget).closest('.boatday-card').attr('request-id')]
			}));

		},

		showChat: function(event) {

			event.preventDefault();
			this.modal(new BoatDayChatView({ 
				model : this.boatdays[$(event.currentTarget).closest('.boatday-card').attr('data-id')],
				seatRequest: this.requests[$(event.currentTarget).closest('.boatday-card').attr('request-id')]
			}));
			
		},

		render: function( ) {

			BaseView.prototype.render.call(this);

			var self = this;

			var innerQueryToday = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryToday.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));
			innerQueryToday.lessThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59, 599));
			innerQueryToday.greaterThan('departureTime', new Date().getHours() + ( new Date().getMinutes() > 30 ? 0.5 : 0 ));
			innerQueryToday.containedIn('status', ['complete']); 

			var queryToday = Parse.User.current().get('profile').relation('requests').query();
			queryToday.containedIn('status', ['approved', 'pending']);
			queryToday.matchesQuery("boatday", innerQueryToday);


			var innerQueryTomorrow = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryTomorrow.greaterThan("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59, 599));
			innerQueryTomorrow.containedIn('status', ['complete']);

			var queryTomorrow = Parse.User.current().get('profile').relation('requests').query();
			queryTomorrow.containedIn('status', ['approved', 'pending']);
			queryTomorrow.matchesQuery("boatday", innerQueryTomorrow);


			var query = Parse.Query.or(queryToday, queryTomorrow);
			query.include('boatday');
			query.include('boatday.boat');
			query.include('boatday.captain');
			query.include('boatday.captain.host');
			query.ascending('date,departureTime,price,bookedSeats');
			query.find().then(function(requests) {

				self.$el.find('.loading').remove();
				
				var tpl = _.template(BoatDaysUpcomingCardTemplate);

				self.boatdays = {};
				self.requests = {};

				_.each(requests, function(request) {
					
					var boatday = request.get('boatday');

					self.boatdays[boatday.id] = boatday;
					self.requests[request.id] = request;

					var data = {
						status: request.get('status'),
						seats: request.get('seats'),
						id: boatday.id,
						title: boatday.get('name'),
						dateDisplay: self.dateParseToDisplayDate(boatday.get('date')),
						timeDisplay: self.departureTimeToDisplayTime(boatday.get('departureTime')),
						duration: boatday.get('duration'),
						position: boatday.get('locationText'),
						captainName: boatday.get('captain') ? boatday.get('captain').get('displayName') : '',
						captainProfilePicture: boatday.get('captain') ? boatday.get('captain').get('profilePicture').url() : 'resources/profile-picture-placeholder.png',
						captainRating: boatday.get('captain').get('rating') ? boatday.get('captain').get('rating') : null,
						takenSeats: boatday.get('bookedSeats'),
						seatRequestId: request.id,
						newMessages: 3
					}

					self.$el.find('.content').append(tpl(data));

					var queryPictures = boatday.get('boat').relation('boatPictures').query();
					queryPictures.ascending('order');
					queryPictures.first().then(function(fileholder) {
						
						if( fileholder ) {
							self.$el.find('.boatday-card.card-'+boatday.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
						}

					});

					var queryLastRead = boatday.relation('chatMessages').query();
					if( request.get('guestLastRead') ) {
						queryLastRead.greaterThan('createdAt', new Date(request.get('guestLastRead')) );
					}
					queryLastRead.ascending('createdAt');
					queryLastRead.count().then(function(total) {
						
						if( total > 0 ) {
							self.$el.find('.boatday-card.card-'+boatday.id+' .new').show().find('.amount').html(total + ' New Message' + (total != 1 ? 's' : ''));
						}

					});
				});


				if( requests.length == 0 ) {
					self.$el.find('.content').html('<div class="content-padded"><img src="resources/logo-colors.png" class="logo-placeholder" /><p class="text-center">You don\'t have any upcoming BoatDays... yet.</p></div>');
				}

			}, function(error) {
				console.log(error);
			});

			return this;

		}

	});
	return BoatDaysUpcomingView;
});
