
define([
'Swiper',
'views/BaseView', 
'text!templates/BoatTemplate.html', 
'text!templates/CardBoatTemplate.html'
], function(Swiper, BaseView, BoatTemplate, CardBoatTemplate){
	var BoatView = BaseView.extend({

		className: 'screen-boat',

		template: _.template(BoatTemplate),

		pictures: {},

		events: {

			'click .boat-picture'	: 'boatPicture'
		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			var self = this;

			var queryPictures = self.model.relation('boatPictures').query();
			queryPictures.ascending('order');
			queryPictures.find().then( function(results) {
				
				if( results.length > 0 ) {
					self.$el.find('.header-part').css({ backgroundImage: 'url(' + results[0].get('file').url() + ')' });
				}

				_.each(results, function(result) {
					self.pictures[result.id] = result;
					self.$el.find('.boat-pictures .list').append(_.template(CardBoatTemplate)({ model: result }))
				});

				var swiper = new Swiper(self.$el.find('.swiper-container'), {
					slidesPerView: 3,
					slidesPerColumn: 2,
					spaceBetween: 5
				});

			});
			
			return this;
		}, 

		boatPicture: function(event) {
			event.preventDefault();
			var self = this;
			var target = self.pictures[$(event.currentTarget).attr('data-id')];
			self.$el.find('.header-part').addClass('preview').css({ backgroundImage: 'url(' + target.get('file').url() + ')' });
		}
	});
	return BoatView;
});