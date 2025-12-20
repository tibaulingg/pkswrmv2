export default class HUDRenderer {
	constructor() {
		this.lineHeight = 25;
	}

	render(renderer, player, canvasWidth, canvasHeight, survivalTime, bossTimer = null, maxBossTimer = null, selectedPokemon = null, engine = null, currentBoss = null, mapData = null) {
		if (!player) return;

		this.renderSimpleHUD(renderer, player, canvasWidth, mapData, selectedPokemon, engine);
		this.renderSpells(renderer, player, canvasWidth, canvasHeight);
	}

	renderStatLine(renderer, x, y, label, value, fontSize, strokeOffset, strokeColor, labelColor, labelWidth) {
		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = labelColor;
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeText(label, x + strokeOffset, y + strokeOffset);
		renderer.ctx.fillText(label, x, y);
		
		const valueX = x + labelWidth + 2;

		renderer.ctx.font = `${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeText(value, valueX + strokeOffset, y + strokeOffset);
		renderer.ctx.fillText(value, valueX, y);
	}

	renderSimpleHUD(renderer, player, canvasWidth, mapData, selectedPokemon = null, engine = null) {
		const padding = 10;
		const y = padding;
		const fontSize = 16;
		const lineHeight = fontSize + 4;
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
			{ label: 'Lv', value: player.level.toString() },
			{ label: 'ATK', value: Math.floor(player.damage).toString() },
			{ label: 'SPD', value: player.speed.toFixed(1) },
			{ label: 'ASP', value: player.attackSpeed.toFixed(1) },
			{ label: 'RNG', value: Math.floor(player.range).toString() },
		];

		// Calculate max label width for stats alignment
		let maxLabelWidth = 0;
		stats.forEach((stat) => {
			renderer.ctx.font = `bold ${fontSize}px Pokemon`;
			const width = renderer.ctx.measureText(stat.label).width;
			if (width > maxLabelWidth) {
				maxLabelWidth = width;
			}
		});
		const labelWidth = maxLabelWidth;

		const barWidth = 200;
		const barHeight = fontSize;
		let currentX = padding;
		let currentY = y;

		// Line 1: Pokemon name + Level (e.g., "quaksire Lv. 5")
		if (selectedPokemon) {
			const pokemonName = selectedPokemon.charAt(0).toUpperCase() + selectedPokemon.slice(1);
			renderer.ctx.font = `bold ${fontSize}px Pokemon`;
			renderer.ctx.fillStyle = labelColor;
			renderer.ctx.strokeStyle = strokeColor;
			renderer.ctx.lineWidth = 1;
			renderer.ctx.strokeText(pokemonName, currentX + strokeOffset, currentY + strokeOffset);
			renderer.ctx.fillText(pokemonName, currentX, currentY);
			
			const pokemonNameWidth = renderer.ctx.measureText(pokemonName).width;
			currentX += pokemonNameWidth + 5;
			
			// Render "Lv."
			renderer.ctx.font = `bold ${fontSize}px Pokemon`;
			renderer.ctx.fillStyle = labelColor;
			const lvLabel = 'Lv.';
			renderer.ctx.strokeText(lvLabel, currentX + strokeOffset, currentY + strokeOffset);
			renderer.ctx.fillText(lvLabel, currentX, currentY);
			
			const lvLabelWidth = renderer.ctx.measureText(lvLabel).width;
			currentX += lvLabelWidth + 2;
			
			// Render level value
			renderer.ctx.font = `${fontSize}px Pokemon`;
			renderer.ctx.fillStyle = '#ffffff';
			const levelValue = player.level.toString();
			renderer.ctx.strokeText(levelValue, currentX + strokeOffset, currentY + strokeOffset);
			renderer.ctx.fillText(levelValue, currentX, currentY);
		}

		// Line 2: HP + HP values + HP bar
		currentY += lineHeight;
		currentX = padding;

		// Render pokemon icon to the left of HP
		if (selectedPokemon && engine) {
			const iconSize = lineHeight * 2; // Height of 2 lines
			const iconX = currentX;
			const iconY = currentY;
			const pokemonSprite = engine.sprites.get(`pokemon_${selectedPokemon}_normal`);
			
			if (pokemonSprite) {
				renderer.ctx.drawImage(pokemonSprite, iconX, iconY, iconSize, iconSize);
				
				// Draw white border around icon
				renderer.ctx.strokeStyle = '#ffffff';
				renderer.ctx.lineWidth = 2;
				renderer.ctx.strokeRect(iconX, iconY, iconSize, iconSize);
			}
			
			currentX += iconSize + 10; // Add spacing after icon
			
			// Reset stroke style after icon border
			renderer.ctx.strokeStyle = strokeColor;
			renderer.ctx.lineWidth = 1;
		}

		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = labelColor;
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		const hpLabel = 'HP';
		renderer.ctx.strokeText(hpLabel, currentX + strokeOffset, currentY + strokeOffset);
		renderer.ctx.fillText(hpLabel, currentX, currentY);
		
		const hpLabelWidth = renderer.ctx.measureText(hpLabel).width;
		currentX += hpLabelWidth + 2;

		// Calculate max width for HP values (use "999" as reference for 3-digit numbers)
		renderer.ctx.font = `${fontSize}px Pokemon`;
		const maxHpValueWidth = renderer.ctx.measureText('999').width;
		const currentHpText = Math.floor(player.hp).toString();
		const currentHpWidth = renderer.ctx.measureText(currentHpText).width;
		const currentHpX = currentX + maxHpValueWidth - currentHpWidth; // Right-align
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeText(currentHpText, currentHpX + strokeOffset, currentY + strokeOffset);
		renderer.ctx.fillText(currentHpText, currentHpX, currentY);
		
		currentX += maxHpValueWidth + 2;

		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = labelColor;
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		const slashText = '/';
		renderer.ctx.strokeText(slashText, currentX + strokeOffset, currentY + strokeOffset);
		renderer.ctx.fillText(slashText, currentX, currentY);
		
		const slashWidth = renderer.ctx.measureText(slashText).width;
		currentX += slashWidth + 2;

		renderer.ctx.font = `${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		const maxHpText = Math.floor(player.maxHp).toString();
		const maxHpX = currentX; // Left-align, collé au "/"
		renderer.ctx.strokeText(maxHpText, maxHpX + strokeOffset, currentY + strokeOffset);
		renderer.ctx.fillText(maxHpText, maxHpX, currentY);
		
		currentX += maxHpValueWidth + 15;

		const barX = currentX;
		const barY = currentY;

		const hpPercent = Math.max(0, Math.min(1, player.hp / player.maxHp));
		const filledWidth = barWidth * hpPercent;

		renderer.ctx.fillStyle = barRed;
		renderer.ctx.fillRect(barX, barY, barWidth, barHeight);

		renderer.ctx.fillStyle = barGreen;
		renderer.ctx.fillRect(barX, barY, filledWidth, barHeight);

		renderer.ctx.strokeStyle = '#ffffff';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.moveTo(barX, barY);
		renderer.ctx.lineTo(barX + barWidth, barY);
		renderer.ctx.stroke();

		renderer.ctx.beginPath();
		renderer.ctx.moveTo(barX, barY + barHeight);
		renderer.ctx.lineTo(barX + barWidth, barY + barHeight);
		renderer.ctx.stroke();
		
		// Reset stroke style to black for text rendering
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;

		// Line 3: XP + XP values + XP bar (exact same style as HP)
		currentY += lineHeight;
		currentX = padding;

		// Apply same offset as HP line (for icon alignment)
		if (selectedPokemon && engine) {
			const iconSize = lineHeight * 2;
			currentX += iconSize + 10; // Same spacing as HP line
		}

		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = labelColor;
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		const xpLabel = 'XP';
		renderer.ctx.strokeText(xpLabel, currentX + strokeOffset, currentY + strokeOffset);
		renderer.ctx.fillText(xpLabel, currentX, currentY);
		
		const xpLabelWidth = renderer.ctx.measureText(xpLabel).width;
		currentX += xpLabelWidth + 2;

		// Calculate max width for XP values (use "999" as reference for 3-digit numbers)
		renderer.ctx.font = `${fontSize}px Pokemon`;
		const maxXpValueWidth = renderer.ctx.measureText('999').width;
		const currentXpText = Math.floor(player.displayedXp).toString();
		const currentXpWidth = renderer.ctx.measureText(currentXpText).width;
		const currentXpX = currentX + maxXpValueWidth - currentXpWidth; // Right-align
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		renderer.ctx.strokeText(currentXpText, currentXpX + strokeOffset, currentY + strokeOffset);
		renderer.ctx.fillText(currentXpText, currentXpX, currentY);
		
		currentX += maxXpValueWidth + 2;

		renderer.ctx.font = `bold ${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = labelColor;
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		const xpSlashText = '/';
		renderer.ctx.strokeText(xpSlashText, currentX + strokeOffset, currentY + strokeOffset);
		renderer.ctx.fillText(xpSlashText, currentX, currentY);
		
		const xpSlashWidth = renderer.ctx.measureText(xpSlashText).width;
		currentX += xpSlashWidth + 2;

		renderer.ctx.font = `${fontSize}px Pokemon`;
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;
		const maxXpText = Math.floor(player.xpToNextLevel).toString();
		const maxXpX = currentX; // Left-align, collé au "/"
		renderer.ctx.strokeText(maxXpText, maxXpX + strokeOffset, currentY + strokeOffset);
		renderer.ctx.fillText(maxXpText, maxXpX, currentY);
		
		currentX += maxXpValueWidth + 15;

		const xpBarX = currentX;
		const xpBarY = currentY;

		const xpPercent = Math.max(0, Math.min(1, player.displayedXp / player.xpToNextLevel));
		const xpFilledWidth = barWidth * xpPercent;

		renderer.ctx.fillStyle = barXpEmpty;
		renderer.ctx.fillRect(xpBarX, xpBarY, barWidth, barHeight);

		renderer.ctx.fillStyle = barXpBlue;
		renderer.ctx.fillRect(xpBarX, xpBarY, xpFilledWidth, barHeight);

		renderer.ctx.strokeStyle = '#ffffff';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.beginPath();
		renderer.ctx.moveTo(xpBarX, xpBarY);
		renderer.ctx.lineTo(xpBarX + barWidth, xpBarY);
		renderer.ctx.stroke();

		renderer.ctx.beginPath();
		renderer.ctx.moveTo(xpBarX, xpBarY + barHeight);
		renderer.ctx.lineTo(xpBarX + barWidth, xpBarY + barHeight);
		renderer.ctx.stroke();
		
		// Reset stroke style to black for text rendering
		renderer.ctx.strokeStyle = strokeColor;
		renderer.ctx.lineWidth = 1;


		// Render other stats (ATK, SPD, ASP, RNG) below
		currentY += lineHeight;
		currentX = padding;

		stats.slice(1).forEach((stat) => {
			this.renderStatLine(renderer, currentX, currentY, stat.label, stat.value, fontSize, strokeOffset, strokeColor, labelColor, labelWidth);
			currentY += lineHeight;
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
}
