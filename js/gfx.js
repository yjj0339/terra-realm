(function () {
  const T = window.T;
  const TS = 16;
  const tileArt = {};
  const wallArt = {};
  const leafArts = {};

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function hexA(c, a) {
    return T.rgba(c, a);
  }

  function speckle(ctx, rnd, pal, count, size) {
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = pal[Math.floor(rnd() * pal.length)];
      const s = size || 1;
      ctx.fillRect(Math.floor(rnd() * 16), Math.floor(rnd() * 16), s, s);
    }
  }

  function drawDirt(ctx, rnd, pal) {
    ctx.fillStyle = pal[0];
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 22; i++) {
      ctx.fillStyle = pal[1 + Math.floor(rnd() * 3)];
      const x = Math.floor(rnd() * 15), y = Math.floor(rnd() * 15);
      ctx.fillRect(x, y, 1 + Math.floor(rnd() * 2), 1 + Math.floor(rnd() * 2));
    }
    ctx.fillStyle = hexA('#000000', 0.18);
    ctx.fillRect(0, 14, 16, 2);
    ctx.fillStyle = hexA('#ffffff', 0.05);
    ctx.fillRect(0, 0, 16, 1);
  }

  function drawStone(ctx, rnd, pal) {
    ctx.fillStyle = pal[0];
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = pal[1 + Math.floor(rnd() * 3)];
      const x = Math.floor(rnd() * 13), y = Math.floor(rnd() * 13);
      const w = 2 + Math.floor(rnd() * 4), h = 1 + Math.floor(rnd() * 3);
      ctx.fillRect(x, y, w, h);
    }
    ctx.strokeStyle = hexA('#000000', 0.22);
    ctx.lineWidth = 1;
    ctx.beginPath();
    const sx = 2 + rnd() * 8;
    ctx.moveTo(sx, 2);
    ctx.lineTo(sx + 3, 7);
    ctx.lineTo(sx + 1, 12);
    ctx.stroke();
    ctx.fillStyle = hexA('#ffffff', 0.06);
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillStyle = hexA('#000000', 0.2);
    ctx.fillRect(0, 15, 16, 1);
  }

  function drawBrick(ctx, rnd, pal) {
    ctx.fillStyle = pal[0];
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = hexA('#000000', 0.32);
    for (let row = 0; row < 4; row++) {
      ctx.fillRect(0, row * 4 + 3, 16, 1);
      const off = row % 2 === 0 ? 0 : 4;
      ctx.fillRect(off + 3, row * 4, 1, 4);
      ctx.fillRect(off + 11, row * 4, 1, 4);
    }
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = pal[1 + Math.floor(rnd() * (pal.length - 1))];
      ctx.fillRect(Math.floor(rnd() * 14), Math.floor(rnd() * 14), 2, 1);
    }
    ctx.fillStyle = hexA('#ffffff', 0.05);
    ctx.fillRect(0, 0, 16, 1);
  }

  function drawPlanks(ctx, rnd, pal) {
    ctx.fillStyle = pal[0];
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? pal[1] : pal[0];
      ctx.fillRect(0, i * 4, 16, 3);
      ctx.fillStyle = hexA('#000000', 0.28);
      ctx.fillRect(0, i * 4 + 3, 16, 1);
    }
    ctx.fillStyle = hexA('#000000', 0.18);
    ctx.fillRect(7, 0, 1, 16);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = hexA('#000000', 0.15);
      ctx.fillRect(Math.floor(rnd() * 14), Math.floor(rnd() * 15), 2, 1);
    }
  }

  function drawOre(ctx, rnd, pal) {
    drawStone(ctx, rnd, [pal[0], pal[2], pal[2], pal[0]]);
    for (let i = 0; i < 5; i++) {
      const x = 2 + Math.floor(rnd() * 11), y = 2 + Math.floor(rnd() * 11);
      const s = 2 + Math.floor(rnd() * 2);
      ctx.fillStyle = pal[1];
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = pal[3];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  function drawGem(ctx, rnd, pal) {
    drawStone(ctx, rnd, [pal[0], pal[2], pal[2], pal[0]]);
    for (let i = 0; i < 4; i++) {
      const x = 3 + Math.floor(rnd() * 9), y = 3 + Math.floor(rnd() * 9);
      ctx.fillStyle = pal[1];
      ctx.beginPath();
      ctx.moveTo(x, y - 2);
      ctx.lineTo(x + 2, y);
      ctx.lineTo(x, y + 2);
      ctx.lineTo(x - 2, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = pal[3];
      ctx.fillRect(x, y - 1, 1, 1);
    }
  }

  function drawLeaves(ctx, rnd, pal) {
    const dark = pal[2] || pal[pal.length - 1];
    const mid = pal[0];
    const light = pal[1] || pal[0];
    for (let i = 0; i < 26; i++) {
      const x = rnd() * 16, y = rnd() * 16;
      const r = 2.2 + rnd() * 3.4;
      ctx.fillStyle = i % 3 === 0 ? dark : mid;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 6.283);
      ctx.fill();
    }
    for (let i = 0; i < 15; i++) {
      const x = rnd() * 16, y = rnd() * 14;
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(x, y, 1.1 + rnd() * 2, 0, 6.283);
      ctx.fill();
    }
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = hexA('#ffffff', 0.10 + rnd() * 0.12);
      ctx.fillRect(Math.floor(rnd() * 15), Math.floor(rnd() * 15), 1 + Math.floor(rnd() * 2), 1);
    }
  }

  function drawTrunk(ctx, rnd, pal) {
    ctx.fillStyle = pal[0];
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = pal[1 + Math.floor(rnd() * 3)];
      const x = Math.floor(rnd() * 14) + 1;
      const h = 4 + Math.floor(rnd() * 12);
      const y = Math.floor(rnd() * (16 - h));
      ctx.globalAlpha = 0.25 + rnd() * 0.4;
      ctx.fillRect(x, y, 1 + Math.floor(rnd() * 2), h);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = hexA(pal[2], 0.5);
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      const x = 2 + Math.floor(rnd() * 12);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (rnd() < 0.5 ? -1 : 1), 16);
      ctx.stroke();
    }
    ctx.fillStyle = hexA(pal[3] || pal[2], 0.34);
    ctx.fillRect(0, 0, 1.6, 16);
    ctx.fillStyle = hexA('#000000', 0.2);
    ctx.fillRect(14.4, 0, 1.6, 16);
    ctx.fillStyle = hexA('#ffffff', 0.1);
    ctx.fillRect(1.6, 0, 1, 16);
  }

  function bakeTile(id, variant) {
    const def = T.tileDef(id);
    const c = makeCanvas(16, 16);
    const ctx = c.getContext('2d');
    const rnd = T.mulberry32(id * 7919 + variant * 104729 + 17);
    const pal = def.pal || ['#888', '#999', '#777', '#666'];
    ctx.save();
    switch (def.art) {
      case 'dirt': drawDirt(ctx, rnd, pal); break;
      case 'grass': {
        drawDirt(ctx, rnd, [pal[0], pal[0], pal[2], pal[2]]);
        const greens = [pal[1], pal[3], pal[2]];
        const grad = ctx.createLinearGradient(0, 0, 0, 7);
        grad.addColorStop(0, greens[0]);
        grad.addColorStop(1, pal[2]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 5);
        for (let x = 0; x < 16; x++) {
          if (rnd() < 0.35) continue;
          const h = Math.floor(rnd() * 3);
          ctx.fillStyle = rnd() < 0.5 ? greens[1] : greens[0];
          ctx.fillRect(x, -h, 1, 3 + h);
        }
        ctx.fillStyle = hexA('#ffffff', 0.1);
        ctx.fillRect(0, 0, 16, 1.2);
        ctx.fillStyle = hexA(pal[2], 0.6);
        ctx.fillRect(0, 4.6, 16, 1.2);
        break;
      }
      case 'stone': drawStone(ctx, rnd, pal); break;
      case 'sand': {
        ctx.fillStyle = pal[0];
        ctx.fillRect(0, 0, 16, 16);
        for (let i = 0; i < 26; i++) {
          ctx.fillStyle = pal[1 + Math.floor(rnd() * 3)];
          ctx.fillRect(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 1, 1);
        }
        ctx.fillStyle = hexA('#000000', 0.1);
        ctx.fillRect(0, 14, 16, 2);
        break;
      }
      case 'sandstone':
        ctx.fillStyle = pal[0];
        ctx.fillRect(0, 0, 16, 16);
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = i % 2 ? pal[1] : pal[2];
          ctx.fillRect(0, i * 4, 16, 2);
          ctx.fillStyle = hexA('#000000', 0.14);
          ctx.fillRect(0, i * 4 + 2, 16, 1);
        }
        break;
      case 'clay': drawDirt(ctx, rnd, pal); break;
      case 'snow':
        ctx.fillStyle = pal[0];
        ctx.fillRect(0, 0, 16, 16);
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = pal[1 + Math.floor(rnd() * 3)];
          ctx.fillRect(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 1 + Math.floor(rnd() * 2), 1);
        }
        ctx.fillStyle = hexA('#ffffff', 0.5);
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillStyle = hexA('#5a7a90', 0.18);
        ctx.fillRect(0, 15, 16, 1);
        break;
      case 'ice': {
        const g = ctx.createLinearGradient(0, 0, 16, 16);
        g.addColorStop(0, pal[1]);
        g.addColorStop(0.5, pal[0]);
        g.addColorStop(1, pal[3]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 16, 16);
        ctx.strokeStyle = hexA('#ffffff', 0.4);
        ctx.beginPath();
        ctx.moveTo(2, 13); ctx.lineTo(9, 3); ctx.lineTo(13, 8);
        ctx.stroke();
        ctx.fillStyle = hexA('#ffffff', 0.22);
        ctx.fillRect(0, 0, 16, 1);
        break;
      }
      case 'mud': drawDirt(ctx, rnd, pal); break;
      case 'junglegrass': {
        drawDirt(ctx, rnd, [pal[0], pal[0], pal[2], pal[2]]);
        ctx.fillStyle = pal[1];
        ctx.fillRect(0, 0, 16, 5);
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = pal[1 + Math.floor(rnd() * 2)];
          ctx.fillRect(x, 0, 1, 2 + Math.floor(rnd() * 4));
        }
        break;
      }
      case 'ash': {
        drawStone(ctx, rnd, pal);
        for (let i = 0; i < 6; i++) {
          if (rnd() < 0.5) {
            ctx.fillStyle = hexA('#ff7a2a', 0.5);
            ctx.fillRect(Math.floor(rnd() * 15), Math.floor(rnd() * 15), 1, 1);
          }
        }
        break;
      }
      case 'ebonstone': drawStone(ctx, rnd, pal); break;
      case 'corruptgrass': {
        drawStone(ctx, rnd, [pal[0], pal[2], pal[3], pal[0]]);
        ctx.fillStyle = pal[1];
        ctx.fillRect(0, 0, 16, 4);
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = pal[1];
          ctx.fillRect(x, 0, 1, 3 + Math.floor(rnd() * 3));
        }
        ctx.fillStyle = hexA('#d0a0ff', 0.22);
        ctx.fillRect(0, 0, 16, 1);
        break;
      }
      case 'cactus': {
        ctx.fillStyle = pal[0];
        ctx.fillRect(3, 0, 10, 16);
        ctx.fillStyle = pal[1];
        ctx.fillRect(4, 0, 3, 16);
        ctx.fillStyle = pal[2];
        ctx.fillRect(10, 0, 3, 16);
        ctx.fillStyle = hexA('#e8f0d0', 0.8);
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(3, 2 + i * 3, 1, 1);
          ctx.fillRect(12, 3 + i * 3, 1, 1);
        }
        break;
      }
      case 'wood': drawPlanks(ctx, rnd, pal); break;
      case 'trunk': drawTrunk(ctx, rnd, pal); break;
      case 'brick_stone': drawBrick(ctx, rnd, pal); break;
      case 'brick_wood': drawBrick(ctx, rnd, pal); break;
      case 'brick_dungeon': drawBrick(ctx, rnd, pal); break;
      case 'brick_obsidian': drawBrick(ctx, rnd, pal); break;
      case 'brick_ebon': drawBrick(ctx, rnd, pal); break;
      case 'glass':
        ctx.fillStyle = hexA(pal[0], 0.25);
        ctx.fillRect(0, 0, 16, 16);
        ctx.strokeStyle = hexA(pal[1], 0.85);
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, 15, 15);
        ctx.beginPath();
        ctx.moveTo(2, 12); ctx.lineTo(6, 3);
        ctx.strokeStyle = hexA('#ffffff', 0.35);
        ctx.stroke();
        break;
      case 'cloud':
        ctx.fillStyle = pal[1];
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = pal[0];
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.arc(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 3 + rnd() * 3, 0, 6.283);
          ctx.fill();
        }
        ctx.fillStyle = hexA(pal[3], 0.4);
        ctx.fillRect(0, 14, 16, 2);
        break;
      case 'ore': drawOre(ctx, rnd, pal); break;
      case 'gem': drawGem(ctx, rnd, pal); break;
      default:
        ctx.fillStyle = def.col;
        ctx.fillRect(0, 0, 16, 16);
    }
    ctx.restore();
    return c;
  }

  function bakeWall(wallId, variant) {
    const def = T.WALLS[wallId];
    const c = makeCanvas(16, 16);
    const ctx = c.getContext('2d');
    const rnd = T.mulberry32(wallId * 3571 + variant * 7919 + 101);
    const pal = def.pal || ['#444', '#555', '#333'];
    ctx.fillStyle = pal[0];
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = pal[1 + Math.floor(rnd() * (pal.length - 1))];
      ctx.fillRect(Math.floor(rnd() * 15), Math.floor(rnd() * 15), 2 + Math.floor(rnd() * 3), 1 + Math.floor(rnd() * 2));
    }
    ctx.fillStyle = hexA('#000000', 0.28);
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(0, i * 4 + 3, 16, 1);
      ctx.fillRect((i % 2) * 8 + 7, i * 4, 1, 4);
    }
    ctx.fillStyle = hexA('#000000', 0.25);
    ctx.fillRect(0, 0, 16, 1);
    return c;
  }

  T.initArt = function () {
    for (let id = 1; id < T.TILES.length; id++) {
      const def = T.TILES[id];
      if (!def) continue;
      if (def.furniture || def.deco || def.canopy) continue;
      if (def.liquid) continue;
      tileArt[id] = [];
      for (let v = 0; v < 4; v++) tileArt[id].push(bakeTile(id, v));
    }
    for (let w = 1; w < T.WALLS.length; w++) {
      wallArt[w] = [];
      for (let v = 0; v < 3; v++) wallArt[w].push(bakeWall(w, v));
    }
    for (const id of [T.TILE.LEAVES, T.TILE.CORRUPT_LEAVES, T.TILE.JUNGLE_LEAVES]) {
      const def = T.TILES[id];
      leafArts[id] = [];
      for (let v = 0; v < 4; v++) {
        const c = makeCanvas(16, 16);
        const g = c.getContext('2d');
        drawLeaves(g, T.mulberry32(id * 977 + v * 313 + 7), def.pal);
        leafArts[id].push(c);
      }
    }
  };

  function hashVariant(x, y, n) {
    return (T.hash2i(x, y, 991) * n) | 0;
  }

  const SKY = {
    dayTop: '#4f96d8', dayBottom: '#bfe2f2',
    duskTop: '#3a3f78', duskBottom: '#e88a5a',
    nightTop: '#080c22', nightBottom: '#1c2a4a',
    dawnTop: '#4a5a9a', dawnBottom: '#f0b08a'
  };

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.lighting = new T.Lighting();
      this.stars = [];
      const rnd = T.RNG(4242);
      for (let i = 0; i < 220; i++) {
        this.stars.push({ x: rnd.next(), y: rnd.next() * 0.75, r: rnd.range(0.4, 1.6), p: rnd.range(0, 6.28) });
      }
      this.clouds = [];
      for (let i = 0; i < 16; i++) {
        this.clouds.push({
          x: rnd.range(0, 1), y: rnd.range(0.03, 0.42), w: rnd.range(120, 340),
          h: rnd.range(20, 52), v: rnd.range(0.6, 2.2), a: rnd.range(0.16, 0.5), seed: rnd.next() * 100
        });
      }
      this.flash = 0;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(320, Math.round(rect.width || window.innerWidth));
      const h = Math.max(240, Math.round(rect.height || window.innerHeight));
      const pw = Math.floor(w * dpr);
      const ph = Math.floor(h * dpr);
      if (this.canvas.width !== pw || this.canvas.height !== ph) {
        this.canvas.width = pw;
        this.canvas.height = ph;
      }
      this.dpr = dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.vw = w;
      this.vh = h;
      const touch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && (navigator.maxTouchPoints || 0) > 0);
      const base = touch ? Math.min(w / 620, h / 330) * 0.92 : Math.min(w / 1200, h / 700) * 1.45;
      this.zoom = T.clamp(base, touch ? 1.5 : 1.15, touch ? 2.9 : 2.3);
    }

    ensureSize() {
      if (this.canvas.width === 0 || this.canvas.height === 0) {
        this.resize();
        return;
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(320, Math.round(window.innerWidth));
      const h = Math.max(240, Math.round(window.innerHeight));
      if (this.vw !== w || this.vh !== h) this.resize();
    }

    worldToScreen(cam, wx, wy) {
      return {
        x: (wx - cam.x) * this.zoom + this.vw / 2,
        y: (wy - cam.y) * this.zoom + this.vh / 2
      };
    }
    screenToWorld(cam, sx, sy) {
      return {
        x: (sx - this.vw / 2) / this.zoom + cam.x,
        y: (sy - this.vh / 2) / this.zoom + cam.y
      };
    }

    biomeSky(game, cam, dayness) {
      const world = game.world;
      const tx = Math.floor(cam.x / TS);
      const biome = world.biomeAt(tx, Math.floor(world.surfaceHeightAt(tx)));
      const palettes = {
        '\u68ee\u6797': { day: ['#57a7e0', '#bfe4f4'], dusk: ['#3b4a86', '#f2a06a'], night: ['#070c20', '#172441'], ridge: ['#7fa8bd', '#4d7284', '#2f4d59'] },
        '\u96ea\u539f': { day: ['#6aa8d8', '#dceaf4'], dusk: ['#4a5a92', '#e8b0b8'], night: ['#0a1024', '#1c2a48'], ridge: ['#c4d8e6', '#94b2c6', '#6a8a9e'] },
        '\u6c99\u6f20': { day: ['#68a8d4', '#f0dcb0'], dusk: ['#5a4a80', '#f0a070'], night: ['#0d1020', '#232038'], ridge: ['#d8c49a', '#b8a078', '#8f7854'] },
        '\u4e1b\u6797': { day: ['#4a9c8a', '#c8e8b8'], dusk: ['#3a4a6a', '#d8a070'], night: ['#06120e', '#102420'], ridge: ['#5f9a7a', '#3d755a', '#255040'] },
        '\u8150\u5316\u4e4b\u5730': { day: ['#5a4a78', '#9a86b0'], dusk: ['#3a2a55', '#a86a88'], night: ['#08050f', '#1a1226'], ridge: ['#6d5487', '#4a3560', '#2e1f3d'] },
        '\u5730\u7262': { day: ['#4a5a78', '#8896ac'], dusk: ['#333a54', '#7a6a84'], night: ['#05070d', '#10141f'], ridge: ['#5b6884', '#3e4a62', '#28303f'] },
        '\u6d77\u6d0b': { day: ['#4f9ed0', '#c8e4f0'], dusk: ['#3a4a80', '#e8a078'], night: ['#060c1c', '#141f38'], ridge: ['#6fa8c0', '#487a92', '#2c5468'] },
        '\u6d77\u6ee9': { day: ['#5aa8d8', '#e0ecc8'], dusk: ['#3f4a80', '#eca878'], night: ['#070d1c', '#182338'], ridge: ['#93b8c8', '#6a92a6', '#46707f'] },
        '\u7a7a\u5c9b': { day: ['#3a86d8', '#d8ecf8'], dusk: ['#3a4488', '#f0b088'], night: ['#050a1e', '#122040'], ridge: ['#b0cce0', '#88aac6', '#6288a2'] }
      };
      const p = palettes[biome] || palettes['\u68ee\u6797'];
      return p;
    }

    drawSky(game, cam, time) {
      const ctx = this.ctx;
      const w = this.vw, h = this.vh;
      const dayT = time / 1440;
      const sunAngle = (dayT - 0.25) * Math.PI * 2;
      const dayness = T.clamp(Math.sin(dayT * Math.PI * 2 - Math.PI / 2) * 1.25 + 0.42, 0, 1);
      const surfaceY = game.world.surfaceHeightAt(cam.x / TS);
      const camDepth = (cam.y / TS - surfaceY);
      const underground = T.clamp((camDepth - 1) / 12, 0, 1);
      const pal = this.biomeSky(game, cam, dayness);
      let top, bottom;
      if (dayness > 0.62) { top = pal.day[0]; bottom = pal.day[1]; }
      else if (dayness > 0.34) {
        const k = (dayness - 0.34) / 0.28;
        top = T.mixColor(pal.dusk[0], pal.day[0], k);
        bottom = T.mixColor(pal.dusk[1], pal.day[1], k);
      } else if (dayness > 0.12) {
        const k = (dayness - 0.12) / 0.22;
        top = T.mixColor(pal.night[0], pal.dusk[0], k);
        bottom = T.mixColor(pal.night[1], pal.dusk[1], k);
      } else {
        top = pal.night[0]; bottom = pal.night[1];
      }
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, top);
      g.addColorStop(1, bottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      if (dayness < 0.42) {
        const alpha = T.clamp((0.42 - dayness) / 0.42, 0, 1);
        for (const s of this.stars) {
          const sx = T.mod(s.x * w - cam.x * 0.03, w);
          const sy = s.y * h * 0.8 - cam.y * 0.02;
          if (sy < -5 || sy > h) continue;
          const tw = 0.55 + 0.45 * Math.sin(time * 0.09 + s.p);
          ctx.fillStyle = hexA('#ffffff', alpha * tw * 0.9);
          ctx.fillRect(sx, sy, s.r, s.r);
        }
      }

      const orbitR = Math.min(w, h) * 0.46;
      const cx = w / 2, cy = h * 0.96;
      const sunX = cx + Math.cos(sunAngle - Math.PI) * orbitR;
      const sunY = cy + Math.sin(sunAngle - Math.PI) * orbitR;
      if (dayness > 0.04 && sunY < h * 0.95) {
        const glow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 190);
        glow.addColorStop(0, 'rgba(255,246,214,0.9)');
        glow.addColorStop(0.14, 'rgba(255,232,170,0.42)');
        glow.addColorStop(0.5, 'rgba(255,220,150,0.12)');
        glow.addColorStop(1, 'rgba(255,210,130,0)');
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 190, 0, 6.283);
        ctx.fill();
        ctx.restore();
        const disc = ctx.createRadialGradient(sunX - 6, sunY - 6, 2, sunX, sunY, 28);
        disc.addColorStop(0, '#fffdf0');
        disc.addColorStop(0.7, '#fff3c4');
        disc.addColorStop(1, '#f2d98c');
        ctx.fillStyle = disc;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 28, 0, 6.283);
        ctx.fill();
      }
      if (dayness < 0.58) {
        const alpha = T.clamp((0.58 - dayness) / 0.5, 0, 1);
        const moonX = cx + Math.cos(sunAngle) * orbitR;
        const moonY = cy + Math.sin(sunAngle) * orbitR;
        const phase = ((game.dayCount || 1) % 8) / 8;
        const mg = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 150);
        mg.addColorStop(0, 'rgba(222,236,255,' + (0.5 * alpha) + ')');
        mg.addColorStop(1, 'rgba(180,210,255,0)');
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 150, 0, 6.283);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = 'rgba(238,244,255,' + alpha + ')';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 24, 0, 6.283);
        ctx.fill();
        if (phase > 0.12 && phase < 0.88) {
          const shadow = Math.cos(phase * 6.283);
          ctx.fillStyle = 'rgba(12,16,30,' + (alpha * 0.9) + ')';
          ctx.beginPath();
          ctx.ellipse(moonX + shadow * 22, moonY, 24 * Math.abs(shadow), 24, 0, 0, 6.283);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(186,202,228,' + (alpha * 0.5) + ')';
        ctx.beginPath();
        ctx.arc(moonX - 7, moonY - 5, 4.4, 0, 6.283);
        ctx.arc(moonX + 8, moonY + 6, 3.2, 0, 6.283);
        ctx.arc(moonX + 2, moonY - 10, 2.2, 0, 6.283);
        ctx.fill();
      }

      if (underground < 0.98) {
        const cloudAlpha = (1 - underground) * T.clamp(dayness + 0.2, 0.10, 1);
        const weatherDarken = game.weather && game.weather.rain > 0 ? 0.55 : 1;
        for (const c of this.clouds) {
          const px = T.mod(c.x * (w + 700) - cam.x * 0.06 * c.v - time * 0.06 * c.v, w + 700) - 350;
          const py = (c.y * h * 0.62 - cam.y * 0.045) + Math.sin(time * 0.02 + c.seed) * 8;
          const base = T.rgb('#ffffff');
          const col = game.weather && game.weather.rain > 0
            ? 'rgba(' + Math.round(150 + 60 * (1 - game.weather.rain)) + ',' + Math.round(158 + 60 * (1 - game.weather.rain)) + ',' + Math.round(170 + 55 * (1 - game.weather.rain)) + ',' + (c.a * cloudAlpha * 1.5) + ')'
            : hexA('#ffffff', c.a * cloudAlpha);
          ctx.fillStyle = col;
          ctx.beginPath();
          const blobs = 6;
          for (let i = 0; i < blobs; i++) {
            const bx = px + (i - blobs / 2) * c.w / blobs;
            const by = py + Math.sin(i * 1.7 + c.seed) * c.h * 0.28;
            const r = c.h * (0.5 + ((i * 7) % 5) * 0.13);
            ctx.moveTo(bx + r, by);
            ctx.arc(bx, by, r, 0, 6.283);
          }
          ctx.fill();
        }
      }

      if (underground < 0.9) {
        const surfScreen = (surfaceY * TS - cam.y) * this.zoom + h / 2;
        const horizon = Math.min(h + 40, surfScreen + 2);
        const fade = 1 - underground;
        const layers = [
          { par: 0.055, hgt: 170, col: pal.ridge[0], amp: 30, freq: 0.0016, alpha: 0.38 },
          { par: 0.11, hgt: 124, col: pal.ridge[1], amp: 38, freq: 0.0028, alpha: 0.52 },
          { par: 0.20, hgt: 86, col: pal.ridge[2], amp: 44, freq: 0.0046, alpha: 0.68 }
        ];
        const nightK = 1 - T.clamp(dayness * 1.3, 0, 1);
        for (const L of layers) {
          const col = T.rgb(T.mixColor(L.col, '#0a1018', nightK * 0.86));
          const topY = horizon - L.hgt;
          const grad = ctx.createLinearGradient(0, topY, 0, horizon + 2);
          const A = L.alpha * fade;
          grad.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)');
          grad.addColorStop(0.5, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (0.6 * A) + ')');
          grad.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + A + ')');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, horizon + 2);
          for (let x = 0; x <= w; x += 6) {
            const wx = (cam.x * L.par + x) * L.freq;
            const ridge = Math.sin(wx) * 0.52 + Math.sin(wx * 2.1 + 1.3) * 0.26 + Math.sin(wx * 4.7 + 0.4) * 0.11 + Math.sin(wx * 9.1) * 0.05;
            ctx.lineTo(x, topY + (1 - (ridge * 0.5 + 0.5)) * L.amp);
          }
          ctx.lineTo(w, horizon + 2);
          ctx.closePath();
          ctx.fill();
        }
        const haze = ctx.createLinearGradient(0, horizon - 260, 0, horizon);
        haze.addColorStop(0, hexA('#e8f4fb', 0));
        haze.addColorStop(0.72, hexA('#e8f4fb', 0.06 * dayness * fade));
        haze.addColorStop(1, hexA('#f2f9fd', 0.2 * dayness * fade));
        ctx.fillStyle = haze;
        ctx.fillRect(0, horizon - 260, w, 260);
      } else if (underground < 1) {
        ctx.fillStyle = 'rgba(8,10,16,' + (underground * 0.9) + ')';
        ctx.fillRect(0, 0, w, h);
      }

      this.drawWeather(game, cam, underground);
    }

    drawWeather(game, cam, underground) {
      const ctx = this.ctx;
      const w = this.vw, h = this.vh;
      const weather = game.weather;
      if (!weather) return;
      const fade = 1 - underground;
      if (fade <= 0) return;
      if (weather.rain > 0) {
        const count = Math.floor(260 * weather.rain);
        ctx.save();
        ctx.lineCap = 'round';
        for (let i = 0; i < count; i++) {
          const px = T.mod(i * 137.5 + weather.time * 760, w + 160) - 80;
          const py = T.mod(i * 71.3 + weather.time * 1180, h + 180) - 90;
          const len = 13 + (i % 4) * 5;
          const dark = i % 3 === 0;
          ctx.strokeStyle = dark ? 'rgba(150,180,214,' + (0.42 * fade) + ')' : 'rgba(214,232,246,' + (0.5 * fade) + ')';
          ctx.lineWidth = i % 5 === 0 ? 1.6 : 1.1;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 6, py + len);
          ctx.stroke();
        }
        ctx.restore();
        const mist = ctx.createLinearGradient(0, h * 0.4, 0, h);
        mist.addColorStop(0, 'rgba(120,148,176,0)');
        mist.addColorStop(1, 'rgba(120,148,176,' + (0.22 * weather.rain * fade) + ')');
        ctx.fillStyle = mist;
        ctx.fillRect(0, h * 0.4, w, h * 0.6);
      }
      if (weather.snow > 0) {
        const count = Math.floor(110 * weather.snow);
        ctx.save();
        ctx.fillStyle = 'rgba(240,248,255,' + (0.75 * fade) + ')';
        for (let i = 0; i < count; i++) {
          const px = T.mod(i * 197.3 + Math.sin(weather.time * 0.6 + i) * 30 + weather.time * 90, w + 80) - 40;
          const py = T.mod(i * 83.7 + weather.time * 190, h + 80) - 40;
          const r = 1 + ((i * 13) % 3) * 0.6;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, 6.283);
          ctx.fill();
        }
        ctx.restore();
      }
      if (weather.lightning > 0) {
        ctx.fillStyle = 'rgba(220,235,255,' + (weather.lightning * 0.42) + ')';
        ctx.fillRect(0, 0, w, h);
      }
    }
    drawCanopyShadows(ctx, world, x0, y0, x1, y1, sx, sy, ts) {
      const zoom = this.zoom;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = y * world.W + x;
          const t = world.tiles[i];
          if (t !== T.TILE.LEAVES && t !== T.TILE.CORRUPT_LEAVES && t !== T.TILE.JUNGLE_LEAVES) continue;
          const below = y + 1 < world.H ? world.tiles[i + world.W] : 0;
          if (below !== 0) continue;
          const px = sx(x);
          const py = sy(y) + ts;
          const g = ctx.createLinearGradient(0, py, 0, py + ts * 0.7);
          g.addColorStop(0, 'rgba(0,0,0,0.20)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(px, py, ts, ts * 0.7);
        }
      }
    }
    drawWorld(game, cam, alpha) {
      const ctx = this.ctx;
      const world = game.world;
      const zoom = this.zoom;
      const ts = TS * zoom;
      const left = cam.x - this.vw / 2 / zoom;
      const top = cam.y - this.vh / 2 / zoom;
      const x0 = Math.max(0, Math.floor(left / TS) - 1);
      const y0 = Math.max(0, Math.floor(top / TS) - 1);
      const x1 = Math.min(world.W - 1, Math.ceil((left + this.vw / zoom) / TS) + 1);
      const y1 = Math.min(world.H - 1, Math.ceil((top + this.vh / zoom) / TS) + 1);
      const sx = (x) => (x * TS - cam.x) * zoom + this.vw / 2;
      const sy = (y) => (y * TS - cam.y) * zoom + this.vh / 2;
      ctx.imageSmoothingEnabled = false;

      const cx0 = Math.max(0, x0 >> 4), cx1 = Math.min(world.chunksX - 1, x1 >> 4);
      const cy0 = Math.max(0, y0 >> 4), cy1 = Math.min(((world.H - 1) >> 4), y1 >> 4);
      for (let cy = cy0; cy <= cy1; cy++) {
        for (let cx = cx0; cx <= cx1; cx++) {
          const canvas = this.getChunk(world, cx, cy);
          if (!canvas) continue;
          const px = sx(cx * 16), py = sy(cy * 16);
          const size = TS * 16 * zoom;
          ctx.drawImage(canvas, px, py, size + 0.6, size + 0.6);
        }
      }

      this.drawLiquids(ctx, world, x0, y0, x1, y1, sx, sy, ts);

      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = y * world.W + x;
          const t = world.tiles[i];
          if (t === 0) continue;
          const def = T.TILES[t];
          if (!def) continue;
          if (def.furniture || def.deco || def.canopy) {
            const px = sx(x), py = sy(y);
            this.drawSpecialTile(ctx, game, def, t, x, y, px, py, ts, world, alpha);
          }
        }
      }
      this.drawCanopyShadows(ctx, world, x0, y0, x1, y1, sx, sy, ts);
      ctx.imageSmoothingEnabled = true;
    }

    drawLiquids(ctx, world, x0, y0, x1, y1, sx, sy, ts) {
      const time = world.time;
      const groups = [];
      for (const type of ['water', 'lava']) {
        const arr = type === 'water' ? world.water : world.lava;
        const visited = new Set();
        for (let y = y0; y <= y1; y++) {
          let run = null;
          for (let x = x0; x <= x1 + 1; x++) {
            const i = y * world.W + x;
            const on = x <= x1 && arr[i] > 0 && world.tiles[i] === 0;
            if (on) {
              const lv = arr[i];
              if (!run || Math.abs(run.level - lv) > 1) {
                if (run) groups.push(run);
                run = { type: type, x0: x, x1: x, y: y, level: lv, arr: arr };
              } else {
                run.x1 = x;
                run.level = Math.max(run.level, lv);
              }
            } else if (run) {
              groups.push(run);
              run = null;
            }
          }
          if (run) groups.push(run);
        }
      }
      for (const g of groups) {
        if (g.x1 < g.x0) continue;
        const px = sx(g.x0);
        const py = sy(g.y);
        const w = (g.x1 - g.x0 + 1) * ts;
        const isLava = g.type === 'lava';
        const base = isLava ? [214, 92, 22] : [52, 112, 196];
        const deep = isLava ? [150, 44, 8] : [22, 54, 118];
        ctx.save();
        ctx.fillStyle = 'rgba(' + base[0] + ',' + base[1] + ',' + base[2] + ',0.78)';
        ctx.fillRect(px, py, w, ts + 0.5);
        ctx.restore();
      }
      const tops = new Map();
      for (const g of groups) {
        const key = g.type + ':' + g.x0 + ':' + g.x1;
        const prev = tops.get(key);
        if (!prev || g.y < prev.y) tops.set(key, g);
      }
      for (const g of tops.values()) {
        const px = sx(g.x0);
        const py = sy(g.y);
        const w = (g.x1 - g.x0 + 1) * ts;
        const isLava = g.type === 'lava';
        let surfaceAbove = false;
        for (let x = g.x0; x <= g.x1 && !surfaceAbove; x++) {
          if (g.arr[(g.y - 1) * world.W + x] > 0) surfaceAbove = true;
        }
        ctx.save();
        if (!surfaceAbove) {
          const wave = Math.sin(world.time * 2.0 + g.x0 * 0.4) * ts * 0.05;
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = isLava ? '#ffd070' : '#bfe4ff';
          ctx.beginPath();
          ctx.moveTo(px, py + ts * 0.16 + wave);
          for (let x = 0; x <= w; x += 8) {
            ctx.lineTo(px + x, py + ts * 0.16 + wave + Math.sin(x * 0.06 + world.time * 2.4) * ts * 0.04);
          }
          ctx.lineTo(px + w, py + ts * 0.16 + wave);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      const surfaceRow = new Map();
      for (const g of groups) {
        if (!surfaceRow.has(g.y)) surfaceRow.set(g.y, []);
        surfaceRow.get(g.y).push(g);
      }
    }

    getChunk(world, cx, cy) {
      if (!this.chunkCache) {
        this.chunkCache = new Map();
        this.chunkSize = 16;
        this.chunkPxPerTile = 32;
      }
      const key = cy * world.chunksX + cx;
      const cached = this.chunkCache.get(key);
      if (cached && !cached.dirty) return cached.canvas;
      if (world.dirtyChunks.has(key)) world.dirtyChunks.delete(key);
      let canvas, ctx;
      if (cached) {
        canvas = cached.canvas;
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        canvas = makeCanvas(512, 512);
        ctx = canvas.getContext('2d');
        this.chunkCache.set(key, { canvas: canvas, dirty: false, used: 0 });
      }
      const scale = 2;
      const n = 16;
      const bx = cx * n, by = cy * n;
      for (let ty = 0; ty < n; ty++) {
        for (let tx = 0; tx < n; tx++) {
          const wx = bx + tx, wy = by + ty;
          if (wx >= world.W || wy >= world.H) continue;
          const i = wy * world.W + wx;
          const px = tx * 16 * scale, py = ty * 16 * scale;
          const size = 16 * scale + 1;
          const wall = world.walls[i];
          if (wall) {
            const arr = wallArt[wall];
            if (arr) {
              const v = arr[(T.hash2i(wx, wy, 77) * arr.length) | 0];
              ctx.drawImage(v, px, py, size, size);
            }
          }
          const t = world.tiles[i];
          if (t === 0) continue;
          const def = T.TILES[t];
          if (!def) continue;
          if (def.furniture || def.deco || def.canopy || def.liquid) continue;
          const arr = tileArt[t];
          if (arr) {
            const v = arr[(T.hash2i(wx, wy, 133) * arr.length) | 0];
            ctx.drawImage(v, px, py, size, size);
          } else {
            ctx.fillStyle = def.col;
            ctx.fillRect(px, py, size, size);
          }
          if (def.grass) {
            const aboveW = wy > 0 ? world.tiles[i - world.W] : 0;
            if (aboveW === 0) {
              ctx.fillStyle = hexA(def.pal[1], 0.35);
              ctx.fillRect(px, py - size * 0.08, size, size * 0.1);
            }
          }
          const nUp = wy > 0 ? world.tiles[i - world.W] : TILE.STONE;
          const nDown = wy < world.H - 1 ? world.tiles[i + world.W] : TILE.STONE;
          const nLeft = wx > 0 ? world.tiles[i - 1] : TILE.STONE;
          const nRight = wx < world.W - 1 ? world.tiles[i + 1] : TILE.STONE;
          const occluded = function (nt) { return nt !== 0 && (T.isSolid(nt) || T.isOpaque(nt)); };
          const pal = def.pal || [def.col, def.col];
          const edgeLight = T.shade(pal[1] || pal[0], 0.22);
          const edgeDark = T.shade(pal[2] || pal[0], -0.42);
          const openUp = !occluded(nUp);
          const openDown = !occluded(nDown);
          const openLeft = !occluded(nLeft);
          const openRight = !occluded(nRight);
          if (openUp) {
            for (let k = 0; k < 3; k++) {
              ctx.fillStyle = 'rgba(255,255,255,' + (0.14 - k * 0.04) + ')';
              ctx.fillRect(px, py + k * 2, size, 1.4);
            }
            ctx.fillStyle = edgeLight;
            ctx.fillRect(px, py, size, 1.2);
          }
          if (openDown) {
            for (let k = 0; k < 4; k++) {
              ctx.fillStyle = 'rgba(0,0,0,' + (0.2 - k * 0.04) + ')';
              ctx.fillRect(px, py + size - 1.2 - k * 2, size, 1.4);
            }
          }
          if (openLeft) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(px, py, 1.6, size);
            ctx.fillStyle = edgeDark;
            ctx.fillRect(px, py, 1, size);
          }
          if (openRight) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(px + size - 1.6, py, 1.6, size);
            ctx.fillStyle = edgeDark;
            ctx.fillRect(px + size - 1, py, 1, size);
          }
          if (openUp && (openLeft || openRight)) {
            ctx.fillStyle = T.shade(pal[1] || pal[0], 0.34);
            ctx.fillRect(px + (openRight ? size - 4 : 0), py, 4, 3);
          }
          if (openUp && openDown && (openLeft || openRight)) {
            ctx.fillStyle = 'rgba(0,0,0,0.14)';
            ctx.fillRect(px, py + 2, size, 1);
          }
          if (def.art === 'dirt' || def.art === 'grass') {
            const hsh = T.hash2i(wx, wy, 5);
            if (openUp && hsh > 0.55) {
              ctx.fillStyle = T.shade(pal[2] || pal[0], -0.2);
              const cx2 = px + size * (0.2 + (hsh % 0.6));
              ctx.beginPath();
              ctx.arc(cx2, py + 1.5, 1.6, 0, 6.283);
              ctx.fill();
            }
          }
        }
      }
      const entry = this.chunkCache.get(key) || { canvas: canvas };
      entry.dirty = false;
      entry.used = performance.now();
      this.chunkCache.set(key, entry);
      if (this.chunkCache.size > 120) {
        let oldestKey = null, oldest = Infinity;
        this.chunkCache.forEach(function (v, k) {
          if (v.used < oldest) { oldest = v.used; oldestKey = k; }
        });
        if (oldestKey !== null && oldestKey !== key) this.chunkCache.delete(oldestKey);
      }
      return canvas;
    }

    invalidateChunks(world) {
      if (!this.chunkCache) return;
      const self = this;
      world.dirtyChunks.forEach(function (key) {
        const entry = self.chunkCache.get(key);
        if (entry) entry.dirty = true;
      });
      world.dirtyChunks.clear();
    }

    drawLiquid(ctx, px, py, ts, level, dark, light, time, x, y) {
      const h = ts * (level / 8);
      const surface = py + ts - h;
      const wave = Math.sin(time * 2.2 + x * 0.7 + y * 0.3) * (ts * 0.035);
      const g = ctx.createLinearGradient(0, surface, 0, py + ts);
      g.addColorStop(0, light);
      g.addColorStop(1, dark);
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.82;
      ctx.beginPath();
      ctx.moveTo(px, surface + wave);
      ctx.lineTo(px + ts, surface + wave);
      ctx.lineTo(px + ts, py + ts);
      ctx.lineTo(px, py + ts);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = hexA(light, 0.5);
      ctx.fillRect(px, surface + wave, ts, Math.max(1, ts * 0.05));
    }

    drawSpecialTile(ctx, game, def, t, x, y, px, py, ts, world, alpha) {
      const u = ts / 16;
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(u, u);
      const rnd = T.mulberry32(x * 73856093 ^ y * 19349663);
      switch (def.art) {
        case 'plant': {
          ctx.strokeStyle = def.pal[0];
          ctx.lineWidth = 1.2;
          for (let i = 0; i < 4; i++) {
            const bx = 3 + rnd() * 10;
            const hh = 4 + rnd() * 8;
            ctx.beginPath();
            ctx.moveTo(bx, 16);
            ctx.quadraticCurveTo(bx + (rnd() * 4 - 2), 16 - hh * 0.6, bx + (rnd() * 6 - 3), 16 - hh);
            ctx.strokeStyle = def.pal[Math.floor(rnd() * def.pal.length)];
            ctx.stroke();
          }
          break;
        }
        case 'flower': {
          ctx.strokeStyle = def.pal[0];
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(8, 16);
          ctx.lineTo(8, 8);
          ctx.stroke();
          const col = def.pal[1 + Math.floor(rnd() * 2)];
          for (let i = 0; i < 5; i++) {
            const a = i / 5 * 6.283;
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.arc(8 + Math.cos(a) * 2.6, 8 + Math.sin(a) * 2.6, 2, 0, 6.283);
            ctx.fill();
          }
          ctx.fillStyle = def.pal[2];
          ctx.beginPath();
          ctx.arc(8, 8, 1.6, 0, 6.283);
          ctx.fill();
          break;
        }
        case 'mushroom': {
          ctx.fillStyle = '#e8e0d0';
          ctx.fillRect(6, 9, 4, 7);
          ctx.fillStyle = def.pal[0];
          ctx.beginPath();
          ctx.arc(8, 9, 6, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = def.pal[1];
          ctx.beginPath();
          ctx.arc(6, 7, 1.3, 0, 6.283);
          ctx.arc(10, 5.5, 1.1, 0, 6.283);
          ctx.fill();
          break;
        }
        case 'vine': {
          ctx.strokeStyle = def.pal[0];
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i <= 16; i += 4) {
            ctx.lineTo(8 + Math.sin(i * 0.4 + x) * 2, i);
          }
          ctx.stroke();
          ctx.fillStyle = def.pal[2];
          for (let i = 2; i < 16; i += 5) {
            ctx.beginPath();
            ctx.arc(8 + Math.sin(i * 0.4 + x) * 2 + (i % 2 ? 2 : -2), i, 1.6, 0, 6.283);
            ctx.fill();
          }
          break;
        }
        case 'cobweb': {
          ctx.strokeStyle = hexA(def.pal[0], 0.75);
          ctx.lineWidth = 0.8;
          for (let i = 0; i < 4; i++) {
            const a = i / 4 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(8 - Math.cos(a) * 8, 8 - Math.sin(a) * 8);
            ctx.lineTo(8 + Math.cos(a) * 8, 8 + Math.sin(a) * 8);
            ctx.stroke();
          }
          for (let r = 3; r < 8; r += 3) {
            ctx.beginPath();
            ctx.arc(8, 8, r, 0, 6.283);
            ctx.stroke();
          }
          break;
        }
        case 'pot': {
          ctx.fillStyle = def.pal[0];
          ctx.beginPath();
          ctx.moveTo(3, 6);
          ctx.quadraticCurveTo(2, 14, 6, 15);
          ctx.lineTo(10, 15);
          ctx.quadraticCurveTo(14, 14, 13, 6);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(3, 5, 10, 2);
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(5, 9, 6, 1);
          ctx.fillRect(5, 12, 5, 1);
          break;
        }
        case 'leaves': {
          const near = (dx, dy) => {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= world.W || ny >= world.H) return false;
            return world.tiles[ny * world.W + nx] === t;
          };
          const up = near(0, -1), down = near(0, 1), left = near(-1, 0), right = near(1, 0);
          const ul = near(-1, -1), ur = near(1, -1), dl = near(-1, 1), dr = near(1, 1);
          const pal = def.pal;
          const R = 9.2;
          const g2 = ctx.createLinearGradient(2, 2, 14, 15);
          g2.addColorStop(0, pal[1]);
          g2.addColorStop(0.45, pal[0]);
          g2.addColorStop(1, pal[2]);
          ctx.fillStyle = g2;
          const pts = [];
          const c = 8;
          const pushCorner = (px, py, round) => {
            if (round) pts.push([px, py]);
            else pts.push([round === false ? px : px, py]);
          };
          ctx.beginPath();
          const pad = 0.9;
          const leftEdge = left ? -pad : c - R;
          const rightEdge = right ? 16 + pad : c + R;
          const topEdge = up ? -pad : c - R;
          const botEdge = down ? 16 + pad : c + R;
          const rr = 5.5;
          ctx.moveTo(leftEdge + (left ? 0 : rr), topEdge);
          ctx.lineTo(rightEdge - (right ? 0 : rr), topEdge);
          if (!right) ctx.quadraticCurveTo(rightEdge, topEdge, rightEdge, topEdge + rr);
          ctx.lineTo(rightEdge, botEdge - (down ? 0 : rr));
          if (!down) ctx.quadraticCurveTo(rightEdge, botEdge, rightEdge - rr, botEdge);
          ctx.lineTo(leftEdge + (left ? 0 : rr), botEdge);
          if (!down) ctx.quadraticCurveTo(leftEdge, botEdge, leftEdge, botEdge - rr);
          ctx.lineTo(leftEdge, topEdge + (up ? 0 : rr));
          if (!up) ctx.quadraticCurveTo(leftEdge, topEdge, leftEdge + rr, topEdge);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = hexA(pal[2], 0.55);
          ctx.lineWidth = 1;
          ctx.stroke();
          for (let i = 0; i < 9; i++) {
            const h2 = T.hash2i(x * 5 + i, y * 7 + i * 2, 91);
            const h3 = T.hash2i(x * 9 + i * 3, y * 5 + i, 97);
            if (h2 < 0.35) continue;
            const lx = 2 + h2 * 12;
            const ly = 2 + h3 * 12;
            ctx.fillStyle = h2 > 0.7 ? pal[1] : pal[2];
            ctx.globalAlpha = h2 > 0.7 ? 0.5 : 0.3;
            ctx.beginPath();
            ctx.arc(lx, ly, 0.9 + h3 * 1.3, 0, 6.283);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          if (!up) {
            ctx.strokeStyle = hexA(pal[1], 0.75);
            ctx.lineWidth = 1.1;
            for (let i = 0; i < 4; i++) {
              const h2 = T.hash2i(x * 3 + i, y, 111);
              const bx2 = 3 + i * 3.4;
              ctx.beginPath();
              ctx.moveTo(bx2, 4);
              ctx.lineTo(bx2 + (h2 - 0.5) * 2, 1);
              ctx.stroke();
            }
          }
          if (!down) {
            const sg = ctx.createLinearGradient(0, 9, 0, 16);
            sg.addColorStop(0, 'rgba(0,0,0,0)');
            sg.addColorStop(1, 'rgba(0,0,0,0.42)');
            ctx.fillStyle = sg;
            ctx.fillRect(0, 9, 16, 7);
          }
          if (!left) {
            ctx.fillStyle = hexA(pal[2], 0.42);
            ctx.fillRect(0, 0, 1.4, 16);
          }
          if (!right) {
            ctx.fillStyle = hexA(pal[2], 0.42);
            ctx.fillRect(14.6, 0, 1.4, 16);
          }
          break;
        }        case 'torch': {
          const flick = 0.85 + Math.sin(world.time * 9 + x * 1.7) * 0.15;
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(7, 6, 2, 10);
          ctx.fillStyle = hexA(def.pal[1], flick);
          ctx.beginPath();
          ctx.ellipse(8, 5, 3.2, 4.4, 0, 0, 6.283);
          ctx.fill();
          ctx.fillStyle = hexA('#fff4c0', 0.9);
          ctx.beginPath();
          ctx.ellipse(8, 5.5, 1.6, 2.4, 0, 0, 6.283);
          ctx.fill();
          break;
        }
        case 'chest': {
          const open = game.ui && game.ui.isChestOpen(x, y);
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(2, 6, 12, 9);
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(1, 7, 14, 7);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(1, 5, 14, 3);
          ctx.fillStyle = def.pal[3];
          ctx.fillRect(7, 8, 2, 3);
          ctx.strokeStyle = def.pal[2];
          ctx.lineWidth = 0.8;
          ctx.strokeRect(2, 7.5, 12, 6);
          if (open) {
            ctx.fillStyle = hexA('#000000', 0.5);
            ctx.fillRect(3, 5, 10, 2);
          }
          break;
        }
        case 'workbench': {
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(2, 8, 2, 7);
          ctx.fillRect(12, 8, 2, 7);
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(1, 5, 14, 3);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(1, 5, 14, 1);
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(4, 3, 5, 1);
          ctx.fillRect(10, 2, 1, 3);
          break;
        }
        case 'furnace': {
          ctx.fillStyle = def.pal[3];
          ctx.fillRect(2, 3, 12, 13);
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(3, 4, 10, 11);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(3, 4, 10, 2);
          const flick = 0.7 + Math.sin(world.time * 6 + x) * 0.3;
          const fg = ctx.createRadialGradient(8, 11, 1, 8, 11, 6);
          fg.addColorStop(0, hexA('#ffe08a', flick));
          fg.addColorStop(0.5, hexA(def.pal[2], flick * 0.9));
          fg.addColorStop(1, hexA('#000000', 0));
          ctx.fillStyle = fg;
          ctx.fillRect(3, 6, 10, 9);
          break;
        }
        case 'anvil': {
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(6, 12, 4, 4);
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(3, 9, 10, 3);
          ctx.fillRect(1, 7, 12, 3);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(2, 7, 9, 1);
          ctx.fillStyle = def.pal[0];
          ctx.beginPath();
          ctx.moveTo(11, 7);
          ctx.lineTo(15, 8.5);
          ctx.lineTo(11, 10);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'door': {
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(1, 0, 14, 16);
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(2, 1, 12, 15);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(3, 2, 10, 6);
          ctx.fillStyle = def.pal[3];
          ctx.fillRect(4, 9, 8, 6);
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(7, 3, 1, 12);
          ctx.fillStyle = '#f0d070';
          ctx.fillRect(12, 8, 1.5, 1.5);
          break;
        }
        case 'dooropen': {
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(12, 0, 3, 16);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(12, 0, 1, 16);
          ctx.fillStyle = hexA('#000000', 0.35);
          ctx.fillRect(1, 1, 11, 15);
          break;
        }
        case 'table': {
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(2, 8, 2, 7);
          ctx.fillRect(12, 8, 2, 7);
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(1, 6, 14, 3);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(1, 6, 14, 1);
          ctx.fillStyle = '#e8e0d0';
          ctx.fillRect(5, 3, 3, 3);
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(6, 5, 1, 1);
          break;
        }
        case 'chair': {
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(5, 3, 2, 11);
          ctx.fillRect(11, 3, 2, 11);
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(5, 7, 8, 3);
          ctx.fillRect(9, 2, 2, 7);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(5, 7, 8, 1);
          break;
        }
        case 'platform': {
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(0, 2, 16, 4);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(0, 2, 16, 1.5);
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(0, 5, 16, 1);
          for (let i = 0; i < 2; i++) {
            ctx.fillStyle = def.pal[2];
            ctx.fillRect(2 + i * 8, 6, 1.5, 3);
          }
          break;
        }
        case 'rope': {
          ctx.strokeStyle = def.pal[0];
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(8, 16);
          ctx.stroke();
          ctx.strokeStyle = def.pal[2];
          ctx.lineWidth = 0.7;
          for (let i = 0; i < 16; i += 3) {
            ctx.beginPath();
            ctx.moveTo(6, i);
            ctx.lineTo(10, i + 2);
            ctx.stroke();
          }
          break;
        }
        case 'spikes': {
          ctx.fillStyle = def.pal[0];
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 4, 16);
            ctx.lineTo(i * 4 + 2, 6);
            ctx.lineTo(i * 4 + 4, 16);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = def.pal[1];
            ctx.beginPath();
            ctx.moveTo(i * 4 + 1.4, 15);
            ctx.lineTo(i * 4 + 2, 7);
            ctx.lineTo(i * 4 + 2.4, 15);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = def.pal[0];
          }
          break;
        }
        case 'altar': {
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(2, 12, 12, 4);
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(4, 5, 8, 8);
          ctx.fillStyle = def.pal[1];
          ctx.beginPath();
          ctx.moveTo(8, 1);
          ctx.lineTo(12, 7);
          ctx.lineTo(8, 12);
          ctx.lineTo(4, 7);
          ctx.closePath();
          ctx.fill();
          const pulse = 0.4 + Math.sin(world.time * 2 + x) * 0.25;
          ctx.fillStyle = hexA(def.pal[3], pulse);
          ctx.beginPath();
          ctx.arc(8, 7, 3, 0, 6.283);
          ctx.fill();
          break;
        }
        case 'alchemy': {
          ctx.fillStyle = def.pal[2];
          ctx.fillRect(1, 6, 14, 2);
          ctx.fillRect(2, 8, 2, 8);
          ctx.fillRect(12, 8, 2, 8);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(5, 2, 3, 4);
          ctx.fillStyle = def.pal[3];
          ctx.fillRect(5.5, 3, 2, 2);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(9, 3, 2, 3);
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(8.5, 4, 3, 2);
          break;
        }
        case 'hellforge': {
          ctx.fillStyle = def.pal[0];
          ctx.fillRect(1, 3, 14, 13);
          ctx.fillStyle = def.pal[1];
          ctx.fillRect(2, 4, 12, 11);
          const flick = 0.7 + Math.sin(world.time * 8 + x) * 0.3;
          const fg = ctx.createRadialGradient(8, 11, 1, 8, 11, 8);
          fg.addColorStop(0, hexA('#fff0b0', flick));
          fg.addColorStop(0.4, hexA(def.pal[3], flick));
          fg.addColorStop(1, hexA(def.pal[2], 0));
          ctx.fillStyle = fg;
          ctx.fillRect(2, 5, 12, 11);
          break;
        }
        case 'life_crystal': {
          const pulse = 0.75 + Math.sin(world.time * 2.5 + y) * 0.25;
          ctx.fillStyle = hexA(def.pal[2], 0.6);
          ctx.beginPath();
          ctx.arc(8, 12, 6, 0, 6.283);
          ctx.fill();
          ctx.fillStyle = def.pal[0];
          ctx.beginPath();
          ctx.moveTo(8, 1);
          ctx.lineTo(13, 8);
          ctx.lineTo(8, 15);
          ctx.lineTo(3, 8);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = hexA(def.pal[3], pulse);
          ctx.beginPath();
          ctx.moveTo(8, 3);
          ctx.lineTo(10.5, 8);
          ctx.lineTo(8, 12);
          ctx.lineTo(5.5, 8);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = hexA(def.pal[1], 0.8);
          ctx.fillRect(7, 4, 1.5, 5);
          break;
        }
        case 'mana_crystal': {
          const pulse = 0.75 + Math.sin(world.time * 2.1 + x) * 0.25;
          ctx.fillStyle = hexA(def.pal[2], 0.6);
          ctx.beginPath();
          ctx.arc(8, 12, 5, 0, 6.283);
          ctx.fill();
          ctx.fillStyle = def.pal[0];
          ctx.beginPath();
          ctx.moveTo(8, 2);
          ctx.lineTo(14, 11);
          ctx.lineTo(8, 15);
          ctx.lineTo(2, 11);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = hexA(def.pal[1], pulse);
          ctx.beginPath();
          ctx.moveTo(8, 5);
          ctx.lineTo(11, 11);
          ctx.lineTo(8, 13);
          ctx.lineTo(5, 11);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'sapling': {
          ctx.strokeStyle = '#6b4a24';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(8, 16);
          ctx.lineTo(8, 8);
          ctx.stroke();
          ctx.fillStyle = def.pal[0];
          ctx.beginPath();
          ctx.ellipse(5, 8, 3, 2, -0.5, 0, 6.283);
          ctx.ellipse(11, 9, 3, 2, 0.5, 0, 6.283);
          ctx.fill();
          ctx.fillStyle = def.pal[1];
          ctx.beginPath();
          ctx.ellipse(8, 5, 3, 3.4, 0, 0, 6.283);
          ctx.fill();
          break;
        }
        default: {
          ctx.fillStyle = def.col;
          ctx.fillRect(0, 0, 16, 16);
        }
      }
      ctx.restore();
    }

    drawLighting(game, cam) {
      this.lighting.update(game, cam);
    }
    drawGlow(game, cam) {
      const ctx = this.ctx;
      const zoom = this.zoom;
      const lights = game.collectLights(cam);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const L of lights) {
        if (!L.color || L.r < 30) continue;
        const p = this.worldToScreen(cam, L.x, L.y);
        const r = L.r * zoom;
        if (p.x < -r || p.y < -r || p.x > this.vw + r || p.y > this.vh + r) continue;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        const col = T.rgb(L.color);
        const a = L.glow === undefined ? 0.16 : L.glow;
        g.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a + ')');
        g.addColorStop(0.45, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a * 0.35 + ')');
        g.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.restore();
    }
  }

  T.Renderer = Renderer;
  T.TS = TS;

  T.Particles = class {
    constructor() { this.list = []; this.cap = 900; }
    spawn(o) {
      if (this.list.length >= this.cap) this.list.shift();
      this.list.push(o);
    }
    burst(x, y, n, o) {
      const rnd = Math.random;
      for (let i = 0; i < n; i++) {
        const a = rnd() * 6.283;
        const sp = (o && o.speed ? o.speed : 40) * (0.35 + rnd());
        this.spawn({
          x: x + (rnd() - 0.5) * (o && o.spread ? o.spread : 6),
          y: y + (rnd() - 0.5) * (o && o.spread ? o.spread : 6),
          vx: Math.cos(a) * sp + ((o && o.vx) || 0),
          vy: Math.sin(a) * sp + ((o && o.vy) || 0),
          life: 0, max: (o && o.life ? o.life : 0.6) * (0.6 + rnd() * 0.7),
          size: (o && o.size ? o.size : 2) * (0.6 + rnd() * 0.8),
          color: Array.isArray(o && o.color) ? o.color[Math.floor(rnd() * o.color.length)] : (o && o.color) || '#ffffff',
          gravity: (o && o.gravity !== undefined) ? o.gravity : 220,
          drag: (o && o.drag !== undefined) ? o.drag : 0.6,
          glow: !!(o && o.glow),
          kind: (o && o.kind) || 'dot',
          rot: rnd() * 6.283,
          vr: (rnd() - 0.5) * 8
        });
      }
    }
    text(x, y, text, color) {
      this.spawn({ x: x, y: y, vx: (Math.random() - 0.5) * 20, vy: -46, life: 0, max: 0.95, size: 12, color: color || '#ffffff', gravity: 24, drag: 1.4, kind: 'text', text: text });
    }
    update(dt) {
      const list = this.list;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life += dt;
        if (p.life >= p.max) { list.splice(i, 1); continue; }
        p.vy += p.gravity * dt;
        p.vx *= Math.pow(p.drag, dt * 60 * 0.016);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
      }
    }
    draw(ctx, cam, zoom, vw, vh) {
      const list = this.list;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        const t = p.life / p.max;
        const sx = (p.x - cam.x) * zoom + vw / 2;
        const sy = (p.y - cam.y) * zoom + vh / 2;
        if (sx < -40 || sy < -40 || sx > vw + 40 || sy > vh + 40) continue;
        const alpha = t < 0.75 ? 1 : (1 - (t - 0.75) / 0.25);
        if (p.kind === 'text') {
          ctx.globalAlpha = alpha;
          ctx.font = '600 ' + Math.round(p.size * Math.max(1, zoom * 0.62)) + 'px "Segoe UI", sans-serif';
          ctx.textAlign = 'center';
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(0,0,0,0.6)';
          ctx.strokeText(p.text, sx, sy);
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, sx, sy);
        } else if (p.kind === 'leaf') {
          ctx.globalAlpha = alpha;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * zoom * 1.4, p.size * zoom * 0.55, 0, 0, 6.283);
          ctx.fill();
          ctx.restore();
        } else if (p.kind === 'star') {
          ctx.globalAlpha = alpha;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(p.rot);
          const s = p.size * zoom;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          for (let k = 0; k < 4; k++) {
            const a = k / 4 * 6.283;
            ctx.lineTo(Math.cos(a) * s * 2.4, Math.sin(a) * s * 2.4);
            ctx.lineTo(Math.cos(a + 0.4) * s * 0.6, Math.sin(a + 0.4) * s * 0.6);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (p.kind === 'smoke') {
          ctx.globalAlpha = alpha * 0.35;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(sx, sy, p.size * zoom * (1 + t * 2), 0, 6.283);
          ctx.fill();
        } else {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          const s = p.size * zoom * (1 - t * 0.4);
          if (p.glow) {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8 * zoom;
          }
          ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
          ctx.shadowBlur = 0;
        }
      }
      ctx.restore();
    }
  };
})();
