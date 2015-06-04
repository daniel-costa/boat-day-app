# boat-day-app

## Installation

* `bower install`
* `sudo rm -R plugins` we delete the current plugins
* `sudo cordova platform remove ios` delete the current release
* `sudo rm -R platforms` we delete the current plugins

* `sudo cordova platform add ios`

Add all plugins now
* `sudo cordova plugin add pluginsBase/com.phonegap.plugins.facebookconnect --variable APP_ID=1442439216059238 --variable APP_NAME=BoatDay`
* `sudo cordova plugin add pluginsBase/cordova-plugin-whitelist`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.camera`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.console`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.dialogs`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.geolocation`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.inappbrowser`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.labs.keyboard`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.statusbar`

Add iOS again and rebuild
* `sudo cordova build`

* `sudo chmod -R 777 .`