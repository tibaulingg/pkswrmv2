import { getSpellConfig } from '../Config/SpellConfig.js';
import { calculateStatWithIV } from '../Systems/IVSystem.js';
import { Upgrades, UpgradeType } from '../Config/UpgradeConfig.js';

const BASE_SPEED = 1.9;

export default class BattlePlayer {
	constructor(x, y, animationSystem = null, pokemonConfig = null, ivs = null) {
		this.x = x;
		this.y = y;
		this.animationSystem = animationSystem;
		this.pokemonConfig = pokemonConfig;
		this.ivs = ivs;
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
		
		const baseSpeed = BASE_SPEED * (pokemonConfig?.speedMultiplier || 1);
		this.baseSpeed = baseSpeed;
		this.speed = calculateStatWithIV(baseSpeed, ivs?.speed, 'speed');
		this.directionX = 0;
		this.directionY = 0;
		this.velocityX = 0;
		this.velocityY = 0;
		
		const baseHp = pokemonConfig?.hp || 100;
		this.baseHp = baseHp;
		this.maxHp = calculateStatWithIV(baseHp, ivs?.hp, 'hp');
		this.hp = this.maxHp;
		this.displayedHp = this.hp;
		this.lostHp = 0;
		this.lostHpDecaySpeed = 0.8;
		this.isAlive = true;
		
		this.invulnerableTime = 0;
		this.invulnerableDuration = 500;
		this.hitFlashTime = 0;
		this.hurtAnimationTime = 0;
		this.hurtAnimationDuration = 300;
		this.faintAnimationTime = 0;
		this.faintAnimationDuration = pokemonConfig?.animations?.faint?.duration || 1000;
		this.isDying = false;
		
		this.attackType = pokemonConfig?.attackType || 'melee';
		this.type = pokemonConfig?.type || 'normal';
		const baseDamage = pokemonConfig?.damage;
		this.baseDamage = baseDamage;
		this.damage = calculateStatWithIV(baseDamage, ivs?.damage, 'damage');
		console.log('[STATS] Initial damage calculation:', {
			baseDamage,
			iv: ivs?.damage,
			finalDamage: this.damage,
			formula: `baseDamage (${baseDamage}) * (1 + iv (${ivs?.damage || 0}) * 0.01) = ${this.damage}`
		});
		const baseAttackSpeed = pokemonConfig?.attackSpeed || 1.0;
		this.baseAttackSpeed = baseAttackSpeed;
		this.attackSpeed = calculateStatWithIV(baseAttackSpeed, ivs?.attackSpeed, 'attackSpeed');
		const baseRange = pokemonConfig?.range || 80;
		this.baseRange = baseRange;
		this.range = calculateStatWithIV(baseRange, ivs?.range, 'range');
		const baseKnockback = pokemonConfig?.knockback || 30;
		this.baseKnockback = baseKnockback;
		this.knockback = calculateStatWithIV(baseKnockback, ivs?.knockback, 'knockback');
		this.projectileColor = pokemonConfig?.projectileColor || '#ffff00';
		this.attackCooldown = 0;
		this.attackCooldownMax = 1000 / this.attackSpeed;
		this.meleeAttackColor = pokemonConfig?.meleeAttackColor || null;
		
		this.attackAnimationTime = 0;
		this.attackAnimationDuration = 200;
		this.spellAnimationTime = 0;
		this.spellAnimationDuration = 0;
		
		this.autoattack = true;
		this.aimX = 0;
		this.aimY = 0;

		this.xp = 0;
		this.displayedXp = 0;
		this.level = 1;
		this.xpToNextLevel = 200;
		this.money = 0;
		this.displayedMoney = 0;
		this.gems = 0;
		this.displayedGems = 0;
		this.upgrades = {};
		this.hpRegen = 0;
		this.regenTimer = 0;
		this.projectileSpeedMultiplier = 1;
		this.projectileCount = 1;
		this.dodgeChance = 0;
		this.fetchRange = 150;
		this.critChance = 0.05;
		this.critDamage = 1.5;
		this.aoeRadius = 0;
		this.hasAoE = false;
		this.hasPiercing = false;
		this.hasBounce = false;
		this.hasEffect = false;
		this.bounceCount = 1; // Ancien système, gardé pour compatibilité
		this.aoeDamageMultiplier = 1;
		this.aoeRadiusMultiplier = 1;
		this.piercingCount = 0;
		this.piercingDamageReduction = 0.2; // Réduction de base par ennemi
		this.piercingMaxCount = 0; // Nombre max d'ennemis transpercables (0 = illimité)
		this.bounceMaxCount = 1; // Nombre max de rebonds
		this.bounceDetectionRange = 300; // Rayon de détection pour les rebonds
		this.bounceRange = 600;
		this.effectProcChance = 0.2; // Chance de base de déclencher un effet (15%)
		this.effectDamageMultiplier = 1.0; // Multiplicateur de dégâts des effets
		this.effectIntensityMultiplier = 1.0; // Multiplicateur d'intensité des effets
		this.effectDurationMultiplier = 1.0; // Multiplicateur de durée des effets
		this.xpGainMultiplier = 1;
		this.moneyGainMultiplier = 1;
		this.duration = 1;
	
		this.spells = [];
		this.maxSpells = 3;
		this.spellPressAnimations = {};
		this.consumablePressAnimation = 0;
		this.eggPressAnimation = 0;
		this.statAnimations = {};
		this.forcedDirection = null;
		this.spellLevels = {};
		this.spellDamageMultipliers = {};
		this.spellRangeMultipliers = {};
		this.spellCooldownMultipliers = {};
		this.waterDamageMultiplier = 1.0;
		this.fireDamageMultiplier = 1.0;
		this.grassDamageMultiplier = 1.0;
		this.electricDamageMultiplier = 1.0;
		
		this.enemyRepulsionRadius = 80;
		this.enemyRepulsionStrength = 0.0;
	}

