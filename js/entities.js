(function () {
  const T = window.T;
  const TS = T.TS;
  const TILE = T.TILE;

  const ENEMY_DEFS = {
    slime_green: {
      name: '绿史莱姆', hp: 14, dmg: 7, w: 24, h: 18, speed: 46, jump: 260, color: '#5ab84a',
      drops: [{ id: 'gel', min: 1, max: 3, chance: 1 }], ai: 'slime', xp: 1
    },
    slime_blue: {
      name: '蓝史莱姆', hp: 22, dmg: 10, w: 28, h: 22, speed: 54, jump: 290, color: '#4a78d8',
      drops: [{ id: 'gel', min: 1, max: 4, chance: 1 }], ai: 'slime'
    },
    slime_red: {
      name: '红史莱姆', hp: 32, dmg: 14, w: 30, h: 24, speed: 62, jump: 320, color: '#d84a4a',
      drops: [{ id: 'gel', min: 2, max: 5, chance: 1 }], ai: 'slime'
    },
    slime_purple: {
      name: '紫史莱姆', hp: 42, dmg: 18, w: 34, h: 26, speed: 58, jump: 300, color: '#9a4ad8',
      drops: [{ id: 'gel', min: 2, max: 6, chance: 1 }, { id: 'healing_potion', min: 1, max: 1, chance: 0.2 }], ai: 'slime'
    },
    zombie: {
      name: '僵尸', hp: 38, dmg: 14, w: 20, h: 42, speed: 54, color: '#4a7a4a',
      drops: [{ id: 'coin_copper', min: 3, max: 12, chance: 0.9 }, { id: 'healing_potion', min: 1, max: 1, chance: 0.12 }], ai: 'walker'
    },
    demon_eye: {
      name: '恶魔之眼', hp: 30, dmg: 12, w: 26, h: 26, speed: 84, color: '#c04a5a',
      drops: [{ id: 'lens', min: 1, max: 1, chance: 0.35 }, { id: 'coin_copper', min: 2, max: 8, chance: 0.7 }], ai: 'flyer'
    },
    skeleton: {
      name: '骷髅', hp: 52, dmg: 18, w: 20, h: 40, speed: 66, color: '#d8d0c0',
      drops: [{ id: 'bone', min: 1, max: 3, chance: 0.8 }, { id: 'coin_copper', min: 5, max: 20, chance: 0.9 }], ai: 'walker'
    },
    cave_bat: {
      name: '洞穴蝙蝠', hp: 22, dmg: 10, w: 24, h: 18, speed: 110, color: '#5a4a52',
      drops: [{ id: 'coin_copper', min: 2, max: 8, chance: 0.7 }], ai: 'flyer'
    },
    eater: {
      name: '吞噬者', hp: 44, dmg: 16, w: 26, h: 18, speed: 96, color: '#6a4a86',
      drops: [{ id: 'worm_food', min: 1, max: 2, chance: 0.6 }, { id: 'shadow_scale', min: 1, max: 1, chance: 0.12 }], ai: 'flyer'
    },
    hornet: {
      name: '黄蜂', hp: 36, dmg: 20, w: 24, h: 20, speed: 120, color: '#d8b02a',
      drops: [{ id: 'gel', min: 1, max: 2, chance: 0.5 }], ai: 'flyer', shoot: 'stinger'
    },
    piranha: {
      name: '食人鱼', hp: 30, dmg: 16, w: 26, h: 18, speed: 76, color: '#8a3a4a',
      drops: [{ id: 'gel', min: 1, max: 2, chance: 0.4 }], ai: 'swimmer'
    },
    shark: {
      name: '鲨鱼', hp: 60, dmg: 24, w: 46, h: 26, speed: 92, color: '#4a6a7a',
      drops: [{ id: 'coin_silver', min: 1, max: 2, chance: 0.5 }], ai: 'swimmer'
    },
    antlion: {
      name: '蚁狮', hp: 46, dmg: 18, w: 30, h: 24, speed: 50, color: '#c8a86b',
      drops: [{ id: 'coin_copper', min: 8, max: 24, chance: 0.9 }], ai: 'walker', shoot: 'sandball'
    },
    vulture: {
      name: '秃鹫', hp: 36, dmg: 20, w: 32, h: 24, speed: 100, color: '#8a6a4a',
      drops: [{ id: 'coin_copper', min: 5, max: 15, chance: 0.7 }], ai: 'flyer'
    },
    ice_slime: {
      name: '冰史莱姆', hp: 30, dmg: 14, w: 30, h: 24, speed: 50, jump: 280, color: '#a8d8e8',
      drops: [{ id: 'ice', min: 1, max: 3, chance: 1 }, { id: 'gel', min: 1, max: 2, chance: 1 }], ai: 'slime'
    },
    angler: {
      name: '琵琶鱼', hp: 48, dmg: 22, w: 32, h: 22, speed: 70, color: '#6a7a8a',
      drops: [{ id: 'gel', min: 1, max: 3, chance: 0.6 }], ai: 'walker'
    },
    fire_imp: {
      name: '火魔', hp: 60, dmg: 24, w: 24, h: 38, speed: 84, color: '#e0602a',
      drops: [{ id: 'coin_silver', min: 1, max: 2, chance: 0.8 }], ai: 'flyer', shoot: 'fireball'
    },
    lava_slime: {
      name: '岩浆史莱姆', hp: 70, dmg: 30, w: 34, h: 28, speed: 54, jump: 280, color: '#e06a1a',
      drops: [{ id: 'gel', min: 2, max: 5, chance: 1 }, { id: 'hellstone_ore', min: 1, max: 2, chance: 0.25 }], ai: 'slime', fire: true
    },
    giant_worm: {
      name: '巨型蠕虫', hp: 34, dmg: 14, w: 30, h: 20, speed: 80, color: '#a87a5a',
      drops: [{ id: 'worm_food', min: 1, max: 2, chance: 0.3 }], ai: 'burrow'
    },
    harpy: {
      name: '鹰身女妖', hp: 40, dmg: 18, w: 28, h: 30, speed: 100, color: '#c8b0a0',
      drops: [{ id: 'coin_copper', min: 5, max: 20, chance: 0.8 }], ai: 'flyer', shoot: 'feather'
    },
    mother_slime: {
      name: '史莱姆之母', hp: 90, dmg: 22, w: 40, h: 32, speed: 50, jump: 300, color: '#c05ac0',
      drops: [{ id: 'gel', min: 4, max: 8, chance: 1 }], ai: 'slime', split: 'slime_purple'
    },
    wraith: {
      name: '幽灵', hp: 60, dmg: 22, w: 26, h: 38, speed: 92, color: '#8a8ad8',
      drops: [{ id: 'coin_silver', min: 1, max: 3, chance: 0.8 }], ai: 'flyer', ghost: true
    },
    snow_flinx: {
      name: '雪狼', hp: 54, dmg: 20, w: 34, h: 22, speed: 128, color: '#dfeaf4',
      drops: [{ id: 'coin_copper', min: 6, max: 22, chance: 0.9 }], ai: 'walker'
    },
    zombie_elf: {
      name: '雪地僵尸', hp: 46, dmg: 18, w: 22, h: 40, speed: 62, color: '#8ab0c8',
      drops: [{ id: 'coin_copper', min: 4, max: 14, chance: 0.8 }], ai: 'walker'
    },
    desert_spirit: {
      name: '沙漠幽灵', hp: 62, dmg: 24, w: 30, h: 30, speed: 106, color: '#e8d8a8',
      drops: [{ id: 'coin_silver', min: 1, max: 2, chance: 0.6 }], ai: 'flyer'
    },
    scarab: {
      name: '圣甲虫', hp: 34, dmg: 14, w: 26, h: 16, speed: 96, color: '#3a4a5a',
      drops: [{ id: 'coin_copper', min: 4, max: 16, chance: 0.7 }], ai: 'walker'
    },
    jungle_creeper: {
      name: '丛林蔓生怪', hp: 58, dmg: 26, w: 30, h: 34, speed: 60, color: '#3a8a3a',
      drops: [{ id: 'vine', min: 1, max: 4, chance: 0.7 }, { id: 'coin_silver', min: 1, max: 1, chance: 0.3 }], ai: 'walker'
    },
    hornet_giant: {
      name: '巨黄蜂', hp: 64, dmg: 28, w: 34, h: 26, speed: 132, color: '#e8b820',
      drops: [{ id: 'bee_wax', min: 1, max: 1, chance: 0.18 }], ai: 'flyer', shoot: 'stinger'
    },
    blood_crawler: {
      name: '血爬虫', hp: 40, dmg: 20, w: 32, h: 18, speed: 120, color: '#a02030',
      drops: [{ id: 'coin_copper', min: 6, max: 20, chance: 0.8 }], ai: 'walker'
    },
    cursed_skull: {
      name: '诅咒骷髅', hp: 48, dmg: 24, w: 26, h: 26, speed: 118, color: '#c8c8d8',
      drops: [{ id: 'coin_silver', min: 1, max: 2, chance: 0.5 }], ai: 'flyer'
    },
    granite_golem: {
      name: '花岗岩巨人', hp: 120, dmg: 34, w: 40, h: 52, speed: 48, color: '#6a7a8a',
      drops: [{ id: 'stone', min: 8, max: 20, chance: 1 }, { id: 'coin_silver', min: 2, max: 4, chance: 0.9 }], ai: 'walker'
    },
    shark_giant: {
      name: '巨鲨', hp: 110, dmg: 32, w: 58, h: 30, speed: 112, color: '#3a5a6a',
      drops: [{ id: 'coin_silver', min: 2, max: 5, chance: 0.8 }], ai: 'swimmer'
    },
    mimic: {
      name: '宝箱怪', hp: 130, dmg: 30, w: 34, h: 30, speed: 96, color: '#c89a4a',
      drops: [{ id: 'coin_gold', min: 1, max: 2, chance: 0.9 }, { id: 'gold_broadsword', min: 1, max: 1, chance: 0.2 }], ai: 'walker'
    }
  };
  T.ENEMY_DEFS = ENEMY_DEFS;

  function rects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  class Enemy {
    constructor(game, defId, x, y) {
      this.game = game;
      this.kind = defId;
      const d = ENEMY_DEFS[defId];
      this.def = d;
      this.name = d.name;
      this.maxHp = d.hp;
      this.hp = d.hp;
      this.dmg = d.dmg;
      this.w = d.w;
      this.h = d.h;
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.speed = d.speed;
      this.dir = Math.random() < 0.5 ? -1 : 1;
      this.grounded = false;
      this.hurtT = 0;
      this.aiT = Math.random() * 2;
      this.animT = Math.random() * 10;
      this.dead = false;
      this.attackCd = 0;
      this.jumpCd = Math.random();
      this.shootCd = 1 + Math.random() * 2;
      this.spawnT = 0;
      this.target = null;
      this.aggro = false;
      this.noGravity = d.ai === 'flyer';
      this.element = d.fire ? 'fire' : 'none';
      this.hitFlash = 0;
      this.knockResist = d.ai === 'slime' ? 0.55 : 0.75;
      this.state = 'idle';
      this.alpha = 1;
      this.leapT = 0;
      this.travelled = 0;
      this.bossMinion = false;
      this.scale = 1;
    }

    get cx() { return this.x + this.w / 2; }
    get cy() { return this.y + this.h / 2; }

    rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

    update(dt) {
      if (this.dead) return;
      const game = this.game;
      const world = game.world;
      const p = game.player;
      this.animT += dt;
      if (this.hurtT > 0) this.hurtT -= dt;
      if (this.hitFlash > 0) this.hitFlash -= dt * 4;
      if (this.attackCd > 0) this.attackCd -= dt;
      if (this.spawnT > 0) { this.spawnT -= dt; }
      const dxp = p.x - this.cx;
      const dyp = (p.y - p.h / 2) - this.cy;
      const dist = Math.hypot(dxp, dyp);
      if (dist < 420 && !p.dead) this.aggro = true;
      if (dist > 900) this.aggro = false;
      if (Math.abs(this.x - p.x) > 2400 && !this.boss) { this.dead = true; this.silent = true; return; }

      switch (this.def.ai) {
        case 'slime': this.aiSlime(dt, dxp, dist); break;
        case 'walker': this.aiWalker(dt, dxp, dyp, dist); break;
        case 'flyer': this.aiFlyer(dt, dxp, dyp, dist); break;
        case 'swimmer': this.aiSwimmer(dt, dxp, dyp, dist); break;
        case 'burrow': this.aiBurrow(dt, dxp, dist); break;
        default: this.aiWalker(dt, dxp, dyp, dist);
      }
      if (this.def.shoot && this.aggro && dist < 460) {
        this.shootCd -= dt;
        if (this.shootCd <= 0) {
          this.shootCd = 2.2 + Math.random() * 1.4;
          this.shootAt(def_shoot(this), dxp, dyp);
        }
      }
      if (!this.noGravity) this.gravity(dt);
      else this.noClipMove(dt);
      this.contactDamage(dt);
      if (this.hp <= 0) this.die();

      function def_shoot(e) { return e.def.shoot; }
    }

    aiSlime(dt, dxp, dist) {
      const game = this.game;
      this.jumpCd -= dt;
      if (this.grounded) {
        this.vx *= Math.pow(0.001, dt);
        if (this.jumpCd <= 0 && this.aggro && dist < 460) {
          this.jumpCd = 0.9 + Math.random() * 0.8;
          this.dir = dxp > 0 ? 1 : -1;
          this.vy = -(this.def.jump || 280);
          this.vx = this.dir * this.speed * 1.2;
          this.leapT = 0.35;
        } else if (this.jumpCd <= 0) {
          this.jumpCd = 1.4 + Math.random() * 1.6;
          if (Math.random() < 0.5) {
            this.dir = Math.random() < 0.5 ? -1 : 1;
            this.vy = -(this.def.jump || 260) * 0.6;
            this.vx = this.dir * this.speed * 0.7;
          }
        }
      }
      if (this.leapT > 0) this.leapT -= dt;
      this.moveAndCollide(dt);
    }

    aiWalker(dt, dxp, dyp, dist) {
      if (this.aggro) this.dir = dxp > 0 ? 1 : -1;
      else if (Math.random() < dt * 0.4) this.dir *= -1;
      const slow = this.hitFlash > 0 ? 0.4 : 1;
      this.vx = this.dir * this.speed * slow;
      const world = this.game.world;
      const frontX = this.dir > 0 ? this.x + this.w + 2 : this.x - 2;
      const footY = this.y + this.h + 2;
      const wallAhead = T.isSolid(world.getTile(Math.floor(frontX / TS), Math.floor((this.y + this.h * 0.5) / TS)));
      const groundAhead = T.isSolid(world.getTile(Math.floor(frontX / TS), Math.floor(footY / TS)));
      if ((wallAhead || (!groundAhead && this.grounded)) && this.grounded) {
        if (!groundAhead && this.aggro) {
          this.vy = -330;
          this.vx = this.dir * this.speed;
        } else {
          this.dir *= -1;
        }
      }
      this.moveAndCollide(dt);
    }

    aiFlyer(dt, dxp, dyp, dist) {
      const t = this.animT;
      if (this.aggro) {
        const sp = this.speed;
        const nx = dxp / (dist || 1), ny = dyp / (dist || 1);
        const swoop = Math.sin(t * 2.4) * 0.55;
        this.vx = T.lerp(this.vx, nx * sp + Math.cos(t * 1.4) * 28, dt * 3.4);
        this.vy = T.lerp(this.vy, ny * sp + Math.sin(t * 2.8) * 34 + swoop * 30, dt * 3.2);
        if (this.state === 'idle' && dist < 260) this.state = 'chase';
      } else if (this.state === 'orbit' || Math.random() < dt) {
        this.vx = T.lerp(this.vx, Math.cos(t * 0.9) * 40, dt * 2);
        this.vy = T.lerp(this.vy, Math.sin(t * 1.3) * 30, dt * 2);
      }
      if (this.def.ai === 'flyer' && this.def.name === '洞穴蝙蝠') {
        this.vy += Math.sin(t * 6) * 40 * dt;
      }
      this.dir = this.vx > 2 ? 1 : this.vx < -2 ? -1 : this.dir;
      this.noClipMove(dt);
    }

    aiSwimmer(dt, dxp, dyp, dist) {
      if (this.aggro) {
        this.vx = T.lerp(this.vx, T.sign(dxp) * this.speed, dt * 4);
        this.vy = T.lerp(this.vy, T.sign(dyp) * this.speed * 0.6, dt * 4);
      } else {
        this.vx = T.lerp(this.vx, Math.cos(this.animT * 1.2) * 30, dt * 2);
        this.vy = T.lerp(this.vy, Math.sin(this.animT * 1.7) * 20, dt * 2);
      }
      if (this.vx > 2) this.dir = 1;
      else if (this.vx < -2) this.dir = -1;
      this.noClipMove(dt);
    }

    aiBurrow(dt, dxp, dist) {
      const world = this.game.world;
      this.animT2 = (this.animT2 || 0) + dt;
      const p = this.game.player;
      if (!this.aggro) {
        this.vx *= 0.9;
        this.vy *= 0.9;
      } else if (this.animT2 % 3 < 1.1) {
        const a = Math.atan2((p.y - p.h / 2) - this.cy, p.x - this.cx);
        this.vx = Math.cos(a) * this.speed;
        this.vy = Math.sin(a) * this.speed;
      } else {
        this.vx *= 0.92;
        this.vy *= 0.92;
      }
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (Math.random() < dt * 12) {
        this.game.particles.burst(this.cx, this.cy, 1, { color: ['#8a6a4a', '#a87a5a'], speed: 20, life: 0.4, gravity: 120 });
      }
    }

    shootAt(kind, dxp, dyp) {
      const game = this.game;
      const a = Math.atan2(dyp, dxp);
      const sp = kind === 'fireball' ? 230 : kind === 'feather' ? 260 : 210;
      game.spawnProjectile(kind, this.cx, this.cy, Math.cos(a) * sp, Math.sin(a) * sp, this.dmg * 0.8, { owner: 'enemy', life: 3 });
      game.audio.play('shoot');
    }

    gravity(dt) {
      const world = this.game.world;
      const inWater = world.waterAt(Math.floor(this.cx / TS), Math.floor(this.cy / TS)) > 0;
      this.vy += (inWater ? 320 : 1500) * dt;
      this.vy = Math.min(this.vy, 900);
      if (inWater) this.vy = Math.min(this.vy, 90);
    }

    moveAndCollide(dt) {
      const world = this.game.world;
      this.x += this.vx * dt;
      let x0 = Math.floor(this.x / TS), x1 = Math.floor((this.x + this.w - 0.01) / TS);
      let y0 = Math.floor(this.y / TS), y1 = Math.floor((this.y + this.h - 0.01) / TS);
      for (let ty = y0; ty <= y1; ty++) {
        for (let tx = x0; tx <= x1; tx++) {
          if (T.isSolid(world.getTile(tx, ty))) {
            if (this.vx > 0) this.x = tx * TS - this.w - 0.01;
            else if (this.vx < 0) this.x = (tx + 1) * TS + 0.01;
            this.vx = 0;
            break;
          }
        }
      }
      this.grounded = false;
      this.y += this.vy * dt;
      x0 = Math.floor(this.x / TS); x1 = Math.floor((this.x + this.w - 0.01) / TS);
      y0 = Math.floor(this.y / TS); y1 = Math.floor((this.y + this.h - 0.01) / TS);
      if (this.vy >= 0) {
        const footTy = Math.floor((this.y + this.h) / TS);
        for (let tx = x0; tx <= x1; tx++) {
          const tt = world.getTile(tx, footTy);
          if (T.isSolid(tt) || (T.isPlatform(tt) && this.y + this.h - this.vy * dt <= footTy * TS + 4)) {
            this.y = footTy * TS - this.h - 0.01;
            this.vy = 0;
            this.grounded = true;
            break;
          }
        }
      } else {
        const headTy = Math.floor(this.y / TS);
        for (let tx = x0; tx <= x1; tx++) {
          if (T.isSolid(world.getTile(tx, headTy))) {
            this.y = (headTy + 1) * TS + 0.01;
            this.vy = 0;
            break;
          }
        }
      }
      const worldPxW = world.W * TS;
      if (this.x < -200) this.x = -200;
      if (this.x > worldPxW + 200) this.x = worldPxW + 200;
      if (this.y > world.H * TS + 100) { this.dead = true; this.silent = true; }
    }

    noClipMove(dt) {
      const world = this.game.world;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      const tx = Math.floor(this.cx / TS);
      const ty = Math.floor(this.cy / TS);
      if (this.def.ai === 'flyer') {
        if (T.isSolid(world.getTile(tx, ty))) {
          this.x -= this.vx * dt * 1.2;
          this.y -= this.vy * dt * 1.2;
          this.vx *= -0.6;
          this.vy *= -0.6;
        }
      }
      const worldPxW = world.W * TS;
      this.x = T.clamp(this.x, 0, worldPxW - this.w);
      this.y = T.clamp(this.y, 0, world.H * TS - this.h - 1);
    }

    contactDamage(dt) {
      if (this.dead) return;
      const p = this.game.player;
      if (p.dead) return;
      const pr = p.rect();
      if (!rects(this.rect(), pr)) return;
      if (p.iframe > 0) return;
      p.hurt(this.dmg, this.cx, { knock: 210 });
      const a = Math.atan2(p.y - this.cy, p.x - this.cx);
      this.vx -= Math.cos(a) * 60;
      this.vy -= Math.sin(a) * 60;
    }

    hurt(dmg, opts) {
      if (this.dead) return 0;
      opts = opts || {};
      let dmgMul = 1;
      if (opts.crit) dmgMul = 2;
      const final = Math.max(1, Math.round(dmg * dmgMul));
      this.hp -= final;
      this.hitFlash = 1;
      this.hurtT = 0.18;
      this.aggro = true;
      const knock = (opts.knock || 4) * 26 * this.knockResist;
      const a = opts.angle !== undefined ? opts.angle : Math.atan2(this.cy - (this.game.player.y - this.game.player.h / 2), this.cx - this.game.player.x);
      this.vx += Math.cos(a) * knock;
      this.vy += Math.sin(a) * knock * 0.7;
      if (!this.noGravity) this.vy -= 20;
      this.game.particles.text(this.cx, this.y - 6, (opts.crit ? '!' : '') + final, opts.crit ? '#ffd24a' : '#ffffff');
      this.game.particles.burst(this.cx, this.cy, opts.crit ? 12 : 6, {
        color: [this.def.color, '#ffffff', '#c03040'], speed: 90, life: 0.4, gravity: 320, size: 2
      });
      this.game.audio.play('hit');
      if (opts.element === 'fire' || (opts.burn)) {
        this.burnT = 3;
      }
      if (this.hp <= 0) this.die();
      return final;
    }

    die() {
      if (this.dead) return;
      this.dead = true;
      const game = this.game;
      if (!this.silent) {
        game.audio.play('kill');
        game.particles.burst(this.cx, this.cy, 16, {
          color: [this.def.color, '#ffffff', '#8a2030'], speed: 130, life: 0.7, gravity: 380, size: 2.6
        });
        game.particles.burst(this.cx, this.cy, 8, {
          color: ['rgba(120,120,140,0.5)'], speed: 50, life: 0.8, gravity: -30, kind: 'smoke'
        });
        game.player.stats.kills++;
        game.stats.kills++;
        if (this.def.drops) {
          for (const d of this.def.drops) {
            if (Math.random() <= (d.chance === undefined ? 1 : d.chance)) {
              const n = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
              for (let i = 0; i < Math.min(n, 6); i++) {
                game.dropItem(this.cx, this.cy, d.id, d.id.indexOf('coin') === 0 ? n : 1);
              }
            }
          }
        }
        if (this.bossMinion && this.game.boss.active) this.game.boss.onMinionKilled();
      }
      game.onEnemyKilled(this);
    }

    draw(ctx, cam, zoom, vw, vh) {
      const p = this.game.renderer.worldToScreen(cam, this.cx, this.y);
      const s = zoom * this.scale;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(this.dir, 1);
      if (this.hitFlash > 0) ctx.globalAlpha = 0.95;
      const col = this.def.color;
      const t = this.animT;
      const flash = this.hitFlash > 0;
      switch (this.def.ai) {
        case 'slime': this.drawSlime(ctx, s, col, t, flash); break;
        case 'walker': this.drawWalker(ctx, s, col, t, flash); break;
        case 'flyer': this.drawFlyer(ctx, s, col, t, flash); break;
        case 'swimmer': this.drawSwimmer(ctx, s, col, t, flash); break;
        case 'burrow': this.drawWorm(ctx, s, col, t, flash); break;
        default: this.drawWalker(ctx, s, col, t, flash);
      }
      ctx.restore();
      if (this.hp < this.maxHp) {
        const w = Math.max(26, this.w * zoom);
        const sp = this.game.renderer.worldToScreen(cam, this.cx, this.y - 8);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(sp.x - w / 2 - 1, sp.y - 5, w + 2, 5);
        ctx.fillStyle = '#c83040';
        ctx.fillRect(sp.x - w / 2, sp.y - 4, w * Math.max(0, this.hp / this.maxHp), 3);
      }
    }

    drawSlime(ctx, s, col, t, flash) {
      const moving = Math.abs(this.vx) > 8 || !this.grounded;
      const stretch = this.grounded ? 1 + Math.sin(t * 7) * 0.06 : 1.12;
      const hh = this.h * s / stretch;
      const ww = this.w * s * stretch;
      const eyeY = -hh * 0.56;
      const g = ctx.createRadialGradient(-ww * 0.16, -hh * 0.72, 1, 0, -hh * 0.5, ww * 0.82);
      g.addColorStop(0, flash ? '#ffffff' : T.shade(col, 0.55));
      g.addColorStop(0.42, flash ? '#ffffff' : T.shade(col, 0.18));
      g.addColorStop(0.82, flash ? '#ffffff' : col);
      g.addColorStop(1, flash ? '#ffffff' : T.shade(col, -0.42));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-ww / 2, 0);
      ctx.bezierCurveTo(-ww / 2, -hh * 1.02, ww / 2, -hh * 1.02, ww / 2, 0);
      ctx.bezierCurveTo(ww * 0.28, 3.4 * s, -ww * 0.28, 3.4 * s, -ww / 2, 0);
      ctx.fill();
      ctx.strokeStyle = flash ? '#ffffff' : 'rgba(0,0,0,0.28)';
      ctx.lineWidth = 1.1 * s;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.ellipse(-ww * 0.2, -hh * 0.74, ww * 0.11, hh * 0.1, -0.3, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath();
      ctx.ellipse(ww * 0.22, -hh * 0.62, ww * 0.05, hh * 0.06, 0.4, 0, 6.283);
      ctx.fill();
      const eyeR = Math.max(1.6, 2.1 * s);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ww * 0.12, eyeY, eyeR * 1.15, eyeR * 1.3, 0, 0, 6.283);
      ctx.ellipse(ww * 0.34, eyeY, eyeR * 1.15, eyeR * 1.3, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#181018';
      ctx.beginPath();
      ctx.arc(ww * 0.14, eyeY + 0.3 * s, eyeR * 0.62, 0, 6.283);
      ctx.arc(ww * 0.36, eyeY + 0.3 * s, eyeR * 0.62, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(ww * 0.1, eyeY - 0.4 * s, eyeR * 0.22, 0, 6.283);
      ctx.arc(ww * 0.32, eyeY - 0.4 * s, eyeR * 0.22, 0, 6.283);
      ctx.fill();
      if (this.def.fire) {
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) {
          const fx = -ww * 0.2 + Math.sin(t * 3 + i * 2) * ww * 0.2;
          const fy = -hh * 1.05 - i * 3;
          ctx.fillStyle = 'rgba(255,' + (170 - i * 40) + ',60,' + (0.4 - i * 0.1) + ')';
          ctx.beginPath();
          ctx.ellipse(fx, fy, 3.2 * s, 5 * s, 0, 0, 6.283);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    drawWalker(ctx, s, col, t, flash) {
      const hh = this.h * s, ww = this.w * s;
      const speed = T.clamp(Math.abs(this.vx) / 60, 0, 1.3);
      const phase = Math.sin(t * 8) * speed;
      const name = this.def.name;
      const dark = flash ? '#ffffff' : T.shade(col, -0.42);
      const mid = flash ? '#ffffff' : T.shade(col, -0.1);
      const light = flash ? '#ffffff' : T.shade(col, 0.28);
      const hip = -hh * 0.44;
      const drawLeg = (side, angle) => {
        ctx.save();
        ctx.translate(side * ww * 0.14, hip);
        ctx.rotate(angle);
        ctx.strokeStyle = dark;
        ctx.lineWidth = 4.6 * s;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, hh * 0.24);
        ctx.stroke();
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.ellipse(1.6 * s, hh * 0.26, 3.4 * s, 1.9 * s, 0, 0, 6.283);
        ctx.fill();
        ctx.restore();
      };
      drawLeg(-1, phase * 0.5);
      drawLeg(1, -phase * 0.5);

      if (name === '僵尸') {
        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.moveTo(-ww * 0.34, hip);
        ctx.lineTo(-ww * 0.3, -hh * 0.74);
        ctx.quadraticCurveTo(0, -hh * 0.86, ww * 0.3, -hh * 0.74);
        ctx.lineTo(ww * 0.34, hip);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = dark;
        ctx.fillRect(-ww * 0.32, hip - 2 * s, ww * 0.64, 3 * s);
        ctx.fillStyle = flash ? '#ffffff' : '#9fb89a';
        ctx.beginPath();
        ctx.ellipse(0, -hh * 0.86, ww * 0.3, hh * 0.12, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#2c3a2a';
        ctx.beginPath();
        ctx.ellipse(-ww * 0.1, -hh * 0.88, 2.6 * s, 2.4 * s, 0, 0, 6.283);
        ctx.ellipse(ww * 0.12, -hh * 0.88, 2.6 * s, 2.4 * s, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#e04a4a';
        ctx.beginPath();
        ctx.arc(-ww * 0.09, -hh * 0.88, 1.1 * s, 0, 6.283);
        ctx.arc(ww * 0.13, -hh * 0.88, 1.1 * s, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#e8ded0';
        ctx.fillRect(-ww * 0.08, -hh * 0.8, ww * 0.16, 1.6 * s);
        ctx.save();
        ctx.translate(ww * 0.22, -hh * 0.68);
        ctx.rotate(-1.15 + Math.sin(t * 4) * 0.18);
        ctx.strokeStyle = mid;
        ctx.lineWidth = 4.4 * s;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, hh * 0.26);
        ctx.stroke();
        ctx.fillStyle = '#9fb89a';
        ctx.beginPath();
        ctx.arc(0, hh * 0.28, 2.8 * s, 0, 6.283);
        ctx.fill();
        ctx.restore();
      } else if (name === '骷髅') {
        ctx.strokeStyle = flash ? '#ffffff' : '#d8d0bc';
        ctx.lineWidth = 3.2 * s;
        ctx.beginPath();
        ctx.moveTo(0, -hh * 0.72);
        ctx.lineTo(0, hip);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const ry = -hh * 0.68 + i * hh * 0.06;
          ctx.beginPath();
          ctx.ellipse(0, ry, ww * 0.24 - i * 1.2 * s, 2.4 * s, 0, 0, 6.283);
          ctx.stroke();
        }
        ctx.fillStyle = flash ? '#ffffff' : '#e8e0cc';
        ctx.beginPath();
        ctx.ellipse(0, -hh * 0.84, ww * 0.3, hh * 0.11, 0, 0, 6.283);
        ctx.fill();
        ctx.fillRect(-ww * 0.22, -hh * 0.78, ww * 0.44, 2.2 * s);
        ctx.fillStyle = '#1a1418';
        ctx.beginPath();
        ctx.ellipse(-ww * 0.11, -hh * 0.85, 3 * s, 3.4 * s, 0, 0, 6.283);
        ctx.ellipse(ww * 0.11, -hh * 0.85, 3 * s, 3.4 * s, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#ff6a4a';
        ctx.beginPath();
        ctx.arc(-ww * 0.11, -hh * 0.85, 1.3 * s, 0, 6.283);
        ctx.arc(ww * 0.11, -hh * 0.85, 1.3 * s, 0, 6.283);
        ctx.fill();
        ctx.strokeStyle = flash ? '#ffffff' : '#d8d0bc';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(ww * 0.2, -hh * 0.66);
        ctx.lineTo(ww * 0.4, -hh * 0.44 + Math.sin(t * 5) * 3 * s);
        ctx.moveTo(-ww * 0.2, -hh * 0.66);
        ctx.lineTo(-ww * 0.4, -hh * 0.46 - Math.sin(t * 5) * 3 * s);
        ctx.stroke();
      } else if (name === '蚁狮') {
        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.ellipse(0, -hh * 0.55, ww * 0.5, hh * 0.32, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.ellipse(-ww * 0.28, -hh * 0.58, ww * 0.22, hh * 0.2, -0.3, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = light;
        ctx.beginPath();
        ctx.ellipse(ww * 0.22, -hh * 0.72, ww * 0.2, hh * 0.14, 0.2, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#2a1c10';
        ctx.beginPath();
        ctx.arc(ww * 0.28, -hh * 0.76, 1.8 * s, 0, 6.283);
        ctx.fill();
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = dark;
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(-ww * 0.2 + i * ww * 0.2, -hh * 0.34);
          ctx.lineTo(-ww * 0.26 + i * ww * 0.2, 0);
          ctx.stroke();
        }
      } else if (name === '琵琶鱼' || name === '食人鱼') {
        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.ellipse(0, -hh * 0.5, ww * 0.48, hh * 0.36, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.moveTo(-ww * 0.4, -hh * 0.5);
        ctx.lineTo(-ww * 0.72, -hh * 0.5 + Math.sin(t * 12) * hh * 0.26);
        ctx.lineTo(-ww * 0.4, -hh * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f0ece0';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(ww * 0.06 + i * 4 * s, -hh * 0.36);
          ctx.lineTo(ww * 0.1 + i * 4 * s, -hh * 0.28);
          ctx.lineTo(ww * 0.02 + i * 4 * s, -hh * 0.28);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = '#f8f0e0';
        ctx.beginPath();
        ctx.arc(ww * 0.24, -hh * 0.62, 2.6 * s, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#101010';
        ctx.beginPath();
        ctx.arc(ww * 0.26, -hh * 0.62, 1.4 * s, 0, 6.283);
        ctx.fill();
        if (name === '琵琶鱼') {
          ctx.strokeStyle = '#8ad0c0';
          ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.moveTo(ww * 0.2, -hh * 0.8);
          ctx.quadraticCurveTo(ww * 0.5, -hh * 1.05, ww * 0.62, -hh * 0.82);
          ctx.stroke();
          ctx.fillStyle = 'rgba(150,255,230,0.9)';
          ctx.beginPath();
          ctx.arc(ww * 0.62, -hh * 0.82, 2.2 * s, 0, 6.283);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.moveTo(-ww * 0.32, hip);
        ctx.quadraticCurveTo(-ww * 0.36, -hh * 0.7, 0, -hh * 0.78);
        ctx.quadraticCurveTo(ww * 0.36, -hh * 0.7, ww * 0.32, hip);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.ellipse(0, -hh * 0.84, ww * 0.28, hh * 0.1, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#ff5a4a';
        ctx.beginPath();
        ctx.arc(ww * 0.12, -hh * 0.85, 1.5 * s, 0, 6.283);
        ctx.fill();
        ctx.strokeStyle = dark;
        ctx.lineWidth = 3.4 * s;
        ctx.beginPath();
        ctx.moveTo(ww * 0.18, -hh * 0.66);
        ctx.lineTo(ww * 0.42, -hh * 0.44 + Math.sin(t * 5) * 2.4 * s);
        ctx.stroke();
      }
    }
    drawFlyer(ctx, s, col, t, flash) {
      const hh = this.h * s, ww = this.w * s;
      const flap = Math.sin(t * 16) * 0.9;
      ctx.fillStyle = flash ? '#ffffff' : col;
      const wingW = ww * 1.5;
      ctx.beginPath();
      ctx.ellipse(0, -hh * 0.55, wingW * (0.5 + flap * 0.18), hh * 0.28, -0.25 + flap * 0.35, 0, 6.283);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-2 * s, -hh * 0.55, wingW * (0.5 + flap * 0.18), hh * 0.26, 0.25 - flap * 0.35, 0, 6.283);
      ctx.fillStyle = T.shade(col, -0.15);
      ctx.fill();
      ctx.fillStyle = flash ? '#ffffff' : col;
      ctx.beginPath();
      ctx.ellipse(0, -hh * 0.5, ww * 0.42, hh * 0.5, 0, 0, 6.283);
      ctx.fill();
      if (this.def.name === '恶魔之眼') {
        ctx.fillStyle = '#f0e8e0';
        ctx.beginPath();
        ctx.arc(ww * 0.16, -hh * 0.56, ww * 0.26, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#3a1018';
        ctx.beginPath();
        ctx.arc(ww * 0.2, -hh * 0.56, ww * 0.12, 0, 6.283);
        ctx.fill();
      } else if (this.def.name === '洞穴蝙蝠') {
        ctx.fillStyle = '#2a2028';
        ctx.beginPath();
        ctx.arc(ww * 0.22, -hh * 0.5, 2.2 * s, 0, 6.283);
        ctx.fill();
      } else {
        ctx.fillStyle = this.def.fire ? '#ffe0a0' : '#201818';
        ctx.beginPath();
        ctx.arc(ww * 0.2, -hh * 0.58, 2.4 * s, 0, 6.283);
        ctx.fill();
      }
    }

    drawSwimmer(ctx, s, col, t, flash) {
      const hh = this.h * s, ww = this.w * s;
      ctx.fillStyle = flash ? '#ffffff' : col;
      ctx.beginPath();
      ctx.ellipse(0, -hh * 0.5, ww * 0.55, hh * 0.45, 0, 0, 6.283);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-ww * 0.4, -hh * 0.5);
      ctx.lineTo(-ww * 0.75, -hh * 0.5 + Math.sin(t * 10) * hh * 0.3);
      ctx.lineTo(-ww * 0.4, -hh * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ww * 0.25, -hh * 0.62, 2.4 * s, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#201818';
      ctx.beginPath();
      ctx.arc(ww * 0.27, -hh * 0.62, 1.3 * s, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ww * 0.42, -hh * 0.5);
      ctx.lineTo(ww * 0.6, -hh * 0.42);
      ctx.stroke();
    }

    drawWorm(ctx, s, col, t, flash) {
      const hh = this.h * s, ww = this.w * s;
      ctx.fillStyle = flash ? '#ffffff' : col;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-i * ww * 0.26, -hh * 0.5 + Math.sin(t * 8 - i * 0.7) * hh * 0.18, hh * (0.5 - i * 0.06), 0, 6.283);
        ctx.fill();
      }
      ctx.fillStyle = '#2a1818';
      ctx.beginPath();
      ctx.arc(ww * 0.1, -hh * 0.6, 2 * s, 0, 6.283);
      ctx.fill();
    }
  }

  class Boss {
    constructor(game, kind) {
      this.game = game;
      this.kind = kind;
      this.dead = false;
      this.parts = [];
      this.time = 0;
      this.phase = 1;
      this.defeated = false;
      this.introT = 2.2;
      this.minions = 0;
      const p = game.player;
      this.x = p.x;
      this.y = p.y;
      this.vx = 0;
      this.vy = 0;
      this.maxHp = 100;
      this.hp = 100;
      this.name = '';
      this.bossBar = true;
      this.hurtT = 0;
      this.hitFlash = 0;
      this.dir = 1;
      this.aggro = true;
      this.shootCd = 2;
      this.dashCd = 3;
      this.attackCd = 1.5;
      this.animT = 0;
      this.spawnT = 0;
      this.noGravity = true;
      this.isBoss = true;
      this.knockResist = 0.95;
      this.def = { color: '#c04a5a', ai: 'boss' };
      if (kind === 'eye') this.initEye();
      else if (kind === 'eater') this.initEater();
      else if (kind === 'skeletron') this.initSkeletron();
      else if (kind === 'wof') this.initWof();
      else if (kind === 'king_slime') this.initKingSlime();
      else if (kind === 'queen_bee') this.initQueenBee();
    }

    initKingSlime() {
      this.name = '史莱姆王';
      this.maxHp = 2200;
      this.hp = 2200;
      this.w = 104;
      this.h = 78;
      this.dmg = 22;
      this.def = { color: '#3a6ad8', ai: 'boss' };
      this.phase = 1;
      this.jumpCd = 1.2;
      this.teleportCd = 7;
      this.crown = true;
    }

    initQueenBee() {
      this.name = '蜂后';
      this.maxHp = 3400;
      this.hp = 3400;
      this.w = 92;
      this.h = 74;
      this.dmg = 26;
      this.def = { color: '#e0b020', ai: 'boss' };
      this.phase = 1;
      this.hoverT = 0;
      this.chargeCd = 3.4;
      this.dashA = 0;
      this.dashing = 0;
      this.stingerCd = 1.2;
    }

    initEye() {
      this.name = '克苏鲁之眼';
      this.maxHp = 2800;
      this.hp = 2800;
      this.w = 96;
      this.h = 96;
      this.def = { color: '#c04a5a', ai: 'boss' };
      this.dmg = 26;
      this.phase = 1;
      this.spawnY = -260;
    }

    initEater() {
      this.name = '世界吞噬者';
      this.maxHp = 4200;
      this.hp = 4200;
      this.w = 42;
      this.h = 42;
      this.def = { color: '#8a5ac0', ai: 'boss' };
      this.dmg = 24;
      this.segments = [];
      let sx = this.x, sy = this.y;
      for (let i = 0; i < 24; i++) {
        this.segments.push({ x: sx, y: sy, vx: 0, vy: 0, hp: 60, maxHp: 60, dead: false, size: i === 0 ? 26 : 22 - i * 0.2 });
        sx -= 20;
      }
      this.head = this.segments[0];
      this.w = 52;
      this.h = 52;
    }

    initSkeletron() {
      this.name = '骷髅王';
      this.maxHp = 6000;
      this.hp = 6000;
      this.w = 120;
      this.h = 110;
      this.dmg = 32;
      this.def = { color: '#d8d0c0', ai: 'boss' };
      this.hands = [
        { x: this.x - 180, y: this.y - 40, hp: 800, maxHp: 800, dead: false, active: true, atkCd: 2 },
        { x: this.x + 180, y: this.y - 40, hp: 800, maxHp: 800, dead: false, active: true, atkCd: 3 }
      ];
      this.spin = 0;
      this.spinning = false;
    }

    initWof() {
      this.name = '血肉之墙';
      this.maxHp = 8000;
      this.hp = 8000;
      this.w = 120;
      this.h = 360;
      this.dmg = 36;
      this.def = { color: '#c8402a', ai: 'boss' };
      this.dir = 1;
      this.eyes = [
        { x: this.x, y: this.y - 60, hp: 500, maxHp: 500, dead: false, cd: 2 },
        { x: this.x, y: this.y + 40, hp: 500, maxHp: 500, dead: false, cd: 3 },
        { x: this.x, y: this.y + 130, hp: 500, maxHp: 500, dead: false, cd: 2.6 }
      ];
      this.mouthCd = 3;
      this.y = this.game.player.y - this.h / 2;
    }
    get cx() { return this.x; }
    get cy() { return this.y; }

    rect() {
      if (this.kind === 'wof') return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h };
      return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h };
    }

    update(dt) {
      if (this.dead) return;
      const game = this.game;
      const p = game.player;
      this.animT += dt;
      this.time += dt;
      if (this.hurtT > 0) this.hurtT -= dt;
      if (this.hitFlash > 0) this.hitFlash -= dt * 4;
      if (this.introT > 0) { this.introT -= dt; }
      if (this.kind !== 'wof') {
        if (p.y > 1400 && this.kind !== 'skeletron') {
        }
      } else if (this.introT <= 0) {
        const halfScreen = game.renderer.vw / 2 / game.renderer.zoom;
        const dir = this.x > p.x ? 1 : -1;
        this.dir = dir;
        this.x = T.lerp(this.x, p.x + dir * halfScreen * 0.7, dt * 1.6);
        const lo = game.world.surfaceHeightAt(this.x / TS) * TS;
        const targetY = Math.max(p.y, lo) - this.h * 0.32;
        this.y = T.lerp(this.y, targetY, dt * 1.8);
      }
      if (this.introT > 0) return;

      const dx = p.x - this.x, dy = (p.y - p.h / 2) - this.y;
      const dist = Math.hypot(dx, dy);

      if (this.kind === 'wof') {
        const halfScreen = game.renderer.vw / 2 / game.renderer.zoom;
        const offset = this.dir > 0 ? -halfScreen * 0.72 : halfScreen * 0.72;
        const desiredX = p.x + offset;
        this.x = T.lerp(this.x, desiredX, dt * 2.2);
        const lo = game.world.surfaceHeightAt(this.x / TS) * TS;
        const desiredY = Math.max(p.y - p.h * 0.25, lo - this.h * 0.4);
        this.y = T.lerp(this.y, desiredY, dt * 2.0);
        if (Math.abs(this.x - desiredX) > halfScreen * 1.2) this.x = desiredX;
      }

      if (this.kind === 'eye') this.updateEye(dt, dx, dy, dist, p);
      else if (this.kind === 'eater') this.updateEater(dt, dx, dy, dist, p);
      else if (this.kind === 'skeletron') this.updateSkeletron(dt, dx, dy, dist, p);
      else if (this.kind === 'wof') this.updateWof(dt, dx, dy, dist, p);
      else if (this.kind === 'king_slime') this.updateKingSlime(dt, dx, dy, dist, p);
      else if (this.kind === 'queen_bee') this.updateQueenBee(dt, dx, dy, dist, p);

      if (this.kind !== 'eater') {
        if (this.kind !== 'wof') {
          const pr = p.rect();
          if (rects(this.rect(), pr) && p.iframe <= 0) {
            p.hurt(this.dmg, this.x, { knock: 320 });
          }
        }
      }
      if (this.hp <= 0) this.die();
    }

    updateKingSlime(dt, dx, dy, dist, p) {
      const game = this.game;
      this.phase = this.hp < this.maxHp * 0.5 ? 2 : 1;
      this.vy += 1900 * dt;
      this.y += this.vy * dt;
      this.x += this.vx * dt;
      const ground = game.world.surfaceHeightAt(this.x / TS) * TS;
      if (this.y > ground) {
        this.y = ground;
        if (this.vy > 260) {
          game.shake(7, 0.2);
          this.game.audio.play('land');
          game.particles.burst(this.x, this.y, 16, { color: ['#4a7ad8', '#8ab4ff', '#dfe8ff'], speed: 160, life: 0.6, gravity: 420 });
          if (this.phase === 2 && Math.random() < 0.5) {
            for (let i = 0; i < 2; i++) {
              const e = game.spawnEnemyAt('slime_blue', this.x + (i === 0 ? -50 : 50), this.y - 60);
              if (e) e.bossMinion = true;
            }
          }
        }
        this.vy = 0;
        this.vx *= 0.72;
        this.jumpCd -= dt;
        if (this.jumpCd <= 0) {
          this.jumpCd = this.phase === 2 ? 0.9 : 1.5;
          const dir = p.x > this.x ? 1 : -1;
          this.vx = dir * (this.phase === 2 ? 300 : 210);
          this.vy = -(this.phase === 2 ? 820 : 700);
        }
      }
      this.teleportCd -= dt;
      if (this.teleportCd <= 0 && this.phase === 2) {
        this.teleportCd = 9;
        game.particles.burst(this.x, this.y - this.h / 2, 24, { color: ['#b0d0ff', '#ffffff'], speed: 180, life: 0.7, gravity: 0 });
        this.x = p.x + (Math.random() < 0.5 ? -240 : 240);
        this.y = p.y - 260;
        this.vy = 0;
        game.particles.burst(this.x, this.y, 24, { color: ['#b0d0ff', '#ffffff'], speed: 180, life: 0.7, gravity: 0 });
      }
      this.dir = p.x > this.x ? 1 : -1;
    }

    updateQueenBee(dt, dx, dy, dist, p) {
      const game = this.game;
      this.phase = this.hp < this.maxHp * 0.5 ? 2 : 1;
      this.chargeCd -= dt;
      this.stingerCd -= dt;
      if (this.dashing > 0) {
        this.dashing -= dt;
        this.x += Math.cos(this.dashA) * 520 * dt;
        this.y += Math.sin(this.dashA) * 520 * dt;
        if (Math.random() < dt * 30) {
          game.particles.spawn({
            x: this.x + (Math.random() - 0.5) * 40, y: this.y + (Math.random() - 0.5) * 30,
            vx: 0, vy: 0, life: 0, max: 0.4, size: 3, color: 'rgba(255,220,120,0.6)', gravity: 0, glow: true
          });
        }
      } else {
        this.hoverT += dt;
        const halfW = game.renderer.vw / 2 / game.renderer.zoom;
        const camTop = game.cam.y - game.renderer.vh / 2 / game.renderer.zoom;
        const hoverX = T.clamp(p.x + Math.cos(this.hoverT * 1.6) * 140, p.x - halfW * 0.55, p.x + halfW * 0.55);
        const hoverY = Math.max(p.y - 135 + Math.sin(this.hoverT * 2.2) * 40, camTop + 160);
        this.x = T.lerp(this.x, hoverX, dt * 2.4);
        this.y = T.lerp(this.y, hoverY, dt * 2.4);
        if (this.chargeCd <= 0) {
          this.chargeCd = this.phase === 2 ? 2.0 : 3.6;
          this.dashing = 0.6;
          this.dashA = Math.atan2((p.y - p.h / 2) - this.y, p.x - this.x);
        }
      }
      if (this.stingerCd <= 0) {
        this.stingerCd = this.phase === 2 ? 0.7 : 1.3;
        const n = this.phase === 2 ? 5 : 3;
        for (let i = 0; i < n; i++) {
          const a = Math.atan2((p.y - p.h / 2) - this.y, p.x - this.x) + (i - (n - 1) / 2) * 0.18;
          game.spawnProjectile('stinger', this.x, this.y + 10, Math.cos(a) * 260, Math.sin(a) * 260, 18, { owner: 'enemy', life: 4 });
        }
        game.audio.play('shoot');
      }
      this.dir = p.x > this.x ? 1 : -1;
    }

    updateEye(dt, dx, dy, dist, p) {
      const game = this.game;
      this.phase = this.hp < this.maxHp * 0.55 ? 2 : 1;
      this.dashCd -= dt;
      this.shootCd -= dt;
      if (this.phase === 1) {
        const hoverX = p.x + Math.cos(this.time * 0.7) * 120;
        const hoverY = p.y - 150 + Math.sin(this.time * 0.9) * 22;
        const a = Math.atan2(hoverY - this.y, hoverX - this.x);
        this.x += Math.cos(a) * 170 * dt;
        this.y += Math.sin(a) * 170 * dt;
        if (this.dashCd <= 0) {
          this.dashCd = 4.4;
          this.dashing = 0.55;
          this.dashA = Math.atan2((p.y - p.h / 2) - this.y, p.x - this.x);
        }
        if (this.dashing > 0) {
          this.dashing -= dt;
          this.x += Math.cos(this.dashA) * 440 * dt;
          this.y += Math.sin(this.dashA) * 440 * dt;
        }
        if (this.shootCd <= 0) {
          this.shootCd = 2.6;
          for (let i = -1; i <= 1; i++) {
            const a2 = Math.atan2((p.y - p.h / 2) - this.y, p.x - this.x) + i * 0.22;
            game.spawnProjectile('eyeball', this.x, this.y, Math.cos(a2) * 220, Math.sin(a2) * 220, 18, { owner: 'enemy', life: 4 });
          }
        }
      } else {
        const speed = 230;
        const a = Math.atan2(dy, dx);
        this.x += Math.cos(a) * speed * dt * (0.8 + Math.sin(this.time * 3) * 0.25);
        this.y += Math.sin(a) * speed * dt * (0.8 + Math.sin(this.time * 3) * 0.25);
        if (this.shootCd <= 0) {
          this.shootCd = 1.5;
          for (let i = 0; i < 6; i++) {
            const aa = i / 6 * 6.283 + this.time;
            game.spawnProjectile('eyeball', this.x, this.y, Math.cos(aa) * 180, Math.sin(aa) * 180, 18, { owner: 'enemy', life: 4 });
          }
        }
      }
      const camTop = game.cam.y - game.renderer.vh / 2 / game.renderer.zoom + 120;
      if (this.y < camTop) this.y = camTop;
      this.x = T.clamp(this.x, 40, game.world.W * TS - 40);
      this.dir = p.x > this.x ? 1 : -1;
    }

    updateEater(dt, dx, dy, dist, p) {
      const game = this.game;
      const head = this.segments[0];
      const sp = 250 + (this.hp < this.maxHp * 0.5 ? 80 : 0);
      const a = Math.atan2(dy, dx) + Math.sin(this.time * 1.3) * 0.5;
      head.x += Math.cos(a) * sp * dt;
      head.y += Math.sin(a) * sp * dt;
      for (let i = 1; i < this.segments.length; i++) {
        const seg = this.segments[i];
        if (seg.dead) continue;
        const prev = this.segments[i - 1];
        const sa = Math.atan2(seg.y - prev.y, seg.x - prev.x);
        seg.x = prev.x + Math.cos(sa) * 22;
        seg.y = prev.y + Math.sin(sa) * 22;
        if (Math.random() < dt * 2) {
          game.particles.burst(seg.x, seg.y, 1, { color: ['#8a5ac0', '#5a3a80'], speed: 20, life: 0.4, gravity: 0 });
        }
      }
      const pr = p.rect();
      for (const seg of this.segments) {
        if (seg.dead) continue;
        const r = { x: seg.x - seg.size / 2, y: seg.y - seg.size / 2, w: seg.size, h: seg.size };
        if (rects(r, pr) && p.iframe <= 0) p.hurt(this.dmg, seg.x, { knock: 300 });
      }
      this.shootCd -= dt;
      if (this.shootCd <= 0) {
        this.shootCd = 3.2;
        for (let i = 0; i < 3; i++) {
          const sa = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
          game.spawnProjectile('vile', this.x, this.y, Math.cos(sa) * 200, Math.sin(sa) * 200, 16, { owner: 'enemy', life: 5 });
        }
      }
      this.x = head.x;
      this.y = head.y;
      if (this.segments.every(function (s) { return s.dead; })) this.hp = 0;
      this.checkSegmentsDead();
    }

    checkSegmentsDead() {
      let alive = 0;
      for (const s of this.segments) if (!s.dead) alive++;
      if (alive !== this.segmentsDeadCheck) {
        this.segmentsDeadCheck = alive;
        this.hp = Math.max(1, Math.round(this.maxHp * (alive / this.segments.length)));
      }
    }

    updateSkeletron(dt, dx, dy, dist, p) {
      const game = this.game;
      this.spinT = (this.spinT || 0) + dt;
      if (this.spinT > 6) {
        this.spinning = !this.spinning;
        this.spinT = 0;
      }
      if (this.spinning) {
        const a = Math.atan2(dy, dx);
        this.x += Math.cos(a) * 300 * dt;
        this.y += Math.sin(a) * 300 * dt;
        this.spin += dt * 12;
      } else {
        const hoverX = p.x + Math.cos(this.time * 0.6) * 110;
        const hoverY = p.y - 170;
        this.x = T.lerp(this.x, hoverX, dt * 1.4);
        this.y = T.lerp(this.y, hoverY, dt * 1.4);
      }
      const camTop = game.cam.y - game.renderer.vh / 2 / game.renderer.zoom + 130;
      if (this.y < camTop) this.y = camTop;
      this.dir = p.x > this.x ? 1 : -1;
      for (const hand of this.hands) {
        if (hand.dead) continue;
        hand.atkCd -= dt;
        if (hand.atkCd <= 0) {
          hand.atkCd = 3.4 + Math.random();
          const a = Math.atan2((p.y - p.h / 2) - hand.y, p.x - hand.x);
          hand.dashA = a;
          hand.dashT = 0.7;
        }
        if (hand.dashT > 0) {
          hand.dashT -= dt;
          hand.x += Math.cos(hand.dashA) * 420 * dt;
          hand.y += Math.sin(hand.dashA) * 420 * dt;
        } else {
          const side = hand === this.hands[0] ? -1 : 1;
          const tx = this.x + side * 190;
          const ty = this.y + 40 + Math.sin(this.time * 2) * 30;
          hand.x = T.lerp(hand.x, tx, dt * 2);
          hand.y = T.lerp(hand.y, ty, dt * 2);
        }
        const hr = { x: hand.x - 34, y: hand.y - 34, w: 68, h: 68 };
        if (rects(hr, p.rect()) && p.iframe <= 0) p.hurt(this.dmg * 0.8, hand.x, { knock: 300 });
      }
      this.shootCd -= dt;
      if (this.shootCd <= 0) {
        this.shootCd = 2.8;
        const a = Math.atan2(dy, dx);
        game.spawnProjectile('skull', this.x, this.y + 20, Math.cos(a) * 210, Math.sin(a) * 210, 22, { owner: 'enemy', life: 4 });
      }
      const pr = p.rect();
      if (rects(this.rect(), pr) && p.iframe <= 0) p.hurt(this.dmg, this.x, { knock: 340 });
      this.checkHands();
    }

    checkHands() {
      let dead = 0;
      for (const h of this.hands) if (h.dead) dead++;
      if (this.handsDead !== dead) {
        this.handsDead = dead;
        if (dead > 0 && !this.handsDeathShown) {
          this.handsDeathShown = true;
          this.game.toast('骷髅王的一只手被击碎了！', '#ffd98a');
        }
      }
    }

    updateWof(dt, dx, dy, dist, p) {
      const game = this.game;
      this.mouthCd -= dt;
      if (this.mouthCd <= 0) {
        this.mouthCd = 2.4;
        for (let i = -1; i <= 1; i++) {
          const a = Math.atan2(dy, dx) + i * 0.3;
          game.spawnProjectile('laser', this.x - this.dir * 40, this.y + 40, Math.cos(a) * 260, Math.sin(a) * 260, 24, { owner: 'enemy', life: 4 });
        }
      }
      for (const eye of this.eyes) {
        if (eye.dead) continue;
        eye.x = this.x - this.dir * 40;
        eye.y = this.y + (eye === this.eyes[0] ? -80 : eye === this.eyes[1] ? 10 : 110);
        eye.cd -= dt;
        if (eye.cd <= 0) {
          eye.cd = 2.2;
          const a = Math.atan2((p.y - p.h / 2) - eye.y, p.x - eye.x);
          game.spawnProjectile('laser', eye.x, eye.y, Math.cos(a) * 280, Math.sin(a) * 280, 22, { owner: 'enemy', life: 4 });
        }
      }
      const eyeDead = this.eyes.filter(function (e) { return e.dead; }).length;
      this.phase = eyeDead >= 2 ? 2 : 1;
      const pr = p.rect();
      if (rects(this.rect(), pr) && p.iframe <= 0) p.hurt(this.dmg, this.x, { knock: 380 });
      if (eyeDead === 3) this.hp = Math.max(1, this.hp - 500 * dt);
    }

    onPartHit(part, dmg) {
      if (this.kind === 'eater' && part) {
        part.hp -= dmg;
        if (part.hp <= 0) {
          part.dead = true;
          this.game.particles.burst(part.x, part.y, 18, { color: ['#8a5ac0', '#d0a0ff'], speed: 140, life: 0.7, gravity: 280 });
          this.game.audio.play('kill');
        }
      } else if (this.kind === 'skeletron' && part) {
        part.hp -= dmg;
        if (part.hp <= 0) {
          part.dead = true;
          this.game.particles.burst(part.x, part.y, 24, { color: ['#e8e0cc', '#ffffff'], speed: 160, life: 0.8, gravity: 300 });
          this.game.audio.play('explode');
        }
      } else if (this.kind === 'wof' && part) {
        part.hp -= dmg;
        if (part.hp <= 0) part.dead = true;
      }
    }

    hurt(dmg, opts) {
      if (this.dead) return 0;
      opts = opts || {};
      const final = Math.max(1, Math.round(dmg * (opts.crit ? 2 : 1)));
      this.hp -= final;
      this.hitFlash = 1;
      this.hurtT = 0.15;
      this.game.particles.text(this.x, this.y - this.h * 0.6, final, opts.crit ? '#ffd24a' : '#ffffff');
      this.game.particles.burst(this.x, this.y, 5, { color: ['#ffffff', this.def.color], speed: 100, life: 0.4, gravity: 200 });
      this.game.audio.play('hit');
      if (opts.part) this.onPartHit(opts.part, final);
      if (this.hp <= 0) this.die();
      return final;
    }

    die() {
      if (this.dead) return;
      this.dead = true;
      this.defeated = true;
      const game = this.game;
      game.audio.play('bossdie');
      game.shake(16, 0.9);
      const col = this.def.color;
      for (let i = 0; i < 6; i++) {
        setTimeout(function () {
          game.particles.burst(this.x + (Math.random() - 0.5) * this.w, this.y + (Math.random() - 0.5) * this.h, 34, {
            color: [col, '#ffffff', '#ffd070'], speed: 220, life: 1.1, gravity: 300, glow: true
          });
          game.shake(8, 0.2);
        }.bind(this), i * 130);
      }
      game.onBossDefeated(this);
    }

    draw(ctx, cam, zoom, vw, vh) {
      if (this.dead) return;
      if (this.kind === 'eye') this.drawEye(ctx, cam, zoom);
      else if (this.kind === 'eater') this.drawEater(ctx, cam, zoom);
      else if (this.kind === 'skeletron') this.drawSkeletron(ctx, cam, zoom);
      else if (this.kind === 'wof') this.drawWof(ctx, cam, zoom);
      else if (this.kind === 'king_slime') this.drawKingSlime(ctx, cam, zoom);
      else if (this.kind === 'queen_bee') this.drawQueenBee(ctx, cam, zoom);
      if (this.introT > 0) {
        const p = this.game.renderer.worldToScreen(cam, this.x, this.y);
        ctx.globalAlpha = T.clamp((2.2 - this.introT) / 0.5, 0, 1);
        ctx.fillStyle = 'rgba(255,240,220,0.9)';
        ctx.font = '700 ' + Math.round(26 * zoom) + 'px "Noto Serif SC", serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, p.x, p.y - this.h * zoom * 0.7);
        ctx.globalAlpha = 1;
      }
    }

    drawKingSlime(ctx, cam, zoom) {
      const p = this.game.renderer.worldToScreen(cam, this.x, this.y);
      const s = zoom;
      const t = this.animT;
      const squash = this.vy === 0 ? 1 + Math.sin(t * 5) * 0.05 : (this.vy < 0 ? 0.92 : 1.1);
      const w = this.w * s * squash;
      const h = this.h * s / squash;
      ctx.save();
      ctx.translate(p.x, p.y);
      const g = ctx.createRadialGradient(-w * 0.2, -h * 0.75, 2, 0, -h * 0.5, w * 0.75);
      g.addColorStop(0, this.hitFlash > 0 ? '#ffffff' : '#8ab4ff');
      g.addColorStop(0.5, this.hitFlash > 0 ? '#ffffff' : '#3a6ad8');
      g.addColorStop(1, this.hitFlash > 0 ? '#ffffff' : '#142f6a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.bezierCurveTo(-w / 2, -h * 1.06, w / 2, -h * 1.06, w / 2, 0);
      ctx.bezierCurveTo(w * 0.3, 4 * s, -w * 0.3, 4 * s, -w / 2, 0);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.ellipse(-w * 0.2, -h * 0.76, w * 0.1, h * 0.09, -0.3, 0, 6.283);
      ctx.fill();
      const eyeR = 4.4 * s;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-w * 0.14, -h * 0.62, eyeR, eyeR * 1.2, 0, 0, 6.283);
      ctx.ellipse(w * 0.14, -h * 0.62, eyeR, eyeR * 1.2, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#141018';
      ctx.beginPath();
      ctx.arc(-w * 0.13, -h * 0.6, eyeR * 0.6, 0, 6.283);
      ctx.arc(w * 0.15, -h * 0.6, eyeR * 0.6, 0, 6.283);
      ctx.fill();
      const cy = -h * 1.06;
      ctx.fillStyle = '#f0c040';
      ctx.beginPath();
      ctx.moveTo(-w * 0.26, cy + 4 * s);
      ctx.lineTo(-w * 0.22, cy - 16 * s);
      ctx.lineTo(-w * 0.1, cy - 2 * s);
      ctx.lineTo(0, cy - 20 * s);
      ctx.lineTo(w * 0.1, cy - 2 * s);
      ctx.lineTo(w * 0.22, cy - 16 * s);
      ctx.lineTo(w * 0.26, cy + 4 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e05a7a';
      ctx.beginPath();
      ctx.arc(0, cy - 2 * s, 2.6 * s, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }

    drawQueenBee(ctx, cam, zoom) {
      const p = this.game.renderer.worldToScreen(cam, this.x, this.y);
      const s = zoom;
      const t = this.animT;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(this.dir, 1);
      const flap = Math.sin(t * 26);
      ctx.fillStyle = 'rgba(255,255,255,0.34)';
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * 12 * s, -30 * s);
        ctx.rotate(side * (0.5 + flap * 0.5));
        ctx.beginPath();
        ctx.ellipse(side * 26 * s, -8 * s, 30 * s, 12 * s, side * 0.3, 0, 6.283);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#2a1e10';
      ctx.beginPath();
      ctx.ellipse(0, 2 * s, 12 * s, 18 * s, 0, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = '#f0c040';
      ctx.lineWidth = 3 * s;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(0, -2 * s - i * 7 * s, 11 * s, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(-8 * s, -38 * s, 2, 0, -34 * s, 22 * s);
      g.addColorStop(0, this.hitFlash > 0 ? '#ffffff' : '#ffe07a');
      g.addColorStop(0.6, this.hitFlash > 0 ? '#ffffff' : '#e0b020');
      g.addColorStop(1, '#8a6a10');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, -32 * s, 18 * s, 16 * s, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-6 * s, -36 * s, 5.6 * s, 6.4 * s, 0, 0, 6.283);
      ctx.ellipse(7 * s, -36 * s, 5.6 * s, 6.4 * s, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#141018';
      ctx.beginPath();
      ctx.arc(-5 * s, -36 * s, 2.8 * s, 0, 6.283);
      ctx.arc(8 * s, -36 * s, 2.8 * s, 0, 6.283);
      ctx.fill();
      if (this.phase === 2) {
        ctx.fillStyle = 'rgba(255,120,60,0.55)';
        ctx.beginPath();
        ctx.ellipse(0, -32 * s, 18 * s, 16 * s, 0, 0, 6.283);
        ctx.fill();
      }
      ctx.strokeStyle = '#8a6a10';
      ctx.lineWidth = 2.4 * s;
      ctx.beginPath();
      ctx.moveTo(-4 * s, -46 * s);
      ctx.quadraticCurveTo(-12 * s, -60 * s, -4 * s, -58 * s);
      ctx.moveTo(4 * s, -46 * s);
      ctx.quadraticCurveTo(12 * s, -60 * s, 4 * s, -58 * s);
      ctx.stroke();
      ctx.fillStyle = '#e0b020';
      ctx.beginPath();
      ctx.moveTo(0, 18 * s);
      ctx.lineTo(4 * s, 30 * s);
      ctx.lineTo(-4 * s, 30 * s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawEye(ctx, cam, zoom) {
      const p = this.game.renderer.worldToScreen(cam, this.x, this.y);
      const s = zoom * 1.05;
      const t = this.animT;
      ctx.save();
      ctx.translate(p.x, p.y);
      const r = 42 * s;
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.9, r * 0.8, r * 0.2, 0, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = this.hitFlash > 0 ? '#ffffff' : '#8a2a3a';
      ctx.lineWidth = 5 * s;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 9 * s + Math.sin(t * 3 + i) * 4 * s, -r * 0.2);
        ctx.quadraticCurveTo(i * 22 * s, r * 0.7, i * 30 * s + Math.sin(t * 2 + i) * 8 * s, r * 1.7);
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.15, 0, 0, r);
      g.addColorStop(0, this.hitFlash > 0 ? '#ffffff' : '#f06a7a');
      g.addColorStop(0.7, this.hitFlash > 0 ? '#ffffff' : '#c03a4a');
      g.addColorStop(1, '#6a1020');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#f0e8e0';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.62, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = this.phase === 2 ? '#ff3a4a' : '#3a2a1a';
      ctx.beginPath();
      ctx.arc(this.dir * r * 0.1, 0, r * 0.38, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#101010';
      ctx.beginPath();
      ctx.arc(this.dir * r * 0.14, 0, r * 0.18, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(-r * 0.2, -r * 0.22, r * 0.1, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }

    drawEater(ctx, cam, zoom) {
      const s = zoom;
      for (let i = this.segments.length - 1; i >= 0; i--) {
        const seg = this.segments[i];
        if (seg.dead) continue;
        const p = this.game.renderer.worldToScreen(cam, seg.x, seg.y);
        const r = seg.size * s * 0.6;
        ctx.save();
        ctx.translate(p.x, p.y);
        const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        g.addColorStop(0, this.hitFlash > 0 && i === 0 ? '#ffffff' : '#a878d8');
        g.addColorStop(0.6, this.hitFlash > 0 && i === 0 ? '#ffffff' : '#6a3a9a');
        g.addColorStop(1, '#2a1040');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 6.283);
        ctx.fill();
        if (i === 0) {
          ctx.fillStyle = '#f0e8e0';
          ctx.beginPath();
          ctx.arc(r * 0.3, -r * 0.25, r * 0.2, 0, 6.283);
          ctx.arc(r * 0.45, r * 0.18, r * 0.2, 0, 6.283);
          ctx.fill();
          ctx.fillStyle = '#201020';
          ctx.beginPath();
          ctx.arc(r * 0.32, -r * 0.25, r * 0.1, 0, 6.283);
          ctx.arc(r * 0.47, r * 0.18, r * 0.1, 0, 6.283);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    drawSkeletron(ctx, cam, zoom) {
      const s = zoom;
      for (const hand of this.hands) {
        if (hand.dead) continue;
        const p = this.game.renderer.worldToScreen(cam, hand.x, hand.y);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#e0d8c4';
        ctx.beginPath();
        ctx.arc(0, 0, 30 * s, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#c8bca4';
        for (let i = 0; i < 4; i++) {
          const a = -0.9 + i * 0.5;
          ctx.save();
          ctx.rotate(a);
          ctx.fillRect(-4 * s, -42 * s, 8 * s, 20 * s);
          ctx.restore();
        }
        ctx.restore();
      }
      const p = this.game.renderer.worldToScreen(cam, this.x, this.y);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(this.spinning ? this.spin : Math.sin(this.animT * 1.5) * 0.06);
      ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#d8d0bc';
      ctx.beginPath();
      ctx.arc(0, 0, 52 * s, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#c4b8a0';
      ctx.beginPath();
      ctx.arc(0, 12 * s, 38 * s, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#1a1218';
      ctx.beginPath();
      ctx.ellipse(-18 * s, -6 * s, 13 * s, 16 * s, 0, 0, 6.283);
      ctx.ellipse(18 * s, -6 * s, 13 * s, 16 * s, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#ff3a3a';
      ctx.beginPath();
      ctx.arc(-18 * s + this.dir * 4 * s, -6 * s, 6 * s, 0, 6.283);
      ctx.arc(18 * s + this.dir * 4 * s, -6 * s, 6 * s, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#a89878';
      for (let i = 0; i < 7; i++) {
        ctx.fillRect((-30 + i * 10) * s, 24 * s, 6 * s, 12 * s);
      }
      ctx.fillStyle = '#3a2a2a';
      ctx.beginPath();
      ctx.ellipse(0, 8 * s, 12 * s, 6 * s, 0, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }

    drawWof(ctx, cam, zoom) {
      const p = this.game.renderer.worldToScreen(cam, this.x, this.y);
      const s = zoom;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(this.dir, 1);
      const h = this.h * s, w = this.w * s;
      const pulse = 1 + Math.sin(this.animT * 2.4) * 0.03;
      const g = ctx.createRadialGradient(-w * 0.1, 0, w * 0.2, 0, 0, h * 0.6);
      g.addColorStop(0, this.hitFlash > 0 ? '#ffffff' : '#d0603a');
      g.addColorStop(0.55, this.hitFlash > 0 ? '#ffffff' : '#a03a22');
      g.addColorStop(1, '#4a1208');
      ctx.fillStyle = g;
      ctx.beginPath();
      const segs = 14;
      ctx.moveTo(-w / 2, -h / 2);
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const yy = -h / 2 + t * h;
        const bulge = Math.sin(t * Math.PI) * w * 0.42 * pulse + Math.sin(this.animT * 3 + t * 9) * w * 0.05;
        ctx.lineTo(-w / 2 + bulge, yy);
      }
      for (let i = segs; i >= 0; i--) {
        const t = i / segs;
        const yy = -h / 2 + t * h;
        const eye = this.eyes.reduce(function (acc, e, idx) {
          const ey = (e === this.eyes[0] ? -80 : e === this.eyes[1] ? 10 : 110) * s;
          return acc + (e.dead ? 0 : Math.exp(-Math.pow((yy - ey) / (34 * s), 2)) * w * 0.22);
        }.bind(this), 0);
        const bulge = Math.sin(t * Math.PI) * w * 0.2 + eye;
        ctx.lineTo(w / 2 + bulge, yy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(30,6,4,0.9)';
      ctx.beginPath();
      ctx.ellipse(-w * 0.08, h * 0.02, w * 0.24, h * 0.13, 0, 0, 6.283);
      ctx.fill();
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = '#f0e0c0';
        const bx = -w * 0.28 + i * w * 0.045;
        ctx.fillRect(bx, -h * 0.11, w * 0.022, h * 0.05);
        ctx.fillRect(bx, h * 0.07, w * 0.022, h * 0.05);
      }
      for (const eye of this.eyes) {
        if (eye.dead) continue;
        const ey = (eye === this.eyes[0] ? -80 : eye === this.eyes[1] ? 10 : 110) * s;
        ctx.fillStyle = '#f4ece0';
        ctx.beginPath();
        ctx.arc(w * 0.06, ey, 16 * s, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#d02020';
        ctx.beginPath();
        ctx.arc(w * 0.06 + this.dir * 4 * s, ey, 8 * s, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#200808';
        ctx.beginPath();
        ctx.arc(w * 0.06 + this.dir * 5 * s, ey, 3.6 * s, 0, 6.283);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  class Projectile {
    constructor(game, kind, x, y, vx, vy, dmg, opts) {
      opts = opts || {};
      this.game = game;
      this.kind = kind;
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.dmg = dmg;
      this.owner = opts.owner || 'player';
      this.life = opts.life || 2;
      this.maxLife = this.life;
      this.size = opts.size || 5;
      this.color = opts.color || '#ffe0a0';
      this.glow = opts.glow || null;
      this.dead = false;
      this.pierce = opts.pierce || 0;
      this.hitSet = new Set();
      this.gravity = opts.gravity || 0;
      this.bounce = opts.bounce || 0;
      this.rot = Math.atan2(vy, vx);
      this.trailT = 0;
      this.homing = opts.homing || 0;
      this.kindInit();
    }

    kindInit() {
      switch (this.kind) {
        case 'arrow': this.color = '#d8c8a0'; this.size = 4; break;
        case 'firearrow': this.color = '#ff9a3a'; this.glow = '#ffb04a'; this.size = 5; break;
        case 'bullet': this.color = '#ffe0a0'; this.size = 4; break;
        case 'spark': this.color = '#ffb04a'; this.glow = '#ffb04a'; this.size = 7; break;
        case 'waterbolt': this.color = '#6ab0e8'; this.glow = '#6ab0e8'; this.size = 7; this.bounce = 3; break;
        case 'laser': this.color = '#8ad8c8'; this.glow = '#8ad8c8'; this.size = 6; break;
        case 'starp':
          this.color = '#ffd870'; this.glow = '#ffd870'; this.size = 10; this.gravity = 260;
          break;
        case 'swordbeam': this.color = '#9ad8ff'; this.glow = '#9ad8ff'; this.size = 8; this.pierce = 3; break;
        case 'eyeball': this.color = '#f06a7a'; this.size = 8; break;
        case 'vile': this.color = '#a878d8'; this.glow = '#a878d8'; this.size = 7; break;
        case 'skull': this.color = '#e8e0cc'; this.size = 9; break;
        case 'fireball': this.color = '#ff7a2a'; this.glow = '#ff9a3a'; this.size = 8; break;
        case 'sandball': this.color = '#dfc684'; this.size = 6; this.gravity = 200; break;
        case 'stinger': this.color = '#e0c060'; this.size = 4; this.gravity = 0; break;
        case 'feather': this.color = '#e8e0d0'; this.size = 5; this.gravity = 60; break;
        case 'beearrow': this.color = '#f0c040'; this.glow = '#ffd860'; this.size = 5; this.homing = 3.4; break;
        case 'slimeball': this.color = '#5ab4e0'; this.size = 7; this.gravity = 180; break;
        case 'scythe': this.color = '#c8a0ff'; this.glow = '#c8a0ff'; this.size = 12; this.pierce = 99; break;
        case 'flame': this.color = '#ff8a2a'; this.glow = '#ffb04a'; this.size = 11; this.pierce = 2; break;
        case 'shadowburst': this.color = '#a878e0'; this.glow = '#a878e0'; this.size = 9; this.pierce = 2; break;
      }
      this.hitDebris = this.kind === 'sandball' || this.kind === 'starp';
    }

    update(dt) {
      if (this.dead) return;
      const game = this.game;
      const world = game.world;
      this.life -= dt;
      if (this.life <= 0) { this.dead = true; return; }
      if (this.kind === 'starp') {
        this.vy += this.gravity * dt;
      } else if (this.kind === 'sandball' || this.kind === 'feather') {
        this.vy += this.gravity * dt;
      }
      if (this.homing && this.owner === 'enemy') {
        const p = game.player;
        const a = Math.atan2((p.y - p.h / 2) - this.y, p.x - this.x);
        const sp = Math.hypot(this.vx, this.vy);
        const ca = Math.atan2(this.vy, this.vx);
        let na = ca + T.clamp(angDiff(a, ca), -this.homing * dt, this.homing * dt);
        this.vx = Math.cos(na) * sp;
        this.vy = Math.sin(na) * sp;
      }
      if (this.homing && this.owner === 'player') {
        let target = null;
        let best = 340;
        for (const e of game.enemies) {
          if (e.dead) continue;
          const d = Math.hypot(e.cx - this.x, e.cy - this.y);
          if (d < best) { best = d; target = e; }
        }
        if (!target && game.boss && !game.boss.dead) target = { cx: game.boss.x, cy: game.boss.y };
        if (target) {
          const a = Math.atan2(target.cy - this.y, target.cx - this.x);
          const sp = Math.hypot(this.vx, this.vy);
          const ca = Math.atan2(this.vy, this.vx);
          const na = ca + T.clamp(angDiff(a, ca), -this.homing * dt, this.homing * dt);
          this.vx = Math.cos(na) * sp;
          this.vy = Math.sin(na) * sp;
        }
      }
      const steps = Math.max(1, Math.ceil(Math.hypot(this.vx, this.vy) * dt / 10));
      for (let s = 0; s < steps; s++) {
        this.x += this.vx * dt / steps;
        this.y += this.vy * dt / steps;
        if (this.collide(world)) return;
      }
      this.rot = Math.atan2(this.vy, this.vx);
      this.trailT += dt;
      if (this.trailT > 0.03) {
        this.trailT = 0;
        if (this.glow) {
          game.particles.spawn({
            x: this.x, y: this.y, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20,
            life: 0, max: 0.25, size: this.size * 0.5, color: this.glow, gravity: 0, drag: 1, glow: true
          });
        } else if (this.kind === 'arrow') {
          game.particles.spawn({
            x: this.x, y: this.y, vx: 0, vy: 0, life: 0, max: 0.18, size: 2, color: 'rgba(255,255,255,0.4)', gravity: 0, drag: 1
          });
        }
      }
    }

    collide(world) {
      const game = this.game;
      const tx = Math.floor(this.x / TS), ty = Math.floor(this.y / TS);
      const t = world.getTile(tx, ty);
      if (t !== TILE.AIR && !T.tileDef(t).liquid) {
        if (T.isSolid(t) || T.tileDef(t).furniture || T.tileDef(t).deco) {
          if (this.bounce > 0) {
            this.bounce--;
            const cx = (tx + 0.5) * TS, cy = (ty + 0.5) * TS;
            const dx = Math.abs(this.x - cx), dy = Math.abs(this.y - cy);
            if (dx > dy) this.vx *= -1;
            else this.vy *= -1;
            this.x += this.vx * 0.016;
            this.y += this.vy * 0.016;
            return false;
          }
          this.hitWall();
          return true;
        }
      }
      if (this.owner === 'player') {
        const wh = world.waterAt(tx, ty);
        if (this.kind === 'arrow' && wh > 0) {
          this.vx *= 0.86;
          this.vy *= 0.86;
          this.vy += 120 * 0.016;
        }
        const enemies = game.enemies;
        for (const e of enemies) {
          if (e.dead || this.hitSet.has(e)) continue;
          const r = e.rect();
          const px = T.clamp(this.x, r.x, r.x + r.w);
          const py = T.clamp(this.y, r.y, r.y + r.h);
          if ((this.x - px) ** 2 + (this.y - py) ** 2 <= (this.size + 2) ** 2) {
            this.hitSet.add(e);
            e.hurt(this.dmg, { knock: 3, angle: this.rot, burn: this.kind === 'firearrow' || this.kind === 'flame' });
            game.audio.play('hit');
            game.particles.burst(this.x, this.y, 5, { color: [this.color, '#ffffff'], speed: 80, life: 0.3, gravity: 200 });
            if (this.pierce > 0) { this.pierce--; }
            else { this.dead = true; return true; }
          }
        }
        for (const b of game.bosses) {
          if (!b || b.dead) continue;
          if (b.kind === 'eater') continue;
          const r = b.rect();
          if (this.x > r.x && this.x < r.x + r.w && this.y > r.y && this.y < r.y + r.h) {
            b.hurt(this.dmg, { knock: 2, angle: this.rot });
            if (this.pierce > 0) this.pierce--;
            else { this.dead = true; return true; }
          }
        }
        if (game.boss && game.boss.isBoss && game.boss.kind === 'eater') {
          for (const seg of game.boss.segments) {
            if (seg.dead) continue;
            const r = { x: seg.x - seg.size / 2, y: seg.y - seg.size / 2, w: seg.size, h: seg.size };
            if (this.x > r.x && this.x < r.x + r.w && this.y > r.y && this.y < r.y + r.h) {
              game.boss.onPartHit(seg, this.dmg);
              if (this.pierce > 0) this.pierce--;
              else { this.dead = true; return true; }
            }
          }
        }
        if (game.boss && game.boss.isBoss) {
          if (game.boss.kind === 'skeletron') {
            for (const hand of game.boss.hands) {
              if (hand.dead) continue;
              if (Math.hypot(this.x - hand.x, this.y - hand.y) < 34) {
                game.boss.onPartHit(hand, this.dmg);
                if (this.pierce > 0) this.pierce--;
                else { this.dead = true; return true; }
              }
            }
          }
          if (game.boss.kind === 'wof') {
            for (const eye of game.boss.eyes) {
              if (eye.dead) continue;
              if (Math.hypot(this.x - eye.x, this.y - eye.y) < 22) {
                game.boss.onPartHit(eye, this.dmg);
                if (this.pierce > 0) this.pierce--;
                else { this.dead = true; return true; }
              }
            }
          }
        }
      } else {
        const p = game.player;
        const pr = p.rect();
        if (this.x > pr.x && this.x < pr.x + pr.w && this.y > pr.y && this.y < pr.y + pr.h) {
          p.hurt(this.dmg, this.x, { knock: 150 });
          this.dead = true;
          return true;
        }
      }
      return false;
    }

    hitWall() {
      this.dead = true;
      const game = this.game;
      game.particles.burst(this.x, this.y, this.kind === 'starp' ? 20 : 6, {
        color: [this.color, '#ffffff', '#c8c0b0'], speed: this.kind === 'starp' ? 180 : 70,
        life: this.kind === 'starp' ? 0.7 : 0.35, gravity: 320, glow: !!this.glow
      });
      if (this.kind === 'starp') {
        game.shake(4, 0.15);
        game.audio.play('explode');
      }
    }

    draw(ctx, cam, zoom, vw, vh) {
      const p = this.game.renderer.worldToScreen(cam, this.x, this.y);
      const s = zoom;
      ctx.save();
      ctx.translate(p.x, p.y);
      if (this.glow) {
        ctx.shadowColor = this.glow;
        ctx.shadowBlur = 12 * s;
      }
      switch (this.kind) {
        case 'arrow': case 'firearrow': case 'stinger': {
          ctx.rotate(this.rot);
          ctx.strokeStyle = '#8a6236';
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(-8 * s, 0);
          ctx.lineTo(6 * s, 0);
          ctx.stroke();
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.moveTo(10 * s, 0);
          ctx.lineTo(4 * s, -3 * s);
          ctx.lineTo(4 * s, 3 * s);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'bullet': case 'laser': case 'spark': case 'eyeball': case 'vile': case 'skull': case 'fireball': case 'sandball': case 'feather': {
          const r = this.size * s * 0.6;
          if (this.kind === 'laser') {
            ctx.rotate(this.rot);
            const grd = ctx.createLinearGradient(-20 * s, 0, 10 * s, 0);
            grd.addColorStop(0, 'rgba(138,216,200,0)');
            grd.addColorStop(1, this.color);
            ctx.fillStyle = grd;
            ctx.fillRect(-20 * s, -r * 0.5, 30 * s, r);
          } else {
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.6);
            g.addColorStop(0, '#ffffff');
            g.addColorStop(0.4, this.color);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.6, 0, 6.283);
            ctx.fill();
          }
          break;
        }
        case 'waterbolt': {
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.arc(0, 0, this.size * s * 0.6, 0, 6.283);
          ctx.stroke();
          break;
        }
        case 'starp': {
          ctx.rotate(this.animT || 0);
          ctx.fillStyle = this.color;
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const a = i / 8 * 6.283;
            const rr = i % 2 === 0 ? this.size * s : this.size * s * 0.35;
            ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'swordbeam': {
          ctx.rotate(this.rot);
          ctx.fillStyle = 'rgba(154,216,255,0.75)';
          ctx.beginPath();
          ctx.ellipse(0, 0, 16 * s, 5 * s, 0, 0, 6.283);
          ctx.fill();
          break;
        }
        case 'scythe': {
          ctx.rotate(this.rot + Math.PI * 0.5);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 3 * s;
          ctx.beginPath();
          ctx.arc(0, 0, this.size * s, 0.4, Math.PI - 0.4);
          ctx.stroke();
          break;
        }
        default: {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(0, 0, this.size * s * 0.6, 0, 6.283);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  function angDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= 6.283;
    while (d < -Math.PI) d += 6.283;
    return d;
  }

  class DropItem {
    constructor(game, id, x, y, count) {
      this.game = game;
      this.id = id;
      this.count = count || 1;
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 120;
      this.vy = -80 - Math.random() * 100;
      this.w = 12;
      this.h = 12;
      this.noPickup = 0.35;
      this.life = 0;
      this.bob = Math.random() * 6.283;
      this.dead = false;
      this.magnet = false;
    }

    update(dt) {
      const world = this.game.world;
      this.life += dt;
      this.vy += 900 * dt;
      this.vx *= Math.pow(0.02, dt);
      const nx = this.x + this.vx * dt;
      const ny = this.y + this.vy * dt;
      const tx = Math.floor(nx / TS), ty = Math.floor(ny / TS);
      const t = world.getTile(tx, ty);
      if (T.isSolid(t)) {
        if (T.isSolid(world.getTile(Math.floor(this.x / TS), ty))) {
          this.vy = 0;
        } else {
          this.x = nx;
        }
        if (T.isSolid(world.getTile(tx, Math.floor(this.y / TS)))) {
          this.vx = 0;
        } else {
          this.y = ny;
        }
      } else {
        this.x = nx;
        this.y = ny;
      }
      if (this.y > world.H * TS) this.dead = true;
      const tx2 = Math.floor(this.x / TS), ty2 = Math.floor(this.y / TS);
      if (world.waterAt(tx2, ty2) > 0) {
        this.vy = Math.min(this.vy, 20);
        this.vy -= 200 * dt;
      }
      this.bob += dt * 3;
      if (this.life > 320) this.dead = true;
    }

    draw(ctx, cam, zoom, vw, vh) {
      const p = this.game.renderer.worldToScreen(cam, this.x, this.y - 6 + Math.sin(this.bob) * 2);
      ctx.save();
      ctx.translate(p.x, p.y);
      const def = T.itemDef(this.id);
      if (def && (def.rarity || 0) >= 2) {
        ctx.shadowColor = def.glow || def.color;
        ctx.shadowBlur = 10 * zoom;
      }
      T.drawItemIcon(ctx, this.id, -8 * zoom, -8 * zoom, 16 * zoom);
      ctx.restore();
    }
  }

  class Minion {
    constructor(game, kind) {
      this.game = game;
      this.kind = kind;
      this.x = game.player.x;
      this.y = game.player.y - 40;
      this.vx = 0;
      this.vy = 0;
      this.attackCd = 0;
      this.animT = 0;
      this.dead = false;
      this.orbit = Math.random() * 6.283;
      this.target = null;
      this.life = 60;
    }
    update(dt) {
      const game = this.game;
      const p = game.player;
      this.animT += dt;
      this.life -= dt;
      if (this.life <= 0) { this.dead = true; return; }
      this.orbit += dt * 1.2;
      let target = null;
      let best = 460;
      for (const e of game.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.cx - p.x, e.cy - p.y);
        if (d < best) { best = d; target = e; }
      }
      this.target = target;
      let tx, ty;
      if (target) {
        tx = target.cx;
        ty = target.cy;
      } else {
        tx = p.x + Math.cos(this.orbit) * 40;
        ty = p.y - 50 + Math.sin(this.orbit) * 14;
      }
      const a = Math.atan2(ty - this.y, tx - this.x);
      const sp = target ? 320 : 200;
      const dist = Math.hypot(tx - this.x, ty - this.y);
      if (dist > 16) {
        this.vx = T.lerp(this.vx, Math.cos(a) * sp, dt * 6);
        this.vy = T.lerp(this.vy, Math.sin(a) * sp, dt * 6);
      } else {
        this.vx *= 0.9;
        this.vy *= 0.9;
      }
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.attackCd -= dt;
      if (target && dist < 44 && this.attackCd <= 0) {
        this.attackCd = 0.75;
        target.hurt(9, { knock: 2 });
        game.particles.burst(target.cx, target.cy, 6, { color: ['#5ab4e0', '#b0e8ff'], speed: 60, life: 0.3, gravity: 100 });
      }
      if (Math.random() < dt * 4) {
        game.particles.spawn({
          x: this.x + (Math.random() - 0.5) * 10, y: this.y + (Math.random() - 0.5) * 10,
          vx: 0, vy: -12, life: 0, max: 0.4, size: 2, color: 'rgba(120,210,255,0.6)', gravity: 0, glow: true
        });
      }
    }
    draw(ctx, cam, zoom, vw, vh) {
      const p = this.game.renderer.worldToScreen(cam, this.x, this.y);
      const s = zoom * 0.8;
      ctx.save();
      ctx.translate(p.x, p.y);
      const squash = 1 + Math.sin(this.animT * 6) * 0.06;
      const g = ctx.createRadialGradient(0, -10 * s, 2, 0, -8 * s, 18 * s);
      g.addColorStop(0, '#b0e8ff');
      g.addColorStop(0.7, '#4a9ad8');
      g.addColorStop(1, '#235a80');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, -7 * s, 11 * s * squash, 10 * s / squash, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-3 * s, -9 * s, 2.4 * s, 0, 6.283);
      ctx.arc(3 * s, -9 * s, 2.4 * s, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#103040';
      ctx.beginPath();
      ctx.arc(-3 * s, -9 * s, 1.2 * s, 0, 6.283);
      ctx.arc(3 * s, -9 * s, 1.2 * s, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }
  }

  const NPC_DEFS = {
    guide: {
      name: '向导', role: '向导', color: '#d8c8a0', hair: '#c8a060', shirt: '#5a7a4a',
      shop: [], tips: [
        '夜晚会变得危险，记得在日落前造好房子。',
        '工作台可以做大部分基础装备，熔炉能冶炼矿石。',
        '用镐挖掘石块，用斧砍树，用锤拆除墙壁。',
        '心脏水晶能永久提升生命上限。',
        '腐化之地深处的恶魔祭坛能做召唤物。',
        '把向导巫毒娃娃扔进岩浆……会有人付出代价。',
        '在地牢里待太久会招来骷髅王。',
        '生命越低越危险，随时带几瓶治疗药水。'
      ]
    },
    merchant: {
      name: '商人', role: '商人', color: '#e0c090', hair: '#8a5a2a', shirt: '#8a5a9a',
      shop: [
        { id: 'healing_potion', price: 300 }, { id: 'mana_potion', price: 200 },
        { id: 'torch', price: 12 }, { id: 'bottled_water', price: 20 },
        { id: 'wood_bow', price: 220 }, { id: 'arrow', price: 8 },
        { id: 'cloud_in_a_bottle', price: 3000 }, { id: 'hermes_boots', price: 4000 },
        { id: 'lucky_horseshoe', price: 2500 }, { id: 'bottle', price: 100 },
        { id: 'ironskin_potion', price: 600 }, { id: 'swiftness_potion', price: 600 }
      ]
    },
    nurse: {
      name: '护士', role: '治疗', color: '#f0d0d0', hair: '#d8a0a0', shirt: '#e8e8f0',
      shop: [
        { id: 'greater_healing_potion', price: 1200 },
        { id: 'regeneration_potion', price: 800 },
        { id: 'band_of_regeneration', price: 6000 }
      ]
    },
    demolitionist: {
      name: '爆破专家', role: '军火', color: '#c8b0a0', hair: '#5a4a3a', shirt: '#8a4a3a',
      shop: [
        { id: 'bullet', price: 15 }, { id: 'musket', price: 8000 },
        { id: 'boomstick', price: 20000 }, { id: 'silver_bullet', price: 40 }
      ]
    },
    dryad: {
      name: '树妖', role: '自然', color: '#c8e0b0', hair: '#4a8a3a', shirt: '#4a8a4a',
      shop: [
        { id: 'acorn', price: 50 }, { id: 'anklet_of_the_wind', price: 5000 },
        { id: 'healing_potion', price: 280 }, { id: 'night_owl_potion', price: 900 }
      ]
    },
    wizard: {
      name: '巫师', role: '魔法', color: '#d8d0e8', hair: '#c8c8d8', shirt: '#5a5a9a',
      shop: [
        { id: 'mana_potion', price: 180 }, { id: 'greater_mana_potion', price: 800 },
        { id: 'mana_flower', price: 12000 }, { id: 'space_gun', price: 16000 }
      ]
    },
    armsdealer: {
      name: '军火商', role: '枪械', color: '#e0c8b0', hair: '#3a2a2a', shirt: '#4a6a4a',
      shop: [
        { id: 'silver_bullet', price: 45 }, { id: 'flame_arrow', price: 20 },
        { id: 'musket', price: 9000 }, { id: 'warrior_emblem', price: 15000 }
      ]
    }
  };
  T.NPC_DEFS = NPC_DEFS;

  class NPC {
    constructor(game, type, x, y) {
      this.game = game;
      this.type = type;
      const d = NPC_DEFS[type];
      this.def = d;
      this.name = d.name;
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.w = 20;
      this.h = 40;
      this.dir = Math.random() < 0.5 ? -1 : 1;
      this.animT = Math.random() * 10;
      this.grounded = false;
      this.moveCd = 0;
      this.targetX = this.x;
      this.talkT = 0;
      this.idle = 0;
      this.homeY = y;
    }

    rect() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
    get cx() { return this.x; }
    get cy() { return this.y - this.h / 2; }

    update(dt) {
      const game = this.game;
      const world = game.world;
      const p = game.player;
      this.animT += dt;
      this.moveCd -= dt;
      const dist = Math.hypot(p.x - this.x, p.y - this.y);
      if (this.moveCd <= 0) {
        this.moveCd = 2 + Math.random() * 4;
        if (Math.random() < 0.5) {
          this.targetX = this.x + (Math.random() - 0.5) * 90;
        } else {
          this.targetX = p.x + (Math.random() < 0.5 ? -50 : 50);
        }
        if (dist > 400) this.targetX = p.x + (Math.random() - 0.5) * 80;
      }
      const dx = this.targetX - this.x;
      if (Math.abs(dx) > 8) {
        this.dir = dx > 0 ? 1 : -1;
        this.vx = this.dir * 42;
      } else {
        this.vx *= 0.8;
      }
      this.vx += 0;
      this.x += this.vx * dt;
      this.vy += 1200 * dt;
      this.y += this.vy * dt;
      const tx = Math.floor(this.x / TS);
      const footTy = Math.floor(this.y / TS);
      this.grounded = false;
      if (T.isSolid(world.getTile(tx, footTy)) || T.isPlatform(world.getTile(tx, footTy))) {
        this.y = footTy * TS;
        this.vy = 0;
        this.grounded = true;
      }
      const aheadX = Math.floor((this.x + this.dir * 14) / TS);
      if (this.grounded && !T.isSolid(world.getTile(aheadX, footTy)) && !T.isPlatform(world.getTile(aheadX, footTy))) {
        this.vx = 0;
        this.targetX = this.x;
      }
      if (this.x < 20) this.x = 20;
      if (this.x > world.W * TS - 20) this.x = world.W * TS - 20;
      if (this.y > world.H * TS) this.respawnNearSpawn();
      if (dist > 1600) this.respawnNearSpawn();
      if (this.talkT > 0) this.talkT -= dt;
    }

    respawnNearSpawn() {
      const sp = this.game.world.spawn;
      this.x = (sp.x + (Math.random() - 0.5) * 8) * TS;
      this.y = sp.y * TS;
      this.vy = 0;
      this.targetX = this.x;
    }

    draw(ctx, cam, zoom, vw, vh) {
      const p = this.game.renderer.worldToScreen(cam, this.x, this.y);
      const s = zoom;
      const d = this.def;
      const t = this.animT;
      const walking = Math.abs(this.vx) > 5;
      const phase = walking ? Math.sin(t * 9) : Math.sin(t * 1.7) * 0.15;
      const bob = walking ? Math.abs(Math.sin(t * 9)) * 1.2 : Math.sin(t * 1.7) * 0.5;
      const skin = '#f0c8a0';
      const skinDark = '#d8a878';
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      ctx.beginPath();
      ctx.ellipse(0, 1, 10 * s, 3.2 * s, 0, 0, 6.283);
      ctx.fill();
      ctx.scale(this.dir, 1);
      ctx.lineCap = 'round';
      const hip = -18 * s;
      const drawLeg = function (side, ang) {
        ctx.save();
        ctx.translate(side * 3.2 * s, hip);
        ctx.rotate(ang);
        ctx.strokeStyle = '#3a3048';
        ctx.lineWidth = 5 * s;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 9 * s);
        ctx.stroke();
        ctx.fillStyle = '#2a2230';
        ctx.beginPath();
        ctx.ellipse(1.4 * s, 10 * s, 4 * s, 2.4 * s, 0, 0, 6.283);
        ctx.fill();
        ctx.restore();
      };
      drawLeg(-1, phase * 0.5);
      drawLeg(1, -phase * 0.5);
      const shoulder = -32 * s + bob;
      ctx.save();
      ctx.translate(-5 * s, shoulder + 2 * s);
      ctx.rotate(-phase * 0.35 - 0.1);
      ctx.strokeStyle = T.shade(d.shirt, -0.25);
      ctx.lineWidth = 4.4 * s;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 9 * s);
      ctx.stroke();
      ctx.fillStyle = skinDark;
      ctx.beginPath();
      ctx.arc(0, 10 * s, 2.6 * s, 0, 6.283);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = d.shirt;
      ctx.beginPath();
      ctx.moveTo(-6.6 * s, shoulder + 2 * s);
      ctx.quadraticCurveTo(0, shoulder - 1.6 * s, 6.6 * s, shoulder + 2 * s);
      ctx.lineTo(7 * s, hip + 2 * s);
      ctx.quadraticCurveTo(0, hip + 4 * s, -7 * s, hip + 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(-6 * s, shoulder + 4 * s, 12 * s, 1.6 * s);
      if (this.type === 'merchant' || this.type === 'armsdealer' || this.type === 'demolitionist') {
        ctx.fillStyle = '#5a3a20';
        ctx.fillRect(-7 * s, hip - 1 * s, 14 * s, 3 * s);
        ctx.fillStyle = '#c8a050';
        ctx.fillRect(-1.4 * s, hip - 1 * s, 2.8 * s, 3 * s);
      }
      if (this.type === 'nurse') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-7 * s, shoulder + 2 * s);
        ctx.lineTo(-4 * s, hip);
        ctx.lineTo(4 * s, hip);
        ctx.lineTo(7 * s, shoulder + 2 * s);
        ctx.closePath();
        ctx.fill();
      }
      ctx.save();
      ctx.translate(6.4 * s, shoulder + 3 * s);
      ctx.rotate(phase * 0.4 + 0.06);
      ctx.strokeStyle = d.shirt;
      ctx.lineWidth = 4.6 * s;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 9 * s);
      ctx.stroke();
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(0, 10 * s, 2.8 * s, 0, 6.283);
      ctx.fill();
      if (this.type === 'wizard') {
        ctx.strokeStyle = '#8a6a4a';
        ctx.lineWidth = 2.2 * s;
        ctx.beginPath();
        ctx.moveTo(0, 9 * s);
        ctx.lineTo(0, -12 * s);
        ctx.stroke();
        ctx.fillStyle = '#9ad8ff';
        ctx.beginPath();
        ctx.arc(0, -13 * s, 2.6 * s, 0, 6.283);
        ctx.fill();
      }
      if (this.type === 'dryad') {
        ctx.strokeStyle = '#4a8a3a';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(0, 8 * s);
        ctx.quadraticCurveTo(4 * s, -2 * s, 1 * s, -10 * s);
        ctx.stroke();
        ctx.fillStyle = '#7ac24a';
        ctx.beginPath();
        ctx.ellipse(2.4 * s, -8 * s, 3.4 * s, 1.8 * s, 0.5, 0, 6.283);
        ctx.fill();
      }
      ctx.restore();
      const headY = -41 * s + bob;
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(0, headY, 7.6 * s, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = skinDark;
      ctx.beginPath();
      ctx.arc(1.2 * s, headY + 1.2 * s, 7 * s, -0.4, 1.6);
      ctx.fill();
      ctx.fillStyle = d.hair;
      ctx.beginPath();
      ctx.arc(-0.4 * s, headY - 1.6 * s, 7.9 * s, Math.PI * 0.92, Math.PI * 2.12);
      ctx.fill();
      ctx.fillRect(-8 * s, headY - 2 * s, 3.2 * s, 8 * s);
      if (this.type === 'nurse' || this.type === 'wizard') {
        ctx.fillStyle = d.hair;
        ctx.beginPath();
        ctx.arc(-2 * s, headY + 2 * s, 3.4 * s, 0, 6.283);
        ctx.fill();
      }
      ctx.fillStyle = '#221a20';
      ctx.beginPath();
      ctx.arc(3.4 * s, headY + 0.4 * s, 1.2 * s, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(3.7 * s, headY + 0.1 * s, 0.5 * s, 0, 6.283);
      ctx.fill();
      if (this.type === 'merchant') {
        ctx.fillStyle = '#6a4a2a';
        ctx.beginPath();
        ctx.ellipse(0, headY - 5 * s, 9.4 * s, 3.4 * s, 0, 0, 6.283);
        ctx.fill();
        ctx.fillRect(-9.4 * s, headY - 5.4 * s, 18.8 * s, 3 * s);
        ctx.fillStyle = '#c8a050';
        ctx.fillRect(-9.4 * s, headY - 3 * s, 18.8 * s, 1.6 * s);
      }
      if (this.type === 'nurse') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3 * s, headY - 8 * s, 6 * s, 2 * s);
        ctx.fillRect(-1 * s, headY - 10 * s, 2 * s, 6 * s);
      }
      if (this.type === 'wizard') {
        ctx.fillStyle = '#3a3a6a';
        ctx.beginPath();
        ctx.moveTo(-9 * s, headY - 4 * s);
        ctx.lineTo(0, headY - 22 * s);
        ctx.lineTo(9 * s, headY - 4 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#c8c060';
        ctx.beginPath();
        ctx.arc(2 * s, headY - 10 * s, 1.4 * s, 0, 6.283);
        ctx.fill();
      }
      if (this.type === 'dryad') {
        ctx.strokeStyle = '#6ab04a';
        ctx.lineWidth = 1.6 * s;
        ctx.beginPath();
        ctx.arc(0, headY - 3 * s, 8.6 * s, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
        ctx.fillStyle = '#e8a0c0';
        ctx.beginPath();
        ctx.arc(5 * s, headY - 6 * s, 2 * s, 0, 6.283);
        ctx.fill();
      }
      if (this.type === 'demolitionist') {
        ctx.fillStyle = '#8a3a2a';
        ctx.beginPath();
        ctx.arc(0, headY - 5 * s, 8.8 * s, Math.PI, 0);
        ctx.fill();
      }
      if (this.type === 'armsdealer') {
        ctx.fillStyle = '#2a2a20';
        ctx.beginPath();
        ctx.arc(-0.6 * s, headY - 5 * s, 8 * s, Math.PI * 1.05, Math.PI * 1.95);
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '600 ' + Math.round(12 * Math.max(1, zoom * 0.7)) + 'px "Noto Sans SC", sans-serif';
      const label = d.name;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(10,14,22,0.55)';
      const ly = p.y - 62 * s;
      ctx.beginPath();
      ctx.roundRect(p.x - tw / 2 - 6, ly - 13, tw + 12, 18, 9);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,244,220,0.95)';
      ctx.fillText(label, p.x, ly);
      ctx.restore();
    }
  }

  T.Enemy = Enemy;
  T.Boss = Boss;
  T.Projectile = Projectile;
  T.DropItem = DropItem;
  T.Minion = Minion;
  T.NPC = NPC;
})();
