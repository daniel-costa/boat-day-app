define([
'views/BaseView',
'text!templates/CancellationsTemplate.html'
], function(BaseView, CancellationsTemplate){
	var CancellationsView = BaseView.extend({

		className: 'screen-cancellations',

		template: _.template(CancellationsTemplate),

	});
	return CancellationsView;
});