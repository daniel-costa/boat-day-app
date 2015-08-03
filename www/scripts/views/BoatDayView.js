define([
'models/ReportModel',
'views/BaseView',
'views/BoatDayBookView',
'views/ReportView',
'views/BoatDayCancellationView',
'views/ProfileView',
'views/CertificationsView',
'views/MapView',
'text!templates/BoatDayTemplate.html'
], function(ReportModel, BaseView, BoatDayBookView, ReportView, BoatDayCancellationView, ProfileView, CertificationsView, MapView, BoatDayTemplate){
	var BoatDaysView = BaseView.extend({

		className: 'screen-boatday',

		template: _.template(BoatDayTemplate),

		events: {
			'click .btn-book': 'book',
			'click .btn-cancel': 'cancel',
			'click .btn-cancel-modal': 'cancelModal', 
			'click .report': 'report', 
			'click .open-profile-picture': 'profile',
			'click .profile-picture': 'profile',
			'click .certifications': 'certifications',
			'click .map': 'map',
		},

		fromUpcoming: false,
		seatRequest: null,
		profiles: {},

		report: function() {

			var m = new ReportModel({
				action: 'boatday',
				boatday: this.model
			});
			this.modal(new ReportView({ model : m }));

		},

		cancelModal: function() {
			
			this.modal(new BoatDayCancellationView({ model : this.model }));

		},

		map: function() {
			
			this.modal(new MapView({ model : this.model, precise: false }));

		},

		cancel: function() {
			
			var self = this;

			if( self.loading('.btn-cancel') ) {
				console.log('abort');
				return ;
			}

			var prompt = function(buttonIndex) {

				switch(buttonIndex) {
					case 2: 

						self.loading('.btn-cancel');

						var base = self.seatRequest.get('status');

						if( self.seatRequest.get('status') == 'pending' ) {
							self.seatRequest.set('cancelled', true);
						}

						self.seatRequest.save({ status: 'cancelled-guest' }).then(function() {

							if( base == 'approved' ) {
								self.model.increment('bookedSeats', -1 * self.seatRequest.get('seats'));
								self.model.save();
							}
					
							var Notification = Parse.Object.extend('Notification');
							new Notification().save({
								action: 'bd-message',
								fromTeam: true,
								message: "You have successfully cancelled "+self.seatRequest.get('seats')+" reserved seat"+(self.seatRequest.get('seats')==1?'':'s')+" on "+self.model.get('name')+".",
								to: Parse.User.current().get('profile'),
								sendEmail: false,
								request: self.seatRequest,
							}).then(function() {
								Parse.history.navigate("profile-payments", true);
							});

							self._info('BoatDay Cancelled. You can find this event in the Past BoatDays section');
							Parse.history.navigate('boatdays-past', true);
						});
						
						break;
				}

				self.loading();
				
				return ;
			};
			
			navigator.notification.confirm(
				"Are you sure you want to cancel your reserved seat(s)?", 
				prompt, 
				"BoatDay Cancellation",
				["No", "Yes"]
			);

		},

		initialize: function(data) {

			this.fromUpcoming = data.fromUpcoming;

			if( typeof data.seatRequest !== typeof undefined) {
				this.seatRequest = data.seatRequest;
			}

		},

		profile: function(event) {

			this.modal(new ProfileView({ model: this.profiles[$(event.currentTarget).attr('data-id')] }));

		},

		certifications: function(event) {

			this.modal(new CertificationsView());

		},

		book: function() {

			this.modal(new BoatDayBookView({ model : this.model }));

		},

		render: function( init ) {

			BaseView.prototype.render.call(this);

			var self = this;

			var queryPictures = this.model.get('boat').relation('boatPictures').query();
			queryPictures.ascending('order');
			queryPictures.find().then(function(files) {

				if(files.length == 0) {
					return;
				}


				self.$el.find('.total-pictures').text('1 / ' + files.length);
				self.$el.find('.slide-group').html('');

				_.each(files, function(fh) {
					self.$el.find('.slide-group').append('<div class="slide"><div class="img" style="background-image:url('+fh.get('file').url()+')"></div></div>');
				});

				self.$el.find('.content').on('slide', function(event) {
					console.log(event);
				});
				
			});
			
			self.profiles[self.model.get('captain').id] = self.model.get('captain');

			var query = self.model.relation('seatRequests').query();
			query.equalTo('status', 'approved');
			query.include('profile');
			query.find().then(function(requests) {

				if(requests.length == 0) {
					self.$el.find('.confirmed-guests').html('<p class="text-center">No confirmed guests</p>');
					return;
				}

				_.each(requests, function(request) {
					self.profiles[request.get('profile').id] = request.get('profile');
					self.$el.find('.confirmed-guests .inner').append('<div class="guest"><div class="profile-picture" data-id="'+request.get('profile').id+'" style="background-image:url('+request.get('profile').get('profilePicture').url()+')"></div>'+request.get('profile').get('displayName')+'<br/><span> '+request.get('seats')+' seat'+ (request.get('seats') == 1 ? '' : 's') +'</span></div>');
				});
				
			});

			return this;

		}

	});
	return BoatDaysView;
});