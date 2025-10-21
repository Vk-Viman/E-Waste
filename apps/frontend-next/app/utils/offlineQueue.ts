/**
 * Offline Queue for QR Scans
 * Uses IndexedDB to store scans when offline and sync them when back online
 */

const DB_NAME = 'EcoCollectOfflineDB';
const STORE_NAME = 'scanQueue';
const DB_VERSION = 1;

export interface ScanPayload {
  binId: string;
  collectorId: string;
  weight?: number;
  timestamp?: string;
}

interface QueuedScan {
  id?: number;
  payload: ScanPayload;
  queuedAt: string;
}

/**
 * Open or create the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Add a scan to the offline queue
 */
export async function addScan(payload: ScanPayload): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const queuedScan: QueuedScan = {
      payload,
      queuedAt: new Date().toISOString(),
    };
    const request = store.add(queuedScan);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all queued scans
 */
export async function getAllScans(): Promise<QueuedScan[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a scan from the queue by ID
 */
export async function deleteScan(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get the current queue length
 */
export async function getQueueLength(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Sync all queued scans to the backend
 */
export async function syncAll(apiEndpoint = '/api/collections/scan'): Promise<{ success: number; failed: number }> {
  const scans = await getAllScans();
  let success = 0;
  let failed = 0;

  for (const scan of scans) {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scan.payload),
      });

      if (response.ok) {
        // Successfully synced, remove from queue
        if (scan.id !== undefined) {
          await deleteScan(scan.id);
        }
        success++;
        console.log('Synced scan:', scan.payload.binId);
      } else {
        failed++;
        console.error('Failed to sync scan:', scan.payload.binId, response.status);
      }
    } catch (error) {
      failed++;
      console.error('Error syncing scan:', scan.payload.binId, error);
    }
  }

  return { success, failed };
}

/**
 * Initialize auto-sync on browser online event
 */
export function initAutoSync(apiEndpoint = '/api/collections/scan'): void {
  if (typeof window === 'undefined') return; // Skip on server-side

  window.addEventListener('online', async () => {
    console.log('Browser is online. Attempting to sync queued scans...');
    try {
      const result = await syncAll(apiEndpoint);
      console.log(`Auto-sync completed: ${result.success} success, ${result.failed} failed`);
    } catch (error) {
      console.error('Auto-sync error:', error);
    }
  });
}
