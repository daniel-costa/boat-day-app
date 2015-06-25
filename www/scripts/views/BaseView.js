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

			$(document).trigger( this.drawer ? 'enableDrawer' : 'disableDrawer');
			
			if( this.statusbar ) {
				StatusBar.show();
			} else {
				StatusBar.hide();
			}

			console.log("### Render (" + this.className + ") ###");

			return this;
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
			
			return new Date(date.iso ? date.iso : date).toLocaleDateString();

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

			if(this.model) {
				this.model.off(null, null, this);
			}

			_.each(this.subViews, function(view) {

				view.teardown();

			});

			this.remove();

		},

		loading: function( btn ) {
			
			if(btn) {
	
				if( typeof btn === 'string' ) {
					btn = this.$el.find(btn);
				}

				btn.addClass('loading');	

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

		_error: function(message) {

			$(document).trigger('globalError', message);

		},

		_info: function(message) {

			$(document).trigger('globalInfo', message);

		}

	});
	return BaseView;
});