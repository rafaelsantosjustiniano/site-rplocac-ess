/* ==========================================================================
   RP Locações — Carrinho compartilhado (todas as páginas)
   --------------------------------------------------------------------------
   • Estado do carrinho e dados do cliente salvos no localStorage
   • Contador do cabeçalho, gaveta lateral (drawer), toasts,
     barra inferior do celular e botão flutuante do WhatsApp
   • Ícones SVG (estilo Lucide) e ilustrações placeholder dos produtos
   Depende de: js/products.js (carregado antes).
   ========================================================================== */
(function () {
  'use strict';

  var RP = (window.RP = window.RP || {});
  document.documentElement.classList.add('js'); // habilita animações de entrada só com JS ativo
  var MAX_QTY = 999;

  /* ------------------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------------------ */
  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  RP.fmt = function (value) { return brl.format(value || 0); };

  RP.esc = function (str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  RP.clampQty = function (n, min) {
    n = parseInt(n, 10);
    if (isNaN(n)) n = min == null ? 0 : min;
    return Math.max(min == null ? 0 : min, Math.min(MAX_QTY, n));
  };

  RP.plural = function (n, one, many) { return n + ' ' + (n === 1 ? one : many); };

  RP.getProduct = function (id) {
    for (var i = 0; i < RP_PRODUCTS.length; i++) if (RP_PRODUCTS[i].id === id) return RP_PRODUCTS[i];
    return null;
  };

  RP.categoryLabel = function (id) {
    for (var i = 0; i < RP_CATEGORIES.length; i++) if (RP_CATEGORIES[i].id === id) return RP_CATEGORIES[i].label;
    return id;
  };

  RP.waLink = function (message) {
    var base = 'https://wa.me/' + RP_CONFIG.whatsappNumber;
    return message ? base + '?text=' + encodeURIComponent(message) : base;
  };

  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* modo privado / bloqueado */ }
  }

  /* ------------------------------------------------------------------------
     Ícones (traço estilo Lucide, 24x24)
     ------------------------------------------------------------------------ */
  var ICONS = {
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    party: '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    calculator: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M16 14v4"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
    card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
    cash: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    note: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    chair: '<path d="M7 3h10v9H7z"/><path d="M5 12h14l-1 3H6z"/><path d="m7 15-1 6"/><path d="m17 15 1 6"/>',
    table: '<path d="M3 8h18"/><path d="M4 8v2h16V8"/><path d="m6 10-1 10"/><path d="m18 10 1 10"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    glass: '<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>',
  };

  var WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z';

  RP.icon = function (name, extraClass) {
    var cls = 'icon' + (extraClass ? ' ' + extraClass : '');
    if (name === 'whatsapp') {
      return '<svg class="' + cls + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + WA_PATH + '"/></svg>';
    }
    var body = ICONS[name] || ICONS.info;
    return '<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  };

  /** Troca <i data-icon="nome"></i> pelo SVG correspondente. */
  RP.hydrateIcons = function (root) {
    var nodes = (root || document).querySelectorAll('i[data-icon]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var tmp = document.createElement('span');
      tmp.innerHTML = RP.icon(el.getAttribute('data-icon'), el.className);
      el.parentNode.replaceChild(tmp.firstChild, el);
    }
  };

  /* ------------------------------------------------------------------------
     Ilustrações placeholder (trocar por foto real em js/products.js → image)
     ------------------------------------------------------------------------ */
  var F = 'fill="currentColor" fill-opacity=".14"';
  var ART = {
    jogo:
      '<ellipse cx="100" cy="124" rx="86" ry="6" fill="currentColor" fill-opacity=".1" stroke="none"/>' +
      // cadeira esquerda
      '<path d="M28 36 L33 88" stroke-width="7"/><path d="M33 88 H60" stroke-width="6"/><path d="M34 90 L30 122 M58 90 L61 122"/>' +
      // cadeira direita
      '<path d="M172 36 L167 88" stroke-width="7"/><path d="M167 88 H140" stroke-width="6"/><path d="M166 90 L170 122 M142 90 L139 122"/>' +
      // mesa
      '<rect x="56" y="66" width="88" height="9" rx="3" ' + F + '/><path d="M66 75 L63 122 M134 75 L137 122"/>' +
      // arranjo
      '<path d="M94 66 v-8 h12 v8" ' + F + '/><circle cx="96" cy="50" r="5" ' + F + '/><circle cx="104" cy="48" r="5" ' + F + '/><circle cx="100" cy="42" r="5" ' + F + '/>',
    mesa:
      '<ellipse cx="100" cy="124" rx="70" ry="6" fill="currentColor" fill-opacity=".1" stroke="none"/>' +
      '<path d="M38 52 H162 L152 66 H48 Z" ' + F + '/><path d="M54 66 L46 122 M146 66 L154 122 M76 66 L78 112 M124 66 L122 112"/>' +
      '<path d="M60 92 H140" stroke-opacity=".5"/>',
    cadeira:
      '<ellipse cx="100" cy="126" rx="56" ry="5" fill="currentColor" fill-opacity=".1" stroke="none"/>' +
      '<rect x="68" y="14" width="64" height="56" rx="12" ' + F + '/><path d="M80 30 H120 M80 42 H120 M80 54 H120" stroke-opacity=".55"/>' +
      '<path d="M62 76 H138 L144 90 H56 Z" ' + F + '/>' +
      '<path d="M64 90 L56 124 M136 90 L144 124 M80 90 L84 116 M120 90 L116 116"/>',
    tampao:
      '<ellipse cx="100" cy="124" rx="92" ry="6" fill="currentColor" fill-opacity=".1" stroke="none"/>' +
      '<rect x="12" y="58" width="176" height="11" rx="3" ' + F + '/>' +
      '<path d="M34 69 L58 122 M58 69 L34 122 M142 69 L166 122 M166 69 L142 122"/><path d="M40 96 H52 M148 96 H160" stroke-opacity=".5"/>',
    'toalha-mesa':
      '<ellipse cx="100" cy="126" rx="70" ry="5" fill="currentColor" fill-opacity=".1" stroke="none"/>' +
      '<path d="M50 46 H150 L160 104 Q150 98 140 104 Q130 110 120 104 Q110 98 100 104 Q90 110 80 104 Q70 98 60 104 Q50 110 40 104 Z" ' + F + '/>' +
      '<path d="M50 46 L40 104 M150 46 L160 104" stroke-opacity="0"/><path d="M75 52 L70 100 M100 52 V102 M125 52 L130 100" stroke-opacity=".35" stroke-dasharray="4 6"/>' +
      '<path d="M62 108 L60 124 M138 108 L140 124"/>',
    'toalha-tampao':
      '<ellipse cx="100" cy="126" rx="94" ry="5" fill="currentColor" fill-opacity=".1" stroke="none"/>' +
      '<path d="M18 50 H182 L190 100 Q178 94 166 100 Q154 106 142 100 Q130 94 118 100 Q106 106 94 100 Q82 94 70 100 Q58 106 46 100 Q34 94 22 100 Q14 104 10 100 Z" ' + F + '/>' +
      '<path d="M46 56 V96 M82 56 V98 M118 56 V96 M154 56 V98" stroke-opacity=".35" stroke-dasharray="4 6"/>' +
      '<path d="M40 104 L36 124 M160 104 L164 124"/>',
  };

  RP.artSVG = function (name) {
    return '<svg class="ph-art" viewBox="0 0 200 135" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ART[name] || ART.mesa) + '</svg>';
  };

  /**
   * Mídia do produto: foto real (se definida em products.js) sobre um placeholder.
   * Se a foto falhar ao carregar, o placeholder continua visível.
   */
  RP.mediaHTML = function (p) {
    var html = '<div class="ph ph-' + p.category + '">' + RP.artSVG(p.art) + '<span class="ph-label">Foto ilustrativa</span></div>';
    if (p.image) {
      html += '<img src="' + RP.esc(p.image) + '" alt="' + RP.esc(p.name) + '" loading="lazy" style="position:absolute;inset:0" onerror="this.remove()">';
    }
    return html;
  };

  RP.qtyHTML = function (value, opts) {
    opts = opts || {};
    var min = opts.min == null ? 0 : opts.min;
    return (
      '<div class="qty' + (opts.small ? ' qty-sm' : '') + '" data-qty' + (opts.id ? ' data-id="' + opts.id + '"' : '') + ' data-min="' + min + '">' +
      '<button type="button" class="qty-btn" data-qty-step="-1" aria-label="Diminuir quantidade"' + (value <= min ? ' disabled' : '') + '>' + RP.icon('minus') + '</button>' +
      '<input type="number" inputmode="numeric" min="' + min + '" max="' + MAX_QTY + '" value="' + value + '" aria-label="Quantidade' + (opts.label ? ' de ' + RP.esc(opts.label) : '') + '">' +
      '<button type="button" class="qty-btn" data-qty-step="1" aria-label="Aumentar quantidade"' + (value >= MAX_QTY ? ' disabled' : '') + '>' + RP.icon('plus') + '</button>' +
      '</div>'
    );
  };

  /* ------------------------------------------------------------------------
     Store do carrinho (localStorage)
     Formato salvo: [{ id: 'cadeira', qty: 10 }, ...]
     ------------------------------------------------------------------------ */
  function loadItems() {
    var raw = readJSON(RP_CONFIG.storage.cart, []);
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (it) { return it && RP.getProduct(it.id) && it.qty > 0; })
      .map(function (it) { return { id: it.id, qty: RP.clampQty(it.qty, 1) }; });
  }

  var items = loadItems();

  function emit(reason, id) {
    document.dispatchEvent(new CustomEvent('rp:cart', { detail: { reason: reason, id: id } }));
  }
  function persist(reason, id) {
    writeJSON(RP_CONFIG.storage.cart, items);
    emit(reason, id);
  }
  function indexOf(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return i;
    return -1;
  }

  RP.cart = {
    items: function () { return items.slice(); },
    qty: function (id) { var i = indexOf(id); return i < 0 ? 0 : items[i].qty; },
    count: function () { return items.reduce(function (s, it) { return s + it.qty; }, 0); },
    lines: function () { return items.length; },
    detailed: function () {
      return items.map(function (it) {
        var p = RP.getProduct(it.id);
        return { product: p, qty: it.qty, subtotal: p.price * it.qty };
      });
    },
    total: function () {
      return items.reduce(function (s, it) { return s + RP.getProduct(it.id).price * it.qty; }, 0);
    },
    add: function (id, qty) {
      qty = RP.clampQty(qty, 1);
      if (!RP.getProduct(id)) return;
      var i = indexOf(id);
      if (i < 0) items.push({ id: id, qty: qty });
      else items[i].qty = RP.clampQty(items[i].qty + qty, 1);
      persist('add', id);
    },
    set: function (id, qty) {
      qty = RP.clampQty(qty, 0);
      var i = indexOf(id);
      if (qty === 0) { if (i >= 0) { items.splice(i, 1); persist('remove', id); } return; }
      if (i < 0) items.push({ id: id, qty: qty });
      else if (items[i].qty === qty) return;
      else items[i].qty = qty;
      persist('set', id);
    },
    remove: function (id) { var i = indexOf(id); if (i >= 0) { items.splice(i, 1); persist('remove', id); } },
    /** Adiciona vários itens de uma vez: [{id, qty}] */
    addMany: function (list) {
      list.forEach(function (it) {
        if (!it.qty || !RP.getProduct(it.id)) return;
        var i = indexOf(it.id);
        if (i < 0) items.push({ id: it.id, qty: RP.clampQty(it.qty, 1) });
        else items[i].qty = RP.clampQty(items[i].qty + it.qty, 1);
      });
      persist('addMany');
    },
    clear: function () { items = []; persist('clear'); },
    /** Situação da regra promocional do Jogo de mesa (null se não há jogos no carrinho). */
    promoStatus: function () {
      var q = RP.cart.qty(RP_CONFIG.promo.productId);
      if (!q) return null;
      var min = RP_CONFIG.promo.minQty;
      return { qty: q, min: min, ok: q >= min, missing: Math.max(0, min - q) };
    },
  };

  /* Dados do cliente (formulário do carrinho) */
  RP.customer = {
    load: function () { return readJSON(RP_CONFIG.storage.customer, {}) || {}; },
    save: function (data) { writeJSON(RP_CONFIG.storage.customer, data); },
  };

  /* Sincroniza entre abas abertas do navegador */
  window.addEventListener('storage', function (e) {
    if (e.key === RP_CONFIG.storage.cart) { items = loadItems(); emit('sync'); }
  });

  /** HTML do alerta da regra promocional (vazio se não se aplica). */
  RP.promoAlertHTML = function (compact) {
    var s = RP.cart.promoStatus();
    if (!s) return '';
    if (s.ok) {
      return '<div class="alert alert-ok" role="status">' + RP.icon('check-circle') +
        '<div><strong>Condição promocional garantida!</strong>' + (compact ? '' : 'Você tem ' + s.qty + ' jogos de mesa — o valor de ' + RP.fmt(RP.getProduct(RP_CONFIG.promo.productId).price) + ' por jogo se aplica.') + '</div></div>';
    }
    return '<div class="alert alert-warn" role="status">' + RP.icon('alert') +
      '<div><strong>Faltam ' + RP.plural(s.missing, 'jogo', 'jogos') + ' para a promoção</strong>' +
      'O valor de ' + RP.fmt(RP.getProduct(RP_CONFIG.promo.productId).price) + ' por jogo vale a partir de ' + s.min + ' jogos. Com ' + RP.plural(s.qty, 'jogo', 'jogos') + ', o valor final será confirmado no WhatsApp.' +
      '<br><button type="button" class="alert-action" data-promo-complete>' + RP.icon('plus') + 'Completar para ' + s.min + ' jogos</button></div></div>';
  };

  /* ------------------------------------------------------------------------
     Componentes compartilhados injetados em todas as páginas
     ------------------------------------------------------------------------ */
  var page = document.body.getAttribute('data-page') || '';

  function injectShell() {
    var shell = document.createElement('div');
    shell.innerHTML =
      // Gaveta lateral
      '<div class="drawer-overlay" data-drawer-close></div>' +
      '<aside class="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true">' +
        '<div class="drawer-head"><h2 id="drawer-title">' + RP.icon('cart') + 'Seu pedido <span class="pill" data-drawer-count>0</span></h2>' +
        '<button type="button" class="drawer-close" data-drawer-close aria-label="Fechar carrinho">' + RP.icon('x') + '</button></div>' +
        '<div class="drawer-body" data-drawer-body></div>' +
        '<div class="drawer-foot" data-drawer-foot></div>' +
      '</aside>' +
      // Toasts
      '<div class="toast-stack" aria-live="polite" aria-atomic="false" data-toasts></div>' +
      // Barra inferior (celular)
      '<div class="cartbar" data-cartbar aria-hidden="true">' +
        '<div class="cartbar-inner">' +
          '<button type="button" class="cartbar-info" data-cart-open aria-label="Abrir resumo do carrinho">' +
            '<span class="cb-ic">' + RP.icon('cart') + '<span class="cart-count has-items" data-cart-count>0</span></span>' +
            '<span><small data-cartbar-items>0 itens</small><strong data-cartbar-total>R$ 0,00</strong></span>' +
          '</button>' +
          '<a href="carrinho.html" class="btn btn-primary">Ver Carrinho ' + RP.icon('arrow') + '</a>' +
        '</div>' +
      '</div>' +
      // WhatsApp flutuante
      '<div class="wa-float"><span class="wa-tip">Dúvidas? Fale com a gente</span>' +
        '<a href="' + RP.waLink('Olá, RP Locações! Tenho uma dúvida sobre o aluguel de mesas e cadeiras.') + '" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">' + RP.icon('whatsapp') + '</a>' +
      '</div>';
    while (shell.firstChild) document.body.appendChild(shell.firstChild);
  }

  /* ---------- Contador do cabeçalho + barra inferior ---------- */
  var lastCount = null;
  function renderCounters() {
    var count = RP.cart.count();
    var nodes = document.querySelectorAll('[data-cart-count]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      el.textContent = count > 99 ? '99+' : count;
      el.classList.toggle('has-items', count > 0);
      if (lastCount !== null && count !== lastCount) {
        el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      }
    }
    lastCount = count;

    var openBtns = document.querySelectorAll('.cart-btn[data-cart-open]');
    for (var j = 0; j < openBtns.length; j++) {
      openBtns[j].setAttribute('aria-label', 'Abrir carrinho (' + RP.plural(count, 'item', 'itens') + ')');
    }

    var bar = document.querySelector('[data-cartbar]');
    var showBar = count > 0 && page !== 'carrinho';
    bar.classList.toggle('is-visible', showBar);
    bar.setAttribute('aria-hidden', showBar ? 'false' : 'true');
    document.body.classList.toggle('has-cartbar', showBar);
    document.querySelector('[data-cartbar-items]').textContent = RP.plural(count, 'item', 'itens') + ' no pedido';
    document.querySelector('[data-cartbar-total]').textContent = RP.fmt(RP.cart.total());
  }

  /* ---------- Gaveta (drawer) ---------- */
  var lastFocus = null;
  RP.drawer = {
    open: function () {
      lastFocus = document.activeElement;
      renderDrawer();
      document.querySelector('.drawer').classList.add('is-open');
      document.querySelector('.drawer').setAttribute('aria-hidden', 'false');
      document.querySelector('.drawer-overlay').classList.add('is-open');
      document.body.classList.add('no-scroll');
      setTimeout(function () { var c = document.querySelector('.drawer-close'); if (c) c.focus(); }, 50);
    },
    close: function () {
      var d = document.querySelector('.drawer');
      if (!d.classList.contains('is-open')) return;
      d.classList.remove('is-open');
      d.setAttribute('aria-hidden', 'true');
      document.querySelector('.drawer-overlay').classList.remove('is-open');
      document.body.classList.remove('no-scroll');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    },
    isOpen: function () { return document.querySelector('.drawer').classList.contains('is-open'); },
  };

  function renderDrawer() {
    var body = document.querySelector('[data-drawer-body]');
    var foot = document.querySelector('[data-drawer-foot]');
    var lines = RP.cart.detailed();
    document.querySelector('[data-drawer-count]').textContent = RP.cart.count();

    if (!lines.length) {
      body.innerHTML =
        '<div class="empty-state"><div class="es-ic">' + RP.icon('cart') + '</div><h3>Seu carrinho está vazio</h3>' +
        '<p>Escolha mesas, cadeiras e toalhas no catálogo ou use a calculadora para uma sugestão pronta.</p>' +
        '<a href="catalogo.html" class="btn btn-primary">Ver Catálogo</a></div>';
      foot.innerHTML = '<a href="calculadora.html" class="btn btn-outline btn-block">' + RP.icon('calculator') + 'Usar a Calculadora de Eventos</a>';
      return;
    }

    body.innerHTML = RP.promoAlertHTML(true) + lines.map(function (l) {
      return '<div class="drawer-item" data-line="' + l.product.id + '">' +
        '<div class="cart-thumb">' + RP.mediaHTML(l.product) + '</div>' +
        '<div><h3>' + RP.esc(l.product.name) + '</h3><div class="di-meta">' + RP.qtyHTML(l.qty, { id: l.product.id, small: true, label: l.product.name }) + '</div></div>' +
        '<div><div class="di-sub">' + RP.fmt(l.subtotal) + '</div>' +
        '<button type="button" class="icon-btn" data-remove="' + l.product.id + '" aria-label="Remover ' + RP.esc(l.product.name) + '">' + RP.icon('trash') + '</button></div>' +
        '</div>';
    }).join('');

    foot.innerHTML =
      '<div class="drawer-total"><span>Total estimado</span><strong>' + RP.fmt(RP.cart.total()) + '</strong></div>' +
      '<a href="carrinho.html" class="btn btn-primary btn-block">Ver pedido completo ' + RP.icon('arrow') + '</a>' +
      '<button type="button" class="btn btn-outline btn-block" data-drawer-close>Continuar escolhendo</button>';
  }

  /* ---------- Toasts ---------- */
  /**
   * RP.toast({ title, message, type: 'success'|'warn'|'info', action: { label, href } | { label, onClick }, duration })
   */
  RP.toast = function (opts) {
    var stack = document.querySelector('[data-toasts]');
    var type = opts.type || 'success';
    var duration = opts.duration || 3800;
    var iconName = type === 'warn' ? 'alert' : type === 'info' ? 'info' : 'check';

    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<span class="toast-ic">' + RP.icon(iconName) + '</span>' +
      '<div><div class="toast-title">' + RP.esc(opts.title) + '</div>' + (opts.message ? '<div class="toast-msg">' + RP.esc(opts.message) + '</div>' : '') + '</div>' +
      (opts.action ? (opts.action.href
        ? '<a class="toast-action" href="' + opts.action.href + '">' + RP.esc(opts.action.label) + '</a>'
        : '<button type="button" class="toast-action">' + RP.esc(opts.action.label) + '</button>') : '') +
      '<span class="toast-progress" style="animation-duration:' + duration + 'ms"></span>';

    if (opts.action && opts.action.onClick) {
      el.querySelector('button.toast-action').addEventListener('click', function () { opts.action.onClick(); dismiss(); });
    }

    // no máximo 3 toasts ao mesmo tempo
    while (stack.children.length >= 3) stack.removeChild(stack.firstChild);
    stack.appendChild(el);

    var timer = setTimeout(dismiss, duration);
    el.addEventListener('mouseenter', function () { clearTimeout(timer); el.querySelector('.toast-progress').style.animationPlayState = 'paused'; });
    el.addEventListener('mouseleave', function () { timer = setTimeout(dismiss, 1500); });

    function dismiss() {
      clearTimeout(timer);
      if (!el.parentNode) return;
      el.classList.add('is-leaving');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }
    return dismiss;
  };

  /** Toast padrão depois de adicionar produto. */
  RP.notifyAdded = function (product, qty) {
    RP.toast({
      title: qty + 'x ' + product.name + ' adicionado' + (qty > 1 ? 's' : ''),
      message: 'Total do pedido: ' + RP.fmt(RP.cart.total()),
      action: { label: 'Ver pedido', onClick: RP.drawer.open },
    });
    var s = RP.cart.promoStatus();
    if (product.id === RP_CONFIG.promo.productId && s && !s.ok) {
      setTimeout(function () {
        RP.toast({ type: 'warn', title: 'Faltam ' + RP.plural(s.missing, 'jogo', 'jogos'), message: 'R$ 10,00 por jogo vale a partir de ' + s.min + ' jogos.', duration: 5000 });
      }, 250);
    }
  };

  /* ------------------------------------------------------------------------
     Delegação de eventos (seletores de quantidade, drawer, remoção)
     ------------------------------------------------------------------------ */
  function stepQty(wrapper, delta) {
    var input = wrapper.querySelector('input');
    var min = parseInt(wrapper.getAttribute('data-min'), 10) || 0;
    var next = RP.clampQty((parseInt(input.value, 10) || 0) + delta, min);
    input.value = next;
    syncQtyButtons(wrapper);
    wrapper.dispatchEvent(new CustomEvent('qtychange', { bubbles: true, detail: { value: next } }));
  }
  function syncQtyButtons(wrapper) {
    var input = wrapper.querySelector('input');
    var min = parseInt(wrapper.getAttribute('data-min'), 10) || 0;
    var v = parseInt(input.value, 10) || 0;
    wrapper.querySelector('[data-qty-step="-1"]').disabled = v <= min;
    wrapper.querySelector('[data-qty-step="1"]').disabled = v >= MAX_QTY;
  }
  RP.syncQtyButtons = syncQtyButtons;

  document.addEventListener('click', function (e) {
    var t = e.target;

    var stepBtn = t.closest('[data-qty-step]');
    if (stepBtn) { stepQty(stepBtn.closest('[data-qty]'), parseInt(stepBtn.getAttribute('data-qty-step'), 10)); return; }

    if (t.closest('[data-cart-open]')) { e.preventDefault(); RP.drawer.open(); return; }
    if (t.closest('[data-drawer-close]')) { RP.drawer.close(); return; }

    var rm = t.closest('[data-remove]');
    if (rm) {
      var id = rm.getAttribute('data-remove');
      var p = RP.getProduct(id);
      var prevQty = RP.cart.qty(id);
      var row = rm.closest('[data-line]');
      var doRemove = function () {
        RP.cart.remove(id);
        RP.toast({ type: 'info', title: p.name + ' removido', action: { label: 'Desfazer', onClick: function () { RP.cart.add(id, prevQty); } } });
      };
      if (row) { row.classList.add('is-removing'); setTimeout(doRemove, 200); } else doRemove();
      return;
    }

    if (t.closest('[data-promo-complete]')) {
      var s = RP.cart.promoStatus();
      if (s && !s.ok) {
        RP.cart.set(RP_CONFIG.promo.productId, s.min);
        RP.toast({ title: 'Pronto! ' + s.min + ' jogos de mesa', message: 'Condição promocional aplicada ao pedido.' });
      }
    }
  });

  // Digitação direta no campo numérico
  document.addEventListener('change', function (e) {
    var wrapper = e.target.closest && e.target.closest('[data-qty]');
    if (!wrapper || e.target.tagName !== 'INPUT') return;
    var min = parseInt(wrapper.getAttribute('data-min'), 10) || 0;
    e.target.value = RP.clampQty(e.target.value, min);
    syncQtyButtons(wrapper);
    wrapper.dispatchEvent(new CustomEvent('qtychange', { bubbles: true, detail: { value: parseInt(e.target.value, 10) } }));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && RP.drawer.isOpen()) RP.drawer.close();
    // Enter no campo de quantidade confirma o valor (sem enviar formulários)
    if (e.key === 'Enter' && e.target.closest && e.target.closest('[data-qty]')) { e.preventDefault(); e.target.blur(); }
  });

  // Seletores de quantidade ligados a itens do carrinho (drawer e página do carrinho)
  document.addEventListener('qtychange', function (e) {
    var id = e.target.getAttribute('data-id');
    if (!id || !e.target.closest('[data-line]')) return;
    if (e.detail.value <= 0) RP.cart.remove(id);
    else RP.cart.set(id, e.detail.value);
  });

  document.addEventListener('rp:cart', function () {
    renderCounters();
    if (RP.drawer.isOpen()) renderDrawer();
  });

  /* ------------------------------------------------------------------------
     Inicialização
     ------------------------------------------------------------------------ */
  injectShell();
  RP.hydrateIcons();
  renderCounters();
})();
