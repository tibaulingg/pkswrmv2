import { ItemConfig } from '../Config/ItemConfig.js';

export default class GameOverScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedIndex = 0;
		this.battleScene = null;
		this.isDefeat = true;
		this.itemAnimations = {};
		this.animationStartTime = 0;
		this.animationDuration = 1000;
	}

	init(data) {
		this.selectedIndex = 0;
		this.battleScene = data?.battleScene || null;
		this.isDefeat = true;
		this.itemAnimations = {};
		this.animationStartTime = 0;
		
		if (this.battleScene) {
			const moneyGained = this.battleScene.player.money - (this.battleScene.initialMoney || 0);
			const moneyOriginal = Math.floor(moneyGained);
			const moneyKept = Math.floor(moneyOriginal / 2);
			this.itemAnimations['money'] = {
				original: moneyOriginal,
				target: moneyKept,
				current: moneyOriginal
			};
			
			const sessionInventory = this.battleScene.sessionInventory || {};
			Object.entries(sessionInventory).forEach(([itemId, quantity]) => {
				if (quantity > 0) {
					const keptQuantity = Math.floor(quantity / 2);
					this.itemAnimations[itemId] = {
						original: quantity,
						target: keptQuantity,
						current: quantity
					};
				}
			});
		}
	}

	update(deltaTime) {
		this.animationStartTime += deltaTime;
		
		const progress = Math.min(1, this.animationStartTime / this.animationDuration);
		
		for (const key in this.itemAnimations) {
			const anim = this.itemAnimations[key];
			const diff = anim.original - anim.target;
			anim.current = Math.floor(anim.original - (diff * progress));
		}

		const key = this.engine.input.consumeLastKey();
		
		if (key === 'ArrowUp' || key === 'ArrowDown') {
			this.selectedIndex = this.selectedIndex === 0 ? 1 : 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'Enter') {
			this.selectOption();
		}
	}

	formatTime(milliseconds) {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	selectOption() {
		const options = this.getOptions();
		const selectedOption = options[this.selectedIndex];
		
		if (selectedOption && selectedOption.action) {
			selectedOption.action(this.engine);
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	getOptions() {
		const options = [];
		
		if (this.battleScene) {
			options.push({
				label: 'Rejouer',
				action: (engine) => {
					engine.sceneManager.popScene();
					if (this.battleScene.mapData) {
						engine.gameManager.startGame(this.battleScene.mapData);
					}
				}
			});
		}
		
		options.push({
			label: 'Retour au Village',
			action: (engine) => {
				engine.sceneManager.popScene();
				engine.sceneManager.changeScene('game', { enteringFromTop: true });
			}
		});
		
		return options;
	}

	render(renderer) {
		const gameOverImage = this.engine.sprites.get('game_over');
		if (gameOverImage) {
			renderer.drawImage(gameOverImage, 0, 0, renderer.width, renderer.height);
		}

		if (!this.battleScene) return;

		const startX = 550;
		let currentY = 270;
		const lineHeight = 40;
		const iconSize = 32;
		const pokemonIconSize = 48;
		const spacing = 15;
		const fontSize = 24;
		const titleFontSize = 32;

		renderer.ctx.save();
		renderer.ctx.font = `${fontSize}px Pokemon`;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';

		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 3;
		renderer.ctx.font = `bold ${titleFontSize}px Pokemon`;
		const titleText = this.isDefeat ? 'DÉFAITE' : 'VICTOIRE';
		renderer.ctx.strokeText(titleText, startX, currentY);
		renderer.ctx.fillText(titleText, startX, currentY);
		
		currentY += titleFontSize + 20;

		renderer.ctx.strokeStyle = '#ffffff';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.moveTo(startX, currentY);
		renderer.ctx.lineTo(startX + 300, currentY);
		renderer.ctx.stroke();
		
		currentY += 30;

		if (this.isDefeat) {
			const killerEnemy = this.battleScene.killerEnemy;
			if (killerEnemy && killerEnemy.pokemonConfig) {
				const pokemonName = killerEnemy.pokemonConfig.name;
				const pokemonLevel = killerEnemy.level || 1;
				const pokemonSprite = this.engine.sprites.get(`pokemon_${pokemonName}_normal`);
				
				renderer.ctx.font = `${fontSize}px Pokemon`;
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 3;
				renderer.ctx.fillText('Vaincu par', startX, currentY);
				
				if (pokemonSprite) {
					const iconX = startX + 220;
					const iconY = currentY - 5;
					renderer.ctx.drawImage(pokemonSprite, iconX, iconY, pokemonIconSize, pokemonIconSize);
					
					const nameX = iconX + pokemonIconSize + spacing;
					const nameText = `${pokemonName.toUpperCase()} Lv.${pokemonLevel}`;
					renderer.ctx.fillText(nameText, nameX, currentY);
				}
				
				currentY += pokemonIconSize + 20;
			} else {
				renderer.ctx.font = `${fontSize}px Pokemon`;
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 3;
				renderer.ctx.fillText('Abandon', startX, currentY);
				
				currentY += lineHeight + 20;
			}
		}

		const survivalTime = this.battleScene.survivalTime || 0;
		const timeString = this.formatTime(survivalTime);
		
		renderer.ctx.font = `${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 3;
		renderer.ctx.fillText(`Temps de survie: ${timeString}`, startX, currentY);
		
		currentY += lineHeight;

		const totalEnemiesKilled = this.battleScene.enemySpawner ? (this.battleScene.enemySpawner.totalEnemiesKilled || 0) : 0;
		renderer.ctx.fillText(`Pokemons vaincus: ${totalEnemiesKilled}`, startX, currentY);
		
		currentY += lineHeight + 30;

		const moneyAnim = this.itemAnimations['money'] || { original: 0, target: 0, current: 0 };
		const coinSprite = this.engine.sprites.get('coins');
		
		if (coinSprite) {
			renderer.ctx.drawImage(coinSprite, startX, currentY - iconSize / 2, iconSize, iconSize);
		}
		
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'middle';
		renderer.ctx.font = `${fontSize}px Pokemon`;
		
		const currentText = `${moneyAnim.current}`;
		const originalText = `${moneyAnim.original}`;
		const textY = currentY;
		const textX = startX + iconSize + spacing;
		
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.strokeText(currentText, textX, textY);
		renderer.ctx.fillText(currentText, textX, textY);
		
		if (this.isDefeat && moneyAnim.original !== moneyAnim.target) {
			const currentWidth = renderer.ctx.measureText(currentText).width;
			const originalX = textX + currentWidth + spacing;
			
			renderer.ctx.fillStyle = '#888888';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.strokeText(`(${originalText}`, originalX, textY);
			renderer.ctx.fillText(`(${originalText}`, originalX, textY);
			
			const originalWidth = renderer.ctx.measureText(`(${originalText}`).width;
			
			renderer.ctx.strokeStyle = '#ff0000';
			renderer.ctx.lineWidth = 3;
			renderer.ctx.beginPath();
			renderer.ctx.moveTo(originalX, textY);
			renderer.ctx.lineTo(originalX + originalWidth, textY);
			renderer.ctx.stroke();
			
			renderer.ctx.fillStyle = '#888888';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.strokeText(')', originalX + originalWidth, textY);
			renderer.ctx.fillText(')', originalX + originalWidth, textY);
		}
		
		currentY += lineHeight;

		const sessionInventory = this.battleScene.sessionInventory || {};
		const itemsPerColumn = 3;
		const columnWidth = 250;
		
		const validItems = Object.entries(sessionInventory)
			.filter(([itemId, quantity]) => {
				if (quantity <= 0) return false;
				const itemConfig = ItemConfig[itemId];
				if (!itemConfig) return false;
				if (!this.itemAnimations[itemId]) return false;
				return true;
			});
		
		const totalItems = validItems.length;
		const itemsStartY = currentY;
		
		if (totalItems > 0) {
			validItems.forEach(([itemId, quantity], index) => {
				const columnIndex = Math.floor(index / itemsPerColumn);
				const rowIndex = index % itemsPerColumn;
				const itemX = startX + (columnIndex * columnWidth);
				const itemY = itemsStartY + (rowIndex * lineHeight);
			
				const anim = this.itemAnimations[itemId];
				const itemSprite = this.engine.sprites.get(`item_${itemId}`);
				
				if (itemSprite) {
					renderer.ctx.drawImage(itemSprite, itemX, itemY - iconSize / 2, iconSize, iconSize);
				}
				
				renderer.ctx.textAlign = 'left';
				renderer.ctx.textBaseline = 'middle';
				renderer.ctx.font = `${fontSize}px Pokemon`;
				
				const currentText = `${anim.current}`;
				const originalText = `${anim.original}`;
				const textY = itemY;
				const textX = itemX + iconSize + spacing;
				
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 2;
				renderer.ctx.strokeText(currentText, textX, textY);
				renderer.ctx.fillText(currentText, textX, textY);
				
				if (this.isDefeat && anim.original !== anim.target) {
					const currentWidth = renderer.ctx.measureText(currentText).width;
					const originalX = textX + currentWidth + spacing;
					
					renderer.ctx.fillStyle = '#888888';
					renderer.ctx.strokeStyle = '#000000';
					renderer.ctx.lineWidth = 2;
					renderer.ctx.strokeText(`(${originalText}`, originalX, textY);
					renderer.ctx.fillText(`(${originalText}`, originalX, textY);
					
					const originalWidth = renderer.ctx.measureText(`(${originalText}`).width;
					
					renderer.ctx.strokeStyle = '#ff0000';
					renderer.ctx.lineWidth = 3;
					renderer.ctx.beginPath();
					renderer.ctx.moveTo(originalX, textY);
					renderer.ctx.lineTo(originalX + originalWidth, textY);
					renderer.ctx.stroke();
					
					renderer.ctx.fillStyle = '#888888';
					renderer.ctx.strokeStyle = '#000000';
					renderer.ctx.lineWidth = 2;
					renderer.ctx.strokeText(')', originalX + originalWidth, textY);
					renderer.ctx.fillText(')', originalX + originalWidth, textY);
				}
			});
		}
		
		const maxRowsInAnyColumn = Math.min(itemsPerColumn, Math.max(totalItems, itemsPerColumn));
		currentY = itemsStartY + (maxRowsInAnyColumn * lineHeight);

		renderer.ctx.restore();

		const options = this.getOptions();
		const optionsStartY = currentY + 40;
		const optionSpacing = 50;
		const optionFontSize = '28px';

		options.forEach((option, index) => {
			const y = optionsStartY + index * optionSpacing;
			const color = index === this.selectedIndex ? '#ffff00' : '#ffffff';
			renderer.drawText(option.label, startX, y, optionFontSize, color, 'left');
			
			if (index === this.selectedIndex) {
				renderer.drawText('>', startX - 30, y, optionFontSize, color, 'left');
			}
		});
	}
}

