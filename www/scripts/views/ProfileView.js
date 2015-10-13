define([
'Swiper',
'models/ReportModel',
'views/BaseView',
'views/ReportView',
'views/BoatView',
'views/CertificationsView',
'text!templates/ProfileTemplate.html',
'text!templates/ProfileReviewHostTemplate.html', 
'text!templates/ProfileReviewGuestTemplate.html', 
'text!templates/ProfileBoatTemplate.html', 
'text!templates/ProfileBoatDayTemplate.html'
], function(Swiper, ReportModel, BaseView, ReportView, BoatView, CertificationsView, ProfileTemplate, ProfileReviewHostTemplate, ProfileReviewGuestTemplate, ProfileBoatTemplate, ProfileBoatDayTemplate){
	var ProfileView = BaseView.extend({

		className: 'screen-profile',

		template: _.template(ProfileTemplate),

		events: {
			'click .report': 'report',
			'click .certifications': 'certifications',
			'click .open-profile': 'profile',
			'click .boatday-card': 'boatday',
			'click .boat': 'boat'
		},
		
		profiles: {},

		boats: {}, 

		boatdays: {}, 

		report: function() {
			event.preventDefault();
			
			Parse.Analytics.track('profile-click-report');

			this.modal(new ReportView({ model : new ReportModel({ action: 'profile', profile: this.model }) }));
		},

		certifications: function(event) {
			event.preventDefault();

			Parse.Analytics.track('profile-click-certifications');

			this.modal(new CertificationsView());
		},

		profile: function(event) {
			event.preventDefault();
			
			Parse.Analytics.track('profile-click-profile');

			this.modal(new ProfileView({ model: this.profiles[$(event.currentTarget).attr('data-id')] }));
		},

		boat: function(event) {
			event.preventDefault();

			Parse.Analytics.track('profile-click-boat');

			this.modal(new BoatView({ model: this.boats[$(event.currentTarget).attr('data-id')] }));
		},

		boatday: function(event) {
			event.preventDefault();

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
				query.notEqualTo('reviewGuest', '');
				query.notEqualTo('reviewGuest', null);
				query.include('profile');
				query.include('boatday');
				query.find().then(function(requests) {
					var displayed = 0;
					_.each(requests, function(request) {
						if( request.get('reviewGuest') != "" ) {
							displayed++;
							self.profiles[request.get('profile').id] = request.get('profile');
							self.$el.find('.reviews').append(_.template(ProfileReviewHostTemplate)({ self: self, request : request }));
						}
					});

					if( displayed == 0 ) {
						self.$el.find('.reviews').html('<p class="text-center no-data">No current ratings</p>');
						return;
					} 
				});

				var boatDayquery = new Parse.Query(Parse.Object.extend('BoatDay'));
				boatDayquery.equalTo('captain', this.model.get('host').get('profile'));
				boatDayquery.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));
				boatDayquery.equalTo("status", 'complete');
				boatDayquery.include('boat');
				boatDayquery.include('captain');
				boatDayquery.include('captain.host');
				boatDayquery.find().then(function(boatdays) {
					self.$el.find('.boatdays .list').html('');
					_.each(boatdays, function(boatday) {
						self.boatdays[boatday.id] = boatday;
						self.$el.find('.boatdays .list').append(_.template(ProfileBoatDayTemplate)({ model:boatday }));

						var queryPictures = boatday.get('boat').relation('boatPictures').query();
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
						self.$el.find('.boats .list').append(_.template(ProfileBoatTemplate)({ model: boat }));

						var boatPictures = boat.relation('boatPictures').query();
						boatPictures.ascending('order');
						boatPictures.first().then(function(fileholder) {
							if( fileholder ) {
								self.$el.find('.boats .list .boat[data-id="'+boat.id+'"] .boat-image').css({ backgroundImage: 'url('+fileholder.get("file").url()+')' });
							}
						});
					});
				});

			}

			var query = new Parse.Query(Parse.Object.extend('SeatRequest'));
			query.equalTo('profile', this.model);
			query.notEqualTo('ratingHost', null);
			query.include('boatday');
			query.include('boatday.captain');
			query.include('profile');
			query.find().then(function(requests) {

				console.log(requests);

				_.each(requests, function(request) {
					self.profiles[request.get('boatday').get('captain').id] = request.get('boatday').get('captain');
					self.$el.find('.reviews').append(_.template(ProfileReviewGuestTemplate)({ self: self, request : request }));
				});

				if( requests.length == 0 ) {
					self.$el.find('.reviews').html('<p class="text-center no-data">No current ratings</p>');
					return;
				} 

			}, function(error) {
				console.log(error);
			});

			return this;
		}
	});
	return ProfileView;
});