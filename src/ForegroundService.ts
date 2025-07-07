import { NativeModules, Platform, PermissionsAndroid, DeviceEventEmitter, NativeEventEmitter } from 'react-native';
import type { ForegroundServiceOptions, ForegroundServiceModule, ForegroundServiceEventListener } from './index';

const LINKING_ERROR =
  `The package 'react-native-foreground-service' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'cd ios && pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const RNForegroundService = NativeModules.RNForegroundService
  ? NativeModules.RNForegroundService
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

class ForegroundServiceClass implements ForegroundServiceModule {
  private eventEmitter: NativeEventEmitter | null = null;
  private eventListener: ForegroundServiceEventListener | null = null;

  constructor() {
    if (Platform.OS === 'android' && RNForegroundService) {
      this.eventEmitter = new NativeEventEmitter(RNForegroundService);
    }
  }

  /**
   * Start the foreground service with enhanced validation
   */
  async startService(options: ForegroundServiceOptions): Promise<void> {
    if (Platform.OS !== 'android') {
      console.warn('Foreground service is only supported on Android');
      return;
    }

    // Validate required fields
    if (!options.taskName || !options.taskTitle) {
      throw new Error('taskName and taskTitle are required fields');
    }

    // Validate service type for Android 14+
    if (Platform.Version >= 34 && !options.serviceType) {
      throw
  async updateService(options: Partial<ForegroundServiceOptions>): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }
    
    return RNForegroundService.updateService(options);
  }

  /**
   * Check if the service is running
   */
  async isServiceRunning(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    
    return RNForegroundService.isServiceRunning();
  }

  /**
   * Check if app has foreground service permission
   */
  async checkPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit permission
    }
    
    return RNForegroundService.checkPermission();
  }

  /**
   * Check notification permission specifically (Android 13+)
   */
  async checkNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit permission check here
    }
    
    return RNForegroundService.checkNotificationPermission();
  }

  /**
   * Check if app is exempted from battery optimization
   */
  async checkBatteryOptimization(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't have battery optimization settings
    }
    
    return RNForegroundService.checkBatteryOptimization();
  }

  /**
   * Request foreground service permission
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit permission
    }
    
    return RNForegroundService.requestPermission();
  }

  /**
   * Request notification permission (Android 13+)
   * Note: This should be called from React Native side using PermissionsAndroid
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          'android.permission.POST_NOTIFICATIONS'
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    
    return true; // Permission not needed on older versions
  }
}

const ForegroundService = new ForegroundServiceClass();

export default ForegroundService;
export * from './index';
