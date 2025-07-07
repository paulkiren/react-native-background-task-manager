package com.reactnativeforegroundservice;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.module.annotations.ReactModule;

import android.content.Intent;
import android.content.Context;
import android.os.Build;
import android.app.ActivityManager;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.net.Uri;
import android.provider.Settings;
import android.Manifest;
import androidx.core.content.ContextCompat;
import androidx.core.app.NotificationManagerCompat;

@ReactModule(name = RNForegroundServiceModuleEnhanced.NAME)
public class RNForegroundServiceModuleEnhanced extends ReactContextBaseJavaModule {
    public static final String NAME = "RNForegroundService";
    private ReactApplicationContext reactContext;
    private static final String[] REQUIRED_PERMISSIONS_API_33 = {
        Manifest.permission.FOREGROUND_SERVICE,
        Manifest.permission.POST_NOTIFICATIONS
    };
    
    private static final String[] REQUIRED_PERMISSIONS_API_34 = {
        Manifest.permission.FOREGROUND_SERVICE,
        Manifest.permission.FOREGROUND_SERVICE_DATA_SYNC,
        Manifest.permission.POST_NOTIFICATIONS
    };

    public RNForegroundServiceModuleEnhanced(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    private void sendEvent(String eventName, WritableMap params) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    @ReactMethod
    public void startService(ReadableMap options, Promise promise) {
        try {
            // Validate service type for Android 14+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                if (!options.hasKey("serviceType")) {
                    promise.reject("VALIDATION_ERROR", "serviceType is required for Android 14+");
                    return;
                }
            }

            // Check all required permissions
            if (!hasAllRequiredPermissions()) {
                promise.reject("PERMISSION_ERROR", "Missing required permissions");
                return;
            }

            Intent serviceIntent = new Intent(reactContext, ForegroundServiceEnhanced.class);
            serviceIntent.setAction("START_SERVICE");
            
            // Pass all options with validation
            copyOptionsToIntent(options, serviceIntent);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            // Send success event
            WritableMap eventData = Arguments.createMap();
            eventData.putString("status", "started");
            sendEvent("onServiceStart", eventData);
            
            promise.resolve(null);
        } catch (Exception e) {
            WritableMap errorData = Arguments.createMap();
            errorData.putString("error", e.getMessage());
            sendEvent("onServiceError", errorData);
            promise.reject("START_SERVICE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getServiceStatus(Promise promise) {
        try {
            WritableMap status = Arguments.createMap();
            boolean isRunning = isServiceRunning();
            status.putBoolean("isRunning", isRunning);
            
            if (isRunning) {
                // Add more detailed status information
                status.putDouble("startTime", System.currentTimeMillis());
                status.putString("serviceType", "foregroundService");
                status.putInt("notificationId", ForegroundServiceEnhanced.NOTIFICATION_ID);
            }
            
            promise.resolve(status);
        } catch (Exception e) {
            promise.reject("GET_STATUS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestBatteryOptimizationExemption(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                android.os.PowerManager pm = (android.os.PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
                if (!pm.isIgnoringBatteryOptimizations(reactContext.getPackageName())) {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + reactContext.getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    reactContext.startActivity(intent);
                    promise.resolve(false); // User needs to grant manually
                } else {
                    promise.resolve(true);
                }
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("BATTERY_OPTIMIZATION_ERROR", e.getMessage());
        }
    }

    private boolean hasAllRequiredPermissions() {
        String[] permissions = Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE 
            ? REQUIRED_PERMISSIONS_API_34 
            : REQUIRED_PERMISSIONS_API_33;
            
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(reactContext, permission) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        
        // Check notification permission
        return NotificationManagerCompat.from(reactContext).areNotificationsEnabled();
    }

    private void copyOptionsToIntent(ReadableMap options, Intent intent) {
        // Copy all options with proper validation
        if (options.hasKey("taskName")) {
            intent.putExtra("taskName", options.getString("taskName"));
        }
        if (options.hasKey("taskTitle")) {
            intent.putExtra("taskTitle", options.getString("taskTitle"));
        }
        if (options.hasKey("taskDesc")) {
            intent.putExtra("taskDesc", options.getString("taskDesc"));
        }
        if (options.hasKey("serviceType")) {
            intent.putExtra("serviceType", options.getString("serviceType"));
        }
        if (options.hasKey("timeoutMs")) {
            intent.putExtra("timeoutMs", options.getInt("timeoutMs"));
        }
        if (options.hasKey("autoStop")) {
            intent.putExtra("autoStop", options.getBoolean("autoStop"));
        }
        // Add other options...
    }

    private boolean isServiceRunning() {
        ActivityManager manager = (ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (ForegroundServiceEnhanced.class.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }

    // Include other existing methods...
}
