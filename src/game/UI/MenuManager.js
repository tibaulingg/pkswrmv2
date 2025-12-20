export default class MenuManager {
	constructor(engine) {
		this.engine = engine;
		this.activeMenu = null;
		this.selectedIndex = 0;
		this.originalMusicVolume = null;
		this.blinkSpeed = 100;
	}

	openMenu(menuData) {
		this.engine.input.clearInput();
		
		if (!this.activeMenu && !menuData.isMainMenu) {
			this.originalMusicVolume = this.engine.audio.musicVolume;
			this.engine.audio.setMusicVolume(this.originalMusicVolume * 0.5);
		}
		
		this.activeMenu = menuData;
		if (this.activeMenu.getOptions) {
			this.activeMenu.options = this.activeMenu.getOptions(this.engine);
		}
		if (this.activeMenu.isShop) {
			if (this.activeMenu.mode === 'main' && this.activeMenu.getMainOptions) {
				this.activeMenu.options = this.activeMenu.getMainOptions();
			} else if (this.activeMenu.mode === 'buy' && this.activeMenu.getBuyOptions) {
				this.activeMenu.options = this.activeMenu.getBuyOptions();
			} else if (this.activeMenu.mode === 'sell' && this.activeMenu.getSellOptions) {
				this.activeMenu.options = this.activeMenu.getSellOptions(this.engine);
			}
		}
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
		
		if (this.activeMenu.getOptions) {
			this.activeMenu.options = this.activeMenu.getOptions(this.engine);
		}
		if (this.activeMenu.isShop && this.activeMenu.mode === 'sell' && this.activeMenu.getSellOptions) {
			this.activeMenu.options = this.activeMenu.getSellOptions(this.engine);
		}

		const key = this.engine.input.consumeLastKey();
		if (!key) return;

		if (key === 'Escape' && this.activeMenu.closeable) {
			if (this.activeMenu.isShop && this.activeMenu.mode !== 'main') {
				this.engine.audio.play('ok', 0.3, 0.2);
				this.activeMenu.mode = 'main';
				this.activeMenu.options = this.activeMenu.getMainOptions();
				this.selectedIndex = 0;
			} else {
				const onCloseCallback = this.activeMenu.onClose;
				this.closeMenu();
				if (onCloseCallback) {
					onCloseCallback(this.engine);
				}
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
				if (this.activeMenu.isShop && option.price !== undefined) {
					const isBuyMode = this.activeMenu.mode === 'buy';
					if (isBuyMode) {
						if (this.engine.money >= option.price) {
							this.engine.audio.play('ok', 0.3, 0.2);
							option.action(this.engine);
						} else {
							this.engine.audio.play('ok', 0.1, 0.1);
						}
					} else {
						this.engine.audio.play('ok', 0.3, 0.2);
						option.action(this.engine);
					}
				} else {
					this.engine.audio.play('ok', 0.3, 0.2);
					option.action(this.engine);
				}
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

		y-=10;
		
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

	drawRoundedRect(ctx, x, y, width, height, radius) {
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
	}

	renderShopItem(renderer, option, x, y, width, padding, color, isBuyMode) {
		const canAfford = isBuyMode ? (this.engine.money >= option.price) : true;
		const priceText = `₽${option.price}`;
		
		const itemImage = option.itemImage || (option.iconImage ? this.engine.sprites.get(`item_${option.itemId}`) : null);
		const iconSize = 24;
		const iconX = x + padding + 25;
		const iconY = y - iconSize / 2;
		
		if (option.iconImage && itemImage && itemImage.complete && itemImage.naturalWidth > 0) {
			renderer.ctx.save();
			renderer.ctx.drawImage(itemImage, iconX, iconY, iconSize, iconSize);
			renderer.ctx.restore();
		} else if (option.icon) {
			renderer.ctx.save();
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.font = 'bold 20px Arial';
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'middle';
			renderer.ctx.fillText(option.icon, iconX, y);
			renderer.ctx.restore();
		}
		
		let displayText = option.label;
		if (!isBuyMode && option.quantity !== undefined) {
			displayText += ` x${option.quantity}`;
		}
		const textX = iconX + iconSize + 10;
		
		this.drawTextWithOutline(renderer, displayText, textX, y, '15px', canAfford ? color : '#888', 'left');
		this.drawTextWithOutline(renderer, priceText, x + width - padding - 90, y, '20px', canAfford ? '#ffd700' : '#666', 'right');
	}

	drawMenuBox(renderer, x, y, width, height) {
		const backgroundColor = 'rgba(0, 0, 50, 0.6)';
		const borderColor = '#fff';
		const borderWidth = 3;
		
		renderer.ctx.save();
		
		renderer.ctx.fillStyle = backgroundColor;
		renderer.ctx.fillRect(x, y, width, height);
		
		renderer.ctx.strokeStyle = borderColor;
		renderer.ctx.lineWidth = borderWidth;
		renderer.ctx.strokeRect(x, y, width, height);
		
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
		const isShop = this.activeMenu.isShop;
		const isInventory = this.activeMenu.isInventory;
		const width = hasVictoryData ? 700 : (isShop || isInventory ? 600 : 450);
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
		const shopHeaderHeight = isShop && this.activeMenu.mode === 'main' ? 80 : 0;
		const buttonsHeight = hasVictoryData ? (itemHeight * 2 + itemSpacing) : (this.activeMenu.options.length * (itemHeight + itemSpacing));
		const titleBottomPadding = isShop && this.activeMenu.mode !== 'main' ? 10 : (isShop && this.activeMenu.mode === 'main' ? 10 : padding);
		const height = titleHeight + statsHeight + shopHeaderHeight + buttonsHeight + padding + titleBottomPadding;
	
		const x = (renderer.width - width) / 2;
		const y = (renderer.height - height) / 2;

		renderer.drawRect(0, 0, renderer.width, renderer.height, 'rgba(0, 0, 0, 0.6)');
		
		this.drawMenuBox(renderer, x, y, width, height);

		const titleY = y + padding + 30;
		let title = this.activeMenu.title;
		if (isShop && this.activeMenu.mode === 'buy') {
			title = 'Acheter';
		} else if (isShop && this.activeMenu.mode === 'sell') {
			title = 'Vendre';
		}
		this.drawTextWithOutline(renderer, title, x + padding, titleY, '28px', '#fff', 'left');
	
		if (isShop) {
			const kecleonIconSize = 80;
			const iconX = x + width - padding - kecleonIconSize;
			const iconY = y + padding;
			
			const timeSincePurchase = Date.now() - (this.activeMenu.lastPurchaseTime || 0);
			const showHappy = timeSincePurchase < 2000;
			const kecleonSprite = this.engine.sprites.get(showHappy ? 'kecleon_happy' : 'kecleon_normal');
			
			if (kecleonSprite) {
				renderer.ctx.save();
				renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
				renderer.ctx.fillRect(iconX - 5, iconY - 5, kecleonIconSize + 10, kecleonIconSize + 10);
				renderer.ctx.strokeStyle = '#fff';
				renderer.ctx.lineWidth = 2;
				renderer.ctx.strokeRect(iconX - 5, iconY - 5, kecleonIconSize + 10, kecleonIconSize + 10);
				renderer.ctx.drawImage(kecleonSprite, iconX, iconY, kecleonIconSize, kecleonIconSize);
				renderer.ctx.restore();
			}
			
		}
		
		if (hasVictoryData) {
			const statsY = y + titleHeight + padding * 2;
			const stats = this.activeMenu.victoryData;
			
			let currentY = statsY;
			
			this.drawTextWithOutline(renderer, 'Temps:', x + padding, currentY, '18px', '#fff', 'left');
			this.drawTextWithOutline(renderer, stats.time, x + width - padding, currentY, '18px', '#fff', 'right');
			
			currentY += statSpacing;
			this.drawTextWithOutline(renderer, 'Niveau:', x + padding, currentY, '18px', '#fff', 'left');
			this.drawTextWithOutline(renderer, stats.level.toString(), x + width - padding, currentY, '18px', '#fff', 'right');
			
			currentY += statSpacing;
			this.drawTextWithOutline(renderer, 'Argent gagné:', x + padding, currentY, '18px', '#fff', 'left');
			this.drawTextWithOutline(renderer, `₽${Math.floor(stats.money)}`, x + width - padding, currentY, '18px', '#fff', 'right');
			
			if (stats.enemiesKilled !== undefined) {
				currentY += statSpacing;
				this.drawTextWithOutline(renderer, 'Ennemis tués:', x + padding, currentY, '18px', '#fff', 'left');
				this.drawTextWithOutline(renderer, stats.enemiesKilled.toString(), x + width - padding, currentY, '18px', '#fff', 'right');
			}

			if (stats.killerPokemon && !this.activeMenu.title.includes('VICTOIRE')) {
				currentY += statSpacing;
				this.drawTextWithOutline(renderer, 'Tué par:', x + padding, currentY, '18px', '#fff', 'left');
				
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
		const lastOption = this.activeMenu.options[lastIndex];
		const isReturnButton = lastOption.label && (lastOption.label.includes('Retour') || lastOption.label.includes('←'));
		
		let mainOptions;
		if (isShop && this.activeMenu.mode !== 'main' && isReturnButton) {
			mainOptions = this.activeMenu.options.filter(opt => !opt.label || (!opt.label.includes('Retour') && !opt.label.includes('←')));
		} else {
			mainOptions = this.activeMenu.options.slice(0, -1);
		}

		const returnButtonSpacing = (isShop && this.activeMenu.mode !== 'main' && isReturnButton) ? 30 : 0;
		const lastItemY = y + height - padding - 20 - returnButtonSpacing;
		let startY;
		if (isShop && this.activeMenu.mode !== 'main') {
			startY = titleY + titleHeight + 40;
		} else if (isShop && this.activeMenu.mode === 'main') {
			startY = titleY + titleHeight + 10;
		} else {
			startY = lastItemY - mainOptions.length * (itemHeight + itemSpacing);
		}

		mainOptions.forEach((option, index) => {
			const itemY = startY + index * (itemHeight + itemSpacing);
			
			if (index === this.selectedIndex && !option.disabled) {
				const blink = Math.sin(Date.now() / this.blinkSpeed) > 0;
				if (blink) {
					this.drawTriangle(renderer, x + padding + 10, itemY, 14, '#fff', 'right');
				}
			}
			
			const isExitOption = option.label.toLowerCase().includes('retour') || 
			                     option.label.toLowerCase().includes('exit') || 
			                     option.label.toLowerCase().includes('quitter') ||
			                     option.label.toLowerCase().includes('menu');
			
			let color;
			if (option.disabled) {
				color = '#888';
			} else if (isExitOption) {
				color = '#ff69b4';
			} else {
				color = '#fff';
			}
			
			const isReturnOption = option.label && (option.label.includes('Retour') || option.label.includes('←'));
			if (this.activeMenu.isShop && option.price !== undefined && !isReturnOption) {
				const isBuyMode = this.activeMenu.mode === 'buy';
				this.renderShopItem(renderer, option, x, itemY, width, padding, color, isBuyMode);
			} else if (this.activeMenu.isInventory && option.quantity !== undefined) {
				const iconText = option.icon ? `${option.icon} ` : '';
				const quantityText = `x${option.quantity}`;
				this.drawTextWithOutline(renderer, iconText + option.label, x + padding + 25, itemY, '22px', color, 'left');
				this.drawTextWithOutline(renderer, quantityText, x + width - padding - 25, itemY, '20px', '#4af626', 'right');
			} else {
				this.drawTextWithOutline(renderer, option.label, x + padding + 25, itemY, '22px', color, 'left');
			}
		});

		const isLastExitOption = lastOption.label.toLowerCase().includes('retour') || 
		                         lastOption.label.toLowerCase().includes('exit') || 
		                         lastOption.label.toLowerCase().includes('quitter') ||
		                         lastOption.label.toLowerCase().includes('menu');

		if (lastIndex === this.selectedIndex) {
			const blink = Math.sin(Date.now() / 200) > 0;
			if (blink) {
				this.drawTriangle(renderer, x + padding + 10, lastItemY, 14, '#fff', 'right');
			}
		}
		
		const lastColor = lastIndex === this.selectedIndex ? (isLastExitOption ? '#ff69b4' : '#fff') : (lastOption.disabled ? '#888' : (isLastExitOption ? '#ff69b4' : '#fff'));
		const isLastReturnOption = lastOption.label && (lastOption.label.includes('Retour') || lastOption.label.includes('←'));
		if (this.activeMenu.isShop && lastOption.price !== undefined && !isLastReturnOption) {
			const isBuyMode = this.activeMenu.mode === 'buy';
			this.renderShopItem(renderer, lastOption, x, lastItemY, width, padding, lastColor, isBuyMode);
		} else if (this.activeMenu.isInventory && lastOption.quantity !== undefined) {
			const iconText = lastOption.icon ? `${lastOption.icon} ` : '';
			const quantityText = `x${lastOption.quantity}`;
			this.drawTextWithOutline(renderer, iconText + lastOption.label, x + padding + 25, lastItemY, '22px', lastColor, 'left');
			this.drawTextWithOutline(renderer, quantityText, x + width - padding - 25, lastItemY, '20px', '#4af626', 'right');
		} else {
			this.drawTextWithOutline(renderer, lastOption.label, x + padding + 25, lastItemY, '22px', lastColor, 'left');
		}
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
				const blink = Math.sin(Date.now() / this.blinkSpeed) > 0;
				if (blink) {
					this.drawTriangle(renderer, x + padding + 10, itemY, 14, '#fff', 'right');
				}
			}
			
			const isExitOption = option.label.toLowerCase().includes('retour') || 
			                     option.label.toLowerCase().includes('exit') || 
			                     option.label.toLowerCase().includes('quitter') ||
			                     option.label.toLowerCase().includes('menu');
			
			let color;
			if (option.disabled) {
				color = '#888';
			} else if (isExitOption) {
				color = '#ff69b4';
			} else {
				color = '#fff';
			}
			this.drawTextWithOutline(renderer, option.label, x + padding + 25, itemY, '22px', color, 'left');
		});

		const lastItemY = height - padding - 20;
		const isLastExitOption = lastOption.label.toLowerCase().includes('retour') || 
		                         lastOption.label.toLowerCase().includes('exit') || 
		                         lastOption.label.toLowerCase().includes('quitter') ||
		                         lastOption.label.toLowerCase().includes('menu');

		if (lastIndex === this.selectedIndex) {
			const blink = Math.sin(Date.now() / 200) > 0;
			if (blink) {
				this.drawTriangle(renderer, x + padding + 10, lastItemY, 14, '#fff', 'right');
			}
		}
		
		const lastColor = lastIndex === this.selectedIndex ? (isLastExitOption ? '#ff69b4' : '#fff') : (lastOption.disabled ? '#888' : (isLastExitOption ? '#ff69b4' : '#fff'));
		this.drawTextWithOutline(renderer, lastOption.label, x + padding + 25, lastItemY, '22px', lastColor, 'left');
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
				const blink = Math.sin(Date.now() / this.blinkSpeed) > 0;
				if (blink) {
					this.drawTriangle(renderer, x + padding + 10, itemY, 14, '#fff', 'right');
				}
			}
			
			const isExitOption = option.label.toLowerCase().includes('retour') || 
			                     option.label.toLowerCase().includes('exit') || 
			                     option.label.toLowerCase().includes('quitter') ||
			                     option.label.toLowerCase().includes('menu');
			
			let color;
			if (option.disabled) {
				color = '#888';
			} else if (isExitOption) {
				color = '#ff69b4';
			} else {
				color = '#fff';
			}
			this.drawTextWithOutline(renderer, option.label, x + padding + 25, itemY, '22px', color, 'left');
		});

		const lastItemY = height - padding - 20;
		const isLastExitOption = lastOption.label.toLowerCase().includes('retour') || 
		                         lastOption.label.toLowerCase().includes('exit') || 
		                         lastOption.label.toLowerCase().includes('quitter') ||
		                         lastOption.label.toLowerCase().includes('menu');

		if (lastIndex === this.selectedIndex) {
			const blink = Math.sin(Date.now() / 200) > 0;
			if (blink) {
				this.drawTriangle(renderer, x + padding + 10, lastItemY, 14, '#fff', 'right');
			}
		}
		
		const lastColor = lastIndex === this.selectedIndex ? (isLastExitOption ? '#ff69b4' : '#fff') : (lastOption.disabled ? '#888' : (isLastExitOption ? '#ff69b4' : '#fff'));
		this.drawTextWithOutline(renderer, lastOption.label, x + padding + 25, lastItemY, '22px', lastColor, 'left');
	}
}

