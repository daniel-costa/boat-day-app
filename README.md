# boat-day-app

## Deploy
* run `install.command`

## Install BDHelper
* run `build-qa-ios.command` or/and run `build-qa-android.command`


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
