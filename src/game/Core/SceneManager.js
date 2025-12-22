
import GameScene from '../Scenes/GameScene.js';
import BattleScene from '../Scenes/BattleScene.js';
import MainMenuScene from '../Scenes/MainMenuScene.js';
import ContinueGameScene from '../Scenes/ContinueGameScene.js';
import NewGameScene from '../Scenes/NewGameScene.js';
import PauseScene from '../Scenes/PauseScene.js';
import MapSelectionScene from '../Scenes/MapSelectionScene.js';
import ConfirmMenuScene from '../Scenes/ConfirmMenuScene.js';
import TransitionScene from '../Scenes/TransitionScene.js';
import ShopScene from '../Scenes/ShopScene.js';

export default class SceneManager {
	constructor(engine) {
		this.engine = engine;
		this.scenes = {
			menu: new MainMenuScene(this.engine),
			continueGame: new ContinueGameScene(this.engine),
			newGame: new NewGameScene(this.engine),
			game: new GameScene(this.engine),
			battle: new BattleScene(this.engine),
			pause: new PauseScene(this.engine),
			mapSelection: new MapSelectionScene(this.engine),
			confirmMenu: new ConfirmMenuScene(this.engine),
			transition: new TransitionScene(this.engine),
			shop: new ShopScene(this.engine)
		};
		this.stack = [];
	}

	pushScene(name, data) {
		const scene = this.scenes[name];
		if (scene) {
			if (data) {
				scene.init(data);
			} else {
				scene.init();
			}
			this.stack.push(scene);
		}
	}

	popScene() {
		return this.stack.pop();
	}

	changeScene(name, data) {
		this.stack = [];
		this.pushScene(name, data);
	}

	getCurrentScene() {
		return this.stack[this.stack.length - 1];
	}

	update(deltaTime) {
		for (const scene of this.stack) {
			scene.update(deltaTime);
		}
	}

	render(renderer) {
		for (const scene of this.stack) {
			scene.render(renderer);
		}
	}
}

