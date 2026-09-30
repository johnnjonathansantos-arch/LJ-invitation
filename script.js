(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================
     ENVELOPE → ABERTURA
     ================================================ */
  var envelope      = document.getElementById('envelope');
  var envScene      = document.getElementById('envelope-scene');
  var envWrap       = document.getElementById('envelope-wrap');
  var sparkleCanvas = document.getElementById('env-sparkles');
  var inviteScene   = document.getElementById('invite-scene');
  var petalField    = document.getElementById('petal-field');
  var dustField     = document.getElementById('dust-field');
  var pullHint      = document.getElementById('pull-hint');
  var opened        = false;

  /* ---- Brilhos saindo de dentro do envelope ---- */
  function burstSparkles() {
    if (reduceMotion) return;

    var rect = envWrap.getBoundingClientRect();
    var w = rect.width, h = rect.height;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    sparkleCanvas.width  = w * dpr;
    sparkleCanvas.height = h * dpr;
    sparkleCanvas.style.width  = w + 'px';
    sparkleCanvas.style.height = h + 'px';

    var ctx = sparkleCanvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Origem: centro do envelope (onde a tampa abre)
    var envRect = envelope.getBoundingClientRect();
    var originX = (envRect.left - rect.left) + envRect.width / 2;
    var originY = (envRect.top  - rect.top)  + envRect.height * 0.35;

    var sparkles = [];
    var COUNT = 26;

    for (var i = 0; i < COUNT; i++) {
      var angle = (Math.PI * 1.6) * Math.random() - Math.PI * 1.3; // leque para cima
      var speed = 1.4 + Math.random() * 2.6;
      sparkles.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.8,
        gravity: 0.05 + Math.random() * 0.03,
        size: 2 + Math.random() * 3.5,
        rot: Math.random() * Math.PI,
        delay: Math.random() * 260,
        twinkle: Math.random() * Math.PI * 2,
        hueGold: Math.random() > 0.4
      });
    }

    var start = null;
    var DURATION = 1300;

    function drawStar(ctx, size) {
      ctx.beginPath();
      for (var i = 0; i < 4; i++) {
        var a = (Math.PI / 2) * i;
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        var a2 = a + Math.PI / 4;
        ctx.lineTo(Math.cos(a2) * size * 0.28, Math.sin(a2) * size * 0.28);
      }
      ctx.closePath();
    }

    function frame(ts) {
      if (!start) start = ts;
      var elapsed = ts - start;
      ctx.clearRect(0, 0, w, h);

      var anyAlive = false;
      for (var i = 0; i < sparkles.length; i++) {
        var s = sparkles[i];
        var t = elapsed - s.delay;
        if (t <= 0) { anyAlive = true; continue; }
        var life = 1 - t / (DURATION - s.delay);
        if (life <= 0) continue;
        anyAlive = true;

        var tt = t / 16;
        var x = s.x + s.vx * tt;
        var y = s.y + s.vy * tt + 0.5 * s.gravity * tt * tt;
        var twinkleAlpha = 0.6 + 0.4 * Math.sin(s.twinkle + t / 90);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(s.rot + t / 300);
        ctx.globalAlpha = Math.max(0, life) * twinkleAlpha;
        ctx.fillStyle = s.hueGold ? '#fff3d6' : '#ffffff';
        ctx.shadowColor = s.hueGold ? '#ffe8a8' : '#ffffff';
        ctx.shadowBlur = 6;
        drawStar(ctx, s.size);
        ctx.fill();
        ctx.restore();
      }

      if (elapsed < DURATION && anyAlive) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }

    requestAnimationFrame(frame);
  }

  function openEnvelope() {
    if (opened) return;
    opened = true;

    pullHint.style.opacity = '0';

    // 1. Abre a tampa
    envelope.classList.add('opening');

    // 2. Brilhos saem de dentro do envelope junto com a abertura
    burstSparkles();

    // 3. Exibe tela do versículo (etapa intermediária antes do convite)
    setTimeout(function () {
      envScene.classList.add('hide');

      var verseScreen = document.getElementById('verse-screen');
      verseScreen.setAttribute('aria-hidden', 'false');
      verseScreen.classList.add('visible');

      // Quando o usuário clicar em "Continuar" (ou na própria tela), exibe o convite
      document.getElementById('verse-btn').addEventListener('click', function showInvite() {
        verseScreen.classList.add('hide');
        setTimeout(function () {
          verseScreen.setAttribute('aria-hidden', 'true');
          verseScreen.style.display = 'none';

          inviteScene.setAttribute('aria-hidden', 'false');
          inviteScene.classList.add('visible');

          petalField.classList.add('active');
          dustField.classList.add('active');
          startPetals();

          animateWriteIn();
        }, 500);
      }, { once: true });
    }, 750);
  }

  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });

  /* ================================================
     ANIMAÇÃO DE ESCRITA SEQUENCIAL
     ================================================ */
  function animateWriteIn() {
    var elements = document.querySelectorAll('.write-in');
    var baseDelay = 0.1; // segundos

    elements.forEach(function (el, i) {
      var delay = baseDelay + i * 0.38;
      var dur   = el.classList.contains('names') ? 1.0 :
                  el.classList.contains('divider') ? 0.5 :
                  el.classList.contains('rsvp-wrap') ? 0.7 : 0.75;

      el.style.setProperty('--type-delay', delay + 's');
      el.style.setProperty('--type-dur',   dur   + 's');

      // pequeno requestAnimationFrame para garantir que o estilo foi aplicado
      requestAnimationFrame(function () {
        el.classList.add('typing');
        setTimeout(function () {
          el.classList.add('typed');
        }, (delay + dur) * 1000);
      });
    });
  }

  /* ================================================
     PÉTALAS
     ================================================ */
  // Cor da borda dourada elegante aplicada ao contorno de cada pétala
  var GOLD_STROKE = 'rgba(212,175,55,0.72)';

  // 4 formatos diferentes de pétala de rosa realista
  var petalShapes = [
    // Pétala longa côncava — pétala externa de rosa
    function(c1, c2, c3) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52"><defs>'
        + '<radialGradient id="pg0" cx="35%" cy="25%" r="70%">'
        + '<stop offset="0%" stop-color="'+c1+'"/>'
        + '<stop offset="50%" stop-color="'+c2+'"/>'
        + '<stop offset="100%" stop-color="'+c3+'"/>'
        + '</radialGradient></defs>'
        // Contorno dourado elegante — stroke externo sobre o preenchimento
        + '<path d="M20 2 C28 6 38 18 36 34 C34 46 26 50 20 50 C14 50 6 46 4 34 C2 18 12 6 20 2Z" fill="url(#pg0)" opacity="0.88" stroke="'+GOLD_STROKE+'" stroke-width="1.1"/>'
        + '<path d="M20 4 C24 10 30 22 28 36" stroke="'+c1+'" stroke-width="0.8" fill="none" opacity="0.4"/>'
        + '<path d="M20 4 C18 12 16 26 17 40" stroke="'+c1+'" stroke-width="0.6" fill="none" opacity="0.3"/>'
        + '</svg>';
    },
    // Pétala arredondada — pétala interna de rosa
    function(c1, c2, c3) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 46"><defs>'
        + '<radialGradient id="pg1" cx="40%" cy="30%" r="65%">'
        + '<stop offset="0%" stop-color="'+c1+'"/>'
        + '<stop offset="55%" stop-color="'+c2+'"/>'
        + '<stop offset="100%" stop-color="'+c3+'"/>'
        + '</radialGradient></defs>'
        // Contorno dourado elegante
        + '<path d="M22 3 C32 4 42 14 40 28 C38 40 30 44 22 44 C14 44 6 40 4 28 C2 14 12 4 22 3Z" fill="url(#pg1)" opacity="0.85" stroke="'+GOLD_STROKE+'" stroke-width="1.1"/>'
        + '<path d="M22 5 C28 12 34 24 30 36" stroke="'+c1+'" stroke-width="0.9" fill="none" opacity="0.35"/>'
        + '<path d="M22 5 C20 14 18 28 19 38" stroke="'+c1+'" stroke-width="0.7" fill="none" opacity="0.28"/>'
        + '<path d="M22 5 C16 12 10 22 14 35" stroke="'+c1+'" stroke-width="0.6" fill="none" opacity="0.25"/>'
        + '</svg>';
    },
    // Pétala ondulada — pétala com borda irregular natural
    function(c1, c2, c3) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 50"><defs>'
        + '<radialGradient id="pg2" cx="38%" cy="28%" r="68%">'
        + '<stop offset="0%" stop-color="'+c1+'"/>'
        + '<stop offset="48%" stop-color="'+c2+'"/>'
        + '<stop offset="100%" stop-color="'+c3+'"/>'
        + '</radialGradient></defs>'
        // Contorno dourado elegante
        + '<path d="M23 2 C31 2 40 8 42 18 C44 28 40 38 34 44 C30 48 26 48 23 48 C20 48 16 48 12 44 C6 38 2 28 4 18 C6 8 15 2 23 2Z" fill="url(#pg2)" opacity="0.87" stroke="'+GOLD_STROKE+'" stroke-width="1.1"/>'
        + '<path d="M23 4 C27 10 33 22 31 38" stroke="'+c1+'" stroke-width="0.9" fill="none" opacity="0.32"/>'
        + '<path d="M23 4 C21 14 19 30 20 42" stroke="'+c1+'" stroke-width="0.7" fill="none" opacity="0.26"/>'
        + '</svg>';
    },
    // Pétala fina curva — flutua de lado
    function(c1, c2, c3) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 36"><defs>'
        + '<radialGradient id="pg3" cx="30%" cy="35%" r="72%">'
        + '<stop offset="0%" stop-color="'+c1+'"/>'
        + '<stop offset="50%" stop-color="'+c2+'"/>'
        + '<stop offset="100%" stop-color="'+c3+'"/>'
        + '</radialGradient></defs>'
        // Contorno dourado elegante
        + '<path d="M4 18 C8 6 22 2 34 4 C44 6 50 12 48 20 C46 28 36 34 24 34 C12 34 2 28 4 18Z" fill="url(#pg3)" opacity="0.84" stroke="'+GOLD_STROKE+'" stroke-width="1.1"/>'
        + '<path d="M8 14 C18 10 32 10 44 16" stroke="'+c1+'" stroke-width="0.8" fill="none" opacity="0.3"/>'
        + '</svg>';
    }
  ];

  // Paleta de cores realista de rosa: do rosa claro ao fúcsia profundo
  var petalColors = [
    ['#ffd6ea', '#e8608a', '#a01055'],
    ['#ffcce4', '#d6197e', '#8f0f56'],
    ['#ffe0ef', '#e8608a', '#c4166d'],
    ['#ffc8e0', '#c4166d', '#7a0840'],
    ['#fbd6e8', '#e766a8', '#8f0f56'],
    ['#ffeaf4', '#f090b8', '#c4166d'],
  ];

  var petalUid = 0;

  function spawnPetal() {
    if (reduceMotion) return;

    var shapeIdx = Math.floor(Math.random() * petalShapes.length);
    var colorIdx = Math.floor(Math.random() * petalColors.length);
    var colors   = petalColors[colorIdx];
    var svgStr   = petalShapes[shapeIdx](colors[0], colors[1], colors[2]);

    // ID único por pétala: evita que gradientes com o mesmo id se sobreponham
    petalUid++;
    svgStr = svgStr.split('pg' + shapeIdx).join('pg' + shapeIdx + '_' + petalUid);

    var p = document.createElement('div');
    p.className = 'petal';

    // Dimensões
    var size    = 18 + Math.random() * 18;  // 18–36 px
    // Posição horizontal aleatória na viewport
    var leftPct = Math.random() * 96;       // 0–96 vw (deixa margem para a largura)
    // Duração da queda: 8 a 16 segundos
    var fallDur = 8 + Math.random() * 8;
    // Período do balanço: 2.5 a 5s
    var swayDur = 2.5 + Math.random() * 2.5;
    // Rotação inicial e final
    var rotStart = Math.floor(Math.random() * 360);
    var rotDelta = 180 + Math.floor(Math.random() * 360); // gira 180–540° durante a queda
    var rotEnd   = rotStart + rotDelta;
    // Amplitude do balanço: assimétrico para naturalidade
    var swayMax  = Math.floor(15 + Math.random() * 30);
    var swayMin  = -Math.floor(10 + Math.random() * 20);

    p.style.width  = size + 'px';
    p.style.height = size * 1.2 + 'px';
    p.style.left   = leftPct + 'vw';
    p.style.top    = '0px';

    // Variáveis CSS para os keyframes
    p.style.setProperty('--rot-start', rotStart + 'deg');
    p.style.setProperty('--rot-end',   rotEnd   + 'deg');
    p.style.setProperty('--sway-max',  swayMax  + 'px');
    p.style.setProperty('--sway-min',  swayMin  + 'px');

    // Durações individuais — a animação de queda NÃO é compartilhada
    p.style.animationDuration = fallDur + 's, ' + swayDur + 's';
    p.style.animationDelay    = '0s, 0s';

    p.innerHTML = svgStr;
    petalField.appendChild(p);

    // Remover do DOM somente quando a animação de QUEDA terminar.
    // O evento 'animationend' dispara para cada animação separadamente;
    // filtramos pelo nome 'petalFall' para ignorar 'petalSway' (infinita).
    // Isso garante remoção individual por trajetória — nunca por tempo global.
    p.addEventListener('animationend', function onFallEnd(e) {
      if (e.animationName !== 'petalFall') return;
      p.removeEventListener('animationend', onFallEnd);
      if (p.parentNode) p.parentNode.removeChild(p);
    });
  }

  // Formas de partícula de pó — delicadas e elegantes
  var dustShapes = [
    // Losango dourado
    function(color) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 14">'
        + '<polygon points="5,0 10,7 5,14 0,7" fill="' + color + '" opacity="0.82"/>'
        + '</svg>';
    },
    // Círculo com brilho
    function(color) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">'
        + '<circle cx="5" cy="5" r="4" fill="' + color + '" opacity="0.75"/>'
        + '<circle cx="3" cy="3" r="1.2" fill="#fff" opacity="0.55"/>'
        + '</svg>';
    },
    // Estrela de 4 pontas
    function(color) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">'
        + '<polygon points="6,0 7.5,4.5 12,6 7.5,7.5 6,12 4.5,7.5 0,6 4.5,4.5" fill="' + color + '" opacity="0.80"/>'
        + '</svg>';
    },
    // Ponto oval
    function(color) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 12">'
        + '<ellipse cx="4" cy="6" rx="3" ry="5" fill="' + color + '" opacity="0.70"/>'
        + '</svg>';
    }
  ];

  // Paleta de pó: dourado, rosê e lilás suave
  var dustColors = [
    '#d4af37',  // dourado
    '#e8c97a',  // dourado claro
    '#f7e0b0',  // champagne
    '#f0b8d4',  // rosê
    '#e8a0c8',  // rosê médio
    '#d4aee8',  // lilás suave
  ];

  function spawnDust() {
    if (reduceMotion) return;

    var shapeIdx = Math.floor(Math.random() * dustShapes.length);
    var color    = dustColors[Math.floor(Math.random() * dustColors.length)];
    var svgStr   = dustShapes[shapeIdx](color);

    var d = document.createElement('div');
    d.className = 'dust-particle';

    var size     = 4 + Math.random() * 7;
    var leftPct  = Math.random() * 98;
    var fallDur  = 7 + Math.random() * 9;
    var swayDur  = 2 + Math.random() * 3;
    var rotStart = Math.floor(Math.random() * 360);
    var rotEnd   = rotStart + 240 + Math.floor(Math.random() * 360);
    var swayMax  = Math.floor(10 + Math.random() * 20);
    var swayMin  = -Math.floor(8  + Math.random() * 16);

    d.style.width  = size + 'px';
    d.style.height = size + 'px';
    d.style.left   = leftPct + 'vw';
    d.style.top    = '0px';

    d.style.setProperty('--rot-start', rotStart + 'deg');
    d.style.setProperty('--rot-end',   rotEnd   + 'deg');
    d.style.setProperty('--sway-max',  swayMax  + 'px');
    d.style.setProperty('--sway-min',  swayMin  + 'px');

    d.style.animationDuration = fallDur + 's, ' + swayDur + 's';
    d.style.animationDelay    = '0s, 0s';

    d.innerHTML = svgStr;
    dustField.appendChild(d);

    d.addEventListener('animationend', function onDustEnd(e) {
      if (e.animationName !== 'dustFall') return;
      d.removeEventListener('animationend', onDustEnd);
      if (d.parentNode) d.parentNode.removeChild(d);
    });
  }

  function startPetals() {
    // -------------------------------------------------------
    // REGRAS:
    // 1. Aguarda PETAL_START_DELAY antes de criar a primeira pétala.
    // 2. Durante PETAL_RAIN_DURATION (6s) cria pétalas continuamente.
    // 3. Após 10s para a criação — as pétalas existentes continuam
    //    sua animação CSS individualmente até terminarem (animationend).
    // 4. NÃO existe nenhum controle de remoção global por tempo.
    // -------------------------------------------------------
    var PETAL_START_DELAY  = 3500;   // ms — delay antes de começar
    var PETAL_RAIN_DURATION = 8000; // ms — janela de criação (10s)

    setTimeout(function () {

      // -- Rajada inicial: 12 pétalas espaçadas nos primeiros 2.5s --
      for (var i = 0; i < 6; i++) {
        (function (idx) {
          setTimeout(function () {
            spawnPetal();
            if (idx % 2 === 0) spawnDust();  // pó intercalado
          }, idx * 210);
        }(i));
      }

      // -- Fluxo contínuo a cada 850ms durante os 10s restantes --
      // O intervalo controla APENAS a criação de novas pétalas.
      // Cada pétala já criada vive de forma completamente independente.
      var creationEnd = Date.now() + PETAL_RAIN_DURATION;

      var interval = setInterval(function () {
        if (Date.now() >= creationEnd) {
          // Para a criação de novas pétalas — só isso.
          clearInterval(interval);
          return;
        }
        spawnPetal();
        spawnDust();
      }, 850);

    }, PETAL_START_DELAY);
  }

  /* ================================================
     RSVP — troca de painéis
     ================================================ */
  var panels = {
    question:     document.getElementById('panel-question'),
    form:         document.getElementById('panel-form'),
    acompanhante: document.getElementById('panel-acompanhante'),
    obrigado:     document.getElementById('panel-obrigado'),
    nao:          document.getElementById('panel-nao'),
    encerrado:    document.getElementById('panel-encerrado')
  };

  function showPanel(target) {
    Object.keys(panels).forEach(function (key) {
      var el = panels[key];
      if (!el) return;
      if (el === target) {
        el.classList.remove('panel-leave');
        el.classList.add('is-active');
      } else if (el.classList.contains('is-active')) {
        el.classList.add('panel-leave');
        setTimeout(function () {
          el.classList.remove('is-active', 'panel-leave');
        }, 280);
      }
    });
    setTimeout(function () {
      var h = target.querySelector('.form-title,.result-title,.rsvp-question');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }, 150);
  }

  document.getElementById('btn-voltar-form').addEventListener('click', function () { showPanel(panels.question); });

  /* ---- RSVP via WhatsApp ----
     As confirmações chegam ao número abaixo (formato internacional, só dígitos). */
  var WHATSAPP_NUMBER = '5511951315012';

  function whatsappLink(msg) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  var guestName = '';

  document.getElementById('rsvp-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = document.getElementById('nome').value.trim();
    if (!nome) { document.getElementById('nome').focus(); return; }
    guestName = nome;

    document.getElementById('obrigado-texto').textContent =
      'Mal podemos esperar para celebrar esse dia com você, ' + nome + '!';

    // Vai para a etapa de acompanhante antes de mostrar o painel final
    showPanel(panels.acompanhante);
  });

  /* ---- Botão "Sim" — vai levar acompanhante ---- */
  document.getElementById('btn-acomp-sim').addEventListener('click', function () {
    var msgEl = document.getElementById('msg-acompanhante');
    msgEl.style.display = 'block';

    var link = document.getElementById('btn-whatsapp-sim');
    link.href = whatsappLink('Olá! Aqui é ' + guestName + '. Confirmo minha presença no casamento de Lais & Jonathan, dia 11/09/2027.\n\nVou levar acompanhante. ');

    showPanel(panels.obrigado);
  });

  /* ---- Botão "Não" — sem acompanhante ---- */
  document.getElementById('btn-acomp-nao').addEventListener('click', function () {
    var msgEl = document.getElementById('msg-acompanhante');
    msgEl.style.display = 'none';

    var link = document.getElementById('btn-whatsapp-sim');
    link.href = whatsappLink('Olá! Aqui é ' + guestName + '. Confirmo minha presença no casamento de Lais & Jonathan, dia 11/09/2027. ');

    showPanel(panels.obrigado);
  });

  /* ================================================
     PRAZO DE CONFIRMAÇÃO
     Data do casamento: 11/09/2027
     Prazo final: até 2 meses antes (11/07/2027)
     ================================================ */
  var WEDDING_DATE  = new Date(2027, 8, 11);  // mês 8 = setembro (0-indexado)
  var DEADLINE_DATE = new Date(2027, 6, 11);  // mês 6 = julho (2 meses antes)

  var rsvpClosed = new Date() > DEADLINE_DATE;

  if (rsvpClosed) {
    // Prazo encerrado: painel inicial do RSVP já mostra o aviso, sem opção de confirmar
    showPanel(panels.encerrado);
  } else {
    document.getElementById('btn-sim').addEventListener('click', function () { showPanel(panels.form); });
    document.getElementById('btn-nao').addEventListener('click', function () {
      document.getElementById('btn-whatsapp-nao').href =
        whatsappLink('Olá! Infelizmente não poderei comparecer ao casamento de Lais & Jonathan. Agradeço o convite!');
      showPanel(panels.nao);
    });
  }

})();
