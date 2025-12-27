export const ShopConfig = {
	kecleon: {
		id: 'kecleon',
		name: 'Magasin Kecleon',
		items: [
			{
				itemId: 'apple',
				buyPrice: 100,
				sellPrice: 50,
			},
			{
				itemId: 'golden_apple',
				buyPrice: 200,
				sellPrice: 100,
			},
			{
				itemId: 'mystic_water',
				buyPrice: 5000,
				sellPrice: 2500,
			},
			{
				itemId: 'fire_stone',
				buyPrice: 5000,
				sellPrice: 2500,
			},
			{
				itemId: 'leaf_stone',
				buyPrice: 5000,
				sellPrice: 2500,
			},
			{
				itemId: 'thunder_stone',
				buyPrice: 5000,
				sellPrice: 2500,
			},
			{
				itemId: 'power_bracelet',
				buyPrice: 8000,
				sellPrice: 4000,
			},
			{
				itemId: 'speed_boots',
				buyPrice: 8000,
				sellPrice: 4000,
			},
			{
				itemId: 'vitality_amulet',
				buyPrice: 8000,
				sellPrice: 4000,
			},
			{
				itemId: 'crit_charm',
				buyPrice: 10000,
				sellPrice: 5000,
			},
			{
				itemId: 'attack_speed_ring',
				buyPrice: 10000,
				sellPrice: 5000,
			},
			{
				itemId: 'range_scope',
				buyPrice: 10000,
				sellPrice: 5000,
			},
			{
				itemId: 'rattata_tail',
				sellPrice: 50,
			},
		]
	},
	chansey: {
		id: 'chansey',
		name: 'Boutique de Chansey',
		items: [
			{
				itemId: 'egg_common',
				buyPrice: 1000,
				sellPrice: 250,
			},
			{
				itemId: 'egg_rare',
				buyPrice: 10000,
				sellPrice: 750,
			},
			{
				itemId: 'egg_epic',
				buyPrice: 35000,
				sellPrice: 1500,
			},
			{
				itemId: 'egg_legendary',
				buyPrice: 50000,
				sellPrice: 2500,
			},
		]
	}
};

export function getShopItems(shopId = 'kecleon') {
	const shop = ShopConfig[shopId];
	return shop ? shop.items : [];
}

export function getShopConfig(shopId) {
	return ShopConfig[shopId] || null;
}

