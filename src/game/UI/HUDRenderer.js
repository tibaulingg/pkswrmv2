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

	render(renderer, player, canvasWidth, canvasHeight, survivalTime, bossTimer = null, maxBossTimer = null, selectedPokemon = null, engine = null) {
		if (!player) return;

		this.renderBackground(renderer, canvasWidth);
		this.renderPokemonIcon(renderer, player, selectedPokemon, engine);
		this.renderHealthBar(renderer, player);
		this.renderXPBar(renderer, player);
		this.renderMoney(renderer, player);
		
		if (bossTimer !== null && maxBossTimer !== null && bossTimer > 0) {
			this.renderBossProgressBar(renderer, canvasWidth, bossTimer, maxBossTimer);
		} else {
			this.renderTimer(renderer, canvasWidth, survivalTime);
		}
		
		this.renderStats(renderer, player, canvasWidth, bossTimer, maxBossTimer);

		this.renderSpells(renderer, player, canvasWidth, canvasHeight);
	}

	renderBackground(renderer, canvasWidth) {
		renderer.ctx.save();
		const gradient = renderer.ctx.createLinearGradient(0, 0, 0, this.hudHeight);
		gradient.addColorStop(0, 'rgba(20, 20, 30, 0.95)');
		gradient.addColorStop(1, 'rgba(15, 15, 25, 0.85)');
		renderer.ctx.fillStyle = gradient;
		renderer.ctx.fillRect(0, 0, canvasWidth, this.hudHeight);
		
		renderer.ctx.strokeStyle = 'rgba(100, 100, 120, 0.3)';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.moveTo(0, this.hudHeight);
		renderer.ctx.lineTo(canvasWidth, this.hudHeight);
		renderer.ctx.stroke();
		renderer.ctx.restore();
	}

	renderPokemonIcon(renderer, player, selectedPokemon, engine) {
		const iconSize = 50;
		const iconX = this.padding;
		const iconY = (this.hudHeight - iconSize) / 2;
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
		renderer.ctx.fillRect(iconX, iconY, iconSize, iconSize);
		
		renderer.ctx.strokeStyle = '#ffd700';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.strokeRect(iconX, iconY, iconSize, iconSize);
		
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
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
		renderer.ctx.fillRect(barsX, barY, this.barWidth, this.barHeight);
		
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
		
		renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(barsX, barY, this.barWidth, this.barHeight);
		
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
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
		renderer.ctx.fillRect(barsX, barY, this.barWidth, this.barHeight);
		
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
		
		renderer.ctx.strokeStyle = 'rgba(135, 206, 235, 0.5)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(barsX, barY, this.barWidth, this.barHeight);
		
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
		const halfHeight = (this.statHeight - 2);
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		renderer.ctx.fillRect(currencyX, currencyY, currencyWidth, halfHeight);
		renderer.ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(currencyX, currencyY, currencyWidth, halfHeight);
		
		renderer.ctx.fillStyle = '#ffd700';
		renderer.ctx.font = '16px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.fillText('₽', currencyX + currencyWidth / 2, currencyY + 22);
		
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.font = 'bold 12px Pokemon';
		renderer.ctx.fillText(Math.floor(player.displayedMoney), currencyX + currencyWidth / 2, currencyY  + 42);
		
	
		renderer.ctx.restore();
	}

	renderStats(renderer, player, canvasWidth, bossTimer = null, maxBossTimer = null) {
		const compactStatWidth = 50;
		const compactStatHeight = this.elementHeight;
		const statSpacing = 5;
		
		let statsStartX;
		if (bossTimer !== null && maxBossTimer !== null && bossTimer > 0) {
			const barWidth = 300;
			const barX = (canvasWidth - barWidth) / 2;
			statsStartX = barX + barWidth + 10;
		} else {
			const timerWidth = 100;
			const timerX = (canvasWidth - timerWidth) / 2;
			statsStartX = timerX + timerWidth + 10;
		}
		
		const statsY = (this.hudHeight - compactStatHeight) / 2;
		
		const stats = [
			{ icon: '⚔', value: Math.floor(player.damage), color: '#ff6b6b' },
			{ icon: '⚡', value: player.attackSpeed.toFixed(1), color: '#ffcc00' },
			{ icon: '◎', value: Math.floor(player.range), color: '#4a9eff' },
			{ icon: '➤', value: player.speed.toFixed(1), color: '#4af626' },
			{ icon: '★', value: `${Math.floor(player.critChance * 100)}%`, color: '#ffd700' },
			{ icon: '✦', value: `${player.critDamage.toFixed(1)}x`, color: '#ff9100' }
		];
		
		stats.forEach((stat, index) => {
			const x = statsStartX + index * (compactStatWidth + statSpacing);
			
			renderer.ctx.save();
			
			renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			renderer.ctx.fillRect(x, statsY, compactStatWidth, compactStatHeight);
			renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
			renderer.ctx.lineWidth = 1;
			renderer.ctx.strokeRect(x, statsY, compactStatWidth, compactStatHeight);
			
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
		
		const barWidth = 300;
		const barHeight = this.elementHeight;
		const barX = (canvasWidth - barWidth) / 2;
		const barY = (this.hudHeight - barHeight) / 2;
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
		renderer.ctx.fillRect(barX, barY, barWidth, barHeight);
		
		const progressGradient = renderer.ctx.createLinearGradient(barX, 0, barX + barWidth * progress, 0);
		progressGradient.addColorStop(0, '#ff4444');
		progressGradient.addColorStop(0.5, '#ff8800');
		progressGradient.addColorStop(1, '#ffd700');
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
		
		renderer.ctx.strokeStyle = '#ffd700';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.strokeRect(barX, barY, barWidth, barHeight);
		
		renderer.ctx.fillStyle = '#fff';
		renderer.ctx.font = 'bold 16px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.shadowBlur = 3;
		renderer.ctx.fillText('BOSS', barX + barWidth / 2, barY + barHeight / 2 + 5);
		renderer.ctx.shadowBlur = 0;
		
		renderer.ctx.restore();
	}

	renderTimer(renderer, canvasWidth, survivalTime) {
		const minutes = Math.floor(survivalTime / 60000);
		const seconds = Math.floor((survivalTime % 60000) / 1000);
		const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
		
		const timerWidth = 100;
		const timerHeight = this.elementHeight;
		const timerX = (canvasWidth - timerWidth) / 2;
		const timerY = (this.hudHeight - timerHeight) / 2;
		
		renderer.ctx.save();
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		renderer.ctx.fillRect(timerX, timerY, timerWidth, timerHeight);
		renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeRect(timerX, timerY, timerWidth, timerHeight);
		
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
		renderer.ctx.strokeStyle = modeColor;
		renderer.ctx.lineWidth = 2;
		renderer.ctx.strokeRect(modeX, modeY, modeWidth, modeHeight);
		
		renderer.ctx.fillStyle = modeColor;
		renderer.ctx.font = 'bold 14px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.fillText(modeText, modeX + modeWidth / 2, modeY + modeHeight / 2 + 5);
		
		renderer.ctx.font = '9px Pokemon';
		renderer.ctx.fillStyle = '#aaa';
		renderer.ctx.fillText('SPACE', modeX + modeWidth / 2, modeY + 14);
		
		renderer.ctx.restore();
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

			renderer.ctx.save();

			renderer.ctx.fillStyle = isEmpty ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)';
			renderer.ctx.fillRect(spellX, spellY, spellSize, spellSize);
			
			if (isEmpty) {
				renderer.ctx.strokeStyle = '#444';
				renderer.ctx.lineWidth = 2;
				renderer.ctx.setLineDash([5, 5]);
				renderer.ctx.strokeRect(spellX, spellY, spellSize, spellSize);
				renderer.ctx.setLineDash([]);

				renderer.ctx.fillStyle = '#666';
				renderer.ctx.font = '24px Pokemon';
				renderer.ctx.textAlign = 'center';
				renderer.ctx.fillText('?', spellX + spellSize / 2, spellY + spellSize / 2 + 8);
			} else {
				const isOnCooldown = spell.cooldown > 0;
				const cooldownPercent = isOnCooldown ? spell.cooldown / spell.cooldownMax : 0;

				renderer.ctx.strokeStyle = isOnCooldown ? '#666' : '#ab47bc';
				renderer.ctx.lineWidth = 3;
				renderer.ctx.strokeRect(spellX, spellY, spellSize, spellSize);

				if (isOnCooldown) {
					renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
					renderer.ctx.fillRect(spellX, spellY, spellSize, spellSize);

					renderer.ctx.fillStyle = '#ab47bc';
					renderer.ctx.font = 'bold 20px Pokemon';
					renderer.ctx.textAlign = 'center';
					const cooldownSeconds = Math.ceil(spell.cooldown / 1000);
					renderer.ctx.fillText(cooldownSeconds.toString(), spellX + spellSize / 2, spellY + spellSize / 2 + 7);

					const arcStart = -Math.PI / 2;
					const arcEnd = arcStart + (2 * Math.PI * (1 - cooldownPercent));
					renderer.ctx.strokeStyle = '#ab47bc';
					renderer.ctx.lineWidth = 4;
					renderer.ctx.beginPath();
					renderer.ctx.arc(
						spellX + spellSize / 2,
						spellY + spellSize / 2,
						spellSize / 2 - 2,
						arcStart,
						arcEnd
					);
					renderer.ctx.stroke();
				} else {
					renderer.ctx.fillStyle = '#ab47bc';
					renderer.ctx.font = '32px Pokemon';
					renderer.ctx.textAlign = 'center';
					renderer.ctx.fillText('✨', spellX + spellSize / 2, spellY + spellSize / 2 + 10);
				}

				renderer.ctx.fillStyle = '#fff';
				renderer.ctx.font = '12px Pokemon';
				renderer.ctx.textAlign = 'center';
				const nameLines = this.wrapText(renderer.ctx, spell.name, spellSize - 10);
				nameLines.forEach((line, i) => {
					renderer.ctx.fillText(line, spellX + spellSize / 2, spellY + spellSize + 15 + i * 14);
				});
			}

			const keyText = `${index + 1}`;
			renderer.ctx.fillStyle = isEmpty ? '#555' : '#aaa';
			renderer.ctx.font = '10px Pokemon';
			renderer.ctx.fillText(keyText, spellX + spellSize - 8, spellY + 12);

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

