define([
'views/BaseView',
'text!templates/BoatDaysHomeTemplate.html'
], function(BaseView, BoatDaysHomeTemplate){
	var BoatDaysHomeView = BaseView.extend({

		className: 'screen-boatdays-home',

		template: _.template(BoatDaysHomeTemplate),

		events: {
			'click div.category': 'pickCategory'
		},

		statusbar: true,
		
		drawer: true,

		render: function() {
			
			BaseView.prototype.render.call(this);
			
			var self = this, i = 1;
			
			var updatePicture = function(){
				self.setBackground('leisure', i, 19);
				self.setBackground('sports', i, 9);
				self.setBackground('fishing', i, 18);
				self.setBackground('sailing', i, 29);
				i++;
			};

			updatePicture();

			return this;

		},

		setBackground: function(category, index, max) {
			
			var next  = (index % max) + 1;
			
			var eBG  = this.$el.find('.category.'+category);
			var eTrans = eBG.find('.next');

			var uCurr  = eBG.css('background-image');
			var uNext = 'url(resources/'+category+'/picture-'+ next +'.jpg)';
			
			eTrans.css({ backgroundImage: uCurr });

			setTimeout(function() {
				eBG.css({ backgroundImage: uNext });
			
				eTrans.fadeOut(5000, function() {
					eTrans.css({ backgroundImage: '' });
					eTrans.show();
				});
			}, 500);

		},

		pickCategory: function(event) {

			var self = this;
			var btn = $(event.currentTarget);
			var category = btn.attr('bd-category');

			var profileUpdatedSuccess = function(profile) {
				
				Parse.history.navigate('boatdays', true);

			};

			var profileUpdatedError = function(error) {

				console.log(error);
				self._error('Oops... something went wrong. Try again');

			}

			Parse.User.current().get('profile').save({ displayBDCategory: category}).then(profileUpdatedSuccess, profileUpdatedError);

		}

	});
	return BoatDaysHomeView;
});