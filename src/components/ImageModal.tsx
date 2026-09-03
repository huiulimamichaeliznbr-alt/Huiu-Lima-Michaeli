import React, { useEffect } from 'react';
import {
  X,
  Download,
  Star,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Share2,
} from 'lucide-react';
import { ImageItem } from '../types';

interface ImageModalProps {
  image: ImageItem | null;
  onClose: () => void;
  onToggleFavorite: (imageId: string) => void;
  onDownload: (image: ImageItem) => void;
  onDelete: (imageId: string) => void;
  onShareSocial?: (image: ImageItem) => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalInList?: number;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  image,
  onClose,
  onToggleFavorite,
  onDownload,
  onDelete,
  onShareSocial,
  onNext,
  onPrev,
  currentIndex,
  totalInList,
}) => {
  const [copiedPrompt, setCopiedPrompt] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!image) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const formattedDate = new Date(image.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 rounded-full bg-neutral-900/80 p-2 text-neutral-300 hover:bg-neutral-800 hover:text-white backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left: Image Container with Prev/Next buttons */}
        <div className="relative flex flex-1 items-center justify-center bg-neutral-950 p-4 sm:p-6 min-h-[300px] md:min-h-[500px]">
          <img
            src={image.imageUrl}
            alt={image.title}
            referrerPolicy="no-referrer"
            className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl"
          />

          {/* Navigation Arrows */}
          {onPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              title="Imagem anterior (Seta esquerda)"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-neutral-900/80 p-2 text-neutral-200 backdrop-blur-sm hover:bg-neutral-800 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {onNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              title="Próxima imagem (Seta direita)"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-neutral-900/80 p-2 text-neutral-200 backdrop-blur-sm hover:bg-neutral-800 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Index Counter overlay */}
          {currentIndex !== undefined && totalInList !== undefined && (
            <div className="absolute bottom-3 left-4 rounded-md bg-neutral-900/80 px-2.5 py-1 text-xs font-mono font-medium text-neutral-300 backdrop-blur-sm">
              {currentIndex + 1} de {totalInList}
            </div>
          )}
        </div>

        {/* Right: Technical Details & Actions Sidebar */}
        <div className="flex w-full flex-col justify-between border-t border-neutral-800 bg-neutral-900/90 p-5 md:w-80 md:border-t-0 md:border-l sm:p-6">
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Title & Badge */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/20">
                  #{String(image.indexInBatch).padStart(2, '0')}
                </span>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                  {image.category}
                </span>
              </div>
              <h3 className="font-outfit mt-1.5 text-lg font-bold text-neutral-100">
                {image.title}
              </h3>
            </div>

            {/* Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-neutral-400">Prompt da IA</span>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
                >
                  {copiedPrompt ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedPrompt ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-xs leading-relaxed text-neutral-300 max-h-32 overflow-y-auto">
                {image.prompt}
              </p>
            </div>

            {/* Technical Metadata */}
            <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Resolução:</span>
                <span className="font-mono text-neutral-200">{image.width} × {image.height}</span>
              </div>
              <div className="flex justify-between">
                <span>Proporção:</span>
                <span className="font-mono text-neutral-200">{image.aspectRatio}</span>
              </div>
              <div className="flex justify-between">
                <span>Tamanho no dispositivo:</span>
                <span className="font-mono text-neutral-200">{(image.sizeBytes / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span>Coleção / Lote:</span>
                <span className="text-neutral-200 truncate max-w-[130px]">{image.batchName}</span>
              </div>
              <div className="flex justify-between">
                <span>Criada em:</span>
                <span className="text-neutral-300">{formattedDate}</span>
              </div>
            </div>

            {/* Tags */}
            {image.tags && image.tags.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-neutral-400">Tags</span>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {image.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[10px] text-neutral-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2 pt-3 border-t border-neutral-800">
            {onShareSocial && (
              <button
                onClick={() => onShareSocial(image)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:opacity-95 active:scale-98 transition-all"
                title="Postar no Instagram Stories, WhatsApp, TikTok, X e redes sociais"
              >
                <Share2 className="h-4 w-4 stroke-[2.5]" />
                <span>Postar nas Redes Sociais (9:16)</span>
              </button>
            )}

            <button
              onClick={() => onDownload(image)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700 py-2.5 px-4 text-xs font-bold text-neutral-100 hover:bg-neutral-700 hover:border-neutral-600 active:scale-98 transition-all"
            >
              <Download className="h-4 w-4 stroke-[2.5]" />
              <span>Baixar Esta Imagem (.png)</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => onToggleFavorite(image.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-colors ${
                  image.isFavorite
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Star className={`h-4 w-4 ${image.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{image.isFavorite ? 'Favorita' : 'Favoritar'}</span>
              </button>

              <button
                onClick={() => {
                  onDelete(image.id);
                  onClose();
                }}
                className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                title="Excluir imagem do dispositivo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
