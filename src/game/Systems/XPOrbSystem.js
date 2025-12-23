class XPOrb {
	constructor(x, y, xpAmount) {
		this.x = x;
		this.y = y;
		this.xpAmount = xpAmount;
		this.size = 2.5 + Math.random() * 1.5;
		this.isActive = true;
		this.lifetime = 0;
		this.maxLifetime = Infinity;
		this.fadeStartTime = Infinity;
		this.bobOffset = Math.random() * Math.PI * 2;
		this.velocityX = 0;
		this.velocityY = 0;
		this.isBeingPulled = false;
		this.justCollected = false;
		this.points = 4 + Math.floor(Math.random() * 3);
	}

	update(deltaTime, playerX, playerY, fetchRange) {
		if (!this.isActive) return;
		this.lifetime += deltaTime;

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
		return this.xpAmount;
	}

	render(renderer) {
		if (!this.isActive) return;

		const bobAmount = Math.sin((this.lifetime / 300) + this.bobOffset) * 2;
		const renderY = this.y + bobAmount;
		const pulseAmount = Math.sin((this.lifetime / 150) + this.bobOffset) * 0.15 + 1;
		const glowPulse = Math.sin((this.lifetime / 200) + this.bobOffset) * 0.5 + 0.5;
		const currentSize = this.size * pulseAmount;

		let alpha = 1;
		if (this.lifetime >= this.fadeStartTime) {
			const fadeProgress = (this.lifetime - this.fadeStartTime) / (this.maxLifetime - this.fadeStartTime);
			const blinkSpeed = 200;
			const blink = Math.sin(this.lifetime / blinkSpeed) * 0.5 + 0.5;
			alpha = (1 - fadeProgress) * blink;
		}

		renderer.ctx.save();
		renderer.ctx.globalAlpha = alpha;
		
		renderer.ctx.shadowColor = '#87CEEB';
		renderer.ctx.shadowBlur = 8 + glowPulse * 4;
		
		const glowRadius = currentSize + 3;
		renderer.ctx.fillStyle = `rgba(135, 206, 235, ${0.2 + glowPulse * 0.15})`;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, renderY, glowRadius, 0, Math.PI * 2);
		renderer.ctx.fill();

		const gradient = renderer.ctx.createRadialGradient(
			this.x, renderY, 0,
			this.x, renderY, currentSize
		);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
		gradient.addColorStop(0.3, '#B0E0E6');
		gradient.addColorStop(0.6, '#87CEEB');
		gradient.addColorStop(1, '#5F9EA0');
		
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, renderY, currentSize, 0, Math.PI * 2);
		renderer.ctx.fill();

		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 0.5;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, renderY, currentSize, 0, Math.PI * 2);
		renderer.ctx.stroke();

		const highlightGradient = renderer.ctx.createRadialGradient(
			this.x - currentSize * 0.3, renderY - currentSize * 0.3, 0,
			this.x - currentSize * 0.3, renderY - currentSize * 0.3, currentSize * 0.6
		);
		highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
		highlightGradient.addColorStop(0.5, 'rgba(173, 216, 230, 0.4)');
		highlightGradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
		
		renderer.ctx.fillStyle = highlightGradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x - currentSize * 0.25, renderY - currentSize * 0.25, currentSize * 0.6, 0, Math.PI * 2);
		renderer.ctx.fill();

		renderer.ctx.shadowBlur = 0;
		renderer.ctx.globalAlpha = 1;
		renderer.ctx.restore();
	}
}

export default class XPOrbSystem {
	constructor() {
		this.orbs = [];
	}

	spawnOrb(x, y, xpAmount) {
		const orb = new XPOrb(x, y, xpAmount);
		this.orbs.push(orb);
	}

	update(deltaTime, playerX, playerY, fetchRange) {
		this.orbs.forEach(orb => {
			orb.update(deltaTime, playerX, playerY, fetchRange);
		});

		const collectRadius = 20;
		let collectedXP = 0;
		let hasCollected = false;
		
		this.orbs.forEach(orb => {
			if (!orb.isActive || orb.justCollected) return;
			
			const dx = orb.x - playerX;
			const dy = orb.y - playerY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			if (distance <= collectRadius) {
				const xp = orb.collect();
				if (xp > 0) {
					collectedXP += xp;
					hasCollected = true;
				}
			}
		});

		this.orbs = this.orbs.filter(o => o.isActive);
		return hasCollected ? collectedXP : 0;
	}

	render(renderer) {
		this.orbs.forEach(orb => {
			orb.render(renderer);
		});
	}

	clear() {
		this.orbs = [];
	}
}

