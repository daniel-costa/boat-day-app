// https://github.com/avivais/phonegap-parse-plugin/blob/master/src/ios/CDVParsePlugin.m

#import "BDHelper.h"
#import <Cordova/CDV.h>
#import <Parse/Parse.h>
#import <objc/runtime.h>
#import <objc/message.h>

@implementation BDHelper

- (void)initialize: (CDVInvokedUrlCommand*)command
{
    NSLog(@"BDHelper - initialize");
    
    NSString *appId = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"ParseAppId"];
    NSString *clientKey = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"ParseClientKey"];
    NSString *jsKey = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"ParseJavaScriptKey"];
    NSString *remoteServer = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"BoatDayRemoteServer"];
    NSString *remoteVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
    NSString *remoteInstance = [NSString stringWithFormat:@"%@/%@/", remoteServer, remoteVersion];
    
    [Parse setApplicationId:appId clientKey:clientKey];
    
    if ([[UIApplication sharedApplication] respondsToSelector:@selector(registerUserNotificationSettings:)]) {
        [[UIApplication sharedApplication] registerUserNotificationSettings: [UIUserNotificationSettings settingsForTypes:UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound categories:nil]];
        [[UIApplication sharedApplication] registerForRemoteNotifications];
    } else {
        [[UIApplication sharedApplication] registerForRemoteNotificationTypes: UIRemoteNotificationTypeBadge | UIRemoteNotificationTypeAlert | UIRemoteNotificationTypeSound];
    }
    
    NSMutableDictionary* dict = [NSMutableDictionary dictionaryWithCapacity:2];
    [dict setObject:appId forKey:@"parseAppId"];
    [dict setObject:jsKey forKey:@"parseJavaScriptKey"];
    [dict setObject:remoteServer forKey:@"remoteServer"];
    [dict setObject:remoteVersion forKey:@"remoteVersion"];
    [dict setObject:remoteInstance forKey:@"remoteInstance"];
    
    CDVPluginResult* pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dict];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)getInstallationId:(CDVInvokedUrlCommand*) command
{
    [self.commandDelegate runInBackground:^{
        NSLog(@"BDHelper - getInstallationId: %@", [[PFInstallation currentInstallation] installationId]);
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[[PFInstallation currentInstallation] installationId]];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void)getInstallationObjectId:(CDVInvokedUrlCommand*) command
{
    [self.commandDelegate runInBackground:^{
        NSLog(@"BDHelper - getInstallationObjectId");
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[[PFInstallation currentInstallation] objectId]];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}
@end

@implementation AppDelegate (BDHelper)

void MethodSwizzle(Class c, SEL originalSelector) {
    NSString *selectorString = NSStringFromSelector(originalSelector);
    SEL newSelector = NSSelectorFromString([@"swizzled_" stringByAppendingString:selectorString]);
    SEL noopSelector = NSSelectorFromString([@"noop_" stringByAppendingString:selectorString]);
    Method originalMethod, newMethod, noop;
    originalMethod = class_getInstanceMethod(c, originalSelector);
    newMethod = class_getInstanceMethod(c, newSelector);
    noop = class_getInstanceMethod(c, noopSelector);
    if (class_addMethod(c, originalSelector, method_getImplementation(newMethod), method_getTypeEncoding(newMethod))) {
        class_replaceMethod(c, newSelector, method_getImplementation(originalMethod) ?: method_getImplementation(noop), method_getTypeEncoding(originalMethod));
    } else {
        method_exchangeImplementations(originalMethod, newMethod);
    }
}

+ (void)load
{
    MethodSwizzle([self class], @selector(application:didRegisterForRemoteNotificationsWithDeviceToken:));
    MethodSwizzle([self class], @selector(application:didReceiveRemoteNotification:));
    MethodSwizzle([self class], @selector(application:didFailToRegisterForRemoteNotificationsWithError:));
}


- (void)noop_application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)newDeviceToken
{
}

- (void)swizzled_application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)newDeviceToken
{
    [self swizzled_application:application didRegisterForRemoteNotificationsWithDeviceToken:newDeviceToken];
    
    NSLog(@"BDHelper - didRegisterForRemoteNotificationsWithDeviceToken");
    
    PFInstallation *currentInstallation = [PFInstallation currentInstallation];
    [currentInstallation setDeviceTokenFromData:newDeviceToken];
    [currentInstallation saveInBackground];
}

- (void)noop_application:(UIApplication*)application didFailToRegisterForRemoteNotificationsWithError:(NSError*)error
{
}

- (void)swizzled_application:(UIApplication*)application didFailToRegisterForRemoteNotificationsWithError:(NSError*)error
{
    [self swizzled_application:application didFailToRegisterForRemoteNotificationsWithError:error];
    
    NSLog(@"BDHelper - didFailToRegisterForRemoteNotificationsWithError");
    
    [[NSNotificationCenter defaultCenter] postNotificationName:CDVRemoteNotificationError object:error];
}

- (void)noop_application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
{
}

- (void)swizzled_application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
{
    [self swizzled_application:application didReceiveRemoteNotification:userInfo];
    
    NSLog(@"BDHelper - didReceiveRemoteNotification");
    
    // [PFPush handlePush:userInfo];
}

@end