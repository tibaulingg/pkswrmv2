import { ItemConfig } from '../Config/ItemConfig.js';
import { 
	getChestRewardConfig, 
	rollRarity, 
	rollQuantity, 
	rollItemCount 
} from '../Config/ChestRewardConfig.js';

export default class ChestSystem {
	constructor(engine) {
		this.engine = engine;
		this.activeChest = null;
		this.isOpening = false;
		this.animationTimer = 0;
		this.fadeOutDuration = 300;
		this.itemAppearDuration = 600;
		this.shakeIntensity = 30;
		this.shakeOffsetX = 0;
		this.shakeOffsetY = 0;
		this.chestAlpha = 1;
		this.itemAlpha = 0;
		this.itemScale = 0;
		this.rewardItemId = null;
		this.rewardItemImage = null;
		this.rewardItemConfig = null;
		this.rewardQuantity = 1;
		this.rewardItems = []; // Liste de tous les items à donner
		this.currentRewardIndex = 0; // Index de l'item actuellement affiché
		this.messageTimer = 0;
		this.messageDuration = 1500;
		this.phase = 'shaking'; // 'shaking', 'fading', 'itemAppearing', 'showingMessage'
		this.itemPulseTimer = 0;
		this.vibrationTimer = 0;
		this.originalMusicVolume = 1;
		this.musicVolumeReduced = false;
		this.shakeCount = 0;
		this.shakesRequired = 3;
		this.shakePhaseDuration = 1000; // Durée totale de la phase shaking (1 seconde)
		this.isShaking = false;
		this.shakeAnimationTimer = 0;
		this.vibrationInterval = 100;
		this.shakeDuration = 100;
		this.shakeAnimationDuration = 100;
		this.enterKeyProcessed = false; // Flag pour éviter les répétitions de Enter
	}
	
	/**
	 * Obtient tous les items d'une rareté donnée (exclut les coffres et items non droppables)
	 * @param {string} rarity - Rareté recherchée ('common', 'rare', 'epic', 'legendary')
	 * @returns {array} Liste des items de cette rareté
	 */
	getItemsByRarity(rarity) {
		return Object.values(ItemConfig).filter(item => {
			// Exclure les coffres (par category ET par ID pour être sûr)
			if (item.category === 'chest' || (item.id && item.id.includes('chest'))) {
				return false;
			}
			// Exclure les items non droppables
			if (item.droppable === false) return false;
			// Filtrer par rareté
			return item.rarity === rarity;
		});
	}
	
	updateCurrentReward() {
		if (this.rewardItems.length > 0 && this.currentRewardIndex < this.rewardItems.length) {
			const currentReward = this.rewardItems[this.currentRewardIndex];
			this.rewardItemId = currentReward.itemId;
			this.rewardQuantity = currentReward.quantity;
			this.rewardItemConfig = ItemConfig[this.rewardItemId];
			this.rewardItemImage = this.engine.sprites.get(`item_${this.rewardItemId}`);
		}
	}
	
	startOpening(chest) {
		if (this.isOpening) return;
		
		console.log('ChestSystem.startOpening appelé');
		this.activeChest = chest;
		this.isOpening = true;
		this.animationTimer = 0;
		this.vibrationTimer = 0;
		this.shakeCount = 0;
		this.shakeIntensity = 30;
		this.shakeOffsetX = 0;
		this.shakeOffsetY = 0;
		this.chestAlpha = 1;
		this.itemAlpha = 0;
		this.itemScale = 0;
		this.messageTimer = 0;
		this.phase = 'shaking';
		this.isShaking = false;
		this.shakeAnimationTimer = 0;
		this.enterKeyProcessed = false; // Réinitialiser le flag
		console.log('Phase initialisée:', this.phase, 'shakePhaseDuration:', this.shakePhaseDuration);
		// S'assurer que shakePhaseDuration est initialisé
		if (!this.shakePhaseDuration) {
			this.shakePhaseDuration = 800;
		}
		
		const chestItemId = chest?.itemId || 'basic_chest';
		const rewardConfig = getChestRewardConfig(chestItemId);
		
		// Générer les récompenses selon la nouvelle configuration
		this.rewardItems = [];
		
		if (rewardConfig) {
			// Obtenir le nombre d'items différents à générer
			const itemCount = rollItemCount(rewardConfig.itemCount);
			
			// Générer chaque item
			for (let i = 0; i < itemCount; i++) {
				// Rouler une rareté
				const rarity = rollRarity(rewardConfig.rarityChances);
				
				// Obtenir tous les items de cette rareté (exclure les coffres et les items non droppables)
				const itemsOfRarity = this.getItemsByRarity(rarity);
				
				if (itemsOfRarity.length === 0) {
					// Fallback : utiliser apple si aucun item de cette rareté
					const existingItem = this.rewardItems.find(r => r.itemId === 'apple');
					if (existingItem) {
						existingItem.quantity += rollQuantity(rewardConfig.quantities, rarity);
					} else {
						this.rewardItems.push({
							itemId: 'apple',
							quantity: rollQuantity(rewardConfig.quantities, rarity)
						});
					}
					continue;
				}
				
				// Sélectionner un item aléatoire de cette rareté
				const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
				const quantity = rollQuantity(rewardConfig.quantities, rarity);
				
				// Vérifier si l'item existe déjà dans la liste
				const existingItem = this.rewardItems.find(r => r.itemId === randomItem.id);
				if (existingItem) {
					existingItem.quantity += quantity;
				} else {
					this.rewardItems.push({
						itemId: randomItem.id,
						quantity: quantity
					});
				}
			}
		} else {
			// Fallback : donner quelques pommes si la config n'existe pas
			this.rewardItems.push({ itemId: 'apple', quantity: Math.floor(Math.random() * 3) + 1 });
		}
		
		// Initialiser avec le premier item
		this.currentRewardIndex = 0;
		this.updateCurrentReward();
		this.itemPulseTimer = 0;
		
		if (this.engine && this.engine.audio) {
			this.originalMusicVolume = this.engine.audio.musicVolume || 0.5;
			this.engine.audio.setMusicVolume(this.originalMusicVolume * 0.3);
			this.musicVolumeReduced = true;
		}
	}
	
