define([
'async!https://maps.google.com/maps/api/js?sensor=false',
'views/BaseView',
'text!templates/MapTemplate.html'
], function(gmaps, BaseView, MapTemplate){
	var MapView = BaseView.extend({

		className: 'screen-map',

		template: _.template(MapTemplate),

		// for markers
		_boatdays: [],

		initialize: function(data) {

			if( data.boatdays ) {
				this._boatdays = data.boatdays;
			} else {
				this._boatdays = [{
					obj: this.model,
					precise: data.precise,
					openOnClick: false
				}];
			}

			this.zoomLevel = data.zoomLevel ? data.zoomLevel : 13

			if( data.center ) {
				this.center = data.center;
			} else {
				this.center = {
					latitude: this.model.get('location').latitude,
					longitude: this.model.get('location').longitude
				}

			}
				
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;
			var center = new google.maps.LatLng(self.center.latitude, self.center.longitude);

			var map = new google.maps.Map(self.$el.find('.map').get(0), {
				zoom: this.zoomLevel,
				center: center
			});

			google.maps.event.addListenerOnce(map, "idle", function(){
				google.maps.event.trigger(map, 'resize');
				map.setCenter(center);
			}); 

			_.each(self._boatdays, function(boatday) {

				var marker = new google.maps.Marker({
					map: map,
					draggable: false,
					animation: google.maps.Animation.DROP,
					position: new google.maps.LatLng(boatday.obj.get('location').latitude, boatday.obj.get('location').longitude),
					icon: !boatday.precise  ? 'resources/map-pin.png' : 'resources/map-pin-blue.png'
				});

				if( boatday.openOnClick ) {
					google.maps.event.addListener(marker, "click", function() {

						require(['views/BoatDayView'], function(BoatDayView) {
							self.modal(new BoatDayView({ model: boatday.obj, fromUpcoming: false }));
						});
						
					});
				}
			});

			self.$el.find('.loading').remove();

			return this;
		}
	});
	return MapView;
});