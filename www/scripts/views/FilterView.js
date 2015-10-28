define([
'views/BaseView',
'text!templates/FilterTemplate.html'
], function(BaseView, FilterTemplate){
	var FilterView = BaseView.extend({

		className: 'screen-filter',

		template: _.template(FilterTemplate),

	});
	return FilterView;
});