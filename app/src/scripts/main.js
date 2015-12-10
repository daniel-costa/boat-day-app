
document.body.innerHTML = '<div id="app" style="display:none;"><div id="content" class="snap-content"></div></div><div id="fb-root"></div>';

window.installationId = null;
window.deepLinking = null;
window.appStarted = false;
window.isAndroid = navigator != undefined && navigator.userAgent != undefined && navigator.userAgent.toLowerCase().indexOf('android') > -1;

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

require.config({
	
	// By pass RequireJS Cache
	urlArgs: "bust=" + (new Date()).getTime(),

	paths: {
		jquery:	 	       'vendor/jquery/dist/jquery.min',
		underscore:        'vendor/underscore/underscore-min',
		parse:		       'vendor/parse/parse.min',
		text: 		       'vendor/requirejs-text/text',
		snapjs:	 	       'vendor/Snap.js/dist/latest/snap.min',
		fastclick:         'vendor/fastclick/lib/fastclick',
		async:		       'vendor/requirejs-plugins/src/async',
		masks: 		       'vendor/jquery-mask-plugin/dist/jquery.mask.min',
		Swiper: 	       'vendor/swiper/dist/js/swiper.jquery.umd.min',
		bootstrap: 	       'vendor/bootstrap/dist/js/bootstrap.min',
		slider: 	       'vendor/seiyria-bootstrap-slider/dist/bootstrap-slider.min',
		stripe:		       'https://js.stripe.com/v2/?1',
		facebook: 	       'http://connect.facebook.net/en_US/all',
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
		}
	},

	googlemaps: {
		params: {
			key: 'AIzaSyDWM2B3u-5wW4sqLtd__BqjHNPSNsUpzYg'
		}
	}
});

require(['fastclick', 'router', 'views/AppView', 'parse', 'snapjs', 'slider'], function(FastClick, AppRouter, AppView) {

	FastClick.attach(document.body);

	document.addEventListener("deviceReady", function() {

		console.log("~> device ready");
		
		var startApp = function(data) {
			
			if( window.appStarted ) {
				console.log('** app started already **');
				return;
			}

			console.log(Parse);

			Parse.initialize(data.parseAppId, data.parseJavaScriptKey);

			if( window.isAndroid ) {
				$('body').addClass('android');
			}

			new AppView(function() {
				new AppRouter();
				window.appStarted = true;
				Parse.history.start();
			});
		};

		BDHelper.initialize(function(data) {

			if( data.action == "reload" ) {
				window.location.reload();
			}

			BDHelper.getInstallationId(function(installationId) {
				window.installationId = installationId;
				startApp(data);
			});
		});

		setTimeout(function() {
			if( !window.appStarted ) {
				alert('Oops! An error occurred (Code: 1004), please close and re-lunch the app or contact us at contact@boatdayapp.com');
			}
		}, 20000);

		Keyboard.onshowing = function () { StatusBar.hide(); };
		Keyboard.onhiding  = function () { StatusBar.show(); };
		
	}, false);

});