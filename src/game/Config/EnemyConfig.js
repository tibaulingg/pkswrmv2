export const EnemyTypes = {
	rattata: {
		id: 'rattata',
		name: 'Rattata',
		pokemon: 'rattata',
	},
	pidgey: {
		id: 'pidgey',
		name: 'Pidgey',
		pokemon: 'pidgey',
	},
	caterpie: {
		id: 'caterpie',
		name: 'Caterpie',
		pokemon: 'caterpie',
	},
	rattata_strong: {
		id: 'rattata_strong',
		name: 'Rattata',
		pokemon: 'rattata',
		hpMultiplier: 1.5,
		speedMultiplier: 1.2,
		damageMultiplier: 1.6,
		projectileSpeedMultiplier: 1.0
	},
	rattata_elite: {
		id: 'rattata_elite',
		name: 'Rattata Elite',
		pokemon: 'rattata',
		hpMultiplier: 2.5,
		speedMultiplier: 1.33,
		damageMultiplier: 2.4,
		projectileSpeedMultiplier: 1.0
	},
	boss_rattata: {
		id: 'boss_rattata',
		name: 'Rattata Boss',
		pokemon: 'rattata',
		hpMultiplier: 50.0,
		speedMultiplier: 0.4,
		damageMultiplier: 1.5,
		projectileSpeedMultiplier: 1.2,
		isBoss: true
	}
};

export const MapEnemies = {
	0: [
		{ type: 'rattata', weight: 6 },
		{ type: 'caterpie', weight: 0 },
		{ type: 'pidgey', weight: 3 }
	],
	1: [
		{ type: 'rattata', weight: 4 },
		{ type: 'rattata_strong', weight: 3 },
		{ type: 'caterpie', weight: 3 }
	],
	2: [
		{ type: 'rattata_strong', weight: 4 },
		{ type: 'rattata', weight: 3 }
	],
	3: [
		{ type: 'rattata_strong', weight: 5 },
		{ type: 'rattata_elite', weight: 2 }
	],
	4: [
		{ type: 'rattata_elite', weight: 5 },
		{ type: 'rattata_strong', weight: 3 }
	]
};

