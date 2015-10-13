define([
	'views/TestView',
	'views/SignInView',
	'views/ProfileInfoView',
	'views/ProfilePictureView',
	'views/ProfilePaymentsView',
	'views/ProfilePaymentsAddView',
	'views/BoatDayView',
	'views/BoatDaysView',
	'views/BoatDaysPastView',
	'views/BoatDaysUpcomingView',
	'views/AboutUsView',
	'views/NotificationsView',
	'views/BoatDayActiveView',
	'views/BoatDaysRequestedView',
], function(
	TestView,
	SignInView, ProfileInfoView, ProfilePictureView, ProfilePaymentsView, ProfilePaymentsAddView, BoatDayView,
	BoatDaysView, BoatDaysPastView, BoatDaysUpcomingView, AboutUsView, NotificationsView, BoatDayActiveView,
	BoatDaysRequestedView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			'sign-out': 'signOut',
			'boatday/:id': 'showBoatDay',
			'boatdays': 'showBoatDays',
			'boatdays-upcoming': 'showBoatDaysUpcoming',
			'boatdays-past': 'showBoatDaysPast',
			'boatdays-requested': 'showBoatDaysRequested',
			'profile-info': 'showProfileInfo',
			'profile-picture': 'showProfilePicture',
			'profile-payments': 'showProfilePayments',
			'profile-payments-add': 'showProfilePaymentsAdd',
			'about-us': 'showAboutUs',
			'notifications': 'showNotifications',
			'*actions': 'showTest'
			// '*actions': 'showBoatDays'
			// '*actions': 'showProfileInfo'
		},
		
		currentView: null,

		signOut: function() {

			Parse.User.logOut();
			facebookConnectPlugin.logout();
			this.showSignInView();

		},

		showTest: function() {
			this.render(new TestView());
		},

		showNotifications: function() {

			var self = this;
			var cb = function(profile) {
				self.render(new NotificationsView());
			};

			self.handleSignedIn(cb);

		},

		showAboutUs: function() {

			var self = this;
			var cb = function(profile) {
				self.render(new AboutUsView());
			};

			self.handleSignedIn(cb);

		},

		showSignInView: function() {
			this.render(new SignInView());
		},

		showBoatDay: function(id) {
			
			var self = this;
			var cb = function() {
				var query = new Parse.Query(Parse.Object.extend('BoatDay'));
				query.include('boat');
				query.include('captain');
				query.include('captain.host');
				query.get(id).then(function(boatday) {
					self.render(new BoatDayView({ model: boatday, fromUpcoming: false }));
				});
			};

			self.handleSignedIn(cb);
		},

		showBoatDays: function() {

			var self = this;
			var cb = function() {
				self.render(new BoatDaysView());
			};

			self.handleSignedIn(cb);

		},

		showBoatDaysPast: function() {

			var self = this;
			var cb = function() {
				self.render(new BoatDaysPastView());
			};

			self.handleSignedIn(cb);

		},

		showBoatDaysUpcoming: function() {

			var self = this;
			var cb = function() {
				self.render(new BoatDaysUpcomingView());
			};

			self.handleSignedIn(cb);

		},

		showBoatDaysRequested: function() {

			var self = this;
			var cb = function() {
				self.render(new BoatDaysRequestedView());
			};

			self.handleSignedIn(cb);

		},

		showProfileInfo: function() {

			var self = this;
			var cb = function() {
				self.render(new ProfileInfoView({ model: Parse.User.current().get('profile') }));
			};

			self.handleSignedIn(cb);

		},
		
		showProfilePicture: function() {

			var self = this;
			var cb = function() {
				self.render(new ProfilePictureView({ model: Parse.User.current().get('profile') }));
			};

			self.handleSignedIn(cb);

		},

		showProfilePayments: function() {

			var self = this;
			var cb = function() {
				self.render(new ProfilePaymentsView());
			};

			self.handleSignedIn(cb);

		},

		showProfilePaymentsAdd: function() {

			var self = this;
			var cb = function() {
				self.render(new ProfilePaymentsAddView());
			};

			self.handleSignedIn(cb);

		},

		handleSignedIn: function(cb) {
			
			var self = this;

			if( !Parse.User.current() ) {
				
				this.showSignInView();
				return;

			}

			if( Parse.User.current().get('profile').get("status") == "creation" ) {
				self.render(new ProfileInfoView({ model: Parse.User.current().get('profile'), setup: true }));
				return ;
			}

			if( !Parse.User.current().get('profile').get("profilePicture") ) {
				self.render(new ProfilePictureView({ model: Parse.User.current().get('profile'), setup: true }));
				return ;
			}

			this.handleEventGoingNow(cb);

		},

		handleEventGoingNow: function(cb) {

			var self = this;

			var innerQuery = new Parse.Query(Parse.Object.extend('BoatDay'));
			innerQuery.greaterThanOrEqualTo('date', new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0));
			innerQuery.lessThanOrEqualTo('date', new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59, 999));
			innerQuery.lessThanOrEqualTo('departureTime', new Date(new Date().getTime() + 30 * 60000).getHours() + ( new Date(new Date().getTime() + 30 * 60000).getMinutes() > 30 ? 0.5 : 0 ));
			innerQuery.greaterThan('arrivalTime', new Date().getHours() + ( new Date().getMinutes() > 30 ? 0.5 : 0 ));

			var query = Parse.User.current().get('profile').relation('requests').query();
			query.equalTo('status', 'approved');
			query.matchesQuery('boatday', innerQuery);
			query.include('boatday');
			query.include('boatday.captain');
			query.include('boatday.captain.host');
			query.find().then(function(requests) {

				if( requests.length == 0 ) {
					self.handleDeepLinking(cb)
					return;
				}

				self.render(new BoatDayActiveView({ model: requests[0] }));

			}, function(error) {
				console.log(error);
			});

		},

		handleDeepLinking: function(cb) {

			var self = this;

			if( window.deepLinking ) {
				
				var dl = window.deepLinking;

				window.deepLinking = null;
				
				switch( dl.action ) {
					case 'boatday' : 
						self.showBoatDay(dl.params.id);
						break;
					default :
						cb();
						break;
				}
			} else {
				cb();
			}
		},

		canHandleDeepLinking: false,

		render: function(view) {

			var self = this;

			if( this.currentView ) 
				this.currentView.teardown();
			
			Parse.Analytics.track('render-view', { view: view.className });

			$("#app").html( view.render().el );

			// I don't know why, but puttin in a timeout,
			// we can have the element rendered
			// Hint: may be because setTimout creates a new Thread
			setTimeout(function() { 
				view.afterRenderInsertedToDom();
			}, 0);

			this.currentView = view;

			if($('#app').is(":hidden")) {
				$('#app').fadeIn();
			}
		}

	});
	return AppRouter;
});
