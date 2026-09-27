/**
 * site.js — links de WhatsApp a partir de config.js, nav (sólida depois de
 * 40px, link da seção ativa), gaveta, CTA fixo no celular e os efeitos: o
 * gabarito (malha isométrica que acende sob o cursor), reveal em cascata
 * que nunca deixa caixa vazia, as cotas do topo, o brilho dos cards, as
 * planilhas que convergem para o botão, os checks dos planos, a história
 * com tela fixa, a linha da obra presa na horizontal, marca d'água e
 * paralaxe. Leads: prova de origem (e depoimentos de depoimentos.json),
 * relatório de exemplo, "Conte sobre sua carteira", calculadora de caixa em
 * risco e souzEvento (medição, desligada em config.js). Só transform e
 * opacity; tudo reduz com prefers-reduced-motion.
 */
(function () {
  'use strict';
  var CFG = window.SOUZ_CONFIG || {};
  var MOVIMENTO = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ medição
     souzEvento(nome, props): usa Plausible, gtag ou Umami se estiverem na
     página — e só com ANALYTICS_LIGADO (config.js). Nunca manda dado
     pessoal: só o nome do evento e de onde veio (ex.: local: 'topo'). */
  function souzEvento(nome, props) {
    if (!CFG.analytics) return;
    var p = props || {};
    try {
      if (typeof window.plausible === 'function') window.plausible(nome, { props: p });
      else if (typeof window.gtag === 'function') window.gtag('event', nome, p);
      else if (window.umami && typeof window.umami.track === 'function') window.umami.track(nome, p);
    } catch (e) { /* medição nunca quebra a página */ }
  }
  window.souzEvento = souzEvento;

  /* ------------------------------------------------------------ WhatsApp */
  function numeroWhatsapp() {
    return String(CFG.whatsapp || '').replace(/\D/g, '');
  }
  /* link do WhatsApp com a mensagem pronta (ou e-mail, se não houver número) */
  function linkContato(mensagem) {
    var numero = numeroWhatsapp();
    if (numero) return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensagem);
    return 'mailto:' + (CFG.email || '') + '?subject=' + encodeURIComponent('Quero conhecer o Souz Controle de Obra') +
      '&body=' + encodeURIComponent(mensagem);
  }
  function abrirContato(mensagem) {
    var url = linkContato(mensagem);
    var janela = window.open(url, '_blank', 'noopener');
    if (!janela) window.location.href = url;
  }

  function ligarBotoesWhatsapp() {
    var numero = numeroWhatsapp();
    document.querySelectorAll('[data-cta="whatsapp"]').forEach(function (el) {
      var mensagem = el.getAttribute('data-cta-mensagem') || CFG.whatsappMensagem || '';
      el.href = linkContato(mensagem);
      if (numero) {
        el.target = '_blank';
        el.rel = 'noopener';
      }
      el.addEventListener('click', function () {
        souzEvento('cta-whatsapp', { local: el.getAttribute('data-local') || '' });
      });
    });
    document.querySelectorAll('a[data-evento]').forEach(function (el) {
      if (el.hasAttribute('data-calc-whats')) return;
      el.addEventListener('click', function () {
        souzEvento(el.getAttribute('data-evento'), { local: el.getAttribute('data-local') || '' });
      });
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
      var valor = String(precos[el.getAttribute('data-preco')] || '').trim();
      if (valor) el.textContent = 'a partir de R$ ' + valor + '/mês';
    });
    var impl = String(CFG.implantacao || '').trim();
    var linhaImpl = document.querySelector('[data-implantacao]');
    if (impl && linhaImpl) {
      linhaImpl.textContent = 'Implantação assistida: ' + (/^[\d.,]+$/.test(impl) ? 'R$ ' + impl : impl);
      linhaImpl.hidden = false;
    }

    var cnpj = document.getElementById('rodape-cnpj');
    if (CFG.cnpj && cnpj) {
      cnpj.textContent = 'CNPJ ' + CFG.cnpj;
      cnpj.hidden = false;
    }
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------ gaveta
     Fechada, fica fora da navegação e da leitura (inert + aria-hidden). */
  function iniciarGaveta() {
    var gaveta = document.getElementById('gaveta');
    var abrir = document.querySelector('[data-acao="abrir-gaveta"]');
    if (!gaveta || !abrir) return;
    function definir(aberta) {
      gaveta.classList.toggle('aberta', aberta);
      gaveta.setAttribute('aria-hidden', String(!aberta));
      if (aberta) gaveta.removeAttribute('inert');
      else gaveta.setAttribute('inert', '');
      abrir.setAttribute('aria-expanded', String(aberta));
      document.body.style.overflow = aberta ? 'hidden' : '';
    }
    abrir.addEventListener('click', function () { definir(true); });
    gaveta.querySelectorAll('[data-acao="fechar-gaveta"]').forEach(function (el) {
      el.addEventListener('click', function () { definir(false); });
    });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') definir(false); });
  }

  /* ------------------------------------------------------------ revelar
     Visível por padrão. Só espera a entrada (.espera) o que estava abaixo
     da tela na carga — e só com o IntersectionObserver confirmado
     (.js-reveal). Garantias de que nada aparece vazio:
     - o observador dispara 200px antes do elemento entrar;
     - a cada rolagem, o que está na tela ou acima dela aparece na hora;
     - uma rede de segurança revela o que ficou 1,2 s na tela ou acima sem
       ter aparecido;
     - clique em âncora (menu) revela, sem animação, tudo até o destino;
     - rolagem rápida desliga a transição (.sem-anim);
     - recarga com #âncora não esconde nada. */
  var revelados = [];
  var visivelDesde = typeof WeakMap === 'function' ? new WeakMap() : null;
  function revelar(el) {
    if (el.classList.contains('on')) return;
    el.classList.add('on');
    el.classList.remove('espera');
    el.dispatchEvent(new CustomEvent('revelado'));
    /* o atraso da cascata é só da entrada: sai depois, para não atrasar o hover */
    if (el.style.transitionDelay) {
      setTimeout(function () { el.style.transitionDelay = ''; }, 900);
    }
  }
  function semAnimacao(fn) {
    var raiz = document.documentElement;
    raiz.classList.add('sem-anim');
    fn();
    void raiz.offsetWidth;
    setTimeout(function () { raiz.classList.remove('sem-anim'); }, 60);
  }
  function iniciarRevelar() {
    var itens = Array.prototype.slice.call(document.querySelectorAll('.rv'));
    revelados = itens;
    var raiz = document.documentElement;
    var comObservador = raiz.classList.contains('js-reveal') && 'IntersectionObserver' in window;
    var vh = window.innerHeight;
    /* recarga com #âncora: o navegador ainda vai rolar até ela — não esconde nada */
    var comAncora = !!window.location.hash;
    itens.forEach(function (el) {
      if (!comObservador || comAncora || el.getBoundingClientRect().top < vh) {
        el.classList.add('on');
        return;
      }
      el.classList.add('espera');
      /* cascata: posição entre os irmãos que também esperam */
      var irmaos = Array.prototype.filter.call(el.parentElement.children, function (x) {
        return x.classList.contains('rv');
      });
      var i = irmaos.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
    });
    if (!comObservador) return;
    var obs = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) { revelar(e.target); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 200px 0px' }
    );
    itens.forEach(function (el) { if (!el.classList.contains('on')) obs.observe(el); });

    /* âncoras: revela sem animação tudo entre aqui e o destino */
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (!a) return;
      var alvo = a.getAttribute('href').length > 1 && document.querySelector(a.getAttribute('href'));
      if (!alvo) return;
      var ate = alvo.getBoundingClientRect().top + window.scrollY + window.innerHeight * 1.5;
      semAnimacao(function () {
        revelados.forEach(function (el) {
          if (!el.classList.contains('on') && el.getBoundingClientRect().top + window.scrollY < ate) revelar(el);
        });
      });
    });
    window.addEventListener('hashchange', function () { varrerRevelar(window.scrollY, window.innerHeight, true); });

    /* rede de segurança: 1,2 s na tela (ou acima) sem aparecer → aparece */
    var rede = setInterval(function () {
      var pendentes = 0;
      var agora = performance.now();
      revelados.forEach(function (el) {
        if (el.classList.contains('on')) return;
        pendentes++;
        if (el.getBoundingClientRect().top < window.innerHeight) {
          var desde = visivelDesde ? visivelDesde.get(el) : null;
          if (!desde) { if (visivelDesde) visivelDesde.set(el, agora); }
          else if (agora - desde >= 1200) semAnimacao(function () { revelar(el); });
        }
      });
      if (!pendentes) clearInterval(rede);
    }, 300);
  }
  /* chamado a cada quadro de rolagem: o que está na tela ou acima aparece */
  var rolagemAnterior = { y: window.scrollY, t: 0 };
  var fimRapida = 0;
  function varrerRevelar(y, vh, instantaneo) {
    var agora = performance.now();
    var dt = agora - rolagemAnterior.t;
    var vel = dt > 0 ? Math.abs(y - rolagemAnterior.y) / dt : 0;
    rolagemAnterior = { y: y, t: agora };
    var raiz = document.documentElement;
    if (vel > 2.5 || instantaneo) {
      raiz.classList.add('sem-anim');
      clearTimeout(fimRapida);
      fimRapida = setTimeout(function () { raiz.classList.remove('sem-anim'); }, 260);
    }
    for (var i = 0; i < revelados.length; i++) {
      var el = revelados[i];
      if (el.classList.contains('on')) continue;
      if (el.getBoundingClientRect().top < vh) revelar(el);
    }
  }

  /* ------------------------------------------------------------ prova (B1)
     depoimentos.json: só entra item com "publicar": true; sem nenhum, fica a
     faixa de origem (já no HTML). Vídeo: só aparece se o arquivo existir. */
  function iniciarProva() {
    var caixa = document.querySelector('[data-prova-depoimentos]');
    var origem = document.querySelector('[data-prova-origem]');
    if (caixa && window.fetch) {
      fetch('depoimentos.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (lista) {
          var ok = (Array.isArray(lista) ? lista : []).filter(function (d) { return d && d.publicar === true; });
          if (!ok.length) return;
          caixa.innerHTML = ok.map(function (d) {
            return '<figure class="depo-card">' +
              (d.foto ? '<img src="' + esc(d.foto) + '" alt="" width="56" height="56" loading="lazy">' : '<span></span>') +
              '<div><blockquote>“' + esc(d.frase) + '”</blockquote>' +
              '<figcaption><b>' + esc(d.nome) + '</b>' + (d.cargo ? ' · ' + esc(d.cargo) : '') +
              (d.empresa ? ' · ' + esc(d.empresa) : '') + '</figcaption></div></figure>';
          }).join('');
          caixa.hidden = false;
          if (origem) origem.hidden = true;
        })
        .catch(function () { /* sem o arquivo, fica a faixa de origem */ });
    }
    var video = CFG.video || {};
    var fig = document.querySelector('[data-prova-video]');
    if (fig && video.src && window.fetch) {
      fetch(video.src, { method: 'HEAD' })
        .then(function (r) {
          if (!r.ok) return;
          var v = fig.querySelector('video');
          if (video.poster) v.poster = video.poster;
          v.src = video.src; // preload="none": nada baixa até o clique no play
          v.addEventListener('play', function () { souzEvento('video-play', { local: 'prova' }); }, { once: true });
          fig.hidden = false;
        })
        .catch(function () {});
    }
  }

  /* ------------------------------------------------------------ envio ao endpoint
     Só se FORM_ENDPOINT estiver preenchido. Nada além do que o formulário
     pede (o contato, ou as respostas dos chips). */
  function enviarEndpoint(dados) {
    if (!CFG.formEndpoint || !window.fetch) return Promise.reject(new Error('sem endpoint'));
    var corpo = Object.assign({}, CFG.formCamposExtras || {}, dados);
    return fetch(CFG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(corpo),
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    });
  }

  /* ------------------------------------------------------------ relatório de exemplo (B3) */
  function iniciarIsca() {
    var form = document.querySelector('[data-form="isca"]');
    if (!form) return;
    var campo = form.querySelector('[name="contato"]');
    var aceite = form.querySelector('[name="consentimento"]');
    var status = form.querySelector('.form-status');
    var botao = form.querySelector('button[type="submit"]');
    var MSG = 'Oi, quero ver o relatório de exemplo do Souz';
    function avisar(texto, tom, html) {
      status.className = 'form-status' + (tom ? ' ' + tom : '');
      if (html) status.innerHTML = texto; else status.textContent = texto;
    }
    function contatoValido(v) {
      var email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      var digitos = v.replace(/\D/g, '');
      var fone = !/@/.test(v) && digitos.length >= 10 && digitos.length <= 13;
      return email || fone;
    }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = campo.value.trim();
      campo.removeAttribute('aria-invalid');
      if (!contatoValido(v)) {
        campo.setAttribute('aria-invalid', 'true');
        campo.focus();
        avisar('Confira o contato: um e-mail (nome@empresa.com) ou um WhatsApp com DDD.', 'erro');
        return;
      }
      if (!aceite.checked) {
        aceite.focus();
        avisar('Para mandar o relatório, marque a autorização de contato.', 'erro');
        return;
      }
      souzEvento('relatorio-exemplo', { destino: CFG.formEndpoint ? 'formulario' : 'whatsapp' });
      /* honeypot preenchido: robô — finge que deu certo e não manda nada */
      if (form.querySelector('[name="site_empresa"]').value) { avisar('Recebido.', 'ok'); form.reset(); return; }
      if (!CFG.formEndpoint) {
        abrirContato(MSG);
        avisar('Abrimos o WhatsApp com a mensagem pronta. É só enviar.', 'ok');
        return;
      }
      botao.disabled = true;
      avisar('Enviando…');
      enviarEndpoint({ origem: 'relatorio-exemplo', contato: v, consentimento: true })
        .then(function () {
          avisar('Recebido. Vamos mandar o relatório de exemplo para ' + v + '.', 'ok');
          form.reset();
        })
        .catch(function () {
          avisar('Não deu para enviar agora. Tente de novo ou <a href="' + esc(linkContato(MSG)) + '" target="_blank" rel="noopener">peça pelo WhatsApp</a>.', 'erro', true);
        })
        .then(function () { botao.disabled = false; });
    });
  }

  /* ------------------------------------------------------------ conte sobre sua carteira (B4) */
  function iniciarQualifica() {
    var form = document.querySelector('[data-form="qualifica"]');
    if (!form) return;
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var r = {};
      var falta = [];
      [['obras', 'quantas obras'], ['controle', 'onde controla'], ['problema', 'o maior problema']].forEach(function (p) {
        var marcado = form.querySelector('[name="' + p[0] + '"]:checked');
        if (marcado) r[p[0]] = marcado.value; else falta.push(p[1]);
      });
      if (falta.length) {
        status.className = 'form-status erro';
        status.textContent = 'Falta escolher: ' + falta.join(', ') + '.';
        var primeiro = form.querySelector('[name="' + (!r.obras ? 'obras' : !r.controle ? 'controle' : 'problema') + '"]');
        if (primeiro) primeiro.focus();
        return;
      }
      var mensagem = 'Olá! Quero conhecer o Souz. Tenho ' + r.obras + ' obras ativas, hoje controlo em ' +
        r.controle + ' e o meu maior problema é ' + r.problema + '.';
      souzEvento('qualifica-whatsapp', { obras: r.obras, controle: r.controle, problema: r.problema });
      abrirContato(mensagem);
      if (CFG.formEndpoint) enviarEndpoint({ origem: 'sua-carteira', obras: r.obras, controle: r.controle, problema: r.problema }).catch(function () {});
      status.className = 'form-status ok';
      status.textContent = 'Abrimos o WhatsApp com as suas respostas. É só enviar.';
    });
  }

  /* ------------------------------------------------------------ calculadora caixa em risco (B5)
     obras × gasto médio mensal por obra × (dias de atraso ÷ 30). Nada é
     guardado nem enviado — só vai no WhatsApp se a pessoa clicar. */
  function lerNumero(v) {
    var s = String(v || '').replace(/[^\d.,]/g, '');
    if (!s) return 0;
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/\.\d{3}(\.|$)/.test(s)) s = s.replace(/\./g, '');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }
  function iniciarCalc() {
    var raiz = document.querySelector('[data-calc]');
    if (!raiz) return;
    var fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    var obras = raiz.querySelector('[data-calc-obras]');
    var gasto = raiz.querySelector('[data-calc-gasto]');
    var dias = raiz.querySelector('[data-calc-dias]');
    var saida = raiz.querySelector('[data-calc-valor]');
    var botao = raiz.querySelector('[data-calc-whats]');
    var mostrado = 0;
    var anim = 0;
    var medido = false;
    function valores() {
      var o = Math.max(0, Math.round(lerNumero(obras.value)));
      var g = Math.max(0, lerNumero(gasto.value));
      var d = Math.max(0, Math.round(lerNumero(dias.value)));
      return { o: o, g: g, d: d, total: o * g * (d / 30) };
    }
    function contar(ate) {
      cancelAnimationFrame(anim);
      var de = mostrado;
      if (!MOVIMENTO || Math.abs(ate - de) < 1) { mostrado = ate; saida.textContent = fmt.format(ate); return; }
      var t0 = performance.now();
      var dur = 1200;
      (function passo(t) {
        var k = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3); // easeOutCubic
        mostrado = de + (ate - de) * e;
        saida.textContent = fmt.format(mostrado);
        if (k < 1) anim = requestAnimationFrame(passo);
      })(t0);
    }
    function atualizar() {
      var v = valores();
      contar(v.total);
      var msg = 'Olá! Fiz a conta no site do Souz: ' + v.o + ' obras ativas, gasto médio de ' + fmt.format(v.g) +
        ' por obra ao mês e ' + v.d + ' dias de atraso no recebimento — cerca de ' + fmt.format(v.total) +
        ' parado. Quero ver isso no Souz.';
      botao.href = linkContato(msg);
      botao.target = '_blank';
      botao.rel = 'noopener';
    }
    [obras, gasto, dias].forEach(function (c) {
      c.addEventListener('input', function () {
        atualizar();
        if (!medido) { medido = true; souzEvento('calculadora-usada', {}); }
      });
    });
    botao.addEventListener('click', function () { souzEvento('calculadora-whatsapp', {}); });
    /* o primeiro resultado conta a partir de zero quando a calculadora aparece */
    saida.textContent = fmt.format(0);
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { atualizar(); obs.disconnect(); }
      }, { threshold: 0.4 });
      obs.observe(raiz);
    } else {
      atualizar();
    }
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

  /* ------------------------------------------------------------ história com tela fixa
     O texto troca a cada etapa; a tela da direita troca por crossfade de
     300 ms (CSS). No celular, empilhado, sem nada preso. */
  function iniciarHistoria() {
    var raiz = document.querySelector('[data-historia]');
    if (!raiz) return;
    var passos = raiz.querySelectorAll('[data-passo]');
    var telas = raiz.querySelectorAll('.pilha > picture');
    var rotulo = raiz.querySelector('[data-historia-rotulo]');
    var num = raiz.querySelector('[data-historia-num]');
    var trilho = raiz.querySelector('[data-historia-trilho]');
    var total = passos.length;
    var atual = -1;

    function ativar(i) {
      if (i === atual) return;
      atual = i;
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
    var hero = document.getElementById('topo');
    var contato = document.getElementById('contato');
    var ctaFixo = document.getElementById('cta-fixo');
    var paralaxe = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    var marcas = Array.prototype.slice.call(document.querySelectorAll('.marca-dagua'));
    var manifesto = MOVIMENTO ? prepararManifesto() : null;
    var trilha = iniciarTrilha();
    var pendente = false;

    function quadro() {
      pendente = false;
      var y = window.scrollY;
      var vh = window.innerHeight;
      var doc = document.documentElement.scrollHeight - vh;

      if (nav) nav.classList.toggle('nav--solido', y > 40);
      varrerRevelar(y, vh);

      /* CTA fixo (celular): depois do topo, e some ao chegar no fechamento */
      if (ctaFixo && hero) {
        var passou = hero.getBoundingClientRect().bottom < 0;
        var fim = contato ? contato.getBoundingClientRect().top < vh : false;
        var mostra = passou && !fim;
        ctaFixo.classList.toggle('visivel', mostra);
        document.body.classList.toggle('com-cta-fixo', mostra);
      }

      if (!MOVIMENTO) return;

      if (barra) barra.style.transform = 'scaleX(' + (doc > 0 ? Math.min(1, y / doc) : 0) + ')';
      if (trilha) trilha();

      /* a inclinação de 6° do print se desfaz na primeira meia tela de rolagem */
      if (heroTela) {
        var p = Math.max(0, Math.min(1, y / (vh * 0.5)));
        heroTela.style.setProperty('--p', p.toFixed(3));
      }

      paralaxe.forEach(function (el) {
        var rr = el.getBoundingClientRect();
        if (rr.bottom < -100 || rr.top > vh + 100) return;
        var centro = (rr.top + rr.height / 2 - vh / 2) / vh;
        var amp = Number(el.getAttribute('data-parallax')) || 16;
        var base = el.tagName === 'IMG' ? ' scale(1.06)' : '';
        el.style.transform = 'translate3d(0,' + (centro * amp).toFixed(1) + 'px,0)' + base;
      });

      /* marca d'água: anda a 0,15× da rolagem (medido pela seção, não por ela) */
      marcas.forEach(function (el) {
        var sr = el.parentElement.getBoundingClientRect();
        if (sr.bottom < -200 || sr.top > vh + 200) return;
        var d = sr.top + sr.height / 2 - vh / 2;
        var fator = Number(el.getAttribute('data-fator')) || 0.15;
        el.style.transform = 'translate3d(0,' + (-d * fator).toFixed(1) + 'px,0)';
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

  /* ------------------------------------------------------------ cotas do topo
     Acendem depois que o print entra; passar o mouse numa cota acende o
     ponto na tela, e vice-versa. O pulso em sequência (1 → 4) é CSS. */
  function iniciarCotas() {
    var janela = document.querySelector('[data-hero-janela]');
    if (janela) {
      if (MOVIMENTO) setTimeout(function () { janela.classList.add('marcado'); }, 1100);
      else janela.classList.add('marcado');
    }
    var itens = document.querySelectorAll('.cotas [data-marca]');
    var pontos = document.querySelectorAll('.marcas [data-marca]');
    function focar(n) {
      itens.forEach(function (el) { el.classList.toggle('foco', el.getAttribute('data-marca') === n); });
      pontos.forEach(function (el) { el.classList.toggle('foco', el.getAttribute('data-marca') === n); });
    }
    [itens, pontos].forEach(function (lista) {
      lista.forEach(function (el) {
        el.addEventListener('mouseenter', function () { focar(el.getAttribute('data-marca')); });
        el.addEventListener('mouseleave', function () { focar(''); });
      });
    });
  }

  /* ------------------------------------------------------------ cards do problema
     O brilho segue o cursor: --mx/--my em px (a suavização de 150 ms é a
     transição da propriedade, CSS). */
  function iniciarBrilhoCards() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.fato').forEach(function (card) {
      card.addEventListener('pointermove', function (ev) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (ev.clientX - r.left).toFixed(0) + 'px');
        card.style.setProperty('--my', (ev.clientY - r.top).toFixed(0) + 'px');
      });
    });
  }

  /* ------------------------------------------------------------ planilhas → um sistema só
     Ao entrar, os chips se riscam um a um (CSS, 120 ms); depois, cópias
     deles (aria-hidden — o texto original fica onde está) convergem para o
     botão, que acende. */
  function iniciarSubstitui() {
    var lista = document.querySelector('.substitui');
    if (!lista) return;
    var botao = lista.querySelector('.souz');
    var chips = Array.prototype.slice.call(lista.querySelectorAll('.item'));
    function acender() { lista.classList.add('aceso'); }
    function convergir() {
      if (!MOVIMENTO || document.documentElement.classList.contains('sem-anim')) { acender(); return; }
      var base = lista.getBoundingClientRect();
      var alvo = botao.getBoundingClientRect();
      var ax = alvo.left + alvo.width / 2;
      var ay = alvo.top + alvo.height / 2;
      var copias = chips.map(function (chip, i) {
        var r = chip.getBoundingClientRect();
        var c = chip.cloneNode(true);
        c.classList.add('item-voo');
        c.setAttribute('aria-hidden', 'true');
        c.style.left = (r.left - base.left) + 'px';
        c.style.top = (r.top - base.top) + 'px';
        c.style.width = r.width + 'px';
        c.style.transitionDelay = i * 70 + 'ms';
        lista.appendChild(c);
        return { el: c, dx: ax - (r.left + r.width / 2), dy: ay - (r.top + r.height / 2) };
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          copias.forEach(function (c) {
            c.el.style.transform = 'translate(' + c.dx.toFixed(0) + 'px,' + c.dy.toFixed(0) + 'px) scale(0.35)';
            c.el.style.opacity = '0';
          });
        });
      });
      setTimeout(acender, 520 + chips.length * 70);
      setTimeout(function () { copias.forEach(function (c) { c.el.remove(); }); }, 900 + chips.length * 70);
    }
    lista.addEventListener('revelado', function () {
      /* espera o último risco (6 × 120 ms + 500 ms) */
      setTimeout(convergir, MOVIMENTO ? 1250 : 0);
    });
    if (lista.classList.contains('on')) convergir();
  }

  /* ------------------------------------------------------------ planos: check que se traça */
  function iniciarChecks() {
    document.querySelectorAll('.plano').forEach(function (plano) {
      plano.querySelectorAll('li').forEach(function (li, i) {
        li.insertAdjacentHTML(
          'afterbegin',
          '<svg class="check" viewBox="0 0 14 14" aria-hidden="true"><path pathLength="1" d="M2 7.5 5.6 11 12 3.5"/></svg>'
        );
        li.querySelector('.check path').style.transitionDelay = 250 + i * 140 + 'ms';
      });
    });
  }

  /* ------------------------------------------------------------ link da seção ativa */
  function iniciarNavAtiva() {
    if (!('IntersectionObserver' in window)) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a.navlink'));
    var alvos = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var obs = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = '#' + e.target.id;
          links.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('href') === id); });
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    alvos.forEach(function (s) { obs.observe(s); });
  }

  /* ------------------------------------------------------------ gabarito
     A malha isométrica do Manual (prancha 04): três famílias de linhas —
     verticais e ±30° — que se cruzam nos mesmos pontos. Ela é "locada" a
     partir do centro quando aparece e, sob o cursor, acende as linhas e as
     estacas (os cruzamentos). Sem cursor (celular, ou parado), a luz passeia
     devagar. Base quase invisível; o acento nunca passa do conteúdo. */
  function iniciarGabarito() {
    var telas = Array.prototype.slice.call(document.querySelectorAll('[data-gabarito]'));
    if (!telas.length || !telas[0].getContext) return;
    var TAN = Math.tan(Math.PI / 6);
    var LADO = 64; // distância entre cruzamentos
    var COL = LADO * Math.cos(Math.PI / 6); // distância entre verticais
    var RAIO = 260;
    var ponteiro = { x: -9999, y: -9999, quando: 0 };
    var ciano = '11, 125, 114'; // o verde dos botões (Ciano Souz)

    function Gabarito(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.base = document.createElement('canvas');
      this.luz = document.createElement('canvas');
      this.visivel = false;
      this.inicio = 0;
      this.lanterna = { x: 0, y: 0 };
      this.medir();
    }
    Gabarito.prototype.medir = function () {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var w = this.canvas.clientWidth;
      var h = this.canvas.clientHeight;
      this.w = w; this.h = h; this.dpr = dpr;
      [this.canvas, this.base, this.luz].forEach(function (c) {
        c.width = Math.max(1, Math.round(w * dpr));
        c.height = Math.max(1, Math.round(h * dpr));
      });
      /* a malha desenhada uma vez, em traço cheio; a opacidade entra na composição */
      var b = this.base.getContext('2d');
      b.setTransform(dpr, 0, 0, dpr, 0, 0);
      b.clearRect(0, 0, w, h);
      b.strokeStyle = 'rgb(' + ciano + ')';
      b.lineWidth = 1;
      b.beginPath();
      var ox = (w / 2) % COL;
      for (var x = ox; x <= w; x += COL) { b.moveTo(x + 0.5, 0); b.lineTo(x + 0.5, h); }
      var cy = (h / 2) % LADO;
      var ext = w * TAN;
      for (var c = cy - Math.ceil(ext / LADO) * LADO; c <= h + ext; c += LADO) {
        b.moveTo(0, c); b.lineTo(w, c - ext); // sobe a 30°
        b.moveTo(0, c - ext); b.lineTo(w, c); // desce a 30°
      }
      b.stroke();
      /* estacas: os cruzamentos das três famílias */
      this.estacas = [];
      for (var i = 0, xx = ox; xx <= w; xx += COL, i++) {
        var desl = (Math.round((xx - w / 2) / COL) % 2 !== 0) ? LADO / 2 : 0;
        for (var yy = cy + desl - LADO; yy <= h + LADO; yy += LADO) this.estacas.push([xx, yy]);
      }
    };
    Gabarito.prototype.quadro = function (agora) {
      var ctx = this.ctx, w = this.w, h = this.h, dpr = this.dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      /* locação: a malha abre do centro para fora em 1,8 s */
      var t = MOVIMENTO ? Math.min(1, (agora - this.inicio) / 1800) : 1;
      var abre = 1 - Math.pow(1 - t, 3);
      var diag = Math.sqrt(w * w + h * h) / 2;
      ctx.globalAlpha = 0.34;
      ctx.drawImage(this.base, 0, 0);
      if (abre < 1) {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'destination-in';
        var g = ctx.createRadialGradient(w / 2 * dpr, h / 2 * dpr, 0, w / 2 * dpr, h / 2 * dpr, Math.max(1, diag * abre * dpr));
        g.addColorStop(0, '#000'); g.addColorStop(0.82, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
      if (!MOVIMENTO) return;

      /* a lanterna: o cursor, ou um passeio lento quando não há cursor */
      var r = this.canvas.getBoundingClientRect();
      var px = ponteiro.x - r.left, py = ponteiro.y - r.top;
      var comCursor = agora - ponteiro.quando < 3500 && px > -RAIO && px < w + RAIO && py > -RAIO && py < h + RAIO;
      var alvoX, alvoY;
      if (comCursor) { alvoX = px; alvoY = py; } else {
        var s = agora / 1000;
        alvoX = w * (0.5 + 0.34 * Math.sin(s * 0.23));
        alvoY = h * (0.45 + 0.28 * Math.sin(s * 0.31 + 1.2));
      }
      var L = this.lanterna;
      if (!L.x && !L.y) { L.x = alvoX; L.y = alvoY; }
      L.x += (alvoX - L.x) * 0.12; L.y += (alvoY - L.y) * 0.12;
      var forca = abre * (comCursor ? 1 : 0.55);

      var l = this.luz.getContext('2d');
      l.setTransform(1, 0, 0, 1, 0, 0);
      l.globalCompositeOperation = 'source-over';
      l.clearRect(0, 0, this.luz.width, this.luz.height);
      l.drawImage(this.base, 0, 0);
      l.globalCompositeOperation = 'destination-in';
      var gl = l.createRadialGradient(L.x * dpr, L.y * dpr, 0, L.x * dpr, L.y * dpr, RAIO * dpr);
      gl.addColorStop(0, 'rgba(0,0,0,1)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
      l.fillStyle = gl;
      l.fillRect(0, 0, this.luz.width, this.luz.height);
      ctx.globalAlpha = 0.9 * forca;
      ctx.drawImage(this.luz, 0, 0);

      /* estacas acesas perto da lanterna */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = 'rgb(' + ciano + ')';
      for (var k = 0; k < this.estacas.length; k++) {
        var e = this.estacas[k];
        var d = Math.hypot(e[0] - L.x, e[1] - L.y);
        if (d > RAIO * 0.8) continue;
        ctx.globalAlpha = (1 - d / (RAIO * 0.8)) * forca;
        ctx.fillRect(e[0] - 1.5, e[1] - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;
    };

    var gabaritos = telas.map(function (c) { return new Gabarito(c); });
    var rodando = false;
    function laco(agora) {
      var algum = false;
      gabaritos.forEach(function (g) { if (g.visivel) { g.quadro(agora); algum = true; } });
      if (algum && MOVIMENTO && !document.hidden) requestAnimationFrame(laco);
      else rodando = false;
    }
    function acordar() {
      if (!rodando) { rodando = true; requestAnimationFrame(laco); }
    }

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          var g = gabaritos[telas.indexOf(e.target)];
          g.visivel = e.isIntersecting;
          if (e.isIntersecting && !g.inicio) g.inicio = performance.now();
        });
        acordar();
      });
      telas.forEach(function (c) { obs.observe(c); });
    } else {
      gabaritos.forEach(function (g) { g.visivel = true; g.inicio = performance.now(); });
      acordar();
    }
    window.addEventListener('pointermove', function (ev) {
      if (ev.pointerType === 'touch') return;
      ponteiro.x = ev.clientX; ponteiro.y = ev.clientY; ponteiro.quando = performance.now();
    }, { passive: true });
    document.addEventListener('visibilitychange', acordar);
    var espera;
    window.addEventListener('resize', function () {
      clearTimeout(espera);
      espera = setTimeout(function () { gabaritos.forEach(function (g) { g.medir(); }); acordar(); }, 150);
    });
    if (!MOVIMENTO) {
      /* sem movimento: a malha parada, desenhada uma vez */
      gabaritos.forEach(function (g) { g.quadro(performance.now()); });
    }
  }

  /* ------------------------------------------------------------ linha da obra
     A seção fica presa e a faixa corre na horizontal com a rolagem; o
     cronograma de cima enche fase por fase (concluída fica cinza, como no
     sistema). Só com movimento e tela larga; senão, lista vertical. */
  function iniciarTrilha() {
    var secao = document.querySelector('[data-trilha]');
    if (!secao) return null;
    var faixa = secao.querySelector('[data-trilha-faixa]');
    var fases = Array.prototype.slice.call(secao.querySelectorAll('.gantt__fase'));
    var paineis = Array.prototype.slice.call(faixa.children);
    /* onde cada fase começa e termina na faixa (pela contagem de painéis) */
    var limites = {};
    paineis.forEach(function (p, i) {
      var f = p.getAttribute('data-fase');
      if (!limites[f]) limites[f] = [i, i + 1];
      else limites[f][1] = i + 1;
    });
    var estado = { presa: false, distancia: 0 };

    function medir() {
      var larga = MOVIMENTO && window.innerWidth > 900;
      secao.classList.toggle('presa', larga);
      estado.presa = larga;
      if (!larga) {
        secao.style.height = '';
        faixa.style.transform = '';
        fases.forEach(function (f) { f.style.setProperty('--enche', 1); f.classList.remove('ativa', 'feita'); });
        return;
      }
      estado.distancia = Math.max(0, faixa.scrollWidth - window.innerWidth);
      secao.style.height = (window.innerHeight + estado.distancia) + 'px';
    }

    function quadro() {
      if (!estado.presa) return;
      var r = secao.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var p = total > 0 ? Math.max(0, Math.min(1, -r.top / total)) : 0;
      faixa.style.transform = 'translate3d(' + (-p * estado.distancia).toFixed(1) + 'px,0,0)';
      /* o painel no centro da tela diz em que ponto da obra estamos */
      var pos = p * (paineis.length - 1) + 0.5;
      fases.forEach(function (f) {
        var lim = limites[f.getAttribute('data-fase')];
        if (!lim) return;
        var enche = Math.max(0, Math.min(1, (pos - lim[0]) / (lim[1] - lim[0])));
        f.style.setProperty('--enche', enche.toFixed(3));
        f.classList.toggle('ativa', enche > 0 && enche < 1);
        f.classList.toggle('feita', enche >= 1 && p < 1);
      });
    }

    medir();
    window.addEventListener('resize', function () { medir(); quadro(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        secao.classList.toggle('visivel', e[0].isIntersecting);
      }).observe(secao);
    }
    return quadro;
  }

  /* ------------------------------------------------------------ ampliar tela */
  function iniciarZoom() {
    var dialogo = document.getElementById('zoom');
    if (!dialogo || typeof dialogo.showModal !== 'function') return;
    var imagem = dialogo.querySelector('img');

    function maior(src) {
      if (/-mobile-\d+\./.test(src)) return src.replace(/-(390|780|1170)\.(avif|webp|jpg)$/, '-1170.webp');
      return src.replace(/-(1280|1680)\.(avif|webp|jpg)$/, '-1680.webp');
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
    iniciarChecks();
    iniciarRevelar();
    iniciarCotas();
    iniciarBrilhoCards();
    iniciarSubstitui();
    iniciarNavAtiva();
    iniciarProva();
    iniciarIsca();
    iniciarQualifica();
    iniciarCalc();
    iniciarHistoria();
    iniciarRolagem();
    /* o gabarito (canvas) não disputa a carga: começa depois do load, ocioso */
    function depoisDaCarga() {
      if ('requestIdleCallback' in window) requestIdleCallback(iniciarGabarito, { timeout: 1500 });
      else setTimeout(iniciarGabarito, 200);
    }
    if (document.readyState === 'complete') depoisDaCarga();
    else window.addEventListener('load', depoisDaCarga);
  });
})();
