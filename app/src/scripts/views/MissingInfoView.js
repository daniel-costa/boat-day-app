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

			Parse.Promise.when(Parse.User.current().get('profile').save(data.profile), Parse.User.current().save(data.user)).then(function(profile, user) {
				self.loading();
				self.close();
			}, function(errors) {
				_.each(errors, function(e) {
					console.log(e);
					if( e.code == 125 ) {
						self.fieldError("email", null);
						self._error(e.message);
					} else {
						self._error(e.message);
					}
				});
				self.loading();
			}) 
		}

	});
	return MissingInfoView;
});