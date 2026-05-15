/**
 * js/formularios.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MOTIVO: A validação nativa do HTML5 cobre o mínimo (required, pattern), mas
 * tem limitações: mensagens em inglês ou genéricas, sem formatação automática,
 * sem feedback visual em tempo real. Este módulo adiciona:
 *   1. Máscaras de entrada (telefone, CPF, CEP) — via evento 'input'
 *   2. Mensagens de erro customizadas em PT-BR via setCustomValidity()
 *   3. Validação campo a campo ao sair (blur) para feedback imediato
 *   4. Prevenção de envio inválido com destaque visual no primeiro erro
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// ─── 1. MÁSCARAS DE ENTRADA ──────────────────────────────────────────────────
// Interceptam o evento 'input' e reformatam o valor automaticamente.
// Usar replace com regex é mais seguro que manipular o cursor manualmente.

/**
 * aplicarMascara(input, fn)
 * Registra o listener de máscara e aplica imediatamente caso o campo
 * já tenha valor (ex.: ao recarregar com autofill).
 */
function aplicarMascara(input, fn) {
  if (!input) return;
  input.addEventListener('input', () => { input.value = fn(input.value); });
  if (input.value) input.value = fn(input.value); // aplica ao carregar
}

const mascaras = {
  /**
   * Telefone: (11) 99999-0000 ou (11) 9999-0000
   * Remove tudo que não é dígito, depois formata.
   */
  telefone(v) {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2)  return d.replace(/(\d{0,2})/, '($1');
    if (d.length <= 6)  return d.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  },

  /**
   * CPF: 000.000.000-00
   */
  cpf(v) {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3)  return d;
    if (d.length <= 6)  return d.replace(/(\d{3})(\d+)/, '$1.$2');
    if (d.length <= 9)  return d.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  },

  /**
   * CEP: 00000-000
   */
  cep(v) {
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 5) return d;
    return d.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  },
};

// ─── 2. MENSAGENS CUSTOMIZADAS ────────────────────────────────────────────────
// setCustomValidity() sobrescreve a mensagem do navegador.
// Retornando '' (string vazia) indica que o campo é válido.

const mensagens = {
  required:  campo => `O campo "${campo}" é obrigatório.`,
  email:     ()     => 'Informe um e-mail válido (ex.: nome@email.com).',
  tel:       ()     => 'Telefone inválido. Use o formato (DDD) 00000-0000.',
  cpf:       ()     => 'CPF inválido. Use o formato 000.000.000-00.',
  cep:       ()     => 'CEP inválido. Use o formato 00000-000.',
  minlength: (campo, min) => `"${campo}" deve ter pelo menos ${min} caracteres.`,
  number:    (campo, min, max) => `Informe um número entre ${min} e ${max}.`,
  pattern:   campo  => `O formato do campo "${campo}" está incorreto.`,
  select:    campo  => `Selecione uma opção para "${campo}".`,
};

/**
 * validarCampo(input) → bool
 * Avalia o campo, define a mensagem customizada e aplica/remove classe de erro.
 */
function validarCampo(input) {
  const label     = input.labels?.[0]?.textContent?.replace('*','').trim() || input.name || 'Campo';
  const val       = input.validity;
  let   msg       = '';

  if      (val.valueMissing)   msg = mensagens.required(label);
  else if (val.typeMismatch && input.type === 'email') msg = mensagens.email();
  else if (val.patternMismatch) {
    if (input.id?.includes('tel'))   msg = mensagens.tel();
    else if (input.id?.includes('cpf')) msg = mensagens.cpf();
    else if (input.id?.includes('cep')) msg = mensagens.cep();
    else if (input.id?.includes('cupom')) msg = 'Cupom deve conter de 4 a 15 letras maiúsculas/números.';
    else msg = mensagens.pattern(label);
  }
  else if (val.tooShort)       msg = mensagens.minlength(label, input.minLength);
  else if (val.rangeUnderflow || val.rangeOverflow)
                               msg = mensagens.number(label, input.min, input.max);
  else if (input.tagName === 'SELECT' && !input.value)
                               msg = mensagens.select(label);

  input.setCustomValidity(msg);

  // Feedback visual
  const campo = input.closest('.campo') || input.parentElement;
  const erroEl = campo?.querySelector('.campo-erro');

  if (msg) {
    campo?.classList.add('campo-invalido');
    campo?.classList.remove('campo-valido');
    if (erroEl) erroEl.textContent = msg;
  } else {
    campo?.classList.remove('campo-invalido');
    if (input.value) campo?.classList.add('campo-valido');
    if (erroEl) erroEl.textContent = '';
  }

  return !msg;
}

