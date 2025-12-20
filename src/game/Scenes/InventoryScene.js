import { HubMenuConfig, MainMenuConfig } from '../Config/MenuConfig.js';
import { getItemsByCategory, getCategoryName, getAllCategories, ItemConfig } from '../Config/ItemConfig.js';

export default class InventoryScene {
	constructor(engine) {
		this.engine = engine;
		this.currentCategory = 'consumables';
	}

	setCategory(category) {
		this.currentCategory = category;
	}

	getInventoryMenuConfig() {
		return {
			title: 'INVENTAIRE',
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
					label: 'Coffres',
					onHover: (engine) => {
						this.setCategory('chest');
					},
					action: (engine) => {}
				},
				{
					label: 'Reliques',
					onHover: (engine) => {
						this.setCategory('relics');
					},
					action: (engine) => {}
				},
				{
					label: 'Divers',
					onHover: (engine) => {
						this.setCategory('misc');
					},
					action: (engine) => {}
				},
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

	init() {
		this.engine.menuManager.openMenu(this.getInventoryMenuConfig());
	}

	update(deltaTime) {
		this.engine.menuManager.update();
	}

	render(renderer) {
		this.renderInventory(renderer);
		this.engine.menuManager.render(renderer);
	}

	renderInventory(renderer) {
		const gridPadding = 40;
		const menuWidth = renderer.width / 4;
		const gridWidth = renderer.width - menuWidth - gridPadding * 2;
		const gridHeight = renderer.height - gridPadding * 2;
		const gridX = menuWidth + gridPadding;
		const gridY = gridPadding;

		renderer.drawRect(gridX, gridY, gridWidth, gridHeight, 'rgba(0, 0, 50, 0.6)');
		renderer.drawStrokeRect(gridX, gridY, gridWidth, gridHeight, '#fff', 3);

		const categoryTitle = getCategoryName(this.currentCategory).toUpperCase();
		renderer.drawText(categoryTitle, gridX + 30, gridY + 50, '28px', '#fff', 'left');

		const cols = 10;
		const cellSize = 60;
		const cellSpacing = 10;
		const startX = gridX + 30;
		const startY = gridY + 80;

		const items = this.getCurrentCategoryItems();
		this.renderItemGrid(renderer, items, startX, startY, cols, cellSize, cellSpacing);
	}

	getCurrentCategoryItems() {
		const items = getItemsByCategory(this.currentCategory);
		
		return items
			.map(itemConfig => ({
				id: itemConfig.id,
				name: itemConfig.name,
				icon: itemConfig.icon,
				iconImage: itemConfig.iconImage,
				quantity: this.engine.inventory[itemConfig.id] || 0
			}))
			.filter(item => item.quantity > 0);
	}

	renderItemGrid(renderer, items, startX, startY, cols, cellSize, cellSpacing) {
		if (items.length === 0) {
			renderer.drawText('Aucun item dans cette catégorie', startX, startY + 50, '20px', '#888', 'left');
			return;
		}

		items.forEach((item, index) => {
			const col = index % cols;
			const row = Math.floor(index / cols);
			const x = startX + col * (cellSize + cellSpacing);
			const y = startY + row * (cellSize + cellSpacing);

			renderer.drawRect(x, y, cellSize, cellSize, '#4a90e2');
			renderer.drawStrokeRect(x, y, cellSize, cellSize, '#fff', 2);

			const itemImage = this.engine.sprites.get(`item_${item.id}`);
			if (item.iconImage && itemImage && itemImage.complete && itemImage.naturalWidth > 0 && itemImage.naturalHeight > 0) {
				renderer.ctx.save();
				renderer.ctx.drawImage(itemImage, x + 2, y + 2, cellSize - 4, cellSize - 4);
				renderer.ctx.restore();
			} else if (item.icon) {
				renderer.ctx.save();
				renderer.ctx.fillStyle = '#fff';
				renderer.ctx.font = 'bold 32px Arial';
				renderer.ctx.textAlign = 'center';
				renderer.ctx.textBaseline = 'middle';
				renderer.ctx.fillText(item.icon, x + cellSize / 2, y + cellSize / 2 - 8);
				renderer.ctx.restore();
			}

			renderer.ctx.save();
			renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			renderer.ctx.fillRect(x, y + cellSize - 16, cellSize, 16);
			
			renderer.ctx.fillStyle = '#fff';
			renderer.ctx.font = 'bold 10px Pokemon';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.textBaseline = 'middle';
			renderer.ctx.fillText(`x${item.quantity}`, x + cellSize / 2, y + cellSize - 8);
			renderer.ctx.restore();
		});
	}
}

