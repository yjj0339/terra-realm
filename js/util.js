(function () {
  const T = window.T = window.T || {};

  T.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  T.lerp = function (a, b, t) { return a + (b - a) * t; };
  T.invLerp = function (a, b, v) { return a === b ? 0 : (v - a) / (b - a); };
  T.smooth = function (t) { return t * t * (3 - 2 * t); };
  T.sign = function (v) { return v < 0 ? -1 : v > 0 ? 1 : 0; };
  T.dist = function (x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1; return Math.hypot(dx, dy); };
  T.dist2 = function (x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1; return dx * dx + dy * dy; };
  T.mod = function (a, n) { return ((a % n) + n) % n; };
  T.approach = function (v, target, step) { return v < target ? Math.min(v + step, target) : Math.max(v - step, target); };

  T.rectsOverlap = function (a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  };
  T.pointInRect = function (px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  };

  T.mulberry32 = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  T.RNG = function (seed) {
    const r = T.mulberry32(seed);
    const api = function () { return r(); };
    api.next = r;
    api.range = function (a, b) { return a + r() * (b - a); };
    api.int = function (a, b) { return Math.floor(a + r() * (b - a + 1)); };
    api.chance = function (p) { return r() < p; };
    api.pick = function (arr) { return arr[Math.floor(r() * arr.length)]; };
    api.shuffle = function (arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr;
    };
    return api;
  };

  T.hashString = function (str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  T.hash2i = function (x, y, s) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 69069);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };

  T.Noise = (function () {
    let perm = new Uint8Array(512);
    let seeded = false;
    const fade = function (t) { return t * t * t * (t * (t * 6 - 15) + 10); };
    const grads = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];

    function grad(hash, x, y) {
      const g = grads[hash & 7];
      return g[0] * x + g[1] * y;
    }

    function seed(s) {
      const rnd = T.mulberry32(s >>> 0);
      const p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) p[i] = i;
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        const t = p[i]; p[i] = p[j]; p[j] = t;
      }
      for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
      seeded = true;
    }

    function noise(x, y) {
      if (!seeded) seed(1337);
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const X = xi & 255, Y = yi & 255;
      const u = fade(xf), v = fade(yf);
      const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1];
      const ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
      const x1 = T.lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
      const x2 = T.lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
      return T.lerp(x1, x2, v) * 1.42;
    }

    function fbm(x, y, oct, gain, lac) {
      oct = oct || 4; gain = gain === undefined ? 0.5 : gain; lac = lac || 2;
      let amp = 1, freq = 1, sum = 0, norm = 0;
      for (let i = 0; i < oct; i++) {
        sum += noise(x * freq, y * freq) * amp;
        norm += amp;
        amp *= gain; freq *= lac;
      }
      return sum / norm;
    }

    function ridged(x, y, oct) {
      oct = oct || 4;
      let amp = 1, freq = 1, sum = 0, norm = 0;
      for (let i = 0; i < oct; i++) {
        const n = 1 - Math.abs(noise(x * freq, y * freq));
        sum += n * n * amp; norm += amp;
        amp *= 0.5; freq *= 2;
      }
      return sum / norm;
    }

    return { seed: seed, noise: noise, fbm: fbm, ridged: ridged };
  })();

  T.rgb = function (c) {
    if (Array.isArray(c)) return c;
    if (typeof c !== 'string') return [255, 0, 255];
    if (c[0] === '#') {
      let h = c.slice(1);
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    const m = c.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    if (m) return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
    return [255, 0, 255];
  };

  T.rgba = function (c, a) {
    const v = T.rgb(c);
    return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')';
  };

  T.mixColor = function (a, b, t) {
    const ca = T.rgb(a), cb = T.rgb(b);
    return 'rgb(' + Math.round(T.lerp(ca[0], cb[0], t)) + ',' + Math.round(T.lerp(ca[1], cb[1], t)) + ',' + Math.round(T.lerp(ca[2], cb[2], t)) + ')';
  };

  T.shade = function (c, amt) {
    const v = T.rgb(c);
    const f = function (x) { return T.clamp(Math.round(amt >= 0 ? x + (255 - x) * amt : x * (1 + amt)), 0, 255); };
    return 'rgb(' + f(v[0]) + ',' + f(v[1]) + ',' + f(v[2]) + ')';
  };

  T.randomColorVariant = function (c, rnd, amount) {
    const v = T.rgb(c);
    const amt = amount === undefined ? 0.08 : amount;
    const f = function (x) { return T.clamp(Math.round(x + (rnd() * 2 - 1) * 255 * amt), 0, 255); };
    return 'rgb(' + f(v[0]) + ',' + f(v[1]) + ',' + f(v[2]) + ')';
  };

  T.coinString = function (copper) {
    copper = Math.max(0, Math.floor(copper));
    const g = Math.floor(copper / 10000); copper -= g * 10000;
    const s = Math.floor(copper / 100); copper -= s * 100;
    const parts = [];
    if (g) parts.push(g + '金');
    if (s) parts.push(s + '银');
    if (copper || !parts.length) parts.push(copper + '铜');
    return parts.join(' ');
  };

  T.timeString = function (minutes) {
    const h = Math.floor(minutes / 60) % 24, m = Math.floor(minutes % 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  };

  T.pad2 = function (n) { return n < 10 ? '0' + n : '' + n; };

  T.roman = function (n) {
    const map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let out = '';
    for (const [v, s] of map) { while (n >= v) { out += s; n -= v; } }
    return out;
  };

  T.escapeHTML = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  T.throttle = function (fn, ms) {
    let last = 0;
    return function () {
      const now = performance.now();
      if (now - last >= ms) { last = now; fn.apply(null, arguments); }
    };
  };

  T.loadImage = function (src) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  };

  T.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  T.debounce = function (fn, ms) {
    let t = 0;
    return function () {
      clearTimeout(t);
      const args = arguments;
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  };

  T.arraySwap = function (a, i, j) { const t = a[i]; a[i] = a[j]; a[j] = t; };

  T.encodeRLE = function (arr) {
    const out = [];
    let i = 0;
    const n = arr.length;
    while (i < n) {
      const v = arr[i];
      let c = 1;
      while (i + c < n && arr[i + c] === v && c < 65535) c++;
      out.push(v, c);
      i += c;
    }
    return out;
  };

  T.decodeRLE = function (runs, length, Type) {
    const arr = new Type(length);
    let p = 0;
    for (let i = 0; i < runs.length; i += 2) {
      const v = runs[i], c = runs[i + 1];
      for (let k = 0; k < c && p < length; k++) arr[p++] = v;
    }
    return arr;
  };
})();
