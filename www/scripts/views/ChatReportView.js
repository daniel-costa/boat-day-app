define([
'views/BaseView',
'text!templates/ChatReportTemplate.html'
], function(BaseView, ChatReportTemplate){
	var ChatReportView = BaseView.extend({

		className: 'screen-chat-report modal',

		template: _.template(ChatReportTemplate),

		events: {
			'click .btn-send': 'reportChat'
		},

		statusbar: true,
		
		drawer: false,

		reportChat: function(event) {

			event.preventDefault();

			var self = this;

			self.loading('Reporting');
			self.cleanForm();

			if( this._in('reportChat').val() == '' ) {
				this.fieldError('reportChat', 'This field cannot be empty');
				this.loading();
				return;
			}

			var ReportModel = Parse.Object.extend('Report');

			new ReportModel().save({
				user: Parse.User.current(), 
				action: 'chat-report',
				profileReported: Parse.User.current().get('profile'), 
				message: this._in('reportChat').val(),
				boatdayReported: this.model,

			}).then(function() {
				self._info('Thank you for reporting the BoatDay team about this BoatDay.');
			}, function(error) {
				self.handleSaveErrors(error);	
			});
		}

		
	});
	return ChatReportView;
});