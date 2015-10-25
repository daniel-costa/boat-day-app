define([
'views/BaseView',
'text!templates/PromoCodeTemplate.html'
], function(BaseView, PromoCodeTemplate){
	var PromoCodeView = BaseView.extend({

		className: 'screen-promo-code',

		template: _.template(PromoCodeTemplate),

	});
	return PromoCodeView;
});