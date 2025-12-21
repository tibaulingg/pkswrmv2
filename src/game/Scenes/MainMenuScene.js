import SaveManager from '../Systems/SaveManager.js';

export default class MainMenuScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedIndex = 0;
		this.backgroundIndex = 1;
		this.options = [];
	}

	init() {
		this.selectedIndex = 0;
		this.backgroundIndex = Math.floor(Math.random() * 3) + 1;
		
		this.options = [];
		if (SaveManager.hasSave()) {
			this.options.push({
				label: 'Continuer',
				description: 'Reprenez votre aventure à partir de votre dernière sauvegarde'
			});
		}
		
		this.options.push({
			label: 'Nouvelle Partie',
			description: 'Commencez une nouvelle aventure'
		});
		
		this.options.push({
			label: 'Quitter',
			description: 'Fermez le jeu'
		});
		
		this.engine.audio.playMusic('main_menu');
	}

	update(deltaTime) {
		const key = this.engine.input.consumeLastKey();
		
		if (key === 'ArrowUp') {
			this.selectedIndex = Math.max(0, this.selectedIndex - 1);
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowDown') {
			this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'Enter') {
			this.selectOption();
		}
	}

	selectOption() {
		const option = this.options[this.selectedIndex];
		
		if (option.label === 'Continuer') {
			this.engine.sceneManager.changeScene('continueGame');
            this.engine.sceneManager.getCurrentScene().init();
		} else if (option.label === 'Nouvelle Partie') {
			SaveManager.deleteSave();
			this.engine.sceneManager.changeScene('newGame');
		} else if (option.label === 'Collection') {
			this.engine.sceneManager.pushScene('collection');
		} else if (option.label === 'Quitter') {
			window.close();
		}
	}

	render(renderer) {
		const backgroundKey = `background_${this.backgroundIndex}`;
		const backgroundImage = this.engine.sprites.get(backgroundKey);
		
		if (backgroundImage) {
			renderer.drawImage(backgroundImage, 0, 0, renderer.width, renderer.height);
		}
		
		const menuEmptyImage = this.engine.sprites.get('menu_empty');
		if (menuEmptyImage) {
			renderer.drawImage(menuEmptyImage, 0, 0, renderer.width, renderer.height);
		}
		
		const optionStartX = 80;
		const optionStartY = 70;
		const optionSpacing = 40;
		const fontSize = '20px';
		
		this.options.forEach((option, index) => {
			let y = optionStartY + index * optionSpacing;
			if (option.label === 'Quitter') {
				y += 380;
			}
			let color = index === this.selectedIndex ? '#ffff00' : '#ffffff';
			if (option.label === 'Quitter') {
				color = '#ff6666';
			}
			
			renderer.drawText(option.label, optionStartX, y, fontSize, color, 'left');
			
			if (index === this.selectedIndex) {
				const cursorY = option.label === 'Quitter' ? y : y;
				renderer.drawText('>', optionStartX - 20, cursorY, fontSize, color, 'left');
			}
		});
		
		const selectedOption = this.options[this.selectedIndex];
		if (selectedOption && selectedOption.description) {
			const descX = 50;
			const descY = renderer.height - 125;
			const descFontSize = '25px';
			const maxWidth = renderer.width - 100;
			
			renderer.ctx.save();
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.font = `${descFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'top';
			
			const words = selectedOption.description.split(' ');
			let line = '';
			let y = descY;
			
			words.forEach((word) => {
				const testLine = line + word + ' ';
				const metrics = renderer.ctx.measureText(testLine);
				const testWidth = metrics.width;
				
				if (testWidth > maxWidth && line !== '') {
					renderer.ctx.fillText(line, descX, y);
					line = word + ' ';
					y += 22;
				} else {
					line = testLine;
				}
			});
			renderer.ctx.fillText(line, descX, y);
			renderer.ctx.restore();
		}
	}
}

