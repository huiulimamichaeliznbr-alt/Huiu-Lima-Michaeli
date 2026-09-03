import { PromptItem } from './api';

export type ImageCategoryTheme =
  | 'todos'
  | 'comidas'
  | 'animais'
  | 'carros'
  | 'retratos'
  | 'robos'
  | 'flores'
  | 'espaco'
  | 'natureza'
  | 'cyberpunk'
  | 'anime'
  | 'moda'
  | 'musica'
  | 'veiculos'
  | 'jogos'
  | 'fantasia'
  | 'arquitetura'
  | 'amoled'
  | 'abstrato'
  | 'fotorrealismo';

export interface ThemeConfig {
  id: ImageCategoryTheme;
  label: string;
  icon: string;
  defaultPrompt: string;
  defaultStyle: string;
  palettes: string[][];
}

export const IMAGE_THEMES: ThemeConfig[] = [
  {
    id: 'todos',
    label: '✨ Qualquer Ideia Livre',
    icon: '✨',
    defaultPrompt: 'Metrópole futurista com luzes de neon e céu cósmico',
    defaultStyle: 'Cyberpunk 2099',
    palettes: [
      ['#050510', '#13002b', '#00f0ff', '#ff0055', '#ffe600'],
      ['#020b14', '#0d2b45', '#00ffc8', '#ff3366', '#202040'],
    ],
  },
  {
    id: 'comidas',
    label: 'Comidas & Gastronomia',
    icon: '🍔',
    defaultPrompt: 'Hambúrguer artesanal gourmet com queijo cheddar derretido, bacon crocante, fumaça quente e batatas rústicas',
    defaultStyle: 'Fotorrealismo 8K',
    palettes: [
      ['#140c06', '#2d180a', '#f59e0b', '#ef4444', '#fef3c7'],
      ['#0f0a05', '#241408', '#ea580c', '#fbbf24', '#ffffff'],
    ],
  },
  {
    id: 'animais',
    label: 'Animais & Pets',
    icon: '🐾',
    defaultPrompt: 'Lobo majestoso com olhos dourados uivando no topo da colina sob luar prateado e aurora boreal',
    defaultStyle: 'Fantasia Épica',
    palettes: [
      ['#020617', '#0f172a', '#06b6d4', '#22d3ee', '#ecfeff'],
      ['#1c1917', '#292524', '#f97316', '#fb923c', '#fff7ed'],
      ['#050814', '#0d1d33', '#8b5cf6', '#a78bfa', '#f5f3ff'],
    ],
  },
  {
    id: 'retratos',
    label: 'Pessoas & Retratos',
    icon: '👤',
    defaultPrompt: 'Retrato cinematográfico de personagem elegante com iluminação de borda e olhar expressivo',
    defaultStyle: 'Fotorrealismo 8K',
    palettes: [
      ['#0c0a09', '#292524', '#f59e0b', '#fbbf24', '#fef3c7'],
      ['#0a0a14', '#1e1b4b', '#ec4899', '#a855f7', '#fdf2f8'],
      ['#09090b', '#18181b', '#06b6d4', '#67e8f9', '#ffffff'],
    ],
  },
  {
    id: 'carros',
    label: 'Carros & Supercarros',
    icon: '🏎️',
    defaultPrompt: 'Supercarro esportivo aerodinâmico acelerando na rodovia molhada com reflexos de néon',
    defaultStyle: 'Cinematográfico 35mm',
    palettes: [
      ['#0a0a0c', '#18121e', '#e11d48', '#fb7185', '#f8fafc'],
      ['#020617', '#0f172a', '#0284c7', '#38bdf8', '#f1f5f9'],
      ['#09090b', '#1c1917', '#ea580c', '#fb923c', '#ffffff'],
    ],
  },
  {
    id: 'robos',
    label: 'Robôs & Tecnologia',
    icon: '🤖',
    defaultPrompt: 'Mecha androide futurista com visor cibernético luminoso, circuitos de néon e armadura de titânio',
    defaultStyle: 'Cyberpunk 2099',
    palettes: [
      ['#030712', '#0f172a', '#06b6d4', '#3b82f6', '#ffffff'],
      ['#050510', '#180026', '#d946ef', '#06b6d4', '#fdf4ff'],
    ],
  },
  {
    id: 'flores',
    label: 'Flores & Botânica',
    icon: '🌸',
    defaultPrompt: 'Orquídea tropical exótica orvalhada com pétalas aveludadas brilhando sob iluminação suave de estúdio',
    defaultStyle: 'Fotorrealismo 8K',
    palettes: [
      ['#0a0510', '#1f0933', '#f43f5e', '#fb7185', '#fef2f2'],
      ['#03140e', '#064e3b', '#10b981', '#6ee7b7', '#fef08a'],
    ],
  },
  {
    id: 'espaco',
    label: 'Espaço & Cosmos',
    icon: '🌌',
    defaultPrompt: 'Planeta gigante anelado e nebulosa cósmica com poeira estelar cintilante e aurora interestelar',
    defaultStyle: 'Arte Digital Conceitual',
    palettes: [
      ['#030712', '#111827', '#6366f1', '#a855f7', '#f43f5e'],
      ['#020617', '#082f49', '#0284c7', '#38bdf8', '#f0f9ff'],
      ['#050014', '#1f0038', '#d946ef', '#ec4899', '#fdf4ff'],
    ],
  },
  {
    id: 'natureza',
    label: 'Natureza & Paisagens',
    icon: '🌿',
    defaultPrompt: 'Montanhas monumentais ao entardecer com cachoeira cristalina e raios de sol volumétricos',
    defaultStyle: 'Fotorrealismo 8K',
    palettes: [
      ['#061a14', '#134e4a', '#10b981', '#34d399', '#fef08a'],
      ['#1c1917', '#44403c', '#d97706', '#f59e0b', '#fef3c7'],
      ['#082f49', '#0369a1', '#38bdf8', '#7dd3fc', '#f0f9ff'],
    ],
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk & Sci-Fi',
    icon: '🏙️',
    defaultPrompt: 'Megacidade cyberpunk com arranha-céus verticais, chuva reflexiva e hologramas luminosos',
    defaultStyle: 'Cyberpunk 2099',
    palettes: [
      ['#050510', '#13002b', '#00f0ff', '#ff0055', '#ffe600'],
      ['#030712', '#1e1b4b', '#38bdf8', '#c084fc', '#f43f5e'],
    ],
  },
  {
    id: 'anime',
    label: 'Anime & Ilustração',
    icon: '🎨',
    defaultPrompt: 'Cena épica de anime com guerreiro celestial e pétalas de energia mística ao vento',
    defaultStyle: 'Anime Studio',
    palettes: [
      ['#0f172a', '#312e81', '#ec4899', '#f43f5e', '#fbbf24'],
      ['#0a0a1a', '#1e1b4b', '#3b82f6', '#60a5fa', '#fed7aa'],
      ['#18181b', '#3f3f46', '#e11d48', '#fda4af', '#fff1f2'],
    ],
  },
  {
    id: 'moda',
    label: 'Moda, Sneakers & Joias',
    icon: '👟',
    defaultPrompt: 'Tênis sneaker de luxo com detalhes futuristas, acabamento cromado e iluminação dramática de passarela',
    defaultStyle: 'Cinematográfico 35mm',
    palettes: [
      ['#09090b', '#18181b', '#d97706', '#fbbf24', '#fafafa'],
      ['#020617', '#0f172a', '#a855f7', '#c084fc', '#ffffff'],
    ],
  },
  {
    id: 'musica',
    label: 'Música & Instrumentos',
    icon: '🎸',
    defaultPrompt: 'Guitarra elétrica vintage em palco com fumaça atmosférica, holofotes dourados e ondas de som pulsantes',
    defaultStyle: 'Cinematográfico 35mm',
    palettes: [
      ['#0a0806', '#1c140c', '#f59e0b', '#ea580c', '#ffffff'],
      ['#030712', '#1e1b4b', '#8b5cf6', '#06b6d4', '#f5f3ff'],
    ],
  },
  {
    id: 'veiculos',
    label: 'Aviação & Náutica',
    icon: '✈️',
    defaultPrompt: 'Caça supersônico rasgando nuvens douradas no pôr do sol com rastro de condensação supersônico',
    defaultStyle: 'Cinematográfico 35mm',
    palettes: [
      ['#030d1a', '#0a2540', '#f59e0b', '#38bdf8', '#ffffff'],
      ['#0a0a12', '#1a1a2e', '#e11d48', '#fb7185', '#ffffff'],
    ],
  },
  {
    id: 'jogos',
    label: 'Games & 3D Fantasy',
    icon: '🎮',
    defaultPrompt: 'Portal dimensional místico com cristais flutuantes brilhando e ilhas levitando em céu crepuscular',
    defaultStyle: 'Fantasia Épica',
    palettes: [
      ['#0a0218', '#200742', '#a855f7', '#06b6d4', '#fdf4ff'],
      ['#030712', '#064e3b', '#10b981', '#38bdf8', '#ffffff'],
    ],
  },
  {
    id: 'fantasia',
    label: 'Magia & Criaturas',
    icon: '🔮',
    defaultPrompt: 'Castelo flutuante sobre ilhas místicas com cachoeiras estelares e runas arcanas',
    defaultStyle: 'Fantasia Épica',
    palettes: [
      ['#0f051d', '#2e1065', '#9333ea', '#c084fc', '#fae8ff'],
      ['#04151f', '#0c3547', '#06b6d4', '#67e8f9', '#ecfeff'],
    ],
  },
  {
    id: 'arquitetura',
    label: 'Arquitetura & Design',
    icon: '🏛️',
    defaultPrompt: 'Mansão contemporânea minimalista de vidro com piscina infinita e iluminação quente',
    defaultStyle: 'Cinematográfico 35mm',
    palettes: [
      ['#0c0a09', '#1c1917', '#78716c', '#d6d3d1', '#f5f5f4'],
      ['#09090b', '#18181b', '#d97706', '#f59e0b', '#fef3c7'],
    ],
  },
  {
    id: 'amoled',
    label: 'Dark AMOLED 9:16',
    icon: '🖤',
    defaultPrompt: 'Wallpaper minimalista dark AMOLED com geometria fluida e linhas de néon sobre preto puro',
    defaultStyle: 'Minimalista 3D',
    palettes: [
      ['#000000', '#050508', '#00f0ff', '#38bdf8', '#ffffff'],
      ['#000000', '#08020a', '#ff007f', '#f43f5e', '#ffffff'],
      ['#000000', '#030805', '#10b981', '#34d399', '#ffffff'],
      ['#000000', '#0a0802', '#f59e0b', '#fbbf24', '#ffffff'],
    ],
  },
  {
    id: 'abstrato',
    label: 'Arte Abstrata & 3D',
    icon: '🌀',
    defaultPrompt: 'Escultura líquida tridimensional em levitação com refração de luz cromada e gradientes prismáticos',
    defaultStyle: 'Arte Digital Conceitual',
    palettes: [
      ['#030712', '#1e1b4b', '#ec4899', '#38bdf8', '#fdf2f8'],
      ['#0a0a0f', '#181829', '#f59e0b', '#a855f7', '#ffffff'],
    ],
  },
  {
    id: 'fotorrealismo',
    label: 'Fotorrealismo 8K',
    icon: '📸',
    defaultPrompt: 'Cena fotográfica hiper-realista com profundidade de campo f/1.4 e textura cristalina',
    defaultStyle: 'Fotorrealismo 8K',
    palettes: [
      ['#09090b', '#18181b', '#71717a', '#e4e4e7', '#fafafa'],
      ['#020617', '#0f172a', '#0284c7', '#38bdf8', '#f8fafc'],
    ],
  },
];

