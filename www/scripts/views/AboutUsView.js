define([
'views/BaseView',
'text!templates/AboutUsTemplate.html'
], function(BaseView, AboutUsTemplate){
	var AboutUsView = BaseView.extend({

		className: 'screen-about-us',

		template: _.template(AboutUsTemplate),

		events: {
			'click .btn-send': 'sendFeedback'
		},

		statusbar: true,
		
		drawer: true,

		sendFeedback: function(event) {

			event.preventDefault();

			var self = this;

			self.loading('Saving');
			self.cleanForm();

			if( this._in('feedback').val() == '' ) {
				this.fieldError('feedback', 'This field cannot be empty');
				this.loading();
				return;
			}

			var FeedbackModel = Parse.Object.extend('HelpCenter');

			new FeedbackModel().save({
				category: 'guest-feedback',
				feedback: this._in('feedback').val(),
				user: Parse.User.current(),
				status: 'unread',
				file1: null,
				file2: null,
				file3: null
			}).then(function() {
				this._in('feedback').val('');
				self._info('Thank you for contacting the BoatDay team, we will get back to you soon.');
			}, function(error) {
				self.handleSaveErrors(error);
			});
		}

	});
	return AboutUsView;
});