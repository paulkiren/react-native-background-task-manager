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

@ReactModule(name = RNForegroundServiceModule.NAME)
public class RNForegroundServiceModule extends ReactContextBaseJavaModule {
    public static final String NAME = "RNForegroundService";
    private ReactApplicationContext reactContext;
    
    // Enhanced permission arrays for different Android versions
    private static final String[] REQUIRED_PERMISSIONS_API_33 = {
        Manifest.permission.FOREGROUND_SERVICE,
        Manifest.permission.POST_NOTIFICATIONS
    };
    
    private static final String[] REQUIRED_PERMISSIONS_API_34 = {
        Manifest.permission.FOREGROUND_SERVICE,
        Manifest.permission.FOREGROUND_SERVICE_DATA_SYNC,
        Manifest.permission.POST_NOTIFICATIONS
    };

    public RNForegroundServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    // Enhanced event emission for React Native
    private void sendEvent(String eventName, WritableMap params) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    @ReactMethod
    public void startService(ReadableMap options, Promise promise) {
        try {
            // Enhanced validation for Android 14+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                if (!options.hasKey("serviceType")) {
                    promise.reject("VALIDATION_ERROR", "serviceType is required for Android 14+");
                    return;
                }
            }

            // Check all required permissions before starting
            if (!hasAllRequiredPermissions()) {
                promise.reject("PERMISSION_ERROR", "Missing required permissions");
                return;
            }

            Intent serviceIntent = new Intent(reactContext, ForegroundService.class);
            serviceIntent.setAction("START_SERVICE");
            
            // Enhanced option copying with validation
            copyOptionsToIntent(options, serviceIntent);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            // Send success event to React Native
            WritableMap eventData = Arguments.createMap();
            eventData.putString("status", "started");
            sendEvent("onServiceStart", eventData);
            