	triggerVibration() {
		if (this.isShaking || this.shakeCount >= this.shakesRequired) return;
		
		this.isShaking = true;
		this.shakeAnimationTimer = 0;
		this.shakeCount++;
		this.shakeIntensity = 30;
		
		if (this.engine && this.engine.audio) {
			this.engine.audio.play('hit', 0.2, 0.05);
		}
		
		// La transition vers 'fading' sera gérée dans update() après la fin de l'animation de secousse
	}
	
	handleInput(input) {
		if (!this.isOpening || this.phase !== 'showingMessage') {
			// Réinitialiser le flag si on n'est pas dans la bonne phase
			this.enterKeyProcessed = false;
			return false;
		}
		
		// Vérifier si Enter est pressé (utiliser isKeyDown pour détecter la touche)
		const enterPressed = input.isKeyDown('Enter') || input.isKeyDown('NumpadEnter');
		
		if (enterPressed && !this.enterKeyProcessed) {
			// Marquer comme traité pour éviter les répétitions
			this.enterKeyProcessed = true;
			
			// Donner l'item actuel
			this.giveCurrentReward();
			
			// Passer à l'item suivant
			this.currentRewardIndex++;
			
			if (this.currentRewardIndex < this.rewardItems.length) {
				// Il y a encore des items, afficher le suivant
				this.updateCurrentReward();
				this.phase = 'itemAppearing';
				this.animationTimer = 0;
				this.itemAlpha = 0;
				this.itemScale = 0;
				this.messageTimer = 0;
				// Réinitialiser le flag pour le prochain item
				this.enterKeyProcessed = false;
			} else {
				// Plus d'items, terminer l'ouverture
				this.completeOpening();
			}
			return true;
		} else if (!enterPressed) {
			// Si Enter n'est plus pressé, réinitialiser le flag
			this.enterKeyProcessed = false;
		}
		
		return false;
	}
	
	giveCurrentReward() {
		if (this.activeChest && this.engine.sceneManager) {
			const battleScene = this.engine.sceneManager.scenes.battle;
			if (battleScene && this.rewardItemId && this.rewardQuantity > 0) {
				const itemConfig = ItemConfig[this.rewardItemId];
				if (itemConfig) {
					for (let i = 0; i < this.rewardQuantity; i++) {
						if (itemConfig.category === 'egg') {
							if (!battleScene.sessionEggs[this.rewardItemId]) {
								battleScene.sessionEggs[this.rewardItemId] = [];
							}
							const uniqueId = `${this.rewardItemId}_${Date.now()}_${Math.random()}_${i}`;
							battleScene.sessionEggs[this.rewardItemId].push(uniqueId);
							
							if (!battleScene.sessionInventory[this.rewardItemId]) {
								battleScene.sessionInventory[this.rewardItemId] = 0;
							}
							battleScene.sessionInventory[this.rewardItemId]++;
						} else if (itemConfig.category === 'equipable') {
							if (!battleScene.sessionInventory[this.rewardItemId]) {
								battleScene.sessionInventory[this.rewardItemId] = 0;
							}
							battleScene.sessionInventory[this.rewardItemId]++;
						} else {
							if (!battleScene.sessionInventory[this.rewardItemId]) {
								battleScene.sessionInventory[this.rewardItemId] = 0;
							}
							battleScene.sessionInventory[this.rewardItemId]++;
						}
					}
					this.engine.audio.play('ok', 0.3, 0.2);
				}
			}
		}
	}
	
