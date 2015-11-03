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
			'loadProfile': 'loadProfile',
			'updateNotificationsAmount': 'updateNotificationsAmount',
			'updateGeoPoint': 'updateGeoPoint', 
			'click .close-notification': 'closeNotification'
		},

		msgStack: [],

		snap: null,
		notificationSound: null,

		closeNotification: function(event) {
			event.preventDefault();
			this.$el.find('.notification-global').hide();
		}, 

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

			var msg = $('<div class="notification-global"><span class="icon bd-cross close-notification pull-right"></span></div>')
				.append(params.message)
				.addClass('notification-' + params.type)
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
				setTimeout(function() {
					self.msgStack.splice(0, 1)[0].element.remove();
					if(self.msgStack.length > 0) {
						setTimeout(manageStack, self.__MESSAGE_DELAY_BETWEEN__);
					}
				}, self.msgStack[0].time + 200);
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

		notifications: 0,
		notificationsHolder: null,

		updateNotificationsAmount: function(event, holder) {
			
			if( holder ) {	
				this.notificationsHolder = holder;
			}

			var self = this;

			var cb = function() {
				if ( self.notificationsHolder ) {
					if( self.notifications == 0)  {
						$(self.notificationsHolder).hide().find('.amount').text(self.notifications);
					} else {
						if($(self.notificationsHolder).find('.amount').text() < self.notifications) {
							var delta = self.notifications - $(self.notificationsHolder).find('.amount').text();
							$(document).trigger('globalInfo', 'You have '+delta+' new notification'+ (delta == 1 ? '' : 's.' ) );
						}
						console.log(self.notificationsHolder);
						console.log(self.notifications);
						$(self.notificationsHolder).show().find('.amount').text(self.notifications);
					}
				}
			};

			this.checkNotifications(cb);

		},

		checkNotifications: function(cb) {
			var self = this;
			var query = new Parse.Query(Parse.Object.extend("Notification"));
			query.equalTo('to', Parse.User.current().get('profile'));
			query.equalTo('read', undefined);
			query.count().then(function(total) {
				self.notifications = total;
				cb();
			});
		},

		loadProfile: function(event, cb) {

			var self = this;
			
			Parse.User.current().get("profile").fetch().then(function(profile) {

				self.updateNotificationsAmount();
				setInterval(function() { 
					if( Parse.User.current() ) {
						self.updateNotificationsAmount() 
					}
				}, 10 * 1000);

				if( window.installation.token ) {
					Parse.Cloud.run('attachUserProfileToInstallation', {
						token: window.installation.token,
						user: Parse.User.current().id,
						profile: profile.id,
					}).then(function(){}, function(error){});
				}
				
				self.snap = new Snap({
					element: document.getElementById('content'),
					disable: 'right',
					hyperextensible: false,
					easing: 'ease',
					transitionSpeed: 0.3,
					tapToClose: true,
					// minDragDistance: 20,
					touchToDrag: false,
				});

				$('#app').append( new DrawerView({ model: profile }).render().el );

				// ToDo add this value in parse config.
				setInterval(self.updateGeoPoint, self.__POSITION_REFRESH_DELAY__);
				self.updateGeoPoint(cb);
				
			}, function() {
				// At this point, the router is not initialize, so we logOut in a hard way
				Parse.User.logOut();
				facebookConnectPlugin.logout();
				cb();
			});

		},
		
		checkVersion: function(cb) {
			navigator.appInfo.getVersion(function(version) {
				var _cv = Parse.Config.current().get('CURRENT_VERSION').split('.');
				var _v = version.split('.');

				var versionS = parseInt(_v[0]) <  parseInt(_cv[0]);
				var versionE = parseInt(_v[0]) == parseInt(_cv[0]);
				var majorS   = parseInt(_v[1]) < parseInt(_cv[1]);
				var majorE   = parseInt(_v[1]) == parseInt(_cv[1]);
				var minorS   = parseInt(_v[2]) < parseInt(_cv[2]);

				if( versionS || (versionE && majorS) || (versionE && majorE && minorS) ) {
					navigator.notification.alert(
						'It looks like you’re using an older version of BoatDay. Download the newest version of the app to get the latest bells and whistles!',
						function() {
							window.open('itms-apps://itunes.apple.com/us/app/boatday/id953574487', '_system');
						},
						'It’s time for an Update!',
						'Update'
					);
				} else {
					if( cb ) {
						cb();
					}
				}
			});
		},

		initialize: function( cb ) {

			var self = this;
			
			// self.notificationSound = new Media("resources/sfx/notification.wav");

			Parse.Config.get().then(function(config) {

				self.checkVersion(function() {
					if( Parse.User.current() && Parse.User.current().get("profile") ) {
						self.loadProfile(event, cb);
					} else {
						cb();
					}
				});
				
			});

			setInterval(function() {
				Parse.Config.get().then(function() {
					self.checkVersion();
				})
			}, 120 * 1000);

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

		updateGeoPoint: function(cb) {

			if(!Parse.User.current()) {
				cb();
				// Even if we start the timer after checking the existence
				// of a current user AND a ready state in the profile,
				// we still want to insure that the user is still connected
				// in may happen that the user just sign out or other not
				// planned events.
				return;
			
			}

			var positionError = function (error) {
				console.log(error);
				cb();
			};

			navigator.geolocation.getCurrentPosition(function(position) {
				Parse.User.current().get("profile").save({ 
					position: new Parse.GeoPoint({ 
						latitude: position.coords.latitude, 
						longitude: position.coords.longitude 
					})
				}).then(cb, positionError);
			}, positionError);

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