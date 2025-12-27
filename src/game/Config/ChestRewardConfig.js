/**
 * Configuration des récompenses des coffres
 * 
 * Structure :
 * - rarityChances : Probabilités d'obtenir chaque rareté d'item selon le type de coffre
 * - quantities : Quantités min/max pour chaque rareté d'item
 * - itemCount : Nombre d'items différents dans chaque coffre (min/max)
 */

export const ChestRewardConfig = {
	// Coffre commun (basic_chest)
	basic_chest: {
		// Probabilités de rareté d'item (doivent totaliser 100% ou moins)
		rarityChances: {
			common: 0.70,    // 70% chance d'item commun
			rare: 0.20,       // 20% chance d'item rare
			epic: 0.10,       // 10% chance d'item épique
			legendary: 0.00   // 0% chance d'item légendaire
		},
		// Quantités pour chaque rareté [min, max]
		quantities: {
			common: [1, 3],   // 1 à 3 items communs
			rare: [1, 2],     // 1 à 2 items rares
			epic: [1, 1],     // 1 item épique
			legendary: [1, 1] // 1 item légendaire
		},
		// Nombre d'items différents dans le coffre [min, max]
		itemCount: [2, 4]
	},
	
	// Coffre rare (rare_chest)
	rare_chest: {
		rarityChances: {
			common: 0.40,    // 40% chance d'item commun
			rare: 0.40,       // 40% chance d'item rare
			epic: 0.15,       // 15% chance d'item épique
			legendary: 0.05   // 5% chance d'item légendaire
		},
		quantities: {
			common: [1, 3],
			rare: [1, 2],
			epic: [1, 1],
			legendary: [1, 1]
		},
		itemCount: [2, 5]
	},
	
	// Coffre épique (epic_chest)
	epic_chest: {
		rarityChances: {
			common: 0.20,    // 20% chance d'item commun
			rare: 0.30,       // 30% chance d'item rare
			epic: 0.35,       // 35% chance d'item épique
			legendary: 0.15   // 15% chance d'item légendaire
		},
		quantities: {
			common: [1, 3],
			rare: [1, 2],
			epic: [1, 2],     // 1 à 2 items épiques
			legendary: [1, 1]
		},
		itemCount: [3, 6]
	},
	
	// Coffre légendaire (legendary_chest)
	legendary_chest: {
		rarityChances: {
			common: 0.10,    // 10% chance d'item commun
			rare: 0.20,       // 20% chance d'item rare
			epic: 0.40,       // 40% chance d'item épique
			legendary: 0.30   // 30% chance d'item légendaire
		},
		quantities: {
			common: [1, 3],
			rare: [1, 2],
			epic: [1, 2],
			legendary: [1, 2] // 1 à 2 items légendaires
		},
		itemCount: [4, 8]
	}
};

/**
 * Obtient la configuration pour un type de coffre
 * @param {string} chestId - ID du coffre (basic_chest, rare_chest, etc.)
 * @returns {object|null} Configuration du coffre ou null si non trouvé
 */
export function getChestRewardConfig(chestId) {
	return ChestRewardConfig[chestId] || null;
}

/**
 * Génère une rareté aléatoire basée sur les probabilités
 * @param {object} rarityChances - Objet avec les probabilités de rareté
 * @returns {string} Rareté sélectionnée ('common', 'rare', 'epic', 'legendary')
 */
export function rollRarity(rarityChances) {
	const random = Math.random();
	let cumulative = 0;
	
	// Parcourir les raretés dans l'ordre (du plus rare au plus commun pour prioriser les rares)
	const rarities = ['legendary', 'epic', 'rare', 'common'];
	
	for (const rarity of rarities) {
		cumulative += rarityChances[rarity] || 0;
		if (random <= cumulative) {
			return rarity;
		}
	}
	
	// Fallback : retourner 'common' si aucune rareté n'a été sélectionnée
	return 'common';
}

/**
 * Génère une quantité aléatoire pour une rareté donnée
 * @param {object} quantities - Objet avec les quantités min/max par rareté
 * @param {string} rarity - Rareté de l'item
 * @returns {number} Quantité générée
 */
export function rollQuantity(quantities, rarity) {
	const [min, max] = quantities[rarity] || [1, 1];
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Génère le nombre d'items différents dans un coffre
 * @param {array} itemCountRange - [min, max] pour le nombre d'items
 * @returns {number} Nombre d'items différents
 */
export function rollItemCount(itemCountRange) {
	const [min, max] = itemCountRange;
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

