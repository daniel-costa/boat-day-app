define([
'views/BaseView',
'text!templates/ProfileTemplate.html'
], function(BaseView, ProfileTemplate){
	var ProfileView = BaseView.extend({

		className: 'screen-profile-view modal',

		template: _.template(ProfileTemplate),

		events: {
			//'click .btn-send': 'reportProfile'
		},

		statusbar: true,
		
		drawer: false,

		// reportProfile: function(event) {

		// 	event.preventDefault();

		// 	var self = this;

		// 	self.loading('Reporting');
		// 	self.cleanForm();

		// 	if( this._in('reportProfile').val() == '' ) {
		// 		this.fieldError('reportProfile', 'This field cannot be empty');
		// 		this.loading();
		// 		return;
		// 	}

		// 	var ReportModel = Parse.Object.extend('Report');

		// 	new ReportModel().save({
		// 		user: Parse.User.current(), 
		// 		action: 'profile-report',
		// 		profileReported: Parse.User.current().get('profile'), 
		// 		message: this._in('reportProfile').val(),
		// 		boatdayReported: null,

		// 	}).then(function() {
		// 		self._info('Thank you for reporting the BoatDay team about this BoatDay.');
		// 	}, function(error) {
		// 		self.handleSaveErrors(error);	
		// 	});
		// }

		
	});
	return ProfileView;
});