define([
'views/BaseView',
'text!templates/FilterTemplate.html'
], function(BaseView, FilterTemplate){
	var FilterView = BaseView.extend({

		className: 'screen-filter',

		template: _.template(FilterTemplate),

		events: {
			'click .category': 'category',
			'click .save': 'save'
		},

		parentView: null,

		initialize: function(data) {
			this.parentView = data.parentView;
		},

		category: function(event) {

			this.$el.find('.category.active').removeClass('active');
			$(event.currentTarget).addClass('active');

		},

		save: function(event) {

			var self = this;

			var newFilters = self.defineFilters();
			newFilters.category = this.$el.find('.category.active').attr('data-value');

			switch( parseInt(this._in('price').val()) ) {
				case 0  : newFilters.price  = [0, 50]; break;
				case 50 : newFilters.price  = [50, 100]; break;
				case 100: newFilters.price  = [100, 150]; break;
				case 150: newFilters.price  = [150, 200]; break;
				case 200: newFilters.price  = 200; break;
				default : newFilters.price  = null; break;
			}

			if( this._in('seats').val() != "" ) {
				newFilters.seats = parseInt(this._in('seats').val());
			} else {
				newFilters.seats = null;
			}

			if( this._in('date').val() != "" ) {
				newFilters.date = this._in('date').val()
			} else {
				newFilters.date = null;
			}

			Parse.User.current().get('profile').save({
				filters: newFilters
			}).then(function() {
				self.parentView.render();
				self.close();
			});
		},

	});
	return FilterView;
});