define([
'views/BaseView',
'text!templates/ProfilePaymentsTemplate.html'
], function(BaseView, ProfilePaymentsTemplate){
	var ProfilePaymentsView = BaseView.extend({

		className: 'screen-profile-payments',

		template: _.template(ProfilePaymentsTemplate),

		statusbar: true,
		
		drawer: true,

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			Parse.User.current().get('profile').relation('cards').query().find().then(function(cards) {
				
				self.$el.find('.cards-list .table-view').html('');

				_.each(cards, function(card) {
					self.$el.find('.cards-list .table-view').append('<li class="table-view-cell text-center">'+card.get('brand')+': **** **** **** '+card.get('last4')+'</li>');
				});

			});

			return this;
		}

	});
	return ProfilePaymentsView;
});