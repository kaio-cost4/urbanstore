/**
 * js/carrinho.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MOTIVO: Simular um carrinho persistente usando localStorage.
 * localStorage serializa o array do carrinho em JSON — assim os itens
 * sobrevivem a recarregamentos da página (comportamento esperado em e-commerce).
 * Demonstra: CRUD em arrays, JSON.stringify/parse, atualização reativa do DOM
 * e eventos customizados para sincronizar badge do header.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const CHAVE_CARRINHO = 'urbanstore_carrinho'; // chave única no localStorage

// ─── LEITURA / GRAVAÇÃO ──────────────────────────────────────────────────────

/** Lê o carrinho do localStorage (retorna array vazio se não existir) */
function lerCarrinho() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
  } catch {
    return [];
  }
}

/** Persiste o array no localStorage */
function salvarCarrinho(itens) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
}

// ─── OPERAÇÕES ───────────────────────────────────────────────────────────────

/**
 * adicionarAoCarrinho(produto, qtd?)
 * Se o item já existe incrementa a quantidade; senão insere.
 * Motivo: evitar duplicatas mantém o array coerente.
 */
function adicionarAoCarrinho(produto, qtd = 1) {
  const carrinho = lerCarrinho();
  const idx = carrinho.findIndex(i => i.id === produto.id);

  if (idx >= 0) {
    carrinho[idx].qtd += qtd;
  } else {
    carrinho.push({ id: produto.id, nome: produto.nome, preco: produto.preco, emoji: produto.emoji, qtd });
  }

  salvarCarrinho(carrinho);
  atualizarBadge();
  mostrarToast(`${produto.emoji} <strong>${produto.nome}</strong> adicionado ao carrinho!`, 'sucesso');
}

/**
 * removerDoCarrinho(id)
 * Filtra o item fora do array — filter retorna novo array sem o item.
 */
function removerDoCarrinho(id) {
  const novo = lerCarrinho().filter(i => i.id !== id);
  salvarCarrinho(novo);
  atualizarBadge();
  renderizarPainelCarrinho();
}

/**
 * alterarQuantidade(id, delta)
 * delta = +1 ou -1. Remove o item se quantidade chegar a zero.
 */
function alterarQuantidade(id, delta) {
  const carrinho = lerCarrinho().map(i =>
    i.id === id ? { ...i, qtd: i.qtd + delta } : i
  ).filter(i => i.qtd > 0);

  salvarCarrinho(carrinho);
  atualizarBadge();
  renderizarPainelCarrinho();
}

function limparCarrinho() {
  salvarCarrinho([]);
  atualizarBadge();
  renderizarPainelCarrinho();
}

// ─── TOTAIS ──────────────────────────────────────────────────────────────────

function totalItens()  { return lerCarrinho().reduce((s, i) => s + i.qtd, 0); }
function totalPreco()  { return lerCarrinho().reduce((s, i) => s + i.preco * i.qtd, 0); }

// ─── BADGE DO HEADER ────────────────────────────────────────────────────────

/**
 * atualizarBadge()
 * Atualiza TODOS os elementos .carrinho-num na página com a contagem atual.
 * Motivo: header e painel de resumo mostram a mesma informação — um único
 * ponto de atualização evita dessincronização.
 */
function atualizarBadge() {
  const qtd = totalItens();
  document.querySelectorAll('.carrinho-num').forEach(el => {
    el.textContent = qtd;
    el.setAttribute('aria-label', `${qtd} ${qtd === 1 ? 'item' : 'itens'}`);
    // Animação de pulso ao atualizar
    el.classList.remove('badge-pulso');
    void el.offsetWidth; // força reflow para reiniciar a animação
    el.classList.add('badge-pulso');
  });
}

// ─── PAINEL LATERAL (DRAWER) ────────────────────────────────────────────────

/**
 * renderizarPainelCarrinho()
 * Monta o HTML do drawer do carrinho a partir do array atual.
 * Motivo: o DOM sempre reflete o estado (array) — nunca ler o DOM como estado.
 */
