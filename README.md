# boat-day-app

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
