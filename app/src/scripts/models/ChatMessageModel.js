define(['underscore'], function(_){

	var ChatMessageModel = Parse.Object.extend("ChatMessage", {

		defaults: {
			status: "approved",
			message: null,
			boatday: null,
			profile: null,
			addToBoatDay: true,
		},

	});

	return ChatMessageModel;

});