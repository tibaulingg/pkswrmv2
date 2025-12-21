import SaveManager from './SaveManager.js';

export default class RankManager {
	static getPlayerRank(defeatedPokemonCounts, encounteredPokemons) {
		const totalDefeated = SaveManager.getTotalDefeatedPokemon(defeatedPokemonCounts);
		const encounteredCount = encounteredPokemons ? encounteredPokemons.size : 0;
		
		if (totalDefeated >= 10000 || encounteredCount >= 50) {
			return 'Maître';
		} else if (totalDefeated >= 5000 || encounteredCount >= 30) {
			return 'Expert';
		} else if (totalDefeated >= 2000 || encounteredCount >= 20) {
			return 'Vétéran';
		} else if (totalDefeated >= 500 || encounteredCount >= 10) {
			return 'Confirmé';
		} else if (totalDefeated >= 100 || encounteredCount >= 5) {
			return 'Apprenti';
		} else {
			return 'Novice';
		}
	}

	static getRankStars(rank) {
		switch(rank) {
			case 'Novice': return 1;
			case 'Apprenti': return 2;
			case 'Confirmé': return 3;
			case 'Vétéran': return 4;
			case 'Expert': return 5;
			case 'Maître': return 6;
			default: return 1;
		}
	}

	static getRankColor(rank) {
		switch(rank) {
			case 'Novice': return '#808080';
			case 'Apprenti': return '#00ff00';
			case 'Confirmé': return '#0080ff';
			case 'Vétéran': return '#8000ff';
			case 'Expert': return '#ff8000';
			case 'Maître': return '#ff0000';
			default: return '#ffffff';
		}
	}

	static getNextRankProgress(defeatedPokemonCounts, rank) {
		const totalDefeated = SaveManager.getTotalDefeatedPokemon(defeatedPokemonCounts);
		
		if (rank === 'Maître') {
			return null;
		}
		
		let nextRankDefeated = 0;
		let nextRankName = '';
		
		switch(rank) {
			case 'Novice':
				nextRankDefeated = 100;
				nextRankName = 'Apprenti';
				break;
			case 'Apprenti':
				nextRankDefeated = 500;
				nextRankName = 'Confirmé';
				break;
			case 'Confirmé':
				nextRankDefeated = 2000;
				nextRankName = 'Vétéran';
				break;
			case 'Vétéran':
				nextRankDefeated = 5000;
				nextRankName = 'Expert';
				break;
			case 'Expert':
				nextRankDefeated = 10000;
				nextRankName = 'Maître';
				break;
		}
		
		const remainingDefeated = Math.max(0, nextRankDefeated - totalDefeated);
		
		return {
			nextRank: nextRankName,
			remainingDefeated: remainingDefeated
		};
	}
}

