import React, { useState, useMemo } from 'react';
import {
  Search,
  FolderArchive,
  Download,
  Star,
  Trash2,
  Maximize2,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  ArrowUpDown,
  Filter,
  Share2,
} from 'lucide-react';
import { ImageItem, BatchCollection } from '../types';

interface GalleryViewProps {
  images: ImageItem[];
  batches: BatchCollection[];
  activeBatchId: string | 'all';
  onSelectBatch: (batchId: string | 'all') => void;
  onImageClick: (image: ImageItem) => void;
  onToggleFavorite: (imageId: string) => void;
  onDownloadSingle: (image: ImageItem) => void;
  onDownloadZip: (imagesToZip: ImageItem[], zipName: string) => void;
  onDeleteImage: (imageId: string) => void;
  onDeleteBatch: (batchId: string) => void;
  onShareSocial?: (image: ImageItem) => void;
  isZipping: boolean;
  zipProgress: number;
}

type ViewDensity = 'compact' | 'normal' | 'list';
type SortOption = 'newest' | 'oldest' | 'batchIndex' | 'favorites' | 'title';

export const GalleryView: React.FC<GalleryViewProps> = ({
  images,
  batches,
  activeBatchId,
  onSelectBatch,
  onImageClick,
  onToggleFavorite,
  onDownloadSingle,
  onDownloadZip,
  onDeleteImage,
  onDeleteBatch,
  onShareSocial,
  isZipping,
  zipProgress,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [density, setDensity] = useState<ViewDensity>('normal');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Extract unique categories from current images
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    images.forEach((img) => {
      if (img.category) cats.add(img.category);
    });
    return Array.from(cats);
  }, [images]);

  // Filter images based on batch, search, and category
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      // Batch filter
      if (activeBatchId !== 'all' && img.batchId !== activeBatchId) {
        return false;
      }

      // Category filter
      if (categoryFilter === 'favorites' && !img.isFavorite) {
        return false;
      } else if (categoryFilter !== 'all' && categoryFilter !== 'favorites' && img.category !== categoryFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = img.title?.toLowerCase().includes(query);
        const matchesPrompt = img.prompt?.toLowerCase().includes(query);
        const matchesCategory = img.category?.toLowerCase().includes(query);
        const matchesTags = img.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesPrompt && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [images, activeBatchId, categoryFilter, searchTerm]);

  // Sort images
  const sortedImages = useMemo(() => {
    return [...filteredImages].sort((a, b) => {
      switch (sortBy) {
        case 'favorites':
          if (a.isFavorite === b.isFavorite) return b.createdAt - a.createdAt;
          return a.isFavorite ? -1 : 1;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'batchIndex':
          return a.indexInBatch - b.indexInBatch;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return b.createdAt - a.createdAt;
      }
    });
  }, [filteredImages, sortBy]);

  // Handle Multi-select
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedImageIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedImageIds(next);
  };

  const handleSelectAll = () => {
    if (selectedImageIds.size === sortedImages.length) {
      setSelectedImageIds(new Set());
    } else {
      setSelectedImageIds(new Set(sortedImages.map((i) => i.id)));
    }
  };

  // Download ZIP of selected or current view
  const handleTriggerZip = () => {
    let imagesToExport = sortedImages;
    let label = 'galeria-50-imagens';

    if (selectedImageIds.size > 0) {
      imagesToExport = sortedImages.filter((img) => selectedImageIds.has(img.id));
      label = `selecao-${imagesToExport.length}-imagens`;
    } else if (activeBatchId !== 'all') {
      const b = batches.find((x) => x.id === activeBatchId);
      if (b) label = `lote-${b.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }

    onDownloadZip(imagesToExport, label);
  };

  const currentBatch = batches.find((b) => b.id === activeBatchId);

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-md">
        {/* Row 1: Search & Batch Filter */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="gallery-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por tema, prompt, categoria (#01, neon, anime...)"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-4 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-300"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Batch Selector Dropdown */}
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-neutral-400 shrink-0" />
            <select
              id="batch-filter-select"
              value={activeBatchId}
              onChange={(e) => onSelectBatch(e.target.value)}
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">Todos os Lotes ({images.length} fotos)</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} ({batch.totalImages} fotos)
                </option>
              ))}
            </select>

            {/* If a specific batch is selected, offer option to delete it */}
            {activeBatchId !== 'all' && (
              <button
                type="button"
                onClick={() => onDeleteBatch(activeBatchId)}
                title="Excluir este lote inteiro"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort & Density */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 px-2 py-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
              <select
                id="gallery-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs text-neutral-300 focus:outline-none"
              >
                <option value="newest" className="bg-neutral-900">Mais Recentes</option>
                <option value="oldest" className="bg-neutral-900">Mais Antigas</option>
                <option value="batchIndex" className="bg-neutral-900">Ordem do Lote (#01 - #50)</option>
                <option value="favorites" className="bg-neutral-900">Favoritos Primeiro</option>
                <option value="title" className="bg-neutral-900">Ordem Alfabética</option>
              </select>
            </div>

            {/* Density view switchers */}
            <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-950 p-1">
              <button
                onClick={() => setDensity('normal')}
                title="Visualização em Grade Média"
                className={`rounded-lg p-1.5 transition-colors ${
                  density === 'normal' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDensity('compact')}
                title="Visualização Compacta (Mosaico de 50)"
                className={`rounded-lg p-1.5 transition-colors ${
                  density === 'compact' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDensity('list')}
                title="Visualização em Lista com Prompts"
                className={`rounded-lg p-1.5 transition-colors ${
                  density === 'list' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category filter pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-500 text-[11px] pr-1">Filtro:</span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
              categoryFilter === 'all'
                ? 'bg-amber-500 text-neutral-950 font-semibold'
                : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Todas ({images.length})
          </button>
          <button
            onClick={() => setCategoryFilter('favorites')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-all ${
              categoryFilter === 'favorites'
                ? 'bg-amber-500 text-neutral-950 font-semibold'
                : 'border border-neutral-800 bg-neutral-950 text-amber-400/90 hover:text-amber-300'
            }`}
          >
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>Favoritas</span>
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Summary and Bulk Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800/80 bg-neutral-950/70 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelectedImageIds(new Set());
            }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              isSelectMode
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>{isSelectMode ? 'Modo Seleção Ativo' : 'Selecionar Várias'}</span>
          </button>

          {isSelectMode && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-amber-400 hover:underline"
            >
              {selectedImageIds.size === sortedImages.length ? 'Desmarcar Todas' : 'Selecionar Todas as 50'}
            </button>
          )}

          <span className="text-xs text-neutral-400">
            Exibindo <strong className="text-neutral-100">{sortedImages.length}</strong> de {images.length} imagens no dispositivo
            {selectedImageIds.size > 0 && ` (${selectedImageIds.size} selecionadas)`}
          </span>
        </div>

        {/* Big ZIP Download CTA & Quick Share if 1 selected */}
        <div className="flex items-center gap-2">
          {selectedImageIds.size === 1 && onShareSocial && (
            <button
              type="button"
              onClick={() => {
                const selectedId = Array.from(selectedImageIds)[0];
                const img = images.find((i) => i.id === selectedId);
                if (img) onShareSocial(img);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-pink-500/40 bg-pink-500/15 px-3 py-2 text-xs font-bold text-pink-300 hover:bg-pink-500/25 transition-all shadow-sm"
              title="Postar a foto selecionada nas redes sociais"
            >
              <Share2 className="h-4 w-4" />
              <span>Postar Foto</span>
            </button>
          )}

          <button
            id="download-zip-batch-btn"
            onClick={handleTriggerZip}
            disabled={isZipping || sortedImages.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-neutral-950 shadow-md shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-50"
          >
            <FolderArchive className="h-4 w-4" />
            <span>
              {isZipping
                ? `Compactando ZIP (${zipProgress}%)...`
                : selectedImageIds.size > 0
                ? `Baixar ${selectedImageIds.size} Selecionadas (.zip)`
                : activeBatchId !== 'all'
                ? `Baixar Todas as ${sortedImages.length} do Lote (.zip)`
                : `Baixar Lote Completo (.zip)`}
            </span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {sortedImages.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
          <Sparkles className="h-10 w-10 text-neutral-600 mb-3" />
          <h3 className="font-outfit text-base font-semibold text-neutral-200">
            {images.length === 0 ? 'Nenhuma imagem gerada ainda' : 'Nenhuma imagem encontrada com esse filtro'}
          </h3>
          <p className="mt-1 text-xs text-neutral-500 max-w-md">
            {images.length === 0
              ? 'Use o painel acima para gerar seu primeiro lote com 50 imagens rapidamente e salvar na galeria do dispositivo.'
              : 'Tente alterar os termos de busca ou mudar a categoria selecionada.'}
          </p>
        </div>
      )}

      {/* Grid of Images */}
      {sortedImages.length > 0 && (
        <div
          className={`grid gap-3.5 sm:gap-4 ${
            density === 'compact'
              ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
              : density === 'list'
              ? 'grid-cols-1'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          }`}
        >
          {sortedImages.map((image, index) => {
            const isSelected = selectedImageIds.has(image.id);

            if (density === 'list') {
              return (
                <div
                  key={image.id}
                  onClick={() => onImageClick(image)}
                  className={`group flex flex-col sm:flex-row items-center gap-4 rounded-xl border p-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-950 border border-neutral-800">
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <span className="absolute top-1.5 left-1.5 rounded bg-neutral-950/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                      #{String(image.indexInBatch || index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-outfit text-sm font-semibold text-neutral-100 truncate">
                        {image.title}
                      </h4>
                      <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                        {image.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-400 line-clamp-2">{image.prompt}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                      <span>Proporção: {image.aspectRatio}</span>
                      <span>•</span>
                      <span>Tamanho: {(image.sizeBytes / 1024).toFixed(0)} KB</span>
                      <span>•</span>
                      <span>Lote: {image.batchName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFavorite(image.id)}
                      className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-amber-400"
                    >
                      <Star className={`h-4 w-4 ${image.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    {onShareSocial && (
                      <button
                        onClick={() => onShareSocial(image)}
                        className="rounded-lg bg-neutral-800 p-2 text-pink-400 hover:bg-pink-500 hover:text-white transition-colors"
                        title="Postar em redes sociais (Instagram, WhatsApp, TikTok, X...)"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDownloadSingle(image)}
                      className="rounded-lg bg-neutral-800 p-2 text-neutral-200 hover:bg-amber-500 hover:text-neutral-950 transition-colors"
                      title="Baixar imagem individual"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteImage(image.id)}
                      className="rounded-lg p-2 text-neutral-400 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={image.id}
                onClick={() => {
                  if (isSelectMode) {
                    handleToggleSelect(image.id, { stopPropagation: () => {} } as any);
                  } else {
                    onImageClick(image);
                  }
                }}
                className={`group relative overflow-hidden rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/40 bg-neutral-900'
                    : 'border-neutral-800/90 bg-neutral-900/60 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5'
                }`}
              >
                {/* Image Aspect ratio container */}
                <div
                  className={`relative w-full overflow-hidden bg-neutral-950 ${
                    image.aspectRatio === '16:9'
                      ? 'aspect-video'
                      : image.aspectRatio === '9:16'
                      ? 'aspect-[9/16]'
                      : image.aspectRatio === '4:3'
                      ? 'aspect-[4/3]'
                      : 'aspect-square'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Gradient bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badge: Index in Batch */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="rounded-md bg-neutral-950/80 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-neutral-800">
                      #{String(image.indexInBatch || index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Top Right: Favorite or Multi-select Checkbox */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {isSelectMode ? (
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelect(image.id, e)}
                        className="rounded-md bg-neutral-950/80 p-1 text-amber-400"
                      >
                        {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-neutral-400" />}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(image.id);
                        }}
                        className="rounded-md bg-neutral-950/70 p-1.5 backdrop-blur-sm text-neutral-300 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`h-3.5 w-3.5 ${image.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute inset-x-2 bottom-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadSingle(image);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-1 text-[11px] font-bold text-neutral-950 shadow-md hover:bg-amber-400 transition-colors"
                      title="Baixar imagem individual (.png)"
                    >
                      <Download className="h-3 w-3 stroke-[2.5]" />
                      <span>Baixar</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {onShareSocial && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareSocial(image);
                          }}
                          className="rounded-lg bg-neutral-900/90 p-1.5 text-pink-400 backdrop-blur-sm hover:bg-pink-500 hover:text-white transition-colors"
                          title="Postar em redes sociais (Instagram Stories, WhatsApp, TikTok, X...)"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageClick(image);
                        }}
                        className="rounded-lg bg-neutral-900/90 p-1.5 text-neutral-200 backdrop-blur-sm hover:bg-neutral-800 transition-colors"
                        title="Ver em tamanho real"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card footer (for normal view) */}
                {density === 'normal' && (
                  <div className="p-2.5">
                    <h4 className="font-outfit text-xs font-semibold text-neutral-100 truncate" title={image.title}>
                      {image.title}
                    </h4>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400">
                      <span className="truncate max-w-[90px]">{image.category}</span>
                      <span className="text-neutral-500 font-mono">{(image.sizeBytes / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
