
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
		snapjs:     'vendor/Snap.js/dist/latest/snap',
		facebook: 	'http://connect.facebook.net/en_US/all',
		fastclick:  'vendor/fastclick/lib/fastclick',
		stripe:     'https://js.stripe.com/v2/?1',
		async:		'vendor/requirejs-plugins/src/async',
		masks: 		'vendor/jquery-mask-plugin/dist/jquery.mask.min'
	},

	shim: {
		"ratchet": { 
			deps: ["jquery"]
		},
		"snapjs": { 
			deps: ["jquery"]
		},
		"parse": {
			deps: ["jquery", "underscore"],
			exports: "Parse"
		},
		"stripe": {
			exports: "Stripe"
		},
		"masks": {
			deps: ["jquery"]
		}
	},
	googlemaps: {
		params: {
			key: 'AIzaSyDWM2B3u-5wW4sqLtd__BqjHNPSNsUpzYg'
		}
	}
});

window.installation = {};

function onNotificationAPN (event) {
    if ( event.alert ) {
    	// We do not show the notification when in the app
        // $(document).trigger('globalInfo', event.alert);
        $(document).trigger('updateNotificationsAmount');
    }
}

require(['fastclick', 'parse', 'router', 'views/AppView', 'ratchet', 'snapjs'], function(FastClick, Parse, AppRouter, AppView) {

	FastClick.attach(document.body);

	document.addEventListener("deviceReady", function() {

		console.log("device ready");

		window.plugins.pushNotification.register(function (result) {
			window.installation.token = result;
		}, function (error) { 
			console.log('error = ' + error); 
		}, {
            "badge":"true",
            "sound":"true",
            "alert":"true",
            "ecb":"onNotificationAPN"
    	});

		Keyboard.onshowing = function () {
			StatusBar.hide();
		}

		Keyboard.onhiding = function () {
			StatusBar.show();
		}

		// Parse.initialize("8YpQsh2LwXpCgkmTIIncFSFALHmeaotGVDTBqyUv", "FaULY8BIForvAYZwVwqX4IAmfsyxckikiZ2NFuEp"); // HP
		Parse.initialize("LCn0EYL8lHOZOtAksGSdXMiHI08jHqgNOC5J0tmU", "kXeZHxlhpWhnRdtg7F0Cdc6kvuGHVtDlnSZjfxpU"); // QA 

		new AppView(function() {
			new AppRouter();
			Parse.history.start();
		});

	}, false);

});