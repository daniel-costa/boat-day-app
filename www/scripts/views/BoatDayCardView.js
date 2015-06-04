define([
'views/BaseView',
'text!templates/BoatDayCardTemplate.html'
], function(BaseView, BoatDayCardTemplate){
	var BoatDayCardView = BaseView.extend({

		className: 'screen-boatday-card slide',

		template: _.template(BoatDayCardTemplate),

		statusbar: true,
		
		drawer: true,
		
		initialize: function() {

			var self = this;

			var fetchProfileSuccess = function(user) {
				var profile = user[0].get('profile');
				self.$el.find('.owner .name').text('by '+profile.get('displayName'));
				self.$el.find('.profile-picture').css({ backgroundImage: 'url('+profile.get('profilePicture').url()+')' });
			};

			var fetchError = function(error) {
				console.log(error);
			};

			var query = new Parse.Query(Parse.User);
			query.include("profile");
			query.equalTo("host", this.model.get('host'));
			query.find().then(fetchProfileSuccess, fetchError);

		},

		render: function( ) {
			
			BaseView.prototype.render.call(this);

			this.$el.find('.boat-img').css({ backgroundImage: 'url('+this.model.get('boat').get('boatPicture').url()+')' });
			
			return this;

		}

	});
	return BoatDayCardView;
});