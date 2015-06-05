define([
	'views/SignInView',
	'views/ProfileHomeView',
	'views/ProfileInfoView',
	'views/ProfilePictureView',
	'views/ProfilePaymentsView',
	'views/ProfileSettingsView',
	'views/BoatDaysHomeView',
	'views/BoatDaysView',
	'views/EmergencyView',
	'views/FeedbackView',
	'views/AboutUsView',
	'views/TermsView',
	'views/NotificationsView'
], function(
	SignInView, ProfileHomeView, ProfileInfoView, ProfilePictureView, ProfilePaymentsView, ProfileSettingsView, 
	BoatDaysHomeView, BoatDaysView, EmergencyView, FeedbackView, AboutUsView, TermsView, NotificationsView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			'sign-out': 'signOut',
			'boatdays-home': 'showBoatDaysHome',
			'boatdays': 'showBoatDays',
			'profile-home': 'showProfileHome',
			'profile-info': 'showProfileInfo',
			'profile-picture': 'showProfilePicture',
			'profile-payments': 'showProfilePayments',
			'profile-settings': 'showProfileSettings',
			'emergency': 'showEmergency',
			'feedback': 'showFeedback',
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

		showEmergency: function() {

			this.render(new EmergencyView());

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

		showFeedback: function() {

			var self = this;
			var cb = function(profile) {

				self.render(new FeedbackView());
				
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
			var cb = function(profile) {

				if( !Parse.User.current().get('profile').get('displayBDCategory') ) {
					
					self.render(new BoatDaysHomeView());

				} else {

					var query = new Parse.Query(Parse.Object.extend('BoatDay'));
					query.include('boat');
					query.equalTo("category", Parse.User.current().get('profile').get('displayBDCategory'));
					self.render(new BoatDaysView({ collection: query.collection()  }));

				}
				
			};

			self.handleSignedIn(cb);

		},

		showProfileHome: function() {

			var self = this;
			var cb = function() {
				self.render(new ProfileHomeView({ model: Parse.User.current().get('profile') }));
			};

			self.handleSignedIn(cb);

		},

		showProfileInfo: function() {

			var self = this;
			var cb = function(profile) {
				self.render(new ProfileInfoView({ model: profile }));
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
				self.render(new ProfilePaymentsView({ model: Parse.User.current().get('profile') }));
			};

			self.handleSignedIn(cb);

		},

		showProfileSettings: function() {

			var self = this;
			var cb = function() {
				self.render(new ProfileSettingsView({ model: Parse.User.current().get('profile') }));
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

			if( !Parse.User.current().get('profile').get("braintreeId") ) {
				self.render(new ProfilePaymentsView({ model: Parse.User.current().get('profile'), setup: true }));
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
