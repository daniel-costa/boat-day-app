
// Require.js allows us to configure shortcut alias

require.config({
	
	// By pass RequireJS Cache
	urlArgs: "bust=" + (new Date()).getTime(),

	paths: {
		jquery:     'vendor/jquery/dist/jquery.min',
		underscore: 'vendor/underscore/underscore-min',
		parse:      'vendor/parse/parse.min',
		text:       'vendor/requirejs-text/text',
		ratchet:    'vendor/ratchet/dist/js/ratchet',
		snapjs:     'vendor/Snap.js/snap',
		facebook: 	'http://connect.facebook.net/en_US/all',
		fastclick:  'vendor/fastclick/lib/fastclick',
		stripe:     'https://js.stripe.com/v2/?1'
	},
	shim: {
		"ratchet" : { 
			deps: ['jquery']
		},
		"snapjs" : { 
			deps: ['jquery']
		},
		'parse': {
			deps: ["jquery", "underscore"],
			exports: "Parse"
		},
		'stripe': {
			exports: "Stripe"
		}
	},
	googlemaps: {
		params: {
			key: 'AIzaSyDWM2B3u-5wW4sqLtd__BqjHNPSNsUpzYg'
		}
	}
});

require(['fastclick', 'parse', 'router', 'views/AppView', 'ratchet', 'snapjs'], function(FastClick, Parse, AppRouter, AppView) {
	
	$('video').get(0).play();

	var run = function() {

		console.log("device ready");
	
		my_media = new Media("resources/sfx/opening.wav", function(){}, function(error){ console.log(error) });
		my_media.play();

		Keyboard.onshowing = function () {
			StatusBar.hide();
		}

		Keyboard.onhiding = function () {
			StatusBar.show();
		}

		Parse.initialize("8YpQsh2LwXpCgkmTIIncFSFALHmeaotGVDTBqyUv", "FaULY8BIForvAYZwVwqX4IAmfsyxckikiZ2NFuEp"); // HP
		// Parse.initialize("LCn0EYL8lHOZOtAksGSdXMiHI08jHqgNOC5J0tmU", "kXeZHxlhpWhnRdtg7F0Cdc6kvuGHVtDlnSZjfxpU"); // QA 

		var init = function() {
			new AppRouter();
			Parse.history.start();
		};

		new AppView(init);

	};

	FastClick.attach(document.body);

	document.addEventListener("deviceReady", run, false);

});