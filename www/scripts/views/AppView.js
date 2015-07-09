define([
'jquery',
'parse',
'views/DrawerView'
], function($, Parse, DrawerView){
	var AppView = Parse.View.extend({

		// Refresh the position every 30 minutes
		// delay 1800000in miliseconds
		__POSITION_REFRESH_DELAY__: 1800000,

		// Delay for messages in queu
		__MESSAGE_DELAY_BETWEEN__: 300,

		el: document,

		events: {
			'click header .btn-drawer' : 'openDrawer',
			'click .snap-drawers a': 'closeDrawer',
			'click .snap-drawers .top': 'closeDrawer',
			'click a.open-browser': 'openExternalLink',
			'globalError': 'displayError',
			'globalInfo': 'displayInfo',
			'globalMessage': 'displayMessage',
			'disableDrawer': 'disableDrawer',
			'enableDrawer': 'enableDrawer',
			'menuHover': 'menuHover',
			'loadProfile': 'loadProfile'
		},

		msgStack: [],

		snap: null,

		displayError: function(event, message) {

			this.displayMessage(event, {type: 'error', message: message});

		},

		displayInfo: function(event, message) {

			this.displayMessage(event, {type: 'info', message: message});

		},

		displayMessage: function(event, params) {
			
			var self = this;
			var hasHeader = $('header').length != 0;

			// Lets imagine one line is arround 50 characters
			// a normal person will take 3 seconds to read and understand the information
			// we divide the total amount of chars and round to the top
			var timeSec = Math.ceil(params.message.length / 75) * 5;

			var msg = $('<div class="message"><span class="icon icon-info"></span> </div>')
				.append(params.message)
				.addClass('message-' + params.type)
				.css({
					'-webkit-animation-duration': timeSec+'s',
					paddingTop: StatusBar.isVisible ? 20 : 10
				});

			var manageStack = function() {
				$('#app').append(self.msgStack[0].element);
				// We add 200 ms more than the time that we want the message
				// to stay on screen. The messages are fadeOut by a CSS transition
				// acting like that we insure that the message will not be
				// brutally removed before the end of the transition
				setTimeout(deleteMessage, self.msgStack[0].time + 200);
			};

			var deleteMessage = function() {
				var e = self.msgStack.splice(0, 1);
				e[0].element.remove();

				if(self.msgStack.length > 0) {
					setTimeout(manageStack, self.__MESSAGE_DELAY_BETWEEN__);
				}
			};

			self.msgStack.push({ element: msg, time: timeSec*1000 });

			if(self.msgStack.length == 1) {
				manageStack();
			}

		},

		menuHover: function(event, section) {

			$('.snap-drawer').find('.table-view-cell.active').removeClass('active');
			$('.snap-drawer').find('a[href="#/' + section + '"]').closest('.table-view-cell').addClass('active');

		},

		loader: function() {

			$('#loader').toggle();

		},

		openExternalLink: function(event) {

			event.preventDefault();
			window.open($(event.currentTarget).attr('href'), '_system');
			return;

		},

		loadProfile: function(event, cb) {


			var self = this;

			var profileSuccess = function(profile) {

				self.snap = new Snap({
					element: document.getElementById('content'),
					disable: 'right',
					hyperextensible: false,
					easing: 'ease',
					transitionSpeed: 0.3,
					tapToClose: true
				});

				$('#app').append( new DrawerView({ model: profile }).render().el );

				// ToDo add this value in parse config.
				setInterval(self.updateGeoPoint, self.__POSITION_REFRESH_DELAY__);
				self.updateGeoPoint();
				if( cb ) cb();

			}

			var forceLogout = function() {
				// At this point, the router is not initialize, so we logOut in a hard way
				Parse.User.logOut();
				facebookConnectPlugin.logout();
			}

			// Cache config
			Parse.Config.get().then(function(config) {
				// Cache profile
				if( Parse.User.current() && Parse.User.current().get("profile") ) {
					Parse.User.current().get("profile").fetch().then(profileSuccess, forceLogout);
				} else {
					if( cb ) cb();
				}
			});
		},

		initialize: function( cb ) {

			var self = this;

			self.loadProfile(event, cb);
			
			
			// prevent bug on feedback page with a jumping keyboard
			var touchstart = function (e) {
				if (!isTextInput(e.target) && isTextInput(document.activeElement)) {
					document.activeElement.blur();
					e.preventDefault();
				}
			}
			function isTextInput(node) { return ['INPUT', 'TEXTAREA'].indexOf(node.nodeName) !== -1; }
			document.addEventListener('touchstart', touchstart, false);


		},

		updateGeoPoint: function() {

			if(!Parse.User.current()) {
				
				// Even if we start the timer after checking the existence
				// of a current user AND a ready state in the profile,
				// we still want to insure that the user is still connected
				// in may happen that the user just sign out or other not
				// planned events.
				return;
			
			}

			var positionError = function (error) {
				console.log(error);
			};

			var positionSuccess = function(position) {

				var geopoint = new Parse.GeoPoint({ 
					latitude: position.coords.latitude, 
					longitude: position.coords.longitude 
				});

				Parse.User.current().get("profile").save({ position: geopoint }).then(function(){}, positionError);
			};

			navigator.geolocation.getCurrentPosition(positionSuccess, positionError);

		},

		openDrawer: function() {
			if( this.snap.state().state == "left" ){
				this.snap.close();
			} else {
				this.snap.open('left');
			}
		},

		closeDrawer: function(event) {

			if( this.snap.state().state == "left" ) {
				this.snap.close();
			}

		},
		
		disableDrawer: function() {
			if( this.snap ) {
				this.snap.disable();
			}
		},

		enableDrawer: function() {
			if( this.snap ) {
				this.snap.enable();
			}
		}

	});
	return AppView;
});