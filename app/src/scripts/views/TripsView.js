define([
'views/BaseView',
'text!templates/TripsTemplate.html', 
'text!templates/CardTripsTemplate.html'
], function(BaseView, TripsTemplate, CardTripsTemplate){
	var TripsView = BaseView.extend({

		className: 'screen-trips',

		template: _.template(TripsTemplate),

		events: {},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			self.$el.find('main .list').append(_.template(CardTripsTemplate)());

			return this;
		}

	});
	return TripsView;
});