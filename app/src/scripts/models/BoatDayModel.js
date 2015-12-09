define([], function(){
	var BoatdayModel = Parse.Object.extend("BoatDay", {

		defaults: {
			status: 'creation', 
			host: null, 
			boat: null, 
			captain: null, 
			name: null, 
			date: null,
			duration: null, 
			price: null, 
			availableSeats: null, 
			minimumSeats: null, 
			location: null, 
			description: null,
			bookingPolicy: null, 
			cancellationPolicy: null, 
			category: null
		}

	});
	return BoatdayModel;
});