/**
 * js/ui.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MOTIVO: Agrupa interações de interface que não pertencem a um módulo
 * específico — menu mobile, busca no header, botão voltar ao topo,
 * accordion de FAQ e animações de scroll. Separar em arquivo próprio mantém
 * os outros módulos focados em sua responsabilidade (SRP).
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// ─── 1. MENU MOBILE ──────────────────────────────────────────────────────────
/**
 * Em telas pequenas o <nav> fica oculto (CSS display:none).
 * O botão hambúrguer adiciona/remove a classe 'nav-aberta' no body,
 * que o CSS usa para exibir o menu em overlay.
 * MOTIVO: controlar visibilidade via classe CSS mantém a lógica de layout
 * no CSS e a lógica de estado no JS — separação de responsabilidades.
 */
function inicializarMenuMobile() {
  const btnMenu = document.getElementById('btn-menu-mobile');
  const nav     = document.querySelector('nav[aria-label="Principal"]');
  if (!btnMenu || !nav) return;

  btnMenu.addEventListener('click', () => {
    const aberto = nav.classList.toggle('nav-aberta');
    btnMenu.setAttribute('aria-expanded', aberto);
    btnMenu.textContent = aberto ? '✕' : '☰';
    document.body.style.overflow = aberto ? 'hidden' : '';
  });

  // Fecha ao clicar em qualquer link do menu
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('nav-aberta');
      btnMenu.setAttribute('aria-expanded', 'false');
      btnMenu.textContent = '☰';
      document.body.style.overflow = '';
    });
  });
}

// ─── 2. BUSCA NO HEADER ──────────────────────────────────────────────────────
/**
 * Expande/colapsa o campo de busca no header ao clicar no ícone 🔍.
 * MOTIVO: revelar o input progressivamente mantém o header limpo em desktop
 * e ainda funciona sem JavaScript (o link vai para a página de produtos).
 */
function inicializarBuscaHeader() {
  const btnBusca   = document.getElementById('btn-busca-header');
  const campoBusca = document.getElementById('campo-busca-header');
  if (!btnBusca || !campoBusca) return;

  btnBusca.addEventListener('click', e => {
    e.preventDefault();
    const expandido = campoBusca.classList.toggle('expandido');
    if (expandido) {
      campoBusca.focus();
      btnBusca.setAttribute('aria-expanded', 'true');
    } else {
      btnBusca.setAttribute('aria-expanded', 'false');
    }
  });

  // Enter na busca redireciona para produtos com parâmetro ?busca=
  campoBusca.addEventListener('keydown', e => {
    if (e.key === 'Enter' && campoBusca.value.trim()) {
      const base = location.pathname.includes('/pages/') ? 'produtos.html' : 'pages/produtos.html';
      location.href = `${base}?busca=${encodeURIComponent(campoBusca.value.trim())}`;
    }
  });
}

// ─── 3. BOTÃO VOLTAR AO TOPO ─────────────────────────────────────────────────
/**
 * Aparece após o usuário rolar 300px. Ao clicar, rola suavemente ao topo.
 * MOTIVO: IntersectionObserver seria mais performático para elementos, mas
 * para scroll simples o evento 'scroll' com throttle é suficiente e didático.
 */
function inicializarVoltarTopo() {
  const btn = document.getElementById('btn-topo');
  if (!btn) return;

  let timeout;
  window.addEventListener('scroll', () => {
    // Throttle: executa no máximo 1x a cada 100ms
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (window.scrollY > 300) {
        btn.classList.add('visivel');
        btn.setAttribute('aria-hidden', 'false');
      } else {
        btn.classList.remove('visivel');
        btn.setAttribute('aria-hidden', 'true');
      }
    }, 100);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── 4. ANIMAÇÃO DE ENTRADA AO SCROLLAR ──────────────────────────────────────
/**
 * Adiciona classe 'visivel' em elementos .animar-entrada quando entram
 * no viewport usando IntersectionObserver — mais performático que scroll event.
 * MOTIVO: IntersectionObserver não bloqueia a thread principal (não é síncrono
 * com o scroll), ideal para animações.
 */
function inicializarAnimacoesScroll() {
  const alvos = document.querySelectorAll('.animar-entrada');
  if (!alvos.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visivel');
        observer.unobserve(entry.target); // Para de observar após animar
      }
    });
  }, { threshold: 0.12 });

  alvos.forEach(el => observer.observe(el));
}

// ─── 5. ACCORDION (FAQ / FILTROS MOBILE) ────────────────────────────────────
/**
 * Accordion: um clique abre o painel e fecha os demais.
 * Usa atributo aria-expanded para acessibilidade.
 * MOTIVO: comportamento de acordeão é comum em FAQs e filtros mobile;
 * reutilizável em qualquer página com .accordion-btn.
 */
function inicializarAccordion() {
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const painel  = document.getElementById(btn.getAttribute('aria-controls'));
      const aberto  = btn.getAttribute('aria-expanded') === 'true';

      // Fecha todos
      document.querySelectorAll('.accordion-btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const p = document.getElementById(b.getAttribute('aria-controls'));
        if (p) p.hidden = true;
      });

      // Abre o clicado (se estava fechado)
      if (!aberto && painel) {
        btn.setAttribute('aria-expanded', 'true');
        painel.hidden = false;
      }
    });
  });
}

// ─── 6. CONTADOR REGRESSIVO (PROMOÇÃO) ───────────────────────────────────────
/**
 * Exibe contagem regressiva até meia-noite no elemento #timer-promo.
 * MOTIVO: setInterval atualiza o DOM a cada segundo — demonstra uso de
 * Date, cálculos aritméticos e atualização periódica.
 */
function inicializarTimer() {
  const el = document.getElementById('timer-promo');
  if (!el) return;

  function atualizar() {
    const agora  = new Date();
    const fim    = new Date(agora);
    fim.setHours(23, 59, 59, 0);
    const diff   = fim - agora;
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }

  atualizar();
  setInterval(atualizar, 1000);
}

// ─── 7. LEITURA DE PARÂMETROS DA URL ────────────────────────────────────────
/**
 * Ao carregar produtos.html com ?busca=... ou ?cat=..., pré-preenche
 * o campo de busca e/ou ativa o filtro de categoria correspondente.
 * MOTIVO: permite que links externos (header, banners) direcionem para
 * resultados filtrados sem estado adicional.
 */
function lerParametrosURL() {
  const params = new URLSearchParams(location.search);

  const busca = params.get('busca');
  if (busca) {
    const input = document.getElementById('busca-produto');
    if (input) {
      input.value = busca;
      input.dispatchEvent(new Event('input')); // dispara o filtro
    }
  }

  const cat = params.get('cat');
  if (cat) {
    const cb = document.querySelector(`.filtro-cat[value="${cat}"]`);
    if (cb) {
      cb.checked = true;
      cb.dispatchEvent(new Event('change')); // dispara o filtro
    }
  }
}

// ─── INICIALIZAÇÃO GLOBAL ────────────────────────────────────────────────────
function inicializarUI() {
  inicializarMenuMobile();
  inicializarBuscaHeader();
  inicializarVoltarTopo();
  inicializarAnimacoesScroll();
  inicializarAccordion();
  inicializarTimer();
}

window.inicializarUI         = inicializarUI;
window.lerParametrosURL      = lerParametrosURL;
