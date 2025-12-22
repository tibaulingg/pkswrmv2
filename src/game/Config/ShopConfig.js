export const ShopConfig = {
	kecleon: {
		id: 'kecleon',
		name: 'Magasin Kecleon',
		items: [
			{
				itemId: 'key',
				buyPrice: 1500,
				sellPrice: 1500,
			},
			{
				itemId: 'apple',
				buyPrice: 100,
				sellPrice: 100,
			},
			{
				itemId: 'golden_apple',
				buyPrice: 200,
				sellPrice: 200,
			},
			{
				itemId: 'mystic_water',
				buyPrice: 300,
				sellPrice: 300,
			},
			{
				itemId: 'rattata_tail',
				buyPrice: 0,
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
				buyPrice: 500,
				sellPrice: 250,
			},
			{
				itemId: 'egg_rare',
				buyPrice: 1500,
				sellPrice: 750,
			},
			{
				itemId: 'egg_epic',
				buyPrice: 3000,
				sellPrice: 1500,
			},
			{
				itemId: 'egg_legendary',
				buyPrice: 5000,
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

