import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import ForegroundService from 'react-native-background-task-manager'; // Adjust import based on your package

export default function EnhancedForegroundServiceExample() {
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [serviceMetrics, setServiceMetrics] = useState(null);
  const [activeTasks, setActiveTasks] = useState({});

  useEffect(() => {
    checkServiceStatus();
    setupEventListeners();
    
    return () => {
      ForegroundService.removeEventListener();
    };
  }, []);

  const checkServiceStatus = async () => {
    try {
      const running = await ForegroundService.isServiceRunning();
      setIsServiceRunning(running);
      
      if (running) {
        const metrics = await ForegroundService.getServiceMetrics();
        setServiceMetrics(metrics);
        
        const tasks = ForegroundService.TaskManager.getAllTasks();
        setActiveTasks(tasks);
      }
    } catch (error) {
      console.error('Error checking service status:', error);
    }
  };

  const setupEventListeners = () => {
    ForegroundService.addEventListener({
      onServiceStart: () => {
        console.log('✅ Service started');
        setIsServiceRunning(true);
      },
      onServiceStop: () => {
        console.log('🛑 Service stopped');
        setIsServiceRunning(false);
        setServiceMetrics(null);
        setActiveTasks({});
      },
      onServiceError: (error) => {
        console.error('❌ Service error:', error);
        Alert.alert('Service Error', error);
      },
      onActionPress: (actionId) => {
        console.log('🔘 Action pressed:', actionId);
        handleNotificationAction(actionId);
      },
      onTaskComplete: (taskId) => {
        console.log('✅ Task completed:', taskId);
        updateTaskStatus();
      },
      onTaskError: (taskId, error) => {
        console.error('❌ Task error:', taskId, error);
      }
    });
  };

  const handleNotificationAction = (actionId) => {
    switch (actionId) {
      case 'pause':
        pauseAllTasks();
        break;
      case 'resume':
        resumeAllTasks();
        break;
      case 'stop':
        stopService();
        break;
      case 'settings':
        Alert.alert('Settings', 'Settings panel would open here');
        break;
    }
  };

  const startEnhancedService = async () => {
    try {
      // Check and request permissions
      const hasPermission = await ForegroundService.checkPermission();
      if (!hasPermission) {
        const granted = await ForegroundService.requestPermission();
        if (!granted) {
          Alert.alert('Permission Denied', 'Foreground service permission is required');
          return;
        }
      }

      // Check battery optimization
      const batteryOptimized = await ForegroundService.checkBatteryOptimization();
      if (!batteryOptimized) {
        Alert.alert(
          'Battery Optimization', 
          'For better performance, please disable battery optimization for this app',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => ForegroundService.requestBatteryOptimizationExemption() }
          ]
        );
      }

      // Start service with enhanced options
      await ForegroundService.startService({
        taskName: 'enhanced-data-sync',
        taskTitle: 'Enhanced Data Sync',
        taskDesc: 'Syncing data with advanced task management',
        serviceType: 'dataSync',
        importance: 'HIGH',
        
        // Multiple action buttons
        actions: [
          { id: 'pause', title: 'Pause', icon: 'pause' },
          { id: 'settings', title: 'Settings', icon: 'settings' },
          { id: 'stop', title: 'Stop', icon: 'stop' }
        ],
        
        // Enhanced notification options
        color: '#007AFF',
        vibration: false,
        setOnlyAlertOnce: true,
        
        // Progress bar
        progress: {
          max: 100,
          curr: 0,
          indeterminate: false
        },
        
        // Auto-stop and timeout
        autoStop: false,
        timeoutMs: 300000, // 5 minutes
      });

      // Add background tasks
      addBackgroundTasks();
      
      Alert.alert('Success', 'Enhanced foreground service started!');
      
    } catch (error) {
      console.error('Error starting service:', error);
      Alert.alert('Error', `Failed to start service: ${error.message}`);
    }
  };

  const addBackgroundTasks = () => {
    // High priority data sync task
    const syncTaskId = ForegroundService.TaskManager.addTask(
      async () => {
        console.log('🔄 Syncing data...');
        
        // Simulate data sync with progress updates
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Update notification progress
          await ForegroundService.updateService({
            progress: { max: 100, curr: i }
          });
          
          console.log(`📊 Sync progress: ${i}%`);
        }
        
        console.log('✅ Data sync completed');
        return 'sync_completed';
      },
      {
        delay: 5000,
        onLoop: true,
        priority: 'high',
        retryCount: 3,
        timeout: 30000,
        onSuccess: () => {
          console.log('✅ Sync task completed successfully');
        },
        onError: (error) => {
          console.error('❌ Sync task failed:', error);
        },
        onProgress: (progress) => {
          console.log(`📈 Task progress: ${progress}%`);
        }
      }
    );

    // Medium priority health check task
    const healthTaskId = ForegroundService.TaskManager.addTask(
      async () => {
        console.log('🏥 Running health check...');
        
        // Simulate health check
        const isHealthy = Math.random() > 0.1; // 90% success rate
        
        if (!isHealthy) {
          throw new Error('Health check failed');
        }
        
        console.log('✅ Health check passed');
        return 'health_ok';
      },
      {
        delay: 10000,
        onLoop: true,
        priority: 'normal',
        retryCount: 2,
        onSuccess: () => {
          console.log('💚 System is healthy');
        },
        onError: (error) => {
          console.warn('⚠️ Health check warning:', error);
        }
      }
    );

    // Low priority cleanup task
    const cleanupTaskId = ForegroundService.TaskManager.addTask(
      async () => {
        console.log('🧹 Running cleanup...');
        
        // Simulate cleanup operations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ Cleanup completed');
        return 'cleanup_done';
      },
      {
        delay: 30000,
        onLoop: true,
        priority: 'low',
        onSuccess: () => {
          console.log('🗑️ Cleanup task completed');
        }
      }
    );

    console.log('📝 Background tasks added:', { syncTaskId, healthTaskId, cleanupTaskId });
    updateTaskStatus();
  };

  const updateTaskStatus = () => {
    const tasks = ForegroundService.TaskManager.getAllTasks();
    setActiveTasks(tasks);
  };

  const pauseAllTasks = () => {
    Object.keys(activeTasks).forEach(taskId => {
      ForegroundService.TaskManager.pauseTask(taskId);
    });
    updateTaskStatus();
    Alert.alert('Tasks Paused', 'All background tasks have been paused');
  };

  const resumeAllTasks = () => {
    Object.keys(activeTasks).forEach(taskId => {
      ForegroundService.TaskManager.resumeTask(taskId);
    });
    updateTaskStatus();
    Alert.alert('Tasks Resumed', 'All background tasks have been resumed');
  };

  const stopService = async () => {
    try {
      await ForegroundService.stopServiceAll();
      ForegroundService.TaskManager.removeAllTasks();
      Alert.alert('Service Stopped', 'Foreground service and all tasks stopped');
    } catch (error) {
      console.error('Error stopping service:', error);
      Alert.alert('Error', `Failed to stop service: ${error.message}`);
    }
  };

  const getServiceInfo = async () => {
    try {
      const status = await ForegroundService.getServiceStatus();
      const metrics = await ForegroundService.getServiceMetrics();
      const taskStats = ForegroundService.TaskManager.getStats();
      
      const info = `
📊 Service Status:
• Running: ${status.isRunning ? '✅ Yes' : '❌ No'}
• Uptime: ${Math.round((status.uptime || 0) / 1000)}s
• Task Count: ${status.taskCount || 0}

📈 Metrics:
• Tasks Executed: ${metrics.tasksExecuted}
• Tasks Succeeded: ${metrics.tasksSucceeded}
• Tasks Failed: ${metrics.tasksFailed}
• Battery Impact: ${metrics.batteryImpact}

🔧 Task Statistics:
• Total: ${taskStats.totalTasks}
• Running: ${taskStats.runningTasks}
• Pending: ${taskStats.pendingTasks}
• Completed: ${taskStats.completedTasks}
• Failed: ${taskStats.failedTasks}
      `;
      
      Alert.alert('Service Information', info);
    } catch (error) {
      console.error('Error getting service info:', error);
      Alert.alert('Error', 'Failed to get service information');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enhanced Foreground Service</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isServiceRunning ? '🟢 Running' : '🔴 Stopped'}
        </Text>
        
        {serviceMetrics && (
          <Text style={styles.metricsText}>
            Uptime: {Math.round(serviceMetrics.uptime / 1000)}s | 
            Tasks: {serviceMetrics.tasksExecuted}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Start Enhanced Service"
          onPress={startEnhancedService}
          disabled={isServiceRunning}
        />
        
        <Button
          title="Stop Service"
          onPress={stopService}
          disabled={!isServiceRunning}
          color="#FF3B30"
        />
        
        <Button
          title="Service Info"
          onPress={getServiceInfo}
        />
        
        <Button
          title="Pause Tasks"
          onPress={pauseAllTasks}
          disabled={!isServiceRunning}
          color="#FF9500"
        />
        
        <Button
          title="Resume Tasks"
          onPress={resumeAllTasks}
          disabled={!isServiceRunning}
          color="#34C759"
        />
      </View>

      {Object.keys(activeTasks).length > 0 && (
        <View style={styles.tasksContainer}>
          <Text style={styles.tasksTitle}>Active Tasks:</Text>
          {Object.entries(activeTasks).map(([taskId, task]) => (
            <Text key={taskId} style={styles.taskItem}>
              • {taskId}: {task.status} ({task.executionCount} runs)
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  metricsText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  tasksContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  taskItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
