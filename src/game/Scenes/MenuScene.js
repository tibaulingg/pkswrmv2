import { MainMenuConfig } from '../Config/MenuConfig.js';

export default class MenuScene {
	constructor(engine) {
		this.engine = engine;
	}

	init() {
		this.engine.menuManager.openMenu(MainMenuConfig);
		this.engine.audio.playMusic('main_menu');
	}

	update(deltaTime) {
		if (!this.engine.menuManager.isMenuOpen()) {
			this.engine.menuManager.openMenu(MainMenuConfig);
		}
		this.engine.menuManager.update();
	}

	render(renderer) {
		const background = this.engine.sprites.get('background');
		if (background) {
			renderer.drawImage(background, 0, 0, renderer.width, renderer.height);
		}
		this.engine.menuManager.render(renderer);
	}
}

