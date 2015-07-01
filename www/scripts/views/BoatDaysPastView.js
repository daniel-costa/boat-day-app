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


			var innerQueryByStatus = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryByStatus.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

			var queryByStatus = Parse.User.current().get('profile').relation('requests').query();
			queryByStatus.notContainedIn('status', ['approved', 'pending']);
			queryByStatus.matchesQuery("boatday", innerQueryByStatus);


			var innerQueryPast = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryPast.lessThan("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

			var queryPast = Parse.User.current().get('profile').relation('requests').query();
			queryPast.matchesQuery("boatday", innerQueryPast);


			var mainQuery = Parse.Query.or(queryPast, queryByStatus);
			mainQuery.include('boatday');
			mainQuery.include('boatday.boat');
			mainQuery.include('boatday.captain');
			mainQuery.find().then(function(requests) {

				self.$el.find('.loading').remove();
				
				var tpl = _.template(BoatDaysPastCardTemplate);

				self.boatdays = {};

				_.each(requests, function(request) {
					
					var boatday = request.get('boatday');

					self.boatdays[boatday.id] = boatday;

					var data = {
						id: boatday.id,
						status: request.get('status'),
						title: boatday.get('name'),
						dateDisplay: self.dateParseToDisplayDate(boatday.get('date')),
						timeDisplay: self.departureTimeToDisplayTime(boatday.get('departureTime')),
						captainName: boatday.get('captain') ? boatday.get('captain').get('displayName') : '',
						captainProfilePicture: boatday.get('captain') ? boatday.get('captain').get('profilePicture').url() : 'resources/profile-picture-placeholder.png',
						rating: request.get('rating') ? request.get('rating') : null,
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
					self.$el.find('.content').html($('<h4>').text("You don't have any past BoatDays... yet."));
				}

			}, function(error) {
				console.log(error);
			});

			return this;

		}

	});
	return BoatDaysUpcomingView;
});
