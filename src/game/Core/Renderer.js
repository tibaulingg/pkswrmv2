export default class Renderer {
	constructor(ctx) {
		this.ctx = ctx;
		this.width = ctx.canvas.width;
		this.height = ctx.canvas.height;
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	drawRect(x, y, width, height, color, alpha = 1) {
		this.ctx.save();
		this.ctx.globalAlpha = alpha;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x, y, width, height);
		this.ctx.restore();
	}

	drawStrokeRect(x, y, width, height, color, lineWidth = 2) {
		this.ctx.save();
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = lineWidth;
		this.ctx.strokeRect(x, y, width, height);
		this.ctx.restore();
	}

	drawText(text, x, y, size = '20px', color = '#fff', align = 'left') {
		this.ctx.save();
		this.ctx.fillStyle = color;
		this.ctx.font = `${size} Pokemon, Arial`;
		this.ctx.textAlign = align;
		this.ctx.fillText(text, x, y);
		this.ctx.restore();
	}

	drawImage(image, x, y, width, height) {
		if (!image) return;
		this.ctx.save();
		if (width && height) {
			this.ctx.drawImage(image, x, y, width, height);
		} else {
			this.ctx.drawImage(image, x, y);
		}
		this.ctx.restore();
	}
}

