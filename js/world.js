(function () {
  const T = window.T;
  const TILE = T.TILE;
  const WALL = T.WALL_IDS;
  const W = 1600, H = 1000;
  const SEA = 312;
  const HELL_TOP = H - 92;

  class World {
    constructor(seed) {
      this.seed = seed >>> 0;
      this.W = W;
      this.H = H;
      this.tiles = new Uint8Array(W * H);
      this.walls = new Uint8Array(W * H);
      this.water = new Uint8Array(W * H);
      this.lava = new Uint8Array(W * H);
      this.sky = new Uint8Array(W * H);
      this.surface = new Int16Array(W);
      this.rnd = T.RNG(this.seed);
      this.chests = [];
      this.chestMap = new Map();
      this.dirtyChunks = new Set();
      this.liquidDirty = new Set();
      this.spawn = { x: Math.floor(W * 0.42), y: 0 };
      this.zones = [];
      this.flags = {};
      this.time = 0;
      this.growth = [];
      this.onProgress = null;
      this.onEvent = null;
      this.chunksX = Math.ceil(W / 16);
    }

    idx(x, y) { return y * W + x; }
    inBounds(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }

    getTile(x, y) {
      if (x < 0 || x >= W || y < 0 || y >= H) return TILE.STONE;
      return this.tiles[y * W + x];
    }
    getTileSoft(x, y) {
      if (x < 0 || x >= W || y < 0) return TILE.AIR;
      if (y >= H) return TILE.STONE;
      return this.tiles[y * W + x];
    }
    getWall(x, y) {
      if (!this.inBounds(x, y)) return 0;
      return this.walls[y * W + x];
    }
    waterAt(x, y) {
      if (!this.inBounds(x, y)) return 0;
      return this.water[y * W + x];
    }
    lavaAt(x, y) {
      if (!this.inBounds(x, y)) return 0;
      return this.lava[y * W + x];
    }
    solidTile(x, y) {
      return T.isSolid(this.getTile(x, y));
    }
    markChunk(x, y) {
      const cx = x >> 4, cy = y >> 4;
      this.dirtyChunks.add(cy * this.chunksX + cx);
      const lx = x & 15, ly = y & 15;
      if (lx === 0 && cx > 0) this.dirtyChunks.add(cy * this.chunksX + cx - 1);
      if (lx === 15 && cx < this.chunksX - 1) this.dirtyChunks.add(cy * this.chunksX + cx + 1);
      if (ly === 0 && cy > 0) this.dirtyChunks.add((cy - 1) * this.chunksX + cx);
      if (ly === 15) this.dirtyChunks.add((cy + 1) * this.chunksX + cx);
    }
    markLiquid(x, y) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (this.inBounds(nx, ny)) this.liquidDirty.add(ny * W + nx);
        }
      }
    }
    put(x, y, tile) {
      if (!this.inBounds(x, y)) return;
      this.tiles[y * W + x] = tile;
    }
    putWall(x, y, wall) {
      if (!this.inBounds(x, y)) return;
      this.walls[y * W + x] = wall;
    }
    setTile(x, y, tile) {
      if (!this.inBounds(x, y)) return;
      const i = y * W + x;
      if (this.tiles[i] === tile) return;
      this.tiles[i] = tile;
      if (tile !== TILE.AIR) {
        this.water[i] = 0;
        this.lava[i] = 0;
      }
      this.markChunk(x, y);
      this.markLiquid(x, y);
      if (this.onTileChange) this.onTileChange(x, y, tile);
    }
    setWall(x, y, wall) {
      if (!this.inBounds(x, y)) return;
      const i = y * W + x;
      if (this.walls[i] === wall) return;
      this.walls[i] = wall;
      this.markChunk(x, y);
    }
    addLiquid(x, y, type, amount) {
      if (!this.inBounds(x, y)) return;
      const i = y * W + x;
      if (T.isSolid(this.tiles[i])) return;
      const arr = type === 'lava' ? this.lava : this.water;
      arr[i] = T.clamp(arr[i] + amount, 0, 8);
      this.markLiquid(x, y);
    }

    zoneAt(x) {
      for (let i = 0; i < this.zones.length; i++) {
        const z = this.zones[i];
        if (x >= z.x0 && x < z.x1) return z;
      }
      return this.zones[this.zones.length - 1];
    }
    biomeAt(x, y) {
      const z = this.zoneAt(x);
      const s = this.surface[T.clamp(x, 0, W - 1)];
      if (y >= HELL_TOP) return '\u5730\u72f1';
      if (y > s + 260) return z.type === 'dungeon' ? '\u5730\u7262' : '\u6df1\u6e0a';
      if (y > s + 90) return '\u6d1e\u7a74';
      if (y > s + 4) return '\u5730\u4e0b';
      if (y < 150) return '\u7a7a\u5c9b';
      if (z.type === 'ocean') return '\u6d77\u6d0b';
      if (z.type === 'beach') return '\u6d77\u6ee9';
      if (z.type === 'snow') return '\u96ea\u539f';
      if (z.type === 'desert') return '\u6c99\u6f20';
      if (z.type === 'corruption') return '\u8150\u5316\u4e4b\u5730';
      if (z.type === 'jungle') return '\u4e1b\u6797';
      if (z.type === 'dungeon') return '\u5730\u7262';
      return '\u68ee\u6797';
    }
    depthAt(y) {
      const s = this.surface[Math.floor(W / 2)];
      return (y - s) * 0.0625;
    }

    async step(pct, label) {
      if (this.onProgress) this.onProgress(pct, label);
      await new Promise(function (r) { setTimeout(r, 0); });
    }

    async generate() {
      T.Noise.seed(this.seed ^ 0x9e3779b9);
      this.makeZones();
      this.spawn.x = Math.floor(this.zones.reduce(function (best, z) {
        if (z.type !== 'forest') return best;
        const c = (z.x0 + z.x1) / 2;
        return Math.abs(c - W * 0.42) < Math.abs(best - W * 0.42) ? c : best;
      }, W * 0.42));
      await this.step(3, '\u5851\u9020\u5c71\u5ddd\u4e0e\u6d77\u5cb8');
      this.makeHeights();
      await this.step(10, '\u94fa\u8bbe\u6ce5\u571f\u4e0e\u5ca9\u5c42');
      this.fillLayers();
      await this.step(20, '\u5f00\u51ff\u6d1e\u7a74\u7f51\u7edc');
      this.carveCaves();
      await this.step(32, '\u751f\u957f\u77ff\u8109\u4e0e\u5b9d\u77f3');
      this.placeOres();
      await this.step(44, '\u6e17\u900f\u5730\u4e0b\u6c34\u8109');
      this.placeLiquids();
      await this.step(52, '\u652f\u6491\u5730\u4e0b\u4e16\u754c');
      this.placeWalls();
      await this.step(60, '\u5174\u5efa\u5730\u7262\u4e0e\u9057\u8ff9');
      this.buildDungeon();
      this.buildCorruption();
      this.buildFloatingIslands();
      this.buildCabins();
      await this.step(72, '\u64ad\u79cd\u68ee\u6797\u4e0e\u751f\u6001');
      this.decorateSurface();
      await this.step(78, '\u6574\u7406\u6b8b\u7f3a\u7684\u6811\u51a0');
      this.pruneTrees();
      await this.step(84, '\u70b9\u4eae\u5fae\u5149\u4e0e\u7ec6\u8282');
      this.decorateUnderground();
      this.carveSpawn();
      await this.step(92, '\u70d8\u7119\u5929\u7a7a\u5149\u7167');
      this.rebuildSkyLight();
      await this.step(98, '\u5524\u9192\u6c89\u7761\u7684\u4e16\u754c');
      this.placeInitialChests();
      await this.step(100, '\u4e16\u754c\u5df2\u5c31\u7eea');
      return this;
    }

    makeZones() {
      const defs = [
        ['ocean', 0, 0.04],
        ['beach', 0.04, 0.058],
        ['dungeon', 0.064, 0.108],
        ['forest', 0.108, 0.145],
        ['snow', 0.145, 0.285],
        ['forest', 0.285, 0.50],
        ['corruption', 0.50, 0.60],
        ['forest', 0.60, 0.63],
        ['jungle', 0.63, 0.765],
        ['desert', 0.765, 0.885],
        ['forest', 0.885, 0.96],
        ['beach', 0.96, 0.978],
        ['ocean', 0.978, 1]
      ];
      this.zones = defs.map(function (d) {
        return { type: d[0], x0: Math.floor(d[1] * W), x1: Math.floor(d[2] * W) };
      });
      this.biomeCenters = {};
      for (const z of this.zones) {
        if (!this.biomeCenters[z.type]) this.biomeCenters[z.type] = Math.floor((z.x0 + z.x1) / 2);
      }
    }

    makeHeights() {
      const N = T.Noise;
      for (let x = 0; x < W; x++) {
        const z = this.zoneAt(x);
        let h = 300 + N.fbm(x * 0.0045, 0.7, 4) * 46 + N.fbm(x * 0.021, 8.3, 3) * 10;
        h += N.fbm(x * 0.0016, 21.5, 2) * 54;
        h += N.ridged(x * 0.0011, 9.1, 3) * 40;
        h += N.fbm(x * 0.085, 33.3, 2) * 7;
        if (z.type === 'ocean') {
          const t = z.x0 === 0 ? x / z.x1 : (W - x) / (W - z.x0);
          h = T.lerp(392, 326, T.clamp(t * 1.35, 0, 1));
          h += N.fbm(x * 0.03, 3, 3) * 6;
        } else if (z.type === 'beach') {
          h = 318 + N.fbm(x * 0.05, 1, 2) * 4;
        } else if (z.type === 'snow') {
          h -= 22 + N.ridged(x * 0.006, 2.5, 4) * 30;
          h -= tundraSide(x, z) * 12;
        } else if (z.type === 'desert') {
          h += 16 + Math.sin(x * 0.045) * 7 + N.fbm(x * 0.03, 4, 3) * 10;
          h += N.ridged(x * 0.05, 12, 2) * 9;
        } else if (z.type === 'jungle') {
          h -= 8 + N.fbm(x * 0.008, 5, 3) * 14;
          h += N.fbm(x * 0.03, 18, 3) * 12;
        } else if (z.type === 'corruption') {
          const edge = Math.min(x - z.x0, z.x1 - x) / ((z.x1 - z.x0) / 2);
          h += 10 + N.fbm(x * 0.05, 7, 3) * 16 - Math.max(0, 1 - edge) * 20;
        } else if (z.type === 'dungeon') {
          h = 306 + N.fbm(x * 0.04, 2, 2) * 4;
        }
        this.surface[x] = Math.round(T.clamp(h, 190, 440));
      }
      for (let pass = 0; pass < 1; pass++) {
        for (let x = 1; x < W - 1; x++) {
          this.surface[x] = Math.round((this.surface[x - 1] + this.surface[x] * 2 + this.surface[x + 1]) / 4);
        }
      }
      function tundraSide(px, z) {
        const d = Math.min(px - z.x0, z.x1 - px);
        return T.clamp(1 - d / 40, 0, 1);
      }
    }

    fillLayers() {
      const rnd = this.rnd;
      for (let x = 0; x < W; x++) {
        const z = this.zoneAt(x);
        const s = this.surface[x];
        const dirtDepth = 22 + Math.floor(rnd() * 22) + Math.floor(T.Noise.fbm(x * 0.03, 12, 2) * 10);
        const hellJitter = Math.floor(T.Noise.fbm(x * 0.02, 40, 2) * 18);
        for (let y = 0; y < H; y++) {
          if (y < s) { this.tiles[y * W + x] = TILE.AIR; continue; }
          const d = y - s;
          let tile;
          if (y > HELL_TOP + hellJitter) {
            tile = rnd() < 0.12 ? TILE.STONE : TILE.ASH;
          } else if (z.type === 'ocean' || z.type === 'beach') {
            if (d < 14) tile = TILE.SAND;
            else if (d < 34) tile = TILE.SANDSTONE;
            else tile = TILE.STONE;
          } else if (z.type === 'desert') {
            if (d < 16 + Math.floor(rnd() * 5)) tile = TILE.SAND;
            else if (d < 42) tile = TILE.SANDSTONE;
            else tile = TILE.STONE;
          } else if (z.type === 'snow') {
            if (d < 2) tile = TILE.SNOW;
            else if (d < 14 + Math.floor(rnd() * 10)) tile = rnd() < 0.35 ? TILE.ICE : TILE.SNOW;
            else if (d < 38) tile = rnd() < 0.18 ? TILE.ICE : TILE.STONE;
            else tile = TILE.STONE;
          } else if (z.type === 'jungle') {
            if (d < 1) tile = TILE.JUNGLE_GRASS;
            else if (d < 20 + Math.floor(rnd() * 14)) tile = TILE.MUD;
            else if (d < 90) tile = rnd() < 0.35 ? TILE.MUD : TILE.STONE;
            else tile = TILE.STONE;
          } else if (z.type === 'corruption') {
            if (d < 1) tile = TILE.CORRUPT_GRASS;
            else if (d < 5 + Math.floor(rnd() * 6)) tile = rnd() < 0.5 ? TILE.EBONSTONE : TILE.DIRT;
            else tile = TILE.EBONSTONE;
          } else {
            if (d < 1) tile = TILE.GRASS;
            else if (d < dirtDepth) tile = TILE.DIRT;
            else if (d < dirtDepth + 40) tile = TILE.STONE;
            else tile = TILE.STONE;
          }
          if (d >= 1 && d < 5 && (z.type === 'forest') && rnd() < 0.035) tile = TILE.CLAY;
          this.tiles[y * W + x] = tile;
        }
      }
      const blobCount = 34;
      for (let i = 0; i < blobCount; i++) {
        const cx = 180 + Math.floor(rnd() * (W - 360));
        const cy = 340 + Math.floor(rnd() * 380);
        const z = this.zoneAt(cx);
        const r = 18 + Math.floor(rnd() * 34);
        for (let y = cy - r; y <= cy + r; y++) {
          for (let x = cx - r; x <= cx + r; x++) {
            if (x < 0 || x >= W || y < 0 || y >= H) continue;
            const dd = Math.hypot(x - cx, (y - cy) * 1.6);
            if (dd > r) continue;
            if (this.tiles[y * W + x] === TILE.AIR) continue;
            if (y < this.surface[x] + 4) continue;
            if (z.type === 'corruption' || (z.type === 'forest' && dd < r * 0.55 && rnd() < 0.5)) {
              this.tiles[y * W + x] = TILE.EBONSTONE;
            }
          }
        }
      }
    }

    carveCaves() {
      const N = T.Noise;
      const rnd = this.rnd;
      for (let x = 0; x < W; x++) {
        const s = this.surface[x];
        const startY = s + 5;
        for (let y = startY; y < HELL_TOP; y++) {
          const i = y * W + x;
          if (this.tiles[i] === TILE.AIR) continue;
          const d = y - s;
          if (d < 10) continue;
          const openness = 0.16 + T.clamp((d - 60) / 900, 0, 0.12);
          const n = N.fbm(x * 0.017, y * 0.021, 4, 0.55) + N.fbm(x * 0.05, y * 0.05, 2) * 0.16;
          const tunnel = Math.abs(N.noise(x * 0.0125, y * 0.018));
          const big = N.fbm(x * 0.006, y * 0.008, 3);
          let carve = n > openness;
          if (tunnel < 0.04 && d > 14) carve = true;
          if (d > 220 && big > 0.3) carve = true;
          if (carve) this.tiles[i] = TILE.AIR;
        }
      }
      const entrances = 9;
      for (let e = 0; e < entrances; e++) {
        let x = 140 + Math.floor(rnd() * (W - 280));
        const z = this.zoneAt(x);
        if (z.type === 'ocean' || z.type === 'beach') { e--; continue; }
        let y = this.surface[x] + 1;
        const angle = rnd() < 0.5 ? -1 : 1;
        const length = 80 + Math.floor(rnd() * 150);
        for (let i = 0; i < length; i++) {
          const r = 2 + Math.floor(rnd() * 2);
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              if (dx * dx + dy * dy > r * r + 1) continue;
              const px = x + dx, py = y + dy;
              if (px < 1 || px >= W - 1 || py < 3 || py >= H - 2) continue;
              if (this.tiles[py * W + px] === TILE.AIR) continue;
              if (T.isSolid(this.tiles[(py - 1) * W + px]) || this.tiles[py * W + px] === TILE.TREETRUNK) {
                this.tiles[py * W + px] = TILE.AIR;
              } else if (py > this.surface[px]) {
                this.tiles[py * W + px] = TILE.AIR;
              }
            }
          }
          x += (rnd() < 0.5 ? -1 : 1) + angle * 0.2;
          y += 1;
          if (x < 20 || x > W - 20) x = T.clamp(x, 20, W - 20);
        }
        const mouth = this.surface[x];
        for (let dx = -3; dx <= 3; dx++) {
          for (let dy = -5; dy <= 0; dy++) {
            const px = Math.round(x) + dx, py = mouth + dy;
            if (this.inBounds(px, py)) this.tiles[py * W + px] = TILE.AIR;
          }
        }
      }
      for (let x = 0; x < W; x++) {
        const s = this.surface[x];
        for (let y = s - 2; y < s + 2; y++) {
          if (y < 0 || y >= H) continue;
          if (this.tiles[y * W + x] === TILE.AIR && y >= s) {
            if (rnd() < 0.5) this.tiles[y * W + x] = rnd() < 0.5 ? TILE.DIRT : TILE.STONE;
          }
        }
      }
    }

    canOreReplace(i) {
      const t = this.tiles[i];
      return t === TILE.STONE || t === TILE.DIRT || t === TILE.EBONSTONE || t === TILE.MUD ||
        t === TILE.SANDSTONE || t === TILE.ASH || t === TILE.ICE || t === TILE.SNOW;
    }

    placeOres() {
      const rnd = this.rnd;
      const defs = [
        { tile: TILE.ORE_COPPER, n: 340, y0: 40, y1: 420, min: 3, max: 9 },
        { tile: TILE.ORE_IRON, n: 300, y0: 90, y1: 560, min: 3, max: 8 },
        { tile: TILE.ORE_SILVER, n: 220, y0: 260, y1: 720, min: 2, max: 7 },
        { tile: TILE.ORE_GOLD, n: 150, y0: 380, y1: 840, min: 2, max: 6 },
        { tile: TILE.GEM_AMETHYST, n: 70, y0: 380, y1: 900, min: 1, max: 3 },
        { tile: TILE.GEM_TOPAZ, n: 60, y0: 450, y1: 900, min: 1, max: 3 },
        { tile: TILE.GEM_RUBY, n: 40, y0: 560, y1: 920, min: 1, max: 2 },
        { tile: TILE.GEM_DIAMOND, n: 26, y0: 640, y1: 940, min: 1, max: 2 },
        { tile: TILE.ORE_TIN, n: 260, y0: 50, y1: 400, min: 3, max: 8 },
        { tile: TILE.ORE_LEAD, n: 240, y0: 120, y1: 560, min: 3, max: 7 },
        { tile: TILE.ORE_TUNGSTEN, n: 190, y0: 280, y1: 720, min: 2, max: 6 },
        { tile: TILE.ORE_PLATINUM, n: 120, y0: 400, y1: 860, min: 2, max: 5 },
        { tile: TILE.GEM_EMERALD, n: 50, y0: 420, y1: 900, min: 1, max: 3 },
        { tile: TILE.GEM_SAPPHIRE, n: 44, y0: 520, y1: 930, min: 1, max: 2 },
        { tile: TILE.GEM_AMBER, n: 66, y0: 340, y1: 820, min: 1, max: 3 }
      ];
      for (const o of defs) {
        let placed = 0, tries = 0;
        while (placed < o.n && tries < o.n * 14) {
          tries++;
          const x = 30 + Math.floor(rnd() * (W - 60));
          const y = o.y0 + Math.floor(rnd() * (o.y1 - o.y0));
          if (!this.inBounds(x, y)) continue;
          if (y < this.surface[x] + 6) continue;
          if (this.tiles[y * W + x] !== TILE.STONE && this.tiles[y * W + x] !== TILE.DIRT && this.tiles[y * W + x] !== TILE.EBONSTONE) continue;
          const size = o.min + Math.floor(rnd() * (o.max - o.min + 1));
          this.growOre(x, y, o.tile, size);
          placed++;
        }
      }
      const crim = this.biomeCenters.corruption;
      for (let i = 0; i < 150; i++) {
        const cx2 = crim - 120 + Math.floor(rnd() * 240);
        const cy2 = 360 + Math.floor(rnd() * 520);
        if (!this.inBounds(cx2, cy2)) continue;
        if (this.tiles[cy2 * W + cx2] === TILE.AIR) continue;
        if (this.zoneAt(cx2).type !== 'corruption') continue;
        this.growOre(cx2, cy2, TILE.ORE_CRIMTANE, 3 + Math.floor(rnd() * 4));
      }
      const corr = this.biomeCenters.corruption;
      for (let i = 0; i < 120; i++) {
        const x = corr - 110 + Math.floor(rnd() * 220);
        const y = 330 + Math.floor(rnd() * 520);
        if (!this.inBounds(x, y)) continue;
        if (this.tiles[y * W + x] === TILE.AIR) continue;
        if (this.zoneAt(x).type !== 'corruption') continue;
        this.growOre(x, y, TILE.ORE_DEMONITE, 3 + Math.floor(rnd() * 5));
      }
      for (let x = 20; x < W - 20; x++) {
        for (let y = HELL_TOP + 10; y < H - 8; y++) {
          if (this.tiles[y * W + x] === TILE.ASH && rnd() < 0.006 && rnd() < 0.5) {
            this.growOre(x, y, TILE.ORE_HELL, 2 + Math.floor(rnd() * 3));
          }
        }
      }
    }

    growOre(x, y, tile, size) {
      const rnd = this.rnd;
      let cx = x, cy = y;
      for (let i = 0; i < size; i++) {
        if (this.inBounds(cx, cy)) {
          const idx = cy * W + cx;
          if (this.canOreReplace(idx)) this.tiles[idx] = tile;
        }
        const dir = Math.floor(rnd() * 4);
        if (dir === 0) cx++; else if (dir === 1) cx--; else if (dir === 2) cy++; else cy--;
        if (rnd() < 0.25) cy++;
      }
    }

    placeLiquids() {
      const rnd = this.rnd;
      for (let x = 0; x < W; x++) {
        const z = this.zoneAt(x);
        if (z.type !== 'ocean' && z.type !== 'beach') continue;
        const s = this.surface[x];
        const deep = z.type === 'ocean';
        const level = deep ? SEA : SEA + 2;
        if (s <= level) continue;
        for (let y = level; y < s; y++) {
          const i = y * W + x;
          if (this.tiles[i] === TILE.AIR) this.water[i] = 8;
        }
      }
      for (let x = 0; x < W; x++) {
        const z = this.zoneAt(x);
        if (z.type !== 'ocean' && z.type !== 'beach') continue;
        let top = -1;
        for (let y = 0; y < H; y++) {
          if (this.water[y * W + x] > 0) { top = y; break; }
        }
        if (top < 0) continue;
        let bottom = H;
        for (let y = top; y < H; y++) {
          if (this.tiles[y * W + x] !== TILE.AIR) { bottom = y; break; }
        }
        for (let y = top; y < bottom; y++) this.water[y * W + x] = 8;
      }
      const lakes = 8;
      for (let i = 0; i < lakes; i++) {
        const x = 180 + Math.floor(rnd() * (W - 360));
        const z = this.zoneAt(x);
        if (z.type === 'ocean' || z.type === 'beach' || z.type === 'dungeon') continue;
        const s = this.surface[x];
        let found = -1;
        for (let xx = x - 12; xx < x + 12; xx++) {
          if (this.surface[xx] > s + 2) { found = xx; break; }
        }
        if (found < 0) continue;
        const level = this.surface[found] + 1;
        for (let xx = found - 9; xx <= found + 9; xx++) {
          for (let y = level; y < level + 5; y++) {
            if (!this.inBounds(xx, y)) continue;
            const ii = y * W + xx;
            if (this.tiles[ii] !== TILE.AIR) continue;
            if (y === level || y > level) this.water[ii] = 8;
          }
        }
      }
      let pools = 0, tries = 0;
      while (pools < 34 && tries < 900) {
        tries++;
        const x = 60 + Math.floor(rnd() * (W - 120));
        const y = this.surface[x] + 50 + Math.floor(rnd() * 550);
        if (!this.inBounds(x, y)) continue;
        if (this.tiles[y * W + x] !== TILE.AIR) continue;
        if (this.water[y * W + x]) continue;
        const isLava = y > 760 || (y > HELL_TOP - 40);
        const liquid = isLava ? this.lava : this.water;
        if (isLava && y < 720) continue;
        const level = y;
        let count = 0;
        for (let yy = level + 6; yy >= level - 4 && count < 90; yy--) {
          for (let xx = x - 4; xx <= x + 4 && count < 90; xx++) {
            if (!this.inBounds(xx, yy)) continue;
            const ii = yy * W + xx;
            if (this.tiles[ii] !== TILE.AIR) continue;
            if (this.water[ii] || this.lava[ii]) continue;
            if (yy > level + 1) continue;
            liquid[ii] = 8;
            count++;
          }
        }
        if (count > 4) pools++;
      }
      for (let x = 40; x < W - 40; x++) {
        for (let y = HELL_TOP + 4; y < H - 6; y++) {
          const i = y * W + x;
          if (this.tiles[i] !== TILE.AIR) continue;
          if (rnd() < 0.06) this.lava[i] = 8;
        }
      }
    }

    wallFor(x, y) {
      const z = this.zoneAt(x);
      const s = this.surface[x];
      const d = y - s;
      if (y > HELL_TOP) return WALL.HELL;
      if (z.type === 'dungeon') return WALL.DUNGEON;
      if (z.type === 'jungle' && d > 6) return WALL.JUNGLE;
      if (z.type === 'snow' && d > 4) return WALL.SNOW;
      if (z.type === 'corruption' && d > 4) return WALL.EBONSTONE;
      if (z.type === 'ocean' || z.type === 'beach' || z.type === 'desert') return d < 30 ? WALL.DIRT : WALL.STONE;
      if (d < 26) return WALL.DIRT;
      return WALL.STONE;
    }

    placeWalls() {
      for (let x = 0; x < W; x++) {
        const s = this.surface[x];
        for (let y = s + 1; y < H; y++) {
          const i = y * W + x;
          this.walls[i] = this.wallFor(x, y);
        }
      }
    }

    box(x, y, w, h, tile, wall) {
      for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) {
          if (!this.inBounds(xx, yy)) continue;
          if (tile !== null) this.tiles[yy * W + xx] = tile;
          if (wall !== null) this.walls[yy * W + xx] = wall;
        }
      }
    }
    carve(x, y, w, h, wall) {
      for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) {
          if (!this.inBounds(xx, yy)) continue;
          this.tiles[yy * W + xx] = TILE.AIR;
          this.water[yy * W + xx] = 0;
          this.lava[yy * W + xx] = 0;
          if (wall !== undefined) this.walls[yy * W + xx] = wall;
        }
      }
    }

    buildDungeon() {
      const rnd = this.rnd;
      const z = this.zones.find(function (zz) { return zz.type === 'dungeon'; });
      const cx = Math.floor((z.x0 + z.x1) / 2);
      const s = this.surface[cx];
      this.dungeonX = cx;
      this.dungeonEntrance = s;
      for (let x = cx - 20; x <= cx + 20; x++) {
        for (let y = s - 26; y < s; y++) {
          if (this.inBounds(x, y)) this.tiles[y * W + x] = TILE.AIR;
        }
        for (let y = s; y < s + 8; y++) {
          if (this.inBounds(x, y)) {
            this.tiles[y * W + x] = TILE.DIRT;
            this.walls[y * W + x] = WALL.DIRT;
          }
        }
        this.surface[x] = s;
      }
      this.box(cx - 15, s - 24, 30, 9, TILE.BRICK_DUNGEON, WALL.DUNGEON);
      this.carve(cx - 14, s - 23, 28, 7, WALL.DUNGEON);
      for (let i = 0; i < 5; i++) this.put(cx - 12 + i * 6, s - 23, TILE.TORCH);
      this.box(cx - 14, s - 16, 28, 16, TILE.BRICK_DUNGEON, WALL.DUNGEON);
      this.carve(cx - 13, s - 16, 26, 14, WALL.DUNGEON);
      this.box(cx - 13, s - 2, 26, 2, TILE.BRICK_DUNGEON, WALL.DUNGEON);
      this.carve(cx - 2, s - 3, 4, 3, WALL.DUNGEON);
      this.put(cx - 1, s - 1, TILE.DOOR);
      this.put(cx, s - 1, TILE.DOOR);
      this.put(cx - 9, s - 3, TILE.CHEST);
      this.addChest(cx - 9, s - 3, this.rollLoot('dungeon'));
      this.put(cx + 9, s - 3, TILE.CHEST);
      this.addChest(cx + 9, s - 3, this.rollLoot('dungeon'));
      this.put(cx - 11, s - 3, TILE.TORCH);
      this.put(cx + 11, s - 3, TILE.TORCH);
      const depth = 260;
      const shaftW = 7;
      for (let y = s - 2; y < s + depth; y++) {
        const wobble = Math.round(Math.sin(y * 0.09) * 1.5);
        this.carve(cx - 3 + wobble, y, shaftW, 1, WALL.DUNGEON);
        this.box(cx - 5 + wobble, y, 2, 1, TILE.BRICK_DUNGEON, WALL.DUNGEON);
        this.box(cx + 3 + wobble, y, 2, 1, TILE.BRICK_DUNGEON, WALL.DUNGEON);
        if (y % 14 === 0) this.box(cx - 3 + wobble, y, shaftW, 1, TILE.PLATFORM, WALL.DUNGEON);
        if (y % 26 === 0) {
          this.put(cx - 3 + wobble, y - 1, TILE.TORCH);
          this.put(cx + 3 + wobble, y - 1, TILE.TORCH);
        }
      }
      const rooms = [s + 40, s + 100, s + 160, s + 230];
      for (let r = 0; r < rooms.length; r++) {
        const ry = rooms[r];
        const rw = 22 + Math.floor(rnd() * 10);
        const rh = 9;
        const rx = cx - Math.floor(rw / 2) + (r % 2 === 0 ? -14 : 14);
        this.box(rx - 1, ry - 1, rw + 2, rh + 2, TILE.BRICK_DUNGEON, WALL.DUNGEON);
        this.carve(rx, ry, rw, rh, WALL.DUNGEON);
        this.box(rx, ry + rh, rw, 1, TILE.BRICK_DUNGEON, WALL.DUNGEON);
        for (let i = 0; i < 3; i++) {
          const px = rx + 3 + Math.floor(rnd() * (rw - 6));
          this.put(px, ry, TILE.TORCH);
        }
        if (rnd() < 0.8) {
          const px = rx + 4 + Math.floor(rnd() * (rw - 8));
          this.addChest(px, ry + rh - 1, this.rollLoot('dungeon'));
          this.put(px, ry + rh - 1, TILE.CHEST);
        }
        if (rnd() < 0.7) {
          const sx = rx + 2 + Math.floor(rnd() * (rw - 5));
          for (let k = 0; k < 3; k++) this.put(sx + k, ry + rh - 1, TILE.SPIKES);
        }
        if (rnd() < 0.6) {
          const wx = rx + 2;
          for (let yy = ry + rh - 1; yy >= ry + rh - 4; yy--) {
            for (let xx = wx; xx < wx + 4; xx++) {
              if (this.inBounds(xx, yy) && this.tiles[yy * W + xx] === TILE.AIR) this.water[yy * W + xx] = 8;
            }
          }
        }
        for (let i = 0; i < 2; i++) {
          const px = rx + 2 + Math.floor(rnd() * (rw - 4));
          if (this.tiles[(ry + rh - 1) * W + px] === TILE.AIR) this.put(px, ry + rh - 1, TILE.POT);
        }
      }
      this.box(cx - 30, s - 22, 8, 3, TILE.BRICK_DUNGEON, WALL.DUNGEON);
      this.box(cx + 23, s - 22, 8, 3, TILE.BRICK_DUNGEON, WALL.DUNGEON);
      this.spawnOldMan = { x: cx, y: s - 3 };
    }

    buildCorruption() {
      const rnd = this.rnd;
      const z = this.zones.find(function (zz) { return zz.type === 'corruption'; });
      this.altars = [];
      for (let i = 0; i < 4; i++) {
        const cx = z.x0 + 14 + Math.floor(rnd() * (z.x1 - z.x0 - 28));
        const s = this.surface[cx];
        const depth = 120 + Math.floor(rnd() * 240);
        let x = cx;
        for (let y = s; y < s + depth; y++) {
          const r = 3 + Math.floor(rnd() * 3);
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              if (dx * dx + dy * dy > r * r) continue;
              const px = x + dx, py = y + dy;
              if (!this.inBounds(px, py)) continue;
              this.tiles[py * W + px] = TILE.AIR;
              this.walls[py * W + px] = WALL.EBONSTONE;
            }
          }
          if (rnd() < 0.4) x += rnd() < 0.5 ? -1 : 1;
        }
        const bottom = s + depth;
        this.box(x - 6, bottom, 12, 1, TILE.EBONSTONE, WALL.EBONSTONE);
        this.put(x, bottom - 1, TILE.ALTAR);
        this.altars.push({ x: x, y: bottom - 1 });
        for (let k = 0; k < 5; k++) {
          const px = x - 5 + Math.floor(rnd() * 10);
          this.put(px, bottom - 1, TILE.AIR);
        }
        this.box(x - 1, bottom - 1, 1, 1, TILE.AIR, WALL.EBONSTONE);
        this.put(x, bottom - 1, TILE.ALTAR);
        this.put(x - 2, bottom - 1, TILE.TORCH);
        this.put(x + 2, bottom - 1, TILE.TORCH);
      }
      this.corruptionCenter = Math.floor((z.x0 + z.x1) / 2);
    }

    buildFloatingIslands() {
      const rnd = this.rnd;
      this.islands = [];
      const count = 3;
      for (let i = 0; i < count; i++) {
        const cx = 220 + Math.floor((W - 440) * (i + 0.5) / count) + Math.floor(rnd() * 90 - 45);
        const cy = 120 + Math.floor(rnd() * 45);
        const w = 26 + Math.floor(rnd() * 14);
        this.islands.push({ x: cx, y: cy });
        for (let x = cx - w; x <= cx + w; x++) {
          const t = 1 - Math.abs(x - cx) / w;
          const thickness = Math.round(2 + t * 7);
          for (let y = cy; y < cy + thickness; y++) {
            if (!this.inBounds(x, y)) continue;
            const i2 = y * W + x;
            if (y < cy + 2) this.tiles[i2] = TILE.DIRT;
            else if (y < cy + 4) this.tiles[i2] = TILE.CLOUD;
            else this.tiles[i2] = TILE.CLOUD;
            this.walls[i2] = WALL.DIRT;
          }
          let grassX = cx - w + 2;
        }
        for (let x = cx - w + 2; x <= cx + w - 2; x++) {
          const t = 1 - Math.abs(x - cx) / w;
          this.put(x, cy, TILE.GRASS);
          if (rnd() < 0.3) this.put(x, cy - 1, TILE.PLANT);
        }
        const hx = cx - 7;
        this.buildSmallHouse(hx, cy - 1, 14, 7, 'island');
        this.addChest(hx + 3, cy - 2, this.rollLoot('island'));
        this.put(hx + 3, cy - 2, TILE.CHEST);
        for (let k = 0; k < 4; k++) {
          const px = cx + 10 + k;
          if (this.inBounds(px, cy + 1)) this.tiles[(cy + 1) * W + px] = TILE.CLOUD;
        }
      }
    }

    buildSmallHouse(x, groundY, w, h, style) {
      const wallId = style === 'island' ? WALL.WOOD : WALL.WOOD;
      this.carve(x, groundY - h, w, h, wallId);
      this.box(x - 1, groundY - h - 1, w + 2, 1, style === 'island' ? TILE.CLOUD : TILE.WOOD, wallId);
      this.box(x - 1, groundY, w + 2, 1, style === 'island' ? TILE.CLOUD : TILE.WOOD, wallId);
      this.box(x - 1, groundY - h, 1, h, style === 'island' ? TILE.CLOUD : TILE.WOOD, wallId);
      this.box(x + w, groundY - h, 1, h, style === 'island' ? TILE.CLOUD : TILE.WOOD, wallId);
      this.box(x, groundY - h, w, 1, TILE.AIR, wallId);
      this.put(x + Math.floor(w / 2), groundY - 2, TILE.DOOR);
      this.put(x + 1, groundY - 3, TILE.TABLE);
      this.put(x + w - 2, groundY - 3, TILE.CHAIR);
      this.put(x + Math.floor(w / 2) + 2, groundY - 2, TILE.TORCH);
    }

    buildCabins() {
      const rnd = this.rnd;
      let built = 0, tries = 0;
      while (built < 26 && tries < 900) {
        tries++;
        const cx = 80 + Math.floor(rnd() * (W - 160));
        const cy = 380 + Math.floor(rnd() * 400);
        const z = this.zoneAt(cx);
        if (z.type === 'ocean' || z.type === 'beach') continue;
        const w = 12 + Math.floor(rnd() * 8);
        const h = 6 + Math.floor(rnd() * 3);
        const x = cx - Math.floor(w / 2);
        let ground = -1;
        for (let yy = cy; yy < cy + 26; yy++) {
          let solid = false;
          for (let xx = x - 1; xx <= x + w; xx++) {
            if (!this.inBounds(xx, yy)) continue;
            const tt = this.tiles[yy * W + xx];
            if (T.isSolid(tt)) solid = true;
          }
          if (solid) { ground = yy; break; }
        }
        if (ground < 0) continue;
        let ok = true;
        for (let yy = ground - h - 2; yy < ground; yy++) {
          for (let xx = x - 1; xx <= x + w; xx++) {
            if (!this.inBounds(xx, yy)) { ok = false; break; }
            if (this.tiles[yy * W + xx] !== TILE.AIR) { ok = false; break; }
          }
          if (!ok) break;
        }
        if (!ok) continue;
        this.box(x, ground, w, 1, TILE.WOOD, WALL.WOOD);
        this.box(x, ground - h, w, 1, TILE.WOOD, WALL.WOOD);
        this.box(x - 1, ground - h, 1, h, TILE.WOOD, WALL.WOOD);
        this.box(x + w, ground - h, 1, h, TILE.WOOD, WALL.WOOD);
        this.carve(x, ground - h + 1, w, h - 1, WALL.WOOD);
        this.put(x, ground - 1, TILE.DOOR);
        this.put(x + w - 1, ground - 2, TILE.TABLE);
        this.put(x + 1, ground - 2, TILE.CHAIR);
        this.put(x + Math.floor(w / 2), ground - 1, TILE.TORCH);
        this.put(x + w - 3, ground - 1, TILE.CHEST);
        this.addChest(x + w - 3, ground - 1, this.rollLoot('cabin'));
        if (rnd() < 0.5) this.put(x + 2, ground - 2, TILE.POT);
        this.put(x + Math.floor(w / 2) + 2, ground - 1, TILE.WORKBENCH);
        built++;
      }
    }

    pruneTrees() {
      const isTrunk = function (t) { return t === TILE.TREETRUNK; };
      const isLeaf = function (t) {
        return t === TILE.LEAVES || t === TILE.CORRUPT_LEAVES || t === TILE.JUNGLE_LEAVES;
      };
      for (let x = 2; x < W - 2; x++) {
        let y = 20;
        while (y < H - 2) {
          if (!isTrunk(this.tiles[y * W + x])) { y++; continue; }
          const top = y;
          while (y + 1 < H - 2 && isTrunk(this.tiles[(y + 1) * W + x])) y++;
          const bottom = y;
          let ground = -1;
          for (let d = 1; d <= 4; d++) {
            const t = this.getTile(x, bottom + d);
            if (T.isSolid(t) && !isTrunk(t)) { ground = bottom + d; break; }
          }
          if (ground < 0) {
            for (let yy = top; yy <= bottom; yy++) this.tiles[yy * W + x] = TILE.AIR;
          } else {
            for (let yy = bottom + 1; yy < ground; yy++) {
              this.tiles[yy * W + x] = TILE.TREETRUNK;
              this.walls[yy * W + x] = 0;
            }
          }
          y = bottom + 1;
        }
      }
      const seen = new Uint8Array(W * H);
      const stack = [];
      const isTree = function (t) { return isTrunk(t) || isLeaf(t); };
      for (let x = 2; x < W - 2; x++) {
        for (let y = 18; y < H - 2; y++) {
          const start = y * W + x;
          if (seen[start] || !isTree(this.tiles[start])) continue;
          const comp = [];
          stack.push(start);
          while (stack.length) {
            const i = stack.pop();
            if (seen[i]) continue;
            if (!isTree(this.tiles[i])) continue;
            seen[i] = 1;
            comp.push(i);
            const cx = i % W, cy = (i / W) | 0;
            if (cx > 1) stack.push(i - 1);
            if (cx < W - 2) stack.push(i + 1);
            if (cy > 1) stack.push(i - W);
            if (cy < H - 2) stack.push(i + W);
          }
          let hasTrunk = false;
          for (const idx2 of comp) {
            if (isTrunk(this.tiles[idx2])) { hasTrunk = true; break; }
          }
          if (!hasTrunk) {
            for (const idx2 of comp) this.tiles[idx2] = TILE.AIR;
          }
        }
      }
    }

    recomputeSurface(skipSpawn) {
      for (let x = 0; x < W; x++) {
        let y = Math.max(0, this.surface[x] - 12);
        while (y < H && !T.isSolid(this.tiles[y * W + x])) y++;
        if (y >= H) y = H - 1;
        this.surface[x] = y;
      }
      for (let pass = 0; pass < 2; pass++) {
        for (let x = 1; x < W - 1; x++) {
          const a = this.surface[x - 1], b = this.surface[x], c = this.surface[x + 1];
          if (Math.abs(a - b) > 6 || Math.abs(c - b) > 6) continue;
          this.surface[x] = Math.round((a + b + c) / 3);
        }
      }
    }

    clearFloatingDeco() {
      for (let x = 4; x < W - 4; x++) {
        for (let y = 4; y < H - 4; y++) {
          const i = y * W + x;
          const t = this.tiles[i];
          if (t === TILE.TREETRUNK) {
            let connected = false;
            for (let k = 1; k <= 3; k++) {
              const b = this.tiles[(y + k) * W + x];
              if (T.isSolid(b) && b !== TILE.TREETRUNK) { connected = true; break; }
              if (b === TILE.TREETRUNK) continue;
            }
            if (this.tiles[(y + 1) * W + x] === TILE.AIR && !T.isSolid(this.tiles[(y + 2) * W + x]) && !T.isSolid(this.tiles[(y + 3) * W + x])) {
              this.tiles[i] = TILE.AIR;
            }
          }
          if (t === TILE.LEAVES || t === TILE.CORRUPT_LEAVES || t === TILE.JUNGLE_LEAVES) {
            const connect = this.tiles[i - 1] === t || this.tiles[i + 1] === t || this.tiles[i - W] === t ||
              this.tiles[i + W] === t || this.tiles[i + W] === TILE.TREETRUNK || this.tiles[i - W] === TILE.TREETRUNK;
            if (!connect) this.tiles[i] = TILE.AIR;
          }
        }
      }
      for (let x = 4; x < W - 4; x++) {
        for (let y = 4; y < H - 4; y++) {
          const i = y * W + x;
          const t = this.tiles[i];
          if (t !== TILE.LEAVES && t !== TILE.CORRUPT_LEAVES && t !== TILE.JUNGLE_LEAVES) continue;
          let trunkNear = false;
          for (let dy = -6; dy <= 2 && !trunkNear; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
              if (this.tiles[(y + dy) * W + (x + dx)] === TILE.TREETRUNK) { trunkNear = true; break; }
            }
          }
          if (!trunkNear) this.tiles[i] = TILE.AIR;
        }
      }
    }

    decorateSurface() {
      const rnd = this.rnd;
      this.recomputeSurface(false);
      for (let x = 2; x < W - 2; x++) {
        const s = this.surface[x];
        const z = this.zoneAt(x);
        const top = this.tiles[s * W + x];
        if (top === TILE.AIR) continue;
        if (z.type === 'forest') {
          if (top === TILE.DIRT || top === TILE.GRASS) {
            const above = this.tiles[(s - 1) * W + x];
            if (above === TILE.AIR) {
              if (rnd() < 0.35) this.put(x, s - 1, TILE.PLANT);
              else if (rnd() < 0.08) this.put(x, s - 1, TILE.FLOWER);
              else if (rnd() < 0.03) this.put(x, s - 1, TILE.MUSHROOM);
            }
            if (this.tiles[s * W + x] === TILE.DIRT) this.put(x, s, TILE.GRASS);
          }
          if (this.tiles[s * W + x] === TILE.GRASS && this.tiles[(s - 1) * W + x] === TILE.AIR && rnd() < 0.16) {
            if (this.plantTree(x, s - 1, 'forest')) x += 2;
          }
        } else if (z.type === 'jungle') {
          if (top === TILE.MUD || top === TILE.JUNGLE_GRASS) {
            const above = this.tiles[(s - 1) * W + x];
            if (above === TILE.AIR) {
              if (rnd() < 0.4) this.put(x, s - 1, TILE.PLANT);
              else if (rnd() < 0.1) this.put(x, s - 1, TILE.MUSHROOM);
            }
            this.put(x, s, TILE.JUNGLE_GRASS);
          }
          if (this.tiles[s * W + x] === TILE.JUNGLE_GRASS && this.tiles[(s - 1) * W + x] === TILE.AIR && rnd() < 0.28) {
            if (this.plantTree(x, s - 1, 'jungle')) x += 2;
          }
        } else if (z.type === 'snow') {
          if (top === TILE.SNOW || top === TILE.DIRT) {
            const above = this.tiles[(s - 1) * W + x];
            if (above === TILE.AIR) {
              if (rnd() < 0.12) this.put(x, s - 1, TILE.PLANT);
            }
            if (this.tiles[s * W + x] === TILE.DIRT) this.put(x, s, TILE.SNOW);
          }
          if (this.tiles[s * W + x] === TILE.SNOW && this.tiles[(s - 1) * W + x] === TILE.AIR && rnd() < 0.2) {
            if (this.plantTree(x, s - 1, 'snow')) x += 2;
          }
        } else if (z.type === 'desert') {
          if (top === TILE.SAND && this.tiles[(s - 1) * W + x] === TILE.AIR && rnd() < 0.045) {
            const h = 2 + Math.floor(rnd() * 3);
            for (let k = 0; k < h; k++) {
              if (this.tiles[(s - 1 - k) * W + x] === TILE.AIR) this.put(x, s - 1 - k, TILE.CACTUS);
            }
            x += 2;
          }
          if (rnd() < 0.02 && top === TILE.SAND) this.put(x, s, TILE.SANDSTONE);
        } else if (z.type === 'corruption') {
          if (top === TILE.DIRT || top === TILE.EBONSTONE || top === TILE.CORRUPT_GRASS) {
            this.put(x, s, TILE.CORRUPT_GRASS);
            const above = this.tiles[(s - 1) * W + x];
            if (above === TILE.AIR && rnd() < 0.2) this.put(x, s - 1, TILE.PLANT);
          }
          if (this.tiles[s * W + x] === TILE.CORRUPT_GRASS && this.tiles[(s - 1) * W + x] === TILE.AIR && rnd() < 0.2) {
            if (this.plantTree(x, s - 1, 'corrupt')) x += 2;
          }
        } else if (z.type === 'beach') {
          if (top === TILE.SAND && rnd() < 0.02 && this.tiles[(s - 1) * W + x] === TILE.AIR) {
            this.put(x, s - 1, TILE.PLANT);
          }
        } else if (z.type === 'dungeon') {
          if (top === TILE.BRICK_DUNGEON) {
            for (let y = s - 1; y > s - 6; y--) {
              if (this.tiles[y * W + x] === TILE.AIR && rnd() < 0.1) this.put(x, y, TILE.VINE);
            }
          }
        }
      }
      for (let i = 0; i < 6; i++) {
        const x = 200 + Math.floor(rnd() * (W - 400));
        const s = this.surface[x];
        if (this.tiles[s * W + x] === TILE.GRASS && this.tiles[(s - 1) * W + x] === TILE.AIR) {
          this.plantTree(x, s - 1, 'forest');
        }
      }
    }

    plantTree(x, baseY, kind) {
      const rnd = this.rnd;
      let h, trunk = TILE.TREETRUNK, leaf = TILE.LEAVES;
      if (kind === 'forest') { h = 7 + Math.floor(rnd() * 11); }
      else if (kind === 'jungle') { h = 12 + Math.floor(rnd() * 16); trunk = TILE.TREETRUNK; leaf = TILE.JUNGLE_LEAVES; }
      else if (kind === 'corrupt') { h = 8 + Math.floor(rnd() * 9); leaf = TILE.CORRUPT_LEAVES; }
      else if (kind === 'snow') { h = 10 + Math.floor(rnd() * 12); leaf = TILE.LEAVES; }
      let ok = true;
      for (let k = 1; k <= h; k++) {
        if (this.tiles[(baseY - k) * W + x] !== TILE.AIR) { ok = false; break; }
      }
      if (!ok) return false;
      if (!T.isSolid(this.getTile(x, baseY + 1))) return false;
      for (let k = 1; k <= h; k++) this.put(x, baseY - k, trunk);
      const topY = baseY - h;
      const trunkW = kind === 'jungle' ? 2 : (h > 14 ? 2 : 1);
      if (trunkW === 2) {
        for (let k = 1; k <= h; k++) {
          if (this.getTile(x + 1, baseY - k) === TILE.AIR) this.put(x + 1, baseY - k, trunk);
        }
      }
      const leafClusters = kind === 'jungle' ? 6 : 5;
      for (let c = 0; c < leafClusters; c++) {
        const ang = rnd() * 6.283;
        const rr = rnd() * (kind === 'jungle' ? 3.4 : 2.6);
        const ccx = x + Math.round(Math.cos(ang) * rr);
        const ccy = topY + Math.round(Math.sin(ang) * rr * 0.8) - 1;
        const rx = (kind === 'jungle' ? 3.4 : 2.8) + rnd() * 1.6;
        const ry = (kind === 'jungle' ? 2.6 : 2.1) + rnd() * 1.2;
        for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
          for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
            const d = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
            if (d > 1) continue;
            const px = ccx + dx, py = ccy + dy;
            if (!this.inBounds(px, py)) continue;
            if (this.tiles[py * W + px] !== TILE.AIR) continue;
            if (d > 0.62 && rnd() < 0.22) continue;
            this.put(px, py, leaf);
          }
        }
      }
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const px = x + dx, py = topY + dy;
          if (!this.inBounds(px, py)) continue;
          if (this.tiles[py * W + px] === TILE.AIR && rnd() < 0.9) this.put(px, py, leaf);
        }
      }
      for (let k = 2; k < h - 1; k += 4) {
        if (rnd() < 0.4) {
          const dir = rnd() < 0.5 ? -1 : 1;
          const by = baseY - k;
          const bx1 = x + dir;
          if (this.inBounds(bx1, by) && this.tiles[by * W + bx1] === TILE.AIR) this.put(bx1, by, trunk);
          if (rnd() < 0.5) {
            const bx2 = x + dir * 2;
            if (this.inBounds(bx2, by - 1) && this.tiles[(by - 1) * W + bx2] === TILE.AIR) this.put(bx2, by - 1, trunk);
            if (this.inBounds(bx2, by - 2) && this.tiles[(by - 2) * W + bx2] === TILE.AIR && rnd() < 0.7) this.put(bx2, by - 2, leaf);
          } else {
            if (this.inBounds(bx1, by - 1) && this.tiles[(by - 1) * W + bx1] === TILE.AIR) this.put(bx1, by - 1, leaf);
          }
        }
      }      if (kind === 'jungle') {
        for (let k = 2; k < h; k += 2) {
          if (rnd() < 0.35) {
            const dir = rnd() < 0.5 ? -1 : 1;
            const px = x + dir, py = baseY - k;
            if (this.inBounds(px, py) && this.tiles[py * W + px] === TILE.AIR) {
              for (let v = 0; v < 2 + Math.floor(rnd() * 5); v++) {
                if (this.tiles[(py + v) * W + px] !== TILE.AIR) break;
                this.put(px, py + v, TILE.VINE);
              }
            }
          }
        }
      }
      return true;
    }

    decorateUnderground() {
      const rnd = this.rnd;
      this.clearFloatingDeco();
      let placed = 0, tries = 0;
      while (placed < 34 && tries < 1200) {
        tries++;
        const x = 40 + Math.floor(rnd() * (W - 80));
        const y = 380 + Math.floor(rnd() * 480);
        if (!this.inBounds(x, y)) continue;
        if (this.tiles[y * W + x] !== TILE.AIR) continue;
        if (!this.solidTile(x, y + 1)) continue;
        if (this.tiles[(y - 1) * W + x] !== TILE.AIR) continue;
        this.put(x, y, TILE.LIFE_CRYSTAL);
        placed++;
      }
      placed = 0; tries = 0;
      while (placed < 6 && tries < 600) {
        tries++;
        const x = 60 + Math.floor(rnd() * (W - 120));
        const y = 480 + Math.floor(rnd() * 380);
        if (!this.inBounds(x, y)) continue;
        if (this.tiles[y * W + x] !== TILE.AIR) continue;
        if (!this.solidTile(x, y + 1)) continue;
        this.put(x, y, TILE.MANA_CRYSTAL);
        placed++;
      }
      for (let i = 0; i < 160; i++) {
        const x = 30 + Math.floor(rnd() * (W - 60));
        const y = 350 + Math.floor(rnd() * 550);
        if (!this.inBounds(x, y)) continue;
        if (this.tiles[y * W + x] !== TILE.AIR) continue;
        if (!this.solidTile(x, y + 1)) continue;
        if (rnd() < 0.5) this.put(x, y, TILE.POT);
      }
      for (let i = 0; i < 260; i++) {
        const x = 30 + Math.floor(rnd() * (W - 60));
        const y = 340 + Math.floor(rnd() * 550);
        if (!this.inBounds(x, y)) continue;
        if (this.tiles[y * W + x] !== TILE.AIR) continue;
        let solidN = 0;
        if (this.solidTile(x - 1, y)) solidN++;
        if (this.solidTile(x + 1, y)) solidN++;
        if (this.solidTile(x, y - 1)) solidN++;
        if (this.solidTile(x, y + 1)) solidN++;
        if (solidN === 0) continue;
        const cluster = 1 + Math.floor(rnd() * 4);
        let cx = x, cy = y;
        for (let k = 0; k < cluster; k++) {
          if (this.inBounds(cx, cy) && this.tiles[cy * W + cx] === TILE.AIR) this.put(cx, cy, TILE.COBWEB);
          cx += Math.floor(rnd() * 3) - 1;
          cy += Math.floor(rnd() * 3) - 1;
        }
      }
      for (let i = 0; i < 120; i++) {
        const x = 50 + Math.floor(rnd() * (W - 100));
        const y = 360 + Math.floor(rnd() * 500);
        if (!this.inBounds(x, y)) continue;
        if (this.tiles[y * W + x] !== TILE.AIR) continue;
        if (!this.solidTile(x, y + 1)) continue;
        this.put(x, y, TILE.MUSHROOM);
      }
      for (let i = 0; i < 20; i++) {
        const x = 60 + Math.floor(rnd() * (W - 120));
        const y = 420 + Math.floor(rnd() * 420);
        if (!this.inBounds(x, y)) continue;
        if (this.tiles[y * W + x] !== TILE.AIR) continue;
        if (!this.solidTile(x, y + 1)) continue;
        this.put(x, y, TILE.ALCHEMY_TABLE);
      }
    }

    carveSpawn() {
      const x = this.spawn.x;
      const flat = this.surface[x];
      const hutX = x + 15;
      const x0 = x - 22, x1 = hutX + 12;
      for (let xx = x0; xx <= x1; xx++) {
        for (let y = flat - 30; y < flat + 16; y++) {
          if (!this.inBounds(xx, y)) continue;
          this.tiles[y * W + xx] = TILE.AIR;
          this.water[y * W + xx] = 0;
          this.lava[y * W + xx] = 0;
          if (y > flat - 10) this.walls[y * W + xx] = 0;
        }
        for (let y = flat; y < flat + 18; y++) {
          if (!this.inBounds(xx, y)) continue;
          const i = y * W + xx;
          const d = y - flat;
          const jitter = T.hash2i(xx, y, 31);
          let tile;
          if (d <= 3) tile = TILE.DIRT;
          else if (d <= 5 && jitter > 0.55) tile = TILE.CLAY;
          else tile = TILE.STONE;
          this.tiles[i] = tile;
          this.walls[i] = d <= 5 ? WALL.DIRT : WALL.STONE;
        }
        const edge = Math.min(xx - x0, x1 - xx);
        if (edge < 5) {
          const step = 5 - edge;
          for (let k = 1; k <= step; k++) {
            const i = (flat - k) * W + xx;
            if (this.inBounds(xx, flat - k)) this.tiles[i] = TILE.DIRT;
          }
        }
        this.surface[xx] = flat;
        this.tiles[flat * W + xx] = TILE.GRASS;
      }
      this.spawn.y = flat;
      this.buildStarterHut(hutX, flat);
      this.put(x - 5, flat - 1, TILE.WORKBENCH);
      this.put(x - 8, flat - 1, TILE.TORCH);
      this.put(x + 6, flat - 1, TILE.TORCH);
      this.npcSpawns = [{ type: 'guide', x: x + 3, y: flat - 1 }];
      this.clearSpawnArea(x0 - 8, x1 + 8, flat - 40, flat + 8);
    }

    clearSpawnArea(x0, x1, y0, y1) {
      const isLeaf = function (t) { return t === TILE.LEAVES || t === TILE.CORRUPT_LEAVES || t === TILE.JUNGLE_LEAVES; };
      for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) {
        for (let y = Math.max(0, y0); y < Math.min(H, y1); y++) {
          const t = this.tiles[y * W + x];
          if (t === TILE.TREETRUNK || isLeaf(t) || t === TILE.VINE) {
            this.tiles[y * W + x] = TILE.AIR;
          }
        }
      }
    }

    buildStarterHut(x, groundY) {
      const h = 8;
      const w = 14;
      this.carve(x, groundY - h, w, h, WALL.WOOD);
      this.box(x, groundY, w, 1, TILE.WOOD, WALL.WOOD);
      this.box(x - 1, groundY - h - 1, w + 2, 1, TILE.WOOD, WALL.WOOD);
      this.box(x - 1, groundY - h, 1, h, TILE.WOOD, WALL.WOOD);
      this.box(x + w, groundY - h, 1, h, TILE.WOOD, WALL.WOOD);
      this.carve(x, groundY - h + 1, w, h - 1, WALL.WOOD);
      this.put(x + Math.floor(w / 2), groundY - 1, TILE.DOOR);
      this.put(x + 2, groundY - 1, TILE.CHEST);
      this.addChest(x + 2, groundY - 1, [
        { id: 'coin_copper', count: 60 },
        { id: 'torch', count: 15 },
        { id: 'healing_potion', count: 2 }
      ]);
      this.put(x + w - 3, groundY - 1, TILE.TABLE);
      this.put(x + w - 5, groundY - 1, TILE.CHAIR);
      this.put(x + 4, groundY - h + 1, TILE.TORCH);
      this.put(x + w - 4, groundY - h + 1, TILE.TORCH);
      this.put(x + w - 1, groundY - h + 1, TILE.WORKBENCH);
    }

    rebuildSkyLight() {
      const sky = new Uint8Array(W * H);
      const queue = [];
      for (let x = 0; x < W; x++) {
        for (let y = 0; y < this.surface[x]; y++) {
          sky[y * W + x] = 15;
        }
      }
      for (let x = 0; x < W; x++) {
        const sm = this.surface[x];
        for (let y = Math.max(0, sm - 2); y <= sm + 1; y++) {
          if (y >= 0 && y < H) queue.push(y * W + x);
        }
      }
      let head = 0;
      while (head < queue.length) {
        const i = queue[head++];
        const x = i % W, y = (i / W) | 0;
        const cur = sky[i];
        if (cur <= 1) continue;
        const opaqueHere = T.isOpaque(this.tiles[i]);
        const belowGround = y >= this.surface[x] + 1;
        for (let d = 0; d < 4; d++) {
          const nx = x + (d === 0 ? -1 : d === 1 ? 1 : 0);
          const ny = y + (d === 2 ? -1 : d === 3 ? 1 : 0);
          if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
          const ni = ny * W + nx;
          const nt = this.tiles[ni];
          const opaque = T.isOpaque(nt);
          let decay = 0;
          if (opaque) decay = 4;
          else if (belowGround) decay = 1;
          if (opaqueHere) decay += 1;
          const nv = cur - decay;
          if (nv > sky[ni]) {
            sky[ni] = nv;
            queue.push(ni);
          }
        }
      }
      this.sky = sky;
    }

    rollLoot(kind) {
      const rnd = this.rnd;
      const items = [];
      const add = function (id, n) { items.push({ id: id, count: n }); };
      add('coin_silver', 3 + Math.floor(rnd() * 10));
      if (rnd() < 0.7) add('torch', 4 + Math.floor(rnd() * 12));
      if (kind === 'cabin') {
        if (rnd() < 0.7) add('healing_potion', 1 + Math.floor(rnd() * 3));
        if (rnd() < 0.5) add('copper_bar', 2 + Math.floor(rnd() * 4));
        if (rnd() < 0.45) add(rnd() < 0.5 ? 'iron_bar' : 'silver_bar', 1 + Math.floor(rnd() * 3));
        if (rnd() < 0.4) add('bottled_water', 1 + Math.floor(rnd() * 4));
        if (rnd() < 0.3) add('cloud_in_a_bottle', 1);
        if (rnd() < 0.25) add('lucky_horseshoe', 1);
        if (rnd() < 0.35) add('mining_potion', 1);
        if (rnd() < 0.3) add('hermes_boots', 1);
        if (rnd() < 0.25) add('band_of_regeneration', 1);
      } else if (kind === 'island') {
        add('coin_gold', 2 + Math.floor(rnd() * 5));
        add(rnd() < 0.5 ? 'starfury' : 'enchanted_sword', 1);
        add('cloud_in_a_bottle', 1);
        add('lucky_horseshoe', 1);
        add('mana_flower', 1);
        add('suspicious_eye', 1 + Math.floor(rnd() * 2));
      } else if (kind === 'dungeon') {
        add('coin_gold', 1 + Math.floor(rnd() * 4));
        add(rnd() < 0.5 ? 'water_bolt' : 'space_gun', 1);
        add(rnd() < 0.6 ? 'silver_bullet' : 'flame_arrow', 15 + Math.floor(rnd() * 20));
        add('silver_bullet', 20);
        add('greater_healing_potion', 1 + Math.floor(rnd() * 3));
        add('band_of_regeneration', 1);
        if (rnd() < 0.4) add('clothier_voodoo', 1);
      } else if (kind === 'hell') {
        add('hellstone_bar', 2 + Math.floor(rnd() * 4));
        add('lava_bucket', 1);
        add('flamelash', 1);
      }
      return items;
    }

    addChest(x, y, items) {
      const key = y * W + x;
      if (this.chestMap.has(key)) {
        const c = this.chestMap.get(key);
        for (const it of items) c.items.push(it);
        return c;
      }
      const chest = { x: x, y: y, items: items.slice(), opened: false };
      this.chestMap.set(key, chest);
      this.chests.push(chest);
      return chest;
    }
    findChest(x, y) { return this.chestMap.get(y * W + x) || null; }

    placeInitialChests() {
      const x = this.spawn.x - 3;
      const y = this.surface[x] - 1;
      this.put(x, y, TILE.CHEST);
      this.addChest(x, y, [
        { id: 'coin_copper', count: 50 },
        { id: 'torch', count: 20 },
        { id: 'healing_potion', count: 3 }
      ]);
    }

    surfaceHeightAt(x) {
      x = T.clamp(Math.floor(x), 0, W - 1);
      return this.surface[x];
    }

    firstSolidBelow(x, y) {
      for (let yy = Math.max(0, Math.floor(y)); yy < H; yy++) {
        if (T.isSolid(this.tiles[yy * W + Math.floor(x)])) return yy;
      }
      return H - 1;
    }

    update(dt) {
      this.time += dt;
      this.updateLiquids(Math.min(2200, Math.floor(dt * 30000) + 400));
      this.updateGrowth(dt);
    }

    updateLiquids(budget) {
      let n = 0;
      while (this.liquidDirty.size > 0 && n < budget) {
        const it = this.liquidDirty.values().next().value;
        this.liquidDirty.delete(it);
        const x = it % W, y = (it / W) | 0;
        this.flow(x, y, false, n);
        this.flow(x, y, true, n);
        n++;
      }
    }

    flow(x, y, isLava, n) {
      const arr = isLava ? this.lava : this.water;
      const other = isLava ? this.water : this.lava;
      const i = y * W + x;
      let level = arr[i];
      if (level <= 0) return;
      if (this.tiles[i] !== TILE.AIR) { arr[i] = 0; return; }
      if (other[i] > 0) {
        arr[i] = 0;
        this.tiles[i] = isLava ? TILE.OBSIDIAN : TILE.OBSIDIAN;
        this.water[i] = 0;
        this.lava[i] = 0;
        this.markChunk(x, y);
        this.markLiquid(x, y);
        if (this.onEvent) this.onEvent('steam', x, y);
        return;
      }
      const below = i + W;
      if (y + 1 < H) {
        if (this.tiles[below] === TILE.AIR) {
          if (other[below] > 0) {
            arr[i] = 0;
            this.tiles[below] = TILE.OBSIDIAN;
            this.water[below] = 0;
            this.lava[below] = 0;
            this.markChunk(x, y + 1);
            this.markLiquid(x, y);
            if (this.onEvent) this.onEvent('steam', x, y + 1);
            return;
          }
          const move = arr[below] + level <= 8 ? level : 8 - arr[below];
          if (move > 0) {
            arr[i] -= move;
            arr[below] += move;
            this.markLiquid(x, y);
            this.markLiquid(x, y + 1);
            if (n > 600) return;
          }
        } else if (arr[below] > 0 && arr[below] < 8 && this.tiles[below] === TILE.AIR) {
          const move = Math.min(level, 8 - arr[below]);
          arr[i] -= move;
          arr[below] += move;
          this.markLiquid(x, y);
          this.markLiquid(x, y + 1);
        }
      }
      level = arr[i];
      if (level <= 0) return;
      const spreads = [];
      if (x > 0) spreads.push(i - 1);
      if (x < W - 1) spreads.push(i + 1);
      for (const ni of spreads) {
        if (arr[i] <= 0) break;
        const nt = this.tiles[ni];
        if (nt !== TILE.AIR) continue;
        if (other[ni] > 0) {
          this.water[ni] = 0;
          this.lava[ni] = 0;
          this.tiles[ni] = TILE.OBSIDIAN;
          this.markChunk(ni % W, (ni / W) | 0);
          this.markLiquid(x, y);
          if (this.onEvent) this.onEvent('steam', ni % W, (ni / W) | 0);
          continue;
        }
        if (arr[ni] < arr[i] - 1) {
          const move = Math.min(Math.ceil((arr[i] - arr[ni]) / 2), arr[i]);
          if (move > 0) {
            arr[ni] += move;
            arr[i] -= move;
            this.markLiquid(x, y);
            this.markLiquid(ni % W, (ni / W) | 0);
          }
        }
      }
      if (arr[i] > 0) this.liquidDirty.add(i);
    }

    updateGrowth(dt) {
      if (!this.growth.length) return;
      for (let i = this.growth.length - 1; i >= 0; i--) {
        const g = this.growth[i];
        g.t += dt;
        if (g.t > 35) {
          const x = g.x, y = g.y;
          if (this.getTile(x, y) === TILE.SAPLING || this.getTile(x, y - 1) === TILE.SAPLING) {
            this.setTile(x, y, TILE.AIR);
            this.plantTree(x, y, 'forest');
          }
          this.growth.splice(i, 1);
        }
      }
    }

    plantSapling(x, y) {
      this.setTile(x, y, TILE.SAPLING);
      this.growth.push({ x: x, y: y, t: 0 });
    }
  }

  T.World = World;
  T.WORLD_W = W;
  T.WORLD_H = H;
  T.HELL_TOP = HELL_TOP;
  T.SEA_LEVEL = SEA;
})();

