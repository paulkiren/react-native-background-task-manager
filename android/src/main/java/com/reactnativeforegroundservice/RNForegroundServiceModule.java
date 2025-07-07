package com.reactnativeforegroundservice;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;

import android.content.Intent;
import android.content.Context;
import android.os.Build;
import android.app.ActivityManager;
import android.content.pm.PackageManager;
import android.Manifest;
import androidx.core.content.ContextCompat;
import androidx.core.app.NotificationManagerCompat;

@ReactModule(name = RNForegroundServiceModule.NAME)
public class RNForegroundServiceModule extends ReactContextBaseJavaModule {
    public static final String NAME = "RNForegroundService";
    private ReactApplicationContext reactContext;

    public RNForegroundServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void startService(ReadableMap options, Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, ForegroundService.class);
            
            // Pass options to the service
            if (options.hasKey("taskName")) {
                serviceIntent.putExtra("taskName", options.getString("taskName"));
            }
            if (options.hasKey("taskTitle")) {
                serviceIntent.putExtra("taskTitle", options.getString("taskTitle"));
            }
            if (options.hasKey("taskDesc")) {
                serviceIntent.putExtra("taskDesc", options.getString("taskDesc"));
            }
            if (options.hasKey("taskIcon")) {
                serviceIntent.putExtra("taskIcon", options.getString("taskIcon"));
            }
            if (options.hasKey("importance")) {
                serviceIntent.putExtra("importance", options.getString("importance"));
            }
            if (options.hasKey("number")) {
                serviceIntent.putExtra("number", options.getInt("number"));
            }
            if (options.hasKey("button")) {
                serviceIntent.putExtra("button", options.getBoolean("button"));
            }
            if (options.hasKey("buttonText")) {
                serviceIntent.putExtra("buttonText", options.getString("buttonText"));
            }
            if (options.hasKey("buttonOnPress")) {
                serviceIntent.putExtra("buttonOnPress", options.getString("buttonOnPress"));
            }
            if (options.hasKey("setOnlyAlertOnce")) {
                serviceIntent.putExtra("setOnlyAlertOnce", options.getBoolean("setOnlyAlertOnce"));
            }
            if (options.hasKey("color")) {
                serviceIntent.putExtra("color", options.getString("color"));
            }
            if (options.hasKey("progress")) {
                ReadableMap progress = options.getMap("progress");
                if (progress != null) {
                    serviceIntent.putExtra("progressMax", progress.getInt("max"));
                    serviceIntent.putExtra("progressCurr", progress.getInt("curr"));
                    if (progress.hasKey("indeterminate")) {
                        serviceIntent.putExtra("progressIndeterminate", progress.getBoolean("indeterminate"));
                    }
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("START_SERVICE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void stopService(Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, ForegroundService.class);
            reactContext.stopService(serviceIntent);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("STOP_SERVICE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void updateService(ReadableMap options, Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, ForegroundService.class);
            serviceIntent.setAction("UPDATE_NOTIFICATION");
            
            // Pass updated options to the service
            if (options.hasKey("taskTitle")) {
                serviceIntent.putExtra("taskTitle", options.getString("taskTitle"));
            }
            if (options.hasKey("taskDesc")) {
                serviceIntent.putExtra("taskDesc", options.getString("taskDesc"));
            }
            if (options.hasKey("progress")) {
                ReadableMap progress = options.getMap("progress");
                if (progress != null) {
                    serviceIntent.putExtra("progressMax", progress.getInt("max"));
                    serviceIntent.putExtra("progressCurr", progress.getInt("curr"));
                    if (progress.hasKey("indeterminate")) {
                        serviceIntent.putExtra("progressIndeterminate", progress.getBoolean("indeterminate"));
                    }
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("UPDATE_SERVICE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void isServiceRunning(Promise promise) {
        try {
            ActivityManager manager = (ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
            for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
                if (ForegroundService.class.getName().equals(service.service.getClassName())) {
                    promise.resolve(true);
                    return;
                }
            }
            promise.resolve(false);
        } catch (Exception e) {
            promise.reject("CHECK_SERVICE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void checkPermission(Promise promise) {
        try {
            boolean hasNotificationPermission = true;
            boolean hasForegroundServicePermission = true;

            // Check notification permission (Android 13+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                hasNotificationPermission = NotificationManagerCompat.from(reactContext).areNotificationsEnabled();
            }

            // Check foreground service permission (Android 9+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                int permission = ContextCompat.checkSelfPermission(reactContext, Manifest.permission.FOREGROUND_SERVICE);
                hasForegroundServicePermission = permission == PackageManager.PERMISSION_GRANTED;
            }

            promise.resolve(hasNotificationPermission && hasForegroundServicePermission);
        } catch (Exception e) {
            promise.reject("CHECK_PERMISSION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestPermission(Promise promise) {
        try {
            // Note: Runtime permission request should be handled at the React Native level
            // This method provides guidance for what permissions are needed
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                // POST_NOTIFICATIONS permission needs to be requested at runtime
                promise.resolve(false); // Indicate that runtime permission is needed
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                // FOREGROUND_SERVICE permission is automatically granted for apps targeting API 28+
                promise.resolve(true);
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("REQUEST_PERMISSION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void checkNotificationPermission(Promise promise) {
        try {
            boolean hasPermission = NotificationManagerCompat.from(reactContext).areNotificationsEnabled();
            promise.resolve(hasPermission);
        } catch (Exception e) {
            promise.reject("CHECK_NOTIFICATION_PERMISSION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void checkBatteryOptimization(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                android.os.PowerManager pm = (android.os.PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
                boolean isIgnoringOptimization = pm.isIgnoringBatteryOptimizations(reactContext.getPackageName());
                promise.resolve(isIgnoringOptimization);
            } else {
                promise.resolve(true); // No battery optimization on older versions
            }
        } catch (Exception e) {
            promise.reject("CHECK_BATTERY_OPTIMIZATION_ERROR", e.getMessage());
        }
    }
}
