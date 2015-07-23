define([
'models/ReportModel',
'views/BaseView',
'views/ReportView',
'views/CertificationsView',
'text!templates/ProfileTemplate.html',
'text!templates/ProfileReviewTemplate.html'
], function(ReportModel, BaseView, ReportView, CertificationsView, ProfileTemplate, ProfileReviewTemplate){
	var ProfileView = BaseView.extend({

		className: 'screen-profile',

		template: _.template(ProfileTemplate),

		events: {
			'click .report': 'report',
			'click .certifications': 'certifications',
			'click .profile-picture': 'profile',
		},
		
		profiles: {},

		report: function() {

			var m = new ReportModel({
				action: 'profile',
				profile: this.model
			});

			this.modal(new ReportView({ model : m }));
		},

		certifications: function(event) {
			this.modal(new CertificationsView());
		},

		profile: function(event) {
			this.modal(new ProfileView({ model: this.profiles[$(event.currentTarget).attr('data-id')] }));
		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			if( this.model.get('host') ) {
				
				var innerQuery = new Parse.Query(Parse.Object.extend('BoatDay'));
				innerQuery.equalTo('captain', this.model);
				innerQuery.equalTo('status', 'complete');

				var query = new Parse.Query(Parse.Object.extend('SeatRequest'));
				query.matchesQuery('boatday', innerQuery);
				query.equalTo('status', 'approved');
				query.notEqualTo('reviewGuest', '');
				query.notEqualTo('reviewGuest', null);
				query.include('profile');
				query.find().then(function(requests) {

					if( requests.length == 0 ) {
						self.$el.find('.reviews').html('<p class="text-center">No reviews for this host</p>');
						return;
					}

					self.$el.find('.reviews').html('<h5>Reviews</h5>');

					var _tpl = _.template(ProfileReviewTemplate);

					_.each(requests, function(request) {
						// if( request.get('reviewGuest') != "" ) {
							self.profiles[request.get('profile').id] = request.get('profile');
							self.$el.find('.reviews').append(_tpl({ request : request }));
						// }
					});
				});
			}

			return this;
		}

	});
	return ProfileView;
});