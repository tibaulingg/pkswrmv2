import { canPokemonUnlockSpell } from './SpellConfig.js';

export const UpgradeRarity = {
	COMMON: 'common',
	RARE: 'rare',
	EPIC: 'epic',
	LEGENDARY: 'legendary'
};

export const UpgradeType = {
	DAMAGE: 'damage',
	ATTACK_SPEED: 'attackSpeed',
	RANGE: 'range',
	SPEED: 'speed',
	MAX_HP: 'maxHp',
	HP_REGEN: 'hpRegen',
	PROJECTILE_SPEED: 'projectileSpeed',
	PROJECTILE_SIZE: 'projectileSize',
	PROJECTILE_AOE: 'projectileAoe',
	PROJECTILE_PIERCING: 'projectilePiercing',
	PROJECTILE_BOUNCE: 'projectileBounce',
	PROJECTILE_ENHANCEMENT: 'projectileEnhancement',
	KNOCKBACK: 'knockback',
	FETCH_RANGE: 'fetchRange',
	CRIT_CHANCE: 'critChance',
	CRIT_DAMAGE: 'critDamage',
	LIFE_STEAL: 'lifeSteal',
	XP_GAIN: 'xpGain',
	MONEY_GAIN: 'moneyGain',
	DURATION: 'duration',
	SPELL: 'spell',
	SPELL_DAMAGE: 'spellDamage',
	SPELL_RANGE: 'spellRange',
	SPELL_COOLDOWN: 'spellCooldown'
};

