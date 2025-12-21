import { PokemonSprites } from '../Config/SpriteConfig.js';
import SaveManager from '../Systems/SaveManager.js';

export default class NewGameScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedPokemonIndex = 0;
		this.backgroundIndex = 1;
		this.pokemonList = Object.keys(PokemonSprites);
		this.pseudo = '';
		this.isTypingPseudo = true;
		this.cursorBlink = 0;
		this.pokemonPerRow = 5;
		this.isConfirming = false;
		this.selectedChoice = 0;
		this.pseudoValidated = false;
	}

	init() {
		this.selectedPokemonIndex = 0;
		this.backgroundIndex = Math.floor(Math.random() * 3) + 1;
		this.pseudo = '';
		this.isTypingPseudo = true;
		this.cursorBlink = 0;
		this.isConfirming = false;
		this.selectedChoice = 0;
		this.pseudoValidated = false;
	}

	update(deltaTime) {
		this.cursorBlink += deltaTime;
		if (this.cursorBlink > 1000) {
			this.cursorBlink = 0;
		}

		if (this.isTypingPseudo) {
			const key = this.engine.input.consumeLastKey();
			const keyValue = this.engine.input.consumeLastKeyValue();
			
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
			}
		} else if (this.isConfirming) {
			const key = this.engine.input.consumeLastKey();
			
			if (key === 'ArrowUp') {
				this.selectedChoice = 0;
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'ArrowDown') {
				this.selectedChoice = 1;
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'Enter') {
				if (this.selectedChoice === 0) {
					this.startGame();
				} else {
					this.isConfirming = false;
					this.isTypingPseudo = true;
					this.pseudoValidated = false;
					this.engine.audio.play('ok', 0.3, 0.1);
				}
			} else if (key === 'Escape') {
				this.isConfirming = false;
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		} else {
			const key = this.engine.input.consumeLastKey();
			
			if (key === 'ArrowLeft') {
				this.selectedPokemonIndex = Math.max(0, this.selectedPokemonIndex - 1);
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'ArrowRight') {
				this.selectedPokemonIndex = Math.min(this.pokemonList.length - 1, this.selectedPokemonIndex + 1);
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'ArrowUp') {
				this.selectedPokemonIndex = Math.max(0, this.selectedPokemonIndex - this.pokemonPerRow);
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'ArrowDown') {
				this.selectedPokemonIndex = Math.min(this.pokemonList.length - 1, this.selectedPokemonIndex + this.pokemonPerRow);
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'Enter') {
				this.isConfirming = true;
				this.selectedChoice = 0;
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'Escape' || key === 'Backspace') {
				this.isTypingPseudo = true;
				this.pseudoValidated = false;
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		}
	}

	startGame() {
		const selectedPokemon = this.pokemonList[this.selectedPokemonIndex];
		const playerName = this.pseudo || 'Trainer';
		
		this.engine.money = 0;
		this.engine.displayedMoney = 0;
		this.engine.inventory = {};
		this.engine.selectedPokemon = selectedPokemon;
		this.engine.playerName = playerName;
		this.engine.encounteredPokemons = new Set();
		this.engine.playedPokemons = new Set();
		this.engine.playedMaps = new Set();
		this.engine.defeatedPokemonCounts = {};
		this.engine.totalPlayTime = 0;
		this.engine.gamesPlayed = 0;
		
		SaveManager.saveGame(this.engine, true);
		
		this.engine.sceneManager.changeScene('game', {
			selectedPokemon: selectedPokemon,
			playerName: playerName
		});
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

		const pseudoX = 80;
		const pseudoY = 50;
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
		
		if (this.isTypingPseudo) {
			renderer.ctx.fillStyle = '#ffff00';
		} else if (this.isConfirming) {
			renderer.ctx.fillStyle = '#ffff00';
		} else {
			renderer.ctx.fillStyle = '#ffffff';
		}
		renderer.ctx.fillText(pseudoText, pseudoTextX, pseudoY);
		
		if (this.isTypingPseudo && Math.floor(this.cursorBlink / 500) % 2 === 0) {
			const textWidth = renderer.ctx.measureText(pseudoText).width;
			renderer.ctx.fillText('_', pseudoTextX + textWidth, pseudoY);
		}
		
		renderer.ctx.restore();

		const pokemonGridX = 80;
		const pokemonGridY = 150;
		const pokemonIconSize = 64;
		const pokemonSpacing = 120;
		const pokemonPerRow = this.pokemonPerRow;

		renderer.ctx.save();
		renderer.ctx.font = '20px Pokemon';
		renderer.ctx.textAlign = 'left';
		
		if (!this.isTypingPseudo && !this.isConfirming) {
			renderer.ctx.fillStyle = '#ffff00';
			renderer.ctx.fillText('>', pokemonGridX - 30, pokemonGridY - 30);
			renderer.ctx.fillStyle = '#ffff00';
		} else {
			renderer.ctx.fillStyle = '#ffffff';
		}
		renderer.ctx.fillText('Choisissez votre starter:', pokemonGridX, pokemonGridY - 30);
		renderer.ctx.restore();

		this.pokemonList.forEach((pokemonName, index) => {
			const row = Math.floor(index / pokemonPerRow);
			const col = index % pokemonPerRow;
			const x = pokemonGridX + col * pokemonSpacing;
			const y = pokemonGridY + row * pokemonSpacing;
			
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

		const helpX = 50;
		const helpY = renderer.height - 100;
		const helpFontSize = '18px';
		const maxWidth = renderer.width -300;
		
		renderer.ctx.save();
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.font = `${helpFontSize} Pokemon`;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';
		
		if (this.isConfirming) {
			const questionText = 'Confirmer vos choix ?';
			renderer.ctx.fillText(questionText, helpX, helpY);
			
			const choiceX = renderer.width - 200;
			const choiceStartY = helpY ;
			const choiceSpacing = 35;
			const choices = ['Oui', 'Non'];
			
			choices.forEach((choice, index) => {
				const y = choiceStartY + index * choiceSpacing;
				const color = index === this.selectedChoice ? '#ffff00' : '#ffffff';
				renderer.ctx.fillStyle = color;
				renderer.ctx.fillText(choice, choiceX, y);
				
				if (index === this.selectedChoice) {
					renderer.ctx.fillText('>', choiceX - 20, y);
				}
			});
		} else if (this.isTypingPseudo) {
			
				const text = 'Tapez votre pseudo puis appuyez sur ENTER pour continuer';
				this.drawWrappedText(renderer.ctx, text, helpX, helpY, maxWidth, helpFontSize);
			
		} else {
			const text = 'Utilisez les flèches pour sélectionner un Pokémon, puis ENTER pour confirmer';
			this.drawWrappedText(renderer.ctx, text, helpX, helpY, maxWidth, helpFontSize);
		}
		
		renderer.ctx.restore();
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

