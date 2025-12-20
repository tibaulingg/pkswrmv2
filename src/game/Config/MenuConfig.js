export const MainMenuConfig = {
	title: 'POKSRM',
	style: 'left',
	isMainMenu: true,
	options: [
		{
			label: 'Jouer',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.changeScene('game');
			}
		},
		{
			label: 'Collection',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.pushScene('collection');
			}
		},
		{
			label: 'Paramètres',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.pushScene('settings');
			}
		},
		{
			label: 'Exit',
			action: (engine) => {
				window.close();
			}
		}
	]
};

export const HubMenuConfig = {
	title: 'Village',
	style: 'left',
	closeable: true,
	options: [
		{
			label: 'Collection',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.pushScene('collection');
			}
		},
		{
			label: 'Paramètres',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.pushScene('settings');
			}
		},
		{
			label: 'Menu Principal',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.changeScene('menu');
			}
		}
	]
};

export const PauseMenuConfig = {
	title: 'PAUSE',
	style: 'right',
	closeable: true,
	options: [
		{
			label: 'Reprendre',
			action: (engine) => {
				engine.menuManager.closeMenu();
			}
		},
		{
			label: 'Paramètres',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.pushScene('settings');
			}
		},
		{
			label: 'Recommencer',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.changeScene('game');
			}
		},
		{
			label: 'Menu Principal',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.changeScene('menu');
			}
		}
	]
};


