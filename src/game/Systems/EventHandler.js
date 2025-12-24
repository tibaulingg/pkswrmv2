export default class EventHandler {
	constructor(engine) {
		this.engine = engine;
	}

	handleEvent(eventId) {
		switch(eventId) {
			case 'leave_hub':
				this.openLeaveHubMenu();
				break;
			case 'map_selection':
				this.openMapSelection();
				break;
			case 'shop':
				this.openShop();
				break;
		default:
			break;
		}
	}

	openLeaveHubMenu() {
		const message = 'Retour au menu principal ?';
		
		const onYes = (engine) => {
			engine.sceneManager.changeScene('menu');
		};
		
		const onNo = (engine) => {
			engine.sceneManager.popScene();
		};
		
		this.engine.sceneManager.pushScene('confirmMenu', {
			message: message,
			onYes: onYes,
			onNo: onNo
		});
		
		this.engine.audio.play('ok', 0.3, 0.1);
	}

	openMapSelection() {
		this.engine.sceneManager.pushScene('mapSelection');
	}

	openShop() {
	}
}

