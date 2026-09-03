export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3';

export type GenerationEngine = 'fast-synthesizer' | 'gemini-direct';

export interface ImageItem {
  id: string;
  batchId: string;
  batchName: string;
  indexInBatch: number;
  title: string;
  prompt: string;
  style: string;
  category: string;
  tags: string[];
  mood: string;
  aspectRatio: AspectRatio;
  imageUrl: string; // Base64 data URL
  width: number;
  height: number;
  sizeBytes: number;
  createdAt: number;
  isFavorite: boolean;
  engine: GenerationEngine;
}

export interface BatchCollection {
  id: string;
  name: string;
  seedPrompt: string;
  style: string;
  aspectRatio: AspectRatio;
  engine: GenerationEngine;
  totalImages: number;
  createdAt: number;
  thumbnailUrl?: string;
}

export interface GenerationConfig {
  prompt: string;
  style: string;
  aspectRatio: AspectRatio;
  count: number;
  engine: GenerationEngine;
}

export interface StorageStats {
  totalImages: number;
  totalBatches: number;
  totalBytes: number;
  totalFavorites: number;
}

export type SubscriptionStatus = 'active' | 'trial' | 'expired';

export interface UserSubscription {
  planId: 'monthly-pro' | 'free-trial';
  planName: string;
  pricePerMonth: string;
  status: SubscriptionStatus;
  billingCycle: 'mensal';
  renewDate: string;
  startedAt: string;
  paymentMethod: string;
  batchesUsed: number;
  maxTrialBatches: number;
  isAutoRenew: boolean;
}