export const Upgrades = {
	damage_1: {
		id: 'damage_1',
		name: 'Force',
		description: 'Augmente les dégâts de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.DAMAGE,
		value: 1.1,
	},
	damage_2: {
		id: 'damage_2',
		name: 'Force',
		description: 'Augmente les dégâts de 25%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.DAMAGE,
		value: 1.25,
	},
	attackSpeed_1: {
		id: 'attackSpeed_1',
		name: 'Vitesse',
		description: 'Augmente la vitesse d\'attaque de 15%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.ATTACK_SPEED,
		value: 1.15,
	},
	attackSpeed_2: {
		id: 'attackSpeed_2',
		name: 'Vitesse',
		description: 'Augmente la vitesse d\'attaque de 30%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.ATTACK_SPEED,
		value: 1.3,
	},
	range_1: {
		id: 'range_1',
		name: 'Portée',
		description: 'Augmente la portée de 20%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.RANGE,
		value: 1.2,
	},
	range_2: {
		id: 'range_2',
		name: 'Portée',
		description: 'Augmente la portée de 50%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.RANGE,
		value: 1.5,
	},
	speed_1: {
		id: 'speed_1',
		name: 'Mobilité',
		description: 'Augmente la vitesse de déplacement de 15%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPEED,
		value: 1.15,
	},
	speed_2: {
		id: 'speed_2',
		name: 'Mobilité',
		description: 'Augmente la vitesse de déplacement de 35%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.SPEED,
		value: 1.35,
	},
	maxHp_1: {
		id: 'maxHp_1',
		name: 'Vitalité',
		description: 'Augmente les HP max de 20',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.MAX_HP,
		value: 20,
	},
	maxHp_2: {
		id: 'maxHp_2',
		name: 'Vitalité',
		description: 'Augmente les HP max de 50',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.MAX_HP,
		value: 50,
	},
	hpRegen_1: {
		id: 'hpRegen_1',
		name: 'Régénération',
		description: 'Régénère 1 HP par seconde',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.HP_REGEN,
		value: 1,
	},
	knockback_1: {
		id: 'knockback_1',
		name: 'Recul',
		description: 'Augmente le recul de 30%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.KNOCKBACK,
		value: 1.3,
	},
	projectileSpeed_1: {
		id: 'projectileSpeed_1',
		name: 'Vélocité',
		description: 'Augmente la vitesse des projectiles de 25%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_SPEED,
		value: 1.25,
	},
	fetchRange_1: {
		id: 'fetchRange_1',
		name: 'Aimant',
		description: 'Augmente la portée de collecte d\'XP de 30%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.FETCH_RANGE,
		value: 1.3,
	},
	fetchRange_2: {
		id: 'fetchRange_2',
		name: 'Aimant',
		description: 'Augmente la portée de collecte d\'XP de 60%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.FETCH_RANGE,
		value: 1.6,
	},
	projectileSize_1: {
		id: 'projectileSize_1',
		name: 'Taille',
		description: 'Augmente la taille des projectiles de 30%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_SIZE,
		value: 1.3,
	},
	projectileSize_2: {
		id: 'projectileSize_2',
		name: 'Taille',
		description: 'Augmente la taille des projectiles de 60%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.PROJECTILE_SIZE,
		value: 1.6,
	},
	critChance_1: {
		id: 'critChance_1',
		name: 'Chance Crit',
		description: 'Augmente la chance de coup critique de 5%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.CRIT_CHANCE,
		value: 0.05,
	},
	critChance_2: {
		id: 'critChance_2',
		name: 'Chance Crit',
		description: 'Augmente la chance de coup critique de 10%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.CRIT_CHANCE,
		value: 0.10,
	},
	critDamage_1: {
		id: 'critDamage_1',
		name: 'Dégâts Crit',
		description: 'Augmente les dégâts critiques de 0.3x',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.CRIT_DAMAGE,
		value: 0.3,
	},
	critDamage_2: {
		id: 'critDamage_2',
		name: 'Dégâts Crit',
		description: 'Augmente les dégâts critiques de 0.5x',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.CRIT_DAMAGE,
		value: 0.5,
	},
	lifeSteal_1: {
		id: 'lifeSteal_1',
		name: 'Vol de Vie',
		description: 'Récupère 5% des dégâts infligés en HP',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.LIFE_STEAL,
		value: 0.05,
	},
	lifeSteal_2: {
		id: 'lifeSteal_2',
		name: 'Vol de Vie',
		description: 'Récupère 10% des dégâts infligés en HP',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.LIFE_STEAL,
		value: 0.10,
	},
	xpGain_1: {
		id: 'xpGain_1',
		name: 'XP',
		description: 'Augmente l\'XP gagnée de 20%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.XP_GAIN,
		value: 1.2,
	},
	xpGain_2: {
		id: 'xpGain_2',
		name: 'XP',
		description: 'Augmente l\'XP gagnée de 50%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.XP_GAIN,
		value: 1.5,
	},
	moneyGain_1: {
		id: 'moneyGain_1',
		name: 'Pokedollars',
		description: 'Augmente les Pokedollars gagnés de 25%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.MONEY_GAIN,
		value: 1.25,
	},
	moneyGain_2: {
		id: 'moneyGain_2',
		name: 'Pokedollars',
		description: 'Augmente les Pokedollars gagnés de 60%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.MONEY_GAIN,
		value: 1.6,
	},
	spell_earthquake: {
		id: 'spell_earthquake',
		name: 'Séisme',
		description: 'Débloque le sort Séisme',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL,
		value: 'earthquake',
	},
	spell_rock_trap: {
		id: 'spell_rock_trap',
		name: 'Piège de Rock',
		description: 'Débloque le sort Piège de Rock',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL,
		value: 'rock_trap',
	},
	spell_hydrocanon: {
		id: 'spell_hydrocanon',
		name: 'Hydrocanon',
		description: 'Débloque le sort Hydrocanon',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL,
		value: 'hydrocanon',
	},
	projectileAoe_1: {
		id: 'projectileAoe_1',
		name: 'Explosion',
		description: 'Les projectiles infligent des dégâts de zone',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_AOE,
		value: 1,
	},
	projectilePiercing_1: {
		id: 'projectilePiercing_1',
		name: 'Transperçant',
		description: 'Les projectiles traversent les ennemis',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_PIERCING,
		value: 1,
	},
	projectileBounce_1: {
		id: 'projectileBounce_1',
		name: 'Rebond',
		description: 'Les projectiles rebondissent sur les ennemis',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_BOUNCE,
		value: 3,
	},
	projectileEnhancement_1: {
		id: 'projectileEnhancement_1',
		name: 'Projectiles',
		description: 'Améliore les projectiles spéciaux',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_ENHANCEMENT,
		value: 1,
	},
	earthquake_damage_1: {
		id: 'earthquake_damage_1',
		name: 'Séisme\n- Dégâts',
		description: 'Augmente les dégâts de Séisme de 20%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL_DAMAGE,
		value: { spellId: 'earthquake', multiplier: 1.2 }
	},
	earthquake_range_1: {
		id: 'earthquake_range_1',
		name: 'Séisme\n- Portée',
		description: 'Augmente la portée de Séisme de 15%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL_RANGE,
		value: { spellId: 'earthquake', multiplier: 1.15 }
	},
	earthquake_cooldown_1: {
		id: 'earthquake_cooldown_1',
		name: 'Séisme\n- Cooldown',
		description: 'Réduit le cooldown de Séisme de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL_COOLDOWN,
		value: { spellId: 'earthquake', multiplier: 0.9 }
	},
	rock_trap_damage_1: {
		id: 'rock_trap_damage_1',
		name: 'Piège de Rock\n- Dégâts',
		description: 'Augmente les dégâts de Piège de Rock de 20%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL_DAMAGE,
		value: { spellId: 'rock_trap', multiplier: 1.2 }
	},
	rock_trap_range_1: {
		id: 'rock_trap_range_1',
		name: 'Piège de Rock\n- Portée',
		description: 'Augmente la portée de Piège de Rock de 15%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL_RANGE,
		value: { spellId: 'rock_trap', multiplier: 1.15 }
	},
	rock_trap_cooldown_1: {
		id: 'rock_trap_cooldown_1',
		name: 'Piège de Rock\n- Cooldown',
		description: 'Réduit le cooldown de Piège de Rock de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL_COOLDOWN,
		value: { spellId: 'rock_trap', multiplier: 0.9 }
	},
	hydrocanon_damage_1: {
		id: 'hydrocanon_damage_1',
		name: 'Hydrocanon\n- Dégâts',
		description: 'Augmente les dégâts d\'Hydrocanon de 20%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL_DAMAGE,
		value: { spellId: 'hydrocanon', multiplier: 1.2 }
	},
	hydrocanon_range_1: {
		id: 'hydrocanon_range_1',
		name: 'Hydrocanon\n- Portée',
		description: 'Augmente la portée d\'Hydrocanon de 15%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL_RANGE,
		value: { spellId: 'hydrocanon', multiplier: 1.15 }
	},
	hydrocanon_cooldown_1: {
		id: 'hydrocanon_cooldown_1',
		name: 'Hydrocanon\n- Cooldown',
		description: 'Réduit le cooldown d\'Hydrocanon de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPELL_COOLDOWN,
		value: { spellId: 'hydrocanon', multiplier: 0.9 }
	}
};

