import { ItemConfig } from '../Config/ItemConfig.js';

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
		this.messageTimer = 0;
		this.messageDuration = 1500;
		this.phase = 'shaking'; // 'shaking', 'fading', 'itemAppearing', 'showingMessage'
		this.itemPulseTimer = 0;
		this.vibrationTimer = 0;
		this.originalMusicVolume = 1;
		this.musicVolumeReduced = false;
		this.shakeCount = 0;
		this.shakesRequired = 3;
		this.isShaking = false;
		this.shakeAnimationTimer = 0;
		this.vibrationInterval = 100;
		this.shakeDuration = 100;
		this.shakeAnimationDuration = 100;
	}
	
	startOpening(chest) {
		if (this.isOpening) return;
		
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
		
		this.rewardItemId = 'apple';
		this.rewardItemConfig = ItemConfig[this.rewardItemId];
		this.rewardItemImage = this.engine.sprites.get(`item_${this.rewardItemId}`);
		this.rewardQuantity = Math.floor(Math.random() * 3) + 1;
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
		
		if (this.shakeCount >= this.shakesRequired) {
			setTimeout(() => {
				this.phase = 'fading';
				this.animationTimer = 0;
			}, this.shakeAnimationDuration);
		}
	}
	
	handleInput(input) {
		if (!this.isOpening || this.phase !== 'showingMessage') return false;
		
		const key = input.consumeLastKey();
		if (key === 'Enter' || key === 'Space') {
			this.completeOpening();
			return true;
		}
		
		return false;
	}
	
	update(deltaTime) {
		if (!this.isOpening) return;
		
		this.animationTimer += deltaTime;
		
		if (this.phase === 'shaking') {
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
		} else if (this.phase === 'fading') {
			const progress = Math.min(this.animationTimer / this.fadeOutDuration, 1);
			this.chestAlpha = 1 - progress;
			
			if (progress >= 1) {
				this.phase = 'itemAppearing';
				this.animationTimer = 0;
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
		if (this.activeChest && this.engine.sceneManager) {
			const battleScene = this.engine.sceneManager.scenes.battle;
			if (battleScene && battleScene.itemDropSystem) {
				const chestX = this.activeChest.x;
				const chestY = this.activeChest.y;
				const dropScale = this.rewardItemConfig.dropScale !== undefined ? this.rewardItemConfig.dropScale : 1.0;
				battleScene.itemDropSystem.spawnItem(chestX, chestY, this.rewardItemId, this.rewardItemImage, dropScale);
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
			const chestSprite = this.engine.sprites.get('item_bronze_chest');
			if (chestSprite && chestSprite.complete && chestSprite.naturalWidth > 0) {
				renderer.ctx.drawImage(chestSprite, chestX, chestY, chestSize, chestSize);
			} else {
				renderer.ctx.fillStyle = '#8B4513';
				renderer.ctx.fillRect(chestX, chestY, chestSize, chestSize);
				renderer.ctx.strokeStyle = '#654321';
				renderer.ctx.lineWidth = 3;
				renderer.ctx.strokeRect(chestX, chestY, chestSize, chestSize);
			}
			
			if (this.phase === 'shaking') {
				renderer.ctx.globalAlpha = 1;
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = 'bold 20px Pokemon';
				renderer.ctx.textAlign = 'center';
				renderer.ctx.textBaseline = 'middle';
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 3;
				
				const shakeText = `${this.shakeCount}/${this.shakesRequired}`;
				renderer.ctx.strokeText(shakeText, centerX, chestY + chestSize + 30);
				renderer.ctx.fillText(shakeText, centerX, chestY + chestSize + 30);
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
				
				renderer.ctx.font = 'bold 14px Pokemon';
				const instructionText = 'Appuyez sur ENTRÉE pour continuer';
				renderer.ctx.strokeText(instructionText, centerX, centerY + 90);
				renderer.ctx.fillText(instructionText, centerX, centerY + 90);
			}
		}
		
		renderer.ctx.restore();
	}
	
	cleanup() {
	}
}

