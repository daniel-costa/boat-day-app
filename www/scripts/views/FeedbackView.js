define([
'views/BaseView',
'text!templates/FeedbackTemplate.html'
], function(BaseView, FeedbackTemplate){
	var FeedbackView = BaseView.extend({

		className: 'screen-feedback',

		template: _.template(FeedbackTemplate),

		statusbar: true,
		
		drawer: true,

	});
	return FeedbackView;
});