export default class HUDRenderer {
	constructor() {
		this.hudHeight = 80;
		this.padding = 15;
		
		this.barWidth = 300;
		this.barHeight = 18;
		this.statWidth = 70;
		this.statHeight = 50;
		this.elementHeight = 50;
	}

	render(renderer, player, canvasWidth, canvasHeight, survivalTime, bossTimer = null, maxBossTimer = null, selectedPokemon = null, engine = null, currentBoss = null) {
		if (!player) return;

		this.renderBackground(renderer, canvasWidth);
		this.renderPokemonIcon(renderer, player, selectedPokemon, engine);
		this.renderHealthBar(renderer, player);
		this.renderXPBar(renderer, player);
		this.renderMoney(renderer, player);
		
		if (currentBoss) {
			this.renderBossBar(renderer, canvasWidth, currentBoss, engine);
		} else if (bossTimer !== null && maxBossTimer !== null && bossTimer > 0) {
			this.renderBossProgressBar(renderer, canvasWidth, bossTimer, maxBossTimer);
		} else {
			this.renderTimer(renderer, canvasWidth, survivalTime);
		}
		
		this.renderStats(renderer, player, canvasWidth, bossTimer, maxBossTimer, currentBoss);

		this.renderSpells(renderer, player, canvasWidth, canvasHeight);
	}

	renderBackground(renderer, canvasWidth) {
		renderer.ctx.save();
		renderer.ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
		renderer.ctx.fillRect(0, 0, canvasWidth, this.hudHeight);
		
		const gradient = renderer.ctx.createLinearGradient(0, this.hudHeight - 1, 0, this.hudHeight);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.fillRect(0, this.hudHeight - 1, canvasWidth, 1);
		renderer.ctx.restore();
	}

	renderPokemonIcon(renderer, player, selectedPokemon, engine) {
		const iconSize = 50;
		const iconX = this.padding;
		const iconY = (this.hudHeight - iconSize) / 2;
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
		renderer.ctx.fillRect(iconX, iconY, iconSize, iconSize);
		
		renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(iconX + 0.5, iconY + 0.5, iconSize - 1, iconSize - 1);
		
		if (selectedPokemon && engine && engine.sprites) {
			const spriteKey = `${selectedPokemon}_normal`;
			let pokemonImage = engine.sprites.get(spriteKey);
			
			if (!pokemonImage) {
				const img = new Image();
				img.src = process.env.PUBLIC_URL + `/sprites/pokemon/${selectedPokemon}/Normal.png`;
				img.onload = () => {
					engine.sprites.sprites[spriteKey] = img;
				};
				pokemonImage = img;
			}
			
			if (pokemonImage && pokemonImage.complete && pokemonImage.naturalHeight > 0) {
				renderer.ctx.drawImage(pokemonImage, iconX + 2, iconY + 2, iconSize - 4, iconSize - 4);
			}
		}
		
		renderer.ctx.fillStyle = '#ffd700';
		renderer.ctx.font = 'bold 12px Pokemon';
		renderer.ctx.textAlign = 'right';
		renderer.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.shadowBlur = 2;
		renderer.ctx.fillText(`lv.${player.level}`, iconX + iconSize - 3, iconY + iconSize - 3);
		renderer.ctx.shadowBlur = 0;
		
		renderer.ctx.restore();
	}

