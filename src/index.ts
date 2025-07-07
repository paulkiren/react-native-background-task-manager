export interface ForegroundServiceOptions {
  taskName: string;
  taskTitle: string;
  taskDesc: string;
  taskIcon?: string;
  importance?: 'NONE' | 'MIN' | 'LOW' | 'DEFAULT' | 'HIGH';
  number?: number;
  button?: boolean;
  buttonText?: string;
  buttonOnPress?: string;
  setOnlyAlertOnce?: boolean;
  color?: string;
  serviceType?: 'dataSync' | 'mediaProcessing' | 'location' | 'camera' | 'microphone';
  progress?: {
    max: number;
    curr: number;
    indeterminate?: boolean;
  };
}

export interface ForegroundServiceModule {
  /**
   * Start the foreground service
   */
  startService(options: ForegroundServiceOptions): Promise<void>;
  
  /**
   * Stop the foreground service
   */
  stopService(): Promise<void>;
  
  /**
   * Update the foreground service notification
   */
  updateService(options: Partial<ForegroundServiceOptions>): Promise<void>;
  
  /**
   * Check if the service is running
   */
  isServiceRunning(): Promise<boolean>;
  
  /**
   * Check if app has all required permissions (foreground service + notifications)
   */
  checkPermission(): Promise<boolean>;
  
  /**
   * Request foreground service permission
   */
  requestPermission(): Promise<boolean>;
  
  /**
   * Check notification permission specifically (Android 13+)
   */
  checkNotificationPermission(): Promise<boolean>;
  
  /**
   * Check if app is exempted from battery optimization
   */
  checkBatteryOptimization(): Promise<boolean>;
}

export { default } from '../ForegroundService';
