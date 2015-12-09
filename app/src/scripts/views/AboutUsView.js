define([
'views/BaseView',
'views/TermsView',
'text!templates/AboutUsTemplate.html'
], function(BaseView, TermsView, AboutUsTemplate){
	var AboutUsView = BaseView.extend({

		className: 'screen-about-us',

		template: _.template(AboutUsTemplate),

		events: {
			'click .send': 'sendFeedback', 
			'click .terms': 'terms'
		},

		render: function() {
			BaseView.prototype.render.call(this);
			
			var self = this;
			
			navigator.appInfo.getVersion(function(version) {
				self.$el.find('.version').text('Version ' + Parse.Config.current().get('CURRENT_VERSION'));
			});

			return this;
		},

		terms: function() {
			
			Parse.Analytics.track('about-us-click-terms');

			this.overlay(new TermsView());

		},

		sendFeedback: function(event) {

			event.preventDefault();

			var self = this;
			var err = false;

			if( self.loading('.send') ) {
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
				self._info('Thank you for your feedback! It helps us make the best app possible.');
			}, function(error) {
				Parse.Analytics.track('about-us-send-feedback-fail');
				self.loading();
				self.handleSaveErrors(error);
			});
		}

	});
	return AboutUsView;
});