package com.boat.day;

import android.app.Application;
import android.util.Log;

import java.util.Set;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import com.parse.Parse;
import com.parse.ParseInstallation;
import com.parse.PushService;

public class ParsePlugin extends CordovaPlugin {

    public static final String TAG = "ParsePlugin";
    public static final String ACTION_INITIALIZE = "initialize";
    public static final String ACTION_GET_INSTALLATION_ID = "getInstallationId";
    public static final String ACTION_GET_INSTALLATION_OBJECT_ID = "getInstallationObjectId";
    
    public static void initializeParseWithApplication(Application app) {
        String appId = getStringByKey(app, "parse_app_id");
        String clientKey = getStringByKey(app, "parse_client_key");
        Parse.enableLocalDatastore(app);
        Log.d(TAG, "Initializing with parse_app_id: " + appId + " and parse_client_key:" + clientKey);
        Parse.initialize(app, appId, clientKey);
    }

    private static String getStringByKey(Application app, String key) {
        int resourceId = app.getResources().getIdentifier(key, "string", app.getPackageName());
        return app.getString(resourceId);
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals(ACTION_INITIALIZE)) {
            this.initialize(callbackContext);
            return true;
        }
        if (action.equals(ACTION_GET_INSTALLATION_ID)) {
            this.getInstallationId(callbackContext);
            return true;
        }

        if (action.equals(ACTION_GET_INSTALLATION_OBJECT_ID)) {
            this.getInstallationObjectId(callbackContext);
            return true;
        }
        return false;
    }

    private void initialize(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                PushService.setDefaultPushCallback(cordova.getActivity(), cordova.getActivity().getClass());
                ParseInstallation.getCurrentInstallation().saveInBackground();
                // ToDo send JSON
                /*
                    {
                        parseAppId: getStringByKey(app, "parse_app_id")
                        parseJavaScriptKey: getStringByKey(app, "parse_javascript_key")
                    }
                */
                callbackContext.success();
            }
        });
    }

    private void getInstallationId(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                callbackContext.success(ParseInstallation.getCurrentInstallation().getInstallationId());
            }
        });
    }

    private void getInstallationObjectId(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                callbackContext.success(ParseInstallation.getCurrentInstallation().getObjectId());
            }
        });
    }

}