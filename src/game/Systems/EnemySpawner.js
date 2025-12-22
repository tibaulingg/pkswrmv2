import Enemy from '../Entities/Enemy.js';
import AnimationSystem from './AnimationSystem.js';
import { EnemyTypes, MapEnemies } from '../Config/EnemyConfig.js';
import { getPokemonConfig } from '../Config/SpriteConfig.js';

export default class EnemySpawner {
	constructor(mapId, mapWidth, mapHeight, spriteManager, bossTimer = null, bossType = null, engine = null, collisionSystem = null) {
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
	}

	update(deltaTime, playerX, playerY, playerWidth = 32, playerHeight = 32) {
		this.gameTime += deltaTime;
		this.spawnTimer += deltaTime;
		this.difficultyUpdateTimer += deltaTime;

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

		if (this.spawnTimer >= adjustedSpawnInterval && currentEnemyCount < this.maxEnemies) {
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
				enemy.update(deltaTime, playerX, playerY, this.collisionSystem, playerWidth, playerHeight, otherEnemies);
			}
		});

		this.cleanupDistantEnemies(playerX, playerY);

		const beforeCount = this.enemies.length;
		this.enemies = this.enemies.filter(enemy => enemy.isAlive);
		const afterCount = this.enemies.length;
		this.totalEnemiesKilled += (beforeCount - afterCount);
	}

	updateDifficulty() {
		const minutes = this.gameTime / 60000;
		
		this.spawnInterval = Math.max(500, this.baseSpawnInterval - (minutes * 150));
		
		this.maxEnemies = Math.min(80, this.baseMaxEnemies + Math.floor(minutes * 5));
		
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

		const config = EnemyTypes[enemyType];
		if (this.engine && config.pokemon) {
			this.engine.encounteredPokemons.add(config.pokemon);
		}
		
		const spawnDistance = 400;
		const maxAttempts = 20;
		let validPosition = null;
		
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			if (angle === null) {
				angle = Math.random() * Math.PI * 2;
			} else if (attempt > 0) {
				angle = Math.random() * Math.PI * 2;
			}
			
			const x = playerX + Math.cos(angle) * spawnDistance;
			const y = playerY + Math.sin(angle) * spawnDistance;

			const clampedX = Math.max(0, Math.min(this.mapWidth - 32, x));
			const clampedY = Math.max(0, Math.min(this.mapHeight - 32, y));
			
			const enemyWidth = 32;
			const enemyHeight = 32;
			
			if (this.collisionSystem && this.collisionSystem.checkCollision(clampedX, clampedY, enemyWidth, enemyHeight)) {
				continue;
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
			const pokemonShootSprite = this.spriteManager.get(`${config.pokemon}_shoot`);
			if (pokemonConfig && pokemonWalkSprite && pokemonHurtSprite) {
				const spriteImages = {
					walk: pokemonWalkSprite,
					hurt: pokemonHurtSprite
				};
				if (pokemonShootSprite) {
					spriteImages.shoot = pokemonShootSprite;
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
		const enemy = new Enemy(clampedX, clampedY, enemyType, config, animationSystem, level, particleColor, pokemonConfig);
		
		if (pokemonConfig) {
			enemy.projectileColor = pokemonConfig.projectileColor || enemy.projectileColor;
			enemy.projectileSize = pokemonConfig.projectileSize || enemy.projectileSize;
		}
		
		this.enemies.push(enemy);
	}

	calculateEnemyLevel() {
		const timeMinutes = this.gameTime / 60000;
		const baseLevel = 1;
		const levelPerMinute = 2.0;
		const calculatedLevel = Math.floor(baseLevel + timeMinutes * levelPerMinute);
		
		const randomVariation = Math.random() < 0.3 ? Math.floor(Math.random() * 4) : 0;
		
		return Math.max(1, Math.min(100, calculatedLevel + randomVariation));
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

		const config = EnemyTypes[this.bossType];
		if (!config) return;

		if (this.engine && config.pokemon) {
			this.engine.encounteredPokemons.add(config.pokemon);
		}

		const spawnDistance = 400;
		const maxAttempts = 20;
		let validPosition = null;
		
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const angle = Math.random() * Math.PI * 2;
			const x = playerX + Math.cos(angle) * spawnDistance;
			const y = playerY + Math.sin(angle) * spawnDistance;

			const clampedX = Math.max(0, Math.min(this.mapWidth - 32, x));
			const clampedY = Math.max(0, Math.min(this.mapHeight - 32, y));
			
			const bossWidth = 96;
			const bossHeight = 96;
			
			if (this.collisionSystem && this.collisionSystem.checkCollision(clampedX, clampedY, bossWidth, bossHeight)) {
				continue;
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
			const pokemonShootSprite = this.spriteManager.get(`${config.pokemon}_shoot`);
			if (pokemonConfig && pokemonWalkSprite && pokemonHurtSprite) {
				const spriteImages = {
					walk: pokemonWalkSprite,
					hurt: pokemonHurtSprite
				};
				if (pokemonShootSprite) {
					spriteImages.shoot = pokemonShootSprite;
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
		const boss = new Enemy(clampedX, clampedY, this.bossType, config, animationSystem, level, particleColor, pokemonConfig);
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

	render(renderer, debug = 0) {
		this.enemies.forEach(enemy => {
			enemy.render(renderer, debug);
		});
	}

	clear() {
		this.enemies = [];
		this.bossSpawned = false;
	}
}

