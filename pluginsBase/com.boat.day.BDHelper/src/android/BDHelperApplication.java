package com.boat.day;

import android.app.Application;
import android.util.Log;
import android.webkit.JavascriptInterface;

import com.parse.Parse;
import com.parse.ParseException;
import com.parse.ParseInstallation;
import com.parse.SaveCallback;

public class BDHelperApplication extends Application {

    private String installationId = null;

    public BDHelperApplication(){
    }

    @Override
    public void onCreate() {
        super.onCreate();

        Parse.initialize(this, getResources().getString(R.string.parse_app_id), getResources().getString(R.string.parse_client_id));
        final ParseInstallation installation = ParseInstallation.getCurrentInstallation();

        installation.saveInBackground(new SaveCallback() {
            @Override
            public void done(ParseException e) {
                if(e == null){
                    System.out.println(installation.isDataAvailable());
                    Log.i("Installation id java : ", installation.getInstallationId());
                    setInstallationId(installation.getInstallationId());
                }
                else{
                    e.printStackTrace();
                }
            }
        });

    }

    public void setInstallationId(String installationId){
        this.installationId = installationId;
    }

    @JavascriptInterface
    public String getInstallationId(){
        return this.installationId;
    }
}
