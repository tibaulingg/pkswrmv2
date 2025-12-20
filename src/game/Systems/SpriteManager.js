export default class SpriteManager {
	constructor() {
		this.sprites = {};
	}

	load(name, path) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				this.sprites[name] = img;
				resolve(img);
			};
			img.onerror = reject;
			img.src = path;
		});
	}

	get(name) {
		return this.sprites[name];
	}
}

