import BattlePlayer from '../Entities/BattlePlayer.js';
import EnemySpawner from '../Systems/EnemySpawner.js';
import AnimationSystem from '../Systems/AnimationSystem.js';
import Camera from '../Systems/Camera.js';
import Projectile from '../Entities/Projectile.js';
import ParticleSystem from '../Systems/ParticleSystem.js';
import DamageNumberSystem from '../Systems/DamageNumberSystem.js';
import XPOrbSystem from '../Systems/XPOrbSystem.js';
import CoinSystem, { COIN_DROP_CHANCE } from '../Systems/CoinSystem.js';
import HUDRenderer from '../UI/HUDRenderer.js';
import SpellSystem from '../Systems/SpellSystem.js';
import { getPokemonConfig } from '../Config/SpriteConfig.js';
import { getRandomUpgrades, RarityColors, RarityGlowColors, UpgradeIcons, UpgradeType, Upgrades } from '../Config/UpgradeConfig.js';
import { EnemyTypes } from '../Config/EnemyConfig.js';
import Enemy from '../Entities/Enemy.js';

export default class BattleScene {
	constructor(engine) {
		this.engine = engine;
		this.mapData = null;
		this.state = 'playing';
		this.player = null;
		this.enemySpawner = null;
		this.camera = null;
		this.mapWidth = 2000;
		this.mapHeight = 2000;
		this.selectedPokemon = 'quaksire';
		this.projectiles = [];
		this.enemyProjectiles = [];
		this.particleSystem = new ParticleSystem();
		this.damageNumberSystem = new DamageNumberSystem();
		this.xpOrbSystem = new XPOrbSystem();
		this.coinSystem = null;
		this.hudRenderer = new HUDRenderer();
		this.spellSystem = new SpellSystem();
		this.activeSpellEffects = [];
		this.debug = 0;
		this.upgradeChoices = null;
		this.selectedUpgradeIndex = 0;
		this.upgradeAnimationProgress = 0;
		this.upgradeAnimationDuration = 600;
		this.upgradePressAnimation = 0;
		this.wasEnterPressed = false;
		this.isEnterHeld = false;
		this.survivalTime = 0;
		this.originalMusicVolume = null;
		this.playerDying = false;
		this.deathAnimationComplete = false;
		this.deathZoomStart = 1.5;
		this.deathZoomEnd = 3.0;
		this.deathZoomProgress = 0;
		this.killerEnemy = null;
	}

		init(mapData) {
		if (mapData) {
			this.mapData = mapData;
			this.state = 'playing';
			this.survivalTime = 0;
		this.playerDying = false;
		this.deathAnimationComplete = false;
		this.deathZoomProgress = 0;
		this.killerEnemy = null;
			
			const pokemonConfig = getPokemonConfig(this.selectedPokemon);
			const pokemonWalkSprite = this.engine.sprites.get(`${this.selectedPokemon}_walk`);
			const pokemonHurtSprite = this.engine.sprites.get(`${this.selectedPokemon}_hurt`);
			const pokemonChargeSprite = this.engine.sprites.get(`${this.selectedPokemon}_charge`);
			const pokemonFaintSprite = this.engine.sprites.get(`${this.selectedPokemon}_faint`);
			const spriteImages = {};
			if (pokemonWalkSprite) spriteImages.walk = pokemonWalkSprite;
			if (pokemonHurtSprite) spriteImages.hurt = pokemonHurtSprite;
			if (pokemonChargeSprite) spriteImages.charge = pokemonChargeSprite;
			if (pokemonFaintSprite) spriteImages.faint = pokemonFaintSprite;
			const hasSprites = Object.keys(spriteImages).length > 0;
			const animationSystem = pokemonConfig && hasSprites ? 
				new AnimationSystem(pokemonConfig, spriteImages) : null;
			
			this.player = new BattlePlayer(this.mapWidth / 2 - 16, this.mapHeight / 2 - 16, animationSystem, pokemonConfig);
			this.player.money = this.engine.money;
			this.player.displayedMoney = this.engine.displayedMoney;
			
			if (this.selectedPokemon) {
				this.engine.playedPokemons.add(this.selectedPokemon);
			}
			this.enemySpawner = new EnemySpawner(mapData.id, this.mapWidth, this.mapHeight, this.engine.sprites, mapData.bossTimer, mapData.bossType, this.engine);
			this.camera = new Camera(1280, 720, this.mapWidth, this.mapHeight, 1);
			this.projectiles = [];
			this.enemyProjectiles = [];
			this.particleSystem.clear();
			this.damageNumberSystem.clear();
			this.xpOrbSystem.clear();
			
			const coinImage = this.engine.sprites.get('coins');
			this.coinSystem = new CoinSystem(coinImage);
			
			this.loadMapBackground(mapData.image);
			
			const musicName = `map_${mapData.image}`;
			this.engine.audio.playMusic(musicName);
			
		}
	}

	loadMapBackground(imageName) {
		this.mapBackground = null;
		if (imageName) {
			const bgImage = this.engine.sprites.get(`map_${imageName}`);
			if (bgImage) {
				this.mapBackground = bgImage;
			}
		}
	}

	update(deltaTime) {
		if (this.upgradeChoices) {
			this.upgradeAnimationProgress = Math.min(this.upgradeAnimationProgress + deltaTime, this.upgradeAnimationDuration);
			if (this.upgradePressAnimation > 0) {
				this.upgradePressAnimation = Math.max(0, this.upgradePressAnimation - deltaTime);
			}
			this.updateUpgradeMenu();
			return;
		}

		if (this.engine.menuManager.isMenuOpen()) {
			this.engine.menuManager.update();
			return;
		}

		if (this.state === 'playing' || this.state === 'dying') {
			this.updateBattle(deltaTime);
		}
	}

