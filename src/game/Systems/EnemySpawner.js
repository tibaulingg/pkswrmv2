import Enemy from '../Entities/Enemy.js';
import AnimationSystem from './AnimationSystem.js';
import { getEnemyConfig, MapEnemies } from '../Config/EnemyConfig.js';
import { getPokemonConfig } from '../Config/SpriteConfig.js';

export default class EnemySpawner {
	constructor(mapId, mapWidth, mapHeight, spriteManager, bossTimer = null, bossType = null, engine = null, collisionSystem = null, enemyScaling = null) {
		this.mapId = mapId;
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
		this.spriteManager = spriteManager;
		this.engine = engine;
		this.collisionSystem = collisionSystem;
		this.enemies = [];
		this.spawnTimer = 0;
		this.baseSpawnInterval = 1000;
		this.spawnInterval = this.baseSpawnInterval;
		this.baseMaxEnemies = 50;
		this.maxEnemies = 50;
		this.enemyPool = MapEnemies[mapId] || [];
		this.gameTime = 0;
		this.spawnCount = 1;
		this.difficultyUpdateTimer = 0;
		this.difficultyUpdateInterval = 10000;
		this.bossTimer = bossTimer;
		this.bossType = bossType;
		this.bossSpawned = false;
		this.totalEnemiesKilled = 0;
		this.maxEnemyDistance = 1200;
		this.frozenEnemyLevel = null;
		this.spawnFreezeTimer = 0;
		this.spawnFrozen = false;
		this.currentFloor = 1; // Étage actuel
		
		// Configuration du scaling des ennemis (valeurs par défaut si non fournies)
		this.enemyScaling = enemyScaling || {
			baseLevel: 1,
			levelPerFloor: 3,
			levelPerMinute: 0.5,
			maxLevel: 100
		};
	}

	update(deltaTime, playerX, playerY, playerWidth = 32, playerHeight = 32, playerVelocityX = 0, playerVelocityY = 0) {
		// Si spawnFrozen est activé de manière permanente (map finale), ne rien faire
		if (this.spawnFrozen && this.bossSpawned) {
			return; // Ne pas spawner du tout dans la map finale
		}
		
		this.gameTime += deltaTime;
		this.spawnTimer += deltaTime;
		this.difficultyUpdateTimer += deltaTime;

		// Gestion du freeze des spawns après le boss (sauf si c'est permanent)
		if (this.spawnFrozen && !this.bossSpawned) {
			this.spawnFreezeTimer += deltaTime;
			const freezeDuration = 5000 + Math.random() * 3000; // 5-8 secondes
			if (this.spawnFreezeTimer >= freezeDuration) {
				this.spawnFrozen = false;
				this.spawnFreezeTimer = 0;
			}
		}

		if (this.difficultyUpdateTimer >= this.difficultyUpdateInterval) {
			this.updateDifficulty();
			this.difficultyUpdateTimer = 0;
		}

		if (!this.bossSpawned && this.bossTimer && this.bossType && this.gameTime >= this.bossTimer) {
			this.spawnBoss(playerX, playerY);
			this.bossSpawned = true;
		}

		const currentEnemyCount = this.enemies.filter(e => e.isAlive).length;
		const spawnRateMultiplier = Math.max(0.3, 1 - (currentEnemyCount / this.maxEnemies) * 0.7);
		const adjustedSpawnInterval = this.spawnInterval / spawnRateMultiplier;

		// Ne pas spawner si freeze actif ou si boss présent (aucun spawn pendant le boss)
		const boss = this.getBoss();
		const bossAlive = boss && boss.isAlive;
		const shouldSpawn = !this.spawnFrozen && !bossAlive; // Pas de spawn si boss est vivant

		if (this.spawnTimer >= adjustedSpawnInterval && currentEnemyCount < this.maxEnemies && shouldSpawn) {
			const spawnCount = Math.min(this.spawnCount, this.maxEnemies - currentEnemyCount);
			for (let i = 0; i < spawnCount; i++) {
				if (currentEnemyCount < this.maxEnemies) {
					const angle = (Math.PI * 2 / spawnCount) * i + Math.random() * 0.5;
					this.spawnEnemy(playerX, playerY, angle);
				}
			}
			this.spawnTimer = 0;
		}

		const aliveEnemies = this.enemies.filter(e => e.isAlive);
		this.enemies.forEach(enemy => {
			if (enemy.isAlive) {
				const otherEnemies = aliveEnemies.filter(e => e !== enemy);
				enemy.update(deltaTime, playerX, playerY, this.collisionSystem, playerWidth, playerHeight, otherEnemies, playerVelocityX, playerVelocityY);
			}
		});

		this.cleanupDistantEnemies(playerX, playerY);

		const deadEnemies = this.enemies.filter(enemy => !enemy.isAlive);
		if (deadEnemies.length > 0 && this.engine && this.engine.sceneManager) {
			const battleScene = this.engine.sceneManager.scenes.battle;
			if (battleScene && battleScene.handleEnemyDeath) {
				deadEnemies.forEach(enemy => {
					battleScene.handleEnemyDeath(enemy);
				});
			}
		}

		const beforeCount = this.enemies.length;
		this.enemies = this.enemies.filter(enemy => enemy.isAlive);
		const afterCount = this.enemies.length;
		this.totalEnemiesKilled += (beforeCount - afterCount);
	}