function renderizarPainelCarrinho() {
  const lista  = document.getElementById('carrinho-lista');
  const total  = document.getElementById('carrinho-total');
  const vazio  = document.getElementById('carrinho-vazio');
  const rodape = document.getElementById('carrinho-rodape');
  if (!lista) return;

  const itens = lerCarrinho();
  lista.innerHTML = '';

  if (itens.length === 0) {
    if (vazio)  vazio.style.display  = 'flex';
    if (rodape) rodape.style.display = 'none';
    return;
  }

  if (vazio)  vazio.style.display  = 'none';
  if (rodape) rodape.style.display = 'block';

  itens.forEach(item => {
    const li = document.createElement('li');
    li.className = 'drawer-item';
    li.innerHTML = `
      <div class="drawer-item-emoji" aria-hidden="true">${item.emoji}</div>
      <div class="drawer-item-info">
        <span class="drawer-item-nome">${item.nome}</span>
        <span class="drawer-item-preco">R$ ${(item.preco * item.qtd).toFixed(2).replace('.',',')}</span>
      </div>
      <div class="drawer-item-qtd">
        <button class="qtd-btn" data-id="${item.id}" data-delta="-1" aria-label="Diminuir quantidade">−</button>
        <span aria-label="Quantidade: ${item.qtd}">${item.qtd}</span>
        <button class="qtd-btn" data-id="${item.id}" data-delta="1"  aria-label="Aumentar quantidade">+</button>
      </div>
      <button class="drawer-remover" data-id="${item.id}" aria-label="Remover ${item.nome}">✕</button>`;
    lista.appendChild(li);
  });

  // Eventos inline nos botões recém-criados
  lista.querySelectorAll('.qtd-btn').forEach(btn => {
    btn.addEventListener('click', () =>
      alterarQuantidade(Number(btn.dataset.id), Number(btn.dataset.delta))
    );
  });
  lista.querySelectorAll('.drawer-remover').forEach(btn => {
    btn.addEventListener('click', () => removerDoCarrinho(Number(btn.dataset.id)));
  });

  if (total) total.textContent = `R$ ${totalPreco().toFixed(2).replace('.',',')}`;
}

// ─── DRAWER OPEN / CLOSE ────────────────────────────────────────────────────

function abrirCarrinho() {
  renderizarPainelCarrinho();
  const drawer = document.getElementById('drawer-carrinho');
  const overlay = document.getElementById('overlay');
  if (drawer)  { drawer.classList.add('aberto');  drawer.setAttribute('aria-hidden', 'false'); }
  if (overlay) overlay.classList.add('visivel');
  document.body.style.overflow = 'hidden';
}

function fecharCarrinho() {
  const drawer = document.getElementById('drawer-carrinho');
  const overlay = document.getElementById('overlay');
  if (drawer)  { drawer.classList.remove('aberto');  drawer.setAttribute('aria-hidden', 'true'); }
  if (overlay) overlay.classList.remove('visivel');
  document.body.style.overflow = '';
}

// ─── TOAST DE FEEDBACK ───────────────────────────────────────────────────────

/**
 * mostrarToast(msg, tipo)
 * Exibe uma notificação temporária no canto da tela.
 * MOTIVO: feedback imediato ao usuário sem bloquear a navegação (vs. alert()).
 * Remove o toast automaticamente após 3s usando setTimeout.
 */
function mostrarToast(msg, tipo = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = msg;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  container.appendChild(toast);

  // Força reflow antes de adicionar classe de animação
  void toast.offsetWidth;
  toast.classList.add('toast-visivel');

  setTimeout(() => {
    toast.classList.remove('toast-visivel');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}

// ─── INICIALIZAÇÃO ───────────────────────────────────────────────────────────

function inicializarCarrinho() {
  atualizarBadge();

  // Botão do header abre o drawer
  document.querySelectorAll('.btn-carrinho, .abrir-carrinho').forEach(btn => {
    btn.addEventListener('click', e => { e.preventDefault(); abrirCarrinho(); });
  });

  // Fechar drawer
  const btnFechar = document.getElementById('fechar-carrinho');
  if (btnFechar) btnFechar.addEventListener('click', fecharCarrinho);

  // Overlay fecha ao clicar fora
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.addEventListener('click', fecharCarrinho);

  // Tecla ESC fecha
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharCarrinho();
  });

  // Limpar carrinho
  const btnLimpar = document.getElementById('btn-limpar-carrinho');
  if (btnLimpar) btnLimpar.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar o carrinho?')) limparCarrinho();
  });
}

// Expõe funções necessárias para outros módulos (produtos.js chama adicionarAoCarrinho)
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.mostrarToast        = mostrarToast;
window.inicializarCarrinho = inicializarCarrinho;
window.abrirCarrinho       = abrirCarrinho;
