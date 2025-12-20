import { HubMenuConfig, MainMenuConfig } from '../Config/MenuConfig.js';

export default class SettingsScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedIndex = 0;
	}

	init() {
		this.selectedIndex = 0;
		this.engine.menuManager.openMenu(this.getSettingsMenuConfig());
	}

	getSettingsMenuConfig() {
		return {
			title: 'PARAMÈTRES',
			style: 'left',
			closeable: true,
			onClose: (engine) => {
				engine.menuManager.closeMenu();
				const stackLength = engine.sceneManager.stack.length;
				const previousSceneIndex = stackLength - 2;
				
				if (previousSceneIndex >= 0) {
					const previousScene = engine.sceneManager.stack[previousSceneIndex];
					engine.sceneManager.popScene();
					
					if (previousScene && previousScene.constructor.name === 'MenuScene') {
						engine.menuManager.openMenu(MainMenuConfig);
					} else {
						engine.menuManager.openMenu(HubMenuConfig);
					}
				} else {
					engine.sceneManager.popScene();
				}
			},
			options: [
				{
					label: 'Retour',
					action: (engine) => {
						engine.menuManager.closeMenu();
						const stackLength = engine.sceneManager.stack.length;
						const previousSceneIndex = stackLength - 2;
						
						if (previousSceneIndex >= 0) {
							const previousScene = engine.sceneManager.stack[previousSceneIndex];
							engine.sceneManager.popScene();
							
							if (previousScene && previousScene.constructor.name === 'MenuScene') {
								engine.menuManager.openMenu(MainMenuConfig);
							} else {
								engine.menuManager.openMenu(HubMenuConfig);
							}
						} else {
							engine.sceneManager.popScene();
						}
					}
				}
			]
		};
	}

	update(deltaTime) {
		const key = this.engine.input.getLastKey();
		
		if (key === 'Escape') {
			this.engine.input.consumeLastKey();
			this.goBack();
			return;
		}

		if (key === 'ArrowUp' || key === 'KeyW') {
			this.engine.input.consumeLastKey();
			this.selectedIndex = Math.max(0, this.selectedIndex - 1);
		} else if (key === 'ArrowDown' || key === 'KeyS') {
			this.engine.input.consumeLastKey();
			this.selectedIndex = Math.min(2, this.selectedIndex + 1);
		} else if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Enter' || key === 'Space') {
			this.engine.input.consumeLastKey();
			this.toggleSetting();
		} else {
			this.engine.menuManager.update();
		}
	}

	toggleSetting() {
		if (this.selectedIndex === 0) {
			this.engine.settings.screenshakeEnabled = !this.engine.settings.screenshakeEnabled;
			this.engine.saveSettings();
		} else if (this.selectedIndex === 1) {
			this.engine.settings.musicEnabled = !this.engine.settings.musicEnabled;
			this.engine.audio.setMusicEnabled(this.engine.settings.musicEnabled);
			this.engine.saveSettings();
		} else if (this.selectedIndex === 2) {
			this.engine.settings.soundEnabled = !this.engine.settings.soundEnabled;
			this.engine.audio.setEnabled(this.engine.settings.soundEnabled);
			this.engine.saveSettings();
		}
	}

	goBack() {
		this.engine.menuManager.closeMenu();
		const stackLength = this.engine.sceneManager.stack.length;
		const previousSceneIndex = stackLength - 2;
		
		if (previousSceneIndex >= 0) {
			const previousScene = this.engine.sceneManager.stack[previousSceneIndex];
			this.engine.sceneManager.popScene();
			
			if (previousScene && previousScene.constructor.name === 'MenuScene') {
				this.engine.menuManager.openMenu(MainMenuConfig);
			} else {
				this.engine.menuManager.openMenu(HubMenuConfig);
			}
		} else {
			this.engine.sceneManager.popScene();
		}
	}

	render(renderer) {
		this.renderSettings(renderer);
		this.engine.menuManager.render(renderer);
	}

	renderSettings(renderer) {
		const gridPadding = 40;
		const menuWidth = renderer.width / 4;
		const gridWidth = renderer.width - menuWidth - gridPadding * 2;
		const gridHeight = renderer.height - gridPadding * 2;
		const gridX = menuWidth + gridPadding;
		const gridY = gridPadding;

		renderer.drawRect(gridX, gridY, gridWidth, gridHeight, 'rgba(0, 0, 50, 0.6)');
		renderer.drawStrokeRect(gridX, gridY, gridWidth, gridHeight, '#fff', 3);

		renderer.drawText('PARAMÈTRES', gridX + 30, gridY + 50, '28px', '#fff', 'left');

		const itemHeight = 70;
		const itemSpacing = 20;
		const startY = gridY + 120;
		const itemX = gridX + 40;

		const settings = [
			{ label: 'Screenshake', value: this.engine.settings.screenshakeEnabled, type: 'toggle' },
			{ label: 'Musique', value: this.engine.settings.musicEnabled, type: 'toggle' },
			{ label: 'Son', value: this.engine.settings.soundEnabled, type: 'toggle' }
		];

		settings.forEach((setting, index) => {
			const y = startY + index * (itemHeight + itemSpacing);
			const isSelected = index === this.selectedIndex;

			if (isSelected) {
				renderer.drawRect(itemX - 10, y - 5, gridWidth - 60, itemHeight, 'rgba(255, 255, 255, 0.2)');
			}

			renderer.drawText(setting.label, itemX, y + 30, '26px', '#fff', 'left');

			if (setting.type === 'toggle') {
				const toggleX = gridX + gridWidth - 120;
				const toggleWidth = 70;
				const toggleHeight = 35;
				const toggleY = y + 10;

				renderer.drawRect(toggleX, toggleY, toggleWidth, toggleHeight, setting.value ? '#4af626' : '#666');
				renderer.drawStrokeRect(toggleX, toggleY, toggleWidth, toggleHeight, '#fff', 2);

				const circleRadius = 14;
				const circleX = setting.value ? toggleX + toggleWidth - circleRadius - 4 : toggleX + circleRadius + 4;
				const circleY = toggleY + toggleHeight / 2;

				renderer.ctx.save();
				renderer.ctx.fillStyle = '#fff';
				renderer.ctx.beginPath();
				renderer.ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
				renderer.ctx.fill();
				renderer.ctx.restore();
			}
		});

		renderer.drawText('← → ou Entrée pour modifier', gridX + gridWidth / 2, gridY + gridHeight - 40, '16px', '#aaa', 'center');
	}
}

