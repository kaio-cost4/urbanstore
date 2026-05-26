UrbanStore — Mini E-commerce
> Projeto acadêmico de Desenvolvimento Web — Etapas 1 e 2
---
Tema
UrbanStore é um mini e-commerce de moda e lifestyle urbano, voltado para jovens adultos (18–40 anos) que valorizam estilo contemporâneo, peças de qualidade e uma experiência de compra digital fluida.
A identidade visual segue uma estética editorial noir — fundo escuro, tipografia serifada elegante (Cormorant Garamond), acento em terracota e composição limpa.
---
Público-Alvo
Perfil	Descrição
Faixa etária	18 a 40 anos
Interesses	Moda, cultura urbana, sustentabilidade, lifestyle
Comportamento	Consome conteúdo em redes sociais, pesquisa antes de comprar
Dispositivos	Mobile-first, também desktop
---
Mapa de Páginas
```
urbanstore/
│
├── index.html              ← Homepage
│   ├── Hero (destaque da coleção + timer)
│   ├── Barra de benefícios
│   ├── Seção: Categorias
│   ├── Seção: Produtos em destaque
│   ├── Seção: Banners promocionais
│   └── Seção: Sobre resumido + estatísticas
│
├── css/
│   └── estilos.css         ← Folha de estilos externa única
│
├── js/
│   ├── produtos.js         ← Array de dados + renderização + filtros
│   ├── carrinho.js         ← localStorage + drawer + toasts
│   ├── formularios.js      ← Máscaras + validação customizada
│   └── ui.js               ← Menu mobile, scroll, timer, animações
│
└── pages/
    ├── produtos.html       ← Catálogo com filtros e ordenação
    ├── sobre.html          ← Institucional + equipe + indicadores
    ├── contato.html        ← Formulário de contato
    └── pedido.html         ← Checkout com formulário de pedido
```
---
Como Rodar
Baixe ou clone o repositório
Abra o arquivo `index.html` diretamente no navegador
Nenhum servidor ou instalação é necessário — tudo é HTML, CSS e JS puro
> As fontes (Google Fonts) requerem conexão com a internet para carregar corretamente.
---
Tecnologias
Tecnologia	Uso
HTML5 semântico	Estrutura de todas as páginas
CSS3 externo	Layout Grid/Flex, variáveis, responsivo
Google Fonts	Cormorant Garamond + Outfit
JavaScript ES6+	DOM, eventos, localStorage, módulos globais
---
Etapa 1 — HTML5 + CSS
Tags semânticas utilizadas
Todas as páginas usam a estrutura semântica completa:
```html
<header>   ← cabeçalho com logo e navegação
<nav>      ← menu principal e breadcrumbs
<main>     ← conteúdo principal da página
<section>  ← blocos temáticos com aria-labelledby
<article>  ← cards de equipe e banners
<aside>    ← sidebar de filtros e painel do carrinho
<footer>   ← rodapé com links e redes sociais
```
Recursos de acessibilidade presentes em todas as páginas:
`skip-link` para pular direto ao conteúdo
`aria-label` e `aria-labelledby` em seções e navegações
`aria-current="page"` no item ativo do menu
`aria-hidden="true"` em elementos decorativos
Listas utilizadas
Página	Lista	Tag
index.html	Categorias	`<ul>`
index.html	Benefícios (frete, troca, etc.)	`<ul>`
index.html	Produtos em destaque	`<ul>`
produtos.html	Grade de produtos (renderizada por JS)	`<ul>`
produtos.html	Filtros de categoria	`<ul>`
sobre.html	Valores da empresa	`<ul>`
contato.html	Informações de contato	`<ul>`
Tabelas utilizadas
Página	Tabela	Colunas principais
produtos.html	Catálogo de produtos	Produto, Categoria, Preço, Tamanhos, Status
sobre.html	Indicadores históricos	Indicador, 2022, 2023, 2024, Meta 2025
contato.html	Horários de atendimento	Dia, Horário
pedido.html	Resumo de totais	Item, Valor
Formulários — campos e validações nativas
contato.html
Campo	Tipo	Validação nativa
Nome	`input[type=text]`	`required`, `minlength=3`
E-mail	`input[type=email]`	`required`
Telefone	`input[type=tel]`	`pattern` para DDD + número
Assunto	`select`	`required`
Mensagem	`textarea`	`required`, `minlength=20`, `maxlength=1000`
Termos	`input[checkbox]`	`required`
pedido.html
Campo	Tipo	Validação nativa
Nome	`input[type=text]`	`required`, `minlength=2`
E-mail	`input[type=email]`	`required`
Celular	`input[type=tel]`	`required`, `pattern`
CPF	`input[type=text]`	`required`, `pattern` 000.000.000-00
Nascimento	`input[type=date]`	`max="2006-12-31"`
CEP	`input[type=text]`	`required`, `pattern` 00000-000
Número	`input[type=number]`	`required`, `min=1`, `max=99999`
Estado	`select`	`required`
Frete	`select`	`required`
Pagamento	`select`	`required`
Cupom	`input[type=text]`	`pattern` letras maiúsculas e números
CSS — sistema de design
O arquivo `css/estilos.css` usa variáveis CSS centralizadas:
```css
:root {
  --preto:       #0c0b0a;
  --terracota:   #b84a2a;   /* cor de destaque */
  --creme:       #f2ece0;   /* fundo claro     */
  --ff-titulo:   'Cormorant Garamond', serif;
  --ff-corpo:    'Outfit', sans-serif;
}
```
Breakpoints responsivos:
Breakpoint	Comportamento
`< 1024px`	Layout de duas colunas vira coluna única
`< 768px`	Menu mobile ativo, padding reduzido
`< 480px`	Botões empilhados, grid de categorias 2 colunas
---
Etapa 2 — JavaScript
Arquitetura dos módulos
Os quatro arquivos JS são carregados no final do `<body>` de cada página, na ordem correta de dependência:
```html
<script src="../js/carrinho.js"></script>    <!-- define adicionarAoCarrinho -->
<script src="../js/produtos.js"></script>    <!-- usa adicionarAoCarrinho     -->
<script src="../js/ui.js"></script>          <!-- interações visuais          -->
<script src="../js/formularios.js"></script> <!-- validação de forms          -->
<script>
  document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrinho();
    UrbanCatalogo.renderizarCatalogo();
    inicializarUI();
  });
</script>
```
> A ordem importa: `carrinho.js` precisa carregar antes de `produtos.js` porque `produtos.js` chama `adicionarAoCarrinho`, que é definida em `carrinho.js`.
---
`js/produtos.js` — Catálogo dinâmico
Responsabilidade: fonte de dados + renderização do catálogo no DOM + filtros + ordenação.
Array de produtos:
```js
const PRODUTOS = [
  { id: 1, nome: 'Vestido Midi Romântico', categoria: 'feminino',
    preco: 189.90, emoji: '', badge: 'Novo', estoque: true },
  // ... 16 produtos no total
];
```
Funções principais:
Função	O que faz
`filtrarProdutos()`	Filtra o array por categoria, preço, estoque e busca
`ordenarProdutos()`	Retorna cópia ordenada sem mutar o original
`criarCardProduto()`	Cria um `<li>` com o card do produto via `createElement`
`renderizarCatalogo()`	Limpa e repopula o `<ul id="grid-produtos">` no DOM
`inicializarFiltros()`	Registra eventos nos checkboxes, slider e select
Conceitos de JS demonstrados: arrays de objetos, `.filter()`, `.sort()`, `.forEach()`, `spread operator`, `createElement`, `innerHTML`, eventos `change` e `input`.
---
`js/carrinho.js` — Carrinho com localStorage
Responsabilidade: persistir o carrinho entre recarregamentos, gerenciar o drawer lateral e exibir toasts de feedback.
Fluxo de dados:
```
adicionarAoCarrinho(produto)
        │
        ├── lerCarrinho()      → JSON.parse(localStorage.getItem(...))
        ├── findIndex()        → verifica se produto já existe
        ├── push() ou qtd += 1 → insere ou incrementa
        ├── salvarCarrinho()   → JSON.stringify + localStorage.setItem
        ├── atualizarBadge()   → atualiza número no botão
        └── mostrarToast()     → notificação temporária na tela
```
Funções principais:
Função	O que faz
`lerCarrinho()`	Lê e faz `JSON.parse` do localStorage
`salvarCarrinho()`	Faz `JSON.stringify` e salva no localStorage
`adicionarAoCarrinho()`	Insere ou incrementa item no carrinho
`removerDoCarrinho()`	Remove item por id usando `.filter()`
`alterarQuantidade()`	Incrementa ou decrementa; remove se chegar a zero
`totalItens()`	Soma todos os `qtd` com `.reduce()`
`atualizarBadge()`	Atualiza todos os `.carrinho-num` na página
`mostrarToast()`	Cria `<div>` temporário com `setTimeout` de 3s
`abrirCarrinho()`	Adiciona classe `.aberto` no drawer lateral
`inicializarCarrinho()`	Registra todos os eventos de UI do carrinho
Conceitos de JS demonstrados: `localStorage`, `JSON.stringify/parse`, `findIndex`, `filter`, `reduce`, `setTimeout`, `classList`, `createElement`, `appendChild`.
---
`js/formularios.js` — Validação customizada
Responsabilidade: máscaras de entrada, mensagens de erro em PT-BR e validação campo a campo.
Máscaras implementadas:
Campo	Exemplo de saída	Como funciona
Telefone	`(11) 99999-0000`	Remove não-dígitos, aplica formatação
CPF	`000.000.000-00`	Remove não-dígitos, insere pontos e traço
CEP	`00000-000`	Remove não-dígitos, insere traço
Fluxo de validação:
```
Usuário sai do campo (blur)
        │
        ▼
validarCampo(input)
        │
        ├── validity.valueMissing   → "O campo X é obrigatório."
        ├── validity.typeMismatch   → "Informe um e-mail válido."
        ├── validity.patternMismatch → mensagem específica por campo
        ├── validity.tooShort       → "Mínimo de N caracteres."
        └── validity.rangeUnderflow/Overflow → "Entre N e M."
                │
                ▼
        setCustomValidity(msg)     → define mensagem customizada
        classList add/remove       → feedback visual verde/vermelho
```
Conceitos de JS demonstrados: eventos `blur`, `input` e `submit`, `Constraint Validation API`, `setCustomValidity`, `reportValidity`, `regex`, `FormData`.
---
`js/ui.js` — Interações de interface
Responsabilidade: comportamentos visuais que não pertencem a nenhum outro módulo.
Função	O que faz
`inicializarMenuMobile()`	Toggle do menu em telas pequenas via `classList.toggle`
`inicializarBuscaHeader()`	Expande/colapsa o campo de busca no header
`inicializarVoltarTopo()`	Botão ↑ aparece após 300px de scroll com throttle
`inicializarAnimacoesScroll()`	Anima elementos com `IntersectionObserver`
`inicializarAccordion()`	Abre/fecha painéis com `aria-expanded`
`inicializarTimer()`	Contador regressivo até meia-noite com `setInterval`
`lerParametrosURL()`	Lê `?busca=` e `?cat=` da URL e pré-ativa filtros
Conceitos de JS demonstrados: `IntersectionObserver`, `setInterval`, `URLSearchParams`, `classList`, `addEventListener`, `scrollY`, throttle com `setTimeout`, `Date`.
---
localStorage — Estrutura dos dados
O carrinho é armazenado com a chave `urbanstore_carrinho`:
```
localStorage
└── urbanstore_carrinho → "[{...},{...}]"  (string JSON)
```
Estrutura de cada item no array:
```js
{
  id:    1,
  nome:  "Vestido Midi Romântico",
  preco: 189.90,
  emoji: "",
  qtd:   2
}
```
Para visualizar no navegador: `F12 → Application → Local Storage`.
---
Conceitos abordados no projeto
Conceito	Onde é usado
Arrays e objetos	`PRODUTOS`, carrinho, filtros
`.filter()`	`filtrarProdutos()`
`.sort()`	`ordenarProdutos()`
`.forEach()`	renderização de cards
`.findIndex()`	verificar item no carrinho
`.reduce()`	`totalItens()`, `totalPreco()`
`localStorage`	persistência do carrinho
`JSON.stringify/parse`	serializar/desserializar o carrinho
`createElement`	criar cards de produto dinamicamente
`innerHTML`	popular conteúdo dos cards
`querySelector(All)`	selecionar elementos no DOM
`addEventListener`	eventos de click, input, blur, submit
`classList`	adicionar/remover classes CSS
`setTimeout`	toasts temporários e throttle
`setInterval`	timer regressivo
`IntersectionObserver`	animações ao scrollar
`URLSearchParams`	ler parâmetros da URL
`setCustomValidity`	mensagens de validação customizadas
Funções puras	`filtrarProdutos`, `ordenarProdutos`
Valores padrão	`qtd = 1` nos parâmetros
Template literals	``R$ ${preco.toFixed(2)}``
Spread operator	`[...lista]` para não mutar o original
Shorthand de objeto	`{ id, nome, preco, qtd }`
`window.*`	expor funções entre arquivos JS
---
Projeto desenvolvido para a disciplina de Desenvolvimento Web — Etapas 1 e 2.
