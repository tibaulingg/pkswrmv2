class Coin {
	constructor(x, y, coinAmount, coinImage) {
		this.x = x;
		this.y = y;
		this.coinAmount = coinAmount;
		this.coinImage = coinImage;
		this.size = 16;
		this.isActive = true;
		this.lifetime = 0;
		this.bobOffset = Math.random() * Math.PI * 2;
		this.velocityX = 0;
		this.velocityY = 0;
		this.isBeingPulled = false;
		this.justCollected = false;
		this.rotation = Math.random() * Math.PI * 2;
		this.rotationSpeed = (Math.random() - 0.5) * 0.05;
	}

	update(deltaTime, playerX, playerY, fetchRange) {
		if (!this.isActive) return;
		this.lifetime += deltaTime;
		this.rotation += this.rotationSpeed * deltaTime / 16;

		const dx = playerX - this.x;
		const dy = playerY - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

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
	}

	collect() {
		if (this.justCollected) return 0;
		this.justCollected = true;
		this.isActive = false;
		return this.coinAmount;
	}

	render(renderer) {
		if (!this.isActive) return;

		const bobAmount = Math.sin((this.lifetime / 300) + this.bobOffset) * 2;
		const renderY = this.y + bobAmount;
		const glowPulse = Math.sin((this.lifetime / 200) + this.bobOffset) * 0.5 + 0.5;

		renderer.ctx.save();
		
		renderer.ctx.shadowColor = '#FFD700';
		renderer.ctx.shadowBlur = 15 + glowPulse * 8;
		
		renderer.ctx.translate(this.x, renderY);
		
		const coinSize = this.size;
		
		if (this.coinImage) {
			renderer.ctx.drawImage(
				this.coinImage,
				-coinSize / 2,
				-coinSize / 2,
				coinSize,
				coinSize
			);
		} else {
			renderer.ctx.fillStyle = '#FFD700';
			renderer.ctx.beginPath();
			renderer.ctx.arc(0, 0, coinSize / 2, 0, Math.PI * 2);
			renderer.ctx.fill();
		}

		renderer.ctx.restore();
	}
}

const COIN_DROP_CHANCE = 1 / 5 ;

export { COIN_DROP_CHANCE };

export default class CoinSystem {
	constructor(coinImage) {
		this.coins = [];
		this.coinImage = coinImage;
	}

	spawnCoin(x, y, coinAmount) {
		const coin = new Coin(x, y, coinAmount, this.coinImage);
		this.coins.push(coin);
	}

	update(deltaTime, playerX, playerY, fetchRange) {
		this.coins.forEach(coin => {
			coin.update(deltaTime, playerX, playerY, fetchRange);
		});

		const collectRadius = 20;
		let collectedCoins = 0;
		let hasCollected = false;
		
		this.coins.forEach(coin => {
			if (!coin.isActive || coin.justCollected) return;
			
			const dx = coin.x - playerX;
			const dy = coin.y - playerY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			if (distance <= collectRadius) {
				const amount = coin.collect();
				if (amount > 0) {
					collectedCoins += amount;
					hasCollected = true;
				}
			}
		});

		this.coins = this.coins.filter(c => c.isActive);
		return hasCollected ? collectedCoins : 0;
	}

	render(renderer) {
		this.coins.forEach(coin => {
			coin.render(renderer);
		});
	}

	clear() {
		this.coins = [];
	}
}

