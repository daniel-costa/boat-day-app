define([
'views/BaseView',
'text!templates/TermsTemplate.html'
], function(BaseView, TermsTemplate){
	var TermsView = BaseView.extend({

		className: 'screen-terms',

		template: _.template(TermsTemplate),

		statusbar: true,
		
		drawer: true,

		render: function() {
			BaseView.prototype.render.call(this);

			var self = this;

			$.ajax({
				type: 'GET',
				// url: Parse.Config.current().get('TOS_URL'),
				url: 'http://www.boatdayapp.com/app-tos.html',
        		crossDomain: true,
				success: function(data) {
					self.$el.find('.loading').remove();
					self.$el.find('.content-padded').html(data);
				}
			});

			return this;
		}
	});
	return TermsView;
});