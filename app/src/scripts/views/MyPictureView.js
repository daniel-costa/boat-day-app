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
			'click .credit-card' : 'showCreditCards'
		},

		profileSetup: false,
		tempPicture: null,

		// ToDo optimize the methods to have less repetitions in takePicture and openGallery
		initialize: function(data) {

			this.profileSetup = data ? data.setup : false;
			this.drawer = !this.profileSetup;
			
			if( this.model.get('profilePicture') ) {
				this.tempPicture = this.model.get('profilePicture');
			}
		},
		
		showCreditCards: function() {

			if( this.profileSetup ) {
				this.overlay(new CreditCardView());
			} else {
				this.overlay(new PaymentsView());
			}

		}, 

		save: function() {

			var self = this;

			if( self.loading('.save') ) {
				return ;
			}

			self.cleanForm();

			var profileUpdateSuccess = function() {
				
				Parse.Analytics.track('profile-save');

				if( self.profileSetup ) {
					$(document).trigger('loadProfile', function() {
						var Notification = Parse.Object.extend('Notification');
						new Notification().save({
							action: 'bd-message',
							fromTeam: true,
							message: Parse.Config.current().get('WELCOME_MESSAGE_GUEST'),
							to: Parse.User.current().get('profile'),
							sendEmail: false
						}).then(function() {
							Parse.history.navigate("profile-payments", true);
						});
					});
				} else {
					$(document).trigger('loadProfile', function() {
						self.loading();
						self._info('Profile saved');
					});
				}

			};

			var profileUpdateError = function(error) {
				if( error.type && error.type == 'model-validation' ) {
					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});
					self.loading();
					self._error('One or more fields contain errors.');
				} else {
					self.loading();
					self._error(error);
				}
			};

			var data = { 
				status: 'complete',
				profilePicture : self.tempPicture,
				about: self._input('about').val(), 
				firstName: self._input('name').val(), 
				lastName: self._input('lastName').val(), 
				phone: self._input('phone').val(), 
				birthday: self._input('birthDate').val() ? new Date(this._input('birthDate').val()) : null
			};

			this.model.save(data).then(profileUpdateSuccess, profileUpdateError);

		},

		openGallery: function() {
			
			Parse.Analytics.track('profile-open-gallery');

			var self = this;

			if( self.loading('.open-gallery') ) {
				return;
			}

			var pictureSaveSuccess = function(imageData) {
				self.tempPicture = new Parse.File("picture.jpeg", { base64: imageData }, "image/jpeg");
				self.tempPicture.save().then(profileUpdate, pictureSaveError);
			};

			var profileUpdate = function(picture) {
				self.loading();
				self.tempPicture = picture;
				self.$el.find('.guest-picture').css({ backgroundImage: 'url(' + picture.url() + ')' });
			};

			var pictureSaveError = function(error) {

				self.loading();

				if( error != "no image selected" ) {
					self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');
				}
			};

			navigator.camera.getPicture(pictureSaveSuccess, pictureSaveError, self.__GLOBAL_CAMERA_OPEN_GALLERY__);
		},

		takePicture: function() {

			Parse.Analytics.track('profile-take-picture');

			var self = this;

			if( self.loading('.take-picture') ) {
				return ;
			}

			var pictureSaveSuccess = function(imageData) {
				self.tempPicture = new Parse.File("picture.jpeg", { base64: imageData }, "image/jpeg");
				self.tempPicture.save().then(profileUpdate, pictureSaveError);
			};

			var profileUpdate = function(picture) {
				self.loading();
				self.tempPicture = picture;
				self.$el.find('.guest-picture').css({ backgroundImage: 'url(' + picture.url() + ')' });
			};

			var pictureSaveError = function(error) {
				self.loading();
				if( error != "no image selected" ) {
					self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');
				}
			};

			navigator.camera.getPicture(pictureSaveSuccess, pictureSaveError, self.__GLOBAL_CAMERA_TAKE_PICTURE__);

		}
	});
	return MyPictureView;
});