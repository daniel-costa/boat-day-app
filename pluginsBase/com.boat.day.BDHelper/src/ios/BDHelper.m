
#import "BDHelper.h"

@implementation BDHelper

@synthesize callbackId;

- (void)init:(CDVInvokedUrlCommand*)command;
{
    self.callbackId = command.callbackId;

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 80000
    if ([[UIApplication sharedApplication]respondsToSelector:@selector(registerUserNotificationSettings:)]) {
        [[UIApplication sharedApplication] registerUserNotificationSettings: [UIUserNotificationSettings settingsForTypes: (UIUserNotificationTypeBadge | UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationActivationModeBackground) categories:nil]];
        [[UIApplication sharedApplication] registerForRemoteNotifications];
    } else {
        [[UIApplication sharedApplication] registerForRemoteNotificationTypes: (UIRemoteNotificationTypeBadge | UIRemoteNotificationTypeSound | UIRemoteNotificationTypeAlert)];
    }
#else
    [[UIApplication sharedApplication] registerForRemoteNotificationTypes: (UIRemoteNotificationTypeBadge | UIRemoteNotificationTypeSound | UIRemoteNotificationTypeAlert)];
#endif
    
}

- (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    
    NSLog(@"BDHelper register success: %@", deviceToken);
    
#if !TARGET_IPHONE_SIMULATOR
    
//    [Parse setApplicationId:@"LCn0EYL8lHOZOtAksGSdXMiHI08jHqgNOC5J0tmU" clientKey:@"IoaOpxqSlbkcff3v0X9mEBfGTYKpIJK9YzVuujR5"];
    [Parse setApplicationId:@"8YpQsh2LwXpCgkmTIIncFSFALHmeaotGVDTBqyUv" clientKey:@"V5c09oUVGu92HOvsxyUqYqgjOo1c8oguJ9yiVLqo"];
    
    PFInstallation *currentInstallation = [PFInstallation currentInstallation];
    [currentInstallation setDeviceTokenFromData:deviceToken];
    [currentInstallation saveInBackground];
    
    NSString *token = [[[[deviceToken description] stringByReplacingOccurrencesOfString:@"<"withString:@""] stringByReplacingOccurrencesOfString:@">" withString:@""] stringByReplacingOccurrencesOfString: @" " withString: @""];
    
    NSMutableDictionary* message = [NSMutableDictionary dictionaryWithCapacity:1];
<<<<<<< HEAD
	[message setObject:token forKey:@"token"];
=======
    [message setObject:token forKey:@"tokenId"];
>>>>>>> origin/master
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:message];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
#endif
}

- (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    NSLog(@"BDHelper register failed");
    NSLog(@"%@", error);
    
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
}

@end
