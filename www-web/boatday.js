
var BDHelper = {
    initialize: function(successCallback) {
        successCallback({
    		parseAppId: 'LCn0EYL8lHOZOtAksGSdXMiHI08jHqgNOC5J0tmU',
    		parseJavaScriptKey: 'kXeZHxlhpWhnRdtg7F0Cdc6kvuGHVtDlnSZjfxpU',
    		remoteServer: 'https://app.boatdayapp.com/',
    		remoteVersion: '3.3.1',
    		remoteInstance: 'http://127.0.0.1:8080/3.3.1/',
        });
    },

    getInstallationId: function(successCallback) {
        successCallback(null);
    },
};

var Keyboard = {
	show: function() {},
	hide: function() {}
};

var StatusBar = {
	show: function() {},
	hide: function() {}
};

nativeFeature = function() {
	alert('this feature is not available on the live version.');
};

navigator.camera = {
	getPicture: function(cb, err, data) {
		
		if( typeof data.cameraDirection !== typeof undefined) {
			nativeFeature();
			err();
		}

		$('<input type="file">').change(function() {
				
			if(this.files[0].type !== 'image/jpeg') {
				err('bad-format');
				return;
			}

			var reader = new FileReader()

			reader.onload = function(event) {
				cb(event.target.result);
			}

			reader.readAsDataURL(this.files[0]);

		}).click();
		
	}
};

facebookConnectPlugin = {
	login: function() {
		nativeFeature();
	},
	logout: function() {}
}

navigator.notification = {
	confirm: function(text, cb, title, buttons) {
		buttons.length !== 2 ? nativeFeature() : cb( confirm(text) ? 2 : 1);
	}
};


document.addEventListener("deviceReady", function() {

	console.log("~> device ready");	

	BDHelper.initialize(function(data) {
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
		});
	});
}, false);

document.dispatchEvent(new CustomEvent("deviceReady"));