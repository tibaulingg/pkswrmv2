import SaveManager from './SaveManager.js';

export default class GameManager {
	constructor(engine) {
		this.engine = engine;
		this.currentMap = null;
	}

	startGame(mapData) {
		this.currentMap = mapData;
		if (mapData && mapData.id !== undefined) {
			this.engine.playedMaps.add(mapData.id);
		}
		this.engine.audio.stopMusic();
		this.engine.sceneManager.changeScene('battle', mapData);
	}

	endGame(result, battleScene = null) {
		if (battleScene && battleScene.player) {
			this.engine.money = battleScene.player.money;
			this.engine.displayedMoney = battleScene.player.displayedMoney;
		}
		
		if (battleScene && battleScene.survivalTime) {
			this.engine.totalPlayTime = (this.engine.totalPlayTime || 0) + battleScene.survivalTime;
		}
		
		if (result === 'victory' || result === 'defeat') {
			this.engine.gamesPlayed = (this.engine.gamesPlayed || 0) + 1;
		}
		
		SaveManager.saveGame(this.engine, false);
		
		this.showEndGameMenu(result, battleScene);
	}

	showEndGameMenu(result, battleScene = null) {
		const isVictory = result === 'victory';
	
		const player = battleScene.player;
		const survivalTime = battleScene.survivalTime || 0;
		const totalSeconds = Math.floor(survivalTime / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
		const totalEnemiesKilled = battleScene.enemySpawner ? (battleScene.enemySpawner.totalEnemiesKilled || 0) : 0;


		const options = [];
		
		if (isVictory) {
			this.engine.audio.playMusic('victory', 0.7, false);
			options.push({
				label: 'Continuer (Endless)',
				action: (engine) => {
					if (battleScene && battleScene.survivalTime) {
						engine.totalPlayTime = (engine.totalPlayTime || 0) + battleScene.survivalTime;
						battleScene.survivalTime = 0;
						SaveManager.saveGame(engine, false);
					}
					engine.menuManager.closeMenu();
					battleScene.bossDefeated = false;
					battleScene.bossSpawned = false;
					battleScene.boss = null;
					if (battleScene.mapData && battleScene.mapData.bossTimer) {
						battleScene.bossTimer = battleScene.mapData.bossTimer;
					}
					battleScene.state = 'playing';
					engine.audio.stopMusic();
					const musicName = `map_${battleScene.mapData.image}`;
					engine.audio.playMusic(musicName);
				}
			});
		} else {
			options.push({
				label: 'Recommencer',
				action: (engine) => {
					engine.menuManager.closeMenu();
					this.startGame(this.currentMap);
				}
			});
		}
		
		options.push({
			label: 'Retour au Village',
			action: (engine) => {
				if (battleScene && battleScene.survivalTime) {
					engine.totalPlayTime = (engine.totalPlayTime || 0) + battleScene.survivalTime;
					SaveManager.saveGame(engine, false);
				}
				engine.menuManager.closeMenu();
				this.currentMap = null;
				engine.sceneManager.changeScene('game');
			}
		});

		const killerPokemon = battleScene.killerEnemy && battleScene.killerEnemy.pokemonConfig ? battleScene.killerEnemy.pokemonConfig.name : null;

		const defeatedPokemonCounts = battleScene.engine.defeatedPokemonCounts || {};

		const victoryData = {
			time: timeString,
			level: player ? player.level : 1,
			money: player ? player.money : 0,
			enemiesKilled: totalEnemiesKilled,
			killerPokemon: killerPokemon,
			defeatedPokemonCounts: defeatedPokemonCounts
		};

		const endMenuConfig = {
			title: isVictory ? 'VICTOIRE !' : 'DÉFAITE',
			style: 'center',
			closeable: false,
			victoryData: victoryData,
			options: options
		};

	}
}

