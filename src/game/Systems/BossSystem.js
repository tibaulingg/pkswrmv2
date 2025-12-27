import Projectile from '../Entities/Projectile.js';
import { BOSS_CONFIG } from '../Config/BossConfig.js';

export default class BossSystem {
	constructor(engine = null) {
		this.chargingBosses = new Map();
		this.specialAttackBosses = new Map();
		this.engine = engine;
	}
	
	isRhydon(enemy) {
		return enemy.pokemonConfig && enemy.pokemonConfig.name === 'rhydon';
	}

	startattack(enemy, targetX, targetY, attackDuration = BOSS_CONFIG.PROJECTILE.attack_DURATION) {
		if (!enemy.isBoss || !enemy.isAlive) return;

		if (this.chargingBosses.has(enemy)) {
			return;
		}

		this.chargingBosses.set(enemy, {
			enemy: enemy,
			targetX: targetX,
			targetY: targetY,
			attackTime: 0,
			attackDuration: attackDuration,
			isCharging: true,
			hasShot: false
		});
	}

	startSpecialAttack(enemy) {
		if (!enemy.isBoss || !enemy.isAlive) return;

		if (this.specialAttackBosses.has(enemy)) return;

		const isEarthquake = this.isRhydon(enemy);

		if (enemy.animationSystem) {
			if (enemy.animationSystem.spriteConfig && enemy.animationSystem.spriteConfig.animations && enemy.animationSystem.spriteConfig.animations['shock']) {
				if (enemy.animationSystem.hasMultipleSprites() && enemy.animationSystem.spriteImages && enemy.animationSystem.spriteImages['shock']) {
					enemy.animationSystem.setAnimation('shock');
				} else if (enemy.animationSystem.spriteConfig.animations['attack'] && enemy.animationSystem.hasMultipleSprites() && enemy.animationSystem.spriteImages && enemy.animationSystem.spriteImages['attack']) {
					enemy.animationSystem.setAnimation('attack');
				}
			} else if (enemy.animationSystem.spriteConfig && enemy.animationSystem.spriteConfig.animations && enemy.animationSystem.spriteConfig.animations['attack']) {
				if (enemy.animationSystem.hasMultipleSprites() && enemy.animationSystem.spriteImages && enemy.animationSystem.spriteImages['attack']) {
					enemy.animationSystem.setAnimation('attack');
				}
			}
		}

		// Jouer le son earthquake pour rhydon
		if (isEarthquake && this.engine && this.engine.audio) {
			this.engine.audio.play('earthquake', 0.5, 0.2);
		}

		this.specialAttackBosses.set(enemy, {
			enemy: enemy,
			attackTime: 0,
			attackDuration: BOSS_CONFIG.SPECIAL_ATTACK.attack_DURATION,
			isCharging: true,
			hasExploded: false,
			shockAnimationTime: 0,
			shockAnimationDuration: BOSS_CONFIG.SPECIAL_ATTACK.SHOCK_ANIMATION_DURATION,
			isEarthquake: isEarthquake
		});
	}

	isCharging(enemy) {
		if (!enemy.isBoss) return false;
		return this.chargingBosses.has(enemy) && this.chargingBosses.get(enemy).isCharging;
	}

	isSpecialAttacking(enemy) {
		if (!enemy.isBoss) return false;
		const data = this.specialAttackBosses.get(enemy);
		return data && data.isCharging;
	}

