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

const BASE_LOOT_TABLE = [
	{ itemId: 'egg_common', chance: 0.05 },
	{ itemId: 'golden_apple', chance: 0.05 }, 
	{ itemId: 'apple', chance: 0.10 },
	{ itemId: 'bronze_chest', chance: 0.05 },
];

export const PokemonSprites = {
	piplup: {
		name: 'piplup',
		walk: {
			frames: 4
		},
		hurt: {
			frames: 2
		},
		charge: {
			frames: 12,
		},
		attackType: 'range',
		type: 'water',
		hp: 30,
		speedMultiplier: 1.17,
		damage: 20,
		attackSpeed: 2.5,
		range: 200,
		knockback: 5,
		projectileColor: '#4FC3F7',
		starter: true,
	},
	chimchar: {
		name: 'chimchar',
		walk: {
			frames: 7
		},
		hurt: {
			frames: 2
		},
		charge: {
			frames: 12
		},
		attackType: 'range',
		type: 'fire',
		hp: 300000,
		speedMultiplier: 1.17,
		damage: 0,
		attackSpeed: 2,
		range: 200,
		knockback: 5,
		projectileColor: '#FF5722',
		projectileSize: 12,
		projectileSpeed: 0.5,
		starter: true,
	},
	turtwig: {
		name: 'turtwig',
		walk: {
			frames: 4
		},
		hurt: {
			frames: 2
		},
		charge: {
			frames: 10
		},
		attackType: 'range',
		type: 'grass',
		hp: 30,
		speedMultiplier: 1.17,
		damage: 20,
		attackSpeed: 2.5,
		range: 200,
		knockback: 5,
		projectileColor: '#689F38',
		projectileSize: 12,
		projectileSpeed: 0.5,
		starter: true,
	},
	quagsire: {
		name: 'quagsire',
		walk: {
			frames: 4
		},
		hurt: {
			frames: 2
		},
		faint: {
			frames: 2,
			rows: 1,
			duration: 1500
		},
		charge: {
			frames: 10
		},
		attackType: 'range',
		type: 'water',
		hp: 30,
		speedMultiplier: 1.17,
		damage: 20,
		attackSpeed: 2.5,
		range: 200,
		knockback: 5,
		projectileColor: '#4FC3F7',
		projectileSize: 12,
		projectileSpeed: 0.5
	},
	garchomp: {
		name: 'garchomp',
		walk: {
			frames: 4
		},
		hurt: {
			frames: 2
		},
		charge: {
			frames: 10
		},
		attackType: 'melee',
		type: 'dragon',
		hp: 1,
		speedMultiplier: 1.33,
		damage: 30,
		attackSpeed: 2,
		range: 150,
		knockback: 5,
		particleColor: '#8B4513',
		projectileColor: '#8B4513',
		projectileSize: 6,
		projectileSpeed: 0.6,
		spells: [],
		meleeAttackColor: '#8B4513'
	},
	kecleon: {
		name: 'kecleon',
		walk: {
			frames: 4
		},
		idle: {
			frames: 4,
			duration: 1200
		},
		hurt: {
			frames: 2
		},
		attackType: 'melee',
		type: 'normal',
		hp: 20,
		speedMultiplier: 1.0,
		damage: 15,
		attackSpeed: 1.5,
		range: 150,
		knockback: 9,
		particleColor: 'rgb(20, 112, 32)',
		projectileColor: 'rgb(20, 112, 32)',
		spells: []
	},
	rattata: {
		name: 'rattata',
		walk: {
			frames: 7
		},
		hurt: {
			frames: 2
		},
		faint: {
			frames: 4
		},
		attackType: 'melee',
		type: 'normal',
		hp: 20,
		speedMultiplier: 1,
		enemySpeedMultiplier: 0.8,
		damage: 5,
		attackSpeed: 1.0,
		range: 50,
		knockback: 5,
		particleColor: '#4b2666',
		projectileColor: '#ffffff',
		projectileSize: 6,
		projectileSpeed: 0.6,
		spells: [],
		lootTable: [
			{ itemId: 'rattata_tail', chance: 0.1 },
		]
	},
	caterpie: {
		name: 'caterpie',
		walk: {
			frames: 3
		},
		hurt: {
			frames: 2
		},
		faint: {
			frames: 4
		},
		shoot: {
			frames: 8
		},
		attackType: 'range',
		type: 'bug',
		hp: 25,
		speedMultiplier: 0.27,
		enemySpeedMultiplier: 0.2,
		damage: 4,
		attackSpeed: 1.5,
		range: 150,
		knockback: 5,
		particleColor: '#4CAF50',
		projectileColor: '#ffffff',
		projectileSize: 10,
		projectileSpeed: 0.2,
		spells: [],
	},
	pidgey: {
		name: 'pidgey',
		walk: {
			frames: 5
		},
		hurt: {
			frames: 2
		},
		faint: {
			frames: 4
		},
		attackType: 'melee',
		type: 'normal',
		
		hp: 20,
		speedMultiplier: 1,
		damage: 5,
		attackSpeed: 1.0,
		range: 50,
		knockback: 5,

		enemySpeedMultiplier: 0.8,
		particleColor: '#4b2666',
		projectileColor: '#ffffff',
		projectileSize: 6,
		projectileSpeed: 0.6,
		spells: [],
	},
	chansey : {
		name: 'chansey',
		walk: {
			frames: 4
		},
		idle: {
			frames: 6
		},
		hurt: {
			frames: 2
		},
		charge: {
			frames: 10
		},
		attackType: 'range',
		type: 'normal',
		hp: 20,
		speedMultiplier: 1.17,
		damage: 20,
		attackSpeed: 2.5,
		range: 200,
		knockback: 5,
		particleColor: '#4b2666',
		projectileColor: '#ffffff',
		projectileSize: 10,
		projectileSpeed: 0.2,
		spells: [],
	},
	wooper : {
		name: 'wooper',
		walk: {
			frames: 8
		},
		hurt: {
			frames: 2
		},
		charge: {
			frames: 10
		},
		attackType: 'range',
		type: 'water',
		hp: 20,
		speedMultiplier: 1.17,
		damage: 20,
		attackSpeed: 2.5,
		range: 200,
		knockback: 5,
		particleColor: '#4b2666',
		projectileColor: '#ffffff',
		projectileSize: 10,
		projectileSpeed: 0.2,
		spells: [],
	},
};

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

	if (pokemon.faint) {
		animations.faint = {
			file: `/sprites/pokemon/${pokemon.name}/Faint-Anim.png`,
			frames: pokemon.faint.frames,
			rows: pokemon.faint.rows || SPRITE_ROWS,
			duration: pokemon.faint.duration || 1000
		};
	}

	if (pokemon.charge) {
		animations.charge = {
			file: `/sprites/pokemon/${pokemon.name}/Charge-Anim.png`,
			frames: pokemon.charge.frames
		};
	}

	if (pokemon.shoot) {
		animations.shoot = {
			file: `/sprites/pokemon/${pokemon.name}/Shoot-Anim.png`,
			frames: pokemon.shoot.frames
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
		meleeAttackColor: pokemon.meleeAttackColor || null,
		lootTable: getPokemonLootTable(pokemonName),
	};
}

export function getPokemonLootTable(pokemonName) {
	const pokemon = PokemonSprites[pokemonName];
	if (!pokemon) return BASE_LOOT_TABLE;
	
	if (!pokemon.lootTable) return BASE_LOOT_TABLE;
	
	const mergedLootTable = [...BASE_LOOT_TABLE];
	
	pokemon.lootTable.forEach(pokemonLoot => {
		const existingIndex = mergedLootTable.findIndex(
			baseLoot => baseLoot.itemId === pokemonLoot.itemId
		);
		
		if (existingIndex !== -1) {
			mergedLootTable[existingIndex].chance = pokemonLoot.chance;
		} else {
			mergedLootTable.push(pokemonLoot);
		}
	});
	
	return mergedLootTable;
}