export const RarityWeights = {
	[UpgradeRarity.COMMON]: 40,
	[UpgradeRarity.RARE]: 35,
	[UpgradeRarity.EPIC]: 15,
	[UpgradeRarity.LEGENDARY]: 10
};

export const RarityColors = {
	[UpgradeRarity.COMMON]: '#b8b8b8',
	[UpgradeRarity.RARE]: '#4fc3f7',
	[UpgradeRarity.EPIC]: '#ab47bc',
	[UpgradeRarity.LEGENDARY]: '#ff9100'
};

export const RarityGlowColors = {
	[UpgradeRarity.COMMON]: '#e0e0e0',
	[UpgradeRarity.RARE]: '#81d4fa',
	[UpgradeRarity.EPIC]: '#ce93d8',
	[UpgradeRarity.LEGENDARY]: '#ffab40'
};

export const RarityBackgrounds = {
	[UpgradeRarity.COMMON]: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
	[UpgradeRarity.RARE]: 'linear-gradient(135deg, #1a2332 0%, #0d1419 100%)',
	[UpgradeRarity.EPIC]: 'linear-gradient(135deg, #2d1b3d 0%, #1a0f26 100%)',
	[UpgradeRarity.LEGENDARY]: 'linear-gradient(135deg, #3d2a1a 0%, #261a0d 100%)'
};

