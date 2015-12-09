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

			if(this.model.get('cancellationPolicy') == 'flexible') {
				this.$el.find('.flexible').show();
				this.$el.find('.moderate').hide();
				this.$el.find('.strict').hide();
			}

			if(this.model.get('cancellationPolicy') == 'moderate') {
				this.$el.find('.moderte').show();
				this.$el.find('.flexible').hide();
				this.$el.find('.strict').hide();
			}

			if(this.model.get('cancellationPolicy') == 'strict') {
				this.$el.find('.strict').show();
				this.$el.find('.flexible').hide();
				this.$el.find('.moderate').hide();
			}

			return this;

		}
	});
	return CancellationsView;
});