import BattlePlayer from '../Entities/BattlePlayer.js';
import EnemySpawner from '../Systems/EnemySpawner.js';
import AnimationSystem from '../Systems/AnimationSystem.js';
import Camera from '../Systems/Camera.js';
import Projectile from '../Entities/Projectile.js';
import ParticleSystem from '../Systems/ParticleSystem.js';
import DamageNumberSystem from '../Systems/DamageNumberSystem.js';
import XPOrbSystem from '../Systems/XPOrbSystem.js';
import CoinSystem, { COIN_DROP_CHANCE } from '../Systems/CoinSystem.js';
import ItemDropSystem from '../Systems/ItemDropSystem.js';
import { ItemConfig } from '../Config/ItemConfig.js';
import HUDRenderer from '../UI/HUDRenderer.js';
import SpellSystem from '../Systems/SpellSystem.js';
import { Spells } from '../Config/SpellConfig.js';
import { getPokemonConfig, PokemonSprites } from '../Config/SpriteConfig.js';
import { getRandomUpgrades, RarityColors, RarityGlowColors, UpgradeIcons, UpgradeType,  } from '../Config/UpgradeConfig.js';
import CollisionSystem from '../Systems/CollisionSystem.js';
import { MapTileCollisions, tilesToCollisionRects, MapCollisionColors } from '../Config/CollisionConfig.js';

const TILE_SIZE = 32;

