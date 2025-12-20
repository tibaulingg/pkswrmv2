export const SpellTypes = {
	GROUND: 'ground',
	ROCK: 'rock',
	WATER: 'water'
};

export const Spells = {
	earthquake: {
		id: 'earthquake',
		name: 'Séisme',
		type: SpellTypes.GROUND,
		cooldownMax: 15000,
		damageMultiplier: 1.5,
		baseRadius: 50,
		animation: 'charge',
		animationDuration: 500,
		particleColor: '#8B4513',
		knockback: 5
	},
	rock_trap: {
		id: 'rock_trap',
		name: 'Piège de Rock',
		type: SpellTypes.ROCK,
		cooldownMax: 8000,
		damageMultiplier: 1,
		baseRadius: 10,
		animationDuration: 1000,
		particleColor: '#666666',
		knockback: 3
	},
	hydrocanon: {
		id: 'hydrocanon',
		name: 'Hydrocanon',
		type: SpellTypes.WATER,
		cooldownMax: 10000,
		damageMultiplier: 2,
		baseRadius: 250,
		animation: 'charge',
		animationDuration: 3000,
		particleColor: '#4dd0e1',
		knockback: 10
	}
};

export const PokemonSpellAccess = {
	quaksire: ['earthquake', 'rock_trap', 'hydrocanon']
};

export function getSpellConfig(spellId) {
	return Spells[spellId] || null;
}

export function getPokemonSpells(pokemonName) {
	const spellIds = PokemonSpellAccess[pokemonName] || [];
	return spellIds.map(id => getSpellConfig(id)).filter(spell => spell !== null);
}

export function canPokemonUnlockSpell(pokemonName, spellId) {
	const accessibleSpells = PokemonSpellAccess[pokemonName] || [];
	return accessibleSpells.includes(spellId);
}
