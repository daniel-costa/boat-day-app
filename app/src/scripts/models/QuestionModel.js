define([], function(){

	var QuestionModel = Parse.Object.extend("Question", {

		defaults: {
			status: "approved",
			addToBoatDay: true,
			boatday: null,
			question: null,
			answer: null,
			from: null,
			public: true,
		},

		validate: function(attributes) {
			
			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			if( attributes.question == '' ) {
				_return.fields.question = "Indicate message";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		}

	});

	return QuestionModel;

});
