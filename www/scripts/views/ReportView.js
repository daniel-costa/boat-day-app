define([
'views/BaseView',
'text!templates/ProfileReportTemplate.html'
], function(BaseView, ProfileReportTemplate){
	var ChatReportView = BaseView.extend({

		className: 'screen-profile-report modal',

		template: _.template(ProfileReportTemplate),

		events: {
			'click .btn-send': 'report'
		},

		statusbar: true,
		
		drawer: false,

		report: function(event) {

			event.preventDefault();

			var self = this;

			self.loading('Reporting');
			self.cleanForm();

			self.model.save({
				user: Parse.User.current(),
				fromProfile: Parse.User.current().get('profile'),
				message: this._in('message').val(),
			}).then(function() {
				
				self._info('Thank you for the report.');
				self.close();

			}, function(error) {
				
				console.log(error);

			});
		}

		
	});
	return ChatReportView;
});