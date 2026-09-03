import React, { useState } from 'react';
import {
  X,
  HardDrive,
  FolderArchive,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { StorageStats } from '../types';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StorageStats;
  onClearAll: () => void;
  onDownloadAllZip: () => void;
}

export const StorageModal: React.FC<StorageModalProps> = ({
  isOpen,
  onClose,
  stats,
  onClearAll,
  onDownloadAllZip,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const mbUsed = (stats.totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-outfit text-lg font-bold text-neutral-100">
              Armazenamento no Dispositivo
            </h3>
            <p className="text-xs text-neutral-400">
              Banco de dados local IndexedDB do navegador
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
            <span className="text-[11px] text-neutral-400">Total de Imagens</span>
            <div className="font-outfit text-xl font-bold text-neutral-100 mt-0.5">
              {stats.totalImages}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
            <span className="text-[11px] text-neutral-400">Espaço Ocupado</span>
            <div className="font-outfit text-xl font-bold text-amber-400 mt-0.5">
              {mbUsed} MB
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
            <span className="text-[11px] text-neutral-400">Lotes / Coleções</span>
            <div className="font-outfit text-xl font-bold text-neutral-100 mt-0.5">
              {stats.totalBatches}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
            <span className="text-[11px] text-neutral-400">Imagens Favoritas</span>
            <div className="font-outfit text-xl font-bold text-neutral-100 mt-0.5">
              {stats.totalFavorites} ⭐
            </div>
          </div>
        </div>

        {/* Security / Privacy notice */}
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 text-xs text-neutral-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            Suas imagens são salvas diretamente no hardware do seu dispositivo via IndexedDB. Elas permanecem disponíveis offline mesmo após fechar a aba.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          {stats.totalImages > 0 && (
            <button
              type="button"
              onClick={() => {
                onDownloadAllZip();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 py-2.5 px-4 text-xs font-semibold text-neutral-200 hover:border-amber-500/40 hover:bg-neutral-800 transition-colors"
            >
              <FolderArchive className="h-4 w-4 text-amber-400" />
              <span>Baixar Tudo em Pacote ZIP (.zip)</span>
            </button>
          )}

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={stats.totalImages === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-2.5 px-4 text-xs font-medium text-red-400 hover:bg-red-500/15 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Limpar Todas as Imagens Salvas</span>
            </button>
          ) : (
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-center">
              <p className="text-xs text-red-300 font-medium mb-2">
                Tem certeza? Todas as {stats.totalImages} imagens serão apagadas do dispositivo.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmDelete(false);
                    onClose();
                  }}
                  className="flex-1 rounded-lg bg-red-500 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition-colors"
                >
                  Sim, apagar tudo
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-lg bg-neutral-800 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
