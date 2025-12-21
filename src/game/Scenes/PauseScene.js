import SaveManager from '../Systems/SaveManager.js';
import RankManager from '../Systems/RankManager.js';
import { getMapConfig } from '../Config/MapConfig.js';

export default class PauseScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedIndex = 0;
		this.options = [];
	}

	init() {
		this.selectedIndex = 0;
		this.updateOptions();
	}

	updateOptions() {
		const isInBattle = this.engine.sceneManager.stack.some(
			scene => scene.constructor.name === 'BattleScene'
		);

		if (isInBattle) {
			this.options = [
				{
					label: 'Reprendre'
				},
				{
					label: 'Objets'
				},
				{
					label: 'Equipe'
				},
				{
					label: 'Quitter'
				}
			];
		} else {
			this.options = [
				{
					label: 'Objets'
				},
				{
					label: 'Equipe'
				},
				{
					label: 'Quitter'
				}
			];
		}
	}

	update(deltaTime) {
		const key = this.engine.input.consumeLastKey();
		
		if (key === 'ArrowUp') {
			this.selectedIndex = Math.max(0, this.selectedIndex - 1);
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowDown') {
			this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'Enter') {
			this.selectOption();
		} else if (key === 'Escape') {
			this.engine.sceneManager.popScene();
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	selectOption() {
		const option = this.options[this.selectedIndex];
		
		if (option.label === 'Reprendre') {
			this.engine.sceneManager.popScene();
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (option.label === 'Objets') {
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (option.label === 'Equipe') {
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (option.label === 'Quitter') {
			const isInBattle = this.engine.sceneManager.stack.some(
				scene => scene.constructor.name === 'BattleScene'
			);
			
			if (isInBattle) {
				this.openConfirmQuitMenu();
			} else {
				this.engine.sceneManager.changeScene('menu');
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		}
	}

	openConfirmQuitMenu() {
		this.engine.sceneManager.popScene();
		
		const battleScene = this.engine.sceneManager.stack.find(
			scene => scene.constructor.name === 'BattleScene'
		);
		
		const message = 'Quitter la partie ?';
		
		const onYes = (engine) => {
			if (battleScene && battleScene.survivalTime) {
				engine.totalPlayTime = (engine.totalPlayTime || 0) + battleScene.survivalTime;
				SaveManager.saveGame(engine, false);
			}
			engine.sceneManager.changeScene('game');
		};
		
		const onNo = (engine) => {
			engine.sceneManager.popScene();
			engine.sceneManager.pushScene('pause');
		};
		
		this.engine.sceneManager.pushScene('confirmMenu', {
			message: message,
			onYes: onYes,
			onNo: onNo
		});
		
		this.engine.audio.play('ok', 0.3, 0.1);
	}

	render(renderer) {
		const pauseImage = this.engine.sprites.get('hub_pause');
		if (pauseImage) {
			renderer.drawImage(pauseImage, 0, 0, renderer.width, renderer.height);
		}

		const locationX = renderer.width - 200;
		const locationY = 60;
		const locationFontSize = '22px';

		const battleScene = this.engine.sceneManager.stack.find(
			scene => scene.constructor.name === 'BattleScene'
		);
		
		let locationName = 'Village';
		if (battleScene && battleScene.mapData) {
			const mapConfig = getMapConfig(battleScene.mapData.id);
			if (mapConfig) {
				locationName = mapConfig.name;
			}
		}

		renderer.ctx.save();
		renderer.ctx.fillStyle = '#ff8800';
		renderer.ctx.font = `${locationFontSize} Pokemon`;
		renderer.ctx.textAlign = 'right';
		renderer.ctx.fillText(locationName, locationX, locationY);
		renderer.ctx.restore();

		const optionStartX = 60;
		const optionStartY = 60;
		const optionSpacing = 40;
		const fontSize = '18px';

		this.options.forEach((option, index) => {
			let y = optionStartY + index * optionSpacing;
			if (option.label === 'Quitter') {
				y += this.options.length === 3 ? 190 : 150;
			}
			let color = index === this.selectedIndex ? '#ffff00' : '#ffffff';
			if (option.label === 'Quitter') {
				color = '#ff6666';
			}
			
			renderer.drawText(option.label, optionStartX, y, fontSize, color, 'left');
			
			if (index === this.selectedIndex) {
				const cursorY = option.label === 'Quitter' ? y : y;
				renderer.drawText('>', optionStartX - 20, cursorY, fontSize, color, 'left');
			}
		});

		const rank = RankManager.getPlayerRank(this.engine.defeatedPokemonCounts, this.engine.encounteredPokemons);
		const rankColor = RankManager.getRankColor(rank);
		const stars = RankManager.getRankStars(rank);
		const centerX = renderer.width / 2;
		const centerY = renderer.height - 190;
		const rankFontSize = '24px';
		const starFontSize = '20px';
		const progressFontSize = '16px';

		renderer.ctx.save();
		renderer.ctx.fillStyle = rankColor;
		renderer.ctx.font = `${rankFontSize} Pokemon`;
		renderer.ctx.textAlign = 'center';
		const rankText = rank;
		const rankTextWidth = renderer.ctx.measureText(rankText).width;
		renderer.ctx.fillText(rankText, centerX, centerY);
		
		renderer.ctx.fillStyle = '#ffd700';
		renderer.ctx.font = `${starFontSize} Pokemon`;
		const starText = '★'.repeat(stars);
		const starTextWidth = renderer.ctx.measureText(starText).width;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.fillText(starText, centerX - rankTextWidth / 2 + rankTextWidth + 10, centerY);
		renderer.ctx.textAlign = 'center';
		
		const progress = RankManager.getNextRankProgress(this.engine.defeatedPokemonCounts, rank);
		if (progress) {
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.font = `${progressFontSize} Pokemon`;
			renderer.ctx.textAlign = 'center';
			const progressText = `Avant prochain grade: ${SaveManager.formatLargeNumber(progress.remainingDefeated)} Pokémon vaincus`;
			renderer.ctx.fillText(progressText, centerX, centerY + 35);
		}
		renderer.ctx.restore();

		const money = this.engine.money || 0;
		const moneyFontSize = '18px';
		const coinSize = 24;
		const moneyY = centerY - 15;

		renderer.ctx.save();
		renderer.ctx.fillStyle = 'rgb(43, 231, 216)';
		renderer.ctx.font = `${moneyFontSize} Pokemon`;
		renderer.ctx.textAlign = 'right';
		const moneyText = SaveManager.formatLargeNumber(money);
		const moneyX = renderer.width - 40 - coinSize - 5;
		renderer.ctx.fillText(moneyText, moneyX, moneyY);
		renderer.ctx.restore();

        const coinsImage = this.engine.sprites.get('coins');
        if (coinsImage) {
            renderer.drawImage(coinsImage, moneyX + 5, (moneyY - coinSize / 2)-5, coinSize, coinSize);
        }
	}
}

