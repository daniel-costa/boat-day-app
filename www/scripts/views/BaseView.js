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
			
			$(document).trigger( this.drawer ? 'enableDrawer' : 'disableDrawer');
			
			if( this.statusbar ) {
				StatusBar.hide();
			} else {
				StatusBar.show();
			}

			if(this.model) {
				this.$el.html(this.template(this.model.toJSON()));
			} else if(this.collection) {
				this.$el.html(this.template({ collection: this.collection.toJSON() }));
			} else {
				this.$el.html(this.template());
			}

			console.log("### Render (" + this.className + ") ###");

			return this;
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