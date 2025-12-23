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
	PROJECTILE_AOE: 'projectileAoe',
	PROJECTILE_PIERCING: 'projectilePiercing',
	PROJECTILE_BOUNCE: 'projectileBounce',
	PROJECTILE_ENHANCEMENT: 'projectileEnhancement',
	// AOE upgrades
	AOE_RADIUS: 'aoeRadius',
	AOE_DAMAGE: 'aoeDamage',
	// Piercing upgrades
	PIERCING_DAMAGE_REDUCTION: 'piercingDamageReduction',
	PIERCING_MAX_COUNT: 'piercingMaxCount',
	// Bounce upgrades
	BOUNCE_MAX_COUNT: 'bounceMaxCount',
	BOUNCE_DETECTION_RANGE: 'bounceDetectionRange',
	KNOCKBACK: 'knockback',
	FETCH_RANGE: 'fetchRange',
	CRIT_CHANCE: 'critChance',
	CRIT_DAMAGE: 'critDamage',
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
		description: 'Augmente les dégâts de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.DAMAGE,
		value: 1.05,
	},
	damage_2: {
		id: 'damage_2',
		name: 'Force',
		description: 'Augmente les dégâts de 10%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.DAMAGE,
		value: 1.1,
	},
	attackSpeed_1: {
		id: 'attackSpeed_1',
		name: 'Vitesse',
		description: 'Augmente la vitesse d\'attaque de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.ATTACK_SPEED,
		value: 1.05,
	},
	attackSpeed_2: {
		id: 'attackSpeed_2',
		name: 'Vitesse',
		description: 'Augmente la vitesse d\'attaque de 10%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.ATTACK_SPEED,
		value: 1.1,
	},
	range_1: {
		id: 'range_1',
		name: 'Portée',
		description: 'Augmente la portée de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.RANGE,
		value: 1.05,
	},
	range_2: {
		id: 'range_2',
		name: 'Portée',
		description: 'Augmente la portée de 5%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.RANGE,
		value: 1.05,
	},
	speed_1: {
		id: 'speed_1',
		name: 'Mobilité',
		description: 'Augmente la vitesse de déplacement de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPEED,
		value: 1.05,
	},
	speed_2: {
		id: 'speed_2',
		name: 'Mobilité',
		description: 'Augmente la vitesse de déplacement de 5%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.SPEED,
		value: 1.05,
	},
	maxHp_1: {
		id: 'maxHp_1',
		name: 'Vitalité',
		description: 'Augmente les HP max de 5',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.MAX_HP,
		value: 5,
	},
	maxHp_2: {
		id: 'maxHp_2',
		name: 'Vitalité',
		description: 'Augmente les HP max de 15',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.MAX_HP,
		value: 15,
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
		description: 'Augmente le recul de 10%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.KNOCKBACK,
		value: 1.1,
	},
	projectileSpeed_1: {
		id: 'projectileSpeed_1',
		name: 'Vélocité',
		description: 'Augmente la vitesse des projectiles de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_SPEED,
		value: 1.1,
	},
	fetchRange_1: {
		id: 'fetchRange_1',
		name: 'Aimant',
		description: 'Augmente la portée de collecte d\'XP de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.FETCH_RANGE,
		value: 1.1,
	},
	fetchRange_2: {
		id: 'fetchRange_2',
		name: 'Aimant',
		description: 'Augmente la portée de collecte d\'XP de 20%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.FETCH_RANGE,
		value: 1.2,
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
		description: 'Augmente la chance de coup critique de 5%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.CRIT_CHANCE,
		value: 0.05,
	},
	critDamage_1: {
		id: 'critDamage_1',
		name: 'Dégâts Crit',
		description: 'Augmente les dégâts critiques de 0.1x',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.CRIT_DAMAGE,
		value: 0.1,
	},
	critDamage_2: {
		id: 'critDamage_2',
		name: 'Dégâts Crit',
		description: 'Augmente les dégâts critiques de 0.15x',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.CRIT_DAMAGE,
		value: 0.15,
	},
	xpGain_1: {
		id: 'xpGain_1',
		name: 'XP',
		description: 'Augmente l\'XP gagnée de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.XP_GAIN,
		value: 1.1,
	},
	xpGain_2: {
		id: 'xpGain_2',
		name: 'XP',
		description: 'Augmente l\'XP gagnée de 15%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.XP_GAIN,
		value: 1.15,
	},
	moneyGain_1: {
		id: 'moneyGain_1',
		name: 'Pokedollars',
		description: 'Augmente les Pokedollars gagnés de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.MONEY_GAIN,
		value: 1.1,
	},
	moneyGain_2: {
		id: 'moneyGain_2',
		name: 'Pokedollars',
		description: 'Augmente les Pokedollars gagnés de 20%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.MONEY_GAIN,
		value: 1.2,
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
	},
	projectilePiercing_1: {
		id: 'projectilePiercing_1',
		name: 'Perforation',
		description: 'Les projectiles traversent les ennemis',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_PIERCING,
	},
	projectileBounce_1: {
		id: 'projectileBounce_1',
		name: 'Rebond',
		description: 'Les projectiles rebondissent sur les ennemis',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_BOUNCE,
	},
	projectileEnhancement_1: {
		id: 'projectileEnhancement_1',
		name: 'Projectiles',
		description: 'Améliore les projectiles spéciaux',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_ENHANCEMENT,
		value: 1,
	},
	projectileEnhancement_2: {
		id: 'projectileEnhancement_2',
		name: 'Projectiles',
		description: 'Améliore les projectiles spéciaux',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_ENHANCEMENT,
		value: 1,
	},
	projectileEnhancement_3: {
		id: 'projectileEnhancement_3',
		name: 'Projectiles',
		description: 'Améliore les projectiles spéciaux',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_ENHANCEMENT,
		value: 1,
	},
	// AOE Upgrades
	aoeRadius_common: {
		id: 'aoeRadius_common',
		name: 'Rayon Explosion',
		description: 'Augmente le rayon d\'explosion de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.AOE_RADIUS,
		value: 1.05,
	},
	aoeRadius_rare: {
		id: 'aoeRadius_rare',
		name: 'Rayon Explosion',
		description: 'Augmente le rayon d\'explosion de 7%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.AOE_RADIUS,
		value: 1.07,
	},
	aoeRadius_epic: {
		id: 'aoeRadius_epic',
		name: 'Rayon Explosion',
		description: 'Augmente le rayon d\'explosion de 10%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.AOE_RADIUS,
		value: 1.10,
	},
	aoeRadius_legendary: {
		id: 'aoeRadius_legendary',
		name: 'Rayon Explosion',
		description: 'Augmente le rayon d\'explosion de 20%',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.AOE_RADIUS,
		value: 1.20,
	},
	aoeDamage_common: {
		id: 'aoeDamage_common',
		name: 'Dégâts Explosion',
		description: 'Augmente les dégâts d\'explosion de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.AOE_DAMAGE,
		value: 1.05,
	},
	aoeDamage_rare: {
		id: 'aoeDamage_rare',
		name: 'Dégâts Explosion',
		description: 'Augmente les dégâts d\'explosion de 7%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.AOE_DAMAGE,
		value: 1.07,
	},
	aoeDamage_epic: {
		id: 'aoeDamage_epic',
		name: 'Dégâts Explosion',
		description: 'Augmente les dégâts d\'explosion de 10%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.AOE_DAMAGE,
		value: 1.10,
	},
	aoeDamage_legendary: {
		id: 'aoeDamage_legendary',
		name: 'Dégâts Explosion',
		description: 'Augmente les dégâts d\'explosion de 20%',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.AOE_DAMAGE,
		value: 1.20,
	},
	// Piercing Upgrades
	piercingDamageReduction_common: {
		id: 'piercingDamageReduction_common',
		name: 'Efficacité Perforatione',
		description: 'Réduit la perte de dégâts de 2% par ennemi',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PIERCING_DAMAGE_REDUCTION,
		value: 0.02,
	},
	piercingDamageReduction_rare: {
		id: 'piercingDamageReduction_rare',
		name: 'Efficacité Perforatione',
		description: 'Réduit la perte de dégâts de 3% par ennemi',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.PIERCING_DAMAGE_REDUCTION,
		value: 0.03,
	},
	piercingDamageReduction_epic: {
		id: 'piercingDamageReduction_epic',
		name: 'Efficacité Perforatione',
		description: 'Réduit la perte de dégâts de 5% par ennemi',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.PIERCING_DAMAGE_REDUCTION,
		value: 0.05,
	},
	piercingDamageReduction_legendary: {
		id: 'piercingDamageReduction_legendary',
		name: 'Efficacité Perforatione',
		description: 'Réduit la perte de dégâts de 8% par ennemi',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.PIERCING_DAMAGE_REDUCTION,
		value: 0.08,
	},
	piercingMaxCount_common: {
		id: 'piercingMaxCount_common',
		name: 'Transperçage',
		description: 'Augmente le nombre d\'ennemis transpercables de +1',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PIERCING_MAX_COUNT,
		value: 1,
	},
	piercingMaxCount_rare: {
		id: 'piercingMaxCount_rare',
		name: 'Transperçage',
		description: 'Augmente le nombre d\'ennemis transpercables de +2',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.PIERCING_MAX_COUNT,
		value: 2,
	},
	piercingMaxCount_epic: {
		id: 'piercingMaxCount_epic',
		name: 'Transperçage',
		description: 'Augmente le nombre d\'ennemis transpercables de +3',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.PIERCING_MAX_COUNT,
		value: 3,
	},
	piercingMaxCount_legendary: {
		id: 'piercingMaxCount_legendary',
		name: 'Transperçage',
		description: 'Augmente le nombre d\'ennemis transpercables de +5',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.PIERCING_MAX_COUNT,
		value: 5,
	},
	// Bounce Upgrades
	bounceMaxCount_common: {
		id: 'bounceMaxCount_common',
		name: 'Rebonds',
		description: 'Augmente le nombre maximum de rebonds de +1',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.BOUNCE_MAX_COUNT,
		value: 1,
	},
	bounceMaxCount_rare: {
		id: 'bounceMaxCount_rare',
		name: 'Rebonds',
		description: 'Augmente le nombre maximum de rebonds de +2',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.BOUNCE_MAX_COUNT,
		value: 2,
	},
	bounceMaxCount_epic: {
		id: 'bounceMaxCount_epic',
		name: 'Rebonds',
		description: 'Augmente le nombre maximum de rebonds de +3',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.BOUNCE_MAX_COUNT,
		value: 3,
	},
	bounceMaxCount_legendary: {
		id: 'bounceMaxCount_legendary',
		name: 'Rebonds',
		description: 'Augmente le nombre maximum de rebonds de +5',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.BOUNCE_MAX_COUNT,
		value: 5,
	},
	bounceDetectionRange_common: {
		id: 'bounceDetectionRange_common',
		name: 'Portée Rebond',
		description: 'Augmente le rayon de détection de rebond de 50',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.BOUNCE_DETECTION_RANGE,
		value: 50,
	},
	bounceDetectionRange_rare: {
		id: 'bounceDetectionRange_rare',
		name: 'Portée Rebond',
		description: 'Augmente le rayon de détection de rebond de 75',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.BOUNCE_DETECTION_RANGE,
		value: 75,
	},
	bounceDetectionRange_epic: {
		id: 'bounceDetectionRange_epic',
		name: 'Portée Rebond',
		description: 'Augmente le rayon de détection de rebond de 100',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.BOUNCE_DETECTION_RANGE,
		value: 100,
	},
	bounceDetectionRange_legendary: {
		id: 'bounceDetectionRange_legendary',
		name: 'Portée Rebond',
		description: 'Augmente le rayon de détection de rebond de 150',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.BOUNCE_DETECTION_RANGE,
		value: 150,
	},
};

