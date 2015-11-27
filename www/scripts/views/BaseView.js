define([
'parse'
], function(Parse){
	var BaseView = Parse.View.extend({

		subViews: [],

		__GLOBAL_CAMERA_TAKE_PICTURE__: {
			quality: 50,
			destinationType: Camera.DestinationType.DATA_URL,
			saveToPhotoAlbum: false,
			cameraDirection: Camera.Direction.FRONT,
			correctOrientation: true
		},

		__GLOBAL_CAMERA_OPEN_GALLERY__: {
			quality: 50,
			destinationType: Camera.DestinationType.DATA_URL, // base 64
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			mediaType: Camera.MediaType.PICTURE,
			saveToPhotoAlbum: false,
			correctOrientation: true
		},

		statusbar: true,
		drawer: true,
		isModal: false,
		renderParent: false,

		afterRenderInsertedToDom: function() { },
		
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

			console.log(array);

			return array;

		},

		showOverlay: function(data) {

			var self = this;
			var _target = data.target;
			var _box = data.target.find('.box');

			if( _target.hasClass('active') ) {
				return ;
			}

			if( data.closeBtn && data.target.find('.overlay-close').length == 0 ) {
				$('<span class="overlay-close icon icon-close pull-right"></span>').click(function(event) {
					_target.removeClass('active');
					data.cbClose(_target);
				}).prependTo(_box);
			}

			_target.css('visibility', 'hidden').addClass('active');

			_box.css({
				marginTop: ( $(window).height() - _box.outerHeight() ) / 2
			});;

			_target.css('visibility', 'visible');
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
			// $el.insertAfter(this.$el);
			$('#content').append($el);

			$el.on('click', '.close-me', function(event, data) {

				if( typeof data == typeof undefined ) {
					var data = {};
				}

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

			$el.on('click', '.close-me', function(event, data) {

				if( typeof data == typeof undefined ) {
					var data = {};
				}
				
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
			this.$el.find('.close-me').trigger('click', data ? data : {} );
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
				self: this
			};
			
			if( this.templateData ) {
				_.extend(data, this.templateData);
			}
			
			if( this.model ) {
				_.extend(data, this.model._toFullJSON());
			}
			
			if(this.collection) {
				_.extend(data, { collection: this.collection.toJSON() });
			} 
			
			this.$el.html(this.template(data));
			
			this.handleStatusBarAndDrawer(this.statusbar, this.drawer);
			
			Keyboard.onshowing = function () {
				self.keyBoardAppear();

				if(window.isAndroid) {
					self.keyBoardAppear_Android();
				} else {
					self.keyBoardAppear_iOS();
				}
			};

			Keyboard.onhiding = function () {
				self.keyBoardDisappear();

				if(window.isAndroid) {
					self.keyBoardDisappear_Android();
				} else {
					self.keyBoardDisappear_iOS();
				}
			};

			console.log("### Render (" + this.className + ") ###");
			
			return this;
		},

		keyboardAppear: function() { },
		keyboardAppear_iOS: function() {},
		keyboardAppear_Android: function() {},
		keyBoardDisappear: function() {},
		keyBoardDisappear_iOS: function() {},
		keyBoardDisappear_Android: function() {},

		handleStatusBarAndDrawer: function(sb, drawer) {

			// ToDo
			// - Activate once drawer done
			// $(document).trigger( drawer ? 'enableDrawer' : 'disableDrawer');
			
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