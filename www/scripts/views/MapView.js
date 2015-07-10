define([
'async!https://maps.google.com/maps/api/js?sensor=false',
'views/BaseView',
'text!templates/MapTemplate.html'
], function(gmaps, BaseView, MapTemplate){
	var MapView = BaseView.extend({

		className: 'screen-map modal',

		template: _.template(MapTemplate),

		statusbar: true,
		
		drawer: false,

		initialize: function(data) {
			this.precise = data.precise
		},

		render: function() {
			BaseView.prototype.render.call(this);

			var self = this;

			var position = new google.maps.LatLng(self.model.get('location').latitude, self.model.get('location').longitude);
			
			map = new google.maps.Map(self.$el.find('.map').get(0), {
				zoom: 12,
				center: position
			});

			var data = {
				map: map,
				draggable: false,
				animation: google.maps.Animation.DROP,
				position: position,
				
			};

			if( !this.precise ) {
				data.icon = 'resources/map-pin.png';
			}

			new google.maps.Marker(data);

			self.$el.find('.loading').remove();
			
			google.maps.event.addListener(map, "idle", function(){
				map.setCenter(position);
				google.maps.event.trigger(map, 'resize');
			}); 

			return this;
		}
	});
	return MapView;
});