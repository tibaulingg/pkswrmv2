export const Maps = [
	{
		id: 0,
		name: 'Forêt',
		image: 'forest',
		bossTimer: 120000, //2min
		bossType: 'boss_rattata',
		arrowX: 523,
		arrowY: 276
	},
	{
		id: 1,
		name: 'Montagne',
		image: 'mountain',
		bossTimer: 150000,
		bossType: 'boss_rattata',
		arrowX: 800,
		arrowY: 400
	},
	{
		id: 2,
		name: 'Grotte',
		image: 'cave',
		bossTimer: 180000,
		bossType: 'boss_rattata',
		arrowX: 800,
		arrowY: 500
	},
	{
		id: 3,
		name: 'Désert',
		image: 'desert',
		bossTimer: 200000,
		bossType: 'boss_rattata',
		arrowX: 800,
		arrowY: 600
	},
	{
		id: 4,
		name: 'Volcan',
		image: 'volcano',
		bossTimer: 240000,
		bossType: 'boss_rattata',
		arrowX: 800,
		arrowY: 700
	}
];

export function getMapConfig(mapId) {
	return Maps.find(map => map.id === mapId);
}

