define([
'views/BaseView',
'views/BoatDayView',
'views/MapView',
'text!templates/BoatDaysTemplate.html',
'text!templates/CardBoatDayTemplate.html',
], function(BaseView, BoatDayView, MapView, BoatDaysTemplate, BoatDayCardTemplate){
	var BoatDaysView = BaseView.extend({

		className: 'screen-boatdays',

		template: _.template(BoatDaysTemplate),

		events: {
			'click .boatday-card': 'boatday',
			'click .btn-map': 'map',
			'click .location': 'showLocations',
			'click .open-filters': 'filters',
			'change [name="location"]': 'pickLocation',
		},

		statusbar: true,
		
		drawer: true,
		
		boatdays: {},

		boatday: function(event) {

			Parse.Analytics.track('boatdays-click-boatday');

			this.modal(new BoatDayView({ model : this.boatdays[$(event.currentTarget).attr('data-id')], fromUpcoming: false }), 'right');

		},

		filters: function() {

		},
		
		map: function() {

			Parse.Analytics.track('boatdays-click-map');

			var self = this;

			self.getBoatdaysBaseQuery().then(function(query) {

				query.limit(1000);
				query.find().then(function(boatdays) {

					var _boatdays = [];

					_.each(boatdays, function(boatday) {
						_boatdays.push({
							precise: true,
							obj: boatday,
							openOnClick: true,
						})
					});
					
					if( self.filtersDefined() && Parse.User.current().get('profile').get('filters').position  ) {
						var center = {
							latitude: parseFloat(Parse.User.current().get('profile').get('filters').position.latitude),
							longitude: parseFloat(Parse.User.current().get('profile').get('filters').position.longitude)
						};
					} else {
						var center = self.getCurrentPosition();	
					}

					self.modal(new MapView({ boatdays: _boatdays, center: center, zoomLevel: 10 }), 'right');

				}, function(error) {
					console.log(error);
				});

			});
		},

		showLocations: function() {
			this._in('location').focus();
		},

		pickLocation: function() {

			var self = this;
			var opt = $(event.currentTarget).find(':selected');

			self.$el.find('.change-location').text(opt.text());

			var newFilters = self.defineFilters();
			
			newFilters.position = {
				name: opt.val(),
				latitude: opt.attr('lat'),
				longitude: opt.attr('lng')
			};

			Parse.Analytics.track('boatdays-pick-location', { location: newFilters.position.name } );

			Parse.User.current().get('profile').save({
				filters: newFilters
			}).then(function() {
				self.render();
			});

		},

		/*
		pickCategory: function(event) {

			var self = this;

			var newFilters = self.defineFilters();

			this.$el.find('.filter-categories .control-item.active').removeClass('active');
			
			$(event.currentTarget).addClass('active');

			newFilters.category = $(event.currentTarget).attr('value');

			Parse.Analytics.track('boatdays-pick-category', { category: newFilters.category } );
			
			this.moveHandler();

			Parse.User.current().get('profile').save({
				filters: newFilters
			}).then(function() {
				self.displayBoatDays();
			});

		},
		*/

		render: function( init ) {

			BaseView.prototype.render.call(this);

			var self = this;

			if( self.filtersDefined() && Parse.User.current().get('profile').get('filters').category ) {
				this.$el.find('.filter-categories .control-item[value="'+Parse.User.current().get('profile').get('filters').category+'"]').addClass('active');
			} else {
				this.$el.find('.filter-categories .control-item[value="all"]').addClass('active');
			}

			if( self.filtersDefined() && Parse.User.current().get('profile').get('filters').position  ) {
				self._in('location').val(Parse.User.current().get('profile').get('filters').position.name);
				self.$el.find('.change-location').text(self._in('location').find(':selected').text());
			}

			this.displayBoatDays();

			return this;

		},

		getBoatdaysBaseQuery: function() {

			var promise = new Parse.Promise();

			Parse.User.current().get('profile').relation('requests').query().find().then(function(requests) {
				
				var boatdaysId = [];

				_.each(requests, function(request) {
					boatdaysId.push(request.get('boatday').id);
				});

				var queryBoatApproved = new Parse.Query(Parse.Object.extend('Boat'));
				queryBoatApproved.equalTo('status', 'approved');

				var queryHostApproved = new Parse.Query(Parse.Object.extend('Host'));
				queryHostApproved.equalTo('status', 'approved');

				var queryProfileApproved = new Parse.Query(Parse.Object.extend('Profile'));
				queryProfileApproved.matchesQuery('host', queryHostApproved);

				var query = new Parse.Query(Parse.Object.extend('BoatDay'));
				query.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));
				query.equalTo("status", 'complete');
				query.notContainedIn('objectId', boatdaysId);
				query.matchesQuery('captain', queryProfileApproved);
				query.matchesQuery('boat', queryBoatApproved);
				query.include('boat');
				query.include('captain');
				query.include('captain.host');

				promise.resolve(query);

			});

			return promise;

		},

		displayBoatDays: function() {

			var self = this;

			self.$el.find('.category-empty').hide();

			self.getBoatdaysBaseQuery().then(function(query) {

				if( self.filtersDefined() ) {
					
					var _filters = Parse.User.current().get('profile').get('filters');

					if( _filters.category == 'all' ) {
						query.containedIn("category", ['sailing', 'sports', 'leisure', 'fishing']);
					} else {
						query.containedIn("category", [_filters.category]);
					}

					var around = new Parse.GeoPoint({ 
						latitude : _filters.position.name == 'my-location' ? parseFloat(self.getCurrentPosition().latitude) : parseFloat(_filters.position.latitude),
						longitude: _filters.position.name == 'my-location' ? parseFloat(self.getCurrentPosition().longitude) : parseFloat(_filters.position.longitude)
					});

					query.withinMiles("location", around, Parse.Config.current().get('FILTER_AROUND_RADIUS'));
				}

				query.ascending('featured,date,departureTime,price,bookedSeats');

				query.find().then(function(boatdays) {

					self.boatdays = {};

					self.myPosition = new Parse.GeoPoint({
						latitude: self.getCurrentPosition().latitude,
						longitude: self.getCurrentPosition().longitude
					});

					self.$el.find('main .list').html('');

					_.each(boatdays, function(boatday) {
						
						self.boatdays[boatday.id] = boatday;

						self.$el.find('main .list').append(_.template(BoatDayCardTemplate)({
							self: self,
							model: boatday,
						}));

						var queryPictures = boatday.get('boat').relation('boatPictures').query();
						queryPictures.ascending('order');
						queryPictures.first().then(function(fileholder) {
							if( fileholder ) {
								self.$el.find('.boatday-card[data-id="'+boatday.id+'"] .image').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
							}
						});

					});

					if( boatdays.length == 0 ) {
						self.$el.find('.list').attr('no-data', 'Currently no BoatDays for this filters. Try less restrictive filters!');
					} else {
						self.$el.find('.list').removeAttr('no-data');
					}

				}, function(error) {
					console.log(error);
				});

			});
		}

	});
	return BoatDaysView;
});