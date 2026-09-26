/**
 * site.js — nav ao rolar, menu de gaveta, revelar ao entrar na tela,
 * e montagem dos links de WhatsApp a partir de config.js.
 */
(function () {
  'use strict';
  var CFG = window.SOUZ_CONFIG || {};

  /* ------------------------------------------------------------ WhatsApp */
  function numeroWhatsapp() {
    return String(CFG.whatsapp || '').replace(/\D/g, '');
  }

  function linkWhatsapp(mensagem) {
    var numero = numeroWhatsapp();
    var texto = encodeURIComponent(mensagem || CFG.whatsappMensagem || '');
    return 'https://wa.me/' + numero + '?text=' + texto;
  }

  function linkEmailFallback(mensagem) {
    var assunto = encodeURIComponent('Quero conhecer o Souz Controle de Obra');
    var corpo = encodeURIComponent(mensagem || CFG.whatsappMensagem || '');
    return 'mailto:' + (CFG.email || '') + '?subject=' + assunto + '&body=' + corpo;
  }

  function ligarBotoesWhatsapp() {
    var numero = numeroWhatsapp();
    var botoes = document.querySelectorAll('[data-cta="whatsapp"]');
    botoes.forEach(function (el) {
      var mensagem = el.getAttribute('data-cta-mensagem') || '';
      el.setAttribute('href', numero ? linkWhatsapp(mensagem) : linkEmailFallback(mensagem));
      if (numero) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      } else {
        el.removeAttribute('target');
      }
    });

    var flutuante = document.getElementById('whats-flutuante');
    var rodapeWhats = document.getElementById('rodape-whatsapp');
    if (numero) {
      if (flutuante) flutuante.hidden = false;
      if (rodapeWhats) rodapeWhats.hidden = false;
    }
  }

  /* ------------------------------------------------------------ preços */
  function aplicarPrecos() {
    var precos = CFG.precos || {};
    document.querySelectorAll('[data-preco]').forEach(function (el) {
      var chave = el.getAttribute('data-preco');
      var valor = precos[chave];
      if (valor) el.textContent = 'a partir de R$ ' + valor + '/mês';
    });
  }

  /* ------------------------------------------------------------ CNPJ */
  function aplicarCnpj() {
    var cnpj = CFG.cnpj;
    var el = document.getElementById('rodape-cnpj');
    if (cnpj && el) {
      el.textContent = 'CNPJ ' + cnpj;
      el.hidden = false;
    }
  }

  /* ------------------------------------------------------------ depoimentos */
  function aplicarDepoimentos() {
    var lista = CFG.depoimentos || [];
    if (!lista.length) return;
    var secao = document.getElementById('depoimentos');
    var alvo = document.getElementById('depoimentos-lista');
    if (!secao || !alvo) return;
    alvo.innerHTML = lista
      .map(function (d) {
        var nome = esc(d.nome || '');
        var cargo = esc(d.cargo || '');
        var texto = esc(d.texto || '');
        return (
          '<div class="depo"><p class="txt">“' + texto + '”</p>' +
          '<p class="quem"><b>' + nome + '</b>' + (cargo ? ' · ' + cargo : '') + '</p></div>'
        );
      })
      .join('');
    secao.hidden = false;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------ nav sólida */
  function iniciarNav() {
    var nav = document.getElementById('nav-topo');
    if (!nav) return;
    var alternar = function () {
      nav.classList.toggle('nav--solido', window.scrollY > 8);
    };
    alternar();
    window.addEventListener('scroll', alternar, { passive: true });
  }

  /* ------------------------------------------------------------ gaveta mobile */
  function iniciarGaveta() {
    var gaveta = document.getElementById('gaveta');
    var btnAbrir = document.querySelector('[data-acao="abrir-gaveta"]');
    if (!gaveta || !btnAbrir) return;
    var fechar = function () {
      gaveta.classList.remove('aberta');
      gaveta.setAttribute('aria-hidden', 'true');
      btnAbrir.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    var abrir = function () {
      gaveta.classList.add('aberta');
      gaveta.setAttribute('aria-hidden', 'false');
      btnAbrir.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    btnAbrir.addEventListener('click', abrir);
    gaveta.querySelectorAll('[data-acao="fechar-gaveta"]').forEach(function (el) {
      el.addEventListener('click', fechar);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') fechar();
    });
  }

  /* ------------------------------------------------------------ revelar ao rolar */
  function iniciarRevelar() {
    var itens = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      itens.forEach(function (el) { el.classList.add('on'); });
      return;
    }
    var obs = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('on');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    itens.forEach(function (el) { obs.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    ligarBotoesWhatsapp();
    aplicarPrecos();
    aplicarCnpj();
    aplicarDepoimentos();
    iniciarNav();
    iniciarGaveta();
    iniciarRevelar();
  });
})();
