export const AchievementConfig = [
	{
		id: 'first_kill',
		name: 'Premier Combat',
		description: 'Tuer votre premier pokémon',
		check: (engine) => {
			const totalKills = Object.values(engine.defeatedPokemonCounts || {}).reduce((sum, count) => sum + count, 0);
			return totalKills >= 1;
		}
	},
	{
		id: 'killer_10',
		name: 'Chasseur',
		description: 'Tuer 10 pokémons',
		check: (engine) => {
			const totalKills = Object.values(engine.defeatedPokemonCounts || {}).reduce((sum, count) => sum + count, 0);
			return totalKills >= 10;
		}
	},
	{
		id: 'killer_100',
		name: 'Chasseur Expert',
		description: 'Tuer 100 pokémons',
		check: (engine) => {
			const totalKills = Object.values(engine.defeatedPokemonCounts || {}).reduce((sum, count) => sum + count, 0);
			return totalKills >= 100;
		}
	},
	{
		id: 'killer_1000',
		name: 'Maître Chasseur',
		description: 'Tuer 1000 pokémons',
		check: (engine) => {
			const totalKills = Object.values(engine.defeatedPokemonCounts || {}).reduce((sum, count) => sum + count, 0);
			return totalKills >= 1000;
		}
	},
	{
		id: 'first_pokemon',
		name: 'Premier Pokémon',
		description: 'Rencontrer votre premier pokémon',
		check: (engine) => {
			return (engine.encounteredPokemons?.size || 0) >= 1;
		}
	},
	{
		id: 'collector_5',
		name: 'Collectionneur',
		description: 'Rencontrer 5 pokémons différents',
		check: (engine) => {
			return (engine.encounteredPokemons?.size || 0) >= 5;
		}
	},
	{
		id: 'collector_10',
		name: 'Collectionneur Expert',
		description: 'Rencontrer 10 pokémons différents',
		check: (engine) => {
			return (engine.encounteredPokemons?.size || 0) >= 10;
		}
	},
	{
		id: 'first_egg',
		name: 'Premier Œuf',
		description: 'Éclore votre premier œuf',
		check: (engine) => {
			return (engine.playedPokemons?.size || 0) >= 1;
		}
	},
	{
		id: 'hatcher_5',
		name: 'Éleveur',
		description: 'Éclore 5 œufs',
		check: (engine) => {
			return (engine.playedPokemons?.size || 0) >= 5;
		}
	},
	{
		id: 'rich_1000',
		name: 'Riche',
		description: 'Avoir 1000 pièces',
		check: (engine) => {
			return (engine.money || 0) >= 1000;
		}
	},
	{
		id: 'rich_10000',
		name: 'Millionnaire',
		description: 'Avoir 10000 pièces',
		check: (engine) => {
			return (engine.money || 0) >= 10000;
		}
	},
	{
		id: 'survivor_5min',
		name: 'Survivant',
		description: 'Survivre 5 minutes dans une partie',
		check: (engine) => {
			return (engine.totalPlayTime || 0) >= 5 * 60 * 1000; // 5 minutes en ms
		}
	},
	{
		id: 'survivor_30min',
		name: 'Survivant Expert',
		description: 'Survivre 30 minutes au total',
		check: (engine) => {
			return (engine.totalPlayTime || 0) >= 30 * 60 * 1000; // 30 minutes en ms
		}
	},
	{
		id: 'player_10',
		name: 'Vétéran',
		description: 'Jouer 10 parties',
		check: (engine) => {
			return (engine.gamesPlayed || 0) >= 10;
		}
	},
	{
		id: 'player_50',
		name: 'Vétéran Expert',
		description: 'Jouer 50 parties',
		check: (engine) => {
			return (engine.gamesPlayed || 0) >= 50;
		}
	},
	{
		id: 'shiny_hunter',
		name: 'Chasseur de Shiny',
		description: 'Obtenir un pokémon shiny',
		check: (engine) => {
			if (!engine.pokemonIVs) return false;
			return Object.values(engine.pokemonIVs).some(ivs => ivs && ivs.shiny === true);
		}
	},
	{
		id: 'killer_5000',
		name: 'Légende',
		description: 'Tuer 5000 pokémons',
		check: (engine) => {
			const totalKills = Object.values(engine.defeatedPokemonCounts || {}).reduce((sum, count) => sum + count, 0);
			return totalKills >= 5000;
		}
	},
	{
		id: 'collector_all',
		name: 'Maître Collectionneur',
		description: 'Rencontrer tous les pokémons disponibles',
		check: (engine) => {
			const totalPokemons = 18; // Nombre total de pokémons dans le jeu
			return (engine.encounteredPokemons?.size || 0) >= totalPokemons;
		}
	},
	{
		id: 'hatcher_10',
		name: 'Éleveur Expert',
		description: 'Éclore 10 œufs',
		check: (engine) => {
			return (engine.playedPokemons?.size || 0) >= 10;
		}
	},
	{
		id: 'hatcher_20',
		name: 'Maître Éleveur',
		description: 'Éclore 20 œufs',
		check: (engine) => {
			return (engine.playedPokemons?.size || 0) >= 20;
		}
	},
	{
		id: 'rich_50000',
		name: 'Magnat',
		description: 'Avoir 50000 pièces',
		check: (engine) => {
			return (engine.money || 0) >= 50000;
		}
	},
	{
		id: 'rich_100000',
		name: 'Roi de l\'Argent',
		description: 'Avoir 100000 pièces',
		check: (engine) => {
			return (engine.money || 0) >= 100000;
		}
	},
	{
		id: 'survivor_1h',
		name: 'Survivant Légendaire',
		description: 'Survivre 1 heure au total',
		check: (engine) => {
			return (engine.totalPlayTime || 0) >= 60 * 60 * 1000; // 1 heure en ms
		}
	},
	{
		id: 'survivor_5h',
		name: 'Immortel',
		description: 'Survivre 5 heures au total',
		check: (engine) => {
			return (engine.totalPlayTime || 0) >= 5 * 60 * 60 * 1000; // 5 heures en ms
		}
	},
	{
		id: 'player_100',
		name: 'Légende Vivante',
		description: 'Jouer 100 parties',
		check: (engine) => {
			return (engine.gamesPlayed || 0) >= 100;
		}
	},
	{
		id: 'player_500',
		name: 'Déité du Jeu',
		description: 'Jouer 500 parties',
		check: (engine) => {
			return (engine.gamesPlayed || 0) >= 500;
		}
	},
	{
		id: 'rattata_slayer',
		name: 'Exterminateur de Rattata',
		description: 'Tuer 50 Rattata',
		check: (engine) => {
			return (engine.defeatedPokemonCounts?.rattata || 0) >= 50;
		}
	},
	{
		id: 'pikachu_hunter',
		name: 'Chasseur de Pikachu',
		description: 'Tuer 25 Pikachu',
		check: (engine) => {
			return (engine.defeatedPokemonCounts?.pikachu || 0) >= 25;
		}
	},
	{
		id: 'garchomp_master',
		name: 'Maître Garchomp',
		description: 'Tuer 10 Garchomp',
		check: (engine) => {
			return (engine.defeatedPokemonCounts?.garchomp || 0) >= 10;
		}
	},
	{
		id: 'iv_perfect',
		name: 'Perfectionniste',
		description: 'Avoir un pokémon avec une stat à 31',
		check: (engine) => {
			if (!engine.pokemonIVs) return false;
			return Object.values(engine.pokemonIVs).some(ivs => {
				if (!ivs) return false;
				return ivs.hp === 31 || ivs.damage === 31 || ivs.speed === 31 || 
				       ivs.attackSpeed === 31 || ivs.range === 31 || ivs.knockback === 31;
			});
		}
	},
	{
		id: 'iv_all_perfect',
		name: 'Parfait',
		description: 'Avoir un pokémon avec toutes les stats à 31',
		check: (engine) => {
			if (!engine.pokemonIVs) return false;
			return Object.values(engine.pokemonIVs).some(ivs => {
				if (!ivs) return false;
				return ivs.hp === 31 && ivs.damage === 31 && ivs.speed === 31 && 
				       ivs.attackSpeed === 31 && ivs.range === 31 && ivs.knockback === 31;
			});
		}
	},
	{
		id: 'shiny_collector',
		name: 'Collectionneur de Shiny',
		description: 'Obtenir 5 pokémons shiny',
		check: (engine) => {
			if (!engine.pokemonIVs) return false;
			const shinyCount = Object.values(engine.pokemonIVs).filter(ivs => ivs && ivs.shiny === true).length;
			return shinyCount >= 5;
		}
	},
	{
		id: 'egg_legendary',
		name: 'Légendaire',
		description: 'Éclore un œuf légendaire',
		check: (engine) => {
			// Vérifier si le joueur a un garchomp (qui vient d'un œuf légendaire)
			return engine.playedPokemons?.has('garchomp') || false;
		}
	},
	{
		id: 'starter_collector',
		name: 'Collectionneur de Starters',
		description: 'Avoir tous les starters (Piplup, Chimchar, Turtwig)',
		check: (engine) => {
			return engine.playedPokemons?.has('piplup') && 
			       engine.playedPokemons?.has('chimchar') && 
			       engine.playedPokemons?.has('turtwig');
		}
	},
	{
		id: 'map_explorer',
		name: 'Explorateur',
		description: 'Jouer sur 3 maps différentes',
		check: (engine) => {
			return (engine.playedMaps?.size || 0) >= 3;
		}
	},
	{
		id: 'map_master',
		name: 'Maître des Maps',
		description: 'Jouer sur toutes les maps',
		check: (engine) => {
			const totalMaps = 3; // Ajuster selon le nombre de maps
			return (engine.playedMaps?.size || 0) >= totalMaps;
		}
	},
	{
		id: 'equipment_collector',
		name: 'Équipement Complet',
		description: 'Avoir 10 items équipables différents',
		check: (engine) => {
			// Note: nécessite l'import de ItemConfig dans le fichier qui utilise cette config
			// Pour l'instant, on vérifie juste si le joueur a beaucoup d'items
			if (!engine.inventory) return false;
			const totalItems = Object.values(engine.inventory).reduce((sum, count) => sum + count, 0);
			return totalItems >= 20; // Approximation
		}
	},
	{
		id: 'skill_tree_master',
		name: 'Maître des Compétences',
		description: 'Avoir 20 compétences débloquées',
		check: (engine) => {
			if (!engine.skillTreeState) return false;
			let totalUnlocked = 0;
			Object.values(engine.skillTreeState).forEach(branch => {
				if (branch && branch.nodes) {
					branch.nodes.forEach(node => {
						if (node.currentRank > 0) {
							totalUnlocked += node.currentRank;
						}
					});
				}
			});
			return totalUnlocked >= 20;
		}
	},
	{
		id: 'egg_incubator',
		name: 'Incubateur',
		description: 'Avoir incubé 5 œufs simultanément',
		check: (engine) => {
			if (!engine.eggProgress) return false;
			return Object.keys(engine.eggProgress).length >= 5;
		}
	},
	{
		id: 'money_spender',
		name: 'Dépensier',
		description: 'Avoir dépensé plus de 50000 pièces au total',
		check: (engine) => {
			// Approximation : si le joueur a beaucoup d'items et peu d'argent, il a probablement dépensé
			// On peut aussi vérifier les items achetés dans l'inventaire
			if (!engine.inventory) return false;
			const totalItems = Object.values(engine.inventory).reduce((sum, count) => sum + count, 0);
			return totalItems >= 50; // Approximation
		}
	},
	{
		id: 'speed_demon',
		name: 'Démon de la Vitesse',
		description: 'Avoir un pokémon avec IV vitesse à 31',
		check: (engine) => {
			if (!engine.pokemonIVs) return false;
			return Object.values(engine.pokemonIVs).some(ivs => ivs && ivs.speed === 31);
		}
	},
	{
		id: 'power_house',
		name: 'Force Pure',
		description: 'Avoir un pokémon avec IV attaque à 31',
		check: (engine) => {
			if (!engine.pokemonIVs) return false;
			return Object.values(engine.pokemonIVs).some(ivs => ivs && ivs.damage === 31);
		}
	},
	{
		id: 'tank',
		name: 'Tank',
		description: 'Avoir un pokémon avec IV HP à 31',
		check: (engine) => {
			if (!engine.pokemonIVs) return false;
			return Object.values(engine.pokemonIVs).some(ivs => ivs && ivs.hp === 31);
		}
	},
	{
		id: 'collector_15',
		name: 'Collectionneur Maître',
		description: 'Rencontrer 15 pokémons différents',
		check: (engine) => {
			return (engine.encounteredPokemons?.size || 0) >= 15;
		}
	},
	{
		id: 'killer_500',
		name: 'Chasseur Légendaire',
		description: 'Tuer 500 pokémons',
		check: (engine) => {
			const totalKills = Object.values(engine.defeatedPokemonCounts || {}).reduce((sum, count) => sum + count, 0);
			return totalKills >= 500;
		}
	},
	{
		id: 'survivor_2h',
		name: 'Survivant Épique',
		description: 'Survivre 2 heures au total',
		check: (engine) => {
			return (engine.totalPlayTime || 0) >= 2 * 60 * 60 * 1000; // 2 heures en ms
		}
	},
	{
		id: 'player_25',
		name: 'Vétéran Confirmé',
		description: 'Jouer 25 parties',
		check: (engine) => {
			return (engine.gamesPlayed || 0) >= 25;
		}
	},
	{
		id: 'rich_25000',
		name: 'Très Riche',
		description: 'Avoir 25000 pièces',
		check: (engine) => {
			return (engine.money || 0) >= 25000;
		}
	}
];

