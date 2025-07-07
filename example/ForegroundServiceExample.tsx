import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import ForegroundService from 'react-native-foreground-service';

const ForegroundServiceExample = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissionAndServiceStatus();
  }, []);

  const checkPermissionAndServiceStatus = async () => {
    try {
      const permission = await ForegroundService.checkPermission();
      setHasPermission(permission);
      
      const running = await ForegroundService.isServiceRunning();
      setIsRunning(running);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const granted = await ForegroundService.requestPermission();
      setHasPermission(granted);
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Foreground service permission is required for this feature'
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const startBasicService = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    try {
      await ForegroundService.startService({
        taskName: 'BasicTask',
        taskTitle: 'Background Task',
        taskDesc: 'Running a basic background task...',
        importance: 'DEFAULT',
        color: '#2196F3',
      });
      setIsRunning(true);
      Alert.alert('Success', 'Foreground service started');
    } catch (error) {
      console.error('Error starting service:', error);
      Alert.alert('Error', 'Failed to start service');
    }
  };

  const startServiceWithProgress = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    try {
      await ForegroundService.startService({
        taskName: 'ProgressTask',
        taskTitle: 'File Processing',
        taskDesc: 'Processing files...',
        importance: 'DEFAULT',
        button: true,
        buttonText: 'Cancel',
        color: '#4CAF50',
        progress: {
          max: 100,
          curr: 0,
          indeterminate: false,
        },
      });

      setIsRunning(true);
      simulateProgressTask();
    } catch (error) {
      console.error('Error starting service:', error);
      Alert.alert('Error', 'Failed to start service');
    }
  };

  const simulateProgressTask = async () => {
    for (let i = 1; i <= 100; i++) {
      if (!await ForegroundService.isServiceRunning()) {
        break; // Service was stopped
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);

      try {
        await ForegroundService.updateService({
          taskDesc: `Processing... ${i}%`,
          progress: {
            max: 100,
            curr: i,
            indeterminate: false,
          },
        });
      } catch (error) {
        console.error('Error updating service:', error);
        break;
      }
    }

    // Auto-stop when complete
    await stopService();
  };

  const startDownloadService = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    try {
      await ForegroundService.startService({
        taskName: 'DownloadTask',
        taskTitle: 'Downloading Files',
        taskDesc: 'Preparing download...',
        importance: 'HIGH',
        button: true,
        buttonText: 'Pause',
        color: '#FF9800',
        number: 3,
        setOnlyAlertOnce: true,
        progress: {
          max: 100,
          curr: 0,
          indeterminate: true,
        },
      });

      setIsRunning(true);
      Alert.alert('Download Started', 'Files are being downloaded');
    } catch (error) {
      console.error('Error starting download:', error);
      Alert.alert('Error', 'Failed to start download');
    }
  };

  const updateServiceContent = async () => {
    try {
      await ForegroundService.updateService({
        taskTitle: 'Updated Task',
        taskDesc: 'This notification has been updated!',
        progress: {
          max: 100,
          curr: 50,
          indeterminate: false,
        },
      });
      Alert.alert('Updated', 'Service notification updated');
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Error', 'Failed to update service');
    }
  };

  const stopService = async () => {
    try {
      await ForegroundService.stopService();
      setIsRunning(false);
      setProgress(0);
      Alert.alert('Stopped', 'Foreground service stopped');
    } catch (error) {
      console.error('Error stopping service:', error);
      Alert.alert('Error', 'Failed to stop service');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Foreground Service Demo</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Permission: {hasPermission ? '✅ Granted' : '❌ Not Granted'}
        </Text>
        <Text style={styles.statusText}>
          Service Status: {isRunning ? '🟢 Running' : '🔴 Stopped'}
        </Text>
        {progress > 0 && (
          <Text style={styles.statusText}>Progress: {progress}%</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {!hasPermission && (
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Request Permission</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, !hasPermission && styles.disabledButton]}
          onPress={startBasicService}
          disabled={!hasPermission || isRunning}
        >
          <Text style={styles.buttonText}>Start Basic Service</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.progressButton, !hasPermission && styles.disabledButton]}
          onPress={startServiceWithProgress}
          disabled={!hasPermission || isRunning}
        >
          <Text style={styles.buttonText}>Start with Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.downloadButton, !hasPermission && styles.disabledButton]}
          onPress={startDownloadService}
          disabled={!hasPermission || isRunning}
        >
          <Text style={styles.buttonText}>Start Download Service</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.updateButton, !isRunning && styles.disabledButton]}
          onPress={updateServiceContent}
          disabled={!isRunning}
        >
          <Text style={styles.buttonText}>Update Service</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.stopButton, !isRunning && styles.disabledButton]}
          onPress={stopService}
          disabled={!isRunning}
        >
          <Text style={styles.buttonText}>Stop Service</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How to Use:</Text>
        <Text style={styles.infoText}>
          1. First, grant the foreground service permission
        </Text>
        <Text style={styles.infoText}>
          2. Try different service types to see various notification styles
        </Text>
        <Text style={styles.infoText}>
          3. Check the notification panel to see the running service
        </Text>
        <Text style={styles.infoText}>
          4. Use the action buttons in notifications when available
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressButton: {
    backgroundColor: '#4CAF50',
  },
  downloadButton: {
    backgroundColor: '#FF9800',
  },
  updateButton: {
    backgroundColor: '#9C27B0',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
    lineHeight: 20,
  },
});

export default ForegroundServiceExample;
