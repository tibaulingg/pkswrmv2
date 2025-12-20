export default class CollisionSystem {
	constructor(collisionRects = []) {
		this.collisionRects = collisionRects;
	}

	setCollisions(collisionRects) {
		this.collisionRects = collisionRects;
	}

	checkCollision(x, y, width, height) {
		for (const rect of this.collisionRects) {
			if (this.rectanglesOverlap(x, y, width, height, rect.x, rect.y, rect.width, rect.height)) {
				return true;
			}
		}
		return false;
	}

	rectanglesOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
		return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
	}

	canMoveTo(x, y, width, height) {
		return !this.checkCollision(x, y, width, height);
	}

	render(renderer, debug = false) {
		if (!debug) return;
		
		this.collisionRects.forEach(rect => {
			renderer.ctx.save();
			renderer.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.setLineDash([5, 5]);
			renderer.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
			renderer.ctx.restore();
		});
	}
}

