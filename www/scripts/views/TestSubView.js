define([
'views/BaseView',
'text!templates/TestSubTemplate.html'
], function(BaseView, TestSubTemplate){
	var TestSubView = BaseView.extend({

		className: 'screen-test-sub',

		template: _.template(TestSubTemplate),

	});
	return TestSubView;
});