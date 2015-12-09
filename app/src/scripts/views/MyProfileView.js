define([
'views/BaseView',
'text!templates/MyProfileTemplate.html',
'masks'
], function(BaseView, MyProfileTemplate){
	var MyProfileView = BaseView.extend({

		className: 'screen-my-profile',

		template: _.template(MyProfileTemplate),

		events: { 
			'click .save': 'save'
		},


		save: function() {

			var self = this;

			if( self.loading('.save') ) {
				return ;
			}

			self.cleanForm();

			this.model.save({
				phone: this._in('phone').val(),
				birthday: this._in('birthday').val() ? new Date(this._in('birthday').val()) : null,
				status: "complete-info",
				displayName: this._in('firstName').val() + ' ' + this._in('lastName').val().slice(0,1) + '.',
				firstName: this._in('firstName').val(),
				lastName: this._in('lastName').val(),
			}).then(function() {
				self.loading();
				Parse.history.navigate("my-picture", true);
			}, function(error) {

				Parse.Analytics.track('profile-save-fail');

				if( error.type && error.type == 'model-validation' ) {
					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});
					self.loading();
					self._error('One or more fields contain errors.');
				} else {
					self._error(error);
				}
			});

		}

	});
	return MyProfileView;
});
