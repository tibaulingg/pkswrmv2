import { PokemonSprites } from './SpriteConfig.js';

// Ennemis avec modifications spéciales (multipliers, bosses, etc.)
export const EnemyTypes = {
	boss_pikachu: {
		id: 'boss_pikachu',
		name: 'Pikachu Boss',
		pokemon: 'pikachu',
		hpMultiplier: 50.0,
		speedMultiplier: 0.8,
		damageMultiplier: 1.5,
		projectileSpeedMultiplier: 1.2,
		isBoss: true
	},
	boss_rhydon: {
		id: 'boss_rhydon',
		name: 'Rhodon Boss',
		pokemon: 'rhydon',
		hpMultiplier: 100.0,
		speedMultiplier: 0.8,
		damageMultiplier: 1.5,
		projectileSpeedMultiplier: 1,
		isBoss: true
	}
};

function capitalizeFirst(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getEnemyConfig(enemyType) {
	if (EnemyTypes[enemyType]) {
		return EnemyTypes[enemyType];
	}
	
	if (PokemonSprites[enemyType]) {
		return {
			id: enemyType,
			name: capitalizeFirst(enemyType),
			pokemon: enemyType,
		};
	}
	return null;
}

export const MapEnemies = {
	0: [
		{ type: 'rattata', weight: 4 },
		{ type: 'caterpie', weight: 2 },
		{ type: 'pidgey', weight: 2 },
	],
	1: [
		{ type: 'digglet', weight: 1 },
		{ type: 'dugtrio', weight: 0.5 },
		{ type: 'geodude', weight: 5 },
		{ type: 'geodude_strong', weight: 1 },
		{ type: 'dugtrio_strong', weight: 0.5 },
	],
};

