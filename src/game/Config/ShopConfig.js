export const ShopConfig = {
	items: [
		{
			itemId: 'key',
			buyPrice: 1500
		},
	]
};

export function getShopItems() {
	return ShopConfig.items;
}

