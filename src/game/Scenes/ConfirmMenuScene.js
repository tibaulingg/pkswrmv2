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

		const messageX = 50;
		const messageY = renderer.height - 100;
		const messageFontSize = '24px';

		renderer.ctx.save();
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.font = `${messageFontSize} Pokemon`;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.fillText(this.message, messageX, messageY);
		renderer.ctx.restore();

		const optionStartX = renderer.width - 180;
		const optionStartY = (renderer.height / 2) + 140;
		const optionSpacing = 40;
		const optionFontSize = '20px';

		renderer.ctx.save();
		renderer.ctx.fillStyle = this.selectedIndex === 0 ? '#ffff00' : '#ffffff';
		renderer.ctx.font = `${optionFontSize} Pokemon`;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.fillText('Oui', optionStartX, optionStartY);
		renderer.ctx.restore();

		if (this.selectedIndex === 0) {
			renderer.ctx.save();
			renderer.ctx.fillStyle = '#ffff00';
			renderer.ctx.font = `${optionFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.fillText('>', optionStartX - 30, optionStartY);
			renderer.ctx.restore();
		}

		renderer.ctx.save();
		renderer.ctx.fillStyle = this.selectedIndex === 1 ? '#ffff00' : '#ffffff';
		renderer.ctx.font = `${optionFontSize} Pokemon`;
		renderer.ctx.textAlign = 'left';
		renderer.ctx.fillText('Non', optionStartX, optionStartY + optionSpacing);
		renderer.ctx.restore();

		if (this.selectedIndex === 1) {
			renderer.ctx.save();
			renderer.ctx.fillStyle = '#ffff00';
			renderer.ctx.font = `${optionFontSize} Pokemon`;
			renderer.ctx.textAlign = 'left';
			renderer.ctx.fillText('>', optionStartX - 30, optionStartY + optionSpacing);
			renderer.ctx.restore();
		}
	}
}

