define([
'views/BaseView',
'text!templates/MissingInfoTemplate.html'
], function(BaseView, MissingInfoTemplate){
	var MissingInfoView = BaseView.extend({

		className: 'screen-missing-info',

		template: _.template(MissingInfoTemplate),

		events: {},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			return this;
		}

	});
	return MissingInfoView;
});