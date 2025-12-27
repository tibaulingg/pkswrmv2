export const SkillTreeConfig = {
	"branches": [
		{
			"id": "puissance",
			"name": "Puissance",
			"nodes": [
				{
					"id": "damage_1",
					"name": "+5% dégâts globaux",
					"cost": 2000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"damageMultiplier": 1.05},
					"requirements": []
				},
				{
					"id": "damage_2",
					"name": "+10% dégâts globaux",
					"cost": 4000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"damageMultiplier": 1.10},
					"requirements": ["damage_1"]
				},
				{
					"id": "projectile_speed",
					"name": "+10% vitesse des projectiles",
					"cost": 5000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"projectileSpeedMultiplier": 1.10},
					"requirements": ["damage_1"]
				},
				{
					"id": "crit_chance",
					"name": "+2% chance de critique",
					"cost": 7000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"critChance": 0.02},
					"requirements": ["damage_2"]
				},
				{
					"id": "crit_damage",
					"name": "+10% dégâts critiques",
					"cost": 8000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"critDamage": 0.10},
					"requirements": ["crit_chance"]
				},
				{
					"id": "attack_speed",
					"name": "+5% vitesse d'attaque",
					"cost": 6000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"attackSpeedMultiplier": 1.05},
					"requirements": []
				},
				{
					"id": "range",
					"name": "+10% portée d'attaque",
					"cost": 5000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"rangeMultiplier": 1.10},
					"requirements": []
				}
			]
		},
		{
			"id": "survie",
			"name": "Survie",
			"nodes": [
				{
					"id": "hp_1",
					"name": "+10% HP max pour tous les Pokémon",
					"cost": 3000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"hpMultiplier": 1.10},
					"requirements": []
				},
				{
					"id": "regen_1",
					"name": "+0.5 HP/s",
					"cost": 4000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"regen": 0.5},
					"requirements": ["hp_1"]
				},
				{
					"id": "speed",
					"name": "+5% vitesse de déplacement",
					"cost": 4000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"speedMultiplier": 1.05},
					"requirements": []
				},
				{
					"id": "knockback",
					"name": "+10% repoussement",
					"cost": 5000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"knockbackMultiplier": 1.10},
					"requirements": []
				}
			]
		},
		{
			"id": "loot",
			"name": "Loot",
			"nodes": [
				{
					"id": "xp_gain",
					"name": "+10% gain d'XP",
					"cost": 7000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"xpGainMultiplier": 1.10},
					"requirements": []
				},
				{
					"id": "money_gain",
					"name": "+10% gain d'argent",
					"cost": 7000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"moneyGainMultiplier": 1.10},
					"requirements": []
				},
				{
					"id": "fetch_range",
					"name": "+20% portée de collecte",
					"cost": 5000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"fetchRangeMultiplier": 1.20},
					"requirements": []
				},
				{
					"id": "drop_chance_1",
					"name": "+2% chance de drop",
					"cost": 5000,
					"maxRank": 3,
					"currentRank": 0,
					"effect": {"baseDropChance": 0.02},
					"requirements": []
				},
				{
					"id": "drop_chance_2",
					"name": "+3% chance de drop",
					"cost": 10000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"baseDropChance": 0.03},
					"requirements": ["drop_chance_1"]
				},
				{
					"id": "epic_chance_1",
					"name": "+1% chance d'item épic",
					"cost": 8000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"epicDropChance": 0.01},
					"requirements": []
				},
				{
					"id": "epic_chance_2",
					"name": "+2% chance d'item épic",
					"cost": 15000,
					"maxRank": 1,
					"currentRank": 0,
					"effect": {"epicDropChance": 0.02},
					"requirements": ["epic_chance_1"]
				}
			]
		},
		{
			"id": "pokemon",
			"name": "Pokémon",
			"nodes": [
				{
					"id": "hatch_speed_1",
					"name": "-10% temps d'éclosion",
					"cost": 6000,
					"maxRank": 3,
					"currentRank": 0,
					"effect": {"eggHatchSpeedMultiplier": 0.90},
					"requirements": []
				},
				{
					"id": "hatch_speed_2",
					"name": "-15% temps d'éclosion",
					"cost": 10000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"eggHatchSpeedMultiplier": 0.85},
					"requirements": ["hatch_speed_1"]
				},
				{
					"id": "iv_bonus_1",
					"name": "+5 IV minimum aux œufs",
					"cost": 8000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"eggIVBonus": 5},
					"requirements": []
				},
				{
					"id": "iv_bonus_2",
					"name": "+10 IV minimum aux œufs",
					"cost": 14000,
					"maxRank": 1,
					"currentRank": 0,
					"effect": {"eggIVBonus": 10},
					"requirements": ["iv_bonus_1"]
				},
				{
					"id": "item_loss_reduction_1",
					"name": "-10% items perdus à la mort",
					"cost": 8000,
					"maxRank": 3,
					"currentRank": 0,
					"effect": {"itemLossReduction": 0.10},
					"requirements": []
				},
				{
					"id": "item_loss_reduction_2",
					"name": "-20% items perdus à la mort",
					"cost": 16000,
					"maxRank": 1,
					"currentRank": 0,
					"effect": {"itemLossReduction": 0.20},
					"requirements": ["item_loss_reduction_1"]
				},
				{
					"id": "shiny_chance_1",
					"name": "+0.1% chance shiny",
					"cost": 10000,
					"maxRank": 3,
					"currentRank": 0,
					"effect": {"shinyChance": 0.001},
					"requirements": []
				},
				{
					"id": "shiny_chance_2",
					"name": "+0.5% chance shiny",
					"cost": 20000,
					"maxRank": 2,
					"currentRank": 0,
					"effect": {"shinyChance": 0.005},
					"requirements": ["shiny_chance_1"]
				}
			]
		}
	]
};

export function getSkillTreeConfig() {
	return SkillTreeConfig;
}

export function getNodeById(nodeId) {
	for (const branch of SkillTreeConfig.branches) {
		const node = branch.nodes.find(n => n.id === nodeId);
		if (node) return node;
	}
	return null;
}

export function getBranchById(branchId) {
	return SkillTreeConfig.branches.find(b => b.id === branchId);
}
