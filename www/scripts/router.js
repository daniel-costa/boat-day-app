define([
	'views/TestView',
	'views/GuestView',
	'views/MyProfileView',
	'views/MyPictureView',
	'views/PaymentsView',
	'views/CreditCardView',
	'views/BoatDayView',
	'views/BoatDaysView',
	'views/AboutUsView',
	'views/NotificationsView',
	'views/BoatDayActiveView',
	'views/RequestsView',
	'views/SignUpView'
], function(
	TestView, GuestView, MyProfileView, MyPictureView, PaymentsView, CreditCardView, BoatDayView,
	BoatDaysView, AboutUsView, NotificationsView, BoatDayActiveView, RequestsView, SignUpView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			'sign-out'			: 'signOut',
			'boatday/:id'		: 'boatday',
			'boatdays'			: 'boatdays',
			'requests'			: 'requests',
			'my-profile'		: 'myProfile',
			'my-picture'		: 'myPicture',
			'payments'			: 'payments',
			'credit-card'		: 'creditCard',
			'about-us'			: 'aboutUs',
			'notifications'		: 'notifications',
			'sign-up'			: 'signUp', 
			// '*actions'			: 'boatdays'
			'*actions'			: 'boatdays'
		},
		
		currentView: null,

		canHandleDeepLinking: false,

		signOut: function() {

			Parse.User.logOut();
			facebookConnectPlugin.logout();
			// this.showGuestView();

		},

		signUp: function() {

			this.render(new SignUpView());
		}, 

		test: function() {
			
			this.render(new TestView());

		},

		guest: function() {
			
			this.render(new GuestView());

		},

		notifications: function() {

			var self = this;
			self.handleSignedIn(function(profile) {
				self.render(new NotificationsView());
			});

		},

		aboutUs: function() {

			var self = this;
			self.handleSignedIn(function(profile) {
				self.render(new AboutUsView());
			});

		},

		boatday: function(id) {
			
			var self = this;
			self.handleSignedIn(function(profile) {
				var query = new Parse.Query(Parse.Object.extend('BoatDay'));
				query.include('boat');
				query.include('captain');
				query.include('captain.host');
				query.get(id).then(function(boatday) {
					self.render(new BoatDayView({ model: boatday, fromUpcoming: false }));
				});
			});
		},

		boatdays: function() {

			var self = this;
			self.handleSignedIn(function(profile) {
				self.render(new BoatDaysView());
			});

		},

		requests: function() {

			var self = this;
			self.handleSignedIn(function(profile) {
				self.render(new RequestsView());
			});

		},

		myProfile: function() {

			var self = this;
			self.handleSignedIn(function(profile) {
				self.render(new MyProfileView({ model: Parse.User.current().get('profile') }));
			});

		},
		
		myPicture: function() {

			var self = this;
			self.handleSignedIn(function(profile) {
				self.render(new MyPicture({ model: Parse.User.current().get('profile') }));
			});

		},

		payments: function() {

			var self = this;
			self.handleSignedIn(function(profile) {
				self.render(new PaymentsView());
			});

		},

		creditCard: function() {

			var self = this;
			self.handleSignedIn(function() {
				self.render(new CreditCardView());
			});

		},

		handleSignedIn: function(cb) {
			
			var self = this;

			if( !Parse.User.current() ) {
				
				this.guest();
				return;

			}

			if( Parse.User.current().get('profile').get("status") == "creation" ) {
				self.render(new MyProfileView({ model: Parse.User.current().get('profile'), setup: true }));
				return ;
			}

			if( !Parse.User.current().get('profile').get("profilePicture") ) {
				self.render(new MyPicture({ model: Parse.User.current().get('profile'), setup: true }));
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
						self.boatday(dl.params.id);
						break;
					default :
						cb();
						break;
				}
			} else {
				cb();
			}
		},

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
