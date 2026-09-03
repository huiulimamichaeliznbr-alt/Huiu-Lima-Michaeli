import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Cpu,
  Layers,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Dices,
} from 'lucide-react';
import { AspectRatio, GenerationConfig, GenerationEngine, UserSubscription } from '../types';
import { IMAGE_THEMES, ImageCategoryTheme, DIVERSE_INSPIRATIONS } from '../services/instantPrompts';

interface GeneratorPanelProps {
  isGenerating: boolean;
  progress: { current: number; total: number; stage: string };
  onStartGeneration: (config: GenerationConfig) => void;
  onCancelGeneration: () => void;
  recentThumbnails: string[];
  subscription: UserSubscription;
  onOpenSubscription: () => void;
}

const STYLES = [
  'Cyberpunk 2099',
  'Fotorrealismo 8K',
  'Anime Studio',
  'Cinematográfico 35mm',
  'Arte Digital Conceitual',
  'Minimalista 3D',
  'Fantasia Épica',
  'Pintura a Óleo',
];

const RATIOS: { id: AspectRatio; label: string; iconLabel: string; highlight?: boolean }[] = [
  { id: '9:16', label: 'Vertical 9:16 (Stories / Reels / Wallpaper)', iconLabel: '9:16 (Padrão)', highlight: true },
  { id: '1:1', label: 'Quadrado (1:1)', iconLabel: '1:1' },
  { id: '16:9', label: 'Widescreen (16:9)', iconLabel: '16:9' },
  { id: '4:3', label: 'Clássico (4:3)', iconLabel: '4:3' },
];

