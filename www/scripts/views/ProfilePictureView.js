define([
'views/BaseView',
'text!templates/ProfilePictureTemplate.html'
], function(BaseView, ProfilePictureTemplate){
	var ProfilePictureView = BaseView.extend({

		className: 'screen-profile-picture',

		template: _.template(ProfilePictureTemplate),

		events: {
			'click .take-picture': 'takePicture',
			'click .open-gallery': 'openGallery',
			'click .save': 'save',
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

		render: function() {

			BaseView.prototype.render.call(this);
			
			// ToDo (check other files for it)
			// - we may not need this code. 
			// - In one of the last releases, we put this control in the render function of the BaseView
			// - Need to try & test before deleting it
			if( !this.drawer ) {
				this.$el.find('.btn-drawer').hide();
			}

			return this;
		},

		save: function() {

			var self = this;

			if( self.loading('.save') ) {
				return ;
			}

			self.cleanForm();

			/*
			if( !this.profileSetup && !this.tempPicture ) {
				Parse.history.navigate("profile-home", true);
				return;
			}
			*/

			var profileUpdateSuccess = function() {
				
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
					self.loading();
					self._info('Profile saved');
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
				about: self._input('about').val()
			};

			this.model.save(data).then(profileUpdateSuccess, profileUpdateError);

		},

		openGallery: function() {
			
			var self = this;

			if( self.isLoading('button.open-gallery') ) {
				return;
			}

			self.loading('button.open-gallery');

			var pictureSaveSuccess = function(imageData) {

				self.tempPicture = new Parse.File("picture.jpeg", { base64: imageData }, "image/jpeg");
				self.tempPicture.save().then(profileUpdate, pictureSaveError);
				
			};

			var profileUpdate = function(picture) {

				self.loading();
				self.tempPicture = picture;
				self.$el.find('.profile-picture').css({ backgroundImage: 'url(' + picture.url() + ')' });

			};

			var pictureSaveError = function(error) {

				self.loading();
				console.log(error);
				if( error != "no image selected" ) {
					self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');
				}

			};

			navigator.camera.getPicture(pictureSaveSuccess, pictureSaveError, self.__GLOBAL_CAMERA_OPEN_GALLERY__);
		},

		takePicture: function() {

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
				self.$el.find('.profile-picture').css({ backgroundImage: 'url(' + picture.url() + ')' });

			};

			var pictureSaveError = function(error) {

				self.loading();
				console.log(error);
				if( error != "no image selected" ) {
					self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');
				}
			};

			navigator.camera.getPicture(pictureSaveSuccess, pictureSaveError, self.__GLOBAL_CAMERA_TAKE_PICTURE__);

		}
	});
	return ProfilePictureView;
});