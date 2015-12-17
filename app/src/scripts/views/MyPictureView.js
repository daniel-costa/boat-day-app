define([
'views/BaseView',
'views/CreditCardView',
'views/PaymentsView',
'text!templates/MyPictureTemplate.html'
], function(BaseView, CreditCardView, PaymentsView, MyPictureTemplate){
	var MyPictureView = BaseView.extend({

		className: 'screen-my-picture',

		template: _.template(MyPictureTemplate),

		events: {
			'click .take-picture': 'takePicture',
			'click .open-gallery': 'openGallery',
			'click .save'		 : 'save',
			'click .credit-card' : 'showCreditCards',
			'click .sign-out'    : 'signOut',
		},

		setup: false,
		tempPicture: null,

		checkForMissingInfo: false,

		// ToDo optimize the methods to have less repetitions in takePicture and openGallery
		initialize: function(data) {

			this.setup = data ? data.setup : false;
			this.drawer = !this.setup;

			if( this.model.get('profilePicture') ) {
				this.tempPicture = this.model.get('profilePicture');
			}
		},
		
		render: function() {
			BaseView.prototype.render.call(this);

			if( this.setup ) {
				this.$el.find('.close-me').hide();
			}

			return this;
		},
		
		signOut: function() {
			Parse.history.navigate('sign-out', true);
		},

		showCreditCards: function() {

			if( this.setup ) {
				this.overlay(new CreditCardView());
			} else {
				this.overlay(new PaymentsView());
			}

		}, 

		fieldFocus: function(target) {
			this.$el.find('header, footer, .credit-card, .header, .data-ro').fadeOut();
		},

		fieldBlur: function(taret) {
			this.$el.find('header, footer, .credit-card, .header, .data-ro').fadeIn();
		},

		save: function() {

			var self = this;

			if( self.loading('.save') ) {
				return ;
			}

			self.cleanForm();

			this.model.save({ 
				status: 'complete',
				profilePicture : self.tempPicture,
				about: self._input('about').val(), 
				firstName: self._input('name').val(), 
				lastName: self._input('lastName').val(), 
				phone: self._input('phone').val(), 
				birthday: self._input('birthDate').val() ? new Date(this._input('birthDate').val()) : null
			}).then(function() {
				Parse.Analytics.track('profile-save');
				if( self.setup ) {
					$(document).trigger('loadProfile', function() {
						var Notification = Parse.Object.extend('Notification');
						new Notification().save({
							action: 'bd-message',
							fromTeam: true,
							message: Parse.Config.current().get('WELCOME_MESSAGE_GUEST'),
							to: Parse.User.current().get('profile'),
							sendEmail: false
						}).then(function() {
							Parse.history.navigate("boatdays", true);
						});
					});
				} else {
					$(document).trigger('loadProfile', function() {
						self.loading();
						self._info('Profile saved');
					});
				}
			}, function(error) {
				if( error.type && error.type == 'model-validation' ) {
					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});
					error = 'One or more fields contain errors.';
				}
				self.loading();
				self._error(error);
			});

		},

		openGallery: function() {
			
			Parse.Analytics.track('profile-open-gallery');

			var self = this;

			if( self.loading('.open-gallery') ) {
				return;
			}

			navigator.camera.getPicture(function(imageData) {
				self.tempPicture = new Parse.File("picture.jpeg", { base64: imageData }, "image/jpeg");
				self.tempPicture.save().then(function(picture) {
					self.loading();
					self.tempPicture = picture;
					self.$el.find('.guest-picture').css({ backgroundImage: 'url(' + picture.url() + ')' });
				});
			}, function(error) {
				self.loading();
				if( error == 'bad-format' ) {
					self._error('Picture must be in JPEG format');
				} else if( error != "no image selected" ) {
					self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');
				}
			}, {
				quality: 50,
				destinationType: 0,
				saveToPhotoAlbum: false,
				correctOrientation: true,
				sourceType: 0,
				mediaType: 0
			});
		},

		takePicture: function() {

			Parse.Analytics.track('profile-take-picture');

			var self = this;

			if( self.loading('.take-picture') ) {
				return ;
			}

			navigator.camera.getPicture(function(imageData) {
				self.tempPicture = new Parse.File("picture.jpeg", { base64: imageData }, "image/jpeg");
				self.tempPicture.save().then(function(picture) {
					self.loading();
					self.tempPicture = picture;
					self.$el.find('.guest-picture').css({ backgroundImage: 'url(' + picture.url() + ')' });
				});
			}, function(error) {
				self.loading();
				if( error == 'bad-format' ) {
					self._error('Picture must be in JPEG format');
				} else if( error != "no image selected" ) {
					self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');
				}
			}, {
				quality: 50,
				destinationType: 0,
				saveToPhotoAlbum: false,
				correctOrientation: true,
				cameraDirection: 1,
			});
		}
	});
	return MyPictureView;
});