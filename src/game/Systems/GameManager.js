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
		console.log('Game ended with result:', result);
		if (battleScene && battleScene.player) {
			this.engine.money = battleScene.player.money;
			this.engine.displayedMoney = battleScene.player.displayedMoney;
		}
		this.showEndGameMenu(result, battleScene);
	}

	showEndGameMenu(result, battleScene = null) {
		const isVictory = result === 'victory';
		
		if (isVictory && battleScene) {
			this.engine.audio.stopMusic();
			const victoryMusic = this.engine.audio.musics.get('victory');
			if (victoryMusic) {
				this.engine.audio.playMusic('victory', 0.7);
			} else {
				this.engine.audio.playMusic('hub', 0.7);
			}
			this.showVictoryMenu(battleScene);
		} else {
			const endMenuConfig = {
				title: isVictory ? 'VICTOIRE !' : 'DÉFAITE',
				style: 'center',
				closeable: false,
				options: [
					{
						label: 'Recommencer',
						action: (engine) => {
							engine.menuManager.closeMenu();
							this.startGame(this.currentMap);
						}
					},
					{
						label: 'Retour au Hub',
						action: (engine) => {
							engine.menuManager.closeMenu();
							this.currentMap = null;
							engine.sceneManager.changeScene('game');
						}
					}
				]
			};
			this.engine.menuManager.openMenu(endMenuConfig);
		}
	}

	showVictoryMenu(battleScene) {
		const player = battleScene.player;
		const survivalTime = battleScene.survivalTime;
		const minutes = Math.floor(survivalTime / 60000);
		const seconds = Math.floor((survivalTime % 60000) / 1000);
		const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
		
		const moneyEarned = player.money;
		const levelReached = player.level;
		const enemiesKilled = 0;
		
		const victoryMenuConfig = {
			title: 'VICTOIRE !',
			style: 'center',
			closeable: false,
			victoryData: {
				time: timeString,
				money: moneyEarned,
				level: levelReached,
				enemies: enemiesKilled
			},
			options: [
				{
					label: 'Continuer (Endless)',
					action: (engine) => {
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
				},
				{
					label: 'Retour au Village',
					action: (engine) => {
						engine.menuManager.closeMenu();
						this.currentMap = null;
						engine.sceneManager.changeScene('game');
					}
				}
			]
		};
		this.engine.menuManager.openMenu(victoryMenuConfig);
	}
}

