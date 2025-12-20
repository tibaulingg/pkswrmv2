export default class SpellSystem {
	constructor() {
		this.handlers = {
			earthquake: {
				cast: this.castEarthquake,
				render: this.renderEarthquake
			},
			rock_trap: {
				cast: this.castRockTrap,
				render: this.renderRockTrap
			},
			hydrocanon: {
				cast: this.castHydrocanon,
				render: this.renderHydrocanon
			}
		};
	}

	castSpell(spell, player, enemies) {
		if (!spell || spell.cooldown > 0) return null;

		const handler = this.handlers[spell.id];
		if (!handler) return null;

		const spellData = this.buildSpellData(spell, player);

		spell.cooldown = spell.cooldownMax;

		return handler.cast.call(this, spellData, enemies);
	}

	buildSpellData(spell, player) {
		const baseRadius = spell.radius ?? 100;
		const multiplier = player.projectileSize * player.projectileSpeedMultiplier || 1;

		const playerDamage = player.damage || 0;
		const damage = spell.damage ?? playerDamage * (spell.damageMultiplier ?? 1);

		const baseDuration = spell.animationDuration || 1000;
		const duration = baseDuration * (player.duration || 1)

		return {
			id: spell.id,
			damage,
			radius: baseRadius * multiplier,
			baseRadius,
			animationDuration: duration,
			duration: duration,
			x: player.getCenterX(),
			y: player.getCenterY(),
			animation: spell.animation,
			particleColor: spell.particleColor || player.pokemonConfig?.particleColor || '#ffff00',
			knockback: spell.knockback || player.knockback,
			directionX: player.directionX || 0,
			directionY: player.directionY || 0
		};
	}

	castEarthquake(spellData, enemies) {
		const hitEnemies = [];
		const radiusSq = spellData.radius * spellData.radius;

		for (let i = 0; i < enemies.length; i++) {
			const enemy = enemies[i];
			const dx = enemy.getCenterX() - spellData.x;
			const dy = enemy.getCenterY() - spellData.y;
			const distSq = dx * dx + dy * dy;

			if (distSq > radiusSq) continue;

			const distance = Math.sqrt(distSq) || 1;

			hitEnemies.push({
				enemy,
				distance,
				damage: spellData.damage,
				knockback: spellData.knockback,
				knockbackDirection: {
					x: dx / distance,
					y: dy / distance
				}
			});
		}

		return this.buildEffect(spellData, hitEnemies);
	}

	buildEffect(spellData, hitEnemies) {
		return {
			type: spellData.id,
			x: spellData.x,
			y: spellData.y,
			radius: spellData.radius,
			hitEnemies,
			particleColor: spellData.particleColor,
			animation: spellData.animation,
			startTime: Date.now(),
			duration: spellData.animationDuration,
			damage: spellData.damage,
			knockback: spellData.knockback
		};
	}

	update(deltaTime, player) {
		const spells = player?.spells;
		if (!spells) return;

		for (let i = 0; i < spells.length; i++) {
			const s = spells[i];
			if (s.cooldown > 0) {
				s.cooldown = Math.max(0, s.cooldown - deltaTime);
			}
		}
	}

	render(renderer, effect, engine) {
		const handler = this.handlers[effect?.type];
		if (handler) {
			if (effect.type === 'rock_trap') {
				handler.render.call(this, renderer, effect, engine);
			} else {
				handler.render.call(this, renderer, effect);
			}
		}
	}

	renderEarthquake(renderer, effect) {
		const elapsed = Date.now() - effect.startTime;
		const progress = elapsed / effect.duration;
		if (progress >= 1) return;

		const radius = effect.radius * progress;
		const opacity = 1 - progress;
		const ctx = renderer.ctx;

		ctx.save();

		const gradient = ctx.createRadialGradient(
			effect.x, effect.y, 0,
			effect.x, effect.y, radius
		);

		gradient.addColorStop(0, `rgba(139,69,19,${0.8 * opacity})`);
		gradient.addColorStop(0.3, `rgba(101,67,33,${0.6 * opacity})`);
		gradient.addColorStop(1, 'rgba(101,67,33,0)');

		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
		ctx.fill();

		ctx.lineWidth = 5;
		ctx.strokeStyle = `rgba(139,69,19,${0.9 * opacity})`;
		ctx.stroke();

		ctx.lineWidth = 3;
		ctx.strokeStyle = `rgba(160,82,45,${0.7 * opacity})`;
		ctx.beginPath();
		ctx.arc(effect.x, effect.y, radius * 0.85, 0, Math.PI * 2);
		ctx.stroke();

		ctx.restore();
	}

	castRockTrap(spellData, enemies) {
		const numRocks = 8;
		const trapRadius = spellData.radius;
		const rocks = [];
		const rockSize = 32;
		const spawnDuration = 400;
		const effectStartTime = Date.now();

		for (let i = 0; i < numRocks; i++) {
			const angle = (i / numRocks) * Math.PI * 2;
			const x = spellData.x + Math.cos(angle) * trapRadius;
			const y = spellData.y + Math.sin(angle) * trapRadius;

			rocks.push({
				x: x - rockSize / 2,
				y: y - rockSize / 2,
				width: rockSize,
				height: rockSize,
				active: true,
				startTime: effectStartTime,
				spawnTime: effectStartTime + (i / numRocks) * spawnDuration,
				spawnDuration: spawnDuration,
				lifetime: 10000,
				baseX: x - rockSize / 2,
				baseY: y - rockSize / 2
			});
		}

		return {
			type: 'rock_trap',
			x: spellData.x,
			y: spellData.y,
			radius: trapRadius,
			rocks: rocks,
			damage: spellData.damage,
			knockback: spellData.knockback,
			startTime: Date.now(),
			duration: spellData.animationDuration,
			particleColor: spellData.particleColor
		};
	}

	renderRockTrap(renderer, effect, engine) {
		if (!effect.rocks || effect.rocks.length === 0) return;

		const stoneImage = engine?.sprites?.get('stone');
		if (!stoneImage) return;

		const ctx = renderer.ctx;
		ctx.save();

		const now = Date.now();

		effect.rocks.forEach(rock => {
			if (!rock.active) return;

			const elapsed = now - rock.startTime;
			if (elapsed >= rock.lifetime) {
				rock.active = false;
				return;
			}

			const spawnElapsed = now - rock.spawnTime;
			let spawnProgress = 0;
			let scale = 1;
			let alpha = 1;
			let offsetY = 0;

			if (spawnElapsed < 0) {
				return;
			} else if (spawnElapsed < rock.spawnDuration) {
				spawnProgress = spawnElapsed / rock.spawnDuration;
				const easeOut = 1 - Math.pow(1 - spawnProgress, 3);
				scale = 0.3 + easeOut * 0.7;
				alpha = spawnProgress;
				offsetY = (1 - easeOut) * 20;
			}

			const fadeOutStart = rock.lifetime - 300;
			const fadeOutElapsed = elapsed - fadeOutStart;
			if (fadeOutElapsed > 0) {
				const fadeOutProgress = Math.min(fadeOutElapsed / 300, 1);
				alpha = 1 - fadeOutProgress;
				scale = 1 - fadeOutProgress * 0.3;
			}

			const currentWidth = rock.width * scale;
			const currentHeight = rock.height * scale;
			const currentX = rock.baseX + (rock.width - currentWidth) / 2;
			const currentY = rock.baseY + (rock.height - currentHeight) / 2 - offsetY;

			ctx.save();
			ctx.globalAlpha = alpha;

			ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
			ctx.shadowBlur = 8 * scale;
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetY = 2;

			ctx.drawImage(stoneImage, currentX, currentY, currentWidth, currentHeight);

			if (spawnProgress < 1) {
				const glowSize = currentWidth * 1.3;
				const glowX = currentX - (glowSize - currentWidth) / 2;
				const glowY = currentY - (glowSize - currentHeight) / 2;
				
				const glowGradient = ctx.createRadialGradient(
					currentX + currentWidth / 2,
					currentY + currentHeight / 2,
					0,
					currentX + currentWidth / 2,
					currentY + currentHeight / 2,
					glowSize / 2
				);
				glowGradient.addColorStop(0, `rgba(139, 69, 19, ${0.6 * (1 - spawnProgress)})`);
				glowGradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
				
				ctx.fillStyle = glowGradient;
				ctx.fillRect(glowX, glowY, glowSize, glowSize);
			}

			ctx.restore();
		});

		ctx.restore();
	}

	castHydrocanon(spellData, enemies) {
		return {
			type: 'hydrocanon',
			x: spellData.x,
			y: spellData.y,
			radius: spellData.radius,
			damage: spellData.damage,
			knockback: spellData.knockback,
			startTime: Date.now(),
			duration: spellData.animationDuration,
			particleColor: spellData.particleColor,
			directionX: spellData.directionX || 0,
			directionY: spellData.directionY || 0,
			rotationAngle: 0,
			playerX: spellData.x,
			playerY: spellData.y,
			waterProjectiles: [],
			lastProjectileTime: Date.now(),
			projectileInterval: 50,
			spellId: spellData.id
		};
	}

	renderHydrocanon(renderer, effect, engine) {
		if (!effect.waterProjectiles) return;

		const ctx = renderer.ctx;
		ctx.save();

		effect.waterProjectiles.forEach(projectile => {
			if (!projectile.active) return;

			const alpha = 1 - (projectile.traveledDistance / projectile.maxDistance);
			if (alpha <= 0) return;

			ctx.save();
			ctx.globalAlpha = alpha * 0.9;

			const gradient = ctx.createRadialGradient(
				projectile.x, projectile.y, 0,
				projectile.x, projectile.y, projectile.size
			);
			gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
			gradient.addColorStop(0.3, 'rgba(135, 206, 235, 0.8)');
			gradient.addColorStop(0.7, 'rgba(77, 208, 225, 0.6)');
			gradient.addColorStop(1, 'rgba(77, 208, 225, 0.2)');

			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
			ctx.fill();

			ctx.strokeStyle = 'rgba(135, 206, 235, 0.9)';
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.globalAlpha = 1;
			ctx.restore();
		});

		ctx.restore();
	}
}
