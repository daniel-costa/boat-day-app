define([
'views/BaseView',
'text!templates/MyProfileTemplate.html',
'masks'
], function(BaseView, MyProfileTemplate){
	var MyProfileView = BaseView.extend({

		className: 'screen-my-profile',

		template: _.template(MyProfileTemplate),

		checkForMissingInfo: false,

		events: { 
			'click .save': 'save'
		},

		initialize: function(data) {
			if( typeof data.setup !== typeof undefined ) {
				this.setup = data.setup;
			}
		},

		render: function() {
			BaseView.prototype.render.call(this);
			BaseView.prototype.afterRenderInsertedToDom.call(this);

			if( this.setup ) {
				this.$el.find('.close-me, .icon').hide();
			}

			return this;
		},

		fieldFocus: function(target) {
			this.$el.find('header, footer, .header, label:not([for="'+target.attr('name')+'"]), input:not([name="'+target.attr('name')+'"])').fadeOut();
		},

		fieldBlur: function(target) {
			this.$el.find('header, footer, .header, label:not([for="'+target.attr('name')+'"]), input:not([name="'+target.attr('name')+'"])').fadeIn();
		},

		save: function() {

			var self = this;

			if( self.loading('.save') ) {
				return ;
			}

			self.cleanForm();

			Parse.User.current().get('profile').save({
				phone: this._in('phone').val(),
				birthday: this._in('birthday').val() ? new Date(this._in('birthday').val()) : null,
				status: "complete-info",
				displayName: this._in('firstName').val() + ' ' + this._in('lastName').val().slice(0,1) + '.',
				firstName: this._in('firstName').val(),
				lastName: this._in('lastName').val(),
			}).then(function() {

				console.log(self.model.get('birthday'));
				console.log(Parse.User.current().get('birthday'));

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