	updateBattle(deltaTime) {
		if (this.state === 'dying') {
			if (this.player && this.player.isDying) {
				this.player.update(deltaTime, this.engine.input, this.mapWidth, this.mapHeight, this.camera);
				
				// Zoom progressif pendant l'animation de mort
				const animationProgress = 1 - (this.player.faintAnimationTime / this.player.faintAnimationDuration);
				this.deathZoomProgress = Math.min(1, animationProgress);
				const currentZoom = this.deathZoomStart + (this.deathZoomEnd - this.deathZoomStart) * this.deathZoomProgress;
				this.camera.zoom = currentZoom;
				
				this.camera.update(deltaTime);
				this.camera.follow(this.player.getCenterX(), this.player.getCenterY());
			} else if (this.player && !this.deathAnimationComplete) {
				// Si pas d'animation faint ou animation terminée, afficher le menu
				this.deathAnimationComplete = true;
				this.showDefeatMenu();
			}
			return;
		}
		
		this.survivalTime += deltaTime;
		
		const key = this.engine.input.consumeLastKey();
		if (key === 'Escape' && !this.upgradeChoices) {
			this.openPauseMenu();
			return;
		}
		if ((key === 'Digit1' || key === 'Numpad1') && !this.upgradeChoices) {
			this.castPlayerSpell(0);
		}
		if ((key === 'Digit2' || key === 'Numpad2') && !this.upgradeChoices) {
			this.castPlayerSpell(1);
		}
		if ((key === 'Digit3' || key === 'Numpad3') && !this.upgradeChoices) {
			this.castPlayerSpell(2);
		}

		if (this.player && this.player.isAlive) {
			this.player.update(deltaTime, this.engine.input, this.mapWidth, this.mapHeight, this.camera);
			
			if (this.player.attackType === 'range' && this.player.autoShoot) {
				this.updatePlayerAutoAim();
			}
			
			this.camera.update(deltaTime);
			this.camera.follow(this.player.getCenterX(), this.player.getCenterY());

			const attackData = this.player.performAttack();
			if (attackData) {
				if (attackData.type === 'melee') {
					this.handleMeleeAttack(attackData);
				} else if (attackData.type === 'range') {
					this.handleRangeAttack(attackData);
				}
			}

			this.updateProjectiles(deltaTime);
			this.updateEnemyProjectiles(deltaTime);
			this.updateSystems(deltaTime);
			this.updateRockTraps(deltaTime);
			this.updateHydrocanon(deltaTime);

			if (this.enemySpawner) {
				this.enemySpawner.update(deltaTime, this.player.getCenterX(), this.player.getCenterY());
				this.updateEnemyAttacks();
				this.updateProjectileCollisions();
			}
		}
	}

	getAllEnemies() {
		return this.enemySpawner ? this.enemySpawner.getEnemies() : [];
	}

	findEnemyByProjectile(projectile) {
		if (projectile.sourceEnemy) {
			return projectile.sourceEnemy;
		}
		
		const enemies = this.getAllEnemies();
		let closestEnemy = null;
		let closestDistance = Infinity;
		
		enemies.forEach(enemy => {
			if (!enemy.isAlive) return;
			
			const enemyCenterX = enemy.getCenterX();
			const enemyCenterY = enemy.getCenterY();
			const dx = projectile.x - enemyCenterX;
			const dy = projectile.y - enemyCenterY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			if (distance < closestDistance && enemy.attackType === 'range') {
				closestDistance = distance;
				closestEnemy = enemy;
			}
		});
		
		return closestEnemy;
	}

	calculateKnockbackDirection(fromX, fromY, toX, toY) {
		const dx = toX - fromX;
		const dy = toY - fromY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance > 0 ? { x: dx / distance, y: dy / distance } : { x: 0, y: 0 };
	}

	applyLifeSteal(damage) {
		if (this.player.lifeSteal > 0) {
			const healAmount = damage * this.player.lifeSteal;
			this.player.hp = Math.min(this.player.hp + healAmount, this.player.maxHp);
		}
	}

	calculateFinalDamage(baseDamage, isCrit = false) {
		return isCrit ? baseDamage * this.player.critDamage : baseDamage;
	}

	handleEnemyDeath(enemy) {
		const enemyCenterX = enemy.getCenterX();
		const enemyCenterY = enemy.getCenterY();
		
		this.particleSystem.createExplosion(enemyCenterX, enemyCenterY, enemy.particleColor, 15);
		
		const xpReward = enemy.level * (10 + Math.floor(Math.random() * 10));
		this.xpOrbSystem.spawnOrb(enemyCenterX, enemyCenterY, xpReward);
		if (Math.random() < COIN_DROP_CHANCE && this.coinSystem) {
			const moneyReward = enemy.level * (5 + Math.floor(Math.random() * 5));
			this.spawnRegularCoin(enemyCenterX, enemyCenterY, moneyReward);
		}

		if (enemy.pokemonConfig && enemy.pokemonConfig.name) {
			const pokemonName = enemy.pokemonConfig.name;
			if (!this.engine.defeatedPokemonCounts[pokemonName]) {
				this.engine.defeatedPokemonCounts[pokemonName] = 0;
			}
			this.engine.defeatedPokemonCounts[pokemonName]++;
		}

		if (enemy.isBoss) {
			this.showVictoryScreen();
		}
	}

	spawnRegularCoin(centerX, centerY, reward) {
		const coinOffsetAngle = Math.random() * Math.PI * 2;
		const coinOffsetDistance = 25 + Math.random() * 15;
		const coinX = centerX + Math.cos(coinOffsetAngle) * coinOffsetDistance;
		const coinY = centerY + Math.sin(coinOffsetAngle) * coinOffsetDistance;
		this.coinSystem.spawnCoin(coinX, coinY, reward);
	}

	updatePlayerAutoAim() {
		const enemies = this.getAllEnemies();
		if (enemies.length === 0) return;

		let nearestEnemy = null;
		let nearestDistance = Infinity;
		
		enemies.forEach(enemy => {
			const dx = enemy.getCenterX() - this.player.getCenterX();
			const dy = enemy.getCenterY() - this.player.getCenterY();
			const distance = Math.sqrt(dx * dx + dy * dy);
			const enemyRadius = Math.max(enemy.width, enemy.height) / 2;
			const effectiveDistance = distance - enemyRadius;
			
			if (effectiveDistance <= this.player.range && distance < nearestDistance) {
				nearestDistance = distance;
				nearestEnemy = enemy;
			}
		});
		
		if (nearestEnemy) {
			this.player.aimX = nearestEnemy.getCenterX();
			this.player.aimY = nearestEnemy.getCenterY();
		}
	}

	updateProjectiles(deltaTime) {
		this.projectiles.forEach(projectile => {
			projectile.update(deltaTime);
		});
		this.projectiles = this.projectiles.filter(p => p.isActive);
	}

	updateEnemyProjectiles(deltaTime) {
		this.enemyProjectiles.forEach(projectile => {
			projectile.update(deltaTime);
			
			if (projectile.collidesWith(this.player.getHitboxX(), this.player.getHitboxY(), this.player.width, this.player.height)) {
				this.damageNumberSystem.addDamage(this.player.getCenterX(), this.player.getCenterY() - 30, projectile.damage, true);
				this.camera.shake(8, 150, this.engine.settings.screenshakeEnabled);
				this.engine.audio.play('hit', 0.3, 0.3);
				const killerEnemy = this.findEnemyByProjectile(projectile);
				if (killerEnemy) {
					this.killerEnemy = killerEnemy;
				}
				const died = this.player.takeDamage(projectile.damage);
				if (died) {
					this.startDeathAnimation();
				}
				projectile.isActive = false;
			}
		});
		this.enemyProjectiles = this.enemyProjectiles.filter(p => p.isActive);
	}

	updateSystems(deltaTime) {
		this.particleSystem.update(deltaTime);
		this.damageNumberSystem.update(deltaTime);
		this.spellSystem.update(deltaTime, this.player);
		
		const collectedXP = this.xpOrbSystem.update(deltaTime, this.player.getCenterX(), this.player.getCenterY(), this.player.fetchRange);
		if (collectedXP > 0) {
			this.engine.audio.play('orb', 0.05, 0.3);
			this.giveXP(collectedXP);
		}

		if (this.coinSystem) {
			const collectedCoins = this.coinSystem.update(deltaTime, this.player.getCenterX(), this.player.getCenterY(), this.player.fetchRange);
			if (collectedCoins > 0) {
				this.engine.audio.play('coins', 0.5, 0.2);
				const multipliedAmount = collectedCoins * this.player.moneyGainMultiplier;
				this.player.addMoney(multipliedAmount);
				this.engine.money = this.player.money;
				this.engine.displayedMoney = this.player.displayedMoney;
			}
		}
	}