	applyEquippedItem(itemId, itemConfig) {
		console.log('[STATS] applyEquippedItem called:', {
			itemId,
			itemConfig: itemConfig ? itemConfig.name : 'null',
			hasEffect: itemConfig && itemConfig.effect ? true : false,
			effectType: itemConfig && itemConfig.effect ? itemConfig.effect.type : 'none'
		});
		
		if (!itemConfig || !itemConfig.effect) {
			console.log('[STATS] applyEquippedItem: Skipping - no itemConfig or no effect');
			return;
		}
		
		const effect = itemConfig.effect;
		
		if (effect.type === 'waterDamageBoost') {
			if (!this.waterDamageMultiplier) this.waterDamageMultiplier = 1.0;
			this.waterDamageMultiplier += effect.value;
		} else if (effect.type === 'fireDamageBoost') {
			if (!this.fireDamageMultiplier) this.fireDamageMultiplier = 1.0;
			this.fireDamageMultiplier += effect.value;
		} else if (effect.type === 'grassDamageBoost') {
			if (!this.grassDamageMultiplier) this.grassDamageMultiplier = 1.0;
			this.grassDamageMultiplier += effect.value;
		} else if (effect.type === 'electricDamageBoost') {
			if (!this.electricDamageMultiplier) this.electricDamageMultiplier = 1.0;
			this.electricDamageMultiplier += effect.value;
		} else if (effect.type === 'damageBoost') {
			const oldDamage = this.damage;
			this.damage *= (1 + effect.value);
			console.log('[STATS] Applying equipped item:', {
				itemId,
				itemName: itemConfig.name,
				effectType: effect.type,
				effectValue: effect.value,
				oldDamage,
				newDamage: this.damage,
				formula: `oldDamage (${oldDamage}) * (1 + ${effect.value}) = ${this.damage}`
			});
		} else if (effect.type === 'speedBoost') {
			const oldSpeed = this.speed;
			this.speed *= (1 + effect.value);
			console.log('[STATS] Applying equipped item:', {
				itemId,
				itemName: itemConfig.name,
				effectType: effect.type,
				effectValue: effect.value,
				oldSpeed,
				newSpeed: this.speed,
				formula: `oldSpeed (${oldSpeed}) * (1 + ${effect.value}) = ${this.speed}`
			});
		} else if (effect.type === 'hpBoost') {
			const oldMaxHp = this.maxHp;
			const hpRatio = this.hp / this.maxHp;
			this.maxHp *= (1 + effect.value);
			this.hp = this.maxHp * hpRatio;
			this.displayedHp = this.hp;
			console.log('[STATS] Applying equipped item:', {
				itemId,
				itemName: itemConfig.name,
				effectType: effect.type,
				effectValue: effect.value,
				oldMaxHp,
				newMaxHp: this.maxHp,
				formula: `oldMaxHp (${oldMaxHp}) * (1 + ${effect.value}) = ${this.maxHp}`
			});
		} else if (effect.type === 'critChanceBoost') {
			const oldCritChance = this.critChance;
			this.critChance += effect.value;
			console.log('[STATS] Applying equipped item:', {
				itemId,
				itemName: itemConfig.name,
				effectType: effect.type,
				effectValue: effect.value,
				oldCritChance,
				newCritChance: this.critChance,
				formula: `oldCritChance (${oldCritChance}) + ${effect.value} = ${this.critChance}`
			});
		} else if (effect.type === 'attackSpeedBoost') {
			const oldAttackSpeed = this.attackSpeed;
			this.attackSpeed *= (1 + effect.value);
			this.attackCooldownMax = 1000 / this.attackSpeed;
			console.log('[STATS] Applying equipped item:', {
				itemId,
				itemName: itemConfig.name,
				effectType: effect.type,
				effectValue: effect.value,
				oldAttackSpeed,
				newAttackSpeed: this.attackSpeed,
				formula: `oldAttackSpeed (${oldAttackSpeed}) * (1 + ${effect.value}) = ${this.attackSpeed}`
			});
		} else if (effect.type === 'rangeBoost') {
			const oldRange = this.range;
			this.range *= (1 + effect.value);
			console.log('[STATS] Applying equipped item:', {
				itemId,
				itemName: itemConfig.name,
				effectType: effect.type,
				effectValue: effect.value,
				oldRange,
				newRange: this.range,
				formula: `oldRange (${oldRange}) * (1 + ${effect.value}) = ${this.range}`
			});
		}
	}

