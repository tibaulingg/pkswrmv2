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
		this.kecleon = {
			x: 500,
			y: 420,
			width: 64,
			height: 64,
			interactionRange: 80,
			animationSystem: null
		};
		this.showInteractionPrompt = false;
	}

	init(data) {
		const hubImage = this.engine.sprites.get('hub');
		this.map = new MapSystem(1280, 720, hubImage);
		
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
		
		if (!animationSystem) {
			const quaksireWalkSprite = this.engine.sprites.get('quaksire_walk');
			const quaksireConfig = getPokemonConfig('quaksire');
			const fallbackAnimationSystem = new AnimationSystem(quaksireConfig, quaksireWalkSprite);
			this.player = new Player(360, 550, fallbackAnimationSystem);
		} else {
			const spawnX = 360;
			const spawnY = 550;
			this.player = new Player(spawnX, spawnY, animationSystem);
		}
		
		this.camera = new Camera(1280, 720, this.map.width, this.map.height);
		this.debugCollisions = false;
		
		const kecleonConfig = getPokemonConfig('kecleon');
		const kecleonIdleSprite = this.engine.sprites.get('kecleon_idle');
		if (kecleonConfig && kecleonIdleSprite) {
			this.kecleon.animationSystem = new AnimationSystem(kecleonConfig, { idle: kecleonIdleSprite });
			const idleDuration = kecleonConfig.animations.idle?.duration || null;
			this.kecleon.animationSystem.setAnimation('idle', idleDuration);
			this.kecleon.animationSystem.setDirection('down');
		}
		
		this.engine.audio.playMusic('hub');
	}

	update(deltaTime) {
		const currentScene = this.engine.sceneManager.getCurrentScene();
		const isPauseOpen = currentScene && (currentScene.constructor.name === 'PauseScene' || currentScene === this.engine.sceneManager.scenes.pause);
		const isMapSelectionOpen = currentScene && (currentScene.constructor.name === 'MapSelectionScene' || currentScene === this.engine.sceneManager.scenes.mapSelection);
		const isConfirmMenuOpen = currentScene && (currentScene.constructor.name === 'ConfirmMenuScene' || currentScene === this.engine.sceneManager.scenes.confirmMenu);
		const isTransitionOpen = currentScene && (currentScene.constructor.name === 'TransitionScene' || currentScene === this.engine.sceneManager.scenes.transition);
		
		if (this.kecleon.animationSystem) {
			this.kecleon.animationSystem.update(deltaTime, false, 0, 0);
		}
		
		if (isPauseOpen || isMapSelectionOpen || isConfirmMenuOpen || isTransitionOpen) {
			return;
		}

		const key = this.engine.input.consumeLastKey();
		if (key === 'Escape') {
			this.engine.sceneManager.pushScene('pause');
			return;
		}
		if (key === 'KeyC') {
			this.debugCollisions = !this.debugCollisions;
		}
		if (key === 'KeyV') {
			this.debugEvents = !this.debugEvents;
		}
		if (key === 'Enter' && this.showInteractionPrompt) {
			return;
		}
		if (this.player) {
			this.player.update(deltaTime, this.engine.input, this.map, this.collisionSystem);

			if (this.eventSystem) {
				this.eventSystem.update(this.player.x, this.player.y, this.player.width, this.player.height, this.eventHandler);
			}
			
			this.camera.follow(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);

			const playerCenterX = this.player.x + this.player.width / 2;
			const playerCenterY = this.player.y + this.player.height / 2;
			const kecleonCenterX = this.kecleon.x + this.kecleon.width / 2;
			const kecleonCenterY = this.kecleon.y + this.kecleon.height / 2;
			const distance = Math.sqrt(
				Math.pow(playerCenterX - kecleonCenterX, 2) + 
				Math.pow(playerCenterY - kecleonCenterY, 2)
			);
			this.showInteractionPrompt = distance <= this.kecleon.interactionRange;
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
		
		if (this.kecleon.animationSystem) {
			this.kecleon.animationSystem.render(renderer, this.kecleon.x, this.kecleon.y, 2);
		} else {
			const kecleonSprite = this.engine.sprites.get('kecleon_normal');
			if (kecleonSprite) {
				renderer.drawImage(kecleonSprite, this.kecleon.x, this.kecleon.y, this.kecleon.width, this.kecleon.height);
			}
		}
		
		if (this.player) {
			this.player.render(renderer);
		}
		
		this.camera.restore(renderer.ctx);
	
		if (this.showInteractionPrompt) {
			this.renderInteractionPrompt(renderer);
		}
		
	}



	renderInteractionPrompt(renderer) {
		const text = 'Interact (ENTER)';
		const fontSize = '20px';
		const padding = 10;
		
		renderer.ctx.save();
		renderer.ctx.font = `${fontSize} Pokemon`;
		renderer.ctx.textAlign = 'center';
		const textMetrics = renderer.ctx.measureText(text);
		const textWidth = textMetrics.width;
		const textHeight = 25;
		
		const x = renderer.width / 2;
		const y = renderer.height - 80;
		
		renderer.drawRect(x - textWidth / 2 - padding, y - textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding * 2, 'rgba(0, 0, 0, 0.7)');
		renderer.drawStrokeRect(x - textWidth / 2 - padding, y - textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding * 2, '#fff', 2);
		
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.fillText(text, x, y);
		renderer.ctx.restore();
	}
}

