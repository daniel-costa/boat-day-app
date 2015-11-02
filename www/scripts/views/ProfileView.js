define([
'Swiper',
'models/ReportModel',
'views/BaseView',
'views/ReportView',
'views/BoatView',
'text!templates/ProfileTemplate.html',
'text!templates/CardReviewHostTemplate.html', 
'text!templates/CardReviewGuestTemplate.html', 
'text!templates/CardBoatProfileTemplate.html', 
'text!templates/CardBoatDayProfileTemplate.html'
], function(Swiper, ReportModel, BaseView, ReportView, BoatView, ProfileTemplate, CardReviewHostTemplate, CardReviewGuestTemplate, CardBoatProfileTemplate, CardBoatDayProfileTemplate){
	var ProfileView = BaseView.extend({

		className: 'screen-profile',

		template: _.template(ProfileTemplate),

		events: {
			'click .report': 'report',
			'click .open-profile': 'profile',
			'click .boatday-card': 'boatday',
			'click .boat': 'boat',
			'click .guest-picture': 'profile',
			'click .host-picture': 'profile',
		},
		
		profiles: {},

		boats: {}, 

		boatdays: {}, 

		report: function(event) {
			
			Parse.Analytics.track('profile-click-report');

			this.modal(new ReportView({ model : new ReportModel({ action: 'profile', profile: this.model }) }));
		},

		profile: function(event) {
			
			Parse.Analytics.track('profile-click-profile');

			console.log($(event.currentTarget))
			console.log($(event.currentTarget).attr('data-id'))
			console.log(this.profiles[$(event.currentTarget).attr('data-id')])

			this.modal(new ProfileView({ model: this.profiles[$(event.currentTarget).attr('data-id')] }));
		},

		boat: function(event) {

			Parse.Analytics.track('profile-click-boat');

			this.modal(new BoatView({ model: this.boats[$(event.currentTarget).attr('data-id')] }));
		},

		boatday: function(event) {

			Parse.Analytics.track('profile-click-boatday');

			var self = this;
			var boatday = self.boatdays[$(event.currentTarget).attr('data-id')];

			require(['views/BoatDayView'], function(BoatDayView) {
				self.modal(new BoatDayView({ model: boatday, fromUpcoming: false }));
			});
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			if( this.model.get('host') ) {
				
				var innerQuery = new Parse.Query(Parse.Object.extend('BoatDay'));
				innerQuery.equalTo('captain', this.model);
				innerQuery.equalTo('status', 'complete');

				var query = new Parse.Query(Parse.Object.extend('SeatRequest'));
				query.matchesQuery('boatday', innerQuery);
				query.equalTo('status', 'approved');
				query.notContainedIn('reviewGuest', ["", null]);
				query.include('profile');
				query.include('boatday');
				query.find().then(function(requests) {
					
					_.each(requests, function(request) {
						self.profiles[request.get('profile').id] = request.get('profile');
						self.$el.find('.reviews').append(_.template(CardReviewHostTemplate)({ self: self, request : request }));
					});

					if( requests.length == 0 ) {
						self.$el.find('.reviews').html('<p class="text-center no-data">No current ratings</p>');
						return;
					} 
					
				}, function(error) {
					console.log(error);
				});

				var boatDayquery = new Parse.Query(Parse.Object.extend('BoatDay'));
				boatDayquery.equalTo('captain', this.model.get('host').get('profile'));
				boatDayquery.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));
				boatDayquery.equalTo("status", 'complete');
				boatDayquery.include('boat');
				boatDayquery.include('captain');
				boatDayquery.include('captain.host');
				boatDayquery.find().then(function(boatdays) {
					self.$el.find('.boatdays .listing').html('');
					_.each(boatdays, function(boatday) {
						self.boatdays[boatday.id] = boatday;
						self.$el.find('.boatdays .listing').append(_.template(CardBoatDayProfileTemplate)({ 
							self: self,
							model:boatday 
						}));

						var queryPictures = boatday.relation('boatdayPictures').query();
						queryPictures.ascending('order');
						queryPictures.first().then(function(fileholder) {
							if( fileholder ) {
								self.$el.find('.boatday-card[data-id="'+boatday.id+'"] .boatday-image').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
							}
						});
					});

					var swiperBoatDays = new Swiper(self.$el.find('.swiper-container'), {

						nextButton: self.$el.find('.swiper-button-next'),
        				prevButton: self.$el.find('.swiper-button-prev'),
						pagination: self.$el.find('.swiper-pagination'),
						paginationClickable: true,
					});
				}, function(error) {
					console.log(error);
				});


				var captainRequestQuery = new Parse.Query(Parse.Object.extend('CaptainRequest'));
				captainRequestQuery.equalTo('captainHost', this.model.get('host'));
				
				var boatCaptainQuery = new Parse.Query(Parse.Object.extend('Boat'));
				boatCaptainQuery.matchesQuery('captains', captainRequestQuery);
				
				var boatHostQuery = new Parse.Query(Parse.Object.extend('Boat'));
				boatHostQuery.equalTo('host', this.model.get('host'));
				
				var boatQuery = new Parse.Query.or(boatHostQuery, boatCaptainQuery);
				boatQuery.equalTo('status', 'approved');
				boatQuery.find().then(function(boats) {
					_.each(boats, function(boat) {
						self.boats[boat.id] = boat;
						self.$el.find('.boats .listing').append(_.template(CardBoatProfileTemplate)({ model: boat }));

						var boatPictures = boat.relation('boatPictures').query();
						boatPictures.ascending('order');
						boatPictures.first().then(function(fileholder) {
							if( typeof fileholder !== typeof undefined) {
								self.$el.find('.boats .listing [data-id="'+boat.id+'"] .boat-picture').css({ backgroundImage: 'url('+fileholder.get("file").url()+')' });
							}
						});
					});
				});

			} else {

				var query = new Parse.Query(Parse.Object.extend('SeatRequest'));
				query.equalTo('profile', this.model);
				query.notEqualTo('ratingHost', null);
				query.include('boatday');
				query.include('boatday.captain');
				query.include('profile');
				query.find().then(function(requests) {

					_.each(requests, function(request) {
						self.profiles[request.get('boatday').get('captain').id] = request.get('boatday').get('captain');
						self.$el.find('.reviews').append(_.template(CardReviewGuestTemplate)({ self: self, request : request }));
					});

					if( requests.length == 0 ) {
						self.$el.find('.reviews').html('<p class="text-center no-data">No current ratings</p>');
						return;
					} 

				}, function(error) {
					console.log(error);
				});

			}

			return this;
		}
	});
	return ProfileView;
});