import SaveManager from '../Systems/SaveManager.js';
import RankManager from '../Systems/RankManager.js';
import { getMapConfig } from '../Config/MapConfig.js';
import { ItemConfig, getCategoryName, getItemsByCategory } from '../Config/ItemConfig.js';
import { getPokemonConfig } from '../Config/SpriteConfig.js';
import AnimationSystem from '../Systems/AnimationSystem.js';

export default class PauseScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedIndex = 0;
		this.options = [];
		this.showInventory = false;
		this.selectedCategoryIndex = 0;
		this.selectedItemIndex = 0;
		this.currentPage = 0;
		this.itemsPerPage = 13;
		this.keyRepeatTimers = {};
		this.keyRepeatDelay = 300;
		this.keyRepeatInterval = 50;
		this.eggsOnlyMode = false;
		this.originalMusicVolume = null;
		this.showTeam = false;
		this.selectedTeamPokemonIndex = 0;
		this.teamCurrentPage = 0;
		this.teamItemsPerPage = 13;
	}

	init(data) {
		this.selectedIndex = 0;
		this.showInventory = false;
		this.selectedCategoryIndex = 0;
		this.selectedItemIndex = 0;
		this.currentPage = 0;
		this.eggsOnlyMode = false;
		this.showTeam = false;
		this.selectedTeamPokemonIndex = 0;
		this.teamCurrentPage = 0;
		this.updateOptions();
		
		if (this.engine.audio.currentMusic) {
			this.originalMusicVolume = this.engine.audio.currentMusic.volume;
			this.engine.audio.currentMusic.volume = this.originalMusicVolume * 0.3;
		}
		
		if (data && data.openEggsMenu) {
			const eggsOptionIndex = this.options.findIndex(opt => opt.label === 'Oeufs');
			if (eggsOptionIndex !== -1) {
				this.selectedIndex = eggsOptionIndex;
				this.selectOption();
			}
		}
	}

	updateOptions() {
		this.options = [
			{
				label: 'Objets'
			},
			{
				label: 'Oeufs'
			},
			{
				label: 'Equipe'
			},
			{
				label: 'Quitter'
			}
		];
	}

	update(deltaTime) {
		const key = this.engine.input.consumeLastKey();
		
		if (this.showTeam) {
			const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
			
			arrowKeys.forEach(arrowKey => {
				if (this.engine.input.isKeyDown(arrowKey)) {
					if (!this.keyRepeatTimers[arrowKey]) {
						this.keyRepeatTimers[arrowKey] = this.keyRepeatDelay;
						this.handleTeamKey(arrowKey);
					} else {
						this.keyRepeatTimers[arrowKey] -= deltaTime;
						if (this.keyRepeatTimers[arrowKey] <= 0) {
							this.keyRepeatTimers[arrowKey] = this.keyRepeatInterval;
							this.handleTeamKey(arrowKey);
						}
					}
				} else {
					if (this.keyRepeatTimers[arrowKey]) {
						delete this.keyRepeatTimers[arrowKey];
					}
				}
			});
			
			if (key === 'Escape') {
				this.showTeam = false;
				this.selectedTeamPokemonIndex = 0;
				this.teamCurrentPage = 0;
				this.keyRepeatTimers = {};
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'Enter') {
				this.handleTeamPokemonSelection();
			}
		} else if (this.showInventory) {
			const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
			
			arrowKeys.forEach(arrowKey => {
				if (this.engine.input.isKeyDown(arrowKey)) {
					if (!this.keyRepeatTimers[arrowKey]) {
						this.keyRepeatTimers[arrowKey] = this.keyRepeatDelay;
						this.handleInventoryKey(arrowKey);
					} else {
						this.keyRepeatTimers[arrowKey] -= deltaTime;
						if (this.keyRepeatTimers[arrowKey] <= 0) {
							this.keyRepeatTimers[arrowKey] = this.keyRepeatInterval;
							this.handleInventoryKey(arrowKey);
						}
					}
				} else {
					if (this.keyRepeatTimers[arrowKey]) {
						delete this.keyRepeatTimers[arrowKey];
					}
				}
			});
			
			if (key === 'Escape') {
				this.showInventory = false;
				this.selectedCategoryIndex = 0;
				this.selectedItemIndex = 0;
				this.currentPage = 0;
				this.eggsOnlyMode = false;
				this.keyRepeatTimers = {};
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'Enter') {
				this.handleInventoryItemAction();
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
			} else if (key === 'Escape') {
				if (this.engine.audio.currentMusic && this.originalMusicVolume !== null) {
					this.engine.audio.currentMusic.volume = this.originalMusicVolume;
				}
				this.engine.sceneManager.popScene();
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		}
	}

	handleInventoryKey(key) {
		if (key === 'ArrowLeft' && !this.eggsOnlyMode) {
			const categories = this.getCategories();
			this.selectedCategoryIndex = Math.max(0, this.selectedCategoryIndex - 1);
			this.currentPage = 0;
			const items = this.getCurrentCategoryItems();
			const firstValidIndex = this.getFirstValidItemIndex(items.slice(0, this.itemsPerPage));
			this.selectedItemIndex = firstValidIndex;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowRight' && !this.eggsOnlyMode) {
			const categories = this.getCategories();
			this.selectedCategoryIndex = Math.min(categories.length - 1, this.selectedCategoryIndex + 1);
			this.currentPage = 0;
			const items = this.getCurrentCategoryItems();
			const firstValidIndex = this.getFirstValidItemIndex(items.slice(0, this.itemsPerPage));
			this.selectedItemIndex = firstValidIndex;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowUp') {
			const items = this.getCurrentCategoryItems();
			const totalPages = Math.ceil(items.length / this.itemsPerPage);
			
			if (this.selectedItemIndex === 0 && this.currentPage > 0) {
				this.currentPage--;
				const startIndex = this.currentPage * this.itemsPerPage;
				const endIndex = Math.min(startIndex + this.itemsPerPage, items.length);
				let newIndex = endIndex - startIndex - 1;
				while (newIndex >= 0 && items[startIndex + newIndex] && items[startIndex + newIndex].isSeparator) {
					newIndex--;
				}
				this.selectedItemIndex = Math.max(0, newIndex);
			} else {
				let newIndex = this.selectedItemIndex - 1;
				const startIndex = this.currentPage * this.itemsPerPage;
				while (newIndex >= 0 && items[startIndex + newIndex] && items[startIndex + newIndex].isSeparator) {
					newIndex--;
				}
				this.selectedItemIndex = Math.max(0, newIndex);
			}
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowDown') {
			const items = this.getCurrentCategoryItems();
			const totalPages = Math.ceil(items.length / this.itemsPerPage);
			const startIndex = this.currentPage * this.itemsPerPage;
			const endIndex = Math.min(startIndex + this.itemsPerPage, items.length);
			const maxIndex = endIndex - startIndex - 1;
			
			if (this.selectedItemIndex === maxIndex && this.currentPage < totalPages - 1) {
				this.currentPage++;
				let newIndex = 0;
				while (newIndex < items.length && items[this.currentPage * this.itemsPerPage + newIndex] && items[this.currentPage * this.itemsPerPage + newIndex].isSeparator) {
					newIndex++;
				}
				this.selectedItemIndex = newIndex;
			} else {
				let newIndex = this.selectedItemIndex + 1;
				while (newIndex <= maxIndex && items[startIndex + newIndex] && items[startIndex + newIndex].isSeparator) {
					newIndex++;
				}
				this.selectedItemIndex = Math.min(maxIndex, newIndex);
			}
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	getCategories() {
		const allCategories = new Set();
		Object.values(ItemConfig).forEach(item => {
			if (item && item.category) {
				allCategories.add(item.category);
			}
		});
		return Array.from(allCategories).sort();
	}

	getFirstValidItemIndex(items, startIndex = 0) {
		for (let i = startIndex; i < items.length; i++) {
			if (items[i] && !items[i].isSeparator) {
				return i;
			}
		}
		return Math.max(0, items.length - 1);
	}

	getCurrentCategoryItems() {
		const allItems = [];
		const categories = this.getCategories();
		const currentCategory = categories[this.selectedCategoryIndex];
		
		if (!currentCategory) return [];
		
		if (currentCategory === 'egg') {
			if (!this.engine.eggProgress) {
				this.engine.eggProgress = {};
			}
			if (!this.engine.eggUniqueIds) {
				this.engine.eggUniqueIds = {};
			}
			
			const allEggTypes = getItemsByCategory('egg');
			const rarityOrder = { 'common': 0, 'rare': 1, 'epic': 2, 'legendary': 3 };
			const incubatingEggs = [];
			const otherEggs = [];
			
			allEggTypes.forEach(eggConfig => {
				const itemId = eggConfig.id;
				const uniqueIds = this.engine.eggUniqueIds[itemId] || [];
				const incubatingUniqueId = this.engine.incubatingEgg && this.engine.incubatingEgg.itemId === itemId ? this.engine.incubatingEgg.uniqueId : null;
				
				uniqueIds.forEach(uniqueId => {
					if (!this.engine.eggProgress[uniqueId]) {
						this.engine.eggProgress[uniqueId] = { currentKills: 0, requiredKills: eggConfig.requiredKills };
					}
					
					const isIncubating = uniqueId === incubatingUniqueId;
					const progress = isIncubating ? this.engine.incubatingEgg.currentKills : this.engine.eggProgress[uniqueId].currentKills;
					
					const eggItem = {
						id: itemId,
						uniqueId: uniqueId,
						quantity: 1,
						config: eggConfig,
						isIncubating: isIncubating,
						currentKills: progress,
						requiredKills: eggConfig.requiredKills
					};
					
					if (isIncubating) {
						incubatingEggs.push(eggItem);
					} else {
						otherEggs.push(eggItem);
					}
				});
			});
			
			otherEggs.sort((a, b) => {
				const rarityA = rarityOrder[a.config.rarity] || 0;
				const rarityB = rarityOrder[b.config.rarity] || 0;
				if (rarityA !== rarityB) return rarityB - rarityA;
				return a.config.name.localeCompare(b.config.name);
			});
			
			if (incubatingEggs.length > 0) {
				allItems.push(...incubatingEggs);
				allItems.push({ isSeparator: true });
			}
			allItems.push(...otherEggs);
		} else {
			Object.entries(this.engine.inventory || {}).forEach(([itemId, quantity]) => {
				const item = ItemConfig[itemId];
				if (!item || quantity <= 0 || item.category !== currentCategory) return;
				
				if (item.category === 'equipable') {
					for (let i = 0; i < quantity; i++) {
						allItems.push({
							id: itemId,
							uniqueId: `${itemId}_${i}`,
							quantity: 1,
							config: item
						});
					}
				} else {
					allItems.push({
						id: itemId,
						uniqueId: itemId,
						quantity: quantity,
						config: item
					});
				}
			});
		}
		
		if (currentCategory !== 'egg') {
			return allItems.sort((a, b) => {
				const nameA = a.config ? a.config.name : a.id;
				const nameB = b.config ? b.config.name : b.id;
				return nameA.localeCompare(nameB);
			});
		}
		
		return allItems;
	}

	updatePageIfNeeded() {
		const items = this.getCurrentCategoryItems();
		const totalPages = Math.ceil(items.length / this.itemsPerPage);
		
		if (this.selectedItemIndex >= this.itemsPerPage) {
			this.currentPage = Math.floor(this.selectedItemIndex / this.itemsPerPage);
			this.selectedItemIndex = this.selectedItemIndex % this.itemsPerPage;
		} else if (this.currentPage > 0 && this.selectedItemIndex < 0) {
			this.currentPage = Math.max(0, this.currentPage - 1);
			const itemsOnPage = Math.min(this.itemsPerPage, items.length - (this.currentPage * this.itemsPerPage));
			this.selectedItemIndex = itemsOnPage - 1;
		}
		
		const maxPage = Math.max(0, totalPages - 1);
		if (this.currentPage > maxPage) {
			this.currentPage = maxPage;
			const itemsOnPage = Math.min(this.itemsPerPage, items.length - (this.currentPage * this.itemsPerPage));
			this.selectedItemIndex = Math.min(this.selectedItemIndex, itemsOnPage - 1);
		}
	}

	handleInventoryItemAction() {
		const items = this.getCurrentCategoryItems();
		const startIndex = this.currentPage * this.itemsPerPage;
		const itemIndex = startIndex + this.selectedItemIndex;
		
		if (itemIndex >= items.length) return;
		
		const item = items[itemIndex];
		if (!item || item.isSeparator || !item.config) return;
		
		const itemId = item.id;
		const uniqueId = item.uniqueId;
		const category = item.config.category;
		
		if (category === 'equipable') {
			const isEquipped = this.engine.equippedItems.includes(uniqueId);
			if (isEquipped) {
				const index = this.engine.equippedItems.indexOf(uniqueId);
				this.engine.equippedItems.splice(index, 1);
				this.engine.audio.play('ok', 0.3, 0.1);
			} else {
				if (this.engine.equippedItems.length > 0) {
					this.engine.equippedItems = [];
				}
				this.engine.equippedItems.push(uniqueId);
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		} else if (category === 'consumable') {
			if (this.engine.assignedConsumable === itemId) {
				this.engine.assignedConsumable = null;
			} else {
				this.engine.assignedConsumable = itemId;
			}
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (category === 'egg') {
			if (!this.engine.eggProgress) {
				this.engine.eggProgress = {};
			}
			
			if (item.isIncubating) {
				if (this.engine.incubatingEgg && this.engine.incubatingEgg.uniqueId === item.uniqueId) {
					this.engine.eggProgress[item.uniqueId] = {
						currentKills: this.engine.incubatingEgg.currentKills,
						requiredKills: this.engine.incubatingEgg.requiredKills
					};
					this.engine.incubatingEgg = null;
					if (!this.engine.inventory[itemId]) {
						this.engine.inventory[itemId] = 0;
					}
					this.engine.inventory[itemId]++;
					SaveManager.saveGame(this.engine, false);
					this.engine.audio.play('ok', 0.3, 0.1);
				}
				return;
			}
			
			const eggConfig = item.config;
			const progress = this.engine.eggProgress[item.uniqueId] || { currentKills: 0, requiredKills: eggConfig.requiredKills };
			const requiredKills = progress.requiredKills !== undefined ? progress.requiredKills : eggConfig.requiredKills;
			const currentKills = progress.currentKills || 0;
			
			if (currentKills >= requiredKills) {
				this.engine.audio.play('ok', 0.1, 0.1);
				return;
			}
			
			if (this.engine.incubatingEgg) {
				this.engine.eggProgress[this.engine.incubatingEgg.uniqueId] = {
					currentKills: this.engine.incubatingEgg.currentKills,
					requiredKills: this.engine.incubatingEgg.requiredKills
				};
				if (!this.engine.inventory[this.engine.incubatingEgg.itemId]) {
					this.engine.inventory[this.engine.incubatingEgg.itemId] = 0;
				}
				this.engine.inventory[this.engine.incubatingEgg.itemId]++;
			}
			
			this.engine.incubatingEgg = {
				uniqueId: item.uniqueId,
				itemId: itemId,
				currentKills: currentKills,
				requiredKills: requiredKills,
				possiblePokemon: eggConfig.possiblePokemon,
				rarity: eggConfig.rarity
			};
			
			this.engine.inventory[itemId] = (this.engine.inventory[itemId] || 0) - 1;
			if (this.engine.inventory[itemId] <= 0) {
				delete this.engine.inventory[itemId];
			}
			
			SaveManager.saveGame(this.engine, false);
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	selectOption() {
		const option = this.options[this.selectedIndex];
		
		if (option.label === 'Objets') {
			this.showInventory = true;
			this.eggsOnlyMode = false;
			this.selectedCategoryIndex = 0;
			this.currentPage = 0;
			const items = this.getCurrentCategoryItems();
			const firstValidIndex = this.getFirstValidItemIndex(items.slice(0, this.itemsPerPage));
			this.selectedItemIndex = firstValidIndex;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (option.label === 'Oeufs') {
			this.showInventory = true;
			this.eggsOnlyMode = true;
			const categories = this.getCategories();
			const eggCategoryIndex = categories.indexOf('egg');
			if (eggCategoryIndex !== -1) {
				this.selectedCategoryIndex = eggCategoryIndex;
			}
			this.currentPage = 0;
			const items = this.getCurrentCategoryItems();
			const firstValidIndex = this.getFirstValidItemIndex(items.slice(0, this.itemsPerPage));
			this.selectedItemIndex = firstValidIndex;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (option.label === 'Equipe') {
			this.showTeam = true;
			this.selectedTeamPokemonIndex = 0;
			this.teamCurrentPage = 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (option.label === 'Quitter') {
			this.openConfirmQuitMenu();
		}
	}

	openConfirmQuitMenu() {
		if (this.engine.audio.currentMusic && this.originalMusicVolume !== null) {
			this.engine.audio.currentMusic.volume = this.originalMusicVolume;
		}
		this.engine.sceneManager.popScene();
		
		const battleScene = this.engine.sceneManager.stack.find(
			scene => scene.constructor.name === 'BattleScene'
		);
		
		const isInBattle = battleScene !== undefined;
		const message = isInBattle ? 'Quitter la partie et abandonner le butin ?' : 'Retour au menu principal ?';
		
		const onYes = (engine) => {
			if (battleScene && battleScene.survivalTime) {
				engine.totalPlayTime = (engine.totalPlayTime || 0) + battleScene.survivalTime;
				if (battleScene.bossDefeated) {
					SaveManager.saveGame(engine, false);
				} else {
					const savedMoney = engine.money;
					const savedDisplayedMoney = engine.displayedMoney;
					const savedInventory = { ...engine.inventory };
					SaveManager.saveGame(engine, false);
					engine.money = savedMoney;
					engine.displayedMoney = savedDisplayedMoney;
					engine.inventory = savedInventory;
				}
				engine.sceneManager.changeScene('game', { enteringFromTop: true });
			} else {
				engine.sceneManager.changeScene('menu');
			}
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
		const battleScene = this.engine.sceneManager.stack.find(
			scene => scene.constructor.name === 'BattleScene'
		);
		
		if (battleScene) {
			this.applyGrayscaleFilter(renderer);
		}
		
		const pauseImage = this.engine.sprites.get('hub_pause');
		if (pauseImage) {
			renderer.drawImage(pauseImage, 0, 0, renderer.width, renderer.height);
		}

		if (this.showInventory) {
			const inventoryOverlay = this.engine.sprites.get('inventory_overlay');
			if (inventoryOverlay) {
				renderer.drawImage(inventoryOverlay, 0, 0, renderer.width, renderer.height);
			}
		}
		
		if (this.showTeam) {
			const inventoryOverlay = this.engine.sprites.get('inventory_overlay');
			if (inventoryOverlay) {
				renderer.drawImage(inventoryOverlay, 0, 0, renderer.width, renderer.height);
			}
		}

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

		const selectedPokemon = this.engine.selectedPokemon || 'quaksire';
		const pokemonSprite = this.engine.sprites.get(`pokemon_${selectedPokemon}_normal`);
		const iconSize = 48;
		const iconX = infoX;
		const iconY = y;
		
		if (pokemonSprite) {
			renderer.drawImage(pokemonSprite, iconX, iconY, iconSize, iconSize);
			renderer.ctx.strokeStyle = '#ffffff';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.strokeRect(iconX, iconY, iconSize, iconSize);
		}
		
		const playerName = this.engine.playerName || 'Trainer';
		renderer.ctx.textBaseline = 'middle';
		renderer.ctx.fillText(playerName, iconX + iconSize + 10, iconY + iconSize / 2);
		renderer.ctx.textBaseline = 'top';
		
		y += iconSize + 15;

		const rank = RankManager.getPlayerRank(this.engine.defeatedPokemonCounts, this.engine.encounteredPokemons);
		const rankColor = RankManager.getRankColor(rank);
		const stars = RankManager.getRankStars(rank);
		
		renderer.ctx.fillStyle = rankColor;
		const rankText = `${rank}`;
		const rankTextWidth = renderer.ctx.measureText(rankText).width;
		renderer.ctx.fillText(rankText, infoX, y);
		
		renderer.ctx.fillStyle = '#ffd700';
		const starText = '★'.repeat(stars);
		renderer.ctx.fillText(starText, infoX + rankTextWidth + 10, y);
		y += lineHeight;

		const money = this.engine.money || 0;
		const moneyText = SaveManager.formatLargeNumber(money);
		const coinSize = 24;
		const moneyTextFontSize = '18px';
		renderer.ctx.font = `${moneyTextFontSize} Pokemon`;
		const moneyTextWidth = renderer.ctx.measureText(moneyText).width;
		renderer.ctx.fillStyle = 'rgb(43, 231, 216)';
		
		renderer.ctx.fillText(moneyText, infoX, y);
		
		const coinsImage = this.engine.sprites.get('coins');
		if (coinsImage) {
			renderer.drawImage(coinsImage, infoX + moneyTextWidth + 5, y, coinSize, coinSize);
		}

		renderer.ctx.restore();

		if (this.showTeam) {
			this.renderTeamMenu(renderer);
		}

		if (this.showInventory) {
			const items = this.getCurrentCategoryItems();
			const categories = this.getCategories();
			const currentCategory = categories[this.selectedCategoryIndex];
			const categoryName = currentCategory ? getCategoryName(currentCategory) : '';
			
			const titleX = 300;
			const titleY = 200;
			const titleFontSize = '24px';
			const separatorY = titleY + 35;
			const itemStartX = 335;
			const itemStartY = separatorY + 35;
			const itemSpacing = 35;
			const itemFontSize = '18px';
			const startIndex = this.currentPage * this.itemsPerPage;
			const endIndex = Math.min(startIndex + this.itemsPerPage, items.length);
			const itemsToShow = items.slice(startIndex, endIndex);

			renderer.ctx.save();
			renderer.ctx.font = `${titleFontSize} Pokemon`;
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'top';
			const titleText = this.eggsOnlyMode ? 'Oeufs' : 'Inventaire';
			renderer.ctx.fillText(titleText, titleX, titleY);
			
			if (categoryName && !this.eggsOnlyMode) {
				renderer.ctx.font = '18px Pokemon';
				renderer.ctx.fillStyle = '#cccccc';
				renderer.ctx.textAlign = 'right';
				const categoryTextX = titleX + 600;
				let categoryDisplayText = categoryName;
				
				if (this.selectedCategoryIndex > 0) {
					categoryDisplayText = '◄ ' + categoryDisplayText;
				}
				if (this.selectedCategoryIndex < categories.length - 1) {
					categoryDisplayText = categoryDisplayText + ' ►';
				}
				
				renderer.ctx.fillText(categoryDisplayText, categoryTextX, titleY);
			}
			
			renderer.ctx.strokeStyle = '#888888';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.beginPath();
			renderer.ctx.moveTo(titleX, separatorY);
			renderer.ctx.lineTo(titleX + 600, separatorY);
			renderer.ctx.stroke();
			renderer.ctx.restore();

			if (itemsToShow.length === 0) {
			} else {
				renderer.ctx.save();
				renderer.ctx.font = `${itemFontSize} Pokemon`;
				renderer.ctx.textAlign = 'left';
				renderer.ctx.textBaseline = 'top';
				
				itemsToShow.forEach((item, index) => {
					const y = itemStartY + index * itemSpacing;
					
					if (item.isSeparator) {
						renderer.ctx.strokeStyle = '#666666';
						renderer.ctx.lineWidth = 1;
						renderer.ctx.beginPath();
						renderer.ctx.moveTo(itemStartX - 30, y + 10);
						renderer.ctx.lineTo(itemStartX + 500, y + 10);
						renderer.ctx.stroke();
						return;
					}
					
					const isEquipped = item.config && item.config.category === 'equipable' && this.engine.equippedItems.includes(item.uniqueId);
					const isAssigned = item.config && item.config.category === 'consumable' && this.engine.assignedConsumable === item.id;
					const isIncubating = item.config && item.config.category === 'egg' && this.engine.incubatingEgg && 
						this.engine.incubatingEgg.uniqueId === item.uniqueId;
					
					const textColor = index === this.selectedItemIndex ? '#ffff00' : '#ffffff';
					
					if (isIncubating) {
						renderer.ctx.fillStyle = '#aaaaaa';
						renderer.ctx.font = '14px Pokemon';
						renderer.ctx.fillText('En cours d\'incubation:', itemStartX, y - 18);
						renderer.ctx.font = `${itemFontSize} Pokemon`;
					}
					
					if (index === this.selectedItemIndex) {
						renderer.ctx.fillStyle = textColor;
						renderer.ctx.fillText('>', itemStartX - 30, y);
					}

					let currentX = itemStartX;
					
					if (item.config && item.config.iconImage) {
						const itemIcon = this.engine.sprites.get(`item_${item.id}`);
						if (itemIcon) {
							const iconSize = 24;
							renderer.drawImage(itemIcon, currentX, y - 2, iconSize, iconSize);
							currentX += iconSize + 10;
						}
					}
					
					const itemName = item.config ? item.config.name : item.id;
					renderer.ctx.fillStyle = textColor;
					renderer.ctx.fillText(itemName, currentX, y);
					
		
					let quantityX;
					let displayText = '';
					
					if (item.config && item.config.category === 'egg') {
						const currentKills = item.currentKills || 0;
						const requiredKills = item.requiredKills || 0;
						displayText = `${currentKills}/${requiredKills}`;
						quantityX = itemStartX + 500;
					} else {
						displayText = `x${item.quantity}`;
						quantityX = itemStartX + 500;
					}
					
					renderer.ctx.textAlign = 'right';
					renderer.ctx.fillStyle = textColor;
					renderer.ctx.fillText(displayText, quantityX, y);
					renderer.ctx.textAlign = 'left';
					
					if (isEquipped || isAssigned || isIncubating) {
						const statusX = item.config.category != 'egg' ? quantityX + 55 : quantityX + 10;
						renderer.ctx.fillStyle = '#aaaaaa';
						renderer.ctx.font = '20px Pokemon';
						renderer.ctx.textAlign = 'left';
						renderer.ctx.fillText('✓', statusX, y);
						renderer.ctx.font = `${itemFontSize} Pokemon`;
					}
				});
				
				renderer.ctx.restore();

				if (this.selectedItemIndex >= 0 && this.selectedItemIndex < itemsToShow.length) {
					const selectedItem = itemsToShow[this.selectedItemIndex];
					if (selectedItem && !selectedItem.isSeparator && selectedItem.config) {
						const descriptionY = renderer.height - 310;
						const descriptionFontSize = '16px';
						
						const totalPages = Math.ceil(items.length / this.itemsPerPage);
						if (totalPages > 1) {
							const pageText = `${this.currentPage + 1}/${totalPages}`;
							const pageY = descriptionY - 50;
							const pageX = renderer.width - 1010;
							
							renderer.ctx.save();
							renderer.ctx.fillStyle = '#aaaaaa';
							renderer.ctx.font = '14px Pokemon';
							renderer.ctx.textAlign = 'right';
							renderer.ctx.textBaseline = 'top';
							renderer.ctx.fillText(pageText, pageX, pageY);
							renderer.ctx.restore();
						}
						
						renderer.ctx.save();
						renderer.ctx.fillStyle = '#cccccc';
						renderer.ctx.font = `${descriptionFontSize} Pokemon`;
						renderer.ctx.textAlign = 'left';
						renderer.ctx.textBaseline = 'top';
						
						let descriptionText = selectedItem.config.description || '';
						
						if (selectedItem.config.category === 'egg') {
							const currentKills = selectedItem.currentKills || 0;
							const requiredKills = selectedItem.requiredKills || 0;
							const progress = Math.floor((currentKills / requiredKills) * 100);
							descriptionText = `\n\nIncubation: ${progress}% (${currentKills}/${requiredKills} kills)`;
						}
						
						renderer.ctx.fillText(descriptionText, itemStartX - 25, descriptionY);
						renderer.ctx.restore();
					}
				}
			}
		}
		
		const optionStartX = 60;
		const optionStartY = infoY + iconSize + 15 + lineHeight + lineHeight + 50;
		const optionSpacing = 40;
		const fontSize = '18px';

		this.options.forEach((option, index) => {
			let y = optionStartY + index * optionSpacing;
			if (option.label === 'Quitter') {
				y += 150;
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
	}

	getAvailablePokemons() {
		if (!this.engine.playedPokemons || this.engine.playedPokemons.size === 0) {
			return [];
		}
		return Array.from(this.engine.playedPokemons).sort();
	}

	handleTeamKey(key) {
		const availablePokemons = this.getAvailablePokemons();
		if (availablePokemons.length === 0) return;

		const totalPages = Math.ceil(availablePokemons.length / this.teamItemsPerPage);
		const startIndex = this.teamCurrentPage * this.teamItemsPerPage;
		const endIndex = Math.min(startIndex + this.teamItemsPerPage, availablePokemons.length);
		const maxIndex = endIndex - startIndex - 1;
		
		if (key === 'ArrowUp') {
			if (this.selectedTeamPokemonIndex > 0) {
				this.selectedTeamPokemonIndex--;
			} else if (this.teamCurrentPage > 0) {
				this.teamCurrentPage--;
				this.selectedTeamPokemonIndex = Math.min(this.teamItemsPerPage - 1, availablePokemons.length - this.teamCurrentPage * this.teamItemsPerPage - 1);
			}
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowDown') {
			if (this.selectedTeamPokemonIndex < maxIndex) {
				this.selectedTeamPokemonIndex++;
			} else if (this.teamCurrentPage < totalPages - 1) {
				this.teamCurrentPage++;
				this.selectedTeamPokemonIndex = 0;
			}
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowLeft' && this.teamCurrentPage > 0) {
			this.teamCurrentPage--;
			this.selectedTeamPokemonIndex = 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowRight' && this.teamCurrentPage < totalPages - 1) {
			this.teamCurrentPage++;
			this.selectedTeamPokemonIndex = 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	handleTeamPokemonSelection() {
		const availablePokemons = this.getAvailablePokemons();
		if (availablePokemons.length === 0) return;

		const currentPageStart = this.teamCurrentPage * this.teamItemsPerPage;
		const selectedPokemon = availablePokemons[currentPageStart + this.selectedTeamPokemonIndex];
		
		if (selectedPokemon && selectedPokemon !== this.engine.selectedPokemon) {
			this.engine.selectedPokemon = selectedPokemon;
			SaveManager.saveGame(this.engine, false);
			
			const gameScene = this.engine.sceneManager.stack.find(
				scene => scene.constructor.name === 'GameScene'
			);
			
			if (gameScene && gameScene.player) {
				const pokemonWalkSprite = this.engine.sprites.get(`${selectedPokemon}_walk`);
				const pokemonConfig = getPokemonConfig(selectedPokemon);
				if (pokemonConfig && pokemonWalkSprite) {
					const oldDirection = gameScene.player.animationSystem?.currentDirection || 'down';
					gameScene.player.animationSystem = new AnimationSystem(pokemonConfig, pokemonWalkSprite);
					gameScene.player.animationSystem.currentDirection = oldDirection;
					gameScene.player.animationSystem.forcedDirection = null;
					gameScene.player.animationSystem.setAnimation('walk', null);
				}
			}
			
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	renderTeamMenu(renderer) {
		const availablePokemons = this.getAvailablePokemons();
		const selectedPokemon = this.engine.selectedPokemon || 'quaksire';
		
		const titleX = 300;
		const titleY = 200;
		const titleFontSize = '24px';
		const separatorY = titleY + 35;
		const itemStartX = 335;
		const itemStartY = separatorY + 35;
		const itemSpacing = 35;
		const itemFontSize = '18px';
		const startIndex = this.teamCurrentPage * this.teamItemsPerPage;
		const endIndex = Math.min(startIndex + this.teamItemsPerPage, availablePokemons.length);
		const pokemonsToShow = availablePokemons.slice(startIndex, endIndex);

		renderer.ctx.save();
		renderer.ctx.font = `${titleFontSize} Pokemon`;
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';
		renderer.ctx.fillText('Équipe', titleX, titleY);
		
		renderer.ctx.strokeStyle = '#888888';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.moveTo(titleX, separatorY);
		renderer.ctx.lineTo(titleX + 600, separatorY);
		renderer.ctx.stroke();
		renderer.ctx.restore();

		if (pokemonsToShow.length === 0) {
			renderer.ctx.save();
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.font = `${itemFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'top';
			renderer.ctx.fillText('Aucun Pokémon disponible', itemStartX, itemStartY);
			renderer.ctx.restore();
		} else {
			renderer.ctx.save();
			renderer.ctx.font = `${itemFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'top';
			
			pokemonsToShow.forEach((pokemonId, index) => {
				const y = itemStartY + index * itemSpacing;
				const isSelected = index === this.selectedTeamPokemonIndex;
				const isCurrent = pokemonId === selectedPokemon;
				const textColor = isSelected ? '#ffff00' : '#ffffff';
				
				if (isSelected) {
					renderer.ctx.fillStyle = textColor;
					renderer.ctx.fillText('>', itemStartX - 30, y);
				}

				let currentX = itemStartX;
				
				const pokemonSprite = this.engine.sprites.get(`pokemon_${pokemonId}_normal`);
				if (pokemonSprite) {
					const iconSize = 24;
					renderer.drawImage(pokemonSprite, currentX, y - 2, iconSize, iconSize);
					currentX += iconSize + 10;
				}
				
				const pokemonConfig = getPokemonConfig(pokemonId);
				const pokemonName = pokemonConfig ? pokemonConfig.name : pokemonId;
				renderer.ctx.fillStyle = textColor;
				renderer.ctx.fillText(pokemonName, currentX, y);
				
				if (isCurrent) {
					const statusX = itemStartX + 500;
					renderer.ctx.fillStyle = '#00ff00';
					renderer.ctx.font = '20px Pokemon';
					renderer.ctx.textAlign = 'left';
					renderer.ctx.fillText('✓', statusX, y);
					renderer.ctx.font = `${itemFontSize} Pokemon`;
				}
			});
			
			renderer.ctx.restore();

			if (this.selectedTeamPokemonIndex >= 0 && this.selectedTeamPokemonIndex < pokemonsToShow.length) {
				const selectedPokemonId = pokemonsToShow[this.selectedTeamPokemonIndex];
				const pokemonConfig = getPokemonConfig(selectedPokemonId);
				const descriptionY = renderer.height - 310;
				const descriptionFontSize = '16px';
				
				const totalPages = Math.ceil(availablePokemons.length / this.teamItemsPerPage);
				if (totalPages > 1) {
					const pageText = `${this.teamCurrentPage + 1}/${totalPages}`;
					const pageY = descriptionY - 50;
					const pageX = renderer.width - 1010;
					
					renderer.ctx.save();
					renderer.ctx.fillStyle = '#aaaaaa';
					renderer.ctx.font = '14px Pokemon';
					renderer.ctx.textAlign = 'right';
					renderer.ctx.textBaseline = 'top';
					renderer.ctx.fillText(pageText, pageX, pageY);
					renderer.ctx.restore();
				}
				
				if (pokemonConfig) {
					renderer.ctx.save();
					renderer.ctx.fillStyle = '#cccccc';
					renderer.ctx.font = `${descriptionFontSize} Pokemon`;
					renderer.ctx.textAlign = 'left';
					renderer.ctx.textBaseline = 'top';
					
					const pokemonName = pokemonConfig.name || selectedPokemonId;
					const descriptionText = pokemonConfig.description || `Pokémon: ${pokemonName}`;
					
					const maxWidth = renderer.width - 1010;
					const lines = this.wrapText(renderer.ctx, descriptionText, maxWidth);
					lines.forEach((line, lineIndex) => {
						renderer.ctx.fillText(line, itemStartX, descriptionY + lineIndex * 25);
					});
					
					renderer.ctx.restore();
				}
			}
		}
	}
	
	wrapText(ctx, text, maxWidth) {
		const words = text.split(' ');
		const lines = [];
		let currentLine = words[0];

		for (let i = 1; i < words.length; i++) {
			const word = words[i];
			const width = ctx.measureText(currentLine + ' ' + word).width;
			if (width < maxWidth) {
				currentLine += ' ' + word;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		}
		lines.push(currentLine);
		return lines;
	}

	applyGrayscaleFilter(renderer) {
		renderer.ctx.save();
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
		renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
		renderer.ctx.restore();
	}
}

