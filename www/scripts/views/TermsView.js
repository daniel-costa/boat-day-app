define([
'views/BaseView',
'text!templates/TermsTemplate.html'
], function(BaseView, TermsTemplate){
	var TermsView = BaseView.extend({

		className: 'screen-terms',

		template: _.template(TermsTemplate),

		statusbar: true,
		
		drawer: true,

	});
	return TermsView;
});