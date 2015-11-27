
#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import <Parse/Parse.h>

@interface BDHelper : CDVPlugin
{
    BOOL ready;
}

@property (nonatomic, copy) NSString *callbackId;
- (void)init:(CDVInvokedUrlCommand*)command;
- (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
- (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;
@end
