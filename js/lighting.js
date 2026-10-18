(function () {
  const T = window.T;
  const TS = T.TS;

  const LIGHT = T.LIGHT = {
    TORCH: [1.0, 0.72, 0.40],
    CAMPFIRE: [1.0, 0.58, 0.26],
    LAVA: [1.0, 0.42, 0.14],
    CRYSTAL: [1.0, 0.42, 0.58],
    MANA: [0.42, 0.58, 1.0],
    GLOW: [0.55, 1.0, 0.85],
    METEOR: [1.0, 0.60, 0.34],
    PLAYER: [1.0, 0.92, 0.80],
    SOUL: [0.70, 0.55, 1.0],
    GOLD: [1.0, 0.84, 0.42],
    ICE: [0.55, 0.80, 1.0],
    JUNGLE: [0.55, 1.0, 0.55],
    BLOOD: [1.0, 0.30, 0.30]
  };

  const DAY_SKY = [1.0, 0.98, 0.92];
  const DUSK_SKY = [1.0, 0.72, 0.55];
  const NIGHT_SKY = [0.32, 0.42, 0.72];
  const DEEP_DARK = [0.035, 0.045, 0.075];

  class Lighting {
    constructor() {
      this.cell = 4;
      this.cellsX = 0;
      this.cellsY = 0;
      this.r = null;
      this.g = null;
      this.b = null;
      this.dirty = true;
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.buckets = null;
      this.frame = 0;
      this.cachedSources = null;
      this.sourceTimer = 0;
    }

    ensure(w, h) {
      const cols = Math.ceil(w / this.cell) + 2;
      const rows = Math.ceil(h / this.cell) + 2;
      if (cols === this.cellsX && rows === this.cellsY) return;
      this.cellsX = cols;
      this.cellsY = rows;
      const n = cols * rows;
      this.r = new Float32Array(n);
      this.g = new Float32Array(n);
      this.b = new Float32Array(n);
      this.canvas.width = cols;
      this.canvas.height = rows;
      this.img = this.ctx.createImageData(cols, rows);
      this.resizeBuckets();
    }

    resizeBuckets() {
      this.buckets = [];
      for (let i = 0; i < 18; i++) this.buckets.push([]);
    }

    skyColor(game) {
      const t = game.timeMinutes / 1440;
      const dayness = T.clamp(Math.sin(t * Math.PI * 2 - Math.PI / 2) * 1.25 + 0.42, 0, 1);
      let sky;
      if (dayness > 0.62) sky = DAY_SKY;
      else if (dayness > 0.34) {
        const k = (dayness - 0.34) / 0.28;
        sky = T.mixColor(DAY_SKY, t < 0.5 ? [1, 0.86, 0.72] : DUSK_SKY, 1 - k);
        sky = T.rgb(sky).map(function (v) { return v / 255; });
      } else if (dayness > 0.12) {
        const k = (dayness - 0.12) / 0.22;
        sky = T.mixColor(NIGHT_SKY, t < 0.5 ? [1, 0.80, 0.68] : DUSK_SKY, k);
        sky = T.rgb(sky).map(function (v) { return v / 255; });
      } else {
        sky = NIGHT_SKY;
      }
      sky = sky.map(function (v) { return T.clamp(v, 0, 1); });
      return { color: sky, intensity: 0.22 + dayness * 0.86, dayness: dayness };
    }

    clear() {
      this.r.fill(0); this.g.fill(0); this.b.fill(0);
      this.resizeBuckets();
    }

    push(idx, level) {
      const b = Math.min(17, Math.max(0, Math.floor(level * 16)));
      this.buckets[b].push(idx);
    }

    seedSky(game, x0, y0, sky, world) {
      const cell = this.cell;
      for (let j = 0; j < this.cellsY; j++) {
        for (let i = 0; i < this.cellsX; i++) {
          const wx = x0 + i * cell;
          const wy = y0 + j * cell;
          const tx = Math.floor(wx / TS);
          const ty = Math.floor(wy / TS);
          if (tx < 0 || ty < 0 || tx >= world.W || ty >= world.H) continue;
          const skyVal = world.sky[ty * world.W + tx] || 0;
          const surf = world.surface[tx];
          const depth = ty - surf;
          let level;
          if (depth <= 0) {
            level = 1.0;
          } else {
            const sun = T.clamp(1 - depth / 34, 0, 1);
            level = 0.30 + 0.70 * sun * sun;
            const cave = (skyVal / 15) * 0.55;
            if (cave > level) level = cave;
          }
          if (level <= 0.001) continue;
          const idx = j * this.cellsX + i;
          const s = level * sky.intensity;
          if (s <= 0.002) continue;
          this.r[idx] = Math.max(this.r[idx], sky.color[0] * s);
          this.g[idx] = Math.max(this.g[idx], sky.color[1] * s);
          this.b[idx] = Math.max(this.b[idx], sky.color[2] * s);
          const lum = Math.max(this.r[idx], Math.max(this.g[idx], this.b[idx]));
          if (lum > 0.02) this.push(idx, Math.min(1, lum));
        }
      }
    }

    addSource(world, wx, wy, color, strength, radius) {
      const i = Math.floor((wx - this.originX) / this.cell);
      const j = Math.floor((wy - this.originY) / this.cell);
      if (i < 1 || j < 1 || i >= this.cellsX - 1 || j >= this.cellsY - 1) return;
      const idx = j * this.cellsX + i;
      const v = strength;
      this.r[idx] = Math.max(this.r[idx], color[0] * v);
      this.g[idx] = Math.max(this.g[idx], color[1] * v);
      this.b[idx] = Math.max(this.b[idx], color[2] * v);
      this.push(idx, v);
    }

    propagate(world) {
      const cols = this.cellsX, rows = this.cellsY;
      const cell = this.cell;
      const r = this.r, g = this.g, b = this.b;
      for (let round = 16; round >= 0; round--) {
        const bucket = this.buckets[round];
        if (!bucket || !bucket.length) continue;
        this.buckets[round] = [];
        const decayOpen = 0.075;
        const decaySolid = 0.26;
        for (let n = 0; n < bucket.length; n++) {
          const idx = bucket[n];
          const i = idx % cols;
          const j = (idx / cols) | 0;
          const cr = r[idx], cg = g[idx], cb = b[idx];
          const lum = Math.max(cr, Math.max(cg, cb));
          if (lum < 0.010) continue;
          for (let d = 0; d < 4; d++) {
            const ni = i + (d === 0 ? -1 : d === 1 ? 1 : 0);
            const nj = j + (d === 2 ? -1 : d === 3 ? 1 : 0);
            if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue;
            const nidx = nj * cols + ni;
            const wx = this.originX + ni * cell;
            const wy = this.originY + nj * cell;
            const tx = Math.floor(wx / TS);
            const ty = Math.floor(wy / TS);
            const solid = (tx < 0 || ty < 0 || tx >= world.W || ty >= world.H) ? true : T.isOpaque(world.tiles[ty * world.W + tx]);
            const decay = solid ? decaySolid : decayOpen;
            const atten = 1 - decay;
            let nr = cr * atten, ng = cg * atten, nb = cb * atten;
            if (solid) {
              nr *= 0.84; ng *= 0.84; nb *= 0.88;
            }
            const nl = Math.max(nr, Math.max(ng, nb));
            if (nl < 0.010) continue;
            const exr = r[nidx], exg = g[nidx], exb = b[nidx];
            if (nr <= exr && ng <= exg && nb <= exb) continue;
            r[nidx] = Math.max(exr, nr);
            g[nidx] = Math.max(exg, ng);
            b[nidx] = Math.max(exb, nb);
            const bIdx = Math.min(17, Math.floor(nl * 16));
            if (this.buckets[bIdx]) this.buckets[bIdx].push(nidx);
          }
        }
      }
    }

    collectSources(game, world, x0, y0, x1, y1) {
      const lights = game.collectLights({ x: game.cam.x, y: game.cam.y });
      const cols = this.cellsX;
      for (let l = 0; l < lights.length; l++) {
        const L = lights[l];
        const col = Array.isArray(L.color) ? L.color.map(function (v) { return v / 255; }) : [1, 1, 1];
        const strength = (L.intensity === undefined ? 1 : L.intensity) * 1.06;
        this.addSource(world, L.x, L.y, col, Math.min(1.6, strength), L.r);
      }
    }

    update(game, cam) {
      const r = game.renderer;
      const world = game.world;
      const zoom = r.zoom;
      const viewW = r.vw / zoom;
      const viewH = r.vh / zoom;
      this.ensure(viewW, viewH);
      this.originX = cam.x - viewW / 2 - this.cell;
      this.originY = cam.y - viewH / 2 - this.cell;
      const sky = this.skyColor(game);
      this.clear();
      this.seedSky(game, this.originX, this.originY, sky, world);
      this.collectSources(game, world, 0, 0, 0, 0);
      this.propagate(world);
      this.render(cam, r);
    }

    render(cam, r) {
      const cols = this.cellsX, rows = this.cellsY;
      const data = this.img.data;
      const zoom = r.zoom;
      const cellPx = this.cell;
      const caveFloor = [0.115, 0.125, 0.165];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const idx = j * cols + i;
          let cr = this.r[idx], cg = this.g[idx], cb = this.b[idx];
          const lum = Math.max(cr, Math.max(cg, cb));
          let mr, mg, mb;
          if (lum > 1) {
            const k = 1 / lum;
            mr = cr * k; mg = cg * k; mb = cb * k;
          } else {
            mr = cr; mg = cg; mb = cb;
          }
          mr = T.clamp(mr, caveFloor[0], 1);
          mg = T.clamp(mg, caveFloor[1], 1);
          mb = T.clamp(mb, caveFloor[2], 1);
          const p = idx * 4;
          data[p] = Math.round(255 * mr);
          data[p + 1] = Math.round(255 * mg);
          data[p + 2] = Math.round(255 * mb);
          data[p + 3] = 255;
        }
      }
      this.ctx.putImageData(this.img, 0, 0);
      const ctx = r.ctx;
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.imageSmoothingEnabled = true;
      const sx = (this.originX - cam.x) * zoom + r.vw / 2;
      const sy = (this.originY - cam.y) * zoom + r.vh / 2;
      ctx.drawImage(this.canvas, 0, 0, cols, rows, sx, sy, cols * cellPx * zoom, rows * cellPx * zoom);
      ctx.restore();
    }
  }

  T.Lighting = Lighting;
})();
