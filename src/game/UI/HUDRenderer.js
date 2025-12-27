import { getEnemyConfig } from '../Config/EnemyConfig.js';
import { ItemConfig } from '../Config/ItemConfig.js';
import { RarityColors, UpgradeRarity, UpgradeType, Upgrades, UpgradeIcons } from '../Config/UpgradeConfig.js';

export default class HUDRenderer {
	constructor() {
		this.lineHeight = 25;
	}

	render(renderer, player, canvasWidth, canvasHeight, survivalTime, bossTimer = null, maxBossTimer = null, selectedPokemon = null, engine = null, currentBoss = null, mapData = null, bossDefeated = false, battleScene = null) {
		if (!player) return;

		if (currentBoss && currentBoss.isAlive) {
			this.renderBossBar(renderer, currentBoss, canvasWidth);
		} else if (bossTimer !== null && maxBossTimer !== null) {
			if (bossDefeated) {
				this.renderEndlessTimer(renderer, survivalTime, canvasWidth);
			} else {
				const bossType = mapData ? mapData.bossType : null;
				this.renderBossProgressBar(renderer, bossTimer, maxBossTimer, canvasWidth, engine, bossType);
			}
		}

		this.renderTopLeftInfo(renderer, survivalTime, battleScene);
		this.renderEquippedItems(renderer, engine, canvasWidth, canvasHeight);
		this.renderSessionItems(renderer, battleScene, engine, canvasWidth, canvasHeight);
		this.renderHUDBackground(renderer, player, canvasWidth, canvasHeight, selectedPokemon, engine);
		this.renderHPXP(renderer, player, canvasWidth, canvasHeight, selectedPokemon, engine, bossTimer, maxBossTimer, currentBoss);
		this.renderSimpleHUD(renderer, player, canvasWidth, mapData, selectedPokemon, engine, bossTimer, maxBossTimer, currentBoss, battleScene);
		this.renderSpells(renderer, player, canvasWidth, canvasHeight, selectedPokemon, engine);
	}

