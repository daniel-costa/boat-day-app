define([
'models/ReportModel',
'models/QuestionModel',
'views/BaseView',
'views/BookView',
'views/ReportView',
'views/CancellationsView',
'views/ProfileView',
'views/MapView',
'text!templates/BoatDayTemplate.html'
], function(ReportModel, QuestionModel, BaseView, BookView, ReportView, CancellationsView, ProfileView, MapView, BoatDayTemplate){
	var BoatDayView = BaseView.extend({

		className: 'screen-boatday',

		template: _.template(BoatDayTemplate),

		events: {
			'click .btn-book': 'book',
			'click .btn-cancel': 'cancel',
			'click .btn-cancel-modal': 'cancelModal', 
			'click .report': 'report', 
			'click .open-profile-picture': 'profile',
			'click .profile-picture': 'profile',
			'click .map': 'map',
			'click .btn-ask-question': 'askOverlay',
			'click .btn-question': 'ask',
			'click .question-toggle': 'toggleQuestion',
			'blur [name="question"]': 'censorField'
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

		toggleQuestion: function(event) {
			var e = $(event.currentTarget);
			var parent = e.closest('.question');

			if( e.hasClass('open') ) {
				e.removeClass('open')
				e.find('img').attr('src', 'resources/ico-plus.png');
				parent.find('.inner.a').hide();
			} else {
				e.addClass('open')
				e.find('img').attr('src', 'resources/ico-minus.png');
				parent.find('.inner.a').show();
			}
		},

		ask: function() {

			Parse.Analytics.track('boatday-send-question');

			var overlay = this.$el.find('.overlay');
			var self = this;

			new QuestionModel().save({
				from: Parse.User.current().get('profile'),
				question: this._in('question').val(),
				boatday: this.model,
				public: this._in('public').val() == 'true'
			}).then(function() {
				self._info('Thank you! The question is sent to the Host. Once he answered, you will receive a notification');
				self.hideOverlay(overlay);
				self.render();
			}, function(error) {
				Parse.Analytics.track('boatday-send-question-fail');
				console.log(error);
			})
		},

		askOverlay: function() {

			Parse.Analytics.track('boatday-click-ask');

			var self = this;
			self.showOverlay({
				target: self.$el.find('.overlay'),
				closeBtn: true,
				cbClose: function(overlay) {
					overlay.find('textarea').val('');
				}
			});
		},

		report: function() {

			Parse.Analytics.track('boatday-click-report');

			var m = new ReportModel({
				action: 'boatday',
				boatday: this.model
			});
			this.modal(new ReportView({ model : m }));

		},

		cancelModal: function() {
			
			Parse.Analytics.track('boatday-click-cancel');

			this.modal(new CancellationsView({ model : this.model }));

		},

		map: function() {
			
			Parse.Analytics.track('boatday-click-map');

			this.modal(new MapView({ model : this.model, precise: false }));

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

		profile: function(event) {

			Parse.Analytics.track('boatday-click-profile');
			
			this.modal(new ProfileView({ model: this.profiles[$(event.currentTarget).attr('data-id')] }));

		},

		book: function() {

			Parse.Analytics.track('boatday-click-book');
			
			this.modal(new BookView({ model : this.model }));

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

			var queryQuestionsPublic = self.model.relation('questions').query();
			queryQuestionsPublic.equalTo('status', 'approved');
			queryQuestionsPublic.notEqualTo('answer', null);
			queryQuestionsPublic.equalTo('public', true);

			var queryQuestionsPrivate = self.model.relation('questions').query();
			queryQuestionsPrivate.equalTo('status', 'approved');
			queryQuestionsPrivate.equalTo('public', false);
			queryQuestionsPrivate.equalTo('from', Parse.User.current().get('profile'));

			var queryQuestions = new Parse.Query.or(queryQuestionsPublic, queryQuestionsPrivate);
			queryQuestions.include('profile');
			queryQuestions.find().then(function(questions) {

				if(questions.length == 0) {
					self.$el.find('.questions').addClass('empty').html('<p class="text-center">No questions asked yet</p>');
					return;
				}

				_.each(questions, function(question) {
					self.questions[question.id] = question;
					var answer = typeof question.get('answer') !== typeof undefined && question.get('answer') !== null? question.get('answer').replace(/\n/g, "<br>") : 'No answer yet.';
					self.$el.find('.questions').append('<div class="question"><div class="inner q question-toggle"><table><tr><td><p>'+question.get('question').replace(/\n/g, "<br>")+'</p></td><td><img src="resources/ico-plus.png" /></td></tr></table></div><div class="inner a" style="display:none"><p>'+answer+'</p></div></div>');
				});
				
			}, function(error) {console.log(error)});

			return this;

		}

	});
	return BoatDayView;
});