import Player from '../Entities/Player.js';
import MapSystem from '../Systems/MapSystem.js';
import Camera from '../Systems/Camera.js';
import CollisionSystem from '../Systems/CollisionSystem.js';
import EventSystem from '../Systems/EventSystem.js';
import EventHandler from '../Systems/EventHandler.js';
import AnimationSystem from '../Systems/AnimationSystem.js';
import { HubMenuConfig } from '../Config/MenuConfig.js';
import { HubCollisions, HubEvents } from '../Config/CollisionConfig.js';
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
	}

	init() {
		const hubImage = this.engine.sprites.get('hub');
		this.map = new MapSystem(1280, 720, hubImage);
		this.collisionSystem = new CollisionSystem(HubCollisions);
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
		
		this.engine.audio.playMusic('hub');
	}

	update(deltaTime) {
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
		
		if (this.player) {
			this.player.render(renderer);
		}
		
		this.camera.restore(renderer.ctx);
		
		this.renderHUD(renderer);
		
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
}

