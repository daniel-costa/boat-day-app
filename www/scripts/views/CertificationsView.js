define([
'views/BaseView',
'text!templates/CertificationsTemplate.html'
], function(BaseView, CertificationsTemplate){
	var CertificationsView = BaseView.extend({

		className: 'screen-certifications modal',

		template: _.template(CertificationsTemplate),

		events: {
		},

		statusbar: true,
		
		drawer: false,

	});
	return CertificationsView;
});