	removeEquippedItem(itemId, itemConfig) {
		if (!itemConfig || !itemConfig.effect) return;
		
		const effect = itemConfig.effect;
		
		if (effect.type === 'waterDamageBoost') {
			if (this.waterDamageMultiplier) this.waterDamageMultiplier -= effect.value;
		} else if (effect.type === 'fireDamageBoost') {
			if (this.fireDamageMultiplier) this.fireDamageMultiplier -= effect.value;
		} else if (effect.type === 'grassDamageBoost') {
			if (this.grassDamageMultiplier) this.grassDamageMultiplier -= effect.value;
		} else if (effect.type === 'electricDamageBoost') {
			if (this.electricDamageMultiplier) this.electricDamageMultiplier -= effect.value;
		} else if (effect.type === 'damageBoost') {
			this.damage /= (1 + effect.value);
		} else if (effect.type === 'speedBoost') {
			this.speed /= (1 + effect.value);
		} else if (effect.type === 'hpBoost') {
			const hpRatio = this.hp / this.maxHp;
			this.maxHp /= (1 + effect.value);
			this.hp = this.maxHp * hpRatio;
			this.displayedHp = this.hp;
		} else if (effect.type === 'critChanceBoost') {
			this.critChance -= effect.value;
		} else if (effect.type === 'attackSpeedBoost') {
			this.attackSpeed /= (1 + effect.value);
			this.attackCooldownMax = 1000 / this.attackSpeed;
		} else if (effect.type === 'rangeBoost') {
			this.range /= (1 + effect.value);
		}
	}

