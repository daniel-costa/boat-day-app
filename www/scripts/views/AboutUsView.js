define([
'views/BaseView',
'text!templates/AboutUsTemplate.html'
], function(BaseView, AboutUsTemplate){
	var AboutUsView = BaseView.extend({

		className: 'screen-about-us',

		template: _.template(AboutUsTemplate),

		statusbar: true,
		
		drawer: true,

	});
	return AboutUsView;
});