	renderHealthBar(renderer, player) {
		const barsX = this.padding + 50 + 15;
		const barY = (this.hudHeight - this.barHeight * 2 - 6) / 2;
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
		renderer.ctx.fillRect(barsX, barY, this.barWidth, this.barHeight);
		renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(barsX + 0.5, barY + 0.5, this.barWidth - 1, this.barHeight - 1);
		
		const displayedHpPercent = player.displayedHp / player.maxHp;
		if (player.lostHp > 0) {
			renderer.ctx.fillStyle = '#ff6b6b';
			renderer.ctx.fillRect(barsX + 2, barY + 2, (this.barWidth - 4) * displayedHpPercent, this.barHeight - 4);
		}
		
		const hpPercent = player.hp / player.maxHp;
		const hpGradient = renderer.ctx.createLinearGradient(barsX, 0, barsX + this.barWidth * hpPercent, 0);
		if (hpPercent > 0.5) {
			hpGradient.addColorStop(0, '#4af626');
			hpGradient.addColorStop(1, '#2ed616');
		} else if (hpPercent > 0.25) {
			hpGradient.addColorStop(0, '#ffcc00');
			hpGradient.addColorStop(1, '#ff8800');
		} else {
			hpGradient.addColorStop(0, '#ff4444');
			hpGradient.addColorStop(1, '#cc0000');
		}
		renderer.ctx.fillStyle = hpGradient;
		renderer.ctx.fillRect(barsX + 2, barY + 2, (this.barWidth - 4) * hpPercent, this.barHeight - 4);
		
		
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.font = '11px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.shadowBlur = 3;
		renderer.ctx.fillText(`${Math.floor(player.hp)} / ${player.maxHp}`, barsX + this.barWidth / 2, barY + this.barHeight / 2 + 4);
		renderer.ctx.shadowBlur = 0;
		renderer.ctx.restore();
	}

