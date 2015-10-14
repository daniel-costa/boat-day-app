define([
'views/BaseView',
'text!templates/MyProfileTemplate.html',
'masks'
], function(BaseView, MyProfileTemplate){
	var MyProfileView = BaseView.extend({

		className: 'screen-profile-info',

		template: _.template(MyProfileTemplate),

		events: { 
			'click .save': 'save'
		},

		profileSetup: false,
		
		initialize: function(data) {

			this.profileSetup = data ? data.setup : false;
			this.drawer = !this.profileSetup;

		},
		
		render: function() {

			BaseView.prototype.render.call(this);
			
			// ToDo (check other files for it)
			// - we may not need this code. 
			// - In one of the last releases, we put this control in the render function of the BaseView
			// - Need to try & test before deleting it
			if( !this.drawer ) {
				this.$el.find('.btn-drawer').hide();
			}

			// this._input('phone').mask('(000) 000-0000');
			
			return this;
		},

		save: function() {

			var self = this;

			if( self.loading('.save') ) {
				console.log('abort');
				return ;
			}

			self.cleanForm();

			var data = {
				phone: this._input('phone').val(),
				birthday: this._input('birthday').val() ? new Date(this._input('birthday').val()) : null
			};

			if( this.profileSetup ) {
				_.extend(data, {
					status: "complete-info",
					displayName: this._input('firstName').val() + ' ' + this._input('lastName').val().slice(0,1) + '.',
					firstName: this._input('firstName').val(),
					lastName: this._input('lastName').val(),
				});
			}

			this.model.save(data).then(function() {
				if( this.profileSetup ) {
					Parse.history.navigate("profile-picture", true);
				} else {
					Parse.history.navigate("boatdays", true);
				}
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
