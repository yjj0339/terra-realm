(function () {
  const T = window.T;
  const TS = T.TS;
  const $ = function (id) { return document.getElementById(id); };

  const RARITY = ['', 'rar-1', 'rar-2', 'rar-3', 'rar-4'];
  const TYPE_LABEL = {
    weapon: '武器', tool: '工具', armor: '护甲', accessory: '饰品', consumable: '消耗品',
    material: '材料', block: '方块', furniture: '家具', ammo: '弹药', coin: '货币',
    gem: '宝石', summon: '召唤物', trophy: '纪念章'
  };
  const SLOT_LABEL = { head: '头', body: '身', legs: '腿' };

  function iconCanvas(id, size, cls) {
    const c = document.createElement('canvas');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr;
    c.height = size * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    T.drawItemIcon(ctx, id, 0, 0, size);
    if (cls) c.className = cls;
    return c;
  }

  class UI {
    constructor(game) {
      this.game = game;
      this.chestOpen = null;
      this.openPanel = null;
      this.recipeFilter = 'all';
      this.hoverItem = null;
      this.invDirty = true;
      this.recipeTimer = 0;
      this.buildHotbar();
      this.bindPanels();
      this.lastHearts = -1;
      this.lastMana = -1;
      this.mapCanvas = $('map-canvas');
      this.boundQueries = {};
      this.minimapCanvas = null;
      this.minimapT = 0;
      this.recipeCat = 'all';
    }

    ensureMinimap() {
      if (this.minimapCanvas) return;
      const box = document.createElement('div');
      box.id = 'minimap-box';
      box.className = 'minimap-box';
      box.innerHTML = '<canvas id="minimap"></canvas><div class="minimap-label" id="minimap-label">附近</div>';
      document.getElementById('hud').appendChild(box);
      this.minimapCanvas = document.getElementById('minimap');
      this.minimapCtx = this.minimapCanvas.getContext('2d');
      this.minimapCanvas.width = 168;
      this.minimapCanvas.height = 168;
    }

    drawMinimap(dt) {
      this.ensureMinimap();
      this.minimapT += dt;
      if (this.minimapT < 0.2) return;
      this.minimapT = 0;
      const game = this.game;
      const world = game.world;
      const p = game.player;
      const ctx = this.minimapCtx;
      const S = 168;
      const scale = 0.5;
      const half = S / 2;
      const step = 2;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const bg = ctx.createLinearGradient(0, 0, 0, S);
      bg.addColorStop(0, '#2a4a6e');
      bg.addColorStop(1, '#101c2c');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, S, S);
      const cx = Math.floor(p.x / TS);
      const cy = Math.floor(p.y / TS);
      if (!this.skyMask || this.skyMask.length !== world.W * world.H) {
        this.skyMask = new Uint8Array(world.W * world.H);
        for (let x = 0; x < world.W; x++) {
          const limit = Math.min(world.H, world.surface[x] + 1);
          for (let y = 0; y < limit; y++) this.skyMask[y * world.W + x] = 1;
        }
      }
      const radius = Math.ceil(half / scale);
      for (let dy = -radius; dy <= radius; dy += step) {
        for (let dx = -radius; dx <= radius; dx += step) {
          const tx = cx + dx;
          const ty = cy + dy;
          if (tx < 0 || ty < 0 || tx >= world.W || ty >= world.H) continue;
          const i = ty * world.W + tx;
          const t = world.tiles[i];
          let col;
          if (t === 0) {
            const wl = world.water[i];
            if (wl > 0) col = '#2a5f9e';
            else if (this.skyMask[i]) continue;
            else col = '#171f2c';
          } else if (t === T.TILE.TORCH || t === T.TILE.LIFE_CRYSTAL) {
            col = '#ffcf6a';
          } else if (t === T.TILE.CHEST) {
            col = '#d8a83a';
          } else {
            col = T.tileDef(t).col;
          }
          ctx.fillStyle = col;
          const sx = half + (tx - cx) * scale;
          const sy = half + (ty - cy) * scale;
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(scale * step), Math.ceil(scale * step));
        }
      }
      for (const n of game.npcs) {
        const sx = half + (n.x / TS - cx) * scale;
        const sy = half + (n.y / TS - cy) * scale;
        if (sx < 2 || sy < 2 || sx > S - 2 || sy > S - 2) continue;
        ctx.fillStyle = '#7ef08a';
        ctx.beginPath();
        ctx.arc(sx, sy, 2.4, 0, 6.283);
        ctx.fill();
      }
      for (const e of game.enemies) {
        const sx = half + (e.cx / TS - cx) * scale;
        const sy = half + (e.cy / TS - cy) * scale;
        if (sx < 2 || sy < 2 || sx > S - 2 || sy > S - 2) continue;
        ctx.fillStyle = '#ff6a6a';
        ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
      }
      if (game.boss && !game.boss.dead) {
        const sx = half + (game.boss.x / TS - cx) * scale;
        const sy = half + (game.boss.y / TS - cy) * scale;
        ctx.fillStyle = '#ff3a4a';
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, 6.283);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(half, half, 3.2, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(half, half);
      ctx.lineTo(half + p.dir * 7, half - 1);
      ctx.stroke();
      const biome = world.biomeAt(cx, cy);
      const label = document.getElementById('minimap-label');
      if (label) label.textContent = biome + ' · ' + Math.round(world.depthAt(cy)) + 'm';
    }

    isChestOpen(x, y) {
      return !!(this.chestOpen && this.chestOpen.x === x && this.chestOpen.y === y);
    }

    buildHotbar() {
      const bar = $('hotbar');
      bar.innerHTML = '';
      this.slotEls = [];
      for (let i = 0; i < T.HOTBAR; i++) {
        const el = document.createElement('div');
        el.className = 'slot';
        el.dataset.index = String(i);
        el.innerHTML = '<span class="key">' + ((i + 1) % 10) + '</span><span class="count"></span>';
        el.addEventListener('mousedown', (e) => {
          e.preventDefault();
          if (e.button === 2) {
            const s = this.game.player.inv[i];
            if (s) this.game.useInventoryItem(i, true);
          } else {
            this.game.player.held = i;
            this.game.audio.play('menu');
          }
        });
        el.addEventListener('mouseenter', (e) => {
          const s = this.game.player.inv[i];
          if (s) this.showTooltip(s, e.clientX, e.clientY);
        });
        el.addEventListener('mousemove', (e) => {
          if (this.hoverItem) this.moveTooltip(e.clientX, e.clientY);
        });
        el.addEventListener('mouseleave', () => this.hideTooltip());
        el.addEventListener('contextmenu', (e) => e.preventDefault());
        bar.appendChild(el);
        this.slotEls.push(el);
      }
    }

    updateHotbar() {
      const p = this.game.player;
      for (let i = 0; i < T.HOTBAR; i++) {
        const el = this.slotEls[i];
        const s = p.inv[i];
        el.classList.toggle('active', p.held === i);
        const def = s ? T.itemDef(s.id) : null;
        el.className = 'slot' + (p.held === i ? ' active' : '') + (def && def.rarity ? ' rarity-' + def.rarity : '');
        const canvas = el.querySelector('canvas');
        if (s) {
          if (!canvas || canvas.dataset.item !== s.id) {
            if (canvas) canvas.remove();
            const c = iconCanvas(s.id, 38);
            c.dataset.item = s.id;
            el.appendChild(c);
          }
          el.querySelector('.count').textContent = s.count > 1 ? s.count : '';
        } else {
          if (canvas) canvas.remove();
          el.querySelector('.count').textContent = '';
        }
      }
    }

    bindPanels() {
      const self = this;
      document.querySelectorAll('[data-close]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          self.close($(btn.dataset.close).id.replace('-screen', ''));
        });
      });
      $('inv-grid-slots').addEventListener('mousedown', function (e) { self.onGridClick(e, 'inv'); });
      $('inv-hotbar-slots').addEventListener('mousedown', function (e) { self.onGridClick(e, 'inv'); });
      $('equip-grid').addEventListener('mousedown', function (e) {
        const slotEl = e.target.closest('.slot');
        if (!slotEl) return;
        const kind = slotEl.dataset.kind;
        const idx = Number(slotEl.dataset.index || 0);
        if (kind) self.game.player.unequip(kind, kind === 'accessory' ? idx : undefined);
        self.refreshInventory();
        self.game.audio.play('menu');
      });
      $('chest-grid').addEventListener('mousedown', function (e) { self.onChestClick(e, 'chest'); });
      $('chest-inv-grid').addEventListener('mousedown', function (e) { self.onChestClick(e, 'inv'); });
      $('chest-hotbar-grid').addEventListener('mousedown', function (e) { self.onChestClick(e, 'inv'); });
      $('chest-take-all').addEventListener('click', function () {
        if (!self.chestOpen) return;
        for (const it of self.chestOpen.items.slice()) {
          const left = self.game.player.give(it.id, it.count);
          it.count = left;
        }
        self.chestOpen.items = self.chestOpen.items.filter(function (i) { return i.count > 0; });
        self.refreshChest();
        self.game.audio.play('pickup');
      });
      $('recipe-list').addEventListener('click', function (e) {
        const el = e.target.closest('.recipe');
        if (!el) return;
        self.game.craft(Number(el.dataset.index));
      });
      $('recipe-list').addEventListener('mouseover', function (e) {
        const el = e.target.closest('.recipe');
        if (!el) return;
        const rec = T.RECIPES[Number(el.dataset.index)];
        if (!rec) return;
        self.showRecipeTooltip(rec, e.clientX, e.clientY);
      });
      $('recipe-list').addEventListener('mousemove', function (e) {
        if (self.hoverItem) self.moveTooltip(e.clientX, e.clientY);
      });
      $('recipe-list').addEventListener('mouseleave', function () { self.hideTooltip(); });
    }

    onGridClick(e, mode) {
      if (e.button === 2) {
        const el = e.target.closest('.slot');
        if (!el) return;
        e.preventDefault();
        const idx = Number(el.dataset.index);
        if (isNaN(idx)) return;
        this.game.useInventoryItem(idx, true);
        this.refreshInventory();
        return;
      }
      const el = e.target.closest('.slot');
      if (!el) return;
      const idx = Number(el.dataset.index);
      if (isNaN(idx)) return;
      this.game.player.held = idx % T.HOTBAR;
      if (e.shiftKey) {
        this.game.dropFromSlot(idx);
      }
      this.refreshInventory();
      this.game.audio.play('menu');
    }

    onChestClick(e, side) {
      const el = e.target.closest('.slot');
      if (!el || !this.chestOpen) return;
      e.preventDefault();
      const idx = Number(el.dataset.index);
      const p = this.game.player;
      if (side === 'chest') {
        const it = this.chestOpen.items[idx];
        if (!it) return;
        const left = p.give(it.id, it.count);
        it.count = left;
        if (left <= 0) this.chestOpen.items.splice(idx, 1);
      } else {
        const s = p.inv[idx];
        if (!s) return;
        const existing = this.chestOpen.items.find(function (c) { return c.id === s.id; });
        const max = T.itemStackMax(s.id);
        if (existing && existing.count < max) {
          const add = Math.min(max - existing.count, s.count);
          existing.count += add;
          s.count -= add;
          if (s.count <= 0) p.inv[idx] = null;
        } else if (this.chestOpen.items.length < 40) {
          this.chestOpen.items.push({ id: s.id, count: s.count });
          p.inv[idx] = null;
        }
      }
      this.refreshChest();
      this.refreshInventory();
      this.game.audio.play('menu');
    }

    showTooltip(stack, x, y) {
      const def = T.itemDef(stack.id);
      if (!def) return;
      this.hoverItem = stack;
      const tip = $('tooltip');
      const p = this.game.player;
      let html = '<div class="tt-name ' + (RARITY[def.rarity] || '') + '">' + T.escapeHTML(def.name) + '</div>';
      html += '<div class="tt-type">' + (TYPE_LABEL[def.type] || def.type) + (def.slot ? ' · 护甲 ' + (def.defense || 0) : '') + '</div>';
      if (def.dmg) html += '<div class="tt-line">伤害 <b>' + def.dmg + '</b>' + (def.melee ? '（近战）' : def.ranged ? '（远程）' : def.magic ? '（魔法）' : '') + '</div>';
      if (def.use) html += '<div class="tt-line">使用速度 ' + def.use.toFixed(2) + 's</div>';
      if (def.mana) html += '<div class="tt-line">消耗魔力 ' + def.mana + '</div>';
      if (def.heal) html += '<div class="tt-line tt-good">恢复生命 ' + def.heal + '</div>';
      if (def.mana && def.type === 'consumable') html += '<div class="tt-line tt-good">恢复魔力 ' + def.mana + '</div>';
      if (def.defense && def.slot) html += '<div class="tt-line">护甲值 ' + def.defense + '</div>';
      if (def.tool) html += '<div class="tt-line">工具：' + ({ pick: '镐', axe: '斧', hammer: '锤' }[def.tool] || def.tool) + ' · 威力 ' + def.power + '</div>';
      if (def.fx) {
        const fxs = { doubleJump: '二段跳', speed: '加速与冲刺', nofall: '免疫坠落伤害', regen: '生命恢复', mana: '魔力强化', damage: '伤害 +15%', jump: '跳跃强化' };
        html += '<div class="tt-line tt-good">' + (fxs[def.fx] || def.fx) + '</div>';
      }
      if (def.desc) html += '<div class="tt-desc">' + T.escapeHTML(def.desc) + '</div>';
      if (def.sell) html += '<div class="tt-line tt-gold">售价 ' + T.coinString(def.sell) + '</div>';
      html += '<div class="tt-line" style="opacity:.5;margin-top:4px">数量 ' + stack.count + '</div>';
      tip.innerHTML = html;
      tip.classList.add('on');
      this.moveTooltip(x, y);
    }

    showRecipeTooltip(rec, x, y) {
      const def = T.itemDef(rec.out);
      if (!def) return;
      this.hoverItem = { id: rec.out, count: rec.count };
      const p = this.game.player;
      const tip = $('tooltip');
      let html = '<div class="tt-name ' + (RARITY[def.rarity] || '') + '">' + T.escapeHTML(def.name) + (rec.count > 1 ? ' ×' + rec.count : '') + '</div>';
      html += '<div class="tt-type">' + (rec.station ? T.CRAFT_STATION_NAMES[rec.station] : '徒手制作') + '</div>';
      if (def.dmg) html += '<div class="tt-line">伤害 ' + def.dmg + '</div>';
      if (def.defense) html += '<div class="tt-line">护甲值 ' + def.defense + '</div>';
      html += '<div style="margin-top:6px"></div>';
      for (const id in rec.ing) {
        const need = rec.ing[id];
        const has = p.countOf(id);
        const ok = has >= need;
        html += '<div class="tt-line ' + (ok ? 'tt-good' : 'recipe-missing') + '">' + T.itemName(id) + ' ' + has + '/' + need + '</div>';
      }
      tip.innerHTML = html;
      tip.classList.add('on');
      this.moveTooltip(x, y);
    }

    moveTooltip(x, y) {
      const tip = $('tooltip');
      const w = tip.offsetWidth, h = tip.offsetHeight;
      let px = x + 16, py = y + 16;
      if (px + w > window.innerWidth - 12) px = x - w - 16;
      if (py + h > window.innerHeight - 12) py = window.innerHeight - h - 12;
      if (py < 12) py = 12;
      tip.style.left = px + 'px';
      tip.style.top = py + 'px';
    }

    hideTooltip() {
      this.hoverItem = null;
      $('tooltip').classList.remove('on');
    }

    open(name) {
      const el = $(name + '-screen');
      if (!el) return;
      if (name === 'chest') return;
      this.closeAll(name);
      el.classList.remove('hidden');
      this.openPanel = name;
      if (name === 'inv') this.refreshInventory();
      if (name === 'map') this.drawMap();
      this.game.onPanelChange(name);
    }

    close(name) {
      const el = $(name === 'chest' ? 'chest-screen' : name + '-screen');
      if (el) el.classList.add('hidden');
      if (this.openPanel === name) this.openPanel = null;
      if (name === 'chest') this.chestOpen = null;
      this.hideTooltip();
      this.game.onPanelChange(null);
    }

    closeAll(except) {
      const names = ['inv', 'chest', 'npc', 'map', 'help', 'pause', 'victory'];
      for (const n of names) {
        if (n === except) continue;
        const el = $(n + '-screen');
        if (el && !el.classList.contains('hidden')) el.classList.add('hidden');
      }
      if (except !== 'chest') this.chestOpen = null;
      this.hideTooltip();
    }

    toggle(name) {
      if (this.openPanel === name) this.close(name);
      else this.open(name);
    }

    openChest(x, y) {
      const chest = this.game.world.findChest(x, y);
      if (!chest) {
        this.game.world.addChest(x, y, []);
        this.chestOpen = this.game.world.findChest(x, y);
      } else {
        this.chestOpen = chest;
      }
      this.closeAll('chest');
      $('chest-screen').classList.remove('hidden');
      this.openPanel = 'chest';
      this.refreshChest();
      this.game.onPanelChange('chest');
    }

    openNpc(npc) {
      this.npc = npc;
      this.closeAll('npc');
      $('npc-screen').classList.remove('hidden');
      this.openPanel = 'npc';
      const d = npc.def;
      $('npc-name').textContent = d.name + ' · ' + d.role;
      const portrait = { guide: '🧙', merchant: '🧑‍🌾', nurse: '👩‍⚕️', demolitionist: '🧑‍🔧', dryad: '🧝‍♀️', wizard: '🧙‍♂️', armsdealer: '🧑‍✈️' };
      $('npc-portrait').textContent = portrait[npc.type] || '🧑';
      let text;
      if (npc.type === 'guide') {
        text = '「' + d.tips[Math.floor(Math.random() * d.tips.length)] + '」';
      } else if (npc.type === 'nurse') {
        text = '「需要治疗吗？花点钱，或者别站在怪物堆里。」';
      } else if (npc.type === 'merchant') {
        text = '「钱不是万能的，但它能买下我所有的货。」';
      } else if (npc.type === 'wizard') {
        text = '「以太在流淌，孩子。你只需要学会倾听。」';
      } else if (npc.type === 'dryad') {
        text = '「这片土地在流血。腐化正在蔓延。」';
      } else if (npc.type === 'armsdealer') {
        text = '「枪械解决不了所有问题，但能解决大部分。」';
      } else {
        text = '「爆破是一门艺术，注意安全距离。」';
      }
      $('npc-text').innerHTML = '<b>' + T.escapeHTML(d.name) + '：</b>' + T.escapeHTML(text);
      this.refreshNpcShop();
      this.game.audio.play('menu');
    }

    refreshNpcShop() {
      const list = $('npc-shop');
      list.innerHTML = '';
      const npc = this.npc;
      if (!npc) return;
      const self = this;
      if (npc.type === 'nurse') {
        const row = document.createElement('button');
        row.className = 'menu-btn primary';
        row.style.justifyContent = 'center';
        const cost = Math.max(200, Math.round((this.game.player.maxHp - this.game.player.hp) * 25));
        row.innerHTML = '治疗全部生命 <span class="k">' + T.coinString(cost) + '</span>';
        row.disabled = this.game.player.hp >= this.game.player.maxHp;
        row.addEventListener('click', function () {
          const p = self.game.player;
          if (p.hp >= p.maxHp) return;
          if (!p.spend(cost)) { self.game.toast('金币不够', '#ffb07a'); return; }
          p.hp = p.maxHp;
          self.game.audio.play('potion');
          self.game.toast('生命完全恢复', '#7ef08a');
          self.refreshNpcShop();
        });
        list.appendChild(row);
      }
      for (const entry of npc.def.shop) {
        const row = document.createElement('div');
        row.className = 'shop-row';
        const def = T.itemDef(entry.id);
        if (!def) continue;
        const cv = iconCanvas(entry.id, 30);
        row.appendChild(cv);
        const nameEl = document.createElement('div');
        nameEl.innerHTML = '<div class="sname ' + (RARITY[def.rarity] || '') + '">' + T.escapeHTML(def.name) + '</div><div style="font-size:10.5px;color:var(--ink-3)">' + (TYPE_LABEL[def.type] || '') + '</div>';
        row.appendChild(nameEl);
        const price = document.createElement('div');
        price.className = 'sprice';
        price.textContent = T.coinString(entry.price);
        row.appendChild(price);
        const btn = document.createElement('button');
        btn.className = 'buy-btn';
        btn.textContent = '购买';
        btn.disabled = this.game.player.coins < entry.price;
        btn.addEventListener('click', function () {
          const p = self.game.player;
          if (!p.spend(entry.price)) { self.game.toast('金币不够', '#ffb07a'); return; }
          const left = p.give(entry.id, 1);
          if (left > 0) { p.coins += entry.price; self.game.toast('背包已满', '#ffb07a'); return; }
          self.game.audio.play('coin');
          self.game.toast('购买了 ' + def.name, '#ffd870');
          self.refreshNpcShop();
        });
        row.appendChild(btn);
        list.appendChild(row);
      }
      if (!npc.def.shop.length && npc.type !== 'nurse') {
        list.innerHTML = '<div style="font-size:12px;color:var(--ink-3);text-align:center;padding:20px">这里没有出售的东西。</div>';
      }
    }

    refreshInventory() {
      const p = this.game.player;
      if (!p.maxHp) return;
      const invG = $('inv-grid-slots');
      const hotG = $('inv-hotbar-slots');
      invG.innerHTML = '';
      hotG.innerHTML = '';
      for (let i = 0; i < T.SLOT_COUNT; i++) {
        const s = p.inv[i];
        const el = document.createElement('div');
        el.className = 'slot';
        el.dataset.index = String(i);
        const def = s ? T.itemDef(s.id) : null;
        if (def && def.rarity) el.classList.add('rarity-' + def.rarity);
        if (s) {
          el.appendChild(iconCanvas(s.id, 32));
          const cnt = document.createElement('span');
          cnt.className = 'count';
          cnt.textContent = s.count > 1 ? s.count : '';
          el.appendChild(cnt);
        }
        if (i < T.HOTBAR) hotG.appendChild(el);
        else invG.appendChild(el);
      }
      const eq = $('equip-grid');
      eq.innerHTML = '';
      const armorSlots = [
        { kind: 'head', label: '头' }, { kind: 'body', label: '身' }, { kind: 'legs', label: '腿' }
      ];
      for (const as of armorSlots) {
        const el = document.createElement('div');
        el.className = 'slot' + (p.armor[as.kind] ? '' : ' empty');
        el.dataset.kind = as.kind;
        el.dataset.label = as.label;
        el.title = SLOT_LABEL[as.kind];
        if (p.armor[as.kind]) el.appendChild(iconCanvas(p.armor[as.kind], 32));
        eq.appendChild(el);
      }
      for (let i = 0; i < 5; i++) {
        const el = document.createElement('div');
        el.className = 'slot' + (p.accessories[i] ? '' : ' empty');
        el.dataset.kind = 'accessory';
        el.dataset.index = String(i);
        el.dataset.label = '饰';
        if (p.accessories[i]) el.appendChild(iconCanvas(p.accessories[i], 32));
        eq.appendChild(el);
      }
      const stats = $('char-stats');
      const nights = this.game.dayCount - 1;
      stats.innerHTML = [
        ['生命', Math.ceil(p.hp) + ' / ' + p.maxHp],
        ['魔力', Math.ceil(p.mana) + ' / ' + p.maxMana],
        ['护甲', p.defense()],
        ['金币', T.coinString(p.coins)],
        ['击败敌人', p.stats.kills],
        ['死亡次数', p.stats.deaths],
        ['挖掘方块', p.stats.blocksMined],
        ['游戏时间', T.timeString(Math.floor(p.stats.playTime / 60))],
        ['最大深度', Math.round(p.stats.maxDepth) + ' 米'],
        ['世界种子', this.game.seedText],
        ['世界大小', this.game.world.W + ' × ' + this.game.world.H],
        ['已过天数', this.game.dayCount]
      ].map(function (r) {
        return '<span>' + r[0] + '</span><b>' + r[1] + '</b>';
      }).join('');
      const stations = $('craft-stations');
      stations.innerHTML = '';
      const near = this.game.nearbyStations();
      const all = ['workbench', 'furnace', 'anvil', 'alchemy', 'hellforge', 'altar'];
      for (const s of all) {
        const chip = document.createElement('span');
        const names = { workbench: '工作台', furnace: '熔炉', anvil: '铁砧', alchemy: '炼药桌', hellforge: '地狱熔炉', altar: '恶魔祭坛' };
        chip.className = 'chip' + (near[s] ? ' avail' : '');
        chip.textContent = names[s];
        stations.appendChild(chip);
      }
      this.refreshRecipes();
    }

    refreshRecipes() {
      const p = this.game.player;
      const list = $('recipe-list');
      const has = {};
      for (const s of p.inv) if (s) has[s.id] = (has[s.id] || 0) + s.count;
      const stations = this.game.nearbyStations();
      const scrollTop = list.scrollTop;
      this.buildCraftCats();
      const cat = this.recipeCat || 'all';
      const all = [];
      for (let i = 0; i < T.RECIPES.length; i++) {
        const rec = T.RECIPES[i];
        const outDef = T.itemDef(rec.out);
        if (cat !== 'all' && (!outDef || this.recipeCategory(outDef) !== cat)) continue;
        const can = T.canCraft(rec, has, stations);
        const stationOk = !rec.station || stations[rec.station];
        if (!stationOk && !this.isPartial(rec, has, stations)) continue;
        let missing = 0;
        for (const id in rec.ing) if ((has[id] || 0) < rec.ing[id]) missing++;
        if (missing >= 3 && !can) continue;
        all.push({ rec: rec, i: i, can: can, missing: missing, stationOk: stationOk });
      }
      all.sort(function (a, b) {
        if (a.can !== b.can) return a.can ? -1 : 1;
        if (a.stationOk !== b.stationOk) return a.stationOk ? -1 : 1;
        return a.missing - b.missing;
      });
      list.innerHTML = '';
      if (!all.length) {
        list.innerHTML = '<div style="font-size:12px;color:var(--ink-3);text-align:center;padding:24px 10px;line-height:1.8">这个分类暂无可制作的物品。<br>先去砍树、挖矿，或靠近工作台。</div>';
        return;
      }
      for (const entry of all) {
        const rec = entry.rec;
        const can = entry.can;
        const el = document.createElement('div');
        el.className = 'recipe ' + (can ? 'can' : 'locked');
        el.dataset.index = String(entry.i);
        const cv = iconCanvas(rec.out, 30);
        el.appendChild(cv);
        const info = document.createElement('div');
        info.style.flex = '1';
        info.style.minWidth = '0';
        const def = T.itemDef(rec.out);
        const ingText = [];
        for (const id in rec.ing) {
          const need = rec.ing[id];
          const have = has[id] || 0;
          ingText.push('<span class="' + (have >= need ? '' : 'recipe-missing') + '">' + T.itemName(id) + ' ' + have + '/' + need + '</span>');
        }
        info.innerHTML = '<div class="rname ' + (def.rarity ? RARITY[def.rarity] : '') + '">' + T.escapeHTML(def.name) +
          (rec.count > 1 ? ' <span class="rcount">×' + rec.count + '</span>' : '') + '</div>' +
          '<div class="ring">' + ingText.join(' · ') + '</div>';
        el.appendChild(info);
        if (rec.station) {
          const st = document.createElement('span');
          st.className = 'chip' + (entry.stationOk ? ' on' : '');
          st.style.fontSize = '9.5px';
          st.style.padding = '2px 7px';
          st.textContent = T.CRAFT_STATION_NAMES[rec.station];
          el.appendChild(st);
        }
        list.appendChild(el);
      }
      list.scrollTop = scrollTop;
    }

    recipeCategory(def) {
      if (def.slot) return 'armor';
      if (def.type === 'accessory') return 'accessory';
      if (def.type === 'summon') return 'summon';
      if (def.type === 'consumable') return 'potion';
      if (def.tool) return 'tool';
      if (def.place || def.type === 'block' || def.type === 'furniture') return 'build';
      if (def.melee || def.ranged || def.magic) return 'weapon';
      if (def.type === 'ammo') return 'ammo';
      return 'material';
    }

    buildCraftCats() {
      const el = $('craft-cats');
      if (!el) return;
      const cats = [
        ['all', '全部'], ['weapon', '武器'], ['armor', '护甲'], ['accessory', '饰品'],
        ['tool', '工具'], ['build', '建造'], ['potion', '药水'], ['summon', '召唤'],
        ['ammo', '弹药'], ['material', '材料']
      ];
      const self = this;
      const cur = this.recipeCat || 'all';
      if (el.dataset.built === '1' && el.dataset.cur === cur) return;
      el.dataset.built = '1';
      el.dataset.cur = cur;
      el.innerHTML = '';
      for (const c of cats) {
        const b = document.createElement('button');
        b.className = 'craft-cat' + (c[0] === cur ? ' on' : '');
        b.textContent = c[1];
        b.dataset.cat = c[0];
        b.addEventListener('click', function () {
          self.recipeCat = c[0];
          self.refreshRecipes();
        });
        el.appendChild(b);
      }
    }

    isPartial(rec, has, stations) {
      if (rec.station && !stations[rec.station]) return false;
      let missing = 0;
      for (const id in rec.ing) {
        if ((has[id] || 0) < rec.ing[id]) missing++;
      }
      return missing <= 2 && missing > 0;
    }

    refreshChest() {
      const chest = this.chestOpen;
      if (!chest) return;
      const grid = $('chest-grid');
      grid.innerHTML = '';
      for (let i = 0; i < 40; i++) {
        const it = chest.items[i];
        const el = document.createElement('div');
        el.className = 'slot';
        el.dataset.index = String(i);
        if (it) {
          el.appendChild(iconCanvas(it.id, 32));
          if (it.count > 1) {
            const c = document.createElement('span');
            c.className = 'count';
            c.textContent = it.count;
            el.appendChild(c);
          }
          el.addEventListener('mouseenter', (e) => this.showTooltip(it, e.clientX, e.clientY));
          el.addEventListener('mousemove', (e) => { if (this.hoverItem) this.moveTooltip(e.clientX, e.clientY); });
          el.addEventListener('mouseleave', () => this.hideTooltip());
        }
        grid.appendChild(el);
      }
      const ig = $('chest-inv-grid');
      const hg = $('chest-hotbar-grid');
      ig.innerHTML = ''; hg.innerHTML = '';
      const p = this.game.player;
      for (let i = 0; i < T.SLOT_COUNT; i++) {
        const s = p.inv[i];
        const el = document.createElement('div');
        el.className = 'slot';
        el.dataset.index = String(i);
        if (s) {
          el.appendChild(iconCanvas(s.id, 30));
          if (s.count > 1) {
            const c = document.createElement('span');
            c.className = 'count';
            c.textContent = s.count;
            el.appendChild(c);
          }
        }
        if (i < T.HOTBAR) hg.appendChild(el);
        else ig.appendChild(el);
      }
    }

    drawMap() {
      const game = this.game;
      const world = game.world;
      const cv = this.mapCanvas;
      const box = cv.parentElement.getBoundingClientRect();
      const availW = Math.max(200, box.width - 36);
      const availH = Math.max(200, box.height - 36);
      const scale = Math.min(availW / world.W, availH / world.H);
      const w = Math.max(120, Math.floor(world.W * scale));
      const h = Math.max(120, Math.floor(world.H * scale));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = w + 'px';
      cv.style.height = h + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const mw = game.mapW, mh = game.mapH;
      const img = ctx.createImageData(mw, mh);
      const data = img.data;
      const mapColors = game.mapColors;
      const discovered = game.mapSeen;
      let seen = 0, total = mw * mh;
      for (let i = 0; i < total; i++) {
        const p = i * 4;
        if (!discovered[i]) {
          data[p] = 14; data[p + 1] = 18; data[p + 2] = 27; data[p + 3] = 255;
          continue;
        }
        seen++;
        const c = ((mapColors[i * 3] << 16) | (mapColors[i * 3 + 1] << 8) | mapColors[i * 3 + 2]);
        data[p] = (c >> 16) & 255;
        data[p + 1] = (c >> 8) & 255;
        data[p + 2] = c & 255;
        data[p + 3] = 255;
      }
      const off = document.createElement('canvas');
      off.width = mw;
      off.height = mh;
      off.getContext('2d').putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      const p = game.player;
      const px = p.x / T.TS / world.W * w;
      const py = p.y / T.TS / world.H * h;
      const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.2;
      ctx.fillStyle = 'rgba(255,80,80,0.22)';
      ctx.beginPath();
      ctx.arc(px, py, 11 * pulse, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#ff4a4a';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      const pct = total ? Math.round(seen / total * 100) : 0;
      $('map-sub').textContent = '探索进度 ' + pct + '% · 世界 ' + world.W + ' × ' + world.H;
      const spawn = world.spawn;
      ctx.fillStyle = 'rgba(120,220,150,0.9)';
      ctx.beginPath();
      ctx.arc(spawn.x / world.W * w, spawn.y / world.H * h, 3, 0, 6.283);
      ctx.fill();
      if (game.boss && !game.boss.dead) {
        ctx.fillStyle = 'rgba(255,90,90,0.95)';
        ctx.beginPath();
        ctx.arc(game.boss.x / T.TS / world.W * w, game.boss.y / T.TS / world.H * h, 4, 0, 6.283);
        ctx.fill();
      }
    }

    update(dt) {
      const game = this.game;
      const p = game.player;
      this.updateHotbar();
      const hearts = $('hearts');
      const hpUnits = Math.ceil(p.maxHp / 20);
      if (this.lastHearts !== hpUnits + ':' + Math.ceil(p.hp)) {
        this.lastHearts = hpUnits + ':' + Math.ceil(p.hp);
        let html = '';
        for (let i = 0; i < hpUnits; i++) {
          const filled = p.hp > i * 20;
          const partial = T.clamp((p.hp - i * 20) / 20, 0, 1);
          html += '<div class="heart" title="' + Math.ceil(p.hp) + '/' + p.maxHp + '">' + heartSVG(partial) + '</div>';
        }
        hearts.innerHTML = html;
        $('hp-num').textContent = Math.ceil(p.hp) + ' / ' + p.maxHp;
      }
      const manaRow = $('mana-row');
      const manaUnits = Math.ceil(p.maxMana / 20);
      if (this.lastMana !== manaUnits + ':' + Math.ceil(p.mana)) {
        this.lastMana = manaUnits + ':' + Math.ceil(p.mana);
        let html = '';
        for (let i = 0; i < manaUnits; i++) {
          const frac = T.clamp((p.mana - i * 20) / 20, 0, 1);
          html += '<div class="star">' + starSVG(frac) + '</div>';
        }
        manaRow.innerHTML = html;
        $('mana-num').textContent = Math.ceil(p.mana) + ' / ' + p.maxMana;
      }
      const buffs = $('buffs');
      const buffKey = p.buffs.map(function (b) { return b.id + Math.ceil(b.time); }).join(',');
      if (this.lastBuffKey !== buffKey) {
        this.lastBuffKey = buffKey;
        buffs.innerHTML = p.buffs.map(function (b) {
          const icons = {
            ironskin: { i: '🛡', c: '#a08a6a', n: '铁皮' }, swiftness: { i: '💨', c: '#8ae0a0', n: '迅捷' },
            nightowl: { i: '🌙', c: '#8a8ad0', n: '夜猫子' }, regeneration: { i: '💗', c: '#d06a8a', n: '再生' },
            obsidian: { i: '🪨', c: '#6a5a7a', n: '黑曜石皮肤' }, mining: { i: '⛏', c: '#c8b070', n: '挖矿' },
            mana: { i: '✨', c: '#6a8ae0', n: '魔力' }, regen: { i: '✚', c: '#d06a8a', n: '恢复' }
          };
          const ic = icons[b.id] || { i: '✦', c: '#888', n: b.id };
          return '<div class="buff"><span class="buff-icon" style="background:' + ic.c + '22;color:' + ic.c + '">' + ic.i + '</span>' +
            ic.n + ' <span style="color:var(--ink-3);font-variant-numeric:tabular-nums">' + Math.ceil(b.time) + 's</span></div>';
        }).join('');
      }
      const clock = $('clock');
      const isNight = game.isNight();
      clock.classList.toggle('night', isNight);
      $('clock-icon').textContent = isNight ? '☾' : '☀';
      $('clock-main').textContent = T.timeString(game.timeMinutes);
      const biome = game.world.biomeAt(Math.floor(p.x / T.TS), Math.floor(p.y / T.TS));
      const ev = game.activeEvent;
      $('clock-sub').textContent = biome + ' · ' + (ev ? ev.name : isNight ? '夜晚' : '白天');
      const evLine = $('event-line');
      if (ev) {
        evLine.classList.remove('hidden');
        $('event-name').textContent = ev.name;
        $('event-timer').textContent = T.timeString(ev.remaining / 60) + ' 剩余';
      } else {
        evLine.classList.add('hidden');
      }
      const boss = game.boss;
      const bar = $('bossbar');
      if (boss && boss.isBoss && !boss.dead) {
        bar.classList.remove('hidden');
        $('boss-name').textContent = boss.name;
        $('boss-fill').style.width = (boss.hp / boss.maxHp * 100).toFixed(1) + '%';
      } else {
        bar.classList.add('hidden');
      }
      const hint = $('hint-bar');
      let hintText;
      if (this.hintText && performance.now() - this.hintAt < 5200) {
        hintText = this.hintText;
      } else if (game.hint) {
        hintText = game.hint;
      } else {
        hintText = game.defaultHint();
      }
      const held = p.heldItem();
      if (held && held.ammo) {
        let ammo = 0, ammoName = '';
        for (const s of p.inv) {
          if (!s) continue;
          const ad = T.itemDef(s.id);
          if (ad && ad.ammo === held.ammo) { ammo += s.count; ammoName = ad.name; }
        }
        hintText = (ammo > 0 ? '弹药 ' + ammoName + ' × ' + ammo : '没有合适的弹药') + ' · ' + hintText;
      } else if (held && held.magic) {
        hintText = '魔力 ' + Math.ceil(p.mana) + ' / ' + p.maxMana + ' · ' + hintText;
      }
      hint.textContent = hintText;
      this.drawMinimap(dt);
      this.updateLocator(dt);
      if (this.openPanel === 'inv' && p.invDirty) this.refreshInventory();
      if (this.openPanel === 'npc') {
        this.shopTimer = (this.shopTimer || 0) + dt;
        if (this.shopTimer > 0.6) {
          this.shopTimer = 0;
          this.refreshNpcShop();
        }
      }
    }

    setHint(text) {
      this.hintText = text;
      this.hintAt = performance.now();
    }

    updateLocator(dt) {
      this.locatorT = (this.locatorT || 0) + dt;
      if (this.locatorT < 0.25) return;
      this.locatorT = 0;
      const game = this.game;
      const p = game.player;
      const r = game.renderer;
      let el = document.getElementById('npc-locator');
      if (!el) {
        el = document.createElement('div');
        el.id = 'npc-locator';
        el.className = 'npc-locator';
        document.getElementById('hud').appendChild(el);
      }
      const targets = [];
      for (const n of game.npcs) {
        const sx = (n.x - game.cam.x) * r.zoom + r.vw / 2;
        const sy = (n.y - n.h - game.cam.y) * r.zoom + r.vh / 2;
        const off = sx < 30 || sx > r.vw - 30 || sy < 60 || sy > r.vh - 150;
        if (off) targets.push({ x: n.x, y: n.y - n.h, name: n.name });
      }
      if (!targets.length) {
        el.style.display = 'none';
        return;
      }
      el.style.display = 'flex';
      el.innerHTML = targets.slice(0, 3).map(function (t) {
        const dx = t.x - p.x;
        const dy = t.y - p.y;
        const dist = Math.round(Math.hypot(dx, dy) / T.TS);
        const arrow = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? '→' : '←') : (dy > 0 ? '↓' : '↑');
        return '<span class="npc-chip">' + arrow + ' ' + T.escapeHTML(t.name) + ' <i>' + dist + 'm</i></span>';
      }).join('');
    }

    banner(line1, line2, duration) {
      const el = document.createElement('div');
      el.className = 'event-banner';
      el.innerHTML = '<div class="line1">' + T.escapeHTML(line1) + '</div><div class="line2">' + T.escapeHTML(line2 || '') + '</div>';
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, duration || 3200);
    }

    toast(text, color) {
      const box = $('toasts');
      const el = document.createElement('div');
      el.className = 'toast';
      if (color) el.style.color = color;
      el.textContent = text;
      box.appendChild(el);
      while (box.children.length > 4) box.firstChild.remove();
      setTimeout(function () {
        el.classList.add('out');
        setTimeout(function () { el.remove(); }, 320);
      }, 2400);
    }
  }

  function heartSVG(frac) {
    const id = 'hg' + Math.random().toString(36).slice(2, 8);
    const pct = Math.round(frac * 100);
    return '<svg viewBox="0 0 24 22">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="' + pct + '%" stop-color="#e0484f"/><stop offset="' + pct + '%" stop-color="rgba(20,22,30,0.16)"/>' +
      '</linearGradient></defs>' +
      '<path d="M12 21S2 14.5 2 8.2C2 4.6 4.8 2 8 2c1.7 0 3.2.8 4 2 .8-1.2 2.3-2 4-2 3.2 0 6 2.6 6 6.2C22 14.5 12 21 12 21z" fill="url(#' + id + ')" stroke="rgba(120,20,26,0.55)" stroke-width="1.1"/>' +
      '<path d="M6.5 5.4c1.2-.8 2.4-.6 3.2.2" stroke="rgba(255,255,255,0.65)" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '</svg>';
  }

  function starSVG(frac) {
    const id = 'sg' + Math.random().toString(36).slice(2, 8);
    const pct = Math.round(frac * 100);
    return '<svg viewBox="0 0 24 24">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="' + pct + '%" stop-color="#4a7ad8"/><stop offset="' + pct + '%" stop-color="rgba(20,22,30,0.16)"/>' +
      '</linearGradient></defs>' +
      '<path d="M12 1.6l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L1.9 8.9l7.2-.7z" fill="url(#' + id + ')" stroke="rgba(40,60,120,0.4)" stroke-width="1"/>' +
      '</svg>';
  }

  T.UI = UI;
})();