	renderXPBar(renderer, player) {
		const barsX = this.padding + 50 + 15;
		const barY = (this.hudHeight - this.barHeight * 2 - 6) / 2 + this.barHeight + 6;
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
		renderer.ctx.fillRect(barsX, barY, this.barWidth, this.barHeight);
		renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(barsX + 0.5, barY + 0.5, this.barWidth - 1, this.barHeight - 1);
		
		const xpPercent = player.displayedXp / player.xpToNextLevel;
		const xpGradient = renderer.ctx.createLinearGradient(barsX, 0, barsX + this.barWidth * xpPercent, 0);
		xpGradient.addColorStop(0, '#4dd0e1');
		xpGradient.addColorStop(0.5, '#87CEEB');
		xpGradient.addColorStop(1, '#00BCD4');
		renderer.ctx.fillStyle = xpGradient;
		renderer.ctx.fillRect(barsX + 2, barY + 2, (this.barWidth - 4) * xpPercent, this.barHeight - 4);
		
		if (xpPercent > 0) {
			const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
			renderer.ctx.shadowColor = '#87CEEB';
			renderer.ctx.shadowBlur = 8 * pulse;
			renderer.ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * pulse})`;
			const glowWidth = Math.min(20, (this.barWidth - 4) * xpPercent);
			renderer.ctx.fillRect(barsX + 2 + (this.barWidth - 4) * xpPercent - glowWidth, barY + 2, glowWidth, this.barHeight - 4);
			renderer.ctx.shadowBlur = 0;
		}
		
		
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.font = '11px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.shadowBlur = 3;
		renderer.ctx.fillText(`${Math.floor(player.displayedXp)} / ${player.xpToNextLevel}`, barsX + this.barWidth / 2, barY + this.barHeight / 2 + 4);
		renderer.ctx.shadowBlur = 0;
		
		renderer.ctx.restore();
	}

	renderMoney(renderer, player) {
		const currencyX = this.padding + 50 + 15 + this.barWidth + 15;
		const currencyY = (this.hudHeight - this.statHeight) / 2;
		const currencyWidth = this.statWidth;
		const currencyHeight = this.statHeight;
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
		renderer.ctx.fillRect(currencyX, currencyY, currencyWidth, currencyHeight);
		renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(currencyX + 0.5, currencyY + 0.5, currencyWidth - 1, currencyHeight - 1);
		
		const moneyText = Math.floor(player.displayedMoney).toString();
		const symbolWidth = 20;
		const textWidth = renderer.ctx.measureText(moneyText).width;
		const totalWidth = symbolWidth + textWidth + 5;
		const startX = currencyX + (currencyWidth - totalWidth) / 2;
		
		renderer.ctx.fillStyle = '#ffd700';
		renderer.ctx.font = '16px Pokemon';
		renderer.ctx.textAlign = 'left';
		renderer.ctx.fillText('₽', startX, currencyY + currencyHeight / 2 + 5);
		
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.font = 'bold 12px Pokemon';
		renderer.ctx.textAlign = 'left';
		renderer.ctx.fillText(moneyText, startX + symbolWidth + 5, currencyY + currencyHeight / 2 + 5);
		
		renderer.ctx.restore();
	}

	renderStats(renderer, player, canvasWidth, bossTimer = null, maxBossTimer = null, currentBoss = null) {
		const compactStatWidth = 50;
		const compactStatHeight = this.elementHeight;
		const statSpacing = 5;
		
		const stats = [
			{ icon: '⚔', value: Math.floor(player.damage), color: '#ff6b6b' },
			{ icon: '⚡', value: player.attackSpeed.toFixed(1), color: '#ffcc00' },
			{ icon: '◎', value: Math.floor(player.range), color: '#4a9eff' },
			{ icon: '➤', value: player.speed.toFixed(1), color: '#4af626' },
			{ icon: '★', value: `${Math.floor(player.critChance * 100)}%`, color: '#ffd700' },
			{ icon: '✦', value: `${player.critDamage.toFixed(1)}x`, color: '#ff9100' }
		];
		
		const totalStatsWidth = stats.length * compactStatWidth + (stats.length - 1) * statSpacing;
		const statsStartX = canvasWidth - this.padding - totalStatsWidth;
		
		const statsY = (this.hudHeight - compactStatHeight) / 2;
		
		stats.forEach((stat, index) => {
			const x = statsStartX + index * (compactStatWidth + statSpacing);
			
			renderer.ctx.save();
			
			renderer.ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
			renderer.ctx.fillRect(x, statsY, compactStatWidth, compactStatHeight);
			renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
			renderer.ctx.lineWidth = 1;
			renderer.ctx.strokeRect(x + 0.5, statsY + 0.5, compactStatWidth - 1, compactStatHeight - 1);
			
			renderer.ctx.fillStyle = stat.color;
			renderer.ctx.font = '20px Pokemon';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.fillText(stat.icon, x + compactStatWidth / 2, statsY + 22);
			
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.font = 'bold 12px Pokemon';
			renderer.ctx.fillText(stat.value, x + compactStatWidth / 2, statsY + 40);
			
			renderer.ctx.restore();
		});
	}

	renderBossProgressBar(renderer, canvasWidth, bossTimer, maxBossTimer) {
		const progress = Math.max(0, Math.min(1, 1 - (bossTimer / maxBossTimer)));
		
		const compactStatWidth = 50;
		const statSpacing = 5;
		const statsCount = 6;
		const totalStatsWidth = statsCount * compactStatWidth + (statsCount - 1) * statSpacing;
		const statsStartX = canvasWidth - this.padding - totalStatsWidth;
		
		const barHeight = this.elementHeight;
		const barY = (this.hudHeight - barHeight) / 2;
		const barStartX = this.padding + 50 + 15 + this.barWidth + 15 + this.statWidth + 15;
		const barWidth = statsStartX - barStartX - 5;
		const barX = barStartX;
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
		renderer.ctx.fillRect(barX, barY, barWidth, barHeight);
		
		const progressGradient = renderer.ctx.createLinearGradient(barX, 0, barX + barWidth * progress, 0);
		progressGradient.addColorStop(0, '#cc0000');
		progressGradient.addColorStop(0.5, '#ff4444');
		progressGradient.addColorStop(1, '#ff6666');
		renderer.ctx.fillStyle = progressGradient;
		renderer.ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * progress, barHeight - 4);
		
		if (progress > 0) {
			const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
			renderer.ctx.shadowColor = '#ffd700';
			renderer.ctx.shadowBlur = 10 * pulse;
			renderer.ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * pulse})`;
			const glowWidth = Math.min(15, (barWidth - 4) * progress);
			renderer.ctx.fillRect(barX + 2 + (barWidth - 4) * progress - glowWidth, barY + 2, glowWidth, barHeight - 4);
			renderer.ctx.shadowBlur = 0;
		}
		
		renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(barX + 0.5, barY + 0.5, barWidth - 1, barHeight - 1);
		
		const minutes = Math.floor(bossTimer / 60000);
		const seconds = Math.floor((bossTimer % 60000) / 1000);
		const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
		
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.font = 'bold 16px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.shadowBlur = 3;
		renderer.ctx.fillText('BOSS', barX + barWidth / 2, barY + barHeight / 2 - 5);
		
		renderer.ctx.fillStyle = '#ff6666';
		renderer.ctx.font = 'bold 12px Pokemon';
		renderer.ctx.fillText(timeString, barX + barWidth / 2, barY + barHeight / 2 + 12);
		renderer.ctx.shadowBlur = 0;
		
		renderer.ctx.restore();
	}

	renderBossBar(renderer, canvasWidth, boss, engine) {
		const compactStatWidth = 50;
		const statSpacing = 5;
		const statsCount = 6;
		const totalStatsWidth = statsCount * compactStatWidth + (statsCount - 1) * statSpacing;
		const statsStartX = canvasWidth - this.padding - totalStatsWidth;
		
		const barHeight = this.elementHeight;
		const barY = (this.hudHeight - barHeight) / 2;
		const iconSize = 40;
		const iconX = this.padding + 50 + 15 + this.barWidth + 15 + this.statWidth + 15;
		const iconY = barY + (barHeight - iconSize) / 2;
		
		const hpBarX = iconX + iconSize + 10;
		const hpBarY = barY + 25;
		const hpBarWidth = statsStartX - hpBarX - 10;
		const hpBarHeight = 12;
		
		const barStartX = iconX - 5;
		const barTotalWidth = statsStartX - barStartX - 5;
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
		renderer.ctx.fillRect(barStartX, barY, barTotalWidth, barHeight);
		renderer.ctx.strokeStyle = 'rgba(255, 102, 102, 0.3)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(barStartX + 0.5, barY + 0.5, barTotalWidth - 1, barHeight - 1);
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
		renderer.ctx.fillRect(iconX, iconY, iconSize, iconSize);
		renderer.ctx.strokeStyle = 'rgba(255, 102, 102, 0.3)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(iconX + 0.5, iconY + 0.5, iconSize - 1, iconSize - 1);
		
		if (boss.pokemonConfig && engine && engine.sprites) {
			const pokemonName = boss.pokemonConfig.name;
			const spriteKey = `${pokemonName}_normal`;
			let pokemonImage = engine.sprites.get(spriteKey);
			
			if (!pokemonImage) {
				const img = new Image();
				img.src = process.env.PUBLIC_URL + `/sprites/pokemon/${pokemonName}/Normal.png`;
				img.onload = () => {
					engine.sprites.sprites[spriteKey] = img;
				};
				pokemonImage = img;
			}
			
			if (pokemonImage && pokemonImage.complete && pokemonImage.naturalHeight > 0) {
				renderer.ctx.drawImage(pokemonImage, iconX + 2, iconY + 2, iconSize - 4, iconSize - 4);
			}
		}
		
		const bossName = boss.pokemonConfig ? boss.pokemonConfig.name.toUpperCase() : 'BOSS';
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.font = 'bold 14px Pokemon';
		renderer.ctx.textAlign = 'left';
		renderer.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.shadowBlur = 2;
		renderer.ctx.fillText(bossName, hpBarX, hpBarY - 8);
		
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.font = '11px Pokemon';
		renderer.ctx.textAlign = 'right';
		renderer.ctx.fillText(`${Math.floor(boss.hp)} / ${boss.maxHp}`, hpBarX + hpBarWidth, hpBarY - 8);
		renderer.ctx.shadowBlur = 0;
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
		
		const displayedHpPercent = boss.displayedHp / boss.maxHp;
		if (boss.lostHp > 0) {
			renderer.ctx.fillStyle = '#ff6b6b';
			renderer.ctx.fillRect(hpBarX + 1, hpBarY + 1, (hpBarWidth - 2) * displayedHpPercent, hpBarHeight - 2);
		}
		
		const hpPercent = boss.hp / boss.maxHp;
		const hpGradient = renderer.ctx.createLinearGradient(hpBarX, 0, hpBarX + hpBarWidth * hpPercent, 0);
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
		renderer.ctx.fillRect(hpBarX + 1, hpBarY + 1, (hpBarWidth - 2) * hpPercent, hpBarHeight - 2);
		
		renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(hpBarX + 0.5, hpBarY + 0.5, hpBarWidth - 1, hpBarHeight - 1);
		
		renderer.ctx.restore();
	}

	renderTimer(renderer, canvasWidth, survivalTime) {
		const minutes = Math.floor(survivalTime / 60000);
		const seconds = Math.floor((survivalTime % 60000) / 1000);
		const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
		
		const compactStatWidth = 50;
		const statSpacing = 5;
		const statsCount = 6;
		const totalStatsWidth = statsCount * compactStatWidth + (statsCount - 1) * statSpacing;
		const statsStartX = canvasWidth - this.padding - totalStatsWidth;
		
		const timerHeight = this.elementHeight;
		const timerX = this.padding + 50 + 15 + this.barWidth + 15 + this.statWidth + 15;
		const timerY = (this.hudHeight - timerHeight) / 2;
		const timerWidth = statsStartX - timerX - 10;
		
		renderer.ctx.save();
		renderer.ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
		renderer.ctx.fillRect(timerX, timerY, timerWidth, timerHeight);
		renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(timerX + 0.5, timerY + 0.5, timerWidth - 1, timerHeight - 1);
		
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.font = 'bold 24px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.fillText(timeString, timerX + timerWidth / 2, timerY + timerHeight / 2 + 8);
		renderer.ctx.restore();
	}

	renderAttackMode(renderer, player, canvasWidth) {
		const modeWidth = 90;
		const modeHeight = 50;
		const timerWidth = 100;
		const modeX = canvasWidth - this.padding - timerWidth - 10 - modeWidth;
		const modeY = (this.hudHeight - modeHeight) / 2;
		
		const modeText = player.autoShoot ? 'AUTO' : 'MANUEL';
		const modeColor = player.autoShoot ? '#4af626' : '#ff6b6b';
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		renderer.ctx.fillRect(modeX, modeY, modeWidth, modeHeight);
		const strokeColor = modeColor === '#4af626' ? 'rgba(74, 246, 38, 0.4)' : 'rgba(255, 107, 107, 0.4)';
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(modeX + 0.5, modeY + 0.5, modeWidth - 1, modeHeight - 1);
		
		renderer.ctx.fillStyle = modeColor;
		renderer.ctx.font = 'bold 14px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.fillText(modeText, modeX + modeWidth / 2, modeY + modeHeight / 2 + 5);
		
		renderer.ctx.font = '9px Pokemon';
		renderer.ctx.fillStyle = '#aaa';
		renderer.ctx.fillText('SPACE', modeX + modeWidth / 2, modeY + 14);
		
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

	renderSpells(renderer, player, canvasWidth, canvasHeight) {
		const maxSpells = player.maxSpells || 3;
		const unlockedSpells = player.getUnlockedSpells();

		const spellSize = 60;
		const spellSpacing = 15;
		const totalWidth = maxSpells * spellSize + (maxSpells - 1) * spellSpacing;
		const startX = (canvasWidth - totalWidth) / 2;
		const spellY = canvasHeight - 100;

		for (let index = 0; index < maxSpells; index++) {
			const spellX = startX + index * (spellSize + spellSpacing);
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

	wrapText(ctx, text, maxWidth) {
		const words = text.split(' ');
		const lines = [];
		let currentLine = words[0];

		for (let i = 1; i < words.length; i++) {
			const word = words[i];
			const width = ctx.measureText(currentLine + ' ' + word).width;
			if (width < maxWidth) {
				currentLine += ' ' + word;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		}
		lines.push(currentLine);
		return lines;
	}
}