	updateEnemyAttacks() {
		const enemies = this.getAllEnemies();
		const playerCenterX = this.player.getCenterX();
		const playerCenterY = this.player.getCenterY();
		
		enemies.forEach(enemy => {
			if (enemy.attackType === 'range') {
				const dx = playerCenterX - enemy.getCenterX();
				const dy = playerCenterY - enemy.getCenterY();
				const distance = Math.sqrt(dx * dx + dy * dy);
				
				if (distance <= enemy.attackRange && enemy.canAttack()) {
					const attackData = enemy.attack(playerCenterX, playerCenterY);
					if (attackData && attackData.type === 'range') {
						const projectile = new Projectile(
							attackData.startX,
							attackData.startY,
							attackData.targetX,
							attackData.targetY,
							attackData.damage,
							attackData.speed,
							600,
							attackData.color,
							attackData.size,
							0,
							0,
							false,
							0,
							true
						);
						projectile.sourceEnemy = enemy;
						this.enemyProjectiles.push(projectile);
					}
				}
			} else {
				if (enemy.collidesWith(this.player.getHitboxX(), this.player.getHitboxY(), this.player.width, this.player.height)) {
					if (enemy.canAttack()) {
						const attackData = enemy.attack();
						if (attackData && attackData.type === 'melee') {
							this.killerEnemy = enemy;
							this.damageNumberSystem.addDamage(this.player.getCenterX(), this.player.getCenterY() - 30, attackData.damage, true);
							this.camera.shake(8, 150, this.engine.settings.screenshakeEnabled);
							this.engine.audio.play('hit', 0.3, 0.3);
							const died = this.player.takeDamage(attackData.damage);
							if (died) {
								this.startDeathAnimation();
							}
						}
					}
				}
			}
		});
	}

	updateProjectileCollisions() {
		const enemies = this.getAllEnemies();
		
		this.projectiles.forEach(projectile => {
			if (!projectile.isActive) return;
			
			let directHitEnemy = null;
			
			enemies.forEach(enemy => {
				if (!enemy.isAlive) return;
				
				const hitboxOffsetX = (enemy.spriteWidth - enemy.width) / 2;
				const hitboxOffsetY = (enemy.spriteHeight - enemy.height) / 2;
				
				const directHit = projectile.collidesWith(enemy.x + hitboxOffsetX, enemy.y + hitboxOffsetY, enemy.width, enemy.height);
				
				if (directHit && !directHitEnemy) {
					if (projectile.hasPiercing && projectile.hitEnemies.has(enemy)) {
						return;
					}
					directHitEnemy = enemy;
				}
			});
			
			if (directHitEnemy) {
				if (projectile.hasPiercing && projectile.hitEnemies.has(directHitEnemy)) {
					return;
				}
				
				if (projectile.hasBounce && projectile.hitEnemies.has(directHitEnemy)) {
					return;
				}
				
				const knockbackDir = this.calculateKnockbackDirection(projectile.x, projectile.y, directHitEnemy.getCenterX(), directHitEnemy.getCenterY());
				const knockbackStrength = this.player.knockback * 0.5 * (directHitEnemy.isBoss ? 0.2 : 1);
				const knockbackX = knockbackDir.x * knockbackStrength;
				const knockbackY = knockbackDir.y * knockbackStrength;
				
				this.damageNumberSystem.addDamage(directHitEnemy.getCenterX(), directHitEnemy.getCenterY() - 30, projectile.damage, false, projectile.isCrit);
				this.engine.audio.play('hit', 0.2, 0.2);
				const died = directHitEnemy.takeDamage(projectile.damage, knockbackX, knockbackY, projectile.isCrit);
				
				this.applyLifeSteal(projectile.damage);
				
				if (died) {
					this.handleEnemyDeath(directHitEnemy);
				}
				
				if (projectile.hasBounce) {
					projectile.hitEnemies.add(directHitEnemy);
				}
				
				if (projectile.hasAoE && !projectile.exploded) {
					this.particleSystem.createExplosion(projectile.x, projectile.y, projectile.color, Math.floor(projectile.aoeRadius / 2), projectile.type);
					projectile.exploded = true;
					
					enemies.forEach(enemy => {
						if (!enemy.isAlive || enemy === directHitEnemy || projectile.hitEnemies.has(enemy)) return;
						
						const dx = enemy.getCenterX() - projectile.x;
						const dy = enemy.getCenterY() - projectile.y;
						const distance = Math.sqrt(dx * dx + dy * dy);
						
						if (distance <= projectile.aoeRadius) {
							const knockbackDir = this.calculateKnockbackDirection(projectile.x, projectile.y, enemy.getCenterX(), enemy.getCenterY());
							const knockbackStrength = this.player.knockback * 0.5 * (enemy.isBoss ? 0.2 : 1);
							const knockbackX = knockbackDir.x * knockbackStrength;
							const knockbackY = knockbackDir.y * knockbackStrength;
							
							const damageToDeal = projectile.damage * this.player.aoeDamageMultiplier;
							
							this.damageNumberSystem.addDamage(enemy.getCenterX(), enemy.getCenterY() - 30, damageToDeal, false, projectile.isCrit);
							this.engine.audio.play('hit', 0.2, 0.2);
							const died = enemy.takeDamage(damageToDeal, knockbackX, knockbackY, projectile.isCrit);
							
							this.applyLifeSteal(damageToDeal);
							
							if (died) {
								this.handleEnemyDeath(enemy);
							}
							
							projectile.hitEnemies.add(enemy);
						}
					});
				}
				
				if (projectile.hasPiercing) {
					projectile.hitEnemies.add(directHitEnemy);
					const maxPierced = projectile.piercingCount + 1;
					if (projectile.hitEnemies.size > maxPierced) {
						projectile.isActive = false;
					}
				} else if (projectile.hasBounce) {
					if (projectile.currentBounces < projectile.bounceCount) {
						const allEnemies = this.getAllEnemies();
						let nearestEnemy = null;
						let nearestDistance = Infinity;
						
						allEnemies.forEach(otherEnemy => {
							if (otherEnemy === directHitEnemy || !otherEnemy.isAlive || projectile.hitEnemies.has(otherEnemy)) return;
							
							const dx = otherEnemy.getCenterX() - projectile.x;
							const dy = otherEnemy.getCenterY() - projectile.y;
							const distance = Math.sqrt(dx * dx + dy * dy);
							
							if (distance < nearestDistance && distance <= projectile.bounceRange) {
								nearestDistance = distance;
								nearestEnemy = otherEnemy;
							}
						});
						
						if (nearestEnemy) {
							const dx = nearestEnemy.getCenterX() - projectile.x;
							const dy = nearestEnemy.getCenterY() - projectile.y;
							const distance = Math.sqrt(dx * dx + dy * dy);
							
							if (distance > 0) {
								const currentSpeed = Math.sqrt(projectile.velocityX * projectile.velocityX + projectile.velocityY * projectile.velocityY);
								const newDirX = dx / distance;
								const newDirY = dy / distance;
								projectile.velocityX = newDirX * currentSpeed;
								projectile.velocityY = newDirY * currentSpeed;
								projectile.directionX = newDirX;
								projectile.directionY = newDirY;
								projectile.currentBounces++;
							} else {
								projectile.isActive = false;
							}
						} else {
							projectile.currentBounces++;
							const currentSpeed = Math.sqrt(projectile.velocityX * projectile.velocityX + projectile.velocityY * projectile.velocityY);
							if (currentSpeed <= 0) {
								projectile.velocityX = projectile.directionX * 0.6;
								projectile.velocityY = projectile.directionY * 0.6;
							}
						}
					} else {
						projectile.isActive = false;
					}
				} else {
					projectile.isActive = false;
				}
			}
		});
	}

