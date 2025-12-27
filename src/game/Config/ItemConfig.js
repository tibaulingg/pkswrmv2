export const ItemConfig = {
	rattata_tail: {
		id: 'rattata_tail',
		name: 'Queue de Rattata',
		category: 'misc',
		rarity: 'common',
		iconImage: '/sprites/items/rattata_tail.png',
		description: 'Peut être vendue',
	},
    basic_chest: {
		id: 'basic_chest',
		name: 'Coffre en Bronze',
		category: 'chest',
		rarity: 'rare',
		icon: '',
		iconImage: '/sprites/items/basic_chest.png',
		description: 'Coffre en Bronze, peut contenir des objets',
		lootTable: [
			{ itemId: 'golden_apple', chance: 0.7 },
			{ itemId: 'mystic_water', chance: 0.3 },
		],
	},
	rare_chest: {
		id: 'rare_chest',
		name: 'Coffre en Argent',
		category: 'chest',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/rare_chest.png',
		description: 'Coffre en Argent, peut contenir des objets',
		lootTable: [
			{ itemId: 'golden_apple', chance: 0.7 },
			{ itemId: 'mystic_water', chance: 0.3 },
		],
	},
	epic_chest: {
		id: 'epic_chest',
		name: 'Coffre en Or',
		category: 'chest',
		rarity: 'legendary',
		icon: '',
		iconImage: '/sprites/items/epic_chest.png',
		description: 'Coffre en Or, peut contenir des objets',
		lootTable: [
			{ itemId: 'golden_apple', chance: 0.7 },
			{ itemId: 'mystic_water', chance: 0.3 },
		],
	},
	legendary_chest: {
		id: 'legendary_chest',
		name: 'Coffre Légendaire',
		category: 'chest',
		rarity: 'legendary',
		icon: '',
		iconImage: '/sprites/items/legendary_chest.png',
		description: 'Coffre Légendaire, peut contenir des objets',
		lootTable: [
			{ itemId: 'golden_apple', chance: 0.7 },
			{ itemId: 'mystic_water', chance: 0.3 },
		],
	},
	apple: {
		id: 'apple',
		name: 'Pomme',
		category: 'consumable',
		rarity: 'common',
		iconImage: '/sprites/items/apple.png',
		description: 'Restaure 50 HP',
		effect: {
			type: 'heal',
			value: 50
		}
	},
	golden_apple: {
		id: 'golden_apple',
		name: 'Pomme Dorée',
		category: 'consumable',
		rarity: 'rare',
		iconImage: '/sprites/items/golden_apple.png',
		description: 'Restaure 200 HP',
		effect: {
			type: 'heal',
			value: 200
		}
	},
	mystic_water: {
		id: 'mystic_water',
		name: 'Eau Mystique',
		category: 'equipable',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente les dégâts d\'eau de 10%',
		dropScale: 0.5,
		effect: {
			type: 'waterDamageBoost',
			value: 0.1
		}
	},
	fire_stone: {
		id: 'fire_stone',
		name: 'Pierre de Feu',
		category: 'equipable',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente les dégâts de feu de 15%',
		effect: {
			type: 'fireDamageBoost',
			value: 0.15
		}
	},
	leaf_stone: {
		id: 'leaf_stone',
		name: 'Pierre Plante',
		category: 'equipable',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente les dégâts de plante de 15%',
		effect: {
			type: 'grassDamageBoost',
			value: 0.15
		}
	},
	thunder_stone: {
		id: 'thunder_stone',
		name: 'Pierre Foudre',
		category: 'equipable',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente les dégâts électriques de 15%',
		effect: {
			type: 'electricDamageBoost',
			value: 0.15
		}
	},
	power_bracelet: {
		id: 'power_bracelet',
		name: 'Bracelet de Force',
		category: 'equipable',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente les dégâts de 20%',
		effect: {
			type: 'damageBoost',
			value: 0.20
		}
	},
	speed_boots: {
		id: 'speed_boots',
		name: 'Bottes de Vitesse',
		category: 'equipable',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente la vitesse de 25%',
		effect: {
			type: 'speedBoost',
			value: 0.25
		}
	},
	vitality_amulet: {
		id: 'vitality_amulet',
		name: 'Amulette de Vitalité',
		category: 'equipable',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente les PV max de 30%',
		effect: {
			type: 'hpBoost',
			value: 0.30
		}
	},
	crit_charm: {
		id: 'crit_charm',
		name: 'Charme Critique',
		category: 'equipable',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente les chances de critique de 10%',
		effect: {
			type: 'critChanceBoost',
			value: 0.10
		}
	},
	attack_speed_ring: {
		id: 'attack_speed_ring',
		name: 'Anneau de Vitesse',
		category: 'equipable',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente la vitesse d\'attaque de 30%',
		effect: {
			type: 'attackSpeedBoost',
			value: 0.30
		}
	},
	range_scope: {
		id: 'range_scope',
		name: 'Lunette de Portée',
		category: 'equipable',
		rarity: 'epic',
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente la portée de 40%',
		effect: {
			type: 'rangeBoost',
			value: 0.40
		}
	},
	egg_common: {
		id: 'egg_common',
		name: 'Oeuf Commun',
		category: 'egg',
		iconImage: '/sprites/items/egg_common.png',
		description: 'Un oeuf commun',
		rarity: 'common',
		requiredKills: 100,
		possiblePokemon: ['rattata', 'pidgey'],
	},
	egg_rare: {
		id: 'egg_rare',
		name: 'Oeuf Rare',
		category: 'egg',
		iconImage: '/sprites/items/egg_rare.png',
		description: 'Un oeuf rare',
		rarity: 'rare',
		requiredKills: 250,
		possiblePokemon: ['wooper'],
	},
	egg_epic: {
		id: 'egg_epic',
		name: 'Oeuf Épique',
		category: 'egg',
		iconImage: '/sprites/items/egg_epic.png',
		description: 'Un oeuf épique',
		rarity: 'epic',
		requiredKills: 500,
		possiblePokemon: ['kecleon', 'quagsire', 'ditto', 'chansey'],
	},
	egg_legendary: {
		id: 'egg_legendary',
		name: 'Oeuf Légendaire',
		category: 'egg',
		iconImage: '/sprites/items/egg_legendary.png',
		description: 'Un oeuf légendaire',
		rarity: 'legendary',
		requiredKills: 1000,
		possiblePokemon: ['garchomp'],
	}
};

export function getItemConfig(itemId) {
	return ItemConfig[itemId] || null;
}

export function getItemsByCategory(category) {
	return Object.values(ItemConfig).filter(item => item.category === category);
}

export function getAllCategories() {
	return ['consumable', 'equipable', 'consumables', 'relics', 'misc'];
}

export function getCategoryName(category) {
	const names = {
		consumable: 'Consommables',
		equipable: 'Équipables',
		relic: 'Reliques',
		relics: 'Reliques',
		misc: 'Divers',
		chest: 'Coffres',
		egg: 'Oeufs'
	};
	return names[category] || category;
}

