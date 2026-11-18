/* ==========================================================================
   RP Locações — Catálogo de produtos e configurações do negócio
   --------------------------------------------------------------------------
   ✏️  ESTE É O ARQUIVO PARA EDITAR PREÇOS, TEXTOS E FOTOS.

   Como trocar o placeholder por uma foto real:
     1. Salve a foto em  img/produtos/  (ex.: img/produtos/cadeira.jpg)
        → ideal: 800x600 px (proporção 4:3), .jpg ou .webp, até ~200 KB.
     2. Preencha o campo  image  do produto abaixo:
          image: 'img/produtos/cadeira.jpg',
     3. Pronto. Enquanto  image  estiver vazio (''), o site mostra
        automaticamente uma ilustração placeholder.
   ========================================================================== */

/** Dados de contato e regras gerais. */
var RP_CONFIG = {
  businessName: 'RP Locações',
  whatsappNumber: '5579991788586',          // formato internacional, só números
  whatsappDisplay: '(79) 99178-8586',
  city: 'Barra dos Coqueiros - SE',
  yearsInMarket: 5,

  // Regra promocional do Jogo de mesa
  promo: {
    productId: 'jogo-de-mesa',
    minQty: 6,
    label: 'Mín. 6 jogos para este valor',
  },

  // Cidades exibidas no formulário do carrinho
  serviceAreas: ['Barra dos Coqueiros', 'Aracaju', 'Nossa Senhora do Socorro', 'Santo Amaro das Brotas', 'Outra cidade'],

  // Chaves usadas no localStorage (mudar = "zerar" carrinhos salvos)
  storage: {
    cart: 'rp-locacoes:carrinho:v1',
    customer: 'rp-locacoes:cliente:v1',
  },
};

/** Categorias usadas nos filtros do catálogo. */
var RP_CATEGORIES = [
  { id: 'todos',   label: 'Todos' },
  { id: 'jogos',   label: 'Jogos' },
  { id: 'avulsos', label: 'Avulsos' },
  { id: 'toalhas', label: 'Toalhas' },
];

/**
 * Produtos.
 *  id           → identificador único (não mude depois de publicado: é usado no carrinho salvo)
 *  category     → 'jogos' | 'avulsos' | 'toalhas'
 *  price        → preço por unidade, em reais (número)
 *  image        → caminho da foto real ('' = usa placeholder ilustrado)
 *  art          → desenho do placeholder: 'jogo' | 'mesa' | 'cadeira' | 'tampao' | 'toalha-mesa' | 'toalha-tampao'
 *  includes     → (opcional) o que vem no item
 *  rule         → (opcional) aviso de regra/condição exibido no card
 */
var RP_PRODUCTS = [
  {
    id: 'jogo-de-mesa',
    name: 'Jogo de mesa',
    category: 'jogos',
    price: 10.0,
    unit: 'jogo',
    description: 'Conjunto completo para acomodar seus convidados com conforto.',
    includes: '1 mesa + 4 cadeiras', // ← confirme a composição do jogo
    rule: RP_CONFIG.promo.label,
    featured: true,
    image: '', // ex.: 'img/produtos/jogo-de-mesa.jpg'
    art: 'jogo',
  },
  {
    id: 'mesa-avulsa',
    name: 'Mesa avulsa',
    category: 'avulsos',
    price: 5.0,
    unit: 'mesa',
    description: 'Mesa para montar sua estrutura.',
    image: '', // ex.: 'img/produtos/mesa-avulsa.jpg'
    art: 'mesa',
  },
  {
    id: 'cadeira',
    name: 'Cadeira',
    category: 'avulsos',
    price: 3.0,
    unit: 'cadeira',
    description: 'Cadeira plástica para eventos.',
    image: '', // ex.: 'img/produtos/cadeira.jpg'
    art: 'cadeira',
  },
  {
    id: 'tampao',
    name: 'Tampão',
    category: 'avulsos',
    price: 7.0,
    unit: 'tampão',
    description: 'Tampão para mesa de evento.',
    image: '', // ex.: 'img/produtos/tampao.jpg'
    art: 'tampao',
  },
  {
    id: 'toalha-de-mesa',
    name: 'Toalha de mesa',
    category: 'toalhas',
    price: 6.0,
    unit: 'toalha',
    description: 'Toalha para mesa.',
    image: '', // ex.: 'img/produtos/toalha-de-mesa.jpg'
    art: 'toalha-mesa',
  },
  {
    id: 'toalha-de-tampao',
    name: 'Toalha de tampão',
    category: 'toalhas',
    price: 7.0,
    unit: 'toalha',
    description: 'Toalha para tampão.',
    image: '', // ex.: 'img/produtos/toalha-de-tampao.jpg'
    art: 'toalha-tampao',
  },
];

/**
 * Parâmetros da Calculadora de Eventos (calculadora.html).
 *  seatedShare → % dos convidados que precisam de lugar sentado
 *  guestsPerTampao → 1 tampão (buffet/bolo/apoio) a cada N convidados
 */
var RP_CALC = {
  peoplePerJogo: 4,
  minGuests: 10,
  maxGuests: 300,
  eventTypes: {
    informal:        { label: 'Festa informal',        seatedShare: 0.7,  guestsPerTampao: 60, hint: 'Parte dos convidados circula em pé.' },
    sentado:         { label: 'Jantar / Almoço sentado', seatedShare: 1.0,  guestsPerTampao: 50, hint: 'Lugar à mesa para todos.' },
    confraternizacao:{ label: 'Confraternização',      seatedShare: 0.85, guestsPerTampao: 60, hint: 'Maioria sentada, com circulação.' },
  },
};
