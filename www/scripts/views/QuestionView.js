define([
'views/BaseView',
'text!templates/QuestionTemplate.html'
], function(BaseView, QuestionTemplate){
	var QuestionView = BaseView.extend({

		className: 'screen-question',

		template: _.template(QuestionTemplate),

		events: {
			'click .ask': 'ask',
			'blur [name="question"]': 'censorField',
		},

		parentView: null,

		initialize: function(data) {

			this.parentView = data.parentView;

		},

		ask: function() {

			Parse.Analytics.track('boatday-send-question');

			var self = this;

			self.model.save({
				from: Parse.User.current().get('profile'),
				question: self._in('question').val(),
				boatday: self.parentView.model,
				public: self._in('public').val() == 'true'
			}).then(function() {
				self._info('Thank you! The question is sent to the Host. Once he answered, you will receive a notification');
				self.parentView.render();
				self.close();
			}, function(error) {
				if( error.type && error.type == 'model-validation' ) {
					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});
					self.loading();
					self._error('One or more fields contain errors.');
				} else { 
					Parse.Analytics.track('boatday-send-question-fail');
					self._info('Ooops... Something went wrong, try later!');
				}

				console.log(error);	
			});
		}
	});
	return QuestionView;
});