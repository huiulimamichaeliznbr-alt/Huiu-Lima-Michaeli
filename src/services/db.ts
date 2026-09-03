import { ImageItem, BatchCollection, StorageStats } from '../types';

const DB_NAME = 'AIImageGalleryDB';
const DB_VERSION = 1;
const STORE_IMAGES = 'images';
const STORE_BATCHES = 'batches';

class GalleryDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          const imageStore = db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
          imageStore.createIndex('batchId', 'batchId', { unique: false });
          imageStore.createIndex('createdAt', 'createdAt', { unique: false });
          imageStore.createIndex('isFavorite', 'isFavorite', { unique: false });
          imageStore.createIndex('style', 'style', { unique: false });
          imageStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_BATCHES)) {
          const batchStore = db.createObjectStore(STORE_BATCHES, { keyPath: 'id' });
          batchStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Save a batch along with all its images
  async saveBatchWithImages(batch: BatchCollection, images: ImageItem[]): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction([STORE_BATCHES, STORE_IMAGES], 'readwrite');
    const batchStore = tx.objectStore(STORE_BATCHES);
    const imageStore = tx.objectStore(STORE_IMAGES);

    // Save batch
    batchStore.put(batch);

    // Save each image
    for (const img of images) {
      imageStore.put(img);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Save or update a single image
  async saveImage(image: ImageItem): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_IMAGES, 'readwrite');
    tx.objectStore(STORE_IMAGES).put(image);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Get all images sorted by createdAt descending
  async getAllImages(): Promise<ImageItem[]> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_IMAGES, 'readonly');
    const store = tx.objectStore(STORE_IMAGES);
    const index = store.index('createdAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const results: ImageItem[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Get all batches sorted by date
  async getAllBatches(): Promise<BatchCollection[]> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_BATCHES, 'readonly');
    const store = tx.objectStore(STORE_BATCHES);
    const index = store.index('createdAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const results: BatchCollection[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Toggle favorite status of an image
  async toggleFavorite(imageId: string): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_IMAGES, 'readwrite');
    const store = tx.objectStore(STORE_IMAGES);

    return new Promise((resolve, reject) => {
      const getReq = store.get(imageId);
      getReq.onsuccess = () => {
        const item: ImageItem = getReq.result;
        if (!item) {
          return resolve(false);
        }
        item.isFavorite = !item.isFavorite;
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve(item.isFavorite);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  // Delete single image
  async deleteImage(imageId: string): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_IMAGES, 'readwrite');
    tx.objectStore(STORE_IMAGES).delete(imageId);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Delete an entire batch and its associated images
  async deleteBatch(batchId: string): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction([STORE_BATCHES, STORE_IMAGES], 'readwrite');
    const batchStore = tx.objectStore(STORE_BATCHES);
    const imageStore = tx.objectStore(STORE_IMAGES);

    batchStore.delete(batchId);

    const index = imageStore.index('batchId');
    const req = index.openCursor(IDBKeyRange.only(batchId));

    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Delete all data (clear gallery)
  async clearAll(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction([STORE_BATCHES, STORE_IMAGES], 'readwrite');
    tx.objectStore(STORE_BATCHES).clear();
    tx.objectStore(STORE_IMAGES).clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Compute storage statistics
  async getStorageStats(): Promise<StorageStats> {
    const images = await this.getAllImages();
    const batches = await this.getAllBatches();

    let totalBytes = 0;
    let totalFavorites = 0;

    for (const img of images) {
      totalBytes += img.sizeBytes || Math.round((img.imageUrl.length * 3) / 4);
      if (img.isFavorite) {
        totalFavorites++;
      }
    }

    return {
      totalImages: images.length,
      totalBatches: batches.length,
      totalBytes,
      totalFavorites,
    };
  }
}

export const galleryDB = new GalleryDatabase();
