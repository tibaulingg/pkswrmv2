export const Maps = [
	{
		id: 0,
		name: 'Forêt',
		image: 'forest',
		bossImage: 'forest', // Image pour l'étage du boss (à créer: forest_boss.png si nécessaire)
		bossType: 'boss_pikachu',
		minFloors: 2,
		maxFloors: 3,
		mobsPerFloor: 3, // Nombre de mobs à tuer pour faire apparaître l'escalier
		// Configuration du scaling des ennemis
		enemyScaling: {
			baseLevel: 1,           // Niveau de base au premier étage
			levelPerFloor: 1,       // Augmentation de niveau par étage
			levelPerMinute: 0.5,    // Augmentation de niveau par minute dans l'étage
			maxLevel: 100           // Niveau maximum
		},
		arrowX: 835,
		arrowY: 415,
		// Point d'arrivée dans la map finale (depuis lequel le joueur apparaît)
		finalMapSpawn: {
			x: 239,      // Position X absolue en pixels
			y: 90,       // Position Y absolue en pixels
			direction: 'down'  // Direction vers laquelle le joueur regarde ('down', 'up', 'left', 'right')
		},
		// Configuration du coffre dans la map finale
		finalMapChest: {
			x: 235,      // Position X absolue en pixels
			y: 194,      // Position Y absolue en pixels (ajusté pour être visible dans la map 480x376)
			// Probabilités pour chaque type de coffre (doivent sommer à 1.0)
			probabilities: {
				basic_chest: 0.5,   // 50% de chance
				rare_chest: 0.3,    // 30% de chance
				epic_chest: 0.2     // 20% de chance
			}
		}
	},
	{
		id: 1,
		name: 'Montagne',
		image: 'montain',
		bossImage: 'montain', // Image pour l'étage du boss (à créer: montain_boss.png si nécessaire)
		bossType: 'boss_rhydon',
		minFloors: 8,
		maxFloors: 12,
		mobsPerFloor: 15, // Nombre de mobs à tuer pour faire apparaître l'escalier
		// Configuration du scaling des ennemis
		enemyScaling: {
			baseLevel: 1,           // Niveau de base au premier étage
			levelPerFloor: 3,       // Augmentation de niveau par étage
			levelPerMinute: 0.5,    // Augmentation de niveau par minute dans l'étage
			maxLevel: 100           // Niveau maximum
		},
		arrowX: 900,
		arrowY: 500,
		// Point d'arrivée dans la map finale (depuis lequel le joueur apparaît)
		finalMapSpawn: {
			x: 239,      // Position X absolue en pixels
			y: 90,       // Position Y absolue en pixels
			direction: 'down'  // Direction vers laquelle le joueur regarde ('down', 'up', 'left', 'right')
		},
		// Configuration du coffre dans la map finale
		finalMapChest: {
			x: 200,      // Position X absolue en pixels
			y: 250,      // Position Y absolue en pixels (ajusté pour être visible dans la map)
			// Probabilités pour chaque type de coffre (doivent sommer à 1.0)
			probabilities: {
				basic_chest: 0.50,
				rare_chest: 0.25,
				epic_chest: 0.15,
				legendary_chest: 0.10
			}
		}
	},
];

export function getMapConfig(mapId) {
	return Maps.find(map => map.id === mapId);
}

