define([
'views/BaseView',
'text!templates/MissingInfoTemplate.html'
], function(BaseView, MissingInfoTemplate){
	var MissingInfoView = BaseView.extend({

		className: 'screen-missing-info',

		template: _.template(MissingInfoTemplate),

		checkForMissingInfo: false,

		events: {
			'click .save': 'save'
		},

		render: function() {

			BaseView.prototype.render.call(this);

			BaseView.prototype.afterRenderInsertedToDom.call(this);

			var self = this;

			return this;
		},

		save: function() {
			var self = this;
			var err = false;
			var data = {
				profile: {},
				user: {},
			};
			
			self.cleanForm();

			if( self.loading('.save') ) {
				return ;
			}
			
			if( self._in('email').length > 0 ) {
				if( self._in('email').val() === '' ) {
					self.fieldError("email", null);
					err = true;
				} else {
					_.extend(data.user, {
						email: self._in('email').val(),
						username: self._in('email').val()
					});
				}
			}

			if( self._in('birthday').length > 0 ) {
				if( self._in('birthday').val() === '' ) {
					self.fieldError("birthday", null);
					err = true;
				} else {
					_.extend(data.profile, {
						birthday: new Date(self._in('birthday').val())
					});
				}
			}

			if( self._in('phone').length > 0 ) {
					if( self._in('phone').val() === '' ) {
					self.fieldError("phone", null);
					err = true;
				} else {
					_.extend(data.profile, {
						phone: self._in('phone').val()
					});
				}
			}

			if( self._in('firstName').length > 0 ) {
				if( self._in('firstName').val() === '' ) {
					self.fieldError("firstName", null);
					err = true;
				} else {
					_.extend(data.profile, {
						firstName: self._in('firstName').val()
					});
				}
			}

			if( self._in('lastName').length > 0 ) {
				if( self._in('lastName').val() === '' ) {
					self.fieldError("lastName", null);
					err = true;
				} else {
					_.extend(data.profile, {
						lastName: self._in('lastName').val()
					});
				}
			}

			if( err ) {
				self._error('Oops, you missed one');
				self.loading();
				return;
			}

			var handleErrors = function(error) {
				console.log(error);
				if( error.code == 125 ) {
					self.fieldError("email", null);
					self._error(error.message);
				} else {
					self._error(error.message);
				}
			};

			var pProfile = new Parse.Promise();
			var pUser = new Parse.Promise();

			var promises = [pProfile, pUser];

			if( Object.keys(data.profile).length > 0 ) {
				Parse.User.current().get('profile').save(data.profile).then(function() {
					pProfile.resolve();
				}, function(errors) {
					pProfile.reject('Profile fail');
					handleErrors(errors);
				});
			} else {
				pProfile.resolve();
			}

			if( Object.keys(data.user).length > 0 ) {
				Parse.User.current().save(data.user).then(function() {
					pUser.resolve();
				}, function(errors) {
					pUser.reject('User fail');
					handleErrors(errors);
				});
			} else {
				pUser.resolve();
			}

			Parse.Promise.when(promises).then(function() {
				self.loading();
				self.close();
			}, function(error) {
				self.loading();
				console.log(error);
			});
		}

	});
	return MissingInfoView;
});