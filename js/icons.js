(function () {
  const T = window.T;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function blade(ctx, col, edge, glow) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(9, 2);
    ctx.lineTo(14, 7);
    ctx.lineTo(7, 15);
    ctx.lineTo(5, 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = edge;
    ctx.beginPath();
    ctx.moveTo(9, 2);
    ctx.lineTo(14, 7);
    ctx.lineTo(10, 9);
    ctx.closePath();
    ctx.fill();
    if (glow) {
      ctx.strokeStyle = glow;
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#8a6236';
    ctx.fillRect(3, 13, 4, 2);
    ctx.fillStyle = '#c8a86b';
    ctx.fillRect(2, 14, 3, 2);
    ctx.fillStyle = '#4a341c';
    ctx.fillRect(3, 10, 2, 5);
  }

  function pick(ctx, col, edge) {
    ctx.strokeStyle = '#8a6236';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(4, 15);
    ctx.lineTo(11, 8);
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(7, 4);
    ctx.quadraticCurveTo(13, 3, 16, 8);
    ctx.quadraticCurveTo(12, 8, 10, 12);
    ctx.quadraticCurveTo(6, 9, 7, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(8, 5);
    ctx.quadraticCurveTo(12, 5, 14, 8);
    ctx.stroke();
  }

  function axe(ctx, col, edge) {
    ctx.strokeStyle = '#8a6236';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(4, 15);
    ctx.lineTo(12, 6);
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(8, 3);
    ctx.quadraticCurveTo(15, 2, 16, 8);
    ctx.quadraticCurveTo(12, 7, 8, 11);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(10, 4);
    ctx.quadraticCurveTo(14, 4, 15, 7);
    ctx.stroke();
  }

  function hammer(ctx, col, edge) {
    ctx.strokeStyle = '#8a6236';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(5, 15);
    ctx.lineTo(11, 8);
    ctx.stroke();
    ctx.fillStyle = col;
    rr(ctx, 7, 2, 9, 6, 1.5);
    ctx.fill();
    ctx.fillStyle = edge;
    ctx.fillRect(8, 3, 6, 1.5);
  }

  function bow(ctx, col) {
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(6, 8, 7, -1.1, 1.1);
    ctx.stroke();
    ctx.strokeStyle = '#e8e0d0';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(8.5, 1.5);
    ctx.lineTo(8.5, 14.5);
    ctx.stroke();
    ctx.strokeStyle = '#c8a86b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(7, 8);
    ctx.lineTo(14, 8);
    ctx.stroke();
    ctx.fillStyle = '#d8d0c0';
    ctx.beginPath();
    ctx.moveTo(14, 8);
    ctx.lineTo(11.5, 6.6);
    ctx.lineTo(11.5, 9.4);
    ctx.closePath();
    ctx.fill();
  }

  function gun(ctx, col) {
    ctx.fillStyle = col;
    ctx.fillRect(2, 7, 11, 3);
    ctx.fillRect(9, 9, 3, 4);
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(3, 10, 4, 4);
    ctx.fillStyle = '#c8a86b';
    ctx.fillRect(11, 6, 3, 2);
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(2, 7, 2, 3);
  }

  function staff(ctx, col, glow) {
    ctx.strokeStyle = '#8a6236';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(4, 15);
    ctx.lineTo(11, 5);
    ctx.stroke();
    ctx.fillStyle = glow || col;
    ctx.beginPath();
    ctx.arc(12, 5, 3.6, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(11, 4, 1.4, 0, 6.283);
    ctx.fill();
  }

  function potion(ctx, col) {
    ctx.fillStyle = 'rgba(200,220,235,0.5)';
    ctx.beginPath();
    ctx.moveTo(7, 2);
    ctx.lineTo(9, 2);
    ctx.lineTo(9, 5);
    ctx.quadraticCurveTo(13.5, 7, 13.5, 11);
    ctx.quadraticCurveTo(13.5, 15, 8, 15);
    ctx.quadraticCurveTo(2.5, 15, 2.5, 11);
    ctx.quadraticCurveTo(2.5, 7, 7, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(3.4, 9);
    ctx.quadraticCurveTo(8, 7.4, 12.6, 9);
    ctx.quadraticCurveTo(13.2, 14.4, 8, 14.4);
    ctx.quadraticCurveTo(2.8, 14.4, 3.4, 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(5.5, 9.6, 1.6, 3.4);
    ctx.fillStyle = '#c8a86b';
    ctx.fillRect(6.5, 1, 3, 2);
  }

  function armor(ctx, col, kind) {
    if (kind === 'helmet') {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(3, 12);
      ctx.quadraticCurveTo(3, 3, 8, 3);
      ctx.quadraticCurveTo(13, 3, 13, 12);
      ctx.lineTo(10, 12);
      ctx.lineTo(10, 8);
      ctx.lineTo(6, 8);
      ctx.lineTo(6, 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(5, 5, 2, 2);
    } else if (kind === 'chestplate') {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(4, 4);
      ctx.lineTo(12, 4);
      ctx.lineTo(14, 7);
      ctx.lineTo(12, 8);
      ctx.lineTo(12, 14);
      ctx.lineTo(4, 14);
      ctx.lineTo(4, 8);
      ctx.lineTo(2, 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fillRect(6, 6, 4, 1.5);
    } else {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(5, 3);
      ctx.lineTo(11, 3);
      ctx.lineTo(11, 9);
      ctx.lineTo(9, 14);
      ctx.lineTo(7, 14);
      ctx.lineTo(5, 9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(7, 5, 2, 5);
    }
  }

  function ore(ctx, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(3, 11);
    ctx.lineTo(5, 5);
    ctx.lineTo(10, 3);
    ctx.lineTo(14, 8);
    ctx.lineTo(12, 13);
    ctx.lineTo(6, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(6, 6);
    ctx.lineTo(9, 5);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(5, 11); ctx.lineTo(9, 9); ctx.lineTo(11, 12);
    ctx.stroke();
  }

  function bar(ctx, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(2, 10);
    ctx.lineTo(9, 6);
    ctx.lineTo(14, 9);
    ctx.lineTo(7, 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.moveTo(2, 10);
    ctx.lineTo(9, 6);
    ctx.lineTo(10, 7);
    ctx.lineTo(3, 11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(7, 13);
    ctx.lineTo(14, 9);
    ctx.lineTo(14, 10.5);
    ctx.lineTo(7, 14.5);
    ctx.closePath();
    ctx.fill();
  }

  function gem(ctx, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.lineTo(14, 7);
    ctx.lineTo(8, 15);
    ctx.lineTo(2, 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.moveTo(8, 3.5);
    ctx.lineTo(11, 7);
    ctx.lineTo(8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function blockIcon(ctx, col) {
    const c = T.rgb(col);
    ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
    ctx.fillRect(2, 3, 12, 11);
    ctx.fillStyle = 'rgba(255,255,255,0.24)';
    ctx.fillRect(2, 3, 12, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.fillRect(2, 12, 12, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(2, 3, 1, 11);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(13, 3, 1, 11);
  }

  function furnitureIcon(ctx, item) {
    const c = item.color || '#b08045';
    switch (item.icon) {
      case 'chest':
        ctx.fillStyle = '#6d4820';
        ctx.fillRect(2, 6, 12, 9);
        ctx.fillStyle = c;
        ctx.fillRect(2, 7, 12, 7);
        ctx.fillStyle = '#d1a45a';
        ctx.fillRect(2, 5, 12, 3);
        ctx.fillStyle = '#f0d070';
        ctx.fillRect(7, 8, 2, 4);
        break;
      case 'torch':
        ctx.fillStyle = '#7a4c24';
        ctx.fillRect(7, 6, 2, 9);
        ctx.fillStyle = '#ffcc55';
        ctx.beginPath();
        ctx.ellipse(8, 5, 3.4, 4.6, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#fff2b0';
        ctx.beginPath();
        ctx.ellipse(8, 6, 1.6, 2.4, 0, 0, 6.283);
        ctx.fill();
        break;
      case 'workbench':
        ctx.fillStyle = '#633d1b';
        ctx.fillRect(3, 9, 2, 6);
        ctx.fillRect(11, 9, 2, 6);
        ctx.fillStyle = c;
        ctx.fillRect(2, 6, 12, 3);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(2, 6, 12, 1);
        break;
      case 'furnace':
        ctx.fillStyle = '#4a4a52';
        ctx.fillRect(2, 3, 12, 12);
        ctx.fillStyle = '#6f6f77';
        ctx.fillRect(3, 4, 10, 10);
        ctx.fillStyle = '#ff8a2a';
        ctx.fillRect(5, 7, 6, 6);
        ctx.fillStyle = '#ffd070';
        ctx.fillRect(6, 9, 4, 3);
        break;
      case 'anvil':
        ctx.fillStyle = '#4c4c55';
        ctx.fillRect(6, 11, 4, 4);
        ctx.fillStyle = '#7d7d88';
        ctx.fillRect(4, 8, 8, 3);
        ctx.fillRect(2, 6, 10, 3);
        ctx.beginPath();
        ctx.moveTo(10, 6);
        ctx.lineTo(15, 8);
        ctx.lineTo(10, 9);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(3, 6, 7, 1);
        break;
      case 'door':
        ctx.fillStyle = '#633d1b';
        ctx.fillRect(3, 2, 10, 13);
        ctx.fillStyle = c;
        ctx.fillRect(4, 3, 8, 12);
        ctx.fillStyle = '#d1a45a';
        ctx.fillRect(4, 6, 8, 1);
        ctx.fillRect(8, 4, 1, 10);
        ctx.fillStyle = '#f0d070';
        ctx.fillRect(10, 9, 1.5, 1.5);
        break;
      case 'table':
        ctx.fillStyle = '#633d1b';
        ctx.fillRect(3, 9, 2, 6);
        ctx.fillRect(11, 9, 2, 6);
        ctx.fillStyle = c;
        ctx.fillRect(2, 7, 12, 3);
        ctx.fillStyle = '#e8e0d0';
        ctx.fillRect(6, 4, 3, 3);
        break;
      case 'chair':
        ctx.fillStyle = c;
        ctx.fillRect(5, 3, 2, 11);
        ctx.fillRect(9, 3, 2, 11);
        ctx.fillRect(5, 8, 7, 2);
        ctx.fillRect(9, 2, 2, 7);
        break;
      case 'platform':
        ctx.fillStyle = c;
        ctx.fillRect(1, 6, 14, 4);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(1, 6, 14, 1);
        ctx.fillStyle = '#633d1b';
        ctx.fillRect(3, 10, 1.5, 3);
        ctx.fillRect(11, 10, 1.5, 3);
        break;
      case 'rope':
        ctx.strokeStyle = c;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, 1);
        ctx.lineTo(8, 15);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        for (let i = 2; i < 15; i += 3) {
          ctx.beginPath();
          ctx.moveTo(6, i);
          ctx.lineTo(10, i + 1.5);
          ctx.stroke();
        }
        break;
      case 'hellforge':
        ctx.fillStyle = '#3a2a28';
        ctx.fillRect(1, 4, 14, 11);
        ctx.fillStyle = '#5a3a34';
        ctx.fillRect(2, 5, 12, 9);
        ctx.fillStyle = '#ff6a1a';
        ctx.beginPath();
        ctx.arc(8, 11, 5, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#ffd070';
        ctx.beginPath();
        ctx.arc(8, 11, 2.4, 0, 6.283);
        ctx.fill();
        break;
      case 'alchemy':
        ctx.fillStyle = '#4a303a';
        ctx.fillRect(1, 7, 14, 2);
        ctx.fillRect(2, 9, 2, 6);
        ctx.fillRect(12, 9, 2, 6);
        ctx.fillStyle = '#a07a8a';
        ctx.fillRect(5, 2, 3, 5);
        ctx.fillStyle = '#8ce0b0';
        ctx.fillRect(5.5, 3, 2, 2);
        ctx.fillStyle = '#a07a8a';
        ctx.fillRect(9, 4, 2, 3);
        ctx.fillStyle = '#c86a8a';
        ctx.fillRect(8.5, 5, 3, 2);
        break;
      default:
        blockIcon(ctx, c);
    }
  }

  function accessoryIcon(ctx, item) {
    const c = item.color || '#e0c080';
    switch (item.icon) {
      case 'bottle':
        ctx.fillStyle = 'rgba(220,240,250,0.75)';
        ctx.beginPath();
        ctx.moveTo(7, 2); ctx.lineTo(9, 2); ctx.lineTo(9, 5);
        ctx.quadraticCurveTo(13, 7, 13, 11);
        ctx.quadraticCurveTo(13, 15, 8, 15);
        ctx.quadraticCurveTo(3, 15, 3, 11);
        ctx.quadraticCurveTo(3, 7, 7, 5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(8, 8, 3.4, 0.2, 2.6);
        ctx.stroke();
        break;
      case 'boots':
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(4, 3); ctx.lineTo(8, 3); ctx.lineTo(8, 10);
        ctx.lineTo(13, 10); ctx.lineTo(13, 14); ctx.lineTo(4, 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(5, 4, 2, 4);
        break;
      case 'horseshoe':
        ctx.strokeStyle = c;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(8, 8, 5, 0.6, 5.68);
        ctx.stroke();
        ctx.fillStyle = c;
        ctx.fillRect(2.5, 10, 2, 2);
        ctx.fillRect(11.5, 10, 2, 2);
        break;
      case 'ring':
        ctx.strokeStyle = c;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(8, 9, 4.6, 0, 6.283);
        ctx.stroke();
        ctx.fillStyle = '#e05070';
        ctx.beginPath();
        ctx.arc(8, 3.6, 2.4, 0, 6.283);
        ctx.fill();
        break;
      case 'flower':
        for (let i = 0; i < 5; i++) {
          const a = i / 5 * 6.283;
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(8 + Math.cos(a) * 3.4, 8 + Math.sin(a) * 3.4, 2.6, 0, 6.283);
          ctx.fill();
        }
        ctx.fillStyle = '#ffe680';
        ctx.beginPath();
        ctx.arc(8, 8, 2, 0, 6.283);
        ctx.fill();
        break;
      case 'emblem':
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(8, 2);
        ctx.lineTo(13, 5);
        ctx.lineTo(13, 11);
        ctx.lineTo(8, 14);
        ctx.lineTo(3, 11);
        ctx.lineTo(3, 5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(8, 5);
        ctx.lineTo(10, 9);
        ctx.lineTo(8, 11);
        ctx.lineTo(6, 9);
        ctx.closePath();
        ctx.fill();
        break;
      default:
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(8, 8, 5, 0, 6.283);
        ctx.fill();
    }
  }

  function drawIcon(ctx, itemId, x, y, size) {
    const it = T.itemDef(itemId);
    const u = size / 16;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(u, u);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const col = (it && it.color) || '#b0b0b0';
    const icon = it ? it.icon : 'material';
    const glow = it && it.glow;
    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 6;
    }
    switch (icon) {
      case 'sword': blade(ctx, col, T.shade(col, 0.42), glow); break;
      case 'pick': pick(ctx, col, T.shade(col, 0.4)); break;
      case 'axe': axe(ctx, col, T.shade(col, 0.4)); break;
      case 'hammer': hammer(ctx, col, T.shade(col, 0.4)); break;
      case 'bow': bow(ctx, col); break;
      case 'gun': gun(ctx, col); break;
      case 'staff': staff(ctx, col, glow); break;
      case 'potion': potion(ctx, col); break;
      case 'helmet': case 'chestplate': case 'greaves': armor(ctx, col, icon); break;
      case 'ore': ore(ctx, col); break;
      case 'bar': bar(ctx, col); break;
      case 'gem': gem(ctx, col); break;
      case 'block': blockIcon(ctx, col); break;
      case 'furniture': case 'chest': case 'workbench': case 'furnace': case 'anvil':
      case 'door': case 'table': case 'chair': case 'platform': case 'rope':
      case 'torch': case 'hellforge': case 'alchemy':
        furnitureIcon(ctx, it);
        break;
      case 'bottle': case 'boots': case 'horseshoe': case 'ring': case 'flower': case 'emblem':
        accessoryIcon(ctx, it);
        break;
      case 'coin': {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(8, 8, 6, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.beginPath();
        ctx.arc(6, 6, 2.4, 0, 6.283);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(8, 8, 4.4, 0, 6.283);
        ctx.stroke();
        break;
      }
      case 'arrow':
        ctx.strokeStyle = '#8a6236';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(2, 14);
        ctx.lineTo(11, 5);
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(14, 2);
        ctx.lineTo(14, 7);
        ctx.lineTo(9, 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#d8d0c0';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(2, 10); ctx.lineTo(5, 14);
        ctx.moveTo(5, 8); ctx.lineTo(7, 11);
        ctx.stroke();
        break;
      case 'bullet':
        ctx.fillStyle = col;
        rr(ctx, 4, 6, 8, 5, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(11, 6);
        ctx.lineTo(15, 8.5);
        ctx.lineTo(11, 11);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#b08a4a';
        ctx.fillRect(2, 6, 3, 5);
        break;
      case 'gel': {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(3, 11);
        ctx.quadraticCurveTo(2, 4, 8, 3);
        ctx.quadraticCurveTo(14, 4, 13, 11);
        ctx.quadraticCurveTo(12, 14, 8, 14);
        ctx.quadraticCurveTo(4, 14, 3, 11);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.arc(6, 7, 2, 0, 6.283);
        ctx.fill();
        break;
      }
      case 'lens': {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(8, 8, 5, 6.4, 0, 0, 6.283);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(8, 8, 3.2, 0.4, 2.4);
        ctx.stroke();
        break;
      }
      case 'eye': {
        ctx.fillStyle = '#f0e8e0';
        ctx.beginPath();
        ctx.ellipse(8, 8, 6.4, 4.6, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(8, 8, 3, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#201018';
        ctx.beginPath();
        ctx.arc(8, 8, 1.5, 0, 6.283);
        ctx.fill();
        break;
      }
      case 'crystal': {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(8, 1);
        ctx.lineTo(13, 8);
        ctx.lineTo(8, 15);
        ctx.lineTo(3, 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.moveTo(8, 3);
        ctx.lineTo(10, 8);
        ctx.lineTo(8, 12);
        ctx.lineTo(6, 8);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'bone': {
        ctx.fillStyle = col;
        rr(ctx, 2, 6, 12, 4, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3, 5.4, 2.1, 0, 6.283);
        ctx.arc(3, 10.6, 2.1, 0, 6.283);
        ctx.arc(13, 5.4, 2.1, 0, 6.283);
        ctx.arc(13, 10.6, 2.1, 0, 6.283);
        ctx.fill();
        break;
      }
      case 'scale': {
        ctx.fillStyle = col;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(8, 2 + i * 4);
          ctx.lineTo(13, 5 + i * 4);
          ctx.lineTo(8, 8 + i * 4);
          ctx.lineTo(3, 5 + i * 4);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillStyle = col;
        }
        break;
      }
      case 'meat': {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(8, 8, 5.6, 4.6, 0.4, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = '#d0a080';
        ctx.beginPath();
        ctx.ellipse(6, 7, 2, 1.4, 0.4, 0, 6.283);
        ctx.fill();
        break;
      }
      case 'doll': {
        ctx.fillStyle = '#c8a86b';
        ctx.beginPath();
        ctx.arc(8, 5, 3.2, 0, 6.283);
        ctx.fill();
        ctx.fillRect(6, 8, 4, 6);
        ctx.strokeStyle = '#8a6a4a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(6, 9); ctx.lineTo(2, 12);
        ctx.moveTo(10, 9); ctx.lineTo(14, 12);
        ctx.stroke();
        ctx.fillStyle = '#c02a3a';
        ctx.fillRect(7, 4, 1, 1);
        ctx.fillRect(9, 4, 1, 1);
        break;
      }
      case 'mushroom': {
        ctx.fillStyle = '#e8e0d0';
        ctx.fillRect(6, 8, 4, 7);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(8, 8, 6, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(6, 6, 1.3, 0, 6.283);
        ctx.arc(10, 5, 1, 0, 6.283);
        ctx.fill();
        break;
      }
      case 'vine': {
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(4, 2);
        ctx.quadraticCurveTo(12, 6, 6, 14);
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(4, 5, 3, 1.6, -0.5, 0, 6.283);
        ctx.ellipse(10, 10, 3, 1.6, 0.5, 0, 6.283);
        ctx.fill();
        break;
      }
      case 'cobweb': {
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.9;
        for (let i = 0; i < 4; i++) {
          const a = i / 4 * Math.PI;
          ctx.beginPath();
          ctx.moveTo(8 - Math.cos(a) * 7, 8 - Math.sin(a) * 7);
          ctx.lineTo(8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7);
          ctx.stroke();
        }
        for (let r = 3; r <= 7; r += 2) {
          ctx.beginPath();
          ctx.arc(8, 8, r, 0, 6.283);
          ctx.stroke();
        }
        break;
      }
      case 'star': {
        ctx.fillStyle = col;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * 6.283 - Math.PI / 2;
          const r = i % 2 === 0 ? 7 : 2.6;
          ctx.lineTo(8 + Math.cos(a) * r, 8 + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'bucket': {
        ctx.fillStyle = '#8a8a94';
        ctx.beginPath();
        ctx.moveTo(3, 5);
        ctx.lineTo(13, 5);
        ctx.lineTo(11.5, 14);
        ctx.lineTo(4.5, 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(4.4, 7);
        ctx.lineTo(11.6, 7);
        ctx.lineTo(10.8, 12);
        ctx.lineTo(5.2, 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#b8b8c4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(8, 5, 4.5, Math.PI, 0);
        ctx.stroke();
        break;
      }
      case 'hook': {
        ctx.strokeStyle = '#b8b0a0';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(3, 13);
        ctx.lineTo(9, 7);
        ctx.stroke();
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(10, 6, 4.4, -0.4, 4.4);
        ctx.stroke();
        ctx.fillStyle = '#8a8070';
        ctx.beginPath();
        ctx.arc(3, 13, 2.4, 0, 6.283);
        ctx.fill();
        break;
      }
      case 'wing': {
        const g2 = ctx.createLinearGradient(2, 8, 15, 4);
        g2.addColorStop(0, col);
        g2.addColorStop(1, 'rgba(255,255,255,0.25)');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.moveTo(2, 13);
        ctx.quadraticCurveTo(6, 2, 15, 3);
        ctx.quadraticCurveTo(11, 8, 8, 14);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(3, 12);
        ctx.quadraticCurveTo(8, 6, 14, 4);
        ctx.moveTo(5, 13);
        ctx.quadraticCurveTo(9, 8, 13, 6);
        ctx.stroke();
        break;
      }
      case 'shield': {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(8, 2);
        ctx.lineTo(13, 4);
        ctx.lineTo(13, 9);
        ctx.quadraticCurveTo(13, 14, 8, 15);
        ctx.quadraticCurveTo(3, 14, 3, 9);
        ctx.lineTo(3, 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#e0d8c8';
        ctx.beginPath();
        ctx.arc(8, 8, 2, 0, 6.283);
        ctx.fill();
        break;
      }
      case 'mirror': {
        ctx.fillStyle = '#8a7a5a';
        ctx.beginPath();
        ctx.ellipse(8, 8, 5.4, 6.4, 0, 0, 6.283);
        ctx.fill();
        const mg2 = ctx.createLinearGradient(4, 3, 12, 13);
        mg2.addColorStop(0, '#ffffff');
        mg2.addColorStop(0.5, col);
        mg2.addColorStop(1, '#5a8aa8');
        ctx.fillStyle = mg2;
        ctx.beginPath();
        ctx.ellipse(8, 8, 4, 5, 0, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.ellipse(6.4, 6, 1.4, 2, -0.4, 0, 6.283);
        ctx.fill();
        break;
      }
      case 'trophy': {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(4, 2);
        ctx.lineTo(12, 2);
        ctx.lineTo(12, 8);
        ctx.quadraticCurveTo(8, 12, 4, 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(6, 10, 4, 4);
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(4, 13, 8, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(6, 3, 1.4, 4);
        break;
      }
      case 'worm': {
        ctx.fillStyle = col;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(4 + i * 2.4, 11 - i * 1.6, 3 - i * 0.3, 0, 6.283);
          ctx.fill();
        }
        ctx.fillStyle = '#2a1030';
        ctx.beginPath();
        ctx.arc(15, 4, 0.9, 0, 6.283);
        ctx.fill();
        break;
      }
      case 'helm': {
        armor(ctx, col, 'helmet');
        break;
      }
      case 'material': {
        const c2 = T.rgb(col);
        ctx.fillStyle = 'rgba(' + c2[0] + ',' + c2[1] + ',' + c2[2] + ',0.9)';
        ctx.beginPath();
        ctx.moveTo(8, 2.5);
        ctx.lineTo(13.5, 6);
        ctx.lineTo(13.5, 11.5);
        ctx.lineTo(8, 14.5);
        ctx.lineTo(2.5, 11.5);
        ctx.lineTo(2.5, 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.42)';
        ctx.beginPath();
        ctx.moveTo(8, 2.5);
        ctx.lineTo(13.5, 6);
        ctx.lineTo(8, 8);
        ctx.lineTo(2.5, 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath();
        ctx.moveTo(2.5, 6);
        ctx.lineTo(8, 8);
        ctx.lineTo(8, 14.5);
        ctx.lineTo(2.5, 11.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.28)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        break;
      }      default: {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(4, 12);
        ctx.lineTo(6, 4);
        ctx.lineTo(11, 3);
        ctx.lineTo(13, 9);
        ctx.lineTo(9, 13);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(6, 6, 2, 2);
      }
    }
    if (it && it.rarity > 0 && icon !== 'block' && icon !== 'furniture') {
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  T.drawItemIcon = function (ctx, itemId, x, y, size) {
    drawIcon(ctx, itemId, x, y, size);
  };
})();
