export default class Enemy {
	constructor(x, y, type, config, animationSystem, level = 1, particleColor = '#ff0000', pokemonConfig = null) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.level = level;
		this.animationSystem = animationSystem;
		this.isBoss = config.isBoss || false;
		this.scale = this.isBoss ? 3 : 2;
		this.particleColor = particleColor;
		
		if (this.animationSystem) {
			const frameSize = this.animationSystem.getFrameSize(this.scale);
			this.width = frameSize.width * 0.6;
			this.height = frameSize.height * 0.6;
			this.spriteWidth = frameSize.width;
			this.spriteHeight = frameSize.height;
		} else {
			this.width = 32;
			this.height = 32;
			this.spriteWidth = 32;
			this.spriteHeight = 32;
		}
		
		const baseHp = pokemonConfig?.hp || 20;
		const baseSpeed = pokemonConfig?.speed || 1.5;
		const baseDamage = pokemonConfig?.damage || 5;
		const baseProjectileSpeed = pokemonConfig?.projectileSpeed || 0.4;
		
		const hpMultiplier = config.hpMultiplier || 1.0;
		const speedMultiplier = config.speedMultiplier || 1.0;
		const damageMultiplier = config.damageMultiplier || 1.0;
		const projectileSpeedMultiplier = config.projectileSpeedMultiplier || 1.0;
		
		const levelMultiplier = 1 + (level - 1) * 0.15;
		this.hp = Math.floor(baseHp * hpMultiplier * levelMultiplier);
		this.maxHp = this.hp;
		this.displayedHp = this.hp;
		this.lostHp = 0;
		this.lostHpDecaySpeed = 0.5;
		this.pokemonConfig = pokemonConfig;
		this.speed = baseSpeed * speedMultiplier * (1 + (level - 1) * 0.05);
		this.damage = Math.floor(baseDamage * damageMultiplier * levelMultiplier);
		
		this.attackType = pokemonConfig?.attackType || 'melee';
		
		if (this.attackType === 'range') {
			this.attackRange = pokemonConfig?.range || 250;
		} else {
			this.attackRange = Math.max(this.width, this.height) * 0.7;
		}
		
		this.isAlive = true;
		this.attackCooldown = 0;
		this.attackCooldownMax = 1000;
		this.directionX = 0;
		this.directionY = 0;
		
		this.projectileColor = pokemonConfig?.projectileColor || '#ffffff';
		this.projectileSize = pokemonConfig?.projectileSize || 6;
		this.projectileSpeed = baseProjectileSpeed * projectileSpeedMultiplier;
		
		this.knockbackVelocityX = 0;
		this.knockbackVelocityY = 0;
		this.knockbackDecay = 0.9;
		
