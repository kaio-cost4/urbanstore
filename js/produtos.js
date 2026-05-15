/**
 * js/produtos.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MOTIVO: Centralizar os dados de produtos num array JS e renderizar o catálogo
 * dinamicamente no DOM — em vez de HTML estático — permite filtrar, ordenar e
 * atualizar sem recarregar a página. Demonstra: arrays de objetos, funções
 * puras de filtragem/ordenação, manipulação de DOM via createElement/innerHTML,
 * e eventos de UI (change, input, click).
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// ─── 1. ARRAY DE PRODUTOS ────────────────────────────────────────────────────
// Fonte de verdade: cada produto é um objeto com propriedades padronizadas.
// Em um projeto real isso viria de uma API; aqui simula o back-end.
const PRODUTOS = [
  { id: 1,  nome: 'Vestido Midi Romântico',    categoria: 'feminino',   preco: 189.90, precoAnt: 249.90, emoji: '👗', tamanhos: ['PP','P','M','G'],      badge: 'Novo',    estoque: true  },
  { id: 2,  nome: 'Tênis Urban Runner',        categoria: 'calcados',   preco: 329.90, precoAnt: null,   emoji: '👟', tamanhos: ['38','39','40','41','42'], badge: 'Popular', estoque: true  },
  { id: 3,  nome: 'Casaco Trench Clássico',    categoria: 'inverno',    preco: 459.90, precoAnt: 599.90, emoji: '🧥', tamanhos: ['P','M','G','GG'],        badge: null,      estoque: true  },
  { id: 4,  nome: 'Bolsa Couro Moderno',       categoria: 'acessorios', preco: 279.90, precoAnt: 399.90, emoji: '👜', tamanhos: ['Único'],                 badge: 'Sale',    estoque: true  },
  { id: 5,  nome: 'Camisa Social Premium',     categoria: 'masculino',  preco: 149.90, precoAnt: null,   emoji: '👔', tamanhos: ['P','M','G','GG','XGG'],  badge: null,      estoque: true  },
  { id: 6,  nome: 'Cachecol Cashmere',         categoria: 'inverno',    preco: 119.90, precoAnt: null,   emoji: '🧣', tamanhos: ['Único'],                 badge: null,      estoque: true  },
  { id: 7,  nome: 'Scarpin Clássico Nude',     categoria: 'calcados',   preco: 229.90, precoAnt: null,   emoji: '👠', tamanhos: ['35','36','37','38','39'], badge: null,      estoque: true  },
  { id: 8,  nome: 'Body Canelado Manga',       categoria: 'feminino',   preco:  89.90, precoAnt: null,   emoji: '🩱', tamanhos: ['PP','P','M','G'],        badge: null,      estoque: true  },
  { id: 9,  nome: 'Óculos Solar Retrô',        categoria: 'acessorios', preco: 159.90, precoAnt: null,   emoji: '🕶️', tamanhos: ['Único'],                 badge: null,      estoque: true  },
  { id: 10, nome: 'Bota Chelsea Couro',        categoria: 'calcados',   preco: 389.90, precoAnt: null,   emoji: '🥾', tamanhos: ['37','38','39','40','41'], badge: null,      estoque: false },
  { id: 11, nome: 'Calça Alfaiataria Wide',    categoria: 'feminino',   preco: 219.90, precoAnt: 289.90, emoji: '👖', tamanhos: ['PP','P','M','G','GG'],   badge: 'Sale',    estoque: true  },
  { id: 12, nome: 'Jaqueta Jeans Oversized',   categoria: 'masculino',  preco: 299.90, precoAnt: null,   emoji: '🥼', tamanhos: ['P','M','G','GG'],        badge: 'Novo',    estoque: true  },
  { id: 13, nome: 'Mochila Urban Commuter',    categoria: 'acessorios', preco: 349.90, precoAnt: 429.90, emoji: '🎒', tamanhos: ['Único'],                 badge: 'Popular', estoque: true  },
  { id: 14, nome: 'Blusa Cropped Tricot',      categoria: 'feminino',   preco:  99.90, precoAnt: null,   emoji: '🧶', tamanhos: ['PP','P','M'],            badge: null,      estoque: true  },
  { id: 15, nome: 'Calçado Slip-On Veludo',    categoria: 'calcados',   preco: 179.90, precoAnt: 219.90, emoji: '🥿', tamanhos: ['36','37','38','39','40'], badge: 'Sale',    estoque: true  },
  { id: 16, nome: 'Luva Couro Forrada',        categoria: 'inverno',    preco:  79.90, precoAnt: null,   emoji: '🧤', tamanhos: ['P/M','G/GG'],            badge: null,      estoque: true  },
];

// ─── 2. ESTADO LOCAL DO CATÁLOGO ─────────────────────────────────────────────
// Manter estado num objeto centralizado facilita sincronizar filtros, ordenação
// e busca sem precisar ler o DOM a cada operação.
let estadoCatalogo = {
  categorias: [],        // ex.: ['feminino', 'calcados']
  precoMax:   1000,
  somenteEstoque: false,
  ordem:      'relevancia',
  busca:      '',
};

// ─── 3. FUNÇÕES DE FILTRAGEM E ORDENAÇÃO ─────────────────────────────────────

/**
 * filtrarProdutos(lista, estado) → Array
 * Função pura: não altera o array original; retorna novo array filtrado.
 * Motivo: funções puras são previsíveis e fáceis de testar.
 */
