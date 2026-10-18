(function () {
  const T = window.T;
  const ITEMS = T.ITEMS = {};
  const ORDER = T.ITEM_ORDER = [];

  function def(id, o) {
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

  function block(id, name, color, place, o) {
    return def(id, Object.assign({
      name: name, type: 'block', place: place, icon: 'block', color: color, stack: 999, desc: '可放置的方块'
    }, o || {}));
  }

  function furniture(id, name, place, icon, color, o) {
    return def(id, Object.assign({
      name: name, type: 'furniture', place: place, icon: icon || 'furniture', color: color || '#b08045',
      stack: 99, desc: '可放置的家具'
    }, o || {}));
  }

  block('dirt', '泥土块', '#8a5a35', T.TILE.DIRT);
  block('stone', '石块', '#71777d', T.TILE.STONE, { sell: 1 });
  block('sand', '沙块', '#dfc684', T.TILE.SAND);
  block('sandstone', '砂岩块', '#c6a86b', T.TILE.SANDSTONE);
  block('clay', '黏土块', '#a0644b', T.TILE.CLAY);
  block('snow', '雪块', '#e8f1f6', T.TILE.SNOW);
  block('ice', '冰块', '#a7cfe0', T.TILE.ICE);
  block('mud', '淤泥块', '#6b4f35', T.TILE.MUD);
  block('ash', '灰烬块', '#4b4140', T.TILE.ASH);
  block('ebonstone', '黑檀石块', '#4a3c5e', T.TILE.EBONSTONE);
  block('wood', '木材', '#8a5a2b', T.TILE.WOOD, { type: 'block', sell: 1 });
  block('cactus', '仙人掌', '#4f8a44', T.TILE.CACTUS);
  block('glass', '玻璃', '#a9d4e0', T.TILE.GLASS, { desc: '透明建材' });
  block('stone_brick', '石砖', '#6f747b', T.TILE.BRICK_STONE);
  block('wood_brick', '木砖', '#94683a', T.TILE.BRICK_WOOD);
  block('obsidian_brick', '黑曜石砖', '#2e2438', T.TILE.BRICK_OBSIDIAN);
  block('ebonstone_brick', '黑檀砖', '#443356', T.TILE.BRICK_EBON);
  block('cloud', '云块', '#e8f0fa', T.TILE.CLOUD);
  block('spikes', '尖刺', '#9a9aa6', T.TILE.SPIKES, { stack: 99, desc: '踩上去会很痛' });

  def('platform', {
    name: '木平台', type: 'furniture', place: T.TILE.PLATFORM, icon: 'platform', color: '#a9743c', stack: 999,
    desc: '可从下方跳穿，按住下+跳跃落下'
  });
  def('rope', {
    name: '绳子', type: 'furniture', place: T.TILE.ROPE, icon: 'rope', color: '#c8a86b', stack: 999, desc: '按住上/下攀爬'
  });
  def('chest', {
    name: '宝箱', type: 'furniture', place: T.TILE.CHEST, icon: 'chest', color: '#b07b3a', stack: 99,
    desc: '储存物品，可多箱堆叠'
  });
  def('torch', {
    name: '火把', type: 'furniture', place: T.TILE.TORCH, icon: 'torch', color: '#ffb347', stack: 999,
    desc: '照亮周围', station: null
  });
  def('workbench', {
    name: '工作台', type: 'furniture', place: T.TILE.WORKBENCH, icon: 'workbench', color: '#b08045', stack: 99,
    desc: '基础制作站', station: 'workbench'
  });
  def('furnace', {
    name: '熔炉', type: 'furniture', place: T.TILE.FURNACE, icon: 'furnace', color: '#8a6a52', stack: 99,
    desc: '冶炼矿石', station: 'furnace'
  });
  def('anvil', {
    name: '铁砧', type: 'furniture', place: T.TILE.ANVIL, icon: 'anvil', color: '#7d7d88', stack: 99,
    desc: '打造武器与护甲', station: 'anvil'
  });
  def('hellforge', {
    name: '地狱熔炉', type: 'furniture', place: T.TILE.HELLFORGE, icon: 'hellforge', color: '#8a3a26', stack: 99,
    desc: '冶炼狱石', station: 'hellforge'
  });
  def('alchemy_table', {
    name: '炼药桌', type: 'furniture', place: T.TILE.ALCHEMY_TABLE, icon: 'alchemy', color: '#8a6a9a', stack: 99,
    desc: '调配药水', station: 'alchemy'
  });
  def('door', {
    name: '木门', type: 'furniture', place: T.TILE.DOOR, icon: 'door', color: '#8a5a2b', stack: 99,
    desc: '右键开关'
  });
  def('table', {
    name: '木桌', type: 'furniture', place: T.TILE.TABLE, icon: 'table', color: '#9a6a33', stack: 99,
    desc: '家具，也是制作站'
  });
  def('chair', {
    name: '木椅', type: 'furniture', place: T.TILE.CHAIR, icon: 'chair', color: '#9a6a33', stack: 99, desc: '家具'
  });

  def('copper_ore', { name: '铜矿石', type: 'material', icon: 'ore', color: '#c47a45', desc: '可在熔炉中冶炼' });
  def('iron_ore', { name: '铁矿石', type: 'material', icon: 'ore', color: '#c3b29a' });
  def('silver_ore', { name: '银矿石', type: 'material', icon: 'ore', color: '#d9e2e8' });
  def('gold_ore', { name: '金矿石', type: 'material', icon: 'ore', color: '#e8c14a' });
  def('demonite_ore', { name: '恶魔矿石', type: 'material', icon: 'ore', color: '#7d5cb0', rarity: 1, desc: '腐化之地的矿石' });
  def('meteorite_ore', { name: '陨石矿石', type: 'material', icon: 'ore', color: '#b0907c', rarity: 1 });
  def('hellstone_ore', { name: '狱石矿石', type: 'material', icon: 'ore', color: '#ff8a3a', rarity: 2, desc: '来自地狱的炽热矿石' });
  def('copper_bar', { name: '铜锭', type: 'material', icon: 'bar', color: '#c47a45', sell: 5 });
  def('iron_bar', { name: '铁锭', type: 'material', icon: 'bar', color: '#c3b29a', sell: 10 });
  def('silver_bar', { name: '银锭', type: 'material', icon: 'bar', color: '#d9e2e8', sell: 20 });
  def('gold_bar', { name: '金锭', type: 'material', icon: 'bar', color: '#e8c14a', sell: 40 });
  def('demonite_bar', { name: '恶魔锭', type: 'material', icon: 'bar', color: '#7d5cb0', rarity: 1, sell: 80 });
  def('meteorite_bar', { name: '陨石锭', type: 'material', icon: 'bar', color: '#c0a090', rarity: 1, sell: 100 });
  def('hellstone_bar', { name: '狱石锭', type: 'material', icon: 'bar', color: '#ff8a3a', rarity: 2, sell: 160 });
  def('gel', { name: '凝胶', type: 'material', icon: 'gel', color: '#5ab4e0', sell: 1, desc: '史莱姆的黏稠残骸' });
  def('silk', { name: '丝绸', type: 'material', icon: 'silk', color: '#e8e0f0', sell: 5 });
  def('cobweb', { name: '蛛网', type: 'material', icon: 'cobweb', color: '#e0e0ea', sell: 1 });
  def('bone', { name: '骨头', type: 'material', icon: 'bone', color: '#e6e0cc', sell: 3 });
  def('shadow_scale', { name: '暗影鳞片', type: 'material', icon: 'scale', color: '#5e4e75', rarity: 1, sell: 20 });
  def('worm_food', { name: '腐肉', type: 'material', icon: 'meat', color: '#8a5a4a', rarity: 1, sell: 10 });
  def('lens', { name: '晶状体', type: 'material', icon: 'lens', color: '#a8d8f0', sell: 5, desc: '恶魔之眼掉落' });
  def('demon_eye', { name: '恶魔之眼', type: 'material', icon: 'eye', color: '#c04a5a', rarity: 1, sell: 15 });
  def('guide_doll', {
    name: '向导巫毒娃娃', type: 'material', icon: 'doll', color: '#c8a86b', rarity: 3, sell: 200,
    desc: '被诅咒的人偶。把它投入岩浆，会唤醒血肉之墙。'
  });

  def('amethyst', { name: '紫水晶', type: 'gem', icon: 'gem', color: '#a878e0', sell: 25, stack: 99 });
  def('topaz', { name: '黄玉', type: 'gem', icon: 'gem', color: '#f0c05a', sell: 30, stack: 99 });
  def('ruby', { name: '红玉', type: 'gem', icon: 'gem', color: '#e05050', sell: 40, stack: 99 });
  def('diamond', { name: '钻石', type: 'gem', icon: 'gem', color: '#a8f0f0', sell: 60, stack: 99 });

  def('life_crystal', {
    name: '生命水晶', type: 'consumable', icon: 'crystal', color: '#e0608a', rarity: 1, stack: 99,
    use: 0.6, heal: 0, permanent: 'life', amount: 20, desc: '永久增加 20 点生命上限'
  });
  def('mana_crystal', {
    name: '魔力水晶', type: 'consumable', icon: 'crystal', color: '#6a8ae0', rarity: 1, stack: 99,
    use: 0.6, permanent: 'mana', amount: 20, desc: '永久增加 20 点魔力上限'
  });

  def('wood_sword', { name: '木剑', type: 'weapon', icon: 'sword', color: '#a9743c', dmg: 7, use: 0.32, knock: 3.5, melee: true, reach: 1.6, sell: 2, desc: '近战武器' });
  def('copper_shortsword', { name: '铜短剑', type: 'weapon', icon: 'sword', color: '#c47a45', dmg: 8, use: 0.26, knock: 3, melee: true, reach: 1.35, desc: '基础短剑' });
  def('copper_broadsword', { name: '铜阔剑', type: 'weapon', icon: 'sword', color: '#c47a45', dmg: 11, use: 0.34, knock: 5, melee: true, reach: 1.9, sell: 8 });
  def('iron_broadsword', { name: '铁阔剑', type: 'weapon', icon: 'sword', color: '#c3b29a', dmg: 15, use: 0.33, knock: 5.5, melee: true, reach: 2.0, sell: 18, rarity: 1 });
  def('silver_broadsword', { name: '银阔剑', type: 'weapon', icon: 'sword', color: '#d9e2e8', dmg: 19, use: 0.31, knock: 6, melee: true, reach: 2.05, sell: 35, rarity: 1 });
  def('gold_broadsword', { name: '金阔剑', type: 'weapon', icon: 'sword', color: '#e8c14a', dmg: 23, use: 0.30, knock: 6.5, melee: true, reach: 2.1, sell: 70, rarity: 1 });
  def('demonite_sword', {
    name: '恶魔剑', type: 'weapon', icon: 'sword', color: '#8a6ac0', dmg: 30, use: 0.28, knock: 7, melee: true, reach: 2.2,
    sell: 140, rarity: 2, glow: '#a878e0', desc: '击中时迸发暗影能量'
  });
  def('meteor_sword', {
    name: '陨石剑', type: 'weapon', icon: 'sword', color: '#c0a090', dmg: 34, use: 0.27, knock: 7.5, melee: true, reach: 2.2,
    sell: 180, rarity: 2, glow: '#ff9a5a', desc: '炽热的陨铁剑'
  });
  def('hellstone_sword', {
    name: '狱炎剑', type: 'weapon', icon: 'sword', color: '#ff6a2a', dmg: 46, use: 0.26, knock: 8, melee: true, reach: 2.35,
    sell: 320, rarity: 3, glow: '#ffb04a', desc: '燃烧的狱石巨剑'
  });
  def('enchanted_sword', {
    name: '附魔剑', type: 'weapon', icon: 'sword', color: '#9ad8ff', dmg: 28, use: 0.25, knock: 6, melee: true, reach: 2.2,
    sell: 300, rarity: 2, glow: '#9ad8ff', shoot: 'swordbeam', desc: '挥砍时射出剑气'
  });
  def('starfury', {
    name: '星怒', type: 'weapon', icon: 'sword', color: '#ffd870', dmg: 38, use: 0.32, knock: 7, melee: true, reach: 2.2,
    sell: 400, rarity: 3, glow: '#ffd870', shoot: 'starp', desc: '召唤坠星攻击敌人'
  });

  def('copper_pickaxe', { name: '铜镐', type: 'tool', icon: 'pick', color: '#c47a45', tool: 'pick', power: 35, dmg: 5, use: 0.24, melee: true, reach: 1.5, desc: '挖掘泥土与石头' });
  def('iron_pickaxe', { name: '铁镐', type: 'tool', icon: 'pick', color: '#c3b29a', tool: 'pick', power: 45, dmg: 6, use: 0.22, melee: true, reach: 1.55, sell: 20, rarity: 1 });
  def('silver_pickaxe', { name: '银镐', type: 'tool', icon: 'pick', color: '#d9e2e8', tool: 'pick', power: 55, dmg: 7, use: 0.21, melee: true, reach: 1.6, sell: 40, rarity: 1 });
  def('gold_pickaxe', { name: '金镐', type: 'tool', icon: 'pick', color: '#e8c14a', tool: 'pick', power: 65, dmg: 8, use: 0.20, melee: true, reach: 1.65, sell: 80, rarity: 1 });
  def('demonite_pickaxe', { name: '恶魔镐', type: 'tool', icon: 'pick', color: '#8a6ac0', tool: 'pick', power: 80, dmg: 10, use: 0.19, melee: true, reach: 1.7, sell: 160, rarity: 2 });
  def('hellstone_pickaxe', { name: '狱石镐', type: 'tool', icon: 'pick', color: '#ff6a2a', tool: 'pick', power: 95, dmg: 12, use: 0.18, melee: true, reach: 1.75, sell: 320, rarity: 3 });
  def('copper_axe', { name: '铜斧', type: 'tool', icon: 'axe', color: '#c47a45', tool: 'axe', power: 40, dmg: 7, use: 0.3, melee: true, reach: 1.6, desc: '砍伐树木' });
  def('iron_axe', { name: '铁斧', type: 'tool', icon: 'axe', color: '#c3b29a', tool: 'axe', power: 55, dmg: 9, use: 0.28, melee: true, reach: 1.65, sell: 20, rarity: 1 });
  def('gold_axe', { name: '金斧', type: 'tool', icon: 'axe', color: '#e8c14a', tool: 'axe', power: 70, dmg: 11, use: 0.27, melee: true, reach: 1.7, sell: 80, rarity: 1 });
  def('copper_hammer', { name: '铜锤', type: 'tool', icon: 'hammer', color: '#c47a45', tool: 'hammer', power: 40, dmg: 8, use: 0.35, melee: true, reach: 1.7, desc: '拆除墙壁与家具' });
  def('iron_hammer', { name: '铁锤', type: 'tool', icon: 'hammer', color: '#c3b29a', tool: 'hammer', power: 55, dmg: 10, use: 0.33, melee: true, reach: 1.75, sell: 20, rarity: 1 });
  def('gold_hammer', { name: '金锤', type: 'tool', icon: 'hammer', color: '#e8c14a', tool: 'hammer', power: 70, dmg: 12, use: 0.31, melee: true, reach: 1.8, sell: 80, rarity: 1 });

  def('wood_bow', {
    name: '木弓', type: 'weapon', icon: 'bow', color: '#a9743c', dmg: 9, use: 0.42, ranged: true, ammo: 'arrow',
    shoot: 'arrow', speed: 15, knock: 3, sell: 5, desc: '需要箭矢'
  });
  def('copper_bow', {
    name: '铜弓', type: 'weapon', icon: 'bow', color: '#c47a45', dmg: 13, use: 0.38, ranged: true, ammo: 'arrow',
    shoot: 'arrow', speed: 16, knock: 3.5, sell: 20, rarity: 1
  });
  def('iron_bow', {
    name: '铁弓', type: 'weapon', icon: 'bow', color: '#c3b29a', dmg: 17, use: 0.35, ranged: true, ammo: 'arrow',
    shoot: 'arrow', speed: 17, knock: 4, sell: 45, rarity: 1
  });
  def('demon_bow', {
    name: '恶魔弓', type: 'weapon', icon: 'bow', color: '#8a6ac0', dmg: 24, use: 0.32, ranged: true, ammo: 'arrow',
    shoot: 'arrow', speed: 18, knock: 4.5, sell: 160, rarity: 2, glow: '#a878e0'
  });
  def('hellwing_bow', {
    name: '地狱之翼弓', type: 'weapon', icon: 'bow', color: '#ff6a2a', dmg: 32, use: 0.29, ranged: true, ammo: 'arrow',
    shoot: 'firearrow', speed: 19, knock: 5, sell: 300, rarity: 3, glow: '#ffb04a', desc: '箭矢化作烈焰'
  });
  def('musket', {
    name: '火枪', type: 'weapon', icon: 'gun', color: '#8a7a6a', dmg: 23, use: 0.55, ranged: true, ammo: 'bullet',
    shoot: 'bullet', speed: 26, knock: 6, sell: 120, rarity: 1, desc: '精准而致命'
  });
  def('boomstick', {
    name: '散弹枪', type: 'weapon', icon: 'gun', color: '#a06a4a', dmg: 15, use: 0.52, ranged: true, ammo: 'bullet',
    shoot: 'shotgun', speed: 22, knock: 4, sell: 300, rarity: 2, desc: '一次射出三发'
  });
  def('arrow', { name: '木箭', type: 'ammo', icon: 'arrow', color: '#c8a86b', stack: 999, dmg: 5, ammo: 'arrow', sell: 1, desc: '弓的弹药' });
  def('flame_arrow', { name: '火焰箭', type: 'ammo', icon: 'arrow', color: '#ff8a3a', stack: 999, dmg: 9, ammo: 'arrow', sell: 3, rarity: 1, desc: '点燃敌人' });
  def('bullet', { name: '火枪弹', type: 'ammo', icon: 'bullet', color: '#d8c8a0', stack: 999, dmg: 8, ammo: 'bullet', sell: 2, desc: '枪械的弹药' });
  def('silver_bullet', { name: '银弹', type: 'ammo', icon: 'bullet', color: '#e8f0f6', stack: 999, dmg: 12, ammo: 'bullet', sell: 4, rarity: 1 });

  def('spark_staff', {
    name: '火花法杖', type: 'weapon', icon: 'staff', color: '#ffb04a', dmg: 15, use: 0.42, magic: true, mana: 6,
    shoot: 'spark', speed: 12, knock: 3, sell: 40, rarity: 1, glow: '#ffb04a'
  });
  def('water_bolt', {
    name: '水箭法杖', type: 'weapon', icon: 'staff', color: '#6ab0e8', dmg: 21, use: 0.4, magic: true, mana: 8,
    shoot: 'waterbolt', speed: 13, knock: 4, sell: 80, rarity: 1, glow: '#6ab0e8', desc: '水箭会在墙上反弹'
  });
  def('space_gun', {
    name: '空间枪', type: 'weapon', icon: 'gun', color: '#8ad8c8', dmg: 27, use: 0.25, magic: true, mana: 7,
    shoot: 'laser', speed: 28, knock: 3, sell: 200, rarity: 2, glow: '#8ad8c8', desc: '陨石科技的激光'
  });
  def('demon_scythe', {
    name: '恶魔之镰', type: 'weapon', icon: 'staff', color: '#a878e0', dmg: 34, use: 0.5, magic: true, mana: 14,
    shoot: 'scythe', speed: 14, knock: 6, sell: 350, rarity: 3, glow: '#c8a0ff', desc: '穿透墙壁的暗影镰刀'
  });
  def('flamelash', {
    name: '烈焰鞭', type: 'weapon', icon: 'staff', color: '#ff7a1f', dmg: 42, use: 0.46, magic: true, mana: 16,
    shoot: 'flame', speed: 11, knock: 6, sell: 500, rarity: 3, glow: '#ffb04a'
  });
  def('slime_staff', {
    name: '史莱姆法杖', type: 'weapon', icon: 'staff', color: '#5ab4e0', dmg: 12, use: 0.7, summon: true, mana: 10,
    sell: 120, rarity: 1, desc: '召唤一只史莱姆宝宝为你战斗'
  });

  def('wood_helmet', { name: '木头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#a9743c', defense: 1, sell: 1, desc: '护甲 1' });
  def('wood_chest', { name: '木胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#a9743c', defense: 1, sell: 1, desc: '护甲 1' });
  def('wood_greaves', { name: '木护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#a9743c', defense: 1, sell: 1, desc: '护甲 1' });
  def('copper_helmet', { name: '铜头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#c47a45', defense: 2, sell: 8 });
  def('copper_chest', { name: '铜胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#c47a45', defense: 3, sell: 8 });
  def('copper_greaves', { name: '铜护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#c47a45', defense: 2, sell: 8 });
  def('iron_helmet', { name: '铁头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#c3b29a', defense: 3, sell: 18, rarity: 1 });
  def('iron_chest', { name: '铁胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#c3b29a', defense: 4, sell: 18, rarity: 1 });
  def('iron_greaves', { name: '铁护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#c3b29a', defense: 3, sell: 18, rarity: 1 });
  def('silver_helmet', { name: '银头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#d9e2e8', defense: 5, sell: 35, rarity: 1 });
  def('silver_chest', { name: '银胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#d9e2e8', defense: 6, sell: 35, rarity: 1 });
  def('silver_greaves', { name: '银护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#d9e2e8', defense: 5, sell: 35, rarity: 1 });
  def('gold_helmet', { name: '金头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#e8c14a', defense: 7, sell: 70, rarity: 1 });
  def('gold_chest', { name: '金胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#e8c14a', defense: 8, sell: 70, rarity: 1 });
  def('gold_greaves', { name: '金护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#e8c14a', defense: 7, sell: 70, rarity: 1 });
  def('demonite_helmet', { name: '恶魔头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#8a6ac0', defense: 10, sell: 140, rarity: 2 });
  def('demonite_chest', { name: '恶魔胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#8a6ac0', defense: 12, sell: 140, rarity: 2 });
  def('demonite_greaves', { name: '恶魔护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#8a6ac0', defense: 10, sell: 140, rarity: 2 });
  def('hellstone_helmet', { name: '狱石头盔', type: 'armor', slot: 'head', icon: 'helmet', color: '#ff6a2a', defense: 15, sell: 280, rarity: 3, glow: '#ffb04a' });
  def('hellstone_chest', { name: '狱石胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: '#ff6a2a', defense: 18, sell: 280, rarity: 3, glow: '#ffb04a' });
  def('hellstone_greaves', { name: '狱石护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: '#ff6a2a', defense: 15, sell: 280, rarity: 3, glow: '#ffb04a' });

  def('cloud_in_a_bottle', {
    name: '云朵瓶', type: 'accessory', icon: 'bottle', color: '#d8eef8', rarity: 1, sell: 80,
    fx: 'doubleJump', desc: '允许二段跳'
  });
  def('hermes_boots', {
    name: '赫尔墨斯之靴', type: 'accessory', icon: 'boots', color: '#c8a86b', rarity: 1, sell: 100,
    fx: 'speed', desc: '大幅提升移动速度'
  });
  def('lucky_horseshoe', {
    name: '幸运马蹄铁', type: 'accessory', icon: 'horseshoe', color: '#d8c0a0', rarity: 1, sell: 60,
    fx: 'nofall', desc: '免疫坠落伤害'
  });
  def('band_of_regeneration', {
    name: '再生手环', type: 'accessory', icon: 'ring', color: '#e08a9a', rarity: 1, sell: 120,
    fx: 'regen', desc: '缓慢恢复生命'
  });
  def('mana_flower', {
    name: '魔力之花', type: 'accessory', icon: 'flower', color: '#8a9ae8', rarity: 2, sell: 180,
    fx: 'mana', desc: '魔力上限 +40，回复更快'
  });
  def('warrior_emblem', {
    name: '战士徽章', type: 'accessory', icon: 'emblem', color: '#e0a050', rarity: 2, sell: 200,
    fx: 'damage', desc: '所有伤害 +15%'
  });
  def('anklet_of_the_wind', {
    name: '风之脚环', type: 'accessory', icon: 'boots', color: '#b8e0c8', rarity: 1, sell: 90,
    fx: 'jump', desc: '跳跃高度提升'
  });

  def('healing_potion', {
    name: '治疗药水', type: 'consumable', icon: 'potion', color: '#e04466', rarity: 0, stack: 99,
    use: 0.5, heal: 50, desc: '恢复 50 生命', cooldown: 12
  });
  def('greater_healing_potion', {
    name: '强效治疗药水', type: 'consumable', icon: 'potion', color: '#ff3a6a', rarity: 1, stack: 99,
    use: 0.5, heal: 100, desc: '恢复 100 生命', cooldown: 12
  });
  def('mana_potion', {
    name: '魔力药水', type: 'consumable', icon: 'potion', color: '#3a6ae0', stack: 99,
    use: 0.5, mana: 50, desc: '恢复 50 魔力', cooldown: 5
  });
  def('greater_mana_potion', {
    name: '强效魔力药水', type: 'consumable', icon: 'potion', color: '#6a9aff', rarity: 1, stack: 99,
    use: 0.5, mana: 100, desc: '恢复 100 魔力', cooldown: 5
  });
  def('ironskin_potion', {
    name: '铁皮药水', type: 'consumable', icon: 'potion', color: '#a08a6a', stack: 30,
    use: 0.5, duration: 120, buff: 'ironskin', desc: '护甲 +8，持续 2 分钟'
  });
  def('swiftness_potion', {
    name: '迅捷药水', type: 'consumable', icon: 'potion', color: '#8ae0a0', stack: 30,
    use: 0.5, duration: 120, buff: 'swiftness', desc: '移动速度 +25%，持续 2 分钟'
  });
  def('night_owl_potion', {
    name: '夜猫子药水', type: 'consumable', icon: 'potion', color: '#8a8ad0', stack: 30,
    use: 0.5, duration: 300, buff: 'nightowl', desc: '视野大幅提升，持续 5 分钟'
  });
  def('regeneration_potion', {
    name: '再生药水', type: 'consumable', icon: 'potion', color: '#d06a8a', stack: 30,
    use: 0.5, duration: 120, buff: 'regeneration', desc: '持续恢复生命，持续 2 分钟'
  });
  def('obsidian_skin_potion', {
    name: '黑曜石皮肤药水', type: 'consumable', icon: 'potion', color: '#6a5a7a', rarity: 1, stack: 30,
    use: 0.5, duration: 180, buff: 'obsidian', desc: '免疫岩浆，持续 3 分钟'
  });
  def('mining_potion', {
    name: '挖矿药水', type: 'consumable', icon: 'potion', color: '#c8b070', stack: 30,
    use: 0.5, duration: 180, buff: 'mining', desc: '挖掘速度 +25%，持续 3 分钟'
  });
  def('bottled_water', { name: '瓶装水', type: 'material', icon: 'bottle', color: '#8ab8e8', stack: 99, sell: 1, desc: '药水的基底' });
  def('bottle', { name: '玻璃瓶', type: 'material', icon: 'bottle', color: '#c8e0ea', stack: 99, sell: 2 });
  def('mushroom', { name: '蘑菇', type: 'material', icon: 'mushroom', color: '#d8b14a', stack: 99, sell: 2 });
  def('glowing_mushroom', { name: '发光蘑菇', type: 'material', icon: 'mushroom', color: '#5ae0c0', stack: 99, sell: 10, rarity: 1 });
  def('vine', { name: '藤蔓', type: 'material', icon: 'vine', color: '#4c9c45', stack: 99, sell: 1 });
  def('acorn', { name: '橡子', type: 'furniture', place: T.TILE.SAPLING, icon: 'acorn', color: '#a9743c', stack: 99, sell: 1, desc: '种下一棵树' });
  def('star', { name: '坠落之星', type: 'material', icon: 'star', color: '#ffe680', stack: 99, rarity: 1, sell: 20, desc: '夜间从天空坠落，可恢复魔力' });
  def('gel_ball', { name: '凝胶球', type: 'ammo', icon: 'gel', color: '#5ab4e0', stack: 999, dmg: 4, ammo: 'gel', sell: 1 });

  def('suspicious_eye', {
    name: '可疑的眼球', type: 'summon', icon: 'eye', color: '#c04a5a', rarity: 2, stack: 20, use: 0.8,
    boss: 'eye', desc: '在夜晚使用，召唤克苏鲁之眼'
  });
  def('worm_food_bait', {
    name: '腐化诱饵', type: 'summon', icon: 'worm', color: '#8a6ac0', rarity: 2, stack: 20, use: 0.8,
    boss: 'eater', desc: '在腐化之地使用，唤醒世界吞噬者'
  });
  def('clothier_voodoo', {
    name: '骷髅玩偶', type: 'summon', icon: 'doll', color: '#d8d0c0', rarity: 2, stack: 20, use: 0.8,
    boss: 'skeletron', desc: '在地牢入口使用，召唤骷髅王'
  });

  def('coin_copper', { name: '铜币', type: 'coin', icon: 'coin', color: '#c47a45', stack: 100, sell: 1, value: 1 });
  def('coin_silver', { name: '银币', type: 'coin', icon: 'coin', color: '#d9e2e8', stack: 100, sell: 100, value: 100 });
  def('coin_gold', { name: '金币', type: 'coin', icon: 'coin', color: '#e8c14a', stack: 100, sell: 10000, value: 10000 });

  def('king_slime_trophy', { name: '史莱姆王纪念章', type: 'trophy', icon: 'trophy', color: '#3a6ad8', rarity: 3, stack: 1, sell: 600 });
  def('queen_bee_trophy', { name: '蜂后纪念章', type: 'trophy', icon: 'trophy', color: '#e0b020', rarity: 3, stack: 1, sell: 900 });
  def('bee_wax', { name: '蜂蜡', type: 'material', icon: 'gel', color: '#e8c040', rarity: 2, stack: 99, sell: 40 });
  def('honey_potion', {
    name: '蜂蜜药水', type: 'consumable', icon: 'potion', color: '#e8b020', rarity: 1, stack: 30,
    use: 0.5, duration: 180, buff: 'honey', desc: '持续恢复生命，持续 3 分钟'
  });
  def('hornet_staff', {
    name: '黄蜂法杖', type: 'weapon', icon: 'staff', color: '#e8c040', dmg: 22, use: 0.7, summon: true, mana: 12,
    sell: 400, rarity: 2, desc: '召唤一只黄蜂为你战斗'
  });
  def('bee_bow', {
    name: '蜂膝弓', type: 'weapon', icon: 'bow', color: '#e8c040', dmg: 26, use: 0.32, ranged: true, ammo: 'arrow',
    shoot: 'beearrow', speed: 17, knock: 4, sell: 500, rarity: 2, glow: '#ffd860', desc: '箭矢化作追踪的黄蜂'
  });
  def('slime_gun', {
    name: '史莱姆枪', type: 'weapon', icon: 'gun', color: '#5ab4e0', dmg: 18, use: 0.4, ranged: true, ammo: 'gel',
    shoot: 'slimeball', speed: 15, knock: 3, sell: 350, rarity: 2, desc: '消耗凝胶射击'
  });
  def('king_slime_crown', {
    name: '史莱姆王冠', type: 'summon', icon: 'trophy', color: '#3a6ad8', rarity: 2, stack: 20, use: 0.8,
    boss: 'king_slime', desc: '在户外使用，召唤史莱姆王'
  });
  def('abeemination', {
    name: '蜂巢诱饵', type: 'summon', icon: 'worm', color: '#e8c040', rarity: 2, stack: 20, use: 0.8,
    boss: 'queen_bee', desc: '在丛林使用，唤醒蜂后'
  });
  def('grappling_hook', {
    name: '抓钩', type: 'tool', icon: 'hook', color: '#c0a080', rarity: 1, stack: 1, use: 0.3,
    hook: true, reach: 20, sell: 200, desc: '右键发射抓钩，快速跨越地形'
  });
  def('diamond_hook', {
    name: '钻石抓钩', type: 'tool', icon: 'hook', color: '#a8f0f0', rarity: 2, stack: 1, use: 0.25,
    hook: true, reach: 28, sell: 600, desc: '射程更远的抓钩'
  });
  def('angel_wings', {
    name: '天使之翼', type: 'accessory', icon: 'wing', color: '#e8f0ff', rarity: 2, sell: 800,
    fx: 'wings', desc: '允许飞行与缓降'
  });
  def('demon_wings', {
    name: '恶魔之翼', type: 'accessory', icon: 'wing', color: '#8a5ac0', rarity: 3, sell: 1200,
    fx: 'wings', desc: '允许飞行，速度更快'
  });
  def('obsidian_shield', {
    name: '黑曜石盾', type: 'accessory', icon: 'shield', color: '#5a4a6a', rarity: 2, sell: 500,
    fx: 'shield', desc: '免疫击退'
  });
  def('magic_mirror', {
    name: '魔镜', type: 'tool', icon: 'mirror', color: '#a8d8f0', rarity: 1, stack: 1, use: 1.2,
    teleport: true, sell: 300, desc: '右键使用，传送回出生点'
  });  def('eye_trophy', { name: '克苏鲁之眼纪念章', type: 'trophy', icon: 'trophy', color: '#c04a5a', rarity: 3, stack: 1, sell: 500 });
  def('eater_trophy', { name: '世界吞噬者纪念章', type: 'trophy', icon: 'trophy', color: '#8a6ac0', rarity: 3, stack: 1, sell: 800 });
  def('skeletron_trophy', { name: '骷髅王纪念章', type: 'trophy', icon: 'trophy', color: '#d8d0c0', rarity: 3, stack: 1, sell: 1200 });
  def('wof_trophy', { name: '血肉之墙纪念章', type: 'trophy', icon: 'trophy', color: '#ff5a3a', rarity: 4, stack: 1, sell: 2000 });
  def('eater_scale', { name: '吞噬者之鳞', type: 'material', icon: 'scale', color: '#8a6ac0', rarity: 2, stack: 99, sell: 30 });

  def('bottomless_water', { name: '无底水桶', type: 'tool', icon: 'bucket', color: '#6aa0e8', rarity: 2, stack: 1, place: T.TILE.WATER, desc: '放置水' });
  def('lava_bucket', { name: '岩浆桶', type: 'tool', icon: 'bucket', color: '#ff7a1f', rarity: 2, stack: 1, place: T.TILE.LAVA, desc: '放置岩浆' });

  const SWORD_TIERS = [
    ['tin_broadsword', '锡阔剑', '#c8d0d8', 10, 0.33, 4.5],
    ['lead_broadsword', '铅阔剑', '#9aa8b8', 13, 0.33, 5],
    ['tungsten_broadsword', '钨阔剑', '#a8b0c8', 17, 0.32, 5.5],
    ['platinum_broadsword', '铂金阔剑', '#e0e8f0', 21, 0.31, 6],
    ['crimtane_sword', '血金剑', '#c84060', 28, 0.29, 6.5],
    ['molten_sword', '熔岩剑', '#ff5a2a', 44, 0.26, 8],
    ['blade_of_grass', '草剑', '#5ac04a', 26, 0.28, 6],
    ['fiery_greatsword', '炽焰巨剑', '#ff7a30', 48, 0.34, 9],
    ['nights_edge', '永夜之刃', '#8a5ad0', 58, 0.26, 9],
    ['lights_bane', '光之驱逐', '#9ad8ff', 36, 0.27, 7],
    ['blood_butcherer', '血屠夫', '#c02040', 34, 0.3, 7],
    ['excalibur', '圣剑', '#e8f0ff', 66, 0.25, 9.5],
    ['true_nights_edge', '真·永夜之刃', '#b07ae8', 82, 0.24, 10],
    ['terragrim', '泰拉刃', '#8ae0c0', 95, 0.22, 11]
  ];
  for (const [id, name, color, dmg, use, knock] of SWORD_TIERS) {
    def(id, {
      name: name, type: 'weapon', icon: 'sword', color: color, dmg: dmg, use: use, knock: knock,
      melee: true, reach: 2.0 + dmg * 0.004, rarity: dmg > 60 ? 3 : dmg > 28 ? 2 : 1,
      sell: Math.round(dmg * 6), glow: dmg > 40 ? color : null,
      desc: dmg > 60 ? '传说中的利刃' : '精钢锻造的近战武器'
    });
  }
  const BOW_TIERS = [
    ['tin_bow', '锡弓', '#c8d0d8', 11, 20],
    ['lead_bow', '铅弓', '#9aa8b8', 14, 28],
    ['tungsten_bow', '钨弓', '#a8b0c8', 18, 40],
    ['platinum_bow', '铂金弓', '#e0e8f0', 22, 60],
    ['molten_bow', '熔岩弓', '#ff5a2a', 30, 160]
  ];
  for (const [id, name, color, dmg, sell] of BOW_TIERS) {
    def(id, {
      name: name, type: 'weapon', icon: 'bow', color: color, dmg: dmg, use: 0.36,
      ranged: true, ammo: 'arrow', shoot: 'arrow', speed: 16, knock: 4, sell: sell,
      rarity: dmg > 25 ? 2 : 1, desc: '需要箭矢'
    });
  }
  const STAFF_TIERS = [
    ['amethyst_staff', '紫水晶法杖', '#a878e0', 13, 5],
    ['topaz_staff', '黄玉法杖', '#f0c05a', 16, 6],
    ['ruby_staff', '红玉法杖', '#e05050', 21, 8],
    ['diamond_staff', '钻石法杖', '#a8f0f0', 27, 10],
    ['emu_staff', '翡翠法杖', '#5ae0a0', 24, 9]
  ];
  for (const [id, name, color, dmg, mana] of STAFF_TIERS) {
    def(id, {
      name: name, type: 'weapon', icon: 'staff', color: color, dmg: dmg, use: 0.4,
      magic: true, mana: mana, shoot: 'spark', speed: 12, knock: 3, rarity: 2,
      sell: Math.round(dmg * 18), glow: color, desc: '射出魔法弹'
    });
  }
  const ARMOR_SETS = [
    ['tin', '锡', '#c8d0d8', 2, 3, 2],
    ['lead', '铅', '#9aa8b8', 3, 4, 3],
    ['tungsten', '钨', '#a8b0c8', 4, 5, 4],
    ['platinum', '铂金', '#e0e8f0', 6, 7, 6],
    ['crimtane', '血金', '#c84060', 8, 10, 8],
    ['molten', '熔岩', '#ff5a2a', 12, 14, 12],
    ['jungle', '丛林', '#5ac04a', 5, 6, 5]
  ];
  for (const [key, label, color, dh, dc, dl] of ARMOR_SETS) {
    def(key + '_helmet', { name: label + '头盔', type: 'armor', slot: 'head', icon: 'helmet', color: color, defense: dh, rarity: 1, sell: dh * 12 });
    def(key + '_chest', { name: label + '胸甲', type: 'armor', slot: 'body', icon: 'chestplate', color: color, defense: dc, rarity: 1, sell: dc * 12 });
    def(key + '_greaves', { name: label + '护腿', type: 'armor', slot: 'legs', icon: 'greaves', color: color, defense: dl, rarity: 1, sell: dl * 12 });
  }
  def('tin_bar', { name: '锡锭', type: 'material', icon: 'bar', color: '#c8d0d8', sell: 6 });
  def('lead_bar', { name: '铅锭', type: 'material', icon: 'bar', color: '#9aa8b8', sell: 12 });
  def('tungsten_bar', { name: '钨锭', type: 'material', icon: 'bar', color: '#a8b0c8', sell: 24 });
  def('platinum_bar', { name: '铂金锭', type: 'material', icon: 'bar', color: '#e0e8f0', sell: 48 });
  def('crimtane_bar', { name: '血金锭', type: 'material', icon: 'bar', color: '#c84060', rarity: 1, sell: 90 });
  def('crimtane_ore', { name: '血金矿石', type: 'material', icon: 'ore', color: '#c84060', rarity: 1 });
  def('tin_ore', { name: '锡矿石', type: 'material', icon: 'ore', color: '#c8d0d8' });
  def('lead_ore', { name: '铅矿石', type: 'material', icon: 'ore', color: '#9aa8b8' });
  def('tungsten_ore', { name: '钨矿石', type: 'material', icon: 'ore', color: '#a8b0c8' });
  def('platinum_ore', { name: '铂金矿石', type: 'material', icon: 'ore', color: '#e0e8f0' });
  def('amber', { name: '琥珀', type: 'gem', icon: 'gem', color: '#e8a040', sell: 35, stack: 99 });
  def('emerald', { name: '翡翠', type: 'gem', icon: 'gem', color: '#5ae0a0', sell: 50, stack: 99 });
  def('sapphire', { name: '蓝宝石', type: 'gem', icon: 'gem', color: '#5080e8', sell: 55, stack: 99 });
  def('jungle_spore', { name: '丛林孢子', type: 'material', icon: 'mushroom', color: '#7ae05a', rarity: 1, sell: 15 });
  def('stinger', { name: '毒刺', type: 'material', icon: 'arrow', color: '#e0c060', sell: 8 });
  def('feather', { name: '羽毛', type: 'material', icon: 'feather', color: '#e8e8f0', sell: 5 });
  def('gold_key', { name: '金钥匙', type: 'material', icon: 'key', color: '#e8c14a', rarity: 1, sell: 60, desc: '开启地牢宝箱' });
  def('healing_potion_small', { name: '弱效治疗药水', type: 'consumable', icon: 'potion', color: '#e07a8a', stack: 99, use: 0.5, heal: 25, cooldown: 12 });
  def('mana_potion_small', { name: '弱效魔力药水', type: 'consumable', icon: 'potion', color: '#6a9ae0', stack: 99, use: 0.5, mana: 25, cooldown: 5 });
  def('recall_potion', { name: '回城药水', type: 'consumable', icon: 'potion', color: '#a8e0ff', stack: 30, use: 0.6, teleport: true, desc: '立刻传送回出生点' });
  def('flipper', { name: '脚蹼', type: 'accessory', icon: 'boots', color: '#6ac0c8', rarity: 1, sell: 300, fx: 'flipper', desc: '在水中自由游动' });
  def('frog_leg', { name: '蛙腿', type: 'accessory', icon: 'boots', color: '#7ac04a', rarity: 2, sell: 500, fx: 'jump', desc: '跳跃高度大幅提升' });
  def('magma_stone', { name: '熔岩护符', type: 'accessory', icon: 'ring', color: '#ff6a2a', rarity: 2, sell: 900, fx: 'lava', desc: '免疫岩浆伤害' });
  def('depth_meter', { name: '深度计', type: 'accessory', icon: 'ring', color: '#a0b0c0', rarity: 1, sell: 200, fx: 'depth', desc: '显示当前深度' });
  def('shackle', { name: '镣铐', type: 'accessory', icon: 'ring', color: '#8a8a94', rarity: 1, sell: 150, fx: 'defense', desc: '护甲 +3' });
  def('obsidian_horseshoe', { name: '黑曜石马蹄铁', type: 'accessory', icon: 'horseshoe', color: '#5a4a6a', rarity: 2, sell: 700, fx: 'nofall', desc: '免疫坠落伤害' });
  def('demonite_bar_bag', { name: '暗影锭袋', type: 'material', icon: 'bar', color: '#7d5cb0', rarity: 2, sell: 200 });  T.itemDef = function (id) { return ITEMS[id] || null; };
  T.itemName = function (id) { return ITEMS[id] ? ITEMS[id].name : id; };
  T.itemStackMax = function (id) { return ITEMS[id] ? (ITEMS[id].stack || 1) : 1; };

  T.isTool = function (id) { const it = ITEMS[id]; return !!(it && it.tool); };
  T.isWeapon = function (id) {
    const it = ITEMS[id];
    return !!(it && (it.melee || it.ranged || it.magic || it.summon));
  };
  T.isMelee = function (id) { const it = ITEMS[id]; return !!(it && it.melee); };
  T.isArmor = function (id) { const it = ITEMS[id]; return !!(it && it.slot); };
  T.isAccessory = function (id) { const it = ITEMS[id]; return !!(it && it.type === 'accessory'); };
  T.isPlaceable = function (id) { const it = ITEMS[id]; return !!(it && it.place); };
  T.weaponClass = function (id) {
    const it = ITEMS[id];
    if (!it) return 'none';
    if (it.melee) return 'melee';
    if (it.ranged) return 'ranged';
    if (it.magic) return 'magic';
    if (it.summon) return 'summon';
    return 'none';
  };

  T.RECIPES = [];

  function recipe(out, count, ing, station) {
    T.RECIPES.push({ out: out, count: count, ing: ing, station: station || null });
  }

  recipe('workbench', 1, { wood: 10 });
  recipe('torch', 3, { wood: 1, gel: 1 });
  recipe('wood_brick', 1, { wood: 2 }, 'workbench');
  recipe('platform', 2, { wood: 1 }, 'workbench');
  recipe('chest', 1, { wood: 8, iron_bar: 2 }, 'workbench');
  recipe('door', 1, { wood: 6 }, 'workbench');
  recipe('table', 1, { wood: 8 }, 'workbench');
  recipe('chair', 1, { wood: 4 }, 'workbench');
  recipe('furnace', 1, { stone: 20, wood: 4, torch: 3 }, 'workbench');
  recipe('anvil', 1, { iron_bar: 5 }, 'workbench');
  recipe('rope', 3, { cobweb: 3 }, 'workbench');
  recipe('glass', 2, { sand: 2 }, 'furnace');
  recipe('bottle', 1, { glass: 1 }, 'furnace');
  recipe('bottled_water', 1, { bottle: 1 }, 'furnace');
  recipe('wood_sword', 1, { wood: 7 }, 'workbench');
  recipe('wood_bow', 1, { wood: 10 }, 'workbench');
  recipe('arrow', 5, { wood: 1, stone: 1 }, 'workbench');
  recipe('wood_helmet', 1, { wood: 20 }, 'workbench');
  recipe('wood_chest', 1, { wood: 30 }, 'workbench');
  recipe('wood_greaves', 1, { wood: 25 }, 'workbench');
  recipe('copper_bar', 1, { copper_ore: 3 }, 'furnace');
  recipe('iron_bar', 1, { iron_ore: 3 }, 'furnace');
  recipe('silver_bar', 1, { silver_ore: 4 }, 'furnace');
  recipe('gold_bar', 1, { gold_ore: 4 }, 'furnace');
  recipe('demonite_bar', 1, { demonite_ore: 3, shadow_scale: 1 }, 'furnace');
  recipe('meteorite_bar', 1, { meteorite_ore: 3 }, 'furnace');
  recipe('hellstone_bar', 1, { hellstone_ore: 3, obsidian_brick: 1 }, 'hellforge');
  recipe('stone_brick', 1, { stone: 2 }, 'workbench');
  recipe('copper_shortsword', 1, { copper_bar: 5 }, 'anvil');
  recipe('copper_broadsword', 1, { copper_bar: 8 }, 'anvil');
  recipe('copper_pickaxe', 1, { copper_bar: 8, wood: 3 }, 'anvil');
  recipe('copper_axe', 1, { copper_bar: 7, wood: 3 }, 'anvil');
  recipe('copper_hammer', 1, { copper_bar: 8, wood: 3 }, 'anvil');
  recipe('copper_bow', 1, { copper_bar: 7, wood: 5 }, 'anvil');
  recipe('copper_helmet', 1, { copper_bar: 10 }, 'anvil');
  recipe('copper_chest', 1, { copper_bar: 14 }, 'anvil');
  recipe('copper_greaves', 1, { copper_bar: 12 }, 'anvil');
  recipe('iron_broadsword', 1, { iron_bar: 10 }, 'anvil');
  recipe('iron_pickaxe', 1, { iron_bar: 10, wood: 3 }, 'anvil');
  recipe('iron_axe', 1, { iron_bar: 9, wood: 3 }, 'anvil');
  recipe('iron_hammer', 1, { iron_bar: 10, wood: 3 }, 'anvil');
  recipe('iron_bow', 1, { iron_bar: 8, wood: 5 }, 'anvil');
  recipe('iron_helmet', 1, { iron_bar: 12 }, 'anvil');
  recipe('iron_chest', 1, { iron_bar: 16 }, 'anvil');
  recipe('iron_greaves', 1, { iron_bar: 14 }, 'anvil');
  recipe('silver_broadsword', 1, { silver_bar: 10 }, 'anvil');
  recipe('silver_pickaxe', 1, { silver_bar: 10, wood: 3 }, 'anvil');
  recipe('silver_helmet', 1, { silver_bar: 12 }, 'anvil');
  recipe('silver_chest', 1, { silver_bar: 16 }, 'anvil');
  recipe('silver_greaves', 1, { silver_bar: 14 }, 'anvil');
  recipe('gold_broadsword', 1, { gold_bar: 10 }, 'anvil');
  recipe('gold_pickaxe', 1, { gold_bar: 10, wood: 3 }, 'anvil');
  recipe('gold_axe', 1, { gold_bar: 9, wood: 3 }, 'anvil');
  recipe('gold_hammer', 1, { gold_bar: 10, wood: 3 }, 'anvil');
  recipe('gold_helmet', 1, { gold_bar: 12 }, 'anvil');
  recipe('gold_chest', 1, { gold_bar: 16 }, 'anvil');
  recipe('gold_greaves', 1, { gold_bar: 14 }, 'anvil');
  recipe('demonite_sword', 1, { demonite_bar: 10, shadow_scale: 4 }, 'anvil');
  recipe('demonite_pickaxe', 1, { demonite_bar: 12, shadow_scale: 4 }, 'anvil');
  recipe('demon_bow', 1, { demonite_bar: 10, shadow_scale: 4 }, 'anvil');
  recipe('demonite_helmet', 1, { demonite_bar: 12, shadow_scale: 4 }, 'anvil');
  recipe('demonite_chest', 1, { demonite_bar: 16, shadow_scale: 6 }, 'anvil');
  recipe('demonite_greaves', 1, { demonite_bar: 14, shadow_scale: 5 }, 'anvil');
  recipe('meteor_sword', 1, { meteorite_bar: 12 }, 'anvil');
  recipe('space_gun', 1, { meteorite_bar: 12 }, 'anvil');
  recipe('musket', 1, { iron_bar: 12, wood: 10, gel: 5 }, 'anvil');
  recipe('boomstick', 1, { iron_bar: 16, wood: 12, gel: 8 }, 'anvil');
  recipe('bullet', 10, { iron_bar: 1 }, 'anvil');
  recipe('silver_bullet', 10, { silver_bar: 1 }, 'anvil');
  recipe('hellstone_sword', 1, { hellstone_bar: 12 }, 'anvil');
  recipe('hellstone_pickaxe', 1, { hellstone_bar: 14 }, 'anvil');
  recipe('hellstone_helmet', 1, { hellstone_bar: 14 }, 'anvil');
  recipe('hellstone_chest', 1, { hellstone_bar: 18 }, 'anvil');
  recipe('hellstone_greaves', 1, { hellstone_bar: 16 }, 'anvil');
  recipe('hellwing_bow', 1, { hellstone_bar: 12 }, 'anvil');
  recipe('flame_arrow', 10, { arrow: 10, gel: 1 }, 'workbench');
  recipe('spark_staff', 1, { wood: 12, gel: 6, topaz: 2 }, 'anvil');
  recipe('water_bolt', 1, { wood: 10, bottle: 2, amethyst: 3 }, 'anvil');
  recipe('demon_scythe', 1, { demonite_bar: 12, shadow_scale: 6, ruby: 2 }, 'anvil');
  recipe('flamelash', 1, { hellstone_bar: 10, ruby: 2, gel: 10 }, 'anvil');
  recipe('slime_staff', 1, { gel: 30, wood: 10, amethyst: 1 }, 'anvil');
  recipe('cloud_in_a_bottle', 1, { cloud: 10, bottle: 1 }, 'anvil');
  recipe('lucky_horseshoe', 1, { gold_bar: 5, iron_bar: 3 }, 'anvil');
  recipe('hermes_boots', 1, { gold_bar: 4, silk: 5, gel: 5 }, 'anvil');
  recipe('band_of_regeneration', 1, { gold_bar: 3, silk: 8, life_crystal: 1 }, 'anvil');
  recipe('mana_flower', 1, { mana_crystal: 1, silk: 5, silver_bar: 3 }, 'anvil');
  recipe('warrior_emblem', 1, { gold_bar: 6, ruby: 2, silk: 6 }, 'anvil');
  recipe('anklet_of_the_wind', 1, { iron_bar: 4, silk: 4, cloud: 5 }, 'anvil');
  recipe('healing_potion', 1, { bottled_water: 1, mushroom: 2 }, 'alchemy');
  recipe('greater_healing_potion', 1, { bottled_water: 1, mushroom: 3, life_crystal: 1 }, 'alchemy');
  recipe('mana_potion', 1, { bottled_water: 1, star: 1 }, 'alchemy');
  recipe('greater_mana_potion', 1, { bottled_water: 1, star: 2, mana_crystal: 1 }, 'alchemy');
  recipe('ironskin_potion', 1, { bottled_water: 1, iron_bar: 1, mushroom: 1 }, 'alchemy');
  recipe('swiftness_potion', 1, { bottled_water: 1, gel: 2, cactus: 2 }, 'alchemy');
  recipe('night_owl_potion', 1, { bottled_water: 1, glowing_mushroom: 1, star: 1 }, 'alchemy');
  recipe('regeneration_potion', 1, { bottled_water: 1, mushroom: 2, gel: 2 }, 'alchemy');
  recipe('obsidian_skin_potion', 1, { bottled_water: 1, obsidian_brick: 1, ash: 2 }, 'alchemy');
  recipe('mining_potion', 1, { bottled_water: 1, iron_bar: 1, ash: 1 }, 'alchemy');
  recipe('alchemy_table', 1, { wood: 12, bottle: 3, silk: 4 }, 'workbench');
  recipe('hellforge', 1, { hellstone_bar: 4, stone: 20 }, 'workbench');
  recipe('king_slime_crown', 1, { gel: 40, gold_bar: 3, ruby: 1 }, 'altar');
  recipe('abeemination', 1, { bee_wax: 5, honey_potion: 1, gel: 20 }, 'altar');
  recipe('grappling_hook', 1, { iron_bar: 6, silk: 8, gel: 6 }, 'anvil');
  recipe('diamond_hook', 1, { diamond: 3, silk: 10, gold_bar: 4 }, 'anvil');
  recipe('angel_wings', 1, { cloud: 30, silk: 15, life_crystal: 1 }, 'anvil');
  recipe('demon_wings', 1, { shadow_scale: 20, silk: 15, demonite_bar: 8 }, 'anvil');
  recipe('obsidian_shield', 1, { obsidian_brick: 10, iron_bar: 5 }, 'anvil');
  recipe('magic_mirror', 1, { glass: 8, silver_bar: 5, diamond: 1 }, 'anvil');
  recipe('bee_bow', 1, { bee_wax: 8, gold_bar: 4, silk: 6 }, 'anvil');
  recipe('slime_gun', 1, { gel: 40, iron_bar: 6, topaz: 2 }, 'anvil');  recipe('tin_bar', 1, { tin_ore: 3 }, 'furnace');
  recipe('lead_bar', 1, { lead_ore: 3 }, 'furnace');
  recipe('tungsten_bar', 1, { tungsten_ore: 4 }, 'furnace');
  recipe('platinum_bar', 1, { platinum_ore: 4 }, 'furnace');
  recipe('crimtane_bar', 1, { crimtane_ore: 3, silk: 1 }, 'furnace');
  recipe('tin_broadsword', 1, { tin_bar: 8 }, 'anvil');
  recipe('lead_broadsword', 1, { lead_bar: 9 }, 'anvil');
  recipe('tungsten_broadsword', 1, { tungsten_bar: 10 }, 'anvil');
  recipe('platinum_broadsword', 1, { platinum_bar: 10 }, 'anvil');
  recipe('crimtane_sword', 1, { crimtane_bar: 10, silk: 3 }, 'anvil');
  recipe('molten_sword', 1, { hellstone_bar: 12 }, 'anvil');
  recipe('blade_of_grass', 1, { jungle_spore: 12, stinger: 8, gold_bar: 4 }, 'anvil');
  recipe('fiery_greatsword', 1, { hellstone_bar: 14, ruby: 3 }, 'anvil');
  recipe('lights_bane', 1, { demonite_bar: 10, silver_bar: 6, shadow_scale: 4 }, 'anvil');
  recipe('blood_butcherer', 1, { crimtane_bar: 12, silk: 4 }, 'anvil');
  recipe('excalibur', 1, { platinum_bar: 14, diamond: 3, silk: 8 }, 'anvil');
  recipe('nights_edge', 1, { blade_of_grass: 1, lights_bane: 1, blood_butcherer: 1, molten_sword: 1 }, 'anvil');
  recipe('true_nights_edge', 1, { nights_edge: 1, excalibur: 1, ruby: 5, life_crystal: 1 }, 'anvil');
  recipe('terragrim', 1, { true_nights_edge: 1, hellstone_bar: 20, diamond: 5 }, 'anvil');
  recipe('tin_bow', 1, { tin_bar: 7, wood: 5 }, 'anvil');
  recipe('lead_bow', 1, { lead_bar: 8, wood: 5 }, 'anvil');
  recipe('tungsten_bow', 1, { tungsten_bar: 9, wood: 6 }, 'anvil');
  recipe('platinum_bow', 1, { platinum_bar: 10, wood: 6 }, 'anvil');
  recipe('molten_bow', 1, { hellstone_bar: 12, wood: 8 }, 'anvil');
  recipe('amethyst_staff', 1, { amethyst: 4, wood: 8 }, 'anvil');
  recipe('topaz_staff', 1, { topaz: 4, wood: 8 }, 'anvil');
  recipe('ruby_staff', 1, { ruby: 4, wood: 10 }, 'anvil');
  recipe('diamond_staff', 1, { diamond: 4, wood: 10 }, 'anvil');
  recipe('emu_staff', 1, { emerald: 4, wood: 10 }, 'anvil');
  recipe('tin_helmet', 1, { tin_bar: 10 }, 'anvil');
  recipe('tin_chest', 1, { tin_bar: 14 }, 'anvil');
  recipe('tin_greaves', 1, { tin_bar: 12 }, 'anvil');
  recipe('lead_helmet', 1, { lead_bar: 12 }, 'anvil');
  recipe('lead_chest', 1, { lead_bar: 16 }, 'anvil');
  recipe('lead_greaves', 1, { lead_bar: 14 }, 'anvil');
  recipe('tungsten_helmet', 1, { tungsten_bar: 12 }, 'anvil');
  recipe('tungsten_chest', 1, { tungsten_bar: 16 }, 'anvil');
  recipe('tungsten_greaves', 1, { tungsten_bar: 14 }, 'anvil');
  recipe('platinum_helmet', 1, { platinum_bar: 12 }, 'anvil');
  recipe('platinum_chest', 1, { platinum_bar: 16 }, 'anvil');
  recipe('platinum_greaves', 1, { platinum_bar: 14 }, 'anvil');
  recipe('crimtane_helmet', 1, { crimtane_bar: 12, silk: 4 }, 'anvil');
  recipe('crimtane_chest', 1, { crimtane_bar: 16, silk: 6 }, 'anvil');
  recipe('crimtane_greaves', 1, { crimtane_bar: 14, silk: 5 }, 'anvil');
  recipe('molten_helmet', 1, { hellstone_bar: 14 }, 'anvil');
  recipe('molten_chest', 1, { hellstone_bar: 18 }, 'anvil');
  recipe('molten_greaves', 1, { hellstone_bar: 16 }, 'anvil');
  recipe('jungle_helmet', 1, { jungle_spore: 10, stinger: 6 }, 'anvil');
  recipe('jungle_chest', 1, { jungle_spore: 14, stinger: 8 }, 'anvil');
  recipe('jungle_greaves', 1, { jungle_spore: 12, stinger: 7 }, 'anvil');
  recipe('healing_potion_small', 2, { bottled_water: 1, mushroom: 1 }, 'alchemy');
  recipe('mana_potion_small', 2, { bottled_water: 1, star: 1 }, 'alchemy');
  recipe('recall_potion', 1, { bottled_water: 1, glass: 2, star: 1 }, 'alchemy');
  recipe('flipper', 1, { gel: 20, silver_bar: 4, silk: 5 }, 'anvil');
  recipe('frog_leg', 1, { gel: 15, gold_bar: 3, silk: 6 }, 'anvil');
  recipe('magma_stone', 1, { hellstone_bar: 6, obsidian_brick: 8, ruby: 2 }, 'anvil');
  recipe('depth_meter', 1, { copper_bar: 4, glass: 3, silver_bar: 2 }, 'anvil');
  recipe('shackle', 1, { iron_bar: 6, bone: 4 }, 'anvil');
  recipe('obsidian_horseshoe', 1, { obsidian_brick: 8, gold_bar: 3 }, 'anvil');
  recipe('gold_key', 1, { gold_bar: 2, bone: 3 }, 'workbench');  recipe('suspicious_eye', 1, { lens: 6, demon_eye: 1 }, 'altar');
  recipe('worm_food_bait', 1, { worm_food: 15, shadow_scale: 2 }, 'altar');
  recipe('clothier_voodoo', 1, { bone: 20, silk: 5, ebonstone_brick: 3 }, 'altar');

  T.CRAFT_STATION_NAMES = {
    workbench: '工作台', furnace: '熔炉', anvil: '铁砧', altar: '恶魔祭坛',
    alchemy: '炼药桌', hellforge: '地狱熔炉', null: '徒手'
  };

  T.canCraft = function (rec, has, stations) {
    if (rec.station && !stations[rec.station]) return false;
    for (const id in rec.ing) {
      if ((has[id] || 0) < rec.ing[id]) return false;
    }
    return true;
  };
})();
