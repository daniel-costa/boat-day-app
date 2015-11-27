
#import <Cordova/CDV.h>
#import "AppDelegate.h"

@interface BDHelper: CDVPlugin

- (void)initialize: (CDVInvokedUrlCommand*)command;
- (void)getInstallationId: (CDVInvokedUrlCommand*)command;
- (void)getInstallationObjectId: (CDVInvokedUrlCommand*)command;

@end

@interface AppDelegate (BDHelper)
@end