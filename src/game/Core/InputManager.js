export default class InputManager {
	constructor() {
		this.keys = {};
		this.lastKeyPressed = null;
		this.lastKeyValue = null;
		this.lastKeyWasNewPress = false;
		this.canvas = null;
		this.mouseX = 0;
		this.mouseY = 0;
		this.userInteracted = false;
		this.onFirstInteraction = null;

		window.addEventListener('keydown', (e) => {
			this.handleFirstInteraction();
			if (!this.keys[e.code]) {
				this.lastKeyPressed = e.code;
				this.lastKeyValue = e.key;
				this.lastKeyWasNewPress = true;
			} else {
				this.lastKeyWasNewPress = false;
			}
			this.keys[e.code] = true;
		});

		window.addEventListener('keyup', (e) => {
			this.keys[e.code] = false;
			if (this.lastKeyPressed === e.code) {
				this.lastKeyPressed = null;
				this.lastKeyValue = null;
				this.lastKeyWasNewPress = false;
			}
		});

		window.addEventListener('mousedown', () => {
			this.handleFirstInteraction();
		});

		window.addEventListener('touchstart', () => {
			this.handleFirstInteraction();
		});
	}

	handleFirstInteraction() {
		if (!this.userInteracted) {
			this.userInteracted = true;
			if (this.onFirstInteraction) {
				this.onFirstInteraction();
			}
		}
	}

	setCanvas(canvas) {
		this.canvas = canvas;
		
		this.canvas.addEventListener('mousemove', (e) => {
			const rect = this.canvas.getBoundingClientRect();
			this.mouseX = e.clientX - rect.left;
			this.mouseY = e.clientY - rect.top;
		});

		this.canvas.addEventListener('mousedown', () => {
			this.handleFirstInteraction();
		});

		this.canvas.addEventListener('click', () => {
			this.handleFirstInteraction();
		});
	}

	getMousePosition() {
		return { x: this.mouseX, y: this.mouseY };
	}

	isKeyDown(code) {
		return !!this.keys[code];
	}

	getLastKey() {
		if (!this.lastKeyWasNewPress || !this.lastKeyPressed) {
			return null;
		}
		
		const key = this.lastKeyPressed;
		
		if (!this.keys[key]) {
			return null;
		}
		
		return key;
	}

	consumeLastKey() {
		if (!this.lastKeyWasNewPress || !this.lastKeyPressed) {
			return null;
		}
		
		const key = this.lastKeyPressed;
		
		if (!this.keys[key]) {
			return null;
		}
		
		this.lastKeyPressed = null;
		this.lastKeyWasNewPress = false;
		return key;
	}

	getLastKeyValue() {
		return this.lastKeyValue;
	}

	consumeLastKeyValue() {
		const value = this.lastKeyValue;
		this.lastKeyValue = null;
		return value;
	}

	clearInput() {
		this.lastKeyPressed = null;
		this.lastKeyValue = null;
		this.lastKeyWasNewPress = false;
		this.keys = {};
	}
}

