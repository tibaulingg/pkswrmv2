import SaveManager from '../Systems/SaveManager.js';
import RankManager from '../Systems/RankManager.js';
import { PokemonSprites } from '../Config/SpriteConfig.js';

export default class ContinueGameScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedChoice = 0;
		this.saveData = null;
		this.backgroundIndex = 1;
	}

	init() {
		this.selectedChoice = 0;
		this.backgroundIndex = Math.floor(Math.random() * 3) + 1;
		this.saveData = SaveManager.getSaveData();
	}

	update(deltaTime) {
		const key = this.engine.input.consumeLastKey();
		
		if (key === 'ArrowUp') {
			this.selectedChoice = Math.max(0, this.selectedChoice - 1);
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowDown') {
			this.selectedChoice = Math.min(1, this.selectedChoice + 1);
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'Enter') {
			this.selectChoice();
		} else if (key === 'Escape') {
			this.engine.sceneManager.changeScene('menu');
		}
	}

	selectChoice() {
		if (this.selectedChoice === 0) {
			const loadedData = SaveManager.loadGame(this.engine);
			if (loadedData) {
				SaveManager.saveGame(this.engine, false);
				this.engine.sceneManager.changeScene('game', {
					selectedPokemon: loadedData.selectedPokemon || 'quaksire',
					playerName: loadedData.playerName || 'Trainer'
				});
			} else {
				this.engine.sceneManager.changeScene('game');
			}
		} else {
			this.engine.sceneManager.changeScene('menu');
		}
	}

	render(renderer) {
		const backgroundKey = `background_${this.backgroundIndex}`;
		const backgroundImage = this.engine.sprites.get(backgroundKey);
		
		if (backgroundImage) {
			renderer.drawImage(backgroundImage, 0, 0, renderer.width, renderer.height);
		}
		
		const continueGameImage = this.engine.sprites.get('empty_continue_game');
		if (continueGameImage) {
			renderer.drawImage(continueGameImage, 0, 0, renderer.width, renderer.height);
		}

		if (this.saveData) {
			const infoX = 50;
			const infoY = 50;
			const infoFontSize = '18px';
			const lineHeight = 25;

			renderer.ctx.save();
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.font = `${infoFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'top';

			let y = infoY;
			renderer.ctx.fillText('Aventure en cours:', infoX, y);
			y += lineHeight;

			renderer.ctx.strokeStyle = '#ffffff';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.beginPath();
			renderer.ctx.moveTo(infoX, y);
			renderer.ctx.lineTo(renderer.width - infoX, y);
			renderer.ctx.stroke();
			y += lineHeight + 5;

			if (this.saveData.selectedPokemon) {
				const pokemonSprite = this.engine.sprites.get(`pokemon_${this.saveData.selectedPokemon}_normal`);
				const iconSize = 48;
				const iconX = infoX;
				const iconY = y;
				
				if (pokemonSprite) {
					renderer.drawImage(pokemonSprite, iconX, iconY, iconSize, iconSize);
					renderer.ctx.strokeStyle = '#ffffff';
					renderer.ctx.lineWidth = 2;
					renderer.ctx.strokeRect(iconX, iconY, iconSize, iconSize);
				}
				
				const pokemonConfig = PokemonSprites[this.saveData.selectedPokemon];
				const pokemonName = pokemonConfig ? pokemonConfig.name : this.saveData.selectedPokemon;
				renderer.ctx.textBaseline = 'middle';
				renderer.ctx.fillText(`${pokemonName}`, iconX + iconSize + 10, iconY + iconSize / 2);
				renderer.ctx.textBaseline = 'top';
				
				y += iconSize + 10;
			}

			if (this.saveData.playerName) {
				renderer.ctx.fillText(`Joueur: ${this.saveData.playerName}`, infoX, y);
				y += lineHeight;
			}

			renderer.ctx.fillStyle = '#ff8800';
			renderer.ctx.fillText('Lieu: Village', infoX, y);
			renderer.ctx.fillStyle = '#ffffff';
			y += lineHeight;

			if (this.saveData.totalPlayTime !== undefined) {
				const playTime = SaveManager.formatPlayTime(this.saveData.totalPlayTime);
				renderer.ctx.fillText(`Temps de jeu: ${playTime}`, infoX, y);
				y += lineHeight;
			}

			if (this.saveData.gamesPlayed !== undefined) {
				renderer.ctx.fillText(`Aventures: ${this.saveData.gamesPlayed}`, infoX, y);
				y += lineHeight;
			}

			if (this.saveData.money !== undefined) {
				const money = this.saveData.money || 0;
				const moneyText = SaveManager.formatLargeNumber(money);
				const coinSize = 24;
				const fullMoneyText = `${moneyText}`;
				const moneyTextWidth = renderer.ctx.measureText(fullMoneyText).width;
				renderer.ctx.fillStyle = 'rgb(43, 231, 216)';
				
				renderer.ctx.fillText(fullMoneyText, infoX, y);
				
				const coinsImage = this.engine.sprites.get('coins');
				if (coinsImage) {
					renderer.drawImage(coinsImage, infoX + moneyTextWidth, y, coinSize, coinSize);
				}
				
				y += lineHeight;
			}

			const defeatedPokemonCounts = this.saveData.defeatedPokemonCounts || {};
			const encounteredPokemons = this.saveData.encounteredPokemons ? new Set(this.saveData.encounteredPokemons) : new Set();
			const rank = RankManager.getPlayerRank(defeatedPokemonCounts, encounteredPokemons);
			const rankColor = RankManager.getRankColor(rank);
			const stars = RankManager.getRankStars(rank);
			
			renderer.ctx.fillStyle = rankColor;
			const rankText = `Grade: ${rank}`;
			const rankTextWidth = renderer.ctx.measureText(rankText).width;
			renderer.ctx.fillText(rankText, infoX, y);
			
			renderer.ctx.fillStyle = '#ffd700';
			const starText = '★'.repeat(stars);
			renderer.ctx.fillText(starText, infoX + rankTextWidth + 10, y);
			y += lineHeight;

			renderer.ctx.restore();
		}

		const questionX = 50;
		const questionY = renderer.height - 125;
		const questionFontSize = '25px';
		const questionMaxWidth = renderer.width - 400;

		renderer.ctx.save();
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.font = `${questionFontSize} Pokemon`;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';
		
		const questionText = 'Voulez-vous reprendre la partie interrompue?';
		const words = questionText.split(' ');
		let line = '';
		let y = questionY;
		
		words.forEach((word) => {
			const testLine = line + word + ' ';
			const metrics = renderer.ctx.measureText(testLine);
			const testWidth = metrics.width;
			
			if (testWidth > questionMaxWidth && line !== '') {
				renderer.ctx.fillText(line, questionX, y);
				line = word + ' ';
				y += 30;
			} else {
				line = testLine;
			}
		});
		renderer.ctx.fillText(line, questionX, y);
		renderer.ctx.restore();

		const choiceX = renderer.width - 200;
		const choiceStartY = renderer.height - 100;
		const choiceSpacing = 40;
		const choiceFontSize = '20px';
		const choices = ['Oui', 'Non'];

		choices.forEach((choice, index) => {
			const y = choiceStartY + index * choiceSpacing;
			const color = index === this.selectedChoice ? '#ffff00' : '#ffffff';
			renderer.drawText(choice, choiceX, y, choiceFontSize, color, 'left');
			
			if (index === this.selectedChoice) {
				renderer.drawText('>', choiceX - 20, y, choiceFontSize, color, 'left');
			}
		});
	}
}

