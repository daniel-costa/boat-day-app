package com.boat.day;

import android.app.Application;
import com.boat.day.BDHelper;

public class BDHelperApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        BDHelper.initializeParseWithApplication(this);
    }
}
