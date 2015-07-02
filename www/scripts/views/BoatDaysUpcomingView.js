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

		statusbar: true,
		
		drawer: true,
		
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
			this.modal(new BoatDayChatView({ model : this.boatdays[$(event.currentTarget).closest('.boatday-card').attr('data-id')] }));
			
		},

		render: function( ) {

			BaseView.prototype.render.call(this);

			var self = this;

			var innerQuery = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQuery.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

			var query = Parse.User.current().get('profile').relation('requests').query();
			query.containedIn('status', ['approved', 'pending']);
			query.matchesQuery("boatday", innerQuery);
			query.include('boatday');
			query.include('boatday.boat');
			query.include('boatday.captain');
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

					boatday.get('boat').relation('boatPictures').query().first().then(function(fileholder) {
						
						if( fileholder ) {
							self.$el.find('.boatday-card.card-'+boatday.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
						}

					});
				});


				if( requests.length == 0 ) {
					self.$el.find('.content').html('<div class="content-padded"><h6>You don\'t have any upcoming BoatDays... yet.</h6></div>');
				}

			}, function(error) {
				console.log(error);
			});

			return this;

		}

	});
	return BoatDaysUpcomingView;
});
