export const ItemType = {
	WEAPON: 'weapon',
	PASSIVE: 'passive',
	ACTIVE: 'active'
};

export const ItemRarity = {
	COMMON: 'common',
	RARE: 'rare',
	EPIC: 'epic',
	LEGENDARY: 'legendary'
};

export const Items = {
	explosive_ammo: {
		id: 'explosive_ammo',
		name: 'Munitions Explosives',
		description: 'Vos projectiles font des dégâts de zone',
		type: ItemType.PASSIVE,
		rarity: ItemRarity.RARE,
		icon: '💣',
		effect: {
			aoeRadius: 80
		}
	}
};

export default class ItemSystem {
	constructor(player) {
		this.player = player;
		this.activeItems = [];
	}

	addItem(itemId) {
		const item = Items[itemId];
		if (!item) return false;

		this.activeItems.push(item);
		this.applyItemEffect(item);
		return true;
	}

	applyItemEffect(item) {
		if (!item.effect) return;

		if (item.effect.aoeRadius) {
			this.player.aoeRadius = item.effect.aoeRadius;
			this.player.hasAoE = true;
		}
	}

	removeItem(itemId) {
		const index = this.activeItems.findIndex(item => item.id === itemId);
		if (index === -1) return false;

		const item = this.activeItems[index];
		this.removeItemEffect(item);
		this.activeItems.splice(index, 1);
		return true;
	}

	removeItemEffect(item) {
		if (!item.effect) return;

		if (item.effect.aoeRadius) {
			const hasOtherAoE = this.activeItems.some(i => i.id !== item.id && i.effect.aoeRadius);
			if (!hasOtherAoE) {
				this.player.aoeRadius = 0;
				this.player.hasAoE = false;
			}
		}
	}

	getActiveItems() {
		return this.activeItems;
	}

	clear() {
		this.activeItems.forEach(item => this.removeItemEffect(item));
		this.activeItems = [];
	}
}