export const GeneratorPanel: React.FC<GeneratorPanelProps> = ({
  isGenerating,
  progress,
  onStartGeneration,
  onCancelGeneration,
  recentThumbnails,
  subscription,
  onOpenSubscription,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ImageCategoryTheme>('todos');
  const [prompt, setPrompt] = useState('Cidades Cyberpunk em 2099 com arranha-céus verticais e chuva neon');
  const [style, setStyle] = useState('Cyberpunk 2099');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [count, setCount] = useState<number>(50);
  const [engine, setEngine] = useState<GenerationEngine>('fast-synthesizer');

  const handleSelectTheme = (themeId: ImageCategoryTheme) => {
    setSelectedTheme(themeId);
    const theme = IMAGE_THEMES.find((t) => t.id === themeId);
    if (theme) {
      setPrompt(theme.defaultPrompt);
      setStyle(theme.defaultStyle);
    }
  };

  const handleRandomInspiration = () => {
    const randomIndex = Math.floor(Math.random() * DIVERSE_INSPIRATIONS.length);
    const item = DIVERSE_INSPIRATIONS[randomIndex];
    setPrompt(item.prompt);
    setStyle(item.style);
    setSelectedTheme(item.theme);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    if (subscription.status !== 'active') {
      onOpenSubscription();
      return;
    }

    onStartGeneration({
      prompt: prompt.trim(),
      style,
      aspectRatio,
      count,
      engine,
    });
  };

  const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />

      {/* Subscription Banner in Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-amber-300">Plano Pro Mensal:</span>
          <span className="text-neutral-300">
            R$ 29,90/mês ({subscription.status === 'active' ? 'Ativo • Geração Instantânea Liberada' : 'Assinatura Pendente'})
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenSubscription}
          className="rounded-lg border border-amber-500/30 bg-neutral-950 px-2.5 py-1 text-[11px] font-bold text-amber-400 hover:bg-neutral-900 transition-colors"
        >
          {subscription.status === 'active' ? 'Gerenciar Assinatura Mensal' : 'Ativar Plano Mensal'}
        </button>
      </div>

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-outfit text-xl font-bold text-neutral-100 sm:text-2xl">
              Gerar Lote de 50 Imagens 9:16 Instantâneo
            </h2>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              50 Fotos 9:16
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Produza 50 variações verticais 9:16 instantaneamente, ideais para Stories, Reels, TikTok e papéis de parede.
          </p>
        </div>

        {/* Engine selector badge tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-950 p-1">
          <button
            type="button"
            onClick={() => setEngine('fast-synthesizer')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              engine === 'fast-synthesizer'
                ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Instantâneo (~0.3s)</span>
          </button>
          <button
            type="button"
            onClick={() => setEngine('gemini-direct')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              engine === 'gemini-direct'
                ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Gemini Nano Banana</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category / Type Selector */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <span>Selecione ou Crie Qualquer Tipo de Imagem</span>
              <span className="text-[10px] rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.5 border border-amber-500/30">
                Livre • Todos os Gêneros
              </span>
            </label>
            <button
              type="button"
              onClick={handleRandomInspiration}
              disabled={isGenerating}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all shadow-sm"
              title="Sortear uma ideia criativa aleatória de qualquer tema"
            >
              <Dices className="h-3.5 w-3.5" />
              <span>🎲 Sortear Ideia Criativa</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pb-1">
            {IMAGE_THEMES.map((th) => {
              const isSelected = selectedTheme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => handleSelectTheme(th.id)}
                  disabled={isGenerating}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/20 text-amber-200 shadow-sm shadow-amber-500/20 scale-[1.02]'
                      : 'border-neutral-800/80 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800/80 hover:text-neutral-200'
                  }`}
                >
                  <span>{th.icon}</span>
                  <span>{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="prompt-input" className="text-xs font-medium text-neutral-300">
              Tema, Objeto ou Ideia Visual Personalizada (Qualquer Assunto)
            </label>
            <span className="text-[11px] text-neutral-400">
              Digite qualquer ideia: comida, pessoas, animais, carros, objetos, etc.
            </span>
          </div>
          <div className="relative">
            <textarea
              id="prompt-input"
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Hambúrguer artesanal gourmet, Cachorro astronauta, Supercarro esportivo, Tênis sneaker futurista, Guerreira samurai..."
              className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
          {/* Style */}
          <div>
            <label htmlFor="style-select" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Estilo Artístico
            </label>
            <select
              id="style-select"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={isGenerating}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
            >
              {STYLES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Formato / Proporção
            </label>
            <div className="grid grid-cols-4 gap-1">
              {RATIOS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setAspectRatio(r.id)}
                  disabled={isGenerating}
                  className={`rounded-lg py-1.5 text-center text-xs font-medium transition-all ${
                    aspectRatio === r.id
                      ? 'border border-amber-500/50 bg-amber-500/15 text-amber-300'
                      : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                  title={r.label}
                >
                  {r.iconLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Image Count */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Quantidade de Imagens
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[10, 25, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCount(num)}
                  disabled={isGenerating}
                  className={`rounded-lg py-1.5 text-center text-xs font-bold transition-all ${
                    count === num
                      ? 'border border-amber-500 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {num} {num === 50 ? '★' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button & Active Progress */}
        <div className="pt-2">
          {!isGenerating ? (
            <button
              id="generate-batch-btn"
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3.5 px-6 font-outfit text-base font-bold text-neutral-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] hover:shadow-amber-500/35 active:scale-[0.99]"
            >
              <Zap className="h-5 w-5 fill-current" />
              <span>
                {subscription.status === 'active'
                  ? `Gerar ${count} Fotos ${aspectRatio} Instantaneamente (~0.3s)`
                  : `Assinar Plano Mensal para Gerar Fotos ${aspectRatio} (R$ 29,90/mês)`}
              </span>
            </button>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-neutral-950 p-4 shadow-inner">
              <div className="mb-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>{progress.stage || `Processando imagens (${progress.current}/${progress.total})...`}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-neutral-200">{percent}%</span>
                  <button
                    type="button"
                    onClick={onCancelGeneration}
                    className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-400 hover:bg-red-500/20"
                  >
                    Interromper
                  </button>
                </div>
              </div>

              {/* Progress bar track */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-150"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Live thumbnail incoming preview strip */}
              {recentThumbnails.length > 0 && (
                <div className="mt-3 flex items-center gap-2 overflow-x-auto py-1">
                  <span className="text-[10px] text-neutral-500 whitespace-nowrap">Recebidas:</span>
                  {recentThumbnails.slice(-6).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Thumbnail recente"
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 shrink-0 rounded-md border border-neutral-700 object-cover shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
