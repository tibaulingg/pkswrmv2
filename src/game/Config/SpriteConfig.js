import { ItemConfig } from './ItemConfig.js';

const SPRITE_ROWS = 8;

const DIRECTIONS = {
	down: 0,
	downRight: 1,
	right: 2,
	upRight: 3,
	up: 4,
	upLeft: 5,
	left: 6,
	downLeft: 7
};


export const POKEMON_STATS_TEMPLATES = {
	starter: {
		hp: 30,
		damage: 18,
		speedMultiplier: 1.17,
		attackSpeed: 2.0,
		range: 200,
		knockback: 5,
	},
	faible: {
		hp: 20,
		damage: 5,
		speedMultiplier: 0.8,
		attackSpeed: 1.0,
		range: 50,
		knockback: 5,
	},
	moyen: {
		hp: 25,
		damage: 15,
		speedMultiplier: 1.0,
		attackSpeed: 1.5,
		range: 150,
		knockback: 5,
	},
	fort: {
		hp: 50,
		damage: 35,
		speedMultiplier: 1.33,
		attackSpeed: 2.0,
		range: 200,
		knockback: 8,
	},
};

function applyStatsTemplate(pokemon) {
	if (!pokemon.statsTemplate) return pokemon;
	
	const template = POKEMON_STATS_TEMPLATES[pokemon.statsTemplate];
	if (!template) return pokemon;
	
	// Fusionner les stats du template avec les stats spécifiques du pokémon
	// Le spread ...pokemon préserve toutes les propriétés (lootTable, spells, etc.)
	return {
		...pokemon,
		hp: pokemon.hp ?? template.hp,
		damage: pokemon.damage ?? template.damage,
		speedMultiplier: pokemon.speedMultiplier ?? template.speedMultiplier,
		attackSpeed: pokemon.attackSpeed ?? template.attackSpeed,
		range: pokemon.range ?? template.range,
		knockback: pokemon.knockback ?? template.knockback,
	};
}

