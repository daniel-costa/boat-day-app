define([
'views/BaseView',
'text!templates/ReportTemplate.html'
], function(BaseView, ReportTemplate){
	var ReportView = BaseView.extend({

		className: 'screen-profile-report modal',

		template: _.template(ReportTemplate),

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
	return ReportView;
});