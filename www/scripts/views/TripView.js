define([
'views/BaseView',
'text!templates/TripTemplate.html', 
'text!templates/CardTripGuestsTemplate.html'
], function(BaseView, TripTemplate, CardTripGuestsTemplate){
	var TripView = BaseView.extend({

		className: 'screen-trip',

		template: _.template(TripTemplate),

		events: {},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			self.$el.find('main .guests .list').append(_.template(CardTripGuestsTemplate)());

			return this;
		}

	});
	return TripView;
});