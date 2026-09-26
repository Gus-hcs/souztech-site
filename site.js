/**
 * site.js — links de WhatsApp a partir de config.js, nav, gaveta e os
 * efeitos de rolagem. Movimento só em transform/opacity; tudo desliga com
 * prefers-reduced-motion.
 */
(function () {
  'use strict';
  var CFG = window.SOUZ_CONFIG || {};
  var MOVIMENTO = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ WhatsApp */
  function numeroWhatsapp() {
    return String(CFG.whatsapp || '').replace(/\D/g, '');
  }

  function ligarBotoesWhatsapp() {
    var numero = numeroWhatsapp();
    document.querySelectorAll('[data-cta="whatsapp"]').forEach(function (el) {
      var mensagem = el.getAttribute('data-cta-mensagem') || CFG.whatsappMensagem || '';
      if (numero) {
        el.href = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensagem);
        el.target = '_blank';
        el.rel = 'noopener';
      } else {
        el.href =
          'mailto:' + (CFG.email || '') +
          '?subject=' + encodeURIComponent('Quero conhecer o Souz Controle de Obra') +
          '&body=' + encodeURIComponent(mensagem);
      }
    });
    if (numero) {
      ['whats-flutuante', 'rodape-whatsapp'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.hidden = false;
      });
    }
  }

  function aplicarConfig() {
    var precos = CFG.precos || {};
    document.querySelectorAll('[data-preco]').forEach(function (el) {
      var valor = precos[el.getAttribute('data-preco')];
      if (valor) el.textContent = 'a partir de R$ ' + valor + '/mês';
    });

    var cnpj = document.getElementById('rodape-cnpj');
    if (CFG.cnpj && cnpj) {
      cnpj.textContent = 'CNPJ ' + CFG.cnpj;
      cnpj.hidden = false;
    }

    var lista = CFG.depoimentos || [];
    var secao = document.getElementById('depoimentos');
    var alvo = document.getElementById('depoimentos-lista');
    if (lista.length && secao && alvo) {
      alvo.innerHTML = lista
        .map(function (d) {
          return (
            '<div class="depo"><p class="txt">“' + esc(d.texto) + '”</p>' +
            '<p class="quem"><b>' + esc(d.nome) + '</b>' + (d.cargo ? ' · ' + esc(d.cargo) : '') + '</p></div>'
          );
        })
        .join('');
      secao.hidden = false;
    }
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------ gaveta */
  function iniciarGaveta() {
    var gaveta = document.getElementById('gaveta');
    var abrir = document.querySelector('[data-acao="abrir-gaveta"]');
    if (!gaveta || !abrir) return;
    function definir(aberta) {
      gaveta.classList.toggle('aberta', aberta);
      gaveta.setAttribute('aria-hidden', String(!aberta));
      abrir.setAttribute('aria-expanded', String(aberta));
      document.body.style.overflow = aberta ? 'hidden' : '';
    }
    abrir.addEventListener('click', function () { definir(true); });
    gaveta.querySelectorAll('[data-acao="fechar-gaveta"]').forEach(function (el) {
      el.addEventListener('click', function () { definir(false); });
    });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') definir(false); });
  }

  /* ------------------------------------------------------------ revelar */
  function iniciarRevelar() {
    var itens = document.querySelectorAll('.rv');
    if (!MOVIMENTO || !('IntersectionObserver' in window)) {
      itens.forEach(function (el) { el.classList.add('on'); });
      return;
    }
    var obs = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    itens.forEach(function (el) { obs.observe(el); });
  }

  /* ------------------------------------------------------------ manifesto */
  function prepararManifesto() {
    var p = document.querySelector('[data-manifesto]');
    if (!p) return null;
    var palavras = [];
    function quebrar(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (filho) {
        if (filho.nodeType === 3) {
          var frag = document.createDocumentFragment();
          filho.textContent.split(/(\s+)/).forEach(function (pedaco) {
            if (!pedaco) return;
            if (/^\s+$/.test(pedaco)) { frag.appendChild(document.createTextNode(pedaco)); return; }
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = pedaco;
            palavras.push(s);
            frag.appendChild(s);
          });
          no.replaceChild(frag, filho);
        } else if (filho.nodeType === 1) {
          quebrar(filho);
        }
      });
    }
    quebrar(p);
    return { el: p, palavras: palavras, acesas: -1 };
  }

  /* ------------------------------------------------------------ história com tela fixa */
  function iniciarHistoria() {
    var raiz = document.querySelector('[data-historia]');
    if (!raiz) return;
    var passos = raiz.querySelectorAll('[data-passo]');
    var telas = raiz.querySelectorAll('.pilha > picture');
    var rotulo = raiz.querySelector('[data-historia-rotulo]');
    var num = raiz.querySelector('[data-historia-num]');
    var trilho = raiz.querySelector('[data-historia-trilho]');
    var total = passos.length;

    function ativar(i) {
      passos.forEach(function (p, j) { p.classList.toggle('ativo', j === i); });
      telas.forEach(function (t, j) { t.classList.toggle('ativo', j === i); });
      if (rotulo && telas[i]) rotulo.textContent = telas[i].getAttribute('data-rotulo');
      if (num) num.textContent = '0' + (i + 1) + ' / 0' + total;
      if (trilho) trilho.style.transform = 'scaleX(' + (i + 1) / total + ')';
    }
    ativar(0);

    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) ativar(Number(e.target.getAttribute('data-passo')));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    passos.forEach(function (p) { obs.observe(p); });
  }

  /* ------------------------------------------------------------ laço de rolagem */
  function iniciarRolagem() {
    var nav = document.getElementById('nav-topo');
    var barra = document.querySelector('.progresso');
    var heroTela = document.querySelector('[data-hero-tela]');
    var paralaxe = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    var manifesto = MOVIMENTO ? prepararManifesto() : null;
    var pendente = false;

    function quadro() {
      pendente = false;
      var y = window.scrollY;
      var vh = window.innerHeight;
      var doc = document.documentElement.scrollHeight - vh;

      if (nav) nav.classList.toggle('nav--solido', y > 8);
      if (!MOVIMENTO) return;

      if (barra) barra.style.transform = 'scaleX(' + (doc > 0 ? Math.min(1, y / doc) : 0) + ')';

      if (heroTela) {
        var r = heroTela.getBoundingClientRect();
        var p = 1 - (r.top - vh * 0.18) / (vh * 0.62);
        heroTela.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      }

      paralaxe.forEach(function (el) {
        var rr = el.getBoundingClientRect();
        if (rr.bottom < -100 || rr.top > vh + 100) return;
        var centro = (rr.top + rr.height / 2 - vh / 2) / vh;
        var amp = Number(el.getAttribute('data-parallax')) || 16;
        var base = el.tagName === 'IMG' ? ' scale(1.06)' : '';
        el.style.transform = 'translate3d(0,' + (centro * amp).toFixed(1) + 'px,0)' + base;
      });

      if (manifesto) {
        var mr = manifesto.el.getBoundingClientRect();
        var prog = (vh * 0.82 - mr.top) / (mr.height + vh * 0.35);
        var n = Math.round(Math.max(0, Math.min(1, prog)) * manifesto.palavras.length);
        if (n !== manifesto.acesas) {
          manifesto.palavras.forEach(function (w, i) { w.classList.toggle('on', i < n); });
          manifesto.acesas = n;
        }
      }
    }

    function agendar() {
      if (!pendente) { pendente = true; requestAnimationFrame(quadro); }
    }
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    quadro();
  }

  /* ------------------------------------------------------------ ampliar tela */
  function iniciarZoom() {
    var dialogo = document.getElementById('zoom');
    if (!dialogo || typeof dialogo.showModal !== 'function') return;
    var imagem = dialogo.querySelector('img');

    function maior(src) {
      if (/-mobile-\d+\./.test(src)) return src.replace(/-(390|780|1170)\.(avif|webp|jpg)$/, '-1170.webp');
      return src.replace(/-(1280|2560)\.(avif|webp|jpg)$/, '-2560.webp');
    }
    function abrir(janela) {
      var img = janela.querySelector('picture img');
      var origem = img.currentSrc || img.src;
      imagem.src = maior(origem);
      imagem.alt = img.alt || janela.getAttribute('data-rotulo') || '';
      dialogo.showModal();
    }

    document.querySelectorAll('.janela').forEach(function (janela) {
      if (!janela.querySelector('picture img') || janela.closest('.historia__visual')) return;
      janela.setAttribute('data-zoom', '');
      janela.setAttribute('tabindex', '0');
      janela.setAttribute('role', 'button');
      janela.setAttribute('aria-label', 'Ampliar tela');
      janela.addEventListener('click', function () { abrir(janela); });
      janela.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(janela); }
      });
    });

    var visual = document.querySelector('.historia__visual .janela');
    if (visual) {
      visual.setAttribute('data-zoom', '');
      visual.addEventListener('click', function () {
        var ativa = visual.querySelector('.pilha > picture.ativo img');
        if (!ativa) return;
        imagem.src = maior(ativa.currentSrc || ativa.src);
        imagem.alt = '';
        dialogo.showModal();
      });
    }

    dialogo.querySelector('[data-acao="fechar-zoom"]').addEventListener('click', function () { dialogo.close(); });
    dialogo.addEventListener('click', function (ev) { if (ev.target === dialogo) dialogo.close(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    ligarBotoesWhatsapp();
    aplicarConfig();
    iniciarZoom();
    iniciarGaveta();
    iniciarRevelar();
    iniciarHistoria();
    iniciarRolagem();
  });
})();
