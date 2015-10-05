define([
'views/BaseView', 
'text!templates/BoatTemplate.html'
], function(BaseView, BoatTemplate){
	var BoatView = BaseView.extend({

		className: 'screen-boat',

		template: _.template(BoatTemplate),

		events: {

		},

		render: function() {

			BaseView.prototype.render.call(this);

			return this;
		}

	});
	return BoatView;
});