	updateDifficulty() {
		const minutes = this.gameTime / 60000;
		
		// Calcul du temps avant le boss
		const timeUntilBoss = this.bossTimer ? (this.bossTimer - this.gameTime) : Infinity;
		const preBossWindowStart = 40000; // 40s avant
		const preBossWindowEnd = 20000; // 20s avant
		const isPreBoss = !this.bossSpawned && timeUntilBoss <= preBossWindowStart && timeUntilBoss >= preBossWindowEnd;
		
		// Réduire progressivement le spawn rate avant le boss
		if (isPreBoss) {
			const progress = (preBossWindowStart - timeUntilBoss) / (preBossWindowStart - preBossWindowEnd);
			const baseInterval = Math.max(500, this.baseSpawnInterval - (minutes * 150));
			const reducedInterval = baseInterval * (1 + progress * 2); // Augmente progressivement (réduit le spawn rate)
			this.spawnInterval = reducedInterval;
		} else {
			this.spawnInterval = Math.max(500, this.baseSpawnInterval - (minutes * 150));
		}
		
		// Geler le scaling HP avant le boss
		if (isPreBoss && this.frozenEnemyLevel === null) {
			this.frozenEnemyLevel = this.calculateEnemyLevel();
		}
		
		// Pendant le boss, limiter maxEnemies
		const boss = this.getBoss();
		if (boss && boss.isAlive) {
			this.maxEnemies = Math.min(this.maxEnemies, this.getBossMaxEnemies());
		} else {
			this.maxEnemies = Math.min(80, this.baseMaxEnemies + Math.floor(minutes * 5));
		}
		
		if (minutes < 1) {
			this.spawnCount = 3;
		} else if (minutes >= 1 && this.spawnCount < 4) {
			this.spawnCount = 4;
		} else if (minutes >= 3 && this.spawnCount < 5) {
			this.spawnCount = 5;
		} else if (minutes >= 5 && this.spawnCount < 6) {
			this.spawnCount = 6;
		} else if (minutes >= 8 && this.spawnCount < 8) {
			this.spawnCount = 8;
		}
		
		// Réduire spawnCount pendant le boss
		if (boss && boss.isAlive) {
			this.spawnCount = Math.min(this.spawnCount, 3);
		}
	}

