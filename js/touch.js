(function () {
  const T = window.T;

  function isTouchDevice() {
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  }

  class TouchControls {
    constructor(game) {
      this.game = game;
      this.enabled = false;
      this.root = null;
      this.moveId = null;
      this.aimId = null;
      this.moveOrigin = { x: 0, y: 0 };
      this.moveVec = { x: 0, y: 0 };
      this.buttons = {};
      this.aiming = false;
      this.aimPos = { x: 0, y: 0 };
      this.using = false;
      this.lastTap = 0;
      this.jumpQueued = false;
      this.build();
    }

    build() {
      const root = document.createElement('div');
      root.id = 'touch-layer';
      root.className = 'touch-layer';
      root.innerHTML = [
        '<div class="touch-stick" id="touch-stick"><div class="touch-knob" id="touch-knob"></div></div>',
        '<div class="touch-side">',
        '  <button class="touch-btn t-jump" data-act="jump">跳</button>',
        '  <button class="touch-btn t-use" data-act="use">挖</button>',
        '  <button class="touch-btn t-place" data-act="place">放</button>',
        '  <button class="touch-btn t-bag" data-act="bag">包</button>',
        '  <button class="touch-btn t-heal" data-act="heal">药</button>',
        '</div>',
        '<div class="touch-hint" id="touch-hint">左侧拖动移动 · 右侧点按挖掘 / 攻击</div>'
      ].join('');
      document.body.appendChild(root);
      this.root = root;
      this.stick = root.querySelector('#touch-stick');
      this.knob = root.querySelector('#touch-knob');
      this.bind();
      const hint = root.querySelector('#touch-hint');
      setTimeout(function () { if (hint) hint.style.opacity = '0'; }, 5200);
    }

    bind() {
      const self = this;
      const canvas = document.getElementById('game');
      const prevent = function (e) { e.preventDefault(); };

      this.root.addEventListener('touchstart', prevent, { passive: false });
      this.root.addEventListener('touchmove', prevent, { passive: false });
      this.root.querySelectorAll('.touch-btn').forEach(function (btn) {
        btn.addEventListener('touchstart', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const act = btn.dataset.act;
          self.pressButton(act, true);
          btn.classList.add('down');
        }, { passive: false });
        btn.addEventListener('touchend', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const act = btn.dataset.act;
          self.pressButton(act, false);
          btn.classList.remove('down');
        }, { passive: false });
        btn.addEventListener('touchcancel', function (e) {
          const act = btn.dataset.act;
          self.pressButton(act, false);
          btn.classList.remove('down');
        });
      });

      const stick = this.stick;
      const onStickStart = function (e) {
        e.preventDefault();
        const t = e.changedTouches[0];
        self.moveId = t.identifier;
        const r = stick.getBoundingClientRect();
        self.stickCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        self.updateStick(t.clientX, t.clientY);
      };
      const onStickMove = function (e) {
        if (self.moveId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === self.moveId) {
            e.preventDefault();
            self.updateStick(t.clientX, t.clientY);
          }
        }
      };
      const onStickEnd = function (e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === self.moveId) {
            self.moveId = null;
            self.moveVec.x = 0;
            self.moveVec.y = 0;
            self.stick.classList.remove('active');
            self.knob.style.transform = 'translate(-50%, -50%)';
          }
        }
      };
      stick.addEventListener('touchstart', onStickStart, { passive: false });
      stick.addEventListener('touchmove', onStickMove, { passive: false });
      stick.addEventListener('touchend', onStickEnd);
      stick.addEventListener('touchcancel', onStickEnd);

      canvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
        if (!self.game.started || self.game.paused) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          const r = canvas.getBoundingClientRect();
          const lx = t.clientX - r.left;
          const ly = t.clientY - r.top;
          if (lx < r.width * 0.34) {
            if (self.moveId === null) {
              self.moveId = t.identifier;
              self.stickCenter = { x: t.clientX, y: t.clientY };
              self.stick.classList.add('active');
              self.updateStick(t.clientX, t.clientY);
            }
          } else if (self.aimId === null) {
            self.aimId = t.identifier;
            self.aimPos.x = t.clientX;
            self.aimPos.y = t.clientY;
            self.aiming = true;
            self.game.mouse.x = t.clientX;
            self.game.mouse.y = t.clientY;
            self.pressButton('use', true);
          }
        }
      }, { passive: false });

      canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === self.moveId && self.stickCenter && !self.stick.classList.contains('active')) {
            self.updateStickFromOrigin(t.clientX, t.clientY);
          } else if (t.identifier === self.moveId && !self.stick.classList.contains('active')) {
            self.updateStickFromOrigin(t.clientX, t.clientY);
          } else if (t.identifier === self.aimId) {
            self.aimPos.x = t.clientX;
            self.aimPos.y = t.clientY;
            self.game.mouse.x = t.clientX;
            self.game.mouse.y = t.clientY;
          }
        }
      }, { passive: false });

      const endTouch = function (e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === self.moveId) {
            self.moveId = null;
            self.moveVec.x = 0;
            self.moveVec.y = 0;
            self.stick.classList.remove('active');
            self.knob.style.transform = 'translate(-50%, -50%)';
          }
          if (t.identifier === self.aimId) {
            self.aimId = null;
            self.aiming = false;
            self.pressButton('use', false);
          }
        }
      };
      canvas.addEventListener('touchend', endTouch);
      canvas.addEventListener('touchcancel', endTouch);
    }

    updateStick(cx, cy) {
      this.stick.classList.add('active');
      if (this.stickCenter) this.updateStickFromOrigin(cx, cy);
    }

    updateStickFromOrigin(cx, cy) {
      const c = this.stickCenter || { x: cx, y: cy };
      let dx = cx - c.x;
      let dy = cy - c.y;
      const max = 54;
      const d = Math.hypot(dx, dy);
      if (d > max) { dx = dx / d * max; dy = dy / d * max; }
      this.knob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
      this.moveVec.x = T.clamp(dx / max, -1, 1);
      this.moveVec.y = T.clamp(dy / max, -1, 1);
      if (this.moveVec.x > 0.28) this.game.keys.right = true; else this.game.keys.right = false;
      if (this.moveVec.x < -0.28) this.game.keys.left = true; else this.game.keys.left = false;
      if (this.moveVec.y < -0.5) this.game.keys.up = true; else this.game.keys.up = false;
      if (this.moveVec.y > 0.5) this.game.keys.down = true; else this.game.keys.down = false;
    }

    pressButton(act, down) {
      const g = this.game;
      if (act === 'jump') {
        g.keys.jump = down;
        if (down) g.edge.jump = true;
      } else if (act === 'use') {
        g.mouseDown = down;
      } else if (act === 'place') {
        g.rightDown = down;
        if (!down) g.edge.releaseHook = true;
      } else if (act === 'bag') {
        if (down) g.ui.toggle('inv');
      } else if (act === 'heal') {
        if (down) g.edge.quickHeal = true;
      }
    }

    update() {
      const g = this.game;
      if (!this.enabled) return;
      if (this.aiming) {
        g.mouse.x = this.aimPos.x;
        g.mouse.y = this.aimPos.y;
      }
      const mv = this.moveVec;
      if (Math.abs(mv.x) > 0.28) {
        const sp = Math.abs(mv.x);
        g.keys.left = mv.x < 0;
        g.keys.right = mv.x > 0;
      }
    }

    show() {
      if (!this.root) return;
      this.enabled = true;
      this.root.classList.add('on');
      document.body.classList.add('touch-mode');
      const vv = window.visualViewport;
      const resize = () => {
        document.documentElement.style.setProperty('--vh', window.innerHeight + 'px');
      };
      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('orientationchange', () => setTimeout(resize, 120));
      if (vv) vv.addEventListener('resize', resize);
    }

    hide() {
      this.enabled = false;
      if (this.root) this.root.classList.remove('on');
      document.body.classList.remove('touch-mode');
    }
  }

  T.TouchControls = TouchControls;
  T.isTouchDevice = isTouchDevice;
})();