function filtrarProdutos(lista, estado) {
  return lista.filter(p => {
    const catOk  = estado.categorias.length === 0 || estado.categorias.includes(p.categoria);
    const precoOk = p.preco <= estado.precoMax;
    const estOk  = !estado.somenteEstoque || p.estoque;
    const buscaOk = p.nome.toLowerCase().includes(estado.busca.toLowerCase());
    return catOk && precoOk && estOk && buscaOk;
  });
}

/**
 * ordenarProdutos(lista, ordem) → Array
 * Retorna cópia ordenada; não muta o array original (spread + sort).
 */
function ordenarProdutos(lista, ordem) {
  const copia = [...lista];
  const mapa = {
    'relevancia':    () => 0,
    'menor-preco':   (a, b) => a.preco - b.preco,
    'maior-preco':   (a, b) => b.preco - a.preco,
    'novidades':     (a, b) => b.id - a.id,
    'mais-vendidos': (a, b) => (b.badge === 'Popular' ? 1 : 0) - (a.badge === 'Popular' ? 1 : 0),
  };
  return copia.sort(mapa[ordem] || (() => 0));
}

// ─── 4. RENDERIZAÇÃO (DOM) ───────────────────────────────────────────────────

/**
 * criarCardProduto(produto) → HTMLElement
 * Cria um <li> com o card do produto via DOM API.
 * Motivo: separar criação de elemento da lógica de negócio.
 */
function criarCardProduto(produto) {
  const li = document.createElement('li');
  li.className = 'produto-card';
  li.dataset.id = produto.id;

  const badgeHtml = produto.badge
    ? `<span class="produto-badge badge${produto.badge === 'Sale' ? ' badge-outline' : ''}">${produto.badge}</span>`
    : '';

  const precoAntHtml = produto.precoAnt
    ? `<span class="produto-preco-antigo">R$ ${produto.precoAnt.toFixed(2).replace('.', ',')}</span>`
    : '';

  const estoqueClass = produto.estoque ? '' : 'esgotado';
  const btnComprar   = produto.estoque
    ? `<button class="btn-add-carrinho" data-id="${produto.id}" aria-label="Adicionar ${produto.nome} ao carrinho">🛒 Adicionar</button>`
    : `<button disabled aria-label="${produto.nome} esgotado">Esgotado</button>`;

  li.innerHTML = `
    <div class="produto-imagem ${estoqueClass}" aria-hidden="true">
      ${produto.emoji}
      ${badgeHtml}
    </div>
    <div class="produto-acoes" aria-hidden="true">
      ${btnComprar}
      <button class="btn-favorito" data-id="${produto.id}" aria-label="Favoritar ${produto.nome}">♡</button>
    </div>
    <div class="produto-info">
      <p class="produto-categoria">${labelCategoria(produto.categoria)}</p>
      <h3>${produto.nome}</h3>
      <div class="produto-preco-wrapper">
        <span class="produto-preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
        ${precoAntHtml}
      </div>
    </div>`;

  return li;
}

