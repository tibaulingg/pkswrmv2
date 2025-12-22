export default class SaveManager {
	static SAVE_KEY = 'poksrm_save';

	static formatLargeNumber(num) {
		if (num >= 1000000000) {
			return (num / 1000000000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'G';
		}
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'M';
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'k';
		}
		return num.toString();
	}

	static getTotalDefeatedPokemon(defeatedPokemonCounts) {
		if (!defeatedPokemonCounts) return 0;
		return Object.values(defeatedPokemonCounts).reduce((sum, count) => sum + (count || 0), 0);
	}

	static formatPlayTime(totalPlayTimeMs) {
		if (!totalPlayTimeMs) return '00:00:00';
		
		const totalSeconds = Math.floor(totalPlayTimeMs / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	static saveGame(engine, isNewGame = false) {
		const existingSave = this.getSaveData();
		
		const saveData = {
			money: engine.money || 0,
			displayedMoney: engine.displayedMoney || 0,
			inventory: engine.inventory || {},
			equippedItems: engine.equippedItems || [],
			assignedConsumable: engine.assignedConsumable || null,
			incubatingEgg: engine.incubatingEgg || null,
			eggProgress: engine.eggProgress || {},
			eggUniqueIds: engine.eggUniqueIds || {},
			selectedPokemon: engine.selectedPokemon || 'quagsire',
			playerName: engine.playerName || 'Trainer',
			encounteredPokemons: Array.from(engine.encounteredPokemons || []),
			playedPokemons: Array.from(engine.playedPokemons || []),
			playedMaps: Array.from(engine.playedMaps || []),
			defeatedPokemonCounts: engine.defeatedPokemonCounts || {},
			totalPlayTime: engine.totalPlayTime || 0,
			gamesPlayed: engine.gamesPlayed || 0,
			pokemonIVs: engine.pokemonIVs || {}
		};

		try {
			localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
			return true;
		} catch (error) {
			console.warn('Failed to save game data:', error);
			return false;
		}
	}

	static loadGame(engine) {
		try {
			const savedData = localStorage.getItem(this.SAVE_KEY);
			if (!savedData) {
				return null;
			}

			const saveData = JSON.parse(savedData);
			
			engine.money = saveData.money || 0;
			engine.displayedMoney = saveData.displayedMoney || engine.money;
			engine.inventory = saveData.inventory || {};
			engine.equippedItems = saveData.equippedItems || [];
			engine.assignedConsumable = saveData.assignedConsumable || null;
			engine.incubatingEgg = saveData.incubatingEgg || null;
			engine.eggProgress = saveData.eggProgress || {};
			engine.eggUniqueIds = saveData.eggUniqueIds || {};
			engine.selectedPokemon = saveData.selectedPokemon || 'quagsire';
			engine.playerName = saveData.playerName || 'Trainer';
			
			if (saveData.encounteredPokemons) {
				engine.encounteredPokemons = new Set(saveData.encounteredPokemons);
			}
			if (saveData.playedPokemons) {
				engine.playedPokemons = new Set(saveData.playedPokemons);
			}
			if (saveData.playedMaps) {
				engine.playedMaps = new Set(saveData.playedMaps);
			}
			if (saveData.defeatedPokemonCounts) {
				engine.defeatedPokemonCounts = saveData.defeatedPokemonCounts;
			}
			if (saveData.totalPlayTime !== undefined) {
				engine.totalPlayTime = saveData.totalPlayTime || 0;
			}
			if (saveData.gamesPlayed !== undefined) {
				engine.gamesPlayed = saveData.gamesPlayed || 0;
			}
			if (saveData.pokemonIVs) {
				engine.pokemonIVs = saveData.pokemonIVs;
			} else {
				engine.pokemonIVs = {};
			}

			return saveData;
		} catch (error) {
			console.warn('Failed to load game data:', error);
			return null;
		}
	}

	static hasSave() {
		try {
			const savedData = localStorage.getItem(this.SAVE_KEY);
			return savedData !== null;
		} catch (error) {
			return false;
		}
	}

	static deleteSave() {
		try {
			localStorage.removeItem(this.SAVE_KEY);
			return true;
		} catch (error) {
			console.warn('Failed to delete save data:', error);
			return false;
		}
	}

	static getSaveData() {
		try {
			const savedData = localStorage.getItem(this.SAVE_KEY);
			if (!savedData) {
				return null;
			}
			return JSON.parse(savedData);
		} catch (error) {
			console.warn('Failed to get save data:', error);
			return null;
		}
	}
}

