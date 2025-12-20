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

export const PokemonSprites = {
	quaksire: {
		name: 'quaksire',
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
		type: 'fire',
		hp: 100,
		speed: 2.0,
		damage: 150,
		attackSpeed: 3.0,
		range: 180,
		knockback: 10,
		particleColor: 'blue',
		projectileColor: 'blue',
		projectileSize: 8,
		projectileSpeed: 0.6,
		spells: [
			{
				id: 'earthquake',
				name: 'Séisme',
				cooldownMax: 5000,
				cooldown: 0,
				damageMultiplier: 2.0,
				radius: 50,
				animation: 'charge',
				animationDuration: 500,
				particleColor: '#8B4513'
			},
			{
				id: 'rock_trap',
				name: 'Piège de Rock',
				cooldownMax: 8000,
				cooldown: 0,
				damageMultiplier: 1.5,
				radius: 10,
				animationDuration: 1000,
				particleColor: '#666666'
			},
			{
				id: 'hydrocanon',
				name: 'Hydrocanon',
				cooldownMax: 10000,
				cooldown: 0,
				damageMultiplier: 0.8,
				radius: 200,
				animation: 'charge',
				animationDuration: 3000,
				particleColor: '#4dd0e1'
			}
		]
	},
	rattata: {
		name: 'rattata',
		walk: {
			frames: 7
		},
		hurt: {
			frames: 2
		},
		attackType: 'melee',
		type: 'normal',
		hp: 20,
		speed: 1.5,
		damage: 5,
		attackSpeed: 1.0,
		range: 50,
		knockback: 5,
		particleColor: '#4b2666',
		projectileColor: '#ffffff',
		projectileSize: 6,
		projectileSpeed: 0.6,
		spells: []
	},
	caterpie: {
		name: 'caterpie',
		walk: {
			frames: 3
		},
		hurt: {
			frames: 2
		},
		shoot: {
			frames: 8
		},
		attackType: 'range',
		type: 'bug',
		hp: 25,
		speed: 0.8,
		damage: 4,
		attackSpeed: 1.5,
		range: 200,
		knockback: 5,
		particleColor: '#4CAF50',
		projectileColor: '#ffffff',
		projectileSize: 10,
		projectileSpeed: 0.2,
		spells: []
	},
	pidgey: {
		name: 'pidgey',
		walk: {
			frames: 5
		},
		hurt: {
			frames: 2
		},
		attackType: 'melee',
		type: 'flying',
		hp: 30,
		speed: 1.0,
		damage: 6,
		attackSpeed: 1.5,
		range: 50,
		knockback: 5,
		particleColor: '#87CEEB',
		projectileColor: '#ffffff',
		projectileSize: 10,
		projectileSpeed: 0.2,
		spells: []
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

	return {
		name: pokemon.name,
		animations: animations,
		directions: DIRECTIONS,
		rows: SPRITE_ROWS,
		attackType: pokemon.attackType,
		type: pokemon.type,
		hp: pokemon.hp,
		speed: pokemon.speed,
		damage: pokemon.damage,
		attackSpeed: pokemon.attackSpeed,
		range: pokemon.range,
		knockback: pokemon.knockback,
		particleColor: pokemon.particleColor,
		projectileColor: pokemon.projectileColor,
		projectileSize: pokemon.projectileSize,
		projectileSpeed: pokemon.projectileSpeed,
		spells: pokemon.spells || []
	};
}

