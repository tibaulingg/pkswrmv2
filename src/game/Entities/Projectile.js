export default class Projectile {
	constructor(x, y, targetX, targetY, damage, speed = 0.6, maxDistance = 600, color = '#ffff00', size = 8, playerVelocityX = 0, playerVelocityY = 0, isCrit = false, aoeRadius = 0, isEnemy = false) {
		this.x = x;
		this.y = y;
		this.damage = damage;
		this.color = color;
		this.size = size;
		this.isActive = true;
		this.isCrit = isCrit;
		this.maxDistance = maxDistance;
		this.traveledDistance = 0;
		this.aoeRadius = aoeRadius;
		this.hasAoE = aoeRadius > 0;
		this.hitEnemies = new Set();
		this.isEnemy = isEnemy;
		
		const dx = targetX - x;
		const dy = targetY - y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		if (distance < 0.001) {
			this.directionX = 1;
			this.directionY = 0;
		} else {
			this.directionX = dx / distance;
			this.directionY = dy / distance;
		}
		
		this.velocityX = this.directionX * speed + playerVelocityX;
		this.velocityY = this.directionY * speed + playerVelocityY;
	}

	update(deltaTime) {
		if (!this.isActive) return;

		const moveX = this.velocityX * deltaTime;
		const moveY = this.velocityY * deltaTime;
		
		this.x += moveX;
		this.y += moveY;
		
		const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);
		this.traveledDistance += moveDistance;
		
		if (this.traveledDistance >= this.maxDistance) {
			this.isActive = false;
		}
	}

	collidesWith(x, y, width, height) {
		return this.isActive &&
			   this.x >= x &&
			   this.x <= x + width &&
			   this.y >= y &&
			   this.y <= y + height;
	}

	isInAoERange(centerX, centerY) {
		if (!this.hasAoE || !this.isActive) return false;
		const dx = centerX - this.x;
		const dy = centerY - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance <= this.aoeRadius;
	}

	render(renderer) {
		if (!this.isActive) return;
		
		if (this.hasAoE) {
			const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
			renderer.ctx.save();
			renderer.ctx.globalAlpha = 0.2 * pulse;
			renderer.ctx.fillStyle = this.color;
			renderer.ctx.beginPath();
			renderer.ctx.arc(this.x, this.y, this.aoeRadius, 0, Math.PI * 2);
			renderer.ctx.fill();
			renderer.ctx.globalAlpha = 1;
			renderer.ctx.restore();
		}
		
		if (this.isEnemy) {
			renderer.ctx.save();
			const gradient = renderer.ctx.createRadialGradient(
				this.x, this.y, this.size / 2,
				this.x, this.y, this.size / 2 + 8
			);
			gradient.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
			gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.3)');
			gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
			renderer.ctx.fillStyle = gradient;
			renderer.ctx.beginPath();
			renderer.ctx.arc(this.x, this.y, this.size / 2 + 8, 0, Math.PI * 2);
			renderer.ctx.fill();
			renderer.ctx.restore();
		}
		
		renderer.drawRect(
			this.x - this.size / 2,
			this.y - this.size / 2,
			this.size,
			this.size,
			this.color
		);
		renderer.drawStrokeRect(
			this.x - this.size / 2,
			this.y - this.size / 2,
			this.size,
			this.size,
			'#fff',
			1
		);
	}
}
