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
'text!templates/BoatDayTemplate.html', 
'text!templates/CardBoatDayGuestsTemplate.html'
], function(Swiper, QuestionModel, BaseView, BoatView, TermsView, CancellationsView, WaterPolicyView, ProfileView, BookView, MapView, QuestionView, BoatDayTemplate, CardBoatDayGuestsTemplate){
	var BoatDayView = BaseView.extend({

		className: 'screen-boatday',

		template: _.template(BoatDayTemplate),

		events: {
			'click .cancel': 'cancel',
			'click .open-captain': 'profile',
			'click .open-guest': 'profile',
			'click .boatday-guests': 'profile',
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
		afterRenderScrollTo: null,

		share: function(event) {
			
			var self = this;

			var boatday = this.model;
			var seats = boatday.get('availableSeats') - boatday.get('bookedSeats');

			var opts = {
				method: "share",
				href: "https://www.boatdayapp.com/dl/boatday/"+boatday.id,
			};

			facebookConnectPlugin.showDialog(opts, function() {
				console.log('success');
			}, function(error) {
				console.log(error);
			});

		},

		initialize: function(data) {

			if( typeof data.fromUpcoming !== typeof undefined) {
				this.fromUpcoming = data.fromUpcoming;
			}

			if( typeof data.seatRequest !== typeof undefined) {
				this.seatRequest = data.seatRequest;
			}


			if( typeof data.queryString !== typeof undefined) {
					
				var qs = this.splitURLParams(data.queryString);
				if( qs['afterRenderScrollTo'] ) {
					this.afterRenderScrollTo = qs['afterRenderScrollTo'];
				}
			}

		},

		afterRenderInsertedToDom: function() {
			if( this.afterRenderScrollTo ) {
				this.$el.find('main').animate({
					scrollTop: this.$el.find(this.afterRenderScrollTo).position().top
				}, 1000);
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
		
		ask: function() {

			Parse.Analytics.track('boatday-click-ask');

			this.overlay(new QuestionView({ model: new QuestionModel(), parentView: this }));

		},

		map: function() {
			
			Parse.Analytics.track('boatday-click-map');

			this.modal(new MapView({ model : this.model, precise: this.fromUpcoming }));

		},

		cancel: function() {
			
			var self = this;

			if( self.loading('.cancel') ) {
				return ;
			}

			var prompt = function(buttonIndex) {

				switch(buttonIndex) {
					case 2: 

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
								self.loading();
								self._info('BoatDay Cancelled. You can find this event in "My BoatDays", Cancelled section');
								Parse.history.navigate('requests?subView=past', true);
							});
						});
						break;
					default:
						self.loading();
						break;
				}
				
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
			
			this.modal(new BookView({ 
				self:  this, 
				model: this.model 
			}));

		},

		render: function( init ) {

			BaseView.prototype.render.call(this);

			var self = this;

			var queryBoatDayPictures = this.model.relation('boatdayPictures').query();
			queryBoatDayPictures.ascending('order');
			queryBoatDayPictures.find().then(function(files) {

				if( files.length == 0 )
					return;

				self.$el.find('.boatday-images .swiper-wrapper').html('');

				_.each(files, function(fh) {
					if( typeof fh !== typeof undefined ) {
						self.$el.find('.boatday-images .swiper-wrapper').append('<div class="swiper-slide"><div class="boatday-image" style="background-image:url('+fh.get('file').url()+')"></div></div>');
					}
				});

				var swiperBoatDays = new Swiper(self.$el.find('.boatday-images'), {
					pagination: self.$el.find('.swiper-pagination'),
					paginationClickable: true,
				});
			});

			var queryBoatPictures = this.model.get('boat').relation('boatPictures').query();
			queryBoatPictures.ascending('order');
			queryBoatPictures.first().then(function(fh) {
				if( typeof fh !== typeof undefined ) {
					self.$el.find('.boat-picture, .sharing').css({ backgroundImage: 'url(' + fh.get('file').url() + ')' });
				}
			});
			
			self.profiles[self.model.get('captain').id] = self.model.get('captain');

			var queryQuestionsPrivate = self.model.relation('questions').query();
			queryQuestionsPrivate.equalTo('status', 'approved');
			queryQuestionsPrivate.descending('createdAt');
			queryQuestionsPrivate.equalTo('from', Parse.User.current().get('profile'));

			var queryQuestionsPublic = self.model.relation('questions').query();
			queryQuestionsPublic.equalTo('status', 'approved');
			queryQuestionsPublic.notEqualTo('answer', null);
			queryQuestionsPublic.equalTo('public', true);
			queryQuestionsPublic.descending('createdAt');

			var queryQuestions = new Parse.Query.or(queryQuestionsPublic, queryQuestionsPrivate);
			queryQuestions.include('profile');
			queryQuestions.find().then(function(questions) {

				_.each(questions, function(question) {
					var answer = typeof question.get('answer') !== typeof undefined && question.get('answer') !== null? question.get('answer').replace(/\n/g, "<br>") : 'No answer yet.';
					var question = question.get('question').replace(/\n/g, "<br>");
					self.$el.find('.questions-list').append('<div class="question"><p class="question"><span>Q: </span>'+question+'</p><p class="answer"><span>A: </span>'+answer+'</p></div>');					
				});

				if(questions.length == 0) {
					self.$el.find('.questions-list').addClass('empty').html('<p class="text-center">Need more information?</p>');
					return;
				}
				
			}, function(error) {
				console.log(error)
			});

			var guestsQuery = self.model.relation('seatRequests').query();
			guestsQuery.equalTo('status', 'approved');
			guestsQuery.include('profile');
			guestsQuery.find().then(function(guests) {
				
				_.each(guests, function(guest) {
					self.profiles[guest.get('profile').id] = guest.get('profile');
					self.$el.find('.guests .list').prepend(_.template(CardBoatDayGuestsTemplate)({ model: guest }));
				});

				if( guests.length == 0 ) {
					self.$el.find('.guests .list').html('<p class="text-center no-data">No confirmed Guests, yet.</p>');
					return;
				} 

			}, function(error) {
				console.log(error)
			});

			return this;
		}
	});
	return BoatDayView;
});