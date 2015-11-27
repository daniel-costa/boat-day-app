
// Require.js allows us to configure shortcut alias

require.config({
	
	// By pass RequireJS Cache
	urlArgs: "bust=" + (new Date()).getTime(),

	paths: {
		jquery:	 	'vendor/jquery/dist/jquery.min',
		underscore: 'vendor/underscore/underscore-min',
		parse:		'vendor/parse/parse.min',
		text: 		'vendor/requirejs-text/text',
		snapjs:	 	'vendor/Snap.js/dist/latest/snap',
		facebook: 	'http://connect.facebook.net/en_US/all',
		fastclick:  'vendor/fastclick/lib/fastclick',
		stripe:		'https://js.stripe.com/v2/?1',
		async:		'vendor/requirejs-plugins/src/async',
		masks: 		'vendor/jquery-mask-plugin/dist/jquery.mask.min',
		Swiper: 	'vendor/swiper/dist/js/swiper.jquery.umd.min',
		bootstrap: 	'vendor/bootstrap/dist/js/bootstrap.min',
		calendar: 	'vendor/bootstrap-calendar/js/calendar.min', 
		slider: 	'vendor/seiyria-bootstrap-slider/dist/bootstrap-slider.min',
	},

	shim: {
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
		},
		"Swiper": {
			deps: ["jquery"]
		},
		"bootstrap": {
			deps: ["jquery"]
		}, 	
		"slider": {
			deps: ["jquery", "bootstrap"],
			exports: 'slider'
		}, 
		"calendar": {
			deps: ["jquery", "bootstrap"],
			exports: 'calendar'
		}
	},
	googlemaps: {
		params: {
			key: 'AIzaSyDWM2B3u-5wW4sqLtd__BqjHNPSNsUpzYg'
		}
	}
});

window.installation = {};
window.deepLinking = null;
window.isAndroid = false;

function handleOpenURL(url) {

	if( url.indexOf('?') == -1 ) {
		url += '?';
	}
	var action = url.substring(url.indexOf('://') + 3, url.indexOf('?'));

	if( action !== 'boatday' ) {
		return;
	}
	
	var link = {
		action: action,
		params: {}
	};

	var params = url.substring(url.indexOf('?') + 1).split('&');

	for (var i = 0; i < params.length; i++) {
		var match = params[i].split("=");
		link.params[match[0]] = match[1];
	}

	window.deepLinking = link;

	Parse.history.loadUrl(Parse.history.fragment);

}

require(['fastclick', 'parse', 'router', 'views/AppView', 'snapjs', 'slider', 'calendar'], function(FastClick, Parse, AppRouter, AppView) {

	FastClick.attach(document.body);

	document.addEventListener("deviceReady", function() {

		console.log("device ready");
	
		var appStarted = false;

		var startApp = function() {

			if( appStarted ) 
				return;

			appStarted = true;

			//Parse.initialize("8YpQsh2LwXpCgkmTIIncFSFALHmeaotGVDTBqyUv", "FaULY8BIForvAYZwVwqX4IAmfsyxckikiZ2NFuEp"); // HP
			 Parse.initialize("LCn0EYL8lHOZOtAksGSdXMiHI08jHqgNOC5J0tmU", "kXeZHxlhpWhnRdtg7F0Cdc6kvuGHVtDlnSZjfxpU"); // QA 

			new AppView(function() {
				new AppRouter();
				Parse.history.start();
			});

		};
		
		window.isAndroid = navigator != undefined && navigator.userAgent != undefined && navigator.userAgent.indexOf("Android") > 0;

		if(window.isAndroid){
			window.installation.installationId = BDHelper.getInstallationId();
			startApp();
		} else {

			bdHelper = BDHelper.init();

			bdHelper.on('registration', function(params) {
				window.installation.token = params.token;
				startApp();
			});

			bdHelper.on('error', function(e) {
				console.log("Error on BDHelper" + e);
				startApp();
			});
		}

		Keyboard.onshowing = function () {
			StatusBar.hide();
		};

		Keyboard.onhiding = function () {
			StatusBar.show();
		};
		
	}, false);

});