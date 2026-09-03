import React from 'react';
import { Sparkles, HardDrive, FolderArchive, Plus, Crown, Zap } from 'lucide-react';
import { StorageStats, UserSubscription } from '../types';

interface NavbarProps {
  stats: StorageStats;
  subscription: UserSubscription;
  onOpenStorage: () => void;
  onOpenSubscription: () => void;
  onNewBatch: () => void;
  onDownloadAllZip: () => void;
  hasImages: boolean;
  activeBatchName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  subscription,
  onOpenStorage,
  onOpenSubscription,
  onNewBatch,
  onDownloadAllZip,
  hasImages,
  activeBatchName,
}) => {
  const mbUsed = (stats.totalBytes / (1024 * 1024)).toFixed(1);
  const isProActive = subscription.status === 'active';

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 shadow-lg shadow-amber-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-outfit text-lg font-bold tracking-tight text-neutral-100 sm:text-xl">
                Gerador de Fotos IA
              </h1>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
                9:16 Instantâneo
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              {activeBatchName ? `Exibindo: ${activeBatchName}` : 'Assinatura Mensal • 50 Imagens 9:16 em ~0.3s'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Monthly Subscription Button */}
          <button
            id="subscription-status-btn"
            onClick={onOpenSubscription}
            title="Gerenciar Plano de Assinatura Mensal (R$ 29,90/mês)"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
              isProActive
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 shadow-sm shadow-amber-500/10'
                : 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'
            }`}
          >
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Plano Mensal:</span>
            <span>{isProActive ? 'PRO (R$ 29,90)' : 'Assinar'}</span>
          </button>

          {/* Storage on Device Badge */}
          <button
            id="storage-info-btn"
            onClick={onOpenStorage}
            title="Ver gerenciamento de armazenamento do dispositivo"
            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
          >
            <HardDrive className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Dispositivo:</span>
            <span className="font-semibold text-neutral-200">{stats.totalImages} fotos</span>
            <span className="text-neutral-500 hidden sm:inline">({mbUsed} MB)</span>
          </button>

          {/* Quick ZIP Download Button */}
          {hasImages && (
            <button
              id="header-download-zip-btn"
              onClick={onDownloadAllZip}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300"
            >
              <FolderArchive className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Baixar</span> ZIP
            </button>
          )}

          {/* New Batch CTA */}
          <button
            id="header-new-batch-btn"
            onClick={onNewBatch}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 shadow-md shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Novo Lote 9:16</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
