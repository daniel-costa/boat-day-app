define([
'views/BaseView',
'text!templates/MissingInfoTemplate.html'
], function(BaseView, MissingInfoTemplate){
	var MissingInfoView = BaseView.extend({

		className: 'screen-missing-info',

		template: _.template(MissingInfoTemplate),

		events: {
			'click .btn-save': 'save'
		},

		checkForMissingInfo: false,

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			return this;
		},

		save: function() {
			// Save profile, and after that save user, and after close view with self.close();
		}

	});
	return MissingInfoView;
});