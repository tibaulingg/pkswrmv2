export default class TransitionScene {
	constructor(engine) {
		this.engine = engine;
		this.gameScene = null;
		this.animationTimer = 0;
		this.animationDuration = 1000;
		this.mapData = null;
	}

	init(data) {
		this.animationTimer = 0;
		this.mapData = data?.mapData || null;

		this.gameScene = this.engine.sceneManager.stack.find(
			scene => scene.constructor.name === 'GameScene'
		);

		if (this.gameScene && this.gameScene.player && this.gameScene.player.animationSystem) {
			this.gameScene.player.animationSystem.setAnimation('walk');
			this.gameScene.player.animationSystem.setDirection('up');
		}
	}

	update(deltaTime) {
		this.animationTimer += deltaTime;

		if (!this.gameScene || !this.gameScene.player) {
			return;
		}

		const speed = 0.3;
		const moveY = -speed * deltaTime;
		this.gameScene.player.y += moveY;

		if (this.gameScene.player.animationSystem) {
			this.gameScene.player.animationSystem.update(deltaTime, true, 0, -1);
		}

		const isCompletelyOut = this.gameScene.player.y + this.gameScene.player.height < 0;

		if (this.animationTimer >= this.animationDuration) {
			if (this.mapData) {
				this.engine.gameManager.startGame(this.mapData);
			}
		}
	}

	render(renderer) {
		if (this.gameScene) {
			this.gameScene.render(renderer);
		}
	}
}

