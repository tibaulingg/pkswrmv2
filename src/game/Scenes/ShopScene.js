import { getShopItems, getShopConfig, ShopConfig } from '../Config/ShopConfig.js';
import { ItemConfig, getItemsByCategory } from '../Config/ItemConfig.js';
import SaveManager from '../Systems/SaveManager.js';
import AnimationSystem from '../Systems/AnimationSystem.js';
import { getPokemonConfig } from '../Config/SpriteConfig.js';

export default class ShopScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedIndex = 0;
		this.options = [
			{ label: 'Acheter' },
			{ label: 'Vendre' }
		];
		this.mode = 'main';
		this.shopItems = [];
		this.selectedItemIndex = 0;
		this.currentPage = 0;
		this.itemsPerPage = 8;
		this.shopId = 'kecleon';
		this.shopConfig = null;
		this.showNpcHappy = false;
		this.happyTimer = 0;
		this.happyDuration = 2000;
		this.keyRepeatTimers = {};
		this.keyRepeatDelay = 300;
		this.keyRepeatInterval = 50;
	}

	init(data) {
		this.shopId = data?.shopId || 'kecleon';
		this.shopConfig = getShopConfig(this.shopId);
		this.selectedIndex = 0;
		this.mode = 'main';
		this.shopItems = getShopItems(this.shopId).map(shopItem => {
			const item = ItemConfig[shopItem.itemId];
			return item ? { ...shopItem, itemConfig: item } : null;
		}).filter(item => item !== null && item.buyPrice > 0);
		this.selectedItemIndex = 0;
		this.currentPage = 0;
		this.showNpcHappy = false;
		this.happyTimer = 0;
		
		if (this.shopId === 'chansey') {
			this.options = [
				{ label: 'Acheter oeuf' },
				{ label: 'Faire éclore' }
			];
		} else {
			this.options = [
				{ label: 'Acheter' },
				{ label: 'Vendre' }
			];
		}
	}

	update(deltaTime) {
		if (this.showNpcHappy) {
			this.happyTimer += deltaTime;
			if (this.happyTimer >= this.happyDuration) {
				this.showNpcHappy = false;
				this.happyTimer = 0;
			}
		}
		
		
		const moneyDiff = this.engine.money - this.engine.displayedMoney;
		if (Math.abs(moneyDiff) > 0.5) {
			this.engine.displayedMoney += moneyDiff * 0.2;
		} else {
			this.engine.displayedMoney = this.engine.money;
		}
		
		const currentScene = this.engine.sceneManager.getCurrentScene();
		const isConfirmMenuOpen = currentScene && (currentScene.constructor.name === 'ConfirmMenuScene' || currentScene === this.engine.sceneManager.scenes.confirmMenu);
		
		if (isConfirmMenuOpen) {
			return;
		}
		
		const key = this.engine.input.consumeLastKey();
		
		if (this.mode === 'buying') {
			if (key === 'ArrowUp') {
				const items = this.getCurrentPageItems();
				const totalPages = Math.ceil(this.shopItems.length / this.itemsPerPage);
				
				if (this.selectedItemIndex === 0 && this.currentPage > 0) {
					this.currentPage--;
					const itemsOnPage = Math.min(this.itemsPerPage, this.shopItems.length - (this.currentPage * this.itemsPerPage));
					this.selectedItemIndex = itemsOnPage - 1;
				} else {
					this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
				}
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'ArrowDown') {
				const items = this.getCurrentPageItems();
				const totalPages = Math.ceil(this.shopItems.length / this.itemsPerPage);
				const startIndex = this.currentPage * this.itemsPerPage;
				const endIndex = Math.min(startIndex + this.itemsPerPage, this.shopItems.length);
				const maxIndex = endIndex - startIndex - 1;
				
				if (this.selectedItemIndex === maxIndex && this.currentPage < totalPages - 1) {
					this.currentPage++;
					this.selectedItemIndex = 0;
				} else {
					this.selectedItemIndex = Math.min(maxIndex, this.selectedItemIndex + 1);
				}
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'Enter') {
				this.confirmPurchase();
			} else if (key === 'Escape') {
				this.mode = 'main';
				this.selectedItemIndex = 0;
				this.currentPage = 0;
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		} else if (this.mode === 'selling') {
			const sellableItems = this.getSellableItems();
			if (key === 'ArrowUp') {
				const totalPages = Math.ceil(sellableItems.length / this.itemsPerPage);
				
				if (this.selectedItemIndex === 0 && this.currentPage > 0) {
					this.currentPage--;
					const itemsOnPage = Math.min(this.itemsPerPage, sellableItems.length - (this.currentPage * this.itemsPerPage));
					this.selectedItemIndex = itemsOnPage - 1;
				} else {
					this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
				}
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'ArrowDown') {
				const totalPages = Math.ceil(sellableItems.length / this.itemsPerPage);
				const startIndex = this.currentPage * this.itemsPerPage;
				const endIndex = Math.min(startIndex + this.itemsPerPage, sellableItems.length);
				const maxIndex = endIndex - startIndex - 1;
				
				if (this.selectedItemIndex === maxIndex && this.currentPage < totalPages - 1) {
					this.currentPage++;
					this.selectedItemIndex = 0;
				} else {
					this.selectedItemIndex = Math.min(maxIndex, this.selectedItemIndex + 1);
				}
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (key === 'Enter') {
				this.confirmSale();
			} else if (key === 'Escape') {
				this.mode = 'main';
				this.selectedItemIndex = 0;
				this.currentPage = 0;
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		} else if (this.mode === 'hatching') {
			const readyEggs = this.getReadyEggs();
			const arrowKeys = ['ArrowUp', 'ArrowDown'];
			
			arrowKeys.forEach(arrowKey => {
				if (this.engine.input.isKeyDown(arrowKey)) {
					if (!this.keyRepeatTimers[arrowKey]) {
						this.keyRepeatTimers[arrowKey] = this.keyRepeatDelay;
						this.handleHatchingKey(arrowKey, readyEggs);
					} else {
						this.keyRepeatTimers[arrowKey] -= deltaTime;
						if (this.keyRepeatTimers[arrowKey] <= 0) {
							this.keyRepeatTimers[arrowKey] = this.keyRepeatInterval;
							this.handleHatchingKey(arrowKey, readyEggs);
						}
					}
				} else {
					if (this.keyRepeatTimers[arrowKey]) {
						delete this.keyRepeatTimers[arrowKey];
					}
				}
			});
			
			if (key === 'Enter') {
				this.hatchSelectedEgg();
			} else if (key === 'Escape') {
				this.mode = 'main';
				this.selectedItemIndex = 0;
				this.currentPage = 0;
				this.keyRepeatTimers = {};
				this.engine.audio.play('ok', 0.3, 0.1);
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
				this.engine.sceneManager.popScene();
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		}
	}

	selectOption() {
		const option = this.options[this.selectedIndex];
		
		if (option.label === 'Acheter' || option.label === 'Acheter oeuf') {
			this.mode = 'buying';
			this.selectedItemIndex = 0;
			this.currentPage = 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (option.label === 'Faire éclore') {
			this.mode = 'hatching';
			this.selectedItemIndex = 0;
			this.currentPage = 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (option.label === 'Vendre') {
			this.mode = 'selling';
			this.selectedItemIndex = 0;
			this.currentPage = 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	getCurrentPageItems() {
		const startIndex = this.currentPage * this.itemsPerPage;
		const endIndex = Math.min(startIndex + this.itemsPerPage, this.shopItems.length);
		return this.shopItems.slice(startIndex, endIndex);
	}

	getSellableItems() {
		const sellableItems = [];
		if (!this.engine.inventory) return sellableItems;

		const currentShopItems = getShopItems(this.shopId);

		Object.entries(this.engine.inventory).forEach(([itemId, quantity]) => {
			if (quantity <= 0) return;
			
			const item = ItemConfig[itemId];
			if (!item) return;
			
			const shopItem = currentShopItems.find(si => si.itemId === itemId);
			if (!shopItem || !shopItem.sellPrice || shopItem.sellPrice <= 0) return;
			
			sellableItems.push({
				id: itemId,
				itemConfig: item,
				quantity: quantity,
				sellPrice: shopItem.sellPrice
			});
		});

		sellableItems.sort((a, b) => {
			const nameA = a.itemConfig.name || a.id;
			const nameB = b.itemConfig.name || b.id;
			return nameA.localeCompare(nameB);
		});

		return sellableItems;
	}

	getReadyEggs() {
		const readyEggs = [];
		if (!this.engine.eggProgress) return readyEggs;
		if (!this.engine.eggUniqueIds) return readyEggs;

		const allEggTypes = getItemsByCategory('egg');
		const incubatingUniqueId = this.engine.incubatingEgg ? this.engine.incubatingEgg.uniqueId : null;
		const eggTypeMap = {};
		allEggTypes.forEach(eggConfig => {
			eggTypeMap[eggConfig.id] = eggConfig;
		});
		
		const processedUniqueIds = new Set();
		
		Object.keys(this.engine.eggUniqueIds || {}).forEach(itemId => {
			const uniqueIds = this.engine.eggUniqueIds[itemId] || [];
			const eggConfig = eggTypeMap[itemId];
			if (!eggConfig) return;
			
			uniqueIds.forEach(uniqueId => {
				if (uniqueId === incubatingUniqueId) return;
				if (processedUniqueIds.has(uniqueId)) return;
				processedUniqueIds.add(uniqueId);
				
				const progress = this.engine.eggProgress[uniqueId];
				if (!progress) return;
				
				const requiredKills = progress.requiredKills !== undefined ? progress.requiredKills : eggConfig.requiredKills;
				const currentKills = progress.currentKills || 0;
				
				if (currentKills >= requiredKills) {
					readyEggs.push({
						id: itemId,
						uniqueId: uniqueId,
						config: eggConfig,
						currentKills: currentKills,
						requiredKills: requiredKills
					});
				}
			});
		});

		const rarityOrder = { 'common': 0, 'rare': 1, 'epic': 2, 'legendary': 3 };
		readyEggs.sort((a, b) => {
			const rarityA = rarityOrder[a.config.rarity] || 0;
			const rarityB = rarityOrder[b.config.rarity] || 0;
			if (rarityA !== rarityB) return rarityB - rarityA;
			if (a.config.name !== b.config.name) return a.config.name.localeCompare(b.config.name);
			return a.uniqueId.localeCompare(b.uniqueId);
		});

		return readyEggs;
	}

	handleHatchingKey(key, readyEggs) {
		if (key === 'ArrowUp') {
			const totalPages = Math.ceil(readyEggs.length / this.itemsPerPage);
			
			if (this.selectedItemIndex === 0 && this.currentPage > 0) {
				this.currentPage--;
				const itemsOnPage = Math.min(this.itemsPerPage, readyEggs.length - (this.currentPage * this.itemsPerPage));
				this.selectedItemIndex = itemsOnPage - 1;
			} else {
				this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
			}
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowDown') {
			const totalPages = Math.ceil(readyEggs.length / this.itemsPerPage);
			const startIndex = this.currentPage * this.itemsPerPage;
			const endIndex = Math.min(startIndex + this.itemsPerPage, readyEggs.length);
			const maxIndex = endIndex - startIndex - 1;
			
			if (this.selectedItemIndex === maxIndex && this.currentPage < totalPages - 1) {
				this.currentPage++;
				this.selectedItemIndex = 0;
			} else {
				this.selectedItemIndex = Math.min(maxIndex, this.selectedItemIndex + 1);
			}
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	hatchSelectedEgg() {
		const readyEggs = this.getReadyEggs();
		const startIndex = this.currentPage * this.itemsPerPage;
		const eggIndex = startIndex + this.selectedItemIndex;
		
		if (eggIndex >= readyEggs.length) return;
		
		const egg = readyEggs[eggIndex];
		
		if (!egg.config.possiblePokemon || egg.config.possiblePokemon.length === 0) return;
		
		const randomIndex = Math.floor(Math.random() * egg.config.possiblePokemon.length);
		const hatchedPokemon = egg.config.possiblePokemon[randomIndex];
		
		if (!this.engine.encounteredPokemons) {
			this.engine.encounteredPokemons = new Set();
		}
		if (!this.engine.playedPokemons) {
			this.engine.playedPokemons = new Set();
		}
		
		this.engine.encounteredPokemons.add(hatchedPokemon);
		this.engine.playedPokemons.add(hatchedPokemon);
		
		delete this.engine.eggProgress[egg.uniqueId];
		const uniqueIds = this.engine.eggUniqueIds[egg.id] || [];
		const index = uniqueIds.indexOf(egg.uniqueId);
		if (index > -1) {
			uniqueIds.splice(index, 1);
		}
		
		SaveManager.saveGame(this.engine, false);
		this.engine.audio.play('ok', 0.5, 0.2);
		
		const gameScene = this.engine.sceneManager.stack.find(
			scene => scene.constructor.name === 'GameScene'
		);
		if (gameScene) {
			const chanseyNpc = gameScene.npcs.find(npc => npc.id === 'chansey');
			if (chanseyNpc) {
				const pokemonConfig = getPokemonConfig('chansey');
				const chargeSprite = this.engine.sprites.get('chansey_charge');
				const idleSprite = this.engine.sprites.get('chansey_idle');
				if (pokemonConfig && chargeSprite && idleSprite) {
					chanseyNpc.animationSystem = new AnimationSystem(pokemonConfig, { idle: idleSprite, charge: chargeSprite });
					chanseyNpc.animationSystem.setAnimation('charge', 5000);
					chanseyNpc.animationSystem.setDirection('down');
					
					gameScene.startEggHatchingAnimation(chanseyNpc, egg.id, hatchedPokemon);
				}
			}
		}
		
		this.engine.sceneManager.popScene();
	}

	confirmPurchase() {
		const items = this.getCurrentPageItems();
		if (this.selectedItemIndex >= 0 && this.selectedItemIndex < items.length) {
			const globalIndex = this.currentPage * this.itemsPerPage + this.selectedItemIndex;
			const shopItem = this.shopItems[globalIndex];
			const item = shopItem.itemConfig;
			
			if (this.engine.money < shopItem.buyPrice) {
				this.engine.audio.play('ok', 0.1, 0.1);
				return;
			}
			
			const message = `Acheter:${item.name}:${shopItem.buyPrice} pièces ?`;
			
			this.engine.sceneManager.pushScene('confirmMenu', {
				message: message,
				onYes: (engine) => {
					if (engine.money >= shopItem.buyPrice) {
						engine.money -= shopItem.buyPrice;
						if (!engine.inventory) {
							engine.inventory = {};
						}
						if (item.category === 'equipable') {
							engine.inventory[item.id] = (engine.inventory[item.id] || 0) + 1;
						} else {
							engine.inventory[item.id] = (engine.inventory[item.id] || 0) + 1;
						}
						
						if (item.category === 'egg') {
							if (!engine.eggProgress) {
								engine.eggProgress = {};
							}
							if (!engine.eggUniqueIds) {
								engine.eggUniqueIds = {};
							}
							if (!engine.eggUniqueIds[item.id]) {
								engine.eggUniqueIds[item.id] = [];
							}
							const uniqueId = `${item.id}_${Date.now()}_${Math.random()}`;
							engine.eggUniqueIds[item.id].push(uniqueId);
							engine.eggProgress[uniqueId] = { currentKills: 0, requiredKills: item.requiredKills };
						}
						
						engine.audio.play('coins', 0.5, 0.2);
						this.showNpcHappy = true;
						this.happyTimer = 0;
						SaveManager.saveGame(engine, false);
					} else {
						engine.audio.play('ok', 0.1, 0.1);
					}
					engine.sceneManager.popScene();
				},
				onNo: (engine) => {
					engine.sceneManager.popScene();
				}
			});
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	confirmSale() {
		const sellableItems = this.getSellableItems();
		const startIndex = this.currentPage * this.itemsPerPage;
		const itemIndex = startIndex + this.selectedItemIndex;
		
		if (itemIndex >= sellableItems.length) return;
		
		const sellItem = sellableItems[itemIndex];
		const item = sellItem.itemConfig;
		
		if (!this.engine.inventory[sellItem.id] || this.engine.inventory[sellItem.id] <= 0) {
			this.engine.audio.play('ok', 0.1, 0.1);
			return;
		}
		
		const message = `Vendre:${item.name}:${sellItem.sellPrice} pièces ?`;
		
		this.engine.sceneManager.pushScene('confirmMenu', {
			message: message,
			onYes: (engine) => {
				if (engine.inventory[sellItem.id] && engine.inventory[sellItem.id] > 0) {
					engine.inventory[sellItem.id]--;
					if (engine.inventory[sellItem.id] <= 0) {
						delete engine.inventory[sellItem.id];
					}
					engine.money += sellItem.sellPrice;
					engine.audio.play('coins', 0.5, 0.2);
					this.showNpcHappy = true;
					this.happyTimer = 0;
					SaveManager.saveGame(engine, false);
				} else {
					engine.audio.play('ok', 0.1, 0.1);
				}
				engine.sceneManager.popScene();
			},
			onNo: (engine) => {
				engine.sceneManager.popScene();
			}
		});
		this.engine.audio.play('ok', 0.3, 0.1);
	}

	render(renderer) {
		if (this.mode === 'hatching') {
			const hatchEggBg = this.engine.sprites.get('hatch_egg_bg');
			if (hatchEggBg) {
				renderer.drawImage(hatchEggBg, 0, 0, renderer.width, renderer.height);
			}
		} else if (this.mode === 'buying' || this.mode === 'selling') {
			const shopOverlay = this.engine.sprites.get('shop_overlay');
			if (shopOverlay) {
				renderer.drawImage(shopOverlay, 0, 0, renderer.width, renderer.height);
			}
		} else {
			const shopImageKey = this.shopId === 'chansey' ? 'shop_long' : 'shop';
			const shopImage = this.engine.sprites.get(shopImageKey);
			if (shopImage) {
				renderer.drawImage(shopImage, 0, 0, renderer.width, renderer.height);
			}
		}

		if (this.mode !== 'hatching') {
			const npcIconKey = this.showNpcHappy ? `${this.shopId}_happy` : `${this.shopId}_normal`;
			const npcIcon = this.engine.sprites.get(npcIconKey);
			if (npcIcon) {
				const iconSize = 160;
				const iconX = 28;
				const iconY = renderer.height - iconSize - 235;
				renderer.drawImage(npcIcon, iconX, iconY, iconSize, iconSize);
			}
		}

		if (this.mode === 'buying') {

			const itemListStartX = 280;
			const itemListStartY = 400;
			const itemSpacing = 40;
			const itemFontSize = '20px';

			const items = this.getCurrentPageItems();
			const totalPages = Math.ceil(this.shopItems.length / this.itemsPerPage);

			renderer.ctx.save();
			renderer.ctx.font = `${itemFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'middle';

			items.forEach((shopItem, index) => {
				const y = itemListStartY + index * itemSpacing;
				const item = shopItem.itemConfig;
				const canAfford = this.engine.money >= shopItem.buyPrice;
				const baseColor = index === this.selectedItemIndex ? '#ffff00' : '#ffffff';
				const color = canAfford ? baseColor : '#ff0000';
				
				let currentX = itemListStartX;
				
				if (index === this.selectedItemIndex) {
					renderer.ctx.fillStyle = color;
					renderer.ctx.fillText('>', currentX - 30, y);
				}

				if (item.iconImage) {
					const itemIcon = this.engine.sprites.get(`item_${item.id}`);
					if (itemIcon) {
						const iconSize = 24;
						renderer.drawImage(itemIcon, currentX, y - iconSize / 2, iconSize, iconSize);
						currentX += iconSize + 10;
					}
				}

				renderer.ctx.fillStyle = color;
				renderer.ctx.fillText(item.name, currentX, y);
				
				const priceText = SaveManager.formatLargeNumber(shopItem.buyPrice);
				const priceTextWidth = renderer.ctx.measureText(priceText).width;
				const priceX = itemListStartX + 480;
				const coinSize = 20;
				
				renderer.ctx.fillStyle = canAfford ? '#ffffff' : '#ff0000';
				renderer.ctx.fillText(priceText, priceX, y);
				
				const coinsImage = this.engine.sprites.get('coins');
				if (coinsImage) {
					renderer.drawImage(coinsImage, priceX + priceTextWidth + 5, y - coinSize / 2 + 2, coinSize, coinSize);
				}
			});

			renderer.ctx.restore();

			if (totalPages > 1) {
				const pageText = `${this.currentPage + 1}/${totalPages}`;
				const pageY = 720;
				const pageX = 850;
				
				renderer.ctx.save();
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = '18px Pokemon';
				renderer.ctx.textAlign = 'left';
				renderer.ctx.fillText(pageText, pageX, pageY);
				renderer.ctx.restore();
			}

			const itemsForMoney = this.getCurrentPageItems();
			if (this.selectedItemIndex >= 0 && this.selectedItemIndex < itemsForMoney.length) {
				const globalIndex = this.currentPage * this.itemsPerPage + this.selectedItemIndex;
				const selectedShopItem = this.shopItems[globalIndex];
				const selectedItem = selectedShopItem.itemConfig;
				
				const moneyX = 1000;
				const moneyY = 815;
				const moneyFontSize = '20px';
				const coinSize = 24;
				const money = Math.floor(this.engine.displayedMoney) || 0;
				const moneyText = SaveManager.formatLargeNumber(money);

				renderer.ctx.save();
				renderer.ctx.font = `${moneyFontSize} Pokemon`;
				renderer.ctx.textAlign = 'left';
				renderer.ctx.textBaseline = 'middle';
				const moneyTextWidth = renderer.ctx.measureText(moneyText).width;
				renderer.ctx.fillStyle = 'rgb(43, 231, 216)';
				renderer.ctx.fillText(moneyText, moneyX, moneyY);
				
				const coinsImage = this.engine.sprites.get('coins');
				if (coinsImage) {
					renderer.drawImage(coinsImage, moneyX + moneyTextWidth + 5, moneyY - coinSize / 2, coinSize, coinSize);
				}
				renderer.ctx.restore();
			}

			const helperY = renderer.height - 100;
			const helperFontSize = '25px';
			
			if (this.selectedItemIndex >= 0 && this.selectedItemIndex < items.length) {
				const globalIndex = this.currentPage * this.itemsPerPage + this.selectedItemIndex;
				const selectedShopItem = this.shopItems[globalIndex];
				const selectedItem = selectedShopItem.itemConfig;
				
				renderer.ctx.save();
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = `${helperFontSize} Pokemon`;
				renderer.ctx.textAlign = 'left';
				renderer.ctx.fillText(selectedItem.description, 70, helperY);
				renderer.ctx.restore();
			}
		} else if (this.mode === 'hatching') {
			const itemListStartX = 650;
			const itemListStartY = 320;
			const itemSpacing = 40;
			const itemFontSize = '20px';

			const readyEggs = this.getReadyEggs();
			const startIndex = this.currentPage * this.itemsPerPage;
			const endIndex = Math.min(startIndex + this.itemsPerPage, readyEggs.length);
			const eggsToShow = readyEggs.slice(startIndex, endIndex);
			const totalPages = Math.ceil(readyEggs.length / this.itemsPerPage);

			renderer.ctx.save();
			renderer.ctx.font = `${itemFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'middle';

			if (eggsToShow.length === 0) {
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.fillText('Aucun œuf prêt à éclore', itemListStartX, itemListStartY);
			} else {
				eggsToShow.forEach((egg, index) => {
					const y = itemListStartY + index * itemSpacing;
					const color = index === this.selectedItemIndex ? '#ffff00' : '#ffffff';
					
					let currentX = itemListStartX;
					
					if (index === this.selectedItemIndex) {
						renderer.ctx.fillStyle = color;
						renderer.ctx.fillText('>', currentX - 30, y);
					}

					if (egg.config.iconImage) {
						const itemIcon = this.engine.sprites.get(`item_${egg.id}`);
						if (itemIcon) {
							const iconSize = 24;
							renderer.drawImage(itemIcon, currentX, y - iconSize / 2, iconSize, iconSize);
							currentX += iconSize + 10;
						}
					}

					renderer.ctx.fillStyle = color;
					renderer.ctx.fillText(egg.config.name, currentX, y);
					
					const progressText = `${egg.currentKills}/${egg.requiredKills}`;
					const progressX = itemListStartX + 480;
					renderer.ctx.fillStyle = color;
					renderer.ctx.fillText(progressText, progressX, y);
				});
			}

			renderer.ctx.restore();

			if (totalPages > 1) {
				const pageText = `${this.currentPage + 1}/${totalPages}`;
				const pageY = 720;
				const pageX = 1150;
				
				renderer.ctx.save();
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = '18px Pokemon';
				renderer.ctx.textAlign = 'left';
				renderer.ctx.fillText(pageText, pageX, pageY);
				renderer.ctx.restore();
			}
		} else if (this.mode === 'selling') {
			const itemListStartX = 280;
			const itemListStartY = 400;
			const itemSpacing = 40;
			const itemFontSize = '20px';

			const sellableItems = this.getSellableItems();
			const startIndex = this.currentPage * this.itemsPerPage;
			const endIndex = Math.min(startIndex + this.itemsPerPage, sellableItems.length);
			const itemsToShow = sellableItems.slice(startIndex, endIndex);
			const totalPages = Math.ceil(sellableItems.length / this.itemsPerPage);

			renderer.ctx.save();
			renderer.ctx.font = `${itemFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'middle';

			if (itemsToShow.length === 0) {
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.fillText('Aucun item à vendre', itemListStartX, itemListStartY);
			} else {
				itemsToShow.forEach((sellItem, index) => {
					const y = itemListStartY + index * itemSpacing;
					const item = sellItem.itemConfig;
					const color = index === this.selectedItemIndex ? '#ffff00' : '#ffffff';
					
					let currentX = itemListStartX;
					
					if (index === this.selectedItemIndex) {
						renderer.ctx.fillStyle = color;
						renderer.ctx.fillText('>', currentX - 30, y);
					}

					if (item.iconImage) {
						const itemIcon = this.engine.sprites.get(`item_${item.id}`);
						if (itemIcon) {
							const iconSize = 24;
							renderer.drawImage(itemIcon, currentX, y - iconSize / 2, iconSize, iconSize);
							currentX += iconSize + 10;
						}
					}

					renderer.ctx.fillStyle = color;
					renderer.ctx.fillText(item.name, currentX, y);
					
					const quantityText = `x${sellItem.quantity}`;
					const quantityX = itemListStartX + 350;
					renderer.ctx.fillStyle = color;
					renderer.ctx.fillText(quantityText, quantityX, y);
					
					const priceText = SaveManager.formatLargeNumber(sellItem.sellPrice);
					const priceTextWidth = renderer.ctx.measureText(priceText).width;
					const priceX = itemListStartX + 480;
					const coinSize = 20;
					
					renderer.ctx.fillStyle = '#ffffff';
					renderer.ctx.fillText(priceText, priceX, y);
					
					const coinsImage = this.engine.sprites.get('coins');
					if (coinsImage) {
						renderer.drawImage(coinsImage, priceX + priceTextWidth + 5, y - coinSize / 2 + 2, coinSize, coinSize);
					}
				});
			}

			renderer.ctx.restore();

			if (totalPages > 1) {
				const pageText = `${this.currentPage + 1}/${totalPages}`;
				const pageY = 720;
				const pageX = 850;
				
				renderer.ctx.save();
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = '18px Pokemon';
				renderer.ctx.textAlign = 'left';
				renderer.ctx.fillText(pageText, pageX, pageY);
				renderer.ctx.restore();
			}

			const moneyX = 1000;
			const moneyY = 815;
			const moneyFontSize = '20px';
			const coinSize = 24;
			const money = Math.floor(this.engine.displayedMoney) || 0;
			const moneyText = SaveManager.formatLargeNumber(money);

			renderer.ctx.save();
			renderer.ctx.font = `${moneyFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'middle';
			const moneyTextWidth = renderer.ctx.measureText(moneyText).width;
			renderer.ctx.fillStyle = 'rgb(43, 231, 216)';
			renderer.ctx.fillText(moneyText, moneyX, moneyY);
			
			const coinsImage = this.engine.sprites.get('coins');
			if (coinsImage) {
				renderer.drawImage(coinsImage, moneyX + moneyTextWidth + 5, moneyY - coinSize / 2, coinSize, coinSize);
			}
			renderer.ctx.restore();

			const helperY = renderer.height - 100;
			const helperFontSize = '25px';
			
			if (this.selectedItemIndex >= 0 && this.selectedItemIndex < itemsToShow.length) {
				const sellItem = itemsToShow[this.selectedItemIndex];
				const selectedItem = sellItem.itemConfig;
				
				renderer.ctx.save();
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = `${helperFontSize} Pokemon`;
				renderer.ctx.textAlign = 'left';
				renderer.ctx.fillText(selectedItem.description, 70, helperY);
				renderer.ctx.restore();
			}
		} else {
			const helperTexts = {
				kecleon: "Bien le bonjour, que puis-je pour vous aujourd'hui ?",
				chansey: "Que puis-je faire pour toi ??"
			};
			const helperText = helperTexts[this.shopId] || helperTexts.kecleon;
			const helperFontSize = '25px';
			const helperY = renderer.height - 100;
			
			renderer.ctx.save();
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.font = `${helperFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.fillText(helperText, 70, helperY);
			renderer.ctx.restore();

			const baseChoiceX = renderer.width - 250;
			const choiceX = this.shopId === 'chansey' ? baseChoiceX - 95 : baseChoiceX;
			const choiceStartY = renderer.height - 330;
			const choiceSpacing = 50;
			const choiceFontSize = '24px';

			this.options.forEach((option, index) => {
				const y = choiceStartY + index * choiceSpacing;
				const color = index === this.selectedIndex ? '#ffff00' : '#ffffff';
				renderer.drawText(option.label, choiceX, y, choiceFontSize, color, 'left');
				
				if (index === this.selectedIndex) {
					renderer.drawText('>', choiceX - 40, y, choiceFontSize, color, 'left');
				}
			});
		}
	}
}