export const RarityWeights = {
	[UpgradeRarity.COMMON]: 40,
	[UpgradeRarity.RARE]: 35,
	[UpgradeRarity.EPIC]: 15,
	[UpgradeRarity.LEGENDARY]: 10
};

export const RarityColors = {
	[UpgradeRarity.COMMON]: 'rgb(80, 80, 80)',
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

export const RarityBackgroundColors = {
	[UpgradeRarity.COMMON]: 'rgba(26, 26, 26, 0.9)',
	[UpgradeRarity.RARE]: 'rgba(13, 20, 25, 0.9)',
	[UpgradeRarity.EPIC]: 'rgba(26, 15, 38, 0.9)',
	[UpgradeRarity.LEGENDARY]: 'rgba(38, 26, 13, 0.9)'
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
	[UpgradeType.PROJECTILE_AOE]: '💥',
	[UpgradeType.PROJECTILE_PIERCING]: '➡',
	[UpgradeType.PROJECTILE_BOUNCE]: '↻',
	[UpgradeType.PROJECTILE_ENHANCEMENT]: '⬆',
	[UpgradeType.AOE_RADIUS]: '📏',
	[UpgradeType.AOE_DAMAGE]: '💥',
	[UpgradeType.PIERCING_DAMAGE_REDUCTION]: '⚔',
	[UpgradeType.PIERCING_MAX_COUNT]: '➡',
	[UpgradeType.BOUNCE_MAX_COUNT]: '↻',
	[UpgradeType.BOUNCE_DETECTION_RANGE]: '◎',
	[UpgradeType.FETCH_RANGE]: '✦',
	[UpgradeType.CRIT_CHANCE]: '★',
	[UpgradeType.CRIT_DAMAGE]: '✦',
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
		UpgradeType.PROJECTILE_AOE,
		UpgradeType.PROJECTILE_PIERCING,
		UpgradeType.PROJECTILE_BOUNCE,
		UpgradeType.PROJECTILE_ENHANCEMENT
	];
	
	const aoeUpgrades = [
		UpgradeType.AOE_RADIUS,
		UpgradeType.AOE_DAMAGE
	];
	
	const piercingUpgrades = [
		UpgradeType.PIERCING_DAMAGE_REDUCTION,
		UpgradeType.PIERCING_MAX_COUNT
	];
	
	const bounceUpgrades = [
		UpgradeType.BOUNCE_MAX_COUNT,
		UpgradeType.BOUNCE_DETECTION_RANGE
	];
	
	const hasProjectileType = player && (
		player.hasAoE || player.hasPiercing || player.hasBounce
	);
	
	const isMelee = player && player.pokemonConfig && player.pokemonConfig.attackType === 'melee';
	const isFirstLevelUp = player && player.level === 2;
	const isRange = player && player.attackType === 'range';
	
	if (isFirstLevelUp && isRange && !hasProjectileType) {
		const projectileTypeOptions = [
			Upgrades.projectileAoe_1,
			Upgrades.projectilePiercing_1,
			Upgrades.projectileBounce_1
		];
		return projectileTypeOptions.slice(0, Math.min(count, projectileTypeOptions.length));
	}
	
	const spellUpgradeTypes = [
		UpgradeType.SPELL_DAMAGE,
		UpgradeType.SPELL_RANGE,
		UpgradeType.SPELL_COOLDOWN
	];
	
	const availableUpgrades = Object.values(Upgrades).filter(upgrade => {
		if (isMelee && allProjectileUpgrades.includes(upgrade.type)) {
			return false;
		}
		
		if (isRange && !hasProjectileType && projectileTypeUpgrades.includes(upgrade.type)) {
			return false;
		}
		
		if (isRange && hasProjectileType) {
			if (projectileTypeUpgrades.includes(upgrade.type)) {
				return false;
			}
			
			// Ne proposer que les upgrades correspondant au type de projectile choisi
			if (player.hasAoE) {
				if (piercingUpgrades.includes(upgrade.type) || bounceUpgrades.includes(upgrade.type)) {
					return false;
				}
			} else if (player.hasPiercing) {
				if (aoeUpgrades.includes(upgrade.type) || bounceUpgrades.includes(upgrade.type)) {
					return false;
				}
			} else if (player.hasBounce) {
				if (aoeUpgrades.includes(upgrade.type) || piercingUpgrades.includes(upgrade.type)) {
					return false;
				}
			}
			
			// Ne plus proposer PROJECTILE_ENHANCEMENT
			if (upgrade.type === UpgradeType.PROJECTILE_ENHANCEMENT) {
				return false;
			}
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
		
		// Ne plus proposer PROJECTILE_ENHANCEMENT (remplacé par les nouveaux upgrades spécifiques)
		if (upgrade.type === UpgradeType.PROJECTILE_ENHANCEMENT) {
			return false;
		}
		
		return true;
	});

	if (availableUpgrades.length === 0) return [];

	const selected = [];
	const used = new Set();
	const usedTypes = new Set(); // Track les types d'upgrades déjà sélectionnés
	
	const projectileUpgradeTypes = [
		UpgradeType.PROJECTILE_ENHANCEMENT,
		UpgradeType.PROJECTILE_SPEED
	];
	
	const getUpgradeWeight = (upgrade) => {
		let weight = RarityWeights[upgrade.rarity];
		// Augmenter le poids des upgrades de projectiles spécifiques
		if (hasProjectileType) {
			const allSpecificProjectileUpgrades = [...aoeUpgrades, ...piercingUpgrades, ...bounceUpgrades];
			if (allSpecificProjectileUpgrades.includes(upgrade.type)) {
				weight *= 2.5;
			}
		}
		return weight;
	};

	for (let i = 0; i < count && selected.length < availableUpgrades.length; i++) {
		// Filtrer les upgrades déjà utilisés ET ceux du même type que ceux déjà sélectionnés
		const eligibleUpgrades = availableUpgrades.filter(u => 
			!used.has(u.id) && !usedTypes.has(u.type)
		);
		
		if (eligibleUpgrades.length === 0) break;
		
		const totalWeight = eligibleUpgrades.reduce((sum, u) => sum + getUpgradeWeight(u), 0);
		
		let random = Math.random() * totalWeight;

		for (const upgrade of eligibleUpgrades) {
			random -= getUpgradeWeight(upgrade);
			if (random <= 0) {
				selected.push(upgrade);
				used.add(upgrade.id);
				usedTypes.add(upgrade.type); // Marquer ce type comme utilisé
				break;
			}
		}
	}

	return selected;
}

