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

	init() {
		const hubImage = this.engine.sprites.get('hub');
		this.map = new MapSystem(1280, 720, hubImage);
		
		const hubTileCollisions = MapTileCollisions.hub || [];
		const tileRects = tilesToCollisionRects(hubTileCollisions);
		const allCollisions = [...HubCollisions, ...tileRects];
		this.collisionSystem = new CollisionSystem(allCollisions);
		this.eventSystem = new EventSystem(HubEvents);
		this.eventHandler = new EventHandler(this.engine);
		
		const quaksireWalkSprite = this.engine.sprites.get('quaksire_walk');
		const quaksireConfig = getPokemonConfig('quaksire');
		const animationSystem = new AnimationSystem(quaksireConfig, quaksireWalkSprite);
		
		const spawnX = 360;
		const spawnY = 550;
		this.player = new Player(spawnX, spawnY, animationSystem);
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
		if (this.kecleon.animationSystem) {
			this.kecleon.animationSystem.update(deltaTime, false, 0, 0);
		}
		
		if (this.engine.menuManager.isMenuOpen()) {
			this.engine.menuManager.update();
			return;
		}

		const key = this.engine.input.consumeLastKey();
		if (key === 'Escape') {
			this.engine.menuManager.openMenu(HubMenuConfig);
			return;
		}
		if (key === 'KeyC') {
			this.debugCollisions = !this.debugCollisions;
		}
		if (key === 'KeyV') {
			this.debugEvents = !this.debugEvents;
		}
		if (key === 'Enter' && this.showInteractionPrompt) {
			this.engine.menuManager.openMenu(ShopMenuConfig);
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
		
		this.renderHUD(renderer);
		
		if (this.showInteractionPrompt && !this.engine.menuManager.isMenuOpen()) {
			this.renderInteractionPrompt(renderer);
		}
		
		if (this.engine.menuManager.isMenuOpen()) {
			this.engine.menuManager.render(renderer);
		}
	}

	renderHUD(renderer) {
		const margin = 20;
		const padding = 20;
		const boxWidth = 150;
		const boxHeight = 60;

		const targetMoney = this.engine.money || 0;
		if (this.engine.displayedMoney < targetMoney) {
			this.engine.displayedMoney = Math.min(this.engine.displayedMoney + (targetMoney - this.engine.displayedMoney) * 0.1, targetMoney);
		} else if (this.engine.displayedMoney > targetMoney) {
			this.engine.displayedMoney = Math.max(this.engine.displayedMoney - (this.engine.displayedMoney - targetMoney) * 0.1, targetMoney);
		}

		const x = renderer.width - boxWidth - margin;
		const y = margin;

		renderer.drawRect(x, y, boxWidth, boxHeight, 'rgba(0, 0, 50, 0.7)');
		renderer.drawStrokeRect(x, y, boxWidth, boxHeight, '#fff', 3);

		renderer.ctx.fillStyle = '#ffd700';
		renderer.ctx.font = '24px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.fillText('₽', x + boxWidth / 2, y + 30);

		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.font = 'bold 18px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.fillText(Math.floor(this.engine.displayedMoney).toString(), x + boxWidth / 2, y + 55);
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

