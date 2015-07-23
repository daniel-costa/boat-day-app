define([
'views/BaseView',
'text!templates/ProfileInfoTemplate.html'
], function(BaseView, ProfileInfoTemplate){
	var ProfileInfoView = BaseView.extend({

		className: 'screen-profile-info',

		template: _.template(ProfileInfoTemplate),

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
			
			if( !this.drawer ) {
				this.$el.find('.btn-drawer').hide();
			}
			
			// Not working on iOS, maybe on Android for later
			// var maxDate = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate());
			// var maxDateY = maxDate.getFullYear();
			// var maxDateM = (maxDate.getMonth() + 1 < 10 ? '0' : '') + (maxDate.getMonth()+1);
			// var maxDateD = maxDate.getDate();
			
			// this._input('birthday').attr('max', maxDateY+'-'+maxDateM+'-'+maxDateD);
			
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
				status: "complete-info",
				displayName: this._input('firstName').val() + ' ' + this._input('lastName').val().slice(0,1) + '.',
				firstName: this._input('firstName').val(),
				lastName: this._input('lastName').val(),
				birthday: this._input('birthday').val() ? new Date(this._input('birthday').val()) : null
			};
			
			var profileUpdateSuccess = function() {
				Parse.history.navigate("profile-picture", true);
			};

			var profileUpdateError = function(error) {

				if( error.type && error.type == 'model-validation' ) {
					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});
					self._error('One or more fields contain errors.');
				} else {
					self._error(error);
				}

			};

			this.model.save(data).then(profileUpdateSuccess, profileUpdateError);

		}

	});
	return ProfileInfoView;
});