(function () {
  const T = window.T;
  const TS = T.TS;
  const TILE = T.TILE;

  const PHYS = {
    gravity: 1250,
    fallGravity: 1850,
    maxFall: 980,
    jumpV: 360,
    jumpCut: 0.42,
    coyote: 0.10,
    buffer: 0.13,
    accel: 1500,
    airAccel: 900,
    friction: 1800,
    maxSpeed: 168,
    climbSpeed: 92,
    reach: 5.6
  };

  const SLOT_COUNT = 50;
  const HOTBAR = 10;

  class Player {
    constructor(game) {
      this.game = game;
      this.w = 18;
      this.h = 40;
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.dir = 1;
      this.grounded = false;
      this.onPlatform = false;
      this.inWater = false;
      this.inLava = false;
      this.coyote = 0;
      this.jumpBuf = 0;
      this.jumping = false;
      this.climbing = false;
      this.walkT = 0;
      this.animT = 0;
      this.swingT = 0;
      this.swingDir = 1;
      this.useCd = 0;
      this.iframe = 0;
      this.dead = false;
      this.deathT = 0;
      this.respawnT = 0;
      this.hp = 100;
      this.maxHp = 100;
      this.mana = 20;
      this.maxMana = 20;
      this.manaRegenDelay = 0;
      this.coins = 0;
      this.breath = 200;
      this.breathMax = 200;
      this.fallStart = 0;
      this.tip = 0;
      this.mining = null;
      this.miningProgress = 0;
      this.miningTile = null;
      this.placeCd = 0;
      this.interactCd = 0;
      this.attackT = 0;
      this.attackHit = null;
      this.held = 0;
      this.lastHeld = 0;
      this.inv = new Array(SLOT_COUNT).fill(null);
      this.armor = { head: null, body: null, legs: null };
      this.accessories = new Array(5).fill(null);
      this.buffs = [];
      this.stats = {
        kills: 0, deaths: 0, bosses: {}, blocksMined: 0, blocksPlaced: 0,
        crafted: 0, distance: 0, playTime: 0, maxDepth: 0
      };
      this.recipesKnown = true;
      this.jumpCount = 0;
      this.maxJumps = 1;
      this.hurtFlash = 0;
      this.dropThrough = 0;
      this.wasGrounded = false;
      this.landVy = 0;
      this.pickupDelay = 0;
      this.facingLock = 0;
      this.torchHeld = false;
      this.autoUse = false;
      this.doubleJumpUsed = false;
      this.dashT = 0;
      this.dashCd = 0;
      this.rocketBoots = false;
      this.hook = null;
      this.hookCd = 0;
      this.wingT = 0;
      this.wingMax = 1.8;
      this.gliding = false;
    }

    resetForNewWorld(spawn) {
      this.inv = new Array(SLOT_COUNT).fill(null);
      this.armor = { head: null, body: null, legs: null };
      this.accessories = new Array(5).fill(null);
      this.buffs = [];
      this.coins = 0;
      this.give('copper_shortsword', 1);
      this.give('copper_pickaxe', 1);
      this.give('copper_axe', 1);
      this.give('torch', 20);
      this.give('healing_potion', 3);
      this.held = 0;
      this.placeAtSpawn(spawn);
    }

    placeAtSpawn(spawn) {
      const world = this.game.world;
      this.x = spawn.x * TS + TS / 2;
      this.y = spawn.y * TS;
      this.vx = 0;
      this.vy = 0;
      this.hp = this.maxHp;
      this.mana = this.maxMana;
      this.dead = false;
      this.deathT = 0;
      this.iframe = 1.2;
      this.fallStart = this.y;
      this.inv.forEach((s) => { if (s && s.id === 'coin') s.count = s.count; });
    }

    get ax() { return this.x - this.w / 2; }
    get ay() { return this.y - this.h; }
    get cx() { return this.x; }
    get cy() { return this.y - this.h / 2; }
    get feetY() { return this.y; }

    get inLavaHeld() {
      const world = this.game.world;
      const tx = Math.floor(this.x / TS);
      const ty = Math.floor((this.y - 4) / TS);
      return world.lavaAt(tx, ty) > 0;
    }

    rect() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }

    center() { return { x: this.x, y: this.y - this.h / 2 }; }

    give(id, count) {
      count = count || 1;
      if (id === 'coin_copper') { this.coins += count; return 0; }
      if (id === 'coin_silver') { this.coins += count * 100; return 0; }
      if (id === 'coin_gold') { this.coins += count * 10000; return 0; }
      const def = T.itemDef(id);
      if (!def) return count;
      const max = def.stack || 1;
      for (let i = 0; i < this.inv.length && count > 0; i++) {
        const s = this.inv[i];
        if (s && s.id === id && s.count < max) {
          const add = Math.min(max - s.count, count);
          s.count += add; count -= add;
        }
      }
      for (let i = 0; i < this.inv.length && count > 0; i++) {
        if (!this.inv[i]) {
          const add = Math.min(max, count);
          this.inv[i] = { id: id, count: add };
          count -= add;
        }
      }
      return count;
    }

    countOf(id) {
      let n = 0;
      for (const s of this.inv) if (s && s.id === id) n += s.count;
      return n;
    }

    take(id, count) {
      let need = count;
      for (let i = this.inv.length - 1; i >= 0 && need > 0; i--) {
        const s = this.inv[i];
        if (!s || s.id !== id) continue;
        const take = Math.min(s.count, need);
        s.count -= take;
        need -= take;
        if (s.count <= 0) this.inv[i] = null;
      }
      return count - need;
    }

    canAfford(copper) { return this.coins >= copper; }
    spend(copper) { if (this.coins < copper) return false; this.coins -= copper; return true; }

    heldItem() {
      const s = this.inv[this.held];
      return s ? T.itemDef(s.id) : null;
    }
    heldStack() { return this.inv[this.held] || null; }

    equip(itemId) {
      const def = T.itemDef(itemId);
      if (!def) return false;
      if (def.slot) {
        const cur = this.armor[def.slot];
        const src = this.removeOne(itemId);
        if (!src) return false;
        this.armor[def.slot] = itemId;
        if (cur) this.give(cur, 1);
        return true;
      }
      if (def.type === 'accessory') {
        const idx = this.accessories.indexOf(null);
        if (idx < 0) return false;
        const src = this.removeOne(itemId);
        if (!src) return false;
        this.accessories[idx] = itemId;
        return true;
      }
      return false;
    }

    unequip(slot, index) {
      let id = null;
      if (slot === 'head' || slot === 'body' || slot === 'legs') {
        id = this.armor[slot];
        this.armor[slot] = null;
      } else {
        id = this.accessories[index];
        this.accessories[index] = null;
      }
      if (id) this.give(id, 1);
    }

    removeOne(id) {
      for (let i = 0; i < this.inv.length; i++) {
        const s = this.inv[i];
        if (s && s.id === id) {
          s.count--;
          if (s.count <= 0) this.inv[i] = null;
          return true;
        }
      }
      return false;
    }

    defense() {
      let d = 0;
      for (const k in this.armor) {
        const id = this.armor[k];
        if (id) d += T.itemDef(id).defense || 0;
      }
      if (this.hasAccessory('defense')) d += 3;
      for (const id of this.accessories) {
        if (id === 'warrior_emblem') d += 0;
      }
      if (this.hasBuff('ironskin')) d += 8;
      return d;
    }

    hasAccessory(fx) {
      for (const id of this.accessories) {
        if (!id) continue;
        const def = T.itemDef(id);
        if (def && def.fx === fx) return true;
      }
      return false;
    }

    hasWings() {
      return this.hasAccessory('wings');
    }

    hookItem() {
      for (const s of this.inv) {
        if (!s) continue;
        const d = T.itemDef(s.id);
        if (d && d.hook) return s;
      }
      return null;
    }

    fireHook(aimX, aimY) {
      if (this.hookCd > 0) return;
      const stack = this.hookItem();
      if (!stack) {
        this.game.toast('需要装备抓钩', '#ffb07a');
        return;
      }
      const def = T.itemDef(stack.id);
      const cx = this.x, cy = this.y - this.h * 0.55;
      const dx = aimX - cx, dy = aimY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = (def.reach || 20) * TS;
      if (dist > reach) {
        this.game.toast('太远了', '#ffb07a');
        return;
      }
      this.hook = {
        x: cx, y: cy, vx: (dx / dist) * 1500, vy: (dy / dist) * 1500,
        state: 'flying', len: 0, max: reach, anchor: null, color: def.color
      };
      this.hookCd = 0.2;
      this.game.audio.play('shoot');
    }

    releaseHook() {
      if (!this.hook) return;
      this.hook = null;
      this.hookCd = 0.12;
    }

    updateHook(dt) {
      const game = this.game;
      if (this.hookCd > 0) this.hookCd -= dt;
      if (!this.hook) return;
      const h = this.hook;
      if (h.state === 'flying') {
        for (let i = 0; i < 4; i++) {
          h.x += h.vx * dt / 4;
          h.y += h.vy * dt / 4;
          h.len = Math.hypot(h.x - this.x, h.y - (this.y - this.h * 0.55));
          const tx = Math.floor(h.x / TS), ty = Math.floor(h.y / TS);
          const anchorTile = game.world.getTile(tx, ty);
          if (T.isSolid(anchorTile) || T.isTree(anchorTile)) {
            h.state = 'hooked';
            h.anchor = { x: tx * TS + TS / 2, y: ty * TS + TS / 2 };
            h.x = h.anchor.x;
            h.y = h.anchor.y;
            game.audio.play('land');
            game.particles.burst(h.x, h.y, 10, { color: ['#ffe0a0', '#ffffff'], speed: 80, life: 0.4, gravity: 0 });
            break;
          }
          if (h.len > h.max) { this.hook = null; return; }
        }
      } else if (h.state === 'hooked') {
        const ax = h.anchor.x, ay = h.anchor.y;
        const dx = ax - this.x, dy = ay - (this.y - this.h * 0.3);
        const dist = Math.hypot(dx, dy);
        if (dist > 22) {
          const pull = 1700 * dt;
          this.vx += (dx / dist) * pull * 0.85;
          this.vy += (dy / dist) * pull;
          this.vx = T.clamp(this.vx, -680, 680);
          this.vy = T.clamp(this.vy, -680, 680);
          this.hookPull = true;
        } else {
          this.vx *= 0.82;
          this.vy *= 0.82;
          this.hookPull = false;
        }
        if (dist > h.max * 1.35) this.hook = null;
      }
      if (this.hook && this.hookPull) {
        if (Math.random() < dt * 18) {
          game.particles.spawn({
            x: this.x + (Math.random() - 0.5) * 10, y: this.y - this.h * 0.5 + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40,
            life: 0, max: 0.3, size: 1.8, color: 'rgba(255,230,180,0.8)', gravity: 0
          });
        }
      }
    }

    drawHook(ctx, cam, zoom) {
      if (!this.hook) return;
      const h = this.hook;
      const r = this.game.renderer;
      const a = r.worldToScreen(cam, this.x, this.y - this.h * 0.5);
      const b = r.worldToScreen(cam, h.x, h.y);
      ctx.save();
      ctx.strokeStyle = this.hook.color || '#c0a080';
      ctx.lineWidth = Math.max(1.4, 1.8 * zoom);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      const mx = (a.x + b.x) / 2 + Math.sin(performance.now() * 0.01) * 2;
      const my = (a.y + b.y) / 2;
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.stroke();
      ctx.fillStyle = this.hook.color || '#c0a080';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3.4 * zoom, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(b.x - 1, b.y - 1, 1.4 * zoom, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }

    damageBonus() {
      let m = 1;
      if (this.hasAccessory('damage')) m += 0.15;
      return m;
    }

    speedBonus() {
      let m = 1;
      if (this.hasAccessory('speed')) m += 0.28;
      if (this.hasBuff('swiftness')) m += 0.25;
      return m;
    }

    hasBuff(id) {
      for (const b of this.buffs) if (b.id === id && b.time > 0) return true;
      return false;
    }

    addBuff(id, dur) {
      const existing = this.buffs.find(function (b) { return b.id === id; });
      if (existing) existing.time = Math.max(existing.time, dur);
      else this.buffs.push({ id: id, time: dur, max: dur });
      if (id === 'mana' || id === 'manaflower') this.maxMana = Math.max(this.maxMana, 20);
    }

    updateBuffs(dt) {
      for (let i = this.buffs.length - 1; i >= 0; i--) {
        this.buffs[i].time -= dt;
        if (this.buffs[i].time <= 0) this.buffs.splice(i, 1);
      }
      if (this.hasBuff('regen') || this.hasAccessory('regen')) {
        this.regenT = (this.regenT || 0) + dt;
        if (this.regenT > 1.1) {
          this.regenT = 0;
          this.heal(this.hasBuff('regeneration') ? 2 : 1);
        }
      }
    }

    heal(n) {
      if (this.dead) return;
      this.hp = Math.min(this.maxHp, this.hp + n);
      if (n >= 5) this.game.particles.text(this.x, this.y - this.h - 8, '+' + Math.round(n), '#7ef08a');
      this.game.emit('heal', this.x, this.y - this.h / 2, n);
    }

    manaHeal(n) {
      this.mana = Math.min(this.maxMana, this.mana + n);
    }

    hurt(dmg, sourceX, opts) {
      if (this.dead || this.iframe > 0 || this.game.godmode) return;
      opts = opts || {};
      const def = this.defense();
      let final = Math.max(1, dmg - def * 0.5);
      if ((this.hasBuff('obsidian') || this.hasAccessory('lava')) && opts.lava) return;
      final = Math.round(final);
      this.hp -= final;
      this.iframe = opts.iframe || 0.62;
      this.hurtFlash = 1;
      this.manaRegenDelay = 0.8;
      const dir = sourceX === undefined ? -this.dir : T.sign(this.x - sourceX);
      if (!opts.noKnock) {
        this.vx = dir * (opts.knock || 190);
        this.vy = Math.min(this.vy, -120);
      }
      this.game.particles.text(this.x, this.y - this.h - 4, '-' + final, '#ff7a7a');
      this.game.particles.burst(this.x, this.y - this.h / 2, 10, { color: ['#c0243a', '#ff5060'], speed: 90, life: 0.5, gravity: 300 });
      this.game.audio.play('hurt');
      this.game.shake(6, 0.2);
      if (this.hp <= 0) this.die();
    }

    die() {
      if (this.dead) return;
      this.hp = 0;
      this.dead = true;
      this.deathT = 0;
      this.stats.deaths++;
      const game = this.game;
      const lost = Math.floor(this.coins * 0.5);
      if (lost > 0) {
        this.coins -= lost;
        let left = lost;
        const gold = Math.floor(left / 10000);
        left -= gold * 10000;
        const silver = Math.floor(left / 100);
        left -= silver * 100;
        if (gold > 0) game.dropItem(this.x, this.y - 20, 'coin_gold', gold);
        if (silver > 0) game.dropItem(this.x, this.y - 20, 'coin_silver', silver);
        if (left > 0) game.dropItem(this.x, this.y - 20, 'coin_copper', left);
        game.ui.toast('死亡掉落 ' + T.coinString(lost) + ' 在你的尸体旁', '#ffb07a');
      }
      this.audio_death = true;
      game.audio.play('death');
      game.particles.burst(this.x, this.y - this.h / 2, 30, { color: ['#a02030', '#ff6070', '#6a1020'], speed: 160, life: 0.9, gravity: 280 });
      if (this.hook) this.hook = null;
      game.onPlayerDeath();
    }

    respawn() {
      const sp = this.game.world.spawn;
      this.placeAtSpawn(sp);
      this.hp = this.maxHp;
      this.mana = this.maxMana;
      this.buffs = [];
      this.dead = false;
      this.deathT = 0;
    }

    update(dt, input) {
      const game = this.game;
      const world = game.world;
      this.animT += dt;
      if (this.dead) {
        this.deathT += dt;
        if (this.deathT > 3.2) this.respawn();
        return;
      }
      this.stats.playTime += dt;
      if (this.iframe > 0) this.iframe -= dt;
      if (this.useCd > 0) this.useCd -= dt;
      if (this.placeCd > 0) this.placeCd -= dt;
      if (this.interactCd > 0) this.interactCd -= dt;
      if (this.hurtFlash > 0) this.hurtFlash -= dt * 2;
      if (this.swingT > 0) this.swingT -= dt;
      if (this.attackT > 0) this.attackT -= dt;
      if (this.dashCd > 0) this.dashCd -= dt;
      this.updateBuffs(dt);
      this.updateEnvironment(dt);
      this.handleInput(dt, input);
      this.updateHook(dt);
      this.physics(dt);
      this.manaRegenDelay -= dt;
      if (this.manaRegenDelay <= 0) {
        const rate = (this.hasAccessory('mana') ? 7 : 4.5) * (this.hasBuff('mana') ? 2 : 1);
        this.mana = Math.min(this.maxMana, this.mana + rate * dt);
      }
      this.stats.maxDepth = Math.max(this.stats.maxDepth, world.depthAt(this.y / TS));
      this.pickupItems(dt);
      this.autoBuffCheck();
    }

    autoBuffCheck() {
      const game = this.game;
      if (this.hp < this.maxHp * 0.35 && !this.autoHealCd) {
        this.autoHealCd = 0;
      }
    }

    updateEnvironment(dt) {
      const world = this.game.world;
      const tx = Math.floor(this.x / TS);
      const ty = Math.floor((this.y - 6) / TS);
      const t = world.getTile(tx, ty);
      this.inWater = world.waterAt(tx, ty) > 0 || world.waterAt(tx, Math.floor((this.y - this.h * 0.75) / TS)) > 0;
      this.inLava = world.lavaAt(tx, ty) > 0 || world.lavaAt(tx, Math.floor((this.y - this.h * 0.75) / TS)) > 0;
      if (this.inLava && this.iframe <= 0) {
        this.hurt(38, undefined, { iframe: 0.8, knock: 60, lava: true });
        this.game.particles.burst(this.x, this.y - 8, 12, { color: ['#ffb03a', '#ff6a1a'], speed: 120, life: 0.5, gravity: -60, glow: true });
      }
      if (this.inWater) {
        if (!this.wasInWater) this.game.audio.play('splash');
        if (this.vy > 0) this.vy = Math.min(this.vy, 150);
        if (this.vy < 0) this.vy = Math.max(this.vy, -180);
        this.breath -= dt * 9;
        if (this.breath <= 0) {
          this.breath = 0;
          if (this.iframe <= 0) this.hurt(14, undefined, { iframe: 1, knock: 0 });
        }
        if (Math.random() < dt * 12) {
          this.game.particles.spawn({
            x: this.x + (Math.random() - 0.5) * 14, y: this.y - 20 - Math.random() * 16,
            vx: (Math.random() - 0.5) * 10, vy: -30 - Math.random() * 20, life: 0, max: 0.8,
            size: 1.6, color: 'rgba(200,235,255,0.7)', gravity: -20, drag: 1, kind: 'dot'
          });
        }
      } else if (this.breath < this.breathMax) {
        this.breath = Math.min(this.breathMax, this.breath + dt * 60);
      }
      this.wasInWater = this.inWater;
    }

    handleInput(dt, input) {
      const game = this.game;
      const world = game.world;
      const held = this.heldItem();

      if (input.hotbar >= 0 && input.hotbar < HOTBAR) {
        if (this.held !== input.hotbar) {
          this.held = input.hotbar;
          this.miningProgress = 0;
          this.miningTile = null;
          game.audio.play('menu');
        }
      }
      if (input.wheel) {
        let idx = this.held + input.wheel;
        idx = T.mod(idx, HOTBAR);
        if (this.inv[idx]) this.held = idx;
        else {
          for (let k = 1; k <= HOTBAR; k++) {
            const j = T.mod(this.held + input.wheel * k, HOTBAR);
            if (this.inv[j]) { this.held = j; break; }
          }
        }
      }

      const left = input.left, right = input.right;
      let move = 0;
      if (left && !right) move = -1;
      else if (right && !left) move = 1;
      if (move !== 0) {
        this.dir = move;
        this.facingLock = 0;
      } else if (this.swingT <= 0) {
        const cursorSide = input.mouseWorld.x < this.x ? -1 : 1;
        if (!this.miningTile) this.dir = cursorSide;
      }

      const maxSpeed = PHYS.maxSpeed * this.speedBonus() * (this.inWater ? 0.62 : 1);
      const accel = this.grounded ? PHYS.accel : PHYS.airAccel;
      if (move !== 0) {
        this.vx = T.approach(this.vx, move * maxSpeed, accel * dt);
        this.walkT += dt * Math.abs(this.vx) / maxSpeed;
      } else if (!this.climbing) {
        const fr = (this.grounded ? PHYS.friction : PHYS.friction * 0.35) * dt;
        this.vx = T.approach(this.vx, 0, fr);
      }

      const ropeHere = this.ropeAt();
      if (ropeHere && (input.up || input.down) && !this.grounded) this.climbing = true;
      if (this.grounded || !ropeHere) this.climbing = false;
      if (this.climbing) {
        this.vy = 0;
        if (input.up) this.vy = -PHYS.climbSpeed;
        if (input.down) this.vy = PHYS.climbSpeed;
      }

      if (this.grounded) { this.coyote = PHYS.coyote; this.doubleJumpUsed = false; }
      else this.coyote -= dt;
      if (input.jumpPressed) this.jumpBuf = PHYS.buffer;
      else this.jumpBuf -= dt;

      if (this.jumpBuf > 0) {
        if (this.coyote > 0 || this.inWater) {
          this.vy = -PHYS.jumpV * (this.hasAccessory('jump') ? 1.09 : 1);
          this.jumpBuf = 0;
          this.coyote = 0;
          this.grounded = false;
          this.jumping = true;
          this.wingT = this.wingMax;
          game.audio.play('jump');
          game.particles.burst(this.x, this.y, 5, { color: ['#c8b090', '#a08060'], speed: 40, life: 0.35, gravity: 200 });
          if (this.hasWings()) {
            this.wingT = this.wingMax;
            game.audio.play('magic');
            game.particles.burst(this.x, this.y - 10, 10, { color: ['rgba(230,240,255,0.8)'], speed: 60, life: 0.5, gravity: -10, kind: 'smoke' });
          }
        } else if (!this.doubleJumpUsed && this.hasAccessory('doubleJump')) {
          this.doubleJumpUsed = true;
          this.vy = -PHYS.jumpV * 0.92;
          this.jumpBuf = 0;
          this.jumping = true;
          game.audio.play('jump');
          game.particles.burst(this.x, this.y - 4, 12, {
            color: ['rgba(230,245,255,0.9)', 'rgba(200,225,255,0.7)'], speed: 55, life: 0.5, gravity: -20, kind: 'smoke'
          });
        }
      }

      if (this.hasWings()) {
        if (input.jump && !this.grounded && this.wingT > 0 && this.vy > -220) {
          this.wingT -= dt;
          this.vy = Math.max(this.vy - 2100 * dt, -300);
          this.gliding = true;
          if (Math.random() < dt * 30) {
            game.particles.spawn({
              x: this.x + (Math.random() - 0.5) * 16, y: this.y - this.h * 0.7,
              vx: (Math.random() - 0.5) * 30, vy: 40 + Math.random() * 40,
              life: 0, max: 0.5, size: 2, color: 'rgba(220,240,255,0.7)', gravity: 0, glow: true
            });
          }
        } else {
          this.gliding = false;
          if (this.grounded) this.wingT = this.wingMax;
        }
        if (this.wingT <= 0 && this.vy > 0) this.vy = Math.min(this.vy, 160);
      }
      if (!input.jump && this.vy < 0 && this.jumping) {
        this.vy *= Math.pow(PHYS.jumpCut, dt * 60);
        if (this.vy > -60) this.jumping = false;
      }
      if (this.vy >= 0) this.jumping = false;

      if (input.down && this.grounded && this.onPlatform) {
        this.dropThrough = 0.24;
        this.y += 2;
        this.grounded = false;
      }
      if (this.dropThrough > 0) this.dropThrough -= dt;

      if (input.dashPressed && this.dashCd <= 0 && this.hasAccessory('speed')) {
        this.vx = this.dir * 460;
        this.dashCd = 1.4;
        this.iframe = Math.max(this.iframe, 0.16);
        game.particles.burst(this.x, this.y - this.h / 2, 14, { color: 'rgba(220,240,255,0.8)', speed: 90, life: 0.35, gravity: 0, kind: 'smoke' });
      }

      if (input.use && this.useCd <= 0) this.useHeldItem(input);
      if (!input.use) {
        this.miningProgress = 0;
        this.miningTile = null;
        this.mining = null;
      }
      if (input.interact && this.interactCd <= 0) {
        this.interactCd = 0.25;
        this.tryInteract(input);
      }
      if (input.releaseHook) this.releaseHook();

      if (input.dropPressed) this.dropHeld();
      if (input.quickHealPressed) this.quickUse('heal');
      if (input.quickManaPressed) this.quickUse('mana');
      if (this.inLavaHeld && this.countOf('guide_doll') > 0 && this.placeCd <= 0) {
        this.placeCd = 1.2;
        const tx = Math.floor(this.x / TS);
        const ty = Math.floor((this.y - 4) / TS);
        this.placeLavaCheck(tx, ty);
      }
    }

    ropeAt() {
      const world = this.game.world;
      const tx = Math.floor(this.x / TS);
      const ty = Math.floor((this.y - this.h * 0.5) / TS);
      return world.getTile(tx, ty) === TILE.ROPE;
    }

    physics(dt) {
      const world = this.game.world;
      if (this.hook && this.hook.state === 'hooked') {
        this.gravityMul = 0.55;
      } else {
        this.gravityMul = 1;
      }
      const grav = this.inWater ? PHYS.gravity * 0.25 : (this.vy > 0 ? PHYS.fallGravity : PHYS.gravity) * (this.gravityMul || 1);
      if (!this.climbing) this.vy += grav * dt;
      if (this.inWater) this.vy = Math.min(this.vy, 170);
      this.vy = Math.min(this.vy, PHYS.maxFall);
      this.vx = T.clamp(this.vx, -600, 600);

      this.x += this.vx * dt;
      this.collideX();
      const prevY = this.y;
      this.y += this.vy * dt;
      this.collideY(prevY, dt);
      this.stats.distance += Math.abs(this.vx) * dt * 0.02;

      if (this.x < this.w / 2 + 2) { this.x = this.w / 2 + 2; this.vx = Math.max(0, this.vx); }
      if (this.x > world.W * TS - this.w / 2 - 2) { this.x = world.W * TS - this.w / 2 - 2; this.vx = Math.min(0, this.vx); }
      if (this.y > world.H * TS + 60) this.hurt(9999, undefined, { noKnock: true });

      if (this.grounded) {
        this.fallStart = this.y;
        this.landVy = 0;
      }
    }

    tileSolid(tx, ty) {
      return T.isSolid(this.game.world.getTile(tx, ty));
    }

    collideX() {
      const world = this.game.world;
      const left = this.x - this.w / 2;
      const right = this.x + this.w / 2;
      const top = this.y - this.h;
      const bottom = this.y - 0.5;
      const x0 = Math.floor(left / TS), x1 = Math.floor((right - 0.01) / TS);
      const y0 = Math.floor(top / TS), y1 = Math.floor((bottom - 0.01) / TS);
      let hit = false;
      for (let ty = y0; ty <= y1; ty++) {
        for (let tx = x0; tx <= x1; tx++) {
          if (!T.isSolid(world.getTile(tx, ty))) continue;
          hit = true;
          if (this.vx > 0) {
            this.x = tx * TS - this.w / 2 - 0.01;
          } else if (this.vx < 0) {
            this.x = (tx + 1) * TS + this.w / 2 + 0.01;
          }
          break;
        }
        if (hit) break;
      }
      if (hit) {
        if (this.grounded && this.tryStepUp(this.vx > 0 ? 1 : -1)) return;
        this.vx = 0;
      }
    }

    tryStepUp(dir) {
      const world = this.game.world;
      const nx = this.x + dir * 4;
      const ny = this.y - TS;
      const testX0 = Math.floor((nx - this.w / 2) / TS);
      const testX1 = Math.floor((nx + this.w / 2 - 0.01) / TS);
      const testY0 = Math.floor((ny - this.h) / TS);
      const testY1 = Math.floor((ny - 0.5) / TS);
      for (let ty = testY0; ty <= testY1; ty++) {
        for (let tx = testX0; tx <= testX1; tx++) {
          if (T.isSolid(world.getTile(tx, ty))) return false;
        }
      }
      this.y = ny;
      this.x = nx;
      return true;
    }

    collideY(prevY, dt) {
      const world = this.game.world;
      const left = this.x - this.w / 2 + 1;
      const right = this.x + this.w / 2 - 1;
      const top = this.y - this.h;
      const x0 = Math.floor(left / TS), x1 = Math.floor((right - 0.01) / TS);
      this.grounded = false;
      this.onPlatform = false;
      if (this.vy >= 0) {
        const footTy = Math.floor((this.y - 0.01) / TS);
        for (let tx = x0; tx <= x1; tx++) {
          const t = world.getTile(tx, footTy);
          const solid = T.isSolid(t);
          const plat = T.isPlatform(t) && this.dropThrough <= 0 && (prevY - 1) <= footTy * TS;
          if (solid || plat) {
            this.y = footTy * TS;
            if (this.vy > 640 && !this.hasAccessory('nofall') && !this.inWater) {
              const fallDist = this.y - this.fallStart;
              if (fallDist > 300) {
                const dmg = Math.round((fallDist - 300) / 16);
                this.hurt(dmg, undefined, { iframe: 0.5, noKnock: true });
              }
            }
            if (this.vy > 400) {
              this.game.audio.play('land');
              this.game.particles.burst(this.x, this.y, Math.min(12, Math.round(this.vy / 80)), {
                color: ['#c8b090', '#a08060', '#8a7050'], speed: 54, life: 0.4, gravity: 260, vy: -30
              });
            }
            this.vy = 0;
            this.grounded = true;
            if (plat) this.onPlatform = true;
            this.fallStart = this.y;
            break;
          }
        }
      } else {
        const headTy = Math.floor(top / TS);
        for (let tx = x0; tx <= x1; tx++) {
          if (T.isSolid(world.getTile(tx, headTy))) {
            this.y = (headTy + 1) * TS + this.h;
            this.vy = 0;
            break;
          }
        }
      }
    }

    aimTile(input) {
      const wx = input.mouseWorld.x, wy = input.mouseWorld.y;
      return { x: Math.floor(wx / TS), y: Math.floor(wy / TS) };
    }

    inReach(tx, ty) {
      const cx = this.x, cy = this.y - this.h * 0.5;
      const dx = (tx + 0.5) * TS - cx;
      const dy = (ty + 0.5) * TS - cy;
      return Math.hypot(dx, dy) <= PHYS.reach * TS + 8;
    }

    useHeldItem(input) {
      const game = this.game;
      const def = this.heldItem();
      const stack = this.heldStack();
      if (!def || !stack) return;
      const tile = this.aimTile(input);

      if (def.tool) {
        this.mine(tile, def, input);
        return;
      }
      if (def.place) {
        this.placeBlock(tile, def, stack, input);
        return;
      }
      if (def.melee) {
        this.swingMelee(def, input);
        return;
      }
      if (def.ranged || def.magic || def.summon) {
        this.useWeapon(def, stack, input);
        return;
      }
      if (def.type === 'consumable') {
        this.consume(def, stack, input);
        return;
      }
      if (def.type === 'summon') {
        game.boss.activateItem(def);
        return;
      }
      if (def.type === 'accessory' || def.slot) {
        if (this.equip(def.id)) {
          game.audio.play('craft');
          game.toast('装备 ' + def.name, def.color);
        }
        return;
      }
      if (def.tool === undefined && def.type === 'material') {
        return;
      }
    }

    mine(tile, def, input) {
      const game = this.game;
      const world = game.world;
      const tx = tile.x, ty = tile.y;
      if (!this.inReach(tx, ty)) return;
      const t = world.getTile(tx, ty);
      if (t === TILE.AIR) {
        const wall = world.getWall(tx, ty);
        if (wall && def.tool === 'hammer') {
          this.mineWall(tx, ty, def, input);
        }
        return;
      }
      const tdef = T.tileDef(t);
      if (tdef.liquid) return;
      const tool = def.tool;
      const required = tdef.tool || 'pick';
      if (tdef.pickPower && required === 'pick' && (def.power || 30) < tdef.pickPower) {
        if (!this.noPickWarn || performance.now() - this.noPickWarn > 1300) {
          this.noPickWarn = performance.now();
          game.toast('镐的威力不足，需要更强的镐', '#ffb07a');
          game.audio.play('hit');
        }
        return;
      }
      let speedMul = 1;
      if (tool !== required) {
        if (tdef.furniture || tdef.deco) speedMul = 1.2;
        else if (tool === 'hammer' && required === 'pick') speedMul = 0.6;
        else speedMul = 0.28;
      }
      if (this.hasBuff('mining')) speedMul *= 1.25;
      const hard = Math.max(0.03, tdef.hard || 0.2);
      const power = (def.power || 30) / 35;
      const rate = (power * speedMul) / (hard * (required === 'pick' ? 1.35 : 1));
      if (this.miningTile !== tx + ',' + ty) {
        this.miningTile = tx + ',' + ty;
        this.miningProgress = 0;
      }
      this.miningProgress += rate * game.dt;
      this.mining = { x: tx, y: ty };
      this.swingT = 0.18;
      if (Math.random() < game.dt * 9) {
        game.audio.play('dig');
        const col = tdef.pal ? tdef.pal.slice(0, 3) : ['#888'];
        game.particles.burst((tx + 0.5) * TS, (ty + 0.5) * TS, 2, {
          color: col, speed: 46, life: 0.35, gravity: 320, size: 2
        });
      }
      if (this.miningProgress >= 1) {
        this.breakTile(tx, ty, def, input);
        this.miningProgress = 0;
        this.miningTile = null;
      }
    }

    mineWall(tx, ty, def, input) {
      const game = this.game;
      const world = game.world;
      if (!this.inReach(tx, ty)) return;
      if (this.miningTile !== 'w' + tx + ',' + ty) {
        this.miningTile = 'w' + tx + ',' + ty;
        this.miningProgress = 0;
      }
      this.miningProgress += 0.85 * game.dt;
      this.mining = { x: tx, y: ty, wall: true };
      this.swingT = 0.2;
      if (Math.random() < game.dt * 6) {
        game.audio.play('dig');
        game.particles.burst((tx + 0.5) * TS, (ty + 0.5) * TS, 2, { color: ['#5c3c24', '#7d562e'], speed: 30, life: 0.3, gravity: 260 });
      }
      if (this.miningProgress >= 1) {
        world.setWall(tx, ty, 0);
        world.rebuildSkyLight();
        this.miningProgress = 0;
        this.miningTile = null;
      }
    }

    breakTile(tx, ty, tool, input) {
      const game = this.game;
      const world = game.world;
      const t = world.getTile(tx, ty);
      if (t === TILE.AIR) return;
      const tdef = T.tileDef(t);
      if (tdef.lava) {
        const flow = world.lava[ty * world.W + tx];
        if (flow > 0) {
          this.placeLavaCheck(tx, ty);
        }
        return;
      }
      if (t === TILE.CHEST) {
        const chest = world.findChest(tx, ty);
        if (chest && chest.items.length) {
          for (const it of chest.items) game.dropItem((tx + 0.5) * TS, (ty + 0.5) * TS, it.id, it.count);
          chest.items = [];
        }
      }
      if (tdef.lootable) {
        this.breakPot(tx, ty);
      }
      if (t === TILE.LIFE_CRYSTAL) game.dropItem((tx + 0.5) * TS, (ty + 0.5) * TS, 'life_crystal', 1);
      if (t === TILE.MANA_CRYSTAL) game.dropItem((tx + 0.5) * TS, (ty + 0.5) * TS, 'mana_crystal', 1);
      if (t === TILE.CACTUS) game.dropItem((tx + 0.5) * TS, (ty + 0.5) * TS, 'cactus', 1);
      if (t === TILE.POT) {
        this.breakPot(tx, ty);
      }
      if (t === TILE.CHEST) {
        const chest = world.findChest(tx, ty);
        if (chest && chest.items.length) {
          for (const it of chest.items) game.dropItem((tx + 0.5) * TS, (ty + 0.5) * TS, it.id, it.count);
          chest.items = [];
        }
      }
      if (tdef.drop) {
        let count = 1;
        if (tdef.drop === 'wood') count = 1;
        if (tdef.art === 'leaves') count = 0;
        game.dropItem((tx + 0.5) * TS, (ty + 0.5) * TS, tdef.drop, count);
        game.stats.totalBlocks++;
      }
      world.setTile(tx, ty, TILE.AIR);
      if (tdef.grass) {
        const above = world.getTile(tx, ty - 1);
        if (above === TILE.AIR && Math.random() < 0.5) game.dropItem((tx + 0.5) * TS, ty * TS, 'plant_seed', 1);
      }
      if (t === TILE.TREETRUNK || t === TILE.WOOD) this.fellTree(tx, ty);
      if (t === TILE.SAPLING) world.growth = world.growth.filter(function (g) { return g.x !== tx || g.y !== ty; });
      world.rebuildSkyLight();
      this.stats.blocksMined++;
      game.stats.blocksMined++;
      game.audio.play('break');
      const cols = tdef.pal ? tdef.pal.slice(0, 3) : ['#888', '#aaa'];
      game.particles.burst((tx + 0.5) * TS, (ty + 0.5) * TS, 7, {
        color: cols, speed: 70, life: 0.5, gravity: 340, size: 2.4
      });
      game.checkQuest('mine');
    }

    fellTree(tx, ty) {
      const world = this.game.world;
      let top = ty;
      for (let k = 1; k < 40; k++) {
        const t = world.getTile(tx, ty - k);
        if (t === TILE.TREETRUNK || t === TILE.LEAVES || t === TILE.CORRUPT_LEAVES || t === TILE.JUNGLE_LEAVES) top = ty - k;
        else break;
      }
      let woodCount = 0;
      for (let y = top; y <= ty; y++) {
        const t = world.getTile(tx, y);
        if (t === TILE.TREETRUNK) { woodCount++; world.setTile(tx, y, TILE.AIR); }
        else if (t === TILE.LEAVES || t === TILE.CORRUPT_LEAVES || t === TILE.JUNGLE_LEAVES) world.setTile(tx, y, TILE.AIR);
        else if (y !== ty) break;
      }
      if (woodCount > 0) {
        this.game.dropItem((tx + 0.5) * TS, (ty - 1) * TS, 'wood', Math.min(woodCount, 20));
      }
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const bx = tx + dx, by = ty + dy - 1;
          const bt = world.getTile(bx, by);
          if (bt === TILE.LEAVES || bt === TILE.CORRUPT_LEAVES || bt === TILE.JUNGLE_LEAVES) {
            if (Math.random() < 0.35) {
              this.game.particles.spawn({
                x: (bx + 0.5) * TS, y: (by + 0.5) * TS, vx: (Math.random() - 0.5) * 60, vy: Math.random() * 20,
                life: 0, max: 1.4, size: 2.4, color: T.tileDef(bt).pal[1], gravity: 60, drag: 2.2, kind: 'leaf'
              });
            }
            world.setTile(bx, by, TILE.AIR);
          }
        }
      }
    }

    breakPot(tx, ty) {
      const game = this.game;
      const rnd = Math.random;
      const roll = rnd();
      let id = 'coin_copper', count = 10 + Math.floor(rnd() * 40);
      if (roll < 0.2) { id = 'healing_potion'; count = 1; }
      else if (roll < 0.35) { id = 'torch'; count = 2 + Math.floor(rnd() * 5); }
      else if (roll < 0.5) { id = 'gel'; count = 2 + Math.floor(rnd() * 5); }
      else if (roll < 0.6) { id = 'arrow'; count = 5 + Math.floor(rnd() * 10); }
      else if (roll < 0.7) { id = 'bottled_water'; count = 1; }
      else if (roll < 0.75) { id = 'copper_bar'; count = 1; }
      game.dropItem((tx + 0.5) * TS, (ty + 0.5) * TS, id, count);
      game.particles.burst((tx + 0.5) * TS, (ty + 0.5) * TS, 10, { color: ['#a9744a', '#c69363', '#7c4f2d'], speed: 90, life: 0.5, gravity: 300 });
    }

    placeBlock(tile, def, stack, input) {
      const game = this.game;
      const world = game.world;
      if (this.placeCd > 0) return;
      const tx = tile.x, ty = tile.y;
      if (!this.inReach(tx, ty)) return;
      const tdef = T.tileDef(def.place);
      if (tdef.furniture || tdef.deco) {
        if (world.getTile(tx, ty) !== TILE.AIR) return;
        if (!this.hasSupport(tx, ty, def.place)) return;
        if (this.overlapsPlayer(tx, ty)) return;
        world.setTile(tx, ty, def.place);
        this.placeCd = 0.12;
        this.swingT = 0.16;
        this.take(def.id, 1);
        this.stats.blocksPlaced++;
        game.audio.play('dig');
        if (def.place === TILE.SAPLING) {
          world.setTile(tx, ty, TILE.AIR);
          world.plantSapling(tx, ty);
        }
        if (def.place === TILE.TORCH || def.place === TILE.CHEST) {
          if (def.place === TILE.CHEST) {
            world.addChest(tx, ty, []);
          }
        }
        return;
      }
      if (def.place === TILE.WATER || def.place === TILE.LAVA) {
        if (world.getTile(tx, ty) !== TILE.AIR) return;
        world.addLiquid(tx, ty, def.place === TILE.WATER ? 'water' : 'lava', 8);
        this.placeCd = 0.2;
        return;
      }
      if (world.getTile(tx, ty) !== TILE.AIR) return;
      if (!this.hasSupport(tx, ty, def.place)) return;
      if (this.overlapsPlayer(tx, ty)) return;
      if (tdef.solid && this.wouldCrush(tx, ty)) return;
      world.setTile(tx, ty, def.place);
      this.take(def.id, 1);
      this.placeCd = 0.075;
      this.swingT = 0.16;
      this.stats.blocksPlaced++;
      game.stats.blocksPlaced++;
      game.audio.play('dig');
      game.particles.burst((tx + 0.5) * TS, (ty + 0.5) * TS, 3, { color: ['#ffffff'], speed: 20, life: 0.25, gravity: 100, size: 1.5 });
      game.checkQuest('place');
    }

    hasSupport(tx, ty, tileId) {
      const world = this.game.world;
      const tdef = T.tileDef(tileId);
      const neighbors = [[0, 1], [0, -1], [-1, 0], [1, 0]];
      for (const n of neighbors) {
        if (T.isSolid(world.getTile(tx + n[0], ty + n[1]))) return true;
      }
      if (tdef.furniture) {
        if (T.isSolid(world.getTile(tx, ty + 1))) return true;
        if (world.getWall(tx, ty)) return true;
        return false;
      }
      if (tdef.art === 'torch' || tdef.art === 'cobweb' || tdef.art === 'vine' || tdef.art === 'platform') {
        if (world.getWall(tx, ty)) return true;
      }
      return false;
    }

    overlapsPlayer(tx, ty) {
      const r = { x: tx * TS, y: ty * TS, w: TS, h: TS };
      return T.rectsOverlap(r, this.rect());
    }

    wouldCrush(tx, ty) {
      const r = { x: tx * TS, y: ty * TS, w: TS, h: TS };
      const pr = this.rect();
      if (!T.rectsOverlap(r, pr)) return false;
      const top = ty * TS, bottom = ty * TS + TS;
      return pr.y < bottom - 3 && pr.y + pr.h > top + 3;
    }

    tryInteract(input) {
      const game = this.game;
      const world = game.world;
      const wx = input.mouseWorld.x, wy = input.mouseWorld.y;
      const tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
      const t = world.getTile(tx, ty);
      if (t === TILE.CHEST && this.inReach(tx, ty)) {
        game.ui.openChest(tx, ty);
        game.audio.play('chest');
        return;
      }
      if ((t === TILE.DOOR || t === TILE.DOOR_OPEN) && this.inReach(tx, ty)) {
        game.toggleDoor(tx, ty);
        return;
      }
      const npc = game.npcAt(wx, wy);
      if (npc) {
        game.ui.openNpc(npc);
        return;
      }
      if (this.hookItem() && (!this.hook || this.hook.state === 'flying') && input.mouseWorld) {
        this.fireHook(wx, wy);
        return;
      }
      const held = this.heldItem();
      if (held && held.teleport) {
        this.teleportHome();
        return;
      }
      if (held && held.place && T.isPlaceable(held.id)) {
        const stack = this.heldStack();
        this.placeBlock({ x: tx, y: ty }, held, stack, input);
      }
    }

    teleportHome() {
      const game = this.game;
      const sp = game.world.spawn;
      this.x = (sp.x + 0.5) * TS;
      this.y = sp.y * TS;
      this.vx = 0;
      this.vy = 0;
      this.iframe = 1.2;
      this.useCd = 0.6;
      game.audio.play('summon');
      game.particles.burst(this.x, this.y - this.h / 2, 26, {
        color: ['#a8d8f0', '#ffffff', '#6ab0e8'], speed: 140, life: 0.8, gravity: -30, glow: true
      });
      game.updateCamera(0.4);
      game.toast('回到了出生点', '#9ad8ff');
    }

    quickUse(kind) {
      const game = this.game;
      let best = -1;
      for (let i = 0; i < this.inv.length; i++) {
        const s = this.inv[i];
        if (!s) continue;
        const d = T.itemDef(s.id);
        if (!d || d.type !== 'consumable') continue;
        if (kind === 'heal' && d.heal) { if (best < 0 || d.heal > (T.itemDef(this.inv[best].id).heal || 0)) best = i; }
        if (kind === 'mana' && d.mana) { if (best < 0 || d.mana > (T.itemDef(this.inv[best].id).mana || 0)) best = i; }
      }
      if (best >= 0) {
        this.held = best;
        this.useCd = 0;
        this.consume(T.itemDef(this.inv[best].id), this.inv[best]);
      } else {
        game.toast(kind === 'heal' ? '没有治疗药水' : '没有魔力药水', '#ff9a9a');
      }
    }

    swingMelee(def, input) {
      const game = this.game;
      if (this.useCd > 0) return;
      this.useCd = def.use || 0.3;
      this.swingT = Math.min(0.32, this.useCd);
      this.swingDir = this.dir;
      const aim = input.mouseWorld;
      if (aim.x < this.x) this.dir = -1;
      else if (aim.x > this.x) this.dir = 1;
      this.swingDir = this.dir;
      this.attackT = 0.16;
      game.audio.play('swing');
      this.attackHit = new Set();
      const reach = (def.reach || 1.8) * TS * 1.9;
      const variance = 0.85 + Math.random() * 0.3;
      const isCrit = Math.random() < 0.06 + (this.hasAccessory('damage') ? 0.04 : 0);
      const dmg = Math.round((def.dmg || 5) * this.damageBonus() * variance);
      const cx = this.x + this.dir * reach * 0.5;
      const cy = this.y - this.h * 0.55;
      const hitbox = {
        x: this.dir > 0 ? this.x - 6 : this.x - reach + 6,
        y: cy - 26,
        w: reach + 12,
        h: 52
      };
      game.hitEnemiesInRect(hitbox, dmg, {
        knock: def.knock || 4,
        source: this,
        crit: isCrit,
        element: def.glow ? 'magic' : 'melee',
        onHit: (enemy) => {
          if (def.id === 'demonite_sword') {
            game.spawnProjectile('shadowburst', cx, cy, this.dir * 220, -40, 8, { owner: 'player', life: 0.3, size: 10 });
          }
        }
      });
      if (def.shoot) {
        game.spawnProjectile(def.shoot, this.x, this.y - this.h * 0.6, this.dir * 260, -60, dmg, {
          owner: 'player', glow: def.glow, life: 2.2
        });
      }
      game.particles.burst(cx, cy, 4, { color: ['rgba(255,255,255,0.5)'], speed: 40, life: 0.2, gravity: 0, kind: 'smoke' });
      if (def.id === 'enchanted_sword' || def.id === 'starfury') {
        game.audio.play('magic');
      }
    }

    useWeapon(def, stack, input) {
      const game = this.game;
      if (this.useCd > 0) return;
      const aim = input.mouseWorld;
      const cx = this.x, cy = this.y - this.h * 0.55;
      const angle = Math.atan2(aim.y - cy, aim.x - cx);
      if (Math.abs(aim.x - cx) > 4) {
        this.dir = aim.x > cx ? 1 : -1;
      }
      if (def.summon) {
        if (!this.mana >= 0) return;
        if (this.mana < (def.mana || 10)) { game.toast('魔力不足', '#8ab8ff'); return; }
        this.mana -= def.mana || 10;
        this.useCd = def.use || 0.6;
        this.swingT = 0.3;
        game.audio.play('summon');
        game.summonMinion('slime');
        game.particles.burst(cx, cy, 18, { color: ['#5ab4e0', '#8ad8ff'], speed: 90, life: 0.6, gravity: -40, glow: true });
        return;
      }
      if (def.magic) {
        if (this.mana < (def.mana || 5)) {
          game.toast('魔力不足', '#8ab8ff');
          return;
        }
        this.mana -= def.mana || 5;
        this.manaRegenDelay = 0.9;
      }
      if (def.ranged) {
        const ammoId = def.ammo;
        let ammoSlot = -1;
        for (let i = 0; i < this.inv.length; i++) {
          const s = this.inv[i];
          if (!s) continue;
          const ad = T.itemDef(s.id);
          if (ad && ad.ammo === ammoId) { ammoSlot = i; break; }
        }
        if (ammoSlot < 0) {
          game.toast('没有弹药', '#ffb07a');
          return;
        }
        const ammoDef = T.itemDef(this.inv[ammoSlot].id);
        this.inv[ammoSlot].count--;
        if (this.inv[ammoSlot].count <= 0) this.inv[ammoSlot] = null;
        this.useCd = def.use || 0.4;
        this.swingT = 0.16;
        this.attackT = 0.12;
        const speed = def.speed || 15;
        const px = cx + Math.cos(angle) * 14;
        const py = cy + Math.sin(angle) * 14;
        const dmg = Math.round((def.dmg + (ammoDef.dmg || 0)) * this.damageBonus());
        if (def.shoot === 'shotgun') {
          for (let i = -1; i <= 1; i++) {
            const a = angle + i * 0.1;
            game.spawnProjectile(def.shoot === 'shotgun' ? 'bullet' : def.shoot, px, py, Math.cos(a) * speed * 60, Math.sin(a) * speed * 60, dmg, { owner: 'player', life: 1.1 });
          }
        } else {
          const p = game.spawnProjectile(def.shoot, px, py, Math.cos(angle) * speed * 60, Math.sin(angle) * speed * 60, dmg, {
            owner: 'player', life: 2.4, ammo: this.inv[ammoSlot]
          });
          if (def.shoot === 'arrow' && ammoDef.id === 'flame_arrow') {
            p.kind = 'firearrow';
            p.color = '#ff9a3a';
            p.glow = '#ffb04a';
          }
        }
        game.audio.play(def.shoot === 'arrow' ? 'bow' : 'shoot');
        game.particles.burst(px, py, 4, { color: ['#ffe0a0'], speed: 50, life: 0.2, gravity: 0 });
        return;
      }
      if (def.magic || def.shoot) {
        this.useCd = def.use || 0.4;
        this.swingT = 0.3;
        this.attackT = 0.15;
        const speed = (def.speed || 12) * 50;
        const px = cx + Math.cos(angle) * 16;
        const py = cy + Math.sin(angle) * 16;
        const dmg = Math.round((def.dmg || 10) * this.damageBonus());
        game.spawnProjectile(def.shoot, px, py, Math.cos(angle) * speed, Math.sin(angle) * speed, dmg, { owner: 'player', glow: def.glow, life: 2.6 });
        game.audio.play('magic');
        game.particles.burst(px, py, 8, { color: [def.glow || '#9ad8ff', '#ffffff'], speed: 60, life: 0.3, gravity: -20, glow: true });
      }
    }

    consume(def, stack) {
      const game = this.game;
      if (this.useCd > 0) return;
      if (def.boss) {
        game.boss.activateItem(def);
        return;
      }
      if (def.cooldown) {
        this.potionCd = this.potionCd || 0;
        if (this.potionCd > 0) {
          game.toast('药水冷却中 ' + Math.ceil(this.potionCd) + 's', '#ffb07a');
          return;
        }
        this.potionCd = def.cooldown;
      }
      if (def.permanent === 'life') {
        if (this.maxHp >= 400) { game.toast('生命已达上限', '#ffb07a'); return; }
        this.maxHp += def.amount;
        this.hp += def.amount;
        this.useCd = 0.5;
        this.take(def.id, 1);
        game.audio.play('levelup');
        game.particles.burst(this.x, this.y - this.h / 2, 28, { color: ['#ff6a9a', '#ffd0e0', '#ffffff'], speed: 120, life: 0.9, gravity: -60, glow: true });
        game.toast('生命上限提升至 ' + this.maxHp, '#ff9ab8');
        return;
      }
      if (def.permanent === 'mana') {
        if (this.maxMana >= 200) { game.toast('魔力已达上限', '#8ab8ff'); return; }
        this.maxMana += def.amount;
        this.mana += def.amount;
        this.useCd = 0.5;
        this.take(def.id, 1);
        game.audio.play('levelup');
        game.particles.burst(this.x, this.y - this.h / 2, 28, { color: ['#6a8ae0', '#b0d0ff', '#ffffff'], speed: 120, life: 0.9, gravity: -60, glow: true });
        game.toast('魔力上限提升至 ' + this.maxMana, '#9ab8ff');
        return;
      }
      if (def.heal) {
        this.heal(def.heal);
        this.useCd = 0.5;
        this.take(def.id, 1);
        this.manaRegenDelay = 1;
        game.audio.play('potion');
        game.particles.burst(this.x, this.y - this.h / 2, 14, { color: ['#ff6a8a', '#ffd0e0'], speed: 60, life: 0.6, gravity: -40, glow: true });
        return;
      }
      if (def.mana) {
        this.manaHeal(def.mana);
        this.useCd = 0.5;
        this.take(def.id, 1);
        game.audio.play('potion');
        game.particles.burst(this.x, this.y - this.h / 2, 14, { color: ['#6a8ae0', '#b0d0ff'], speed: 60, life: 0.6, gravity: -40, glow: true });
        return;
      }
      if (def.buff) {
        this.addBuff(def.buff, def.duration || 60);
        this.useCd = 0.5;
        this.take(def.id, 1);
        game.audio.play('potion');
        game.toast('获得增益：' + def.name, '#9ae0a0');
        game.particles.burst(this.x, this.y - this.h / 2, 16, { color: [def.color, '#ffffff'], speed: 60, life: 0.7, gravity: -40, glow: true });
        return;
      }
      if (def.id === 'star') {
        this.manaHeal(50);
        this.take(def.id, 1);
        game.audio.play('potion');
        return;
      }
    }

    placeLavaCheck(tx, ty) {
      const game = this.game;
      const world = game.world;
      const held = this.heldStack();
      if (held && held.id === 'guide_doll') {
        this.take('guide_doll', 1);
        world.lava[ty * world.W + tx] = 0;
        game.audio.play('bossdie');
        game.shake(14, 0.7);
        game.particles.burst((tx + 0.5) * TS, (ty + 0.5) * TS, 40, {
          color: ['#ff6a2a', '#ffd070', '#8a2a10'], speed: 200, life: 1.2, gravity: -40, glow: true
        });
        game.ui.toast('向导的诅咒被献祭了……', '#ff9a6a');
        setTimeout(function () {
          if (!game.started) return;
          game.spawnBoss('wof');
        }, 900);
        return;
      }
      const rnd = Math.random();
      if (rnd < 0.5) game.dropItem((tx + 0.5) * TS, ty * TS - 8, 'coin_copper', 20 + Math.floor(Math.random() * 40));
      else if (rnd < 0.7) game.dropItem((tx + 0.5) * TS, ty * TS - 8, 'healing_potion', 1);
      else if (rnd < 0.8) game.dropItem((tx + 0.5) * TS, ty * TS - 8, 'torch', 3);
    }

    dropHeld() {
      const game = this.game;
      const stack = this.heldStack();
      if (!stack) return;
      const def = T.itemDef(stack.id);
      if (def && def.type === 'trophy') return;
      const dir = this.dir;
      game.dropItem(this.x + dir * 14, this.y - this.h * 0.6, stack.id, Math.min(stack.count, 1));
      stack.count--;
      if (stack.count <= 0) this.inv[this.held] = null;
      game.audio.play('menu');
    }

    pickupItems(dt) {
      const game = this.game;
      const items = game.items;
      const magnet = 1;
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (it.noPickup > 0) it.noPickup -= dt;
        const dx = this.x - it.x, dy = (this.y - this.h * 0.4) - it.y;
        const d = Math.hypot(dx, dy);
        if (d < 26 && it.noPickup <= 0) {
          const left = this.give(it.id, it.count);
          if (left === 0) {
            const def = T.itemDef(it.id);
            game.particles.text(this.x, this.y - this.h - 6, '+' + it.count + ' ' + (def ? def.name : it.id), it.id.indexOf('coin') >= 0 ? '#ffd870' : '#e8f0ff');
            if (it.id.indexOf('coin') >= 0) game.audio.play('coin');
            else game.audio.play('pickup');
            items.splice(i, 1);
            game.stats.itemsCollected++;
          }
          continue;
        }
        if (d < 130 * magnet) {
          const pull = d < 90 ? 280 : 140;
          it.vx += (dx / (d || 1)) * pull * dt * 4;
          it.vy += (dy / (d || 1)) * pull * dt * 4;
        }
      }
      if (this.potionCd > 0) this.potionCd -= dt;
    }

    draw(ctx, cam, zoom, vw, vh) {
      if (this.dead) return;
      const p = this.game.renderer.worldToScreen(cam, this.x, this.y);
      const s = zoom;
      const flash = this.hurtFlash > 0 && Math.floor(this.animT * 24) % 2 === 0;
      const armorBody = this.armor.body ? T.itemDef(this.armor.body) : null;
      const armorHead = this.armor.head ? T.itemDef(this.armor.head) : null;
      const armorLegs = this.armor.legs ? T.itemDef(this.armor.legs) : null;

      const skin = flash ? '#ffffff' : '#f2c9a0';
      const skinMid = flash ? '#ffffff' : '#e0b183';
      const skinDeep = flash ? '#ffffff' : '#c99566';
      const shirtBase = armorBody ? armorBody.color : '#3f6fb0';
      const shirt = flash ? '#ffffff' : shirtBase;
      const shirtMid = flash ? '#ffffff' : T.shade(shirtBase, -0.18);
      const shirtDeep = flash ? '#ffffff' : T.shade(shirtBase, -0.42);
      const pantsBase = armorLegs ? armorLegs.color : '#3a4a6a';
      const pants = flash ? '#ffffff' : pantsBase;
      const pantsDeep = flash ? '#ffffff' : T.shade(pantsBase, -0.4);
      const hair = flash ? '#ffffff' : '#3d2515';
      const hairLight = flash ? '#ffffff' : '#5a3820';

      const walk = this.walkT * 9;
      const moving = T.clamp(Math.abs(this.vx) / 150, 0, 1);
      const legSwing = this.grounded ? Math.sin(walk) * 0.62 * moving : 0.22;
      const bob = this.grounded ? Math.abs(Math.sin(walk)) * 1.5 * moving : 0;
      const breath = Math.sin(this.animT * 2.2) * 0.35;
      const swingT = this.swingT > 0 ? 1 - this.swingT / 0.32 : 0;
      const held = this.heldItem();
      const wclass = held ? T.weaponClass(held.id) : 'none';

      let armAngle = 0.16;
      if (this.swingT > 0) armAngle = -1.15 + swingT * 2.3;
      else if (this.attackT > 0) armAngle = -0.75;
      else if (wclass === 'ranged' || wclass === 'magic') armAngle = -1.15;
      else if (held && held.tool) armAngle = 0.1;

      const HIP_Y = -17 * s + bob * s;
      const SHOULDER_Y = -33 * s + bob * s;
      const NECK_Y = -38 * s + bob * s;
      const headCY = -45 * s + bob * s;
      const headR = 6.6 * s;

      ctx.save();
      ctx.translate(p.x, p.y);
      if (this.iframe > 0 && this.hurtFlash > 0) ctx.globalAlpha = 0.88;
      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      ctx.beginPath();
      ctx.ellipse(0, 1, 9.5 * s, 3 * s, 0, 0, 6.283);
      ctx.fill();
      ctx.scale(this.dir, 1);
      ctx.lineCap = 'round';

      const limb = (x1, y1, x2, y2, w1, w2, c1, c2) => {
        ctx.strokeStyle = c1;
        ctx.lineWidth = w1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.strokeStyle = c2;
        ctx.lineWidth = w2;
        ctx.beginPath();
        ctx.moveTo(x1 + w1 * 0.18, y1);
        ctx.lineTo(x2 + w2 * 0.18, y2);
        ctx.stroke();
      };

      const backLegAngle = -legSwing * 0.9;
      ctx.save();
      ctx.translate(-2.6 * s, HIP_Y);
      ctx.rotate(backLegAngle);
      limb(0, 0, 0, 7.5 * s, 5.4 * s, 3.4 * s, pantsDeep, T.shade(pantsBase, -0.2));
      ctx.save();
      ctx.translate(0, 7.5 * s);
      ctx.rotate(Math.max(0, legSwing) * 0.8 + 0.06);
      limb(0, 0, 0, 7 * s, 4.6 * s, 3 * s, pantsDeep, T.shade(pantsBase, -0.18));
      ctx.fillStyle = flash ? '#ffffff' : '#2b2016';
      ctx.beginPath();
      ctx.ellipse(1.5 * s, 8 * s, 4 * s, 2.3 * s, 0, 0, 6.283);
      ctx.fill();
      ctx.restore();
      ctx.restore();

      ctx.save();
      ctx.translate(3.2 * s, SHOULDER_Y + 3 * s);
      ctx.rotate(-armAngle * 0.5 - 0.16);
      limb(0, 0, 0, 8.5 * s, 4.8 * s, 3 * s, shirtDeep, T.shade(shirtBase, -0.24));
      ctx.fillStyle = flash ? '#ffffff' : skinDeep;
      ctx.beginPath();
      ctx.arc(0, 9.2 * s, 2.5 * s, 0, 6.283);
      ctx.fill();
      ctx.restore();

      const torsoTop = SHOULDER_Y;
      const torsoBot = HIP_Y + 2 * s;
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.moveTo(-6.2 * s, torsoTop + 1.5 * s);
      ctx.quadraticCurveTo(-7.4 * s, torsoTop + 5 * s, -6.4 * s, torsoTop + 9 * s);
      ctx.lineTo(-5.8 * s, torsoBot);
      ctx.quadraticCurveTo(0, torsoBot + 1.8 * s, 5.8 * s, torsoBot);
      ctx.lineTo(6.4 * s, torsoTop + 9 * s);
      ctx.quadraticCurveTo(7.4 * s, torsoTop + 5 * s, 6.2 * s, torsoTop + 1.5 * s);
      ctx.quadraticCurveTo(0, torsoTop - 1.4 * s - breath * s, -6.2 * s, torsoTop + 1.5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shirtMid;
      ctx.beginPath();
      ctx.moveTo(-6.2 * s, torsoTop + 1.5 * s);
      ctx.quadraticCurveTo(-3 * s, torsoTop + 2.4 * s, 0, torsoTop + 2.2 * s);
      ctx.lineTo(0, torsoBot + 1 * s);
      ctx.quadraticCurveTo(-3 * s, torsoBot + 1.4 * s, -5.8 * s, torsoBot);
      ctx.lineTo(-6.4 * s, torsoTop + 9 * s);
      ctx.quadraticCurveTo(-7.4 * s, torsoTop + 5 * s, -6.2 * s, torsoTop + 1.5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = shirtDeep;
      ctx.lineWidth = 1.1 * s;
      ctx.beginPath();
      ctx.moveTo(-6.3 * s, torsoBot - 1.4 * s);
      ctx.quadraticCurveTo(0, torsoBot + 0.6 * s, 6.3 * s, torsoBot - 1.4 * s);
      ctx.stroke();

      if (armorBody) {
        const trim = T.shade(shirtBase, 0.4);
        const deep = T.shade(shirtBase, -0.5);
        ctx.fillStyle = trim;
        ctx.beginPath();
        ctx.moveTo(-6.2 * s, torsoTop + 1.4 * s);
        ctx.quadraticCurveTo(-2 * s, torsoTop + 0.2 * s, 2 * s, torsoTop + 1.6 * s);
        ctx.lineTo(2.6 * s, torsoTop + 4.2 * s);
        ctx.quadraticCurveTo(0, torsoTop + 5.4 * s, -2.6 * s, torsoTop + 4.2 * s);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = trim;
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.moveTo(-4.6 * s, torsoTop + 7 * s);
        ctx.lineTo(4.6 * s, torsoTop + 7 * s);
        ctx.moveTo(-4.2 * s, torsoTop + 10 * s);
        ctx.lineTo(4.2 * s, torsoTop + 10 * s);
        ctx.stroke();
        ctx.fillStyle = deep;
        ctx.beginPath();
        ctx.moveTo(-5.8 * s, torsoBot - 2.4 * s);
        ctx.quadraticCurveTo(0, torsoBot - 0.4 * s, 5.8 * s, torsoBot - 2.4 * s);
        ctx.lineTo(5.8 * s, torsoBot - 0.6 * s);
        ctx.quadraticCurveTo(0, torsoBot + 1.4 * s, -5.8 * s, torsoBot - 0.6 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.26)';
        ctx.beginPath();
        ctx.ellipse(-3.4 * s, torsoTop + 3 * s, 1.5 * s, 2.2 * s, -0.4, 0, 6.283);
        ctx.fill();
      }

      ctx.fillStyle = skinMid;
      ctx.fillRect(-2.6 * s, NECK_Y - 1 * s, 5.2 * s, 3.6 * s);
      ctx.fillStyle = skinDeep;
      ctx.fillRect(-2.6 * s, NECK_Y + 1.4 * s, 5.2 * s, 1.2 * s);

      ctx.save();
      ctx.translate(0, headCY);
      const tilt = this.grounded ? Math.sin(walk) * 0.05 * moving : -0.05;
      ctx.rotate(tilt);

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.ellipse(0, 0, headR, headR * 1.08, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = skinMid;
      ctx.beginPath();
      ctx.ellipse(1.2 * s, 1.1 * s, headR * 0.92, headR * 0.96, 0, -0.4, 1.7);
      ctx.fill();
      ctx.fillStyle = skinDeep;
      ctx.beginPath();
      ctx.ellipse(0.4 * s, headR * 0.72, headR * 0.5, headR * 0.2, 0, 0, 6.283);
      ctx.fill();

      if (armorHead) {
        const ac = flash ? '#ffffff' : armorHead.color;
        const acTrim = T.shade(armorHead.color, 0.42);
        const acDeep = T.shade(armorHead.color, -0.48);
        const HR = headR;
        ctx.fillStyle = ac;
        ctx.beginPath();
        ctx.moveTo(-HR * 1.02, 1.6 * s);
        ctx.lineTo(-HR * 1.06, -2.2 * s);
        ctx.quadraticCurveTo(-HR * 1.0, -HR * 1.34, 0, -HR * 1.34);
        ctx.quadraticCurveTo(HR * 1.0, -HR * 1.34, HR * 1.06, -2.2 * s);
        ctx.lineTo(HR * 1.02, 1.6 * s);
        ctx.quadraticCurveTo(HR * 0.98, 3.4 * s, HR * 0.5, 3.7 * s);
        ctx.lineTo(-HR * 0.5, 3.7 * s);
        ctx.quadraticCurveTo(-HR * 0.98, 3.4 * s, -HR * 1.02, 1.6 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = acTrim;
        ctx.beginPath();
        ctx.moveTo(0, -HR * 1.3);
        ctx.quadraticCurveTo(HR * 1.04, -HR * 1.24, HR * 0.94, -1.2 * s);
        ctx.lineTo(HR * 0.62, -1.2 * s);
        ctx.quadraticCurveTo(HR * 0.6, -HR * 0.9, 0, -HR * 0.95);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-HR * 0.34, -HR * 0.62, HR * 0.3, HR * 0.16, -0.5, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = acDeep;
        ctx.beginPath();
        ctx.moveTo(-HR * 0.5, 3.5 * s);
        ctx.lineTo(HR * 0.5, 3.5 * s);
        ctx.lineTo(HR * 0.46, 4.5 * s);
        ctx.lineTo(-HR * 0.46, 4.5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-HR * 1.04, 2.5 * s, HR * 2.08, 1.5 * s);
        ctx.fillStyle = ac;
        ctx.beginPath();
        ctx.moveTo(-HR * 1.0, -1.6 * s);
        ctx.lineTo(-HR * 1.26, 1.2 * s);
        ctx.lineTo(-HR * 0.86, 0.8 * s);
        ctx.lineTo(-HR * 0.72, -1.4 * s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(HR * 1.0, -1.6 * s);
        ctx.lineTo(HR * 1.26, 1.2 * s);
        ctx.lineTo(HR * 0.86, 0.8 * s);
        ctx.lineTo(HR * 0.72, -1.4 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = acTrim;
        ctx.beginPath();
        ctx.moveTo(0, -HR * 1.34);
        ctx.lineTo(-HR * 0.16, -HR * 1.86);
        ctx.lineTo(HR * 0.16, -HR * 1.86);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.30)';
        ctx.beginPath();
        ctx.ellipse(HR * 0.12, 0.5 * s, HR * 0.74, HR * 0.34, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = flash ? '#ffffff' : skin;
        ctx.beginPath();
        ctx.ellipse(HR * 0.14, 0.7 * s, HR * 0.64, HR * 0.28, 0, 0, 6.283);
        ctx.fill();
        if (armorHead.id && armorHead.id.indexOf('gold') === 0) {
          ctx.fillStyle = '#ffe27a';
          ctx.fillRect(-1.2 * s, -HR * 1.86, 2.4 * s, 2.2 * s);
        }
        if (armorHead.id && armorHead.id.indexOf('hellstone') === 0) {
          ctx.fillStyle = 'rgba(255,140,50,0.45)';
          ctx.beginPath();
          ctx.ellipse(0, -2.4 * s, HR * 0.9, HR * 0.5, 0, 0, 6.283);
          ctx.fill();
        }
        if (armorHead.id && armorHead.id.indexOf('demonite') === 0) {
          ctx.strokeStyle = '#c8a0ff';
          ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.moveTo(-HR * 0.8, -HR * 1.1);
          ctx.quadraticCurveTo(0, -HR * 1.42, HR * 0.8, -HR * 1.1);
          ctx.stroke();
        }
        ctx.fillStyle = '#1b1418';
        ctx.beginPath();
        ctx.ellipse(2.4 * s, 0.4 * s, 1.45 * s, 1.05 * s, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(2.7 * s, 0.05 * s, 0.42 * s, 0, 6.283);
        ctx.fill();
        if (armorHead.id && armorHead.id.indexOf('gold') === 0) {
          ctx.fillStyle = '#ffe27a';
          ctx.fillRect(-1.2 * s, -headR * 1.5, 2.4 * s, 2.6 * s);
        }
        if (armorHead.id && armorHead.id.indexOf('hellstone') === 0) {
          ctx.fillStyle = 'rgba(255,140,50,0.55)';
          ctx.beginPath();
          ctx.arc(0, -2 * s, headR * 0.86, 0, 6.283);
          ctx.fill();
        }
        if (armorHead.id && armorHead.id.indexOf('demonite') === 0) {
          ctx.strokeStyle = '#c8a0ff';
          ctx.lineWidth = 1.1 * s;
          ctx.beginPath();
          ctx.moveTo(-headR * 0.7, -headR * 0.9);
          ctx.lineTo(headR * 0.7, -headR * 0.9);
          ctx.stroke();
        }
        ctx.fillStyle = '#1b1418';
        ctx.beginPath();
        ctx.ellipse(2.5 * s, 0.4 * s, 1.5 * s, 1.1 * s, 0, 0, 6.283);
        ctx.fill();
      } else {
        ctx.fillStyle = hair;
        ctx.beginPath();
        ctx.arc(-0.4 * s, -1.4 * s, headR * 1.06, Math.PI * 0.9, Math.PI * 2.12);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-headR * 1.02, -2 * s);
        ctx.quadraticCurveTo(-headR * 1.3, 2.4 * s, -headR * 0.74, 4.4 * s);
        ctx.lineTo(-headR * 0.6, -1.2 * s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(headR * 0.7, -3.4 * s);
        ctx.quadraticCurveTo(headR * 1.28, -0.4 * s, headR * 0.96, 2.6 * s);
        ctx.lineTo(headR * 0.5, -1 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = hairLight;
        ctx.beginPath();
        ctx.ellipse(-1.8 * s, -3.6 * s, 2.6 * s, 1.5 * s, -0.35, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#241a20';
        ctx.beginPath();
        ctx.ellipse(3.1 * s, 0.2 * s, 1.15 * s, 1.35 * s, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(3.4 * s, -0.3 * s, 0.45 * s, 0, 6.283);
        ctx.fill();
        ctx.strokeStyle = skinDeep;
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(4.2 * s, 2.2 * s);
        ctx.lineTo(4.9 * s, 2.5 * s);
        ctx.stroke();
      }
      ctx.restore();

      const armX = 6 * s;
      const armY = SHOULDER_Y + 4 * s;
      if (held) {
        const holdAngle = held.tool ? (0.55 + swingT * 1.5) : (wclass === 'melee' ? (0.35 + swingT * 1.7) : -1.25);
        ctx.save();
        ctx.translate(armX - 1 * s, SHOULDER_Y + 5 * s);
        ctx.rotate(holdAngle);
        const iconScale = s * 1.42;
        ctx.scale(iconScale, iconScale);
        T.drawItemIcon(ctx, held.id, -2, -20, 24);
        ctx.restore();
      }
      ctx.save();
      ctx.translate(armX, armY);
      ctx.rotate(armAngle);
      limb(0, 0, 0, 8.5 * s, 4.8 * s, 3 * s, shirt, T.shade(shirtBase, 0.14));
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(0.2 * s, 9.4 * s, 2.7 * s, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = skinMid;
      ctx.beginPath();
      ctx.arc(0.9 * s, 10 * s, 1.8 * s, -0.6, 2.2);
      ctx.fill();
      ctx.restore();

      const frontLegAngle = legSwing * 0.9;
      ctx.save();
      ctx.translate(2.4 * s, HIP_Y);
      ctx.rotate(frontLegAngle);
      limb(0, 0, 0, 7.5 * s, 5.4 * s, 3.4 * s, pants, T.shade(pantsBase, 0.14));
      ctx.save();
      ctx.translate(0, 7.5 * s);
      ctx.rotate(Math.max(0, -legSwing) * 0.8 + 0.06);
      limb(0, 0, 0, 7 * s, 4.6 * s, 3 * s, pants, T.shade(pantsBase, 0.1));
      ctx.fillStyle = flash ? '#ffffff' : '#33271a';
      ctx.beginPath();
      ctx.ellipse(1.5 * s, 8 * s, 4.2 * s, 2.4 * s, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = flash ? '#ffffff' : T.shade(pantsBase, -0.1);
      ctx.fillRect(-2.2 * s, 4.4 * s, 4.4 * s, 1.4 * s);
      ctx.restore();
      ctx.restore();

      if (armorLegs) {
        const trim = T.shade(armorLegs.color, 0.4);
        ctx.fillStyle = trim;
        ctx.beginPath();
        ctx.ellipse(2.4 * s, HIP_Y + 1 * s, 3.4 * s, 2 * s, 0, 0, 6.283);
        ctx.fill();
      }

      if (this.hasWings() && !this.grounded) {
        const flap = this.wingT > 0 ? Math.sin(this.animT * 22) * 0.5 : 0;
        const wingCol = this.accessories.indexOf('demon_wings') >= 0 ? '#8a5ac0' : '#e8f0ff';
        ctx.save();
        ctx.translate(0, SHOULDER_Y + 2 * s);
        for (const side of [-1, 1]) {
          ctx.save();
          ctx.scale(side, 1);
          ctx.rotate(-0.42 + flap * 0.55);
          const wg = ctx.createLinearGradient(0, 0, 30 * s, 4 * s);
          wg.addColorStop(0, wingCol);
          wg.addColorStop(1, 'rgba(255,255,255,0.14)');
          ctx.fillStyle = wg;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(16 * s, -17 * s, 33 * s, -6 * s);
          ctx.quadraticCurveTo(26 * s, -1 * s, 30 * s, 7 * s);
          ctx.quadraticCurveTo(15 * s, 5 * s, 0, 7 * s);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.34)';
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.moveTo(2 * s, 2 * s);
          ctx.quadraticCurveTo(16 * s, -8 * s, 30 * s, -4 * s);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }

      if (this.hook && this.hook.state === 'hooked') {
        ctx.strokeStyle = 'rgba(220,200,160,0.9)';
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.moveTo(6 * s, armY);
        const hx = (this.hook.x - this.x) * 1;
        const hy = (this.hook.y - (this.y)) * 1;
        ctx.lineTo(hx, hy);
        ctx.stroke();
      }

      ctx.restore();

      if (this.inWater) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#4a90d0';
        ctx.fillRect(p.x - 15 * s, p.y - 50 * s, 30 * s, 52 * s);
        ctx.restore();
      }

      if (this.hasBuff('obsidian')) {
        ctx.save();
        ctx.strokeStyle = 'rgba(130,110,160,0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 22 * s, 15 * s, 0, 6.283);
        ctx.stroke();
        ctx.restore();
      }
    }

    drawCursor(ctx, input, cam, zoom) {
      if (!input || !this.game.canPlay()) return;
      const p = this.game.renderer.worldToScreen(cam, input.mouseWorld.x, input.mouseWorld.y);
      const tx = Math.floor(input.mouseWorld.x / TS);
      const ty = Math.floor(input.mouseWorld.y / TS);
      const inReach = this.inReach(tx, ty);
      const held = this.heldItem();
      let col = 'rgba(255,255,255,0.55)';
      if (held && held.place) col = 'rgba(140,220,255,0.7)';
      if (held && held.tool) col = 'rgba(255,230,150,0.8)';
      if (this.mining) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect((this.mining.x * TS - cam.x) * zoom + this.game.renderer.vw / 2, (this.mining.y * TS - cam.y) * zoom + this.game.renderer.vh / 2, TS * zoom, TS * zoom);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.strokeRect(
          (this.mining.x * TS - cam.x) * zoom + this.game.renderer.vw / 2 + 0.5,
          (this.mining.y * TS - cam.y) * zoom + this.game.renderer.vh / 2 + 0.5,
          TS * zoom - 1, TS * zoom - 1
        );
        const prog = T.clamp(this.miningProgress, 0, 1);
        ctx.fillStyle = 'rgba(255,220,120,0.85)';
        ctx.fillRect(
          (this.mining.x * TS - cam.x) * zoom + this.game.renderer.vw / 2,
          (this.mining.y * TS - cam.y) * zoom + this.game.renderer.vh / 2 + TS * zoom - 3,
          TS * zoom * prog, 3
        );
      }
      if (!this.inReach(tx, ty)) return;
      const sx = (tx * TS - cam.x) * zoom + this.game.renderer.vw / 2;
      const sy = (ty * TS - cam.y) * zoom + this.game.renderer.vh / 2;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 1, sy + 1, TS * zoom - 2, TS * zoom - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(sx, sy, TS * zoom, TS * zoom);
    }
  }

  T.Player = Player;
  T.PHYS = PHYS;
  T.SLOT_COUNT = SLOT_COUNT;
  T.HOTBAR = HOTBAR;
})();
