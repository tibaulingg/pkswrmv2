import SaveManager from '../Systems/SaveManager.js';
import RankManager from '../Systems/RankManager.js';
import { PokemonSprites } from '../Config/SpriteConfig.js';
import { generateStarterIVs } from '../Systems/IVSystem.js';

export default class MainMenuScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedIndex = 0;
		this.backgroundIndex = 1;
		this.options = [];
		this.showContinueMenu = false;
		this.selectedContinueChoice = 0;
		this.saveData = null;
		this.showNewGameMenu = false;
		this.selectedPokemonIndex = 0;
		this.pokemonList = Object.keys(PokemonSprites).filter(pokemonId => {
			const pokemonConfig = PokemonSprites[pokemonId];
			return pokemonConfig && pokemonConfig.starter === true;
		});
		this.selectedPokemons = [];
		this.pseudo = '';
		this.isTypingPseudo = true;
		this.cursorBlink = 0;
		this.pokemonPerRow = 5;
		this.pseudoValidated = false;
	}

	init() {
		this.selectedIndex = 0;
		this.backgroundIndex = Math.floor(Math.random() * 3) + 1;
		this.showContinueMenu = false;
		this.selectedContinueChoice = 0;
		this.showNewGameMenu = false;
		this.selectedPokemonIndex = 0;
		this.selectedPokemons = [];
		this.pseudo = '';
		this.isTypingPseudo = true;
		this.cursorBlink = 0;
		this.pseudoValidated = false;
		
		this.options = [];
		if (SaveManager.hasSave()) {
			this.options.push({
				label: 'Continuer',
				description: 'Reprenez votre aventure à partir de votre dernière sauvegarde'
			});
			this.selectedContinueChoice = 0;
			this.saveData = SaveManager.getSaveData();
		}
		
		this.options.push({
			label: 'Nouvelle Partie',
			description: 'Commencez une nouvelle aventure'
		});
		
		this.options.push({
			label: 'Quitter',
			description: 'Fermez le jeu'
		});
		
		this.engine.audio.playMusic('main_menu');
	}

	update(deltaTime) {
		this.cursorBlink += deltaTime;
		if (this.cursorBlink > 1000) {
			this.cursorBlink = 0;
		}

		const currentScene = this.engine.sceneManager.getCurrentScene();
		if (currentScene !== this && (currentScene === this.engine.sceneManager.scenes.confirmMenu || currentScene.constructor.name === 'ConfirmMenuScene')) {
			return;
		}

		const key = this.engine.input.consumeLastKey();
		const keyValue = this.engine.input.consumeLastKeyValue();
		
		if (this.showContinueMenu) {
			if (key === 'ArrowUp') {
				this.selectedContinueChoice = Math.max(0, this.selectedContinueChoice - 1);
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'ArrowDown') {
				this.selectedContinueChoice = Math.min(1, this.selectedContinueChoice + 1);
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'Enter') {
				this.selectContinueChoice();
			} else if (key === 'Escape') {
				this.showContinueMenu = false;
				this.selectedContinueChoice = 0;
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		} else if (this.showNewGameMenu) {
			if (this.isTypingPseudo) {
				if (key && keyValue && keyValue.length === 1 && /[a-zA-Z0-9]/.test(keyValue)) {
					if (this.pseudo.length < 15) {
						this.pseudo += keyValue;
						this.engine.audio.play('ok', 0.2, 0.1);
					}
				} else if (key === 'Backspace' && this.pseudo.length > 0) {
					this.pseudo = this.pseudo.slice(0, -1);
					this.engine.audio.play('ok', 0.2, 0.1);
				} else if (key === 'Enter' && this.pseudo.length > 0) {
					this.isTypingPseudo = false;
					this.pseudoValidated = true;
					this.engine.audio.play('ok', 0.3, 0.1);
				} else if (key === 'Tab') {
					this.isTypingPseudo = false;
					this.pseudoValidated = true;
					this.engine.audio.play('ok', 0.3, 0.1);
				} else if (key === 'Space') {
					if (this.pseudo.length < 15) {
						this.pseudo += ' ';
						this.engine.audio.play('ok', 0.2, 0.1);
					}
				} else if (key === 'Escape') {
					this.showNewGameMenu = false;
					this.pseudo = '';
					this.isTypingPseudo = true;
					this.pseudoValidated = false;
					this.selectedPokemonIndex = 0;
					this.engine.audio.play('ok', 0.3, 0.1);
				}
			} else {
				if (key === 'ArrowLeft') {
					this.selectedPokemonIndex = Math.max(0, this.selectedPokemonIndex - 1);
					this.engine.audio.play('ok', 0.3, 0.1);
				} else if (key === 'ArrowRight') {
					this.selectedPokemonIndex = Math.min(this.selectedPokemons.length - 1, this.selectedPokemonIndex + 1);
					this.engine.audio.play('ok', 0.3, 0.1);
				} else if (key === 'Enter') {
					this.openConfirmNewGameMenu();
				} else if (key === 'Escape' || key === 'Backspace') {
					this.isTypingPseudo = true;
					this.pseudoValidated = false;
					this.engine.audio.play('ok', 0.3, 0.1);
				}
			}
		} else {
			if (key === 'ArrowUp') {
				this.selectedIndex = Math.max(0, this.selectedIndex - 1);
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'ArrowDown') {
				this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'Enter') {
				this.selectOption();
			}
		}
	}

	selectOption() {
		const option = this.options[this.selectedIndex];
		
		if (option.label === 'Continuer') {
			this.showContinueMenu = true;
			this.selectedContinueChoice = 0;
			this.saveData = SaveManager.getSaveData();
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (option.label === 'Nouvelle Partie') {
			this.showNewGameMenu = true;
			this.pseudo = '';
			this.isTypingPseudo = true;
			this.selectedPokemonIndex = 0;
			this.pseudoValidated = false;
			const shuffled = [...this.pokemonList].sort(() => Math.random() - 0.5);
			this.selectedPokemons = shuffled.slice(0, 3);
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	openConfirmNewGameMenu() {
		const selectedPokemon = this.selectedPokemons[this.selectedPokemonIndex];
		const pokemonConfig = PokemonSprites[selectedPokemon];
		const pokemonName = pokemonConfig ? pokemonConfig.name : selectedPokemon;
		const playerName = this.pseudo || 'Trainer';
		const message = `Confirmer vos choix ?\nPseudo: ${playerName}\nStarter: ${pokemonName}`;
		
		const mainMenuScene = this;
		const onYes = (engine) => {
			engine.sceneManager.popScene();
			mainMenuScene.startNewGame();
		};

		const onNo = (engine) => {
			engine.sceneManager.popScene();
			mainMenuScene.isTypingPseudo = true;
			mainMenuScene.pseudoValidated = false;
		};

		this.engine.sceneManager.pushScene('confirmMenu', {
			message: message,
			onYes: onYes,
			onNo: onNo
		});
		
		this.engine.audio.play('ok', 0.3, 0.1);
	}

	startNewGame() {
		const selectedPokemon = this.selectedPokemons[this.selectedPokemonIndex];
		const playerName = this.pseudo || 'Trainer';
		
		SaveManager.deleteSave();
		
		this.engine.money = 0;
		this.engine.displayedMoney = 0;
		this.engine.inventory = {};
		this.engine.selectedPokemon = selectedPokemon;
		this.engine.playerName = playerName;
		this.engine.encounteredPokemons = new Set();
		this.engine.playedPokemons = new Set();
		this.engine.playedMaps = new Set();
		this.engine.defeatedPokemonCounts = {};
		this.engine.incubatingEgg = null;
		this.engine.eggProgress = {};
		this.engine.eggUniqueIds = {};
		this.engine.totalPlayTime = 0;
		this.engine.gamesPlayed = 0;
		this.engine.pokemonIVs = {};
		
		if (selectedPokemon) {
			this.engine.pokemonIVs[selectedPokemon] = generateStarterIVs();
			this.engine.encounteredPokemons.add(selectedPokemon);
			this.engine.playedPokemons.add(selectedPokemon);
		}
		
		SaveManager.saveGame(this.engine, true);
		
		this.engine.sceneManager.changeScene('game', {
			selectedPokemon: selectedPokemon,
			playerName: playerName,
			enteringFromTop: false
		});
	}

	selectContinueChoice() {
		if (this.selectedContinueChoice === 0) {
			const loadedData = SaveManager.loadGame(this.engine);
			if (loadedData) {
				SaveManager.saveGame(this.engine, false);
				this.engine.sceneManager.changeScene('game', {
					selectedPokemon: loadedData.selectedPokemon || 'quagsire',
					playerName: loadedData.playerName || 'Trainer',
					enteringFromTop: false
				});
			} else {
				this.engine.sceneManager.changeScene('game', {
					enteringFromTop: false
				});
			}
		} else {
			this.showContinueMenu = false;
			this.selectedContinueChoice = 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	render(renderer) {
		const backgroundKey = `background_${this.backgroundIndex}`;
		const backgroundImage = this.engine.sprites.get(backgroundKey);
		
		if (backgroundImage) {
			renderer.drawImage(backgroundImage, 0, 0, renderer.width, renderer.height);
		}
		
		const menuEmptyImage = this.engine.sprites.get('menu_empty');
		if (menuEmptyImage) {
			renderer.drawImage(menuEmptyImage, 0, 0, renderer.width, renderer.height);
		}
		
		const optionStartX = 90;
		const optionStartY = 90;
		const optionSpacing = 40;
		const fontSize = '20px';
		
		this.options.forEach((option, index) => {
			let y = optionStartY + index * optionSpacing;
			if (option.label === 'Quitter') {
				y += 110;
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
		
		const selectedOption = this.options[this.selectedIndex];
		if (selectedOption && selectedOption.description && !this.showContinueMenu && !this.showNewGameMenu) {
			const descX = 100;
			const descY = renderer.height - 125;
			const descFontSize = '25px';
			const maxWidth = renderer.width - 100;
			
			renderer.ctx.save();
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.font = `${descFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'top';
			
			const words = selectedOption.description.split(' ');
			let line = '';
			let y = descY;
			
			words.forEach((word) => {
				const testLine = line + word + ' ';
				const metrics = renderer.ctx.measureText(testLine);
				const testWidth = metrics.width;
				
				if (testWidth > maxWidth && line !== '') {
					renderer.ctx.fillText(line, descX, y);
					line = word + ' ';
					y += 22;
				} else {
					line = testLine;
				}
			});
			renderer.ctx.fillText(line, descX, y);
			renderer.ctx.restore();
		}
		
		if (this.showContinueMenu) {
			const continueMenuOverlay = this.engine.sprites.get('continue_menu_overlay');
			if (continueMenuOverlay) {
				renderer.drawImage(continueMenuOverlay, 0, 0, renderer.width, renderer.height);
			}

			if (this.saveData) {
				const infoX = 620;
				const infoY = 70;
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
				renderer.ctx.lineTo(renderer.width - infoX - 50, y);
				renderer.ctx.stroke();
				y += lineHeight / 2;

				if (this.saveData.selectedPokemon) {
					const pokemonSprite = this.engine.sprites.get(`pokemon_${this.saveData.selectedPokemon}_normal`);
					const iconSize = 48;
					const iconX = infoX + 580;
					const iconY = y;
					
					if (pokemonSprite) {
						renderer.drawImage(pokemonSprite, iconX, iconY, iconSize, iconSize);
						renderer.ctx.strokeStyle = '#ffffff';
						renderer.ctx.lineWidth = 2;
						renderer.ctx.strokeRect(iconX, iconY, iconSize, iconSize);
					}
				}

				const defeatedPokemonCounts = this.saveData.defeatedPokemonCounts || {};
				const encounteredPokemons = this.saveData.encounteredPokemons ? new Set(this.saveData.encounteredPokemons) : new Set();
				const rank = RankManager.getPlayerRank(defeatedPokemonCounts, encounteredPokemons);
				const rankColor = RankManager.getRankColor(rank);
				const stars = RankManager.getRankStars(rank);

				let currentX = infoX;

				renderer.ctx.fillStyle = '#ffffff';
				if (this.saveData.playerName) {
					renderer.ctx.fillText(this.saveData.playerName, currentX, y);
					const nameTextWidth = renderer.ctx.measureText(this.saveData.playerName).width;
					currentX += nameTextWidth + 20;
				}

				renderer.ctx.fillStyle = rankColor;
				const rankText = `${rank}`;
				const rankTextWidth = renderer.ctx.measureText(rankText).width;
				renderer.ctx.fillText(rankText, currentX, y);
				currentX += rankTextWidth + 10;
				
				renderer.ctx.fillStyle = '#ffd700';
				const starText = '★'.repeat(stars);
				const starTextWidth = renderer.ctx.measureText(starText).width;
				renderer.ctx.fillText(starText, currentX, y);
				currentX += starTextWidth + 20;

				if (this.saveData.money !== undefined) {
					const money = this.saveData.money || 0;
					const moneyText = SaveManager.formatLargeNumber(money);
					const coinSize = 24;
					const moneyTextFontSize = '18px';
					renderer.ctx.font = `${moneyTextFontSize} Pokemon`;
					const moneyTextWidth = renderer.ctx.measureText(moneyText).width;
					renderer.ctx.fillStyle = 'rgb(43, 231, 216)';
					
					renderer.ctx.fillText(moneyText, currentX, y + (coinSize / 2) - 6);
					
					const coinsImage = this.engine.sprites.get('coins');
					if (coinsImage) {
						renderer.drawImage(coinsImage, currentX + moneyTextWidth + 5, y, coinSize, coinSize);
					}
					
					renderer.ctx.font = `${infoFontSize} Pokemon`;
					renderer.ctx.fillStyle = '#ffffff';
				}

				y += lineHeight + 15;

				if (this.saveData.gamesPlayed !== undefined) {
					renderer.ctx.fillText(`Aventures: ${this.saveData.gamesPlayed}`, infoX, y);
					y += lineHeight;
				}

				if (this.saveData.totalPlayTime !== undefined) {
					const playTime = SaveManager.formatPlayTime(this.saveData.totalPlayTime);
					renderer.ctx.fillText(`Temps de jeu: ${playTime}`, infoX, y);
					y += lineHeight;
				}

				const totalDefeated = SaveManager.getTotalDefeatedPokemon(this.saveData.defeatedPokemonCounts);
				renderer.ctx.fillText(`Pokémon vaincus: ${totalDefeated}`, infoX, y);
				y += lineHeight;

				const playedPokemons = this.saveData.playedPokemons ? new Set(this.saveData.playedPokemons) : new Set();
				const teamSize = playedPokemons.size + (this.saveData.selectedPokemon ? 1 : 0);
				renderer.ctx.fillText(`Taille de l'équipe: ${teamSize}`, infoX, y);
				y += lineHeight;

				const eggsHatched = Math.max(0, encounteredPokemons.size - 1);
				renderer.ctx.fillText(`Œufs éclos: ${eggsHatched}`, infoX, y);
				y += lineHeight;

				const playedMaps = this.saveData.playedMaps ? new Set(this.saveData.playedMaps) : new Set();
				renderer.ctx.fillText(`Cartes explorées: ${playedMaps.size}`, infoX, y);
				y += lineHeight;

				renderer.ctx.fillText(`Pokémon rencontrés: ${encounteredPokemons.size}`, infoX, y);
				y += lineHeight;

				const bossCount = Object.keys(defeatedPokemonCounts).filter(pokemonName => {
					const pokemonSprite = PokemonSprites[pokemonName];
					return pokemonSprite && pokemonSprite.isBoss;
				}).reduce((sum, pokemonName) => sum + (defeatedPokemonCounts[pokemonName] || 0), 0);
				renderer.ctx.fillText(`Boss vaincus: ${bossCount}`, infoX, y);
				y += lineHeight;

				const eggProgress = this.saveData.eggProgress || {};
				const eggsCompleted = Object.values(eggProgress).filter(progress => 
					progress.currentKills >= progress.requiredKills
				).length;
				renderer.ctx.fillText(`Œufs complétés: ${eggsCompleted}`, infoX, y);
				y += lineHeight;

				const inventory = this.saveData.inventory || {};
				const totalItems = Object.values(inventory).reduce((sum, quantity) => sum + (quantity || 0), 0);
				renderer.ctx.fillText(`Total d'items: ${totalItems}`, infoX, y);
				y += lineHeight;

				renderer.ctx.restore();
			}

			
			const questionX = renderer.width - 1250;
			const questionY = renderer.height - 125;
			const questionFontSize = '25px';

			renderer.ctx.save();
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.font = `${questionFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'top';
			
			renderer.ctx.fillText('Reprendre la partie', questionX, questionY);
			renderer.ctx.restore();

			const choiceX = renderer.width - 220;
			const choiceStartY = renderer.height - 330;
			const choiceSpacing = 50;
			const choiceFontSize = '24px';
			const choices = ['Oui', 'Non'];

			choices.forEach((choice, index) => {
				const y = choiceStartY + index * choiceSpacing;
				const color = index === this.selectedContinueChoice ? '#ffff00' : '#ffffff';
				renderer.drawText(choice, choiceX, y, choiceFontSize, color, 'left');
				
				if (index === this.selectedContinueChoice) {
					renderer.drawText('>', choiceX - 40, y, choiceFontSize, color, 'left');
				}
			});
		} else if (this.showNewGameMenu) {
			const newCharOverlay = this.engine.sprites.get('new_char_overlay');
			if (newCharOverlay) {
				renderer.drawImage(newCharOverlay, 0, 0, renderer.width, renderer.height);
			}

			const pseudoX = 635;
			const pseudoY = 70;
			const pseudoFontSize = '24px';

			renderer.ctx.save();
			renderer.ctx.font = `${pseudoFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'top';
			
			if (this.isTypingPseudo) {
				renderer.ctx.fillStyle = '#ffff00';
				renderer.ctx.fillText('>', pseudoX - 30, pseudoY);
			}
			
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.fillText('Pseudo:', pseudoX, pseudoY);
			
			const pseudoText = this.pseudo || '';
			const pseudoTextX = pseudoX + 170;
			
			renderer.ctx.fillStyle = '#ffff00';
			renderer.ctx.fillText(pseudoText, pseudoTextX, pseudoY);
			
			if (this.isTypingPseudo && Math.floor(this.cursorBlink / 500) % 2 === 0) {
				const textWidth = renderer.ctx.measureText(pseudoText).width;
				renderer.ctx.fillText('_', pseudoTextX + textWidth, pseudoY);
			}
			
			renderer.ctx.restore();

			const starterLabelX = 635;
			const starterLabelY = 150;
			const pokemonStartX = 845;
			const pokemonY = 130;
			const pokemonIconSize = 64;
			const pokemonSpacing = 120;

			renderer.ctx.save();
			renderer.ctx.font = `${pseudoFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.fillText('Starter :', starterLabelX, starterLabelY);
			renderer.ctx.restore();

			this.selectedPokemons.forEach((pokemonName, index) => {
				const x = pokemonStartX + index * pokemonSpacing;
				const y = pokemonY;
				
				const pokemonSprite = this.engine.sprites.get(`pokemon_${pokemonName}_normal`);
				
				if (pokemonSprite) {
					if (index === this.selectedPokemonIndex && this.pseudoValidated) {
						renderer.drawRect(x - 4, y - 4, pokemonIconSize + 8, pokemonIconSize + 8, 'rgba(255, 255, 0, 0.3)');
						renderer.drawStrokeRect(x - 4, y - 4, pokemonIconSize + 8, pokemonIconSize + 8, '#ffff00', 3);
					}
					
					renderer.drawImage(pokemonSprite, x, y, pokemonIconSize, pokemonIconSize);
				}
				
				renderer.ctx.save();
				renderer.ctx.fillStyle = (index === this.selectedPokemonIndex && this.pseudoValidated) ? '#ffff00' : '#ffffff';
				renderer.ctx.font = '14px Pokemon';
				renderer.ctx.textAlign = 'center';
				renderer.ctx.fillText(pokemonName, x + pokemonIconSize / 2, y + pokemonIconSize + 15);
				renderer.ctx.restore();
			});

			{
				const helpX = 100;
				const helpY = renderer.height - 125;
				const helpFontSize = '25px';
				const maxWidth = renderer.width - 100;

				renderer.ctx.save();
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = `${helpFontSize} Pokemon`;
				renderer.ctx.textAlign = 'left';
				renderer.ctx.textBaseline = 'top';

				if (this.isTypingPseudo) {
					const text = 'Tapez votre pseudo puis appuyez sur ENTER pour continuer';
					const words = text.split(' ');
					let line = '';
					let y = helpY;
					
					words.forEach((word) => {
						const testLine = line + word + ' ';
						const metrics = renderer.ctx.measureText(testLine);
						const testWidth = metrics.width;
						
						if (testWidth > maxWidth && line !== '') {
							renderer.ctx.fillText(line, helpX, y);
							line = word + ' ';
							y += 22;
						} else {
							line = testLine;
						}
					});
					renderer.ctx.fillText(line, helpX, y);
				} else {
					const text = 'Utilisez les flèches gauche/droite pour sélectionner un Pokémon, puis ENTER pour confirmer';
					const words = text.split(' ');
					let line = '';
					let y = helpY;
					
					words.forEach((word) => {
						const testLine = line + word + ' ';
						const metrics = renderer.ctx.measureText(testLine);
						const testWidth = metrics.width;
						
						if (testWidth > maxWidth && line !== '') {
							renderer.ctx.fillText(line, helpX, y);
							line = word + ' ';
							y += 22;
						} else {
							line = testLine;
						}
					});
					renderer.ctx.fillText(line, helpX, y);
				}
				
				renderer.ctx.restore();
			}
		}
	}

	drawWrappedText(ctx, text, x, y, maxWidth, fontSize) {
		ctx.font = `${fontSize} Pokemon`;
		const words = text.split(' ');
		let line = '';
		let currentY = y;
		
		words.forEach((word) => {
			const testLine = line + word + ' ';
			const metrics = ctx.measureText(testLine);
			const testWidth = metrics.width;
			
			if (testWidth > maxWidth && line !== '') {
				ctx.fillText(line, x, currentY);
				line = word + ' ';
				currentY += 22;
			} else {
				line = testLine;
			}
		});
		ctx.fillText(line, x, currentY);
	}
}

