define([
'views/BaseView', 
'text!templates/BoatTemplate.html', 
'text!templates/BoatPicturesTemplate.html'
], function(BaseView, BoatTemplate, BoatPicturesTemplate){
	var BoatView = BaseView.extend({

		className: 'screen-boat',

		template: _.template(BoatTemplate),

		events: {

		},

		render: function() {

			BaseView.prototype.render.call(this);
			var self = this;

			self.$el.find('.boat-pictures').html("");

			var queryPictures = this.model.relation('boatPictures').query();
			queryPictures.find().then( function(results) {
				var _tpl = _.template(BoatPicturesTemplate);
				_.each(results, function(result) {
					self.$el.find('.boat-pictures').append(_.template(BoatPicturesTemplate)({ model: result }))
				});

			});
			
			return this;
		}

	});
	return BoatView;
});