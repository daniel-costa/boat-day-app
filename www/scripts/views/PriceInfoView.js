define([
'views/BaseView',
'text!templates/PriceInfoTemplate.html'
], function(BaseView, PriceInfoTemplate){
	var PriceInfoView = BaseView.extend({

		className: 'screen-price-info',

		template: _.template(PriceInfoTemplate),

	});
	return PriceInfoView;
});