	update(deltaTime, input, mapWidth, mapHeight, camera = null, collisionSystem = null, enemies = []) {
		if (!this.isAlive && !this.isDying) return;
		
		if (this.isDying) {
			this.faintAnimationTime -= deltaTime;
			if (this.faintAnimationTime <= 0) {
				this.faintAnimationTime = 0;
				this.isDying = false;
			}
			
			if (this.animationSystem) {
				this.animationSystem.update(deltaTime, false, 0, 0);
			}
			
			return;
		}

		let moveX = 0;
		let moveY = 0;

		if (input.isKeyDown('ArrowUp') || input.isKeyDown('KeyW')) moveY -= 1;
		if (input.isKeyDown('ArrowDown') || input.isKeyDown('KeyS')) moveY += 1;
		if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) moveX -= 1;
		if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) moveX += 1;

		const isMoving = moveX !== 0 || moveY !== 0;
		
		const enemyRepulsion = this.calculateEnemyRepulsion(enemies);
		const repulsionX = enemyRepulsion.x * deltaTime / 16;
		const repulsionY = enemyRepulsion.y * deltaTime / 16;

		if (isMoving) {
			const length = Math.sqrt(moveX * moveX + moveY * moveY);
			this.directionX = moveX / length;
			this.directionY = moveY / length;
			
			this.velocityX = this.directionX * this.speed / 16;
			this.velocityY = this.directionY * this.speed / 16;
			
			const deltaX = this.velocityX * deltaTime + repulsionX;
			const deltaY = this.velocityY * deltaTime + repulsionY;

			const newX = this.x + deltaX;
			const newY = this.y + deltaY;

			if (collisionSystem) {
				const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
				const hitboxOffsetY = (this.spriteHeight - this.height) / 2;
				
				if (collisionSystem.canMoveTo(newX + hitboxOffsetX, this.y + hitboxOffsetY, this.width, this.height)) {
					this.x = newX;
				}

				if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newY + hitboxOffsetY, this.width, this.height)) {
					this.y = newY;
				}
			} else {
				this.x = newX;
				this.y = newY;
			}
		} else {
			const deltaX = repulsionX;
			const deltaY = repulsionY;
			
			const newX = this.x + deltaX;
			const newY = this.y + deltaY;
			
			if (collisionSystem) {
				const hitboxOffsetX = (this.spriteWidth - this.width) / 2;
				const hitboxOffsetY = (this.spriteHeight - this.height) / 2;
				
				if (collisionSystem.canMoveTo(newX + hitboxOffsetX, this.y + hitboxOffsetY, this.width, this.height)) {
					this.x = newX;
				}

				if (collisionSystem.canMoveTo(this.x + hitboxOffsetX, newY + hitboxOffsetY, this.width, this.height)) {
					this.y = newY;
				}
			} else {
				this.x = newX;
				this.y = newY;
			}
			
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

		if ((this.attackType === 'range' || this.attackType === 'circular_sweep') && camera) {
			if (!this.autoattack || this.attackType === 'circular_sweep') {
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

		// Update spell press animations
		for (let index in this.spellPressAnimations) {
			this.spellPressAnimations[index] -= deltaTime;
			if (this.spellPressAnimations[index] <= 0) {
				delete this.spellPressAnimations[index];
			}
		}

		// Update consumable press animation
		if (this.consumablePressAnimation > 0) {
			this.consumablePressAnimation -= deltaTime;
			if (this.consumablePressAnimation < 0) {
				this.consumablePressAnimation = 0;
			}
		}

		// Update egg press animation
		if (this.eggPressAnimation > 0) {
			this.eggPressAnimation -= deltaTime;
			if (this.eggPressAnimation < 0) {
				this.eggPressAnimation = 0;
			}
		}

		// Update stat animations
		for (let statKey in this.statAnimations) {
			this.statAnimations[statKey].timer -= deltaTime;
			if (this.statAnimations[statKey].timer <= 0) {
				delete this.statAnimations[statKey];
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
			const baseMultiplier = 1.5;
			const levelExponent = 1 + (this.level - 1) * 0.05;
			this.xpToNextLevel = Math.floor(this.xpToNextLevel * baseMultiplier * levelExponent);
			return true;
		}
		return false;
	}

	increaseStatsOnLevelUp() {
		const LEVEL_UP_STAT_INCREASE = 0.05;
		
		console.log('[STATS] Level up - recalculating stats from base:', {
			level: this.level,
			levelUpStatIncrease: LEVEL_UP_STAT_INCREASE
		});
		
		if (this.baseSpeed !== undefined) {
			const oldSpeed = this.speed;
			const baseSpeedWithLevel = this.baseSpeed * (1 + (this.level - 1) * LEVEL_UP_STAT_INCREASE);
			this.speed = calculateStatWithIV(baseSpeedWithLevel, this.ivs?.speed, 'speed');
			console.log('[STATS] Speed recalculation:', {
				baseSpeed: this.baseSpeed,
				baseSpeedWithLevel,
				iv: this.ivs?.speed,
				oldSpeed,
				newSpeed: this.speed,
				formula: `baseSpeed (${this.baseSpeed}) * (1 + (${this.level - 1}) * ${LEVEL_UP_STAT_INCREASE}) = ${baseSpeedWithLevel}, then * (1 + iv * 0.01) = ${this.speed}`
			});
		}
		
		if (this.baseHp !== undefined) {
			const oldMaxHp = this.maxHp;
			
			// Calculer le total des bonus HP des upgrades
			let hpUpgradeBonus = 0;
			if (this.upgrades) {
				for (const upgradeId in this.upgrades) {
					const upgrade = Upgrades[upgradeId];
					if (upgrade && upgrade.type === UpgradeType.MAX_HP) {
						hpUpgradeBonus += upgrade.value * (this.upgrades[upgradeId] || 0);
					}
				}
			}
			
			const baseHpWithLevel = this.baseHp * (1 + (this.level - 1) * LEVEL_UP_STAT_INCREASE);
			this.maxHp = calculateStatWithIV(baseHpWithLevel, this.ivs?.hp, 'hp');
			
			// Réappliquer les bonus HP des upgrades
			this.maxHp += hpUpgradeBonus;
			
			this.hp = Math.min(this.maxHp, this.hp + (this.maxHp - oldMaxHp));
			console.log('[STATS] HP recalculation:', {
				baseHp: this.baseHp,
				baseHpWithLevel,
				hpUpgradeBonus,
				iv: this.ivs?.hp,
				oldMaxHp,
				newMaxHp: this.maxHp,
				formula: `baseHp (${this.baseHp}) * (1 + (${this.level - 1}) * ${LEVEL_UP_STAT_INCREASE}) = ${baseHpWithLevel}, then * (1 + iv * 0.01) + ${hpUpgradeBonus} (upgrades) = ${this.maxHp}`
			});
		}
		
		if (this.baseDamage !== undefined) {
			const oldDamage = this.damage;
			const baseDamageWithLevel = this.baseDamage * (1 + (this.level - 1) * LEVEL_UP_STAT_INCREASE);
			this.damage = calculateStatWithIV(baseDamageWithLevel, this.ivs?.damage, 'damage');
			console.log('[STATS] Damage recalculation (WARNING: This overwrites item multipliers!):', {
				baseDamage: this.baseDamage,
				baseDamageWithLevel,
				iv: this.ivs?.damage,
				oldDamage,
				newDamage: this.damage,
				formula: `baseDamage (${this.baseDamage}) * (1 + (${this.level - 1}) * ${LEVEL_UP_STAT_INCREASE}) = ${baseDamageWithLevel}, then * (1 + iv * 0.01) = ${this.damage}`
			});
		}
		
		if (this.baseAttackSpeed !== undefined) {
			const oldAttackSpeed = this.attackSpeed;
			const baseAttackSpeedWithLevel = this.baseAttackSpeed * (1 + (this.level - 1) * LEVEL_UP_STAT_INCREASE);
			this.attackSpeed = calculateStatWithIV(baseAttackSpeedWithLevel, this.ivs?.attackSpeed, 'attackSpeed');
			this.attackCooldownMax = 1000 / this.attackSpeed;
			console.log('[STATS] AttackSpeed recalculation:', {
				baseAttackSpeed: this.baseAttackSpeed,
				baseAttackSpeedWithLevel,
				iv: this.ivs?.attackSpeed,
				oldAttackSpeed,
				newAttackSpeed: this.attackSpeed,
				formula: `baseAttackSpeed (${this.baseAttackSpeed}) * (1 + (${this.level - 1}) * ${LEVEL_UP_STAT_INCREASE}) = ${baseAttackSpeedWithLevel}, then * (1 + iv * 0.01) = ${this.attackSpeed}`
			});
		}
		
		if (this.baseRange !== undefined) {
			const oldRange = this.range;
			const baseRangeWithLevel = this.baseRange * (1 + (this.level - 1) * LEVEL_UP_STAT_INCREASE);
			this.range = calculateStatWithIV(baseRangeWithLevel, this.ivs?.range, 'range');
			console.log('[STATS] Range recalculation:', {
				baseRange: this.baseRange,
				baseRangeWithLevel,
				iv: this.ivs?.range,
				oldRange,
				newRange: this.range,
				formula: `baseRange (${this.baseRange}) * (1 + (${this.level - 1}) * ${LEVEL_UP_STAT_INCREASE}) = ${baseRangeWithLevel}, then * (1 + iv * 0.01) = ${this.range}`
			});
		}
		
		if (this.baseKnockback !== undefined) {
			const oldKnockback = this.knockback;
			const baseKnockbackWithLevel = this.baseKnockback * (1 + (this.level - 1) * LEVEL_UP_STAT_INCREASE);
			this.knockback = calculateStatWithIV(baseKnockbackWithLevel, this.ivs?.knockback, 'knockback');
			console.log('[STATS] Knockback recalculation:', {
				baseKnockback: this.baseKnockback,
				baseKnockbackWithLevel,
				iv: this.ivs?.knockback,
				oldKnockback,
				newKnockback: this.knockback,
				formula: `baseKnockback (${this.baseKnockback}) * (1 + (${this.level - 1}) * ${LEVEL_UP_STAT_INCREASE}) = ${baseKnockbackWithLevel}, then * (1 + iv * 0.01) = ${this.knockback}`
			});
		}
	}

	addMoney(amount) {
		this.money += amount;
	}

	addGems(amount) {
		this.gems += amount;
	}

	triggerStatAnimation(statKey) {
		this.statAnimations[statKey] = {
			timer: 500
		};
	}

	hasUpgradeType(upgradeType) {
		for (const upgradeId in this.upgrades) {
			const upgrade = Upgrades[upgradeId];
			if (upgrade) {
				if (upgrade.grants && upgrade.grants.includes(upgradeType)) {
					return true;
				}
				if (upgrade.type === upgradeType) {
					return true;
				}
			}
		}
		return false;
	}

	applyUpgrade(upgrade) {
		if (!this.upgrades[upgrade.id]) {
			this.upgrades[upgrade.id] = 0;
		}
		this.upgrades[upgrade.id]++;

		if (upgrade.grants && upgrade.grants.length > 0) {
			for (const grantedType of upgrade.grants) {
				if (grantedType === UpgradeType.PROJECTILE_AOE) {
					this.hasAoE = true;
					this.hasPiercing = false;
					this.hasBounce = false;
				} else if (grantedType === UpgradeType.PROJECTILE_PIERCING) {
					this.hasPiercing = true;
					this.hasAoE = false;
					this.hasBounce = false;
				} else if (grantedType === UpgradeType.PROJECTILE_BOUNCE) {
					this.hasBounce = true;
					this.hasAoE = false;
					this.hasPiercing = false;
				} else if (grantedType === UpgradeType.PROJECTILE_EFFECT) {
					this.hasEffect = true;
				}
			}
		}

		switch(upgrade.type) {
			case 'damage':
				const oldDamage = this.damage;
				this.damage *= upgrade.value;
				this.triggerStatAnimation('damage', oldDamage, this.damage);
				break;
			case 'attackSpeed':
				const oldAttackSpeed = this.attackSpeed;
				this.attackSpeed *= upgrade.value;
				this.attackCooldownMax = 1000 / this.attackSpeed;
				this.triggerStatAnimation('attackSpeed', oldAttackSpeed, this.attackSpeed);
				break;
			case 'range':
				const oldRange = this.range;
				this.range *= upgrade.value;
				this.triggerStatAnimation('range', oldRange, this.range);
				break;
			case 'speed':
				const oldSpeed = this.speed;
				this.speed *= upgrade.value;
				this.triggerStatAnimation('speed', oldSpeed, this.speed);
				break;
			case 'maxHp':
				const oldMaxHp = this.maxHp;
				this.maxHp += upgrade.value;
				const hpRatio = this.hp / oldMaxHp;
				this.hp = this.maxHp * hpRatio;
				this.displayedHp = this.hp;
				this.triggerStatAnimation('maxHp', oldMaxHp, this.maxHp);
				break;
			case 'hpRegen':
				const oldHpRegen = this.hpRegen;
				this.hpRegen += upgrade.value;
				this.triggerStatAnimation('hpRegen', oldHpRegen, this.hpRegen);
				break;
			case 'knockback':
				const oldKnockback = this.knockback;
				this.knockback *= upgrade.value;
				this.triggerStatAnimation('knockback', oldKnockback, this.knockback);
				break;
			case 'projectileSpeed':
				this.projectileSpeedMultiplier *= upgrade.value;
				break;
			case 'aoeRadius':
				this.aoeRadiusMultiplier *= upgrade.value;
				break;
			case 'aoeDamage':
				this.aoeDamageMultiplier *= upgrade.value;
				break;
			case 'piercingDamageReduction':
				this.piercingDamageReduction = Math.max(0, this.piercingDamageReduction - upgrade.value);
				break;
			case 'piercingMaxCount':
				this.piercingMaxCount += upgrade.value;
				break;
			case 'bounceMaxCount':
				this.bounceMaxCount += upgrade.value;
				break;
			case 'bounceDetectionRange':
				this.bounceDetectionRange += upgrade.value;
				break;
			case 'effectProcChance':
				this.effectProcChance = Math.min(1.0, this.effectProcChance + upgrade.value);
				break;
			case 'effectDamage':
				this.effectDamageMultiplier *= upgrade.value;
				break;
			case 'effectIntensity':
				this.effectIntensityMultiplier *= upgrade.value;
				break;
			case 'effectDuration':
				this.effectDurationMultiplier *= upgrade.value;
				break;
			case 'fetchRange':
				this.fetchRange *= upgrade.value;
				break;
			case 'critChance':
				const oldCritChance = this.critChance;
				this.critChance += upgrade.value;
				this.triggerStatAnimation('critChance', oldCritChance, this.critChance);
				break;
			case 'critDamage':
				const oldCritDamage = this.critDamage;
				this.critDamage += upgrade.value;
				this.triggerStatAnimation('critDamage', oldCritDamage, this.critDamage);
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
			default:
				break;
		}
	}

	calculateDamage() {
		const isCrit = Math.random() < this.critChance;
		let finalDamage = isCrit ? this.damage * this.critDamage : this.damage;
		
		if (this.type === 'water' && this.waterDamageMultiplier) {
			finalDamage *= this.waterDamageMultiplier;
		} else if (this.type === 'fire' && this.fireDamageMultiplier) {
			finalDamage *= this.fireDamageMultiplier;
		} else if (this.type === 'grass' && this.grassDamageMultiplier) {
			finalDamage *= this.grassDamageMultiplier;
		} else if (this.type === 'electric' && this.electricDamageMultiplier) {
			finalDamage *= this.electricDamageMultiplier;
		}
		
		return { damage: finalDamage, isCrit: isCrit };
	}

	toggleAutoattack() {
		if (this.attackType === 'range') {
			this.autoattack = !this.autoattack;
		}
	}

	unlockSpell(spellId) {
		const spellConfig = getSpellConfig(spellId);
		if (!spellConfig) return;
		
		let spell = this.spells.find(s => s.id === spellId);
		if (!spell) {
			if (!this.spellLevels[spellId]) {
				this.spellLevels[spellId] = { damage: 0, range: 0, cooldown: 0 };
			}
			if (!this.spellDamageMultipliers[spellId]) {
				this.spellDamageMultipliers[spellId] = 1;
			}
			if (!this.spellRangeMultipliers[spellId]) {
				this.spellRangeMultipliers[spellId] = 1;
			}
			if (!this.spellCooldownMultipliers[spellId]) {
				this.spellCooldownMultipliers[spellId] = 1;
			}
			
			spell = {
				id: spellConfig.id,
				name: spellConfig.name,
				cooldownMax: spellConfig.cooldownMax * this.spellCooldownMultipliers[spellId],
				cooldown: 0,
				damageMultiplier: spellConfig.damageMultiplier * this.spellDamageMultipliers[spellId],
				radius: spellConfig.baseRadius * this.spellRangeMultipliers[spellId],
				animation: spellConfig.animation,
				animationDuration: spellConfig.animationDuration,
				particleColor: spellConfig.particleColor,
				knockback: spellConfig.knockback,
				unlocked: true
			};
			this.spells.push(spell);
		} else if (!spell.unlocked) {
			spell.unlocked = true;
			this.updateSpellStats(spellId);
		}
	}

	updateSpellStats(spellId) {
		const spell = this.spells.find(s => s.id === spellId);
		if (!spell) return;
		
		const spellConfig = getSpellConfig(spellId);
		if (!spellConfig) return;
		
		spell.damageMultiplier = spellConfig.damageMultiplier * (this.spellDamageMultipliers[spellId] || 1);
		spell.radius = spellConfig.baseRadius * (this.spellRangeMultipliers[spellId] || 1);
		const newCooldownMax = spellConfig.cooldownMax * (this.spellCooldownMultipliers[spellId] || 1);
		const cooldownRatio = spell.cooldown / spell.cooldownMax;
		spell.cooldownMax = newCooldownMax;
		spell.cooldown = spell.cooldown * cooldownRatio;
	}

	getSpellLevel(spellId) {
		if (!this.spellLevels[spellId]) {
			return { damage: 0, range: 0, cooldown: 0 };
		}
		return this.spellLevels[spellId];
	}

	getUnlockedSpells() {
		return this.spells.filter(s => s.unlocked);
	}

	getProjectileLevel() {
		if (this.attackType !== 'range') return 0;
		
		let level = 0;
		
		if (this.hasUpgradeType(UpgradeType.PROJECTILE_AOE)) {
			level = 1;
			const baseMultiplier = 1.0;
			const currentMultiplier = this.aoeRadiusMultiplier;
			const enhancementLevel = Math.max(0, Math.floor((currentMultiplier - baseMultiplier) / 0.15));
			level += enhancementLevel;
		} else if (this.hasUpgradeType(UpgradeType.PROJECTILE_PIERCING)) {
			level = 1 + Math.max(0, this.piercingMaxCount);
		} else if (this.hasUpgradeType(UpgradeType.PROJECTILE_BOUNCE)) {
			level = Math.max(0, this.bounceMaxCount);
		}
		
		return level;
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
		
		this.spellPressAnimations[spellIndex] = 200;
		
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
				autoattack: this.autoattack,
				aimX: this.aimX,
				aimY: this.aimY,
				playerVelocityX: this.velocityX,
				playerVelocityY: this.velocityY,
				projectileColor: this.projectileColor,
				projectileSpeed: this.projectileSpeedMultiplier,
				aoeRadius: this.hasUpgradeType(UpgradeType.PROJECTILE_AOE) ? 80 * this.aoeRadiusMultiplier : 0,
				hasPiercing: this.hasUpgradeType(UpgradeType.PROJECTILE_PIERCING),
				hasBounce: this.hasUpgradeType(UpgradeType.PROJECTILE_BOUNCE),
				hasEffect: this.hasUpgradeType(UpgradeType.PROJECTILE_EFFECT),
				bounceCount: this.bounceMaxCount,
				piercingCount: this.piercingMaxCount,
				bounceRange: this.bounceDetectionRange,
				piercingDamageReduction: this.piercingDamageReduction,
				effectProcChance: this.effectProcChance,
				effectDamageMultiplier: this.effectDamageMultiplier,
				effectIntensityMultiplier: this.effectIntensityMultiplier,
				effectDurationMultiplier: this.effectDurationMultiplier,
				playerPokemonType: this.pokemonConfig?.type || 'normal',
				projectileType: this.type
			};
		} else if (this.attackType === 'circular_sweep' && this.baseAttackSpell) {
			const spellConfig = getSpellConfig(this.baseAttackSpell);
			if (!spellConfig) return null;
			
			let directionX, directionY;
			
			if (this.directionX !== 0 || this.directionY !== 0) {
				directionX = this.directionX;
				directionY = this.directionY;
			} else if (this.aimX !== 0 || this.aimY !== 0) {
				const dx = this.aimX - this.getCenterX();
				const dy = this.aimY - this.getCenterY();
				const distance = Math.sqrt(dx * dx + dy * dy);
				if (distance > 0.001) {
					directionX = dx / distance;
					directionY = dy / distance;
				} else {
					directionX = 1;
					directionY = 0;
				}
			} else {
				directionX = 1;
				directionY = 0;
			}
			
			return {
				type: 'circular_sweep',
				playerX: this.getCenterX(),
				playerY: this.getCenterY(),
				directionX: directionX,
				directionY: directionY,
				damage: damageCalc.damage,
				isCrit: damageCalc.isCrit,
				knockback: this.knockback,
				spellConfig: spellConfig
			};
		}
		
		return null;
	}

	takeDamage(amount) {
		if (!this.isAlive || this.invulnerableTime > 0) return false;

		if (this.dodgeChance && this.dodgeChance > 0) {
			if (Math.random() < this.dodgeChance) {
				return false;
			}
		}

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
			
			this.isDying = true;
			this.faintAnimationTime = this.faintAnimationDuration;
			
			if (this.animationSystem) {
				const hasFaintAnimation = this.pokemonConfig && this.pokemonConfig.animations && this.pokemonConfig.animations.faint;
				if (hasFaintAnimation) {
					this.animationSystem.setAnimation('faint');
				} else {
					// Utiliser l'animation hurt par défaut si faint n'existe pas
					this.animationSystem.setAnimation('hurt');
				}
			}
			
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

	calculateEnemyRepulsion(enemies) {
		let repulsionX = 0;
		let repulsionY = 0;
		const thisCenterX = this.getCenterX();
		const thisCenterY = this.getCenterY();
		let neighborCount = 0;

		for (const enemy of enemies) {
			if (!enemy.isAlive) continue;

			const enemyCenterX = enemy.getCenterX();
			const enemyCenterY = enemy.getCenterY();
			const dx = thisCenterX - enemyCenterX;
			const dy = thisCenterY - enemyCenterY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance > 0 && distance < this.enemyRepulsionRadius) {
				const normalizedDx = dx / distance;
				const normalizedDy = dy / distance;
				const force = (this.enemyRepulsionRadius - distance) / this.enemyRepulsionRadius;
				
				repulsionX += normalizedDx * force;
				repulsionY += normalizedDy * force;
				neighborCount++;
			}
		}

		if (neighborCount > 0) {
			repulsionX /= neighborCount;
			repulsionY /= neighborCount;
		}

		const repulsionMagnitude = Math.sqrt(repulsionX * repulsionX + repulsionY * repulsionY);
		if (repulsionMagnitude > 0) {
			const normalizedRepulsionX = repulsionX / repulsionMagnitude;
			const normalizedRepulsionY = repulsionY / repulsionMagnitude;
			return {
				x: normalizedRepulsionX * this.enemyRepulsionStrength * this.speed,
				y: normalizedRepulsionY * this.enemyRepulsionStrength * this.speed
			};
		}

		return { x: 0, y: 0 };
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

		// Ne pas afficher l'arc de visée dans la map finale
		if (this.isAlive && this.range > 0 && this.attackType === 'range' && this.aimX !== 0 && this.aimY !== 0 && !this.isFinalMap) {
			const centerX = this.getCenterX();
			const centerY = this.getCenterY();
			const dx = this.aimX - centerX;
			const dy = this.aimY - centerY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			if (distance > 0) {
				const angle = Math.atan2(dy, dx);
				const arcAngle = Math.PI / 3;
				const arcStart = angle - arcAngle / 2;
				const arcEnd = angle + arcAngle / 2;
				
			renderer.ctx.save();
			renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.setLineDash([5, 5]);
			renderer.ctx.beginPath();
			renderer.ctx.arc(
					centerX,
					centerY,
				this.range,
					arcStart,
					arcEnd
			);
			renderer.ctx.stroke();
			renderer.ctx.setLineDash([]);
			renderer.ctx.restore();
			}
		}

		// Ne pas afficher la barre de visée dans la map finale
		if (this.isAlive && this.attackType === 'range' && this.aimX !== 0 && this.aimY !== 0 && !this.isFinalMap) {
			const dx = this.aimX - this.getCenterX();
			const dy = this.aimY - this.getCenterY();
			const distance = Math.sqrt(dx * dx + dy * dy);
			const sightLength = 40;
			const ratio = sightLength / Math.max(distance, sightLength);
			const sightX = this.getCenterX() + dx * ratio;
			const sightY = this.getCenterY() + dy * ratio;
			
			renderer.ctx.save();
			renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.beginPath();
			renderer.ctx.moveTo(this.getCenterX(), this.getCenterY());
			renderer.ctx.lineTo(sightX, sightY);
			renderer.ctx.stroke();
			renderer.ctx.restore();
		}

		if (this.attackAnimationTime > 0 && this.attackType === 'melee') {
			const progress = 1 - (this.attackAnimationTime / this.attackAnimationDuration);
			const currentRadius = this.range * progress;
			const opacity = 1 - progress;
			
			let primaryColor = 'rgba(255, 200, 0, 0.8)';
			let secondaryColor = 'rgba(255, 150, 0, 0.5)';
			
			if (this.meleeAttackColor) {
				const r = parseInt(this.meleeAttackColor.slice(1, 3), 16);
				const g = parseInt(this.meleeAttackColor.slice(3, 5), 16);
				const b = parseInt(this.meleeAttackColor.slice(5, 7), 16);
				primaryColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`;
				secondaryColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
			} else {
				primaryColor = `rgba(255, 200, 0, ${opacity * 0.8})`;
				secondaryColor = `rgba(255, 150, 0, ${opacity * 0.5})`;
			}
			
			renderer.ctx.save();
			renderer.ctx.strokeStyle = primaryColor;
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
			
			renderer.ctx.strokeStyle = secondaryColor;
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
				// Utiliser drawShadow si défini, sinon true par défaut
				const drawShadow = this.drawShadow !== undefined ? this.drawShadow : true;
				this.animationSystem.render(renderer, this.x, this.y, this.scale, drawShadow, true);
			} else {
				renderer.drawRect(this.x, this.y, this.width, this.height, '#4a90e2');
			}
		}
	}

}

