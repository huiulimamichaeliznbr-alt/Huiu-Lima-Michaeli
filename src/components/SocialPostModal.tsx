import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Send,
  Smartphone,
  Sparkles,
  MessageCircle,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { ImageItem } from '../types';
import {
  SOCIAL_NETWORKS,
  SocialShareTarget,
  generateSocialCaption,
  shareNativeFile,
  copyImageToClipboard,
} from '../services/socialSharer';

interface SocialPostModalProps {
  isOpen: boolean;
  image: ImageItem | null;
  onClose: () => void;
  onDownload: (image: ImageItem) => void;
  onShowToast: (message: string) => void;
}

export const SocialPostModal: React.FC<SocialPostModalProps> = ({
  isOpen,
  image,
  onClose,
  onDownload,
  onShowToast,
}) => {
  const [caption, setCaption] = useState('');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isSharingNative, setIsSharingNative] = useState(false);

  useEffect(() => {
    if (image) {
      setCaption(generateSocialCaption(image));
      setCopiedCaption(false);
      setCopiedImage(false);
    }
  }, [image]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    onShowToast('📋 Legenda e hashtags copiadas para a área de transferência!');
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleCopyImage = async () => {
    const res = await copyImageToClipboard(image.imageUrl);
    if (res.success) {
      setCopiedImage(true);
      onShowToast(res.message);
      setTimeout(() => setCopiedImage(false), 3000);
    } else {
      onShowToast(res.message);
      // Fallback: download the image
      onDownload(image);
    }
  };

  const handleNativeShare = async () => {
    setIsSharingNative(true);
    const res = await shareNativeFile(image, caption);
    setIsSharingNative(false);
    onShowToast(res.message);
  };

  const handleSocialClick = async (target: SocialShareTarget) => {
    // 1. Copy caption to clipboard first for convenience
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
      // ignore
    }

    // 2. Specific behaviors per social network
    if (target.id === 'instagram') {
      // Instagram Stories: 9:16 is native
      // Trigger download so the user has the image on their phone or camera roll ready to pick
      onDownload(image);
      onShowToast('📸 Foto 9:16 baixada e legenda copiada! Abra o Instagram Stories para postar.');
      if (target.actionUrl) {
        window.open(target.actionUrl(caption, image.title), '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (target.id === 'tiktok') {
      onDownload(image);
      onShowToast('🎵 Foto 9:16 baixada e hashtags copiadas! Abra o TikTok para postar.');
      if (target.actionUrl) {
        window.open(target.actionUrl(caption, image.title), '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (target.id === 'whatsapp') {
      // For WhatsApp, copy caption and launch web/app link, plus download for attachment
      onShowToast('💬 Abrindo WhatsApp... Cole a imagem e a legenda na conversa ou Status!');
      if (target.actionUrl) {
        window.open(target.actionUrl(caption, image.title), '_blank', 'noopener,noreferrer');
      }
      return;
    }

    // For Twitter/X, Facebook, Telegram, Threads, Pinterest, LinkedIn, Reddit
    if (target.actionUrl) {
      const url = target.actionUrl(caption, image.title);
      window.open(url, '_blank', 'noopener,noreferrer');
      onShowToast(`🚀 Abrindo ${target.name}... Legenda e hashtags já copiadas!`);
    }
  };

  const getTargetIcon = (id: string) => {
    switch (id) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-400" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4 text-emerald-400" />;
      case 'twitter':
        return <Twitter className="h-4 w-4 text-sky-400" />;
      case 'facebook':
        return <Facebook className="h-4 w-4 text-indigo-400" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-cyan-400" />;
      default:
        return <Send className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-neutral-950 shadow-md shadow-amber-500/20">
              <Share2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-outfit text-base font-bold text-neutral-100 sm:text-lg">
                  Postar em Qualquer Rede Social
                </h3>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                  9:16 Vertical
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Compartilhe no Instagram Stories, WhatsApp, TikTok, X, Facebook e muito mais.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-neutral-900 p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Main Top Banner: Image Preview & Native One-Tap Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-5">
            {/* 9:16 Thumbnail */}
            <div className="relative h-44 w-28 shrink-0 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950 shadow-lg">
              <img
                src={image.imageUrl}
                alt={image.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-mono font-bold text-amber-300">
                9:16
              </div>
            </div>

            {/* Quick 1-Tap Action Buttons */}
            <div className="flex-1 w-full space-y-3">
              <div>
                <h4 className="font-outfit text-base font-bold text-neutral-100">
                  {image.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                  {image.prompt}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* 1. Direct Native Share Button (Mobile / PC) */}
                <button
                  onClick={handleNativeShare}
                  disabled={isSharingNative}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2.5 text-xs font-bold text-neutral-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-98 transition-all"
                  title="Abre a tela nativa do celular para enviar diretamente para o Instagram, WhatsApp, etc."
                >
                  <Smartphone className="h-4 w-4 stroke-[2.5]" />
                  <span>{isSharingNative ? 'Abrindo...' : 'Compartilhar no Celular'}</span>
                </button>

                {/* 2. Copy Image (Ctrl+V into apps) */}
                <button
                  onClick={handleCopyImage}
                  className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/90 px-3 py-2.5 text-xs font-semibold text-neutral-200 hover:border-amber-500 hover:text-white transition-all"
                  title="Copia a imagem para colar com Ctrl+V diretamente no WhatsApp Web, Discord, Facebook ou X"
                >
                  {copiedImage ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-amber-400" />
                  )}
                  <span>{copiedImage ? 'Imagem Copiada!' : 'Copiar Imagem (Ctrl+V)'}</span>
                </button>

                {/* 3. Download for manual upload */}
                <button
                  onClick={() => onDownload(image)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/90 px-3 py-2.5 text-xs font-semibold text-neutral-200 hover:border-amber-500 hover:text-white transition-all"
                  title="Baixa a foto em alta resolução pronta para postar"
                >
                  <Download className="h-4 w-4 text-amber-400" />
                  <span>Baixar Foto (.png)</span>
                </button>
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-[11px] text-amber-300/90 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>
                  O formato <strong>9:16 vertical</strong> é o tamanho exato dos <strong>Stories do Instagram</strong>, <strong>Status do WhatsApp</strong> e <strong>TikTok</strong> sem cortes!
                </span>
              </div>
            </div>
          </div>

          {/* Social Networks Direct Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-amber-400" />
                <span>Postar Diretamente na Rede Social Desejada</span>
              </label>
              <span className="text-[11px] text-neutral-400">
                Clique para abrir com a legenda e hashtags preparadas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {SOCIAL_NETWORKS.map((network) => {
                return (
                  <button
                    key={network.id}
                    onClick={() => handleSocialClick(network)}
                    className={`group flex flex-col items-start justify-between rounded-xl border p-3 text-left transition-all active:scale-95 ${network.colorClass} ${network.hoverClass}`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="rounded-lg bg-black/40 p-1.5 backdrop-blur-sm">
                        {getTargetIcon(network.id)}
                      </div>
                      <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="mt-3">
                      <span className="text-xs font-bold text-neutral-100 block leading-tight">
                        {network.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                        {network.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caption & Hashtags Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="caption-editor" className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <span>Legenda e Hashtags Prontas</span>
                <span className="text-[10px] text-amber-400/80 font-normal">
                  (Otimizadas para engajamento)
                </span>
              </label>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all"
              >
                {copiedCaption ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCaption ? 'Legenda Copiada!' : 'Copiar Legenda'}</span>
              </button>
            </div>

            <textarea
              id="caption-editor"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Você pode editar o texto acima antes de copiar ou postar.</span>
              <button
                type="button"
                onClick={() => setCaption(generateSocialCaption(image))}
                className="text-amber-400 hover:underline"
              >
                Restaurar legenda original
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/60 px-5 py-3 text-xs text-neutral-400">
          <span>
            Dica: No celular, use <strong>"Compartilhar no Celular"</strong> para enviar direto aos Stories ou Status.
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-1.5 font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