const PokemonSpritesRaw = {
	piplup: {
		name: 'piplup',
		walk: { frames: 4 },
		hurt: { frames: 2 },
		attack: { frames: 12 },
		attackType: 'range',
		type: 'water',
		statsTemplate: 'starter',
		damage: 15, // Override spécifique
		projectileColor: '#4FC3F7',
		starter: true,
	},
	digglet : {
		name: 'digglet',
		walk: { frames: 3 },
		hurt: { frames: 2 },
		attack: { frames: 9 },
		attackType: 'range',
		type: 'ground',
		statsTemplate: 'starter',
		projectileColor: 'rgb(139, 69, 19)',
		particleColor: 'rgb(139, 69, 19)',
		projectileSize: 12,
	},
	dugtrio: {
		name: 'dugtrio',
		walk: { frames: 3 },
		hurt: { frames: 2 },
		attack: { frames: 9 },
		attackType: 'range',
		type: 'ground',
		statsTemplate: 'starter',
		projectileColor: 'rgb(139, 69, 19)',
		particleColor: 'rgb(139, 69, 19)',
		projectileSize: 12,
	},
	geodude: {
		name: 'geodude',
		walk: { frames: 4 },
		hurt: { frames: 2 },
		attackType: 'melee',
		type: 'rock',
		statsTemplate: 'starter',
		hp: 50,
		particleColor: 'rgb(70, 70, 70)',
		speedMultiplier: 0.8,
	},
	rhydon: {
		name: 'rhydon',
		walk: { frames: 4 },
		hurt: { frames: 2 },
		attack: { frames: 10 },
		attackType: 'melee',
		type: 'rock',
		statsTemplate: 'fort',
		hp: 150,
		speedMultiplier: 0.8,
	},
	chimchar: {
		name: 'chimchar',
		walk: { frames: 7 },
		hurt: { frames: 2 },
		attack: { frames: 12 },
		attackType: 'range',
		type: 'fire',
		statsTemplate: 'starter',
		damage: 20, // Override spécifique
		projectileColor: '#FF5722',
		projectileSize: 12,
		projectileSpeed: 0.5,
		starter: true,
	},
	turtwig: {
		name: 'turtwig',
		walk: { frames: 4 },
		hurt: { frames: 2 },
		attack: { frames: 10 },
		attackType: 'range',
		type: 'grass',
		statsTemplate: 'starter',
		damage: 550, // Override spécifique
		projectileColor: '#689F38',
		projectileSize: 12,
		projectileSpeed: 0.5,
		starter: true,
	},
	quagsire: {
		name: 'quagsire',
		walk: { frames: 4 },
		hurt: { frames: 2 },
		faint: { frames: 2, rows: 1, duration: 1500 },
		attack: { frames: 10 },
		attackType: 'range',
		type: 'water',
		statsTemplate: 'starter',
		hp: 30, // Override spécifique
		attackSpeed: 2.5, // Override spécifique
		projectileColor: '#4FC3F7',
		projectileSize: 12,
		projectileSpeed: 0.5
	},
	garchomp: {
		name: 'garchomp',
		walk: { frames: 4 },
		hurt: { frames: 2 },
		attack: { frames: 10 },
		attackType: 'range',
		type: 'dragon',
		statsTemplate: 'fort',
		range: 250, // Override spécifique
		knockback: 5, // Override spécifique
		particleColor: 'rgb(112, 34, 156)',
		projectileColor: 'rgb(112, 34, 156)',
		projectileSize: 6,
		projectileSpeed: 0.6,
		spells: [],
		rangeAttackColor: 'rgb(112, 34, 156)',
		lootTable: []
	},
	kecleon: {
		name: 'kecleon',
		walk: { frames: 4 },
		idle: { frames: 4, duration: 1200 },
		hurt: { frames: 2 },
		attackType: 'range',
		type: 'normal',
		statsTemplate: 'moyen',
		knockback: 9, // Override spécifique
		particleColor: 'rgb(20, 112, 32)',
		projectileColor: 'rgb(20, 112, 32)',
		spells: [],
		lootTable: []
	},
	rattata: {
		name: 'rattata',
		walk: { frames: 7 },
		hurt: { frames: 2 },
		faint: { frames: 4 },
		attackType: 'range',
		type: 'normal',
		statsTemplate: 'faible',
		speedMultiplier: 1, // Override spécifique
		enemySpeedMultiplier: 0.8,
		particleColor: '#4b2666',
		projectileColor: '#ffffff',
		projectileSize: 6,
		projectileSpeed: 0.6,
		spells: [],
		lootTable: [
			{ itemId: 'rattata_tail', chance: 10 }, // 10% de chance
			{ itemId: 'apple', chance: 15 } // 15% de chance
		]
	},
	caterpie: {
		name: 'caterpie',
		walk: { frames: 3 },
		hurt: { frames: 2 },
		faint: { frames: 4 },
		attack: { frames: 8 },
		attackType: 'range',
		type: 'bug',
		statsTemplate: 'faible',
		hp: 25, // Override spécifique
		speedMultiplier: 0.27, // Override spécifique
		enemySpeedMultiplier: 0.2,
		damage: 4, // Override spécifique
		attackSpeed: 1.5, // Override spécifique
		range: 150, // Override spécifique
		particleColor: '#4CAF50',
		projectileColor: '#ffffff',
		projectileSize: 10,
		projectileSpeed: 0.2,
		spells: [],
		lootTable: [
			{ itemId: 'apple', chance: 12 } // 12% de chance
		]
	},
	pidgey: {
		name: 'pidgey',
		walk: { frames: 5 },
		hurt: { frames: 2 },
		faint: { frames: 4 },
		attackType: 'range',
		type: 'normal',
		statsTemplate: 'faible',
		speedMultiplier: 1, // Override spécifique
		enemySpeedMultiplier: 0.8,
		particleColor: '#4b2666',
		projectileColor: '#ffffff',
		projectileSize: 6,
		projectileSpeed: 0.6,
		spells: [],
		lootTable: [
			{ itemId: 'apple', chance: 15 } // 15% de chance
		]
	},
	chansey: {
		name: 'chansey',
		walk: { frames: 4 },
		idle: { frames: 6 },
		hurt: { frames: 2 },
		attack: { frames: 10 },
		attackType: 'range',
		type: 'normal',
		statsTemplate: 'starter',
		hp: 20, // Override spécifique
		damage: 20, // Override spécifique
		attackSpeed: 2.5, // Override spécifique
		particleColor: '#4b2666',
		projectileColor: '#ffffff',
		projectileSize: 10,
		projectileSpeed: 0.2,
		spells: [],
	},
	wooper: {
		name: 'wooper',
		walk: { frames: 8 },
		hurt: { frames: 2 },
		attack: { frames: 10 },
		attackType: 'range',
		type: 'water',
		statsTemplate: 'starter',
		hp: 20, // Override spécifique
		damage: 20, // Override spécifique
		attackSpeed: 2.5, // Override spécifique
		particleColor: '#4b2666',
		projectileColor: '#ffffff',
		projectileSize: 10,
		projectileSpeed: 0.2,
		spells: [],
	},
	ditto: {
		name: 'ditto',
		walk: { frames: 5 },
		idle: { frames: 2, duration: 1200 },
		hurt: { frames: 2 },
		attackType: 'range',
		type: 'normal',
		statsTemplate: 'moyen',
		particleColor: '#FF69B4',
		projectileColor: '#FF69B4',
		spells: [],
		lootTable: [
			{ itemId: 'apple', chance: 20 }, // 20% de chance
			{ itemId: 'basic_chest', chance: 8 } // 8% de chance
		]
	},
	pikachu: {
		name: 'pikachu',
		walk: { frames: 4 },
		hurt: { frames: 2 },
		attack: { frames: 13 },
		attackType: 'range',
		type: 'electric',
		statsTemplate: 'moyen',
		particleColor: 'rgb(255, 204, 0)',
		projectileColor: 'rgb(255, 204, 0)',
		spells: [],
		lootTable: [
			{ itemId: 'fire_stone', chance: 33 } ,
			{ itemId: 'leaf_stone', chance: 33 },
			{ itemId: 'water_stone', chance: 33 } ,
		]
	},
};

