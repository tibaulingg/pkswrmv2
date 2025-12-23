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
		
		const BASE_SPEED = 1.8;
		
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
		this.lostHpDecaySpeed = 0.2;
		this.pokemonConfig = pokemonConfig;
		this.speed = BASE_SPEED * pokemonSpeedMultiplier * speedMultiplier * (1 + (level - 1) * 0.05);
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
		
		this.baseSeparationRadius = 60;
		this.baseSeparationStrength = 0.15;
		this.separationRadius = this.baseSeparationRadius;
		this.separationStrength = this.baseSeparationStrength;
		
		this.playerHistory = [];
		this.maxHistoryLength = 10;
		this.predictionTime = 300;
		this.baseInterceptionFactor = 0.75;
		this.interceptionFactor = this.baseInterceptionFactor;
		this.flankingFactor = 0.45;
		this.lastPlayerX = null;
		this.lastPlayerY = null;
		this.strategyTimer = 0;
		this.currentStrategy = 'intercept';
		this.speedBoostTimer = 0;
		this.speedBoostDuration = 0;
		this.baseSpeed = this.speed;
		
		this.role = 'chasseur';
		this.roleTimer = 0;
		this.roleChangeInterval = 3000 + Math.random() * 2000;
		this.enemyIndex = 0;
		
		this.kitingPunishmentActive = false;
		this.kitingPunishmentTimer = 0;
		this.kitingPunishmentDuration = 0;
		this.kitingDistanceThreshold = 250;
		this.kitingTimeThreshold = 1500;
		this.kitingTimeAccumulator = 0;
		this.baseAttackRange = this.attackRange;
		
		this.aggressiveInterceptionActive = false;
		this.aggressiveInterceptionTimer = 0;
		this.aggressiveInterceptionDuration = 300 + Math.random() * 200;
	}

	update(deltaTime, playerX, playerY, collisionSystem = null, playerWidth = 32, playerHeight = 32, otherEnemies = [], playerVelocityX = 0, playerVelocityY = 0) {
		if (!this.isAlive) return;

		const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
		const hitboxOffsetY = (this.spriteHeight - this.height) / 2;
		
		this.updateRole(deltaTime, otherEnemies);
		this.updateKitingPunishment(deltaTime, playerX, playerY, otherEnemies);
		this.updateDynamicSeparation(playerX, playerY);
		this.updateAggressiveInterception(deltaTime, playerX, playerY);
		
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

		if (this.lastPlayerX !== null && this.lastPlayerY !== null) {
			this.playerHistory.push({
				x: playerX,
				y: playerY,
				time: Date.now()
			});
			
			if (this.playerHistory.length > this.maxHistoryLength) {
				this.playerHistory.shift();
			}
		}
		
		this.lastPlayerX = playerX;
		this.lastPlayerY = playerY;
		
		this.strategyTimer += deltaTime;
		if (this.strategyTimer > 2000 + Math.random() * 2000) {
			const playerSpeed = Math.sqrt(playerVelocityX * playerVelocityX + playerVelocityY * playerVelocityY);
			let strategies = ['intercept', 'flank', 'direct'];
			
			if (this.role === 'chasseur') {
				strategies = ['intercept', 'intercept', 'flank'];
			} else if (this.role === 'bloqueur') {
				strategies = ['intercept', 'direct', 'direct'];
			} else {
				strategies = ['flank', 'direct', 'direct'];
			}
			
			if (playerSpeed > 0.5 && this.playerHistory.length >= 3) {
				const recentHistory = this.playerHistory.slice(-3);
				let isMovingStraight = true;
				for (let i = 1; i < recentHistory.length; i++) {
					const prev = recentHistory[i - 1];
					const curr = recentHistory[i];
					const dx1 = curr.x - prev.x;
					const dy1 = curr.y - prev.y;
					const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
					
					if (i < recentHistory.length - 1) {
						const next = recentHistory[i + 1];
						const dx2 = next.x - curr.x;
						const dy2 = next.y - curr.y;
						const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
						
						if (dist1 > 0.1 && dist2 > 0.1) {
							const dir1X = dx1 / dist1;
							const dir1Y = dy1 / dist1;
							const dir2X = dx2 / dist2;
							const dir2Y = dy2 / dist2;
							const dot = dir1X * dir2X + dir1Y * dir2Y;
							
							if (dot < 0.8) {
								isMovingStraight = false;
								break;
							}
						}
					}
				}
				
				if (isMovingStraight && this.role === 'chasseur') {
					strategies = ['intercept', 'intercept', 'intercept'];
				}
			}
			
			this.currentStrategy = strategies[Math.floor(Math.random() * strategies.length)];
			this.strategyTimer = 0;
		}
		
		const targetPos = this.calculateTargetPositionByRole(playerX, playerY, playerVelocityX, playerVelocityY, otherEnemies);
		
		const dx = targetPos.x - this.getCenterX();
		const dy = targetPos.y - this.getCenterY();
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		this.speedBoostTimer += deltaTime;
		if (this.speedBoostTimer >= this.speedBoostDuration) {
			if (Math.random() < 0.35 && distance > 150) {
				this.speedBoostDuration = 1000 + Math.random() * 500;
				this.speedBoostTimer = 0;
				this.speed = this.baseSpeed * (1.35 + Math.random() * 0.1);
			} else {
				this.speed = this.baseSpeed;
			}
		}
		
		let minDistance;
		if (this.attackType === 'melee') {
			minDistance = Math.max(0, this.attackRange - 5);
		} else {
			minDistance = (Math.max(this.width, this.height) + Math.max(playerWidth, playerHeight)) / 2 + 10;
		}

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
				} else {
					this.x = newX;
				}
				
				if (collisionSystem) {
					if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newY + hitboxOffsetY, this.width, this.height)) {
						this.y = newY;
					}
				} else {
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
				} else {
					this.x = newX;
				}
				
				if (collisionSystem) {
					if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newY + hitboxOffsetY, this.width, this.height)) {
						this.y = newY;
					}
				} else {
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
				
				if (collisionSystem) {
					if (collisionSystem.canMoveTo(newX + hitboxOffsetX, this.y + hitboxOffsetY, this.width, this.height)) {
						this.x = newX;
					}
				} else {
					this.x = newX;
				}
				
				if (collisionSystem) {
					if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newY + hitboxOffsetY, this.width, this.height)) {
						this.y = newY;
					}
				} else {
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
				} else {
					this.x = newX;
				}
				
				if (collisionSystem) {
					if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newY + hitboxOffsetY, this.width, this.height)) {
						this.y = newY;
					}
				} else {
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
			this.displayedHp -= hpDiff * 0.03;
		} else {
			this.displayedHp = this.hp;
		}

		if (this.lostHp > 0) {
			this.lostHp -= this.lostHpDecaySpeed * deltaTime * 0.001 * this.maxHp;
			if (this.lostHp < 0) this.lostHp = 0;
		}
	}

	calculateTargetPosition(playerX, playerY, playerVelocityX, playerVelocityY) {
		const enemyCenterX = this.getCenterX();
		const enemyCenterY = this.getCenterY();
		
		let targetX = playerX;
		let targetY = playerY;
		
		let predictedVelocityX = playerVelocityX;
		let predictedVelocityY = playerVelocityY;
		let velocityConfidence = 0.5;
		
		if (this.playerHistory.length >= 3) {
			const recentHistory = this.playerHistory.slice(-3);
			let avgVelX = 0;
			let avgVelY = 0;
			let totalTime = 0;
			
			for (let i = 1; i < recentHistory.length; i++) {
				const prev = recentHistory[i - 1];
				const curr = recentHistory[i];
				const dt = (curr.time - prev.time) / 16;
				
				if (dt > 0 && dt < 100) {
					const velX = (curr.x - prev.x) / dt;
					const velY = (curr.y - prev.y) / dt;
					avgVelX += velX;
					avgVelY += velY;
					totalTime += dt;
				}
			}
			
			if (totalTime > 0) {
				avgVelX /= (recentHistory.length - 1);
				avgVelY /= (recentHistory.length - 1);
				
				const currentSpeed = Math.sqrt(playerVelocityX * playerVelocityX + playerVelocityY * playerVelocityY);
				const avgSpeed = Math.sqrt(avgVelX * avgVelX + avgVelY * avgVelY);
				
				if (avgSpeed > 0.01) {
					const speedDiff = Math.abs(currentSpeed - avgSpeed) / Math.max(currentSpeed, avgSpeed);
					const directionDiff = Math.abs(
						(playerVelocityX * avgVelX + playerVelocityY * avgVelY) / (currentSpeed * avgSpeed)
					);
					
					if (speedDiff < 0.3 && directionDiff > 0.85) {
						velocityConfidence = 0.9;
						predictedVelocityX = avgVelX;
						predictedVelocityY = avgVelY;
					} else {
						predictedVelocityX = playerVelocityX * 0.7 + avgVelX * 0.3;
						predictedVelocityY = playerVelocityY * 0.7 + avgVelY * 0.3;
						velocityConfidence = 0.7;
					}
				}
			}
		}
		
		const playerSpeed = Math.sqrt(predictedVelocityX * predictedVelocityX + predictedVelocityY * predictedVelocityY);
		
		if (this.currentStrategy === 'intercept') {
			if (playerSpeed > 0.01) {
				const dx = playerX - enemyCenterX;
				const dy = playerY - enemyCenterY;
				const distance = Math.sqrt(dx * dx + dy * dy);
				
				if (distance > 0) {
					const enemySpeed = this.speed * 16;
					const relativeSpeedX = predictedVelocityX;
					const relativeSpeedY = predictedVelocityY;
					
					const a = relativeSpeedX * relativeSpeedX + relativeSpeedY * relativeSpeedY - enemySpeed * enemySpeed;
					const b = 2 * (dx * relativeSpeedX + dy * relativeSpeedY);
					const c = dx * dx + dy * dy;
					
					const discriminant = b * b - 4 * a * c;
					
					if (discriminant >= 0 && Math.abs(a) > 0.001) {
						const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
						const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
						const t = Math.max(t1, t2);
						
						if (t > 0 && t < 8) {
							const predictionTime = t * (0.7 + velocityConfidence * 0.3);
							const predictedX = playerX + predictedVelocityX * predictionTime;
							const predictedY = playerY + predictedVelocityY * predictionTime;
							
							const effectiveInterceptionFactor = this.interceptionFactor * (0.7 + velocityConfidence * 0.3);
							targetX = playerX * (1 - effectiveInterceptionFactor) + predictedX * effectiveInterceptionFactor;
							targetY = playerY * (1 - effectiveInterceptionFactor) + predictedY * effectiveInterceptionFactor;
						}
					} else {
						const timeToReach = distance / enemySpeed;
						const predictionTime = timeToReach * (0.7 + velocityConfidence * 0.3);
						const predictedX = playerX + predictedVelocityX * predictionTime;
						const predictedY = playerY + predictedVelocityY * predictionTime;
						
						const effectiveInterceptionFactor = this.interceptionFactor * (0.6 + velocityConfidence * 0.2);
						targetX = playerX * (1 - effectiveInterceptionFactor) + predictedX * effectiveInterceptionFactor;
						targetY = playerY * (1 - effectiveInterceptionFactor) + predictedY * effectiveInterceptionFactor;
					}
				}
			}
		} else if (this.currentStrategy === 'flank') {
			const dx = playerX - enemyCenterX;
			const dy = playerY - enemyCenterY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			if (distance > 0 && playerSpeed > 0.01) {
				const playerDirX = predictedVelocityX / playerSpeed;
				const playerDirY = predictedVelocityY / playerSpeed;
				
				const perpX = -playerDirY;
				const perpY = playerDirX;
				
				const flankOffset = 120 + Math.random() * 60;
				const flankX = playerX + perpX * flankOffset;
				const flankY = playerY + perpY * flankOffset;
				
				const futureTime = 0.7 + velocityConfidence * 0.3;
				const futurePlayerX = playerX + predictedVelocityX * futureTime;
				const futurePlayerY = playerY + predictedVelocityY * futureTime;
				
				targetX = futurePlayerX * (1 - this.flankingFactor) + flankX * this.flankingFactor;
				targetY = futurePlayerY * (1 - this.flankingFactor) + flankY * this.flankingFactor;
			}
		} else {
			if (playerSpeed > 0.01) {
				const futureTime = 0.5 + velocityConfidence * 0.4;
				targetX = playerX + predictedVelocityX * futureTime;
				targetY = playerY + predictedVelocityY * futureTime;
			}
		}
		
		return { x: targetX, y: targetY };
	}

	calculateTargetPositionByRole(playerX, playerY, playerVelocityX, playerVelocityY, otherEnemies) {
		if (this.role === 'chasseur') {
			return this.calculateTargetPosition(playerX, playerY, playerVelocityX, playerVelocityY);
		} else if (this.role === 'bloqueur') {
			return this.calculateBlockerTarget(playerX, playerY, playerVelocityX, playerVelocityY);
		} else {
			return this.calculateZoneTarget(playerX, playerY, playerVelocityX, playerVelocityY, otherEnemies);
		}
	}

	calculateBlockerTarget(playerX, playerY, playerVelocityX, playerVelocityY) {
		const enemyCenterX = this.getCenterX();
		const enemyCenterY = this.getCenterY();
		
		const playerSpeed = Math.sqrt(playerVelocityX * playerVelocityX + playerVelocityY * playerVelocityY);
		
		if (playerSpeed > 0.01) {
			const dx = playerX - enemyCenterX;
			const dy = playerY - enemyCenterY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			const playerDirX = playerVelocityX / playerSpeed;
			const playerDirY = playerVelocityY / playerSpeed;
			
			const lookAheadTime = Math.min(1.5, distance / (this.speed * 16));
			const futurePlayerX = playerX + playerVelocityX * lookAheadTime;
			const futurePlayerY = playerY + playerVelocityY * lookAheadTime;
			
			const interceptDistance = 80 + Math.random() * 40;
			const interceptX = futurePlayerX - playerDirX * interceptDistance;
			const interceptY = futurePlayerY - playerDirY * interceptDistance;
			
			return { x: interceptX, y: interceptY };
		}
		
		return { x: playerX, y: playerY };
	}

	calculateZoneTarget(playerX, playerY, playerVelocityX, playerVelocityY, otherEnemies) {
		const enemyCenterX = this.getCenterX();
		const enemyCenterY = this.getCenterY();
		
		const dx = playerX - enemyCenterX;
		const dy = playerY - enemyCenterY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		const playerSpeed = Math.sqrt(playerVelocityX * playerVelocityX + playerVelocityY * playerVelocityY);
		
		if (playerSpeed > 0.01 && distance > 150) {
			const playerDirX = playerVelocityX / playerSpeed;
			const playerDirY = playerVelocityY / playerSpeed;
			
			const behindOffset = 120 + Math.random() * 80;
			const behindX = playerX - playerDirX * behindOffset;
			const behindY = playerY - playerDirY * behindOffset;
			
			const aliveEnemies = otherEnemies.filter(e => e.isAlive && e !== this);
			let avgX = behindX;
			let avgY = behindY;
			let count = 1;
			
			for (const enemy of aliveEnemies) {
				if (enemy.role === 'zone') {
					avgX += enemy.getCenterX();
					avgY += enemy.getCenterY();
					count++;
				}
			}
			
			avgX /= count;
			avgY /= count;
			
			const spreadAngle = (Math.PI * 2 / Math.max(1, aliveEnemies.filter(e => e.role === 'zone').length + 1)) * 
				(aliveEnemies.filter(e => e.isAlive && e !== this && e.role === 'zone').length);
			const spreadRadius = 60 + Math.random() * 40;
			const spreadX = avgX + Math.cos(spreadAngle) * spreadRadius;
			const spreadY = avgY + Math.sin(spreadAngle) * spreadRadius;
			
			return { x: spreadX, y: spreadY };
		}
		
		return { x: playerX, y: playerY };
	}

	updateRole(deltaTime, otherEnemies) {
		this.roleTimer += deltaTime;
		if (this.roleTimer >= this.roleChangeInterval) {
			const aliveEnemies = otherEnemies.filter(e => e.isAlive);
			const myIndex = aliveEnemies.findIndex(e => e === this);
			
			if (myIndex >= 0) {
				const roleIndex = myIndex % 3;
				const roles = ['chasseur', 'bloqueur', 'zone'];
				this.role = roles[roleIndex];
			} else {
				this.role = ['chasseur', 'bloqueur', 'zone'][Math.floor(Math.random() * 3)];
			}
			
			this.roleTimer = 0;
			this.roleChangeInterval = 3000 + Math.random() * 2000;
		}
	}

	updateKitingPunishment(deltaTime, playerX, playerY, otherEnemies) {
		const enemyCenterX = this.getCenterX();
		const enemyCenterY = this.getCenterY();
		const dx = playerX - enemyCenterX;
		const dy = playerY - enemyCenterY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		const aliveEnemies = otherEnemies.filter(e => e.isAlive);
		if (aliveEnemies.length === 0) {
			this.kitingTimeAccumulator = 0;
			return;
		}
		
		let avgDistance = distance;
		let count = 1;
		for (const enemy of aliveEnemies) {
			const edx = playerX - enemy.getCenterX();
			const edy = playerY - enemy.getCenterY();
			const edist = Math.sqrt(edx * edx + edy * edy);
			avgDistance += edist;
			count++;
		}
		avgDistance /= count;
		
		if (avgDistance > this.kitingDistanceThreshold) {
			this.kitingTimeAccumulator += deltaTime;
			if (this.kitingTimeAccumulator >= this.kitingTimeThreshold) {
				if (!this.kitingPunishmentActive) {
					this.kitingPunishmentActive = true;
					this.kitingPunishmentDuration = 2000 + Math.random() * 1000;
					this.kitingPunishmentTimer = 0;
					
					if (Math.random() < 0.6) {
						this.speed = this.baseSpeed * (1.2 + Math.random() * 0.15);
					} else {
						this.attackRange = this.baseAttackRange * 1.2;
					}
				}
			}
		} else {
			this.kitingTimeAccumulator = Math.max(0, this.kitingTimeAccumulator - deltaTime * 2);
			if (this.kitingPunishmentActive && avgDistance < this.kitingDistanceThreshold * 0.8) {
				this.kitingPunishmentActive = false;
				this.kitingPunishmentTimer = 0;
				this.speed = this.baseSpeed;
				this.attackRange = this.baseAttackRange;
			}
		}
		
		if (this.kitingPunishmentActive) {
			this.kitingPunishmentTimer += deltaTime;
			if (this.kitingPunishmentTimer >= this.kitingPunishmentDuration) {
				this.kitingPunishmentActive = false;
				this.kitingPunishmentTimer = 0;
				this.speed = this.baseSpeed;
				this.attackRange = this.baseAttackRange;
			}
		}
	}

	updateDynamicSeparation(playerX, playerY) {
		const enemyCenterX = this.getCenterX();
		const enemyCenterY = this.getCenterY();
		const dx = playerX - enemyCenterX;
		const dy = playerY - enemyCenterY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		if (distance > 200) {
			const factor = Math.min(1.5, 1 + (distance - 200) / 300);
			this.separationRadius = this.baseSeparationRadius * factor;
			this.separationStrength = this.baseSeparationStrength * factor;
		} else {
			this.separationRadius = this.baseSeparationRadius;
			this.separationStrength = this.baseSeparationStrength;
		}
	}

	updateAggressiveInterception(deltaTime, playerX, playerY) {
		const enemyCenterX = this.getCenterX();
		const enemyCenterY = this.getCenterY();
		const dx = playerX - enemyCenterX;
		const dy = playerY - enemyCenterY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		if (distance > 200) {
			if (!this.aggressiveInterceptionActive) {
				this.aggressiveInterceptionActive = true;
				this.aggressiveInterceptionTimer = 0;
				this.aggressiveInterceptionDuration = 300 + Math.random() * 200;
				this.interceptionFactor = 1.0;
			}
		}
		
		if (this.aggressiveInterceptionActive) {
			this.aggressiveInterceptionTimer += deltaTime;
			if (this.aggressiveInterceptionTimer >= this.aggressiveInterceptionDuration || distance <= 200) {
				this.aggressiveInterceptionActive = false;
				this.aggressiveInterceptionTimer = 0;
				this.interceptionFactor = this.baseInterceptionFactor;
			}
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
		
		if (this.kitingPunishmentActive) {
			this.kitingPunishmentActive = false;
			this.kitingPunishmentTimer = 0;
			this.speed = this.baseSpeed;
			this.attackRange = this.baseAttackRange;
		}
		
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

	collidesWithPlayer(newX, newY, playerX, playerY, playerWidth, playerHeight, allowPenetration = false) {
		const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
		const hitboxOffsetY = (this.spriteHeight - this.height) / 2;
		const enemyHitboxX = newX + hitboxOffsetX;
		const enemyHitboxY = newY + hitboxOffsetY;
		
		const playerHitboxX = playerX - playerWidth / 2;
		const playerHitboxY = playerY - playerHeight / 2;
		
		const collides = enemyHitboxX < playerHitboxX + playerWidth &&
			   enemyHitboxX + this.width > playerHitboxX &&
			   enemyHitboxY < playerHitboxY + playerHeight &&
			   enemyHitboxY + this.height > playerHitboxY;
		
		if (!collides) return false;
		
		if (allowPenetration) {
			const overlapX = Math.min(enemyHitboxX + this.width - playerHitboxX, playerHitboxX + playerWidth - enemyHitboxX);
			const overlapY = Math.min(enemyHitboxY + this.height - playerHitboxY, playerHitboxY + playerHeight - enemyHitboxY);
			const maxOverlap = Math.max(overlapX, overlapY);
			return maxOverlap > 8;
		}
		
		return true;
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
				
				let roleMultiplier = 1.0;
				if (this.role === 'zone' && other.role === 'zone') {
					roleMultiplier = 1.3;
				} else if (this.role === 'bloqueur' && other.role === 'bloqueur') {
					roleMultiplier = 1.2;
				}
				
				separationX += normalizedDx * force * roleMultiplier;
				separationY += normalizedDy * force * roleMultiplier;
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
			
			const displayedHpPercent = this.displayedHp / this.maxHp;
			if (this.lostHp > 0) {
				renderer.ctx.fillStyle = '#ff6b6b';
				renderer.ctx.fillRect(hpBarX + 0.5, hpBarY + 0.5, (hpBarWidth - 1) * displayedHpPercent, hpBarHeight - 1);
			}
			
			const hpPercent = this.hp / this.maxHp;
			if (hpPercent > 0.5) {
				renderer.ctx.fillStyle = '#30B72C';
			} else if (hpPercent > 0.25) {
				renderer.ctx.fillStyle = '#F9C152';
			} else {
				renderer.ctx.fillStyle = '#F74B33';
			}
			renderer.ctx.fillRect(hpBarX + 0.5, hpBarY + 0.5, (hpBarWidth - 1) * hpPercent, hpBarHeight - 1);
		}
	}
}