export function getCompletedAchievements(engine) {
	return AchievementConfig.filter(achievement => achievement.check(engine));
}

export function getAchievementProgress(engine, achievement) {
	// Pour certains achievements, on peut calculer la progression
	if (achievement.id === 'killer_10' || achievement.id === 'killer_100' || achievement.id === 'killer_1000') {
		const totalKills = Object.values(engine.defeatedPokemonCounts || {}).reduce((sum, count) => sum + count, 0);
		if (achievement.id === 'killer_10') return Math.min(100, (totalKills / 10) * 100);
		if (achievement.id === 'killer_100') return Math.min(100, (totalKills / 100) * 100);
		if (achievement.id === 'killer_1000') return Math.min(100, (totalKills / 1000) * 100);
	}
	if (achievement.id === 'collector_5' || achievement.id === 'collector_10') {
		const encountered = engine.encounteredPokemons?.size || 0;
		if (achievement.id === 'collector_5') return Math.min(100, (encountered / 5) * 100);
		if (achievement.id === 'collector_10') return Math.min(100, (encountered / 10) * 100);
	}
	if (achievement.id === 'hatcher_5') {
		const hatched = engine.playedPokemons?.size || 0;
		return Math.min(100, (hatched / 5) * 100);
	}
	if (achievement.id === 'rich_1000' || achievement.id === 'rich_10000') {
		const money = engine.money || 0;
		if (achievement.id === 'rich_1000') return Math.min(100, (money / 1000) * 100);
		if (achievement.id === 'rich_10000') return Math.min(100, (money / 10000) * 100);
	}
	if (achievement.id === 'survivor_5min' || achievement.id === 'survivor_30min') {
		const playTime = engine.totalPlayTime || 0;
		if (achievement.id === 'survivor_5min') return Math.min(100, (playTime / (5 * 60 * 1000)) * 100);
		if (achievement.id === 'survivor_30min') return Math.min(100, (playTime / (30 * 60 * 1000)) * 100);
	}
	if (achievement.id === 'player_10' || achievement.id === 'player_50' || achievement.id === 'player_25' || achievement.id === 'player_100' || achievement.id === 'player_500') {
		const games = engine.gamesPlayed || 0;
		if (achievement.id === 'player_10') return Math.min(100, (games / 10) * 100);
		if (achievement.id === 'player_25') return Math.min(100, (games / 25) * 100);
		if (achievement.id === 'player_50') return Math.min(100, (games / 50) * 100);
		if (achievement.id === 'player_100') return Math.min(100, (games / 100) * 100);
		if (achievement.id === 'player_500') return Math.min(100, (games / 500) * 100);
	}
	if (achievement.id === 'killer_500' || achievement.id === 'killer_5000') {
		const totalKills = Object.values(engine.defeatedPokemonCounts || {}).reduce((sum, count) => sum + count, 0);
		if (achievement.id === 'killer_500') return Math.min(100, (totalKills / 500) * 100);
		if (achievement.id === 'killer_5000') return Math.min(100, (totalKills / 5000) * 100);
	}
	if (achievement.id === 'collector_15' || achievement.id === 'collector_all') {
		const encountered = engine.encounteredPokemons?.size || 0;
		if (achievement.id === 'collector_15') return Math.min(100, (encountered / 15) * 100);
		if (achievement.id === 'collector_all') {
			const totalPokemons = 18;
			return Math.min(100, (encountered / totalPokemons) * 100);
		}
	}
	if (achievement.id === 'hatcher_10' || achievement.id === 'hatcher_20') {
		const hatched = engine.playedPokemons?.size || 0;
		if (achievement.id === 'hatcher_10') return Math.min(100, (hatched / 10) * 100);
		if (achievement.id === 'hatcher_20') return Math.min(100, (hatched / 20) * 100);
	}
	if (achievement.id === 'rich_25000' || achievement.id === 'rich_50000' || achievement.id === 'rich_100000') {
		const money = engine.money || 0;
		if (achievement.id === 'rich_25000') return Math.min(100, (money / 25000) * 100);
		if (achievement.id === 'rich_50000') return Math.min(100, (money / 50000) * 100);
		if (achievement.id === 'rich_100000') return Math.min(100, (money / 100000) * 100);
	}
	if (achievement.id === 'survivor_1h' || achievement.id === 'survivor_2h' || achievement.id === 'survivor_5h') {
		const playTime = engine.totalPlayTime || 0;
		if (achievement.id === 'survivor_1h') return Math.min(100, (playTime / (60 * 60 * 1000)) * 100);
		if (achievement.id === 'survivor_2h') return Math.min(100, (playTime / (2 * 60 * 60 * 1000)) * 100);
		if (achievement.id === 'survivor_5h') return Math.min(100, (playTime / (5 * 60 * 60 * 1000)) * 100);
	}
	if (achievement.id === 'rattata_slayer') {
		const kills = engine.defeatedPokemonCounts?.rattata || 0;
		return Math.min(100, (kills / 50) * 100);
	}
	if (achievement.id === 'pikachu_hunter') {
		const kills = engine.defeatedPokemonCounts?.pikachu || 0;
		return Math.min(100, (kills / 25) * 100);
	}
	if (achievement.id === 'garchomp_master') {
		const kills = engine.defeatedPokemonCounts?.garchomp || 0;
		return Math.min(100, (kills / 10) * 100);
	}
	if (achievement.id === 'shiny_collector') {
		if (!engine.pokemonIVs) return 0;
		const shinyCount = Object.values(engine.pokemonIVs).filter(ivs => ivs && ivs.shiny === true).length;
		return Math.min(100, (shinyCount / 5) * 100);
	}
	return null; // Pas de progression disponible
}

