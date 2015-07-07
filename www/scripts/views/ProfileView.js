define([
'models/ReportModel',
'views/BaseView',
'views/ReportView',
'views/CertificationsView',
'text!templates/ProfileTemplate.html'
], function(ReportModel, BaseView, ReportView, CertificationsView, ProfileTemplate){
	var ProfileView = BaseView.extend({

		className: 'screen-profile modal',

		template: _.template(ProfileTemplate),

		events: {
			'click .report': 'report',
			'click .certifications': 'certifications'
		},

		statusbar: true,
		
		drawer: false,
		
		report: function() {

			var m = new ReportModel({
				action: 'profile',
				profile: this.model
			});

			this.modal(new ReportView({ model : m }));
		},

		certifications: function(event) {

			this.modal(new CertificationsView());

		},

	});
	return ProfileView;
});