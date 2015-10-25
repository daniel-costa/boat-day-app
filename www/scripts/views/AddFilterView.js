define([
'views/BaseView',
'text!templates/AddFilterTemplate.html'
], function(BaseView, AddFilterTemplate){
	var AddFilterView = BaseView.extend({

		className: 'screen-add-filter',

		template: _.template(AddFilterTemplate),


	});
	return AddFilterView;
});