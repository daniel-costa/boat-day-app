window.appStarted = false;

setTimeout(function() {
	if( !window.appStarted ) {
		alert('Oops! An error occurred (Code: 1004), please close and re-lunch the app or contact us at contact@boatdayapp.com');
	}
}, 30000);

document.addEventListener("deviceReady", function() {

	console.log("~> device ready");

	BDHelper.initialize(function(data) {
		
		console.log(data);

		BDHelper.getInstallationId(function(installationId) {
			window.BDHelper = data;
			window.BDHelper.installationId = installationId;

			var nocache = "?bustTime=" + (new Date()).getTime();

			var js = document.createElement('script')
			js.setAttribute("type","text/javascript")
			js.setAttribute("src", "require.js")
			js.setAttribute("data-main", window.BDHelper.remoteInstance + "boatday.min.js" + nocache)

			var css=document.createElement("link")
			css.setAttribute("rel", "stylesheet")
			css.setAttribute("type", "text/css")
			css.setAttribute("href", window.BDHelper.remoteInstance + "boatday.min.css" + nocache)

			document.getElementsByTagName("head")[0].appendChild(js);
			document.getElementsByTagName("head")[0].appendChild(css);

			window.appStarted = true;
		});
	});
}, false);