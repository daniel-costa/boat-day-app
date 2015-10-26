define([
'underscore',
'parse'
], function(_, Parse){

	var SeatRequestModel = Parse.Object.extend("SeatRequest", {

		defaults: {
			status: "pending",
			seats: null,
			card: null,
			boatday: null,
			contribution: null,
			contributionPaid: false,
			cancelled: false,
			message: null,
			guestLastRead: null,
			reviewGuest: null,
			ratingGuest: null,
			ratingHost: null,
		},

	});

	return SeatRequestModel;

});