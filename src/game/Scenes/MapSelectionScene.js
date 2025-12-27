import { Maps } from '../Config/MapConfig.js';
import ConfirmMenuScene from './ConfirmMenuScene.js';

export default class MapSelectionScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedMapIndex = 0;
		this.hoveredMapIndex = null;
		this.showReturnButton = true;
		this.blinkTimer = 0;
		this.confirmMenu = null;
	}

	init() {
		this.selectedMapIndex = 0;
		this.hoveredMapIndex = null;
		this.blinkTimer = 0;
		this.confirmMenu = null;
	}

	isMapAvailable(index) {
		return index <= 1;
	}

	findNextAvailableMapIndex(currentIndex, direction) {
		if (currentIndex === Maps.length) {
			if (direction === -1) {
				for (let i = Maps.length - 1; i >= 0; i--) {
					if (this.isMapAvailable(i)) {
						return i;
					}
				}
			}
			return Maps.length;
		}

		if (direction === 1) {
			for (let i = currentIndex + 1; i < Maps.length; i++) {
				if (this.isMapAvailable(i)) {
					return i;
				}
			}
			return Maps.length;
		} else {
			for (let i = currentIndex - 1; i >= 0; i--) {
				if (this.isMapAvailable(i)) {
					return i;
				}
			}
			return currentIndex;
		}
	}

	update(deltaTime) {
		this.blinkTimer += deltaTime;

		if (this.confirmMenu) {
			this.confirmMenu.update(deltaTime);
			return;
		}

		const key = this.engine.input.consumeLastKey();
		
		if (key === 'ArrowUp') {
			this.selectedMapIndex = this.findNextAvailableMapIndex(this.selectedMapIndex, -1);
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowDown') {
			this.selectedMapIndex = this.findNextAvailableMapIndex(this.selectedMapIndex, 1);
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'Enter') {
			if (this.selectedMapIndex === Maps.length) {
				this.engine.sceneManager.popScene();
				this.engine.audio.play('ok', 0.3, 0.1);
			} else if (this.selectedMapIndex >= 0 && this.selectedMapIndex < Maps.length && this.isMapAvailable(this.selectedMapIndex)) {
				const selectedMap = Maps[this.selectedMapIndex];
				this.openConfirmMenu(selectedMap);
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		} else if (key === 'Escape') {
			this.engine.sceneManager.popScene();
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	render(renderer) {
		const backgroundImage = this.engine.sprites.get('map_selection_screen');
		if (backgroundImage) {
			renderer.drawImage(backgroundImage, 0, 0, renderer.width, renderer.height);
		}

		const mapStartX = 50;
		const mapStartY = 50;
		const mapSpacing = 40;
		const textHeight = 30;

		Maps.forEach((map, index) => {
			const x = mapStartX;
			const y = mapStartY + index * mapSpacing;
			const isSelected = index === this.selectedMapIndex;
			const isAvailable = this.isMapAvailable(index);

			renderer.ctx.save();
			if (isAvailable) {
				renderer.ctx.fillStyle = isSelected ? '#ffff00' : '#ffffff';
			} else {
				renderer.ctx.fillStyle = '#888888';
			}
			renderer.ctx.font = '20px Pokemon';
			renderer.ctx.textAlign = 'left';
			renderer.ctx.fillText(map.name, x, y + textHeight / 2);
			renderer.ctx.restore();

			if (isSelected && isAvailable) {
				renderer.ctx.save();
				renderer.ctx.fillStyle = '#ffff00';
				renderer.ctx.font = '20px Pokemon';
				renderer.ctx.textAlign = 'left';
				renderer.ctx.fillText('>', x - 30, y + textHeight / 2);
				renderer.ctx.restore();
			}
		});

		Maps.forEach((map, index) => {
			if (!this.isMapAvailable(index)) return;

			const isSelected = index === this.selectedMapIndex;
			const circleX = map.arrowX + 95;
			const circleY = map.arrowY + 2;
			const circleRadius = 4;

			renderer.ctx.save();
			renderer.ctx.fillStyle = '#ffff00';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 1;
			renderer.ctx.beginPath();
			renderer.ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
			renderer.ctx.fill();
			renderer.ctx.stroke();
			renderer.ctx.restore();

			if (isSelected) {
				const arrowSize = 18;
				const arrowX = map.arrowX + 95;
				const arrowY = map.arrowY + 2;

				renderer.ctx.save();
				renderer.ctx.fillStyle = '#ffff00';
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 3;
				renderer.ctx.beginPath();
				renderer.ctx.moveTo(arrowX, arrowY);
				renderer.ctx.lineTo(arrowX + arrowSize, arrowY - arrowSize / 2);
				renderer.ctx.lineTo(arrowX + arrowSize, arrowY + arrowSize / 2);
				renderer.ctx.closePath();
				renderer.ctx.fill();
				renderer.ctx.stroke();
				renderer.ctx.restore();
			}
		});

		const returnButtonY = mapStartY + Maps.length * mapSpacing + 210;
		const isReturnSelected = this.selectedMapIndex === Maps.length;
		
		renderer.ctx.save();
		renderer.ctx.fillStyle = isReturnSelected ? '#ff6666' : '#ff0000';
		renderer.ctx.font = '20px Pokemon';
		renderer.ctx.textAlign = 'left';
		renderer.ctx.fillText('Retour', mapStartX, returnButtonY);
		renderer.ctx.restore();
		
		if (isReturnSelected) {
			renderer.ctx.save();
			renderer.ctx.fillStyle = '#ff6666';
			renderer.ctx.font = '20px Pokemon';
			renderer.ctx.textAlign = 'left';
			renderer.ctx.fillText('>', mapStartX - 30, returnButtonY);
			renderer.ctx.restore();
		}

		if (this.confirmMenu) {
			this.confirmMenu.render(renderer);
		}
	}

	openConfirmMenu(selectedMap) {
		const message = `Confirmation du choix "${selectedMap.name}"`;
		const mapSelectionScene = this;
		
		const onYes = (engine) => {
			mapSelectionScene.confirmMenu = null;
			engine.sceneManager.pushScene('transition', {
				mapData: selectedMap
			});
		};

		const onNo = (engine) => {
			mapSelectionScene.confirmMenu = null;
		};

		this.confirmMenu = new ConfirmMenuScene(this.engine);
		this.confirmMenu.init({
			message: message,
			onYes: onYes,
			onNo: onNo
		});
	}
}

