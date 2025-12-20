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
				console.log(`Unhandled event: ${eventId}`);
		}
	}

	openLeaveHubMenu() {
		const leaveMenuConfig = {
			title: 'Quitter le village ?',
			style: 'center',
			closeable: true,
			options: [
				{
					label: 'Oui',
					action: (engine) => {
						engine.menuManager.closeMenu();
						engine.sceneManager.changeScene('menu');
					}
				},
				{
					label: 'Non',
					action: (engine) => {
						engine.menuManager.closeMenu();
					}
				}
			]
		};
		this.engine.menuManager.openMenu(leaveMenuConfig);
	}

	openMapSelection() {
		this.engine.sceneManager.pushScene('mapSelection');
	}

	openShop() {
		console.log('Shop not implemented yet');
	}
}

