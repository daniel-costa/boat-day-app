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

		events: {
			'click .uber': 'uber',
			'click .directions': 'directions',
		},


		initialize: function(data) {

			this.zoomLevel     = data.zoomLevel    ? data.zoomLevel    : 13
			this.getdirection  = data.getdirection ? data.getdirection : false;
			this._boatdays     = data.boatdays     ? data.boatdays     : [{ obj: this.model, precise: data.precise, openOnClick: false }];
			this.center        = data.center       ? data.center       : { latitude: this.model.get('location').latitude, longitude: this.model.get('location').longitude };
			
		},

		directions: function() {
			var boatday = this.model;
			
			if( this.isAndroid() ) {
				var url = 'http://maps.google.com/?directionsmode=driving&daddr=' + boatday.get('location').latitude + ',' + boatday.get('location').longitude;
			} else {
				var url = 'comgooglemaps://?directionsmode=driving&daddr=' + boatday.get('location').latitude + ',' + boatday.get('location').longitude;
			}

			window.open(url, '_system');
		},

		uber: function() {
			var boatday = this.model;
			var url = 'uber://';
			url += '?client_id='+Parse.Config.current().get('UBER_CLIENT_ID');
			url += '&action=setPickup';
			url += '&pickup=my_location';
			url += '&dropoff[latitude]='+boatday.get('location').latitude;
			url += '&dropoff[longitude]='+boatday.get('location').longitude;
			// url += '&dropoff[nickname]='+encodeURI(boatday.get('name'));
			url += '&dropoff[formatted_address]='+encodeURI(boatday.get('locationText'));
			window.open(url, '_system');
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
					icon: !boatday.precise  ? 'resources/pin-circle.png' : 'resources/pin-' + boatday.obj.get('category') + '.png'
				});

				if( boatday.openOnClick ) {
					google.maps.event.addListener(marker, "click", function() {

						require(['views/BoatDayView'], function(BoatDayView) {
							self.modal(new BoatDayView({ model: boatday.obj, fromUpcoming: false }));
						});
						
					});
				}
			});

			return this;
		}
	});
	return MapView;
});