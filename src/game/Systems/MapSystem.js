export default class MapSystem {
	constructor(width, height, backgroundImage = null) {
		this.backgroundImage = backgroundImage;
		
		if (this.backgroundImage) {
			this.width = this.backgroundImage.width;
			this.height = this.backgroundImage.height;
		} else {
			this.width = width;
			this.height = height;
		}
		
		this.color = '#222';
	}

	update(deltaTime) {
	}

	render(renderer) {
		if (this.backgroundImage) {
			renderer.drawImage(this.backgroundImage, 0, 0);
		} else {
			renderer.drawRect(0, 0, this.width, this.height, this.color);
			renderer.drawStrokeRect(0, 0, this.width, this.height, '#444', 2);
		}
	}
}

