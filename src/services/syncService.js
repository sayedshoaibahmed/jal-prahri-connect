// Offline-first sync service using IndexedDB
import localforage from 'localforage';

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.isSyncing = false;
    
    // Configure localforage
    localforage.config({
      name: 'WaterSupplyApp',
      version: 1.0,
      storeName: 'waterData',
      description: 'Water supply monitoring offline storage'
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Add data to offline queue
  async addToQueue(type, data) {
    const queueItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };

    try {
      // Store in IndexedDB
      await localforage.setItem(queueItem.id, queueItem);
      
      // Add to memory queue
      this.syncQueue.push(queueItem);
      
      // Try to sync if online
      if (this.isOnline) {
        this.syncPendingData();
      }
      
      return queueItem.id;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  // Get all pending sync items
  async getPendingItems() {
    try {
      const keys = await localforage.keys();
      const pendingItems = [];
      
      for (const key of keys) {
        const item = await localforage.getItem(key);
        if (item && !item.synced) {
          pendingItems.push(item);
        }
      }
      
      return pendingItems.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } catch (error) {
      console.error('Error getting pending items:', error);
      return [];
    }
  }

  // Mock sync to server - Replace with actual API calls
  async syncToServer(item) {
    // Simulate API call based on item type
    const delay = Math.random() * 2000 + 500; // 500-2500ms delay
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock success - in real app, make actual API calls
        console.log('Syncing to server:', item.type, item.data);
        
        // Simulate occasional failures
        if (Math.random() > 0.9) {
          reject(new Error('Network error'));
        } else {
          resolve({
            success: true,
            serverId: `server_${item.id}`,
            syncedAt: new Date().toISOString()
          });
        }
      }, delay);
    });
  }

  // Sync all pending data
  async syncPendingData() {
    if (this.isSyncing || !this.isOnline) {
      return;
    }

    this.isSyncing = true;
    
    try {
      const pendingItems = await this.getPendingItems();
      
      for (const item of pendingItems) {
        try {
          const result = await this.syncToServer(item);
          
          if (result.success) {
            // Mark as synced
            item.synced = true;
            item.syncedAt = result.syncedAt;
            item.serverId = result.serverId;
            
            await localforage.setItem(item.id, item);
            
            // Remove from memory queue
            this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // Continue with next item
        }
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Get sync status
  async getSyncStatus() {
    const pendingItems = await this.getPendingItems();
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: pendingItems.length,
      lastSync: localStorage.getItem('lastSyncTime') || null
    };
  }

  // Save pump data offline
  async savePumpData(pumpId, action, data) {
    const pumpData = {
      pumpId,
      action, // 'start', 'stop', 'status_update'
      ...data,
      timestamp: new Date().toISOString()
    };

    return this.addToQueue('pump_action', pumpData);
  }

  // Save water quality data offline
  async saveWaterQuality(qualityData) {
    const data = {
      ...qualityData,
      timestamp: new Date().toISOString()
    };

    return this.addToQueue('water_quality', data);
  }

  // Save voice report offline
  async saveVoiceReport(reportData) {
    const data = {
      ...reportData,
      timestamp: new Date().toISOString()
    };

    return this.addToQueue('voice_report', data);
  }

  // Get local data for display
  async getLocalData(type, limit = 50) {
    try {
      const keys = await localforage.keys();
      const items = [];
      
      for (const key of keys) {
        const item = await localforage.getItem(key);
        if (item && item.type === type) {
          items.push(item);
        }
      }
      
      return items
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting local data:', error);
      return [];
    }
  }
}

// Install localforage
const installLocalForage = async () => {
  try {
    // Check if localforage is available
    if (typeof localforage === 'undefined') {
      console.warn('localforage not available, using localStorage fallback');
      // You might want to implement a localStorage fallback here
    }
    return true;
  } catch (error) {
    console.error('Error setting up offline storage:', error);
    return false;
  }
};

export const syncService = new SyncService();
export { installLocalForage };