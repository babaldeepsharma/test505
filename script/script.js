/**
 * PIXEL HAVEN - RETRO 8-BIT RUNTIME ENGINE
 * Features:
 * - Web Audio API procedural sound engine (no external audio files)
 * - 16x16 Pixel Art Studio with Flood Fill, Eyedropper, Undo, Export
 * - 60 FPS HTML5 Canvas Arcade Runner with Collision, Particle FX & Physics
 * - Virtual Tamagotchi Pet with animations & stat management
 * - 8-Bit Chiptune Synth keyboard with keyboard bindings
 * - Theme switcher & CRT scanlines simulation
 */

(function () {
  'use strict';

  /* ============================================================
     1. GLOBAL SOUND ENGINE (WEB AUDIO API)
     ============================================================ */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.masterGain = null;
      this.init();
    }

    init() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.25;
        this.masterGain.connect(this.ctx.destination);
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.masterGain) {
        this.masterGain.gain.value = this.enabled ? 0.25 : 0;
      }
      return this.enabled;
    }

    playTone(freq, type = 'square', duration = 0.15, gainValue = 0.3) {
      if (!this.enabled || !this.ctx) return;
      this.resume();

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio fallback
      }
    }

    playBleep(freq = 600) {
      this.playTone(freq, 'square', 0.05, 0.15);
    }

    playCoin() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      this.playTone(987.77, 'square', 0.08, 0.25); // B5
      setTimeout(() => {
        this.playTone(1318.51, 'square', 0.28, 0.3); // E6
      }, 70);
    }

    playJump() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.16);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }

    playLaser() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {}
    }

    playPowerup() {
      const notes = [330, 392, 659, 523, 587, 784];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.12, 0.25), i * 65);
      });
    }

    playExplosion() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      try {
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, this.ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.25);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
      } catch (e) {}
    }

    playGameOver() {
      const notes = [440, 415, 392, 370, 349];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sawtooth', 0.25, 0.25);
        }, idx * 160);
      });
    }

    playVictory() {
      const seq = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 523.25, d: 0.12 }, // C5
        { f: 523.25, d: 0.12 }, // C5
        { f: 523.25, d: 0.28 }, // C5
        { f: 415.30, d: 0.28 }, // G#4
        { f: 466.16, d: 0.28 }, // A#4
        { f: 523.25, d: 0.15 }, // C5
        { f: 466.16, d: 0.12 }, // A#4
        { f: 523.25, d: 0.45 }, // C5
      ];
      let delay = 0;
      seq.forEach(note => {
        setTimeout(() => {
          this.playTone(note.f, 'square', note.d, 0.3);
        }, delay);
        delay += note.d * 1000 + 40;
      });
    }
  }

  const sound = new SoundEngine();

  /* ============================================================
     2. GLOBAL STATE & STATS ECONOMY
     ============================================================ */
  const state = {
    coins: parseInt(localStorage.getItem('pixel_coins') || '150', 10),
    level: 1,
    highScore: parseInt(localStorage.getItem('pixel_hiscore') || '0', 10),
    theme: localStorage.getItem('pixel_theme') || 'pico8',
    crt: localStorage.getItem('pixel_crt') !== 'false'
  };

  function updateHUD() {
    const coinEl = document.getElementById('player-coins');
    const lvlEl = document.getElementById('player-level');
    const hiEl = document.getElementById('player-hiscore');

    if (coinEl) coinEl.textContent = state.coins;
    state.level = Math.floor(state.coins / 100) + 1;
    if (lvlEl) lvlEl.textContent = state.level.toString().padStart(2, '0');
    if (hiEl) hiEl.textContent = state.highScore.toString().padStart(4, '0');

    localStorage.setItem('pixel_coins', state.coins.toString());
    localStorage.setItem('pixel_hiscore', state.highScore.toString());
  }

  function addCoins(amount, x, y) {
    state.coins += amount;
    updateHUD();
    sound.playCoin();

    // Floating text feedback
    const floater = document.createElement('div');
    floater.className = 'floating-reward';
    floater.textContent = `+${amount} 🪙`;
    floater.style.left = `${x || window.innerWidth / 2}px`;
    floater.style.top = `${y || window.innerHeight / 2}px`;
    document.body.appendChild(floater);
    setTimeout(() => floater.remove(), 1200);
  }

  /* ============================================================
     3. THEME & DISPLAY TOGGLES
     ============================================================ */
  function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    state.theme = themeName;
    localStorage.setItem('pixel_theme', themeName);
    const sel = document.getElementById('theme-selector');
    if (sel) sel.value = themeName;
  }

  function setupControls() {
    // Theme selector
    const themeSel = document.getElementById('theme-selector');
    if (themeSel) {
      applyTheme(state.theme);
      themeSel.addEventListener('change', (e) => {
        applyTheme(e.target.value);
        sound.playBleep(800);
      });
    }

    // Audio Toggle
    const audioBtn = document.getElementById('toggle-audio-btn');
    const audioIcon = document.getElementById('audio-icon');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isEnabled = sound.toggle();
        audioBtn.innerHTML = `${isEnabled ? '🔊' : '🔇'} AUDIO: ${isEnabled ? 'ON' : 'OFF'}`;
        if (isEnabled) sound.playBleep(880);
      });
    }

    // CRT Toggle
    const crtBtn = document.getElementById('toggle-crt-btn');
    if (crtBtn) {
      if (!state.crt) {
        document.body.classList.add('crt-off');
        crtBtn.textContent = '📺 CRT: OFF';
      }
      crtBtn.addEventListener('click', () => {
        state.crt = !state.crt;
        document.body.classList.toggle('crt-off', !state.crt);
        crtBtn.textContent = `📺 CRT: ${state.crt ? 'ON' : 'OFF'}`;
        localStorage.setItem('pixel_crt', state.crt.toString());
        sound.playBleep(700);
      });
    }

    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        const targetPane = document.getElementById(`pane-${targetTab}`);
        if (targetPane) targetPane.classList.add('active');

        sound.playBleep(520);
      });
    });
  }

  /* ============================================================
     4. RETRO LOGO & HERO MASCOT
     ============================================================ */
  function drawLogo() {
    const canvas = document.getElementById('logo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 16, 16);

    // 16x16 Retro Cartridge / Arcade Icon
    ctx.fillStyle = '#ff2a6d';
    ctx.fillRect(2, 1, 12, 14);
    ctx.fillStyle = '#ffec27';
    ctx.fillRect(4, 3, 8, 8);
    ctx.fillStyle = '#05d9e8';
    ctx.fillRect(5, 5, 2, 2);
    ctx.fillRect(9, 5, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(5, 8, 6, 2);
  }

  function initHeroMascot() {
    const canvas = document.getElementById('hero-mascot');
    const bubble = document.getElementById('mascot-dialogue');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const quotes = [
      'Beep boop! 🚀',
      'Pixels rule! 🎨',
      'Have you drawn today? ✨',
      'Insert coin! 🪙',
      'Watch out for slimes! 👾',
      'Level up! ⭐',
      'Try the chiptune synth! 🎹'
    ];

    let blink = false;
    setInterval(() => {
      blink = !blink;
      drawMascot();
    }, 1800);

    function drawMascot() {
      ctx.clearRect(0, 0, 16, 16);

      // Body: cute pixel robot/slime
      ctx.fillStyle = '#05d9e8';
      ctx.fillRect(3, 4, 10, 9);
      ctx.fillRect(4, 3, 8, 1);
      ctx.fillRect(4, 13, 8, 1);

      // Antenna
      ctx.fillStyle = '#ff2a6d';
      ctx.fillRect(7, 1, 2, 2);
      ctx.fillStyle = '#ffec27';
      ctx.fillRect(6, 0, 4, 1);

      // Eyes
      ctx.fillStyle = '#000000';
      if (blink) {
        ctx.fillRect(5, 7, 2, 1);
        ctx.fillRect(9, 7, 2, 1);
      } else {
        ctx.fillRect(5, 6, 2, 3);
        ctx.fillRect(9, 6, 2, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, 6, 1, 1);
        ctx.fillRect(9, 6, 1, 1);
      }

      // Cheeks
      ctx.fillStyle = '#ff77a8';
      ctx.fillRect(3, 9, 2, 1);
      ctx.fillRect(11, 9, 2, 1);

      // Mouth
      ctx.fillStyle = '#000000';
      ctx.fillRect(7, 10, 2, 1);
    }

    drawMascot();

    canvas.addEventListener('click', (e) => {
      sound.playPowerup();
      addCoins(5, e.clientX, e.clientY);
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      if (bubble) bubble.textContent = randomQuote;
      canvas.style.transform = 'scale(1.25) rotate(10deg)';
      setTimeout(() => {
        canvas.style.transform = '';
      }, 180);
    });
  }

  /* ============================================================
     5. PIXEL ART STUDIO
     ============================================================ */
  const PICO_PALETTE = [
    '#000000', '#1D2B53', '#7E2553', '#008751',
    '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
    '#FF004D', '#FFA300', '#FFEC27', '#00E436',
    '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA'
  ];

  const studio = {
    canvas: null,
    ctx: null,
    previewCanvas: null,
    previewCtx: null,
    gridSize: 16,
    gridData: [], // 16x16 array of hex colors
    activeTool: 'pen', // 'pen', 'eraser', 'bucket', 'picker'
    activeColor: '#FF004D',
    isDrawing: false,
    history: [],
    showGrid: true,

    init() {
      this.canvas = document.getElementById('pixel-canvas');
      this.previewCanvas = document.getElementById('preview-canvas');
      if (!this.canvas || !this.previewCanvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.previewCtx = this.previewCanvas.getContext('2d');

      // Initialize blank white grid
      this.clearGrid(false);

      this.setupPalette();
      this.setupTools();
      this.setupCanvasEvents();
      this.setupTemplates();
      this.loadTemplate('mushroom'); // Load default cute sprite
    },

    clearGrid(recordHistory = true) {
      if (recordHistory) this.saveHistory();
      this.gridData = [];
      for (let y = 0; y < this.gridSize; y++) {
        const row = [];
        for (let x = 0; x < this.gridSize; x++) {
          row.push('#ffffff');
        }
        this.gridData.push(row);
      }
      this.render();
    },

    saveHistory() {
      if (this.history.length > 20) this.history.shift();
      const snapshot = this.gridData.map(row => [...row]);
      this.history.push(snapshot);
    },

    undo() {
      if (this.history.length > 0) {
        this.gridData = this.history.pop();
        this.render();
        sound.playBleep(450);
      }
    },

    setupPalette() {
      const container = document.getElementById('palette-swatches-grid');
      const previewBox = document.getElementById('active-color-preview');
      const hexLabel = document.getElementById('hex-label');
      const colorPicker = document.getElementById('custom-color-picker');

      if (!container) return;
      container.innerHTML = '';

      PICO_PALETTE.forEach((color, i) => {
        const swatch = document.createElement('div');
        swatch.className = `color-swatch ${color.toLowerCase() === this.activeColor.toLowerCase() ? 'active' : ''}`;
        swatch.style.backgroundColor = color;
        swatch.title = `Color: ${color}`;

        swatch.addEventListener('click', () => {
          this.setColor(color);
          sound.playBleep(700);
        });

        container.appendChild(swatch);
      });

      if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
          this.setColor(e.target.value);
        });
      }
    },

    setColor(color) {
      this.activeColor = color;
      const previewBox = document.getElementById('active-color-preview');
      const hexLabel = document.getElementById('hex-label');
      const colorPicker = document.getElementById('custom-color-picker');

      if (previewBox) previewBox.style.backgroundColor = color;
      if (hexLabel) hexLabel.textContent = color.toUpperCase();
      if (colorPicker) colorPicker.value = color;

      document.querySelectorAll('.color-swatch').forEach(swatch => {
        if (swatch.style.backgroundColor === color) {
          swatch.classList.add('active');
        } else {
          swatch.classList.remove('active');
        }
      });
    },

    setupTools() {
      const toolBtns = document.querySelectorAll('.tool-btn');
      toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          toolBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeTool = btn.getAttribute('data-tool');
          sound.playBleep(650);
        });
      });

      const undoBtn = document.getElementById('undo-canvas-btn');
      if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

      const clearBtn = document.getElementById('clear-canvas-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.clearGrid(true);
          sound.playExplosion();
        });
      }

      const gridCb = document.getElementById('grid-toggle-cb');
      if (gridCb) {
        gridCb.addEventListener('change', (e) => {
          this.showGrid = e.target.checked;
          this.render();
        });
      }

      const exportBtn = document.getElementById('download-png-btn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => this.exportPNG());
      }
    },

    setupCanvasEvents() {
      const coords = document.getElementById('canvas-coords');

      const getGridPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = this.gridSize / rect.width;
        const scaleY = this.gridSize / rect.height;
        const x = Math.floor((clientX - rect.left) * scaleX);
        const y = Math.floor((clientY - rect.top) * scaleY);
        return {
          x: Math.max(0, Math.min(this.gridSize - 1, x)),
          y: Math.max(0, Math.min(this.gridSize - 1, y))
        };
      };

      const startDraw = (e) => {
        e.preventDefault();
        this.saveHistory();
        this.isDrawing = true;
        const pos = getGridPos(e);
        this.applyTool(pos.x, pos.y);
      };

      const drawMove = (e) => {
        const pos = getGridPos(e);
        if (coords) {
          coords.textContent = `X: ${pos.x.toString().padStart(2, '0')} | Y: ${pos.y.toString().padStart(2, '0')}`;
        }
        if (this.isDrawing) {
          e.preventDefault();
          this.applyTool(pos.x, pos.y);
        }
      };

      const stopDraw = () => {
        if (this.isDrawing) {
          this.isDrawing = false;
          addCoins(1); // Small reward for creating art!
        }
      };

      this.canvas.addEventListener('mousedown', startDraw);
      window.addEventListener('mousemove', drawMove);
      window.addEventListener('mouseup', stopDraw);

      this.canvas.addEventListener('touchstart', startDraw, { passive: false });
      window.addEventListener('touchmove', drawMove, { passive: false });
      window.addEventListener('touchend', stopDraw);
    },

    applyTool(x, y) {
      if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return;

      if (this.activeTool === 'pen') {
        if (this.gridData[y][x] !== this.activeColor) {
          this.gridData[y][x] = this.activeColor;
          sound.playBleep(750 + x * 20);
          this.render();
        }
      } else if (this.activeTool === 'eraser') {
        if (this.gridData[y][x] !== '#ffffff') {
          this.gridData[y][x] = '#ffffff';
          sound.playBleep(350);
          this.render();
        }
      } else if (this.activeTool === 'bucket') {
        const targetColor = this.gridData[y][x];
        if (targetColor !== this.activeColor) {
          this.floodFill(x, y, targetColor, this.activeColor);
          sound.playPowerup();
          this.render();
        }
      } else if (this.activeTool === 'picker') {
        const picked = this.gridData[y][x];
        this.setColor(picked);
        sound.playBleep(900);
      }
    },

    floodFill(startX, startY, targetColor, fillColor) {
      if (targetColor === fillColor) return;
      const stack = [[startX, startY]];

      while (stack.length > 0) {
        const [x, y] = stack.pop();
        if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) continue;
        if (this.gridData[y][x] !== targetColor) continue;

        this.gridData[y][x] = fillColor;

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    },

    render() {
      this.ctx.clearRect(0, 0, this.gridSize, this.gridSize);

      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          this.ctx.fillStyle = this.gridData[y][x];
          this.ctx.fillRect(x, y, 1, 1);
        }
      }

      // Draw Grid overlay if enabled
      if (this.showGrid) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let i = 0; i < this.gridSize; i++) {
          for (let j = 0; j < this.gridSize; j++) {
            if ((i + j) % 2 === 0) {
              this.ctx.fillRect(i, j, 1, 1);
            }
          }
        }
      }

      // Update live preview
      this.previewCtx.clearRect(0, 0, 16, 16);
      this.previewCtx.drawImage(this.canvas, 0, 0);
    },

    setupTemplates() {
      const templateBtns = document.querySelectorAll('.template-card');
      templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-template');
          this.loadTemplate(type);
          sound.playPowerup();
        });
      });
    },

    loadTemplate(name) {
      this.saveHistory();
      this.clearGrid(false);

      const templates = {
        mushroom: [
          '................',
          '....RRRRRRRR....',
          '...RWWWRRWWRR...',
          '..RWWWWWWWWWWR..',
          '..RWWWWWWWWWWR..',
          '.RRWWWRRWWWWRRR.',
          '.RRWWWRRWWWWRRR.',
          '.RRRRRRRRRRRRRR.',
          '....KKKKKKKK....',
          '....KSSSSSSK....',
          '....KSBSSBSK....',
          '....KSSSSSSK....',
          '....KSSSSSSK....',
          '....KKKKKKKK....',
          '................',
          '................'
        ],
        heart: [
          '................',
          '...RRR....RRR...',
          '..RWWWR..RRRRR..',
          '.RWWWWWRRRRRRRR.',
          '.RWWWWWRRRRRRRR.',
          '.RRRRRRRRRRRRRR.',
          '..RRRRRRRRRRRR..',
          '...RRRRRRRRRR...',
          '....RRRRRRRR....',
          '.....RRRRRR.....',
          '......RRRR......',
          '.......RR.......',
          '................',
          '................',
          '................',
          '................'
        ],
        invader: [
          '................',
          '....G......G....',
          '.....G....G.....',
          '....GGGGGGGG....',
          '...GGG.GG.GGG...',
          '..GGGGGGGGGGGG..',
          '..G.GGGGGGGG.G..',
          '..G.G......G.G..',
          '.....GG..GG.....',
          '....G......G....',
          '...G........G...',
          '................',
          '................',
          '................',
          '................',
          '................'
        ],
        sword: [
          '..............CY',
          '.............CY.',
          '............CY..',
          '...........CY...',
          '..........CY....',
          '.........CY.....',
          '........CY......',
          '..BB...CY.......',
          '..BDB.CY........',
          '...BDBY.........',
          '....BD..........',
          '...D.BD.........',
          '..D...BD........',
          '.B.....BB.......',
          '................',
          '................'
        ],
        potion: [
          '......WWWW......',
          '......WGGW......',
          '.......WW.......',
          '.....WW..WW.....',
          '....WPP..PPW....',
          '...WPPPPPPPPW...',
          '..WPPPPPPPPPPW..',
          '..WPPPPPPPPPPW..',
          '..WPPPPPPPPPPW..',
          '..WPPPPPPPPPPW..',
          '..WPPPPPPPPPPW..',
          '...WPPPPPPPPW...',
          '....WWWWWWWW....',
          '................',
          '................',
          '................'
        ],
        coin: [
          '.....YYYYYY.....',
          '...YYOOOOOOYY...',
          '..YYOYYYYYYOYY..',
          '.YYOYYOOOOYYOYY.',
          '.YYOYOOOOOOYOY..',
          'YYOYOOOOOOOOYOY.',
          'YYOYOOOOOOOOYOY.',
          'YYOYOOOOOOOOYOY.',
          'YYOYOOOOOOOOYOY.',
          '.YYOYOOOOOOYOY..',
          '.YYOYYOOOOYYOYY.',
          '..YYOYYYYYYOYY..',
          '...YYOOOOOOYY...',
          '.....YYYYYY.....',
          '................',
          '................'
        ]
      };

      const colorMap = {
        '.': '#ffffff',
        'R': '#ff004d',
        'W': '#ffffff',
        'K': '#000000',
        'S': '#ffccaa',
        'B': '#1d2b53',
        'G': '#00e436',
        'C': '#29adff',
        'Y': '#ffec27',
        'D': '#ab5236',
        'O': '#ffa300',
        'P': '#7e2553'
      };

      const pattern = templates[name];
      if (!pattern) return;

      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const char = pattern[y][x];
          this.gridData[y][x] = colorMap[char] || '#ffffff';
        }
      }
      this.render();
    },

    exportPNG() {
      // Create off-screen 320x320 canvas for ultra-crisp pixel export
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 320;
      exportCanvas.height = 320;
      const expCtx = exportCanvas.getContext('2d');
      expCtx.imageSmoothingEnabled = false;

      // Draw cleanly without grid overlay
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          expCtx.fillStyle = this.gridData[y][x];
          expCtx.fillRect(x * 20, y * 20, 20, 20);
        }
      }

      const link = document.createElement('a');
      link.download = `pixel-art-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();

      sound.playVictory();
      addCoins(25); // Bonus for exporting!
    }
  };

  /* ============================================================
     6. ARCADE MINI-GAME: SLIME HOPPER
     ============================================================ */
  const arcade = {
    canvas: null,
    ctx: null,
    running: false,
    score: 0,
    coinsEarned: 0,
    speed: 4,
    gravity: 0.65,
    frame: 0,

    player: {
      x: 60,
      y: 260,
      w: 24,
      h: 28,
      vy: 0,
      grounded: true,
      color: '#ff2a6d'
    },

    obstacles: [],
    coins: [],
    particles: [],
    bullets: [],

    init() {
      this.canvas = document.getElementById('game-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      const startBtn = document.getElementById('game-start-btn');
      const restartBtn = document.getElementById('game-restart-btn');
      const actionBtn = document.getElementById('overlay-action-btn');
      const jumpTouch = document.getElementById('touch-jump-btn');
      const shootTouch = document.getElementById('touch-shoot-btn');

      if (startBtn) startBtn.addEventListener('click', () => this.start());
      if (restartBtn) restartBtn.addEventListener('click', () => this.start());
      if (actionBtn) actionBtn.addEventListener('click', () => this.start());

      if (jumpTouch) jumpTouch.addEventListener('click', () => this.jump());
      if (shootTouch) shootTouch.addEventListener('click', () => this.shoot());

      window.addEventListener('keydown', (e) => {
        // Space / ArrowUp to jump
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          if (document.getElementById('pane-arcade').classList.contains('active')) {
            e.preventDefault();
            if (!this.running) {
              this.start();
            } else {
              this.jump();
            }
          }
        }
        // Key F to shoot
        if (e.code === 'KeyF') {
          if (this.running) {
            e.preventDefault();
            this.shoot();
          }
        }
      });

      this.drawIdleScreen();
    },

    start() {
      this.running = true;
      this.score = 0;
      this.coinsEarned = 0;
      this.speed = 4.2;
      this.player.y = 260;
      this.player.vy = 0;
      this.obstacles = [];
      this.coins = [];
      this.particles = [];
      this.bullets = [];

      document.getElementById('game-overlay').classList.add('hidden');
      document.getElementById('game-current-score').textContent = '0';
      document.getElementById('game-coin-count').textContent = '0';

      sound.playPowerup();
      this.loop();
    },

    jump() {
      if (this.player.grounded) {
        this.player.vy = -12.5;
        this.player.grounded = false;
        sound.playJump();
        this.spawnDust(this.player.x + 12, this.player.y + 28);
      }
    },

    shoot() {
      this.bullets.push({
        x: this.player.x + this.player.w,
        y: this.player.y + 12,
        w: 12,
        h: 4,
        speed: 9
      });
      sound.playLaser();
    },

    spawnDust(x, y) {
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 2,
          color: '#ffffff',
          size: Math.random() * 3 + 2,
          life: 20
        });
      }
    },

    spawnExplosion(x, y, color = '#ffec27') {
      for (let i = 0; i < 12; i++) {
        this.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color,
          size: Math.random() * 4 + 2,
          life: 25
        });
      }
    },

    loop() {
      if (!this.running) return;

      this.update();
      this.draw();

      requestAnimationFrame(() => this.loop());
    },

    update() {
      this.frame++;

      // Player gravity & bounds
      this.player.vy += this.gravity;
      this.player.y += this.player.vy;

      const floorY = 280;
      if (this.player.y >= floorY - this.player.h) {
        this.player.y = floorY - this.player.h;
        this.player.vy = 0;
        this.player.grounded = true;
      }

      // Bullets update
      for (let b = this.bullets.length - 1; b >= 0; b--) {
        const bullet = this.bullets[b];
        bullet.x += bullet.speed;
        if (bullet.x > this.canvas.width) {
          this.bullets.splice(b, 1);
        }
      }

      // Spawn Obstacles (slimes, spikes, bats)
      if (this.frame % Math.max(45, 110 - Math.floor(this.score / 50)) === 0) {
        const type = Math.random() > 0.4 ? 'slime' : (Math.random() > 0.5 ? 'bat' : 'spikes');
        this.obstacles.push({
          x: this.canvas.width + 20,
          y: type === 'bat' ? floorY - 60 : floorY - 24,
          w: type === 'spikes' ? 18 : 24,
          h: 24,
          type,
          hp: type === 'slime' ? 2 : 1
        });
      }

      // Spawn Coins
      if (this.frame % 70 === 0) {
        this.coins.push({
          x: this.canvas.width + 20,
          y: floorY - (Math.random() > 0.5 ? 40 : 80),
          w: 14,
          h: 14
        });
      }

      // Update Obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= this.speed;

        // Collision with bullets
        for (let b = this.bullets.length - 1; b >= 0; b--) {
          const bullet = this.bullets[b];
          if (
            bullet.x < obs.x + obs.w &&
            bullet.x + bullet.w > obs.x &&
            bullet.y < obs.y + obs.h &&
            bullet.y + bullet.h > obs.y
          ) {
            this.bullets.splice(b, 1);
            obs.hp--;
            sound.playBleep(300);
            if (obs.hp <= 0) {
              this.spawnExplosion(obs.x + obs.w / 2, obs.y + obs.h / 2, '#05d9e8');
              this.obstacles.splice(i, 1);
              this.score += 25;
              sound.playExplosion();
              break;
            }
          }
        }

        // Collision with Player
        if (
          this.player.x + 4 < obs.x + obs.w &&
          this.player.x + this.player.w - 4 > obs.x &&
          this.player.y + 4 < obs.y + obs.h &&
          this.player.y + this.player.h > obs.y
        ) {
          this.gameOver();
          return;
        }

        if (obs.x < -40) {
          this.obstacles.splice(i, 1);
          this.score += 10;
        }
      }

      // Update Coins
      for (let i = this.coins.length - 1; i >= 0; i--) {
        const coin = this.coins[i];
        coin.x -= this.speed;

        // Check pickup
        if (
          this.player.x < coin.x + coin.w &&
          this.player.x + this.player.w > coin.x &&
          this.player.y < coin.y + coin.h &&
          this.player.y + this.player.h > coin.y
        ) {
          this.coins.splice(i, 1);
          this.coinsEarned++;
          addCoins(1);
          sound.playCoin();
          this.spawnExplosion(coin.x + 7, coin.y + 7, '#ffec27');
          document.getElementById('game-coin-count').textContent = this.coinsEarned;
          continue;
        }

        if (coin.x < -30) {
          this.coins.splice(i, 1);
        }
      }

      // Update Particles
      for (let p = this.particles.length - 1; p >= 0; p--) {
        const part = this.particles[p];
        part.x += part.vx;
        part.y += part.vy;
        part.life--;
        if (part.life <= 0) this.particles.splice(p, 1);
      }

      // Speed up gradually
      this.speed = 4.2 + Math.min(6, this.score / 250);
      document.getElementById('game-current-score').textContent = this.score;
    },

    draw() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const floorY = 280;

      // Background Sky & Stars
      ctx.fillStyle = '#0f0e26';
      ctx.fillRect(0, 0, w, h);

      // Starfield
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 25; s++) {
        const sx = ((s * 47) - this.frame * 0.4) % w;
        const realX = sx < 0 ? sx + w : sx;
        const sy = (s * 29) % 180;
        ctx.fillRect(realX, sy, 2, 2);
      }

      // Retro Distant Mountain Skyline
      ctx.fillStyle = '#1c1b3f';
      for (let m = 0; m < 8; m++) {
        const mx = ((m * 120) - this.frame * 0.8) % (w + 120);
        const realMx = mx < 0 ? mx + w + 120 : mx;
        ctx.fillRect(realMx - 60, floorY - 80, 80, 80);
      }

      // Ground / Floor
      ctx.fillStyle = '#392652';
      ctx.fillRect(0, floorY, w, h - floorY);
      ctx.fillStyle = '#05d9e8';
      ctx.fillRect(0, floorY, w, 4);

      // Grid stripes on floor
      ctx.fillStyle = '#261938';
      for (let f = 0; f < w; f += 32) {
        const fx = (f - (this.frame * this.speed)) % w;
        const realFx = fx < 0 ? fx + w : fx;
        ctx.fillRect(realFx, floorY + 4, 16, h - floorY);
      }

      // Draw Player (Retro Hero)
      this.drawPlayer(this.player.x, this.player.y);

      // Draw Bullets
      ctx.fillStyle = '#ffec27';
      for (const bullet of this.bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(bullet.x - 3, bullet.y + 1, 3, 2);
      }

      // Draw Obstacles
      for (const obs of this.obstacles) {
        if (obs.type === 'slime') {
          // Bouncing green slime
          ctx.fillStyle = '#00e436';
          ctx.fillRect(obs.x + 2, obs.y + 4, obs.w - 4, obs.h - 4);
          ctx.fillRect(obs.x + 4, obs.y, obs.w - 8, 4);
          // Slime Eyes
          ctx.fillStyle = '#000';
          ctx.fillRect(obs.x + 6, obs.y + 8, 3, 4);
          ctx.fillRect(obs.x + 14, obs.y + 8, 3, 4);
        } else if (obs.type === 'bat') {
          // Purple flying bat
          ctx.fillStyle = '#bd00ff';
          const flap = Math.sin(this.frame * 0.2) * 4;
          ctx.fillRect(obs.x + 4, obs.y + flap, 16, 12);
          ctx.fillRect(obs.x, obs.y - 4 + flap, 6, 6);
          ctx.fillRect(obs.x + 18, obs.y - 4 + flap, 6, 6);
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(obs.x + 8, obs.y + 4 + flap, 2, 2);
          ctx.fillRect(obs.x + 14, obs.y + 4 + flap, 2, 2);
        } else {
          // Danger Spikes
          ctx.fillStyle = '#e40058';
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.h);
          ctx.lineTo(obs.x + obs.w / 2, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.fill();
        }
      }

      // Draw Coins
      for (const coin of this.coins) {
        const spin = Math.abs(Math.sin(this.frame * 0.1));
        ctx.fillStyle = '#ffec27';
        ctx.fillRect(coin.x + (1 - spin) * 5, coin.y, coin.w * spin, coin.h);
        ctx.fillStyle = '#ffa300';
        ctx.fillRect(coin.x + 3 + (1 - spin) * 3, coin.y + 3, (coin.w - 6) * spin, coin.h - 6);
      }

      // Draw Particles
      for (const p of this.particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    },

    drawPlayer(x, y) {
      const ctx = this.ctx;
      const legOffset = this.player.grounded ? Math.sin(this.frame * 0.3) * 3 : 0;

      // Cap / Helmet
      ctx.fillStyle = '#ff2a6d';
      ctx.fillRect(x + 4, y, 16, 6);
      ctx.fillRect(x + 8, y + 2, 14, 4); // Visor

      // Face
      ctx.fillStyle = '#ffccaa';
      ctx.fillRect(x + 6, y + 6, 12, 8);

      // Eye
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 14, y + 8, 2, 3);

      // Shirt / Armor
      ctx.fillStyle = '#05d9e8';
      ctx.fillRect(x + 4, y + 14, 16, 8);

      // Legs
      ctx.fillStyle = '#1d2b53';
      ctx.fillRect(x + 5, y + 22, 5, 6 + legOffset);
      ctx.fillRect(x + 13, y + 22, 5, 6 - legOffset);
    },

    gameOver() {
      this.running = false;
      sound.playGameOver();

      if (this.score > state.highScore) {
        state.highScore = this.score;
        updateHUD();
      }

      const overlay = document.getElementById('game-overlay');
      const title = document.getElementById('overlay-main-text');
      const sub = document.getElementById('overlay-sub-text');
      const btn = document.getElementById('overlay-action-btn');

      if (overlay) overlay.classList.remove('hidden');
      if (title) title.textContent = 'GAME OVER';
      if (sub) sub.innerHTML = `SCORE: ${this.score} • COINS COLLECTED: +${this.coinsEarned}`;
      if (btn) btn.textContent = 'PLAY AGAIN (RETRY)';
    },

    drawIdleScreen() {
      const ctx = this.ctx;
      ctx.fillStyle = '#0f0e26';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#05d9e8';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS START TO PLAY', this.canvas.width / 2, this.canvas.height / 2);
    }
  };

  /* ============================================================
     7. VIRTUAL PIXEL PET: PIXIE
     ============================================================ */
  const pet = {
    canvas: null,
    ctx: null,
    bubble: null,
    hunger: 85,
    happiness: 90,
    energy: 70,
    ageDays: 1,
    frame: 0,
    state: 'idle', // 'idle', 'eating', 'playing', 'sleeping'

    init() {
      this.canvas = document.getElementById('pet-canvas');
      this.bubble = document.getElementById('pet-bubble');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');

      const feedBtn = document.getElementById('feed-pet-btn');
      const playBtn = document.getElementById('play-pet-btn');
      const petBtn = document.getElementById('pet-love-btn');
      const sleepBtn = document.getElementById('sleep-pet-btn');

      if (feedBtn) feedBtn.addEventListener('click', () => this.feed());
      if (playBtn) playBtn.addEventListener('click', () => this.play());
      if (petBtn) petBtn.addEventListener('click', (e) => this.tickle(e));
      if (sleepBtn) sleepBtn.addEventListener('click', () => this.toggleSleep());

      this.canvas.addEventListener('click', (e) => this.tickle(e));

      // Natural stat decay over time
      setInterval(() => {
        if (this.state !== 'sleeping') {
          this.hunger = Math.max(0, this.hunger - 1);
          this.happiness = Math.max(0, this.happiness - 1);
          this.energy = Math.max(0, this.energy - 1);
        } else {
          this.energy = Math.min(100, this.energy + 3);
          this.hunger = Math.max(0, this.hunger - 1);
        }
        this.updateBars();
      }, 5000);

      this.loop();
    },

    say(text) {
      if (this.bubble) {
        this.bubble.textContent = text;
      }
    },

    updateBars() {
      const hBar = document.getElementById('hunger-bar');
      const hapBar = document.getElementById('happy-bar');
      const eBar = document.getElementById('energy-bar');

      const hVal = document.getElementById('hunger-val');
      const hapVal = document.getElementById('happy-val');
      const eVal = document.getElementById('energy-val');

      if (hBar) hBar.style.width = `${this.hunger}%`;
      if (hapBar) hapBar.style.width = `${this.happiness}%`;
      if (eBar) eBar.style.width = `${this.energy}%`;

      if (hVal) hVal.textContent = `${this.hunger}%`;
      if (hapVal) hapVal.textContent = `${this.happiness}%`;
      if (eVal) eVal.textContent = `${this.energy}%`;

      const moodBadge = document.getElementById('pet-mood-badge');
      if (moodBadge) {
        if (this.hunger < 25) {
          moodBadge.textContent = 'MOOD: STARVING! 🥩';
        } else if (this.happiness < 30) {
          moodBadge.textContent = 'MOOD: LONELY... 🥺';
        } else if (this.energy < 20) {
          moodBadge.textContent = 'MOOD: SLEEPY 🥱';
        } else {
          moodBadge.textContent = 'MOOD: ECSTATIC! ✨';
        }
      }
    },

    feed() {
      this.hunger = Math.min(100, this.hunger + 25);
      this.state = 'eating';
      sound.playPowerup();
      addCoins(2);
      this.say('Nom nom nom! Delicious! 🍖');
      this.updateBars();
      setTimeout(() => { this.state = 'idle'; }, 1500);
    },

    play() {
      if (this.energy < 15) {
        this.say('Too tired to play... zzz 😴');
        sound.playBleep(300);
        return;
      }
      this.happiness = Math.min(100, this.happiness + 30);
      this.energy = Math.max(0, this.energy - 15);
      this.state = 'playing';
      sound.playJump();
      addCoins(5);
      this.say('Wheeee! That was so fun! 🎾');
      this.updateBars();
      setTimeout(() => { this.state = 'idle'; }, 2000);
    },

    tickle(e) {
      this.happiness = Math.min(100, this.happiness + 10);
      sound.playCoin();
      addCoins(1, e ? e.clientX : undefined, e ? e.clientY : undefined);
      this.say('Hehe tickles! *giggles* 💖');
      this.updateBars();
    },

    toggleSleep() {
      if (this.state === 'sleeping') {
        this.state = 'idle';
        this.say('Good morning world! ☀️');
        sound.playPowerup();
      } else {
        this.state = 'sleeping';
        this.say('Zzzzz... sweet dreams 💤');
        sound.playBleep(400);
      }
    },

    loop() {
      this.frame++;
      this.draw();
      requestAnimationFrame(() => this.loop());
    },

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 32, 32);

      const wobble = this.state === 'idle' ? Math.sin(this.frame * 0.08) * 1.5 : 0;
      const jumpY = this.state === 'playing' ? Math.abs(Math.sin(this.frame * 0.2)) * 6 : 0;

      const px = 4;
      const py = 6 - jumpY;

      // Base body - cute rounded emerald jelly
      ctx.fillStyle = '#00e436';
      ctx.fillRect(px + 4, py + 8 + wobble, 16, 14 - wobble);
      ctx.fillRect(px + 2, py + 12, 20, 10);

      // Highlights
      ctx.fillStyle = '#83f52c';
      ctx.fillRect(px + 6, py + 10, 4, 3);
      ctx.fillRect(px + 8, py + 9, 2, 2);

      // Expression / Eyes
      if (this.state === 'sleeping') {
        // Sleepy closed lines
        ctx.fillStyle = '#000000';
        ctx.fillRect(px + 6, py + 14, 4, 1);
        ctx.fillRect(px + 14, py + 14, 4, 1);

        // Zzz particle
        ctx.fillStyle = '#05d9e8';
        ctx.font = '8px monospace';
        ctx.fillText('z', px + 22, py + 6 + (this.frame % 30));
      } else if (this.state === 'eating') {
        // Joyful eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(px + 6, py + 13, 3, 2);
        ctx.fillRect(px + 15, py + 13, 3, 2);
        // Open mouth
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(px + 10, py + 17, 4, 3);
      } else {
        // Big cute eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(px + 6, py + 12, 4, 5);
        ctx.fillRect(px + 14, py + 12, 4, 5);
        // White sparkles
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 6, py + 12, 2, 2);
        ctx.fillRect(px + 14, py + 12, 2, 2);

        // Cute cheeks
        ctx.fillStyle = '#ff77a8';
        ctx.fillRect(px + 4, py + 16, 2, 2);
        ctx.fillRect(px + 18, py + 16, 2, 2);

        // Smile
        ctx.fillStyle = '#000000';
        ctx.fillRect(px + 10, py + 17, 4, 1);
      }
    }
  };

  /* ============================================================
     8. CHIPTUNE SYNTH & KEYBOARD
     ============================================================ */
  const synth = {
    notes: {
      'C4': 261.63,
      'D4': 293.66,
      'E4': 329.63,
      'F4': 349.23,
      'G4': 392.00,
      'A4': 440.00,
      'B4': 493.88,
      'C5': 523.25
    },
    keyMap: {
      'KeyA': 'C4',
      'KeyS': 'D4',
      'KeyD': 'E4',
      'KeyF': 'F4',
      'KeyG': 'G4',
      'KeyH': 'A4',
      'KeyJ': 'B4',
      'KeyK': 'C5'
    },

    init() {
      const keys = document.querySelectorAll('.piano-key');
      const waveSel = document.getElementById('synth-wave');

      keys.forEach(key => {
        key.addEventListener('mousedown', () => {
          const note = key.getAttribute('data-note');
          this.triggerNote(note, key);
        });
      });

      // Sound FX launchpad buttons
      const fxBtns = document.querySelectorAll('.fx-pad');
      fxBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const fx = btn.getAttribute('data-fx');
          if (fx === 'coin') sound.playCoin();
          if (fx === 'jump') sound.playJump();
          if (fx === 'laser') sound.playLaser();
          if (fx === 'powerup') sound.playPowerup();
          if (fx === 'explosion') sound.playExplosion();
          if (fx === 'gameover') sound.playGameOver();
          addCoins(1);
        });
      });

      // Victory Jingle Button
      const jingleBtn = document.getElementById('play-tune-btn');
      if (jingleBtn) {
        jingleBtn.addEventListener('click', () => {
          sound.playVictory();
          addCoins(5);
        });
      }

      // Keyboard bindings
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        if (this.keyMap[e.code]) {
          const note = this.keyMap[e.code];
          const keyEl = document.querySelector(`.piano-key[data-note="${note}"]`);
          this.triggerNote(note, keyEl);
        }
      });
    },

    triggerNote(noteName, element) {
      const freq = this.notes[noteName];
      if (!freq) return;

      const waveType = document.getElementById('synth-wave')?.value || 'square';
      sound.playTone(freq, waveType, 0.35, 0.35);

      if (element) {
        element.classList.add('active');
        setTimeout(() => element.classList.remove('active'), 180);
      }
    }
  };

  /* ============================================================
     9. APPLICATION BOOTSTRAP
     ============================================================ */
  window.addEventListener('DOMContentLoaded', () => {
    updateHUD();
    setupControls();
    drawLogo();
    initHeroMascot();
    studio.init();
    arcade.init();
    pet.init();
    synth.init();
  });

})();
