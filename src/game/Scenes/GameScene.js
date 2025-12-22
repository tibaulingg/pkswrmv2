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
import { ItemConfig } from '../Config/ItemConfig.js';
import SaveManager from '../Systems/SaveManager.js';

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
		this.eggHatchingAnimation = null;
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
		
		if (this.eggHatchingAnimation) {
			this.eggHatchingAnimation.timer += deltaTime;
			
			const chanseyNpc = this.npcs.find(npc => npc.id === 'chansey');
			
			if (this.eggHatchingAnimation.timer >= this.eggHatchingAnimation.eggShowDuration && !this.eggHatchingAnimation.chanseyReturnedToIdle) {
				if (chanseyNpc) {
					const pokemonConfig = getPokemonConfig('chansey');
					const idleSprite = this.engine.sprites.get('chansey_idle');
					if (pokemonConfig && idleSprite) {
						chanseyNpc.animationSystem = new AnimationSystem(pokemonConfig, { idle: idleSprite });
						const baseIdleDuration = pokemonConfig.animations.idle?.duration || null;
						chanseyNpc.fasterIdleDuration = baseIdleDuration ? baseIdleDuration * 0.5 : null;
						chanseyNpc.animationSystem.setIdleInterval(700);
						chanseyNpc.animationSystem.setDirection('down');
						chanseyNpc.animationSystem.currentAnimation = 'idle';
						chanseyNpc.animationSystem.currentFrame = 0;
						chanseyNpc.animationSystem.calculateFrameDimensions();
						chanseyNpc.idleTimer = 700;
						chanseyNpc.animationSystem.setAnimation('idle', chanseyNpc.fasterIdleDuration);
						this.eggHatchingAnimation.chanseyReturnedToIdle = true;
					}
				}
			}
			
			if (this.eggHatchingAnimation.timer >= this.eggHatchingAnimation.eggShowDuration && !this.eggHatchingAnimation.confirmMenuShown) {
				this.showHatchConfirmMenu();
				this.eggHatchingAnimation.confirmMenuShown = true;
			}
			
			if (this.eggHatchingAnimation.timer >= this.eggHatchingAnimation.totalDuration && !this.eggHatchingAnimation.confirmMenuShown) {
				this.eggHatchingAnimation = null;
			}
			
			if (this.eggHatchingAnimation) {
				if (chanseyNpc && chanseyNpc.animationSystem && !this.eggHatchingAnimation.chanseyReturnedToIdle) {
					chanseyNpc.animationSystem.update(deltaTime, false, 0, 0);
				} else if (chanseyNpc && chanseyNpc.animationSystem && this.eggHatchingAnimation.chanseyReturnedToIdle) {
					if (!chanseyNpc.animationSystem.isPlayingIdle) {
						chanseyNpc.idleTimer += deltaTime;
						if (chanseyNpc.idleTimer >= chanseyNpc.animationSystem.idleInterval) {
							chanseyNpc.animationSystem.setAnimation('idle', chanseyNpc.fasterIdleDuration);
							chanseyNpc.idleTimer = 0;
						}
					}
					if (chanseyNpc.animationSystem.currentAnimation === 'idle') {
						chanseyNpc.animationSystem.update(deltaTime, false, 0, 0);
					}
				}
				
				if (this.eggHatchingAnimation.timer >= this.eggHatchingAnimation.eggShowDuration) {
					if (!this.eggHatchingAnimation.pokemonAnimationSystem) {
						const pokemonWalkSprite = this.engine.sprites.get(`${this.eggHatchingAnimation.hatchedPokemon}_walk`);
						if (pokemonWalkSprite) {
							const pokemonConfig = getPokemonConfig(this.eggHatchingAnimation.hatchedPokemon);
							if (pokemonConfig) {
								this.eggHatchingAnimation.pokemonAnimationSystem = new AnimationSystem(pokemonConfig, pokemonWalkSprite);
								this.eggHatchingAnimation.pokemonAnimationSystem.setDirection('down');
							}
						}
					}
					if (this.eggHatchingAnimation.pokemonAnimationSystem) {
						this.eggHatchingAnimation.pokemonAnimationSystem.update(deltaTime, true, 0, 1);
					}
				}
			}
		}
		
		this.npcs.forEach(npc => {
			if (npc.animationSystem && (!this.eggHatchingAnimation || npc.id !== 'chansey')) {
				if (npc.animationSystem.currentAnimation === 'charge') {
					npc.animationSystem.update(deltaTime, false, 0, 0);
					
					if (npc.chargeStartTime && Date.now() - npc.chargeStartTime >= npc.chargeDuration) {
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
							npc.chargeStartTime = null;
							npc.chargeDuration = null;
						}
					}
				} else {
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
			if (this.eggHatchingAnimation) {
				return;
			}
			
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
		
		if (this.eggHatchingAnimation) {
			const chanseyNpc = this.npcs.find(npc => npc.id === 'chansey');
			if (chanseyNpc) {
				const eggX = chanseyNpc.x + chanseyNpc.width / 2;
				const eggY = chanseyNpc.y + chanseyNpc.height - 25;
				const eggSize = 20;
				
				if (this.eggHatchingAnimation.timer >= 0 && 
					this.eggHatchingAnimation.timer < this.eggHatchingAnimation.eggShowDuration) {
					const eggSprite = this.engine.sprites.get(`item_${this.eggHatchingAnimation.eggId}`);
					if (eggSprite) {
						renderer.ctx.save();
						renderer.ctx.drawImage(eggSprite, eggX - eggSize / 2, eggY - eggSize / 2, eggSize, eggSize);
						renderer.ctx.restore();
					}
				} else if (this.eggHatchingAnimation.timer >= this.eggHatchingAnimation.eggShowDuration) {
					if (!this.eggHatchingAnimation.hitSoundPlayed) {
						this.engine.audio.play('hit', 0.5, 0.1);
						this.eggHatchingAnimation.hitSoundPlayed = true;
					}
					
					if (this.eggHatchingAnimation.pokemonAnimationSystem) {
						const pokemonSize = 32;
						const pokemonX = eggX - pokemonSize / 2 + 40;
						const pokemonY = eggY - pokemonSize / 2 - 20;
						renderer.ctx.save();
						this.eggHatchingAnimation.pokemonAnimationSystem.render(renderer, pokemonX, pokemonY, 1, false);
						renderer.ctx.restore();
					}
				}
			}
		}
		
		if (this.player) {
			this.player.render(renderer);
		}
		
		this.camera.restore(renderer.ctx);
	}

	startEggHatchingAnimation(chanseyNpc, eggId, hatchedPokemon) {
		this.eggHatchingAnimation = {
			eggId: eggId,
			hatchedPokemon: hatchedPokemon,
			timer: 0,
			chargeDuration: 1000,
			eggShowDuration: 2000,
			hatchDuration: 2000,
			totalDuration: 5000,
			hitSoundPlayed: false,
			confirmMenuShown: false
		};
	}

	showHatchConfirmMenu() {
		const pokemonConfig = getPokemonConfig(this.eggHatchingAnimation.hatchedPokemon);
		const pokemonName = pokemonConfig ? pokemonConfig.name : this.eggHatchingAnimation.hatchedPokemon;
		const message = `Accueillir ${pokemonName} ?`;
		
		const onYes = (engine) => {
			if (!engine.encounteredPokemons) {
				engine.encounteredPokemons = new Set();
			}
			if (!engine.playedPokemons) {
				engine.playedPokemons = new Set();
			}
			engine.encounteredPokemons.add(this.eggHatchingAnimation.hatchedPokemon);
			engine.playedPokemons.add(this.eggHatchingAnimation.hatchedPokemon);
			SaveManager.saveGame(engine, false);
			engine.sceneManager.popScene();
			this.eggHatchingAnimation = null;
			
			setTimeout(() => {
				engine.sceneManager.pushScene('shop', { shopId: 'chansey' });
				const shopScene = engine.sceneManager.stack.find(
					scene => scene.constructor.name === 'ShopScene'
				);
				if (shopScene) {
					shopScene.mode = 'hatching';
					shopScene.selectedItemIndex = 0;
					shopScene.currentPage = 0;
				}
			}, 100);
		};
		
		const onNo = (engine) => {
			if (!engine.encounteredPokemons) {
				engine.encounteredPokemons = new Set();
			}
			engine.encounteredPokemons.add(this.eggHatchingAnimation.hatchedPokemon);
			SaveManager.saveGame(engine, false);
			engine.sceneManager.popScene();
			this.eggHatchingAnimation = null;
			
			setTimeout(() => {
				engine.sceneManager.pushScene('shop', { shopId: 'chansey' });
				const shopScene = engine.sceneManager.stack.find(
					scene => scene.constructor.name === 'ShopScene'
				);
				if (shopScene) {
					shopScene.mode = 'hatching';
					shopScene.selectedItemIndex = 0;
					shopScene.currentPage = 0;
				}
			}, 100);
		};
		
		this.engine.sceneManager.pushScene('confirmMenu', {
			message: message,
			onYes: onYes,
			onNo: onNo
		});
		
		this.engine.audio.play('ok', 0.3, 0.1);
	}
}

