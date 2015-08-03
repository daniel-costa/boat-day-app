define([
'views/BaseView',
'text!templates/WaterPolicyTemplate.html'
], function(BaseView, WaterPolicyTemplate){
	var WaterPolicyView = BaseView.extend({

		className: 'screen-water-sports',

		template: _.template(WaterPolicyTemplate),

		render: function() {
			BaseView.prototype.render.call(this);

			var self = this;

			$.ajax({
				type: 'GET',
				url: Parse.Config.current().get('WP_URL'),
        		crossDomain: true,
				success: function(data) {
					self.$el.find('.loading').remove();
					self.$el.find('.content-padded').html(data);
				}
			});

			return this;
		}
	});
	return WaterPolicyView;
});