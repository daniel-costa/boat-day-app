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
