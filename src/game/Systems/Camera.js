export default class Camera {
	constructor(viewportWidth, viewportHeight, mapWidth, mapHeight, zoom = 2) {
		this.viewportWidth = viewportWidth;
		this.viewportHeight = viewportHeight;
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
		this.zoom = zoom;
		this.x = 0;
		this.y = 0;
		this.shakeIntensity = 0;
		this.shakeTime = 0;
		this.shakeDuration = 0;
		this.shakeOffsetX = 0;
		this.shakeOffsetY = 0;
	}

	follow(targetX, targetY) {
		this.x = targetX - (this.viewportWidth / this.zoom) / 2;
		this.y = targetY - (this.viewportHeight / this.zoom) / 2;

		this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.viewportWidth / this.zoom));
		this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.viewportHeight / this.zoom));
	}

	update(deltaTime) {
		if (this.shakeTime > 0) {
			this.shakeTime -= deltaTime;
			if (this.shakeTime < 0) {
				this.shakeTime = 0;
			}
			const progress = this.shakeDuration > 0 ? this.shakeTime / this.shakeDuration : 0;
			const intensity = this.shakeIntensity * Math.max(0, progress);
			this.shakeOffsetX = (Math.random() - 0.5) * 2 * intensity;
			this.shakeOffsetY = (Math.random() - 0.5) * 2 * intensity;
		} else {
			this.shakeOffsetX = 0;
			this.shakeOffsetY = 0;
			this.shakeDuration = 0;
		}
	}

	shake(intensity = 10, duration = 200, enabled = true) {
		console.log('shake', intensity, duration, enabled);
		if (!enabled) return;
		console.log('shake', intensity, duration);
		this.shakeIntensity = intensity;
		this.shakeTime = duration;
		this.shakeDuration = duration;
	}

	apply(ctx) {
		ctx.save();
		ctx.scale(this.zoom, this.zoom);
		ctx.translate(-this.x + this.shakeOffsetX, -this.y + this.shakeOffsetY);
	}

	restore(ctx) {
		ctx.restore();
	}

	worldToScreen(worldX, worldY) {
		return {
			x: (worldX - this.x) * this.zoom,
			y: (worldY - this.y) * this.zoom
		};
	}

	screenToWorld(screenX, screenY) {
		return {
			x: screenX / this.zoom + this.x,
			y: screenY / this.zoom + this.y
		};
	}
}

