define([
'views/BaseView',
'text!templates/PriceInformationTemplate.html'
], function(BaseView, PriceInformationTemplate){
	var PriceInformationView = BaseView.extend({

		className: 'screen-price-info',

		template: _.template(PriceInformationTemplate),

	});
	return PriceInformationView;
});