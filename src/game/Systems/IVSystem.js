const IV_COEFFICIENT = 0.01;

export function generateIVs() {
	return {
		hp: Math.floor(Math.random() * 31) + 1,
		damage: Math.floor(Math.random() * 31) + 1,
		speed: Math.floor(Math.random() * 31) + 1,
		attackSpeed: Math.floor(Math.random() * 31) + 1,
		range: Math.floor(Math.random() * 31) + 1,
		knockback: Math.floor(Math.random() * 31) + 1
	};
}

export function generateStarterIVs() {
	const ivs = generateIVs();
	const stats = ['hp', 'damage', 'speed', 'attackSpeed', 'range', 'knockback'];
	const randomStat = stats[Math.floor(Math.random() * stats.length)];
	ivs[randomStat] = 31;
	return ivs;
}

export function mergeIVs(ivs1, ivs2) {
	return {
		hp: Math.max(ivs1.hp || 0, ivs2.hp || 0),
		damage: Math.max(ivs1.damage || 0, ivs2.damage || 0),
		speed: Math.max(ivs1.speed || 0, ivs2.speed || 0),
		attackSpeed: Math.max(ivs1.attackSpeed || 0, ivs2.attackSpeed || 0),
		range: Math.max(ivs1.range || 0, ivs2.range || 0),
		knockback: Math.max(ivs1.knockback || 0, ivs2.knockback || 0)
	};
}

export function calculateStatWithIV(baseStat, iv, statName) {
	if (!iv || iv === 0) return baseStat;
	return baseStat * (1 + iv * IV_COEFFICIENT);
}

export function getIVCoefficient() {
	return IV_COEFFICIENT;
}

