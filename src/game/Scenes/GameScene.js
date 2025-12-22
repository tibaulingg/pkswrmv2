import Player from '../Entities/Player.js';
import MapSystem from '../Systems/MapSystem.js';
import Camera from '../Systems/Camera.js';
import CollisionSystem from '../Systems/CollisionSystem.js';
import EventSystem from '../Systems/EventSystem.js';
import EventHandler from '../Systems/EventHandler.js';
import AnimationSystem from '../Systems/AnimationSystem.js';
import { HubMenuConfig, ShopMenuConfig } from '../Config/MenuConfig.js';
import { HubCollisions, HubEvents, MapTileCollisions, tilesToCollisionRects } from '../Config/CollisionConfig.js';
import { getPokemonConfig } from '../Config/SpriteConfig.js';

export default class GameScene {
	constructor(engine) {
		this.engine = engine;
		this.player = null;
		this.map = null;
		this.camera = null;
		this.collisionSystem = null;
		this.eventSystem = null;
		this.eventHandler = null;
		this.debugCollisions = false;
		this.debugEvents = false;
		this.npcs = [];
		this.isEntering = false;
		this.enteringAnimationTimer = 0;
		this.enteringAnimationDuration = 1000;
		this.targetSpawnY = 550;
		this.enteringFromTop = false;
	}

	init(data) {
		const hubImage = this.engine.sprites.get('hub');
		this.map = new MapSystem(1920, 1080, hubImage);
		
		const hubTileCollisions = MapTileCollisions.hub || [];
		const tileRects = tilesToCollisionRects(hubTileCollisions);
		const allCollisions = [...HubCollisions, ...tileRects];
		this.collisionSystem = new CollisionSystem(allCollisions);
		this.eventSystem = new EventSystem(HubEvents);
		this.eventHandler = new EventHandler(this.engine);
		
		const selectedPokemon = data?.selectedPokemon || this.engine.selectedPokemon || 'quaksire';
		const pokemonWalkSprite = this.engine.sprites.get(`${selectedPokemon}_walk`);
		const pokemonConfig = getPokemonConfig(selectedPokemon);
		const animationSystem = pokemonConfig && pokemonWalkSprite ? new AnimationSystem(pokemonConfig, pokemonWalkSprite) : null;
		
		const spawnX = 360;
		const spawnY = 550;
		
		if (!animationSystem) {
			const quaksireWalkSprite = this.engine.sprites.get('quaksire_walk');
			const quaksireConfig = getPokemonConfig('quaksire');
			const fallbackAnimationSystem = new AnimationSystem(quaksireConfig, quaksireWalkSprite);
			this.player = new Player(spawnX, spawnY, fallbackAnimationSystem);
		} else {
			this.player = new Player(spawnX, spawnY, animationSystem);
		}
		
		this.targetSpawnY = spawnY;
		this.isEntering = true;
		this.enteringAnimationTimer = 0;
		this.enteringAnimationDuration = 1000;
		this.enteringFromTop = data?.enteringFromTop || false;
		
		if (this.player) {
			if (this.enteringFromTop) {
				this.player.y = -this.player.height;
			} else {
				this.player.y = this.map.height;
			}
		}
		
		this.camera = new Camera(1920, 1080, this.map.width, this.map.height, 2.5);
		this.debugCollisions = false;
		
		this.initNPCs();
		
		this.engine.audio.playMusic('hub');
	}

	initNPCs() {
		this.npcs = [
			{
				id: 'kecleon',
				shopId: 'kecleon',
				x: 159,
				y: 402,
				width: 64,
				height: 64,
				interactionRange: 80,
				animationSystem: null,
				idleTimer: 0,
				fasterIdleDuration: null
			},
			{
				id: 'chansey',
				shopId: 'chansey',
				x: 615,
				y: 455,
				width: 64,
				height: 64,
				interactionRange: 80,
				animationSystem: null,
				idleTimer: 0,
				fasterIdleDuration: null
			}
		];

		this.npcs.forEach(npc => {
			const pokemonConfig = getPokemonConfig(npc.id);
			const idleSprite = this.engine.sprites.get(`${npc.id}_idle`);
			if (pokemonConfig && idleSprite) {
				npc.animationSystem = new AnimationSystem(pokemonConfig, { idle: idleSprite });
				const baseIdleDuration = pokemonConfig.animations.idle?.duration || null;
				npc.fasterIdleDuration = baseIdleDuration ? baseIdleDuration * 0.5 : null;
				npc.animationSystem.setIdleInterval(700);
				npc.animationSystem.setDirection('down');
				npc.animationSystem.currentAnimation = 'idle';
				npc.animationSystem.currentFrame = 0;
				npc.animationSystem.calculateFrameDimensions();
				npc.idleTimer = 700;
				npc.animationSystem.setAnimation('idle', npc.fasterIdleDuration);
			}
		});
		
		this.updateNPCCollisions();
	}

