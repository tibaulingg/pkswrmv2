import { EnemyTypes } from '../Config/EnemyConfig.js';

export default class HUDRenderer {
	constructor() {
		this.lineHeight = 25;
	}

	render(renderer, player, canvasWidth, canvasHeight, survivalTime, bossTimer = null, maxBossTimer = null, selectedPokemon = null, engine = null, currentBoss = null, mapData = null, bossDefeated = false) {
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

		this.renderSimpleHUD(renderer, player, canvasWidth, mapData, selectedPokemon, engine, bossTimer, maxBossTimer, currentBoss);
		this.renderSpells(renderer, player, canvasWidth, canvasHeight, selectedPokemon, engine);
		this.renderHPXP(renderer, player, canvasWidth, canvasHeight, selectedPokemon, engine, bossTimer, maxBossTimer, currentBoss);
	}

	renderStatLine(renderer, x, y, label, value, fontSize, strokeOffset, strokeColor, labelColor, labelWidth, spacing = 2) {
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';
		
		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = labelColor;
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeText(label, x + strokeOffset, y + strokeOffset);
		renderer.ctx.fillText(label, x, y);
		
		const valueX = x + labelWidth + spacing;

		renderer.ctx.font = `${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeText(value, valueX + strokeOffset, y + strokeOffset);
		renderer.ctx.fillText(value, valueX, y);
	}

	renderSimpleHUD(renderer, player, canvasWidth, mapData, selectedPokemon = null, engine = null, bossTimer = null, maxBossTimer = null, currentBoss = null) {
		const minimapSize = 120;
		const minimapX = canvasWidth - minimapSize - 10;
		const minimapY = 10;
		
		const padding = 10;
		const statsStartY = minimapY + minimapSize + 15;
		const fontSize = 16;
		const statsFontSize = 14;
		const lineHeight = fontSize + 4;
		const statsLineHeight = statsFontSize + 4;
		const strokeOffset = 1;
		const strokeColor = '#000000';
		const labelColor = '#E58E72';
		const barGreen = '#61F959';
		const barRed = '#FE8D65';
		const barXpBlue = '#87CEEB';
		const barXpEmpty = '#4a5568';

		renderer.ctx.save();
		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = labelColor;
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';

		const stats = [
			{ label: 'ATK', value: Math.floor(player.damage).toString() },
			{ label: 'SPD', value: player.speed.toFixed(1) },
			{ label: 'ASP', value: player.attackSpeed.toFixed(1) },
			{ label: 'RNG', value: Math.floor(player.range).toString() },
			{ label: 'CRIT', value: (player.critChance * 100).toFixed(1) + '%' },
			{ label: 'CDMG', value: (player.critDamage * 100).toFixed(0) + '%' },
			{ label: 'LIFE', value: (player.lifeSteal * 100).toFixed(1) + '%' },
			{ label: 'REG', value: player.hpRegen.toFixed(1) + '/s' },
			{ label: 'KNOC', value: player.knockback.toFixed(1) },
			{ label: 'HP', value: `${Math.floor(player.hp)}/${Math.floor(player.maxHp)}` },
			{ label: 'XP', value: `${Math.floor(player.displayedXp)}/${Math.floor(player.xpToNextLevel)}` },
		];

		// Calculate max label width for stats alignment (max 4 chars)
		let maxLabelWidth = 0;
		stats.forEach((stat) => {
			renderer.ctx.font = `bold ${fontSize}px Pokemon`;
			const width = renderer.ctx.measureText(stat.label).width;
			if (width > maxLabelWidth) {
				maxLabelWidth = width;
			}
		});
		const labelWidth = maxLabelWidth;

		// Render stats line by line under minimap
		const statsX = minimapX;
		const statsY = statsStartY;
		
		stats.forEach((stat, index) => {
			this.renderStatLine(renderer, statsX, statsY + index * statsLineHeight, stat.label, stat.value, statsFontSize, strokeOffset, strokeColor, labelColor, labelWidth);
		});

		renderer.ctx.restore();
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
		if (player.hasAoE) {
			return '💥';
		} else if (player.hasPiercing) {
			return '➡';
		} else if (player.hasBounce) {
			return '↻';
		}
		return '●';
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
		if (selectedPokemon && engine) {
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
				renderer.ctx.strokeStyle = '#ffffff';
				renderer.ctx.lineWidth = 2;
				renderer.ctx.strokeRect(pokemonIconX, pokemonIconY, iconSize, iconSize);
				renderer.ctx.drawImage(pokemonSprite, pokemonIconX, pokemonIconY, iconSize, iconSize);
				
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.font = 'bold 12px Pokemon';
				renderer.ctx.textAlign = 'right';
				renderer.ctx.textBaseline = 'bottom';
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 3;
				const levelText = `Lv.${player.level}`;
				renderer.ctx.strokeText(levelText, pokemonIconX + iconSize - 2, pokemonIconY + iconSize - 2);
				renderer.ctx.fillText(levelText, pokemonIconX + iconSize - 2, pokemonIconY + iconSize - 2);
				renderer.ctx.restore();
			}
			
			currentX += iconSize + iconSpacing;
		}

		if (selectedPokemon && engine) {
			const attackIconX = currentX;
			const attackIconY = spellY;
			let attackTypeIcon = '';
			let attackTypeLabel = '';
			
			if (player.attackType === 'range') {
				attackTypeIcon = this.getProjectileTypeIcon(player);
				if (player.hasAoE) {
					attackTypeLabel = 'AOE';
				} else if (player.hasPiercing) {
					attackTypeLabel = 'PIER';
				} else if (player.hasBounce) {
					attackTypeLabel = 'BOUN';
				} else {
					attackTypeLabel = 'BASE';
				}
			} else {
				attackTypeIcon = '⚔';
				attackTypeLabel = 'MELE';
			}
			
			renderer.ctx.save();
			renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			renderer.ctx.fillRect(attackIconX, attackIconY, iconSize, iconSize);
			renderer.ctx.strokeStyle = 'rgba(171, 71, 188, 0.5)';
			renderer.ctx.lineWidth = 1;
			renderer.ctx.strokeRect(attackIconX + 0.5, attackIconY + 0.5, iconSize - 1, iconSize - 1);
			
			const projectileColor = player.attackType === 'range' ? player.projectileColor : '#ab47bc';
			renderer.ctx.fillStyle = projectileColor;
			renderer.ctx.font = '32px Pokemon';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.fillText(attackTypeIcon, attackIconX + iconSize / 2, attackIconY + iconSize / 2 + 10);
			
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.font = '8px Pokemon';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.textBaseline = 'top';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.strokeText(attackTypeLabel, attackIconX + iconSize / 2, attackIconY + iconSize - 8);
			renderer.ctx.fillText(attackTypeLabel, attackIconX + iconSize / 2, attackIconY + iconSize - 8);
			renderer.ctx.restore();
			
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

				renderer.ctx.fillStyle = '#666';
				renderer.ctx.font = '24px Pokemon';
				renderer.ctx.textAlign = 'center';
				renderer.ctx.fillText('?', spellX + spellSize / 2, spellY + spellSize / 2 + 8);
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
					const cooldownSeconds = spell.cooldown / 1000;
					const cooldownText = cooldownSeconds >= 1 ? cooldownSeconds.toFixed(0) : cooldownSeconds.toFixed(1);
					renderer.ctx.fillText(cooldownText, spellX + spellSize / 2, spellY + spellSize / 2 + 6);
					
					renderer.ctx.font = 'bold 8px Pokemon';
					renderer.ctx.fillText('s', spellX + spellSize / 2 + renderer.ctx.measureText(cooldownText).width / 2 + (cooldownSeconds >= 1 ? 8 : 12), spellY + spellSize / 2 + 6);

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
						renderer.ctx.font = 'bold 12px Pokemon';
						renderer.ctx.textAlign = 'center';
						renderer.ctx.fillText(`Lv.${totalLevel}`, spellX + spellSize / 2, spellY + spellSize - 5);
					}
				}

			}

			const keyText = `${index + 1}`;
			renderer.ctx.fillStyle = isEmpty ? '#555' : '#aaa';
			renderer.ctx.font = '10px Pokemon';
			renderer.ctx.fillText(keyText, spellX + spellSize - 8, spellY + 12);

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
		const spacing = 5;
		const hpY = spellY + spellSize + spacing;
		
		const fontSize = 16;
		const lineHeight = fontSize + 4;
		const barHeight = fontSize;
		const xpBarHeight = 10;
		const strokeOffset = 1;
		const strokeColor = '#000000';
		const barGreen = '#61F959';
		const barRed = '#FE8D65';
		const barXpBlue = '#87CEEB';
		const barXpEmpty = '#4a5568';

		// Calculate spell area width (same calculation as in renderSpells)
		const totalSpellWidth = maxSpells * spellSize + (maxSpells - 1) * spellSpacing;
		let totalWidth = totalSpellWidth;
		if (selectedPokemon && engine) {
			totalWidth += iconSpacing + iconSize;
		}
		if (selectedPokemon && engine) {
			totalWidth += iconSpacing + iconSize;
		}
		const spellStartX = (canvasWidth - totalWidth) / 2;
		const spellEndX = spellStartX + totalWidth;

		// XP bar - full width, thinner (above HP)
		const xpBarY = hpY;
		const xpPercent = Math.max(0, Math.min(1, player.displayedXp / player.xpToNextLevel));
		const xpFilledWidth = (spellEndX - spellStartX) * xpPercent;

		renderer.ctx.save();
		renderer.ctx.fillStyle = barXpEmpty;
		renderer.ctx.fillRect(spellStartX, xpBarY, spellEndX - spellStartX, xpBarHeight);

		renderer.ctx.fillStyle = barXpBlue;
		renderer.ctx.fillRect(spellStartX, xpBarY, xpFilledWidth, xpBarHeight);

		renderer.ctx.strokeStyle = '#ffffff';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.beginPath();
		renderer.ctx.moveTo(spellStartX, xpBarY);
		renderer.ctx.lineTo(spellEndX, xpBarY);
		renderer.ctx.stroke();

		renderer.ctx.beginPath();
		renderer.ctx.moveTo(spellStartX, xpBarY + xpBarHeight);
		renderer.ctx.lineTo(spellEndX, xpBarY + xpBarHeight);
		renderer.ctx.stroke();
		
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;

		// HP bar - full width from sprite start to spell end (below XP)
		const hpBarX = spellStartX;
		const hpBarY = xpBarY + xpBarHeight + 5;
		const hpBarWidth = spellEndX - spellStartX;
		const hpPercent = Math.max(0, Math.min(1, player.hp / player.maxHp));
		const hpFilledWidth = hpBarWidth * hpPercent;

		renderer.ctx.fillStyle = barRed;
		renderer.ctx.fillRect(hpBarX, hpBarY, hpBarWidth, barHeight);

		renderer.ctx.fillStyle = barGreen;
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
		
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;

		renderer.ctx.restore();
	}

	renderBossBar(renderer, boss, canvasWidth) {
		if (!boss || !boss.isAlive) return;

		const barWidth = 400;
		const barHeight = 20;
		const barX = (canvasWidth - barWidth) / 2;
		const barY = 20;
		const padding = 2;

		renderer.ctx.save();

		if (boss.pokemonConfig) {
			const pokemonName = boss.pokemonConfig.name || 'Boss';
			renderer.ctx.fillStyle = '#ff0000';
			renderer.ctx.font = 'bold 14px Pokemon';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
			renderer.ctx.shadowBlur = 2;
			renderer.ctx.fillText(pokemonName.toUpperCase(), canvasWidth / 2, barY - 5);
			renderer.ctx.shadowBlur = 0;
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
		const hpGradient = renderer.ctx.createLinearGradient(barX, 0, barX + barWidth * hpPercent, 0);
		if (hpPercent > 0.6) {
			hpGradient.addColorStop(0, '#4af626');
			hpGradient.addColorStop(1, '#2ed616');
		} else if (hpPercent > 0.3) {
			hpGradient.addColorStop(0, '#ffcc00');
			hpGradient.addColorStop(1, '#ff8800');
		} else {
			hpGradient.addColorStop(0, '#ff4444');
			hpGradient.addColorStop(1, '#cc0000');
		}
		renderer.ctx.fillStyle = hpGradient;
		renderer.ctx.fillRect(barX + padding, barY + padding, (barWidth - padding * 2) * hpPercent, barHeight - padding * 2);

		renderer.ctx.restore();
	}

	renderBossProgressBar(renderer, bossTimer, maxBossTimer, canvasWidth, engine = null, bossType = null) {
		const barWidth = 400;
		const barHeight = 20;
		const iconSize = 30;
		const barX = (canvasWidth - barWidth) / 2;
		const barY = 20;
		const padding = 2;

		renderer.ctx.save();

		const timerSeconds = Math.ceil(bossTimer / 1000);
		const minutes = Math.floor(timerSeconds / 60);
		const seconds = timerSeconds % 60;
		const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

		renderer.ctx.fillStyle = '#ff0000';
		renderer.ctx.font = 'bold 14px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 3;
		renderer.ctx.strokeText(`Boss dans ${timerText}`, canvasWidth / 2, barY - 5);
		renderer.ctx.fillText(`Boss dans ${timerText}`, canvasWidth / 2, barY - 5);

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
			const bossConfig = EnemyTypes[bossType];
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
		renderer.ctx.font = 'bold 14px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.textBaseline = 'middle';
		renderer.ctx.fillText(`Endless: ${timerText}`, canvasWidth / 2, barY + barHeight / 2);

		renderer.ctx.restore();
	}
}
