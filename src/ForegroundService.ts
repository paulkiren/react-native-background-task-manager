import { NativeModules, Platform } from 'react-native';
import type { ForegroundServiceOptions, ForegroundServiceModule } from './index';

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
  /**
   * Start the foreground service
   */
  async startService(options: ForegroundServiceOptions): Promise<void> {
    if (Platform.OS !== 'android') {
      console.warn('Foreground service is only supported on Android');
      return;
    }
    
    return RNForegroundService.startService(options);
  }

  /**
   * Stop the foreground service
   */
  async stopService(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }
    
    return RNForegroundService.stopService();
  }

  /**
   * Update the foreground service notification
   */
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
   * Request foreground service permission
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit permission
    }
    
    return RNForegroundService.requestPermission();
  }
}

const ForegroundService = new ForegroundServiceClass();

export default ForegroundService;
export * from './index';
