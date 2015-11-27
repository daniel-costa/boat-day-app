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

    public BDHelper(){
    }

    @Override
    public void onCreate() {
        super.onCreate();

        Parse.initialize(this, "LCn0EYL8lHOZOtAksGSdXMiHI08jHqgNOC5J0tmU", "IoaOpxqSlbkcff3v0X9mEBfGTYKpIJK9YzVuujR5");
        final ParseInstallation installation = ParseInstallation.getCurrentInstallation();

        installation.saveInBackground(new SaveCallback() {
            @Override
            public void done(ParseException e) {
                if(e == null){
                    setInstallationId(installation.getInstallationId());
                } else {
                    e.printStackTrace();
                }
            }
        });

    }

    public void setInstallationId(String installationId) {
        this.installationId = installationId;
    }

    public String getInstallationId() {
        return this.installationId;
    }
}
