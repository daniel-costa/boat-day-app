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
			'click .btn-more': 'more',
		},

		more: function() {
			
			var self = this;

			navigator.notification.confirm(
				"", 
				function(buttonIndex) {
					var boatday = self._boatdays[0].obj;
					switch(buttonIndex) {
						case 1: 
							var url = 'comgooglemaps://?directionsmode=driving&daddr='+boatday.get('location').latitude + ',' + boatday.get('location').longitude;
							window.open(url, '_system');
							break;
						case 2: 
							var url = 'uber://';
							url += '?client_id='+Parse.Config.current().get('UBER_CLIENT_ID');
							url += '&action=setPickup';
							url += '&pickup=my_location';
							url += '&dropoff[latitude]='+boatday.get('location').latitude;
							url += '&dropoff[longitude]='+boatday.get('location').longitude;
							// url += '&dropoff[nickname]='+encodeURI(boatday.get('name'));
							url += '&dropoff[formatted_address]='+encodeURI(boatday.get('locationText'));

							console.log(url);
							window.open(url, '_system');

							break;
					}
				}, 
				"More options",
				["Get Directions", "Get Uber", "Cancel"]
			);
		},

		initialize: function(data) {

			this.zoomLevel     = data.zoomLevel    ? data.zoomLevel    : 13
			this.getdirection  = data.getdirection ? data.getdirection : false;
			this.getuber       = data.getuber      ? data.getuber      : false;
			this._boatdays     = data.boatdays     ? data.boatdays     : [{ obj: this.model, precise: data.precise, openOnClick: false }];
			this.center        = data.center       ? data.center       : { latitude: this.model.get('location').latitude, longitude: this.model.get('location').longitude };
			
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

			if( self.getuber === false && self.getdirection === false) {
				this.$el.find('.btn-more').hide();
			}

			self.$el.find('.loading').remove();

			return this;
		}
	});
	return MapView;
});