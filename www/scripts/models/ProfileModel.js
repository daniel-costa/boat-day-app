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
			position:null,
			rating: null,
			ratingAmount: 0
		},

		validate: function(attributes) {
			
			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			var profileInfo = attributes.status == 'complete-info';
			var profilePicture = attributes.status == 'complete';

			if( profilePicture ) {

				if( !attributes.about ) {
					_return.fields.about = "Indicate about";
				}

				if( !attributes.profilePicture ) {
					_return.fields.profilePicture = "Indicate profile picture";
				}

			}

			if( profileInfo ) {

				if( !attributes.firstName ) {
					_return.fields.firstName = "Indicate firstName";
				}

				if( !attributes.lastName ) {
					_return.fields.lastName = "Indicate lastName";
				}


				if( !attributes.phone ) {
					_return.fields.phone = "Indicate lastName";
				}

				if( !attributes.birthday ) {
					_return.fields.birthday = "Indicate birthdate";
				}

			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		}

	});

	return ProfileModel;

});