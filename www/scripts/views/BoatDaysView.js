define([
'views/BaseView',
'views/BoatDayCardView',
'text!templates/BoatDaysTemplate.html'
], function(BaseView, BoatDayCardView, BoatDaysTemplate){
	var BoatDaysView = BaseView.extend({

		className: 'screen-boatdays',

		template: _.template(BoatDaysTemplate),

		events: { },

		statusbar: true,
		
		drawer: true,
		
		initialize: function() {

			var self = this;

			self.subViews = [];

			var fetchSuccess = function(collection) {

				collection.each(function(boatday) {

					var sv = new BoatDayCardView({ model: boatday });
					self.subViews.push(sv);
					
				});

				self.render();

			};

			var fetchError = function(error) {
				console.log(error);
			};

			this.collection.fetch().then(fetchSuccess, fetchError);


		},

		render: function( init ) {

			BaseView.prototype.render.call(this);

			var self = this;


			if( init ) {
				
				// self.$el.find('.content').html($('<h1>').text('loading'));

			} else {

				_.each(self.subViews, function(card) {

					self.$el.find('.slide-group').append(card.render().el);

				});	

				if( self.subViews.length == 0 ) {
					// self.$el.find('.content').html($('<h1>').text('empty'));
				}

			}
	

			return this;

		}

	});
	return BoatDaysView;
});