define([
'Swiper',
'models/QuestionModel',
'views/BaseView',
'views/BoatView',
'views/TermsView',
'views/CancellationsView',
'views/WaterPolicyView',
'views/ProfileView',
'views/BookView',
'views/MapView',
'views/QuestionView',
'text!templates/BoatDayTemplate.html'
], function(Swiper, QuestionModel, BaseView, BoatView, TermsView, CancellationsView, WaterPolicyView, ProfileView, BookView, MapView, QuestionView, BoatDayTemplate){
	var BoatDayView = BaseView.extend({

		className: 'screen-boatday',

		template: _.template(BoatDayTemplate),

		events: {
			'click .cancel': 'cancel',
			'click .cancel-modal': 'cancelModal', 

			'click .open-captain': 'profile',
			'click .open-guest': 'profile',
			'click .open-boat': 'boat',
			'click .cancellations': 'cancellations',
			'click .water': 'water',
			'click .terms': 'terms',
			'click .share': 'share',
			'click .ask': 'ask',
			'click .map': 'map',
			'click .book': 'book',
		},

		fromUpcoming: false,
		seatRequest: null,
		profiles: {},
		questions: {},

		initialize: function(data) {

			if( typeof data.fromUpcoming !== typeof undefined) {
				this.fromUpcoming = data.fromUpcoming;
			}

			if( typeof data.seatRequest !== typeof undefined) {
				this.seatRequest = data.seatRequest;
			}

		},

		profile: function(event) {

			Parse.Analytics.track('boatday-click-profile');
			
			this.modal(new ProfileView({ model: this.profiles[$(event.currentTarget).attr('data-id')] }), 'right');

		},
		
		boat: function(event) {

			Parse.Analytics.track('boatday-click-boat');

			this.modal(new BoatView({ model : this.model.get('boat') }), 'right');

		},

		cancellations: function() {
			
			Parse.Analytics.track('boatday-click-cancel');

			this.overlay(new CancellationsView({ model : this.model }));

		},

		water: function() {
			
			Parse.Analytics.track('boatday-click-cancel');

			this.overlay(new WaterPolicyView({ model : this.model }));

		},
		
		terms: function() {
			
			Parse.Analytics.track('boatday-click-cancel');

			this.overlay(new TermsView({ model : this.model }));

		},

		share: function() {

		},
		
		ask: function() {

			Parse.Analytics.track('boatday-click-ask');

			this.overlay(new QuestionView({ model: new QuestionModel(), parentView: this }));

		},

		map: function() {
			
			Parse.Analytics.track('boatday-click-map');

			this.modal(new MapView({ model : this.model, precise: false }));

		},

		cancelModal: function() {

		},

		cancel: function() {
			
			var self = this;

			if( self.loading('.btn-cancel') ) {
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
								self._info('BoatDay Cancelled. You can find this event in the Past BoatDays section');
								Parse.history.navigate('boatdays-past', true);
							});
							
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

		book: function() {

			Parse.Analytics.track('boatday-click-book');
			
			this.modal(new BookView({ model : this.model }));

		},

		render: function( init ) {

			BaseView.prototype.render.call(this);

			var self = this;

			var queryBoatPictures = this.model.get('boat').relation('boatPictures').query();
			queryBoatPictures.ascending('order');
			queryBoatPictures.find().then(function(files) {

				if( files.length == 0 )
					return;

				self.$el.find('.boatday-images .swiper-wrapper').html('');

				_.each(files, function(fh) {
					self.$el.find('.boatday-images .swiper-wrapper').append('<div class="swiper-slide"><div class="boatday-image" style="background-image:url('+fh.get('file').url()+')"></div></div>');
				});

				var swiperBoatDays = new Swiper(self.$el.find('.boatday-images'), {
					pagination: self.$el.find('.swiper-pagination'),
					paginationClickable: true,
				});
			});

			queryBoatPictures.first().then(function(fh) {
				self.$el.find('.boat-picture, .sharing').css({ backgroundImage: 'url(' + fh.get('file').url() + ')' });
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

			var queryQuestionsPrivate = self.model.relation('questions').query();
			queryQuestionsPrivate.equalTo('status', 'approved');
			queryQuestionsPrivate.equalTo('from', Parse.User.current().get('profile'));

			var queryQuestionsPublic = self.model.relation('questions').query();
			queryQuestionsPublic.equalTo('status', 'approved');
			queryQuestionsPublic.notEqualTo('answer', null);
			queryQuestionsPublic.equalTo('public', true);

			var queryQuestions = new Parse.Query.or(queryQuestionsPublic, queryQuestionsPrivate);
			queryQuestions.include('profile');
			queryQuestions.find().then(function(questions) {

				if(questions.length == 0) {
					self.$el.find('.questions-list').addClass('empty').html('<p class="text-center">No questions asked yet</p>');
					return;
				}

				_.each(questions, function(question) {
					var answer = typeof question.get('answer') !== typeof undefined && question.get('answer') !== null? question.get('answer').replace(/\n/g, "<br>") : 'No answer yet.';
					var question = question.get('question').replace(/\n/g, "<br>");
					self.$el.find('.questions-list').append('<div class="question"><p class="question">'+question+'</p><p class="answer"><span>HOST</span>'+answer+'</p></div>');					
				});
				
			}, function(error) {console.log(error)});

			return this;

		}

	});
	return BoatDayView;
});