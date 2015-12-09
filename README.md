# boat-day-app

## Tools needed
sudo npm install -g cordova
sudo npm install -g bower
sudo npm install -g less
sudo npm install -g less-plugin-clean-css

## Install
* run `install.command`

## Change BDHelper to QA or HP
* run `install-helper-HP.command` 

## Deploy on a phone
* run `run-device-ios.command` or run `run-device-android.command`


# iOS Changes

## Allow HTTP Requests
* Add to 'AppDelegate' : 
'@implementation NSURLRequest(DataController)
+ (BOOL)allowsAnyHTTPSCertificateForHost:(NSString *)host
{
    return YES; 
}
@end'


# Android Changes

## Modify android/Manifest.xml
* Add `android:name=".BDHelperApplication"` in application tag
