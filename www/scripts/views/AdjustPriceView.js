define([
'views/BaseView',
'text!templates/AdjustPriceTemplate.html'
], function(BaseView, AdjustPriceTemplate){
	var AdjustPriceView = BaseView.extend({

		className: 'screen-adjust-price',

		template: _.template(AdjustPriceTemplate),

	});
	return AdjustPriceView;
});