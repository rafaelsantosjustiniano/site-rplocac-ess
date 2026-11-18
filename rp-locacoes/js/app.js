/* ==========================================================================
   RP Locações — Interações de cada página
   --------------------------------------------------------------------------
   • Comum: menu mobile, cabeçalho, transições entre páginas, animações
     de entrada e links de WhatsApp
   • catalogo.html: filtros, busca e cards com seletor de quantidade
   • calculadora.html: sugestão automática de kits
   • carrinho.html: lista do pedido, formulário e envio pelo WhatsApp
   • como-funciona.html: FAQ em acordeão
   Depende de: js/products.js e js/cart.js (carregados antes).
   ========================================================================== */
(function () {
  'use strict';

  var RP = window.RP;
  var page = document.body.getAttribute('data-page') || '';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function normalize(str) {
    return String(str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }
  function getParam(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
  }

  /* ==========================================================================
     COMUM A TODAS AS PÁGINAS
     ========================================================================== */

  /* ---------- Menu mobile (hambúrguer) ---------- */
  function initMobileMenu() {
    var toggle = $('.menu-toggle');
    var menu = $('#mobile-menu');
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menu.classList.toggle('is-open', open);
    }
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('is-open') && !e.target.closest('.site-header')) setOpen(false);
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960) setOpen(false); });
  }

  /* ---------- Cabeçalho: sombra ao rolar e link ativo ---------- */
  function initHeader() {
    var header = $('.site-header');
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    $all('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === page) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ---------- Transição suave ao trocar de página ---------- */
  function initPageTransitions() {
    if (reduceMotion) return;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      var href = a.getAttribute('href');
      if (!/^[\w-]+\.html(\?[^#]*)?$/.test(href)) return; // só links internos para outras páginas
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(function () { window.location.href = href; }, 170);
    });
    // Ao voltar pelo histórico (bfcache), remove o estado de saída
    window.addEventListener('pageshow', function () { document.body.classList.remove('is-leaving'); });
  }

  /* ---------- Animações de entrada ao rolar ---------- */
  function initReveal() {
    var els = $all('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Links de WhatsApp: <a data-wa="mensagem opcional"> ---------- */
  function initWhatsAppLinks() {
    $all('[data-wa]').forEach(function (a) {
      a.href = RP.waLink(a.getAttribute('data-wa'));
      a.target = '_blank';
      a.rel = 'noopener';
    });
    $all('[data-wa-display]').forEach(function (el) { el.textContent = RP_CONFIG.whatsappDisplay; });
    $all('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ==========================================================================
     CATÁLOGO
     ========================================================================== */
  function initCatalog() {
    var grid = $('[data-products]');
    if (!grid) return;
    var tabsEl = $('[data-filter-tabs]');
    var search = $('[data-search]');
    var clearBtn = $('[data-search-clear]');
    var meta = $('[data-catalog-meta]');

    var validCats = RP_CATEGORIES.map(function (c) { return c.id; });
    var state = {
      category: validCats.indexOf(getParam('categoria')) >= 0 ? getParam('categoria') : 'todos',
      query: '',
    };

    function defaultQty(p) { return p.id === RP_CONFIG.promo.productId ? RP_CONFIG.promo.minQty : 1; }

    /* Abas de filtro */
    tabsEl.innerHTML = RP_CATEGORIES.map(function (c) {
      var n = c.id === 'todos' ? RP_PRODUCTS.length : RP_PRODUCTS.filter(function (p) { return p.category === c.id; }).length;
      return '<button type="button" class="filter-tab" role="tab" data-cat="' + c.id + '">' + c.label + '<span class="count">' + n + '</span></button>';
    }).join('');

    tabsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (!b) return;
      state.category = b.getAttribute('data-cat');
      var url = state.category === 'todos' ? 'catalogo.html' : 'catalogo.html?categoria=' + state.category;
      try { history.replaceState(null, '', url); } catch (err) { /* file:// em alguns navegadores */ }
      render();
    });

    /* Busca */
    var t;
    search.addEventListener('input', function () {
      clearBtn.classList.toggle('is-visible', !!search.value);
      clearTimeout(t);
      t = setTimeout(function () { state.query = search.value; render(); }, 120);
    });
    clearBtn.addEventListener('click', function () {
      search.value = ''; state.query = ''; clearBtn.classList.remove('is-visible'); search.focus(); render();
    });

    function filtered() {
      var q = normalize(state.query);
      return RP_PRODUCTS.filter(function (p) {
        if (state.category !== 'todos' && p.category !== state.category) return false;
        if (!q) return true;
        return normalize(p.name + ' ' + p.description + ' ' + RP.categoryLabel(p.category) + ' ' + (p.includes || '')).indexOf(q) >= 0;
      });
    }

    function cardHTML(p, i) {
      var q = defaultQty(p);
      var isPromo = p.id === RP_CONFIG.promo.productId;
      return (
        '<article class="product-card" data-product="' + p.id + '" style="animation-delay:' + (i * 60) + 'ms">' +
          '<div class="product-media">' + RP.mediaHTML(p) +
            '<div class="media-badges">' +
              '<span class="tag tag-' + p.category + '"><span class="tag-dot"></span>' + RP.categoryLabel(p.category) + '</span>' +
              (isPromo ? '<span class="tag tag-promo">' + RP.icon('zap') + 'Promoção</span>' : '') +
              '<span class="tag tag-incart hidden" data-incart></span>' +
            '</div>' +
          '</div>' +
          '<div class="product-body">' +
            '<h3>' + RP.esc(p.name) + '</h3>' +
            '<p class="product-desc">' + RP.esc(p.description) + '</p>' +
            (p.includes ? '<span class="product-includes">' + RP.icon('box') + RP.esc(p.includes) + '</span>' : '') +
            (p.rule ? '<div class="product-rule" data-rule>' + RP.icon('tag') + '<span>' + RP.esc(p.rule) + '</span></div>' : '') +
            '<div class="product-price"><strong>' + RP.fmt(p.price) + '</strong><span>/ ' + RP.esc(p.unit) + '</span></div>' +
            '<div class="product-actions">' +
              RP.qtyHTML(q, { min: 1, label: p.name }) +
              '<button type="button" class="btn btn-primary add-btn" data-add="' + p.id + '">' + RP.icon('plus') + '<span>Adicionar</span></button>' +
            '</div>' +
            '<p class="product-subtotal" data-subtotal></p>' +
          '</div>' +
        '</article>'
      );
    }

    function updateCard(card) {
      var p = RP.getProduct(card.getAttribute('data-product'));
      var q = parseInt($('[data-qty] input', card).value, 10) || 1;
      $('[data-subtotal]', card).innerHTML = q + ' × ' + RP.fmt(p.price) + ' = <b>' + RP.fmt(q * p.price) + '</b>';

      var inCart = RP.cart.qty(p.id);
      var badge = $('[data-incart]', card);
      badge.classList.toggle('hidden', !inCart);
      badge.innerHTML = RP.icon('check') + inCart + ' no pedido';
      card.classList.toggle('is-in-cart', inCart > 0);

      // Regra do jogo de mesa: considera o que já está no carrinho + o que vai adicionar
      var rule = $('[data-rule]', card);
      if (rule && p.id === RP_CONFIG.promo.productId) {
        var totalJogos = inCart + q;
        var min = RP_CONFIG.promo.minQty;
        var span = $('span', rule);
        if (inCart >= min) {
          rule.className = 'product-rule';
          span.textContent = 'Promoção garantida: ' + inCart + ' jogos no pedido.';
        } else if (totalJogos >= min) {
          rule.className = 'product-rule';
          span.textContent = inCart
            ? 'Você tem ' + inCart + ' no pedido. Adicionando ' + q + ', fica com ' + totalJogos + ' e garante a promoção.'
            : RP_CONFIG.promo.label;
        } else {
          rule.className = 'product-rule alert-warn';
          span.textContent = (inCart ? 'Pedido ficaria com ' : 'Com ') + RP.plural(totalJogos, 'jogo', 'jogos') + ': abaixo do mínimo (' + min + '). Valor a confirmar no WhatsApp.';
        }
      }
    }

    function render() {
      $all('[data-cat]', tabsEl).forEach(function (b) {
        var active = b.getAttribute('data-cat') === state.category;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      var list = filtered();
      meta.innerHTML = list.length
        ? 'Mostrando <b>' + RP.plural(list.length, 'produto', 'produtos') + '</b>' + (state.query ? ' para “' + RP.esc(state.query) + '”' : '')
        : '';

      if (!list.length) {
        grid.innerHTML =
          '<div class="empty-state" style="grid-column:1/-1"><div class="es-ic">' + RP.icon('search') + '</div>' +
          '<h3>Nenhum produto encontrado</h3><p>Tente outro termo ou veja todas as categorias.</p>' +
          '<button type="button" class="btn btn-dark" data-reset-filters>' + RP.icon('reset') + 'Limpar filtros</button></div>';
        return;
      }
      grid.innerHTML = list.map(cardHTML).join('');
      $all('.product-card', grid).forEach(updateCard);
    }

    grid.addEventListener('qtychange', function (e) {
      var card = e.target.closest('.product-card');
      if (card) updateCard(card);
    });

    grid.addEventListener('click', function (e) {
      if (e.target.closest('[data-reset-filters]')) {
        state.category = 'todos'; state.query = ''; search.value = ''; clearBtn.classList.remove('is-visible');
        render(); return;
      }
      var btn = e.target.closest('[data-add]');
      if (!btn) return;
      var card = btn.closest('.product-card');
      var p = RP.getProduct(btn.getAttribute('data-add'));
      var input = $('[data-qty] input', card);
      var q = RP.clampQty(input.value, 1);
      RP.cart.add(p.id, q);
      RP.notifyAdded(p, q);

      // feedback no botão
      btn.classList.add('is-added');
      btn.innerHTML = RP.icon('check') + '<span>Adicionado!</span>';
      clearTimeout(btn._t);
      btn._t = setTimeout(function () {
        btn.classList.remove('is-added');
        btn.innerHTML = RP.icon('plus') + '<span>Adicionar</span>';
      }, 1400);

            // jogo de mesa: sugere exatamente o que falta para chegar ao mínimo da promoção
      var reset = defaultQty(p);
      if (p.id === RP_CONFIG.promo.productId) reset = Math.max(1, RP_CONFIG.promo.minQty - RP.cart.qty(p.id));
      input.value = reset;
      RP.syncQtyButtons($('[data-qty]', card));
      updateCard(card);
    });

    document.addEventListener('rp:cart', function () { $all('.product-card', grid).forEach(updateCard); });

    render();
  }

  /* ==========================================================================
     CALCULADORA DE EVENTOS
     ========================================================================== */
  function initCalculator() {
    var form = $('[data-calc]');
    if (!form) return;
    var range = $('[data-guests-range]');
    var number = $('[data-guests-input]');
    var out = $('[data-calc-result]');
    var minG = RP_CALC.minGuests, maxG = RP_CALC.maxGuests;
    var roundUp = false;

    range.min = number.min = minG;
    range.max = number.max = maxG;

    // Pré-seleção via URL (ex.: calculadora.html?tipo=sentado&convidados=80)
    var tipo = getParam('tipo');
    if (tipo && RP_CALC.eventTypes[tipo]) { var r = $('input[name="tipo"][value="' + tipo + '"]', form); if (r) r.checked = true; }
    var conv = parseInt(getParam('convidados'), 10);
    if (conv) setGuests(conv, true);
    else setGuests(parseInt(range.value, 10) || 50, true);

    function clampGuests(v) { v = parseInt(v, 10); if (isNaN(v)) v = minG; return Math.max(minG, Math.min(maxG, v)); }

    function setGuests(v, silent) {
      v = clampGuests(v);
      range.value = v;
      if (document.activeElement !== number || silent) number.value = v;
      range.style.setProperty('--fill', ((v - minG) / (maxG - minG)) * 100 + '%');
      $all('[data-guests]', form).forEach(function (c) { c.classList.toggle('is-active', parseInt(c.getAttribute('data-guests'), 10) === v); });
      roundUp = false;
      if (!silent) compute();
    }

    range.addEventListener('input', function () { setGuests(range.value); });
    number.addEventListener('input', function () {
      var v = parseInt(number.value, 10);
      if (!isNaN(v) && v >= minG && v <= maxG) setGuests(v);
    });
    number.addEventListener('blur', function () { setGuests(number.value, true); compute(); });
    form.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-guests]');
      if (chip) setGuests(chip.getAttribute('data-guests'));
    });
    form.addEventListener('change', function (e) { if (e.target.name === 'tipo' || e.target.name === 'toalhas') compute(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    function suggestion() {
      var guests = clampGuests(range.value);
      var typeKey = ($('input[name="tipo"]:checked', form) || {}).value || 'informal';
      var type = RP_CALC.eventTypes[typeKey];
      var withCloths = (($('input[name="toalhas"]:checked', form) || {}).value || 'sim') === 'sim';

      var seats = Math.ceil(guests * type.seatedShare);
      var jogos = Math.ceil(seats / RP_CALC.peoplePerJogo);
      var min = RP_CONFIG.promo.minQty;
      var belowPromo = jogos < min;
      if (roundUp && belowPromo) { jogos = min; belowPromo = false; }
      var tampoes = Math.max(1, Math.ceil(guests / type.guestsPerTampao));

      var lines = [
        { id: 'jogo-de-mesa', qty: jogos, why: '1 jogo (mesa + 4 cadeiras) a cada ' + RP_CALC.peoplePerJogo + ' lugares sentados' },
        { id: 'tampao', qty: tampoes, why: 'Para buffet, mesa do bolo ou apoio' },
      ];
      if (withCloths) {
        lines.push({ id: 'toalha-de-mesa', qty: jogos, why: 'Uma para cada mesa' });
        lines.push({ id: 'toalha-de-tampao', qty: tampoes, why: 'Uma para cada tampão' });
      }
      lines.forEach(function (l) { l.product = RP.getProduct(l.id); l.subtotal = l.qty * l.product.price; });

      return {
        guests: guests, type: type, typeKey: typeKey, seats: jogos * RP_CALC.peoplePerJogo,
        neededSeats: seats, jogos: jogos, belowPromo: belowPromo, lines: lines,
        total: lines.reduce(function (s, l) { return s + l.subtotal; }, 0),
      };
    }

    var current;
    function compute() {
      current = suggestion();
      var s = current;
      var min = RP_CONFIG.promo.minQty;
      out.innerHTML =
        '<div class="result-head">' +
          '<span class="eyebrow">Sugestão ideal</span>' +
          '<h2>' + RP.esc(s.type.label) + ' para ' + s.guests + ' convidados</h2>' +
          '<div class="result-stats">' +
            '<div class="stat"><b>' + s.guests + '</b><span>convidados</span></div>' +
            '<div class="stat"><b>' + s.seats + '</b><span>lugares sentados</span></div>' +
            '<div class="stat"><b>' + s.jogos + '</b><span>jogos de mesa</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="result-body">' +
          '<div class="result-lines">' + s.lines.map(function (l, i) {
            return '<div class="result-line" style="animation-delay:' + i * 50 + 'ms">' +
              '<span class="rl-name"><span class="rl-qty">' + l.qty + 'x</span>' + RP.esc(l.product.name) + '</span>' +
              '<span class="rl-sub">' + RP.fmt(l.subtotal) + '</span>' +
              '<span class="rl-why">' + RP.esc(l.why) + ' · ' + RP.fmt(l.product.price) + ' cada</span></div>';
          }).join('') + '</div>' +
          '<div class="result-total"><span>Valor estimado<br>do kit</span><strong>' + RP.fmt(s.total) + '</strong></div>' +
          (s.belowPromo
            ? '<div class="alert alert-warn">' + RP.icon('alert') + '<div><strong>Abaixo do mínimo da promoção</strong>O valor de R$ 10,00 por jogo vale a partir de ' + min + ' jogos. Arredondando, você ganha ' + (min * RP_CALC.peoplePerJogo - s.seats) + ' lugares extras.<br><button type="button" class="alert-action" data-calc-round>' + RP.icon('plus') + 'Arredondar para ' + min + ' jogos</button></div></div>'
            : '<div class="alert alert-ok">' + RP.icon('check-circle') + '<div><strong>Preço promocional aplicado</strong>' + s.jogos + ' jogos de mesa a ' + RP.fmt(RP.getProduct(RP_CONFIG.promo.productId).price) + ' cada.</div></div>') +
          '<div class="result-actions">' +
            '<button type="button" class="btn btn-primary btn-lg btn-block" data-calc-add>' + RP.icon('cart') + 'Adicionar Sugestão ao Carrinho</button>' +
            '<a class="btn btn-ghost btn-block" data-calc-wa target="_blank" rel="noopener">' + RP.icon('whatsapp') + 'Tirar dúvida sobre esta sugestão</a>' +
          '</div>' +
          '<p class="result-note">Estimativa automática. Ajuste as quantidades no carrinho quando quiser.</p>' +
        '</div>';

      var waMsg = 'Olá, RP Locações! Usei a calculadora do site para um(a) ' + s.type.label.toLowerCase() + ' com ' + s.guests + ' convidados e recebi a sugestão: ' +
        s.lines.map(function (l) { return l.qty + 'x ' + l.product.name; }).join(', ') + ' (' + RP.fmt(s.total) + '). Podem me ajudar?';
      $('[data-calc-wa]', out).href = RP.waLink(waMsg);
    }

    out.addEventListener('click', function (e) {
      if (e.target.closest('[data-calc-round]')) { roundUp = true; compute(); return; }
      var add = e.target.closest('[data-calc-add]');
      if (!add) return;
      var hadItems = RP.cart.count() > 0;
      RP.cart.addMany(current.lines.map(function (l) { return { id: l.id, qty: l.qty }; }));
      RP.toast({
        title: 'Sugestão adicionada ao carrinho!',
        message: (hadItems ? 'Somada ao que já estava no pedido. ' : '') + 'Total: ' + RP.fmt(RP.cart.total()),
        action: { label: 'Ver pedido', href: 'carrinho.html' },
        duration: 5000,
      });
      add.innerHTML = RP.icon('check') + 'Adicionado ao carrinho';
      add.classList.add('add-btn', 'is-added');
      setTimeout(function () {
        add.innerHTML = RP.icon('cart') + 'Adicionar Sugestão ao Carrinho';
        add.classList.remove('is-added');
      }, 1800);
    });

    compute();
  }

  /* ==========================================================================
     CARRINHO + WHATSAPP
     ========================================================================== */

  var WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  function formatDateBR(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return iso || '';
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return m[3] + '/' + m[2] + '/' + m[1] + ' (' + WEEKDAYS[d.getDay()] + ')';
  }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /** Monta a mensagem do pedido (texto puro, formatação do WhatsApp com *negrito*). */
  RP.buildOrderMessage = function (c) {
    var lines = RP.cart.detailed();
    var promo = RP.cart.promoStatus();
    var L = [];
    L.push('Olá, *RP Locações*! 👋');
    L.push('Gostaria de solicitar uma reserva para o meu evento. 🎉');
    L.push('');
    L.push('👤 *DADOS DO CLIENTE*');
    L.push('• Nome: ' + (c.nome || '').trim());
    L.push('📅 Data do evento: ' + formatDateBR(c.data));
    L.push('⏰ Horário aproximado: ' + (c.horario || ''));
    L.push('📍 Local: ' + (c.endereco || '').trim() + (c.cidade ? ' – ' + c.cidade : ''));
    L.push('');
    L.push('🪑 *ITENS DO PEDIDO*');
    lines.forEach(function (l) {
      L.push('• ' + l.qty + 'x ' + l.product.name + ' (' + RP.fmt(l.product.price) + ' un.) = ' + RP.fmt(l.subtotal));
    });
    L.push('');
    L.push('📦 Total de peças: ' + RP.cart.count());
    L.push('💰 *TOTAL ESTIMADO: ' + RP.fmt(RP.cart.total()) + '*');
    if (promo && !promo.ok) {
      L.push('⚠️ Obs.: pedido com ' + promo.qty + ' jogo(s) de mesa — abaixo do mínimo de ' + promo.min + ' da promoção. Aguardo o valor final.');
    }
    if (c.obs && c.obs.trim()) {
      L.push('');
      L.push('📝 *OBSERVAÇÕES*');
      L.push(c.obs.trim());
    }
    L.push('');
    L.push('Aguardo a confirmação da disponibilidade. Obrigado(a)! 🙏');
    return L.join('\n');
  };

  function initCartPage() {
    var itemsEl = $('[data-cart-items]');
    if (!itemsEl) return;
    var summaryEl = $('[data-cart-summary]');
    var promoEl = $('[data-cart-promo]');
    var form = $('#event-form');
    var submitBtn = $('[data-submit]');
    var preview = $('[data-wa-preview]');
    var savedEl = $('[data-form-saved]');
    var countEl = $('[data-cart-lines]');
    var clearBtn = $('[data-cart-clear]');

    /* ---------- Itens ---------- */
    function renderItems() {
      var lines = RP.cart.detailed();
      countEl.textContent = RP.plural(RP.cart.count(), 'item', 'itens');
      clearBtn.classList.toggle('hidden', !lines.length);

      if (!lines.length) {
        itemsEl.innerHTML =
          '<div class="empty-state"><div class="es-ic">' + RP.icon('cart') + '</div>' +
          '<h3>Seu pedido está vazio</h3><p>Adicione itens pelo catálogo ou deixe a calculadora montar uma sugestão para o seu evento.</p>' +
          '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
          '<a href="catalogo.html" class="btn btn-primary">' + RP.icon('grid') + 'Ver Catálogo</a>' +
          '<a href="calculadora.html" class="btn btn-outline">' + RP.icon('calculator') + 'Calculadora</a></div></div>';
      } else {
        itemsEl.innerHTML = lines.map(function (l) {
          return '<div class="cart-item" data-line="' + l.product.id + '">' +
            '<div class="cart-thumb">' + RP.mediaHTML(l.product) + '</div>' +
            '<div class="cart-item-info"><h3>' + RP.esc(l.product.name) + '</h3><span class="ci-unit">' + RP.fmt(l.product.price) + ' / ' + RP.esc(l.product.unit) + '</span></div>' +
            '<div class="cart-item-controls">' +
              RP.qtyHTML(l.qty, { id: l.product.id, small: true, label: l.product.name }) +
              '<span class="cart-item-sub">' + RP.fmt(l.subtotal) + '</span>' +
              '<button type="button" class="icon-btn" data-remove="' + l.product.id + '" aria-label="Remover ' + RP.esc(l.product.name) + '">' + RP.icon('trash') + '</button>' +
            '</div></div>';
        }).join('');
      }

      promoEl.innerHTML = RP.promoAlertHTML(false);

      var total = RP.cart.total();
      summaryEl.innerHTML =
        '<div class="summary-lines">' +
          lines.map(function (l) { return '<div><span>' + l.qty + 'x ' + RP.esc(l.product.name) + '</span><b>' + RP.fmt(l.subtotal) + '</b></div>'; }).join('') +
          (lines.length ? '' : '<div><span>Nenhum item ainda</span><b>—</b></div>') +
        '</div>' +
        '<div class="summary-total"><span>Total Estimado</span><strong>' + RP.fmt(total) + '</strong></div>' +
        '<p class="summary-hint">Valores de locação por unidade. Entrega, coleta e disponibilidade são confirmadas pelo WhatsApp.</p>';

      submitBtn.disabled = !lines.length;
      updatePreview();
    }

    /* ---------- Formulário ---------- */
    var fields = ['nome', 'data', 'horario', 'cidade', 'endereco', 'obs'];
    form.elements.data.min = todayISO();
    var citySel = form.elements.cidade;
    citySel.innerHTML = RP_CONFIG.serviceAreas.map(function (c) { return '<option value="' + RP.esc(c) + '">' + RP.esc(c) + '</option>'; }).join('');

    var saved = RP.customer.load();
    fields.forEach(function (f) { if (saved[f]) form.elements[f].value = saved[f]; });
    if (!citySel.value) citySel.value = RP_CONFIG.serviceAreas[0];

    function values() {
      var v = {};
      fields.forEach(function (f) { v[f] = form.elements[f].value; });
      return v;
    }

    var saveTimer, savedTimer;
    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field');
      if (field && field.classList.contains('has-error')) validateField(e.target.name);
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        RP.customer.save(values());
        savedEl.classList.add('is-visible');
        clearTimeout(savedTimer);
        savedTimer = setTimeout(function () { savedEl.classList.remove('is-visible'); }, 1800);
      }, 300);
      updatePreview();
    });
    form.addEventListener('change', updatePreview);

    var rules = {
      nome: function (v) { return v.trim().length >= 3 ? '' : 'Informe seu nome completo.'; },
      data: function (v) {
        if (!v) return 'Escolha a data do evento.';
        if (v < todayISO()) return 'A data do evento não pode estar no passado.';
        return '';
      },
      horario: function (v) { return v ? '' : 'Informe o horário aproximado.'; },
      cidade: function (v) { return v ? '' : 'Selecione a cidade.'; },
      endereco: function (v) { return v.trim().length >= 3 ? '' : 'Informe o bairro / endereço do evento.'; },
    };

    function validateField(name) {
      if (!rules[name]) return true;
      var msg = rules[name](form.elements[name].value);
      var field = form.elements[name].closest('.field');
      field.classList.toggle('has-error', !!msg);
      $('.field-error', field).textContent = msg;
      form.elements[name].setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    $all('input, select', form).forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) validateField(el.name); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!RP.cart.count()) {
        RP.toast({ type: 'warn', title: 'Seu carrinho está vazio', message: 'Adicione pelo menos um item antes de enviar.', action: { label: 'Catálogo', href: 'catalogo.html' } });
        return;
      }
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (!validateField(name) && !firstInvalid) firstInvalid = form.elements[name];
      });
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        RP.toast({ type: 'warn', title: 'Confira os dados do evento', message: 'Preencha os campos obrigatórios destacados.' });
        return;
      }

      RP.customer.save(values());
      var link = RP.waLink(RP.buildOrderMessage(values()));
      var win = window.open(link, '_blank', 'noopener');
      if (!win) window.location.href = link; // pop-up bloqueado
      RP.toast({ title: 'Pedido pronto no WhatsApp!', message: 'Toque em enviar na conversa para confirmar sua reserva.', duration: 6000 });
    });

    /* ---------- Prévia da mensagem ---------- */
    function updatePreview() {
      if (!preview) return;
      var v = values();
      preview.textContent = RP.cart.count()
        ? RP.buildOrderMessage({
            nome: v.nome || '[seu nome]', data: v.data || '', horario: v.horario || '[horário]',
            cidade: v.cidade, endereco: v.endereco || '[bairro / endereço]', obs: v.obs,
          }).replace('Data do evento: ', 'Data do evento: ' + (v.data ? '' : '[data]'))
        : 'Adicione itens ao carrinho para ver a mensagem.';
    }

    clearBtn.addEventListener('click', function () {
      var snapshot = RP.cart.items();
      RP.cart.clear();
      RP.toast({ type: 'info', title: 'Carrinho esvaziado', action: { label: 'Desfazer', onClick: function () { RP.cart.addMany(snapshot); } }, duration: 5000 });
    });

    document.addEventListener('rp:cart', renderItems);
    renderItems();
  }

  /* ==========================================================================
     COMO FUNCIONA — FAQ (abre um por vez)
     ========================================================================== */
  function initFaq() {
    var items = $all('.faq details');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  /* ==========================================================================
     Inicialização
     ========================================================================== */
  initMobileMenu();
  initHeader();
  initPageTransitions();
  initWhatsAppLinks();
  initCatalog();
  initCalculator();
  initCartPage();
  initFaq();
  RP.hydrateIcons();
  initReveal();
})();
