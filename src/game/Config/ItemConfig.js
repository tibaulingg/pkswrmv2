export const ItemConfig = {
	key: {
		id: 'key',
		name: 'Clé',
		category: 'relic',
		icon: '',
		iconImage: '/sprites/items/key.png',
		buyPrice: 0,
		sellPrice: 10,
		description: 'Clé, peut ouvrir des coffres',
		dropScale: 1.0
	},
	rattata_tail: {
		id: 'rattata_tail',
		name: 'Queue de Rattata',
		category: 'misc',
		icon: '🐭',
		iconImage: '/sprites/items/rattata_tail.png',
		buyPrice: 0,
		sellPrice: 10,
		description: 'Queue de Rattata, peut être vendue',
		dropScale: 0.5
	},
    bronze_chest: {
		id: 'bronze_chest',
		name: 'Coffre en Bronze',
		category: 'chest',
		icon: '',
		iconImage: '/sprites/items/bronze_chest.png',
		buyPrice: 0,
		sellPrice: 200,
		description: 'Coffre en Bronze, peut contenir des objets',
		dropScale: 0.5
	}
};

export function getItemConfig(itemId) {
	return ItemConfig[itemId] || null;
}

export function getItemsByCategory(category) {
	return Object.values(ItemConfig).filter(item => item.category === category);
}

export function getAllCategories() {
	return ['consumables', 'relics', 'misc'];
}

export function getCategoryName(category) {
	const names = {
		consumables: 'Consommables',
		relics: 'Reliques',
		misc: 'Divers'
	};
	return names[category] || category;
}

