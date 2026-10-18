(function () {
  const T = window.T;

  const TILE = T.T = {
    AIR: 0, DIRT: 1, GRASS: 2, STONE: 3, SAND: 4, SANDSTONE: 5, CLAY: 6, SNOW: 7, ICE: 8,
    MUD: 9, JUNGLE_GRASS: 10, ASH: 11, EBONSTONE: 12, CORRUPT_GRASS: 13, CACTUS: 14,
    WOOD: 15, TREETRUNK: 16, LEAVES: 17, CORRUPT_LEAVES: 18, JUNGLE_LEAVES: 19,
    PLANT: 20, FLOWER: 21, MUSHROOM: 22, VINE: 23, COBWEB: 24, POT: 25,
    TORCH: 26, CHEST: 27, WORKBENCH: 28, FURNACE: 29, ANVIL: 30, DOOR: 31, DOOR_OPEN: 32,
    TABLE: 33, CHAIR: 34, PLATFORM: 35, ROPE: 36, GLASS: 37, BRICK_STONE: 38, BRICK_WOOD: 39,
    BRICK_DUNGEON: 40, BRICK_OBSIDIAN: 41, BRICK_EBON: 42, SAPLING: 43,
    ORE_COPPER: 44, ORE_IRON: 45, ORE_SILVER: 46, ORE_GOLD: 47, ORE_DEMONITE: 48,
    ORE_METEOR: 49, ORE_HELL: 50, GEM_AMETHYST: 51, GEM_TOPAZ: 52, GEM_RUBY: 53,
    GEM_DIAMOND: 54, LIFE_CRYSTAL: 55, MANA_CRYSTAL: 56, ALTAR: 57, ALCHEMY_TABLE: 58,
    SPIKES: 59, WATER: 60, LAVA: 61, CLOUD: 62, HELLFORGE: 63,
    ORE_TIN: 64, ORE_LEAD: 65, ORE_TUNGSTEN: 66, ORE_PLATINUM: 67, ORE_CRIMTANE: 68,
    GEM_EMERALD: 69, GEM_SAPPHIRE: 70, GEM_AMBER: 71
  };

  T.TILE = TILE;
  const TILES = T.TILES = [];
  function t(id, def) {
    if (TILES[id]) throw new Error('duplicate tile id ' + id);
    def.id = id;
    TILES[id] = def;
  }

  t(TILE.AIR, { name: '空气', solid: false, empty: true, transparent: true, col: '#000000' });
  t(TILE.DIRT, {
    name: '泥土块', solid: true, hard: 0.16, tool: 'pick', drop: 'dirt', col: '#8a5a35',
    pal: ['#8a5a35', '#a07147', '#6d4527', '#5a3820'], art: 'dirt'
  });
  t(TILE.GRASS, {
    name: '草地', solid: true, hard: 0.16, tool: 'pick', drop: 'dirt', col: '#4f9c36',
    pal: ['#8a5a35', '#69bf4d', '#3d7a2a', '#4f9c36'], art: 'grass', grass: true
  });
  t(TILE.STONE, {
    name: '石块', solid: true, hard: 0.32, tool: 'pick', drop: 'stone', col: '#71777d',
    pal: ['#71777d', '#8b9299', '#565c62', '#474c52'], art: 'stone'
  });
  t(TILE.SAND, {
    name: '沙块', solid: true, hard: 0.14, tool: 'pick', drop: 'sand', col: '#dfc684',
    pal: ['#dfc684', '#f0ddaa', '#c2a765', '#ab9154'], art: 'sand'
  });
  t(TILE.SANDSTONE, {
    name: '砂岩块', solid: true, hard: 0.4, tool: 'pick', drop: 'sandstone', col: '#c6a86b',
    pal: ['#c6a86b', '#ddc188', '#a4884f', '#8b7242'], art: 'sandstone'
  });
  t(TILE.CLAY, {
    name: '黏土块', solid: true, hard: 0.22, tool: 'pick', drop: 'clay', col: '#a0644b',
    pal: ['#a0644b', '#b97a5c', '#824e39', '#6b3f2d'], art: 'clay'
  });
  t(TILE.SNOW, {
    name: '雪块', solid: true, hard: 0.1, tool: 'pick', drop: 'snow', col: '#e8f1f6',
    pal: ['#e8f1f6', '#ffffff', '#c7dbe7', '#afc6d5'], art: 'snow'
  });
  t(TILE.ICE, {
    name: '冰块', solid: true, hard: 0.3, tool: 'pick', drop: 'ice', col: '#a7cfe0',
    pal: ['#a7cfe0', '#ccebf5', '#7faec4', '#6b9ab0'], art: 'ice'
  });
  t(TILE.MUD, {
    name: '淤泥块', solid: true, hard: 0.18, tool: 'pick', drop: 'mud', col: '#6b4f35',
    pal: ['#6b4f35', '#7d5d3f', '#543d28', '#44311f'], art: 'mud'
  });
  t(TILE.JUNGLE_GRASS, {
    name: '丛林草', solid: true, hard: 0.2, tool: 'pick', drop: 'mud', col: '#4a9a3d',
    pal: ['#6b4f35', '#79c24d', '#33701f', '#4a9a3d'], art: 'junglegrass', grass: true
  });
  t(TILE.ASH, {
    name: '灰烬块', solid: true, hard: 0.4, tool: 'pick', drop: 'ash', col: '#4b4140',
    pal: ['#4b4140', '#5d5150', '#382f2f', '#2a2323'], art: 'ash'
  });
  t(TILE.EBONSTONE, {
    name: '黑檀石块', solid: true, hard: 0.7, tool: 'pick', pickPower: 45, drop: 'ebonstone', col: '#4a3c5e',
    pal: ['#4a3c5e', '#5e4e75', '#382c49', '#2c2139'], art: 'ebonstone'
  });
  t(TILE.CORRUPT_GRASS, {
    name: '腐化草地', solid: true, hard: 0.3, tool: 'pick', drop: 'ebonstone', col: '#6a4f86',
    pal: ['#4a3c5e', '#7d5fa0', '#4c3565', '#6a4f86'], art: 'corruptgrass', grass: true
  });
  t(TILE.CACTUS, {
    name: '仙人掌', solid: true, hard: 0.25, tool: 'axe', drop: 'cactus', col: '#4f8a44',
    pal: ['#4f8a44', '#6aa85e', '#3b6e32', '#2d5526'], art: 'cactus'
  });
  t(TILE.WOOD, {
    name: '木材块', solid: true, hard: 0.35, tool: 'axe', drop: 'wood', col: '#8a5a2b',
    pal: ['#8a5a2b', '#a9743c', '#6d431c', '#583514'], art: 'wood'
  });
  t(TILE.TREETRUNK, {
    name: '树干', solid: false, hard: 0.45, tool: 'axe', drop: 'wood', col: '#7a4c24', transparent: true,
    pal: ['#7a4c24', '#966133', '#5d3818', '#4a2b10'], art: 'trunk', tree: true
  });
  t(TILE.LEAVES, {
    name: '树叶', solid: false, hard: 0.05, tool: 'axe', drop: null, col: '#357a33',
    pal: ['#357a33', '#4c9c45', '#235522', '#1a441a'], art: 'leaves', canopy: true, transparent: true
  });
  t(TILE.CORRUPT_LEAVES, {
    name: '腐化树叶', solid: false, hard: 0.05, tool: 'axe', drop: null, col: '#5b3f74',
    pal: ['#5b3f74', '#755592', '#412c55', '#33203f'], art: 'leaves', canopy: true, transparent: true
  });
  t(TILE.JUNGLE_LEAVES, {
    name: '丛林树叶', solid: false, hard: 0.05, tool: 'axe', drop: null, col: '#2f7a2a',
    pal: ['#2f7a2a', '#469b3c', '#1e561c', '#153f14'], art: 'leaves', canopy: true, transparent: true
  });
  t(TILE.PLANT, {
    name: '杂草', solid: false, hard: 0.03, drop: null, col: '#4c9c3a', transparent: true,
    pal: ['#4c9c3a', '#68b84c', '#356f27'], art: 'plant', deco: true
  });
  t(TILE.FLOWER, {
    name: '野花', solid: false, hard: 0.03, drop: null, col: '#c4a6d8', transparent: true,
    pal: ['#4c9c3a', '#d8b8ea', '#f0dffa', '#b48cd0'], art: 'flower', deco: true
  });
  t(TILE.MUSHROOM, {
    name: '蘑菇', solid: false, hard: 0.03, drop: 'mushroom', col: '#d8b14a', transparent: true,
    pal: ['#d8b14a', '#f0d27a', '#a87f2e', '#7d5c21'], art: 'mushroom', deco: true
  });
  t(TILE.VINE, {
    name: '藤蔓', solid: false, hard: 0.03, drop: 'vine', col: '#3c7a2f', transparent: true,
    pal: ['#3c7a2f', '#548f41', '#2a5a21'], art: 'vine', deco: true
  });
  t(TILE.COBWEB, {
    name: '蛛网', solid: false, hard: 0.04, drop: 'cobweb', col: '#d5d5df', transparent: true,
    pal: ['#d5d5df', '#f0f0f6', '#a8a8b6'], art: 'cobweb', slow: 0.45
  });
  t(TILE.POT, {
    name: '罐子', solid: false, hard: 0.08, drop: null, col: '#a9744a', transparent: true,
    pal: ['#a9744a', '#c69363', '#7c4f2d'], art: 'pot', furniture: true, lootable: true
  });
  t(TILE.TORCH, {
    name: '火把', solid: false, hard: 0.02, drop: 'torch', col: '#ffb347', transparent: true,
    pal: ['#7a4c24', '#ffcc55', '#ff7a1f'], art: 'torch', furniture: true, light: [255, 190, 110, 8.5]
  });
  t(TILE.CHEST, {
    name: '宝箱', solid: false, hard: 0.2, drop: 'chest', col: '#b07b3a', transparent: true,
    pal: ['#9a6a2f', '#d1a45a', '#6d4820', '#f0c86a'], art: 'chest', furniture: true, interact: 'chest'
  });
  t(TILE.WORKBENCH, {
    name: '工作台', solid: false, hard: 0.2, drop: 'workbench', col: '#b08045', transparent: true,
    pal: ['#8a5a2b', '#b78a52', '#633d1b'], art: 'workbench', furniture: true, station: 'workbench'
  });
  t(TILE.FURNACE, {
    name: '熔炉', solid: false, hard: 0.5, drop: 'furnace', col: '#8a6a52', transparent: true,
    pal: ['#6f6f77', '#a0a0a8', '#ff8a2a', '#4a4a52'], art: 'furnace', furniture: true,
    station: 'furnace', light: [255, 140, 60, 5]
  });
  t(TILE.ANVIL, {
    name: '铁砧', solid: false, hard: 0.5, drop: 'anvil', col: '#7d7d88', transparent: true,
    pal: ['#6b6b76', '#9a9aa6', '#4c4c55'], art: 'anvil', furniture: true, station: 'anvil'
  });
  t(TILE.DOOR, {
    name: '木门', solid: true, hard: 0.25, drop: 'door', col: '#8a5a2b',
    pal: ['#8a5a2b', '#a9743c', '#633d1b', '#d1a45a'], art: 'door', furniture: true, interact: 'door'
  });
  t(TILE.DOOR_OPEN, {
    name: '敞开的木门', solid: false, hard: 0.25, drop: 'door', col: '#8a5a2b', transparent: true,
    pal: ['#8a5a2b', '#a9743c', '#633d1b', '#d1a45a'], art: 'dooropen', furniture: true, interact: 'door'
  });
  t(TILE.TABLE, {
    name: '木桌', solid: false, hard: 0.2, drop: 'table', col: '#9a6a33', transparent: true,
    pal: ['#8a5a2b', '#a9743c', '#633d1b'], art: 'table', furniture: true
  });
  t(TILE.CHAIR, {
    name: '木椅', solid: false, hard: 0.2, drop: 'chair', col: '#9a6a33', transparent: true,
    pal: ['#8a5a2b', '#a9743c', '#633d1b'], art: 'chair', furniture: true
  });
  t(TILE.PLATFORM, {
    name: '木平台', solid: false, platform: true, hard: 0.15, drop: 'platform', col: '#a9743c', transparent: true,
    pal: ['#8a5a2b', '#b78a52', '#633d1b'], art: 'platform', furniture: true
  });
  t(TILE.ROPE, {
    name: '绳子', solid: false, climb: true, hard: 0.05, drop: 'rope', col: '#c8a86b', transparent: true,
    pal: ['#c8a86b', '#e3ca93', '#a0834b'], art: 'rope', furniture: true
  });
  t(TILE.GLASS, {
    name: '玻璃', solid: true, hard: 0.3, drop: 'glass', col: '#a9d4e0', transparent: true,
    pal: ['#a9d4e0', '#d4f0f7', '#7fadba'], art: 'glass'
  });
  t(TILE.BRICK_STONE, {
    name: '石砖', solid: true, hard: 0.45, drop: 'stone_brick', col: '#6f747b',
    pal: ['#6f747b', '#8a9098', '#51565c', '#3f4348'], art: 'brick_stone'
  });
  t(TILE.BRICK_WOOD, {
    name: '木砖', solid: true, hard: 0.35, drop: 'wood_brick', col: '#94683a',
    pal: ['#94683a', '#b2834f', '#6e4a24', '#5a3a1a'], art: 'brick_wood'
  });
  t(TILE.BRICK_DUNGEON, {
    name: '地牢砖', solid: true, hard: 1.1, tool: 'pick', pickPower: 65, drop: null, col: '#3c4a6b',
    pal: ['#3c4a6b', '#4f5f84', '#2c3750', '#222a3d'], art: 'brick_dungeon'
  });
  t(TILE.BRICK_OBSIDIAN, {
    name: '黑曜石砖', solid: true, hard: 1.4, tool: 'pick', pickPower: 65, drop: 'obsidian_brick', col: '#2e2438',
    pal: ['#2e2438', '#4a3a5a', '#1d1624', '#ff7a1f'], art: 'brick_obsidian'
  });
  t(TILE.BRICK_EBON, {
    name: '黑檀砖', solid: true, hard: 1.0, tool: 'pick', pickPower: 55, drop: 'ebonstone_brick', col: '#443356',
    pal: ['#443356', '#5d4874', '#332446', '#241a33'], art: 'brick_ebon'
  });
  t(TILE.SAPLING, {
    name: '树苗', solid: false, hard: 0.04, drop: 'acorn', col: '#6aa84f', transparent: true,
    pal: ['#6aa84f', '#8cc96b', '#4a7f36'], art: 'sapling', deco: true
  });
  t(TILE.ORE_COPPER, {
    name: '铜矿', solid: true, hard: 0.5, tool: 'pick', drop: 'copper_ore', col: '#b87333',
    pal: ['#71777d', '#c47a45', '#8a9299', '#e09a63'], art: 'ore'
  });
  t(TILE.ORE_IRON, {
    name: '铁矿', solid: true, hard: 0.65, tool: 'pick', drop: 'iron_ore', col: '#b7a68a',
    pal: ['#71777d', '#c3b29a', '#8a9299', '#e0d0b8'], art: 'ore'
  });
  t(TILE.ORE_SILVER, {
    name: '银矿', solid: true, hard: 0.8, tool: 'pick', drop: 'silver_ore', col: '#cfd8de',
    pal: ['#71777d', '#d9e2e8', '#8a9299', '#f0f7fa'], art: 'ore'
  });
  t(TILE.ORE_GOLD, {
    name: '金矿', solid: true, hard: 0.95, tool: 'pick', drop: 'gold_ore', col: '#e0b83c',
    pal: ['#71777d', '#e8c14a', '#8a9299', '#ffe27a'], art: 'ore'
  });
  t(TILE.ORE_DEMONITE, {
    name: '恶魔矿', solid: true, hard: 1.3, tool: 'pick', pickPower: 55, drop: 'demonite_ore', col: '#6d4f9e',
    pal: ['#463a5c', '#7d5cb0', '#5a4a75', '#a888e0'], art: 'ore'
  });
  t(TILE.ORE_METEOR, {
    name: '陨石矿', solid: true, hard: 1.2, tool: 'pick', pickPower: 50, drop: 'meteorite_ore', col: '#9b7c6a',
    pal: ['#7a6258', '#b0907c', '#5d4a42', '#6f8fa0'], art: 'ore', light: [255, 120, 80, 2]
  });
  t(TILE.ORE_HELL, {
    name: '狱石矿', solid: true, hard: 1.8, tool: 'pick', pickPower: 75, drop: 'hellstone_ore', col: '#8a3a26',
    pal: ['#4b4140', '#a84a2a', '#5d5150', '#ff8a3a'], art: 'ore', light: [255, 90, 40, 2.5], fire: true
  });
  t(TILE.GEM_AMETHYST, {
    name: '紫水晶矿', solid: true, hard: 1.0, tool: 'pick', drop: 'amethyst', col: '#9a6fd0',
    pal: ['#71777d', '#a878e0', '#8a9299', '#d0b0ff'], art: 'gem'
  });
  t(TILE.GEM_TOPAZ, {
    name: '黄玉矿', solid: true, hard: 1.0, tool: 'pick', drop: 'topaz', col: '#e0b050',
    pal: ['#71777d', '#f0c05a', '#8a9299', '#ffe08a'], art: 'gem'
  });
  t(TILE.GEM_RUBY, {
    name: '红玉矿', solid: true, hard: 1.15, tool: 'pick', drop: 'ruby', col: '#d04444',
    pal: ['#71777d', '#e05050', '#8a9299', '#ff9090'], art: 'gem'
  });
  t(TILE.GEM_DIAMOND, {
    name: '钻石矿', solid: true, hard: 1.3, tool: 'pick', drop: 'diamond', col: '#8ce0e0',
    pal: ['#71777d', '#a8f0f0', '#8a9299', '#ffffff'], art: 'gem'
  });
  t(TILE.LIFE_CRYSTAL, {
    name: '生命水晶', solid: false, hard: 0.3, tool: 'pick', drop: 'life_crystal', col: '#e0608a', transparent: true,
    pal: ['#e0608a', '#ff9ab8', '#a83c62', '#ffd0e0'], art: 'life_crystal', furniture: true, light: [255, 110, 160, 3.6]
  });
  t(TILE.MANA_CRYSTAL, {
    name: '魔力水晶', solid: false, hard: 0.3, tool: 'pick', drop: 'mana_crystal', col: '#6a8ae0', transparent: true,
    pal: ['#6a8ae0', '#9ab8ff', '#4560b0', '#d0e0ff'], art: 'mana_crystal', furniture: true, light: [110, 150, 255, 4]
  });
  t(TILE.ALTAR, {
    name: '恶魔祭坛', solid: false, hard: 1.2, tool: 'hammer', drop: 'altar', col: '#5a3a6a', transparent: true,
    pal: ['#3c2a4a', '#6a4a80', '#2a1c34', '#b060d0'], art: 'altar', furniture: true, station: 'altar', light: [160, 80, 220, 4]
  });
  t(TILE.ALCHEMY_TABLE, {
    name: '炼药桌', solid: false, hard: 0.3, drop: 'alchemy_table', col: '#8a6a9a', transparent: true,
    pal: ['#6b4a56', '#a07a8a', '#4a303a', '#8ce0b0'], art: 'alchemy', furniture: true, station: 'alchemy'
  });
  t(TILE.HELLFORGE, {
    name: '地狱熔炉', solid: false, hard: 1.0, drop: 'hellforge', col: '#8a3a26', transparent: true,
    pal: ['#3a2a28', '#5a3a34', '#ff6a1a', '#ffb04a'], art: 'hellforge', furniture: true,
    station: 'hellforge', light: [255, 100, 40, 6]
  });
  t(TILE.SPIKES, {
    name: '尖刺', solid: false, hard: 0.5, tool: 'pick', drop: 'spikes', col: '#9a9aa6', transparent: true,
    pal: ['#7d7d88', '#b8b8c4', '#5a5a64'], art: 'spikes', furniture: true, damage: 20
  });
  t(TILE.WATER, {
    name: '水', solid: false, liquid: 'water', hard: 0, transparent: true, col: '#3a6fc4',
    pal: ['#3a6fc4', '#6aa0e8', '#2a4f94'], art: 'water'
  });
  t(TILE.LAVA, {
    name: '岩浆', solid: false, liquid: 'lava', hard: 0, transparent: false, col: '#e0601a',
    pal: ['#e0601a', '#ffb03a', '#a03a0a'], art: 'lava', light: [255, 110, 30, 7], damage: 40
  });
  t(TILE.CLOUD, {
    name: '云块', solid: true, hard: 0.2, tool: 'pick', drop: 'cloud', col: '#e8f0fa',
    pal: ['#e8f0fa', '#ffffff', '#c4d2e2', '#a8b8cc'], art: 'cloud'
  });

  t(TILE.ORE_TIN, {
    name: '锡矿', solid: true, hard: 0.52, tool: 'pick', drop: 'tin_ore', col: '#c8d0d8',
    pal: ['#71777d', '#d4dce4', '#8a9299', '#eef4fa'], art: 'ore'
  });
  t(TILE.ORE_LEAD, {
    name: '铅矿', solid: true, hard: 0.6, tool: 'pick', drop: 'lead_ore', col: '#9aa8b8',
    pal: ['#71777d', '#a8b6c6', '#8a9299', '#c8d4e2'], art: 'ore'
  });
  t(TILE.ORE_TUNGSTEN, {
    name: '钨矿', solid: true, hard: 0.78, tool: 'pick', pickPower: 45, drop: 'tungsten_ore', col: '#a8b0c8',
    pal: ['#71777d', '#b4bcd4', '#8a9299', '#d8e0f4'], art: 'ore'
  });
  t(TILE.ORE_PLATINUM, {
    name: '铂金矿', solid: true, hard: 0.9, tool: 'pick', pickPower: 50, drop: 'platinum_ore', col: '#e0e8f0',
    pal: ['#71777d', '#eef4fa', '#8a9299', '#ffffff'], art: 'ore'
  });
  t(TILE.ORE_CRIMTANE, {
    name: '血金矿', solid: true, hard: 1.1, tool: 'pick', pickPower: 55, drop: 'crimtane_ore', col: '#c84060',
    pal: ['#5a2a3a', '#d85070', '#7a3a4a', '#f07090'], art: 'ore', light: [255, 80, 110, 1.8]
  });
  t(TILE.GEM_EMERALD, {
    name: '翡翠矿', solid: true, hard: 1.0, tool: 'pick', drop: 'emerald', col: '#5ae0a0',
    pal: ['#71777d', '#5ae0a0', '#8a9299', '#a8ffd8'], art: 'gem'
  });
  t(TILE.GEM_SAPPHIRE, {
    name: '蓝宝石矿', solid: true, hard: 1.05, tool: 'pick', drop: 'sapphire', col: '#5080e8',
    pal: ['#71777d', '#5080e8', '#8a9299', '#a8c8ff'], art: 'gem'
  });
  t(TILE.GEM_AMBER, {
    name: '琥珀矿', solid: true, hard: 0.85, tool: 'pick', drop: 'amber', col: '#e8a040',
    pal: ['#71777d', '#f0b050', '#8a9299', '#ffd890'], art: 'gem'
  });
  const WALLS = T.WALLS = [
    null,
    { name: '土墙', col: '#5c3c24', pal: ['#5c3c24', '#6e4a2c', '#472d1a'], art: 'dirt' },
    { name: '石墙', col: '#4c5157', pal: ['#4c5157', '#5b6168', '#3b4045'], art: 'stone' },
    { name: '木墙', col: '#6a4724', pal: ['#6a4724', '#7d562e', '#523417'], art: 'wood' },
    { name: '地牢砖墙', col: '#2c3750', pal: ['#2c3750', '#374563', '#20283a'], art: 'brick' },
    { name: '黑曜石砖墙', col: '#211a28', pal: ['#211a28', '#30263a', '#17121c'], art: 'brick' },
    { name: '黑檀石墙', col: '#362a46', pal: ['#362a46', '#443456', '#291f36'], art: 'stone' },
    { name: '丛林墙', col: '#42382a', pal: ['#42382a', '#4f4332', '#332b20'], art: 'dirt' },
    { name: '雪墙', col: '#9fb4c4', pal: ['#9fb4c4', '#b4c8d6', '#889cac'], art: 'stone' },
    { name: '地狱墙', col: '#332626', pal: ['#332626', '#413030', '#251b1b'], art: 'stone' },
    { name: '玻璃墙', col: '#7fa8b4', pal: ['#7fa8b4', '#95bcc8', '#6b919c'], art: 'glass' }
  ];
  T.WALL_IDS = { DIRT: 1, STONE: 2, WOOD: 3, DUNGEON: 4, OBSIDIAN: 5, EBONSTONE: 6, JUNGLE: 7, SNOW: 8, HELL: 9, GLASS: 10 };

  T.tileDef = function (id) { return TILES[id] || TILES[0]; };

  T.isSolid = function (id) {
    const d = TILES[id];
    return !!(d && d.solid);
  };
  T.isPlatform = function (id) {
    const d = TILES[id];
    return !!(d && d.platform);
  };
  T.isLiquid = function (id) {
    const d = TILES[id];
    return !!(d && d.liquid);
  };
  T.isOpaque = function (id) {
    if (id === 0) return false;
    const d = TILES[id];
    if (!d) return false;
    if (d.liquid) return false;
    if (d.transparent) return false;
    return true;
  };
  T.blocksLight = function (id) {
    const d = TILES[id];
    if (!d) return false;
    return !!d.solid || !!d.opaque === false && !!d.canopy;
  };
  T.isFurniture = function (id) {
    const d = TILES[id];
    return !!(d && d.furniture);
  };
  T.stationOf = function (id) {
    const d = TILES[id];
    return d ? d.station : null;
  };
  T.isTree = function (id) {
    const d = TILES[id];
    return !!(d && d.tree);
  };
  T.isDeco = function (id) {
    const d = TILES[id];
    return !!(d && (d.deco || d.canopy));
  };
  T.isGrass = function (id) {
    const d = TILES[id];
    return !!(d && d.grass);
  };

  T.tileBreakInfo = function (id) {
    const d = TILES[id];
    if (!d) return null;
    return { hard: d.hard, tool: d.tool, drop: d.drop };
  };
})();
