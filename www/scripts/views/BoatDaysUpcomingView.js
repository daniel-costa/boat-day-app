define([
'views/BaseView',
'text!templates/BoatDaysUpcomingTemplate.html',
'text!templates/BoatDaysUpcomingCardTemplate.html',
], function(BaseView, BoatDaysUpcomingTemplate, BoatDaysUpcomingCardTemplate){
	var BoatDaysUpcomingView = BaseView.extend({

		className: 'screen-boatdays-upcoming',

		template: _.template(BoatDaysUpcomingTemplate),

		events: {
		},

		statusbar: true,
		
		drawer: true,
		
		boatdays: {},

		render: function( ) {

			BaseView.prototype.render.call(this);

			var self = this;

			var innerQuery = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQuery.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

			var query = Parse.User.current().get('profile').relation('requests').query();
			query.include('boatday');
			query.include('boatday.boat');
			query.include('boatday.captain');
			query.matchesQuery("boatday", innerQuery);
			query.find().then(function(requests) {

				var tpl = _.template(BoatDaysUpcomingCardTemplate);

				self.boatdays = {};

				_.each(requests, function(request) {
					
					var boatday = request.get('boatday');

					self.boatdays[boatday.id] = boatday;

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
						captainRating: 5,
						takenSeats: 1,
					}

					self.$el.find('.content').append(tpl(data));

					boatday.get('boat').relation('boatPictures').query().first().then(function(fileholder) {
						
						if( fileholder ) {
							self.$el.find('.boatday-card.card-'+boatday.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
						}

					});
				});


				if( requests.length == 0 ) {
					self.$el.find('.content').html($('<h1>').text('empty'));
				}

			}, function(error) {
				console.log(error);
			});

			return this;

		}

	});
	return BoatDaysUpcomingView;
});