	update(deltaTime) {
		if (!this.isOpening) return;
		
		this.animationTimer += deltaTime;
		
		// Debug: vérifier que l'animation progresse
		if (this.animationTimer < 100) {
			console.log(`Chest animation: phase=${this.phase}, timer=${this.animationTimer.toFixed(0)}`);
		}
		
		if (this.phase === 'shaking') {
			// Générer des secousses pendant la phase shaking
			if (!this.isShaking && this.shakeCount < this.shakesRequired) {
				this.vibrationTimer += deltaTime;
				
				if (this.vibrationTimer >= this.vibrationInterval) {
					this.vibrationTimer = 0;
					this.triggerVibration();
				}
			}
			
			if (this.isShaking) {
				this.shakeAnimationTimer += deltaTime;
				const progress = Math.min(this.shakeAnimationTimer / this.shakeAnimationDuration, 1);
				const shakeAmount = this.shakeIntensity * (1 - progress);
				
				this.shakeOffsetX = (Math.random() - 0.5) * shakeAmount;
				this.shakeOffsetY = (Math.random() - 0.5) * shakeAmount;
				
				if (progress >= 1) {
					this.isShaking = false;
					this.shakeOffsetX = 0;
					this.shakeOffsetY = 0;
				}
			}
			
			// Passer à la phase fading après une durée fixe
			if (this.animationTimer >= this.shakePhaseDuration) {
				console.log('Transition vers fading, animationTimer:', this.animationTimer, 'shakePhaseDuration:', this.shakePhaseDuration);
				this.phase = 'fading';
				this.animationTimer = 0;
			}
		} else if (this.phase === 'fading') {
			const progress = Math.min(this.animationTimer / this.fadeOutDuration, 1);
			this.chestAlpha = 1 - progress;
			
			if (progress >= 1) {
				this.phase = 'itemAppearing';
				this.animationTimer = 0;
				// S'assurer que le premier item est chargé
				if (this.currentRewardIndex === 0) {
					this.updateCurrentReward();
				}
				if (this.engine && this.engine.audio) {
					this.engine.audio.play('chest_reward', 0.5, 0.1);
				}
			}
		} else if (this.phase === 'itemAppearing') {
			const progress = Math.min(this.animationTimer / this.itemAppearDuration, 1);
			this.itemAlpha = progress;
			this.itemScale = progress < 0.5 
				? progress * 2 
				: 1 + (progress - 0.5) * 0.2 * Math.sin((progress - 0.5) * Math.PI * 4);
			
			if (progress >= 1) {
				this.phase = 'showingMessage';
				this.messageTimer = 0;
			}
		} else if (this.phase === 'showingMessage') {
			this.messageTimer += deltaTime;
			this.itemPulseTimer += deltaTime;
		}
	}
	
	completeOpening() {
		// Si on est dans la map finale, retourner au hub après l'ouverture
		if (this.activeChest && this.engine.sceneManager) {
			const battleScene = this.engine.sceneManager.scenes.battle;
			if (battleScene && battleScene.isFinalMap) {
				// Retourner au hub
				this.engine.sceneManager.changeScene('game', { enteringFromTop: false });
				return;
			}
		}
		
		if (this.engine && this.engine.audio && this.musicVolumeReduced) {
			this.engine.audio.setMusicVolume(this.originalMusicVolume);
			this.musicVolumeReduced = false;
		}
		
		this.isOpening = false;
		this.activeChest = null;
		this.phase = 'shaking';
		this.animationTimer = 0;
		this.vibrationTimer = 0;
		this.shakeCount = 0;
		this.isShaking = false;
		this.shakeAnimationTimer = 0;
		this.shakeIntensity = 0;
		this.shakeOffsetX = 0;
		this.shakeOffsetY = 0;
		this.chestAlpha = 1;
		this.itemAlpha = 0;
		this.itemScale = 0;
		this.messageTimer = 0;
		this.rewardItems = [];
		this.currentRewardIndex = 0;
	}
	
