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

		modal: function(view) {

			var self = this;

			view.className = view.className + ' modal';
			view.drawer = false;
			view.isModal = true;
			view.$el.attr('class', view.className);

			var $el = view.render().$el;
			$el.insertAfter(this.$el);

			$el.on('click', '.close-me', function(event, data) {

				if( typeof data == typeof undefined ) {
					var data = {};
				}

				self.handleStatusBarAndDrawer(self.statusbar, self.drawer);
				
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
			console.log('**data');
			console.log(data);
			this.$el.find('.close-me').trigger('click', data ? data : {} );
		},

		getGuestPrice: function(price, guestPart) {
			return Math.ceil(price / (1 - guestPart)) - (Parse.Config.current().get("PRICE_SEAT_DISCOUNT_USD") !== 0 ? Parse.Config.current().get("PRICE_SEAT_DISCOUNT_USD") : 0);
		},

		getGuestFee: function(price, guestPart) {
			return Math.ceil(price / (1 - guestPart)) - price;
		},

		render: function( init ) {
			
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
			
			console.log("### Render (" + this.className + ") ###");
			
			return this;
		},

		handleStatusBarAndDrawer: function(sb, drawer) {

			$(document).trigger( drawer ? 'enableDrawer' : 'disableDrawer');
			
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

			if(this._input(field).length > 0) {
				this._input(field).addClass('field-flag-error');
			} else {
				this.$el.find('.'+field).addClass('field-flag-error');
			}

		},

		dateParseToDisplayDate: function (date) {
			
			return this.dayToEnDay(new Date(date.iso ? date.iso : date).getDay()) + ' ' + new Date(date.iso ? date.iso : date).toLocaleDateString();

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

		departureTimeToDisplayTime: function(time) {

			var h = parseInt(time);
			var mm = (time-h) * 60;
			var dd = 'AM';

			if( h >= 12 ) {
				dd = 'PM';
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
					btn.addClass('loading');
					return false;
				}

			} else {

				this.$el.find('.loading').removeClass('loading');

			}
			
		},

		isLoading: function( btn ) {

			if( typeof btn === 'string' ) {
				btn = this.$el.find(btn);
			}

			return btn.hasClass('loading')
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
		}

	});
	return BaseView;
});