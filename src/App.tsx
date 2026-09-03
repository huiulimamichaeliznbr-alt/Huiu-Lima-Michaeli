import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { GeneratorPanel } from './components/GeneratorPanel';
import { GalleryView } from './components/GalleryView';
import { ImageModal } from './components/ImageModal';
import { StorageModal } from './components/StorageModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SocialPostModal } from './components/SocialPostModal';
import { galleryDB } from './services/db';
import { expandPrompts, generateGeminiImage, downloadImageFile, downloadImagesZip } from './services/api';
import { synthesizeArtwork, synthesizeAllInstantaneous } from './services/imageSynthesizer';
import { generateInstantPrompts } from './services/instantPrompts';
import { subscriptionService } from './services/subscription';
import { ImageItem, BatchCollection, GenerationConfig, StorageStats, UserSubscription } from './types';
import { Sparkles, Download, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [batches, setBatches] = useState<BatchCollection[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string | 'all'>('all');
  const [stats, setStats] = useState<StorageStats>({
    totalImages: 0,
    totalBatches: 0,
    totalBytes: 0,
    totalFavorites: 0,
  });

  // Social Sharing state
  const [socialShareImage, setSocialShareImage] = useState<ImageItem | null>(null);
  const [isSocialShareOpen, setIsSocialShareOpen] = useState(false);

  // Subscription state
  const [subscription, setSubscription] = useState<UserSubscription>(() =>
    subscriptionService.getSubscription()
  );
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  // Generator states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 50, stage: '' });
  const [recentThumbnails, setRecentThumbnails] = useState<string[]>([]);
  const abortRef = useRef(false);

  // ZIP download state
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Modals
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generator section ref for auto-scrolling
  const generatorRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  }, []);

  // Reload database records
  const loadData = useCallback(async () => {
    try {
      const [allImgs, allBatches, currentStats] = await Promise.all([
        galleryDB.getAllImages(),
        galleryDB.getAllBatches(),
        galleryDB.getStorageStats(),
      ]);
      setImages(allImgs);
      setBatches(allBatches);
      setStats(currentStats);
    } catch (err) {
      console.error('Falha ao carregar dados do IndexedDB:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscription Actions
  const handleActivatePlan = (paymentMethod: string) => {
    const updated = subscriptionService.activateMonthlyPlan(paymentMethod);
    setSubscription(updated);
    showToast('🎉 Plano Pro Mensal ativado! Cobrança recorrente de R$ 29,90/mês.');
  };

  const handleCancelPlan = () => {
    const updated = subscriptionService.cancelSubscription();
    setSubscription(updated);
    showToast('Assinatura mensal cancelada.');
  };

  const handleToggleAutoRenew = () => {
    const updated = subscriptionService.toggleAutoRenew();
    setSubscription(updated);
    showToast(
      `Renovação mensal automática ${updated.isAutoRenew ? 'ativada' : 'pausada'}.`
    );
  };

  // Start Generation of 50 Images (Instantaneous 9:16)
  const handleStartGeneration = async (config: GenerationConfig) => {
    if (subscription.status !== 'active') {
      setIsSubscriptionOpen(true);
      showToast('🔒 É necessário assinar o Plano Pro Mensal (R$ 29,90/mês) para gerar fotos.');
      return;
    }

    setIsGenerating(true);
    abortRef.current = false;
    setRecentThumbnails([]);

    const batchId = `lote-${Date.now()}`;
    const batchName = `${config.prompt.slice(0, 26)}... (${config.count} fotos 9:16)`;

    try {
      if (config.engine === 'fast-synthesizer') {
        // Fast Parallel Synthesizer (Instantaneous ~0.3s for 50 images in 9:16!)
        setGenerationProgress({
          current: 0,
          total: config.count,
          stage: `Gerando ${config.count} imagens 9:16 instantaneamente...`,
        });

        // 1. Instant prompts generated in 0ms
        const prompts = generateInstantPrompts(config.prompt, config.style, config.count);

        // 2. Parallel instant canvas synthesis
        const arts = await synthesizeAllInstantaneous(prompts, config.aspectRatio, config.style);

        const generatedImages: ImageItem[] = prompts.map((pItem, i) => {
          const art = arts[i];
          return {
            id: `img-${batchId}-${i + 1}`,
            batchId,
            batchName,
            indexInBatch: i + 1,
            title: pItem.title || `Variação #${i + 1}`,
            prompt: pItem.prompt,
            style: config.style,
            category: pItem.category || 'Wallpaper 9:16',
            tags: pItem.tags || [config.style, '9:16 Vertical'],
            mood: pItem.mood || 'Vibrante',
            aspectRatio: config.aspectRatio,
            imageUrl: art.imageUrl,
            width: art.width,
            height: art.height,
            sizeBytes: art.sizeBytes,
            createdAt: Date.now() + i,
            isFavorite: false,
            engine: 'fast-synthesizer',
          };
        });

        setRecentThumbnails(generatedImages.slice(-8).map((img) => img.imageUrl));

        // 3. Save directly to IndexedDB
        const batch: BatchCollection = {
          id: batchId,
          name: batchName,
          seedPrompt: config.prompt,
          style: config.style,
          aspectRatio: config.aspectRatio,
          engine: config.engine,
          totalImages: generatedImages.length,
          createdAt: Date.now(),
          thumbnailUrl: generatedImages[0]?.imageUrl,
        };

        await galleryDB.saveBatchWithImages(batch, generatedImages);
        await loadData();
        setActiveBatchId(batchId);

        const updatedSub = subscriptionService.incrementBatchUsage();
        setSubscription(updatedSub);

        showToast(`⚡ ${generatedImages.length} imagens verticais 9:16 geradas instantaneamente!`);
      } else {
        // Gemini Direct Nano Banana mode with queue
        setGenerationProgress({
          current: 0,
          total: config.count,
          stage: 'IA expandindo variações de prompts...',
        });

        const { prompts } = await expandPrompts(config.prompt, config.style, config.count);
        if (abortRef.current) {
          setIsGenerating(false);
          return;
        }

        const generatedImages: ImageItem[] = [];

        for (let i = 0; i < prompts.length; i++) {
          if (abortRef.current) break;

          const pItem = prompts[i];
          setGenerationProgress({
            current: i,
            total: prompts.length,
            stage: `Gemini IA criando imagem ${i + 1} de ${prompts.length}...`,
          });

          try {
            const result = await generateGeminiImage(pItem.prompt, config.aspectRatio);
            const sizeBytes = Math.round((result.imageUrl.length * 3) / 4);

            const newImage: ImageItem = {
              id: `img-${batchId}-${i + 1}`,
              batchId,
              batchName,
              indexInBatch: i + 1,
              title: pItem.title || `Gemini #${i + 1}`,
              prompt: pItem.prompt,
              style: config.style,
              category: pItem.category || 'Conceitual',
              tags: pItem.tags || [config.style, '9:16'],
              mood: pItem.mood || 'Cinematográfico',
              aspectRatio: config.aspectRatio,
              imageUrl: result.imageUrl,
              width: config.aspectRatio === '9:16' ? 540 : 800,
              height: config.aspectRatio === '9:16' ? 960 : 800,
              sizeBytes,
              createdAt: Date.now() + i,
              isFavorite: false,
              engine: 'gemini-direct',
            };

            generatedImages.push(newImage);
            setRecentThumbnails((prev) => [...prev.slice(-8), newImage.imageUrl]);
          } catch (geminiError: any) {
            console.warn(`Erro no Gemini na imagem #${i + 1}, sintetizando alternativa rápida:`, geminiError);
            const art = await synthesizeArtwork(pItem, config.aspectRatio, config.style);
            const newImage: ImageItem = {
              id: `img-${batchId}-${i + 1}`,
              batchId,
              batchName,
              indexInBatch: i + 1,
              title: pItem.title || `Variação #${i + 1}`,
              prompt: pItem.prompt,
              style: config.style,
              category: pItem.category || 'Conceitual',
              tags: pItem.tags || [config.style],
              mood: pItem.mood || 'Vibrante',
              aspectRatio: config.aspectRatio,
              imageUrl: art.imageUrl,
              width: art.width,
              height: art.height,
              sizeBytes: art.sizeBytes,
              createdAt: Date.now() + i,
              isFavorite: false,
              engine: 'fast-synthesizer',
            };
            generatedImages.push(newImage);
          }

          setGenerationProgress({
            current: i + 1,
            total: prompts.length,
            stage: `Concluída ${i + 1} de ${prompts.length}...`,
          });
        }

        if (generatedImages.length > 0) {
          const batch: BatchCollection = {
            id: batchId,
            name: batchName,
            seedPrompt: config.prompt,
            style: config.style,
            aspectRatio: config.aspectRatio,
            engine: config.engine,
            totalImages: generatedImages.length,
            createdAt: Date.now(),
            thumbnailUrl: generatedImages[0]?.imageUrl,
          };

          await galleryDB.saveBatchWithImages(batch, generatedImages);
          await loadData();
          setActiveBatchId(batchId);

          const updatedSub = subscriptionService.incrementBatchUsage();
          setSubscription(updatedSub);

          showToast(`🎉 ${generatedImages.length} imagens salvas no dispositivo!`);
        }
      }
    } catch (err: any) {
      console.error('Erro na geração de lote:', err);
      showToast(`Erro na geração: ${err.message || 'Verifique sua conexão'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelGeneration = () => {
    abortRef.current = true;
    setIsGenerating(false);
    showToast('Geração interrompida. As imagens já processadas foram mantidas.');
  };

  // Single Image Download
  const handleDownloadSingle = (image: ImageItem) => {
    const filename = `${String(image.indexInBatch).padStart(2, '0')}-${image.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')}`;
    downloadImageFile(image.imageUrl, filename);
    showToast(`Download da imagem #${image.indexInBatch} iniciado!`);
  };

  // Batch ZIP Download
  const handleDownloadZip = async (imagesToZip: ImageItem[], zipName: string) => {
    if (imagesToZip.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);

    try {
      await downloadImagesZip(imagesToZip, zipName, (progress) => {
        setZipProgress(progress);
      });
      showToast(`Arquivo ZIP com ${imagesToZip.length} imagens baixado com sucesso!`);
    } catch (err) {
      console.error('Erro ao gerar ZIP:', err);
      showToast('Falha ao compactar arquivo ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  // Favorite toggle
  const handleToggleFavorite = async (imageId: string) => {
    try {
      const isFav = await galleryDB.toggleFavorite(imageId);
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, isFavorite: isFav } : img))
      );
      if (selectedImage && selectedImage.id === imageId) {
        setSelectedImage((prev) => (prev ? { ...prev, isFavorite: isFav } : null));
      }
      setStats((prev) => ({
        ...prev,
        totalFavorites: isFav ? prev.totalFavorites + 1 : prev.totalFavorites - 1,
      }));
    } catch (err) {
      console.error('Erro ao favoritar:', err);
    }
  };

  // Delete single image
  const handleDeleteImage = async (imageId: string) => {
    try {
      await galleryDB.deleteImage(imageId);
      await loadData();
      showToast('Imagem removida do dispositivo.');
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  // Delete batch
  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Deseja realmente excluir este lote e todas as suas imagens do dispositivo?')) {
      return;
    }
    try {
      await galleryDB.deleteBatch(batchId);
      setActiveBatchId('all');
      await loadData();
      showToast('Lote e imagens removidos do dispositivo.');
    } catch (err) {
      console.error('Erro ao excluir lote:', err);
    }
  };

  // Clear all device gallery data
  const handleClearAll = async () => {
    try {
      await galleryDB.clearAll();
      setActiveBatchId('all');
      await loadData();
      showToast('Galeria do dispositivo foi completamente limpa.');
    } catch (err) {
      console.error('Erro ao limpar galeria:', err);
    }
  };

  // Modal navigation (Next/Prev)
  const currentImagesList = activeBatchId === 'all' ? images : images.filter((img) => img.batchId === activeBatchId);
  const currentModalIndex = selectedImage ? currentImagesList.findIndex((img) => img.id === selectedImage.id) : -1;

  const handleNextImage = () => {
    if (currentModalIndex >= 0 && currentModalIndex < currentImagesList.length - 1) {
      setSelectedImage(currentImagesList[currentModalIndex + 1]);
    }
  };

  const handlePrevImage = () => {
    if (currentModalIndex > 0) {
      setSelectedImage(currentImagesList[currentModalIndex - 1]);
    }
  };

  const activeBatch = batches.find((b) => b.id === activeBatchId);

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navbar */}
      <Navbar
        stats={stats}
        subscription={subscription}
        onOpenStorage={() => setIsStorageOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onNewBatch={() => {
          generatorRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onDownloadAllZip={() => {
          const imgsToExport = activeBatchId === 'all' ? images : images.filter((i) => i.batchId === activeBatchId);
          handleDownloadZip(imgsToExport, activeBatch ? activeBatch.name : 'galeria-completa-50');
        }}
        hasImages={images.length > 0}
        activeBatchName={activeBatch?.name}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        {/* Generator Panel */}
        <section ref={generatorRef}>
          <GeneratorPanel
            isGenerating={isGenerating}
            progress={generationProgress}
            onStartGeneration={handleStartGeneration}
            onCancelGeneration={handleCancelGeneration}
            recentThumbnails={recentThumbnails}
            subscription={subscription}
            onOpenSubscription={() => setIsSubscriptionOpen(true)}
          />
        </section>

        {/* Gallery Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-outfit text-xl font-bold text-neutral-100 sm:text-2xl">
                Galeria Salva no Dispositivo
              </h2>
              <p className="text-xs text-neutral-400">
                Imagens organizadas por lote, categorias e salvas de forma segura no armazenamento local.
              </p>
            </div>
          </div>

          <GalleryView
            images={images}
            batches={batches}
            activeBatchId={activeBatchId}
            onSelectBatch={setActiveBatchId}
            onImageClick={setSelectedImage}
            onToggleFavorite={handleToggleFavorite}
            onDownloadSingle={handleDownloadSingle}
            onDownloadZip={handleDownloadZip}
            onDeleteImage={handleDeleteImage}
            onDeleteBatch={handleDeleteBatch}
            onShareSocial={(img) => {
              setSocialShareImage(img);
              setIsSocialShareOpen(true);
            }}
            isZipping={isZipping}
            zipProgress={zipProgress}
          />
        </section>
      </main>

      {/* Fullscreen Inspector Modal */}
      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onToggleFavorite={handleToggleFavorite}
        onDownload={handleDownloadSingle}
        onDelete={handleDeleteImage}
        onShareSocial={(img) => {
          setSocialShareImage(img);
          setIsSocialShareOpen(true);
        }}
        onNext={currentModalIndex < currentImagesList.length - 1 ? handleNextImage : undefined}
        onPrev={currentModalIndex > 0 ? handlePrevImage : undefined}
        currentIndex={currentModalIndex >= 0 ? currentModalIndex : undefined}
        totalInList={currentImagesList.length}
      />

      {/* Social Post Modal */}
      <SocialPostModal
        isOpen={isSocialShareOpen}
        image={socialShareImage}
        onClose={() => {
          setIsSocialShareOpen(false);
          setSocialShareImage(null);
        }}
        onDownload={handleDownloadSingle}
        onShowToast={showToast}
      />

      {/* Storage Management Modal */}
      <StorageModal
        isOpen={isStorageOpen}
        onClose={() => setIsStorageOpen(false)}
        stats={stats}
        onClearAll={handleClearAll}
        onDownloadAllZip={() => {
          handleDownloadZip(images, 'backup-galeria-completa');
        }}
      />

      {/* Monthly Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        subscription={subscription}
        onActivatePlan={handleActivatePlan}
        onCancelPlan={handleCancelPlan}
        onToggleAutoRenew={handleToggleAutoRenew}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-neutral-900/95 px-4 py-3 text-xs font-medium text-amber-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
