export const ItemConfig = {
	key: {
		id: 'key',
		name: 'Clé',
		category: 'relic',
		iconImage: '/sprites/items/key.png',
		description: 'Permet d\'ouvrir des coffres',
	},
	rattata_tail: {
		id: 'rattata_tail',
		name: 'Queue de Rattata',
		category: 'misc',
		iconImage: '/sprites/items/rattata_tail.png',
		description: 'Peut être vendue',
	},
    bronze_chest: {
		id: 'bronze_chest',
		name: 'Coffre en Bronze',
		category: 'chest',
		icon: '',
		iconImage: '/sprites/items/bronze_chest.png',
		description: 'Coffre en Bronze, peut contenir des objets',
	},
	apple: {
		id: 'apple',
		name: 'Pomme',
		category: 'consumable',
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
		icon: '',
		iconImage: '/sprites/items/mystic_water.png',
		description: 'Augmente les dégâts d\'eau de 10%',
		dropScale: 0.5,
		effect: {
			type: 'waterDamageBoost',
			value: 0.1
		}
	},
	egg_common: {
		id: 'egg_common',
		name: 'Oeuf Commun',
		category: 'egg',
		iconImage: '/sprites/items/egg_common.png',
		description: 'Peut éclore en Rattata ou Pidgey',
		rarity: 'common',
		requiredKills: 10,
		possiblePokemon: ['rattata', 'pidgey']
	},
	egg_rare: {
		id: 'egg_rare',
		name: 'Oeuf Rare',
		category: 'egg',
		iconImage: '/sprites/items/egg_rare.png',
		description: 'Peut éclore en Caterpie ou Quaksire',
		rarity: 'rare',
		requiredKills: 25,
		possiblePokemon: ['caterpie', 'quaksire']
	},
	egg_epic: {
		id: 'egg_epic',
		name: 'Oeuf Épique',
		category: 'egg',
		iconImage: '/sprites/items/egg_epic.png',
		description: 'Peut éclore en Kecleon ou Wooper',
		rarity: 'epic',
		requiredKills: 50,
		possiblePokemon: ['kecleon', 'wooper']
	},
	egg_legendary: {
		id: 'egg_legendary',
		name: 'Oeuf Légendaire',
		category: 'egg',
		iconImage: '/sprites/items/egg_legendary.png',
		description: 'Peut éclore en Garchomp',
		rarity: 'legendary',
		requiredKills: 100,
		possiblePokemon: ['garchomp']
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

