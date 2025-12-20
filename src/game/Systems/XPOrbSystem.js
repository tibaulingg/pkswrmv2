class XPOrb {
	constructor(x, y, xpAmount) {
		this.x = x;
		this.y = y;
		this.xpAmount = xpAmount;
		this.size = 2.5 + Math.random() * 1.5;
		this.isActive = true;
		this.lifetime = 0;
		this.maxLifetime = 10000;
		this.fadeStartTime = 8000;
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

		if (this.lifetime >= this.maxLifetime) {
			this.isActive = false;
			return;
		}

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
		const rotationAmount = (this.lifetime / 800) + this.bobOffset;
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
		renderer.ctx.shadowBlur = 12 + glowPulse * 6;
		
		renderer.ctx.fillStyle = `rgba(135, 206, 235, ${0.15 + glowPulse * 0.1})`;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, renderY, (currentSize + 4), 0, Math.PI * 2);
		renderer.ctx.fill();

		const gradient1 = renderer.ctx.createRadialGradient(
			this.x, renderY, 0,
			this.x, renderY, currentSize
		);
		gradient1.addColorStop(0, '#B0E0E6');
		gradient1.addColorStop(0.3, '#ADD8E6');
		gradient1.addColorStop(0.6, '#87CEEB');
		gradient1.addColorStop(1, '#87CEEB');
		
		renderer.ctx.fillStyle = gradient1;
		renderer.ctx.beginPath();
		
		const outerRadius = currentSize;
		const innerRadius = currentSize * 0.4;
		
		for (let i = 0; i < this.points * 2; i++) {
			const angle = (Math.PI * 2 * i) / (this.points * 2) + rotationAmount;
			const radius = i % 2 === 0 ? outerRadius : innerRadius;
			const px = this.x + Math.cos(angle) * radius;
			const py = renderY + Math.sin(angle) * radius;
			
			if (i === 0) {
				renderer.ctx.moveTo(px, py);
			} else {
				renderer.ctx.lineTo(px, py);
			}
		}
		renderer.ctx.closePath();
		renderer.ctx.fill();

		renderer.ctx.strokeStyle = '#2E5C8A';
		renderer.ctx.lineWidth = 1.5;
		renderer.ctx.stroke();

		const highlightGradient = renderer.ctx.createRadialGradient(
			this.x - currentSize * 0.3, renderY - currentSize * 0.3, 0,
			this.x, renderY, currentSize * 0.5
		);
		highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
		highlightGradient.addColorStop(0.5, 'rgba(173, 216, 230, 0.5)');
		highlightGradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
		
		renderer.ctx.fillStyle = highlightGradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x - currentSize * 0.2, renderY - currentSize * 0.2, currentSize * 0.5, 0, Math.PI * 2);
		renderer.ctx.fill();

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

