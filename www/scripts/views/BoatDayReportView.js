define([
'views/BaseView',
'text!templates/BoatDayReportTemplate.html'
], function(BaseView, BoatDayReportTemplate){
	var BoatDayReportView = BaseView.extend({

		className: 'screen-boatday-report modal',

		template: _.template(BoatDayReportTemplate),

		events: {
			'click .btn-send': 'reportBoatDay'
		},

		statusbar: true,
		
		drawer: false,

		reportBoatDay: function(event) {

			event.preventDefault();

			var self = this;

			self.loading('Reporting');
			self.cleanForm();

			if( this._in('reportBoatDay').val() == '' ) {
				this.fieldError('reportBoatDay', 'This field cannot be empty');
				this.loading();
				return;
			}

			var ReportModel = Parse.Object.extend('Report');

			new ReportModel().save({
				user: Parse.User.current(), 
				action: 'boatday-report',
				profileReported: Parse.User.current().get('profile'), 
				message: this._in('reportBoatDay').val(),
				boatdayReported: this.model,

			}).then(function() {
				self._info('Thank you for reporting the BoatDay team about this BoatDay.');
			}, function(error) {
				self.handleSaveErrors(error);	
			});
		}
	});
	return BoatDayReportView;
});