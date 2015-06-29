define([
'views/BaseView',
'text!templates/BoatDaysPastTemplate.html',
'text!templates/BoatDaysPastCardTemplate.html',
], function(BaseView, BoatDaysPastTemplate, BoatDaysPastCardTemplate){
	var BoatDaysUpcomingView = BaseView.extend({

		className: 'screen-boatdays-past',

		template: _.template(BoatDaysPastTemplate),

		events: {
		},

		statusbar: true,
		
		drawer: true,
		
		boatdays: {},

		render: function( ) {

			BaseView.prototype.render.call(this);

			var self = this;

			var innerQuery = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQuery.lessThan("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

			var query = Parse.User.current().get('profile').relation('requests').query();
			query.include('boatday');
			// query.include('boatday.boat');
			query.include('boatday.captain');
			query.matchesQuery("boatday", innerQuery);
			query.equalTo('status', 'approved');
			query.find().then(function(requests) {

				var tpl = _.template(BoatDaysPastCardTemplate);

				self.boatdays = {};

				_.each(requests, function(request) {
					
					var boatday = request.get('boatday');

					self.boatdays[boatday.id] = boatday;

					var data = {
						id: boatday.id,
						title: boatday.get('name'),
						dateDisplay: self.dateParseToDisplayDate(boatday.get('date')),
						timeDisplay: self.departureTimeToDisplayTime(boatday.get('departureTime')),
						captainName: boatday.get('captain') ? boatday.get('captain').get('displayName') : '',
						captainProfilePicture: boatday.get('captain') ? boatday.get('captain').get('profilePicture').url() : 'resources/profile-picture-placeholder.png',
						rating: 1,
						contribution: request.get('contribution')
					}

					self.$el.find('.content').append(tpl(data));

					boatday.get('boat').relation('boatPictures').query().first().then(function(fileholder) {
						
						if( fileholder ) {
							self.$el.find('.boatday-card.card-'+boatday.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
						}

					});
				});


				if( requests.length == 0 ) {
					self.$el.find('.content').html($('<h4>').text("You don't have any past BoatDays"));
				}

			}, function(error) {
				console.log(error);
			});

			return this;

		}

	});
	return BoatDaysUpcomingView;
});