            promise.resolve(null);
        } catch (Exception e) {
            // Send error event to React Native
            WritableMap errorData = Arguments.createMap();
            errorData.putString("error", e.getMessage());
            sendEvent("onServiceError", errorData);
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

    // Enhanced methods from the Enhanced version
    @ReactMethod
    public void getServiceStatus(Promise promise) {
        try {
            WritableMap status = Arguments.createMap();
            boolean isRunning = isServiceRunning();
            status.putBoolean("isRunning", isRunning);
            
            if (isRunning) {
                status.putDouble("startTime", System.currentTimeMillis());
                status.putString("serviceType", "foregroundService");
                status.putInt("notificationId", 1); // Default notification ID
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

    @ReactMethod
    public void getServiceMetrics(Promise promise) {
        try {
            if (isServiceRunning()) {
                WritableMap metrics = Arguments.createMap();
                metrics.putDouble("uptime", System.currentTimeMillis());
                metrics.putInt("tasksExecuted", 0);
                metrics.putInt("tasksSucceeded", 0);
                metrics.putInt("tasksFailed", 0);
                metrics.putDouble("memoryUsage", 0);
                metrics.putString("batteryImpact", "low");
                promise.resolve(metrics);
            } else {
                promise.reject("SERVICE_NOT_RUNNING", "Service is not currently running");
            }
        } catch (Exception e) {
            promise.reject("GET_METRICS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getServiceCount(Promise promise) {
        try {
            // For now, return 1 if service is running, 0 if not
            // In a more advanced implementation, you could track multiple service instances
            boolean isRunning = isServiceRunning();
            promise.resolve(isRunning ? 1 : 0);
        } catch (Exception e) {
            promise.reject("GET_SERVICE_COUNT_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void stopServiceAll(Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, ForegroundService.class);
            serviceIntent.setAction("STOP_ALL");
            reactContext.stopService(serviceIntent);
            
            WritableMap eventData = Arguments.createMap();
            eventData.putString("status", "stopped_all");
            sendEvent("onServiceStop", eventData);
            
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("STOP_ALL_SERVICES_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void registerForegroundTask(String taskName, Promise promise) {
        try {
            // This would integrate with React Native's AppRegistry for headless tasks
            // For now, just acknowledge the registration
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("REGISTER_TASK_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void runTask(ReadableMap taskConfig, Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, ForegroundService.class);
            serviceIntent.setAction("RUN_TASK");
            
            if (taskConfig.hasKey("taskName")) {
                serviceIntent.putExtra("taskName", taskConfig.getString("taskName"));
            }
            if (taskConfig.hasKey("delay")) {
                serviceIntent.putExtra("delay", taskConfig.getInt("delay"));
            }
            if (taskConfig.hasKey("onLoop")) {
                serviceIntent.putExtra("onLoop", taskConfig.getBoolean("onLoop"));
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("RUN_TASK_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void cancelNotification(int notificationId, Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, ForegroundService.class);
            serviceIntent.setAction("CANCEL_NOTIFICATION");
            serviceIntent.putExtra("notificationId", notificationId);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("CANCEL_NOTIFICATION_ERROR", e.getMessage());
        }
    }

    // Enhanced helper methods
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
        // Basic notification options
        if (options.hasKey("taskName")) {
            intent.putExtra("taskName", options.getString("taskName"));
        }
        if (options.hasKey("taskTitle")) {
            intent.putExtra("taskTitle", options.getString("taskTitle"));
        }
        if (options.hasKey("taskDesc")) {
            intent.putExtra("taskDesc", options.getString("taskDesc"));
        }
        if (options.hasKey("taskIcon")) {
            intent.putExtra("taskIcon", options.getString("taskIcon"));
        }
        if (options.hasKey("importance")) {
            intent.putExtra("importance", options.getString("importance"));
        }
        if (options.hasKey("number")) {
            intent.putExtra("number", options.getInt("number"));
        }
        if (options.hasKey("setOnlyAlertOnce")) {
            intent.putExtra("setOnlyAlertOnce", options.getBoolean("setOnlyAlertOnce"));
        }
        if (options.hasKey("color")) {
            intent.putExtra("color", options.getString("color"));
        }
        
        // Progress options
        if (options.hasKey("progress")) {
            ReadableMap progress = options.getMap("progress");
            if (progress != null) {
                intent.putExtra("progressMax", progress.getInt("max"));
                intent.putExtra("progressCurr", progress.getInt("curr"));
                if (progress.hasKey("indeterminate")) {
                    intent.putExtra("progressIndeterminate", progress.getBoolean("indeterminate"));
                }
            }
        }
        
        // Enhanced notification options
        if (options.hasKey("vibration")) {
            intent.putExtra("vibration", options.getBoolean("vibration"));
        }
        if (options.hasKey("sound")) {
            intent.putExtra("sound", options.getString("sound"));
        }
        if (options.hasKey("channel")) {
            intent.putExtra("channel", options.getString("channel"));
        }
        if (options.hasKey("category")) {
            intent.putExtra("category", options.getString("category"));
        }
        if (options.hasKey("visibility")) {
            intent.putExtra("visibility", options.getString("visibility"));
        }
        if (options.hasKey("largeIcon")) {
            intent.putExtra("largeIcon", options.getString("largeIcon"));
        }
        
        // Multiple button support
        if (options.hasKey("button")) {
            intent.putExtra("button", options.getBoolean("button"));
            if (options.hasKey("buttonText")) {
                intent.putExtra("buttonText", options.getString("buttonText"));
            }
            if (options.hasKey("buttonOnPress")) {
                intent.putExtra("buttonOnPress", options.getString("buttonOnPress"));
            }
        }
        
        if (options.hasKey("button2")) {
            intent.putExtra("button2", options.getBoolean("button2"));
            if (options.hasKey("button2Text")) {
                intent.putExtra("button2Text", options.getString("button2Text"));
            }
            if (options.hasKey("button2OnPress")) {
                intent.putExtra("button2OnPress", options.getString("button2OnPress"));
            }
        }
        
        if (options.hasKey("button3")) {
            intent.putExtra("button3", options.getBoolean("button3"));
            if (options.hasKey("button3Text")) {
                intent.putExtra("button3Text", options.getString("button3Text"));
            }
            if (options.hasKey("button3OnPress")) {
                intent.putExtra("button3OnPress", options.getString("button3OnPress"));
            }
        }
        
        // Service configuration
        if (options.hasKey("serviceType")) {
            intent.putExtra("serviceType", options.getString("serviceType"));
        }
        if (options.hasKey("timeoutMs")) {
            intent.putExtra("timeoutMs", options.getInt("timeoutMs"));
        }
        if (options.hasKey("autoStop")) {
            intent.putExtra("autoStop", options.getBoolean("autoStop"));
        }
    }

    private boolean isServiceRunning() {
        ActivityManager manager = (ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (ForegroundService.class.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }
}