	renderStatLine(renderer, x, y, label, value, fontSize, strokeOffset, strokeColor, labelColor, labelWidth, spacing = 2, animation = null, valueX = null, valueColor = '#ffffff') {
		const isAnimated = animation && animation.timer > 0;
		const animationProgress = isAnimated ? Math.max(0, Math.min(1, animation.timer / 500)) : 0;
		const growthProgress = isAnimated ? Math.sin(animationProgress * Math.PI) : 0;
		const scale = 1 + growthProgress * 0.15;
		const glowIntensity = isAnimated ? (1 - animationProgress) * 0.8 : 0;
		
		const finalValueX = valueX !== null ? valueX : (x + labelWidth + spacing);
		const valueCenterY = y + fontSize / 2;
		
		renderer.ctx.save();
		
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';
		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 2.5;
		renderer.ctx.strokeText(label, x, y);
		renderer.ctx.fillText(label, x, y);
		
		renderer.ctx.restore();
		
		renderer.ctx.save();
		
		if (isAnimated) {
			renderer.ctx.translate(finalValueX, valueCenterY);
			renderer.ctx.scale(scale, scale);
			renderer.ctx.translate(-finalValueX, -valueCenterY);
		}
		
		if (glowIntensity > 0) {
			renderer.ctx.shadowColor = 'rgba(255, 255, 0, ' + glowIntensity + ')';
			renderer.ctx.shadowBlur = 10 * glowIntensity;
		}

		renderer.ctx.font = `${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = valueColor;
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 2.5;
		
		if (valueX !== null) {
			renderer.ctx.textAlign = 'right';
			renderer.ctx.strokeText(value, finalValueX, y);
			renderer.ctx.fillText(value, finalValueX, y);
		} else {
			renderer.ctx.textAlign = 'left';
			renderer.ctx.strokeText(value, finalValueX, y);
			renderer.ctx.fillText(value, finalValueX, y);
		}
		
		renderer.ctx.shadowBlur = 0;
		renderer.ctx.restore();
	}

	getEquippedItemsHeight(engine) {
		if (!engine || !engine.equippedItems || engine.equippedItems.length === 0) return 0;
		
		const lineHeight = 22;
		const itemSize = 40;
		const itemSpacing = 8;
		const spacing = 8;
		
		const titleHeight = lineHeight;
		const itemsHeight = engine.equippedItems.length * (itemSize + itemSpacing);
		
		return spacing + titleHeight + itemsHeight;
	}

	renderSimpleHUD(renderer, player, canvasWidth, mapData, selectedPokemon = null, engine = null, bossTimer = null, maxBossTimer = null, currentBoss = null, battleScene = null) {
		const minimapSize = 180;
		const minimapX = canvasWidth - minimapSize - 10;
		const minimapY = 10;
		
		const padding = 10;
		const equippedItemsHeight = this.getEquippedItemsHeight(engine);
		const statsStartY = 70 + equippedItemsHeight;
		const fontSize = 16;
		const statsFontSize = 16;
		const lineHeight = fontSize + 4;
		const statsLineHeight = statsFontSize + 4;
		const strokeOffset = 2.5;
		const strokeColor = '#000000';
		const labelColor = '#E58E72';
		const barGreen = '#30B72C';
		const barRed = '#F74B33';
		const barXpBlue = '#87CEEB';
		const barXpEmpty = '#4a5568';

		renderer.ctx.save();
		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = labelColor;
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 2.5;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';

		const getStatValue = (statKey) => {
			switch(statKey) {
				case 'damage': return Math.floor(player.damage).toString();
				case 'speed': return player.speed.toFixed(1);
				case 'attackSpeed': return player.attackSpeed.toFixed(1);
				case 'range': return Math.floor(player.range).toString();
				case 'critChance': return (player.critChance * 100).toFixed(1) + '%';
				case 'critDamage': return (player.critDamage * 100).toFixed(0) + '%';
				case 'hpRegen': return player.hpRegen.toFixed(1) + '/s';
				case 'knockback': return player.knockback.toFixed(1);
				case 'maxHp': return `${Math.floor(player.hp)}/${Math.floor(player.maxHp)}`;
				default: return '';
			}
		};

		const stats = [
			{ label: 'ATK', key: 'damage' },
			{ label: 'SPEED', key: 'speed' },
			{ label: 'ATKSP', key: 'attackSpeed' },
			{ label: 'RANGE', key: 'range' },
			{ label: 'CRIT', key: 'critChance' },
			{ label: 'CDMG', key: 'critDamage' },
			{ label: 'REGEN', key: 'hpRegen' },
			{ label: 'KNOCK', key: 'knockback' },
		];

		let maxLabelWidth = 0;
		stats.forEach((stat) => {
			renderer.ctx.font = `bold ${fontSize}px Pokemon`;
			const width = renderer.ctx.measureText(stat.label).width;
			if (width > maxLabelWidth) {
				maxLabelWidth = width;
			}
		});
		const labelWidth = maxLabelWidth;

		renderer.ctx.font = `${statsFontSize}px Pokemon`;
		let maxValueWidth = 0;
		stats.forEach((stat) => {
			let value;
			if (stat.key === 'xp') {
				value = `${Math.floor(player.displayedXp)}/${Math.floor(player.xpToNextLevel)}`;
			} else {
				value = getStatValue(stat.key);
			}
			const width = renderer.ctx.measureText(value).width;
			if (width > maxValueWidth) {
				maxValueWidth = width;
			}
		});

		const statsX = 12;
		const statsY = statsStartY;
		const valueX = statsX + labelWidth + 2 + maxValueWidth;
		
		const isStatUpgraded = (statKey) => {
			if (!player || !player.upgrades) return false;
			
			let upgradeType = null;
			switch(statKey) {
				case 'damage':
					upgradeType = UpgradeType.DAMAGE;
					break;
				case 'speed':
					upgradeType = UpgradeType.SPEED;
					break;
				case 'attackSpeed':
					upgradeType = UpgradeType.ATTACK_SPEED;
					break;
				case 'range':
					upgradeType = UpgradeType.RANGE;
					break;
				case 'critChance':
					upgradeType = UpgradeType.CRIT_CHANCE;
					break;
				case 'critDamage':
					upgradeType = UpgradeType.CRIT_DAMAGE;
					break;
				case 'hpRegen':
					upgradeType = UpgradeType.HP_REGEN;
					break;
				case 'knockback':
					upgradeType = UpgradeType.KNOCKBACK;
					break;
				default:
					return false;
			}
			
			if (!upgradeType) return false;
			
			for (const upgradeId in player.upgrades) {
				const upgrade = Upgrades[upgradeId];
				if (upgrade && upgrade.type === upgradeType) {
					return true;
				}
			}
			
			return false;
		};
		
		stats.forEach((stat, index) => {
			let value, animation = null;
			
			value = getStatValue(stat.key);
			animation = player.statAnimations && player.statAnimations[stat.key];
			
			const valueColor = isStatUpgraded(stat.key) ? '#ffff00' : '#ffffff';
			
			this.renderStatLine(renderer, statsX, statsY + index * statsLineHeight, stat.label, value, statsFontSize, strokeOffset, strokeColor, labelColor, labelWidth, 2, animation, valueX, valueColor);
		});

		if (battleScene) {
			const rewardsY = statsY + stats.length * statsLineHeight + 8;
			this.renderSessionRewards(renderer, battleScene, engine, statsX, rewardsY, statsFontSize, strokeOffset, strokeColor);
			
			const upgradesY = rewardsY + this.getSessionRewardsHeight(battleScene) + 10;
			this.renderUpgradesGrouped(renderer, player, statsX, upgradesY, statsFontSize, statsLineHeight);
		}

		renderer.ctx.restore();
	}

	renderTopLeftInfo(renderer, survivalTime, battleScene) {
		const padding = 12;
		const fontSize = 16;
		const lineHeight = 22;
		let y = padding;
		
		renderer.ctx.save();
		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2.5;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';
		
		const enemiesKilled = battleScene && battleScene.enemySpawner ? battleScene.enemySpawner.totalEnemiesKilled : 0;
		const defeatedText = `Pokémons: ${enemiesKilled}`;
		renderer.ctx.strokeText(defeatedText, padding, y);
		renderer.ctx.fillText(defeatedText, padding, y);
		
		y += lineHeight;
		
		const timeString = this.formatTime(survivalTime);
		const timerText = `Temps: ${timeString}`;
		renderer.ctx.strokeText(timerText, padding, y);
		renderer.ctx.fillText(timerText, padding, y);
		
		renderer.ctx.restore();
	}

	renderEquippedItems(renderer, engine, canvasWidth, canvasHeight) {
		if (!engine || !engine.equippedItems || engine.equippedItems.length === 0) return;

		const padding = 12;
		const fontSize = 16;
		const lineHeight = 22;
		const itemSize = 40;
		const itemSpacing = 8;
		const textSpacing = 8;
		const startX = padding;
		const startY = padding + lineHeight * 2 + 8;
		let currentY = startY;

		renderer.ctx.save();

		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2.5;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';
		renderer.ctx.strokeText('Équipés', startX, currentY);
		renderer.ctx.fillText('Équipés', startX, currentY);
		currentY += lineHeight;

		engine.equippedItems.forEach(uniqueId => {
			const parts = uniqueId.split('_');
			let baseItemId = null;
			if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
				baseItemId = parts.slice(0, -1).join('_');
			} else {
				baseItemId = uniqueId;
			}
			
			const itemConfig = ItemConfig[baseItemId];
			if (!itemConfig) return;

			const itemX = startX;
			const itemY = currentY;

			renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			renderer.ctx.fillRect(itemX, itemY, itemSize, itemSize);

			const rarityColor = this.getItemRarityColor(itemConfig);
			renderer.ctx.strokeStyle = rarityColor;
			renderer.ctx.lineWidth = 2;
			renderer.ctx.strokeRect(itemX + 1, itemY + 1, itemSize - 2, itemSize - 2);

			const itemSprite = engine.sprites.get(`item_${baseItemId}`);
			if (itemSprite) {
				const iconSize = itemSize - 8;
				const iconOffset = 4;
				renderer.ctx.drawImage(itemSprite, itemX + iconOffset, itemY + iconOffset, iconSize, iconSize);
			}

			const itemName = itemConfig.name || baseItemId;
			renderer.ctx.font = 'bold 16px Pokemon';
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2.5;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'middle';
			const nameX = itemX + itemSize + textSpacing;
			const nameY = itemY + itemSize / 2;
			renderer.ctx.strokeText(itemName, nameX, nameY);
			renderer.ctx.fillText(itemName, nameX, nameY);

			currentY += itemSize + itemSpacing;
		});

		renderer.ctx.restore();
	}

	renderSessionItems(renderer, battleScene, engine, canvasWidth, canvasHeight) {
		if (!battleScene || !engine) return;

		const sessionInventory = battleScene.sessionInventory || {};
		const itemEntries = Object.entries(sessionInventory).filter(([itemId, quantity]) => quantity > 0);
		const moneyGained = battleScene.player.money - (battleScene.initialMoney || 0);
		
		if (itemEntries.length === 0 && moneyGained <= 0) return;

		const minimapSize = 180;
		const minimapX = canvasWidth - minimapSize - 10;
		const minimapY = 10;
		const padding = 10;
		const itemSize = 40;
		const itemSpacing = 8;
		const textSpacing = 8;
		const titleHeight = 22;
		const startX = minimapX + minimapSize;
		const startY = minimapY + minimapSize + padding;
		let currentY = startY;

		renderer.ctx.save();

		renderer.ctx.font = 'bold 16px Pokemon';
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2.5;
		renderer.ctx.textAlign = 'right';
		renderer.ctx.textBaseline = 'top';
		renderer.ctx.strokeText('Récoltés', startX, currentY);
		renderer.ctx.fillText('Récoltés', startX, currentY);
		currentY += titleHeight;

		if (moneyGained > 0) {
			const coinSprite = engine.sprites.get('coins');
			const itemX = startX - itemSize;
			const itemY = currentY;
			const spacing = 8;

			renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			renderer.ctx.fillRect(itemX, itemY, itemSize, itemSize);

			renderer.ctx.strokeStyle = '#ffd700';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.strokeRect(itemX + 1, itemY + 1, itemSize - 2, itemSize - 2);

			if (coinSprite) {
				const iconSize = itemSize - 8;
				const iconOffset = 4;
				renderer.ctx.drawImage(coinSprite, itemX + iconOffset, itemY + iconOffset, iconSize, iconSize);
			}

			const moneyText = Math.floor(moneyGained).toString();
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.font = 'bold 16px Pokemon';
			renderer.ctx.textAlign = 'right';
			renderer.ctx.textBaseline = 'middle';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2.5;
			const textX = itemX - spacing;
			renderer.ctx.strokeText(moneyText, textX, itemY + itemSize / 2);
			renderer.ctx.fillText(moneyText, textX, itemY + itemSize / 2);

			const moneyLabel = 'Pokedollars';
			renderer.ctx.textAlign = 'right';
			renderer.ctx.textBaseline = 'middle';
			const labelX = textX - renderer.ctx.measureText(moneyText).width - textSpacing;
			renderer.ctx.strokeText(moneyLabel, labelX, itemY + itemSize / 2);
			renderer.ctx.fillText(moneyLabel, labelX, itemY + itemSize / 2);

			currentY += itemSize + itemSpacing;
		}

		itemEntries.forEach(([itemId, quantity]) => {
			const itemConfig = ItemConfig[itemId];
			if (!itemConfig) return;

			const itemX = startX - itemSize;
			const itemY = currentY;

			renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			renderer.ctx.fillRect(itemX, itemY, itemSize, itemSize);

			const rarityColor = this.getItemRarityColor(itemConfig);
			renderer.ctx.strokeStyle = rarityColor;
			renderer.ctx.lineWidth = 2;
			renderer.ctx.strokeRect(itemX + 1, itemY + 1, itemSize - 2, itemSize - 2);

			const itemSprite = engine.sprites.get(`item_${itemId}`);
			if (itemSprite) {
				const iconSize = itemSize - 8;
				const iconOffset = 4;
				renderer.ctx.drawImage(itemSprite, itemX + iconOffset, itemY + iconOffset, iconSize, iconSize);
			}

			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.font = 'bold 16px Pokemon';
			renderer.ctx.textAlign = 'right';
			renderer.ctx.textBaseline = 'bottom';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2.5;
			const quantityText = `x${quantity}`;
			renderer.ctx.strokeText(quantityText, itemX + itemSize - 2, itemY + itemSize - 2);
			renderer.ctx.fillText(quantityText, itemX + itemSize - 2, itemY + itemSize - 2);

			const itemName = itemConfig.name || itemId;
			renderer.ctx.textAlign = 'right';
			renderer.ctx.textBaseline = 'middle';
			const nameX = itemX - textSpacing;
			const nameY = itemY + itemSize / 2;
			renderer.ctx.fillStyle = rarityColor;
			renderer.ctx.strokeText(itemName, nameX, nameY);
			renderer.ctx.fillText(itemName, nameX, nameY);

			currentY += itemSize + itemSpacing;
		});

		renderer.ctx.restore();
	}
	
	formatTime(milliseconds) {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	getSessionRewardsHeight(battleScene) {
		return 0;
	}

	renderSessionRewards(renderer, battleScene, engine, startX, startY, fontSize, strokeOffset, strokeColor) {
	}

	getSpellEmoji(spellId) {
		const spellEmojis = {
			'earthquake': '🟤',
			'rock_trap': '🪨',
			'hydrocanon': '💧'
		};
		return spellEmojis[spellId] || '✨';
	}

	getProjectileTypeIcon(player) {
		if (player.hasUpgradeType && player.hasUpgradeType(UpgradeType.PROJECTILE_AOE)) {
			return '💥';
		} else if (player.hasUpgradeType && player.hasUpgradeType(UpgradeType.PROJECTILE_PIERCING)) {
			return '➡';
		} else if (player.hasUpgradeType && player.hasUpgradeType(UpgradeType.PROJECTILE_BOUNCE)) {
			return '↻';
		}
		return '●';
	}

	getItemRarityColor(item) {
		if (!item) return '#b8b8b8';
		
		if (item.rarity) {
			return RarityColors[item.rarity] || '#b8b8b8';
		}
		
		const buyPrice = item.buyPrice || 0;
		if (buyPrice >= 1000) {
			return RarityColors[UpgradeRarity.LEGENDARY] || '#ff9100';
		} else if (buyPrice >= 500) {
			return RarityColors[UpgradeRarity.EPIC] || '#ab47bc';
		} else if (buyPrice >= 200) {
			return RarityColors[UpgradeRarity.RARE] || '#4fc3f7';
		}
		return RarityColors[UpgradeRarity.COMMON] || '#b8b8b8';
	}

	renderHUDBackground(renderer, player, canvasWidth, canvasHeight, selectedPokemon = null, engine = null) {
		const maxSpells = player.maxSpells || 3;
		const spellSize = 60;
		const spellSpacing = 8;
		const iconSize = 60;
		const iconSpacing = 10;
		
		const totalSpellWidth = maxSpells * spellSize + (maxSpells - 1) * spellSpacing;
		let totalWidth = totalSpellWidth;
		if (selectedPokemon && engine) {
			totalWidth += iconSpacing + iconSize;
		}
		totalWidth += iconSpacing + iconSize;
		totalWidth += iconSpacing + iconSize;
		if (engine) {
			totalWidth += iconSpacing + iconSize;
		}
		
		const startX = (canvasWidth - totalWidth) / 2;
		const spellY = canvasHeight - 100;
		const padding = 10;
		
		const barHeight = 16;
		const xpBarHeight = 10;
		const spacing = 5;
		const barsHeight = xpBarHeight + spacing + barHeight;
		const barsY = spellY - barsHeight - padding;
		
		renderer.ctx.save();
		renderer.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
		
		const hudTopY = barsY - padding;
		const hudBottomY = spellY + spellSize + padding;
		const hudHeight = hudBottomY - hudTopY;
		
		renderer.ctx.fillRect(startX - padding, hudTopY, totalWidth + padding * 2, hudHeight);
		
		renderer.ctx.strokeStyle = '#1a237e';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.strokeRect(startX - padding, hudTopY, totalWidth + padding * 2, hudHeight);
		
		renderer.ctx.restore();
	}

	renderSpells(renderer, player, canvasWidth, canvasHeight, selectedPokemon = null, engine = null) {
		const maxSpells = player.maxSpells || 3;
		const unlockedSpells = player.getUnlockedSpells();

		const spellSize = 60;
		const spellSpacing = 8;
		const iconSize = 60;
		const iconSpacing = 10;
		
		const totalSpellWidth = maxSpells * spellSize + (maxSpells - 1) * spellSpacing;
		let totalWidth = totalSpellWidth;
		if (selectedPokemon && engine) {
			totalWidth += iconSpacing + iconSize;
		}
		totalWidth += iconSpacing + iconSize;
		totalWidth += iconSpacing + iconSize;
		if (engine) {
			totalWidth += iconSpacing + iconSize;
		}
		
		const startX = (canvasWidth - totalWidth) / 2;
		const spellY = canvasHeight - 100;
		
		let currentX = startX;

		if (selectedPokemon && engine) {
			const pokemonIconX = currentX;
			const pokemonIconY = spellY;
			const pokemonSprite = engine.sprites.get(`pokemon_${selectedPokemon}_normal`);
			
			if (pokemonSprite) {
				renderer.ctx.save();
				renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
				renderer.ctx.fillRect(pokemonIconX, pokemonIconY, iconSize, iconSize);
				renderer.ctx.strokeStyle = '#ffff00';
				renderer.ctx.lineWidth = 2;
				renderer.ctx.strokeRect(pokemonIconX, pokemonIconY, iconSize, iconSize);
				renderer.ctx.strokeStyle = 'rgba(200, 150, 0, 1)';
				renderer.ctx.lineWidth = 2;
				renderer.ctx.strokeRect(pokemonIconX + 1, pokemonIconY + 1, iconSize - 2, iconSize - 2);
				renderer.ctx.drawImage(pokemonSprite, pokemonIconX, pokemonIconY, iconSize, iconSize);
				
				const levelText = player.level.toString();
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = 'bold 16px Pokemon';
				renderer.ctx.textAlign = 'right';
				renderer.ctx.textBaseline = 'bottom';
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 2.5;
				renderer.ctx.strokeText(levelText, pokemonIconX + iconSize - 4, pokemonIconY + iconSize - 4);
				renderer.ctx.fillText(levelText, pokemonIconX + iconSize - 4, pokemonIconY + iconSize - 4);
				
				renderer.ctx.restore();
			}
			
			currentX += iconSize + iconSpacing;
		}

		for (let index = 0; index < maxSpells; index++) {
			const spellX = currentX + index * (spellSize + spellSpacing);
			const spell = unlockedSpells[index];
			const isEmpty = !spell;
			const pressAnimation = player.spellPressAnimations && player.spellPressAnimations[index] || 0;
			const pressProgress = Math.max(0, Math.min(1, pressAnimation / 200));
			const scale = 1 - pressProgress * 0.15;
			const glowIntensity = pressProgress > 0 ? (1 - pressProgress) * 0.8 : 0;

			renderer.ctx.save();

			const centerX = spellX + spellSize / 2;
			const centerY = spellY + spellSize / 2;
			renderer.ctx.translate(centerX, centerY);
			renderer.ctx.scale(scale, scale);
			renderer.ctx.translate(-centerX, -centerY);

			if (glowIntensity > 0) {
				renderer.ctx.shadowColor = 'rgba(171, 71, 188, ' + glowIntensity + ')';
				renderer.ctx.shadowBlur = 20 * glowIntensity;
			}

			const isOnCooldownCheck = !isEmpty && spell.cooldown > 0;
			const baseFillStyle = isEmpty ? 'rgba(0, 0, 0, 0.5)' : (isOnCooldownCheck ? 'rgba(60, 60, 60, 0.9)' : 'rgba(0, 0, 0, 0.7)');
			renderer.ctx.fillStyle = baseFillStyle;
			renderer.ctx.fillRect(spellX, spellY, spellSize, spellSize);
			
			if (isEmpty) {
				renderer.ctx.strokeStyle = 'rgba(68, 68, 68, 0.3)';
				renderer.ctx.lineWidth = 1;
				renderer.ctx.setLineDash([5, 5]);
				renderer.ctx.strokeRect(spellX + 0.5, spellY + 0.5, spellSize - 1, spellSize - 1);
				renderer.ctx.setLineDash([]);
			} else {
				const isOnCooldown = spell.cooldown > 0;
				const cooldownPercent = isOnCooldown ? spell.cooldown / spell.cooldownMax : 0;

				renderer.ctx.strokeStyle = isOnCooldown ? 'rgba(102, 102, 102, 0.4)' : 'rgba(171, 71, 188, 0.5)';
				renderer.ctx.lineWidth = 1;
				renderer.ctx.strokeRect(spellX + 0.5, spellY + 0.5, spellSize - 1, spellSize - 1);

				if (isOnCooldown) {
					renderer.ctx.fillStyle = 'rgba(180, 180, 180, 0.9)';
					renderer.ctx.font = 'bold 16px Pokemon';
					renderer.ctx.textAlign = 'center';
					renderer.ctx.textBaseline = 'middle';
					renderer.ctx.fillStyle = '#ffffff';
					renderer.ctx.strokeStyle = '#000000';
					renderer.ctx.lineWidth = 2.5;
					const cooldownSeconds = spell.cooldown / 1000;
					const cooldownText = cooldownSeconds >= 1 ? cooldownSeconds.toFixed(0) : cooldownSeconds.toFixed(1);
					renderer.ctx.strokeText(cooldownText, spellX + spellSize / 2, spellY + spellSize / 2 + 6);
					renderer.ctx.fillText(cooldownText, spellX + spellSize / 2, spellY + spellSize / 2 + 6);
					
					renderer.ctx.font = 'bold 8px Pokemon';
					const sX = spellX + spellSize / 2 + renderer.ctx.measureText(cooldownText).width / 2 + (cooldownSeconds >= 1 ? 8 : 12);
					renderer.ctx.strokeText('s', sX, spellY + spellSize / 2 + 6);
					renderer.ctx.fillText('s', sX, spellY + spellSize / 2 + 6);

					const borderWidth = 4;
					const sideLength = spellSize - borderWidth;
					const totalPerimeter = sideLength * 4;
					const remainingLength = totalPerimeter * cooldownPercent;

					renderer.ctx.strokeStyle = 'rgba(150, 150, 150, 0.6)';
					renderer.ctx.lineWidth = borderWidth;
					renderer.ctx.lineCap = 'square';
					renderer.ctx.lineJoin = 'miter';

					renderer.ctx.beginPath();

					const halfBorder = borderWidth / 2;
					let drawnLength = 0;

					if (remainingLength > drawnLength) {
						const topLength = Math.min(remainingLength - drawnLength, sideLength);
						renderer.ctx.moveTo(spellX + halfBorder, spellY + halfBorder);
						renderer.ctx.lineTo(spellX + halfBorder + topLength, spellY + halfBorder);
						drawnLength += sideLength;
					} else {
						renderer.ctx.moveTo(spellX + halfBorder, spellY + halfBorder);
						renderer.ctx.lineTo(spellX + spellSize - halfBorder, spellY + halfBorder);
						drawnLength += sideLength;
					}

					if (remainingLength > drawnLength) {
						const rightLength = Math.min(remainingLength - drawnLength, sideLength);
						renderer.ctx.moveTo(spellX + spellSize - halfBorder, spellY + halfBorder);
						renderer.ctx.lineTo(spellX + spellSize - halfBorder, spellY + halfBorder + rightLength);
						drawnLength += sideLength;
					} else {
						renderer.ctx.moveTo(spellX + spellSize - halfBorder, spellY + halfBorder);
						renderer.ctx.lineTo(spellX + spellSize - halfBorder, spellY + spellSize - halfBorder);
						drawnLength += sideLength;
					}

					if (remainingLength > drawnLength) {
						const bottomLength = Math.min(remainingLength - drawnLength, sideLength);
						renderer.ctx.moveTo(spellX + spellSize - halfBorder, spellY + spellSize - halfBorder);
						renderer.ctx.lineTo(spellX + spellSize - halfBorder - bottomLength, spellY + spellSize - halfBorder);
						drawnLength += sideLength;
					} else {
						renderer.ctx.moveTo(spellX + spellSize - halfBorder, spellY + spellSize - halfBorder);
						renderer.ctx.lineTo(spellX + halfBorder, spellY + spellSize - halfBorder);
						drawnLength += sideLength;
					}

					if (remainingLength > drawnLength) {
						const leftLength = Math.min(remainingLength - drawnLength, sideLength);
						renderer.ctx.moveTo(spellX + halfBorder, spellY + spellSize - halfBorder);
						renderer.ctx.lineTo(spellX + halfBorder, spellY + spellSize - halfBorder - leftLength);
					} else {
						renderer.ctx.moveTo(spellX + halfBorder, spellY + spellSize - halfBorder);
						renderer.ctx.lineTo(spellX + halfBorder, spellY + halfBorder);
					}

					renderer.ctx.stroke();
				} else {
					const spellEmoji = this.getSpellEmoji(spell.id);
					renderer.ctx.fillStyle = '#ab47bc';
					renderer.ctx.font = '32px Pokemon';
					renderer.ctx.textAlign = 'center';
					renderer.ctx.fillText(spellEmoji, spellX + spellSize / 2, spellY + spellSize / 2 + 10);
					
					const spellLevel = player.getSpellLevel(spell.id);
					const totalLevel = spellLevel.damage + spellLevel.range + spellLevel.cooldown;
					if (totalLevel > 0) {
						renderer.ctx.fillStyle = '#ffff00';
						renderer.ctx.font = 'bold 16px Pokemon';
						renderer.ctx.textAlign = 'center';
						renderer.ctx.textBaseline = 'bottom';
						renderer.ctx.strokeStyle = '#000000';
						renderer.ctx.lineWidth = 2.5;
						renderer.ctx.strokeText(`Lv.${totalLevel}`, spellX + spellSize / 2, spellY + spellSize - 5);
						renderer.ctx.fillText(`Lv.${totalLevel}`, spellX + spellSize / 2, spellY + spellSize - 5);
					}
				}

			}

			const keyText = `${index + 1}`;
			renderer.ctx.fillStyle = isEmpty ? '#555' : '#aaa';
			renderer.ctx.font = 'bold 16px Pokemon';
			renderer.ctx.textAlign = 'right';
			renderer.ctx.textBaseline = 'bottom';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2.5;
			renderer.ctx.strokeText(keyText, spellX + spellSize - 4, spellY + spellSize - 4);
			renderer.ctx.fillText(keyText, spellX + spellSize - 4, spellY + spellSize - 4);

			renderer.ctx.shadowBlur = 0;
			renderer.ctx.restore();
		}

		if (engine) {
			currentX += maxSpells * (spellSize + spellSpacing) - spellSpacing + iconSpacing;

			const consumableItem = engine.assignedConsumable ? ItemConfig[engine.assignedConsumable] : null;
			const consumableQuantity = engine.assignedConsumable ? (engine.inventory[engine.assignedConsumable] || 0) : 0;
			
			const consumableIconX = currentX;
			const consumableIconY = spellY;
			const consumableIconSize = iconSize / 2;
			const consumableIconOffset = (iconSize - consumableIconSize) / 2;
			
			const pressAnimation = player.consumablePressAnimation || 0;
			const pressProgress = Math.max(0, Math.min(1, pressAnimation / 200));
			const scale = 1 - pressProgress * 0.15;
			const glowIntensity = pressProgress > 0 ? (1 - pressProgress) * 0.8 : 0;
			
			renderer.ctx.save();
			
			const centerX = consumableIconX + iconSize / 2;
			const centerY = consumableIconY + iconSize / 2;
			renderer.ctx.translate(centerX, centerY);
			renderer.ctx.scale(scale, scale);
			renderer.ctx.translate(-centerX, -centerY);
			
			if (glowIntensity > 0) {
				renderer.ctx.shadowColor = 'rgba(0, 136, 255, ' + glowIntensity + ')';
				renderer.ctx.shadowBlur = 20 * glowIntensity;
			}
			
			renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			renderer.ctx.fillRect(consumableIconX, consumableIconY, iconSize, iconSize);
			
			if (consumableItem && consumableQuantity > 0) {
				const rarityColor = this.getItemRarityColor(consumableItem);
				renderer.ctx.strokeStyle = rarityColor;
				renderer.ctx.lineWidth = 1;
				renderer.ctx.strokeRect(consumableIconX + 0.5, consumableIconY + 0.5, iconSize - 1, iconSize - 1);
			} else {
				renderer.ctx.strokeStyle = 'rgba(68, 68, 68, 0.3)';
				renderer.ctx.lineWidth = 1;
				renderer.ctx.setLineDash([5, 5]);
				renderer.ctx.strokeRect(consumableIconX + 0.5, consumableIconY + 0.5, iconSize - 1, iconSize - 1);
				renderer.ctx.setLineDash([]);
			}
			
			if (consumableItem && consumableQuantity > 0) {
				let consumableSprite = engine.sprites.get(`item_${engine.assignedConsumable}`);
				if (!consumableSprite) {
					consumableSprite = engine.sprites.get(engine.assignedConsumable);
				}
				if (consumableSprite) {
					renderer.ctx.drawImage(consumableSprite, consumableIconX + consumableIconOffset, consumableIconY + consumableIconOffset, consumableIconSize, consumableIconSize);
				}
				
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = 'bold 16px Pokemon';
				renderer.ctx.textAlign = 'right';
				renderer.ctx.textBaseline = 'bottom';
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 2.5;
				const quantityText = `x${consumableQuantity}`;
				renderer.ctx.strokeText(quantityText, consumableIconX + iconSize - 2, consumableIconY + iconSize - 2);
				renderer.ctx.fillText(quantityText, consumableIconX + iconSize - 2, consumableIconY + iconSize - 2);
			}
			
			renderer.ctx.fillStyle = '#aaa';
			renderer.ctx.font = 'bold 16px Pokemon';
			renderer.ctx.textAlign = 'right';
			renderer.ctx.textBaseline = 'bottom';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2.5;
			renderer.ctx.strokeText('F', consumableIconX + iconSize - 4, consumableIconY + iconSize - 4);
			renderer.ctx.fillText('F', consumableIconX + iconSize - 4, consumableIconY + iconSize - 4);
			
			renderer.ctx.shadowBlur = 0;
			renderer.ctx.restore();
		}

		if (engine) {
			currentX += iconSize + iconSpacing;

			const eggIconX = currentX;
			const eggIconY = spellY;
			const eggIconSize = iconSize / 2;
			const eggIconOffset = (iconSize - eggIconSize) / 2;
			const progressBarHeight = 4;
			const progressBarPadding = 2;
			const progressBarY = spellY + iconSize - progressBarHeight - progressBarPadding;
			const progressBarWidth = iconSize - progressBarPadding * 2;
			const progressBarX = eggIconX + progressBarPadding;
			
			const pressAnimation = player.eggPressAnimation || 0;
			const pressProgress = Math.max(0, Math.min(1, pressAnimation / 200));
			const scale = 1 - pressProgress * 0.15;
			const glowIntensity = pressProgress > 0 ? (1 - pressProgress) * 0.8 : 0;
			
			renderer.ctx.save();
			
			const centerX = eggIconX + iconSize / 2;
			const centerY = eggIconY + iconSize / 2;
			renderer.ctx.translate(centerX, centerY);
			renderer.ctx.scale(scale, scale);
			renderer.ctx.translate(-centerX, -centerY);
			
			if (glowIntensity > 0) {
				renderer.ctx.shadowColor = 'rgba(255, 255, 0, ' + glowIntensity + ')';
				renderer.ctx.shadowBlur = 20 * glowIntensity;
			}
			
			renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			renderer.ctx.fillRect(eggIconX, eggIconY, iconSize, iconSize);
			
			if (engine.incubatingEgg) {
				const incubatingEgg = engine.incubatingEgg;
				const eggConfig = ItemConfig[incubatingEgg.itemId];
				
				if (eggConfig) {
					const rarityColor = this.getItemRarityColor(eggConfig);
					renderer.ctx.strokeStyle = rarityColor;
					renderer.ctx.lineWidth = 1;
					renderer.ctx.strokeRect(eggIconX + 0.5, eggIconY + 0.5, iconSize - 1, iconSize - 1);
					
					const eggSprite = engine.sprites.get(`item_${incubatingEgg.itemId}`);
					if (eggSprite) {
						renderer.ctx.drawImage(eggSprite, eggIconX + eggIconOffset, eggIconY + eggIconOffset, eggIconSize, eggIconSize);
					}
				} else {
					renderer.ctx.strokeStyle = 'rgba(68, 68, 68, 0.3)';
					renderer.ctx.lineWidth = 1;
					renderer.ctx.setLineDash([5, 5]);
					renderer.ctx.strokeRect(eggIconX + 0.5, eggIconY + 0.5, iconSize - 1, iconSize - 1);
					renderer.ctx.setLineDash([]);
				}
				
				const currentKills = incubatingEgg.currentKills || 0;
				const requiredKills = incubatingEgg.requiredKills || 1;
				const progress = Math.min(1, currentKills / requiredKills);
				
				renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
				renderer.ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
				
				const progressGradient = renderer.ctx.createLinearGradient(progressBarX, 0, progressBarX + progressBarWidth * progress, 0);
				if (eggConfig && eggConfig.rarity === 'legendary') {
					progressGradient.addColorStop(0, '#ff9100');
					progressGradient.addColorStop(1, '#ffaa44');
				} else if (eggConfig && eggConfig.rarity === 'epic') {
					progressGradient.addColorStop(0, '#ab47bc');
					progressGradient.addColorStop(1, '#ce5fdf');
				} else if (eggConfig && eggConfig.rarity === 'rare') {
					progressGradient.addColorStop(0, '#4fc3f7');
					progressGradient.addColorStop(1, '#81d4fa');
				} else {
					progressGradient.addColorStop(0, '#888888');
					progressGradient.addColorStop(1, '#aaaaaa');
				}
				renderer.ctx.fillStyle = progressGradient;
				renderer.ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);
			} else {
				renderer.ctx.strokeStyle = 'rgba(68, 68, 68, 0.3)';
				renderer.ctx.lineWidth = 1;
				renderer.ctx.setLineDash([5, 5]);
				renderer.ctx.strokeRect(eggIconX + 0.5, eggIconY + 0.5, iconSize - 1, iconSize - 1);
				renderer.ctx.setLineDash([]);
				
				const noEggSprite = engine.sprites.get('no_egg');
				if (noEggSprite) {
					renderer.ctx.drawImage(noEggSprite, eggIconX + eggIconOffset, eggIconY + eggIconOffset, eggIconSize, eggIconSize);
				}
				
				renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
				renderer.ctx.fillRect(eggIconX, eggIconY, iconSize, iconSize);
			}
			
			renderer.ctx.fillStyle = '#aaa';
			renderer.ctx.font = 'bold 16px Pokemon';
			renderer.ctx.textAlign = 'right';
			renderer.ctx.textBaseline = 'bottom';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2.5;
			renderer.ctx.strokeText('E', eggIconX + iconSize - 4, eggIconY + iconSize - 4);
			renderer.ctx.fillText('E', eggIconX + iconSize - 4, eggIconY + iconSize - 4);
			
			renderer.ctx.shadowBlur = 0;
			renderer.ctx.restore();
		}
	}

	renderHPXP(renderer, player, canvasWidth, canvasHeight, selectedPokemon = null, engine = null, bossTimer = null, maxBossTimer = null, currentBoss = null) {
		const spellSize = 60;
		const spellSpacing = 8;
		const iconSize = 60;
		const iconSpacing = 10;
		const maxSpells = player.maxSpells || 3;
		const spellY = canvasHeight - 100;
		
		const fontSize = 16;
		const barHeight = fontSize;
		const xpBarHeight = 10;
		const strokeColor = '#000000';
		const barGreen = '#61F959';
		const barRed = '#FE8D65';
		const barXpBlue = '#87CEEB';
		const barXpEmpty = '#4a5568';

		const totalSpellWidth = maxSpells * spellSize + (maxSpells - 1) * spellSpacing;
		let totalWidth = totalSpellWidth;
		if (selectedPokemon && engine) {
			totalWidth += iconSpacing + iconSize;
		}
		totalWidth += iconSpacing + iconSize;
		totalWidth += iconSpacing + iconSize;
		if (engine) {
			totalWidth += iconSpacing + iconSize;
		}
		
		const spellStartX = (canvasWidth - totalWidth) / 2;
		const spellEndX = spellStartX + totalWidth;

		const spacing = 5;
		const barsHeight = xpBarHeight + spacing + barHeight;
		const barsY = spellY - barsHeight - 10;

		renderer.ctx.save();

		const xpPercent = Math.max(0, Math.min(1, player.displayedXp / player.xpToNextLevel));
		const xpFilledWidth = (spellEndX - spellStartX) * xpPercent;

		renderer.ctx.fillStyle = barXpEmpty;
		renderer.ctx.fillRect(spellStartX, barsY, spellEndX - spellStartX, xpBarHeight);

		renderer.ctx.fillStyle = barXpBlue;
		renderer.ctx.fillRect(spellStartX, barsY, xpFilledWidth, xpBarHeight);

		renderer.ctx.strokeStyle = '#ffffff';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.beginPath();
		renderer.ctx.moveTo(spellStartX, barsY);
		renderer.ctx.lineTo(spellEndX, barsY);
		renderer.ctx.stroke();

		renderer.ctx.beginPath();
		renderer.ctx.moveTo(spellStartX, barsY + xpBarHeight);
		renderer.ctx.lineTo(spellEndX, barsY + xpBarHeight);
		renderer.ctx.stroke();
		
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;

		const hpBarX = spellStartX;
		const hpBarY = barsY + xpBarHeight + spacing;
		const hpBarWidth = spellEndX - spellStartX;
		const hpPercent = Math.max(0, Math.min(1, player.hp / player.maxHp));
		const hpFilledWidth = hpBarWidth * hpPercent;

		renderer.ctx.fillStyle = barXpEmpty;
		renderer.ctx.fillRect(hpBarX, hpBarY, hpBarWidth, barHeight);

		let hpBarColor;
		if (hpPercent > 0.5) {
			hpBarColor = '#30B72C';
		} else if (hpPercent > 0.25) {
			hpBarColor = '#F9C152';
		} else {
			hpBarColor = '#F74B33';
		}
		renderer.ctx.fillStyle = hpBarColor;
		renderer.ctx.fillRect(hpBarX, hpBarY, hpFilledWidth, barHeight);

		renderer.ctx.strokeStyle = '#ffffff';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.moveTo(hpBarX, hpBarY);
		renderer.ctx.lineTo(hpBarX + hpBarWidth, hpBarY);
		renderer.ctx.stroke();

		renderer.ctx.beginPath();
		renderer.ctx.moveTo(hpBarX, hpBarY + barHeight);
		renderer.ctx.lineTo(hpBarX + hpBarWidth, hpBarY + barHeight);
		renderer.ctx.stroke();
		
		const hpText = `${Math.floor(player.hp)}/${Math.floor(player.maxHp)}`;
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.font = 'bold 16px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.textBaseline = 'middle';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2.5;
		renderer.ctx.strokeText(hpText, hpBarX + hpBarWidth / 2, hpBarY + barHeight / 2);
		renderer.ctx.fillText(hpText, hpBarX + hpBarWidth / 2, hpBarY + barHeight / 2);
		
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;

		renderer.ctx.restore();
	}

	renderBossBar(renderer, boss, canvasWidth) {
		if (!boss || !boss.isAlive) return;

		const barWidth = 400;
		const barHeight = 20;
		const barX = (canvasWidth - barWidth) / 2;
		const barY = 40;
		const padding = 2;

		renderer.ctx.save();

		if (boss.pokemonConfig) {
			const pokemonName = boss.pokemonConfig.name || 'Boss';
			renderer.ctx.fillStyle = '#ff0000';
			renderer.ctx.font = 'bold 16px Pokemon';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.textBaseline = 'top';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2.5;
			renderer.ctx.strokeText(pokemonName.toUpperCase(), canvasWidth / 2, barY - 25);
			renderer.ctx.fillText(pokemonName.toUpperCase(), canvasWidth / 2, barY - 25);
		}

		renderer.ctx.fillStyle = '#333';
		renderer.ctx.fillRect(barX, barY, barWidth, barHeight);
		renderer.ctx.strokeStyle = '#000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.strokeRect(barX, barY, barWidth, barHeight);

		const displayedHpPercent = boss.displayedHp / boss.maxHp;
		if (boss.lostHp > 0) {
			renderer.ctx.fillStyle = '#ff6b6b';
			renderer.ctx.fillRect(barX + padding, barY + padding, (barWidth - padding * 2) * displayedHpPercent, barHeight - padding * 2);
		}

		const hpPercent = boss.hp / boss.maxHp;
		if (hpPercent > 0.5) {
			renderer.ctx.fillStyle = '#30B72C';
		} else if (hpPercent > 0.25) {
			renderer.ctx.fillStyle = '#F9C152';
		} else {
			renderer.ctx.fillStyle = '#F74B33';
		}
		renderer.ctx.fillRect(barX + padding, barY + padding, (barWidth - padding * 2) * hpPercent, barHeight - padding * 2);

		renderer.ctx.restore();
	}

	renderBossProgressBar(renderer, bossTimer, maxBossTimer, canvasWidth, engine = null, bossType = null) {
		const barWidth = 400;
		const barHeight = 20;
		const iconSize = 30;
		const barX = (canvasWidth - barWidth) / 2;
		const barY = 40;
		const padding = 2;

		renderer.ctx.save();

		const timerSeconds = Math.ceil(bossTimer / 1000);
		const minutes = Math.floor(timerSeconds / 60);
		const seconds = timerSeconds % 60;
		const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

		renderer.ctx.fillStyle = '#ff0000';
		renderer.ctx.font = 'bold 16px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.textBaseline = 'top';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2.5;
		renderer.ctx.strokeText(`Boss dans ${timerText}`, canvasWidth / 2, barY - 25);
		renderer.ctx.fillText(`Boss dans ${timerText}`, canvasWidth / 2, barY - 25);

		const progress = Math.max(0, Math.min(1, (maxBossTimer - bossTimer) / maxBossTimer));
		const filledWidth = (barWidth - padding * 2) * progress;

		renderer.ctx.fillStyle = '#333';
		renderer.ctx.fillRect(barX, barY, barWidth, barHeight);
		renderer.ctx.strokeStyle = '#000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.strokeRect(barX, barY, barWidth, barHeight);

		const progressGradient = renderer.ctx.createLinearGradient(barX, 0, barX + filledWidth, 0);
		progressGradient.addColorStop(0, '#ff6b6b');
		progressGradient.addColorStop(1, '#ff4444');
		renderer.ctx.fillStyle = progressGradient;
		renderer.ctx.fillRect(barX + padding, barY + padding, filledWidth, barHeight - padding * 2);

		if (bossType && engine) {
			const bossConfig = getEnemyConfig(bossType);
			if (bossConfig && bossConfig.pokemon) {
				const bossSprite = engine.sprites.get(`pokemon_${bossConfig.pokemon}_normal`);
				if (bossSprite) {
					const iconX = barX + barWidth - iconSize + 2;
					const iconY = barY + (barHeight - iconSize) / 2;
					renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
					renderer.ctx.fillRect(iconX, iconY, iconSize, iconSize);
					renderer.ctx.strokeStyle = '#ff0000';
					renderer.ctx.lineWidth = 4;
					renderer.ctx.strokeRect(iconX, iconY, iconSize, iconSize);
					renderer.ctx.drawImage(bossSprite, iconX, iconY, iconSize, iconSize);
				}
			}
		}

		renderer.ctx.restore();
	}

	renderEndlessTimer(renderer, survivalTime, canvasWidth) {
		const barWidth = 400;
		const barHeight = 20;
		const barX = (canvasWidth - barWidth) / 2;
		const barY = 20;

		renderer.ctx.save();

		const totalSeconds = Math.floor(survivalTime / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

		renderer.ctx.fillStyle = '#333';
		renderer.ctx.fillRect(barX, barY, barWidth, barHeight);
		renderer.ctx.strokeStyle = '#000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.strokeRect(barX, barY, barWidth, barHeight);

		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.font = 'bold 16px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.textBaseline = 'middle';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2.5;
		renderer.ctx.strokeText(`Endless: ${timerText}`, canvasWidth / 2, barY + barHeight / 2);
		renderer.ctx.fillText(`Endless: ${timerText}`, canvasWidth / 2, barY + barHeight / 2);

		renderer.ctx.restore();
	}

	renderUpgradesGrouped(renderer, player, startX, startY, fontSize, lineHeight) {
		if (!player) return;

		const groups = [];

		if (player.hasEffect) {
			let totalProcChance = 0;
			let totalDamageMultiplier = 1;
			let totalIntensityMultiplier = 1;
			let totalDurationMultiplier = 1;

			if (player.upgrades) {
				for (const upgradeId in player.upgrades) {
					const upgrade = Upgrades[upgradeId];
					if (!upgrade) continue;

					const count = player.upgrades[upgradeId];
					if (count <= 0) continue;

					if (upgrade.type === UpgradeType.EFFECT_PROC_CHANCE) {
						totalProcChance += upgrade.value * count;
					} else if (upgrade.type === UpgradeType.EFFECT_DAMAGE) {
						totalDamageMultiplier *= Math.pow(upgrade.value, count);
					} else if (upgrade.type === UpgradeType.EFFECT_INTENSITY) {
						totalIntensityMultiplier *= Math.pow(upgrade.value, count);
					} else if (upgrade.type === UpgradeType.EFFECT_DURATION) {
						totalDurationMultiplier *= Math.pow(upgrade.value, count);
					}
				}
			}

			const stats = [];
			
			if (totalProcChance > 0) {
				stats.push({ label: 'Chance', value: `${Math.round(totalProcChance * 100)}%`, isUpgraded: true });
			}

			if (totalDamageMultiplier > 1) {
				const bonus = (totalDamageMultiplier - 1) * 100;
				stats.push({ label: 'Dégâts', value: `${Math.round(bonus)}%`, isUpgraded: true });
			}

			if (totalIntensityMultiplier > 1) {
				const bonus = (totalIntensityMultiplier - 1) * 100;
				stats.push({ label: 'Intensité', value: `${Math.round(bonus)}%`, isUpgraded: true });
			}

			if (totalDurationMultiplier > 1) {
				const bonus = (totalDurationMultiplier - 1) * 100;
				stats.push({ label: 'Durée', value: `${Math.round(bonus)}%`, isUpgraded: true });
			}

			groups.push({
				name: 'Effet',
				stats: stats
			});
		}

		if (player.hasAoE) {
			let totalRadiusMultiplier = 1;
			let totalDamageMultiplier = 1;

			if (player.upgrades) {
				for (const upgradeId in player.upgrades) {
					const upgrade = Upgrades[upgradeId];
					if (!upgrade) continue;

					const count = player.upgrades[upgradeId];
					if (count <= 0) continue;

					if (upgrade.type === UpgradeType.AOE_RADIUS) {
						totalRadiusMultiplier *= Math.pow(upgrade.value, count);
					} else if (upgrade.type === UpgradeType.AOE_DAMAGE) {
						totalDamageMultiplier *= Math.pow(upgrade.value, count);
					}
				}
			}

			const stats = [];
			
			if (totalRadiusMultiplier > 1) {
				const bonus = (totalRadiusMultiplier - 1) * 100;
				stats.push({ label: 'Rayon', value: `${Math.round(bonus)}%`, isUpgraded: true });
			}

			if (totalDamageMultiplier > 1) {
				const bonus = (totalDamageMultiplier - 1) * 100;
				stats.push({ label: 'Dégâts', value: `${Math.round(bonus)}%`, isUpgraded: true });
			}

			groups.push({
				name: 'Explosion',
				stats: stats
			});
		}

		if (player.hasPiercing) {
			let totalDamageReduction = 0;
			let totalMaxCount = 0;

			if (player.upgrades) {
				for (const upgradeId in player.upgrades) {
					const upgrade = Upgrades[upgradeId];
					if (!upgrade) continue;

					const count = player.upgrades[upgradeId];
					if (count <= 0) continue;

					if (upgrade.type === UpgradeType.PIERCING_DAMAGE_REDUCTION) {
						totalDamageReduction += upgrade.value * count;
					} else if (upgrade.type === UpgradeType.PIERCING_MAX_COUNT) {
						totalMaxCount += upgrade.value * count;
					}
				}
			}

			const stats = [];
			if (totalDamageReduction > 0) {
				const efficiency = (totalDamageReduction / 0.2) * 100;
				stats.push({ label: 'Dégâts', value: `${Math.round(efficiency)}%`, isUpgraded: true });
			}
			if (totalMaxCount > 0) {
				stats.push({ label: 'Ennemis', value: `+${totalMaxCount}`, isUpgraded: true });
			}

			groups.push({
				name: 'Perforation',
				stats: stats
			});
		}

		if (player.hasBounce) {
			let totalMaxCount = 0;
			let totalDetectionRange = 0;

			if (player.upgrades) {
				for (const upgradeId in player.upgrades) {
					const upgrade = Upgrades[upgradeId];
					if (!upgrade) continue;

					const count = player.upgrades[upgradeId];
					if (count <= 0) continue;

					if (upgrade.type === UpgradeType.BOUNCE_MAX_COUNT) {
						totalMaxCount += upgrade.value * count;
					} else if (upgrade.type === UpgradeType.BOUNCE_DETECTION_RANGE) {
						totalDetectionRange += upgrade.value * count;
					}
				}
			}

			const stats = [];
			
			if (totalMaxCount > 0) {
				stats.push({ label: 'Rebonds', value: `+${totalMaxCount}`, isUpgraded: true });
			}

			if (totalDetectionRange > 0) {
				stats.push({ label: 'Portée', value: `+${totalDetectionRange}`, isUpgraded: true });
			}

			groups.push({
				name: 'Rebond',
				stats: stats
			});
		}

		if (groups.length === 0) return;

		let currentY = startY;

		groups.forEach(group => {
			renderer.ctx.font = `bold ${fontSize}px Pokemon`;
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2.5;
			renderer.ctx.strokeText(group.name, startX, currentY);
			renderer.ctx.fillText(group.name, startX, currentY);
			currentY += lineHeight;

			group.stats.forEach(stat => {
				renderer.ctx.font = `${fontSize}px Pokemon`;
				const indent = '  ';
				const text = `${indent}- ${stat.label} ${stat.value}`;
				const statColor = stat.isUpgraded ? '#ffff00' : '#ffffff';
				renderer.ctx.fillStyle = statColor;
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 2.5;
				renderer.ctx.strokeText(text, startX, currentY);
				renderer.ctx.fillText(text, startX, currentY);
				currentY += lineHeight;
			});
		});
	}
}
