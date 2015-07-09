define([
'views/BaseView',
'views/BoatDayPayView',
'views/ProfileView',
'text!templates/BoatDaysPastTemplate.html',
'text!templates/BoatDaysPastCardTemplate.html',
], function(BaseView, BoatDayPayView, ProfileView, BoatDaysPastTemplate, BoatDaysPastCardTemplate){
	var BoatDaysPastView = BaseView.extend({

		className: 'screen-boatdays-past',

		template: _.template(BoatDaysPastTemplate),

		events: {
			'click .btn-pay': 'pay',
			'click .profile-picture': 'profile',
		},

		statusbar: true,
		
		drawer: true,

		requests: {},

		profiles: {},

		pay: function(event) {
			this.modal(new BoatDayPayView({ model : this.requests[$(event.currentTarget).closest('.boatday-card').attr('data-request')] }) );
		},

		profile: function(event) {
			this.modal(new ProfileView({ model: this.profiles[$(event.currentTarget).attr('data-id')] }));
		},

		render: function( ) {

			BaseView.prototype.render.call(this);

			var self = this;


			// var innerQueryByStatus = new Parse.Query(Parse.Object.extend('BoatDay'));
			// innerQueryByStatus.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

			var queryByFuturByStatus = Parse.User.current().get('profile').relation('requests').query();
			queryByFuturByStatus.notContainedIn('status', ['approved', 'pending']);
			// queryByStatus.matchesQuery("boatday", innerQueryByStatus);


			var innerQueryYesterday = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryYesterday.lessThan("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));

			var queryYesterday = Parse.User.current().get('profile').relation('requests').query();
			queryYesterday.matchesQuery("boatday", innerQueryYesterday);


			var innerQueryToday = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryToday.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));
			innerQueryToday.lessThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59, 599));
			innerQueryToday.lessThanOrEqualTo('arrivalTime', new Date().getHours() + ( new Date().getMinutes() > 30 ? 0.5 : 0 ));

			var queryToday = Parse.User.current().get('profile').relation('requests').query();
			queryToday.matchesQuery("boatday", innerQueryToday);


			var innerQueryCancelled = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQueryCancelled.notContainedIn('status', ['complete']);

			var queryCancelled = Parse.User.current().get('profile').relation('requests').query();
			queryCancelled.matchesQuery("boatday", innerQueryCancelled);


			var mainQuery = Parse.Query.or(queryYesterday, queryToday, queryByFuturByStatus, queryCancelled);
			mainQuery.include('boatday');
			mainQuery.include('boatday.boat');
			mainQuery.include('boatday.captain');
			mainQuery.include('boatday.captain.host');
			mainQuery.find().then(function(requests) {

				self.$el.find('.loading').remove();
				
				var tpl = _.template(BoatDaysPastCardTemplate);

				self.requests = {};

				_.each(requests, function(request) {
					
					var boatday = request.get('boatday');

					self.requests[request.id] = request;
					self.profiles[boatday.get('captain').id] = boatday.get('captain');

					var data = {
						self: self,
						boatday: boatday,
						request: request,
					}

					self.$el.find('.content').append(tpl(data));
					var queryPictures = boatday.get('boat').relation('boatPictures').query();
					queryPictures.ascending('order');
					queryPictures.first().then(function(fileholder) {
						
						if( fileholder ) {
							self.$el.find('.boatday-card.card-'+boatday.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
						}

					});
				});


				if( requests.length == 0 ) {
					self.$el.find('.content').html('<div class="content-padded"><h6>You don\'t have any past BoatDays... yet.</h6></div>');
				}

			}, function(error) {
				console.log(error);
			});

			return this;

		}

	});
	return BoatDaysPastView;
});
