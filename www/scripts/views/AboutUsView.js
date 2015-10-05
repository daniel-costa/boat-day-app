define([
'views/BaseView',
'views/TermsView',
'text!templates/AboutUsTemplate.html'
], function(BaseView, TermsView, AboutUsTemplate){
	var AboutUsView = BaseView.extend({

		className: 'screen-about-us',

		template: _.template(AboutUsTemplate),

		events: {
			'click .btn-send': 'sendFeedback', 
			'click .terms-modal': 'OpenTermsModal'
		},

		OpenTermsModal: function() {
			
			Parse.Analytics.track('about-us-click-terms');

			this.modal(new TermsView());
		},

		sendFeedback: function(event) {

			event.preventDefault();

			var self = this;
			var err = false;

			if( self.loading('.btn-send') ) {
				return ;
			}

			self.cleanForm();

			if( this._in('feedback').val() == '' ) {
				this.fieldError('feedback', 'This field cannot be empty');
				err = true;
			}

			if( this._in('email').val() == '' ) {
				this.fieldError('email', 'This field cannot be empty');
				err = true;
			}

			if( err ) {
				self.loading();
				return;
			}

			var FeedbackModel = Parse.Object.extend('HelpCenter');

			new FeedbackModel().save({
				category: 'guest-feedback',
				feedback: this._in('feedback').val(),
				user: Parse.User.current(),
				status: 'unread',
				email: this._in('email').val(),
				file1: null,
				file2: null,
				file3: null
			}).then(function() {
				self.loading();
				self._in('feedback').val('');
				self._in('email').val('');
				self._info('Thank you for contacting the BoatDay team, we will get back to you soon.');
				self.loading();
			}, function(error) {
				Parse.Analytics.track('about-us-send-feedback-fail');
				self.loading();
				self.handleSaveErrors(error);
			});
		}

	});
	return AboutUsView;
});