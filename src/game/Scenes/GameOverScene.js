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
		this.isDefeat = data?.isVictory === false || (data?.isVictory === undefined && true);
		this.isEndlessAfterVictory = data?.isEndlessAfterVictory || false;
		this.itemAnimations = {};
		this.animationStartTime = 0;
		
		// Jouer la musique de victoire (la musique de défaite est déjà jouée dans startDeathAnimation)
		if (!this.isDefeat) {
			this.engine.audio.playMusic('victory', 0.7, false);
		}
		
		if (this.battleScene) {
			if (this.isDefeat) {
				// Défaite : réduire les items de moitié SAUF si c'est en endless après victoire
				if (this.isEndlessAfterVictory) {
					// Endless après victoire : garder tous les items (pas de réduction)
					const moneyGained = this.battleScene.player.money - (this.battleScene.initialMoney || 0);
					const moneyTotal = Math.floor(moneyGained);
					if (moneyTotal > 0) {
						this.itemAnimations['money'] = {
							original: moneyTotal,
							target: moneyTotal,
							current: moneyTotal
						};
					}
					
					const sessionInventory = this.battleScene.sessionInventory || {};
					Object.entries(sessionInventory).forEach(([itemId, quantity]) => {
						if (quantity > 0) {
							this.itemAnimations[itemId] = {
								original: quantity,
								target: quantity,
								current: quantity
							};
						}
					});
				} else {
					// Défaite normale : réduire les items de moitié
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
			} else {
				// Victoire : garder tous les items (pas de réduction)
				const moneyGained = this.battleScene.player.money - (this.battleScene.initialMoney || 0);
				const moneyTotal = Math.floor(moneyGained);
				if (moneyTotal > 0) {
					this.itemAnimations['money'] = {
						original: moneyTotal,
						target: moneyTotal,
						current: moneyTotal
					};
				}
				
				const sessionInventory = this.battleScene.sessionInventory || {};
				Object.entries(sessionInventory).forEach(([itemId, quantity]) => {
					if (quantity > 0) {
						this.itemAnimations[itemId] = {
							original: quantity,
							target: quantity,
							current: quantity
						};
					}
				});
			}
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
			if (this.isDefeat) {
				options.push({
					label: 'Rejouer',
					action: (engine) => {
						engine.sceneManager.popScene();
						if (this.battleScene.mapData) {
							engine.gameManager.startGame(this.battleScene.mapData);
						}
					}
				});
			} else {
				// Victoire : option pour continuer en mode endless
				options.push({
					label: 'Continuer (Endless)',
					action: (engine) => {
						engine.sceneManager.popScene();
						// Reprendre le jeu en mode endless
						// Ne pas transférer les récompenses maintenant, elles seront données à la mort
						this.battleScene.isEndlessAfterVictory = true;
						this.battleScene.bossDefeated = true;
						this.battleScene.bossSpawned = false;
						this.battleScene.boss = null;
						if (this.battleScene.mapData && this.battleScene.mapData.bossTimer) {
							this.battleScene.bossTimer = this.battleScene.mapData.bossTimer;
						}
						this.battleScene.state = 'playing';
						engine.audio.stopMusic();
						const musicName = `map_${this.battleScene.mapData.image}`;
						engine.audio.playMusic(musicName);
					}
				});
			}
		}
		
		options.push({
			label: 'Retour au Village',
			action: (engine) => {
				// Si on retourne au village depuis la victoire, transférer les récompenses
				if (this.battleScene && !this.isDefeat && !this.battleScene.isEndlessAfterVictory) {
					if (this.battleScene.transferSessionRewardsToEngine) {
						this.battleScene.transferSessionRewardsToEngine();
					}
				}
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

		const sessionInventory = this.battleScene.sessionInventory || {};
		const itemsPerColumn = 4;
		const columnWidth = 250;
		
		const allItems = [];
		
		const moneyAnim = this.itemAnimations['money'];
		if (moneyAnim && moneyAnim.original > 0) {
			allItems.push({ itemId: 'money', isMoney: true });
		}
		
		const validItems = Object.entries(sessionInventory)
			.filter(([itemId, quantity]) => {
				if (quantity <= 0) return false;
				const itemConfig = ItemConfig[itemId];
				if (!itemConfig) return false;
				if (!this.itemAnimations[itemId]) return false;
				return true;
			})
			.map(([itemId]) => ({ itemId, isMoney: false }));
		
		allItems.push(...validItems);
		
		const totalItems = allItems.length;
		const itemsStartY = currentY;
		
		if (totalItems > 0) {
			allItems.forEach((item, index) => {
				const columnIndex = Math.floor(index / itemsPerColumn);
				const rowIndex = index % itemsPerColumn;
				const itemX = startX + (columnIndex * columnWidth);
				const itemY = itemsStartY + (rowIndex * lineHeight);
			
				const anim = this.itemAnimations[item.itemId];
				let itemSprite = null;
				
				if (item.isMoney) {
					itemSprite = this.engine.sprites.get('coins');
				} else {
					itemSprite = this.engine.sprites.get(`item_${item.itemId}`);
				}
				
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

