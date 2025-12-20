import { MainMenuConfig } from '../Config/MenuConfig.js';

export default class MenuScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedBackground = null;
	}

	init() {
		const backgroundNumber = Math.floor(Math.random() * 3) + 1;
		this.selectedBackground = this.engine.sprites.get(`background_${backgroundNumber}`);
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
		if (this.selectedBackground) {
			renderer.drawImage(this.selectedBackground, 0, 0, renderer.width, renderer.height);
		}
		this.engine.menuManager.render(renderer);
	}
}

