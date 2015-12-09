define([
'views/BaseView',
'text!templates/TermsTemplate.html'
], function(BaseView, TermsTemplate){
	var TermsView = BaseView.extend({

		className: 'screen-terms',

		template: _.template(TermsTemplate),

		render: function() {
			BaseView.prototype.render.call(this);

			var self = this;

			$.ajax({
				type: 'GET',
				url: Parse.Config.current().get('TOS_URL'),
        		crossDomain: true,
				success: function(data) {
					self.$el.find('.list').html(data);
				}
			});

			return this;
		}
	});
	return TermsView;
});