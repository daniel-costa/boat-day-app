define([
'views/BaseView',
'text!templates/CancellationsTemplate.html'
], function(BaseView, CancellationsTemplate){
	var CancellationsView = BaseView.extend({

		className: 'screen-cancellations',

		template: _.template(CancellationsTemplate),

		render: function() {

			BaseView.prototype.render.call(this);

			this.$el.find('.' + this.model.get('cancellationPolicy')).addClass('active');

			return this;

		}
	});
	return CancellationsView;
});