package com.boat.day;

import android.app.Application;
import android.util.Log;


import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.parse.Parse;
import com.parse.ParseInstallation;
import com.parse.PushService;
import com.parse.SaveCallback;
import com.parse.ParseException;

public class BDHelper extends CordovaPlugin {

    public static final String TAG = "ParsePlugin";
    public static final String ACTION_INITIALIZE = "initialize";
    public static final String ACTION_GET_INSTALLATION_ID = "getInstallationId";
    public static final String ACTION_GET_INSTALLATION_OBJECT_ID = "getInstallationObjectId";

    
    public static void initializeParseWithApplication(Application app) {
        String appId = getStringByKey(app, "parse_app_id");
        String clientKey = getStringByKey(app, "parse_client_key");
        
        Parse.enableLocalDatastore(app);
        Parse.initialize(app, appId, clientKey);

        Log.d(TAG, "Initializing with parse_app_id: " + appId + " and parse_client_key:" + clientKey);
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

                ParseInstallation.getCurrentInstallation().saveInBackground(new SaveCallback() {
                    public void done(ParseException e) {
                        if( e == null ) {
                            // System.out.println("*** no error ***");
                        } else {
                            System.out.println("*** error ***");
                            System.out.println(e.getCause());
                        }
                    }
                });

                JSONObject jo = new JSONObject();
                
                try {

                    String versionName;
                    String packageName = this.cordova.getActivity().getPackageName();
                    PackageManager pm = this.cordova.getActivity().getPackageManager();
                    try {
                        PackageInfo packageInfo = pm.getPackageInfo(packageName, 0);
                        versionName = packageInfo.versionName;
                    } catch (NameNotFoundException nnfe) {
                        versionName = "";
                    }

                    Application gApp  = cordova.getActivity().getApplication();

                    jo.put("parseAppId", getStringByKey(gApp, "parse_app_id"));
                    jo.put("parseJavaScriptKey", getStringByKey(gApp, "parse_javascript_key"));
                    jo.put("remoteServer", getStringByKey(gApp, "boatday_remote_server"));
                    jo.put("remoteVersion", versionName);
                    jo.put("remoteInstance", getStringByKey(gApp, "boatday_remote_server") + "/" + versionName + "/");

                    JSONArray ja = new JSONArray();
                    ja.put(jo);

                } catch (JSONException e) {
                    e.printStackTrace();
                }

                callbackContext.success(jo);
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