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
import { getPokemonConfig, PokemonSprites, getPokemonLootTable } from '../Config/SpriteConfig.js';
import { getRandomUpgrades, RarityColors, RarityGlowColors, RarityBackgroundColors, UpgradeIcons, UpgradeType, UpgradeRarity } from '../Config/UpgradeConfig.js';
import CollisionSystem from '../Systems/CollisionSystem.js';
import { createStatusEffect, getEffectForPlayerPokemonType } from '../Systems/StatusEffectSystem.js';
import { MapTileCollisions, tilesToCollisionRects, MapCollisionColors } from '../Config/CollisionConfig.js';
import SaveManager from '../Systems/SaveManager.js';
import ChestSystem from '../Systems/ChestSystem.js';
import { SkillTreeConfig } from '../Config/SkillTreeConfig.js';

const TILE_SIZE = 32;

const BALANCE_CONFIG = {
	XP: {
		BASE_XP_PER_LEVEL: 15,
		RANDOM_XP_PER_LEVEL: 10,
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
		EXPLOSION_PARTICLES_BASE: 3,
		EXPLOSION_PARTICLES_ENEMY_DEATH: 60,
		EXPLOSION_PARTICLES_AOE_DIVISOR: 2,
		PROJECTILE_BOUNCE_SPEED_FALLBACK: 0.6,
	},
	PROJECTILES: {
		BASE_SPEED_MULTIPLIER: 0.6,
		BASE_SIZE: 8,
		BASE_AOE_RADIUS: 80,
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
		ZOOM: 2,
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
		this.initialMoney = 0;
		this.initialDisplayedMoney = 0;
		this.sessionInventory = {};
		this.sessionEggs = {};
		this.bossDefeated = false;
		this.isEndlessAfterVictory = false;
		this.chestSystem = new ChestSystem(this.engine);
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
			this.initialMoney = this.engine.money || 0;
			this.initialDisplayedMoney = this.engine.displayedMoney || 0;
			this.sessionInventory = {};
			this.sessionEggs = {};
			this.bossDefeated = false;
			this.isEndlessAfterVictory = false;
			
			const selectedPokemon = this.engine.selectedPokemon || 'quagsire';
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
			
			const pokemonIVs = this.engine.pokemonIVs && this.engine.pokemonIVs[selectedPokemon] ? this.engine.pokemonIVs[selectedPokemon] : null;
			this.player = new BattlePlayer(this.mapWidth / 2 - 16, this.mapHeight / 2 - 16, animationSystem, pokemonConfig, pokemonIVs);
			this.player.money = this.initialMoney;
			this.player.displayedMoney = this.initialDisplayedMoney;
	
			if (this.engine.equippedItems) {
				this.engine.equippedItems.forEach(uniqueId => {
					const baseItemId = uniqueId.split('_')[0];
					const itemConfig = ItemConfig[baseItemId];
					if (itemConfig) {
						this.player.applyEquippedItem(baseItemId, itemConfig);
					}
				});
			}
			
			this.applySkillTreeEffects();
			
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
			
			if (this.coinSystem) {
				this.coinSystem.clear();
			}
			if (this.itemDropSystem) {
				this.itemDropSystem.clear();
			}
			if (this.chestSystem) {
				this.chestSystem.clear();
			}
			
			const coinImage = this.engine.sprites.get('coins');
			this.coinSystem = new CoinSystem(coinImage);
			
			if (!this.chestSystem) {
				this.chestSystem = new ChestSystem(this.engine);
			}
			
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
		if (key === 'KeyE' && !this.upgradeChoices) {
			if (this.player) {
				this.player.eggPressAnimation = BALANCE_CONFIG.ANIMATIONS.CONSUMABLE_PRESS_ANIMATION;
			}
			this.engine.sceneManager.pushScene('pause', { openEggsMenu: true });
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
		if (key === 'Space' && !this.upgradeChoices && this.player && this.player.attackType === 'range') {
			this.player.toggleAutoShoot();
		}

		if (this.player && this.player.isAlive) {
			const enemies = this.getAllEnemies();
			this.player.update(deltaTime, this.engine.input, this.mapWidth, this.mapHeight, this.camera, this.collisionSystem, enemies);
			
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
				const playerVelocityX = this.player.velocityX * 16;
				const playerVelocityY = this.player.velocityY * 16;
				this.enemySpawner.update(deltaTime, this.player.getCenterX(), this.player.getCenterY(), this.player.width, this.player.height, playerVelocityX, playerVelocityY);
				
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


	calculateFinalDamage(baseDamage, isCrit = false) {
		return isCrit ? baseDamage * this.player.critDamage : baseDamage;
	}

	handleEnemyDeath(enemy) {
		const enemyCenterX = enemy.getCenterX();
		const enemyCenterY = enemy.getCenterY();
		
		this.particleSystem.createExplosion(enemyCenterX, enemyCenterY, enemy.particleColor, BALANCE_CONFIG.COMBAT.EXPLOSION_PARTICLES_ENEMY_DEATH);
		
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
				
				if (this.engine.incubatingEgg.currentKills >= this.engine.incubatingEgg.requiredKills) {
					if (!this.engine.eggProgress) {
						this.engine.eggProgress = {};
					}
					this.engine.eggProgress[this.engine.incubatingEgg.uniqueId] = {
						currentKills: this.engine.incubatingEgg.currentKills,
						requiredKills: this.engine.incubatingEgg.requiredKills
					};
					const itemId = this.engine.incubatingEgg.itemId;
					if (!this.engine.inventory[itemId]) {
						this.engine.inventory[itemId] = 0;
					}
					this.engine.inventory[itemId]++;
					this.engine.incubatingEgg = null;
					SaveManager.saveGame(this.engine, false);
				}
			}
		}

		if (enemy.isBoss) {
			// Ne pas transférer les récompenses immédiatement
			// Elles seront transférées à la mort en endless ou au retour au village
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

	getItemRarity(itemId, itemConfig) {
		if (!itemConfig.rarity) return 'common';
		if (itemConfig.rarity === 'legendary') return 'epic';
		return itemConfig.rarity;
	}

	dropLootFromPokemon(x, y, pokemonName) {
		const lootTable = getPokemonLootTable(pokemonName);
		if (!lootTable || lootTable.length === 0) {
			return;
		}

		const lootRareChance = this.getLootRareChance();
		const baseDropChanceBonus = this.getBaseDropChance();
		const epicDropChanceBonus = this.getEpicDropChance();

		if (lootTable.length === 0) {
			return;
		}

		const itemsByTier = {
			common: [],
			rare: [],
			epic: []
		};

		for (const loot of lootTable) {
			const itemConfig = ItemConfig[loot.itemId];
			if (!itemConfig) continue;
			
			const rarity = this.getItemRarity(loot.itemId, itemConfig);
			
			itemsByTier[rarity].push({
				itemId: loot.itemId,
				itemConfig: itemConfig,
				rarity: rarity
			});
		}

		const BASE_DROP_CHANCE = 0.10;
		const finalDropChance = Math.min(1.0, BASE_DROP_CHANCE + baseDropChanceBonus);
		const dropRoll = Math.random();
		
		if (dropRoll >= finalDropChance) {
			return;
		}

		let commonChance = 0.80;
		let rareChance = 0.15;
		let epicChance = 0.05 + epicDropChanceBonus;

		if (lootRareChance > 0) {
			const bonus = lootRareChance * 0.3;
			commonChance = Math.max(0.50, commonChance - bonus);
			rareChance = Math.min(0.40, rareChance + bonus * 0.6);
			epicChance = Math.min(0.15, epicChance + bonus * 0.4);
		}

		const total = commonChance + rareChance + epicChance;
		commonChance /= total;
		rareChance /= total;
		epicChance /= total;

		const tierRoll = Math.random();
		let selectedTier = null;
		let tierChance = 0;

		if (tierRoll < commonChance) {
			selectedTier = 'common';
			tierChance = commonChance;
		} else if (tierRoll < commonChance + rareChance) {
			selectedTier = 'rare';
			tierChance = rareChance;
		} else {
			selectedTier = 'epic';
			tierChance = epicChance;
		}

		let tierItems = itemsByTier[selectedTier];
		
		if (tierItems.length === 0) {
			const fallbackTiers = ['common', 'rare', 'epic'];
			for (const fallbackTier of fallbackTiers) {
				if (itemsByTier[fallbackTier].length > 0) {
					selectedTier = fallbackTier;
					tierItems = itemsByTier[fallbackTier];
					break;
				}
			}
			
			if (tierItems.length === 0) {
				return;
			}
		}

		const selectedItem = tierItems[Math.floor(Math.random() * tierItems.length)];
		const itemImage = this.engine.sprites.get(`item_${selectedItem.itemId}`);
		
		if (!itemImage) {
			return;
		}

		this.spawnItemDrop(x, y, selectedItem.itemId, itemImage, selectedItem.itemConfig);
	}

	spawnItemDrop(x, y, itemId, itemImage, itemConfig) {
		if (itemConfig.category === 'chest') {
			const dropScale = itemConfig.dropScale !== undefined ? itemConfig.dropScale : 1.0;
			this.itemDropSystem.spawnItem(x, y, itemId, itemImage, dropScale);
		} else {
			const offsetAngle = Math.random() * Math.PI * 2;
			const offsetDistance = BALANCE_CONFIG.LOOT.ITEM_DROP_OFFSET_MIN + Math.random() * BALANCE_CONFIG.LOOT.ITEM_DROP_OFFSET_MAX;
			const itemX = x + Math.cos(offsetAngle) * offsetDistance;
			const itemY = y + Math.sin(offsetAngle) * offsetDistance;
			const dropScale = itemConfig.dropScale !== undefined ? itemConfig.dropScale : 1.0;
			this.itemDropSystem.spawnItem(itemX, itemY, itemId, itemImage, dropScale);
		}
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
			}
		}

		const collectedItems = this.itemDropSystem.update(deltaTime, this.player.getCenterX(), this.player.getCenterY(), this.player.fetchRange, this.getSessionInventory());
		if (collectedItems.length > 0) {
			collectedItems.forEach(itemId => {
				const itemConfig = ItemConfig[itemId];
				if (itemConfig && itemConfig.category === 'egg') {
					if (!this.sessionEggs[itemId]) {
						this.sessionEggs[itemId] = [];
					}
					const uniqueId = `${itemId}_${Date.now()}_${Math.random()}`;
					this.sessionEggs[itemId].push(uniqueId);
					
					if (!this.sessionInventory[itemId]) {
						this.sessionInventory[itemId] = 0;
					}
					this.sessionInventory[itemId]++;
				} else if (itemConfig && itemConfig.category === 'equipable') {
					if (!this.sessionInventory[itemId]) {
						this.sessionInventory[itemId] = 0;
					}
					this.sessionInventory[itemId]++;
				} else {
					if (!this.sessionInventory[itemId]) {
						this.sessionInventory[itemId] = 0;
					}
					this.sessionInventory[itemId]++;
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
				
				let baseDamageToDeal = projectile.damage;
				if (projectile.hasPiercing) {
					const pierceCount = projectile.hitEnemies.size;
					const damageReduction = projectile.piercingDamageReduction || 0.2;
					const damageMultiplier = Math.max(0.2, 1 - (pierceCount * damageReduction));
					baseDamageToDeal = Math.floor(projectile.baseDamage * damageMultiplier);
					projectile.damage = baseDamageToDeal;
				}
				
				const isCrit = Math.random() < projectile.critChance;
				const damageToDeal = isCrit ? baseDamageToDeal * projectile.critDamage : baseDamageToDeal;
				
				const knockbackDir = this.calculateKnockbackDirection(projectile.x, projectile.y, directHitEnemy.getCenterX(), directHitEnemy.getCenterY());
				const knockbackStrength = this.player.knockback * BALANCE_CONFIG.COMBAT.KNOCKBACK_PROJECTILE_MULTIPLIER * (directHitEnemy.isBoss ? BALANCE_CONFIG.COMBAT.KNOCKBACK_BOSS_MULTIPLIER : 1);
				const knockbackX = knockbackDir.x * knockbackStrength;
				const knockbackY = knockbackDir.y * knockbackStrength;
				
				this.damageNumberSystem.addDamage(directHitEnemy.getCenterX(), directHitEnemy.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y, damageToDeal, false, isCrit);
				this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME, BALANCE_CONFIG.AUDIO.HIT_PITCH);
				const died = directHitEnemy.takeDamage(damageToDeal, knockbackX, knockbackY, isCrit);
				
				if (projectile.hasEffect && Math.random() < projectile.effectProcChance) {
					const effectType = getEffectForPlayerPokemonType(projectile.playerPokemonType);
					const baseDamage = 5;
					const baseIntensity = 0.5;
					const baseDuration = 2000;
					const statusEffect = createStatusEffect(
						effectType,
						baseDamage,
						baseIntensity,
						baseDuration,
						projectile.effectDamageMultiplier,
						projectile.effectIntensityMultiplier,
						projectile.effectDurationMultiplier
					);
					directHitEnemy.applyStatusEffect(statusEffect);
				}
				
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
					
							const baseAoeDamage = projectile.damage * this.player.aoeDamageMultiplier;
							const isCrit = Math.random() < projectile.critChance;
							const damageToDeal = isCrit ? baseAoeDamage * projectile.critDamage : baseAoeDamage;
							
							this.damageNumberSystem.addDamage(enemy.getCenterX(), enemy.getCenterY() + BALANCE_CONFIG.UI.DAMAGE_NUMBER_OFFSET_Y, damageToDeal, false, isCrit);
					this.engine.audio.play('hit', BALANCE_CONFIG.AUDIO.HIT_VOLUME, BALANCE_CONFIG.AUDIO.HIT_PITCH);
							const died = enemy.takeDamage(damageToDeal, knockbackX, knockbackY, isCrit);
					
					if (projectile.hasEffect && Math.random() < projectile.effectProcChance) {
						const effectType = getEffectForPlayerPokemonType(projectile.playerPokemonType);
						const baseDamage = 2;
						const baseIntensity = 0.5;
						const baseDuration = 2000;
						const statusEffect = createStatusEffect(
							effectType,
							baseDamage,
							baseIntensity,
							baseDuration,
							projectile.effectDamageMultiplier,
							projectile.effectIntensityMultiplier,
							projectile.effectDurationMultiplier
						);
						enemy.applyStatusEffect(statusEffect);
					}
					
					if (died) {
						this.handleEnemyDeath(enemy);
					}
					
						projectile.hitEnemies.add(enemy);
					}
					});
				}
				
				if (projectile.hasPiercing) {
					projectile.hitEnemies.add(directHitEnemy);
					// piercingMaxCount = 0 signifie illimité
					if (projectile.piercingCount > 0 && projectile.hitEnemies.size > projectile.piercingCount) {
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
			this.engine.audio.play('pokemon_level_up', 0.7, 0.0);
			this.player.increaseStatsOnLevelUp();
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
		
		const sessionInventory = this.getSessionInventory();
		const currentQuantity = sessionInventory[itemId] || 0;
		if (currentQuantity <= 0) return;
		
		if (itemConfig.effect.type === 'heal') {
			if (this.player.hp >= this.player.maxHp) return;
			
			const healAmount = itemConfig.effect.value;
			this.player.hp = Math.min(this.player.hp + healAmount, this.player.maxHp);
			this.player.displayedHp = this.player.hp;
			
			if (this.engine.inventory[itemId] && this.engine.inventory[itemId] > 0) {
				const newQuantity = this.engine.inventory[itemId] - 1;
				if (newQuantity <= 0) {
					delete this.engine.inventory[itemId];
					this.engine.assignedConsumable = null;
				} else {
					this.engine.inventory[itemId] = newQuantity;
				}
			} else if (this.sessionInventory[itemId] && this.sessionInventory[itemId] > 0) {
				const newQuantity = this.sessionInventory[itemId] - 1;
				if (newQuantity <= 0) {
					delete this.sessionInventory[itemId];
					if (!this.engine.inventory[itemId] || this.engine.inventory[itemId] <= 0) {
						this.engine.assignedConsumable = null;
					}
				} else {
					this.sessionInventory[itemId] = newQuantity;
				}
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
		if (this.player.hasUpgradeType && this.player.hasUpgradeType(UpgradeType.PROJECTILE_AOE)) {
			aoeRadius = BALANCE_CONFIG.PROJECTILES.BASE_AOE_RADIUS * this.player.aoeRadiusMultiplier;
		}
		
		const projectileCount = this.player.projectileCount || 1;
		const spreadAngle = projectileCount > 1 ? Math.PI / 12 : 0;
		
		for (let i = 0; i < projectileCount; i++) {
			let adjustedTargetX = targetX;
			let adjustedTargetY = targetY;
			
			if (projectileCount > 1) {
				const angle = Math.atan2(targetY - this.player.getCenterY(), targetX - this.player.getCenterX());
				const offsetAngle = (i - (projectileCount - 1) / 2) * spreadAngle;
				const distance = Math.sqrt(
					Math.pow(targetX - this.player.getCenterX(), 2) + 
					Math.pow(targetY - this.player.getCenterY(), 2)
				);
				adjustedTargetX = this.player.getCenterX() + Math.cos(angle + offsetAngle) * distance;
				adjustedTargetY = this.player.getCenterY() + Math.sin(angle + offsetAngle) * distance;
			}
			
			const projectile = new Projectile(
				this.player.getCenterX(),
				this.player.getCenterY(),
				adjustedTargetX,
				adjustedTargetY,
				attackData.damage,
				BALANCE_CONFIG.PROJECTILES.BASE_SPEED_MULTIPLIER * (attackData.projectileSpeed || 1) * this.player.projectileSpeedMultiplier,
				this.player.range,
				attackData.projectileColor || '#ffff00',
				BALANCE_CONFIG.PROJECTILES.BASE_SIZE,
				playerVelX,
				playerVelY,
				aoeRadius,
				false,
				attackData.hasPiercing || false,
				attackData.hasBounce || false,
				attackData.bounceCount || 0,
				attackData.piercingCount || 0,
				attackData.bounceRange || BALANCE_CONFIG.PROJECTILES.BASE_RANGE,
				attackData.projectileType || 'normal',
				attackData.piercingDamageReduction || 0.2,
				attackData.hasEffect || false,
				attackData.effectProcChance || 0,
				attackData.effectDamageMultiplier || 1,
				attackData.effectIntensityMultiplier || 1,
				attackData.effectDurationMultiplier || 1,
				attackData.playerPokemonType || 'normal',
				this.player.critChance || 0,
				this.player.critDamage || 1.5
			);
			this.projectiles.push(projectile);
		}
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
						if (this.bossDefeated && this.player) {
							if (this.transferSessionRewardsToEngine) {
								this.transferSessionRewardsToEngine();
							} else {
								engine.money = this.player.money;
								engine.displayedMoney = this.player.displayedMoney;
							}
							SaveManager.saveGame(engine, false);
						}
					engine.menuManager.closeMenu();
					engine.sceneManager.changeScene('game', { enteringFromTop: true });
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
			projectile.render(renderer, this.debugCollisions);
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
			const selectedPokemon = this.engine.selectedPokemon || 'quagsire';
			this.hudRenderer.render(renderer, this.player, renderer.width, renderer.height, this.survivalTime, bossTimerRemaining, bossTimerMax, selectedPokemon, this.engine, currentBoss, this.mapData, bossDefeated, this);
		}

		this.renderMinimap(renderer);

		if (this.player && this.player.attackType === 'range') {
			if (!this.player.autoShoot) {
				this.engine.canvas.style.cursor = 'none';
				this.renderManualCursor(renderer);
			} else {
				this.engine.canvas.style.cursor = 'none';
			}
		} else {
			this.engine.canvas.style.cursor = 'default';
		}
	}

	renderManualCursor(renderer) {
		if (!this.player || this.player.autoShoot || this.player.attackType !== 'range') return;

		const mousePos = this.engine.input.getMousePosition();

		renderer.ctx.save();
		renderer.ctx.strokeStyle = '#ffffff';
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.lineWidth = 2;

		const crosshairSize = 12;
		const crosshairGap = 4;

		renderer.ctx.beginPath();
		renderer.ctx.moveTo(mousePos.x - crosshairSize, mousePos.y);
		renderer.ctx.lineTo(mousePos.x - crosshairGap, mousePos.y);
		renderer.ctx.moveTo(mousePos.x + crosshairGap, mousePos.y);
		renderer.ctx.lineTo(mousePos.x + crosshairSize, mousePos.y);
		renderer.ctx.moveTo(mousePos.x, mousePos.y - crosshairSize);
		renderer.ctx.lineTo(mousePos.x, mousePos.y - crosshairGap);
		renderer.ctx.moveTo(mousePos.x, mousePos.y + crosshairGap);
		renderer.ctx.lineTo(mousePos.x, mousePos.y + crosshairSize);
		renderer.ctx.stroke();

		renderer.ctx.beginPath();
		renderer.ctx.arc(mousePos.x, mousePos.y, 3, 0, Math.PI * 2);
		renderer.ctx.fill();

		renderer.ctx.restore();
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

	getUpgradeValueDisplay(upgrade) {
		if (!this.player || !upgrade.value) return null;
		
		const upgradeConfig = {
			[UpgradeType.DAMAGE]: { prop: 'damage', calc: 'multiply', floor: true },
			[UpgradeType.ATTACK_SPEED]: { prop: 'attackSpeed', calc: 'multiply' },
			[UpgradeType.RANGE]: { prop: 'range', calc: 'multiply' },
			[UpgradeType.SPEED]: { prop: 'speed', calc: 'multiply' },
			[UpgradeType.MAX_HP]: { prop: 'maxHp', calc: 'add' },
			[UpgradeType.HP_REGEN]: { prop: 'hpRegen', calc: 'add' },
			[UpgradeType.CRIT_CHANCE]: { prop: 'critChance', calc: 'add' },
			[UpgradeType.CRIT_DAMAGE]: { prop: 'critDamage', calc: 'add' },
			[UpgradeType.AOE_RADIUS]: { prop: 'aoeRadiusMultiplier', calc: 'multiply' },
			[UpgradeType.AOE_DAMAGE]: { prop: 'aoeDamageMultiplier', calc: 'multiply' },
			[UpgradeType.PIERCING_DAMAGE_REDUCTION]: { prop: 'piercingDamageReduction', calc: 'subtract' },
			[UpgradeType.PIERCING_MAX_COUNT]: { prop: 'piercingMaxCount', calc: 'add' },
			[UpgradeType.BOUNCE_MAX_COUNT]: { prop: 'bounceMaxCount', calc: 'add' },
			[UpgradeType.BOUNCE_DETECTION_RANGE]: { prop: 'bounceDetectionRange', calc: 'add' },
			[UpgradeType.EFFECT_PROC_CHANCE]: { prop: 'effectProcChance', calc: 'add' },
			[UpgradeType.EFFECT_DAMAGE]: { prop: 'effectDamageMultiplier', calc: 'multiply' },
			[UpgradeType.EFFECT_INTENSITY]: { prop: 'effectIntensityMultiplier', calc: 'multiply' },
			[UpgradeType.EFFECT_DURATION]: { prop: 'effectDurationMultiplier', calc: 'multiply' },
			[UpgradeType.XP_GAIN]: { prop: 'xpGainMultiplier', calc: 'multiply' },
			[UpgradeType.MONEY_GAIN]: { prop: 'moneyGainMultiplier', calc: 'multiply' },
			[UpgradeType.FETCH_RANGE]: { prop: 'fetchRange', calc: 'multiply' },
			[UpgradeType.PROJECTILE_SPEED]: { prop: 'projectileSpeedMultiplier', calc: 'multiply' },
			[UpgradeType.KNOCKBACK]: { prop: 'knockback', calc: 'multiply' },
			[UpgradeType.DURATION]: { prop: 'duration', calc: 'multiply' }
		};
		
		let currentValue = null;
		let newValue = null;
		let typeName = upgrade.name;
		
		const config = upgradeConfig[upgrade.type];
		
		if (config) {
			currentValue = this.player[config.prop];
			if (typeof upgrade.value === 'number') {
				if (config.calc === 'multiply' && upgrade.value >= 1) {
					newValue = config.floor ? Math.floor(currentValue * upgrade.value) : currentValue * upgrade.value;
				} else if (config.calc === 'add') {
					newValue = currentValue + upgrade.value;
				} else if (config.calc === 'subtract') {
					newValue = Math.max(0, currentValue - upgrade.value);
				}
			}
		} else if (upgrade.type === UpgradeType.SPELL_DAMAGE || upgrade.type === UpgradeType.SPELL_RANGE || upgrade.type === UpgradeType.SPELL_COOLDOWN) {
			if (upgrade.value && upgrade.value.spellId) {
				const spellId = upgrade.value.spellId;
				const multiplierProp = {
					[UpgradeType.SPELL_DAMAGE]: 'spellDamageMultipliers',
					[UpgradeType.SPELL_RANGE]: 'spellRangeMultipliers',
					[UpgradeType.SPELL_COOLDOWN]: 'spellCooldownMultipliers'
				}[upgrade.type];
				
				currentValue = this.player[multiplierProp][spellId] || 1;
				if (typeof upgrade.value.multiplier === 'number' && upgrade.value.multiplier >= 1) {
					newValue = currentValue * upgrade.value.multiplier;
				}
			}
		}
		
		if (currentValue !== null && newValue !== null) {
			const isProjectileUpgrade = [
				UpgradeType.AOE_RADIUS,
				UpgradeType.AOE_DAMAGE,
				UpgradeType.PIERCING_DAMAGE_REDUCTION,
				UpgradeType.PIERCING_MAX_COUNT,
				UpgradeType.BOUNCE_MAX_COUNT,
				UpgradeType.BOUNCE_DETECTION_RANGE,
				UpgradeType.EFFECT_PROC_CHANCE,
				UpgradeType.EFFECT_DAMAGE,
				UpgradeType.EFFECT_INTENSITY,
				UpgradeType.EFFECT_DURATION
			].includes(upgrade.type);
			
			const formatConfig = {
				[UpgradeType.CRIT_CHANCE]: { format: 'percent', multiplier: 100 },
				[UpgradeType.CRIT_DAMAGE]: { format: 'decimal', decimals: 1, suffix: 'x' },
				[UpgradeType.AOE_RADIUS]: { format: 'decimal', decimals: 2, suffix: 'x', statName: 'Rayon' },
				[UpgradeType.AOE_DAMAGE]: { format: 'decimal', decimals: 2, suffix: 'x', statName: 'Dégâts' },
				[UpgradeType.PIERCING_DAMAGE_REDUCTION]: { format: 'percent', multiplier: 100, statName: 'Efficacité' },
				[UpgradeType.PIERCING_MAX_COUNT]: { format: 'integer', statName: 'Transperçage' },
				[UpgradeType.BOUNCE_MAX_COUNT]: { format: 'integer', statName: 'Rebonds' },
				[UpgradeType.BOUNCE_DETECTION_RANGE]: { format: 'integer', statName: 'Portée' },
				[UpgradeType.EFFECT_PROC_CHANCE]: { format: 'percent', multiplier: 100, statName: 'Chance' },
				[UpgradeType.EFFECT_DAMAGE]: { format: 'multiplierPercent', statName: 'Dégâts' },
				[UpgradeType.EFFECT_INTENSITY]: { format: 'multiplierPercent', statName: 'Intensité' },
				[UpgradeType.EFFECT_DURATION]: { format: 'multiplierPercent', statName: 'Durée' },
				[UpgradeType.XP_GAIN]: { format: 'multiplierPercent' },
				[UpgradeType.MONEY_GAIN]: { format: 'multiplierPercent' },
				[UpgradeType.FETCH_RANGE]: { format: 'integer' },
				[UpgradeType.PROJECTILE_SPEED]: { format: 'multiplierPercent' },
				[UpgradeType.KNOCKBACK]: { format: 'multiplierPercent' },
				[UpgradeType.DURATION]: { format: 'multiplierPercent' },
				[UpgradeType.SPELL_DAMAGE]: { format: 'multiplierPercent' },
				[UpgradeType.SPELL_RANGE]: { format: 'multiplierPercent' },
				[UpgradeType.SPELL_COOLDOWN]: { format: 'multiplierPercent' },
				[UpgradeType.ATTACK_SPEED]: { format: 'decimal', decimals: 2 },
				[UpgradeType.SPEED]: { format: 'decimal', decimals: 2 }
			};
			
			const format = formatConfig[upgrade.type] || { format: 'integer' };
			let formattedCurrent = '';
			let formattedNew = '';
			let statName = format.statName || typeName;
			
			const formatValue = (value, fmt) => {
				if (fmt.format === 'percent') {
					return `${(value * (fmt.multiplier || 100)).toFixed(0)}%`;
				} else if (fmt.format === 'multiplierPercent') {
					return `${((value - 1) * 100).toFixed(0)}%`;
				} else if (fmt.format === 'decimal') {
					return `${value.toFixed(fmt.decimals || 2)}${fmt.suffix || ''}`;
				} else {
					return `${Math.floor(value)}`;
				}
			};
			
			formattedCurrent = formatValue(currentValue, format);
			formattedNew = formatValue(newValue, format);
			
			return {
				typeName: typeName,
				statName: statName,
				currentValue: formattedCurrent,
				newValue: formattedNew,
				currentValueRaw: currentValue,
				newValueRaw: newValue,
				isProjectileUpgrade: isProjectileUpgrade
			};
		}
		
		return null;
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
		
		// Animation des rayons jaunes depuis le centre
		const centerX = renderer.width / 2;
		const centerY = renderer.height / 2;
		const rayCount = 24; // Plus de rayons pour couvrir tout le contour
		const rayLength = Math.max(renderer.width, renderer.height) * 0.8;
		const time = Date.now() * 0.001; // Temps en secondes
		const rotationSpeed = 0.5; // Vitesse de rotation
		const baseRotation = time * rotationSpeed;
		
		// Générer des largeurs et espacements aléatoires pour chaque rayon (basés sur l'index pour être cohérents)
		const rayData = [];
		const spacings = [];
		const widths = [];
		
		// Générer d'abord tous les espacements et largeurs
		for (let i = 0; i < rayCount; i++) {
			// Utiliser un seed basé sur l'index pour avoir des valeurs aléatoires mais cohérentes
			const seed = i * 137.508; // Nombre d'or pour une meilleure distribution
			const random1 = (Math.sin(seed) * 10000) % 1;
			const random2 = (Math.sin(seed * 2) * 10000) % 1;
			
			// Largeur aléatoire entre 40 et 80 (beaucoup plus gros)
			const rayWidth = 40 + random1 * 40;
			widths.push(rayWidth);
			
			// Espacement aléatoire entre 8° et 20° (plus petits car plus de rayons)
			const spacing = 8 + random2 * 12;
			spacings.push(spacing);
		}
		
		// Normaliser les espacements pour qu'ils fassent exactement 360°
		const totalSpacing = spacings.reduce((sum, s) => sum + s, 0);
		const normalizationFactor = 360 / totalSpacing;
		
		let currentAngle = 0;
		for (let i = 0; i < rayCount; i++) {
			const normalizedSpacing = spacings[i] * normalizationFactor * (Math.PI / 180);
			
			rayData.push({
				angle: currentAngle,
				width: widths[i]
			});
			
			currentAngle += normalizedSpacing;
		}
		
		renderer.ctx.save();
		renderer.ctx.translate(centerX, centerY);
		renderer.ctx.rotate(baseRotation);
		
		for (let i = 0; i < rayData.length; i++) {
			const ray = rayData[i];
			const rayAlpha = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.2; // Animation de transparence
			
			renderer.ctx.save();
			renderer.ctx.rotate(ray.angle);
			renderer.ctx.globalAlpha = rayAlpha * animProgress;
			
			// Créer un gradient pour le rayon
			const gradient = renderer.ctx.createLinearGradient(0, 0, rayLength, 0);
			gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
			gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
			gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
			
			renderer.ctx.fillStyle = gradient;
			renderer.ctx.beginPath();
			renderer.ctx.moveTo(0, -ray.width / 2);
			renderer.ctx.lineTo(rayLength, -ray.width / 4);
			renderer.ctx.lineTo(rayLength, ray.width / 4);
			renderer.ctx.lineTo(0, ray.width / 2);
			renderer.ctx.closePath();
			renderer.ctx.fill();
			
			renderer.ctx.restore();
		}
		
		renderer.ctx.restore();
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
		
		// Fond non transparent qui englobe les 3 cartes
		const backgroundPadding = 40;
		const backgroundX = startX - backgroundPadding;
		const backgroundY = cardY - backgroundPadding;
		const backgroundWidth = (this.upgradeChoices.length * cardWidth + (this.upgradeChoices.length - 1) * spacing) + (backgroundPadding * 2);
		const backgroundHeight = cardHeight + (backgroundPadding * 2);
		
		renderer.ctx.save();
		renderer.ctx.globalAlpha = Math.max(0, (animProgress - 0.2) * 1.25);
		renderer.ctx.fillStyle = 'rgba(20, 20, 30, 0.95)';
		renderer.ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);
		
		// Bordure du fond
		renderer.ctx.strokeStyle = 'rgba(100, 100, 120, 0.8)';
		renderer.ctx.lineWidth = 3;
		renderer.ctx.strokeRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);
		renderer.ctx.restore();

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
			
			const backgroundColor = RarityBackgroundColors[upgrade.rarity] || RarityBackgroundColors[UpgradeRarity.COMMON];
			renderer.ctx.fillStyle = backgroundColor;
			renderer.ctx.fillRect(cardCenterX, cardCenterY, cardWidth, cardHeight);
			
			renderer.ctx.strokeStyle = borderColor;
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
			
			// Détecter si c'est un upgrade de type de projectile initial (première upgrade)
			const isProjectileTypeUpgrade = [
				UpgradeType.PROJECTILE_AOE,
				UpgradeType.PROJECTILE_PIERCING,
				UpgradeType.PROJECTILE_BOUNCE,
				UpgradeType.PROJECTILE_EFFECT
			].includes(upgrade.type);
			
			// Badge "NEW PROJECTILE TYPE" pour les upgrades de type de projectile
			if (isProjectileTypeUpgrade) {
				const badgeText = 'NEW PROJECTILE TYPE';
				renderer.ctx.font = 'bold 12px Pokemon';
				renderer.ctx.fillStyle = '#FFD700'; // Or/doré pour le badge
				renderer.ctx.textAlign = 'center';
				renderer.ctx.strokeStyle = '#000';
				renderer.ctx.lineWidth = 1.5;
				const badgeY = rarityY + 25;
				renderer.ctx.strokeText(badgeText, 0, badgeY);
				renderer.ctx.fillText(badgeText, 0, badgeY);
			}

			let icon = UpgradeIcons[upgrade.type];
			
			// Pour les upgrades de projectiles, utiliser l'icône du type de projectile
			if (upgrade.type === UpgradeType.AOE_RADIUS || upgrade.type === UpgradeType.AOE_DAMAGE) {
				icon = UpgradeIcons[UpgradeType.PROJECTILE_AOE];
			} else if (upgrade.type === UpgradeType.PIERCING_DAMAGE_REDUCTION || upgrade.type === UpgradeType.PIERCING_MAX_COUNT) {
				icon = UpgradeIcons[UpgradeType.PROJECTILE_PIERCING];
			} else if (upgrade.type === UpgradeType.BOUNCE_MAX_COUNT || upgrade.type === UpgradeType.BOUNCE_DETECTION_RANGE) {
				icon = UpgradeIcons[UpgradeType.PROJECTILE_BOUNCE];
			} else if (upgrade.type === UpgradeType.SPELL && upgrade.value) {
				const spellEmojis = {
					'earthquake': '🟤',
					'rock_trap': '🪨',
					'hydrocanon': '💧'
				};
				icon = spellEmojis[upgrade.value] || icon;
			}
			// Détecter si c'est un upgrade de projectile
			const isProjectileUpgrade = [
				UpgradeType.AOE_RADIUS,
				UpgradeType.AOE_DAMAGE,
				UpgradeType.PIERCING_DAMAGE_REDUCTION,
				UpgradeType.PIERCING_MAX_COUNT,
				UpgradeType.BOUNCE_MAX_COUNT,
				UpgradeType.BOUNCE_DETECTION_RANGE,
				UpgradeType.EFFECT_PROC_CHANCE,
				UpgradeType.EFFECT_DAMAGE,
				UpgradeType.EFFECT_INTENSITY,
				UpgradeType.EFFECT_DURATION
			].includes(upgrade.type);
			
			const iconY = isProjectileTypeUpgrade ? cardCenterY + 150 : (isProjectileUpgrade ? cardCenterY + 100 : cardCenterY + 110);
			renderer.ctx.font = '48px Pokemon';
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.strokeStyle = '#000';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.strokeText(icon, 0, iconY);
			renderer.ctx.fillText(icon, 0, iconY);
			renderer.ctx.lineWidth = 1;

			renderer.ctx.font = 'bold 24px Pokemon';
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.strokeStyle = '#000';
			renderer.ctx.lineWidth = 1;
			const nameY = isProjectileTypeUpgrade ? cardCenterY + 200 : (isProjectileUpgrade ? cardCenterY + 155 : cardCenterY + 165);
			
			let currentNameY = nameY;
			if (isProjectileTypeUpgrade) {
				let projectileType = '';
				if (upgrade.type === UpgradeType.PROJECTILE_AOE) {
					projectileType = 'Explosion';
				} else if (upgrade.type === UpgradeType.PROJECTILE_PIERCING) {
					projectileType = 'Perforation';
				} else if (upgrade.type === UpgradeType.PROJECTILE_BOUNCE) {
					projectileType = 'Rebond';
				} else if (upgrade.type === UpgradeType.PROJECTILE_EFFECT) {
					projectileType = 'Effet';
				}
				
				renderer.ctx.font = 'bold 24px Pokemon';
				renderer.ctx.strokeText(projectileType, 0, currentNameY);
				renderer.ctx.fillText(projectileType, 0, currentNameY);
			} else if (isProjectileUpgrade) {
				renderer.ctx.font = 'bold 20px Pokemon';
				renderer.ctx.fillStyle = '#fff';
				renderer.ctx.strokeText('PROJECTILE', 0, nameY);
				renderer.ctx.fillText('PROJECTILE', 0, nameY);
				
				let projectileType = 'Explosion';
				if (upgrade.type === UpgradeType.PIERCING_DAMAGE_REDUCTION || upgrade.type === UpgradeType.PIERCING_MAX_COUNT) {
					projectileType = 'Perforation';
				} else if (upgrade.type === UpgradeType.BOUNCE_MAX_COUNT || upgrade.type === UpgradeType.BOUNCE_DETECTION_RANGE) {
					projectileType = 'Rebond';
				} else if (upgrade.type === UpgradeType.EFFECT_PROC_CHANCE || upgrade.type === UpgradeType.EFFECT_DAMAGE || 
				          upgrade.type === UpgradeType.EFFECT_INTENSITY || upgrade.type === UpgradeType.EFFECT_DURATION) {
					projectileType = 'Effet';
				}
				
				renderer.ctx.font = 'bold 24px Pokemon';
				currentNameY = nameY + 30;
				renderer.ctx.strokeText(projectileType, 0, currentNameY);
				renderer.ctx.fillText(projectileType, 0, currentNameY);
			} else {
				let displayName = upgrade.name;
				const nameLines = displayName.split('\n');
				nameLines.forEach((line, lineIndex) => {
					renderer.ctx.strokeText(line, 0, currentNameY);
					renderer.ctx.fillText(line, 0, currentNameY);
					if (lineIndex < nameLines.length - 1) {
						currentNameY += 28;
					}
				});
			}


			// Afficher les valeurs avec les couleurs appropriées (remplace la description)
			const valueDisplay = this.getUpgradeValueDisplay(upgrade);
			if (valueDisplay) {
				// Pour les upgrades de projectiles, commencer après "EXPLOSION"
				let lineY;
				if (isProjectileUpgrade) {
					lineY = nameY + 60; // Après "PROJECTILE" et "EXPLOSION"
				} else {
					lineY = currentNameY + 30;
				}
				renderer.ctx.strokeStyle = '#000';
				renderer.ctx.lineWidth = 1;
				renderer.ctx.textAlign = 'center';
				
				if (valueDisplay.isProjectileUpgrade) {
					// Affichage spécial pour les upgrades de projectiles
					let fontSize = 18;
					renderer.ctx.font = `${fontSize}px Pokemon`;
					const maxWidth = cardWidth - 40;
					
					// Calculer l'augmentation
					const isAddUpgrade = upgrade.type === UpgradeType.BOUNCE_DETECTION_RANGE || 
					                     upgrade.type === UpgradeType.BOUNCE_MAX_COUNT ||
					                     upgrade.type === UpgradeType.PIERCING_MAX_COUNT;
					
					let displayText = '';
					const statName = valueDisplay.statName;
					
					if (isAddUpgrade && valueDisplay.currentValueRaw !== null && valueDisplay.newValueRaw !== null) {
						const currentRaw = valueDisplay.currentValueRaw;
						const newRaw = valueDisplay.newValueRaw;
						const absoluteIncrease = Math.round(newRaw - currentRaw);
						displayText = `${statName} +${absoluteIncrease}`;
					} else {
						let percentIncrease = 0;
						if (typeof upgrade.value === 'number') {
							if (upgrade.value >= 1) {
								// Multiplicateur (ex: 1.05 = +5%)
								percentIncrease = Math.round((upgrade.value - 1) * 100);
							} else {
								// Pour les réductions (ex: piercing damage reduction)
								percentIncrease = Math.round(upgrade.value * 100);
							}
						}
						displayText = `${statName} +${percentIncrease}%`;
					}
					
					let textWidth = renderer.ctx.measureText(displayText).width;
					
					// Vérifier la largeur et ajuster la taille de police si nécessaire
					if (textWidth > maxWidth) {
						fontSize = Math.max(12, Math.floor(18 * (maxWidth / textWidth) * 0.95));
						renderer.ctx.font = `${fontSize}px Pokemon`;
						textWidth = renderer.ctx.measureText(displayText).width;
						
						if (textWidth > maxWidth) {
							fontSize = Math.max(10, Math.floor(fontSize * (maxWidth / textWidth) * 0.95));
							renderer.ctx.font = `${fontSize}px Pokemon`;
						}
					}
					
					renderer.ctx.textAlign = 'center';
					renderer.ctx.fillStyle = '#ffd700';
					renderer.ctx.strokeText(displayText, 0, lineY);
					renderer.ctx.fillText(displayText, 0, lineY);
					
					// Ligne 2: Valeurs "5 → 7"
					lineY += 25;
					const valuesText = `${valueDisplay.currentValue} → ${valueDisplay.newValue}`;
					let valuesWidth = renderer.ctx.measureText(valuesText).width;
					
					if (valuesWidth > maxWidth) {
						fontSize = Math.max(12, Math.floor(fontSize * (maxWidth / valuesWidth) * 0.95));
						renderer.ctx.font = `${fontSize}px Pokemon`;
						valuesWidth = renderer.ctx.measureText(valuesText).width;
					}
					
					// Afficher les valeurs avec couleurs
					let currentX = -valuesWidth / 2;
					const spacing = 5;
					
					// Ancienne valeur en blanc
					renderer.ctx.textAlign = 'left';
					renderer.ctx.fillStyle = '#ffffff';
					renderer.ctx.strokeText(valueDisplay.currentValue, currentX, lineY);
					renderer.ctx.fillText(valueDisplay.currentValue, currentX, lineY);
					currentX += renderer.ctx.measureText(valueDisplay.currentValue).width + spacing;
					
					// Flèche Unicode
					const arrowText = '→';
					renderer.ctx.fillStyle = '#ffffff';
					renderer.ctx.strokeText(arrowText, currentX, lineY);
					renderer.ctx.fillText(arrowText, currentX, lineY);
					currentX += renderer.ctx.measureText(arrowText).width + spacing;
					
					// Nouvelle valeur en vert
					renderer.ctx.fillStyle = '#4af626';
					renderer.ctx.strokeText(valueDisplay.newValue, currentX, lineY);
					renderer.ctx.fillText(valueDisplay.newValue, currentX, lineY);
					
					renderer.ctx.textAlign = 'center';
				} else {
					// Affichage pour les upgrades non-projectiles
					// Ligne 1: "+ X%" en couleur de rareté
					let fontSize = 18;
					renderer.ctx.font = `${fontSize}px Pokemon`;
					
					let percentIncrease = 0;
					if (valueDisplay.currentValueRaw !== null && valueDisplay.newValueRaw !== null) {
						const currentRaw = valueDisplay.currentValueRaw;
						const newRaw = valueDisplay.newValueRaw;
						
						if (currentRaw > 0) {
							percentIncrease = Math.round(((newRaw - currentRaw) / currentRaw) * 100);
						} else if (typeof upgrade.value === 'number') {
							if (upgrade.value >= 1 && upgrade.value < 2) {
								percentIncrease = Math.round((upgrade.value - 1) * 100);
							} else if (upgrade.value < 1) {
								percentIncrease = Math.round(upgrade.value * 100);
							} else {
								percentIncrease = upgrade.value;
							}
						}
					} else if (typeof upgrade.value === 'number') {
						if (upgrade.value >= 1 && upgrade.value < 2) {
							percentIncrease = Math.round((upgrade.value - 1) * 100);
						} else if (upgrade.value < 1) {
							percentIncrease = Math.round(upgrade.value * 100);
						} else {
							percentIncrease = upgrade.value;
						}
					}
					
					const percentText = `+${percentIncrease}%`;
					const maxWidth = cardWidth - 40;
					let textWidth = renderer.ctx.measureText(percentText).width;
					
					if (textWidth > maxWidth) {
						fontSize = Math.max(12, Math.floor(18 * (maxWidth / textWidth) * 0.95));
						renderer.ctx.font = `${fontSize}px Pokemon`;
						textWidth = renderer.ctx.measureText(percentText).width;
						
						if (textWidth > maxWidth) {
							fontSize = Math.max(10, Math.floor(fontSize * (maxWidth / textWidth) * 0.95));
							renderer.ctx.font = `${fontSize}px Pokemon`;
						}
					}
					
					renderer.ctx.textAlign = 'center';
					renderer.ctx.fillStyle = borderColor;
					renderer.ctx.strokeText(percentText, 0, lineY);
					renderer.ctx.fillText(percentText, 0, lineY);
					
					// Ligne 2: "5% → 10%"
					lineY += 25;
					
					const isPercentageStat = upgrade.type === UpgradeType.CRIT_CHANCE || 
					                          upgrade.type === UpgradeType.CRIT_DAMAGE ||
					                          upgrade.type === UpgradeType.HP_REGEN ||
					                          upgrade.type === UpgradeType.EFFECT_PROC_CHANCE;
					
					let currentValueStr = valueDisplay.currentValue;
					let newValueStr = valueDisplay.newValue;
					
					if (isPercentageStat) {
						if (upgrade.type === UpgradeType.CRIT_DAMAGE) {
							currentValueStr = `${Math.round(valueDisplay.currentValueRaw * 100)}%`;
							newValueStr = `${Math.round(valueDisplay.newValueRaw * 100)}%`;
						} else {
							currentValueStr = `${Math.round(valueDisplay.currentValueRaw * 100)}%`;
							newValueStr = `${Math.round(valueDisplay.newValueRaw * 100)}%`;
						}
					} else if (typeof valueDisplay.currentValueRaw === 'number' && valueDisplay.currentValueRaw < 1) {
						currentValueStr = `${Math.round(valueDisplay.currentValueRaw * 100)}%`;
						newValueStr = `${Math.round(valueDisplay.newValueRaw * 100)}%`;
					}
					
					const valuesText = `${currentValueStr} → ${newValueStr}`;
					let valuesWidth = renderer.ctx.measureText(valuesText).width;
					
					if (valuesWidth > maxWidth) {
						fontSize = Math.max(12, Math.floor(fontSize * (maxWidth / valuesWidth) * 0.95));
						renderer.ctx.font = `${fontSize}px Pokemon`;
						valuesWidth = renderer.ctx.measureText(valuesText).width;
					}
					
					let nonProjectileCurrentX = -valuesWidth / 2;
					const nonProjectileSpacing = 5;
					
					renderer.ctx.textAlign = 'left';
					renderer.ctx.fillStyle = '#ffffff';
					renderer.ctx.strokeText(currentValueStr, nonProjectileCurrentX, lineY);
					renderer.ctx.fillText(currentValueStr, nonProjectileCurrentX, lineY);
					nonProjectileCurrentX += renderer.ctx.measureText(currentValueStr).width + nonProjectileSpacing;
					
					const nonProjectileArrowText = '→';
					renderer.ctx.fillStyle = '#ffffff';
					renderer.ctx.strokeText(nonProjectileArrowText, nonProjectileCurrentX, lineY);
					renderer.ctx.fillText(nonProjectileArrowText, nonProjectileCurrentX, lineY);
					nonProjectileCurrentX += renderer.ctx.measureText(nonProjectileArrowText).width + nonProjectileSpacing;
					
					renderer.ctx.fillStyle = '#4af626';
					renderer.ctx.strokeText(newValueStr, nonProjectileCurrentX, lineY);
					renderer.ctx.fillText(newValueStr, nonProjectileCurrentX, lineY);
					
					renderer.ctx.textAlign = 'center';
				}
			}

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


					if (died) {
						this.handleEnemyDeath(hit.enemy);
					}
				});
			}

			this.activeSpellEffects.push(spellEffect);
			
			if (spellEffect.type !== 'rock_trap') {
				const battleScene = this;
				setTimeout(() => {
					const index = battleScene.activeSpellEffects.indexOf(spellEffect);
					if (index > -1) {
						battleScene.activeSpellEffects.splice(index, 1);
					}
				}, spellEffect.duration || 600);
			}
		}
	}

	getSessionInventory() {
		const combinedInventory = { ...this.engine.inventory };
		for (const itemId in this.sessionInventory) {
			if (!combinedInventory[itemId]) {
				combinedInventory[itemId] = 0;
			}
			combinedInventory[itemId] += this.sessionInventory[itemId];
		}
		return combinedInventory;
	}

	transferSessionRewardsToEngine() {
		const moneyGained = this.player.money - this.initialMoney;
		const displayedMoneyGained = this.player.displayedMoney - this.initialDisplayedMoney;
		
		this.engine.money += moneyGained;
		this.engine.displayedMoney += displayedMoneyGained;
		
		for (const itemId in this.sessionInventory) {
			const itemConfig = ItemConfig[itemId];
			if (itemConfig && itemConfig.category === 'egg') {
				if (!this.engine.inventory[itemId]) {
					this.engine.inventory[itemId] = 0;
				}
				if (!this.engine.eggProgress) {
					this.engine.eggProgress = {};
				}
				if (!this.engine.eggUniqueIds) {
					this.engine.eggUniqueIds = {};
				}
				if (!this.engine.eggUniqueIds[itemId]) {
					this.engine.eggUniqueIds[itemId] = [];
				}
				
				const sessionEggUniqueIds = this.sessionEggs[itemId] || [];
				sessionEggUniqueIds.forEach(uniqueId => {
					this.engine.eggUniqueIds[itemId].push(uniqueId);
					const adjustedRequiredKills = Math.max(1, Math.floor(itemConfig.requiredKills * this.getEggHatchSpeedMultiplier()));
					this.engine.eggProgress[uniqueId] = { currentKills: 0, requiredKills: adjustedRequiredKills };
					this.engine.inventory[itemId] = (this.engine.inventory[itemId] || 0) + 1;
				});
			} else {
				if (!this.engine.inventory[itemId]) {
					this.engine.inventory[itemId] = 0;
				}
				this.engine.inventory[itemId] += this.sessionInventory[itemId];
			}
		}
		
		this.bossDefeated = true;
	}

	showVictoryScreen() {
		// Mettre le jeu en pause sans tuer le joueur
		this.state = 'victory';
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

	applySkillTreeEffects() {
		if (!this.player || !this.engine.skillTreeState) return;

		for (const branch of SkillTreeConfig.branches) {
			for (const node of branch.nodes) {
				const nodeState = this.engine.skillTreeState[node.id];
				if (!nodeState || nodeState.currentRank <= 0) continue;

				const rank = nodeState.currentRank;
				const effect = node.effect;

				if (effect.damageMultiplier) {
					const multiplier = Math.pow(effect.damageMultiplier, rank);
					this.player.damage *= multiplier;
				}

				if (effect.hpMultiplier) {
					const multiplier = Math.pow(effect.hpMultiplier, rank);
					const oldMaxHp = this.player.maxHp;
					this.player.maxHp *= multiplier;
					const hpRatio = this.player.hp / oldMaxHp;
					this.player.hp = this.player.maxHp * hpRatio;
					this.player.displayedHp = this.player.hp;
				}

				if (effect.regen) {
					this.player.hpRegen += effect.regen * rank;
				}

				if (effect.projectileSpeedMultiplier) {
					const multiplier = Math.pow(effect.projectileSpeedMultiplier, rank);
					this.player.projectileSpeedMultiplier *= multiplier;
				}

				if (effect.extraProjectile) {
					this.player.projectileCount += effect.extraProjectile * rank;
				}

				if (effect.critChance) {
					this.player.critChance = (this.player.critChance || 0) + (effect.critChance * rank);
				}

				if (effect.critDamage) {
					this.player.critDamage = (this.player.critDamage || 1.5) + (effect.critDamage * rank);
				}

				if (effect.attackSpeedMultiplier) {
					const multiplier = Math.pow(effect.attackSpeedMultiplier, rank);
					this.player.attackSpeed *= multiplier;
					this.player.attackCooldownMax = 1000 / this.player.attackSpeed;
				}

				if (effect.rangeMultiplier) {
					const multiplier = Math.pow(effect.rangeMultiplier, rank);
					this.player.range *= multiplier;
				}

				if (effect.speedMultiplier) {
					const multiplier = Math.pow(effect.speedMultiplier, rank);
					this.player.speed *= multiplier;
				}

				if (effect.knockbackMultiplier) {
					const multiplier = Math.pow(effect.knockbackMultiplier, rank);
					this.player.knockback *= multiplier;
				}

				if (effect.xpGainMultiplier) {
					const multiplier = Math.pow(effect.xpGainMultiplier, rank);
					this.player.xpGainMultiplier *= multiplier;
				}

				if (effect.moneyGainMultiplier) {
					const multiplier = Math.pow(effect.moneyGainMultiplier, rank);
					this.player.moneyGainMultiplier *= multiplier;
				}

				if (effect.fetchRangeMultiplier) {
					const multiplier = Math.pow(effect.fetchRangeMultiplier, rank);
					this.player.fetchRange *= multiplier;
				}

				if (effect.maxSpells) {
					this.player.maxSpells = (this.player.maxSpells || 3) + (effect.maxSpells * rank);
				}
			}
		}
	}

	getEggHatchSpeedMultiplier() {
		if (!this.engine.skillTreeState) return 1.0;
		let multiplier = 1.0;
		for (const branch of SkillTreeConfig.branches) {
			for (const node of branch.nodes) {
				const nodeState = this.engine.skillTreeState[node.id];
				if (!nodeState || nodeState.currentRank <= 0) continue;
				if (node.effect.eggHatchSpeedMultiplier) {
					const rank = nodeState.currentRank;
					multiplier *= Math.pow(node.effect.eggHatchSpeedMultiplier, rank);
				}
			}
		}
		return multiplier;
	}

	getEggIVBonus() {
		if (!this.engine.skillTreeState) return 1;
		let bonus = 1;
		for (const branch of SkillTreeConfig.branches) {
			for (const node of branch.nodes) {
				const nodeState = this.engine.skillTreeState[node.id];
				if (!nodeState || nodeState.currentRank <= 0) continue;
				if (node.effect.eggIVBonus) {
					bonus += node.effect.eggIVBonus * nodeState.currentRank;
				}
			}
		}
		return bonus;
	}

	getItemLossReduction() {
		if (!this.engine.skillTreeState) return 0;
		let reduction = 0;
		for (const branch of SkillTreeConfig.branches) {
			for (const node of branch.nodes) {
				const nodeState = this.engine.skillTreeState[node.id];
				if (!nodeState || nodeState.currentRank <= 0) continue;
				if (node.effect.itemLossReduction) {
					reduction += node.effect.itemLossReduction * nodeState.currentRank;
				}
			}
		}
		return Math.min(reduction, 0.5);
	}

	getLootRareChance() {
		if (!this.engine.skillTreeState) return 0;
		let chance = 0;
		for (const branch of SkillTreeConfig.branches) {
			for (const node of branch.nodes) {
				const nodeState = this.engine.skillTreeState[node.id];
				if (!nodeState || nodeState.currentRank <= 0) continue;
				if (node.effect.lootRareChance) {
					chance += node.effect.lootRareChance * nodeState.currentRank;
				}
			}
		}
		return chance;
	}

	getBaseDropChance() {
		if (!this.engine.skillTreeState) return 0;
		let bonus = 0;
		for (const branch of SkillTreeConfig.branches) {
			for (const node of branch.nodes) {
				const nodeState = this.engine.skillTreeState[node.id];
				if (!nodeState || nodeState.currentRank <= 0) continue;
				if (node.effect.baseDropChance) {
					bonus += node.effect.baseDropChance * nodeState.currentRank;
				}
			}
		}
		return bonus;
	}

	getEpicDropChance() {
		if (!this.engine.skillTreeState) return 0;
		let bonus = 0;
		for (const branch of SkillTreeConfig.branches) {
			for (const node of branch.nodes) {
				const nodeState = this.engine.skillTreeState[node.id];
				if (!nodeState || nodeState.currentRank <= 0) continue;
				if (node.effect.epicDropChance) {
					bonus += node.effect.epicDropChance * nodeState.currentRank;
				}
			}
		}
		return bonus;
	}

	getShinyChance() {
		if (!this.engine.skillTreeState) return 0.001;
		let chance = 0.001;
		for (const branch of SkillTreeConfig.branches) {
			for (const node of branch.nodes) {
				const nodeState = this.engine.skillTreeState[node.id];
				if (!nodeState || nodeState.currentRank <= 0) continue;
				if (node.effect.shinyChance) {
					chance += node.effect.shinyChance * nodeState.currentRank;
				}
			}
		}
		return Math.min(chance, 1.0);
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

