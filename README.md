# boat-day-app

## Move and compile code
* `cd ~/GitHub/boat-day-app/`
* `bower install`
* `lessc www/css/less/styles.less > www/css/boatday.css`

## Deploy
* `sudo rm -R plugins` we delete the current plugins
* `sudo cordova platform remove ios` delete the current release
* `sudo rm -R platforms` we delete the current plugins
* `sudo cordova platform add ios`
* `sudo cordova build`

## Add plugins
* `sudo cordova plugin add pluginsBase/cordova-plugin-facebook4 --save --variable APP_ID=1442439216059238 --variable APP_NAME=BoatDay`
* `sudo cordova plugin add pluginsBase/cordova-plugin-whitelist`
* `sudo cordova plugin add pluginsBase/cordova-plugin-camera`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.console`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.dialogs`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.geolocation`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.inappbrowser`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.labs.keyboard`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.statusbar`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.file`
* `sudo cordova plugin add pluginsBase/org.apache.cordova.media`
* `sudo cordova plugin add pluginsBase/phonegap-plugin-push`
* `sudo cordova plugin add pluginsBase/cordova-plugin-appinfo`
* `sudo cordova plugin add pluginsBase/cordova-plugin-customurlscheme --variable URL_SCHEME=boatday`

## Change rights
* `sudo chown -R Daniel .`
* `sudo chmod -R 777 .`