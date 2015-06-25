define([
'views/BaseView',
'text!templates/BoatDaysTemplate.html',
'text!templates/BoatDayCardTemplate.html'
], function(BaseView, BoatDaysTemplate, BoatDayCardTemplate){
	var BoatDaysView = BaseView.extend({

		className: 'screen-boatdays',

		template: _.template(BoatDaysTemplate),

		events: { },

		statusbar: true,
		
		drawer: true,
		
		initialize: function() {

			var self = this;

		},

		render: function( init ) {

			BaseView.prototype.render.call(this);

			var self = this;

			switch(Parse.User.current().get('profile').get('displayBDCategory')) {
				case 'leisure' : title = 'Leisure'; break;
				case 'sports'  : title = 'Water Sports'; break;
				case 'sailing' : title = 'Sailing'; break;
				case 'fishing' : title = 'Fishing'; break;
			}

			this.$el.find('h1.title').text(title);

			// self.subViews = [];
		
			var fetchSuccess = function(boatdays) {

				var tpl = _.template(BoatDayCardTemplate);

				_.each(boatdays, function(boatday) {
					console.log(boatday);
					var data = {
						id: boatday.id,
						price: boatday.get('price'),
						title: boatday.get('name'),
						dateDisplay: self.dateParseToDisplayDate(boatday.get('date')),
						timeDisplay: self.departureTimeToDisplayTime(boatday.get('departureTime')),
						duration: boatday.get('duration'),
						availableSeats: boatday.get('availableSeats'),
						position: "Miami, United States",
						captainName: boatday.get('captain') ? boatday.get('captain').get('displayName') : '',
						captainProfilePicture: boatday.get('captain') ? boatday.get('captain').get('profilePicture').url() : 'resources/profile-picture-placeholder.png'
					}

					self.$el.find('.content').append(tpl(data));

					boatday.get('boat').relation('boatPictures').query().first().then(function(fileholder) {
						
						if( fileholder ) {
							self.$el.find('.boatday-card.card-'+boatday.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
						}

					});
				});


				if( boatdays.length == 0 ) {
					self.$el.find('.content').html($('<h1>').text('empty'));
				}

			};

			var fetchError = function(error) {
				console.log(error);
			};


			var query = new Parse.Query(Parse.Object.extend('BoatDay'));
			query.include('boat');
			query.include('captain');
			query.equalTo("category", Parse.User.current().get('profile').get('displayBDCategory'));
			query.find().then(fetchSuccess, fetchError);

			return this;

		}

	});
	return BoatDaysView;
});