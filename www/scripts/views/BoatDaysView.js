define([
'views/BaseView',
'views/BoatDayView',
'text!templates/BoatDaysTemplate.html',
'text!templates/BoatDayCardTemplate.html',
'text!templates/BoatDayTemplate.html'
], function(BaseView, BoatDayView, BoatDaysTemplate, BoatDayCardTemplate, BoatDayTemplate){
	var BoatDaysView = BaseView.extend({

		className: 'screen-boatdays',

		template: _.template(BoatDaysTemplate),

		events: {
			'click .boatday-card': 'showBoatDay'
		},

		statusbar: true,
		
		drawer: true,
		
		boatdays: {},

		initialize: function() {

			var self = this;

		},

		showBoatDay: function(event) {

			this.modal(new BoatDayView({ model : this.boatdays[$(event.currentTarget).attr('data-id')], fromUpcoming: false }));

		},

		render: function( init ) {

			BaseView.prototype.render.call(this);

			var self = this;

			this.$el.find('h1.title').text(self.getBoatDayTitle(Parse.User.current().get('profile').get('displayBDCategory')));

			Parse.User.current().get('profile').relation('requests').query().find().then(function(requests) {

				var boatdaysId = [];

				_.each(requests, function(request) {
					boatdaysId.push(request.get('boatday').id);
				});

				console.log('ids');
				console.log(boatdaysId);

				var query = new Parse.Query(Parse.Object.extend('BoatDay'));
				query.include('boat');
				query.include('captain');
				query.equalTo("category", Parse.User.current().get('profile').get('displayBDCategory'));
				query.notContainedIn('objectId', boatdaysId);
				query.find().then(function(boatdays) {

					var tpl = _.template(BoatDayCardTemplate);

					self.boatdays = {};

					_.each(boatdays, function(boatday) {
						
						self.boatdays[boatday.id] = boatday;

						var seg = boatday.get('locationText').split(',');
						
						var data = {
							id: boatday.id,
							price: self.getGuestPrice(boatday.get('price')),
							title: boatday.get('name'),
							dateDisplay: self.dateParseToDisplayDate(boatday.get('date')),
							timeDisplay: self.departureTimeToDisplayTime(boatday.get('departureTime')),
							duration: boatday.get('duration'),
							availableSeats: boatday.get('availableSeats'),
							bookedSeats: boatday.get('bookedSeats'),
							position: ((seg.length > 2 ? seg[seg.length - 2] + ',' : '') + seg[seg.length - 1]).trim(),
							captainName: boatday.get('captain') ? boatday.get('captain').get('displayName') : '',
							captainProfilePicture: boatday.get('captain') ? boatday.get('captain').get('profilePicture').url() : 'resources/profile-picture-placeholder.png',
							captainRating: boatday.get('captain').get('rating') ? boatday.get('captain').get('rating') : null
						};

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

				}, function(error) {
					console.log(error);
				});

			});
			


			return this;

		}

	});
	return BoatDaysView;
});