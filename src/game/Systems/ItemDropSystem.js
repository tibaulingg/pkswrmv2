import { ItemConfig } from '../Config/ItemConfig.js';

class ItemDrop {
	constructor(x, y, itemId, itemImage) {
		this.x = x;
		this.y = y;
		this.itemId = itemId;
		this.itemImage = itemImage;
		this.size = 20;
		this.isActive = true;
		this.lifetime = 0;
		this.velocityX = 0;
		this.velocityY = 0;
		this.isBeingPulled = false;
		this.justCollected = false;
		this.hasLanded = false;
		this.isChest = false;
		
		const itemConfig = ItemConfig[itemId];
		if (itemConfig && itemConfig.category === 'chest') {
			this.isChest = true;
		}
	}

	update(deltaTime, playerX, playerY, fetchRange, playerInventory = null) {
		if (!this.isActive) return;
		this.lifetime += deltaTime;

		const dx = playerX - this.x;
		const dy = playerY - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (this.isChest) {
			if (!this.hasLanded) {
				this.velocityY += 0.5 * deltaTime * 0.01;
				this.velocityY = Math.min(this.velocityY, 3);
				this.x += this.velocityX * deltaTime;
				this.y += this.velocityY * deltaTime;
				this.velocityX *= 0.9;
				
				if (this.lifetime > 500 || (this.velocityY > 0 && Math.abs(this.velocityY) < 0.1)) {
					this.hasLanded = true;
					this.velocityX = 0;
					this.velocityY = 0;
				}
			} else {
				if (distance < this.size) {
					if (playerInventory && playerInventory['key'] > 0) {
						console.log('coffre openned');
						playerInventory['key']--;
						if (playerInventory['key'] <= 0) {
							delete playerInventory['key'];
						}
						this.isActive = false;
					}
				}
			}
		} else {
			if (distance <= fetchRange) {
				this.isBeingPulled = true;
				const pullStrength = 0.5;
				const acceleration = pullStrength * (1 - distance / fetchRange);
				
				this.velocityX += (dx / distance) * acceleration * deltaTime * 0.01;
				this.velocityY += (dy / distance) * acceleration * deltaTime * 0.01;
				
				const maxSpeed = 0.8;
				const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
				if (speed > maxSpeed) {
					this.velocityX = (this.velocityX / speed) * maxSpeed;
					this.velocityY = (this.velocityY / speed) * maxSpeed;
				}
			}

			this.x += this.velocityX * deltaTime;
			this.y += this.velocityY * deltaTime;

			this.velocityX *= 0.98;
			this.velocityY *= 0.98;

			if (distance < this.size / 2) {
				this.justCollected = true;
				this.isActive = false;
			}
		}
	}

	collect() {
		if (this.justCollected) {
			return this.itemId;
		}
		return null;
	}

	render(renderer) {
		if (!this.isActive) return;

		renderer.ctx.save();

		if (this.itemImage && this.itemImage.complete && this.itemImage.naturalWidth > 0) {
			renderer.ctx.drawImage(
				this.itemImage,
				this.x - this.size / 2,
				this.y - this.size / 2,
				this.size,
				this.size
			);
		} else {
			renderer.ctx.fillStyle = '#ffd700';
			renderer.ctx.beginPath();
			renderer.ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
			renderer.ctx.fill();
			renderer.ctx.strokeStyle = '#fff';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.stroke();
		}

		renderer.ctx.restore();
	}
}

export default class ItemDropSystem {
	constructor() {
		this.items = [];
	}

	spawnItem(x, y, itemId, itemImage) {
		const item = new ItemDrop(x, y, itemId, itemImage);
		item.initialY = y;
		this.items.push(item);
	}

	update(deltaTime, playerX, playerY, fetchRange, playerInventory = null) {
		this.items.forEach(item => {
			item.update(deltaTime, playerX, playerY, fetchRange, playerInventory);
		});

		const collectedItems = [];
		this.items.forEach(item => {
			if (!item.isActive || item.justCollected) {
				const itemId = item.collect();
				if (itemId) {
					collectedItems.push(itemId);
				}
			}
		});

		this.items = this.items.filter(item => item.isActive);
		return collectedItems;
	}

	render(renderer) {
		this.items.forEach(item => {
			item.render(renderer);
		});
	}

	clear() {
		this.items = [];
	}
}

