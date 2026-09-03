import { ImageItem } from '../types';

/**
 * Converts a base64 data URL to a binary Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/png';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Converts a base64 data URL to a browser File object for Web Share API
 */
export function dataUrlToFile(dataUrl: string, fileName: string): File {
  const blob = dataUrlToBlob(dataUrl);
  return new File([blob], fileName.endsWith('.png') ? fileName : `${fileName}.png`, {
    type: 'image/png',
  });
}

/**
 * Generates tailored, engaging social media captions with relevant hashtags
 */
export function generateSocialCaption(image: ImageItem): string {
  const categoryHashtags: Record<string, string[]> = {
    comidas: ['#gastronomia', '#comida', '#gourmet', '#foodporn', '#culinaria', '#foodie'],
    animais: ['#animais', '#pets', '#natureza', '#wildlife', '#animallovers', '#petstagram'],
    carros: ['#carros', '#supercars', '#automotivo', '#carlovers', '#speed', '#luxurycars'],
    retratos: ['#retratos', '#portrait', '#fotografia', '#cinematographic', '#photooftheday'],
    robos: ['#tecnologia', '#robos', '#cyberpunk', '#scifi', '#ia', '#futurismo'],
    flores: ['#flores', '#botanica', '#jardim', '#flowers', '#natureza', '#macrophotography'],
    espaco: ['#espaco', '#universo', '#galaxia', '#astronomia', '#cosmos', '#stars'],
    natureza: ['#natureza', '#paisagem', '#landscape', '#aventura', '#earth', '#viagem'],
    cyberpunk: ['#cyberpunk', '#neon', '#scifi', '#future', '#nightcity', '#synthwave'],
    moda: ['#moda', '#streetwear', '#sneakers', '#fashion', '#estilo', '#luxury'],
    musica: ['#musica', '#sound', '#guitar', '#show', '#vibes', '#musical'],
    veiculos: ['#aviacao', '#aeronautica', '#jato', '#voar', '#aircraft', '#pilot'],
    jogos: ['#games', '#gamer', '#rpg', '#gaming', '#fantasyart', '#videogames'],
    fantasia: ['#fantasia', '#magia', '#fantasy', '#arte', '#epic', '#magic'],
    arquitetura: ['#arquitetura', '#architecture', '#design', '#decor', '#mansao', '#modern'],
    amoled: ['#amoled', '#darkwallpaper', '#blackaesthetic', '#wallpaper9x16', '#minimalist'],
    abstrato: ['#arteabstrata', '#3dart', '#abstract', '#design', '#fluidart', '#creative'],
    fotorrealismo: ['#fotografia', '#fotorrealismo', '#8k', '#cinematic', '#hyperrealistic'],
  };

  const specificTags = categoryHashtags[image.category.toLowerCase()] || [
    '#arte',
    '#fotografia',
    '#design',
  ];
  const generalTags = ['#GeradorDeFotosIA', '#FotoIA', '#Wallpaper9x16', '#ArteDigital'];
  const allHashtags = Array.from(new Set([...specificTags, ...generalTags])).join(' ');

  return `✨ ${image.title}\n\n"${image.prompt}"\n\nCriada com o Gerador de Fotos IA em 9:16 vertical 📸\n\n${allHashtags}`;
}

/**
 * Checks if the browser supports sharing image files directly via Web Share API
 */
export function canShareFile(file: File): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.share &&
    !!navigator.canShare &&
    navigator.canShare({ files: [file] })
  );
}

/**
 * Shares image and caption natively via Web Share API (Mobile Instagram, WhatsApp, TikTok, etc.)
 */
export async function shareNativeFile(
  image: ImageItem,
  customCaption?: string
): Promise<{ success: boolean; message: string }> {
  const caption = customCaption || generateSocialCaption(image);
  const cleanTitle = image.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
  const fileName = `${cleanTitle}-9x16.png`;

  try {
    const file = dataUrlToFile(image.imageUrl, fileName);

    if (canShareFile(file)) {
      await navigator.share({
        title: image.title,
        text: caption,
        files: [file],
      });
      return { success: true, message: 'Compartilhado com sucesso via aplicativo nativo!' };
    } else if (navigator.share) {
      await navigator.share({
        title: image.title,
        text: `${caption}\n\n${image.imageUrl.slice(0, 100)}...`,
      });
      return { success: true, message: 'Texto compartilhado!' };
    } else {
      return {
        success: false,
        message: 'Compartilhamento nativo não suportado neste navegador. Use os botões diretos abaixo.',
      };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'Compartilhamento cancelado pelo usuário.' };
    }
    console.warn('Erro no Web Share:', err);
    return { success: false, message: 'Não foi possível compartilhar diretamente.' };
  }
}

/**
 * Copies the raw image to system clipboard (allows Ctrl+V into WhatsApp Web, Discord, Facebook, X, etc.)
 */
