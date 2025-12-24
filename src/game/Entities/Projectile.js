export default class Projectile {
	constructor(x, y, targetX, targetY, damage, speed = 0.6, maxDistance = 600, color = '#ffff00', size = 8, playerVelocityX = 0, playerVelocityY = 0, aoeRadius = 0, isEnemy = false, hasPiercing = false, hasBounce = false, bounceCount = 0, piercingCount = 0, bounceRange = 300, type = 'normal', piercingDamageReduction = 0.2, hasEffect = false, effectProcChance = 0, effectDamageMultiplier = 1, effectIntensityMultiplier = 1, effectDurationMultiplier = 1, playerPokemonType = 'normal', critChance = 0, critDamage = 1.5) {
		this.x = x;
		this.y = y;
		this.baseDamage = damage;
		this.damage = damage;
		this.color = color;
		this.size = size;
		this.isActive = true;
		this.maxDistance = maxDistance;
		this.traveledDistance = 0;
		this.aoeRadius = aoeRadius;
		this.hasAoE = aoeRadius > 0;
		this.hasPiercing = hasPiercing;
		this.hasBounce = hasBounce;
		this.hasEffect = hasEffect;
		this.effectProcChance = effectProcChance;
		this.effectDamageMultiplier = effectDamageMultiplier;
		this.effectIntensityMultiplier = effectIntensityMultiplier;
		this.effectDurationMultiplier = effectDurationMultiplier;
		this.playerPokemonType = playerPokemonType;
		this.critChance = critChance;
		this.critDamage = critDamage;
		this.bounceCount = bounceCount;
		this.currentBounces = 0;
		this.piercingCount = piercingCount;
		this.bounceRange = bounceRange;
		this.piercingDamageReduction = piercingDamageReduction;
		this.hitEnemies = new Set();
		this.isEnemy = isEnemy;
		this.exploded = false;
		this.type = type;
		this.animationTime = 0;
		
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

	update(deltaTime, collisionSystem = null) {
		if (!this.isActive) return;

		const moveX = this.velocityX * deltaTime;
		const moveY = this.velocityY * deltaTime;
		
		const newX = this.x + moveX;
		const newY = this.y + moveY;
		
		if (collisionSystem) {
			const projectileSize = this.size;
			if (collisionSystem.checkCollision(newX - projectileSize / 2, newY - projectileSize / 2, projectileSize, projectileSize)) {
				this.isActive = false;
				return;
			}
		}
		
		this.x = newX;
		this.y = newY;
		
		const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);
		this.traveledDistance += moveDistance;
		
		this.animationTime += deltaTime;
		
		if (this.hasBounce) {
			if (this.traveledDistance >= this.maxDistance * 2) {
				this.isActive = false;
			}
		} else {
		if (this.traveledDistance >= this.maxDistance) {
			this.isActive = false;
			}
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

	render(renderer, debug = false) {
		if (!this.isActive) return;
		
		if (this.hasAoE && debug) {
			renderer.ctx.save();
			renderer.ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.setLineDash([5, 5]);
			renderer.ctx.beginPath();
			renderer.ctx.arc(this.x, this.y, this.aoeRadius, 0, Math.PI * 2);
			renderer.ctx.stroke();
			renderer.ctx.setLineDash([]);
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
			
			renderer.ctx.save();
		renderer.ctx.fillStyle = this.color;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
		renderer.ctx.fill();
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.stroke();
		renderer.ctx.restore();
		return;
		}
		
		renderer.ctx.save();
		
		const time = this.animationTime * 0.01;
		const pulse = Math.sin(time) * 0.1 + 0.9;
		
		switch(this.type) {
			case 'water':
				this.renderWaterProjectile(renderer, pulse);
				break;
			case 'fire':
				this.renderFireProjectile(renderer, pulse);
				break;
			case 'electric':
				this.renderElectricProjectile(renderer, pulse);
				break;
			case 'grass':
				this.renderGrassProjectile(renderer, pulse);
				break;
			case 'ice':
				this.renderIceProjectile(renderer, pulse);
				break;
			case 'ground':
				this.renderGroundProjectile(renderer, pulse);
				break;
			case 'rock':
				this.renderRockProjectile(renderer, pulse);
				break;
			case 'bug':
				this.renderBugProjectile(renderer, pulse);
				break;
			default:
				this.renderNormalProjectile(renderer, pulse);
		}
		
		renderer.ctx.restore();
	}
	
	renderWaterProjectile(renderer, pulse) {
		const gradient = renderer.ctx.createRadialGradient(
			this.x, this.y, 0,
			this.x, this.y, this.size / 2
		);
		gradient.addColorStop(0, 'rgba(100, 200, 255, 1)');
		gradient.addColorStop(0.5, 'rgba(50, 150, 255, 0.8)');
		gradient.addColorStop(1, 'rgba(0, 100, 200, 0.6)');
		
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.stroke();
		
		const waveOffset = Math.sin(this.animationTime * 0.02) * 2;
		renderer.ctx.fillStyle = 'rgba(200, 240, 255, 0.4)';
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x + waveOffset, this.y, this.size / 3, 0, Math.PI * 2);
		renderer.ctx.fill();
	}
	
	renderFireProjectile(renderer, pulse) {
		const gradient = renderer.ctx.createRadialGradient(
			this.x, this.y, 0,
			this.x, this.y, this.size / 2
		);
		gradient.addColorStop(0, 'rgba(255, 255, 100, 1)');
		gradient.addColorStop(0.3, 'rgba(255, 150, 0, 0.9)');
		gradient.addColorStop(0.7, 'rgba(255, 50, 0, 0.7)');
		gradient.addColorStop(1, 'rgba(200, 0, 0, 0.5)');
		
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		const flameOffset = Math.sin(this.animationTime * 0.03) * 1.5;
		renderer.ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x + flameOffset, this.y - 2, this.size / 3, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.stroke();
	}
	
	renderElectricProjectile(renderer, pulse) {
		const gradient = renderer.ctx.createRadialGradient(
			this.x, this.y, 0,
			this.x, this.y, this.size / 2
		);
		gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
		gradient.addColorStop(0.4, 'rgba(255, 255, 0, 0.9)');
		gradient.addColorStop(0.8, 'rgba(150, 150, 255, 0.7)');
		gradient.addColorStop(1, 'rgba(100, 100, 255, 0.5)');
		
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		const sparkTime = this.animationTime * 0.05;
		for (let i = 0; i < 4; i++) {
			const angle = (sparkTime + i * Math.PI / 2) % (Math.PI * 2);
			const sparkX = this.x + Math.cos(angle) * (this.size / 2 + 2);
			const sparkY = this.y + Math.sin(angle) * (this.size / 2 + 2);
			renderer.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
			renderer.ctx.fillRect(sparkX - 1, sparkY - 1, 2, 2);
		}
		
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.stroke();
	}
	
	renderGrassProjectile(renderer, pulse) {
		const gradient = renderer.ctx.createRadialGradient(
			this.x, this.y, 0,
			this.x, this.y, this.size / 2
		);
		gradient.addColorStop(0, 'rgba(150, 255, 150, 1)');
		gradient.addColorStop(0.5, 'rgba(100, 200, 100, 0.8)');
		gradient.addColorStop(1, 'rgba(50, 150, 50, 0.6)');
		
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		const leafAngle = this.animationTime * 0.02;
		for (let i = 0; i < 3; i++) {
			const angle = leafAngle + i * (Math.PI * 2 / 3);
			const leafX = this.x + Math.cos(angle) * (this.size / 3);
			const leafY = this.y + Math.sin(angle) * (this.size / 3);
			renderer.ctx.fillStyle = 'rgba(100, 255, 100, 0.7)';
			renderer.ctx.beginPath();
			renderer.ctx.arc(leafX, leafY, this.size / 4, 0, Math.PI * 2);
			renderer.ctx.fill();
		}
		
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.stroke();
	}
	
	renderIceProjectile(renderer, pulse) {
		const gradient = renderer.ctx.createRadialGradient(
			this.x, this.y, 0,
			this.x, this.y, this.size / 2
		);
		gradient.addColorStop(0, 'rgba(200, 240, 255, 1)');
		gradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.8)');
		gradient.addColorStop(1, 'rgba(100, 150, 255, 0.6)');
		
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.stroke();
		
		const crystalAngle = this.animationTime * 0.015;
		for (let i = 0; i < 6; i++) {
			const angle = crystalAngle + i * (Math.PI / 3);
			const crystalX = this.x + Math.cos(angle) * (this.size / 2.5);
			const crystalY = this.y + Math.sin(angle) * (this.size / 2.5);
			renderer.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
			renderer.ctx.fillRect(crystalX - 1, crystalY - 1, 2, 2);
		}
	}
	
	renderGroundProjectile(renderer, pulse) {
		const gradient = renderer.ctx.createRadialGradient(
			this.x, this.y, 0,
			this.x, this.y, this.size / 2
		);
		gradient.addColorStop(0, 'rgba(200, 150, 100, 1)');
		gradient.addColorStop(0.5, 'rgba(150, 100, 50, 0.8)');
		gradient.addColorStop(1, 'rgba(100, 50, 0, 0.6)');
		
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.stroke();
	}
	
	renderRockProjectile(renderer, pulse) {
		const gradient = renderer.ctx.createRadialGradient(
			this.x, this.y, 0,
			this.x, this.y, this.size / 2
		);
		gradient.addColorStop(0, 'rgba(180, 180, 180, 1)');
		gradient.addColorStop(0.5, 'rgba(120, 120, 120, 0.8)');
		gradient.addColorStop(1, 'rgba(80, 80, 80, 0.6)');
		
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.stroke();
	}
	
	renderBugProjectile(renderer, pulse) {
		const gradient = renderer.ctx.createRadialGradient(
			this.x, this.y, 0,
			this.x, this.y, this.size / 2
		);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
		gradient.addColorStop(0.5, 'rgba(240, 240, 240, 0.9)');
		gradient.addColorStop(1, 'rgba(220, 220, 220, 0.7)');
		
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		const wingAngle = this.animationTime * 0.04;
		for (let i = 0; i < 2; i++) {
			const angle = wingAngle + i * Math.PI;
			const wingX = this.x + Math.cos(angle) * (this.size / 3);
			const wingY = this.y + Math.sin(angle) * (this.size / 3);
			renderer.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
			renderer.ctx.beginPath();
			renderer.ctx.ellipse(wingX, wingY, this.size / 4, this.size / 6, angle, 0, Math.PI * 2);
			renderer.ctx.fill();
		}
		
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.stroke();
	}
	
	renderNormalProjectile(renderer, pulse) {
		const gradient = renderer.ctx.createRadialGradient(
			this.x, this.y, 0,
			this.x, this.y, this.size / 2
		);
		gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
		gradient.addColorStop(1, 'rgba(200, 200, 150, 0.7)');
		
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.arc(this.x, this.y, this.size / 2 * pulse, 0, Math.PI * 2);
		renderer.ctx.stroke();
	}
}
