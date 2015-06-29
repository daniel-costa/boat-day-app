define([
	'views/SignInView',
	'views/ProfileInfoView',
	'views/ProfilePictureView',
	'views/ProfilePaymentsView',
	'views/ProfilePaymentsAddView',
	'views/BoatDaysHomeView',
	'views/BoatDaysView',
	'views/BoatDaysUpcomingView',
	'views/BoatDayView',
	'views/AboutUsView',
	'views/TermsView',
	'views/NotificationsView'
], function(
	SignInView, ProfileInfoView, ProfilePictureView, ProfilePaymentsView, ProfilePaymentsAddView, 
	BoatDaysHomeView, BoatDaysView, BoatDaysUpcomingView, BoatDayView, AboutUsView, TermsView, NotificationsView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			'sign-out': 'signOut',
			'boatdays-home': 'showBoatDaysHome',
			'boatdays': 'showBoatDays',
			'boatdays-upcoming': 'showBoatDaysUpcoming',
			'boatday/:id': 'showBoatDay',
			'profile-info': 'showProfileInfo',
			'profile-picture': 'showProfilePicture',
			'profile-payments': 'showProfilePayments',
			'profile-payments-add': 'showProfilePaymentsAdd',
			'about-us': 'showAboutUs',
			'terms': 'showTerms',
			'notifications': 'showNotifications',
			'*actions': 'showBoatDaysHome'
		},
		
		currentView: null,

		signOut: function() {

			Parse.User.logOut();
			facebookConnectPlugin.logout();
			this.showSignInView();

		},

		showTerms: function() {

			var self = this;
			var cb = function(profile) {

				self.render(new TermsView());
				
			};

			self.handleSignedIn(cb);

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

		showBoatDaysHome: function() {

			var self = this;
			var cb = function(profile) {

				self.render(new BoatDaysHomeView());
				
			};

			self.handleSignedIn(cb);

		},

		showBoatDays: function() {

			var self = this;
			var cb = function() {

				if( !Parse.User.current().get('profile').get('displayBDCategory') ) {
					
					self.render(new BoatDaysHomeView());

				} else {

					self.render(new BoatDaysView());

				}
				
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

		showBoatDay: function(id) {

			var self = this;
			var cb = function() {

				var query = new Parse.Query(Parse.Object.extend('BoatDay'));
				query.include('boat');
				query.include('captain');
				query.get(id).then(function(boatday) {
					self.render(new BoatDayView({ model: boatday }));	
				})
				
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

			
			console.log("handleSignedIn");

			if( Parse.User.current().get('profile').get("status") == "creation" ) {
				console.log("-> info");
				self.render(new ProfileInfoView({ model: Parse.User.current().get('profile'), setup: true }));
				return ;
			}

			if( !Parse.User.current().get('profile').get("profilePicture") ) {
				console.log("-> picture");
				self.render(new ProfilePictureView({ model: Parse.User.current().get('profile'), setup: true }));
				return ;
			}

			if( !Parse.User.current().get('profile').get("paymentId") ) {
				console.log("-> payments");
				self.render(new ProfilePaymentsAddView({ setup: true }));
				return ;
			}

			cb();

		},

		render: function(view) {

			if( this.currentView ) 
				this.currentView.teardown();

			$("#content").html( view.render().el );

			this.currentView = view;

			if($('#app').is(":hidden")) {
				$('#app').fadeIn();	
			}
		}

	});
	return AppRouter;
});