const BALANCE_CONFIG = {
	XP: {
		BASE_XP_PER_LEVEL: 5,
		RANDOM_XP_PER_LEVEL: 5,
	},
	MONEY: {
		BASE_MONEY_PER_LEVEL: 5,
		RANDOM_MONEY_PER_LEVEL: 5,
	},
	LOOT: {
		ITEM_DROP_OFFSET_MIN: 25,
		ITEM_DROP_OFFSET_MAX: 15,
		COIN_DROP_OFFSET_MIN: 25,
		COIN_DROP_OFFSET_MAX: 15,
	},
	COMBAT: {
		KNOCKBACK_PROJECTILE_MULTIPLIER: 0.5,
		KNOCKBACK_BOSS_MULTIPLIER: 0.2,
		KNOCKBACK_HYDROCANON_MULTIPLIER: 0.3,
		EXPLOSION_PARTICLES_BASE: 15,
		EXPLOSION_PARTICLES_AOE_DIVISOR: 2,
		PROJECTILE_BOUNCE_SPEED_FALLBACK: 0.6,
	},
	PROJECTILES: {
		BASE_SPEED_MULTIPLIER: 0.6,
		BASE_SIZE: 8,
		AOE_RADIUS_MULTIPLIER: 2,
		BASE_RANGE: 600,
		MAX_LIFETIME: 600,
	},
	SPELLS: {
		HYDROCANON: {
			ROTATION_SPEED: 1000,
			DIRECTIONS_COUNT: 8,
			PROJECTILE_COUNT: 3,
			PROJECTILE_SPREAD: 0.15,
			PROJECTILE_SPEED: 0.8,
			PROJECTILE_SIZE_MIN: 12,
			PROJECTILE_SIZE_MAX: 4,
			DAMAGE_MULTIPLIER: 0.15,
			PLAYER_SIZE_MULTIPLIER: 0.4,
			PLAYER_OFFSET_FALLBACK: 30,
		},
		CIRCULAR_SWEEP: {
			STRIKES_DEFAULT: 2,
			STRIKE_DELAY_DEFAULT: 150,
			FORWARD_OFFSET_DEFAULT: 80,
			BASE_RADIUS_DEFAULT: 100,
			DURATION: 300,
			SWEEP_ANGLE: Math.PI,
			TRAIL_LENGTH_MULTIPLIER: 0.3,
		},
	},
	ANIMATIONS: {
		UPGRADE_MENU_DURATION: 600,
		UPGRADE_PRESS_ANIMATION: 100,
		CONSUMABLE_PRESS_ANIMATION: 200,
		DEATH_ZOOM_START: 1.5,
		DEATH_ZOOM_END: 3.0,
		HIT_FLASH_DURATION: 150,
		HIT_FLASH_ALPHA_MAX: 0.4,
	},
	CAMERA: {
		WIDTH: 1920,
		HEIGHT: 1080,
		ZOOM: 1.25,
		SHAKE_INTENSITY_HIT: 20,
		SHAKE_DURATION_HIT: 30,
		SHAKE_INTENSITY_EARTHQUAKE: 15,
		SHAKE_DURATION_EARTHQUAKE: 100,
	},
	AUDIO: {
		ORB_VOLUME: 0.05,
		ORB_PITCH: 0.3,
		ORB_PITCH_LEVELUP: 0.35,
		COINS_VOLUME: 0.5,
		COINS_PITCH: 0.2,
		HIT_VOLUME: 0.2,
		HIT_PITCH: 0.2,
		HIT_VOLUME_PLAYER: 0.3,
		HIT_PITCH_PLAYER: 0.3,
		OK_VOLUME: 0.3,
		OK_PITCH: 0.2,
		HYDROCANON_VOLUME: 0.3,
		HYDROCANON_PITCH: 0.2,
		EARTHQUAKE_VOLUME: 0.5,
		EARTHQUAKE_PITCH: 0.2,
		MUSIC_VOLUME_UPGRADE_MULTIPLIER: 0.5,
		DEFEAT_MUSIC_VOLUME: 0.7,
	},
	UI: {
		UPGRADE_CHOICES_COUNT: 3,
		MINIMAP_SIZE: 180,
		MINIMAP_PADDING: 5,
		MINIMAP_OFFSET_X: 10,
		MINIMAP_OFFSET_Y: 10,
		PLAYER_MARKER_SIZE: 4,
		ENEMY_MARKER_SIZE: 2,
		DAMAGE_NUMBER_OFFSET_Y: -30,
	},
	VISUAL: {
		DEBUG_GRID_COLOR: 'rgba(100, 100, 255, 0.3)',
		DEBUG_GRID_LINE_WIDTH: 1,
		MAP_BACKGROUND_COLOR: '#2a2a3e',
		MINIMAP_BACKGROUND_COLOR: 'rgba(20, 20, 30, 0.85)',
		MINIMAP_BORDER_COLOR: 'rgba(100, 100, 120, 0.8)',
		MINIMAP_BORDER_WIDTH: 2,
		PLAYER_MARKER_COLOR: '#4af626',
		ENEMY_MARKER_COLOR: '#ff4444',
		BOSS_MARKER_COLOR: '#ff0000',
		BOSS_MARKER_FONT_SIZE: 18,
		XP_ORB_COLOR: '#87CEEB',
		XP_ORB_SIZE: 2,
	},
};

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
		this.projectiles = [];
		this.enemyProjectiles = [];
		this.activeCircularStrikes = [];
		this.particleSystem = new ParticleSystem();
		this.damageNumberSystem = new DamageNumberSystem();
		this.xpOrbSystem = new XPOrbSystem();
		this.coinSystem = null;
		this.itemDropSystem = new ItemDropSystem();
		this.hudRenderer = new HUDRenderer();
		this.spellSystem = new SpellSystem();
		this.activeSpellEffects = [];
		this.debug = 0;
		this.upgradeChoices = null;
		this.selectedUpgradeIndex = 0;
		this.upgradeAnimationProgress = 0;
		this.upgradeAnimationDuration = BALANCE_CONFIG.ANIMATIONS.UPGRADE_MENU_DURATION;
		this.upgradePressAnimation = 0;
		this.wasEnterPressed = false;
		this.isEnterHeld = false;
		this.survivalTime = 0;
		this.originalMusicVolume = null;
		this.playerDying = false;
		this.deathAnimationComplete = false;
		this.deathZoomStart = BALANCE_CONFIG.ANIMATIONS.DEATH_ZOOM_START;
		this.deathZoomEnd = BALANCE_CONFIG.ANIMATIONS.DEATH_ZOOM_END;
		this.deathZoomProgress = 0;
		this.killerEnemy = null;
		this.collisionSystem = null;
		this.debugCollisions = false;
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
			
			const selectedPokemon = this.engine.selectedPokemon || 'quaksire';
			const pokemonConfig = getPokemonConfig(selectedPokemon);
			const pokemonWalkSprite = this.engine.sprites.get(`${selectedPokemon}_walk`);
			const pokemonHurtSprite = this.engine.sprites.get(`${selectedPokemon}_hurt`);
			const pokemonChargeSprite = this.engine.sprites.get(`${selectedPokemon}_charge`);
			const pokemonFaintSprite = this.engine.sprites.get(`${selectedPokemon}_faint`);
			const spriteImages = {};
			if (pokemonWalkSprite) spriteImages.walk = pokemonWalkSprite;
			if (pokemonHurtSprite) spriteImages.hurt = pokemonHurtSprite;
			if (pokemonChargeSprite) spriteImages.charge = pokemonChargeSprite;
			if (pokemonFaintSprite) spriteImages.faint = pokemonFaintSprite;
			const hasSprites = Object.keys(spriteImages).length > 0;
			const animationSystem = pokemonConfig && hasSprites ? 
				new AnimationSystem(pokemonConfig, spriteImages) : null;
			
			this.loadMapBackground(mapData.image);
			
			this.player = new BattlePlayer(this.mapWidth / 2 - 16, this.mapHeight / 2 - 16, animationSystem, pokemonConfig);
			this.player.money = this.engine.money;
			this.player.displayedMoney = this.engine.displayedMoney;
	
			if (this.engine.equippedItems) {
				this.engine.equippedItems.forEach(uniqueId => {
					const baseItemId = uniqueId.split('_')[0];
					const itemConfig = ItemConfig[baseItemId];
					if (itemConfig) {
						this.player.applyEquippedItem(baseItemId, itemConfig);
					}
				});
			}
			
			if (selectedPokemon) {
				this.engine.playedPokemons.add(selectedPokemon);
			}
			
			const mapTileCollisions = MapTileCollisions[mapData.image] || [];
			const tileRects = tilesToCollisionRects(mapTileCollisions, TILE_SIZE);
			this.collisionSystem = new CollisionSystem(tileRects);
			this.debugCollisions = false;
			
			this.enemySpawner = new EnemySpawner(mapData.id, this.mapWidth, this.mapHeight, this.engine.sprites, mapData.bossTimer, mapData.bossType, this.engine, this.collisionSystem);
			this.camera = new Camera(BALANCE_CONFIG.CAMERA.WIDTH, BALANCE_CONFIG.CAMERA.HEIGHT, this.mapWidth, this.mapHeight, BALANCE_CONFIG.CAMERA.ZOOM);
			this.projectiles = [];
			this.enemyProjectiles = [];
			this.particleSystem.clear();
			this.damageNumberSystem.clear();
			this.xpOrbSystem.clear();
			
			const coinImage = this.engine.sprites.get('coins');
			this.coinSystem = new CoinSystem(coinImage);
			
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
				this.mapWidth = bgImage.width;
				this.mapHeight = bgImage.height;
			}
		}
	}

	update(deltaTime) {
		const currentScene = this.engine.sceneManager.getCurrentScene();
		const isPauseOpen = currentScene && (currentScene.constructor.name === 'PauseScene' || currentScene === this.engine.sceneManager.scenes.pause);
		const isConfirmMenuOpen = currentScene && (currentScene.constructor.name === 'ConfirmMenuScene' || currentScene === this.engine.sceneManager.scenes.confirmMenu);
		
		if (isPauseOpen || isConfirmMenuOpen) {
			return;
		}
		
		if (this.upgradeChoices) {
			this.upgradeAnimationProgress = Math.min(this.upgradeAnimationProgress + deltaTime, this.upgradeAnimationDuration);
			if (this.upgradePressAnimation > 0) {
				this.upgradePressAnimation = Math.max(0, this.upgradePressAnimation - deltaTime);
			}
			this.updateUpgradeMenu();
			return;
		}


		if (this.state === 'playing' || this.state === 'dying') {
			this.updateBattle(deltaTime);
		}
	}

	updateBattle(deltaTime) {
		const currentScene = this.engine.sceneManager.getCurrentScene();
		const isPauseOpen = currentScene && (currentScene.constructor.name === 'PauseScene' || currentScene === this.engine.sceneManager.scenes.pause);
		const isConfirmMenuOpen = currentScene && (currentScene.constructor.name === 'ConfirmMenuScene' || currentScene === this.engine.sceneManager.scenes.confirmMenu);
		
		if (isPauseOpen || isConfirmMenuOpen) {
			return;
		}
		
		if (this.state === 'dying') {
			if (this.player && this.player.isDying) {
				this.player.update(deltaTime, this.engine.input, this.mapWidth, this.mapHeight, this.camera, this.collisionSystem);
				
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
			this.engine.sceneManager.pushScene('pause');
			return;
		}
		if (key === 'KeyC' && !this.upgradeChoices) {
			this.debugCollisions = !this.debugCollisions;
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
		if (key === 'KeyF' && !this.upgradeChoices) {
			this.useAssignedConsumable();
		}

		if (this.player && this.player.isAlive) {
			this.player.update(deltaTime, this.engine.input, this.mapWidth, this.mapHeight, this.camera, this.collisionSystem);
			
			if ((this.player.attackType === 'range' && this.player.autoShoot) || this.player.attackType === 'circular_sweep') {
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
				} else if (attackData.type === 'circular_sweep') {
					this.handleCircularSweepAttack(attackData);
				}
			}

			this.updateProjectiles(deltaTime);
			this.updateEnemyProjectiles(deltaTime);
			this.updateCircularStrikes(deltaTime);
			this.updateSystems(deltaTime);
			this.updateRockTraps(deltaTime);
			this.updateHydrocanon(deltaTime);

			if (this.enemySpawner) {
				this.enemySpawner.update(deltaTime, this.player.getCenterX(), this.player.getCenterY(), this.player.width, this.player.height);
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
		
		this.particleSystem.createExplosion(enemyCenterX, enemyCenterY, enemy.particleColor, BALANCE_CONFIG.COMBAT.EXPLOSION_PARTICLES_BASE);
		
		const xpReward = enemy.level * (BALANCE_CONFIG.XP.BASE_XP_PER_LEVEL + Math.floor(Math.random() * BALANCE_CONFIG.XP.RANDOM_XP_PER_LEVEL));
		this.xpOrbSystem.spawnOrb(enemyCenterX, enemyCenterY, xpReward);
		if (Math.random() < COIN_DROP_CHANCE && this.coinSystem) {
			const moneyReward = enemy.level * (BALANCE_CONFIG.MONEY.BASE_MONEY_PER_LEVEL + Math.floor(Math.random() * BALANCE_CONFIG.MONEY.RANDOM_MONEY_PER_LEVEL));
			this.spawnRegularCoin(enemyCenterX, enemyCenterY, moneyReward);
		}

		if (enemy.pokemonConfig && enemy.pokemonConfig.name) {
			const pokemonName = enemy.pokemonConfig.name;
			if (!this.engine.defeatedPokemonCounts[pokemonName]) {
				this.engine.defeatedPokemonCounts[pokemonName] = 0;
			}
			this.engine.defeatedPokemonCounts[pokemonName]++;
			
			this.dropLootFromPokemon(enemyCenterX, enemyCenterY, pokemonName);
		}

		if (this.engine.incubatingEgg) {
			if (this.engine.incubatingEgg.currentKills < this.engine.incubatingEgg.requiredKills) {
				this.engine.incubatingEgg.currentKills++;
			}
		}

		if (enemy.isBoss) {
			this.showVictoryScreen();
		}
	}

	hatchEgg(egg) {
		if (!egg.possiblePokemon || egg.possiblePokemon.length === 0) return;
		
		const randomIndex = Math.floor(Math.random() * egg.possiblePokemon.length);
		const hatchedPokemon = egg.possiblePokemon[randomIndex];
		
		if (!this.engine.encounteredPokemons) {
			this.engine.encounteredPokemons = new Set();
		}
		if (!this.engine.playedPokemons) {
			this.engine.playedPokemons = new Set();
		}
		
		this.engine.encounteredPokemons.add(hatchedPokemon);
		this.engine.playedPokemons.add(hatchedPokemon);
		
		this.engine.audio.play('ok', 0.5, 0.2);
	}

	dropLootFromPokemon(x, y, pokemonName) {
		const pokemonConfig = PokemonSprites[pokemonName];
		if (!pokemonConfig || !pokemonConfig.lootTable) return;

		pokemonConfig.lootTable.forEach(loot => {
			if (Math.random() < loot.chance) {
				const itemConfig = ItemConfig[loot.itemId];
				if (itemConfig) {
					const itemImage = this.engine.sprites.get(`item_${loot.itemId}`);
					const offsetAngle = Math.random() * Math.PI * 2;
					const offsetDistance = BALANCE_CONFIG.LOOT.ITEM_DROP_OFFSET_MIN + Math.random() * BALANCE_CONFIG.LOOT.ITEM_DROP_OFFSET_MAX;
					const itemX = x + Math.cos(offsetAngle) * offsetDistance;
					const itemY = y + Math.sin(offsetAngle) * offsetDistance;
					const dropScale = itemConfig.dropScale !== undefined ? itemConfig.dropScale : 1.0;
					this.itemDropSystem.spawnItem(itemX, itemY, loot.itemId, itemImage, dropScale);
				}
			}
		});
	}

	spawnRegularCoin(centerX, centerY, reward) {
		const coinOffsetAngle = Math.random() * Math.PI * 2;
		const coinOffsetDistance = BALANCE_CONFIG.LOOT.COIN_DROP_OFFSET_MIN + Math.random() * BALANCE_CONFIG.LOOT.COIN_DROP_OFFSET_MAX;
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
			projectile.update(deltaTime, this.collisionSystem);
		});
		this.projectiles = this.projectiles.filter(p => p.isActive);
	}

	updateEnemyProjectiles(deltaTime) {
		this.enemyProjectiles.forEach(projectile => {
			projectile.update(deltaTime, this.collisionSystem);
			
			if (projectile.collidesWith(this.player.getHitboxX(), this.player.getHitboxY(), this.player.width, this.player.height)) {
				this.damageNumberSystem.addDamage(this.player.getCenterX(), this.player.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y, projectile.damage, true);
				if (this.camera) {
					this.camera.shake(BALANCE_CONFIG.CAMERA.SHAKE_INTENSITY_HIT, BALANCE_CONFIG.CAMERA.SHAKE_DURATION_HIT);
				}
				this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME_PLAYER, BALANCE_CONFIG.AUDIO.HIT_PITCH_PLAYER);
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
			this.engine.audio.play('orb', BALANCE_CONFIG.AUDIO.ORB_VOLUME, BALANCE_CONFIG.AUDIO.ORB_PITCH);
			this.giveXP(collectedXP);
		}

		if (this.coinSystem) {
			const collectedCoins = this.coinSystem.update(deltaTime, this.player.getCenterX(), this.player.getCenterY(), this.player.fetchRange);
			if (collectedCoins > 0) {
				this.engine.audio.play('coins', BALANCE_CONFIG.AUDIO.COINS_VOLUME, BALANCE_CONFIG.AUDIO.COINS_PITCH);
				const multipliedAmount = collectedCoins * this.player.moneyGainMultiplier;
				this.player.addMoney(multipliedAmount);
				this.engine.money = this.player.money;
				this.engine.displayedMoney = this.player.displayedMoney;
			}
		}

		const collectedItems = this.itemDropSystem.update(deltaTime, this.player.getCenterX(), this.player.getCenterY(), this.player.fetchRange, this.engine.inventory);
		if (collectedItems.length > 0) {
			collectedItems.forEach(itemId => {
				const itemConfig = ItemConfig[itemId];
				if (itemConfig && itemConfig.category === 'equipable') {
					if (!this.engine.inventory[itemId]) {
						this.engine.inventory[itemId] = 0;
					}
					this.engine.inventory[itemId]++;
				} else {
					if (!this.engine.inventory[itemId]) {
						this.engine.inventory[itemId] = 0;
					}
					this.engine.inventory[itemId]++;
				}
				this.engine.audio.play('ok', BALANCE_CONFIG.AUDIO.OK_VOLUME, BALANCE_CONFIG.AUDIO.OK_PITCH);
			});
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
							BALANCE_CONFIG.PROJECTILES.MAX_LIFETIME,
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
							this.damageNumberSystem.addDamage(this.player.getCenterX(), this.player.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y, attackData.damage, true);
							if (this.camera) {
								this.camera.shake(BALANCE_CONFIG.CAMERA.SHAKE_INTENSITY_HIT, BALANCE_CONFIG.CAMERA.SHAKE_DURATION_HIT);
							}
							this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME_PLAYER, BALANCE_CONFIG.AUDIO.HIT_PITCH_PLAYER);
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
				const knockbackStrength = this.player.knockback * BALANCE_CONFIG.COMBAT.KNOCKBACK_PROJECTILE_MULTIPLIER * (directHitEnemy.isBoss ? BALANCE_CONFIG.COMBAT.KNOCKBACK_BOSS_MULTIPLIER : 1);
				const knockbackX = knockbackDir.x * knockbackStrength;
				const knockbackY = knockbackDir.y * knockbackStrength;
				
				this.damageNumberSystem.addDamage(directHitEnemy.getCenterX(), directHitEnemy.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y, projectile.damage, false, projectile.isCrit);
				this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME, BALANCE_CONFIG.AUDIO.HIT_PITCH);
				const died = directHitEnemy.takeDamage(projectile.damage, knockbackX, knockbackY, projectile.isCrit);
				
				this.applyLifeSteal(projectile.damage);
				
				if (died) {
					this.handleEnemyDeath(directHitEnemy);
				}
				
				if (projectile.hasBounce) {
					projectile.hitEnemies.add(directHitEnemy);
				}
				
				if (!projectile.exploded) {
					const explosionCount = projectile.hasAoE ? Math.floor(projectile.aoeRadius / BALANCE_CONFIG.COMBAT.EXPLOSION_PARTICLES_AOE_DIVISOR) : BALANCE_CONFIG.COMBAT.EXPLOSION_PARTICLES_BASE;
					this.particleSystem.createExplosion(projectile.x, projectile.y, projectile.color, explosionCount, projectile.type);
					projectile.exploded = true;
					
					enemies.forEach(enemy => {
						if (!enemy.isAlive || enemy === directHitEnemy || projectile.hitEnemies.has(enemy)) return;
						
						const dx = enemy.getCenterX() - projectile.x;
						const dy = enemy.getCenterY() - projectile.y;
						const distance = Math.sqrt(dx * dx + dy * dy);
						
						if (distance <= projectile.aoeRadius) {
					const knockbackDir = this.calculateKnockbackDirection(projectile.x, projectile.y, enemy.getCenterX(), enemy.getCenterY());
					const knockbackStrength = this.player.knockback * BALANCE_CONFIG.COMBAT.KNOCKBACK_PROJECTILE_MULTIPLIER * (enemy.isBoss ? BALANCE_CONFIG.COMBAT.KNOCKBACK_BOSS_MULTIPLIER : 1);
					const knockbackX = knockbackDir.x * knockbackStrength;
					const knockbackY = knockbackDir.y * knockbackStrength;
					
							const damageToDeal = projectile.damage * this.player.aoeDamageMultiplier;
							
							this.damageNumberSystem.addDamage(enemy.getCenterX(), enemy.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y, damageToDeal, false, projectile.isCrit);
					this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME, BALANCE_CONFIG.AUDIO.HIT_PITCH);
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
								projectile.velocityX = projectile.directionX * BALANCE_CONFIG.COMBAT.PROJECTILE_BOUNCE_SPEED_FALLBACK;
								projectile.velocityY = projectile.directionY * BALANCE_CONFIG.COMBAT.PROJECTILE_BOUNCE_SPEED_FALLBACK;
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

			effect.rotationAngle += (Math.PI * 2 * deltaTime) / BALANCE_CONFIG.SPELLS.HYDROCANON.ROTATION_SPEED;
			if (effect.rotationAngle >= Math.PI * 2) {
				effect.rotationAngle -= Math.PI * 2;
			}

			const directionIndex = Math.floor((effect.rotationAngle / (Math.PI * 2)) * BALANCE_CONFIG.SPELLS.HYDROCANON.DIRECTIONS_COUNT) % BALANCE_CONFIG.SPELLS.HYDROCANON.DIRECTIONS_COUNT;
			const directions = ['down', 'downRight', 'right', 'upRight', 'up', 'upLeft', 'left', 'downLeft'];
			const currentDirection = directions[directionIndex];
			this.player.forcedDirection = currentDirection;

			effect.playerX = this.player.getCenterX();
			effect.playerY = this.player.getCenterY();
			effect.playerSize = Math.max(this.player.spriteWidth, this.player.spriteHeight) * BALANCE_CONFIG.SPELLS.HYDROCANON.PLAYER_SIZE_MULTIPLIER;

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

			const playerOffset = effect.playerSize || BALANCE_CONFIG.SPELLS.HYDROCANON.PLAYER_OFFSET_FALLBACK;
			const spawnX = effect.playerX + currentDirX * playerOffset;
			const spawnY = effect.playerY + currentDirY * playerOffset;

			const now = Date.now();
			if (now - effect.lastProjectileTime >= effect.projectileInterval) {
				const spellConfig = Spells[effect.spellId || 'hydrocanon'];
				if (spellConfig && spellConfig.waveSoundEnabled) {
					this.engine.audio.play('hydrocanon', BALANCE_CONFIG.AUDIO.HYDROCANON_VOLUME, BALANCE_CONFIG.AUDIO.HYDROCANON_PITCH);
				}
				
				const projectileCount = BALANCE_CONFIG.SPELLS.HYDROCANON.PROJECTILE_COUNT;
				for (let i = 0; i < projectileCount; i++) {
					const spread = (i - (projectileCount - 1) / 2) * BALANCE_CONFIG.SPELLS.HYDROCANON.PROJECTILE_SPREAD;
					const angle = baseAngle + spread;
					const dirX = Math.cos(angle);
					const dirY = Math.sin(angle);
					
					const projectile = {
						x: spawnX,
						y: spawnY,
						dirX: dirX,
						dirY: dirY,
						speed: BALANCE_CONFIG.SPELLS.HYDROCANON.PROJECTILE_SPEED,
						size: BALANCE_CONFIG.SPELLS.HYDROCANON.PROJECTILE_SIZE_MIN + Math.random() * BALANCE_CONFIG.SPELLS.HYDROCANON.PROJECTILE_SIZE_MAX,
						maxDistance: effect.radius,
						traveledDistance: 0,
						active: true,
						damage: effect.damage * BALANCE_CONFIG.SPELLS.HYDROCANON.DAMAGE_MULTIPLIER
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
								enemy.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y,
								finalDamage,
								false,
								damageCalc.isCrit
							);

							const knockbackMultiplier = enemy.isBoss ? BALANCE_CONFIG.COMBAT.KNOCKBACK_BOSS_MULTIPLIER : 1;
							const knockbackX = projectile.dirX * effect.knockback * BALANCE_CONFIG.COMBAT.KNOCKBACK_HYDROCANON_MULTIPLIER * knockbackMultiplier;
							const knockbackY = projectile.dirY * effect.knockback * BALANCE_CONFIG.COMBAT.KNOCKBACK_HYDROCANON_MULTIPLIER * knockbackMultiplier;

							this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME, BALANCE_CONFIG.AUDIO.HIT_PITCH);
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
							enemy.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y,
							finalDamage,
							false,
							damageCalc.isCrit
						);

						const rockCenterX = rock.x + rock.width / 2;
						const rockCenterY = rock.y + rock.height / 2;
						const knockbackDir = this.calculateKnockbackDirection(rockCenterX, rockCenterY, enemy.getCenterX(), enemy.getCenterY());
						const knockbackMultiplier = enemy.isBoss ? BALANCE_CONFIG.COMBAT.KNOCKBACK_BOSS_MULTIPLIER : 1;
						const knockbackX = knockbackDir.x * effect.knockback * knockbackMultiplier;
						const knockbackY = knockbackDir.y * effect.knockback * knockbackMultiplier;

						this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME, BALANCE_CONFIG.AUDIO.HIT_PITCH);
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

		
		this.engine.audio.play('orb', BALANCE_CONFIG.AUDIO.ORB_VOLUME, BALANCE_CONFIG.AUDIO.ORB_PITCH_LEVELUP);

		if (leveledUp) {
			this.upgradeChoices = getRandomUpgrades(BALANCE_CONFIG.UI.UPGRADE_CHOICES_COUNT, this.player.upgrades, this.player);
			this.selectedUpgradeIndex = 0;
			this.upgradeAnimationProgress = 0;
			if (this.originalMusicVolume === null) {
				this.originalMusicVolume = this.engine.audio.musicVolume;
				this.engine.audio.setMusicVolume(this.originalMusicVolume * BALANCE_CONFIG.AUDIO.MUSIC_VOLUME_UPGRADE_MULTIPLIER);
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
					this.engine.audio.play('ok', BALANCE_CONFIG.AUDIO.OK_VOLUME, BALANCE_CONFIG.AUDIO.OK_PITCH);
					this.upgradePressAnimation = BALANCE_CONFIG.ANIMATIONS.UPGRADE_PRESS_ANIMATION;
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

	useAssignedConsumable() {
		if (!this.engine.assignedConsumable) return;
		
		const itemId = this.engine.assignedConsumable;
		const itemConfig = ItemConfig[itemId];
		
		if (!itemConfig || !itemConfig.effect) return;
		
		const currentQuantity = this.engine.inventory[itemId] || 0;
		if (currentQuantity <= 0) return;
		
		if (itemConfig.effect.type === 'heal') {
			if (this.player.hp >= this.player.maxHp) return;
			
			const healAmount = itemConfig.effect.value;
			this.player.hp = Math.min(this.player.hp + healAmount, this.player.maxHp);
			this.player.displayedHp = this.player.hp;
			
			const newQuantity = currentQuantity - 1;
			if (newQuantity <= 0) {
				delete this.engine.inventory[itemId];
				this.engine.assignedConsumable = null;
			} else {
				this.engine.inventory[itemId] = newQuantity;
			}
			
			this.player.consumablePressAnimation = BALANCE_CONFIG.ANIMATIONS.CONSUMABLE_PRESS_ANIMATION;
			this.engine.audio.play('ok', BALANCE_CONFIG.AUDIO.OK_VOLUME, BALANCE_CONFIG.AUDIO.OK_PITCH);
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
				const knockbackMultiplier = enemy.isBoss ? BALANCE_CONFIG.COMBAT.KNOCKBACK_BOSS_MULTIPLIER : 1;
				const knockbackX = knockbackDir.x * attackData.knockback * knockbackMultiplier;
				const knockbackY = knockbackDir.y * attackData.knockback * knockbackMultiplier;
				
				this.damageNumberSystem.addDamage(enemy.getCenterX(), enemy.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y, attackData.damage, false, attackData.isCrit);
				this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME, BALANCE_CONFIG.AUDIO.HIT_PITCH);
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
			aoeRadius = (attackData.projectileSize || BALANCE_CONFIG.PROJECTILES.BASE_SIZE) * BALANCE_CONFIG.PROJECTILES.AOE_RADIUS_MULTIPLIER * this.player.aoeRadiusMultiplier;
		}
		
		const projectile = new Projectile(
			this.player.getCenterX(),
			this.player.getCenterY(),
			targetX,
			targetY,
			attackData.damage,
			BALANCE_CONFIG.PROJECTILES.BASE_SPEED_MULTIPLIER * (attackData.projectileSpeed || 1),
			this.player.range,
			attackData.projectileColor || '#ffff00',
			attackData.projectileSize || BALANCE_CONFIG.PROJECTILES.BASE_SIZE,
			playerVelX,
			playerVelY,
			attackData.isCrit || false,
			aoeRadius,
			false,
			attackData.hasPiercing || false,
			attackData.hasBounce || false,
			attackData.bounceCount || 0,
			this.player.piercingCount || 0,
			this.player.bounceRange || BALANCE_CONFIG.PROJECTILES.BASE_RANGE,
			attackData.projectileType || 'normal'
		);
		this.projectiles.push(projectile);
	}

	handleCircularSweepAttack(attackData) {
		if (!this.enemySpawner || !attackData.spellConfig) return;

		const config = attackData.spellConfig;
		const strikes = config.strikes || BALANCE_CONFIG.SPELLS.CIRCULAR_SWEEP.STRIKES_DEFAULT;
		const strikeDelay = config.strikeDelay || BALANCE_CONFIG.SPELLS.CIRCULAR_SWEEP.STRIKE_DELAY_DEFAULT;
		const forwardOffset = config.forwardOffset || BALANCE_CONFIG.SPELLS.CIRCULAR_SWEEP.FORWARD_OFFSET_DEFAULT;
		const radius = config.baseRadius || BALANCE_CONFIG.SPELLS.CIRCULAR_SWEEP.BASE_RADIUS_DEFAULT;

		const angle = Math.atan2(attackData.directionY, attackData.directionX);

		for (let i = 0; i < strikes; i++) {
			const strikeX = attackData.playerX + attackData.directionX * forwardOffset;
			const strikeY = attackData.playerY + attackData.directionY * forwardOffset;

			this.activeCircularStrikes.push({
				x: strikeX,
				y: strikeY,
				radius: radius,
				angle: angle,
				damage: attackData.damage,
				isCrit: attackData.isCrit,
				knockback: attackData.knockback,
				startTime: Date.now() + (i * strikeDelay),
				duration: BALANCE_CONFIG.SPELLS.CIRCULAR_SWEEP.DURATION,
				hasHit: new Set(),
				playerX: attackData.playerX,
				playerY: attackData.playerY
			});
		}
	}

	updateCircularStrikes(deltaTime) {
		if (!this.enemySpawner) return;

		const currentTime = Date.now();
		const enemies = this.getAllEnemies();

		for (let i = this.activeCircularStrikes.length - 1; i >= 0; i--) {
			const strike = this.activeCircularStrikes[i];
			const elapsed = currentTime - strike.startTime;

			if (elapsed < 0) {
				continue;
			}

			if (elapsed >= strike.duration) {
				this.activeCircularStrikes.splice(i, 1);
				continue;
			}

			const progress = elapsed / strike.duration;
			const currentRadius = strike.radius * progress;
			const halfAngle = Math.PI / 2;
			const startAngle = strike.angle - halfAngle;
			const endAngle = strike.angle + halfAngle;

			enemies.forEach(enemy => {
				if (strike.hasHit.has(enemy)) return;

				const enemyCenterX = enemy.getCenterX();
				const enemyCenterY = enemy.getCenterY();
				const dx = enemyCenterX - strike.x;
				const dy = enemyCenterY - strike.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance <= currentRadius) {
					const enemyAngle = Math.atan2(dy, dx);
					let normalizedEnemyAngle = enemyAngle;
					let normalizedStartAngle = startAngle;
					let normalizedEndAngle = endAngle;

					while (normalizedEnemyAngle < 0) normalizedEnemyAngle += Math.PI * 2;
					while (normalizedStartAngle < 0) normalizedStartAngle += Math.PI * 2;
					while (normalizedEndAngle < 0) normalizedEndAngle += Math.PI * 2;

					let isInSector = false;
					if (normalizedStartAngle <= normalizedEndAngle) {
						isInSector = normalizedEnemyAngle >= normalizedStartAngle && normalizedEnemyAngle <= normalizedEndAngle;
					} else {
						isInSector = normalizedEnemyAngle >= normalizedStartAngle || normalizedEnemyAngle <= normalizedEndAngle;
					}

					if (isInSector) {
						strike.hasHit.add(enemy);
						const knockbackDir = this.calculateKnockbackDirection(strike.x, strike.y, enemyCenterX, enemyCenterY);
						const knockbackMultiplier = enemy.isBoss ? BALANCE_CONFIG.COMBAT.KNOCKBACK_BOSS_MULTIPLIER : 1;
						const knockbackX = knockbackDir.x * strike.knockback * knockbackMultiplier;
						const knockbackY = knockbackDir.y * strike.knockback * knockbackMultiplier;
						
						this.damageNumberSystem.addDamage(enemy.getCenterX(), enemy.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y, strike.damage, false, strike.isCrit);
						this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME, BALANCE_CONFIG.AUDIO.HIT_PITCH);
						const died = enemy.takeDamage(strike.damage, knockbackX, knockbackY, strike.isCrit);
						
						this.applyLifeSteal(strike.damage);
						
						if (died) {
							this.handleEnemyDeath(enemy);
						}
					}
				}
			});
		}
	}

	renderCircularStrikes(renderer) {
		const currentTime = Date.now();

		this.activeCircularStrikes.forEach(strike => {
			const elapsed = currentTime - strike.startTime;
			if (elapsed < 0 || elapsed >= strike.duration) return;

			const progress = elapsed / strike.duration;
			const sweepAngle = BALANCE_CONFIG.SPELLS.CIRCULAR_SWEEP.SWEEP_ANGLE;
			const startAngle = strike.angle - sweepAngle / 2;
			const currentAngle = startAngle + sweepAngle * progress;
			const bladeLength = strike.radius;
			const opacity = 1 - progress * 0.5;

			const bladeStartX = strike.playerX;
			const bladeStartY = strike.playerY;
			const bladeEndX = bladeStartX + Math.cos(currentAngle) * bladeLength;
			const bladeEndY = bladeStartY + Math.sin(currentAngle) * bladeLength;

			renderer.ctx.save();
			
			const gradient = renderer.ctx.createLinearGradient(bladeStartX, bladeStartY, bladeEndX, bladeEndY);
			gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.95})`);
			gradient.addColorStop(0.3, `rgba(220, 220, 220, ${opacity * 0.85})`);
			gradient.addColorStop(0.7, `rgba(180, 180, 180, ${opacity * 0.6})`);
			gradient.addColorStop(1, `rgba(150, 150, 150, ${opacity * 0.3})`);
			
			renderer.ctx.strokeStyle = gradient;
			renderer.ctx.lineWidth = 8;
			renderer.ctx.lineCap = 'round';
			renderer.ctx.shadowBlur = 10;
			renderer.ctx.shadowColor = `rgba(255, 255, 255, ${opacity * 0.5})`;
			renderer.ctx.beginPath();
			renderer.ctx.moveTo(bladeStartX, bladeStartY);
			renderer.ctx.lineTo(bladeEndX, bladeEndY);
			renderer.ctx.stroke();
			
			renderer.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
			renderer.ctx.lineWidth = 3;
			renderer.ctx.shadowBlur = 0;
			renderer.ctx.beginPath();
			renderer.ctx.moveTo(bladeStartX, bladeStartY);
			renderer.ctx.lineTo(bladeEndX, bladeEndY);
			renderer.ctx.stroke();
			
			const trailLength = bladeLength * BALANCE_CONFIG.SPELLS.CIRCULAR_SWEEP.TRAIL_LENGTH_MULTIPLIER;
			const trailStartX = bladeEndX - Math.cos(currentAngle) * trailLength;
			const trailStartY = bladeEndY - Math.sin(currentAngle) * trailLength;
			
			renderer.ctx.strokeStyle = `rgba(200, 200, 200, ${opacity * 0.4})`;
			renderer.ctx.lineWidth = 5;
			renderer.ctx.beginPath();
			renderer.ctx.moveTo(trailStartX, trailStartY);
			renderer.ctx.lineTo(bladeEndX, bladeEndY);
			renderer.ctx.stroke();
			
			renderer.ctx.restore();
		});
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

	}

	renderBattle(renderer) {
		if (this.camera) {
			this.camera.apply(renderer.ctx);
		}

		if (this.mapBackground) {
			renderer.ctx.drawImage(this.mapBackground, 0, 0);
		} else {
			renderer.drawRect(0, 0, this.mapWidth, this.mapHeight, BALANCE_CONFIG.VISUAL.MAP_BACKGROUND_COLOR);
		}

		if (this.collisionSystem && this.debugCollisions) {
			renderer.ctx.save();
			renderer.ctx.strokeStyle = BALANCE_CONFIG.VISUAL.DEBUG_GRID_COLOR;
			renderer.ctx.lineWidth = BALANCE_CONFIG.VISUAL.DEBUG_GRID_LINE_WIDTH;
			for (let x = 0; x <= this.mapWidth; x += TILE_SIZE) {
				renderer.ctx.beginPath();
				renderer.ctx.moveTo(x, 0);
				renderer.ctx.lineTo(x, this.mapHeight);
				renderer.ctx.stroke();
			}
			for (let y = 0; y <= this.mapHeight; y += TILE_SIZE) {
				renderer.ctx.beginPath();
				renderer.ctx.moveTo(0, y);
				renderer.ctx.lineTo(this.mapWidth, y);
				renderer.ctx.stroke();
			}
			renderer.ctx.restore();
			
			this.collisionSystem.render(renderer, true);
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

		this.renderCircularStrikes(renderer);

		this.particleSystem.render(renderer);
		this.xpOrbSystem.render(renderer);
		if (this.coinSystem) {
			this.coinSystem.render(renderer);
		}
		this.itemDropSystem.render(renderer);
		this.damageNumberSystem.render(renderer);

		this.activeSpellEffects.forEach(effect => {
			this.spellSystem.render(renderer, effect, this.engine);
		});

		if (this.camera) {
			this.camera.restore(renderer.ctx);
		}

		if (this.player && this.player.hitFlashTime > 0) {
			const alpha = Math.min(this.player.hitFlashTime / BALANCE_CONFIG.ANIMATIONS.HIT_FLASH_DURATION, BALANCE_CONFIG.ANIMATIONS.HIT_FLASH_ALPHA_MAX);
			renderer.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
			renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
		}

		if (this.player) {
			const bossTimerRemaining = this.enemySpawner ? this.enemySpawner.getBossTimerRemaining() : null;
			const bossTimerMax = this.enemySpawner ? this.enemySpawner.getBossTimerMax() : null;
			const currentBoss = this.enemySpawner ? this.enemySpawner.getBoss() : null;
			const bossDefeated = this.enemySpawner ? (this.enemySpawner.bossSpawned && (!currentBoss || !currentBoss.isAlive)) : false;
			const selectedPokemon = this.engine.selectedPokemon || 'quaksire';
			this.hudRenderer.render(renderer, this.player, renderer.width, renderer.height, this.survivalTime, bossTimerRemaining, bossTimerMax, selectedPokemon, this.engine, currentBoss, this.mapData, bossDefeated);
		}

		this.renderMinimap(renderer);
	}

	renderMinimap(renderer) {
		const minimapSize = BALANCE_CONFIG.UI.MINIMAP_SIZE;
		const minimapX = renderer.width - minimapSize - BALANCE_CONFIG.UI.MINIMAP_OFFSET_X;
		const minimapY = BALANCE_CONFIG.UI.MINIMAP_OFFSET_Y;
		const minimapPadding = BALANCE_CONFIG.UI.MINIMAP_PADDING;

		renderer.ctx.save();

		const minimapYWithTitle = minimapY;
		renderer.ctx.fillStyle = BALANCE_CONFIG.VISUAL.MINIMAP_BACKGROUND_COLOR;
		renderer.ctx.fillRect(minimapX, minimapYWithTitle, minimapSize, minimapSize);
		renderer.ctx.strokeStyle = BALANCE_CONFIG.VISUAL.MINIMAP_BORDER_COLOR;
		renderer.ctx.lineWidth = BALANCE_CONFIG.VISUAL.MINIMAP_BORDER_WIDTH;
		renderer.ctx.strokeRect(minimapX, minimapYWithTitle, minimapSize, minimapSize);

		const mapScale = (minimapSize - minimapPadding * 2) / Math.max(this.mapWidth, this.mapHeight);

		if (this.collisionSystem && this.collisionSystem.collisionRects) {
			const mapImage = this.mapData?.image || 'forest';
			const collisionColor = MapCollisionColors[mapImage] || 'rgba(100, 255, 100, 0.5)';
			renderer.ctx.fillStyle = collisionColor;
			
			const minimapTileSize = TILE_SIZE * mapScale;
			const coveredTiles = new Set();
			
			this.collisionSystem.collisionRects.forEach(rect => {
				const startTileX = Math.floor(rect.x / TILE_SIZE);
				const startTileY = Math.floor(rect.y / TILE_SIZE);
				const endTileX = Math.floor((rect.x + rect.width - 1) / TILE_SIZE);
				const endTileY = Math.floor((rect.y + rect.height - 1) / TILE_SIZE);
				
				for (let tileY = startTileY; tileY <= endTileY; tileY++) {
					for (let tileX = startTileX; tileX <= endTileX; tileX++) {
						const tileKey = `${tileX},${tileY}`;
						if (!coveredTiles.has(tileKey)) {
							coveredTiles.add(tileKey);
							const tileMinimapX = minimapX + minimapPadding + (tileX * TILE_SIZE * mapScale);
							const tileMinimapY = minimapYWithTitle + minimapPadding + (tileY * TILE_SIZE * mapScale);
							renderer.ctx.fillRect(tileMinimapX, tileMinimapY, minimapTileSize, minimapTileSize);
						}
					}
				}
			});
		}

		if (this.player) {
			const playerMinimapX = minimapX + minimapPadding + (this.player.getCenterX() * mapScale);
			const playerMinimapY = minimapYWithTitle + minimapPadding + (this.player.getCenterY() * mapScale);

			renderer.ctx.fillStyle = BALANCE_CONFIG.VISUAL.PLAYER_MARKER_COLOR;
			renderer.ctx.beginPath();
			renderer.ctx.arc(playerMinimapX, playerMinimapY, BALANCE_CONFIG.UI.PLAYER_MARKER_SIZE, 0, Math.PI * 2);
			renderer.ctx.fill();
		}

		if (this.enemySpawner) {
			const enemies = this.getAllEnemies();
			enemies.forEach(enemy => {
				const enemyMinimapX = minimapX + minimapPadding + (enemy.getCenterX() * mapScale);
				const enemyMinimapY = minimapYWithTitle + minimapPadding + (enemy.getCenterY() * mapScale);
				
				if (enemy.isBoss) {
					renderer.ctx.fillStyle = BALANCE_CONFIG.VISUAL.BOSS_MARKER_COLOR;
					renderer.ctx.font = `${BALANCE_CONFIG.VISUAL.BOSS_MARKER_FONT_SIZE}px Arial`;
					renderer.ctx.textAlign = 'center';
					renderer.ctx.textBaseline = 'middle';
					renderer.ctx.fillText('☠', enemyMinimapX, enemyMinimapY);
				} else {
					renderer.ctx.fillStyle = BALANCE_CONFIG.VISUAL.ENEMY_MARKER_COLOR;
					renderer.ctx.fillRect(enemyMinimapX - 1, enemyMinimapY - 1, BALANCE_CONFIG.UI.ENEMY_MARKER_SIZE, BALANCE_CONFIG.UI.ENEMY_MARKER_SIZE);
				}
			});
		}

		if (this.xpOrbSystem && this.xpOrbSystem.orbs.length > 0) {
			renderer.ctx.fillStyle = BALANCE_CONFIG.VISUAL.XP_ORB_COLOR;
			this.xpOrbSystem.orbs.forEach(orb => {
				const orbMinimapX = minimapX + minimapPadding + (orb.x * mapScale);
				const orbMinimapY = minimapYWithTitle + minimapPadding + (orb.y * mapScale);
				renderer.ctx.fillRect(orbMinimapX - 1, orbMinimapY - 1, BALANCE_CONFIG.VISUAL.XP_ORB_SIZE, BALANCE_CONFIG.VISUAL.XP_ORB_SIZE);
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

		const titleY = 180;
		const titleScale = Math.min(animProgress * 1.2, 1);
		renderer.ctx.save();
		renderer.ctx.translate(renderer.width / 2, titleY);
		renderer.ctx.scale(titleScale, titleScale);
		renderer.ctx.globalAlpha = animProgress;
		renderer.ctx.font = 'bold 48px Pokemon';
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.strokeStyle = '#000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.textAlign = 'center';
		renderer.ctx.strokeText('NIVEAU SUPÉRIEUR !', 0, 0);
		renderer.ctx.fillText('NIVEAU SUPÉRIEUR !', 0, 0);
		renderer.ctx.restore();

		renderer.ctx.save();
		renderer.ctx.globalAlpha = Math.max(0, (animProgress - 0.2) * 1.25);
		renderer.ctx.font = '24px Pokemon';
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.strokeStyle = '#000';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.textAlign = 'center';
		const subtitleY = titleY + 50;
		renderer.ctx.strokeText('Choisissez une amélioration', renderer.width / 2, subtitleY);
		renderer.ctx.fillText('Choisissez une amélioration', renderer.width / 2, subtitleY);
		renderer.ctx.restore();

		const cardWidth = 280;
		const cardHeight = 350;
		const spacing = 30;
		const startX = (renderer.width - (this.upgradeChoices.length * cardWidth + (this.upgradeChoices.length - 1) * spacing)) / 2;
		const cardY = 440;

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
			
			// Modern card style matching the rest of the app
			const backgroundColor = 'rgba(0, 0, 50, 0.7)';
			renderer.ctx.fillStyle = backgroundColor;
			renderer.ctx.fillRect(cardCenterX, cardCenterY, cardWidth, cardHeight);
			
			// White border (thicker if selected)
			renderer.ctx.strokeStyle = '#fff';
			renderer.ctx.lineWidth = isSelected ? 4 : 3;
			renderer.ctx.strokeRect(cardCenterX, cardCenterY, cardWidth, cardHeight);

			// Rarity indicator bar at top
			const rarityBarHeight = 4;
			renderer.ctx.fillStyle = borderColor;
			renderer.ctx.fillRect(cardCenterX, cardCenterY, cardWidth, rarityBarHeight);

			// Rarity text label
			const rarityNames = {
				'common': 'COMMUN',
				'rare': 'RARE',
				'epic': 'ÉPIQUE',
				'legendary': 'LÉGENDAIRE'
			};
			const rarityName = rarityNames[upgrade.rarity] || upgrade.rarity.toUpperCase();
			renderer.ctx.font = 'bold 14px Pokemon';
			renderer.ctx.fillStyle = borderColor;
			renderer.ctx.textAlign = 'center';
			renderer.ctx.strokeStyle = '#000';
			renderer.ctx.lineWidth = 1;
			const rarityY = cardCenterY + 30;
			renderer.ctx.strokeText(rarityName, 0, rarityY);
			renderer.ctx.fillText(rarityName, 0, rarityY);

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
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.strokeStyle = '#000';
			renderer.ctx.lineWidth = 2;
			const iconY = cardCenterY + 80;
			renderer.ctx.strokeText(icon, 0, iconY);
			renderer.ctx.fillText(icon, 0, iconY);
			renderer.ctx.lineWidth = 1;

			renderer.ctx.font = 'bold 24px Pokemon';
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.strokeStyle = '#000';
			renderer.ctx.lineWidth = 1;
			const nameY = cardCenterY + 135;
			const nameLines = upgrade.name.split('\n');
			let currentNameY = nameY;
			nameLines.forEach((line, lineIndex) => {
				renderer.ctx.strokeText(line, 0, currentNameY);
				renderer.ctx.fillText(line, 0, currentNameY);
				if (lineIndex < nameLines.length - 1) {
					currentNameY += 28;
				}
			});

			let valueText = '';
			if (typeof upgrade.value === 'number') {
				if (upgrade.value >= 1 && upgrade.value < 2) {
					const percent = Math.round((upgrade.value - 1) * 100);
					valueText = `+${percent}%`;
				} else if (upgrade.value < 1) {
					const percent = Math.round(upgrade.value * 100);
					valueText = `+${percent}%`;
				} else {
					valueText = '';
				}
			}
			if (valueText) {
				renderer.ctx.font = '20px Pokemon';
				renderer.ctx.fillStyle = borderColor;
				renderer.ctx.strokeStyle = '#000';
				renderer.ctx.lineWidth = 1;
				const valueY = currentNameY + 30;
				renderer.ctx.strokeText(valueText, 0, valueY);
				renderer.ctx.fillText(valueText, 0, valueY);
			}

			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.font = '16px Pokemon';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.strokeStyle = '#000';
			renderer.ctx.lineWidth = 1;
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
			let lineY = valueText ? currentNameY + 60 : currentNameY + 30;
			words.forEach(word => {
				const testLine = line + word + ' ';
				const metrics = renderer.ctx.measureText(testLine);
				if (metrics.width > cardWidth - 40) {
					renderer.ctx.strokeText(line, 0, lineY);
					renderer.ctx.fillText(line, 0, lineY);
					line = word + ' ';
					lineY += 25;
				} else {
					line = testLine;
				}
			});
			renderer.ctx.strokeText(line, 0, lineY);
			renderer.ctx.fillText(line, 0, lineY);

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
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.strokeStyle = '#000';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.textAlign = 'center';
		const instructionText = this.upgradeAnimationProgress >= this.upgradeAnimationDuration 
			? '← → pour naviguer | ENTRÉE pour choisir'
			: 'Chargement...';
		const instructionY = renderer.height - 50;
		renderer.ctx.strokeText(instructionText, renderer.width / 2, instructionY);
		renderer.ctx.fillText(instructionText, renderer.width / 2, instructionY);
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
			if (spellEffect.type === 'earthquake') {
				if (this.camera) {
					this.camera.shake(BALANCE_CONFIG.CAMERA.SHAKE_INTENSITY_EARTHQUAKE, BALANCE_CONFIG.CAMERA.SHAKE_DURATION_EARTHQUAKE);
				}
				this.engine.audio.play('earthquake', BALANCE_CONFIG.AUDIO.EARTHQUAKE_VOLUME, BALANCE_CONFIG.AUDIO.EARTHQUAKE_PITCH);
			}
			if (spellEffect.hitEnemies) {
				spellEffect.hitEnemies.forEach(hit => {
					const damageCalc = this.player.calculateDamage();
					const finalDamage = this.calculateFinalDamage(spellEffect.damage, damageCalc.isCrit);
					
					this.damageNumberSystem.addDamage(
						hit.enemy.getCenterX(),
						hit.enemy.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y,
						finalDamage,
						false,
						damageCalc.isCrit
					);

					const knockbackMultiplier = hit.enemy.isBoss ? BALANCE_CONFIG.COMBAT.KNOCKBACK_BOSS_MULTIPLIER : 1;
					const knockbackX = hit.knockbackDirection.x * hit.knockback * knockbackMultiplier;
					const knockbackY = hit.knockbackDirection.y * hit.knockback * knockbackMultiplier;
					
					this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME, BALANCE_CONFIG.AUDIO.HIT_PITCH);
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
		this.engine.gameManager.endGame('victory', this);
	}

	formatTime(milliseconds) {
		const minutes = Math.floor(milliseconds / 60000);
		const seconds = Math.floor((milliseconds % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	startDeathAnimation() {
		this.engine.audio.playMusic('defeat', BALANCE_CONFIG.AUDIO.DEFEAT_MUSIC_VOLUME, false);
		if (this.playerDying) return;
		this.playerDying = true;
		this.state = 'dying';
	}

	showDefeatMenu() {
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

