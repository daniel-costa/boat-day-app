define([
'views/BaseView',
'views/BoatDayView',
'views/MapView',
'text!templates/BoatDaysTemplate.html',
'text!templates/BoatDayCardTemplate.html',
'text!templates/BoatDayTemplate.html'
], function(BaseView, BoatDayView, MapView, BoatDaysTemplate, BoatDayCardTemplate, BoatDayTemplate){
	var BoatDaysView = BaseView.extend({

		className: 'screen-boatdays',

		template: _.template(BoatDaysTemplate),

		events: {
			'click .boatday-card': 'showBoatDay',
			'click .btn-map': 'map',
			'click .control-item': 'pickCategory',
			'click .location': 'showLocations',
			'change [name="location"]': 'pickLocation',
		},

		statusbar: true,
		
		drawer: true,
		
		boatdays: {},

		initialize: function() {

			var self = this;

		},

		showBoatDay: function(event) {

			this.modal(new BoatDayView({ model : this.boatdays[$(event.currentTarget).attr('data-id')], fromUpcoming: false }));

		},

		map: function() {

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

					self.modal(new MapView({ boatdays: _boatdays, center: center, zoomLevel: 10 }));

				}, function(error) {
					console.log(error);
				});

			});


			
		},
		
		getCurrentPosition: function() {
			if( Parse.User.current() && Parse.User.current().get('profile') && Parse.User.current().get('profile').get('position') ) {
				return {
					latitude: parseFloat(Parse.User.current().get('profile').get('position').latitude),
					longitude: parseFloat(Parse.User.current().get('profile').get('position').longitude)
				};
			} else {
				return {
					latitude: parseFloat(25.774382),
					longitude: parseFloat(-80.185515)
				};
			}
		},

		showLocations: function() {
			this._in('location').focus();
		},

		defineFilters: function() {
			var self = this;
			if( self.filtersDefined() ) {
				return Parse.User.current().get('profile').get('filters');
			} else {
				return {
					position: {
						name: 'my-location',
						latitude: null,
						longitude: null
					},
					category: 'all'
				};
			}
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

			Parse.User.current().get('profile').save({
				filters: newFilters
			}).then(function() {
				self.render();
			});

		},

		pickCategory: function(event) {

			var self = this;

			var newFilters = self.defineFilters();

			this.$el.find('.filter-categories .control-item.active').removeClass('active');
			
			$(event.currentTarget).addClass('active');

			newFilters.category = $(event.currentTarget).attr('value');

			this.moveHandler();

			Parse.User.current().get('profile').save({
				filters: newFilters
			}).then(function() {
				self.displayBoatDays();
			});

		},

		moveHandler: function() {

			var target = this.$el.find('.filter-categories .control-item.active');
			var handler = this.$el.find('.filter-categories .control-item-handler');
			
			handler.animate({
				left: target.offset().left,
				width: target.outerWidth(),
			});

		},

		initHandler: function() {

			var target = this.$el.find('.filter-categories .control-item.active');
			var handler = this.$el.find('.filter-categories .control-item-handler');

			handler.css({
				left: target.offset().left,
				width: target.outerWidth(),
			});

		},

		afterRenderInsertedToDom: function() {
			this.initHandler();
		},

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

			this.$el.find('h1.title').text("BoatDays");

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

			self.$el.find('.loading').show();
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

					var tpl = _.template(BoatDayCardTemplate);

					self.boatdays = {};

					var myPosition = new Parse.GeoPoint({
						latitude: self.getCurrentPosition().latitude,
						longitude: self.getCurrentPosition().longitude
					});

					self.$el.find('.content .inner').html('');

					_.each(boatdays, function(boatday) {
						
						self.boatdays[boatday.id] = boatday;

						self.$el.find('.content .inner').append(tpl({
							id: boatday.id,
							price: self.getGuestPrice(boatday.get('price'), self.getGuestRate(boatday.get('captain').get('host').get('type'))),
							title: boatday.get('name'),
							dateDisplay: self.dateParseToDisplayDate(boatday.get('date')),
							timeDisplay: self.departureTimeToDisplayTime(boatday.get('departureTime')),
							duration: boatday.get('duration'),
							availableSeats: boatday.get('availableSeats'),
							bookedSeats: boatday.get('bookedSeats'),
							position: parseInt(boatday.get('location').milesTo(myPosition)) + ' miles away from me',
							captainName: boatday.get('captain') ? boatday.get('captain').get('displayName') : '',
							captainProfilePicture: boatday.get('captain') ? boatday.get('captain').get('profilePicture').url() : 'resources/profile-picture-placeholder.png',
							captainRating: boatday.get('captain').get('rating') ? boatday.get('captain').get('rating') : null
						}));

						var queryPictures = boatday.get('boat').relation('boatPictures').query();
						queryPictures.ascending('order');
						queryPictures.first().then(function(fileholder) {
							if( fileholder ) {
								self.$el.find('.boatday-card.card-'+boatday.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
							}
						});

					});

					if( boatdays.length == 0 ) {
						self.$el.find('.category-empty').show();
					}

					self.$el.find('.loading').hide();

				}, function(error) {
					console.log(error);
				});

			});
		}

	});
	return BoatDaysView;
});