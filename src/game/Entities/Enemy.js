export default class Enemy {
	constructor(x, y, type, config, animationSystem, level = 1, particleColor = '#ff0000', pokemonConfig = null, spriteManager = null) {
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

		const BASE_SPEED = 2;
		const baseHp = pokemonConfig?.hp || 20;
		const pokemonSpeedMultiplier = pokemonConfig?.enemySpeedMultiplier ?? pokemonConfig?.speedMultiplier ?? 1;
		const baseDamage = pokemonConfig?.damage || 5;
		const baseProjectileSpeed = pokemonConfig?.projectileSpeed || 0.4;

		const hpMultiplier = config.hpMultiplier || 1.0;
		const speedMultiplier = config.speedMultiplier || 1.0;
		const damageMultiplier = config.damageMultiplier || 1.0;
		const projectileSpeedMultiplier = config.projectileSpeedMultiplier || 1.0;

		const hpLevelMultiplier = 1 + (level - 1) * 0.35;
		const damageLevelMultiplier = 1 + (level - 1) * 0.3;

		this.hp = Math.floor(baseHp * hpMultiplier * hpLevelMultiplier);
		this.maxHp = this.hp;
		this.displayedHp = this.hp;
		this.lostHp = 0;
		this.lostHpDecaySpeed = 0.5;

		this.pokemonConfig = pokemonConfig;
		this.baseSpeed = BASE_SPEED * pokemonSpeedMultiplier * speedMultiplier * (1 + (level - 1) * 0.05);
		this.speed = this.baseSpeed;
		this.damage = Math.floor(baseDamage * damageMultiplier * damageLevelMultiplier);

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

		this.separationRadius = 60;
		this.separationStrength = 0.15;

		if (this.attackType === 'melee') {
			this.canAnticipate = Math.random() < 0.35;
			this.anticipationTime = this.canAnticipate ? 200 + Math.random() * 300 : 0;
		} else {
			this.canAnticipate = false;
			this.anticipationTime = 0;
		}

		this.statusEffect = null;
		this.effectAnimationTime = 0;
		this.spriteManager = spriteManager;
	}

	applyStatusEffect(effect) {
		this.statusEffect = effect;
		this.effectAnimationTime = 0;
	}

	update(deltaTime, playerX, playerY, collisionSystem = null, playerWidth = 32, playerHeight = 32, otherEnemies = [], playerVelocityX = 0, playerVelocityY = 0) {
		if (!this.isAlive) return;

		if (this.statusEffect) {
			this.statusEffect.duration -= deltaTime;
			this.effectAnimationTime += deltaTime;

			if (this.statusEffect.duration <= 0) {
				this.statusEffect = null;
				this.speed = this.baseSpeed;
			} else {
				if (this.statusEffect.slowAmount !== undefined) {
					this.speed = this.baseSpeed * (1 - this.statusEffect.slowAmount);
				} else {
					this.speed = this.baseSpeed;
				}

				if (this.statusEffect.tickInterval !== Infinity && this.statusEffect.tickTimer >= this.statusEffect.tickInterval) {
					this.hp -= this.statusEffect.damage;
					this.lostHp = this.displayedHp - this.hp;
					this.hitFlashTime = this.hitFlashDuration;
					this.hurtAnimationTime = this.hurtAnimationDuration;
					if (this.animationSystem) {
						this.animationSystem.setAnimation('hurt');
					}
					
					if (this.hp <= 0) {
						this.hp = 0;
						this.displayedHp = 0;
						this.lostHp = 0;
						this.isAlive = false;
					}
					
					this.statusEffect.tickTimer = 0;
				} else if (this.statusEffect.tickInterval !== Infinity) {
					this.statusEffect.tickTimer += deltaTime;
				}

				if (this.statusEffect.stunDuration !== undefined) {
					if (this.statusEffect.stunDuration > 0) {
						this.statusEffect.stunDuration -= deltaTime;
					}
				}
			}
		}

		const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
		const hitboxOffsetY = (this.spriteHeight - this.height) / 2;

		const separationForce = this.calculateSeparation(otherEnemies);

		const knockbackX = this.knockbackVelocityX * deltaTime / 16;
		const knockbackY = this.knockbackVelocityY * deltaTime / 16;

		if (collisionSystem) {
			const newKnockbackX = this.x + knockbackX;
			const newKnockbackY = this.y + knockbackY;

			if (collisionSystem.canMoveTo(newKnockbackX + hitboxOffsetX, this.y + hitboxOffsetY, this.width, this.height)) {
				this.x = newKnockbackX;
			} else {
				this.knockbackVelocityX = 0;
			}

			if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newKnockbackY + hitboxOffsetY, this.width, this.height)) {
				this.y = newKnockbackY;
			} else {
				this.knockbackVelocityY = 0;
			}
		} else {
			this.x += knockbackX;
			this.y += knockbackY;
		}

		this.knockbackVelocityX *= this.knockbackDecay;
		this.knockbackVelocityY *= this.knockbackDecay;

		if (Math.abs(this.knockbackVelocityX) < 0.1) this.knockbackVelocityX = 0;
		if (Math.abs(this.knockbackVelocityY) < 0.1) this.knockbackVelocityY = 0;

		let targetX = playerX;
		let targetY = playerY;

		if (this.attackType === 'melee' && this.canAnticipate && (Math.abs(playerVelocityX) > 0.1 || Math.abs(playerVelocityY) > 0.1)) {
			const playerSpeed = Math.sqrt(playerVelocityX * playerVelocityX + playerVelocityY * playerVelocityY);
			if (playerSpeed > 0.1) {
				const timeToReach = this.anticipationTime / 1000;
				targetX = playerX + playerVelocityX * timeToReach;
				targetY = playerY + playerVelocityY * timeToReach;
			}
		}

		const dx = targetX - this.getCenterX();
		const dy = targetY - this.getCenterY();
		const distance = Math.sqrt(dx * dx + dy * dy);
		const minDistance = (Math.max(this.width, this.height) + Math.max(playerWidth, playerHeight)) / 2 - 5;

		const separationMoveX = separationForce.x * deltaTime / 16;
		const separationMoveY = separationForce.y * deltaTime / 16;

		if (this.attackType === 'range') {
			if (distance > this.attackRange) {
				this.directionX = dx / distance;
				this.directionY = dy / distance;

				const moveX = this.directionX * this.speed * deltaTime / 16 + separationMoveX;
				const moveY = this.directionY * this.speed * deltaTime / 16 + separationMoveY;

				const newX = this.x + moveX;
				const newY = this.y + moveY;

				if (collisionSystem) {
					if (collisionSystem.canMoveTo(newX + hitboxOffsetX, this.y + hitboxOffsetY, this.width, this.height)) {
						this.x = newX;
					}
					if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newY + hitboxOffsetY, this.width, this.height)) {
						this.y = newY;
					}
				} else {
					this.x = newX;
					this.y = newY;
				}
			} else if (distance > 0) {
				this.directionX = dx / distance;
				this.directionY = dy / distance;

				const moveX = separationMoveX;
				const moveY = separationMoveY;

				const newX = this.x + moveX;
				const newY = this.y + moveY;

				if (collisionSystem) {
					if (collisionSystem.canMoveTo(newX + hitboxOffsetX, this.y + hitboxOffsetY, this.width, this.height)) {
						this.x = newX;
					}
					if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newY + hitboxOffsetY, this.width, this.height)) {
						this.y = newY;
					}
				} else {
					this.x = newX;
					this.y = newY;
				}
			}
		} else {
			const stopDistance = Math.max(this.attackRange, minDistance);

			if (distance > stopDistance) {
				this.directionX = dx / distance;
				this.directionY = dy / distance;

				const moveX = this.directionX * this.speed * deltaTime / 16 + separationMoveX;
				const moveY = this.directionY * this.speed * deltaTime / 16 + separationMoveY;

				const newX = this.x + moveX;
				const newY = this.y + moveY;

				const newDx = targetX - (newX + hitboxOffsetX + this.width / 2);
				const newDy = targetY - (newY + hitboxOffsetY + this.height / 2);
				const newDistance = Math.sqrt(newDx * newDx + newDy * newDy);

				if (newDistance >= minDistance) {
					if (collisionSystem) {
						if (collisionSystem.canMoveTo(newX + hitboxOffsetX, this.y + hitboxOffsetY, this.width, this.height)) {
							this.x = newX;
						}
						if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newY + hitboxOffsetY, this.width, this.height)) {
							this.y = newY;
						}
					} else {
						this.x = newX;
						this.y = newY;
					}
				} else {
					const separationOnlyX = this.x + separationMoveX;
					const separationOnlyY = this.y + separationMoveY;

					if (collisionSystem) {
						if (collisionSystem.canMoveTo(separationOnlyX + hitboxOffsetX, this.y + hitboxOffsetY, this.width, this.height)) {
							this.x = separationOnlyX;
						}
						if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, separationOnlyY + hitboxOffsetY, this.width, this.height)) {
							this.y = separationOnlyY;
						}
					} else {
						this.x = separationOnlyX;
						this.y = separationOnlyY;
					}
				}
			} else if (distance > 0) {
				this.directionX = dx / distance;
				this.directionY = dy / distance;

				const moveX = separationMoveX;
				const moveY = separationMoveY;

				const newX = this.x + moveX;
				const newY = this.y + moveY;

				if (collisionSystem) {
					if (collisionSystem.canMoveTo(newX + hitboxOffsetX, this.y + hitboxOffsetY, this.width, this.height)) {
						this.x = newX;
					}
					if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newY + hitboxOffsetY, this.width, this.height)) {
						this.y = newY;
					}
				} else {
					this.x = newX;
					this.y = newY;
				}
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
			this.displayedHp -= hpDiff * 0.08;
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
				const enemy = this;
				this.animationSystem.setAnimation('shoot');
				setTimeout(() => {
					if (enemy.animationSystem && enemy.isAlive) {
						enemy.animationSystem.setAnimation('walk');
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

		return hitboxX < x + width && hitboxX + this.width > x && hitboxY < y + height && hitboxY + this.height > y;
	}

	getCenterX() {
		const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
		return this.x + hitboxOffsetX + this.width / 2;
	}

	getCenterY() {
		const hitboxOffsetY = (this.spriteHeight - this.height) / 2;
		return this.y + hitboxOffsetY + this.height / 2;
	}

	calculateSeparation(otherEnemies) {
		let separationX = 0;
		let separationY = 0;
		const thisCenterX = this.getCenterX();
		const thisCenterY = this.getCenterY();
		let neighborCount = 0;

		for (const other of otherEnemies) {
			if (!other.isAlive || other === this) continue;

			const otherCenterX = other.getCenterX();
			const otherCenterY = other.getCenterY();
			const dx = thisCenterX - otherCenterX;
			const dy = thisCenterY - otherCenterY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance > 0 && distance < this.separationRadius) {
				const normalizedDx = dx / distance;
				const normalizedDy = dy / distance;
				const force = (this.separationRadius - distance) / this.separationRadius;

				separationX += normalizedDx * force;
				separationY += normalizedDy * force;
				neighborCount++;
			}
		}

		if (neighborCount > 0) {
			separationX /= neighborCount;
			separationY /= neighborCount;
		}

		const separationMagnitude = Math.sqrt(separationX * separationX + separationY * separationY);
		if (separationMagnitude > 0) {
			const normalizedSeparationX = separationX / separationMagnitude;
			const normalizedSeparationY = separationY / separationMagnitude;

			return {
				x: normalizedSeparationX * this.separationStrength * this.speed,
				y: normalizedSeparationY * this.separationStrength * this.speed
			};
		}

		return { x: 0, y: 0 };
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

		if (!this.isBoss && this.hp < this.maxHp) {
			const hpBarWidth = 40;
			const hpBarHeight = 8;
			const hpBarX = this.x + (this.spriteWidth - hpBarWidth) / 2;
			const hpBarY = this.y - 4;

			renderer.drawRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight, '#333');
			renderer.drawStrokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight, '#000', 0.5);

			const hpPercent = this.hp / this.maxHp;
			const displayedHpPercent = this.displayedHp / this.maxHp;

			renderer.ctx.fillStyle = '#F74B33';
			renderer.ctx.fillRect(hpBarX + 0.5, hpBarY + 0.5, (hpBarWidth - 1) * hpPercent, hpBarHeight - 1);

			if (displayedHpPercent > hpPercent) {
				renderer.ctx.fillStyle = '#ffd700';
				const tempWidth = (hpBarWidth - 1) * (displayedHpPercent - hpPercent);
				renderer.ctx.fillRect(hpBarX + 0.5 + (hpBarWidth - 1) * hpPercent, hpBarY + 0.5, tempWidth, hpBarHeight - 1);
			}
		}

		if (this.statusEffect && this.spriteManager) {
			const effectType = this.statusEffect.type;
			let effectSprite = null;
			
			if (effectType === 'burn') {
				effectSprite = this.spriteManager.get('fireeffect');
			}
			
			if (effectSprite) {
				const frameWidth = 111 / 7;
				const frameHeight = 17;
				const frameIndex = Math.floor((this.effectAnimationTime / 100) % 7);
				const sourceX = frameIndex * frameWidth;
				const centerX = this.getCenterX();
				const centerY = this.getCenterY();
				const effectY = centerY - this.spriteHeight / 2 - 20;
				const effectSize = 30;

				renderer.ctx.save();
				renderer.ctx.imageSmoothingEnabled = false;
				renderer.ctx.drawImage(
					effectSprite,
					sourceX,
					0,
					frameWidth,
					frameHeight,
					centerX - effectSize / 2,
					effectY - effectSize / 2,
					effectSize,
					effectSize
				);
				renderer.ctx.restore();
			} else if (this.statusEffect) {
				const centerX = this.getCenterX();
				const centerY = this.getCenterY();
				const effectY = centerY - this.spriteHeight / 2 - 20;
				const effectSize = 20;
				
				renderer.ctx.save();
				
				if (effectType === 'poison') {
					renderer.ctx.fillStyle = 'rgba(150, 0, 255, 0.7)';
					renderer.ctx.beginPath();
					renderer.ctx.arc(centerX, effectY, effectSize / 2, 0, Math.PI * 2);
					renderer.ctx.fill();
					
					for (let i = 0; i < 3; i++) {
						const angle = (this.effectAnimationTime * 0.01 + i * Math.PI * 2 / 3) % (Math.PI * 2);
						const offsetX = Math.cos(angle) * (effectSize / 3);
						const offsetY = Math.sin(angle) * (effectSize / 3);
						renderer.ctx.fillStyle = 'rgba(200, 0, 255, 0.9)';
						renderer.ctx.beginPath();
						renderer.ctx.arc(centerX + offsetX, effectY + offsetY, 3, 0, Math.PI * 2);
						renderer.ctx.fill();
					}
				} else if (effectType === 'stun') {
					renderer.ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
					renderer.ctx.lineWidth = 3;
					renderer.ctx.setLineDash([5, 5]);
					renderer.ctx.beginPath();
					renderer.ctx.arc(centerX, effectY, effectSize / 2, 0, Math.PI * 2);
					renderer.ctx.stroke();
					renderer.ctx.setLineDash([]);
				} else if (effectType === 'slow' || effectType === 'wet' || effectType === 'freeze') {
					renderer.ctx.fillStyle = effectType === 'freeze' ? 'rgba(150, 200, 255, 0.7)' : 
					                        effectType === 'wet' ? 'rgba(100, 150, 255, 0.7)' : 
					                        'rgba(200, 200, 200, 0.7)';
					renderer.ctx.beginPath();
					renderer.ctx.arc(centerX, effectY, effectSize / 2, 0, Math.PI * 2);
					renderer.ctx.fill();
				}
				
				renderer.ctx.restore();
			}
		}
	}
}