// Appliquer les templates de stats à tous les pokémons
export const PokemonSprites = Object.keys(PokemonSpritesRaw).reduce((acc, key) => {
	acc[key] = applyStatsTemplate(PokemonSpritesRaw[key]);
	return acc;
}, {});

export function getPokemonConfig(pokemonName) {
	const pokemon = PokemonSprites[pokemonName];
	if (!pokemon) return null;
	
	const animations = {
		walk: {
			file: `/sprites/pokemon/${pokemon.name}/Walk-Anim.png`,
			frames: pokemon.walk.frames
		},
		hurt: {
			file: `/sprites/pokemon/${pokemon.name}/Hurt-Anim.png`,
			frames: pokemon.hurt.frames
		}
	};
	
	if (pokemon.attack) {
		animations.attack = {
			file: `/sprites/pokemon/${pokemon.name}/Attack-Anim.png`,
			frames: pokemon.attack.frames
		};
	}

	if (pokemon.faint) {
		animations.faint = {
			file: `/sprites/pokemon/${pokemon.name}/Faint-Anim.png`,
			frames: pokemon.faint.frames,
			rows: pokemon.faint.rows || SPRITE_ROWS,
			duration: pokemon.faint.duration || 1000
		};
	}
	
	if (pokemon.idle) {
		animations.idle = {
			file: `/sprites/pokemon/${pokemon.name}/Idle-Anim.png`,
			frames: pokemon.idle.frames,
			duration: pokemon.idle.duration
		};
	}

	return {
		name: pokemon.name,
		animations: animations,
		directions: DIRECTIONS,
		rows: SPRITE_ROWS,
		attackType: pokemon.attackType,
		type: pokemon.type,
		hp: pokemon.hp,
		speedMultiplier: pokemon.speedMultiplier || 1,
		damage: pokemon.damage,
		attackSpeed: pokemon.attackSpeed,
		range: pokemon.range,
		knockback: pokemon.knockback,
		particleColor: pokemon.particleColor,
		projectileColor: pokemon.projectileColor,
		projectileSize: pokemon.projectileSize,
		projectileSpeed: pokemon.projectileSpeed,
		rangeAttackColor: pokemon.rangeAttackColor || null,
		lootTable: getPokemonLootTable(pokemonName),
	};
}

// Retourne la loot table du pokémon (ou [] si vide)
export function getPokemonLootTable(pokemonName) {
	const pokemon = PokemonSprites[pokemonName];
	if (!pokemon || !pokemon.lootTable || pokemon.lootTable.length === 0) {
		return [];
	}
	
	return pokemon.lootTable;
}

