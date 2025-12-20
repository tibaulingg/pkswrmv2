class DamageNumber {
	constructor(x, y, damage, color, isCrit = false) {
		this.x = x;
		this.y = y;
		this.damage = damage;
		this.color = color;
		this.isCrit = isCrit;
		this.lifetime = 250;
		this.maxLifetime = 250;
		this.velocityY = isCrit ? -0.12 : -0.08;
		this.isActive = true;
	}

	update(deltaTime) {
		if (!this.isActive) return;

		this.y += this.velocityY * deltaTime;
		this.lifetime -= deltaTime;

		if (this.lifetime <= 0) {
			this.isActive = false;
		}
	}

	render(renderer) {
		if (!this.isActive) return;

		const alpha = this.lifetime / this.maxLifetime;
		const scale = this.isCrit ? (1 + (1 - alpha) * 0.8) : (1 + (1 - alpha) * 0.5);
		const fontSize = this.isCrit ? 10 : 7;
		const color = this.isCrit ? '#ffd700' : this.color;

		renderer.ctx.save();
		renderer.ctx.translate(this.x, this.y);
		renderer.ctx.scale(scale, scale);
		renderer.ctx.globalAlpha = alpha;

		if (this.isCrit) {
			renderer.ctx.shadowColor = '#ffd700';
			renderer.ctx.shadowBlur = 10;
		}

		renderer.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.lineWidth = this.isCrit ? 3 : 2;
		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.textAlign = 'center';
		renderer.ctx.strokeText(`-${Math.floor(this.damage)}`, 0, 0);

		renderer.ctx.fillStyle = color;
		renderer.ctx.fillText(`-${Math.floor(this.damage)}`, 0, 0);

		if (this.isCrit) {
			renderer.ctx.shadowBlur = 0;
		}

		renderer.ctx.restore();
	}
}

export default class DamageNumberSystem {
	constructor() {
		this.numbers = [];
	}

	addDamage(x, y, damage, isPlayer = false, isCrit = false) {
		const color = isPlayer ? '#ff4444' : '#ffffff';
		const offsetX = (Math.random() - 0.5) * 20;
		const number = new DamageNumber(x + offsetX, y, damage, color, isCrit);
		this.numbers.push(number);
	}

	update(deltaTime) {
		this.numbers.forEach(number => {
			number.update(deltaTime);
		});
		this.numbers = this.numbers.filter(n => n.isActive);
	}

	render(renderer) {
		this.numbers.forEach(number => {
			number.render(renderer);
		});
	}

	clear() {
		this.numbers = [];
	}
}

