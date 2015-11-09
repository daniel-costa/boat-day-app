define([
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
	'views/SignUpView', 
	'views/SignInView',
	'views/GuestView',
	'views/WaterPolicyView',
	'views/TermsView',
	'views/CancellationsView', 
	'views/QuestionView', 
	'views/PromoCodeView', 
	'views/PriceInfoView', 
	'views/AdjustPriceView',
	'views/FilterView', 
	'views/ScheduleView', 
	'views/TripsView', 
	'views/TripView',
	'views/MissingInfoView'
], function(
	GuestView, MyProfileView, MyPictureView, PaymentsView, CreditCardView, BoatDayView,
	BoatDaysView, AboutUsView, NotificationsView, BoatDayActiveView, RequestsView, SignUpView, SignInView,
	GuestView, WaterPolicyView, TermsView, CancellationsView, QuestionView, PromoCodeView, PriceInfoView, 
	AdjustPriceView, FilterView, ScheduleView, TripsView, TripView, MissingInfoView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			'boatday/:id'			: 'boatday',
			'boatdays'				: 'boatdays',
			'requests?*queryString'	: 'requests',
			'requests'				: 'requests',
			'my-profile'			: 'myProfile',
			'my-picture'			: 'myPicture',
			'payments'				: 'payments',
			'credit-card'			: 'creditCard',
			'about-us'				: 'aboutUs',
			'notifications'			: 'notifications',
			'sign-in'				: 'signIn', 
			'sign-up'				: 'signUp',
			'sign-out'				: 'signOut',
			'water-policy'			: 'waterPolicy',
			'terms'					: 'terms',

			'cancellations'			: 'cancellations',
			'question'				: 'question',
			'promo-code'			: 'promoCode',
			'price-info'			: 'priceInfo', 
			'guest'					: 'guest',
			'filter'				: 'filter', 
			'adjust-price'			: 'adjustPrice', 
			'schedule'				: 'schedule',
			'trips'					: 'trips', 
			'trip'					: 'trip', 
			'missing-info'			: 'missingInfo', 
			'*actions'				: 'boatdays'

		},
		
		currentView: null,

		canHandleDeepLinking: false,

		missingInfo: function() {

			this.render(new MissingInfoView());
		}, 

		trip: function() {

			this.render(new TripView());
		}, 

		trips: function() {

			this.render(new TripsView());
		}, 

		schedule: function() {
			
			this.render(new ScheduleView());
		}, 
		
		adjustPrice: function() {

			this.render(new AdjustPriceView());
		}, 

		filter: function(){

			this.render(new FilterView());

		}, 

		priceInfo: function() {

			this.render(new PriceInfoView());

		}, 

		promoCode: function() {

			this.render(new PromoCodeView());

		},

		question: function(){

			this.render(new QuestionView());

		}, 

		cancellations: function() {

			this.render(new CancellationsView());

		},

		waterPolicy: function() {

			this.render(new WaterPolicyView());
			
		}, 

		terms: function() {

			this.render(new TermsView());
			
		}, 

		signUp: function() {

			this.render(new SignUpView());

		}, 

		signIn: function() {

			this.render(new SignInView());
		}, 

		signOut: function() {

			Parse.User.logOut();
			facebookConnectPlugin.logout();
			this.guest();

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

		requests: function(queryString) {

			var self = this;
			self.handleSignedIn(function(profile) {
				self.render(new RequestsView({ queryString: queryString }));
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
				self.render(new MyPictureView({ model: Parse.User.current().get('profile') }));
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
				self.render(new MyPictureView({ model: Parse.User.current().get('profile'), setup: true }));
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

			$("#content").html( view.render().el );

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
