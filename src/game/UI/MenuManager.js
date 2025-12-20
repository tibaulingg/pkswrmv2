export default class MenuManager {
	constructor(engine) {
		this.engine = engine;
		this.activeMenu = null;
		this.selectedIndex = 0;
		this.originalMusicVolume = null;
	}

	openMenu(menuData) {
		this.engine.input.clearInput();
		
		if (!this.activeMenu && !menuData.isMainMenu) {
			this.originalMusicVolume = this.engine.audio.musicVolume;
			this.engine.audio.setMusicVolume(this.originalMusicVolume * 0.5);
		}
		
		this.activeMenu = menuData;
		this.selectedIndex = 0;
		this.triggerHover();
	}

	closeMenu() {
		if (this.activeMenu && this.originalMusicVolume !== null) {
			this.engine.audio.setMusicVolume(this.originalMusicVolume);
			this.originalMusicVolume = null;
		}
		
		this.activeMenu = null;
		this.selectedIndex = 0;
	}

	isMenuOpen() {
		return this.activeMenu !== null;
	}

	update() {
		if (!this.activeMenu) return;

		const key = this.engine.input.consumeLastKey();
		if (!key) return;

		if (key === 'Escape' && this.activeMenu.closeable) {
			const onCloseCallback = this.activeMenu.onClose;
			this.closeMenu();
			if (onCloseCallback) {
				onCloseCallback(this.engine);
			}
		} else if (key === 'ArrowUp' || key === 'KeyW') {
			if (this.selectedIndex > 0) {
				let prevIndex = this.selectedIndex - 1;
				while (prevIndex >= 0 && this.activeMenu.options[prevIndex]?.disabled) {
					prevIndex--;
				}
				if (prevIndex >= 0) {
					this.selectedIndex = prevIndex;
					this.triggerHover();
				}
			}
		} else if (key === 'ArrowDown' || key === 'KeyS') {
			let nextIndex = (this.selectedIndex + 1) % this.activeMenu.options.length;
			while (this.activeMenu.options[nextIndex]?.disabled && nextIndex !== this.selectedIndex) {
				nextIndex = (nextIndex + 1) % this.activeMenu.options.length;
			}
			this.selectedIndex = nextIndex;
			this.triggerHover();
		} else if (key === 'Enter' || key === 'Space') {
			const option = this.activeMenu.options[this.selectedIndex];
			if (option && option.action && !option.disabled) {
				this.engine.audio.play('ok', 0.3, 0.2);
				option.action(this.engine);
			}
		}
	}

	triggerHover() {
		if (!this.activeMenu) return;
		const option = this.activeMenu.options[this.selectedIndex];
		if (option && option.onHover) {
			option.onHover(this.engine);
		}
	}

	drawTextWithOutline(renderer, text, x, y, fontSize, fillColor, align = 'left', outlineColor = '#000', outlineOffset = 1) {
		renderer.ctx.font = fontSize + ' Pokemon';
		renderer.ctx.textAlign = align;
		
		renderer.ctx.fillStyle = outlineColor;
		renderer.ctx.fillText(text, x, y);
		
		renderer.ctx.fillStyle = fillColor;
		renderer.ctx.fillText(text, x - outlineOffset, y - outlineOffset);
	}

	drawTriangle(renderer, x, y, size, color, direction = 'right') {
		renderer.ctx.save();
		renderer.ctx.fillStyle = color;
		renderer.ctx.beginPath();
		
		if (direction === 'right') {
			renderer.ctx.moveTo(x, y);
			renderer.ctx.lineTo(x - size, y - size / 2);
			renderer.ctx.lineTo(x - size, y + size / 2);
		} else if (direction === 'left') {
			renderer.ctx.moveTo(x, y);
			renderer.ctx.lineTo(x + size, y - size / 2);
			renderer.ctx.lineTo(x + size, y + size / 2);
		}
		
		renderer.ctx.closePath();
		renderer.ctx.fill();
		renderer.ctx.restore();
	}

	drawMenuBox(renderer, x, y, width, height) {
		const backgroundColor = 'rgba(32, 72, 104, 0.90)';
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = backgroundColor;
		renderer.ctx.fillRect(x, y, width, height);
		
		renderer.ctx.restore();
	}

	render(renderer) {
		if (!this.activeMenu) return;

		const style = this.activeMenu.style || 'right';

		if (style === 'center') {
			this.renderCenterMenu(renderer);
		} else if (style === 'left') {
			this.renderLeftMenu(renderer);
		} else {
			this.renderRightMenu(renderer);
		}
	}

	renderCenterMenu(renderer) {
		const hasVictoryData = this.activeMenu.victoryData !== undefined && this.activeMenu.victoryData !== null;
		const width = hasVictoryData ? 700 : 450;
		const itemHeight = 50;
		const itemSpacing = 10;
		const padding = 20;
		const titleHeight = 60;
		const statSpacing = 35;
		let statCount = 0;
		let pokemonIconsHeight = 0;
		if (hasVictoryData) {
			statCount = 3;
			if (this.activeMenu.victoryData.enemiesKilled !== undefined) {
				statCount += 1;
			}
			if (this.activeMenu.victoryData.killerPokemon && !this.activeMenu.title.includes('VICTOIRE')) {
				statCount += 1;
			}
			if (this.activeMenu.victoryData.defeatedPokemonCounts) {
				const pokemonEntries = Object.entries(this.activeMenu.victoryData.defeatedPokemonCounts)
					.filter(([name, count]) => count > 0);
				if (pokemonEntries.length > 0) {
					statCount += 1;
					const iconSize = 28;
					const iconSpacing = 5;
					const maxIconsPerRow = 6;
					const rows = Math.ceil(pokemonEntries.length / maxIconsPerRow);
					pokemonIconsHeight = rows * (iconSize + iconSpacing) + 20;
				}
			}
		}
		const statsHeight = hasVictoryData ? (statCount * statSpacing + padding + pokemonIconsHeight) : 0;
		const buttonsHeight = hasVictoryData ? (itemHeight * 2 + itemSpacing) : (this.activeMenu.options.length * (itemHeight + itemSpacing));
		const height = titleHeight + statsHeight + buttonsHeight + padding * 3;
		
		const x = (renderer.width - width) / 2;
		const y = (renderer.height - height) / 2;

		renderer.drawRect(0, 0, renderer.width, renderer.height, 'rgba(0, 0, 0, 0.6)');
		
		this.drawMenuBox(renderer, x, y, width, height);

		const titleY = y + padding + 30;
		this.drawTextWithOutline(renderer, this.activeMenu.title, x + padding, titleY, '28px', '#fff', 'left');
		
		if (hasVictoryData) {
			const statsY = y + titleHeight + padding * 2;
			const stats = this.activeMenu.victoryData;
			
			let currentY = statsY;
			
			this.drawTextWithOutline(renderer, 'Temps:', x + padding, currentY, '18px', '#aaa', 'left');
			this.drawTextWithOutline(renderer, stats.time, x + width - padding, currentY, '18px', '#fff', 'right');
			
			currentY += statSpacing;
			this.drawTextWithOutline(renderer, 'Niveau:', x + padding, currentY, '18px', '#aaa', 'left');
			this.drawTextWithOutline(renderer, stats.level.toString(), x + width - padding, currentY, '18px', '#fff', 'right');
			
			currentY += statSpacing;
			this.drawTextWithOutline(renderer, 'Argent gagné:', x + padding, currentY, '18px', '#aaa', 'left');
			this.drawTextWithOutline(renderer, `₽${Math.floor(stats.money)}`, x + width - padding, currentY, '18px', '#fff', 'right');
			
			if (stats.enemiesKilled !== undefined) {
				currentY += statSpacing;
				this.drawTextWithOutline(renderer, 'Ennemis tués:', x + padding, currentY, '18px', '#aaa', 'left');
				this.drawTextWithOutline(renderer, stats.enemiesKilled.toString(), x + width - padding, currentY, '18px', '#fff', 'right');
			}

			if (stats.killerPokemon && !this.activeMenu.title.includes('VICTOIRE')) {
				currentY += statSpacing;
				this.drawTextWithOutline(renderer, 'Tué par:', x + padding, currentY, '18px', '#aaa', 'left');
				
				const iconSize = 32;
				const iconX = x + width - padding - iconSize;
				const iconY = currentY - iconSize / 2 + 9;
				
				renderer.ctx.save();
				renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
				renderer.ctx.fillRect(iconX, iconY, iconSize, iconSize);
				renderer.ctx.strokeStyle = '#ff6666';
				renderer.ctx.lineWidth = 2;
				renderer.ctx.strokeRect(iconX, iconY, iconSize, iconSize);
				
				const spriteKey = `${stats.killerPokemon}_normal`;
				let pokemonImage = this.engine.sprites.get(spriteKey);
				
				if (!pokemonImage) {
					const img = new Image();
					img.src = process.env.PUBLIC_URL + `/sprites/pokemon/${stats.killerPokemon}/Normal.png`;
					img.onload = () => {
						this.engine.sprites.sprites[spriteKey] = img;
					};
					pokemonImage = img;
				}
				
				if (pokemonImage && pokemonImage.complete && pokemonImage.naturalHeight > 0) {
					renderer.ctx.drawImage(pokemonImage, iconX + 2, iconY + 2, iconSize - 4, iconSize - 4);
				}
				
				renderer.ctx.restore();
			}
			
			if (stats.defeatedPokemonCounts) {
				const pokemonEntries = Object.entries(stats.defeatedPokemonCounts)
					.filter(([name, count]) => count > 0)
					.sort((a, b) => b[1] - a[1]);
				
				if (pokemonEntries.length > 0) {
					currentY += statSpacing;
					
					const iconSize = 28;
					const iconSpacing = 5;
					const maxIconsPerRow = 6;
					let currentRow = 0;
					let currentCol = 0;
					
					pokemonEntries.forEach(([pokemonName, count]) => {
						const iconX = x + padding + currentCol * (iconSize + iconSpacing);
						const iconY = currentY + currentRow * (iconSize + iconSpacing);
						
						renderer.ctx.save();
						renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
						renderer.ctx.fillRect(iconX, iconY, iconSize, iconSize);
						renderer.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
						renderer.ctx.lineWidth = 1;
						renderer.ctx.strokeRect(iconX + 0.5, iconY + 0.5, iconSize - 1, iconSize - 1);
						
						const spriteKey = `${pokemonName}_normal`;
						let pokemonImage = this.engine.sprites.get(spriteKey);
						
						if (!pokemonImage) {
							const img = new Image();
							img.src = process.env.PUBLIC_URL + `/sprites/pokemon/${pokemonName}/Normal.png`;
							img.onload = () => {
								this.engine.sprites.sprites[spriteKey] = img;
							};
							pokemonImage = img;
						}
						
						if (pokemonImage && pokemonImage.complete && pokemonImage.naturalHeight > 0) {
							renderer.ctx.drawImage(pokemonImage, iconX + 2, iconY + 2, iconSize - 4, iconSize - 4);
						}
						
						renderer.ctx.fillStyle = '#fff';
						renderer.ctx.font = 'bold 12px Pokemon';
						renderer.ctx.textAlign = 'center';
						renderer.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
						renderer.ctx.shadowBlur = 2;
						this.drawTextWithOutline(renderer, count.toString(), iconX + iconSize / 2, iconY + iconSize + 14, '12px', '#fff', 'center');
						renderer.ctx.shadowBlur = 0;
						
						renderer.ctx.restore();
						
						currentCol++;
						if (currentCol >= maxIconsPerRow) {
							currentCol = 0;
							currentRow++;
						}
					});
					
					currentY += currentRow * (iconSize + iconSpacing) + 20;
				}
			}
		}

		const lastIndex = this.activeMenu.options.length - 1;
		const mainOptions = this.activeMenu.options.slice(0, -1);
		const lastOption = this.activeMenu.options[lastIndex];

		const lastItemY = y + height - padding - 20;
		const startY = lastItemY - mainOptions.length * (itemHeight + itemSpacing);

		mainOptions.forEach((option, index) => {
			const itemY = startY + index * (itemHeight + itemSpacing);
			
			if (index === this.selectedIndex && !option.disabled) {
				renderer.drawRect(x + padding, itemY - 35, width - padding * 2, itemHeight, 'rgba(255, 255, 255, 0.15)');
				this.drawTextWithOutline(renderer, '▶', x + padding, itemY, '16px', '#fff', 'left');
			}
			
			let color;
			if (option.disabled) {
				color = '#444';
			} else {
				color = index === this.selectedIndex ? '#fff' : '#888';
			}
			this.drawTextWithOutline(renderer, option.label, x + padding + 20, itemY, '22px', color, 'left');
		});

		if (lastIndex === this.selectedIndex) {
			renderer.drawRect(x + padding, lastItemY - 35, width - padding * 2, itemHeight, 'rgba(255, 100, 100, 0.2)');
			this.drawTextWithOutline(renderer, '▶', x + padding, lastItemY, '16px', '#ff6666', 'left');
		}
		
		const lastColor = lastIndex === this.selectedIndex ? '#ff6666' : '#aa5555';
		this.drawTextWithOutline(renderer, lastOption.label, x + padding + 20, lastItemY, '22px', lastColor, 'left');
	}

	renderRightMenu(renderer) {
		const width = renderer.width / 4;
		const height = renderer.height;
		const x = renderer.width - width;
		const y = 0;
		const padding = 20;

		this.drawMenuBox(renderer, x, y, width, height);

		const titleY = 60;
		this.drawTextWithOutline(renderer, this.activeMenu.title, x + padding, titleY, '28px', '#fff', 'left');

		const startY = 150;
		const itemHeight = 50;
		const itemSpacing = 10;

		const lastIndex = this.activeMenu.options.length - 1;
		const mainOptions = this.activeMenu.options.slice(0, -1);
		const lastOption = this.activeMenu.options[lastIndex];

		mainOptions.forEach((option, index) => {
			const itemY = startY + index * (itemHeight + itemSpacing);
			
			if (index === this.selectedIndex && !option.disabled) {
				renderer.drawRect(x + padding, itemY - 35, width - padding * 2, itemHeight, 'rgba(255, 255, 255, 0.15)');
				this.drawTextWithOutline(renderer, '▶', x + padding, itemY, '16px', '#fff', 'left');
			}
			
			let color;
			if (option.disabled) {
				color = '#444';
			} else {
				color = index === this.selectedIndex ? '#fff' : '#888';
			}
			this.drawTextWithOutline(renderer, option.label, x + padding + 20, itemY, '22px', color, 'left');
		});

		const lastItemY = height - padding - 20;
		if (lastIndex === this.selectedIndex) {
			renderer.drawRect(x + padding, lastItemY - 35, width - padding * 2, itemHeight, 'rgba(255, 100, 100, 0.2)');
			this.drawTextWithOutline(renderer, '▶', x + padding, lastItemY, '16px', '#ff6666', 'left');
		}
		
		const lastColor = lastIndex === this.selectedIndex ? '#ff6666' : '#aa5555';
		this.drawTextWithOutline(renderer, lastOption.label, x + padding + 20, lastItemY, '22px', lastColor, 'left');
	}

	renderLeftMenu(renderer) {
		const width = renderer.width / 4;
		const height = renderer.height;
		const x = 0;
		const y = 0;
		const padding = 20;

		this.drawMenuBox(renderer, x, y, width, height);

		const titleY = 60;
		this.drawTextWithOutline(renderer, this.activeMenu.title, x + padding, titleY, '28px', '#fff', 'left');

		const startY = 150;
		const itemHeight = 50;
		const itemSpacing = 10;

		const lastIndex = this.activeMenu.options.length - 1;
		const mainOptions = this.activeMenu.options.slice(0, -1);
		const lastOption = this.activeMenu.options[lastIndex];

		mainOptions.forEach((option, index) => {
			const itemY = startY + index * (itemHeight + itemSpacing);
			
			if (index === this.selectedIndex && !option.disabled) {
				renderer.drawRect(x + padding, itemY - 35, width - padding * 2, itemHeight, 'rgba(255, 255, 255, 0.15)');
				this.drawTextWithOutline(renderer, '▶', x + padding, itemY, '16px', '#fff', 'left');
			}
			
			let color;
			if (option.disabled) {
				color = '#444';
			} else {
				color = index === this.selectedIndex ? '#fff' : '#888';
			}
			this.drawTextWithOutline(renderer, option.label, x + padding + 20, itemY, '22px', color, 'left');
		});

		const lastItemY = height - padding - 20;
		if (lastIndex === this.selectedIndex) {
			renderer.drawRect(x + padding, lastItemY - 35, width - padding * 2, itemHeight, 'rgba(255, 100, 100, 0.2)');
			this.drawTextWithOutline(renderer, '▶', x + padding, lastItemY, '16px', '#ff6666', 'left');
		}
		
		const lastColor = lastIndex === this.selectedIndex ? '#ff6666' : '#aa5555';
		this.drawTextWithOutline(renderer, lastOption.label, x + padding + 20, lastItemY, '22px', lastColor, 'left');
	}
}

