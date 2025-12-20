export default class EventSystem {
	constructor(events = []) {
		this.events = events;
		this.activeEvent = null;
		this.triggeredEvents = new Set();
	}

	setEvents(events) {
		this.events = events;
	}

	update(playerX, playerY, playerWidth, playerHeight, eventHandler) {
		let foundEvent = null;

		for (const event of this.events) {
			if (this.isPlayerInZone(playerX, playerY, playerWidth, playerHeight, event)) {
				foundEvent = event;
				break;
			}
		}

		if (foundEvent && foundEvent !== this.activeEvent) {
			this.activeEvent = foundEvent;
			console.log(`Entered zone: ${foundEvent.label}`);
			if (eventHandler) {
				eventHandler.handleEvent(foundEvent.id);
			}
		} else if (!foundEvent && this.activeEvent) {
			console.log(`Left zone: ${this.activeEvent.label}`);
			this.activeEvent = null;
		}

		return foundEvent;
	}

	triggerActiveEvent(eventHandler) {
		if (this.activeEvent) {
			eventHandler.handleEvent(this.activeEvent.id);
			return true;
		}
		return false;
	}

	getActiveEventId() {
		return this.activeEvent ? this.activeEvent.id : null;
	}

	isPlayerInZone(playerX, playerY, playerWidth, playerHeight, event) {
		return playerX < event.x + event.width &&
			   playerX + playerWidth > event.x &&
			   playerY < event.y + event.height &&
			   playerY + playerHeight > event.y;
	}

	render(renderer, debug = false) {
		if (!debug) return;

		this.events.forEach(event => {
			renderer.ctx.save();
			
			const isActive = event === this.activeEvent;
			
			renderer.ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 0.2)' : event.color;
			renderer.ctx.fillRect(event.x, event.y, event.width, event.height);
			
			renderer.ctx.strokeStyle = isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
			renderer.ctx.lineWidth = isActive ? 3 : 2;
			renderer.ctx.setLineDash([5, 5]);
			renderer.ctx.strokeRect(event.x, event.y, event.width, event.height);
			
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.font = '16px Pokemon, Arial';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.fillText(event.label, event.x + event.width / 2, event.y + event.height / 2 + 5);
			
			renderer.ctx.restore();
		});
	}
}

