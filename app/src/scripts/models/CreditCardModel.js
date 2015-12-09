define([], function(){

	var ProfileModel = Parse.Object.extend("CreditCard", {

		defaults: {
			brand: "creation",
			exp_month: null,
			exp_year: null,
			last4: null,
			token: null,
			stripe: null,
		},

	});

	return ProfileModel;

});