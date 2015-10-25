define([
'views/BaseView',
'text!templates/PromoCodeTemplate.html'
], function(BaseView, PromoCodeTemplate){
	var PromoCodeView = BaseView.extend({

		className: 'screen-promo-code',

		template: _.template(PromoCodeTemplate),

		events: {
			'click .btn-save' : 'createPromo'
		}, 

		createPromo: function(event) {
			event.preventDefault();

			var self = this;

			if( self.loading('.btn-save') ) {
				return ;
			}

			self.cleanForm();

			
		}

	});
	return PromoCodeView;
});