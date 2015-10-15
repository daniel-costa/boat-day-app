define([
'views/BaseView',
'views/TestSubView',
'text!templates/TestTemplate.html'
], function(BaseView, TestSubView, TestTemplate){
	var TestView = BaseView.extend({

		className: 'viewport screen-test',

		template: _.template(TestTemplate),

		events: {
			'click .modal': 'modal1',
			'click .modal-right': 'modal2',
		},

		modal1: function() {
			this.modal(new TestSubView());
		},

		modal2: function() {
			this.modal(new TestSubView(), "right");
		},


	});
	return TestView;
});