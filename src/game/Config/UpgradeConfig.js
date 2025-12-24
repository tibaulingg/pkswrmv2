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
	PROJECTILE_EFFECT: 'projectileEffect',
	AOE_RADIUS: 'aoeRadius',
	AOE_DAMAGE: 'aoeDamage',
	PIERCING_DAMAGE_REDUCTION: 'piercingDamageReduction',
	PIERCING_MAX_COUNT: 'piercingMaxCount',
	BOUNCE_MAX_COUNT: 'bounceMaxCount',
	BOUNCE_DETECTION_RANGE: 'bounceDetectionRange',
	EFFECT_PROC_CHANCE: 'effectProcChance',
	EFFECT_DAMAGE: 'effectDamage',
	EFFECT_INTENSITY: 'effectIntensity',
	EFFECT_DURATION: 'effectDuration',
	KNOCKBACK: 'knockback',
	FETCH_RANGE: 'fetchRange',
	CRIT_CHANCE: 'critChance',
	CRIT_DAMAGE: 'critDamage',
	XP_GAIN: 'xpGain',
	MONEY_GAIN: 'moneyGain',
	DURATION: 'duration'
};

export const Upgrades = {
	damage_1: {
		id: 'damage_1',
		name: 'Force',
		description: 'Augmente les dégâts de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.DAMAGE,
		value: 1.05,
		requires: [],
		excludes: [],
		grants: []
	},
	damage_2: {
		id: 'damage_2',
		name: 'Force',
		description: 'Augmente les dégâts de 10%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.DAMAGE,
		value: 1.1,
		requires: [],
		excludes: [],
		grants: []
	},
	attackSpeed_1: {
		id: 'attackSpeed_1',
		name: 'Vitesse',
		description: 'Augmente la vitesse d\'attaque de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.ATTACK_SPEED,
		value: 1.05,
		requires: [],
		excludes: [],
		grants: []
	},
	attackSpeed_2: {
		id: 'attackSpeed_2',
		name: 'Vitesse',
		description: 'Augmente la vitesse d\'attaque de 10%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.ATTACK_SPEED,
		value: 1.1,
		requires: [],
		excludes: [],
		grants: []
	},
	range_1: {
		id: 'range_1',
		name: 'Portée',
		description: 'Augmente la portée de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.RANGE,
		value: 1.05,
		requires: [],
		excludes: [],
		grants: []
	},
	range_2: {
		id: 'range_2',
		name: 'Portée',
		description: 'Augmente la portée de 5%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.RANGE,
		value: 1.05,
		requires: [],
		excludes: [],
		grants: []
	},
	speed_1: {
		id: 'speed_1',
		name: 'Mobilité',
		description: 'Augmente la vitesse de déplacement de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.SPEED,
		value: 1.05,
		requires: [],
		excludes: [],
		grants: []
	},
	speed_2: {
		id: 'speed_2',
		name: 'Mobilité',
		description: 'Augmente la vitesse de déplacement de 5%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.SPEED,
		value: 1.05,
		requires: [],
		excludes: [],
		grants: []
	},
	maxHp_1: {
		id: 'maxHp_1',
		name: 'Vitalité',
		description: 'Augmente les HP max de 5',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.MAX_HP,
		value: 5,
		requires: [],
		excludes: [],
		grants: []
	},
	maxHp_2: {
		id: 'maxHp_2',
		name: 'Vitalité',
		description: 'Augmente les HP max de 15',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.MAX_HP,
		value: 15,
		requires: [],
		excludes: [],
		grants: []
	},
	hpRegen_1: {
		id: 'hpRegen_1',
		name: 'Régénération',
		description: 'Régénère 1 HP par seconde',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.HP_REGEN,
		value: 1,
		requires: [],
		excludes: [],
		grants: []
	},
	knockback_1: {
		id: 'knockback_1',
		name: 'Recul',
		description: 'Augmente le recul de 10%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.KNOCKBACK,
		value: 1.1,
		requires: [],
		excludes: [],
		grants: []
	},
	projectileSpeed_1: {
		id: 'projectileSpeed_1',
		name: 'Vélocité',
		description: 'Augmente la vitesse des projectiles de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_SPEED,
		value: 1.1,
		requires: [],
		excludes: [],
		grants: []
	},
	fetchRange_1: {
		id: 'fetchRange_1',
		name: 'Aimant',
		description: 'Augmente la portée de collecte d\'XP de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.FETCH_RANGE,
		value: 1.1,
		requires: [],
		excludes: [],
		grants: []
	},
	fetchRange_2: {
		id: 'fetchRange_2',
		name: 'Aimant',
		description: 'Augmente la portée de collecte d\'XP de 20%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.FETCH_RANGE,
		value: 1.2,
		requires: [],
		excludes: [],
		grants: []
	},
	critChance_1: {
		id: 'critChance_1',
		name: 'Chance Crit',
		description: 'Augmente la chance de coup critique de 5%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.CRIT_CHANCE,
		value: 0.05,
		requires: [],
		excludes: [],
		grants: []
	},
	critChance_2: {
		id: 'critChance_2',
		name: 'Chance Crit',
		description: 'Augmente la chance de coup critique de 5%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.CRIT_CHANCE,
		value: 0.05,
		requires: [],
		excludes: [],
		grants: []
	},
	critDamage_1: {
		id: 'critDamage_1',
		name: 'Dégâts Crit',
		description: 'Augmente les dégâts critiques de 0.1x',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.CRIT_DAMAGE,
		value: 0.1,
		requires: [],
		excludes: [],
		grants: []
	},
	critDamage_2: {
		id: 'critDamage_2',
		name: 'Dégâts Crit',
		description: 'Augmente les dégâts critiques de 0.15x',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.CRIT_DAMAGE,
		value: 0.15,
		requires: [],
		excludes: [],
		grants: []
	},
	xpGain_1: {
		id: 'xpGain_1',
		name: 'XP',
		description: 'Augmente l\'XP gagnée de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.XP_GAIN,
		value: 1.1,
		requires: [],
		excludes: [],
		grants: []
	},
	xpGain_2: {
		id: 'xpGain_2',
		name: 'XP',
		description: 'Augmente l\'XP gagnée de 15%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.XP_GAIN,
		value: 1.15,
		requires: [],
		excludes: [],
		grants: []
	},
	moneyGain_1: {
		id: 'moneyGain_1',
		name: 'Pokedollars',
		description: 'Augmente les Pokedollars gagnés de 10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.MONEY_GAIN,
		value: 1.1,
		requires: [],
		excludes: [],
		grants: []
	},
	moneyGain_2: {
		id: 'moneyGain_2',
		name: 'Pokedollars',
		description: 'Augmente les Pokedollars gagnés de 20%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.MONEY_GAIN,
		value: 1.2,
		requires: [],
		excludes: [],
		grants: []
	},
	projectileAoe_1: {
		id: 'projectileAoe_1',
		name: 'Explosion',
		description: 'Les projectiles infligent des dégâts de zone',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_AOE,
		grants: [UpgradeType.PROJECTILE_AOE],
		excludes: [UpgradeType.PROJECTILE_PIERCING, UpgradeType.PROJECTILE_BOUNCE],
		requires: []
	},
	projectilePiercing_1: {
		id: 'projectilePiercing_1',
		name: 'Perforation',
		description: 'Les projectiles traversent les ennemis',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_PIERCING,
		grants: [UpgradeType.PROJECTILE_PIERCING],
		excludes: [UpgradeType.PROJECTILE_AOE, UpgradeType.PROJECTILE_BOUNCE],
		requires: []
	},
	projectileBounce_1: {
		id: 'projectileBounce_1',
		name: 'Rebond',
		description: 'Les projectiles rebondissent sur les ennemis',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_BOUNCE,
		grants: [UpgradeType.PROJECTILE_BOUNCE],
		excludes: [UpgradeType.PROJECTILE_AOE, UpgradeType.PROJECTILE_PIERCING],
		requires: []
	},
	projectileEffect_1: {
		id: 'projectileEffect_1',
		name: 'Effet',
		description: 'Les projectiles ont une chance de déclencher un effet selon le type de l\'ennemi',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PROJECTILE_EFFECT,
		grants: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		requires: []
	},
	aoeRadius_common: {
		id: 'aoeRadius_common',
		name: 'Rayon Explosion',
		description: 'Augmente le rayon d\'explosion de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.AOE_RADIUS,
		value: 1.05,
		requires: [UpgradeType.PROJECTILE_AOE],
		excludes: [],
		grants: []
	},
	aoeRadius_rare: {
		id: 'aoeRadius_rare',
		name: 'Rayon Explosion',
		description: 'Augmente le rayon d\'explosion de 7%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.AOE_RADIUS,
		value: 1.07,
		requires: [UpgradeType.PROJECTILE_AOE],
		excludes: [],
		grants: []
	},
	aoeRadius_epic: {
		id: 'aoeRadius_epic',
		name: 'Rayon Explosion',
		description: 'Augmente le rayon d\'explosion de 10%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.AOE_RADIUS,
		value: 1.10,
		requires: [UpgradeType.PROJECTILE_AOE],
		excludes: [],
		grants: []
	},
	aoeRadius_legendary: {
		id: 'aoeRadius_legendary',
		name: 'Rayon Explosion',
		description: 'Augmente le rayon d\'explosion de 20%',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.AOE_RADIUS,
		value: 1.20,
		requires: [UpgradeType.PROJECTILE_AOE],
		excludes: [],
		grants: []
	},
	aoeDamage_common: {
		id: 'aoeDamage_common',
		name: 'Dégâts Explosion',
		description: 'Augmente les dégâts d\'explosion de 5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.AOE_DAMAGE,
		value: 1.05,
		requires: [UpgradeType.PROJECTILE_AOE],
		excludes: [],
		grants: []
	},
	aoeDamage_rare: {
		id: 'aoeDamage_rare',
		name: 'Dégâts Explosion',
		description: 'Augmente les dégâts d\'explosion de 7%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.AOE_DAMAGE,
		value: 1.07,
		requires: [UpgradeType.PROJECTILE_AOE],
		excludes: [],
		grants: []
	},
	aoeDamage_epic: {
		id: 'aoeDamage_epic',
		name: 'Dégâts Explosion',
		description: 'Augmente les dégâts d\'explosion de 10%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.AOE_DAMAGE,
		value: 1.10,
		requires: [UpgradeType.PROJECTILE_AOE],
		excludes: [],
		grants: []
	},
	aoeDamage_legendary: {
		id: 'aoeDamage_legendary',
		name: 'Dégâts Explosion',
		description: 'Augmente les dégâts d\'explosion de 20%',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.AOE_DAMAGE,
		value: 1.20,
		requires: [UpgradeType.PROJECTILE_AOE],
		excludes: [],
		grants: []
	},
	piercingDamageReduction_common: {
		id: 'piercingDamageReduction_common',
		name: 'Efficacité Perforatione',
		description: 'Réduit la perte de dégâts de 2% par ennemi',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PIERCING_DAMAGE_REDUCTION,
		value: 0.02,
		requires: [UpgradeType.PROJECTILE_PIERCING],
		excludes: [],
		grants: []
	},
	piercingDamageReduction_rare: {
		id: 'piercingDamageReduction_rare',
		name: 'Efficacité Perforatione',
		description: 'Réduit la perte de dégâts de 3% par ennemi',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.PIERCING_DAMAGE_REDUCTION,
		value: 0.03,
		requires: [UpgradeType.PROJECTILE_PIERCING],
		excludes: [],
		grants: []
	},
	piercingDamageReduction_epic: {
		id: 'piercingDamageReduction_epic',
		name: 'Efficacité Perforatione',
		description: 'Réduit la perte de dégâts de 5% par ennemi',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.PIERCING_DAMAGE_REDUCTION,
		value: 0.05,
		requires: [UpgradeType.PROJECTILE_PIERCING],
		excludes: [],
		grants: []
	},
	piercingDamageReduction_legendary: {
		id: 'piercingDamageReduction_legendary',
		name: 'Efficacité Perforatione',
		description: 'Réduit la perte de dégâts de 8% par ennemi',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.PIERCING_DAMAGE_REDUCTION,
		value: 0.08,
		requires: [UpgradeType.PROJECTILE_PIERCING],
		excludes: [],
		grants: []
	},
	piercingMaxCount_common: {
		id: 'piercingMaxCount_common',
		name: 'Transperçage',
		description: 'Augmente le nombre d\'ennemis transpercables de +1',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.PIERCING_MAX_COUNT,
		value: 1,
		requires: [UpgradeType.PROJECTILE_PIERCING],
		excludes: [],
		grants: []
	},
	piercingMaxCount_rare: {
		id: 'piercingMaxCount_rare',
		name: 'Transperçage',
		description: 'Augmente le nombre d\'ennemis transpercables de +2',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.PIERCING_MAX_COUNT,
		value: 2,
		requires: [UpgradeType.PROJECTILE_PIERCING],
		excludes: [],
		grants: []
	},
	piercingMaxCount_epic: {
		id: 'piercingMaxCount_epic',
		name: 'Transperçage',
		description: 'Augmente le nombre d\'ennemis transpercables de +3',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.PIERCING_MAX_COUNT,
		value: 3,
		requires: [UpgradeType.PROJECTILE_PIERCING],
		excludes: [],
		grants: []
	},
	piercingMaxCount_legendary: {
		id: 'piercingMaxCount_legendary',
		name: 'Transperçage',
		description: 'Augmente le nombre d\'ennemis transpercables de +5',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.PIERCING_MAX_COUNT,
		value: 5,
		requires: [UpgradeType.PROJECTILE_PIERCING],
		excludes: [],
		grants: []
	},
	bounceMaxCount_common: {
		id: 'bounceMaxCount_common',
		name: 'Rebonds',
		description: 'Augmente le nombre maximum de rebonds de +1',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.BOUNCE_MAX_COUNT,
		value: 1,
		requires: [UpgradeType.PROJECTILE_BOUNCE],
		excludes: [],
		grants: []
	},
	bounceMaxCount_rare: {
		id: 'bounceMaxCount_rare',
		name: 'Rebonds',
		description: 'Augmente le nombre maximum de rebonds de +2',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.BOUNCE_MAX_COUNT,
		value: 2,
		requires: [UpgradeType.PROJECTILE_BOUNCE],
		excludes: [],
		grants: []
	},
	bounceMaxCount_epic: {
		id: 'bounceMaxCount_epic',
		name: 'Rebonds',
		description: 'Augmente le nombre maximum de rebonds de +3',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.BOUNCE_MAX_COUNT,
		value: 3,
		requires: [UpgradeType.PROJECTILE_BOUNCE],
		excludes: [],
		grants: []
	},
	bounceMaxCount_legendary: {
		id: 'bounceMaxCount_legendary',
		name: 'Rebonds',
		description: 'Augmente le nombre maximum de rebonds de +5',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.BOUNCE_MAX_COUNT,
		value: 5,
		requires: [UpgradeType.PROJECTILE_BOUNCE],
		excludes: [],
		grants: []
	},
	bounceDetectionRange_common: {
		id: 'bounceDetectionRange_common',
		name: 'Portée Rebond',
		description: 'Augmente le rayon de détection de rebond de 50',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.BOUNCE_DETECTION_RANGE,
		value: 50,
		requires: [UpgradeType.PROJECTILE_BOUNCE],
		excludes: [],
		grants: []
	},
	bounceDetectionRange_rare: {
		id: 'bounceDetectionRange_rare',
		name: 'Portée Rebond',
		description: 'Augmente le rayon de détection de rebond de 75',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.BOUNCE_DETECTION_RANGE,
		value: 75,
		requires: [UpgradeType.PROJECTILE_BOUNCE],
		excludes: [],
		grants: []
	},
	bounceDetectionRange_epic: {
		id: 'bounceDetectionRange_epic',
		name: 'Portée Rebond',
		description: 'Augmente le rayon de détection de rebond de 100',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.BOUNCE_DETECTION_RANGE,
		value: 100,
		requires: [UpgradeType.PROJECTILE_BOUNCE],
		excludes: [],
		grants: []
	},
	bounceDetectionRange_legendary: {
		id: 'bounceDetectionRange_legendary',
		name: 'Portée Rebond',
		description: 'Augmente le rayon de détection de rebond de 150',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.BOUNCE_DETECTION_RANGE,
		value: 150,
		requires: [UpgradeType.PROJECTILE_BOUNCE],
		excludes: [],
		grants: []
	},
	effectProcChance_common: {
		id: 'effectProcChance_common',
		name: 'Chance Effet',
		description: 'Augmente les chances de déclencher un effet de +5%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.EFFECT_PROC_CHANCE,
		value: 0.05,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectProcChance_rare: {
		id: 'effectProcChance_rare',
		name: 'Chance Effet',
		description: 'Augmente les chances de déclencher un effet de +7%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.EFFECT_PROC_CHANCE,
		value: 0.07,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectProcChance_epic: {
		id: 'effectProcChance_epic',
		name: 'Chance Effet',
		description: 'Augmente les chances de déclencher un effet de +10%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.EFFECT_PROC_CHANCE,
		value: 0.10,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectProcChance_legendary: {
		id: 'effectProcChance_legendary',
		name: 'Chance Effet',
		description: 'Augmente les chances de déclencher un effet de +20%',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.EFFECT_PROC_CHANCE,
		value: 0.20,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectDamage_common: {
		id: 'effectDamage_common',
		name: 'Dégâts Effet',
		description: 'Augmente les dégâts des effets de +10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.EFFECT_DAMAGE,
		value: 1.10,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectDamage_rare: {
		id: 'effectDamage_rare',
		name: 'Dégâts Effet',
		description: 'Augmente les dégâts des effets de +15%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.EFFECT_DAMAGE,
		value: 1.15,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectDamage_epic: {
		id: 'effectDamage_epic',
		name: 'Dégâts Effet',
		description: 'Augmente les dégâts des effets de +20%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.EFFECT_DAMAGE,
		value: 1.20,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectDamage_legendary: {
		id: 'effectDamage_legendary',
		name: 'Dégâts Effet',
		description: 'Augmente les dégâts des effets de +30%',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.EFFECT_DAMAGE,
		value: 1.30,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectIntensity_common: {
		id: 'effectIntensity_common',
		name: 'Intensité Effet',
		description: 'Augmente l\'intensité des effets de +10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.EFFECT_INTENSITY,
		value: 1.10,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectIntensity_rare: {
		id: 'effectIntensity_rare',
		name: 'Intensité Effet',
		description: 'Augmente l\'intensité des effets de +15%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.EFFECT_INTENSITY,
		value: 1.15,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectIntensity_epic: {
		id: 'effectIntensity_epic',
		name: 'Intensité Effet',
		description: 'Augmente l\'intensité des effets de +20%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.EFFECT_INTENSITY,
		value: 1.20,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectIntensity_legendary: {
		id: 'effectIntensity_legendary',
		name: 'Intensité Effet',
		description: 'Augmente l\'intensité des effets de +30%',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.EFFECT_INTENSITY,
		value: 1.30,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectDuration_common: {
		id: 'effectDuration_common',
		name: 'Durée Effet',
		description: 'Augmente la durée des effets de +10%',
		rarity: UpgradeRarity.COMMON,
		type: UpgradeType.EFFECT_DURATION,
		value: 1.10,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectDuration_rare: {
		id: 'effectDuration_rare',
		name: 'Durée Effet',
		description: 'Augmente la durée des effets de +15%',
		rarity: UpgradeRarity.RARE,
		type: UpgradeType.EFFECT_DURATION,
		value: 1.15,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectDuration_epic: {
		id: 'effectDuration_epic',
		name: 'Durée Effet',
		description: 'Augmente la durée des effets de +20%',
		rarity: UpgradeRarity.EPIC,
		type: UpgradeType.EFFECT_DURATION,
		value: 1.20,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
	},
	effectDuration_legendary: {
		id: 'effectDuration_legendary',
		name: 'Durée Effet',
		description: 'Augmente la durée des effets de +30%',
		rarity: UpgradeRarity.LEGENDARY,
		type: UpgradeType.EFFECT_DURATION,
		value: 1.30,
		requires: [UpgradeType.PROJECTILE_EFFECT],
		excludes: [],
		grants: []
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
	[UpgradeType.PROJECTILE_EFFECT]: '✨',
	[UpgradeType.AOE_RADIUS]: '📏',
	[UpgradeType.AOE_DAMAGE]: '💥',
	[UpgradeType.PIERCING_DAMAGE_REDUCTION]: '⚔',
	[UpgradeType.PIERCING_MAX_COUNT]: '➡',
	[UpgradeType.BOUNCE_MAX_COUNT]: '↻',
	[UpgradeType.BOUNCE_DETECTION_RANGE]: '◎',
	[UpgradeType.EFFECT_PROC_CHANCE]: '🎲',
	[UpgradeType.EFFECT_DAMAGE]: '💥',
	[UpgradeType.EFFECT_INTENSITY]: '⚡',
	[UpgradeType.EFFECT_DURATION]: '⏱',
	[UpgradeType.FETCH_RANGE]: '✦',
	[UpgradeType.CRIT_CHANCE]: '★',
	[UpgradeType.CRIT_DAMAGE]: '✦',
	[UpgradeType.XP_GAIN]: '⭐',
	[UpgradeType.MONEY_GAIN]: '💰',
	[UpgradeType.DURATION]: '⏱'
};

function playerHasUpgradeType(player, upgradeType) {
	if (!player || !player.upgrades) return false;
	
	for (const upgradeId in player.upgrades) {
		const upgrade = Upgrades[upgradeId];
		if (upgrade && upgrade.type === upgradeType) {
			return true;
		}
	}
	
	return false;
}

function getPlayerUpgradeTypes(player) {
	if (!player || !player.upgrades) return new Set();
	
	const types = new Set();
	for (const upgradeId in player.upgrades) {
		const upgrade = Upgrades[upgradeId];
		if (upgrade) {
			if (upgrade.grants && upgrade.grants.length > 0) {
				upgrade.grants.forEach(type => types.add(type));
			} else {
				types.add(upgrade.type);
			}
		}
	}
	
	return types;
}

export function getRandomUpgrades(count, playerUpgrades, player = null) {
	const isMelee = player && player.pokemonConfig && player.pokemonConfig.attackType === 'melee';
	const allProjectileUpgrades = [
		UpgradeType.PROJECTILE_SPEED,
		UpgradeType.PROJECTILE_AOE,
		UpgradeType.PROJECTILE_PIERCING,
		UpgradeType.PROJECTILE_BOUNCE,
		UpgradeType.PROJECTILE_EFFECT
	];
	
	const projectileModeTypes = [
		UpgradeType.PROJECTILE_AOE,
		UpgradeType.PROJECTILE_PIERCING,
		UpgradeType.PROJECTILE_BOUNCE
	];
	
	const playerUpgradeTypes = getPlayerUpgradeTypes(player);
	const hasMainProjectileMode = projectileModeTypes.some(type => playerUpgradeTypes.has(type));
	
	const availableUpgrades = Object.values(Upgrades).filter(upgrade => {
		if (isMelee && allProjectileUpgrades.includes(upgrade.type)) {
			return false;
		}
		
		if (!upgrade.requires) upgrade.requires = [];
		if (!upgrade.excludes) upgrade.excludes = [];
		if (!upgrade.grants) upgrade.grants = [];
		
		if (upgrade.grants && upgrade.grants.length > 0) {
			for (const grantedType of upgrade.grants) {
				if (playerUpgradeTypes.has(grantedType)) {
					return false;
				}
			}
		}
		
		for (const requiredType of upgrade.requires) {
			if (!playerUpgradeTypes.has(requiredType)) {
				return false;
			}
		}
		
		for (const excludedType of upgrade.excludes) {
			if (playerUpgradeTypes.has(excludedType)) {
				return false;
			}
		}
		
		if (player && playerUpgrades) {
			for (const grantedType of upgrade.grants) {
				for (const existingUpgradeId in playerUpgrades) {
					const existingUpgrade = Upgrades[existingUpgradeId];
					if (existingUpgrade && existingUpgrade.excludes) {
						if (existingUpgrade.excludes.includes(grantedType)) {
							return false;
						}
					}
				}
			}
		}
		
		return true;
	});

	if (availableUpgrades.length === 0) return [];

	const selected = [];
	const used = new Set();
	const usedTypes = new Set();
	
	const getUpgradeWeight = (upgrade) => {
		let weight = RarityWeights[upgrade.rarity];
		
		if (upgrade.grants && upgrade.grants.length > 0) {
			const isProjectileMode = upgrade.grants.some(type => 
				projectileModeTypes.includes(type) || type === UpgradeType.PROJECTILE_EFFECT
			);
			
			if (isProjectileMode) {
				if (!hasMainProjectileMode) {
					weight += RarityWeights[upgrade.rarity] * 4.0;
				} else if (upgrade.grants.includes(UpgradeType.PROJECTILE_EFFECT) && 
				          !playerUpgradeTypes.has(UpgradeType.PROJECTILE_EFFECT)) {
					weight += RarityWeights[upgrade.rarity] * 2.0;
				}
			}
		}
		
		if (hasMainProjectileMode && upgrade.requires && upgrade.requires.length > 0) {
			const requiresProjectileMode = upgrade.requires.some(type => 
				projectileModeTypes.includes(type) || type === UpgradeType.PROJECTILE_EFFECT
			);
			if (requiresProjectileMode) {
				weight += RarityWeights[upgrade.rarity] * 1.5;
			}
		}
		
		return weight;
	};

	for (let i = 0; i < count && selected.length < availableUpgrades.length; i++) {
		const eligibleUpgrades = availableUpgrades.filter(u => {
			if (used.has(u.id)) return false;
			if (usedTypes.has(u.type)) return false;
			
			if (u.grants && u.grants.length > 0) {
				for (const grantedType of u.grants) {
					if (usedTypes.has(grantedType)) return false;
				}
			}
			
			return true;
		});
		
		if (eligibleUpgrades.length === 0) break;
		
		const totalWeight = eligibleUpgrades.reduce((sum, u) => sum + getUpgradeWeight(u), 0);
		
		let random = Math.random() * totalWeight;

		for (const upgrade of eligibleUpgrades) {
			random -= getUpgradeWeight(upgrade);
			if (random <= 0) {
				selected.push(upgrade);
				used.add(upgrade.id);
				usedTypes.add(upgrade.type);
				if (upgrade.grants && upgrade.grants.length > 0) {
					upgrade.grants.forEach(type => usedTypes.add(type));
				}
				break;
			}
		}
	}

	return selected;
}

