/**
 * IWC SCHAFFHAUSEN — HAUTE HORLOGERIE INTERACTIVE ENGINE
 * Dual-Video Canvas Frame-Scrubber, Dynamic SVG Leader Lines,
 * Mega Menu Drawer, Product Filter, Interactive Boutiques & Procedural Audio
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. CONFIGURATION & STATE
  const CONFIG = {
    totalFrames: 237,
    v1EndFrame: 142,        // Exploded View Keyframe
    v2EndFrame: 236,        // Macro Crown End Frame
    framePath: (idx) => `assets/frames/frame_${String(idx).padStart(3, '0')}.webp`,
    
    thresholds: {
      heroFadeOut: 0.15,
      explodedStart: 0.38,
      explodedEnd: 0.65,
      macroStart: 0.85
    },
    
    hotspots: {
      bezel:    { nx: 0.185, ny: 0.445, cardId: 'card-bezel' },
      dial:     { nx: 0.328, ny: 0.455, cardId: 'card-dial' },
      calibre:  { nx: 0.500, ny: 0.445, cardId: 'card-calibre' },
      case:     { nx: 0.604, ny: 0.465, cardId: 'card-case' },
      caseback: { nx: 0.708, ny: 0.455, cardId: 'card-caseback' }
    },

    boutiqueAddresses: {
      zurich: {
        name: 'IWC FLAGSHIP BOUTIQUE ZURICH',
        address: 'Bahnhofstrasse 61, 8001 Zurich, Switzerland\nTelephone: +41 44 211 18 68\nMon – Sat: 10:00 – 18:30'
      },
      geneva: {
        name: 'IWC BOUTIQUE GENEVA',
        address: 'Rue du Rhône 48, 1204 Geneva, Switzerland\nTelephone: +41 22 310 39 80\nMon – Fri: 10:00 – 18:30, Sat: 10:00 – 18:00'
      },
      london: {
        name: 'IWC FLAGSHIP BOUTIQUE LONDON',
        address: '138 New Bond Street, Mayfair, London W1S 2TF, UK\nTelephone: +44 20 7355 4990\nMon – Sat: 10:00 – 19:00, Sun: 12:00 – 18:00'
      },
      newyork: {
        name: 'IWC FLAGSHIP BOUTIQUE NEW YORK',
        address: '535 Madison Avenue, New York, NY 10022, USA\nTelephone: +1 212 355 3542\nMon – Sat: 10:00 – 18:00, Sun: 12:00 – 17:00'
      },
      tokyo: {
        name: 'IWC MAISON GINZA TOKYO',
        address: '6-6-1 Ginza, Chuo-ku, Tokyo 104-0061, Japan\nTelephone: +81 3 3289 2030\nDaily: 11:00 – 19:30'
      }
    }
  };

  const state = {
    images: new Array(CONFIG.totalFrames),
    loadedCount: 0,
    targetProgress: 0,
    currentProgress: 0,
    activeFrameIndex: 0,
    focusedComponent: null
  };

  // 2. DOM ELEMENTS
  const canvas = document.getElementById('watch-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const heroContainer = document.getElementById('hero-stage');
  const loaderCurtain = document.getElementById('loader-curtain');
  const loaderBarFill = document.getElementById('loader-bar-fill');
  const heroOverlay = document.getElementById('hero-overlay');
  const explodedOverlay = document.getElementById('exploded-overlay');
  const macroOverlay = document.getElementById('macro-overlay');
  const svgOverlay = document.getElementById('exploded-svg-lines');
  const iwcHeader = document.querySelector('.iwc-header');

  // Mega Menu Elements
  const btnOpenMenu = document.getElementById('btn-open-menu');
  const btnCloseMenu = document.getElementById('btn-close-menu');
  const megaMenuOverlay = document.getElementById('mega-menu-overlay');

  // 3. PROGRESSIVE FRAME PRELOADER
  function initPreloader() {
    // Immediate frame 0 load to unlock the hero UI with zero lag
    loadSingleFrame(0, () => {
      renderFrame(0);
      updateLoaderProgress(100);
      setTimeout(() => {
        if (loaderCurtain) {
          loaderCurtain.classList.add('loaded');
          loaderCurtain.style.display = 'none';
        }
      }, 100);
    });

    // Safety fallback: guaranteed curtain lift in under 400ms
    setTimeout(() => {
      if (loaderCurtain && !loaderCurtain.classList.contains('loaded')) {
        loaderCurtain.classList.add('loaded');
        loaderCurtain.style.display = 'none';
      }
    }, 400);

    // Preload key milestone frames
    [CONFIG.v1EndFrame, CONFIG.v2EndFrame].forEach(idx => loadSingleFrame(idx));
    loadRemainingFrames();
  }

  function loadSingleFrame(idx, callback) {
    if (state.images[idx]) {
      if (callback) callback();
      return;
    }
    const img = new Image();
    img.src = CONFIG.framePath(idx);
    img.onload = () => {
      state.images[idx] = img;
      state.loadedCount++;
      if (callback) callback();
    };
    img.onerror = () => {
      setTimeout(() => { img.src = CONFIG.framePath(idx); }, 500);
    };
  }

  function loadRemainingFrames() {
    const stride = 4;
    const pass1 = [];
    const pass2 = [];

    for (let i = 0; i < CONFIG.totalFrames; i++) {
      if (i % stride === 0) pass1.push(i);
      else pass2.push(i);
    }

    const queue = pass1.concat(pass2);
    let qIdx = 0;

    function processQueue() {
      if (qIdx >= queue.length) return;
      const nextIdx = queue[qIdx++];
      loadSingleFrame(nextIdx, () => {
        const pct = Math.floor((state.loadedCount / CONFIG.totalFrames) * 100);
        updateLoaderProgress(pct);
        if (pct >= 25 && loaderCurtain && !loaderCurtain.classList.contains('loaded')) {
          loaderCurtain.classList.add('loaded');
        }
      });

      if (qIdx < queue.length) {
        requestAnimationFrame(processQueue);
      }
    }

    for (let i = 0; i < 8; i++) {
      processQueue();
    }
  }

  function updateLoaderProgress(pct) {
    if (loaderBarFill) {
      loaderBarFill.style.width = `${pct}%`;
    }
  }

  // 4. CANVAS RESIZE & DRAWING ENGINE
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    renderFrame(state.activeFrameIndex);
    updateLeaderLines();
  }

  window.addEventListener('resize', resizeCanvas);

  function renderFrame(idx) {
    const safeIdx = Math.max(0, Math.min(CONFIG.totalFrames - 1, idx));
    state.activeFrameIndex = safeIdx;

    let img = state.images[safeIdx];
    if (!img) {
      for (let offset = 1; offset < 20; offset++) {
        if (state.images[safeIdx - offset]) { img = state.images[safeIdx - offset]; break; }
        if (state.images[safeIdx + offset]) { img = state.images[safeIdx + offset]; break; }
      }
    }
    if (!img) return;

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const imgRatio = 1920 / 1080;
    const screenRatio = cw / ch;

    let drawW, drawH, drawX, drawY;

    if (screenRatio > imgRatio) {
      drawW = cw;
      drawH = cw / imgRatio;
      drawX = 0;
      drawY = (ch - drawH) / 2;
    } else {
      drawH = ch;
      drawW = ch * imgRatio;
      drawX = (cw - drawW) / 2;
      drawY = 0;
    }

    canvas._renderBounds = { drawX, drawY, drawW, drawH };

    ctx.fillStyle = '#06120D';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // 5. SCROLL VELOCITY ENGINE (LERP)
  function onScroll() {
    if (!heroContainer) return;
    const rect = heroContainer.getBoundingClientRect();
    const maxScroll = heroContainer.offsetHeight - window.innerHeight;
    const progress = Math.min(Math.max(-rect.top / maxScroll, 0), 1);
    state.targetProgress = progress;

    if (window.scrollY > 40) {
      iwcHeader.classList.add('scrolled');
    } else {
      iwcHeader.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  function animationLoop() {
    state.currentProgress += (state.targetProgress - state.currentProgress) * 0.12;
    const p = state.currentProgress;

    let targetFrame = 0;

    if (p < CONFIG.thresholds.explodedStart) {
      const subProgress = p / CONFIG.thresholds.explodedStart;
      targetFrame = Math.round(subProgress * CONFIG.v1EndFrame);
    } else if (p <= CONFIG.thresholds.explodedEnd) {
      targetFrame = CONFIG.v1EndFrame;
    } else {
      const subProgress = (p - CONFIG.thresholds.explodedEnd) / (1 - CONFIG.thresholds.explodedEnd);
      targetFrame = Math.round(CONFIG.v1EndFrame + subProgress * (CONFIG.v2EndFrame - CONFIG.v1EndFrame));
    }

    if (targetFrame !== state.activeFrameIndex) {
      renderFrame(targetFrame);
    }

    updateOverlayStates(p);
    requestAnimationFrame(animationLoop);
  }

  function updateOverlayStates(p) {
    if (p < CONFIG.thresholds.heroFadeOut) {
      heroOverlay.classList.remove('hidden');
      const opacity = 1 - (p / CONFIG.thresholds.heroFadeOut);
      heroOverlay.style.opacity = opacity.toFixed(2);
    } else {
      heroOverlay.classList.add('hidden');
    }

    if (p >= CONFIG.thresholds.explodedStart && p <= CONFIG.thresholds.explodedEnd) {
      if (!explodedOverlay.classList.contains('active')) {
        explodedOverlay.classList.add('active');
        updateLeaderLines();
      }
    } else {
      if (explodedOverlay.classList.contains('active')) {
        explodedOverlay.classList.remove('active');
      }
    }

    if (p >= CONFIG.thresholds.macroStart) {
      macroOverlay.classList.add('active');
    } else {
      macroOverlay.classList.remove('active');
    }
  }

  // 6. DYNAMIC SVG LEADER LINES
  function updateLeaderLines() {
    if (!canvas._renderBounds || !svgOverlay) return;
    const { drawX, drawY, drawW, drawH } = canvas._renderBounds;

    let svgHtml = '';

    Object.keys(CONFIG.hotspots).forEach(key => {
      const spot = CONFIG.hotspots[key];
      const card = document.getElementById(spot.cardId);
      if (!card) return;

      const hx = drawX + spot.nx * drawW;
      const hy = drawY + spot.ny * drawH;

      const cardRect = card.getBoundingClientRect();
      let cx, cy;

      if (cardRect.left > hx) {
        cx = cardRect.left;
        cy = cardRect.top + cardRect.height / 2;
      } else {
        cx = cardRect.right;
        cy = cardRect.top + cardRect.height / 2;
      }

      const midX = (hx + cx) / 2;

      svgHtml += `
        <circle cx="${hx}" cy="${hy}" r="5" class="hotspot-dot" data-component="${key}"></circle>
        <path d="M ${hx} ${hy} L ${midX} ${hy} L ${cx} ${cy}" fill="none" class="leader-line" id="line-${key}"></path>
      `;
    });

    svgOverlay.innerHTML = svgHtml;
  }

  // 7. EXPLODED COMPONENT INTERACTION
  document.querySelectorAll('.component-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      highlightComponent(card.dataset.component);
    });
    card.addEventListener('mouseleave', () => {
      clearHighlight();
    });
  });

  document.querySelectorAll('.toolbar-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.toolbar-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      highlightComponent(pill.dataset.target);
    });
  });

  function highlightComponent(compKey) {
    state.focusedComponent = compKey;
    document.querySelectorAll('.component-card').forEach(c => {
      if (c.dataset.component === compKey) {
        c.classList.add('focused');
      } else {
        c.classList.remove('focused');
      }
    });

    const activeLine = document.getElementById(`line-${compKey}`);
    if (activeLine) {
      activeLine.style.stroke = '#E8C868';
      activeLine.style.strokeWidth = '2';
    }
  }

  function clearHighlight() {
    state.focusedComponent = null;
    document.querySelectorAll('.component-card').forEach(c => c.classList.remove('focused'));
    document.querySelectorAll('.leader-line').forEach(l => {
      l.style.stroke = 'var(--gold-metallic)';
      l.style.strokeWidth = '1.2';
    });
  }

  // 8. MEGA MENU INTERACTION
  if (btnOpenMenu && btnCloseMenu && megaMenuOverlay) {
    btnOpenMenu.addEventListener('click', () => {
      megaMenuOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    btnCloseMenu.addEventListener('click', () => {
      megaMenuOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });

    document.querySelectorAll('.menu-link-close').forEach(link => {
      link.addEventListener('click', () => {
        megaMenuOverlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // 10. PRODUCT COLLECTION FILTER
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.dataset.filter;
      productCards.forEach(card => {
        if (filterVal === 'all' || card.dataset.category === filterVal) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 11. INTERACTIVE BOUTIQUE CITY PICKER
  const cityTabs = document.querySelectorAll('.city-tab');
  const previewName = document.getElementById('preview-city-name');
  const previewAddress = document.getElementById('preview-city-address');

  cityTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      cityTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cityKey = tab.dataset.city;
      const data = CONFIG.boutiqueAddresses[cityKey];
      if (data && previewName && previewAddress) {
        previewName.textContent = data.name;
        previewAddress.innerHTML = data.address.replace(/\n/g, '<br>');
      }
    });
  });

  // 12. APPOINTMENT & NEWSLETTER FORMS
  const appForm = document.getElementById('appointment-form');
  if (appForm) {
    appForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = appForm.querySelector('button[type="submit"]');
      const prevText = btn.textContent;
      btn.textContent = 'TRANSMITTING APPOINTMENT REQUEST...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = 'APPOINTMENT CONFIRMED';
        btn.style.background = '#2B6BFF';
        alert('Thank you for contacting IWC Schaffhausen. An IWC Client Advisor will contact you within 24 hours to confirm your private salon appointment.');
        appForm.reset();
        setTimeout(() => {
          btn.textContent = prevText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1200);
    });
  }

  const newsForm = document.getElementById('newsletter-form');
  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = newsForm.querySelector('button');
      btn.textContent = '✓';
      alert('Welcome to the World of IWC. You have successfully subscribed to our horological journal.');
      newsForm.reset();
      setTimeout(() => { btn.textContent = 'JOIN'; }, 2000);
    });
  }

  // 13. DEBUG STAGE & SECTION PARAMETERS (FOR INSPECTION & TESTING)
  const urlParams = new URLSearchParams(window.location.search);
  const debugStage = urlParams.get('stage');
  const targetSection = urlParams.get('section');
  const debugMenu = urlParams.get('menu');

  if (targetSection) {
    if (loaderCurtain) {
      loaderCurtain.classList.add('loaded');
      loaderCurtain.style.display = 'none';
    }
    setTimeout(() => {
      const el = document.getElementById(targetSection);
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }, 150);
  }

  if (debugMenu === 'open') {
    if (loaderCurtain) {
      loaderCurtain.classList.add('loaded');
      loaderCurtain.style.display = 'none';
    }
    setTimeout(() => {
      if (megaMenuOverlay) {
        megaMenuOverlay.classList.add('open');
      }
    }, 150);
  }

  if (debugStage) {
    if (loaderCurtain) {
      loaderCurtain.classList.add('loaded');
      loaderCurtain.style.display = 'none';
    }
    setTimeout(() => {
      if (debugStage === 'exploded') {
        state.targetProgress = 0.50;
        state.currentProgress = 0.50;
        renderFrame(CONFIG.v1EndFrame);
        explodedOverlay.classList.add('active');
        heroOverlay.classList.add('hidden');
        heroOverlay.style.opacity = '0';
        updateLeaderLines();
      } else if (debugStage === 'macro') {
        state.targetProgress = 0.95;
        state.currentProgress = 0.95;
        renderFrame(CONFIG.v2EndFrame);
        macroOverlay.classList.add('active');
        heroOverlay.classList.add('hidden');
        heroOverlay.style.opacity = '0';
      } else if (debugStage === 'timepieces') {
        if (heroContainer) heroContainer.style.display = 'none';
      } else if (debugStage === 'manufacture') {
        if (heroContainer) heroContainer.style.display = 'none';
        const tp = document.getElementById('timepieces');
        if (tp) tp.style.display = 'none';
      } else if (debugStage === 'stories') {
        if (heroContainer) heroContainer.style.display = 'none';
        const tp = document.getElementById('timepieces');
        if (tp) tp.style.display = 'none';
        const mn = document.getElementById('manufacture');
        if (mn) mn.style.display = 'none';
      } else if (debugStage === 'boutiques') {
        if (heroContainer) heroContainer.style.display = 'none';
        const tp = document.getElementById('timepieces');
        if (tp) tp.style.display = 'none';
        const mn = document.getElementById('manufacture');
        if (mn) mn.style.display = 'none';
        const st = document.getElementById('stories');
        if (st) st.style.display = 'none';
      } else if (debugStage === 'footer') {
        if (heroContainer) heroContainer.style.display = 'none';
        const tp = document.getElementById('timepieces');
        if (tp) tp.style.display = 'none';
        const mn = document.getElementById('manufacture');
        if (mn) mn.style.display = 'none';
        const st = document.getElementById('stories');
        if (st) st.style.display = 'none';
        const bt = document.getElementById('boutiques');
        if (bt) bt.style.display = 'none';
      }
    }, 150);
  }

  // 14. INITIALIZE
  resizeCanvas();
  initPreloader();
  requestAnimationFrame(animationLoop);
});
