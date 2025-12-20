export default class AnimationSystem {
	constructor(spriteConfig, spriteImages) {
		this.spriteConfig = spriteConfig;
		this.spriteImages = spriteImages;
		this.currentAnimation = 'walk';
		this.currentDirection = 'down';
		this.currentFrame = 0;
		this.frameTime = 0;
		this.frameDuration = 150;
		this.customAnimationDuration = null;
		this.wasMoving = false;
		this.forcedDirection = null;
		
		this.calculateFrameDimensions();
	}

	calculateFrameDimensions() {
		const spriteImage = this.getCurrentSpriteImage();
		if (!spriteImage) return;
		
		const anim = this.spriteConfig.animations[this.currentAnimation];
		this.frameWidth = spriteImage.width / anim.frames;
		const rows = anim.rows || this.spriteConfig.rows;
		this.frameHeight = spriteImage.height / rows;
	}

	getCurrentSpriteImage() {
		if (this.spriteImages && typeof this.spriteImages === 'object' && this.spriteImages.nodeName === 'IMG') {
			return this.spriteImages;
		}
		if (this.spriteImages && typeof this.spriteImages === 'object' && this.spriteImages !== null && !this.spriteImages.nodeName) {
			return this.spriteImages[this.currentAnimation] || this.spriteImages['walk'] || this.spriteImages[Object.keys(this.spriteImages)[0]];
		}
		return this.spriteImages;
	}

	hasMultipleSprites() {
		return this.spriteImages && typeof this.spriteImages === 'object' && this.spriteImages !== null && !this.spriteImages.nodeName;
	}

	setAnimation(animationName, duration = null) {
		if (this.currentAnimation === animationName && duration === null) return;
		if (!this.spriteConfig.animations[animationName]) return;
		if (!this.hasMultipleSprites() && animationName !== 'walk') return;
		
		this.currentAnimation = animationName;
		this.currentFrame = 0;
		this.frameTime = 0;
		this.customAnimationDuration = duration;
		
		if (duration !== null) {
			const anim = this.spriteConfig.animations[animationName];
			if (anim && anim.frames > 0) {
				this.frameDuration = duration / anim.frames;
			}
		} else {
			this.frameDuration = 150;
		}
		
		this.calculateFrameDimensions();
	}

	setDirection(direction) {
		this.currentDirection = direction;
		this.forcedDirection = direction;
	}

	update(deltaTime, isMoving, directionX, directionY) {
		if (this.currentAnimation === 'walk') {
			if (isMoving) {
				const anim = this.spriteConfig.animations[this.currentAnimation];
				
				if (!this.wasMoving) {
					if (anim.frames > 1) {
						this.currentFrame = 1 % anim.frames;
					}
					this.frameTime = 0;
				}
				
				this.frameTime += deltaTime;
				
				if (this.frameTime >= this.frameDuration) {
					this.frameTime = 0;
					this.currentFrame = (this.currentFrame + 1) % anim.frames;
				}
				
				if (this.forcedDirection === null) {
					this.updateDirection(directionX, directionY);
				}
				this.wasMoving = true;
			} else {
				this.currentFrame = 0;
				this.frameTime = 0;
				this.wasMoving = false;
			}
		} else {
			this.frameTime += deltaTime;
			const anim = this.spriteConfig.animations[this.currentAnimation];
			
			if (this.frameTime >= this.frameDuration) {
				this.frameTime = 0;
				this.currentFrame = (this.currentFrame + 1) % anim.frames;
			}
			
			if (this.forcedDirection === null && isMoving) {
				this.updateDirection(directionX, directionY);
			}
		}
	}

	updateDirection(directionX, directionY) {
		const angle = Math.atan2(directionY, directionX);
		const degrees = angle * (180 / Math.PI);
		const normalizedDegrees = (degrees + 360) % 360;
		
		if (normalizedDegrees >= 337.5 || normalizedDegrees < 22.5) {
			this.currentDirection = 'right';
		} else if (normalizedDegrees >= 22.5 && normalizedDegrees < 67.5) {
			this.currentDirection = 'downRight';
		} else if (normalizedDegrees >= 67.5 && normalizedDegrees < 112.5) {
			this.currentDirection = 'down';
		} else if (normalizedDegrees >= 112.5 && normalizedDegrees < 157.5) {
			this.currentDirection = 'downLeft';
		} else if (normalizedDegrees >= 157.5 && normalizedDegrees < 202.5) {
			this.currentDirection = 'left';
		} else if (normalizedDegrees >= 202.5 && normalizedDegrees < 247.5) {
			this.currentDirection = 'upLeft';
		} else if (normalizedDegrees >= 247.5 && normalizedDegrees < 292.5) {
			this.currentDirection = 'up';
		} else if (normalizedDegrees >= 292.5 && normalizedDegrees < 337.5) {
			this.currentDirection = 'upRight';
		}
	}

	render(renderer, x, y, scale = 1) {
		const spriteImage = this.getCurrentSpriteImage();
		if (!spriteImage) return;

		this.calculateFrameDimensions();

		const anim = this.spriteConfig.animations[this.currentAnimation];
		const rows = anim.rows || this.spriteConfig.rows;
		const directionRow = rows === 1 ? 0 : this.spriteConfig.directions[this.currentDirection];
		const sourceX = this.currentFrame * this.frameWidth;
		const sourceY = directionRow * this.frameHeight;

		renderer.ctx.save();
		
		const shadowWidth = this.frameWidth * scale * 0.5;
		const shadowHeight = shadowWidth * 0.25;
		const shadowX = x + (this.frameWidth * scale - shadowWidth) / 2;
		const shadowY = y + this.frameHeight * scale - shadowHeight - 25;
		
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
		renderer.ctx.beginPath();
		renderer.ctx.ellipse(shadowX + shadowWidth / 2, shadowY + shadowHeight / 2, shadowWidth / 2, shadowHeight / 2, 0, 0, Math.PI * 2);
		renderer.ctx.fill();
		
		renderer.ctx.imageSmoothingEnabled = false;
		renderer.ctx.drawImage(
			spriteImage,
			sourceX,
			sourceY,
			this.frameWidth,
			this.frameHeight,
			x,
			y,
			this.frameWidth * scale,
			this.frameHeight * scale
		);
		renderer.ctx.restore();
	}

	getFrameSize(scale = 1) {
		this.calculateFrameDimensions();
		return {
			width: this.frameWidth * scale,
			height: this.frameHeight * scale
		};
	}
}

