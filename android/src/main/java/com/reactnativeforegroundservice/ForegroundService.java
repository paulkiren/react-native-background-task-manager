package com.reactnativeforegroundservice;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class ForegroundService extends HeadlessJsTaskService {
    private static final String CHANNEL_ID = "ForegroundServiceChannel";
    public static final String ACTION_BUTTON_PRESSED = "com.reactnativeforegroundservice.ACTION_BUTTON_PRESSED";
    private static final int NOTIFICATION_ID = 1;
    public static boolean isRunning = false;
    
    private NotificationManager notificationManager;
    private String taskName = "Task";
    private String taskTitle = "Background Task";
    private String taskDesc = "Running in background";
    private String taskIcon = "ic_notification";
    private String importance = "DEFAULT";
    private int number = 0;
    private boolean button = false;
    private String buttonText = "Stop";
    private String buttonOnPress = "stop";
    private boolean button2 = false;
    private String button2Text = "Stop";
    private String button2OnPress = "stop";
    private boolean button3 = false;
    private String button3Text = "Stop";
    private String button3OnPress = "stop";
    private boolean setOnlyAlertOnce = false;
    private String color = "#000000";
    private int progressMax = 100;
    private int progressCurr = 0;
    private boolean progressIndeterminate = false;

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        createNotificationChannel();
        isRunning = true;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            
            if ("UPDATE_NOTIFICATION".equals(action)) {
                updateNotificationFromIntent(intent);
                updateNotification();
                return START_STICKY;
            }
            
            // Extract parameters from intent for notification
            extractParametersFromIntent(intent);
        }

        startForeground(NOTIFICATION_ID, createNotification());

        // Start the headless task
        super.onStartCommand(intent, flags, startId);

        return START_STICKY;
    }

    private void extractParametersFromIntent(Intent intent) {
        if (intent.hasExtra("taskName")) {
            taskName = intent.getStringExtra("taskName");
        }
        if (intent.hasExtra("taskTitle")) {
            taskTitle = intent.getStringExtra("taskTitle");
        }
        if (intent.hasExtra("taskDesc")) {
            taskDesc = intent.getStringExtra("taskDesc");
        }
        if (intent.hasExtra("taskIcon")) {
            taskIcon = intent.getStringExtra("taskIcon");
        }
        if (intent.hasExtra("importance")) {
            importance = intent.getStringExtra("importance");
        }
        if (intent.hasExtra("number")) {
            number = intent.getIntExtra("number", 0);
        }
        if (intent.hasExtra("button")) {
            button = intent.getBooleanExtra("button", false);
        }
        if (intent.hasExtra("buttonText")) {
            buttonText = intent.getStringExtra("buttonText");
        }
        if (intent.hasExtra("buttonOnPress")) {
            buttonOnPress = intent.getStringExtra("buttonOnPress");
        }
        if (intent.hasExtra("button2")) {
            button2 = intent.getBooleanExtra("button2", false);
        }
        if (intent.hasExtra("button2Text")) {
            button2Text = intent.getStringExtra("button2Text");
        }
        if (intent.hasExtra("button2OnPress")) {
            button2OnPress = intent.getStringExtra("button2OnPress");
        }
        if (intent.hasExtra("button3")) {
            button3 = intent.getBooleanExtra("button3", false);
        }
        if (intent.hasExtra("button3Text")) {
            button3Text = intent.getStringExtra("button3Text");
        }
        if (intent.hasExtra("button3OnPress")) {
            button3OnPress = intent.getStringExtra("button3OnPress");
        }
        if (intent.hasExtra("setOnlyAlertOnce")) {
            setOnlyAlertOnce = intent.getBooleanExtra("setOnlyAlertOnce", false);
        }
        if (intent.hasExtra("color")) {
            color = intent.getStringExtra("color");
        }
        if (intent.hasExtra("progressMax")) {
            progressMax = intent.getIntExtra("progressMax", 100);
        }
        if (intent.hasExtra("progressCurr")) {
            progressCurr = intent.getIntExtra("progressCurr", 0);
        }
        if (intent.hasExtra("progressIndeterminate")) {
            progressIndeterminate = intent.getBooleanExtra("progressIndeterminate", false);
        }
        if (intent.hasExtra("color")) {
            color = intent.getStringExtra("color");
        }
        if (intent.hasExtra("number")) {
            number = intent.getIntExtra("number", 0);
        }
    }

    private void updateNotificationFromIntent(Intent intent) {
        if (intent.hasExtra("taskTitle")) {
            taskTitle = intent.getStringExtra("taskTitle");
        }
        if (intent.hasExtra("taskDesc")) {
            taskDesc = intent.getStringExtra("taskDesc");
        }
        if (intent.hasExtra("progressMax")) {
            progressMax = intent.getIntExtra("progressMax", 100);
        }
        if (intent.hasExtra("progressCurr")) {
            progressCurr = intent.getIntExtra("progressCurr", 0);
        }
        if (intent.hasExtra("progressIndeterminate")) {
            progressIndeterminate = intent.getBooleanExtra("progressIndeterminate", false);
        }
    }

    private void updateNotification() {
        notificationManager.notify(NOTIFICATION_ID, createNotification());
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                CHANNEL_ID,
                "Foreground Service Channel",
                getNotificationImportance()
            );
            serviceChannel.setDescription("Channel for foreground service notifications");
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
        // Get app icon resource ID
        int iconResource = getApplicationInfo().icon;
        
        // Try to get custom icon if specified
        if (!taskIcon.equals("ic_notification")) {
            int customIcon = getResources().getIdentifier(taskIcon, "drawable", getPackageName());
            if (customIcon != 0) {
                iconResource = customIcon;
            }
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(taskTitle)
                .setContentText(taskDesc)
                .setSmallIcon(iconResource)
                .setOnlyAlertOnce(setOnlyAlertOnce)
                .setOngoing(true);

        // Set color if specified
        try {
            builder.setColor(Color.parseColor(color));
        } catch (IllegalArgumentException e) {
            // Use default color if parsing fails
        }

        // Set number if specified
        if (number > 0) {
            builder.setNumber(number);
        }

        // Add progress bar if needed
        if (progressMax > 0) {
            builder.setProgress(progressMax, progressCurr, progressIndeterminate);
        }

        // Add action buttons if specified
        if (button) {
            builder.addAction(android.R.drawable.ic_menu_close_clear_cancel, buttonText, createButtonIntent(buttonOnPress, 1));
        }
        if (button2) {
            builder.addAction(android.R.drawable.ic_menu_close_clear_cancel, button2Text, createButtonIntent(button2OnPress, 2));
        }
        if (button3) {
            builder.addAction(android.R.drawable.ic_menu_close_clear_cancel, button3Text, createButtonIntent(button3OnPress, 3));
        }

        return builder.build();
    }

    private PendingIntent createButtonIntent(String actionId, int requestCode) {
        Intent intent = new Intent(ACTION_BUTTON_PRESSED);
        intent.putExtra("actionId", actionId);
        return PendingIntent.getBroadcast(
            this,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );
    }

    @Nullable
    @Override
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras != null) {
            return new HeadlessJsTaskConfig(
                extras.getString("taskName"),
                Arguments.fromBundle(extras),
                extras.getInt("timeoutMs", 0),
                true // It's a foreground service
            );
        }
        return null;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopForeground(true);
        isRunning = false;
    }
}
