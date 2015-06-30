define([
'views/BaseView',
'views/BoatDayBookView',
'text!templates/BoatDayTemplate.html'
], function(BaseView, BoatDayBookView, BoatDayTemplate){
	var BoatDaysView = BaseView.extend({

		className: 'screen-boatday modal',

		template: _.template(BoatDayTemplate),

		events: {
			'click .btn-book': 'book',
			'click .btn-cancel': 'cancel'
		},

		statusbar: true,
		
		drawer: false,

		fromUpcoming: false,

		seatRequest: null,

		cancel: function() {
			
			var self = this;
			
			var prompt = function(buttonIndex) {

				switch(buttonIndex) {
					case 1: 
					
						break;
					case 2: 

						self.seatRequest.save({ status: 'cancelled-guest' }).then(function() {
							self._info('BoatDay Cancelled. You can find this event in the Past BoatDays section');
							Parse.history.navigate('#/boatdays-upcoming', true);
						});
						
						break;
				}

				return ;
			};
			
			navigator.notification.confirm(
				"Are you sure you want to cancel the BoatDay?", 
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

		book: function() {

			this.modal(new BoatDayBookView({ model : this.model }));

		},

		render: function( init ) {

			BaseView.prototype.render.call(this);

			var self = this;

			this.model.get('boat').relation('boatPictures').query().find().then(function(files) {

				if(files.length == 0) {
					console.log('No pictures for this boat');
					return;
				}

				self.$el.find('.slide-group').html('');

				_.each(files, function(fh) {
					self.$el.find('.slide-group').append('<div class="slide"><div class="img" style="background-image:url('+fh.get('file').url()+')"></div></div>');
				});
				
			});

			var query = this.model.relation('seatRequests').query();
			query.equalTo('status', 'approved');
			query.include('profile');
			query.find().then(function(requests) {
				console.log(requests);

				if(requests.length == 0) {
					self.$el.find('.confirmed-guests').html('No confirmed guests');
					return;
				}

				_.each(requests, function(request) {
					self.$el.find('.confirmed-guests .inner').append('<div class="guest"><div class="profile-picture" style="background-image:url('+request.get('profile').get('profilePicture').url()+')"></div>'+request.get('profile').get('displayName')+'</div>');
				});
				
			});

			return this;

		}

	});
	return BoatDaysView;
});