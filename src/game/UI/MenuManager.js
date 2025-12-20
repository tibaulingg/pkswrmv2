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
		const width = hasVictoryData ? 600 : 450;
		const itemHeight = 50;
		const itemSpacing = 10;
		const padding = 20;
		const titleHeight = 60;
		const statSpacing = 35;
		let statCount = 0;
		if (hasVictoryData) {
			statCount = 3;
			if (this.activeMenu.victoryData.enemiesKilled !== undefined) {
				statCount += 1;
			}
			if (this.activeMenu.victoryData.killerPokemon && !this.activeMenu.title.includes('VICTOIRE')) {
				statCount += 1;
			}
		}
		const statsHeight = hasVictoryData ? (statCount * statSpacing + padding) : 0;
		const buttonsHeight = hasVictoryData ? (itemHeight * 2 + itemSpacing) : (this.activeMenu.options.length * (itemHeight + itemSpacing));
		const height = titleHeight + statsHeight + buttonsHeight + padding * 3;
		
		const x = (renderer.width - width) / 2;
		const y = (renderer.height - height) / 2;

		renderer.drawRect(0, 0, renderer.width, renderer.height, 'rgba(0, 0, 0, 0.6)');
		
		renderer.drawRect(x, y, width, height, 'rgba(0, 0, 50, 0.7)');
		renderer.drawStrokeRect(x, y, width, height, '#fff', 3);

		const titleY = y + padding + 30;
		renderer.drawText(this.activeMenu.title, x + padding, titleY, '24px', '#aaa', 'left');
		
		if (hasVictoryData) {
			const statsY = y + titleHeight + padding * 2;
			const stats = this.activeMenu.victoryData;
			
			let currentY = statsY;
			
			renderer.ctx.fillStyle = '#aaa';
			renderer.ctx.font = '18px Pokemon';
			renderer.ctx.textAlign = 'left';
			renderer.ctx.fillText('Temps:', x + padding, currentY);
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.font = '18px Pokemon';
			renderer.ctx.textAlign = 'right';
			renderer.ctx.fillText(stats.time, x + width - padding, currentY);
			
			currentY += statSpacing;
			renderer.ctx.fillStyle = '#aaa';
			renderer.ctx.font = '18px Pokemon';
			renderer.ctx.textAlign = 'left';
			renderer.ctx.fillText('Niveau:', x + padding, currentY);
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.font = '18px Pokemon';
			renderer.ctx.textAlign = 'right';
			renderer.ctx.fillText(stats.level.toString(), x + width - padding, currentY);
			
			currentY += statSpacing;
			renderer.ctx.fillStyle = '#aaa';
			renderer.ctx.font = '18px Pokemon';
			renderer.ctx.textAlign = 'left';
			renderer.ctx.fillText('Argent gagné:', x + padding, currentY);
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.font = '18px Pokemon';
			renderer.ctx.textAlign = 'right';
			renderer.ctx.fillText(`₽${Math.floor(stats.money)}`, x + width - padding, currentY);
			
			if (stats.enemiesKilled !== undefined) {
				currentY += statSpacing;
				renderer.ctx.fillStyle = '#aaa';
				renderer.ctx.font = '18px Pokemon';
				renderer.ctx.textAlign = 'left';
				renderer.ctx.fillText('Ennemis tués:', x + padding, currentY);
				renderer.ctx.fillStyle = '#fff';
				renderer.ctx.font = '18px Pokemon';
				renderer.ctx.textAlign = 'right';
				renderer.ctx.fillText(stats.enemiesKilled.toString(), x + width - padding, currentY);
			}

			if (stats.killerPokemon && !this.activeMenu.title.includes('VICTOIRE')) {
				currentY += statSpacing;
				renderer.ctx.fillStyle = '#aaa';
				renderer.ctx.font = '18px Pokemon';
				renderer.ctx.textAlign = 'left';
				renderer.ctx.fillText('Tué par:', x + padding, currentY);
				
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
			}
			
			let color;
			if (option.disabled) {
				color = '#444';
			} else {
				color = index === this.selectedIndex ? '#fff' : '#888';
			}
			renderer.drawText(option.label, x + padding + 10, itemY, '22px', color, 'left');
		});

		if (lastIndex === this.selectedIndex) {
			renderer.drawRect(x + padding, lastItemY - 35, width - padding * 2, itemHeight, 'rgba(255, 100, 100, 0.2)');
		}
		
		const lastColor = lastIndex === this.selectedIndex ? '#ff6666' : '#aa5555';
		renderer.drawText(lastOption.label, x + padding + 10, lastItemY, '22px', lastColor, 'left');
	}

	renderRightMenu(renderer) {
		const width = renderer.width / 4;
		const height = renderer.height;
		const x = renderer.width - width;
		const y = 0;
		const padding = 20;

		renderer.drawRect(x, y, width, height, 'rgba(0, 0, 50, 0.7)');
		renderer.drawStrokeRect(x, y, width, height, '#fff', 3);

		const titleY = 60;
		renderer.drawText(this.activeMenu.title, x + padding, titleY, '24px', '#aaa', 'left');

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
			}
			
			let color;
			if (option.disabled) {
				color = '#444';
			} else {
				color = index === this.selectedIndex ? '#fff' : '#888';
			}
			renderer.drawText(option.label, x + padding + 10, itemY, '22px', color, 'left');
		});

		const lastItemY = height - padding - 20;
		if (lastIndex === this.selectedIndex) {
			renderer.drawRect(x + padding, lastItemY - 35, width - padding * 2, itemHeight, 'rgba(255, 100, 100, 0.2)');
		}
		
		const lastColor = lastIndex === this.selectedIndex ? '#ff6666' : '#aa5555';
		renderer.drawText(lastOption.label, x + padding + 10, lastItemY, '22px', lastColor, 'left');
	}

	renderLeftMenu(renderer) {
		const width = renderer.width / 4;
		const height = renderer.height;
		const x = 0;
		const y = 0;
		const padding = 20;

		renderer.drawRect(x, y, width, height, 'rgba(0, 0, 50, 0.7)');
		renderer.drawStrokeRect(x, y, width, height, '#fff', 3);

		const titleY = 60;
		renderer.drawText(this.activeMenu.title, x + padding, titleY, '24px', '#aaa', 'left');

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
			}
			
			let color;
			if (option.disabled) {
				color = '#444';
			} else {
				color = index === this.selectedIndex ? '#fff' : '#888';
			}
			renderer.drawText(option.label, x + padding + 10, itemY, '22px', color, 'left');
		});

		const lastItemY = height - padding - 20;
		if (lastIndex === this.selectedIndex) {
			renderer.drawRect(x + padding, lastItemY - 35, width - padding * 2, itemHeight, 'rgba(255, 100, 100, 0.2)');
		}
		
		const lastColor = lastIndex === this.selectedIndex ? '#ff6666' : '#aa5555';
		renderer.drawText(lastOption.label, x + padding + 10, lastItemY, '22px', lastColor, 'left');
	}
}