	update(deltaTime, enemyProjectiles, player) {
		for (const [enemy, attackData] of this.chargingBosses.entries()) {
			if (!attackData.enemy.isAlive) {
				this.chargingBosses.delete(enemy);
				continue;
			}

			attackData.attackTime += deltaTime;

			if (attackData.attackTime >= attackData.attackDuration && !attackData.hasShot) {
				attackData.isCharging = false;
				const currentPlayerX = player.getCenterX();
				const currentPlayerY = player.getCenterY();
				this.attack(attackData.enemy, currentPlayerX, currentPlayerY, enemyProjectiles);
				attackData.hasShot = true;
				this.chargingBosses.delete(enemy);
			}
		}

		for (const [enemy, specialData] of this.specialAttackBosses.entries()) {
			if (!specialData.enemy.isAlive) {
				this.specialAttackBosses.delete(enemy);
				continue;
			}

			if (enemy.animationSystem && specialData.isCharging) {
				if (enemy.animationSystem.spriteConfig && enemy.animationSystem.spriteConfig.animations && enemy.animationSystem.spriteConfig.animations['shock']) {
					if (enemy.animationSystem.hasMultipleSprites() && enemy.animationSystem.spriteImages && enemy.animationSystem.spriteImages['shock']) {
						if (enemy.animationSystem.currentAnimation !== 'shock') {
							enemy.animationSystem.setAnimation('shock');
						}
					} else if (enemy.animationSystem.spriteConfig.animations['attack'] && enemy.animationSystem.hasMultipleSprites() && enemy.animationSystem.spriteImages && enemy.animationSystem.spriteImages['attack']) {
						if (enemy.animationSystem.currentAnimation !== 'attack') {
							enemy.animationSystem.setAnimation('attack');
						}
					}
				} else if (enemy.animationSystem.spriteConfig && enemy.animationSystem.spriteConfig.animations && enemy.animationSystem.spriteConfig.animations['attack']) {
					if (enemy.animationSystem.hasMultipleSprites() && enemy.animationSystem.spriteImages && enemy.animationSystem.spriteImages['attack']) {
						if (enemy.animationSystem.currentAnimation !== 'attack') {
							enemy.animationSystem.setAnimation('attack');
						}
					}
				}
			}

			specialData.attackTime += deltaTime;

			if (specialData.attackTime >= specialData.attackDuration && !specialData.hasExploded) {
				specialData.isCharging = false;
				specialData.hasExploded = true;
				
				const explosionResult = this.explode(specialData.enemy, player);
				
				if (explosionResult) {
					return {
						damage: explosionResult.damage,
						enemy: enemy
					};
				}
			}
			
			if (specialData.hasExploded) {
				specialData.shockAnimationTime += deltaTime;
				
				if (specialData.shockAnimationTime >= specialData.shockAnimationDuration) {
					if (enemy.animationSystem) {
						enemy.animationSystem.setAnimation('walk');
					}
					this.specialAttackBosses.delete(enemy);
				}
			}
		}
		
		return null;
	}

	attack(enemy, targetX, targetY, enemyProjectiles) {
		if (!enemy.isBoss || !enemy.isAlive) return null;

		const startX = enemy.getCenterX();
		const startY = enemy.getCenterY();

		const projectile = new Projectile(
			startX,
			startY,
			targetX,
			targetY,
			enemy.damage,
			BOSS_CONFIG.PROJECTILE.SPEED,
			BOSS_CONFIG.PROJECTILE.MAX_DISTANCE,
			BOSS_CONFIG.PROJECTILE.COLOR,
			BOSS_CONFIG.PROJECTILE.SIZE,
			0,
			0,
			0,
			true,
			false,
			false,
			0,
			0,
			300,
			'normal',
			0.2,
			false,
			0,
			1,
			1,
			1,
			'normal',
			0,
			1.5
		);

		projectile.sourceEnemy = enemy;
		projectile.isBossProjectile = true;
		enemyProjectiles.push(projectile);

		return projectile;
	}

	explode(enemy, player) {
		if (!enemy.isBoss || !enemy.isAlive) return null;

		const centerX = enemy.getCenterX();
		const centerY = enemy.getCenterY();
		const explosionRadius = BOSS_CONFIG.SPECIAL_ATTACK.EXPLOSION_RADIUS;
		const explosionDamage = enemy.damage * BOSS_CONFIG.SPECIAL_ATTACK.EXPLOSION_DAMAGE_MULTIPLIER;

		const playerCenterX = player.getCenterX();
		const playerCenterY = player.getCenterY();
		const dx = playerCenterX - centerX;
		const dy = playerCenterY - centerY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance <= explosionRadius) {
			const playerHitboxX = player.getHitboxX();
			const playerHitboxY = player.getHitboxY();
			const playerHitboxWidth = player.width;
			const playerHitboxHeight = player.height;

			const playerCenterHitboxX = playerHitboxX + playerHitboxWidth / 2;
			const playerCenterHitboxY = playerHitboxY + playerHitboxHeight / 2;
			const hitboxDx = playerCenterHitboxX - centerX;
			const hitboxDy = playerCenterHitboxY - centerY;
			const hitboxDistance = Math.sqrt(hitboxDx * hitboxDx + hitboxDy * hitboxDy);

			if (hitboxDistance <= explosionRadius) {
				return {
					damage: explosionDamage,
					centerX: centerX,
					centerY: centerY,
					radius: explosionRadius
				};
			}
		}

