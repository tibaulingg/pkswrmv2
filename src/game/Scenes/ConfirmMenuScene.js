export default class ConfirmMenuScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedIndex = 0;
		this.message = '';
		this.onYes = null;
		this.onNo = null;
	}

	init(data) {
		this.selectedIndex = 0;
		this.message = data?.message || '';
		this.onYes = data?.onYes || null;
		this.onNo = data?.onNo || null;
	}

	update(deltaTime) {
		const key = this.engine.input.consumeLastKey();
		
		if (key === 'ArrowUp' || key === 'ArrowDown') {
			this.selectedIndex = this.selectedIndex === 0 ? 1 : 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'Enter') {
			if (this.selectedIndex === 0) {
				if (this.onYes) {
					this.onYes(this.engine);
				}
			} else {
				if (this.onNo) {
					this.onNo(this.engine);
				}
			}
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'Escape') {
			if (this.onNo) {
				this.onNo(this.engine);
			}
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	render(renderer) {
		const backgroundImage = this.engine.sprites.get('confirm_menu');
		if (backgroundImage) {
			renderer.drawImage(backgroundImage, 0, 0, renderer.width, renderer.height);
		}

		const messageX = 100;
		const messageY = renderer.height - 125;
		const messageFontSize = '25px';
		const maxWidth = renderer.width - 100;

		renderer.ctx.save();
		renderer.ctx.font = `${messageFontSize} Pokemon`;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';
		
		const parts = this.message.split(':');
		let currentX = messageX;
		
		if (parts.length >= 2) {
			const beforeColon = parts[0];
			const afterColon = parts.slice(1).join(':');
			
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.fillText(beforeColon + ' ', currentX, messageY);
			currentX += renderer.ctx.measureText(beforeColon + ' ').width;
			
			const values = afterColon.split(':');
			if (values.length >= 2) {
				renderer.ctx.fillStyle = '#ffff00';
				renderer.ctx.fillText(values[0] + ' ', currentX, messageY);
				currentX += renderer.ctx.measureText(values[0] + ' ').width;
				
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.fillText('pour ', currentX, messageY);
				currentX += renderer.ctx.measureText('pour ').width;
				
				renderer.ctx.fillStyle = 'rgb(43, 231, 216)';
				const priceText = values[1].trim();
				renderer.ctx.fillText(priceText, currentX, messageY);
			} else {
				renderer.ctx.fillStyle = '#ffff00';
				renderer.ctx.fillText(afterColon.trim(), currentX, messageY);
			}
		} else {
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.fillText(this.message, messageX, messageY);
		}
		
		renderer.ctx.restore();

		const choiceX = renderer.width - 220;
		const choiceStartY = renderer.height - 330;
		const choiceSpacing = 50;
		const choiceFontSize = '24px';

		const choices = ['Oui', 'Non'];

		choices.forEach((choice, index) => {
			const y = choiceStartY + index * choiceSpacing;
			const color = index === this.selectedIndex ? '#ffff00' : '#ffffff';
			renderer.drawText(choice, choiceX, y, choiceFontSize, color, 'left');
			
			if (index === this.selectedIndex) {
				renderer.drawText('>', choiceX - 40, y, choiceFontSize, color, 'left');
			}
		});
	}
}

