
define([
'views/BaseView', 
'text!templates/BoatTemplate.html', 
'text!templates/BoatPicturesTemplate.html'
], function(BaseView, BoatTemplate, BoatPicturesTemplate){
	var BoatView = BaseView.extend({

		className: 'screen-boat',

		template: _.template(BoatTemplate),

		boatPictures: {},

		events: {

		},

		render: function() {

			BaseView.prototype.render.call(this);
			var self = this;

			self.boatPictures = {};
			self.$el.find('.content .boat-pictures').html("");

			var queryPictures = self.model.relation('boatPictures').query();
			queryPictures.ascending('order');
			queryPictures.find().then( function(results) {
				_.each(results, self.appendBoatPicture, self);

			});
			
			return this;
		}, 

		appendBoatPicture: function(FileHolder) {
			this.$el.find(".content .boat-pictures").append(_.template(BoatPicturesTemplate)({
				file: FileHolder
			}));
			this.boatPictures[FileHolder.id] = FileHolder;
		}
	});
	return BoatView;
});