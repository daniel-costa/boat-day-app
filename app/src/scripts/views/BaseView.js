define(['models/ProfileModel'], function(ProfileModel) {
	var BaseView = Parse.View.extend({

		subViews: [],

		statusbar: true,
		drawer: true,
		isModal: false,
		renderParent: false,

		checkForMissingInfo: true,

		isUndefinedOrNull: function(variable) {
			return typeof variable === typeof undefined || variable === null;
		},

		afterRenderInsertedToDom: function() {
			if( this.checkForMissingInfo && ( this.isUndefinedOrNull(Parse.User.current().get('email')) || this.isUndefinedOrNull(Parse.User.current().get('profile').get('birthday')) || this.isUndefinedOrNull(Parse.User.current().get('profile').get('phone')) || this.isUndefinedOrNull(Parse.User.current().get('profile').get('firstName')) || this.isUndefinedOrNull(Parse.User.current().get('profile').get('lastName')) ) ) {
				$(document).trigger('missing-info', this);
			}
		},
		
		getBoatDayTitle: function(id) {
			switch(id) {
				case 'leisure' : return 'Leisure'; break;
				case 'sports'  : return 'Water Sports'; break;
				case 'sailing' : return 'Sailing'; break;
				case 'fishing' : return 'Fishing'; break;
			}
		},

		filtersDefined: function() {
			return typeof Parse.User.current().get('profile').get('filters') !== typeof undefined;
		},

		hideOverlay: function(overlay) {
			overlay.find('.overlay-close').click();
		},

		parseUndefined: function(field) {
			return typeof field !== typeof undefined ? field : '';
		},

		splitURLParams: function(string){

			var array = {};
			var pair;
			var token = /([^&=]+)=?([^&]*)/g;

			var re_space = function(s){
				return decodeURIComponent(s.replace(/\+/g, " "));
			};

			while (pair = token.exec(string)) {
				array[re_space(pair[1])] = re_space(pair[2]);
			}

			return array;

		},

		getGuestRate: function(type) {
			return type == 'business' ? Parse.Config.current().get("PRICE_GUEST_CHARTER_PART") : Parse.Config.current().get("PRICE_GUEST_PRIVATE_PART");
		},

		modal: function(view, from) {

			var self = this;

			view.className = view.className + ' modal ' + ( typeof from !== typeof undefined ? 'from-' + from : '') ;
			view.drawer = false;
			view.isModal = true;
			view.$el.attr('class', view.className);

			var $el = view.render().$el;
			$('#content').append($el);

			view.on('close', function(event, data) {

				var data = typeof data === typeof undefined ? {} : data;

				self.handleStatusBarAndDrawer(self.statusbar, self.drawer);
				
				if( data.render ) {
					self.render();
				}

				if( view.renderParent ) {
					view.parentView.render();
				}
				
				$el.removeClass('active');

				setTimeout(function() { 
					view.teardown();
				}, 1000);

			});
			
			setTimeout(function() { 
				$el.addClass('active');
				view.afterRenderInsertedToDom();
			}, 100);

		},

		overlay: function(view) {

			var self = this;

			view.className = view.className + ' overlay';
			view.isOverlay = true;
			view.$el.attr('class', view.className);

			var $el = view.render().$el;
			$el.insertAfter(this.$el);

			view.on('close', function(data) {

				var data = typeof data === typeof undefined ? {} : data;
				
				if( data.render ) {
					self.render();
				}

				$el.removeClass('active');

				setTimeout(function() { 
					view.teardown();
				}, 1000);

			});
			
			setTimeout(function() { 
				$el.addClass('active');
			}, 100);

		},

		censorEmailFronString: function(str) {

			var pattern = /[^@\s]*@[^@\s]*\.[^@\s]*/g;
			var replacement = "[censored]";
			return str.replace(pattern, replacement);

		},

		censorLinksFronString: function(str) {

			// var pattern = /[a-zA-Z]*[:\/\/]*[A-Za-z0-9\-_]+\.+[A-Za-z0-9\.\/%&=\?\-_]+/ig;
			var pattern = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/ig;
			var replacement = "[censored]";
			return str.replace(pattern, replacement);

		},

		censorPhoneNumbersFronString: function(str) {

			var pattern = /(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/ig;
			var replacement = "[censored]";
			return str.replace(pattern, replacement);

		},

		censorAll: function(str) {

			return  this.censorPhoneNumbersFronString(this.censorLinksFronString(this.censorEmailFronString(str)));

		},

		censorField: function(event) {

			$(event.currentTarget).val( this.censorAll($(event.currentTarget).val()));
			
		},
		
		close: function(data) {
			this.trigger('close', data);
		},

		getGuestPrice: function(price, guestPart) {
			return Math.ceil(price / (1 - guestPart)) - (Parse.Config.current().get("PRICE_SEAT_DISCOUNT_USD") !== 0 ? Parse.Config.current().get("PRICE_SEAT_DISCOUNT_USD") : 0);
		},

		getGuestFee: function(price, guestPart) {
			return Math.ceil(price / (1 - guestPart)) - price;
		},

		render: function( init ) {
			
			var self = this;

			var data = {
				self: self
			};
			
			if( self.templateData ) {
				_.extend(data, self.templateData);
			}
			
			if( self.model ) {
				_.extend(data, self.model._toFullJSON());
			}
			
			if(self.collection) {
				_.extend(data, { collection: self.collection.toJSON() });
			} 
			
			self.$el.html(self.template(data));
			
			self.handleStatusBarAndDrawer(self.statusbar, self.drawer);

			if( window.isAndroid ) {
				self.$el.on('focus', 'input, textarea', function(event) {
					self.fieldFocus($(event.currentTarget));
				});

				self.$el.on('blur', 'input, textarea', function(event) {
					self.fieldBlur($(event.currentTarget));
				});
			}

			self.$el.on('click', '.close-me', function(event, data) {
				self.trigger('close', data);
			});

			console.log('~> Render View "' + self.className + '"');
			
			return self;
		},

		fieldFocus: function(target) {
			this.$el.find('header, footer').fadeOut();
		},

		fieldBlur: function(target) {
			this.$el.find('header, footer').fadeIn();
		},

		handleStatusBarAndDrawer: function(sb, drawer) {			
			if( sb ) {
				StatusBar.show();
			} else {
				StatusBar.hide();
			}
		},

		cleanForm: function() {
			this.$el.find('.field-flag-error').removeClass('field-flag-error');
		},

		fieldError: function(field, message) {

			// add to label
			this.$el.find('[for="'+field+'"]').addClass('field-flag-error');

			if(this._input(field).length > 0) {
				// add to field
				this._input(field).addClass('field-flag-error');
			} else {
				// add to fake element
				this.$el.find('.'+field).addClass('field-flag-error');
			}

		},

		dateParseToDisplayDate: function (date) {
			
			return this.dayToEnDay(new Date(date.iso ? date.iso : date).getDay()) + ' ' + new Date(date.iso ? date.iso : date).toLocaleDateString();

		},

		dateToEnBoatDayCard: function(date) {
			var date = new Date(date.iso ? date.iso : date);
			return this.dayToEnDay(date.getDay()) + ', ' + ( date.getMonth() + 1 ) + '/' + date.getDate();
		},

		dayToEnDay: function(n) {
			switch(n) {
				case 0 : return 'Sun'; break;
				case 1 : return 'Mon'; break;
				case 2 : return 'Tue'; break;
				case 3 : return 'Wed'; break;
				case 4 : return 'Thur'; break;
				case 5 : return 'Fri'; break;
				case 6 : return 'Sat'; break;
			}
		},

		monthToEnShort: function(n) {
			switch(n) {
				case 0 : return 'Jan'; break;
				case 1 : return 'Feb'; break;
				case 2 : return 'Mar'; break;
				case 3 : return 'Apr'; break;
				case 4 : return 'May'; break;
				case 5 : return 'Jun'; break;
				case 6 : return 'Jul'; break;
				case 7 : return 'Aug'; break;
				case 8 : return 'Sep'; break;
				case 9 : return 'Oct'; break;
				case 10 : return 'Nov'; break;
				case 11 : return 'Dec'; break;
			}
		},

		monthToEn: function(n) {
			switch(n) {
				case 0 : return 'January'; break;
				case 1 : return 'February'; break;
				case 2 : return 'March'; break;
				case 3 : return 'April'; break;
				case 4 : return 'May'; break;
				case 5 : return 'June'; break;
				case 6 : return 'July'; break;
				case 7 : return 'August'; break;
				case 8 : return 'September'; break;
				case 9 : return 'October'; break;
				case 10 : return 'November'; break;
				case 11 : return 'December'; break;
			}
		},

		dateForProfileReview: function(date) {
			var d = new Date(date.iso ? date.iso : date);
			return this.monthToEnShort(d.getMonth()) + ' ' + d.getDate() + ', ' + d.getFullYear();
		},

		dateForProfileSince: function(date) {
			var d = new Date(date.iso ? date.iso : date);
			return this.monthToEn(d.getMonth()) + ', ' + d.getFullYear();
		},

		departureTimeToDisplayTime: function(time) {

			var h = parseInt(time);
			var mm = (time-h) * 60;
			var dd = 'am';

			if( h >= 12 ) {
				dd = 'pm';
				h -= 12;
			}

			return (h==0?12:h)+':'+(mm==0?'00':+(mm < 10 ? '0'+mm : mm))+' '+dd;
			
		},
		
		teardown: function() {

			if( this.model ) {
				this.model.off(null, null, this);
			}

			// _.each(this.subViews, function(view) {

				// Bug making a while !?!
				// view.teardown();

			// });

			this.remove();

		},

		loading: function( btn ) {
			
			if( btn ) {
	
				if( typeof btn === 'string' ) {
					btn = this.$el.find(btn);
				}

				if( btn.hasClass('loading') ) {
					return true;
				} else {
					btn.addClass('loading').attr('disabled', true);
					return false;
				}

			} else {

				this.$el.find('.loading').removeClass('loading').removeAttr('disabled');

			}
			
		},

		isLoading: function( btn ) {

			if( typeof btn === 'string' ) {
				btn = this.$el.find(btn);
			}

			return btn.hasClass('loading')
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

		getCityFromLocation: function(location) {

			var l = location.split(',');

			if( l.length == 0 ) {
				return '';
			}

			if( l.length == 1 ) {
				return l[0].trim();
			}

			if( l.length > 1 ) {
				return l[l.length - 2].trim();
			}

		},

		defineFilters: function() {

			if( this.filtersDefined() ) {
				return Parse.User.current().get('profile').get('filters');
			} else {
				return {
					position: {
						name: 'my-location',
						latitude: null,
						longitude: null
					},
					category: 'all',
					price: null,
					seats: null,
					date: null,
				};
			}
		},

		createProfileForUser: function() {

			var self = this;

			var readyToInit = function() {
				$(document).trigger('loadProfile', function() {
					Parse.history.navigate('boatdays', true);
				});
			};
			
			var handleErrors = function(error) {
				console.log("~> handleErrors with error:");
				console.log(error);

				if(error.code == 209) {
					Parse.history.navigate('sign-out', true);
				}
				
				self.loading();
				self._error("Oops... something wrong happen. Please, try later");
			};

			if( Parse.User.current().get("profile") ) {
				readyToInit();
			} else {
				new ProfileModel({ 
					user: Parse.User.current() 
				}).save().then(function(profile) {
					Parse.User.current().save({ 
						profile: profile,
						type: "guest"
					}).then(function() {
						readyToInit();
					}, handleErrors);
				}, handleErrors);
			}
		},
		
		signUpSignInWithfacebook: function() {

			Parse.Analytics.track('sign-in-facebook');

			var self = this;

			if( self.loading('.facebook') ) {
				return ;
			}

			var transferError = function(error, err) {
				console.log(error)
				console.log(err);
				self.loading();
				self._error("Oops... something wrong happen. Please, try later");
				Parse.history.navigate('sign-out', true);
			};

			facebookConnectPlugin.login(["public_profile", "email", "user_about_me", "user_birthday", "user_friends"], function(userData) {
				
				if ( !userData.authResponse ){
					transferError("Cannot find the authResponse");
					return;
				}

				Parse.FacebookUtils.logIn({
					id: String(userData.authResponse.userID),
					access_token: userData.authResponse.accessToken,
					expiration_date: new Date(new Date().getTime() + userData.authResponse.expiresIn * 1000).toISOString()
				}).then(function(user) {
					self.createProfileForUser();
				}, transferError);
			}, transferError);
		},
		
		_input: function(name) {
			return this.$el.find('[name="'+name+'"]');
		},

		_in : function(name) { return this._input(name) },

		_error: function(message) {
			$(document).trigger('globalError', message);
		},

		_info: function(message) {
			$(document).trigger('globalInfo', message);
		}, 

	});
	return BaseView;
});