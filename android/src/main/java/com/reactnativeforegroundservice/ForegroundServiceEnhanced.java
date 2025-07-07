package com.reactnativeforegroundservice;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ForegroundServiceEnhanced extends Service {
    private static final String TAG = "ForegroundServiceEnhanced";
    public static final String CHANNEL_ID = "ForegroundServiceChannel";
    public static final int NOTIFICATION_ID = 1001;
    
    // Constants for action handling
    private static final String ACTION_PREFIX = "ACTION_";
    private static final String ACTION_TYPE_FOREGROUND = "foreground";
    
    // Constants for intent extras
    private static final String EXTRA_TASK_TITLE = "taskTitle";
    private static final String EXTRA_TASK_DESC = "taskDesc";
    private static final String EXTRA_PROGRESS_MAX = "progressMax";
    private static final String EXTRA_PROGRESS_CURR = "progressCurr";
    private static final String EXTRA_PROGRESS_INDETERMINATE = "progressIndeterminate";
    private static final String EXTRA_ACTION_ID = "actionId";
    private static final String DRAWABLE_TYPE = "drawable";
    
    private NotificationManager notificationManager;
    private ReactContext reactContext;
    private ServiceMetrics metrics;
    private long startTime;
    
    // Basic notification fields
    private String taskName = "Task";
    private String taskTitle = "Background Task";
    private String taskDesc = "Running in background";
    private String taskIcon = "ic_notification";
    private String importance = "DEFAULT";
    private int number = 0;
    private boolean setOnlyAlertOnce = false;
    private String color = "#000000";
    
    // Progress fields
    private int progressMax = 100;
    private int progressCurr = 0;
    private boolean progressIndeterminate = false;
    
    // Enhanced notification fields
    private boolean vibration = true;
    private String soundUri = null;
    private String channelId = CHANNEL_ID;
    private String category = null;
    private String visibility = "public";
    private String largeIcon = null;
    
    // Multiple buttons support
    private List<NotificationAction> actions = new ArrayList<>();
    
    // Service configuration
    private String serviceType = "dataSync";
    private boolean autoStop = false;
    private long timeoutMs = 0;
    private Handler timeoutHandler;
    
    public static class NotificationAction {
        private final String id;
        private final String title;
        private final String icon;
        private final String actionType;
        
        public NotificationAction(String id, String title, String icon, String actionType) {
            this.id = id;
            this.title = title;
            this.icon = icon;
            this.actionType = actionType;
        }
        
        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getIcon() { return icon; }
        public String getActionType() { return actionType; }
    }
    
    public static class ServiceMetrics {
        private long uptime = 0;
        private int tasksExecuted = 0;
        private int tasksSucceeded = 0;
        private int tasksFailed = 0;
        private long memoryUsage = 0;
        private String batteryImpact = "low";
        
        public WritableMap toWritableMap() {
            WritableMap map = Arguments.createMap();
            map.putDouble("uptime", uptime);
            map.putInt("tasksExecuted", tasksExecuted);
            map.putInt("tasksSucceeded", tasksSucceeded);
            map.putInt("tasksFailed", tasksFailed);
            map.putDouble("memoryUsage", memoryUsage);
            map.putString("batteryImpact", batteryImpact);
            return map;
        }
        
        // Getters and setters
        public long getUptime() { return uptime; }
        public void setUptime(long uptime) { this.uptime = uptime; }
        public int getTasksExecuted() { return tasksExecuted; }
        public void setTasksExecuted(int tasksExecuted) { this.tasksExecuted = tasksExecuted; }
        public int getTasksSucceeded() { return tasksSucceeded; }
        public void setTasksSucceeded(int tasksSucceeded) { this.tasksSucceeded = tasksSucceeded; }
        public int getTasksFailed() { return tasksFailed; }
        public void setTasksFailed(int tasksFailed) { this.tasksFailed = tasksFailed; }
        public long getMemoryUsage() { return memoryUsage; }
        public void setMemoryUsage(long memoryUsage) { this.memoryUsage = memoryUsage; }
        public String getBatteryImpact() { return batteryImpact; }
        public void setBatteryImpact(String batteryImpact) { this.batteryImpact = batteryImpact; }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "ForegroundServiceEnhanced created");
        
        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        mainHandler = new Handler(Looper.getMainLooper());
        metrics = new ServiceMetrics();
        startTime = System.currentTimeMillis();
        
        createNotificationChannel();
        
        // Try to get React context
        try {
            reactContext = (ReactContext) getApplicationContext();
        } catch (Exception e) {
            Log.w(TAG, "Could not get React context: " + e.getMessage());
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            Log.d(TAG, "onStartCommand with action: " + action);
            
            if ("UPDATE_NOTIFICATION".equals(action)) {
                updateNotificationFromIntent(intent);
                updateNotification();
                return START_STICKY;
            } else if ("STOP_SERVICE".equals(action)) {
                stopSelf();
                return START_NOT_STICKY;
            } else if (action != null && action.startsWith(ACTION_PREFIX)) {
                handleActionPress(action, intent);
                return START_STICKY;
            }
            
            // Extract parameters from intent
            extractParametersFromIntent(intent);
            
            // Setup timeout if specified
            if (timeoutMs > 0) {
                setupTimeout();
            }
        }

        Notification notification = createNotification();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, getServiceType());
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
        
        sendEvent("onServiceStart", null);
        return START_STICKY;
    }

    private int getServiceType() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            switch (serviceType) {
                case "dataSync":
                    return ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC;
                case "mediaProcessing":
                    return ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROCESSING;
                case "location":
                    return ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION;
                case "camera":
                    return ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA;
                case "microphone":
                    return ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE;
                case "phoneCall":
                    return ServiceInfo.FOREGROUND_SERVICE_TYPE_PHONE_CALL;
                case "mediaPlayback":
                    return ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK;
                case "remoteMessaging":
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                        return ServiceInfo.FOREGROUND_SERVICE_TYPE_REMOTE_MESSAGING;
                    }
                    return ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC;
                default:
                    return ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC;
            }
        }
        return 0;
    }

    private void setupTimeout() {
        if (timeoutHandler != null) {
            timeoutHandler.removeCallbacksAndMessages(null);
        }
        timeoutHandler = new Handler(Looper.getMainLooper());
        timeoutHandler.postDelayed(() -> {
            Log.w(TAG, "Service timeout reached, stopping service");
            sendEvent("onServiceTimeout", null);
            stopSelf();
        }, timeoutMs);
    }

    private void extractParametersFromIntent(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras == null) return;

        // Basic parameters
        taskName = extras.getString("taskName", taskName);
        taskTitle = extras.getString(EXTRA_TASK_TITLE, taskTitle);
        taskDesc = extras.getString(EXTRA_TASK_DESC, taskDesc);
        taskIcon = extras.getString("taskIcon", taskIcon);
        importance = extras.getString("importance", importance);
        number = extras.getInt("number", number);
        setOnlyAlertOnce = extras.getBoolean("setOnlyAlertOnce", setOnlyAlertOnce);
        color = extras.getString("color", color);
        
        // Progress parameters
        progressMax = extras.getInt(EXTRA_PROGRESS_MAX, progressMax);
        progressCurr = extras.getInt(EXTRA_PROGRESS_CURR, progressCurr);
        progressIndeterminate = extras.getBoolean(EXTRA_PROGRESS_INDETERMINATE, progressIndeterminate);
        
        // Enhanced parameters
        vibration = extras.getBoolean("vibration", vibration);
        soundUri = extras.getString("sound");
        channelId = extras.getString("channel", channelId);
        category = extras.getString("category");
        visibility = extras.getString("visibility", visibility);
        largeIcon = extras.getString("largeIcon");
        
        // Service configuration
        serviceType = extras.getString("serviceType", serviceType);
        autoStop = extras.getBoolean("autoStop", autoStop);
        timeoutMs = extras.getLong("timeoutMs", timeoutMs);
        
        // Parse actions
        parseActions(extras);
    }

    private void parseActions(Bundle extras) {
        actions.clear();
        
        // Support legacy single button
        boolean button = extras.getBoolean("button", false);
        if (button) {
            String buttonText = extras.getString("buttonText", "Stop");
            String buttonOnPress = extras.getString("buttonOnPress", "stop");
            actions.add(new NotificationAction(buttonOnPress, buttonText, null, ACTION_TYPE_FOREGROUND));
        }
        
        // Support multiple buttons
        boolean button2 = extras.getBoolean("button2", false);
        if (button2) {
            String button2Text = extras.getString("button2Text", "Action 2");
            String button2OnPress = extras.getString("button2OnPress", "action2");
            actions.add(new NotificationAction(button2OnPress, button2Text, null, ACTION_TYPE_FOREGROUND));
        }
        
        boolean button3 = extras.getBoolean("button3", false);
        if (button3) {
            String button3Text = extras.getString("button3Text", "Action 3");
            String button3OnPress = extras.getString("button3OnPress", "action3");
            actions.add(new NotificationAction(button3OnPress, button3Text, null, ACTION_TYPE_FOREGROUND));
        }
        
        // Support for actions array would require custom React Native bridge serialization
        // This is a complex feature that would need additional implementation
    }

    private void updateNotificationFromIntent(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras == null) return;

        if (extras.containsKey(EXTRA_TASK_TITLE)) {
            taskTitle = extras.getString(EXTRA_TASK_TITLE, taskTitle);
        }
        if (extras.containsKey(EXTRA_TASK_DESC)) {
            taskDesc = extras.getString(EXTRA_TASK_DESC, taskDesc);
        }
        if (extras.containsKey(EXTRA_PROGRESS_MAX)) {
            progressMax = extras.getInt(EXTRA_PROGRESS_MAX, progressMax);
        }
        if (extras.containsKey(EXTRA_PROGRESS_CURR)) {
            progressCurr = extras.getInt(EXTRA_PROGRESS_CURR, progressCurr);
        }
        if (extras.containsKey(EXTRA_PROGRESS_INDETERMINATE)) {
            progressIndeterminate = extras.getBoolean(EXTRA_PROGRESS_INDETERMINATE, progressIndeterminate);
        }
    }

    private void updateNotification() {
        notificationManager.notify(NOTIFICATION_ID, createNotification());
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                channelId,
                "Foreground Service Channel",
                getNotificationImportance()
            );
            serviceChannel.setDescription("Channel for foreground service notifications");
            
            // Configure channel settings
            if (vibration) {
                serviceChannel.enableVibration(true);
                serviceChannel.setVibrationPattern(new long[]{100, 200, 300, 400});
            }
            
            if (soundUri != null) {
                try {
                    Uri sound = Uri.parse(soundUri);
                    serviceChannel.setSound(sound, null);
                } catch (Exception e) {
                    Log.w(TAG, "Invalid sound URI: " + soundUri);
                }
            }
            
            notificationManager.createNotificationChannel(serviceChannel);
        }
    }

    private int getNotificationImportance() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            switch (importance) {
                case "NONE":
                    return NotificationManager.IMPORTANCE_NONE;
                case "MIN":
                    return NotificationManager.IMPORTANCE_MIN;
                case "LOW":
                    return NotificationManager.IMPORTANCE_LOW;
                case "HIGH":
                    return NotificationManager.IMPORTANCE_HIGH;
                case "DEFAULT":
                default:
                    return NotificationManager.IMPORTANCE_DEFAULT;
            }
        }
        return 0;
    }

    private Notification createNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, channelId)
                .setContentTitle(taskTitle)
                .setContentText(taskDesc)
                .setSmallIcon(getNotificationIcon())
                .setOnlyAlertOnce(setOnlyAlertOnce)
                .setOngoing(true);

        configureNotificationAppearance(builder);
        configureNotificationActions(builder);
        
        return builder.build();
    }
    
    private int getNotificationIcon() {
        int iconResource = getApplicationInfo().icon;
        
        if (!taskIcon.equals("ic_notification")) {
            int customIcon = getResources().getIdentifier(taskIcon, DRAWABLE_TYPE, getPackageName());
            if (customIcon != 0) {
                iconResource = customIcon;
            }
        }
        
        return iconResource;
    }
    
    private void configureNotificationAppearance(NotificationCompat.Builder builder) {
        // Set color
        try {
            builder.setColor(Color.parseColor(color));
        } catch (IllegalArgumentException e) {
            Log.w(TAG, "Invalid color: " + color);
        }

        // Set number
        if (number > 0) {
            builder.setNumber(number);
        }

        // Set large icon
        if (largeIcon != null) {
            try {
                int largeIconResource = getResources().getIdentifier(largeIcon, DRAWABLE_TYPE, getPackageName());
                if (largeIconResource != 0) {
                    Bitmap largeIconBitmap = BitmapFactory.decodeResource(getResources(), largeIconResource);
                    builder.setLargeIcon(largeIconBitmap);
                }
            } catch (Exception e) {
                Log.w(TAG, "Could not set large icon: " + largeIcon);
            }
        }

        // Set category and visibility
        if (category != null) {
            builder.setCategory(category);
        }

        configureVisibility(builder);
        configureProgress(builder);
        configureSound(builder);
    }
    
    private void configureVisibility(NotificationCompat.Builder builder) {
        switch (visibility) {
            case "private":
                builder.setVisibility(NotificationCompat.VISIBILITY_PRIVATE);
                break;
            case "secret":
                builder.setVisibility(NotificationCompat.VISIBILITY_SECRET);
                break;
            case "public":
            default:
                builder.setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
                break;
        }
    }
    
    private void configureProgress(NotificationCompat.Builder builder) {
        if (progressMax > 0) {
            builder.setProgress(progressMax, progressCurr, progressIndeterminate);
        }
    }
    
    private void configureSound(NotificationCompat.Builder builder) {
        if (!vibration) {
            builder.setVibrate(new long[]{0});
        }
        
        if (soundUri != null) {
            try {
                Uri sound = Uri.parse(soundUri);
                builder.setSound(sound);
            } catch (Exception e) {
                builder.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION));
            }
        }
    }
    
    private void configureNotificationActions(NotificationCompat.Builder builder) {
        for (int i = 0; i < actions.size() && i < 3; i++) { // Android supports max 3 actions
            NotificationAction action = actions.get(i);
            Intent actionIntent = new Intent(this, ForegroundServiceEnhanced.class);
            actionIntent.setAction(ACTION_PREFIX + action.getId());
            actionIntent.putExtra(EXTRA_ACTION_ID, action.getId());
            
            PendingIntent actionPendingIntent = PendingIntent.getService(
                this, 
                i + 100, // Use different request codes for each action
                actionIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );
            
            int actionIcon = getActionIcon(action);
            builder.addAction(actionIcon, action.getTitle(), actionPendingIntent);
        }
    }
    
    private int getActionIcon(NotificationAction action) {
        int actionIcon = android.R.drawable.ic_menu_info_details;
        if (action.getIcon() != null) {
            int customActionIcon = getResources().getIdentifier(action.getIcon(), DRAWABLE_TYPE, getPackageName());
            if (customActionIcon != 0) {
                actionIcon = customActionIcon;
            }
        }
        return actionIcon;
    }

    private void handleActionPress(String action, Intent intent) {
        String actionId = intent.getStringExtra(EXTRA_ACTION_ID);
        if (actionId == null) {
            actionId = action.replace(ACTION_PREFIX, "");
        }
        
        Log.d(TAG, "Action pressed: " + actionId);
        
        // Handle special actions
        if ("stop".equals(actionId)) {
            stopSelf();
            return;
        }
        
        // Send event to React Native
        WritableMap eventData = Arguments.createMap();
        eventData.putString(EXTRA_ACTION_ID, actionId);
        eventData.putString("action", actionId); // For backward compatibility
        sendEvent("onActionPress", eventData);
        sendEvent("onButtonPress", eventData); // For backward compatibility
        
        // Update metrics
        metrics.setTasksExecuted(metrics.getTasksExecuted() + 1);
        metrics.setTasksSucceeded(metrics.getTasksSucceeded() + 1);
    }

    private void sendEvent(String eventName, WritableMap params) {
        if (reactContext != null) {
            try {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
            } catch (Exception e) {
                Log.w(TAG, "Could not send event " + eventName + ": " + e.getMessage());
            }
        }
    }

    public ServiceMetrics getMetrics() {
        metrics.setUptime(System.currentTimeMillis() - startTime);
        
        // Calculate memory usage
        Runtime runtime = Runtime.getRuntime();
        metrics.setMemoryUsage(runtime.totalMemory() - runtime.freeMemory());
        
        // Estimate battery impact based on uptime and task count
        if (metrics.getUptime() > 3600000) { // > 1 hour
            metrics.setBatteryImpact("high");
        } else if (metrics.getUptime() > 1800000) { // > 30 minutes
            metrics.setBatteryImpact("medium");
        } else {
            metrics.setBatteryImpact("low");
        }
        
        return metrics;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "ForegroundServiceEnhanced destroyed");
        
        if (timeoutHandler != null) {
            timeoutHandler.removeCallbacksAndMessages(null);
        }
        
        sendEvent("onServiceStop", null);
        stopForeground(true);
    }
}
