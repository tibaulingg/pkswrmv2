export default class Player {
	constructor(x, y, animationSystem = null) {
		this.x = x;
		this.y = y;
		this.animationSystem = animationSystem;
		this.scale = 2;
		
		if (this.animationSystem) {
			const frameSize = this.animationSystem.getFrameSize(this.scale);
			this.width = frameSize.width;
			this.height = frameSize.height;
		} else {
			this.width = 32;
			this.height = 32;
		}
		
		this.speed = 0.3;
		this.color = '#00ff00';
		this.directionX = 0;
		this.directionY = 0;
	}

	update(deltaTime, input, map, collisionSystem) {
		let moveX = 0;
		let moveY = 0;

		if (input.isKeyDown('ArrowUp') || input.isKeyDown('KeyW')) moveY -= 1;
		if (input.isKeyDown('ArrowDown') || input.isKeyDown('KeyS')) moveY += 1;
		if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) moveX -= 1;
		if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) moveX += 1;

		const isMoving = moveX !== 0 || moveY !== 0;

		if (isMoving) {
			const length = Math.sqrt(moveX * moveX + moveY * moveY);
			this.directionX = moveX / length;
			this.directionY = moveY / length;
			
			const deltaX = this.directionX * this.speed * deltaTime;
			const deltaY = this.directionY * this.speed * deltaTime;

			const newX = this.x + deltaX;
			const newY = this.y + deltaY;

			if (collisionSystem.canMoveTo(newX, this.y, this.width, this.height)) {
				this.x = newX;
			}

			if (collisionSystem.canMoveTo(this.x, newY, this.width, this.height)) {
				this.y = newY;
			}
		}

		this.x = Math.max(0, Math.min(this.x, map.width - this.width));
		this.y = Math.max(0, Math.min(this.y, map.height - this.height));

		if (this.animationSystem) {
			this.animationSystem.update(deltaTime, isMoving, this.directionX, this.directionY);
		}
	}

	render(renderer) {
		if (this.animationSystem) {
			this.animationSystem.render(renderer, this.x, this.y, this.scale);
		} else {
			renderer.drawRect(this.x, this.y, this.width, this.height, this.color);
		}
	}
}

