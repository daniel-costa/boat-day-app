define([
'views/BaseView',
'text!templates/DrawerTemplate.html'
], function(BaseView, DrawerTemplate){
	var DrawerView = BaseView.extend({

		className: 'snap-drawers',

		template: _.template(DrawerTemplate)
		
	});
	return DrawerView;
});