define([
'models/ReportModel',
'views/BaseView',
'views/ReportView',
'text!templates/ProfileTemplate.html'
], function(ReportModel, BaseView, ReportView, ProfileTemplate){
	var ProfileView = BaseView.extend({

		className: 'screen-profile modal',

		template: _.template(ProfileTemplate),

		events: {
			'click .report': 'report'
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

	});
	return ProfileView;
});