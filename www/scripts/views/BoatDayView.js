define([
'views/BaseView',
'views/BoatDayBookView',
'text!templates/BoatDayTemplate.html'
], function(BaseView, BoatDayBookView, BoatDayTemplate){
	var BoatDaysView = BaseView.extend({

		className: 'screen-boatday modal',

		template: _.template(BoatDayTemplate),

		events: {
			'click .btn-book': 'book',
		},

		statusbar: true,
		
		drawer: false,

		book: function() {

			this.modal(new BoatDayBookView({ model : this.model }));

		},

		render: function( init ) {

			BaseView.prototype.render.call(this);

			var self = this;

			this.model.get('boat').relation('boatPictures').query().find().then(function(files) {

				if(files.length == 0) {
					console.log('No pictures for this boat');
					return;
				}

				self.$el.find('.slide-group').html('');

				_.each(files, function(fh) {
					self.$el.find('.slide-group').append('<div class="slide"><div class="img" style="background-image:url('+fh.get('file').url()+')"></div></div>');
				});
				
			});

			return this;

		}

	});
	return BoatDaysView;
});