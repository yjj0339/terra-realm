(function () {
  const T = window.T;
  const ITEMS = T.ITEMS;
  const ORDER = T.ITEM_ORDER;
  const RECIPES = T.RECIPES;

  function add(id, o) {
    if (ITEMS[id]) throw new Error('duplicate item ' + id);
    const it = Object.assign({
      id: id, name: id, type: 'material', stack: 999, sell: 0, rarity: 0,
      icon: 'material', color: '#b0b0b0', desc: ''
    }, o);
    it.id = id;
    ITEMS[id] = it;
    ORDER.push(id);
    return it;
  }

  function rec(out, count, ing, station) {
    RECIPES.push({ out: out, count: count, ing: ing, station: station || null });
  }

  function tile(id, o) {
    if (T.TILES[id]) throw new Error('duplicate tile ' + id);
    o.id = id;
    T.TILES[id] = o;
    T.TILE[o.key] = id;
  }

  const TILE_BASE = 72;
  tile(TILE_BASE + 0, {
    key: 'CRAFT_TABLE', name: '工匠长桌', solid: false, hard: 0.2, drop: 'craft_table', col: '#8a6a52', transparent: true,
    pal: ['#6f5a44', '#8a7258', '#54432f'], art: 'workbench', furniture: true, station: 'workbench'
  });
  tile(TILE_BASE + 1, {
    key: 'LAMP_STONE', name: '石灯', solid: false, hard: 0.35, drop: 'stone_lamp', col: '#ffd89a', transparent: true,
    pal: ['#7a8088', '#ffe0a8', '#5a6068'], art: 'torch', furniture: true, light: [255, 200, 130, 7.5]
  });
  tile(TILE_BASE + 2, {
    key: 'CHAIR_CUSHION', name: '软垫椅', solid: false, hard: 0.2, drop: 'cushioned_chair', col: '#9a5a4a', transparent: true,
    pal: ['#8a4a3a', '#b86a52', '#6a3428'], art: 'chair', furniture: true
  });
  tile(TILE_BASE + 3, {
    key: 'TABLE_OAK', name: '橡木长桌', solid: false, hard: 0.2, drop: 'oak_table', col: '#a9743c', transparent: true,
    pal: ['#8a5a2b', '#b78a52', '#633d1b'], art: 'table', furniture: true
  });

  add('charcoal', { name: '木炭', type: 'material', icon: 'material', color: '#3a3634', sell: 2, desc: '烧透的木料，冶炼与锻造的燃料' });
  add('bronze_bar', { name: '青铜锭', type: 'material', icon: 'bar', color: '#b07a4a', sell: 12, desc: '铜与锡的合金，比纯铜坚硬' });
  add('steel_bar', { name: '钢锭', type: 'material', icon: 'bar', color: '#8a94a0', rarity: 1, sell: 30, desc: '反复锻打去杂后的精钢' });
  add('iron_nail', { name: '铁钉', type: 'material', icon: 'material', color: '#b8b0a0', sell: 2, desc: '连接与加固用的短钉' });
  add('obsidian_shard', { name: '黑曜石碎片', type: 'material', icon: 'crystal', color: '#4a3a5e', rarity: 1, sell: 6, desc: '断裂后边缘依旧锋利' });
  add('shadow_essence', { name: '暗影精华', type: 'material', icon: 'scale', color: '#7d5cb0', rarity: 1, sell: 45, glow: '#a878e0', desc: '腐化之地凝聚的黑色精华' });
  add('molten_essence', { name: '熔火精华', type: 'material', icon: 'crystal', color: '#ff7a2a', rarity: 2, sell: 70, glow: '#ffb04a', desc: '仍在跳动的岩浆结晶' });
  add('starlight_essence', { name: '星辉精华', type: 'material', icon: 'star', color: '#ffe680', rarity: 1, sell: 25, glow: '#ffe680', desc: '坠落之星碾碎后的光尘' });
  add('life_essence', { name: '生命精华', type: 'material', icon: 'crystal', color: '#e0608a', rarity: 1, sell: 40, glow: '#ff9ab8', desc: '一滴仍在缓慢搏动的猩红液体' });
  add('mana_essence', { name: '魔力精华', type: 'material', icon: 'crystal', color: '#6a8ae0', rarity: 1, sell: 40, glow: '#9ab8ff', desc: '凝固的魔力，触手微凉' });
  add('bone_meal', { name: '骨粉', type: 'material', icon: 'bone', color: '#ded8c4', sell: 1, desc: '研磨成粉的骨头' });
  add('stone_plate', { name: '石板', type: 'material', icon: 'material', color: '#7a8088', sell: 2, desc: '切平的薄石片' });
  add('wood_beam', { name: '木梁', type: 'material', icon: 'material', color: '#8a5a2b', sell: 2, desc: '刨直的木料' });
  add('gold_wire', { name: '金丝', type: 'material', icon: 'material', color: '#e8c14a', rarity: 1, sell: 25, glow: '#ffe27a', desc: '可反复弯折的细金线' });
  add('honey_comb', { name: '蜂巢块', type: 'material', icon: 'gel', color: '#e8b020', rarity: 1, sell: 15, desc: '凝着蜂蜜的六角巢室' });
  add('onyx', { name: '墨玉', type: 'gem', icon: 'gem', color: '#3a3a4a', stack: 99, sell: 70, desc: '吸光的黑色宝石' });
  add('jade', { name: '玉', type: 'gem', icon: 'gem', color: '#7ad8b0', stack: 99, sell: 45, desc: '温润的青绿宝石' });

  add('iron_arrow', { name: '铁箭', type: 'ammo', icon: 'arrow', color: '#c8c8d0', stack: 999, dmg: 6, ammo: 'arrow', sell: 1, desc: '铁镞木箭' });
  add('silver_arrow', { name: '银箭', type: 'ammo', icon: 'arrow', color: '#e8f0f6', stack: 999, dmg: 8, ammo: 'arrow', rarity: 1, sell: 2, desc: '银亮的重型箭矢' });
  add('unholy_arrow', { name: '邪箭', type: 'ammo', icon: 'arrow', color: '#a878d8', stack: 999, dmg: 10, ammo: 'arrow', rarity: 2, sell: 4, glow: '#a878e0', desc: '带着腐化诅咒的箭矢' });
  add('meteor_shot', { name: '陨石弹', type: 'ammo', icon: 'bullet', color: '#c0a090', stack: 999, dmg: 10, ammo: 'bullet', rarity: 1, sell: 3, desc: '陨铁铸造的弹丸' });
  add('crystal_bullet', { name: '水晶弹', type: 'ammo', icon: 'bullet', color: '#a8f0f0', stack: 999, dmg: 13, ammo: 'bullet', rarity: 2, sell: 6, glow: '#a8f0f0', desc: '碎裂时会迸出晶片' });

  add('bronze_sword', { name: '青铜剑', type: 'weapon', icon: 'sword', color: '#b07a4a', dmg: 13, use: 0.33, knock: 5, melee: true, reach: 1.95, rarity: 1, sell: 30, desc: '合金锻造的宽刃剑' });
  add('steel_sword', { name: '钢剑', type: 'weapon', icon: 'sword', color: '#8a94a0', dmg: 26, use: 0.30, knock: 6.2, melee: true, reach: 2.1, rarity: 2, sell: 130, desc: '锋利的精钢长剑' });
  add('tin_shortsword', { name: '锡短剑', type: 'weapon', icon: 'sword', color: '#c8d0d8', dmg: 9, use: 0.26, knock: 3, melee: true, reach: 1.4, sell: 10, desc: '轻巧的短剑' });
  add('iron_shortsword', { name: '铁短剑', type: 'weapon', icon: 'sword', color: '#c3b29a', dmg: 12, use: 0.25, knock: 3.5, melee: true, reach: 1.45, rarity: 1, sell: 22, desc: '便于连续突刺的短剑' });
  add('tungsten_shortsword', { name: '钨短剑', type: 'weapon', icon: 'sword', color: '#a8b0c8', dmg: 15, use: 0.24, knock: 4, melee: true, reach: 1.5, rarity: 1, sell: 40, desc: '沉重而快速的短剑' });
  add('platinum_shortsword', { name: '铂金短剑', type: 'weapon', icon: 'sword', color: '#e0e8f0', dmg: 18, use: 0.23, knock: 4.2, melee: true, reach: 1.55, rarity: 1, sell: 56, desc: '铂金锻成的锋利短剑' });
  add('bronze_battleaxe', { name: '青铜战斧', type: 'weapon', icon: 'axe', color: '#b07a4a', dmg: 15, use: 0.42, knock: 6.5, melee: true, reach: 2.0, rarity: 1, sell: 36, desc: '双手挥动的战斧' });
  add('steel_battleaxe', { name: '钢战斧', type: 'weapon', icon: 'axe', color: '#8a94a0', dmg: 24, use: 0.40, knock: 7, melee: true, reach: 2.15, rarity: 2, sell: 120, desc: '劈开重甲的钢斧' });
  add('silver_warhammer', { name: '银战锤', type: 'weapon', icon: 'hammer', color: '#d9e2e8', dmg: 21, use: 0.46, knock: 8, melee: true, reach: 2.1, rarity: 1, sell: 72, desc: '钝击类的银质战锤' });
  add('gold_warhammer', { name: '金战锤', type: 'weapon', icon: 'hammer', color: '#e8c14a', dmg: 27, use: 0.44, knock: 8.5, melee: true, reach: 2.2, rarity: 2, sell: 135, desc: '沉重华贵的战锤' });
  add('bone_sword', { name: '骨剑', type: 'weapon', icon: 'sword', color: '#ded8c4', dmg: 18, use: 0.31, knock: 5, melee: true, reach: 2.05, rarity: 1, sell: 60, desc: '用巨兽肋骨削成的剑' });
  add('frozen_blade', { name: '寒冰刃', type: 'weapon', icon: 'sword', color: '#9ad8ff', dmg: 24, use: 0.29, knock: 6, melee: true, reach: 2.1, rarity: 2, sell: 115, glow: '#9ad8ff', desc: '剑身永远凝着一层霜' });
  add('thorn_blade', { name: '荆棘剑', type: 'weapon', icon: 'sword', color: '#5ac04a', dmg: 22, use: 0.30, knock: 5.5, melee: true, reach: 2.1, rarity: 2, sell: 95, glow: '#5ac04a', desc: '刃上生满丛林尖刺' });
  add('obsidian_sword', { name: '黑曜石剑', type: 'weapon', icon: 'sword', color: '#5a4a6a', dmg: 25, use: 0.32, knock: 7, melee: true, reach: 2.15, rarity: 2, sell: 105, desc: '边缘薄得透明的黑曜石剑' });
  add('wood_spear', { name: '木矛', type: 'weapon', icon: 'sword', color: '#a9743c', dmg: 8, use: 0.38, knock: 4, melee: true, reach: 2.3, sell: 4, desc: '削尖的长杆，攻击距离更远' });
  add('iron_spear', { name: '铁矛', type: 'weapon', icon: 'sword', color: '#c3b29a', dmg: 14, use: 0.36, knock: 4.5, melee: true, reach: 2.35, rarity: 1, sell: 26, desc: '配有铁镞的长矛' });
  add('silver_spear', { name: '银矛', type: 'weapon', icon: 'sword', color: '#d9e2e8', dmg: 18, use: 0.35, knock: 5, melee: true, reach: 2.4, rarity: 1, sell: 44, desc: '银亮的狩猎长矛' });

  add('steel_bow', { name: '钢弓', type: 'weapon', icon: 'bow', color: '#8a94a0', dmg: 20, use: 0.35, ranged: true, ammo: 'arrow', shoot: 'arrow', speed: 17, knock: 4, rarity: 1, sell: 75, desc: '需要箭矢' });
  add('crimtane_bow', { name: '血金弓', type: 'weapon', icon: 'bow', color: '#c84060', dmg: 26, use: 0.32, ranged: true, ammo: 'arrow', shoot: 'arrow', speed: 18, knock: 4.5, rarity: 2, sell: 200, glow: '#c84060', desc: '需要箭矢' });
  add('bone_bow', { name: '骨弓', type: 'weapon', icon: 'bow', color: '#ded8c4', dmg: 18, use: 0.34, ranged: true, ammo: 'arrow', shoot: 'arrow', speed: 17, knock: 4, rarity: 1, sell: 55, desc: '需要箭矢' });
  add('blunderbuss', { name: '雷铳', type: 'weapon', icon: 'gun', color: '#a06a4a', dmg: 19, use: 0.60, ranged: true, ammo: 'bullet', shoot: 'shotgun', speed: 21, knock: 5, rarity: 2, sell: 320, desc: '一次射出三发，近距离威力惊人' });
  add('hand_cannon', { name: '手炮', type: 'weapon', icon: 'gun', color: '#8a5a4a', dmg: 26, use: 0.58, ranged: true, ammo: 'bullet', shoot: 'bullet', speed: 25, knock: 6.5, rarity: 2, sell: 420, desc: '单发重弹的手持炮' });

  add('amber_staff', { name: '琥珀法杖', type: 'weapon', icon: 'staff', color: '#e8a040', dmg: 15, use: 0.40, magic: true, mana: 5, shoot: 'spark', speed: 12, knock: 3, rarity: 1, sell: 260, glow: '#e8a040', desc: '射出琥珀色的魔法弹' });
  add('sapphire_staff', { name: '蓝宝石法杖', type: 'weapon', icon: 'staff', color: '#5080e8', dmg: 23, use: 0.40, magic: true, mana: 9, shoot: 'spark', speed: 13, knock: 3.5, rarity: 2, sell: 420, glow: '#5080e8', desc: '射出湛蓝的魔法弹' });
  add('frost_staff', { name: '寒霜法杖', type: 'weapon', icon: 'staff', color: '#9ad8ff', dmg: 19, use: 0.40, magic: true, mana: 8, shoot: 'waterbolt', speed: 13, knock: 4, rarity: 1, sell: 160, glow: '#9ad8ff', desc: '冰弹会在墙上反弹' });
  add('shadow_staff', { name: '暗影法杖', type: 'weapon', icon: 'staff', color: '#a878d8', dmg: 26, use: 0.42, magic: true, mana: 10, shoot: 'vile', speed: 14, knock: 4.5, rarity: 2, sell: 260, glow: '#a878e0', desc: '喷出腐化之地的暗影弹' });
  add('meteor_staff', { name: '陨石法杖', type: 'weapon', icon: 'staff', color: '#c0a090', dmg: 24, use: 0.40, magic: true, mana: 9, shoot: 'spark', speed: 15, knock: 3.5, rarity: 2, sell: 240, glow: '#ff9a5a', desc: '滚烫的陨铁魔法弹' });
  add('crystal_staff', { name: '水晶法杖', type: 'weapon', icon: 'staff', color: '#a8f0f0', dmg: 29, use: 0.38, magic: true, mana: 12, shoot: 'laser', speed: 20, knock: 3.5, rarity: 2, sell: 380, glow: '#a8f0f0', desc: '射出穿透性的晶光' });
  add('blood_staff', { name: '血之法杖', type: 'weapon', icon: 'staff', color: '#ff5a6a', dmg: 36, use: 0.46, magic: true, mana: 13, shoot: 'flame', speed: 12, knock: 5, rarity: 3, sell: 380, glow: '#ff5a6a', desc: '喷出灼热的血焰' });

  add('imp_staff', { name: '火魔杖', type: 'weapon', icon: 'staff', color: '#e0602a', dmg: 16, use: 0.70, summon: true, mana: 10, rarity: 1, sell: 150, glow: '#ff8a3a', desc: '召唤一只火魔为你战斗' });
  add('bat_staff', { name: '蝙蝠法杖', type: 'weapon', icon: 'staff', color: '#5a4a52', dmg: 20, use: 0.70, summon: true, mana: 12, rarity: 2, sell: 260, desc: '召唤一只蝙蝠为你战斗' });

  add('bronze_pickaxe', { name: '青铜镐', type: 'tool', icon: 'pick', color: '#b07a4a', tool: 'pick', power: 42, dmg: 5, use: 0.24, melee: true, reach: 1.52, sell: 14, desc: '挖掘泥土与石头' });
  add('tin_pickaxe', { name: '锡镐', type: 'tool', icon: 'pick', color: '#c8d0d8', tool: 'pick', power: 40, dmg: 5, use: 0.24, melee: true, reach: 1.52, rarity: 1, sell: 12, desc: '挖掘泥土与石头' });
  add('lead_pickaxe', { name: '铅镐', type: 'tool', icon: 'pick', color: '#9aa8b8', tool: 'pick', power: 50, dmg: 6, use: 0.22, melee: true, reach: 1.58, rarity: 1, sell: 26, desc: '比铜镐更快' });
  add('tungsten_pickaxe', { name: '钨镐', type: 'tool', icon: 'pick', color: '#a8b0c8', tool: 'pick', power: 60, dmg: 7, use: 0.21, melee: true, reach: 1.62, rarity: 1, sell: 52, desc: '挖掘坚硬岩层' });
  add('platinum_pickaxe', { name: '铂金镐', type: 'tool', icon: 'pick', color: '#e0e8f0', tool: 'pick', power: 70, dmg: 9, use: 0.20, melee: true, reach: 1.66, rarity: 1, sell: 95, desc: '锋利而耐久' });
  add('steel_pickaxe', { name: '钢镐', type: 'tool', icon: 'pick', color: '#8a94a0', tool: 'pick', power: 58, dmg: 7, use: 0.21, melee: true, reach: 1.60, rarity: 1, sell: 45, desc: '精钢打造的镐' });
  add('tin_axe', { name: '锡斧', type: 'tool', icon: 'axe', color: '#c8d0d8', tool: 'axe', power: 45, dmg: 8, use: 0.30, melee: true, reach: 1.62, rarity: 1, sell: 12, desc: '砍伐树木' });
  add('steel_axe', { name: '钢斧', type: 'tool', icon: 'axe', color: '#8a94a0', tool: 'axe', power: 62, dmg: 10, use: 0.27, melee: true, reach: 1.70, rarity: 1, sell: 45, desc: '砍伐树木' });
  add('steel_hammer', { name: '钢锤', type: 'tool', icon: 'hammer', color: '#8a94a0', tool: 'hammer', power: 62, dmg: 11, use: 0.32, melee: true, reach: 1.78, rarity: 1, sell: 45, desc: '拆除墙壁与家具' });
  add('platinum_hammer', { name: '铂金锤', type: 'tool', icon: 'hammer', color: '#e0e8f0', tool: 'hammer', power: 75, dmg: 13, use: 0.30, melee: true, reach: 1.80, rarity: 1, sell: 95, desc: '拆除墙壁与家具' });

  add('bone_helmet', { name: '骨头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#ded8c4', defense: 4, rarity: 1, sell: 48 });
  add('bone_chest', { name: '骨胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#ded8c4', defense: 5, rarity: 1, sell: 60 });
  add('bone_greaves', { name: '骨护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#ded8c4', defense: 4, rarity: 1, sell: 48 });
  add('obsidian_helmet', { name: '黑曜石头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#5a4a6a', defense: 5, rarity: 1, sell: 60 });
  add('obsidian_chest', { name: '黑曜石胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#5a4a6a', defense: 6, rarity: 1, sell: 72 });
  add('obsidian_greaves', { name: '黑曜石护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#5a4a6a', defense: 5, rarity: 1, sell: 60 });
  add('bee_helmet', { name: '蜂头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#e8b020', defense: 4, rarity: 1, sell: 48 });
  add('bee_chest', { name: '蜂胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#e8b020', defense: 5, rarity: 1, sell: 60 });
  add('bee_greaves', { name: '蜂护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#e8b020', defense: 4, rarity: 1, sell: 48 });
  add('meteor_helmet', { name: '陨石头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#c0a090', defense: 7, rarity: 2, sell: 84 });
  add('meteor_chest', { name: '陨石胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#c0a090', defense: 9, rarity: 2, sell: 108 });
  add('meteor_greaves', { name: '陨石护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#c0a090', defense: 7, rarity: 2, sell: 84 });
  add('frost_helmet', { name: '霜冻头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#9ad8ff', defense: 4, rarity: 1, sell: 48 });
  add('frost_chest', { name: '霜冻胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#9ad8ff', defense: 5, rarity: 1, sell: 60 });
  add('frost_greaves', { name: '霜冻护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#9ad8ff', defense: 4, rarity: 1, sell: 48 });

  add('cloud_balloon', { name: '云朵气球', type: 'accessory', icon: 'bottle', color: '#d8eef8', rarity: 1, sell: 140, fx: 'doubleJump', desc: '允许二段跳' });
  add('lightning_boots', { name: '闪电靴', type: 'accessory', icon: 'boots', color: '#ffe680', rarity: 2, sell: 240, fx: 'speed', desc: '大幅提升移动速度' });
  add('lead_anklet', { name: '铅脚环', type: 'accessory', icon: 'boots', color: '#9aa8b8', rarity: 1, sell: 85, fx: 'speed', desc: '略微提升移动速度' });
  add('silver_horseshoe', { name: '银马蹄铁', type: 'accessory', icon: 'horseshoe', color: '#d9e2e8', rarity: 1, sell: 110, fx: 'nofall', desc: '免疫坠落伤害' });
  add('feather_fall', { name: '轻盈之羽', type: 'accessory', icon: 'wing', color: '#e8f0ff', rarity: 2, sell: 230, fx: 'nofall', desc: '免疫坠落伤害' });
  add('emerald_band', { name: '翡翠手环', type: 'accessory', icon: 'ring', color: '#5ae0a0', rarity: 1, sell: 150, fx: 'regen', desc: '缓慢恢复生命' });
  add('ritual_band', { name: '仪式手环', type: 'accessory', icon: 'ring', color: '#e08a9a', rarity: 2, sell: 300, fx: 'regen', desc: '较快恢复生命' });
  add('mana_band', { name: '魔力手环', type: 'accessory', icon: 'ring', color: '#6a8ae0', rarity: 1, sell: 130, fx: 'mana', desc: '魔力回复更快' });
  add('star_pendant', { name: '星辰吊坠', type: 'accessory', icon: 'ring', color: '#ffe680', rarity: 2, sell: 300, fx: 'mana', desc: '魔力上限与回复提升' });
  add('ruby_charm', { name: '红玉护符', type: 'accessory', icon: 'emblem', color: '#e05050', rarity: 2, sell: 280, fx: 'damage', desc: '所有伤害 +15%' });
  add('warrior_band', { name: '战意腕带', type: 'accessory', icon: 'emblem', color: '#e0a050', rarity: 1, sell: 160, fx: 'damage', desc: '所有伤害 +15%' });
  add('spiked_boots', { name: '尖刺靴', type: 'accessory', icon: 'boots', color: '#b8a888', rarity: 1, sell: 150, fx: 'jump', desc: '跳跃高度提升' });
  add('frost_boots', { name: '霜履', type: 'accessory', icon: 'boots', color: '#9ad8ff', rarity: 2, sell: 260, fx: 'jump', desc: '跳跃高度大幅提升' });
  add('obsidian_skull', { name: '黑曜石骷髅', type: 'accessory', icon: 'ring', color: '#4a3a5e', rarity: 2, sell: 520, fx: 'lava', desc: '免疫岩浆伤害' });
  add('bone_gauntlet', { name: '骨护手', type: 'accessory', icon: 'ring', color: '#ded8c4', rarity: 1, sell: 180, fx: 'defense', desc: '护甲 +3' });

  add('greater_ironskin_potion', { name: '强效铁皮药水', type: 'consumable', icon: 'potion', color: '#c0a888', rarity: 1, stack: 30, use: 0.5, duration: 240, buff: 'ironskin', desc: '护甲 +8，持续 4 分钟' });
  add('greater_swiftness_potion', { name: '强效迅捷药水', type: 'consumable', icon: 'potion', color: '#8ae0a0', rarity: 1, stack: 30, use: 0.5, duration: 240, buff: 'swiftness', desc: '移动速度 +25%，持续 4 分钟' });
  add('greater_regeneration_potion', { name: '强效再生药水', type: 'consumable', icon: 'potion', color: '#d06a8a', rarity: 1, stack: 30, use: 0.5, duration: 240, buff: 'regeneration', desc: '持续恢复生命，持续 4 分钟' });
  add('greater_mining_potion', { name: '强效挖矿药水', type: 'consumable', icon: 'potion', color: '#c8b070', rarity: 1, stack: 30, use: 0.5, duration: 270, buff: 'mining', desc: '挖掘速度 +25%，持续 4.5 分钟' });
  add('greater_obsidian_potion', { name: '强效黑曜石药水', type: 'consumable', icon: 'potion', color: '#6a5a7a', rarity: 2, stack: 30, use: 0.5, duration: 300, buff: 'obsidian', desc: '免疫岩浆，持续 5 分钟' });
  add('greater_honey_potion', { name: '强效蜂蜜药水', type: 'consumable', icon: 'potion', color: '#e8b020', rarity: 2, stack: 30, use: 0.5, duration: 270, buff: 'honey', desc: '持续恢复生命，持续 4.5 分钟' });
  add('superior_healing_potion', { name: '上等治疗药水', type: 'consumable', icon: 'potion', color: '#ff2a5a', rarity: 2, stack: 99, use: 0.5, heal: 130, cooldown: 14, sell: 90, desc: '恢复 130 生命' });
  add('superior_mana_potion', { name: '上等魔力药水', type: 'consumable', icon: 'potion', color: '#3a6ae0', rarity: 2, stack: 99, use: 0.5, mana: 130, cooldown: 6, sell: 80, desc: '恢复 130 魔力' });
  add('greater_life_crystal', { name: '大型生命水晶', type: 'consumable', icon: 'crystal', color: '#ff6a9a', rarity: 2, stack: 99, use: 0.6, permanent: 'life', amount: 30, sell: 180, desc: '永久增加 30 点生命上限' });
  add('greater_mana_crystal', { name: '大型魔力水晶', type: 'consumable', icon: 'crystal', color: '#7a9aff', rarity: 2, stack: 99, use: 0.6, permanent: 'mana', amount: 30, sell: 180, desc: '永久增加 30 点魔力上限' });
  add('starlight_potion', { name: '星辉药水', type: 'consumable', icon: 'potion', color: '#ffe680', rarity: 1, stack: 30, use: 0.5, duration: 180, buff: 'mana', desc: '魔力回复大幅加快，持续 3 分钟' });
  add('vitality_potion', { name: '活力药水', type: 'consumable', icon: 'potion', color: '#ff8a9a', rarity: 2, stack: 30, use: 0.5, duration: 150, buff: 'regen', desc: '持续缓慢恢复生命，持续 2.5 分钟' });

  add('tin_hammer', { name: '锡锤', type: 'tool', icon: 'hammer', color: '#c8d0d8', tool: 'hammer', power: 45, dmg: 9, use: 0.34, melee: true, reach: 1.72, rarity: 1, sell: 12, desc: '拆除墙壁与家具' });
  add('lead_hammer', { name: '铅锤', type: 'tool', icon: 'hammer', color: '#9aa8b8', tool: 'hammer', power: 52, dmg: 10, use: 0.33, melee: true, reach: 1.76, rarity: 1, sell: 26, desc: '拆除墙壁与家具' });
  add('lead_axe', { name: '铅斧', type: 'tool', icon: 'axe', color: '#9aa8b8', tool: 'axe', power: 52, dmg: 9, use: 0.29, melee: true, reach: 1.66, rarity: 1, sell: 26, desc: '砍伐树木' });
  add('tungsten_axe', { name: '钨斧', type: 'tool', icon: 'axe', color: '#a8b0c8', tool: 'axe', power: 60, dmg: 10, use: 0.28, melee: true, reach: 1.68, rarity: 1, sell: 52, desc: '砍伐树木' });

  add('ancient_wood', { name: '古木', type: 'material', icon: 'material', color: '#6d431c', rarity: 1, sell: 8, desc: '地牢深处不腐的硬木' });
  add('petrified_bone', { name: '石化骨', type: 'material', icon: 'bone', color: '#b8b0a0', rarity: 1, sell: 12, desc: '在地层中埋了太久，早已石化' });
  add('crystal_shard', { name: '水晶碎片', type: 'material', icon: 'crystal', color: '#a8f0f0', rarity: 1, sell: 18, glow: '#a8f0f0', desc: '崩落的水晶，棱面依旧锋利' });
  add('ancient_fossil', { name: '远古化石', type: 'material', icon: 'bone', color: '#9a8a70', rarity: 2, sell: 60, desc: '已经无从辨认的生物遗骸' });

  add('craft_table', { name: '工匠长桌', type: 'furniture', place: T.TILE.CRAFT_TABLE, icon: 'table', color: '#8a6a52', stack: 99, desc: '可作为工作台使用的长条工作桌' });
  add('stone_lamp', { name: '石灯', type: 'furniture', place: T.TILE.LAMP_STONE, icon: 'torch', color: '#ffd89a', stack: 999, desc: '照亮周围' });
  add('cushioned_chair', { name: '软垫椅', type: 'furniture', place: T.TILE.CHAIR_CUSHION, icon: 'chair', color: '#9a5a4a', stack: 99, desc: '可放置的坐具' });
  add('oak_table', { name: '橡木长桌', type: 'furniture', place: T.TILE.TABLE_OAK, icon: 'table', color: '#a9743c', stack: 99, desc: '可放置的家具' });

  rec('charcoal', 1, { wood: 3 }, 'furnace');
  rec('bronze_bar', 2, { copper_ore: 2, tin_ore: 2 }, 'furnace');
  rec('steel_bar', 1, { iron_bar: 2, charcoal: 2 }, 'furnace');
  rec('iron_nail', 6, { iron_bar: 1 }, 'anvil');
  rec('obsidian_shard', 2, { obsidian_brick: 1 }, 'workbench');
  rec('shadow_essence', 2, { shadow_scale: 2, demonite_bar: 1 }, 'anvil');
  rec('molten_essence', 2, { hellstone_bar: 1, gel: 2 }, 'hellforge');
  rec('starlight_essence', 2, { star: 3, silver_bar: 1 }, 'alchemy');
  rec('life_essence', 2, { life_crystal: 1, mushroom: 3 }, 'alchemy');
  rec('mana_essence', 2, { mana_crystal: 1, glowing_mushroom: 2 }, 'alchemy');
  rec('bone_meal', 3, { bone: 1 }, 'workbench');
  rec('stone_plate', 2, { stone: 3 }, 'workbench');
  rec('wood_beam', 2, { wood: 3 }, 'workbench');
  rec('gold_wire', 4, { gold_bar: 1 }, 'anvil');
  rec('honey_comb', 2, { bee_wax: 3 }, 'workbench');
  rec('onyx', 1, { amethyst: 2, topaz: 2 }, 'alchemy');
  rec('jade', 1, { emerald: 2, amber: 2 }, 'alchemy');

  rec('iron_arrow', 10, { arrow: 10, iron_nail: 2 }, 'workbench');
  rec('silver_arrow', 10, { arrow: 10, silver_bar: 1 }, 'workbench');
  rec('unholy_arrow', 15, { arrow: 15, shadow_essence: 1 }, 'anvil');
  rec('meteor_shot', 10, { bullet: 10, meteorite_bar: 1 }, 'anvil');
  rec('crystal_bullet', 10, { bullet: 10, silver_bar: 1, glass: 2 }, 'anvil');

  rec('bronze_sword', 1, { bronze_bar: 8 }, 'anvil');
  rec('steel_sword', 1, { steel_bar: 10 }, 'anvil');
  rec('tin_shortsword', 1, { tin_bar: 5 }, 'anvil');
  rec('iron_shortsword', 1, { iron_bar: 5 }, 'anvil');
  rec('tungsten_shortsword', 1, { tungsten_bar: 6 }, 'anvil');
  rec('platinum_shortsword', 1, { platinum_bar: 6 }, 'anvil');
  rec('bronze_battleaxe', 1, { bronze_bar: 9, wood: 3 }, 'anvil');
  rec('steel_battleaxe', 1, { steel_bar: 11, wood: 3 }, 'anvil');
  rec('silver_warhammer', 1, { silver_bar: 10, wood: 3 }, 'anvil');
  rec('gold_warhammer', 1, { gold_bar: 10, wood: 3 }, 'anvil');
  rec('bone_sword', 1, { bone: 12, iron_nail: 3 }, 'anvil');
  rec('frozen_blade', 1, { ice: 8, steel_bar: 6, sapphire: 1 }, 'anvil');
  rec('thorn_blade', 1, { jungle_spore: 10, vine: 8, iron_nail: 4 }, 'anvil');
  rec('obsidian_sword', 1, { obsidian_shard: 6, steel_bar: 6 }, 'anvil');
  rec('wood_spear', 1, { wood: 8, iron_nail: 2 }, 'workbench');
  rec('iron_spear', 1, { iron_bar: 6, wood: 4, iron_nail: 2 }, 'anvil');
  rec('silver_spear', 1, { silver_bar: 7, wood: 4, iron_nail: 2 }, 'anvil');

  rec('steel_bow', 1, { steel_bar: 8, wood: 5 }, 'anvil');
  rec('crimtane_bow', 1, { crimtane_bar: 10, silk: 2 }, 'anvil');
  rec('bone_bow', 1, { bone: 10, silk: 4 }, 'anvil');
  rec('blunderbuss', 1, { steel_bar: 10, wood: 8, iron_nail: 4 }, 'anvil');
  rec('hand_cannon', 1, { hellstone_bar: 8, steel_bar: 6, gold_wire: 2 }, 'anvil');

  rec('amber_staff', 1, { amber: 4, wood: 8 }, 'anvil');
  rec('sapphire_staff', 1, { sapphire: 4, wood: 10 }, 'anvil');
  rec('frost_staff', 1, { ice: 10, sapphire: 2, wood: 6 }, 'anvil');
  rec('shadow_staff', 1, { demonite_bar: 8, shadow_essence: 3, wood: 8 }, 'anvil');
  rec('meteor_staff', 1, { meteorite_bar: 8, wood: 8 }, 'anvil');
  rec('crystal_staff', 1, { diamond: 4, glass: 6, wood: 10 }, 'anvil');
  rec('blood_staff', 1, { crimtane_bar: 10, shadow_essence: 2, ruby: 2 }, 'anvil');

  rec('imp_staff', 1, { hellstone_bar: 5, gel: 10, shadow_essence: 2 }, 'anvil');
  rec('bat_staff', 1, { shadow_essence: 4, silk: 6, gel: 15 }, 'anvil');

  rec('bronze_pickaxe', 1, { bronze_bar: 8, wood: 3 }, 'anvil');
  rec('tin_pickaxe', 1, { tin_bar: 8, wood: 3 }, 'anvil');
  rec('lead_pickaxe', 1, { lead_bar: 9, wood: 3 }, 'anvil');
  rec('tungsten_pickaxe', 1, { tungsten_bar: 10, wood: 3 }, 'anvil');
  rec('platinum_pickaxe', 1, { platinum_bar: 10, wood: 3 }, 'anvil');
  rec('steel_pickaxe', 1, { steel_bar: 10, wood: 3 }, 'anvil');
  rec('tin_axe', 1, { tin_bar: 7, wood: 3 }, 'anvil');
  rec('steel_axe', 1, { steel_bar: 9, wood: 3 }, 'anvil');
  rec('steel_hammer', 1, { steel_bar: 10, wood: 3 }, 'anvil');
  rec('platinum_hammer', 1, { platinum_bar: 10, wood: 3 }, 'anvil');

  rec('bone_helmet', 1, { bone: 15, iron_nail: 4 }, 'anvil');
  rec('bone_chest', 1, { bone: 22, iron_nail: 6 }, 'anvil');
  rec('bone_greaves', 1, { bone: 18, iron_nail: 5 }, 'anvil');
  rec('obsidian_helmet', 1, { obsidian_shard: 8, silk: 4 }, 'anvil');
  rec('obsidian_chest', 1, { obsidian_shard: 12, silk: 6 }, 'anvil');
  rec('obsidian_greaves', 1, { obsidian_shard: 10, silk: 5 }, 'anvil');
  rec('bee_helmet', 1, { honey_comb: 5, silk: 4 }, 'anvil');
  rec('bee_chest', 1, { honey_comb: 8, silk: 6 }, 'anvil');
  rec('bee_greaves', 1, { honey_comb: 6, silk: 5 }, 'anvil');
  rec('meteor_helmet', 1, { meteorite_bar: 12, silk: 4 }, 'anvil');
  rec('meteor_chest', 1, { meteorite_bar: 16, silk: 6 }, 'anvil');
  rec('meteor_greaves', 1, { meteorite_bar: 14, silk: 5 }, 'anvil');
  rec('frost_helmet', 1, { ice: 12, silk: 4 }, 'anvil');
  rec('frost_chest', 1, { ice: 18, silk: 6 }, 'anvil');
  rec('frost_greaves', 1, { ice: 15, silk: 5 }, 'anvil');

  rec('cloud_balloon', 1, { cloud: 12, cloud_in_a_bottle: 1, gel: 8 }, 'anvil');
  rec('lightning_boots', 1, { hermes_boots: 1, gold_wire: 4, topaz: 2, gel: 6 }, 'anvil');
  rec('lead_anklet', 1, { lead_bar: 4, silk: 3 }, 'anvil');
  rec('silver_horseshoe', 1, { silver_bar: 5, silk: 3 }, 'anvil');
  rec('feather_fall', 1, { feather: 10, cloud: 8, silk: 4 }, 'anvil');
  rec('emerald_band', 1, { emerald: 3, silk: 5, band_of_regeneration: 1 }, 'anvil');
  rec('ritual_band', 1, { life_essence: 2, silk: 6, ruby: 1 }, 'anvil');
  rec('mana_band', 1, { mana_essence: 2, silk: 5, amethyst: 2 }, 'anvil');
  rec('star_pendant', 1, { star: 8, starlight_essence: 2, gold_wire: 2 }, 'anvil');
  rec('ruby_charm', 1, { ruby: 3, warrior_emblem: 1, gold_wire: 2 }, 'anvil');
  rec('warrior_band', 1, { gold_wire: 3, silk: 4, bone_meal: 6 }, 'anvil');
  rec('spiked_boots', 1, { iron_nail: 8, gel: 10, silk: 3 }, 'anvil');
  rec('frost_boots', 1, { ice: 10, sapphire: 2, silk: 4 }, 'anvil');
  rec('obsidian_skull', 1, { obsidian_shard: 8, bone: 10, silk: 4 }, 'anvil');
  rec('bone_gauntlet', 1, { bone: 12, iron_nail: 5, silk: 3 }, 'anvil');

  rec('greater_ironskin_potion', 1, { ironskin_potion: 1, iron_bar: 2, life_essence: 1 }, 'alchemy');
  rec('greater_swiftness_potion', 1, { swiftness_potion: 1, feather: 3, mana_essence: 1 }, 'alchemy');
  rec('greater_regeneration_potion', 1, { regeneration_potion: 1, life_essence: 2, mushroom: 2 }, 'alchemy');
  rec('greater_mining_potion', 1, { mining_potion: 1, steel_bar: 1, stone_plate: 2 }, 'alchemy');
  rec('greater_obsidian_potion', 1, { obsidian_skin_potion: 1, obsidian_shard: 3, ash: 2 }, 'alchemy');
  rec('greater_honey_potion', 1, { honey_potion: 1, honey_comb: 2, bottle: 1 }, 'alchemy');
  rec('superior_healing_potion', 1, { greater_healing_potion: 1, life_essence: 2, bottle: 1 }, 'alchemy');
  rec('superior_mana_potion', 1, { greater_mana_potion: 1, mana_essence: 2, bottle: 1 }, 'alchemy');
  rec('greater_life_crystal', 1, { life_crystal: 2, life_essence: 3, diamond: 1 }, 'alchemy');
  rec('greater_mana_crystal', 1, { mana_crystal: 2, mana_essence: 3, sapphire: 1 }, 'alchemy');
  rec('starlight_potion', 1, { bottled_water: 1, starlight_essence: 2, star: 2 }, 'alchemy');
  rec('vitality_potion', 1, { bottled_water: 1, life_essence: 1, honey_comb: 1 }, 'alchemy');

  rec('tin_hammer', 1, { tin_bar: 8, wood: 3 }, 'anvil');
  rec('lead_hammer', 1, { lead_bar: 9, wood: 3 }, 'anvil');
  rec('lead_axe', 1, { lead_bar: 8, wood: 3 }, 'anvil');
  rec('tungsten_axe', 1, { tungsten_bar: 9, wood: 3 }, 'anvil');
  rec('ancient_wood', 3, { wood: 3, bone: 1 }, 'workbench');
  rec('petrified_bone', 2, { bone: 4, stone: 2 }, 'workbench');
  rec('crystal_shard', 2, { diamond: 1, glass: 2 }, 'alchemy');
  rec('ancient_fossil', 1, { petrified_bone: 3, bone_meal: 4 }, 'alchemy');
  rec('craft_table', 1, { wood: 12, iron_nail: 4 }, 'workbench');
  rec('stone_lamp', 1, { stone_plate: 3, torch: 1 }, 'workbench');
  rec('cushioned_chair', 1, { wood: 6, silk: 2 }, 'workbench');
  rec('oak_table', 1, { wood: 10, wood_beam: 2 }, 'workbench');
})();
