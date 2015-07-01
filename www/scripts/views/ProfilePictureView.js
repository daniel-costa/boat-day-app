define([
'views/BaseView',
'views/ProfileReportView',
'text!templates/ProfilePictureTemplate.html'
], function(BaseView, ProfileReportView, ProfilePictureTemplate){
	var ProfilePictureView = BaseView.extend({

		className: 'screen-profile-picture',

		template: _.template(ProfilePictureTemplate),

		events: {
			'click .take-picture': 'takePicture',
			'click .open-gallery': 'openGallery',
			'click .save': 'save',
			'click .report': 'reportProfile'
		},

		profileSetup: false,
		
		tempPicture: null,

		statusbar: true,
		
		drawer: true,

		// ToDo optimize the methods to have less repetitions in takePicture and openGallery
		initialize: function(data) {

			this.profileSetup = data ? data.setup : false;
			this.drawer = !this.profileSetup;
			
		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			if( !this.drawer ) {
				this.$el.find('.btn-drawer').hide();
			}

			return this;
		},

		save: function() {

			var self = this;

			self.cleanForm();

			if( !this.profileSetup && !this.tempPicture ) {
				Parse.history.navigate("profile-home", true);
				return;
			}

			var profileUpdateSuccess = function() {
				
				if( self.profileSetup ) {
					Parse.history.navigate("profile-payments", true);
				} else {
					Parse.history.navigate("boatdays-home", true);
				}

			};

			var profileUpdateError = function(error) {

				if( error.type && error.type == 'model-validation' ) {
					console.log(error.fields);
					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});
					self._error('One or more fields contain errors.');
				} else {
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

		reportProfile: function() {

			this.modal(new ProfileReportView({ model : this.model }));

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

			if( self.isLoading('button.take-picture') ) {
				return;
			}

			self.loading('button.take-picture');

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