	render(renderer) {
		if (!this.isOpening || !this.activeChest) return;
		
		const canvasWidth = renderer.width;
		const canvasHeight = renderer.height;
		
		renderer.ctx.save();
		
		const grayscaleWidth = canvasWidth * 0.25;
		const grayscaleHeight = canvasHeight * 0.25;
		const grayscaleX = (canvasWidth - grayscaleWidth) / 2;
		const grayscaleY = (canvasHeight - grayscaleHeight) / 2;
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
		renderer.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		
		renderer.ctx.globalCompositeOperation = 'multiply';
		renderer.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
		renderer.ctx.fillRect(grayscaleX, grayscaleY, grayscaleWidth, grayscaleHeight);
		renderer.ctx.globalCompositeOperation = 'source-over';
		
		const centerX = canvasWidth / 2;
		const centerY = canvasHeight / 2;
		const chestSize = 120;
		
		if (this.phase === 'shaking' || this.phase === 'fading') {
			const chestX = centerX - chestSize / 2 + this.shakeOffsetX;
			const chestY = centerY - chestSize / 2 + this.shakeOffsetY;
			
			renderer.ctx.globalAlpha = this.chestAlpha;
			// Utiliser le sprite du coffre actif (sans préfixe item_)
			const chestItemId = this.activeChest?.itemId || 'basic_chest';
			const chestSprite = this.engine.sprites.get(chestItemId);
			if (chestSprite && chestSprite.complete && chestSprite.naturalWidth > 0) {
				renderer.ctx.drawImage(chestSprite, chestX, chestY, chestSize, chestSize);
			} else {
				renderer.ctx.fillStyle = '#8B4513';
				renderer.ctx.fillRect(chestX, chestY, chestSize, chestSize);
				renderer.ctx.strokeStyle = '#654321';
				renderer.ctx.lineWidth = 3;
				renderer.ctx.strokeRect(chestX, chestY, chestSize, chestSize);
			}
			
		}
		
		if (this.phase === 'itemAppearing' || this.phase === 'showingMessage') {
			let itemSize = 80 * this.itemScale;
			let pulseScale = 1;
			let pulseOffsetX = 0;
			let pulseOffsetY = 0;
			
			if (this.phase === 'showingMessage') {
				pulseScale = 1 + Math.sin(this.itemPulseTimer / 200) * 0.1;
				itemSize = 80 * pulseScale;
			}
			
			const baseItemSize = 80;
			const itemX = centerX - baseItemSize / 2 + (baseItemSize - itemSize) / 2;
			const itemY = centerY - baseItemSize / 2 + (baseItemSize - itemSize) / 2;
			
			renderer.ctx.globalAlpha = this.itemAlpha;
			if (this.rewardItemImage && this.rewardItemImage.complete && this.rewardItemImage.naturalWidth > 0) {
				renderer.ctx.drawImage(this.rewardItemImage, itemX, itemY, itemSize, itemSize);
			} else {
				renderer.ctx.fillStyle = '#ff6b6b';
				renderer.ctx.beginPath();
				renderer.ctx.arc(centerX, centerY, itemSize / 2, 0, Math.PI * 2);
				renderer.ctx.fill();
			}
			
			if (this.phase === 'showingMessage' && this.rewardItemConfig) {
				renderer.ctx.globalAlpha = 1;
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = 'bold 24px Pokemon';
				renderer.ctx.textAlign = 'center';
				renderer.ctx.textBaseline = 'middle';
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 3;
				
				const messageText = 'Vous avez obtenu';
				renderer.ctx.strokeText(messageText, centerX, centerY - 100);
				renderer.ctx.fillText(messageText, centerX, centerY - 100);
				
				renderer.ctx.font = 'bold 20px Pokemon';
				const quantityText = `${this.rewardQuantity}x ${this.rewardItemConfig.name}`;
				renderer.ctx.strokeText(quantityText, centerX, centerY + 60);
				renderer.ctx.fillText(quantityText, centerX, centerY + 60);
				
				if (this.rewardItems.length > 1) {
					renderer.ctx.font = 'bold 18px Arial';
					renderer.ctx.fillStyle = '#ffff00';
					renderer.ctx.fillText(
						`${this.currentRewardIndex + 1} / ${this.rewardItems.length}`,
						centerX,
						centerY + 100
					);
				}
			}
		}
		
		renderer.ctx.restore();
	}
	
	cleanup() {
	}
	
	clear() {
		this.activeChest = null;
		this.isOpening = false;
		this.animationTimer = 0;
		this.shakeOffsetX = 0;
		this.shakeOffsetY = 0;
		this.chestAlpha = 1;
		this.itemAlpha = 0;
		this.itemScale = 0;
		this.rewardItemId = null;
		this.rewardItemImage = null;
		this.rewardItemConfig = null;
		this.rewardQuantity = 1;
		this.messageTimer = 0;
		this.phase = 'shaking';
		this.itemPulseTimer = 0;
		this.vibrationTimer = 0;
		this.shakeCount = 0;
		this.isShaking = false;
		this.shakeAnimationTimer = 0;
	}
}