// Detect theme from text
export function detectThemeFromPrompt(text: string, style: string): ImageCategoryTheme {
  const combined = `${text} ${style}`.toLowerCase();

  // Comidas & Bebidas
  if (
    combined.includes('comida') ||
    combined.includes('hamburguer') ||
    combined.includes('hambúrguer') ||
    combined.includes('pizza') ||
    combined.includes('sushi') ||
    combined.includes('lanche') ||
    combined.includes('doce') ||
    combined.includes('sobremesa') ||
    combined.includes('bolo') ||
    combined.includes('cafe') ||
    combined.includes('café') ||
    combined.includes('bebida') ||
    combined.includes('chocolate') ||
    combined.includes('coquetel') ||
    combined.includes('prato') ||
    combined.includes('gourmet') ||
    combined.includes('culinaria') ||
    combined.includes('culinária') ||
    combined.includes('fruta')
  ) {
    return 'comidas';
  }

  // Robôs & Tecnologia
  if (
    combined.includes('robo') ||
    combined.includes('robô') ||
    combined.includes('robot') ||
    combined.includes('mecha') ||
    combined.includes('androide') ||
    combined.includes('android') ||
    combined.includes('ciborgue') ||
    combined.includes('cyborg') ||
    combined.includes('inteligencia artificial') ||
    combined.includes('ia') ||
    combined.includes('exoesqueleto')
  ) {
    return 'robos';
  }

  // Flores & Botânica
  if (
    combined.includes('flor') ||
    combined.includes('flores') ||
    combined.includes('rosa') ||
    combined.includes('rosas') ||
    combined.includes('orquidea') ||
    combined.includes('orquídea') ||
    combined.includes('jardim') ||
    combined.includes('botanica') ||
    combined.includes('botânica') ||
    combined.includes('petala') ||
    combined.includes('pétala') ||
    combined.includes('lotus') ||
    combined.includes('lótus') ||
    combined.includes('girassol')
  ) {
    return 'flores';
  }

  // Moda, Sneakers & Joias
  if (
    combined.includes('sneaker') ||
    combined.includes('tenis') ||
    combined.includes('tênis') ||
    combined.includes('sapato') ||
    combined.includes('relogio') ||
    combined.includes('relógio') ||
    combined.includes('joia') ||
    combined.includes('moda') ||
    combined.includes('roupa') ||
    combined.includes('streetwear') ||
    combined.includes('anel') ||
    combined.includes('colar') ||
    combined.includes('bolsa') ||
    combined.includes('perfume')
  ) {
    return 'moda';
  }

  // Música & Instrumentos
  if (
    combined.includes('musica') ||
    combined.includes('música') ||
    combined.includes('guitarra') ||
    combined.includes('violao') ||
    combined.includes('violão') ||
    combined.includes('piano') ||
    combined.includes('sintetizador') ||
    combined.includes('bateria') ||
    combined.includes('fone') ||
    combined.includes('show') ||
    combined.includes('palco') ||
    combined.includes('microfone') ||
    combined.includes('dj') ||
    combined.includes('som')
  ) {
    return 'musica';
  }

  // Aviação & Náutica
  if (
    combined.includes('aviao') ||
    combined.includes('avião') ||
    combined.includes('jato') ||
    combined.includes('helicoptero') ||
    combined.includes('helicóptero') ||
    combined.includes('barco') ||
    combined.includes('iate') ||
    combined.includes('navio') ||
    combined.includes('submarino') ||
    combined.includes('vela')
  ) {
    return 'veiculos';
  }

  // Games & 3D
  if (
    combined.includes('jogo') ||
    combined.includes('game') ||
    combined.includes('gamer') ||
    combined.includes('rpg') ||
    combined.includes('pixel') ||
    combined.includes('portal') ||
    combined.includes('masmorra') ||
    combined.includes('dungeon')
  ) {
    return 'jogos';
  }

  // Carros
  if (
    combined.includes('carro') ||
    combined.includes('car') ||
    combined.includes('supercar') ||
    combined.includes('ferrari') ||
    combined.includes('lamborghini') ||
    combined.includes('porsche') ||
    combined.includes('veiculo') ||
    combined.includes('moto') ||
    combined.includes('corrida')
  ) {
    return 'carros';
  }

  // Animais
  if (
    combined.includes('lobo') ||
    combined.includes('leao') ||
    combined.includes('leão') ||
    combined.includes('tigre') ||
    combined.includes('animal') ||
    combined.includes('pet') ||
    combined.includes('gato') ||
    combined.includes('cachorro') ||
    combined.includes('cao') ||
    combined.includes('cão') ||
    combined.includes('dragao') ||
    combined.includes('dragão') ||
    combined.includes('passaro') ||
    combined.includes('pássaro') ||
    combined.includes('aguia') ||
    combined.includes('águia') ||
    combined.includes('cavalo') ||
    combined.includes('urso') ||
    combined.includes('tubarao') ||
    combined.includes('tubarão') ||
    combined.includes('fera')
  ) {
    return 'animais';
  }

  // Retratos / Pessoas
  if (
    combined.includes('mulher') ||
    combined.includes('homem') ||
    combined.includes('retrato') ||
    combined.includes('portrait') ||
    combined.includes('pessoa') ||
    combined.includes('garota') ||
    combined.includes('garoto') ||
    combined.includes('modelo') ||
    combined.includes('guerreira') ||
    combined.includes('guerreiro') ||
    combined.includes('rosto') ||
    combined.includes('face')
  ) {
    return 'retratos';
  }

  // Espaço
  if (
    combined.includes('espaço') ||
    combined.includes('espaco') ||
    combined.includes('galaxia') ||
    combined.includes('galáxia') ||
    combined.includes('planeta') ||
    combined.includes('cosmos') ||
    combined.includes('universo') ||
    combined.includes('nebulosa') ||
    combined.includes('astronauta') ||
    combined.includes('space')
  ) {
    return 'espaco';
  }

  // Natureza
  if (
    combined.includes('natureza') ||
    combined.includes('floresta') ||
    combined.includes('praia') ||
    combined.includes('montanha') ||
    combined.includes('mar') ||
    combined.includes('oceano') ||
    combined.includes('arvore') ||
    combined.includes('árvore') ||
    combined.includes('rio') ||
    combined.includes('paisagem')
  ) {
    return 'natureza';
  }

  // Cyberpunk
  if (
    combined.includes('cyber') ||
    combined.includes('neon') ||
    combined.includes('futur') ||
    combined.includes('sci-fi') ||
    combined.includes('holograma') ||
    combined.includes('tokyo')
  ) {
    return 'cyberpunk';
  }

  // Anime
  if (
    combined.includes('anime') ||
    combined.includes('manga') ||
    combined.includes('mangá') ||
    combined.includes('otaku') ||
    combined.includes('desenho') ||
    combined.includes('ghibli') ||
    combined.includes('samurai')
  ) {
    return 'anime';
  }

  // AMOLED
  if (
    combined.includes('amoled') ||
    combined.includes('oled') ||
    combined.includes('preto puro') ||
    combined.includes('dark wallpaper') ||
    combined.includes('minimalist neon')
  ) {
    return 'amoled';
  }

  // Fantasia
  if (
    combined.includes('fantasia') ||
    combined.includes('magia') ||
    combined.includes('castelo') ||
    combined.includes('mágico') ||
    combined.includes('runa') ||
    combined.includes('encantado') ||
    combined.includes('elfo') ||
    combined.includes('feiticeir')
  ) {
    return 'fantasia';
  }

  // Arquitetura
  if (
    combined.includes('arquitetura') ||
    combined.includes('mansao') ||
    combined.includes('mansão') ||
    combined.includes('predio') ||
    combined.includes('prédio') ||
    combined.includes('interior') ||
    combined.includes('design de interiores') ||
    combined.includes('casa')
  ) {
    return 'arquitetura';
  }

  // Abstrato
  if (
    combined.includes('abstrato') ||
    combined.includes('fluido') ||
    combined.includes('geometria') ||
    combined.includes('liquido') ||
    combined.includes('líquido') ||
    combined.includes('escultura 3d')
  ) {
    return 'abstrato';
  }

  // Fotorrealismo
  if (
    combined.includes('foto') ||
    combined.includes('realista') ||
    combined.includes('8k') ||
    combined.includes('fotorrealismo')
  ) {
    return 'fotorrealismo';
  }

  return 'todos';
}

