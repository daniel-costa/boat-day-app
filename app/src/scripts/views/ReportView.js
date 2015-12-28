define([
'views/BaseView',
'text!templates/ReportTemplate.html'
], function(BaseView, ReportTemplate){
	var ReportView = BaseView.extend({

		className: 'screen-report',

		template: _.template(ReportTemplate),

		events: {
			'click .report': 'report'
		},

		report: function(event) {

			event.preventDefault();

			var self = this;

			self.cleanForm();

			if( self.loading('.report') ) {
				return ;
			}

			if( this._in('message').val() == '' ) {
				this.fieldError('message', 'This field cannot be empty');
				self.loading();
				return;
			}

			self.model.save({
				user: Parse.User.current(),
				fromProfile: Parse.User.current().get('profile'),
				message: this._in('message').val(),
			}).then(function() {
				self.loading();
				self._info('Thank you for the report.');
				self.close();
			}, function(error) {
				Parse.Analytics.track('profile-report-fail');
				self.loading();
				self._error('Oops... Something went wrong. Try later or if it persists close totally the app and open it again.');
			});
		}

		
	});
	return ReportView;
});