export const UpgradeIcons = {
	[UpgradeType.DAMAGE]: '⚔',
	[UpgradeType.ATTACK_SPEED]: '⚡',
	[UpgradeType.RANGE]: '◎',
	[UpgradeType.SPEED]: '➤',
	[UpgradeType.MAX_HP]: '❤',
	[UpgradeType.HP_REGEN]: '♥',
	[UpgradeType.KNOCKBACK]: '↯',
	[UpgradeType.PROJECTILE_SPEED]: '➢',
	[UpgradeType.PROJECTILE_SIZE]: '●',
	[UpgradeType.PROJECTILE_AOE]: '💥',
	[UpgradeType.PROJECTILE_PIERCING]: '➡',
	[UpgradeType.PROJECTILE_BOUNCE]: '↻',
	[UpgradeType.PROJECTILE_ENHANCEMENT]: '⬆',
	[UpgradeType.FETCH_RANGE]: '✦',
	[UpgradeType.CRIT_CHANCE]: '★',
	[UpgradeType.CRIT_DAMAGE]: '✦',
	[UpgradeType.LIFE_STEAL]: '🩸',
	[UpgradeType.XP_GAIN]: '⭐',
	[UpgradeType.MONEY_GAIN]: '💰',
	[UpgradeType.DURATION]: '⏱',
	[UpgradeType.SPELL]: '✨',
	[UpgradeType.SPELL_DAMAGE]: '⚔',
	[UpgradeType.SPELL_RANGE]: '◎',
	[UpgradeType.SPELL_COOLDOWN]: '⚡'
};

export function getRandomUpgrades(count, playerUpgrades, player = null) {
	const projectileTypeUpgrades = [
		UpgradeType.PROJECTILE_AOE,
		UpgradeType.PROJECTILE_PIERCING,
		UpgradeType.PROJECTILE_BOUNCE
	];
	
	const allProjectileUpgrades = [
		UpgradeType.PROJECTILE_SPEED,
		UpgradeType.PROJECTILE_SIZE,
		UpgradeType.PROJECTILE_AOE,
		UpgradeType.PROJECTILE_PIERCING,
		UpgradeType.PROJECTILE_BOUNCE,
		UpgradeType.PROJECTILE_ENHANCEMENT
	];
	
	const hasProjectileType = player && (
		player.hasAoE || player.hasPiercing || player.hasBounce
	);
	
	const isMelee = player && player.pokemonConfig && player.pokemonConfig.attackType === 'melee';
	
	const spellUpgradeTypes = [
		UpgradeType.SPELL_DAMAGE,
		UpgradeType.SPELL_RANGE,
		UpgradeType.SPELL_COOLDOWN
	];
	
	const availableUpgrades = Object.values(Upgrades).filter(upgrade => {
		
		if (isMelee && allProjectileUpgrades.includes(upgrade.type)) {
			return false;
		}
		
		if (upgrade.type === UpgradeType.SPELL && player) {
			const unlockedSpells = player.getUnlockedSpells();
			const spellId = upgrade.value;
			const isAlreadyUnlocked = unlockedSpells.some(spell => spell.id === spellId);
			if (isAlreadyUnlocked) return false;
			
			const pokemonName = player.pokemonConfig?.name;
			if (pokemonName && !canPokemonUnlockSpell(pokemonName, spellId)) {
				return false;
			}
		}
		
		if (spellUpgradeTypes.includes(upgrade.type) && player) {
			const unlockedSpells = player.getUnlockedSpells();
			const spellId = upgrade.value?.spellId;
			if (!spellId) return false;
			
			const isSpellUnlocked = unlockedSpells.some(spell => spell.id === spellId);
			if (!isSpellUnlocked) return false;
		}
		
		if (projectileTypeUpgrades.includes(upgrade.type) && hasProjectileType) {
			return false;
		}
		
		if (upgrade.type === UpgradeType.PROJECTILE_ENHANCEMENT && !hasProjectileType) {
			return false;
		}
		
		return true;
	});

	if (availableUpgrades.length === 0) return [];

	const selected = [];
	const used = new Set();


	for (let i = 0; i < count && selected.length < availableUpgrades.length; i++) {
		const totalWeight = availableUpgrades
			.filter(u => !used.has(u.id))
			.reduce((sum, u) => sum + RarityWeights[u.rarity], 0);
		
		let random = Math.random() * totalWeight;

		for (const upgrade of availableUpgrades) {
			if (used.has(upgrade.id)) continue;
			
			random -= RarityWeights[upgrade.rarity];
			if (random <= 0) {
				selected.push(upgrade);
				used.add(upgrade.id);
				break;
			}
		}
	}

	return selected;
}

