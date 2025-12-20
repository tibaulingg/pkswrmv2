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
		let r, g, b;
		
		if (this.color.startsWith('#')) {
			r = parseInt(this.color.slice(1, 3), 16);
			g = parseInt(this.color.slice(3, 5), 16);
			b = parseInt(this.color.slice(5, 7), 16);
		} else if (this.color.startsWith('rgb')) {
			const matches = this.color.match(/\d+/g);
			if (matches && matches.length >= 3) {
				r = parseInt(matches[0]);
				g = parseInt(matches[1]);
				b = parseInt(matches[2]);
			} else {
				r = g = b = 255;
			}
		} else {
			const colorMap = {
				'blue': [0, 0, 255],
				'red': [255, 0, 0],
				'green': [0, 255, 0],
				'yellow': [255, 255, 0],
				'white': [255, 255, 255],
				'black': [0, 0, 0],
				'cyan': [0, 255, 255],
				'magenta': [255, 0, 255],
				'orange': [255, 165, 0],
				'purple': [128, 0, 128]
			};
			const colorLower = this.color.toLowerCase();
			if (colorMap[colorLower]) {
				[r, g, b] = colorMap[colorLower];
			} else {
				r = g = b = 255;
			}
		}

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

	createExplosion(x, y, color, count = 20, type = 'normal') {
		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			let speed = 0.02 + Math.random() * 0.06;
			let size = 2 + Math.floor(Math.random() * 4);
			let lifetime = 300 + Math.random() * 300;
			
			let particleColor = color;
			
			switch(type) {
				case 'water':
					particleColor = this.getWaterParticleColor(i, count);
					speed = 0.03 + Math.random() * 0.08;
					size = 3 + Math.floor(Math.random() * 5);
					break;
				case 'fire':
					particleColor = this.getFireParticleColor(i, count);
					speed = 0.04 + Math.random() * 0.1;
					size = 2 + Math.floor(Math.random() * 6);
					break;
				case 'electric':
					particleColor = this.getElectricParticleColor(i, count);
					speed = 0.05 + Math.random() * 0.12;
					size = 1 + Math.floor(Math.random() * 4);
					lifetime = 200 + Math.random() * 200;
					break;
				case 'grass':
					particleColor = this.getGrassParticleColor(i, count);
					speed = 0.02 + Math.random() * 0.06;
					size = 2 + Math.floor(Math.random() * 5);
					break;
				case 'ice':
					particleColor = this.getIceParticleColor(i, count);
					speed = 0.02 + Math.random() * 0.05;
					size = 2 + Math.floor(Math.random() * 4);
					break;
				case 'ground':
					particleColor = this.getGroundParticleColor(i, count);
					speed = 0.01 + Math.random() * 0.04;
					size = 3 + Math.floor(Math.random() * 6);
					break;
				case 'rock':
					particleColor = this.getRockParticleColor(i, count);
					speed = 0.01 + Math.random() * 0.05;
					size = 2 + Math.floor(Math.random() * 5);
					break;
				case 'bug':
					particleColor = this.getBugParticleColor(i, count);
					speed = 0.03 + Math.random() * 0.08;
					size = 1 + Math.floor(Math.random() * 3);
					break;
			}

			const velocityX = Math.cos(angle) * speed;
			const velocityY = Math.sin(angle) * speed;
			const particle = new Particle(x, y, velocityX, velocityY, size, particleColor, lifetime);
			this.particles.push(particle);
		}
	}
	
	getWaterParticleColor(index, total) {
		const colors = ['#64c8ff', '#4da8ff', '#3299ff', '#1e8fff'];
		return colors[index % colors.length];
	}
	
	getFireParticleColor(index, total) {
		const colors = ['#ffaa00', '#ff6600', '#ff3300', '#ff0000', '#ffff00'];
		return colors[index % colors.length];
	}
	
	getElectricParticleColor(index, total) {
		const colors = ['#ffff00', '#ffff88', '#ffffaa', '#ffffff'];
		return colors[index % colors.length];
	}
	
	getGrassParticleColor(index, total) {
		const colors = ['#96ff96', '#64ff64', '#32ff32', '#00ff00'];
		return colors[index % colors.length];
	}
	
	getIceParticleColor(index, total) {
		const colors = ['#c8f0ff', '#a0e0ff', '#78d0ff', '#ffffff'];
		return colors[index % colors.length];
	}
	
	getGroundParticleColor(index, total) {
		const colors = ['#c89664', '#a07850', '#8b5a3c', '#6b4423'];
		return colors[index % colors.length];
	}
	
	getRockParticleColor(index, total) {
		const colors = ['#b4b4b4', '#969696', '#787878', '#5a5a5a'];
		return colors[index % colors.length];
	}
	
	getBugParticleColor(index, total) {
		const colors = ['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0'];
		return colors[index % colors.length];
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