// Creative inspirations list for quick randomizer button across all genres
export const DIVERSE_INSPIRATIONS: { prompt: string; style: string; theme: ImageCategoryTheme }[] = [
  {
    prompt: 'Cachorro golden retriever astronauta flutuando em gravidade zero na órbita da Terra com estrelas',
    style: 'Fotorrealismo 8K',
    theme: 'animais',
  },
  {
    prompt: 'Hambúrguer gourmet artesanal suculento com queijo brie derretido, cebola caramelizada e fumaça quente',
    style: 'Fotorrealismo 8K',
    theme: 'comidas',
  },
  {
    prompt: 'Supercarro esportivo elétrico hiper-aerodinâmico acelerando sob chuva em pista iluminada por néon',
    style: 'Cinematográfico 35mm',
    theme: 'carros',
  },
  {
    prompt: 'Retrato cinematográfico de guerreira samurai futurista com iluminação de borda e olhar determinado',
    style: 'Cinematográfico 35mm',
    theme: 'retratos',
  },
  {
    prompt: 'Mecha gigante protetor no topo da colina com iluminação bioluminescente e armadura desgastada',
    style: 'Cyberpunk 2099',
    theme: 'robos',
  },
  {
    prompt: 'Flor de lótus de cristal mística flutuando em lago sagrado sob chuva de meteoros e luz lunar',
    style: 'Fantasia Épica',
    theme: 'flores',
  },
  {
    prompt: 'Planeta anelado colossal visto da superfície de uma lua gelada com auroras cósmicas púrpuras',
    style: 'Arte Digital Conceitual',
    theme: 'espaco',
  },
  {
    prompt: 'Floresta mágica tropical com cogumelos bioluminescentes brilhando e cachoeira esmeralda',
    style: 'Fotorrealismo 8K',
    theme: 'natureza',
  },
  {
    prompt: 'Tênis sneaker futurista translúcido com amortecimento de plasma brilhante e solado em levitação',
    style: 'Minimalista 3D',
    theme: 'moda',
  },
  {
    prompt: 'Guitarra elétrica em chamas estilizadas azuis sobre palco escuro com amplificador e cabos néon',
    style: 'Cinematográfico 35mm',
    theme: 'musica',
  },
  {
    prompt: 'Caça supersônico furtivo cortando nuvens densas ao pôr do sol dourado com reflexos metálicos',
    style: 'Cinematográfico 35mm',
    theme: 'veiculos',
  },
  {
    prompt: 'Castelo medieval flutuante envolto em névoa etérea com pontes de corda e dragões voando ao longe',
    style: 'Fantasia Épica',
    theme: 'fantasia',
  },
  {
    prompt: 'Mansão contemporânea minimalista de vidro debruçada sobre penhasco no mar ao crepúsculo',
    style: 'Cinematográfico 35mm',
    theme: 'arquitetura',
  },
  {
    prompt: 'Gato filhote curioso espiando de dentro de uma caneca de café com detalhes ultra nítidos',
    style: 'Fotorrealismo 8K',
    theme: 'animais',
  },
  {
    prompt: 'Prato refinado de sushi contemporâneo com folhas de ouro, fumaça de gelo seco e flores comestíveis',
    style: 'Fotorrealismo 8K',
    theme: 'comidas',
  },
  {
    prompt: 'Escultura abstrata de metal líquido ondulante e orbes cromados levitando no vácuo',
    style: 'Minimalista 3D',
    theme: 'abstrato',
  },
  {
    prompt: 'Wallpaper AMOLED com geometria sagrada de linhas néon ciano e magenta sobre fundo preto absoluto',
    style: 'Minimalista 3D',
    theme: 'amoled',
  },
  {
    prompt: 'Personagem de anime com espada reluzente sob árvore de cerejeira em flor soprando ao vento',
    style: 'Anime Studio',
    theme: 'anime',
  },
  {
    prompt: 'Megacidade vertical cyberpunk sob tempestade com pontes aéreas e veículos voadores',
    style: 'Cyberpunk 2099',
    theme: 'cyberpunk',
  },
  {
    prompt: 'Relógio de luxo turbilhão esqueleto com engrenagens douradas visíveis e cristal de safira',
    style: 'Fotorrealismo 8K',
    theme: 'moda',
  },
];

