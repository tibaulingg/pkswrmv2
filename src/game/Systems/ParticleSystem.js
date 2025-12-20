class Particle {
	constructor(x, y, velocityX, velocityY, size, color, lifetime) {
		this.x = x;
		this.y = y;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.size = size;
		this.color = color;
		this.lifetime = lifetime;
		this.maxLifetime = lifetime;
		this.isActive = true;
		this.gravity = 0.0001;
	}

	update(deltaTime) {
		if (!this.isActive) return;

		this.velocityY += this.gravity * deltaTime;
		this.x += this.velocityX * deltaTime;
		this.y += this.velocityY * deltaTime;
		this.lifetime -= deltaTime;

		if (this.lifetime <= 0) {
			this.isActive = false;
		}
	}

	render(renderer) {
		if (!this.isActive) return;

		const alpha = this.lifetime / this.maxLifetime;
		const r = parseInt(this.color.slice(1, 3), 16);
		const g = parseInt(this.color.slice(3, 5), 16);
		const b = parseInt(this.color.slice(5, 7), 16);

		renderer.ctx.save();
		renderer.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
		renderer.ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
		renderer.ctx.restore();
	}
}

export default class ParticleSystem {
	constructor() {
		this.particles = [];
	}

	createExplosion(x, y, color, count = 20) {
		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 0.02 + Math.random() * 0.06;
			const velocityX = Math.cos(angle) * speed;
			const velocityY = Math.sin(angle) * speed;
			const size = 2 + Math.floor(Math.random() * 4);
			const lifetime = 300 + Math.random() * 300;

			const particle = new Particle(x, y, velocityX, velocityY, size, color, lifetime);
			this.particles.push(particle);
		}
	}

	update(deltaTime) {
		this.particles.forEach(particle => {
			particle.update(deltaTime);
		});
		this.particles = this.particles.filter(p => p.isActive);
	}

	render(renderer) {
		this.particles.forEach(particle => {
			particle.render(renderer);
		});
	}

	clear() {
		this.particles = [];
	}
}