	cleanupDistantEnemies(playerX, playerY) {
		const aliveEnemies = this.enemies.filter(e => e.isAlive);
		if (aliveEnemies.length <= this.maxEnemies * 0.7) {
			return;
		}

		aliveEnemies.forEach(enemy => {
			if (enemy.isBoss) return;

			const dx = enemy.getCenterX() - playerX;
			const dy = enemy.getCenterY() - playerY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance > this.maxEnemyDistance) {
				enemy.isAlive = false;
			}
		});
	}

	spawnEnemy(playerX, playerY, angle = null) {
		const enemyType = this.getRandomEnemyType();
		if (!enemyType) return;

		const config = getEnemyConfig(enemyType);
		if (!config) return;
		
		if (this.engine && config.pokemon) {
			this.engine.encounteredPokemons.add(config.pokemon);
		}
		
		const spawnDistance = 400;
		const maxAttempts = 30;
		const safetyMargin = 24;
		let validPosition = null;
		
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			if (angle === null) {
				angle = Math.random() * Math.PI * 2;
			} else if (attempt > 0) {
				angle = Math.random() * Math.PI * 2;
			}
			
			const x = playerX + Math.cos(angle) * spawnDistance;
			const y = playerY + Math.sin(angle) * spawnDistance;

			const enemyWidth = 32;
			const enemyHeight = 32;
			const checkWidth = enemyWidth + safetyMargin * 2;
			const checkHeight = enemyHeight + safetyMargin * 2;
			
			const clampedX = Math.max(safetyMargin, Math.min(this.mapWidth - enemyWidth - safetyMargin, x));
			const clampedY = Math.max(safetyMargin, Math.min(this.mapHeight - enemyHeight - safetyMargin, y));
			
			const checkX = clampedX - safetyMargin;
			const checkY = clampedY - safetyMargin;
			
			if (this.collisionSystem) {
				if (this.collisionSystem.checkCollision(checkX, checkY, checkWidth, checkHeight)) {
					continue;
				}
				
				const centerX = clampedX + enemyWidth / 2;
				const centerY = clampedY + enemyHeight / 2;
				const testPoints = [
					{ x: centerX - safetyMargin, y: centerY },
					{ x: centerX + safetyMargin, y: centerY },
					{ x: centerX, y: centerY - safetyMargin },
					{ x: centerX, y: centerY + safetyMargin },
					{ x: centerX - safetyMargin * 0.7, y: centerY - safetyMargin * 0.7 },
					{ x: centerX + safetyMargin * 0.7, y: centerY + safetyMargin * 0.7 },
					{ x: centerX - safetyMargin * 0.7, y: centerY + safetyMargin * 0.7 },
					{ x: centerX + safetyMargin * 0.7, y: centerY - safetyMargin * 0.7 }
				];
				
				let hasCollision = false;
				for (const point of testPoints) {
					if (this.collisionSystem.checkCollision(point.x - 4, point.y - 4, 8, 8)) {
						hasCollision = true;
						break;
					}
				}
				
				if (hasCollision) {
					continue;
				}
			}
			
			validPosition = { x: clampedX, y: clampedY, angle };
			break;
		}
		
		if (!validPosition) {
			return;
		}
		
		const clampedX = validPosition.x;
		const clampedY = validPosition.y;

		let animationSystem = null;
		let particleColor = '#ff0000';
		if (config.pokemon && this.spriteManager) {
			const pokemonConfig = getPokemonConfig(config.pokemon);
			const pokemonWalkSprite = this.spriteManager.get(`${config.pokemon}_walk`);
			const pokemonHurtSprite = this.spriteManager.get(`${config.pokemon}_hurt`);
			const pokemonattackSprite = this.spriteManager.get(`${config.pokemon}_attack`);
			if (pokemonConfig && pokemonWalkSprite && pokemonHurtSprite) {
				const spriteImages = {
					walk: pokemonWalkSprite,
					hurt: pokemonHurtSprite
				};
				if (pokemonattackSprite) {
					spriteImages.attack = pokemonattackSprite;
				}
				animationSystem = new AnimationSystem(pokemonConfig, spriteImages);
				particleColor = pokemonConfig.particleColor || particleColor;
			} else if (pokemonConfig && pokemonWalkSprite) {
				animationSystem = new AnimationSystem(pokemonConfig, pokemonWalkSprite);
				particleColor = pokemonConfig.particleColor || particleColor;
			}
		}

		const level = this.calculateEnemyLevel();
		const pokemonConfig = config.pokemon && this.spriteManager ? getPokemonConfig(config.pokemon) : null;
		const enemy = new Enemy(clampedX, clampedY, enemyType, config, animationSystem, level, particleColor, pokemonConfig, this.spriteManager);
		
		if (pokemonConfig) {
			enemy.projectileColor = pokemonConfig.projectileColor || enemy.projectileColor;
			enemy.projectileSize = pokemonConfig.projectileSize || enemy.projectileSize;
		}
		
		this.enemies.push(enemy);
	}

	calculateEnemyLevel() {
		// Si le niveau est gelé (pré-boss), utiliser le niveau gelé
		if (this.frozenEnemyLevel !== null) {
			return this.frozenEnemyLevel;
		}
		
		// Le niveau de base dépend de l'étage actuel
		// Utiliser la configuration de scaling de la map
		const baseLevel = this.enemyScaling.baseLevel + (this.currentFloor - 1) * this.enemyScaling.levelPerFloor;
		
		// Progression dans le temps (basée sur la configuration)
		const timeMinutes = this.gameTime / 60000;
		const timeLevelBonus = Math.floor(timeMinutes * this.enemyScaling.levelPerMinute);
		
		const calculatedLevel = baseLevel + timeLevelBonus;
		
		const randomVariation = Math.random() < 0.3 ? Math.floor(Math.random() * 2) : 0;
		
		let lvl =  Math.max(1, Math.min(this.enemyScaling.maxLevel, calculatedLevel + randomVariation));
		
		console.log('lvl', lvl);

		return lvl;
	}

	getRandomEnemyType() {
		if (this.enemyPool.length === 0) return null;

		const totalWeight = this.enemyPool.reduce((sum, e) => sum + e.weight, 0);
		let random = Math.random() * totalWeight;

		for (const enemyData of this.enemyPool) {
			random -= enemyData.weight;
			if (random <= 0) {
				return enemyData.type;
			}
		}

		return this.enemyPool[0].type;
	}

	spawnBoss(playerX, playerY) {
		if (!this.bossType) return;

		const config = getEnemyConfig(this.bossType);
		if (!config) return;
		if (!config) return;

		// Détruire 60-80% des mobs existants
		const aliveEnemies = this.enemies.filter(e => e.isAlive && !e.isBoss);
		const killPercentage = 0.6 + Math.random() * 0.2; // 60-80%
		const enemiesToKill = Math.floor(aliveEnemies.length * killPercentage);
		
		// Mélanger et tuer aléatoirement
		const shuffled = [...aliveEnemies].sort(() => Math.random() - 0.5);
		for (let i = 0; i < enemiesToKill && i < shuffled.length; i++) {
			shuffled[i].isAlive = false;
		}
		
		// Geler les spawns 5-8 secondes
		this.spawnFrozen = true;
		this.spawnFreezeTimer = 0;

		if (this.engine && config.pokemon) {
			this.engine.encounteredPokemons.add(config.pokemon);
		}

		const spawnDistance = 400;
		const maxAttempts = 30;
		const safetyMargin = 40;
		let validPosition = null;
		
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const angle = Math.random() * Math.PI * 2;
			const x = playerX + Math.cos(angle) * spawnDistance;
			const y = playerY + Math.sin(angle) * spawnDistance;

			const bossWidth = 96;
			const bossHeight = 96;
			const checkWidth = bossWidth + safetyMargin * 2;
			const checkHeight = bossHeight + safetyMargin * 2;
			
			const clampedX = Math.max(safetyMargin, Math.min(this.mapWidth - bossWidth - safetyMargin, x));
			const clampedY = Math.max(safetyMargin, Math.min(this.mapHeight - bossHeight - safetyMargin, y));
			
			const checkX = clampedX - safetyMargin;
			const checkY = clampedY - safetyMargin;
			
			if (this.collisionSystem) {
				if (this.collisionSystem.checkCollision(checkX, checkY, checkWidth, checkHeight)) {
					continue;
				}
				
				const centerX = clampedX + bossWidth / 2;
				const centerY = clampedY + bossHeight / 2;
				const testPoints = [
					{ x: centerX - safetyMargin, y: centerY },
					{ x: centerX + safetyMargin, y: centerY },
					{ x: centerX, y: centerY - safetyMargin },
					{ x: centerX, y: centerY + safetyMargin },
					{ x: centerX - safetyMargin * 0.7, y: centerY - safetyMargin * 0.7 },
					{ x: centerX + safetyMargin * 0.7, y: centerY + safetyMargin * 0.7 },
					{ x: centerX - safetyMargin * 0.7, y: centerY + safetyMargin * 0.7 },
					{ x: centerX + safetyMargin * 0.7, y: centerY - safetyMargin * 0.7 }
				];
				
				let hasCollision = false;
				for (const point of testPoints) {
					if (this.collisionSystem.checkCollision(point.x - 8, point.y - 8, 16, 16)) {
						hasCollision = true;
						break;
					}
				}
				
				if (hasCollision) {
					continue;
				}
			}
			
			validPosition = { x: clampedX, y: clampedY };
			break;
		}
		
		if (!validPosition) {
			return;
		}
		
		const clampedX = validPosition.x;
		const clampedY = validPosition.y;

		let animationSystem = null;
		let particleColor = '#ff0000';
		if (config.pokemon && this.spriteManager) {
			const pokemonConfig = getPokemonConfig(config.pokemon);
			const pokemonWalkSprite = this.spriteManager.get(`${config.pokemon}_walk`);
			const pokemonHurtSprite = this.spriteManager.get(`${config.pokemon}_hurt`);
			const pokemonattackSprite = this.spriteManager.get(`${config.pokemon}_attack`);

			if (pokemonConfig && pokemonWalkSprite && pokemonHurtSprite) {
				const spriteImages = {
					walk: pokemonWalkSprite,
					hurt: pokemonHurtSprite
				};
				if (pokemonattackSprite) {
					spriteImages.attack = pokemonattackSprite;
				}
				animationSystem = new AnimationSystem(pokemonConfig, spriteImages);
				particleColor = pokemonConfig.particleColor || particleColor;
			} else if (pokemonConfig && pokemonWalkSprite) {
				animationSystem = new AnimationSystem(pokemonConfig, pokemonWalkSprite);
				particleColor = pokemonConfig.particleColor || particleColor;
			}
		}

		const level = this.calculateEnemyLevel();
		const pokemonConfig = config.pokemon && this.spriteManager ? getPokemonConfig(config.pokemon) : null;
		const boss = new Enemy(clampedX, clampedY, this.bossType, config, animationSystem, level, particleColor, pokemonConfig, this.spriteManager);
		boss.isBoss = true;
		
		if (pokemonConfig) {
			boss.projectileColor = pokemonConfig.projectileColor || boss.projectileColor;
			boss.projectileSize = pokemonConfig.projectileSize || boss.projectileSize;
		}
		
		this.enemies.push(boss);
	}

	getBossTimerRemaining() {
		if (!this.bossTimer || this.bossSpawned) {
			return null;
		}
		return Math.max(0, this.bossTimer - this.gameTime);
	}

	getBossTimerMax() {
		return this.bossTimer;
	}

	getEnemies() {
		return this.enemies;
	}

	getBoss() {
		return this.enemies.find(enemy => enemy.isBoss && enemy.isAlive);
	}

	getBossMaxEnemies() {
		// Cap d'ennemis pendant le boss
		return 20;
	}

	render(renderer, debug = 0) {
		this.enemies.forEach(enemy => {
			enemy.render(renderer, debug);
		});
	}

	clear() {
		this.enemies = [];
		this.bossSpawned = false;
		this.frozenEnemyLevel = null;
		this.spawnFreezeTimer = 0;
		this.spawnFrozen = false;
	}
}