	updateHydrocanon(deltaTime) {
		const enemies = this.getAllEnemies();
		
		let hasActiveHydrocanon = false;
		
		this.activeSpellEffects.forEach(effect => {
			if (effect.type !== 'hydrocanon') return;

			const elapsed = Date.now() - effect.startTime;
			if (elapsed >= effect.duration) {
				return;
			}

			hasActiveHydrocanon = true;

			effect.rotationAngle += (Math.PI * 2 * deltaTime) / 1000;
			if (effect.rotationAngle >= Math.PI * 2) {
				effect.rotationAngle -= Math.PI * 2;
			}

			const directionIndex = Math.floor((effect.rotationAngle / (Math.PI * 2)) * 8) % 8;
			const directions = ['down', 'downRight', 'right', 'upRight', 'up', 'upLeft', 'left', 'downLeft'];
			const currentDirection = directions[directionIndex];
			this.player.forcedDirection = currentDirection;

			effect.playerX = this.player.getCenterX();
			effect.playerY = this.player.getCenterY();
			effect.playerSize = Math.max(this.player.spriteWidth, this.player.spriteHeight) * 0.4;

			const directionAngles = {
				'down': Math.PI / 2,
				'downRight': Math.PI / 4,
				'right': 0,
				'upRight': -Math.PI / 4,
				'up': -Math.PI / 2,
				'upLeft': -3 * Math.PI / 4,
				'left': Math.PI,
				'downLeft': 3 * Math.PI / 4
			};

			const baseAngle = directionAngles[currentDirection] || 0;
			const currentDirX = Math.cos(baseAngle);
			const currentDirY = Math.sin(baseAngle);

			const playerOffset = effect.playerSize || 30;
			const spawnX = effect.playerX + currentDirX * playerOffset;
			const spawnY = effect.playerY + currentDirY * playerOffset;

			const now = Date.now();
			if (now - effect.lastProjectileTime >= effect.projectileInterval) {
				const projectileCount = 3;
				for (let i = 0; i < projectileCount; i++) {
					const spread = (i - (projectileCount - 1) / 2) * 0.15;
					const angle = baseAngle + spread;
					const dirX = Math.cos(angle);
					const dirY = Math.sin(angle);
					
					const projectile = {
						x: spawnX,
						y: spawnY,
						dirX: dirX,
						dirY: dirY,
						speed: 0.8,
						size: 12 + Math.random() * 4,
						maxDistance: effect.radius,
						traveledDistance: 0,
						active: true,
						damage: effect.damage * 0.15
					};
					
					if (!effect.waterProjectiles) {
						effect.waterProjectiles = [];
					}
					effect.waterProjectiles.push(projectile);
				}
				effect.lastProjectileTime = now;
			}

			if (effect.waterProjectiles) {
				effect.waterProjectiles.forEach(projectile => {
					if (!projectile.active) return;

					const moveX = projectile.dirX * projectile.speed * deltaTime;
					const moveY = projectile.dirY * projectile.speed * deltaTime;
					
					projectile.x += moveX;
					projectile.y += moveY;
					
					const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);
					projectile.traveledDistance += moveDistance;

					if (projectile.traveledDistance >= projectile.maxDistance) {
						projectile.active = false;
						return;
					}

					enemies.forEach(enemy => {
						if (!enemy.isAlive) return;

						const hitboxOffsetX = (enemy.spriteWidth - enemy.width) / 2;
						const hitboxOffsetY = (enemy.spriteHeight - enemy.height) / 2;
						const enemyX = enemy.x + hitboxOffsetX;
						const enemyY = enemy.y + hitboxOffsetY;

						if (projectile.x >= enemyX && projectile.x <= enemyX + enemy.width &&
							projectile.y >= enemyY && projectile.y <= enemyY + enemy.height) {
							
							const damageCalc = this.player.calculateDamage();
							const finalDamage = this.calculateFinalDamage(projectile.damage, damageCalc.isCrit);

							this.damageNumberSystem.addDamage(
								enemy.getCenterX(),
								enemy.getCenterY() - 30,
								finalDamage,
								false,
								damageCalc.isCrit
							);

							const knockbackMultiplier = enemy.isBoss ? 0.2 : 1;
							const knockbackX = projectile.dirX * effect.knockback * 0.3 * knockbackMultiplier;
							const knockbackY = projectile.dirY * effect.knockback * 0.3 * knockbackMultiplier;

							this.engine.audio.play('hit', 0.2, 0.2);
							const died = enemy.takeDamage(finalDamage, knockbackX, knockbackY, damageCalc.isCrit);

							this.applyLifeSteal(finalDamage);

							if (died) {
								this.handleEnemyDeath(enemy);
							}

							projectile.active = false;
						}
					});
				});

				effect.waterProjectiles = effect.waterProjectiles.filter(p => p.active);
			}
		});

