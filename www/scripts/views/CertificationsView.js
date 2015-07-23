define([
'views/BaseView',
'text!templates/CertificationsTemplate.html'
], function(BaseView, CertificationsTemplate){
	var CertificationsView = BaseView.extend({

		className: 'screen-certifications',

		template: _.template(CertificationsTemplate),

	});
	return CertificationsView;
});