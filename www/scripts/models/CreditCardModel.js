define([
'underscore',
'parse'
], function(_, Parse){

	var ProfileModel = Parse.Object.extend("CreditCard", {

		defaults: {
			status: "creation",
			holder: null,
			number: null,
			expiry: null,
			cvv: null,
			profile: null,
			paymentId: null
		},

		validate: function(attributes) {
			
			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			if( !attributes.holder ) {
				_return.fields.holder = "Card Holder cannot be empty";
			}

			if( !attributes.number ) {
				_return.fields.number = "Card Number cannot be empty";
			}

			if( !attributes.expiry ) {
				_return.fields.expiry = "Card Number cannot be empty";
			}

			if( !attributes.cvv ) {
				_return.fields.cvv = "Card Number cannot be empty";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		}

	});

	return ProfileModel;

});