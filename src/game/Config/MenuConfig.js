import { ItemConfig } from './ItemConfig.js';
import { getShopItems } from './ShopConfig.js';

export const MainMenuConfig = {
	title: 'POKSRM',
	style: 'center',
	isMainMenu: true,
	options: [
		{
			label: 'Jouer',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.changeScene('game');
			}
		},
		{
			label: 'Collection',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.pushScene('collection');
			}
		},
		{
			label: 'Exit',
			action: (engine) => {
				window.close();
			}
		}
	]
};

export const HubMenuConfig = {
	title: 'Village',
	style: 'center',
	closeable: true,
	options: [
		{
			label: 'Inventaire',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.pushScene('inventory');
			}
		},
		{
			label: 'Collection',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.pushScene('collection');
			}
		},
		{
			label: 'Menu Principal',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.changeScene('menu');
			}
		}
	]
};

export const PauseMenuConfig = {
	title: 'PAUSE',
	style: 'center',
	closeable: true,
	options: [
		{
			label: 'Reprendre',
			action: (engine) => {
				engine.menuManager.closeMenu();
			}
		},
		{
			label: 'Recommencer',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.changeScene('game');
			}
		},
		{
			label: 'Menu Principal',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.changeScene('menu');
			}
		}
	]
};

export const ShopMenuConfig = {
	title: 'Magasin Kecleon',
	style: 'center',
	closeable: true,
	isShop: true,
	lastPurchaseTime: 0,
	mode: 'main',
	options: [
		{
			label: 'Acheter',
			action: (engine) => {
				ShopMenuConfig.mode = 'buy';
				ShopMenuConfig.options = ShopMenuConfig.getBuyOptions();
				if (engine.menuManager.activeMenu) {
					engine.menuManager.activeMenu.selectedIndex = 0;
				}
			}
		},
		{
			label: 'Vendre',
			action: (engine) => {
				ShopMenuConfig.mode = 'sell';
				ShopMenuConfig.options = ShopMenuConfig.getSellOptions(engine);
				if (engine.menuManager.activeMenu) {
					engine.menuManager.activeMenu.selectedIndex = 0;
				}
			}
		},
		{
			label: 'Retour',
			action: (engine) => {
				engine.menuManager.closeMenu();
			}
		}
	],
	getBuyOptions: () => {
		const buyOptions = [];

		const shopItems = getShopItems();
		shopItems.forEach(shopItem => {
			const item = ItemConfig[shopItem.itemId];
			if (item) {
				buyOptions.push({
					label: item.name,
					icon: item.icon,
					iconImage: item.iconImage,
					itemId: item.id,
					price: shopItem.buyPrice,
					action: (engine) => {
						if (engine.money >= shopItem.buyPrice) {
							engine.money -= shopItem.buyPrice;
							engine.displayedMoney = engine.money;
							engine.inventory[item.id] = (engine.inventory[item.id] || 0) + 1;
							ShopMenuConfig.lastPurchaseTime = Date.now();
							engine.audio.play('coins', 0.5, 0.2);
						} else {
							engine.audio.play('ok', 0.1, 0.1);
						}
					}
				});
			}
		});

		return buyOptions;
	},
	getSellOptions: (engine) => {
		const sellOptions = [];

		const sellableItems = Object.entries(engine.inventory || {})
			.filter(([id, quantity]) => quantity > 0 && ItemConfig[id] && ItemConfig[id].sellPrice > 0)
			.map(([id, quantity]) => {
				const item = ItemConfig[id];
				const itemImage = engine.sprites.get(`item_${id}`);
				return {
					label: item.name,
					icon: item.icon,
					iconImage: item.iconImage,
					itemImage: itemImage,
					itemId: id,
					quantity: quantity,
					price: item.sellPrice,
					action: (engine) => {
						if (engine.inventory[id] > 0) {
							engine.inventory[id]--;
							if (engine.inventory[id] <= 0) {
								delete engine.inventory[id];
							}
							engine.money += item.sellPrice;
							engine.displayedMoney = engine.money;
							ShopMenuConfig.lastPurchaseTime = Date.now();
							ShopMenuConfig.options = ShopMenuConfig.getSellOptions(engine);
							if (engine.menuManager.activeMenu) {
								engine.menuManager.activeMenu.selectedIndex = Math.min(engine.menuManager.activeMenu.selectedIndex, ShopMenuConfig.options.length - 1);
							}
							engine.audio.play('coins', 0.5, 0.2);
						}
					}
				};
			});

		sellOptions.push(...sellableItems);

		if (sellableItems.length === 0) {
			sellOptions.push({
				label: 'Aucun item à vendre',
				disabled: true,
				action: () => {}
			});
		}

		return sellOptions;
	},
	getMainOptions: () => {
		return [
			{
				label: 'Acheter',
				action: (engine) => {
					ShopMenuConfig.mode = 'buy';
					ShopMenuConfig.options = ShopMenuConfig.getBuyOptions();
					if (engine.menuManager.activeMenu) {
						engine.menuManager.activeMenu.selectedIndex = 0;
					}
				}
			},
			{
				label: 'Vendre',
				action: (engine) => {
					ShopMenuConfig.mode = 'sell';
					ShopMenuConfig.options = ShopMenuConfig.getSellOptions(engine);
					if (engine.menuManager.activeMenu) {
						engine.menuManager.activeMenu.selectedIndex = 0;
					}
				}
			},
			{
				label: 'Retour',
				action: (engine) => {
					engine.menuManager.closeMenu();
				}
			}
		];
	}
};

const InventoryItemNames = {
	'health_potion': 'Potion de Vie',
	'speed_boost': 'Amélioration de Vitesse',
	'damage_boost': 'Amélioration de Dégâts',
	'explosive_ammo': 'Munitions Explosives'
};



export const InventoryMenuConfig = {
	title: 'Inventaire',
	style: 'center',
	closeable: true,
	isInventory: true,
	getOptions: (engine) => {
		const items = Object.entries(engine.inventory || {})
			.filter(([id, quantity]) => quantity > 0)
			.map(([id, quantity]) => ({
				label: InventoryItemNames[id] || id,
				quantity: quantity,
				itemId: id,
				action: () => {}
			}));
		
		if (items.length === 0) {
			items.push({
				label: 'Inventaire vide',
				disabled: true,
				action: () => {}
			});
		}
		
		items.push({
			label: 'Retour',
			action: (engine) => {
				engine.menuManager.closeMenu();
			}
		});
		
		return items;
	}
};


