import MenuScene from '../Scenes/MenuScene.js';
import GameScene from '../Scenes/GameScene.js';
import CollectionScene from '../Scenes/CollectionScene.js';
import InventoryScene from '../Scenes/InventoryScene.js';
import MapSelectionScene from '../Scenes/MapSelectionScene.js';
import BattleScene from '../Scenes/BattleScene.js';
import SettingsScene from '../Scenes/SettingsScene.js';

export default class SceneManager {
	constructor(engine) {
		this.engine = engine;
		this.scenes = {
			menu: new MenuScene(this.engine),
			game: new GameScene(this.engine),
			collection: new CollectionScene(this.engine),
			inventory: new InventoryScene(this.engine),
			mapSelection: new MapSelectionScene(this.engine),
			battle: new BattleScene(this.engine),
			settings: new SettingsScene(this.engine)
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
		const current = this.getCurrentScene();
		if (current) current.update(deltaTime);
	}

	render(renderer) {
		for (const scene of this.stack) {
			scene.render(renderer);
		}
	}
}

