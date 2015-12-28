define([
'jquery',
'views/DrawerView',
'views/MissingInfoView',
], function($, DrawerView, MissingInfoView){
	var AppView = Parse.View.extend({

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
			'missing-info': 'showMissingInfo', 
			'click .close-notification': 'closeNotification'
		},

		msgStack: [],
		snap: null,
		notifications: 0,
		notificationsHolder: null,

		showMissingInfo: function(event, parentView) {
			parentView.modal(new MissingInfoView());
		},

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
						setTimeout(manageStack, Parse.Config.current().get('MESSAGE_DELAY_BETWEEN'));
					}
				}, self.msgStack[0].time + 200);
			};


			self.msgStack.push({ element: msg, time: timeSec * 1000 });

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

				if( window.BDHelper.installationId ) {
					Parse.Cloud.run('attachUserProfileToInstallationWithInstallationId', {
						installationId: window.BDHelper.installationId,
						user: Parse.User.current().id,
						profile: profile.id,
					}).then(function(){
						console.log('~> attachUserProfileToInstallationWithInstallationId - success') 
					}, function(error){ 
						console.log('~> attachUserProfileToInstallationWithInstallationId - Cannot attach profile') 
						console.log(error);
					});
				}

				self.snap = new Snap({
					element: document.getElementById('content'),
					disable: 'right',
					hyperextensible: false,
					easing: 'ease',
					transitionSpeed: 0.3,
					tapToClose: true,
					touchToDrag: false,
				});
				
				$('#app').append( new DrawerView({ model: profile }).render().el );

				setInterval(self.updateGeoPoint, Parse.Config.current().get('POSITION_REFRESH_DELAY') );
				self.updateGeoPoint(cb);

			}, function() {
				Parse.User.logOut();
				facebookConnectPlugin.logout();
				cb();
			});
		},
		
		checkVersion: function(cb) {
			var _cv = Parse.Config.current().get( window.isAndroid ? 'CURRENT_VERSION_ANDROID' : 'CURRENT_VERSION_IOS' ).split('.');
			var _v = window.BDHelper.remoteVersion.split('.');

			var versionS = parseInt(_v[0]) <  parseInt(_cv[0]);
			var versionE = parseInt(_v[0]) == parseInt(_cv[0]);
			var majorS   = parseInt(_v[1]) < parseInt(_cv[1]);
			var majorE   = parseInt(_v[1]) == parseInt(_cv[1]);
			var minorS   = parseInt(_v[2]) < parseInt(_cv[2]);

			if( versionS || (versionE && majorS) || (versionE && majorE && minorS) ) {
				navigator.notification.alert(
					'It looks like you’re using an older version of BoatDay. Download the newest version of the app to get the latest bells and whistles!',
					function() {
						if ( window.isAndroid ) {
							window.open('https://play.google.com/store/apps/details?id=com.boat.day', '_system');
						} else {
							window.open('itms-apps://itunes.apple.com/us/app/boatday/id953574487', '_system');
						}
					},
					'It’s time for an Update!',
					'Update'
				);
			} else {
				if( cb ) {
					cb();
				}
			}
		},

		initialize: function( cb ) {

			var self = this;

			Parse.Config.get().then(function() {

				self.checkVersion(function() {
					if( Parse.User.current() && Parse.User.current().get("profile") ) {
						self.loadProfile(event, cb);
					} else {
						cb();
					}
				});

				setInterval(function() {
					Parse.Config.get().then(function() {
						self.checkVersion();
					});
				}, Parse.Config.current().get('CHECK_CONFIG_INTERVAL') );
			});

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
				console.log('~> Error with position');
				console.log(error);
				cb();
			};

			if( window.isAndroid ) {
				cb();
			} else {
				navigator.geolocation.getCurrentPosition(function(position) {
					Parse.User.current().get("profile").save({ 
						position: new Parse.GeoPoint({ 
							latitude: position.coords.latitude, 
							longitude: position.coords.longitude 
						})
					}).then(cb, positionError);
				}, positionError);
			}
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