		if (hasActiveHydrocanon) {
			const activeEffect = this.activeSpellEffects.find(e => e.type === 'hydrocanon' && Date.now() - e.startTime < e.duration);
			if (activeEffect) {
				if (this.player.animationSystem) {
					const remainingTime = activeEffect.duration - (Date.now() - activeEffect.startTime);
					if (this.player.animationSystem.currentAnimation !== 'charge') {
						this.player.animationSystem.setAnimation('charge', activeEffect.duration);
						this.player.spellAnimationTime = remainingTime;
					} else if (this.player.animationSystem.customAnimationDuration !== activeEffect.duration) {
						this.player.animationSystem.setAnimation('charge', activeEffect.duration);
						this.player.spellAnimationTime = remainingTime;
					} else {
						this.player.spellAnimationTime = remainingTime;
					}
				}
			}
		} else {
			this.player.forcedDirection = null;
			if (this.player.animationSystem) {
				this.player.animationSystem.forcedDirection = null;
			}
		}
	}

	updateRockTraps(deltaTime) {
		const enemies = this.getAllEnemies();
		
		for (let i = this.activeSpellEffects.length - 1; i >= 0; i--) {
			const effect = this.activeSpellEffects[i];
			if (effect.type !== 'rock_trap' || !effect.rocks) continue;

			effect.rocks.forEach(rock => {
				if (!rock.active) return;

				const elapsed = Date.now() - rock.startTime;
				if (elapsed >= rock.lifetime) {
					rock.active = false;
					return;
				}

				enemies.forEach(enemy => {
					if (!enemy.isAlive) return;

					const hitboxOffsetX = (enemy.spriteWidth - enemy.width) / 2;
					const hitboxOffsetY = (enemy.spriteHeight - enemy.height) / 2;
					const enemyX = enemy.x + hitboxOffsetX;
					const enemyY = enemy.y + hitboxOffsetY;

					if (rock.x < enemyX + enemy.width &&
						rock.x + rock.width > enemyX &&
						rock.y < enemyY + enemy.height &&
						rock.y + rock.height > enemyY) {

						const damageCalc = this.player.calculateDamage();
						const finalDamage = this.calculateFinalDamage(effect.damage, damageCalc.isCrit);

						this.damageNumberSystem.addDamage(
							enemy.getCenterX(),
							enemy.getCenterY() - 30,
							finalDamage,
							false,
							damageCalc.isCrit
						);

						const rockCenterX = rock.x + rock.width / 2;
						const rockCenterY = rock.y + rock.height / 2;
						const knockbackDir = this.calculateKnockbackDirection(rockCenterX, rockCenterY, enemy.getCenterX(), enemy.getCenterY());
						const knockbackMultiplier = enemy.isBoss ? 0.2 : 1;
						const knockbackX = knockbackDir.x * effect.knockback * knockbackMultiplier;
						const knockbackY = knockbackDir.y * effect.knockback * knockbackMultiplier;

						this.engine.audio.play('hit', 0.2, 0.2);
						const died = enemy.takeDamage(finalDamage, knockbackX, knockbackY, damageCalc.isCrit);

						this.applyLifeSteal(finalDamage);

						if (died) {
							this.handleEnemyDeath(enemy);
						}

						rock.active = false;
					}
				});
			});

			effect.rocks = effect.rocks.filter(rock => rock.active);
			
			if (effect.rocks.length === 0) {
				this.activeSpellEffects.splice(i, 1);
			}
		}
	}

	giveXP(amount) {
		if (!this.player || !this.player.isAlive) return;
		
		const multipliedAmount = amount * this.player.xpGainMultiplier;
		const leveledUp = this.player.addXP(multipliedAmount);

		
		this.engine.audio.play('orb', 0.05, 0.35);

		if (leveledUp) {
			this.upgradeChoices = getRandomUpgrades(3, this.player.upgrades, this.player);
			this.selectedUpgradeIndex = 0;
			this.upgradeAnimationProgress = 0;
			if (this.originalMusicVolume === null) {
				this.originalMusicVolume = this.engine.audio.musicVolume;
				this.engine.audio.setMusicVolume(this.originalMusicVolume * 0.5);
			}
		}
	}

	updateUpgradeMenu() {
		const key = this.engine.input.consumeLastKey();
		
		if (key === 'ArrowLeft' || key === 'KeyA') {
			this.selectedUpgradeIndex = Math.max(0, this.selectedUpgradeIndex - 1);
		} else if (key === 'ArrowRight' || key === 'KeyD') {
			this.selectedUpgradeIndex = Math.min(this.upgradeChoices.length - 1, this.selectedUpgradeIndex + 1);
		}
		
		const isEnterPressed = this.engine.input.isKeyDown('Enter') || this.engine.input.isKeyDown('Space');
		if (isEnterPressed) {
			this.wasEnterPressed = true;
			this.isEnterHeld = true;
		} else {
			if (this.wasEnterPressed && !isEnterPressed) {
				if (this.upgradeAnimationProgress >= this.upgradeAnimationDuration) {
					this.engine.audio.play('ok', 0.3, 0.2);
					this.upgradePressAnimation = 100;
					const selectedUpgrade = this.upgradeChoices[this.selectedUpgradeIndex];
					this.player.applyUpgrade(selectedUpgrade);
					this.upgradeChoices = null;
					this.selectedUpgradeIndex = 0;
					this.upgradeAnimationProgress = 0;
					this.wasEnterPressed = false;
					this.isEnterHeld = false;
					if (this.originalMusicVolume !== null) {
						this.engine.audio.setMusicVolume(this.originalMusicVolume);
						this.originalMusicVolume = null;
					}
				}
			}
			this.isEnterHeld = false;
		}
	}

	handleMeleeAttack(attackData) {
		if (!this.enemySpawner) return;

		const enemies = this.getAllEnemies();
		enemies.forEach(enemy => {
			const enemyCenterX = enemy.getCenterX();
			const enemyCenterY = enemy.getCenterY();
			const dx = enemyCenterX - attackData.x;
			const dy = enemyCenterY - attackData.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance <= attackData.range) {
				const knockbackDir = this.calculateKnockbackDirection(attackData.x, attackData.y, enemyCenterX, enemyCenterY);
				const knockbackMultiplier = enemy.isBoss ? 0.2 : 1;
				const knockbackX = knockbackDir.x * attackData.knockback * knockbackMultiplier;
				const knockbackY = knockbackDir.y * attackData.knockback * knockbackMultiplier;
				
				this.damageNumberSystem.addDamage(enemy.getCenterX(), enemy.getCenterY() - 30, attackData.damage, false, attackData.isCrit);
				this.engine.audio.play('hit', 0.2, 0.2);
				const died = enemy.takeDamage(attackData.damage, knockbackX, knockbackY, attackData.isCrit);
				
				this.applyLifeSteal(attackData.damage);
				
				if (died) {
					this.handleEnemyDeath(enemy);
				}
			}
		});
	}

	handleRangeAttack(attackData) {
		if (!this.enemySpawner) return;

		let targetX, targetY;

		if (attackData.autoShoot) {
			const enemies = this.enemySpawner.getEnemies();
			if (enemies.length === 0) return;

			let nearestEnemy = null;
			let nearestDistance = Infinity;

			enemies.forEach(enemy => {
				const dx = enemy.getCenterX() - this.player.getCenterX();
				const dy = enemy.getCenterY() - this.player.getCenterY();
				const distance = Math.sqrt(dx * dx + dy * dy);
				const enemyRadius = Math.max(enemy.width, enemy.height) / 2;
				const effectiveDistance = distance - enemyRadius;

				if (effectiveDistance <= this.player.range && distance < nearestDistance) {
					nearestDistance = distance;
					nearestEnemy = enemy;
				}
			});

			if (nearestEnemy) {
				targetX = nearestEnemy.getCenterX();
				targetY = nearestEnemy.getCenterY();
			} else {
				return;
			}
		} else {
			targetX = attackData.aimX;
			targetY = attackData.aimY;
		}

		const playerVelX = attackData.autoShoot ? 0 : (attackData.playerVelocityX || 0);
		const playerVelY = attackData.autoShoot ? 0 : (attackData.playerVelocityY || 0);
		
		let aoeRadius = 0;
		if (this.player.hasAoE) {
			aoeRadius = (attackData.projectileSize || 8) * 6 * this.player.aoeRadiusMultiplier;
		}
		
		const projectile = new Projectile(
			this.player.getCenterX(),
			this.player.getCenterY(),
			targetX,
			targetY,
			attackData.damage,
			0.6 * (attackData.projectileSpeed || 1),
			this.player.range,
			attackData.projectileColor || '#ffff00',
			attackData.projectileSize || 8,
			playerVelX,
			playerVelY,
			attackData.isCrit || false,
			aoeRadius,
			false,
			attackData.hasPiercing || false,
			attackData.hasBounce || false,
			attackData.bounceCount || 0,
			this.player.piercingCount || 0,
			this.player.bounceRange || 600,
			attackData.projectileType || 'normal'
		);
		this.projectiles.push(projectile);
	}

	openPauseMenu() {
		const pauseMenuConfig = {
			title: 'PAUSE',
			style: 'center',
			closeable: true,
			onClose: (engine) => {
			},
			options: [
				{
					label: 'Reprendre',
					action: (engine) => {
						engine.menuManager.closeMenu();
					}
				},
				{
					label: 'Recommencer',
					action: (engine) => {
						engine.menuManager.closeMenu();
						this.init(this.mapData);
					}
				},
				{
					label: 'Retour au Hub',
					action: (engine) => {
						if (this.player) {
							engine.money = this.player.money;
							engine.displayedMoney = this.player.displayedMoney;
						}
						engine.menuManager.closeMenu();
						engine.sceneManager.changeScene('game');
					}
				}
			]
		};
		this.engine.menuManager.openMenu(pauseMenuConfig);
	}

	render(renderer) {
		if (this.state === 'playing' || this.state === 'gameover' || this.state === 'victory' || this.state === 'dying') {
			this.renderBattle(renderer);
			
			if (this.state === 'dying') {
				this.applyGrayscaleFilter(renderer);
			}
		}

		if (this.upgradeChoices) {
			this.renderUpgradeMenu(renderer);
		}

		if (this.engine.menuManager.isMenuOpen()) {
			this.engine.menuManager.render(renderer);
		}
	}

	renderBattle(renderer) {
		if (this.camera) {
			this.camera.apply(renderer.ctx);
		}

		if (this.mapBackground) {
			renderer.ctx.drawImage(this.mapBackground, 0, 0, this.mapWidth, this.mapHeight);
		} else {
			renderer.drawRect(0, 0, this.mapWidth, this.mapHeight, '#2a2a3e');
		}
		
		if (this.debug === 1) {
			const gridSize = 100;
			renderer.ctx.strokeStyle = '#3a3a4e';
			renderer.ctx.lineWidth = 1;
			for (let x = 0; x < this.mapWidth; x += gridSize) {
				renderer.ctx.beginPath();
				renderer.ctx.moveTo(x, 0);
				renderer.ctx.lineTo(x, this.mapHeight);
				renderer.ctx.stroke();
			}
			for (let y = 0; y < this.mapHeight; y += gridSize) {
				renderer.ctx.beginPath();
				renderer.ctx.moveTo(0, y);
				renderer.ctx.lineTo(this.mapWidth, y);
				renderer.ctx.stroke();
			}
		}

		const renderableEntities = [];
		
		if (this.enemySpawner) {
			const enemies = this.getAllEnemies();
			enemies.forEach(enemy => {
				renderableEntities.push({
					type: 'enemy',
					entity: enemy,
					y: enemy.getCenterY()
				});
			});
		}

		if (this.player) {
			renderableEntities.push({
				type: 'player',
				entity: this.player,
				y: this.player.getCenterY()
			});
		}

		renderableEntities.sort((a, b) => a.y - b.y);

		renderableEntities.forEach(item => {
			if (item.type === 'enemy') {
				item.entity.render(renderer, this.debug);
			} else if (item.type === 'player') {
				item.entity.render(renderer, this.debug);
			}
		});

		this.projectiles.forEach(projectile => {
			projectile.render(renderer);
		});

		this.enemyProjectiles.forEach(projectile => {
			projectile.render(renderer);
		});

		this.particleSystem.render(renderer);
		this.xpOrbSystem.render(renderer);
		if (this.coinSystem) {
			this.coinSystem.render(renderer);
		}
		this.damageNumberSystem.render(renderer);

		this.activeSpellEffects.forEach(effect => {
			this.spellSystem.render(renderer, effect, this.engine);
		});

		if (this.camera) {
			this.camera.restore(renderer.ctx);
		}

		if (this.player && this.player.hitFlashTime > 0) {
			const alpha = Math.min(this.player.hitFlashTime / 150, 0.4);
			renderer.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
			renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
		}

		if (this.player) {
			const bossTimerRemaining = this.enemySpawner ? this.enemySpawner.getBossTimerRemaining() : null;
			const bossTimerMax = this.enemySpawner ? this.enemySpawner.getBossTimerMax() : null;
			const currentBoss = this.enemySpawner ? this.enemySpawner.getBoss() : null;
			this.hudRenderer.render(renderer, this.player, renderer.width, renderer.height, this.survivalTime, bossTimerRemaining, bossTimerMax, this.selectedPokemon, this.engine, currentBoss);
		}

		this.renderMinimap(renderer);
	}

	renderMinimap(renderer) {
		const minimapSize = 180;
		const minimapX = renderer.width - minimapSize - 20;
		const minimapY = 100;
		const minimapPadding = 5;

		renderer.ctx.save();
		renderer.ctx.fillStyle = 'rgba(20, 20, 30, 0.85)';
		renderer.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
		renderer.ctx.strokeStyle = 'rgba(100, 100, 120, 0.8)';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

		const mapScale = (minimapSize - minimapPadding * 2) / Math.max(this.mapWidth, this.mapHeight);

		if (this.player) {
			const playerMinimapX = minimapX + minimapPadding + (this.player.getCenterX() * mapScale);
			const playerMinimapY = minimapY + minimapPadding + (this.player.getCenterY() * mapScale);

			renderer.ctx.fillStyle = '#4af626';
			renderer.ctx.beginPath();
			renderer.ctx.arc(playerMinimapX, playerMinimapY, 4, 0, Math.PI * 2);
			renderer.ctx.fill();
		}

		if (this.enemySpawner) {
			const enemies = this.getAllEnemies();
			enemies.forEach(enemy => {
				const enemyMinimapX = minimapX + minimapPadding + (enemy.getCenterX() * mapScale);
				const enemyMinimapY = minimapY + minimapPadding + (enemy.getCenterY() * mapScale);
				
				if (enemy.isBoss) {
					renderer.ctx.fillStyle = '#ff0000';
					renderer.ctx.font = '12px Arial';
					renderer.ctx.textAlign = 'center';
					renderer.ctx.textBaseline = 'middle';
					renderer.ctx.fillText('☠', enemyMinimapX, enemyMinimapY);
				} else {
					renderer.ctx.fillStyle = '#ff4444';
					renderer.ctx.fillRect(enemyMinimapX - 1, enemyMinimapY - 1, 2, 2);
				}
			});
		}

		if (this.xpOrbSystem && this.xpOrbSystem.orbs.length > 0) {
			renderer.ctx.fillStyle = '#87CEEB';
			this.xpOrbSystem.orbs.forEach(orb => {
				const orbMinimapX = minimapX + minimapPadding + (orb.x * mapScale);
				const orbMinimapY = minimapY + minimapPadding + (orb.y * mapScale);
				renderer.ctx.fillRect(orbMinimapX - 1, orbMinimapY - 1, 2, 2);
			});
		}

		renderer.ctx.restore();
	}

	renderUpgradeMenu(renderer) {
		const animProgress = Math.min(this.upgradeAnimationProgress / this.upgradeAnimationDuration, 1);
		const easeOutBack = (t) => {
			const c1 = 1.70158;
			const c3 = c1 + 1;
			return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
		};
		const easeOutElastic = (t) => {
			const c4 = (2 * Math.PI) / 3;
			return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
		};

		renderer.ctx.save();
		renderer.ctx.globalAlpha = animProgress * 0.8 + 0.2;
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
		renderer.ctx.globalAlpha = 1;

		const titleY = 100;
		const titleScale = Math.min(animProgress * 1.2, 1);
		renderer.ctx.save();
		renderer.ctx.translate(renderer.width / 2, titleY);
		renderer.ctx.scale(titleScale, titleScale);
		renderer.ctx.globalAlpha = animProgress;
		renderer.ctx.font = '48px Pokemon';
		renderer.ctx.fillStyle = '#ffd700';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.fillText('NIVEAU SUPÉRIEUR !', 0, 0);
		renderer.ctx.restore();

		renderer.ctx.save();
		renderer.ctx.globalAlpha = Math.max(0, (animProgress - 0.2) * 1.25);
		renderer.ctx.font = '24px Pokemon';
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.fillText('Choisissez une amélioration', renderer.width / 2, titleY + 50);
		renderer.ctx.restore();

		const cardWidth = 280;
		const cardHeight = 350;
		const spacing = 30;
		const startX = (renderer.width - (this.upgradeChoices.length * cardWidth + (this.upgradeChoices.length - 1) * spacing)) / 2;
		const cardY = 220;

		this.upgradeChoices.forEach((upgrade, index) => {
			const delayPerCard = 0.1;
			const cardAnimDuration = 0.2;
			const delay = index * delayPerCard;
			const cardStart = delay;
			const cardEnd = delay + cardAnimDuration;
			
			let cardProgress = 0;
			if (animProgress < cardStart) {
				cardProgress = 0;
			} else if (animProgress > cardEnd) {
				cardProgress = 1;
			} else {
				cardProgress = (animProgress - cardStart) / cardAnimDuration;
			}
			
			const cardEased = easeOutElastic(cardProgress);
			
			const x = startX + index * (cardWidth + spacing);
			const isSelected = index === this.selectedUpgradeIndex;
			const isPressed = isSelected && this.upgradePressAnimation > 0;
			const isHeld = isSelected && this.isEnterHeld && this.upgradeAnimationProgress >= this.upgradeAnimationDuration;
			const pressProgress = isPressed ? Math.max(0, Math.min(1, this.upgradePressAnimation / 100)) : 0;
			const heldProgress = isHeld ? 0.5 : 0;
			const pressScale = 1 - (pressProgress * 0.15 + heldProgress * 0.1);
			const glowIntensity = pressProgress > 0 ? (1 - pressProgress) * 0.8 : (isHeld ? 0.5 : 0);

			const borderColor = RarityColors[upgrade.rarity];
			const glowColor = RarityGlowColors[upgrade.rarity];

			renderer.ctx.save();
			renderer.ctx.translate(x + cardWidth / 2, cardY + cardHeight / 2);
			
			const slideY = (1 - cardProgress) * 200;
			renderer.ctx.translate(0, slideY);
			
			let scale = 0.3 + cardEased * 0.7;
			scale *= pressScale;
			renderer.ctx.scale(scale, scale);
			
			const rotation = (1 - cardProgress) * 0.2;
			renderer.ctx.rotate(rotation);
			
			renderer.ctx.globalAlpha = cardProgress;
			
			if (glowIntensity > 0) {
				renderer.ctx.shadowColor = glowColor;
				renderer.ctx.shadowBlur = 30 * glowIntensity;
			}
			
			const cardCenterX = -cardWidth / 2;
			const cardCenterY = -cardHeight / 2;
			
			if (isSelected && cardProgress >= 1) {
				const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
				renderer.ctx.shadowColor = glowColor;
				renderer.ctx.shadowBlur = 40 * pulse;
				renderer.ctx.fillStyle = glowColor;
				renderer.ctx.globalAlpha = 0.1 * pulse;
				renderer.ctx.fillRect(cardCenterX - 10, cardCenterY - 10, cardWidth + 20, cardHeight + 20);
				renderer.ctx.globalAlpha = cardProgress;
				renderer.ctx.shadowBlur = 0;
			}
			
			const bgGradient = renderer.ctx.createLinearGradient(cardCenterX, cardCenterY, cardCenterX + cardWidth, cardCenterY + cardHeight);
			if (upgrade.rarity === 'common') {
				bgGradient.addColorStop(0, '#2a2a2a');
				bgGradient.addColorStop(1, '#1a1a1a');
			} else if (upgrade.rarity === 'rare') {
				bgGradient.addColorStop(0, '#1a2332');
				bgGradient.addColorStop(1, '#0d1419');
			} else if (upgrade.rarity === 'epic') {
				bgGradient.addColorStop(0, '#2d1b3d');
				bgGradient.addColorStop(1, '#1a0f26');
			} else if (upgrade.rarity === 'legendary') {
				bgGradient.addColorStop(0, '#3d2a1a');
				bgGradient.addColorStop(1, '#261a0d');
			}
			renderer.ctx.fillStyle = bgGradient;
			renderer.ctx.fillRect(cardCenterX, cardCenterY, cardWidth, cardHeight);
			
			renderer.ctx.strokeStyle = borderColor;
			renderer.ctx.lineWidth = isSelected ? 5 : 3;
			renderer.ctx.strokeRect(cardCenterX, cardCenterY, cardWidth, cardHeight);

			if (isSelected && cardProgress >= 1) {
				renderer.ctx.shadowColor = borderColor;
				renderer.ctx.shadowBlur = 25;
				renderer.ctx.strokeRect(cardCenterX, cardCenterY, cardWidth, cardHeight);
				renderer.ctx.shadowBlur = 0;
			}

			let icon = UpgradeIcons[upgrade.type];
			if (upgrade.type === UpgradeType.SPELL && upgrade.value) {
				const spellEmojis = {
					'earthquake': '🟤',
					'rock_trap': '🪨',
					'hydrocanon': '💧'
				};
				icon = spellEmojis[upgrade.value] || icon;
			}
			renderer.ctx.font = '48px Pokemon';
			renderer.ctx.fillStyle = borderColor;
			renderer.ctx.textAlign = 'center';
			renderer.ctx.shadowColor = glowColor;
			renderer.ctx.shadowBlur = 15;
			renderer.ctx.fillText(icon, 0, cardCenterY + 70);
			renderer.ctx.shadowBlur = 0;

			const currentStacks = this.player.upgrades[upgrade.id] || 0;
			renderer.ctx.font = '24px Pokemon';
			renderer.ctx.fillStyle = borderColor;
			renderer.ctx.textAlign = 'center';
			renderer.ctx.fillText(upgrade.name, 0, cardCenterY + 120);

			let valueText = '';
			if (typeof upgrade.value === 'number') {
				if (upgrade.value >= 1 && upgrade.value < 2) {
					const percent = Math.round((upgrade.value - 1) * 100);
					valueText = `+${percent}%`;
				} else if (upgrade.value < 1) {
					const percent = Math.round(upgrade.value * 100);
					valueText = `+${percent}%`;
				} else {
					valueText = `+${upgrade.value}`;
				}
			}
			if (valueText) {
				renderer.ctx.font = '20px Pokemon';
				renderer.ctx.fillStyle = borderColor;
				renderer.ctx.fillText(valueText, 0, cardCenterY + 150);
			}

			renderer.ctx.fillStyle = '#cccccc';
			renderer.ctx.font = '16px Pokemon';
			renderer.ctx.textAlign = 'center';
			let description = upgrade.description;
			if (upgrade.type === 'projectileEnhancement' && this.player) {
				if (this.player.hasAoE) {
					description = 'Dégâts de zone +20% Rayon +15%';
				} else if (this.player.hasPiercing) {
					description = 'Unités transperçables +1';
				} else if (this.player.hasBounce) {
					description = 'Rebonds +1 Portée +50';
				}
			}
			const words = description.split(' ');
			let line = '';
			let lineY = cardCenterY + 180;
			words.forEach(word => {
				const testLine = line + word + ' ';
				const metrics = renderer.ctx.measureText(testLine);
				if (metrics.width > cardWidth - 40) {
					renderer.ctx.fillText(line, 0, lineY);
					line = word + ' ';
					lineY += 25;
				} else {
					line = testLine;
				}
			});
			renderer.ctx.fillText(line, 0, lineY);

			const stackText = `Niv. ${currentStacks + 1}/${upgrade.maxStacks}`;
			renderer.ctx.font = '18px Pokemon';
			renderer.ctx.fillStyle = '#ffd700';
			renderer.ctx.fillText(stackText, 0, cardCenterY + cardHeight - 30);

			renderer.ctx.shadowBlur = 0;
			renderer.ctx.restore();

			if (isSelected && cardProgress >= 1) {
				const arrowBounce = Math.sin(Date.now() / 200) * 5;
				renderer.ctx.save();
				renderer.ctx.font = '32px Pokemon';
				renderer.ctx.fillStyle = '#4af626';
				renderer.ctx.textAlign = 'center';
				renderer.ctx.fillText('↓', x + cardWidth / 2, cardY - 20 - arrowBounce);
				renderer.ctx.restore();
			}
		});

		renderer.ctx.save();
		renderer.ctx.globalAlpha = Math.max(0, (animProgress - 0.5) * 2);
		renderer.ctx.font = '20px Pokemon';
		renderer.ctx.fillStyle = '#aaa';
		renderer.ctx.textAlign = 'center';
		const instructionText = this.upgradeAnimationProgress >= this.upgradeAnimationDuration 
			? '← → pour naviguer | ENTRÉE pour choisir'
			: 'Chargement...';
		renderer.ctx.fillText(instructionText, renderer.width / 2, renderer.height - 50);
		renderer.ctx.restore();

		renderer.ctx.restore();
	}

	castPlayerSpell(spellIndex) {
		if (!this.player || !this.player.isAlive) return;

		const unlockedSpells = this.player.getUnlockedSpells();
		if (spellIndex < 0 || spellIndex >= unlockedSpells.length) return;
		const spell = unlockedSpells[spellIndex];
		if (!spell || spell.cooldown > 0) return;

		const castSpell = this.player.castSpell(spellIndex);
		if (!castSpell) return;

		const enemies = this.getAllEnemies();
		const spellEffect = this.spellSystem.castSpell(spell, this.player, enemies);

		if (spellEffect) {
			if (spellEffect.type === 'earthquake' && this.camera) {
				this.camera.shake(15, 400, this.engine.settings.screenshakeEnabled);
			}
			if (spellEffect.hitEnemies) {
				spellEffect.hitEnemies.forEach(hit => {
					const damageCalc = this.player.calculateDamage();
					const finalDamage = this.calculateFinalDamage(spellEffect.damage, damageCalc.isCrit);
					
					this.damageNumberSystem.addDamage(
						hit.enemy.getCenterX(),
						hit.enemy.getCenterY() - 30,
						finalDamage,
						false,
						damageCalc.isCrit
					);

					const knockbackMultiplier = hit.enemy.isBoss ? 0.2 : 1;
					const knockbackX = hit.knockbackDirection.x * hit.knockback * knockbackMultiplier;
					const knockbackY = hit.knockbackDirection.y * hit.knockback * knockbackMultiplier;
					
					this.engine.audio.play('hit', 0.2, 0.2);
					const died = hit.enemy.takeDamage(finalDamage, knockbackX, knockbackY, damageCalc.isCrit);

					this.applyLifeSteal(finalDamage);

					if (died) {
						this.handleEnemyDeath(hit.enemy);
					}
				});
			}

			this.activeSpellEffects.push(spellEffect);
			
			if (spellEffect.type !== 'rock_trap') {
				setTimeout(() => {
					const index = this.activeSpellEffects.indexOf(spellEffect);
					if (index > -1) {
						this.activeSpellEffects.splice(index, 1);
					}
				}, spellEffect.duration || 600);
			}
		}
	}

	showVictoryScreen() {
		if (this.engine.menuManager.isMenuOpen()) return;
		this.engine.gameManager.endGame('victory', this);
	}

	formatTime(milliseconds) {
		const minutes = Math.floor(milliseconds / 60000);
		const seconds = Math.floor((milliseconds % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	startDeathAnimation() {
		this.engine.audio.playMusic('defeat', 0.7, false);
		if (this.playerDying) return;
		this.playerDying = true;
		this.state = 'dying';
	}

	showDefeatMenu() {
		if (this.engine.menuManager.isMenuOpen()) return;

		this.engine.gameManager.endGame('defeat', this);
	}

	applyGrayscaleFilter(renderer) {
		renderer.ctx.save();
		const imageData = renderer.ctx.getImageData(0, 0, renderer.width, renderer.height);
		const data = imageData.data;
		
		for (let i = 0; i < data.length; i += 4) {
			const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
			data[i] = gray;
			data[i + 1] = gray;
			data[i + 2] = gray;
		}
		
		renderer.ctx.putImageData(imageData, 0, 0);
		renderer.ctx.restore();
	}
}

