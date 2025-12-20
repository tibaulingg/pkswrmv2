export default class BattlePlayer {
	constructor(x, y, animationSystem = null, pokemonConfig = null) {
		this.x = x;
		this.y = y;
		this.animationSystem = animationSystem;
		this.pokemonConfig = pokemonConfig;
		this.scale = 2;
		
		if (this.animationSystem) {
			const frameSize = this.animationSystem.getFrameSize(this.scale);
			this.spriteWidth = frameSize.width;
			this.spriteHeight = frameSize.height;
			this.width = frameSize.width * 0.6;
			this.height = frameSize.height * 0.6;
		} else {
			this.spriteWidth = 32;
			this.spriteHeight = 32;
			this.width = 32;
			this.height = 32;
		}
		
		this.speed = 3;
		this.directionX = 0;
		this.directionY = 0;
		this.velocityX = 0;
		this.velocityY = 0;
		
		this.hp = 100;
		this.maxHp = 100;
		this.displayedHp = 100;
		this.lostHp = 0;
		this.lostHpDecaySpeed = 0.5;
		this.isAlive = true;
		
		this.invulnerableTime = 0;
		this.invulnerableDuration = 500;
		this.hitFlashTime = 0;
		this.hurtAnimationTime = 0;
		this.hurtAnimationDuration = 300;
		
		this.attackType = pokemonConfig?.attackType || 'melee';
		this.type = pokemonConfig?.type || 'normal';
		this.damage = pokemonConfig?.damage || 10;
		this.attackSpeed = pokemonConfig?.attackSpeed || 1.0;
		this.range = pokemonConfig?.range || 80;
		this.knockback = pokemonConfig?.knockback || 30;
		this.projectileColor = pokemonConfig?.projectileColor || '#ffff00';
		this.projectileSize = pokemonConfig?.projectileSize || 8;
		this.attackCooldown = 0;
		this.attackCooldownMax = 1000 / this.attackSpeed;
		
		this.attackAnimationTime = 0;
		this.attackAnimationDuration = 200;
		this.spellAnimationTime = 0;
		this.spellAnimationDuration = 0;
		
		this.autoShoot = true;
		this.aimX = 0;
		this.aimY = 0;

		this.xp = 0;
		this.displayedXp = 0;
		this.level = 1;
		this.xpToNextLevel = 100;
		this.money = 0;
		this.displayedMoney = 0;
		this.gems = 0;
		this.displayedGems = 0;
		this.upgrades = {};
		this.hpRegen = 0;
		this.regenTimer = 0;
		this.projectileSpeedMultiplier = 1;
		this.fetchRange = 150;
		this.critChance = 0.05;
		this.critDamage = 1.5;
		this.aoeRadius = 0;
		this.hasAoE = false;
		this.lifeSteal = 0;
		this.xpGainMultiplier = 1;
		this.moneyGainMultiplier = 1;
		this.duration = 1;
	
		this.spells = [];
		this.maxSpells = 3;
		this.forcedDirection = null;
		if (pokemonConfig && pokemonConfig.spells) {
			pokemonConfig.spells.forEach(spellConfig => {
				this.spells.push({
					id: spellConfig.id,
					name: spellConfig.name,
					cooldownMax: spellConfig.cooldownMax,
					cooldown: 0,
					damageMultiplier: spellConfig.damageMultiplier,
					radius: spellConfig.radius,
					animation: spellConfig.animation,
					animationDuration: spellConfig.animationDuration,
					particleColor: spellConfig.particleColor,
					knockback: spellConfig.knockback,
					unlocked: true
				});
			});
		}
	}

	update(deltaTime, input, mapWidth, mapHeight, camera = null) {
		if (!this.isAlive) return;

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
			
			this.velocityX = this.directionX * this.speed / 16;
			this.velocityY = this.directionY * this.speed / 16;
			
			this.x += this.velocityX * deltaTime;
			this.y += this.velocityY * deltaTime;
		} else {
			this.velocityX = 0;
			this.velocityY = 0;
		}

		this.x = Math.max(0, Math.min(this.x, mapWidth - this.width));
		this.y = Math.max(0, Math.min(this.y, mapHeight - this.height));

		if (this.animationSystem) {
			if (this.forcedDirection !== null) {
				this.animationSystem.setDirection(this.forcedDirection);
				this.animationSystem.update(deltaTime, true, 0, 0);
			} else {
				this.animationSystem.update(deltaTime, isMoving, this.directionX, this.directionY);
			}
		}

		if (this.attackType === 'range' && camera) {
			if (!this.autoShoot) {
				const mousePos = input.getMousePosition();
				const worldPos = camera.screenToWorld(mousePos.x, mousePos.y);
				
				const dx = worldPos.x - this.getCenterX();
				const dy = worldPos.y - this.getCenterY();
				const distance = Math.sqrt(dx * dx + dy * dy);
				
				if (distance > this.range) {
					const ratio = this.range / distance;
					this.aimX = this.getCenterX() + dx * ratio;
					this.aimY = this.getCenterY() + dy * ratio;
				} else {
					this.aimX = worldPos.x;
					this.aimY = worldPos.y;
				}
			}
		}

		if (this.invulnerableTime > 0) {
			this.invulnerableTime -= deltaTime;
		}

		if (this.attackCooldown > 0) {
			this.attackCooldown -= deltaTime;
		}

		if (this.attackAnimationTime > 0) {
			this.attackAnimationTime -= deltaTime;
		}

		if (this.spellAnimationTime > 0) {
			this.spellAnimationTime -= deltaTime;
			if (this.spellAnimationTime <= 0 && this.animationSystem && !this.spinRotation) {
				this.animationSystem.setAnimation('walk');
			}
		}

		if (this.hitFlashTime > 0) {
			this.hitFlashTime -= deltaTime;
		}

		if (this.hurtAnimationTime > 0) {
			this.hurtAnimationTime -= deltaTime;
			if (this.hurtAnimationTime <= 0 && this.animationSystem) {
				this.animationSystem.setAnimation('walk');
			}
		}

		if (this.hpRegen > 0) {
			this.regenTimer += deltaTime;
			if (this.regenTimer >= 1000) {
				this.regenTimer = 0;
				this.hp = Math.min(this.hp + this.hpRegen, this.maxHp);
			}
		}

		this.spells.forEach(spell => {
			if (spell.cooldown > 0) {
				spell.cooldown -= deltaTime;
				if (spell.cooldown < 0) {
					spell.cooldown = 0;
				}
			}
		});

		const hpDiff = this.displayedHp - this.hp;
		if (hpDiff > 0.1) {
			this.displayedHp -= hpDiff * 0.1;
		} else {
			this.displayedHp = this.hp;
		}

		if (this.lostHp > 0) {
			this.lostHp -= this.lostHpDecaySpeed * deltaTime * 0.001 * this.maxHp;
			if (this.lostHp < 0) this.lostHp = 0;
		}

		const xpDiff = this.xp - this.displayedXp;
		if (Math.abs(xpDiff) > 0.5) {
			this.displayedXp += xpDiff * 0.15;
		} else {
			this.displayedXp = this.xp;
		}

		const moneyDiff = this.money - this.displayedMoney;
		if (Math.abs(moneyDiff) > 0.5) {
			this.displayedMoney += moneyDiff * 0.2;
		} else {
			this.displayedMoney = this.money;
		}

		const gemsDiff = this.gems - this.displayedGems;
		if (Math.abs(gemsDiff) > 0.5) {
			this.displayedGems += gemsDiff * 0.2;
		} else {
			this.displayedGems = this.gems;
		}
	}

	addXP(amount) {
		this.xp += amount;
		if (this.xp >= this.xpToNextLevel) {
			this.xp -= this.xpToNextLevel;
			this.displayedXp = 0;
			this.level++;
			this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.2);
			return true;
		}
		return false;
	}

	addMoney(amount) {
		this.money += amount;
	}

	addGems(amount) {
		this.gems += amount;
	}

	applyUpgrade(upgrade) {
		if (!this.upgrades[upgrade.id]) {
			this.upgrades[upgrade.id] = 0;
		}
		this.upgrades[upgrade.id]++;

		switch(upgrade.type) {
			case 'damage':
				this.damage *= upgrade.value;
				break;
			case 'attackSpeed':
				this.attackSpeed *= upgrade.value;
				this.attackCooldownMax = 1000 / this.attackSpeed;
				break;
			case 'range':
				this.range *= upgrade.value;
				break;
			case 'speed':
				this.speed *= upgrade.value;
				break;
			case 'maxHp':
				this.maxHp += upgrade.value;
				this.hp += upgrade.value;
				this.displayedHp += upgrade.value;
				break;
			case 'hpRegen':
				this.hpRegen += upgrade.value;
				break;
			case 'knockback':
				this.knockback *= upgrade.value;
				break;
			case 'projectileSpeed':
				this.projectileSpeedMultiplier *= upgrade.value;
				break;
			case 'projectileSize':
				this.projectileSize *= upgrade.value;
				break;
			case 'fetchRange':
				this.fetchRange *= upgrade.value;
				break;
			case 'critChance':
				this.critChance += upgrade.value;
				break;
			case 'critDamage':
				this.critDamage += upgrade.value;
				break;
			case 'lifeSteal':
				this.lifeSteal += upgrade.value;
				break;
			case 'xpGain':
				this.xpGainMultiplier *= upgrade.value;
				break;
			case 'moneyGain':
				this.moneyGainMultiplier *= upgrade.value;
				break;
			case 'duration':
				this.duration *= upgrade.value;
				break;
			case 'spell':
				this.unlockSpell(upgrade.value);
				break;
		}
	}

	calculateDamage() {
		const isCrit = Math.random() < this.critChance;
		const finalDamage = isCrit ? this.damage * this.critDamage : this.damage;
		return { damage: finalDamage, isCrit: isCrit };
	}

	toggleAutoShoot() {
		if (this.attackType === 'range') {
			this.autoShoot = !this.autoShoot;
		}
	}

	unlockSpell(spellId) {
		const spell = this.spells.find(s => s.id === spellId);
		if (spell && !spell.unlocked) {
			spell.unlocked = true;
		}
	}

	getUnlockedSpells() {
		return this.spells.filter(s => s.unlocked);
	}

	canCastSpell(spellIndex) {
		const unlockedSpells = this.getUnlockedSpells();
		if (spellIndex < 0 || spellIndex >= unlockedSpells.length) return false;
		const spell = unlockedSpells[spellIndex];
		return spell && spell.cooldown <= 0;
	}

	castSpell(spellIndex) {
		const unlockedSpells = this.getUnlockedSpells();
		if (spellIndex < 0 || spellIndex >= unlockedSpells.length) return null;
		const spell = unlockedSpells[spellIndex];
		if (!spell || spell.cooldown > 0) return null;
		
		if (spell.animation && this.animationSystem) {
			this.spellAnimationDuration = spell.animationDuration || 600;
			this.animationSystem.setAnimation(spell.animation, this.spellAnimationDuration);
			this.spellAnimationTime = this.spellAnimationDuration;
		}
		
		return spell;
	}

	canAttack() {
		return this.isAlive && this.attackCooldown <= 0;
	}

	performAttack() {
		if (!this.canAttack()) return null;
		
		this.attackCooldown = this.attackCooldownMax;
		this.attackAnimationTime = this.attackAnimationDuration;
		
		const damageCalc = this.calculateDamage();
		
		if (this.attackType === 'melee') {
			return {
				type: 'melee',
				x: this.getCenterX(),
				y: this.getCenterY(),
				range: this.range,
				damage: damageCalc.damage,
				isCrit: damageCalc.isCrit,
				knockback: this.knockback
			};
		} else if (this.attackType === 'range') {
			return {
				type: 'range',
				damage: damageCalc.damage,
				isCrit: damageCalc.isCrit,
				knockback: this.knockback,
				autoShoot: this.autoShoot,
				aimX: this.aimX,
				aimY: this.aimY,
				playerVelocityX: this.velocityX,
				playerVelocityY: this.velocityY,
				projectileColor: this.projectileColor,
				projectileSize: this.projectileSize,
				projectileSpeed: this.projectileSpeedMultiplier,
				aoeRadius: this.aoeRadius
			};
		}
		
		return null;
	}

	takeDamage(amount) {
		if (!this.isAlive || this.invulnerableTime > 0) return false;

		this.hp -= amount;
		this.lostHp = this.displayedHp - this.hp;
		this.invulnerableTime = this.invulnerableDuration;
		this.hitFlashTime = 150;
		this.hurtAnimationTime = this.hurtAnimationDuration;
		
		if (this.animationSystem) {
			this.animationSystem.setAnimation('hurt');
		}

		if (this.hp <= 0) {
			this.hp = 0;
			this.displayedHp = 0;
			this.lostHp = 0;
			this.isAlive = false;
			return true;
		}

		return false;
	}

	getCenterX() {
		const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
		return this.x + hitboxOffsetX + this.width / 2;
	}

	getCenterY() {
		const hitboxOffsetY = (this.spriteHeight - this.height) / 2;
		return this.y + hitboxOffsetY + this.height / 2;
	}

	getHitboxX() {
		const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
		return this.x + hitboxOffsetX;
	}

	getHitboxY() {
		const hitboxOffsetY = (this.spriteHeight - this.height) / 2;
		return this.y + hitboxOffsetY;
	}

	render(renderer, debug = 0) {
		if (debug === 1) {
			renderer.ctx.save();
			renderer.ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
			renderer.ctx.lineWidth = 1;
			renderer.ctx.strokeRect(this.getHitboxX(), this.getHitboxY(), this.width, this.height);
			renderer.ctx.restore();
		}

		if (this.attackType === 'melee' && this.range > 0) {
			renderer.ctx.save();
			renderer.ctx.strokeStyle = 'rgba(255, 255, 100, 0.3)';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.setLineDash([5, 5]);
			renderer.ctx.beginPath();
			renderer.ctx.arc(
				this.getCenterX(),
				this.getCenterY(),
				this.range,
				0,
				Math.PI * 2
			);
			renderer.ctx.stroke();
			renderer.ctx.setLineDash([]);
			renderer.ctx.restore();
		}

		if (this.attackType === 'range' && this.range > 0) {
			renderer.ctx.save();
			renderer.ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.setLineDash([5, 5]);
			renderer.ctx.beginPath();
			renderer.ctx.arc(
				this.getCenterX(),
				this.getCenterY(),
				this.range,
				0,
				Math.PI * 2
			);
			renderer.ctx.stroke();
			renderer.ctx.setLineDash([]);
			renderer.ctx.restore();
		}

		if (this.attackType === 'range' && this.aimX !== 0 && this.aimY !== 0) {
			renderer.ctx.save();
			renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.beginPath();
			renderer.ctx.moveTo(this.getCenterX(), this.getCenterY());
			renderer.ctx.lineTo(this.aimX, this.aimY);
			renderer.ctx.stroke();
			renderer.ctx.restore();
		}

		if (this.attackAnimationTime > 0 && this.attackType === 'melee') {
			const progress = 1 - (this.attackAnimationTime / this.attackAnimationDuration);
			const currentRadius = this.range * progress;
			const opacity = 1 - progress;
			
			renderer.ctx.save();
			renderer.ctx.strokeStyle = `rgba(255, 200, 0, ${opacity * 0.8})`;
			renderer.ctx.lineWidth = 4;
			renderer.ctx.beginPath();
			renderer.ctx.arc(
				this.getCenterX(),
				this.getCenterY(),
				currentRadius,
				0,
				Math.PI * 2
			);
			renderer.ctx.stroke();
			
			renderer.ctx.strokeStyle = `rgba(255, 150, 0, ${opacity * 0.5})`;
			renderer.ctx.lineWidth = 8;
			renderer.ctx.beginPath();
			renderer.ctx.arc(
				this.getCenterX(),
				this.getCenterY(),
				currentRadius * 0.8,
				0,
				Math.PI * 2
			);
			renderer.ctx.stroke();
			renderer.ctx.restore();
		}

		const isBlinking = this.invulnerableTime > 0 && Math.floor(this.invulnerableTime / 100) % 2 === 0;
		
		if (!isBlinking) {
			if (this.animationSystem) {
				this.animationSystem.render(renderer, this.x, this.y, this.scale);
			} else {
				renderer.drawRect(this.x, this.y, this.width, this.height, '#4a90e2');
			}
		}
	}

}