export async function copyImageToClipboard(
  imageUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    const blob = dataUrlToBlob(imageUrl);
    // Write image directly to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return {
      success: true,
      message: 'Imagem copiada! Agora basta colar (Ctrl+V) no WhatsApp Web, Instagram, Discord, X ou Facebook.',
    };
  } catch (err) {
    console.warn('Clipboard write image failed:', err);
    return {
      success: false,
      message: 'Navegador não permitiu copiar imagem diretamente. Baixe o arquivo ou use o compartilhamento nativo.',
    };
  }
}

export interface SocialShareTarget {
  id: string;
  name: string;
  category: 'direct' | 'chat' | 'social';
  description: string;
  actionUrl?: (text: string, title: string) => string;
  colorClass: string;
  hoverClass: string;
  instructions?: string;
}

export const SOCIAL_NETWORKS: SocialShareTarget[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'chat',
    description: 'Conversas, Grupos ou Status',
    colorClass: 'bg-emerald-600/15 border-emerald-500/30 text-emerald-400',
    hoverClass: 'hover:bg-emerald-600/25 hover:border-emerald-500/60',
    actionUrl: (text) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
    instructions: 'Abre o WhatsApp com a legenda pronta. A imagem também é baixada/copiada para anexar.',
  },
  {
    id: 'instagram',
    name: 'Instagram (Stories / Feed)',
    category: 'social',
    description: 'Formato 9:16 nativo para Stories e Reels',
    colorClass: 'bg-pink-600/15 border-pink-500/30 text-pink-400',
    hoverClass: 'hover:bg-pink-600/25 hover:border-pink-500/60',
    actionUrl: () => `https://www.instagram.com/`,
    instructions: 'No celular, usa o compartilhamento direto para abrir o Stories. No PC, copia e abre o Instagram.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'social',
    description: 'Postagem e tela vertical 9:16',
    colorClass: 'bg-neutral-800 border-neutral-700 text-neutral-100',
    hoverClass: 'hover:bg-neutral-700 hover:border-neutral-500',
    actionUrl: () => `https://www.tiktok.com/upload`,
    instructions: 'Legenda copiada e imagem pronta para enviar nos vídeos ou fotos do TikTok.',
  },
  {
    id: 'twitter',
    name: 'X (antigo Twitter)',
    category: 'social',
    description: 'Tweet com hashtags e descrição',
    colorClass: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    hoverClass: 'hover:bg-sky-500/25 hover:border-sky-500/60',
    actionUrl: (text, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 240))}`,
    instructions: 'Abre a caixa de tweet já preenchida.',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'chat',
    description: 'Canais, Grupos e Chat Privado',
    colorClass: 'bg-blue-600/15 border-blue-500/30 text-blue-400',
    hoverClass: 'hover:bg-blue-600/25 hover:border-blue-500/60',
    actionUrl: (text) => `https://t.me/share/url?url=${encodeURIComponent('https://geradordefotos.ia')}&text=${encodeURIComponent(text)}`,
    instructions: 'Abre o Telegram com a legenda pronta.',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    description: 'Feed, Grupos ou Stories',
    colorClass: 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400',
    hoverClass: 'hover:bg-indigo-600/25 hover:border-indigo-500/60',
    actionUrl: (text) =>
      `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`,
    instructions: 'Abre a janela de publicação do Facebook.',
  },
  {
    id: 'threads',
    name: 'Threads',
    category: 'social',
    description: 'Postagem com texto e mídia',
    colorClass: 'bg-purple-600/15 border-purple-500/30 text-purple-400',
    hoverClass: 'hover:bg-purple-600/25 hover:border-purple-500/60',
    actionUrl: (text) => `https://threads.net/intent/post?text=${encodeURIComponent(text)}`,
    instructions: 'Abre o Threads com o texto pronto.',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    category: 'social',
    description: 'Criar Pin na sua pasta',
    colorClass: 'bg-red-600/15 border-red-500/30 text-red-400',
    hoverClass: 'hover:bg-red-600/25 hover:border-red-500/60',
    actionUrl: (text, title) =>
      `https://pinterest.com/pin/create/button/?description=${encodeURIComponent(text)}`,
    instructions: 'Abre a criação de Pin no Pinterest.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'social',
    description: 'Rede profissional e portfólio',
    colorClass: 'bg-cyan-600/15 border-cyan-500/30 text-cyan-400',
    hoverClass: 'hover:bg-cyan-600/25 hover:border-cyan-500/60',
    actionUrl: (text) =>
      `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(text)}`,
    instructions: 'Abre publicação profissional no LinkedIn.',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    category: 'social',
    description: 'Postagem em subreddits de arte',
    colorClass: 'bg-orange-600/15 border-orange-500/30 text-orange-400',
    hoverClass: 'hover:bg-orange-600/25 hover:border-orange-500/60',
    actionUrl: (text, title) =>
      `https://reddit.com/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`,
    instructions: 'Abre criação de post no Reddit.',
  },
];