	updateNPCCollisions() {
		if (this.collisionSystem && this.npcs) {
			const npcCollisions = this.npcs.map(npc => {
				const hitboxSize = 24;
				return {
					x: npc.x ,
					y: npc.y ,
					width: hitboxSize,
					height: hitboxSize
				};
			});
			
			const hubTileCollisions = MapTileCollisions.hub || [];
			const tileRects = tilesToCollisionRects(hubTileCollisions);
			const baseCollisions = [...HubCollisions, ...tileRects];
			
			this.collisionSystem.setCollisions([...baseCollisions, ...npcCollisions]);
		}
	}

	update(deltaTime) {
		const currentScene = this.engine.sceneManager.getCurrentScene();
		const isPauseOpen = currentScene && (currentScene.constructor.name === 'PauseScene' || currentScene === this.engine.sceneManager.scenes.pause);
		const isMapSelectionOpen = currentScene && (currentScene.constructor.name === 'MapSelectionScene' || currentScene === this.engine.sceneManager.scenes.mapSelection);
		const isConfirmMenuOpen = currentScene && (currentScene.constructor.name === 'ConfirmMenuScene' || currentScene === this.engine.sceneManager.scenes.confirmMenu);
		const isTransitionOpen = currentScene && (currentScene.constructor.name === 'TransitionScene' || currentScene === this.engine.sceneManager.scenes.transition);
		const isShopOpen = currentScene && (currentScene.constructor.name === 'ShopScene' || currentScene === this.engine.sceneManager.scenes.shop);
		
		this.npcs.forEach(npc => {
			if (npc.animationSystem) {
				if (!npc.animationSystem.isPlayingIdle) {
					npc.idleTimer += deltaTime;
					if (npc.idleTimer >= npc.animationSystem.idleInterval) {
						npc.animationSystem.setAnimation('idle', npc.fasterIdleDuration);
						npc.idleTimer = 0;
					}
				}
				if (npc.animationSystem.currentAnimation === 'idle') {
					npc.animationSystem.update(deltaTime, false, 0, 0);
				}
			}
		});
		
		this.updateNPCCollisions();
		
		if (isPauseOpen || isMapSelectionOpen || isConfirmMenuOpen || isTransitionOpen || isShopOpen) {
			return;
		}

		if (this.isEntering) {
			this.enteringAnimationTimer += deltaTime;
			
			if (this.player) {
				const progress = Math.min(this.enteringAnimationTimer / this.enteringAnimationDuration, 1);
				let startY;
				let directionY;
				
				if (this.enteringFromTop) {
					startY = -this.player.height;
					directionY = 1;
					this.player.y = startY + (this.targetSpawnY - startY) * progress;
				} else {
					startY = this.map.height;
					directionY = -1;
					this.player.y = startY - (startY - this.targetSpawnY) * progress;
				}
				
				if (this.player.animationSystem) {
					this.player.animationSystem.update(deltaTime, true, 0, directionY);
				}
				
				this.camera.follow(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
				
				if (progress >= 1) {
					this.player.y = this.targetSpawnY;
					this.isEntering = false;
				}
			}
			
			return;
		}

		const key = this.engine.input.consumeLastKey();
		if (key === 'Escape') {
			this.engine.sceneManager.pushScene('pause');
			return;
		}
		if (key === 'KeyE') {
			this.engine.sceneManager.pushScene('pause', { openEggsMenu: true });
			return;
		}
		if (key === 'KeyC') {
			this.debugCollisions = !this.debugCollisions;
		}
		if (key === 'KeyV') {
			this.debugEvents = !this.debugEvents;
		}
		if (key === 'Enter') {
			const playerCenterX = this.player.x + this.player.width / 2;
			const playerCenterY = this.player.y + this.player.height / 2;
			
			for (const npc of this.npcs) {
				const npcCenterX = npc.x + npc.width / 2;
				const npcCenterY = npc.y + npc.height / 2;
				const distance = Math.sqrt(
					Math.pow(playerCenterX - npcCenterX, 2) + 
					Math.pow(playerCenterY - npcCenterY, 2)
				);
				
				if (distance <= npc.interactionRange) {
					this.engine.sceneManager.pushScene('shop', { shopId: npc.shopId });
					this.engine.audio.play('ok', 0.3, 0.1);
					return;
				}
			}
		}
		if (this.player) {
			this.player.update(deltaTime, this.engine.input, this.map, this.collisionSystem);

			if (this.eventSystem) {
				this.eventSystem.update(this.player.x, this.player.y, this.player.width, this.player.height, this.eventHandler);
			}
			
			this.camera.follow(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
		}
	}

	render(renderer) {
		this.camera.apply(renderer.ctx);
		
		if (this.map) {
			this.map.render(renderer);
		}
		
		if (this.collisionSystem && this.debugCollisions) {
			this.collisionSystem.render(renderer, true);
		}
		
		if (this.eventSystem && this.debugEvents) {
			this.eventSystem.render(renderer, true);
		}
		
		this.npcs.forEach(npc => {
			if (npc.animationSystem) {
				npc.animationSystem.render(renderer, npc.x, npc.y, 2, false);
			} else {
				const npcSprite = this.engine.sprites.get(`${npc.id}_normal`);
				if (npcSprite) {
					renderer.drawImage(npcSprite, npc.x, npc.y, npc.width, npc.height);
				}
			}
		});
		
		if (this.player) {
			this.player.render(renderer);
		}
		
		this.camera.restore(renderer.ctx);
	}
}

