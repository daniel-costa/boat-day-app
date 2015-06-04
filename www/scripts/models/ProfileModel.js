define([
'underscore',
'parse'
], function(_, Parse){

	var ProfileModel = Parse.Object.extend("Profile", {

		defaults: {
			status: "creation",
			
			displayName: null,
			gender: null,
			birthday: null,
			about: null,
			
			profilePicture: null,
			
			braintreeId: null,
			position:null
		},

		validate: function(attributes) {
			
			if( !attributes.displayName ) {

				return "Display Name is empty";

			}

			if( !attributes.birthday ) {

				return "Indicate birthdate";

			}

			if( !attributes.about ) {

				return "Indicate about";

			}

		}

	});

	return ProfileModel;

});