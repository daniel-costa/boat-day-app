define([
'views/BaseView',
'text!templates/CancellationTemplate.html'
], function(BaseView, CancellationTemplate){
	var CancellationView = BaseView.extend({

		className: 'screen-boatday-cancellation',

		template: _.template(CancellationTemplate),

	});
	return CancellationView;
});