		this.hitFlashTime = 0;
		this.hitFlashDuration = 150;
		this.hurtAnimationTime = 0;
		this.hurtAnimationDuration = 300;
		this.auraPulseTime = 0;
	}

	update(deltaTime, playerX, playerY) {
		if (!this.isAlive) return;

		this.x += this.knockbackVelocityX * deltaTime / 16;
		this.y += this.knockbackVelocityY * deltaTime / 16;
		
		this.knockbackVelocityX *= this.knockbackDecay;
		this.knockbackVelocityY *= this.knockbackDecay;
		
		if (Math.abs(this.knockbackVelocityX) < 0.1) this.knockbackVelocityX = 0;
		if (Math.abs(this.knockbackVelocityY) < 0.1) this.knockbackVelocityY = 0;

		const dx = playerX - this.getCenterX();
		const dy = playerY - this.getCenterY();
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (this.attackType === 'range') {
			if (distance > this.attackRange) {
				this.directionX = dx / distance;
				this.directionY = dy / distance;
				this.x += this.directionX * this.speed * deltaTime / 16;
				this.y += this.directionY * this.speed * deltaTime / 16;
			} else if (distance > 0) {
				this.directionX = dx / distance;
				this.directionY = dy / distance;
			}
		} else {
			if (distance > this.attackRange) {
				this.directionX = dx / distance;
				this.directionY = dy / distance;
				this.x += this.directionX * this.speed * deltaTime / 16;
				this.y += this.directionY * this.speed * deltaTime / 16;
			} else if (distance > 0) {
				this.directionX = dx / distance;
				this.directionY = dy / distance;
			}
		}

		if (this.animationSystem) {
			this.animationSystem.update(deltaTime, true, this.directionX, this.directionY);
		}

		if (this.attackCooldown > 0) {
			this.attackCooldown -= deltaTime;
		}

		if (this.hitFlashTime > 0) {
			this.hitFlashTime -= deltaTime;
		}

		if (this.hurtAnimationTime > 0) {
			this.hurtAnimationTime -= deltaTime;
			if (this.hurtAnimationTime <= 0 && this.animationSystem) {
				this.animationSystem.setAnimation('walk');
			}
		}

		if (this.isBoss) {
			this.auraPulseTime += deltaTime;
		}

		const hpDiff = this.displayedHp - this.hp;
		if (hpDiff > 0.1) {
			this.displayedHp -= hpDiff * 0.1;
		} else {
			this.displayedHp = this.hp;
		}

		if (this.lostHp > 0) {
			this.lostHp -= this.lostHpDecaySpeed * deltaTime * 0.001 * this.maxHp;
			if (this.lostHp < 0) this.lostHp = 0;
		}
	}

	canAttack() {
		if (!this.isAlive || this.attackCooldown > 0) return false;
		
		if (this.attackType === 'range') {
			return true;
		}
		
		return true;
	}

	attack(playerX, playerY) {
		this.attackCooldown = this.attackCooldownMax;
		
		if (this.attackType === 'range') {
			if (this.animationSystem) {
				this.animationSystem.setAnimation('shoot');
				setTimeout(() => {
					if (this.animationSystem && this.isAlive) {
						this.animationSystem.setAnimation('walk');
					}
				}, 300);
			}
			return {
				type: 'range',
				damage: this.damage,
				startX: this.getCenterX(),
				startY: this.getCenterY(),
				targetX: playerX,
				targetY: playerY,
				color: this.projectileColor,
				size: this.projectileSize,
				speed: this.projectileSpeed
			};
		}
		
		return {
			type: 'melee',
			damage: this.damage
		};
	}

	takeDamage(amount, knockbackX = 0, knockbackY = 0, isCrit = false) {
		this.hp -= amount;
		this.lostHp = this.displayedHp - this.hp;
		this.hitFlashTime = this.hitFlashDuration;
		
		if (isCrit) {
			this.hurtAnimationTime = this.hurtAnimationDuration;
			if (this.animationSystem) {
				this.animationSystem.setAnimation('hurt');
			}
		}
		
		if (this.isBoss) {
			this.knockbackVelocityX = knockbackX * 0.2;
			this.knockbackVelocityY = knockbackY * 0.2;
		} else {
			this.knockbackVelocityX = knockbackX;
			this.knockbackVelocityY = knockbackY;
		}
		
		if (this.hp <= 0) {
			this.hp = 0;
			this.displayedHp = 0;
			this.lostHp = 0;
			this.isAlive = false;
		}
		return !this.isAlive;
	}

	collidesWith(x, y, width, height) {
		const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
		const hitboxOffsetY = (this.spriteHeight - this.height) / 2;
		const hitboxX = this.x + hitboxOffsetX;
		const hitboxY = this.y + hitboxOffsetY;
		
		return hitboxX < x + width &&
			   hitboxX + this.width > x &&
			   hitboxY < y + height &&
			   hitboxY + this.height > y;
	}

	getCenterX() {
		const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
		return this.x + hitboxOffsetX + this.width / 2;
	}

	getCenterY() {
		const hitboxOffsetY = (this.spriteHeight - this.height) / 2;
		return this.y + hitboxOffsetY + this.height / 2;
	}

	render(renderer, debug = 0) {
		if (!this.isAlive) return;

		if (debug === 1) {
			renderer.ctx.save();
			renderer.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
			renderer.ctx.lineWidth = 1;
			const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
			const hitboxOffsetY = (this.spriteHeight - this.height) / 2;
			renderer.ctx.strokeRect(this.x + hitboxOffsetX, this.y + hitboxOffsetY, this.width, this.height);
			renderer.ctx.restore();
		}

		if (this.isBoss) {
			const centerX = this.getCenterX();
			const centerY = this.getCenterY();
			const auraRadius = Math.max(this.spriteWidth, this.spriteHeight) * 0.6;
			const pulse = Math.sin(this.auraPulseTime / 200) * 0.15 + 0.85;
			const currentRadius = auraRadius * pulse;
			
			renderer.ctx.save();
			const gradient = renderer.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentRadius);
			gradient.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
			gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.4)');
			gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
			renderer.ctx.fillStyle = gradient;
			renderer.ctx.beginPath();
			renderer.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
			renderer.ctx.fill();
			renderer.ctx.restore();
		}

		const isFlashing = this.hitFlashTime > 0 && Math.floor(this.hitFlashTime / 50) % 2 === 0;

		if (!isFlashing) {
			if (this.animationSystem) {
				this.animationSystem.render(renderer, this.x, this.y, this.scale);
			} else {
				renderer.drawRect(this.x, this.y, this.width, this.height, '#ff0000');
			}
		}

		if (this.isBoss || this.maxHp >= 40) {
			const hpBarWidth = this.spriteWidth;
			const hpBarHeight = this.isBoss ? 7 : 5;
			const hpBarY = this.y - (this.isBoss ? 12 : 10);
			
			if (this.isBoss && this.pokemonConfig) {
				const pokemonName = this.pokemonConfig.name || 'Boss';
				renderer.ctx.save();
				renderer.ctx.fillStyle = '#ff0000';
				renderer.ctx.font = 'bold 10px Pokemon';
				renderer.ctx.textAlign = 'left';
				renderer.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
				renderer.ctx.shadowBlur = 2;
				renderer.ctx.fillText(pokemonName.toUpperCase(), this.x, hpBarY - 2);
				renderer.ctx.shadowBlur = 0;
				renderer.ctx.restore();
			}
			
			renderer.drawRect(this.x, hpBarY, hpBarWidth, hpBarHeight, '#333');
			renderer.drawStrokeRect(this.x, hpBarY, hpBarWidth, hpBarHeight, '#000', 1);
			
			const displayedHpPercent = this.displayedHp / this.maxHp;
			if (this.lostHp > 0) {
				renderer.ctx.fillStyle = '#ff6b6b';
				renderer.ctx.fillRect(this.x + 1, hpBarY + 1, (hpBarWidth - 2) * displayedHpPercent, hpBarHeight - 2);
			}
			
			const hpPercent = this.hp / this.maxHp;
			const hpGradient = renderer.ctx.createLinearGradient(this.x, 0, this.x + hpBarWidth * hpPercent, 0);
			if (hpPercent > 0.6) {
				hpGradient.addColorStop(0, '#4af626');
				hpGradient.addColorStop(1, '#2ed616');
			} else if (hpPercent > 0.3) {
				hpGradient.addColorStop(0, '#ffcc00');
				hpGradient.addColorStop(1, '#ff8800');
			} else {
				hpGradient.addColorStop(0, '#ff4444');
				hpGradient.addColorStop(1, '#cc0000');
			}
			renderer.ctx.fillStyle = hpGradient;
			renderer.ctx.fillRect(this.x + 1, hpBarY + 1, (hpBarWidth - 2) * hpPercent, hpBarHeight - 2);
			
			if (!this.isBoss && this.level > 1) {
				renderer.drawText(`Lv.${this.level}`, this.x + hpBarWidth + 5, hpBarY + 4, '10px', '#ffd700', 'left');
			}
		}
	}
}