/** Converte slug de categoria em rótulo legível */
function labelCategoria(slug) {
  const map = {
    feminino:   'Feminino',
    masculino:  'Masculino',
    calcados:   'Calçados',
    acessorios: 'Acessórios',
    inverno:    'Inverno',
  };
  return map[slug] || slug;
}

/**
 * renderizarCatalogo() → void
 * Lê o estado atual, filtra, ordena e repopula o <ul> no DOM.
 * Motivo: ponto único de verdade — qualquer mudança de filtro chama essa função.
 */
function renderizarCatalogo() {
  const grid = document.getElementById('grid-produtos');
  const contador = document.getElementById('catalogo-qtd');
  if (!grid) return;

  const filtrados = filtrarProdutos(PRODUTOS, estadoCatalogo);
  const ordenados = ordenarProdutos(filtrados, estadoCatalogo.ordem);

  // Limpa e repopula
  grid.innerHTML = '';

  if (ordenados.length === 0) {
    grid.innerHTML = `
      <li class="sem-resultados" style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--texto-leve);">
        <span style="font-size:3rem; display:block; margin-bottom:1rem;">🔍</span>
        Nenhum produto encontrado. Tente ajustar os filtros.
      </li>`;
  } else {
    ordenados.forEach(p => grid.appendChild(criarCardProduto(p)));
  }

  if (contador) contador.textContent = `${ordenados.length} produto${ordenados.length !== 1 ? 's' : ''} encontrado${ordenados.length !== 1 ? 's' : ''}`;

  // Reanexa eventos nos novos botões (delegação seria alternativa mais eficiente)
  anexarEventosBotoes(grid);
}

// ─── 5. EVENTOS DE FILTRO ────────────────────────────────────────────────────

function inicializarFiltros() {
  // Checkboxes de categoria
  document.querySelectorAll('.filtro-cat').forEach(cb => {
    cb.addEventListener('change', () => {
      // Recalcula array de categorias ativas a partir de todos os checkboxes marcados
      estadoCatalogo.categorias = Array.from(
        document.querySelectorAll('.filtro-cat:checked')
      ).map(el => el.value);
      renderizarCatalogo();
    });
  });

  // Slider / input de preço máximo
  const sliderPreco = document.getElementById('filtro-preco-max');
  const labelPreco  = document.getElementById('filtro-preco-label');
  if (sliderPreco) {
    sliderPreco.addEventListener('input', () => {
      estadoCatalogo.precoMax = Number(sliderPreco.value);
      if (labelPreco) labelPreco.textContent = `R$ ${Number(sliderPreco.value).toFixed(2).replace('.',',')}`;
      renderizarCatalogo();
    });
  }

  // Somente em estoque
  const cbEstoque = document.getElementById('filtro-estoque');
  if (cbEstoque) {
    cbEstoque.addEventListener('change', () => {
      estadoCatalogo.somenteEstoque = cbEstoque.checked;
      renderizarCatalogo();
    });
  }

  // Select de ordenação
  const selectOrdem = document.getElementById('ordenar');
  if (selectOrdem) {
    selectOrdem.addEventListener('change', () => {
      estadoCatalogo.ordem = selectOrdem.value;
      renderizarCatalogo();
    });
  }

  // Campo de busca
  const inputBusca = document.getElementById('busca-produto');
  if (inputBusca) {
    // 'input' dispara a cada tecla — mostra resultado em tempo real
    inputBusca.addEventListener('input', () => {
      estadoCatalogo.busca = inputBusca.value.trim();
      renderizarCatalogo();
    });
  }
}

// ─── 6. EVENTOS NOS CARDS ────────────────────────────────────────────────────

function anexarEventosBotoes(container) {
  // Adicionar ao carrinho
  container.querySelectorAll('.btn-add-carrinho').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const produto = PRODUTOS.find(p => p.id === id);
      if (produto) adicionarAoCarrinho(produto);
    });
  });

  // Favoritar
  container.querySelectorAll('.btn-favorito').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = btn.textContent === '♡' ? '❤️' : '♡';
      btn.setAttribute('aria-pressed', btn.textContent === '❤️');
    });
  });
}

// ─── 7. EXPORTA PARA OUTROS MÓDULOS ─────────────────────────────────────────
// Torna funções e dados disponíveis globalmente para os outros scripts.
window.UrbanCatalogo = { PRODUTOS, renderizarCatalogo, inicializarFiltros, labelCategoria };
