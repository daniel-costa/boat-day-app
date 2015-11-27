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

<<<<<<< HEAD
    public BDHelperApplication(){
=======
    public BDHelper(){
>>>>>>> origin/master
    }

    @Override
    public void onCreate() {
        super.onCreate();

<<<<<<< HEAD
        Parse.initialize(this, getResources().getString(R.string.parse_app_id), getResources().getString(R.string.parse_client_id));
=======
        Parse.initialize(this, "LCn0EYL8lHOZOtAksGSdXMiHI08jHqgNOC5J0tmU", "IoaOpxqSlbkcff3v0X9mEBfGTYKpIJK9YzVuujR5");
>>>>>>> origin/master
        final ParseInstallation installation = ParseInstallation.getCurrentInstallation();

        installation.saveInBackground(new SaveCallback() {
            @Override
            public void done(ParseException e) {
                if(e == null){
<<<<<<< HEAD
                    System.out.println(installation.isDataAvailable());
                    Log.i("Installation id java : ", installation.getInstallationId());
                    setInstallationId(installation.getInstallationId());
                }
                else{
=======
                    setInstallationId(installation.getInstallationId());
                } else {
>>>>>>> origin/master
                    e.printStackTrace();
                }
            }
        });

    }

<<<<<<< HEAD
    public void setInstallationId(String installationId){
        this.installationId = installationId;
    }

    @JavascriptInterface
    public String getInstallationId(){
=======
    public void setInstallationId(String installationId) {
        this.installationId = installationId;
    }

    public String getInstallationId() {
>>>>>>> origin/master
        return this.installationId;
    }
}
