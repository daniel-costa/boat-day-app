define([
'views/BaseView',
'text!templates/QuestionTemplate.html'
], function(BaseView, QuestionTemplate){
	var QuestionView = BaseView.extend({

		className: 'screen-question',

		template: _.template(QuestionTemplate),

	});
	return QuestionView;
});