// ─── 3. INICIALIZAR FORMULÁRIO ───────────────────────────────────────────────

/**
 * inicializarFormulario(formId, onSucesso?)
 * Aplica máscaras, validação por blur e intercepta o submit.
 * MOTIVO: centralizar a lógica num único ponto por formulário.
 */
function inicializarFormulario(formId, onSucesso) {
  const form = document.getElementById(formId);
  if (!form) return;

  // — Aplicar máscaras conforme o id do campo
  aplicarMascara(form.querySelector('[id*="tel"]'),    mascaras.telefone);
  aplicarMascara(form.querySelector('[id*="telefone"]'), mascaras.telefone);
  aplicarMascara(form.querySelector('[id*="cpf"]'),    mascaras.cpf);
  aplicarMascara(form.querySelector('[id*="cep"]'),    mascaras.cep);

  // — Validação em tempo real (ao sair do campo)
  form.querySelectorAll('input, select, textarea').forEach(campo => {
    // blur: valida quando o usuário sai do campo
    campo.addEventListener('blur', () => validarCampo(campo));
    // input: re-valida enquanto digita (limpa erro assim que correto)
    campo.addEventListener('input', () => {
      if (campo.closest('.campo-invalido')) validarCampo(campo);
    });
  });

  // — Interceptar submit
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Valida todos os campos antes de aceitar
    const campos = form.querySelectorAll('input, select, textarea');
    let primeiroErro = null;

    campos.forEach(c => {
      const valido = validarCampo(c);
      if (!valido && !primeiroErro) primeiroErro = c;
    });

    if (primeiroErro) {
      // Foca o primeiro campo inválido e exibe a mensagem nativa
      primeiroErro.focus();
      primeiroErro.reportValidity();
      mostrarToast('⚠️ Corrija os campos destacados antes de continuar.', 'erro');
      return;
    }

    // Tudo válido — chama callback ou comportamento padrão
    if (typeof onSucesso === 'function') {
      onSucesso(new FormData(form));
    } else {
      // Comportamento padrão: mostrar mensagem de sucesso embutida
      const msgEl = form.querySelector('.msg-sucesso');
      if (msgEl) {
        msgEl.style.display = 'flex';
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
      // Remove classes de validação após reset
      form.querySelectorAll('.campo-valido, .campo-invalido').forEach(el => {
        el.classList.remove('campo-valido', 'campo-invalido');
      });
    }
  });
}

// ─── 4. CONTADOR DE TEXTAREA ─────────────────────────────────────────────────
/**
 * Adiciona contador de caracteres abaixo de textareas com maxlength.
 * MOTIVO: feedback proativo — o usuário sabe quanto ainda pode digitar.
 */
function inicializarContadores() {
  document.querySelectorAll('textarea[maxlength]').forEach(ta => {
    const max     = Number(ta.maxLength);
    const hint    = ta.closest('.campo')?.querySelector('.campo-hint');
    if (!hint) return;

    ta.addEventListener('input', () => {
      const restam = max - ta.value.length;
      hint.textContent = `${ta.value.length}/${max} caracteres`;
      hint.style.color = restam < 50 ? '#b84a2a' : '';
    });
  });
}

// Exporta
window.inicializarFormulario = inicializarFormulario;
window.inicializarContadores = inicializarContadores;