		return null;
	}

	render(renderer) {

		for (const specialData of this.specialAttackBosses.values()) {
			if (!specialData.enemy.isAlive) continue;
			
			if (!specialData.isCharging && !specialData.hasExploded) continue;

			const enemy = specialData.enemy;
			const centerX = enemy.getCenterX();
			const centerY = enemy.getCenterY();
			
			let progress, intensity;
			if (specialData.hasExploded) {
				progress = Math.min(specialData.shockAnimationTime / specialData.shockAnimationDuration, 1);
				intensity = 1 - progress;
			} else {
				progress = Math.min(specialData.attackTime / specialData.attackDuration, 1);
				intensity = Math.sin(progress * Math.PI);
			}

			renderer.ctx.save();

			const isEarthquake = specialData.isEarthquake || this.isRhydon(enemy);
			const bossAuraRadius = Math.max(enemy.spriteWidth, enemy.spriteHeight) * 0.8;
			const auraPulse = Math.sin(specialData.attackTime / 100) * 0.2 + 0.8;
			const auraAlpha = 0.4 + intensity * 0.3;

			// Couleurs différentes pour tremblement de terre (brun/terre) vs électrique (rouge/jaune)
			if (isEarthquake) {
				// Tremblement de terre - couleurs brunes/terre
				const auraGradient = renderer.ctx.createRadialGradient(
					centerX, centerY, 0,
					centerX, centerY, bossAuraRadius * auraPulse
				);
				auraGradient.addColorStop(0, `rgba(139, 69, 19, ${auraAlpha * 0.9})`);
				auraGradient.addColorStop(0.3, `rgba(160, 82, 45, ${auraAlpha * 0.7})`);
				auraGradient.addColorStop(0.6, `rgba(139, 69, 19, ${auraAlpha * 0.4})`);
				auraGradient.addColorStop(1, `rgba(139, 69, 19, 0)`);

				renderer.ctx.fillStyle = auraGradient;
				renderer.ctx.beginPath();
				renderer.ctx.arc(centerX, centerY, bossAuraRadius * auraPulse, 0, Math.PI * 2);
				renderer.ctx.fill();

				renderer.ctx.strokeStyle = `rgba(101, 67, 33, ${auraAlpha * 0.8})`;
				renderer.ctx.lineWidth = 6 + intensity * 3;
				renderer.ctx.shadowBlur = 25;
				renderer.ctx.shadowColor = 'rgba(139, 69, 19, 0.9)';
				renderer.ctx.beginPath();
				renderer.ctx.arc(centerX, centerY, bossAuraRadius * auraPulse, 0, Math.PI * 2);
				renderer.ctx.stroke();
			} else {
				// Attaque électrique - couleurs rouges/jaunes
				const auraGradient = renderer.ctx.createRadialGradient(
					centerX, centerY, 0,
					centerX, centerY, bossAuraRadius * auraPulse
				);
				auraGradient.addColorStop(0, `rgba(255, 0, 0, ${auraAlpha * 0.9})`);
				auraGradient.addColorStop(0.3, `rgba(255, 50, 0, ${auraAlpha * 0.7})`);
				auraGradient.addColorStop(0.6, `rgba(255, 0, 0, ${auraAlpha * 0.4})`);
				auraGradient.addColorStop(1, `rgba(255, 0, 0, 0)`);

				renderer.ctx.fillStyle = auraGradient;
				renderer.ctx.beginPath();
				renderer.ctx.arc(centerX, centerY, bossAuraRadius * auraPulse, 0, Math.PI * 2);
				renderer.ctx.fill();

				renderer.ctx.strokeStyle = `rgba(255, 0, 0, ${auraAlpha * 0.8})`;
				renderer.ctx.lineWidth = 6 + intensity * 3;
				renderer.ctx.shadowBlur = 25;
				renderer.ctx.shadowColor = 'rgba(255, 0, 0, 0.9)';
				renderer.ctx.beginPath();
				renderer.ctx.arc(centerX, centerY, bossAuraRadius * auraPulse, 0, Math.PI * 2);
				renderer.ctx.stroke();
			}

			const maxRadius = BOSS_CONFIG.SPECIAL_ATTACK.EXPLOSION_RADIUS;
			let currentRadius;
			if (specialData.hasExploded) {
				currentRadius = maxRadius;
			} else {
				currentRadius = maxRadius * progress;
			}
			const alpha = specialData.hasExploded ? 0.6 + intensity * 0.3 : 0.3 + intensity * 0.4;

			if (isEarthquake) {
				// Tremblement de terre - couleurs brunes/terre
				const gradient = renderer.ctx.createRadialGradient(
					centerX, centerY, 0,
					centerX, centerY, currentRadius
				);
				gradient.addColorStop(0, `rgba(139, 69, 19, ${alpha * 0.8})`);
				gradient.addColorStop(0.3, `rgba(160, 82, 45, ${alpha * 0.6})`);
				gradient.addColorStop(0.7, `rgba(101, 67, 33, ${alpha * 0.3})`);
				gradient.addColorStop(1, `rgba(139, 69, 19, 0)`);

				renderer.ctx.fillStyle = gradient;
				renderer.ctx.beginPath();
				renderer.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
				renderer.ctx.fill();

				renderer.ctx.strokeStyle = `rgba(101, 67, 33, ${alpha * 0.9})`;
				renderer.ctx.lineWidth = 4 + intensity * 2;
				renderer.ctx.shadowBlur = 20;
				renderer.ctx.shadowColor = 'rgba(139, 69, 19, 0.8)';
				renderer.ctx.beginPath();
				renderer.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
				renderer.ctx.stroke();

				// Particules de terre au lieu d'étincelles électriques
				for (let i = 0; i < 8; i++) {
					const angle = (i / 8) * Math.PI * 2 + progress * Math.PI * 2;
					const sparkX = centerX + Math.cos(angle) * currentRadius;
					const sparkY = centerY + Math.sin(angle) * currentRadius;
					const sparkSize = 8 + intensity * 4;

					renderer.ctx.fillStyle = `rgba(139, 90, 43, ${0.8 + intensity * 0.2})`;
					renderer.ctx.beginPath();
					renderer.ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
					renderer.ctx.fill();
				}
			} else {
				// Attaque électrique - couleurs jaunes
				const gradient = renderer.ctx.createRadialGradient(
					centerX, centerY, 0,
					centerX, centerY, currentRadius
				);
				gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha * 0.8})`);
				gradient.addColorStop(0.3, `rgba(255, 200, 0, ${alpha * 0.6})`);
				gradient.addColorStop(0.7, `rgba(255, 150, 0, ${alpha * 0.3})`);
				gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);

				renderer.ctx.fillStyle = gradient;
				renderer.ctx.beginPath();
				renderer.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
				renderer.ctx.fill();

				renderer.ctx.strokeStyle = `rgba(255, 255, 0, ${alpha * 0.9})`;
				renderer.ctx.lineWidth = 4 + intensity * 2;
				renderer.ctx.shadowBlur = 20;
				renderer.ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
				renderer.ctx.beginPath();
				renderer.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
				renderer.ctx.stroke();

				for (let i = 0; i < 8; i++) {
					const angle = (i / 8) * Math.PI * 2 + progress * Math.PI * 2;
					const sparkX = centerX + Math.cos(angle) * currentRadius;
					const sparkY = centerY + Math.sin(angle) * currentRadius;
					const sparkSize = 8 + intensity * 4;

					renderer.ctx.fillStyle = `rgba(255, 255, 200, ${0.8 + intensity * 0.2})`;
					renderer.ctx.beginPath();
					renderer.ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
					renderer.ctx.fill();
				}
			}

			renderer.ctx.restore();
		}
	}

	clear() {
		this.chargingBosses.clear();
		this.specialAttackBosses.clear();
	}
}
