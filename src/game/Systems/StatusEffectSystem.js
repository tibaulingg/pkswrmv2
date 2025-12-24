export const StatusEffectType = {
	BURN: 'burn',
	SLOW: 'slow',
	STUN: 'stun',
	WET: 'wet',
	POISON: 'poison',
	FREEZE: 'freeze'
};

export const PokemonTypeToEffect = {
	fire: StatusEffectType.BURN,
	ice: StatusEffectType.SLOW,
	electric: StatusEffectType.STUN,
	water: StatusEffectType.WET,
	poison: StatusEffectType.POISON,
	grass: StatusEffectType.POISON,
	normal: StatusEffectType.SLOW,
	bug: StatusEffectType.POISON,
	dragon: StatusEffectType.SLOW
};

export function getEffectForPlayerPokemonType(pokemonType) {
	return PokemonTypeToEffect[pokemonType] || StatusEffectType.SLOW;
}

export function createStatusEffect(effectType, baseDamage, baseIntensity, baseDuration, damageMultiplier = 1, intensityMultiplier = 1, durationMultiplier = 1) {
	const effect = {
		type: effectType,
		duration: baseDuration * durationMultiplier,
		maxDuration: baseDuration * durationMultiplier,
		damage: baseDamage * damageMultiplier,
		intensity: baseIntensity * intensityMultiplier,
		tickTimer: 0,
		tickInterval: 1000
	};

	switch (effectType) {
		case StatusEffectType.BURN:
			effect.damage = (baseDamage || 2) * damageMultiplier;
			effect.tickInterval = 500;
			break;
		case StatusEffectType.SLOW:
			effect.slowAmount = (baseIntensity || 0.5) * intensityMultiplier;
			effect.tickInterval = Infinity;
			break;
		case StatusEffectType.STUN:
			effect.stunDuration = (baseDuration || 500) * durationMultiplier;
			effect.tickInterval = Infinity;
			break;
		case StatusEffectType.WET:
			effect.slowAmount = (baseIntensity || 0.3) * intensityMultiplier;
			effect.tickInterval = Infinity;
			break;
		case StatusEffectType.POISON:
			effect.damage = (baseDamage || 1.5) * damageMultiplier;
			effect.tickInterval = 800;
			break;
		case StatusEffectType.FREEZE:
			effect.slowAmount = (baseIntensity || 0.7) * intensityMultiplier;
			effect.tickInterval = Infinity;
			break;
	}

	return effect;
}