const SHOT_ANGLES_9_16 = [
  'Enquadramento vertical cinematográfico em plano de corpo inteiro',
  'Composição vertical ultra-wide contra-plongée dramática',
  'Perspectiva vertical imersiva para Stories e Reels',
  'Plano fechado vertical com profundidade de campo f/1.4',
  'Visão monumental de baixo para cima destacando imponência',
  'Composição vertical simétrica com linhas guia convergentes',
  'Plano americano vertical com luz de recorte dourada',
  'Corte dinâmico vertical com atmosfera envolvente',
  'Visão panorâmica vertical do ápice ao reflexo no solo',
  'Wallpaper vertical imersivo para tela de smartphone OLED',
];

const LIGHT_EFFECTS_9_16 = [
  'Luz volumétrica e névoa atmosférica densa',
  'Iluminação dourada de pôr do sol cinematográfico rasgando o horizonte',
  'Feixes de neon bioluminescente e reflexos úmidos verticais',
  'Luar prateado etéreo com estrelas cintilantes',
  'Iluminação de estúdio profissional com luz de preenchimento e rim light',
  'Brilho holográfico iridescente com reflexos prismáticos',
  'Contraste dramático chiaroscuro com sombras marcantes',
  'Cores vibrantes de hora azul com iluminação ambiente sutil',
  'Raios solares matinais atravessando partículas no ar',
  'Gradiente crepuscular púrpura, magenta e âmbar',
];

const MOODS_LIST = [
  'Atmosfera misteriosa e eletrizante',
  'Sensação épica e transcendental',
  'Vibração serena e contemplativa',
  'Energia futurista de alta velocidade',
  'Elegância minimalista de luxo',
  'Estética nostálgica retrô cinematográfica',
  'Magia cósmica hiper-detalhada',
  'Hiper-realismo fotográfico contemporâneo',
];

export function generateInstantPrompts(
  seedPrompt: string,
  style: string,
  count = 50
): PromptItem[] {
  const base = seedPrompt.trim() || 'Cena vertical estilizada em alta definição';
  const detectedTheme = detectThemeFromPrompt(base, style);
  const matchedTheme = IMAGE_THEMES.find((t) => t.id === detectedTheme) || IMAGE_THEMES[0];
  const list: PromptItem[] = [];

  for (let i = 1; i <= count; i++) {
    const angle = SHOT_ANGLES_9_16[(i - 1) % SHOT_ANGLES_9_16.length];
    const light = LIGHT_EFFECTS_9_16[(i - 1) % LIGHT_EFFECTS_9_16.length];
    const mood = MOODS_LIST[(i - 1) % MOODS_LIST.length];

    list.push({
      id: i,
      title: `${matchedTheme.label.split(' ')[0]} #${String(i).padStart(2, '0')}`,
      prompt: `${base}, composição vertical 9:16 estilo ${style}. ${angle}, ${light}, ${mood}. Resolução cristalina, estética refinada sem ruídos, enquadramento perfeito para tela vertical de smartphone 9:16.`,
      category: matchedTheme.label,
      tags: [style, '9:16 Vertical', matchedTheme.label.split(' ')[0], `Foto #${i}`],
      mood: mood.split(' ')[1] || 'Vibrante',
    });
  }

  return list;
}
