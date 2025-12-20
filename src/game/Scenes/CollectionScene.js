import { PokemonSprites } from '../Config/SpriteConfig.js';
import { MapEnemies, EnemyTypes } from '../Config/EnemyConfig.js';
import { HubMenuConfig, MainMenuConfig } from '../Config/MenuConfig.js';

export default class CollectionScene {
	constructor(engine) {
		this.engine = engine;
		this.currentCategory = 'pokemons';
		this.pokemonImages = {};
		this.mapIcons = {};
		this.loadPokemonImages();
		this.loadMapIcons();
	}

	getAllPokemons() {
		const pokemonSet = new Set();
		Object.keys(PokemonSprites).forEach(pokemonName => {
			pokemonSet.add(pokemonName);
		});
		Object.keys(MapEnemies).forEach(mapId => {
			const enemyPool = MapEnemies[mapId];
			enemyPool.forEach(enemyData => {
				const enemyType = EnemyTypes[enemyData.type];
				if (enemyType && enemyType.pokemon) {
					pokemonSet.add(enemyType.pokemon);
				}
			});
		});
		return Array.from(pokemonSet).sort();
	}

	getAllMaps() {
		return [
			{ id: 0, name: 'Forêt Mystique', image: 'forest' },
			{ id: 1, name: 'Montagne Givrée', image: 'mountain' },
			{ id: 2, name: 'Grotte Sombre', image: 'cave' },
			{ id: 3, name: 'Désert Aride', image: 'desert' },
			{ id: 4, name: 'Volcan Ardent', image: 'volcano' }
		];
	}

	loadPokemonImages() {
		const allPokemons = this.getAllPokemons();
		allPokemons.forEach(pokemonName => {
			const imagePath = process.env.PUBLIC_URL + `/sprites/pokemon/${pokemonName}/Normal.png`;
			const img = new Image();
			img.src = imagePath;
			this.pokemonImages[pokemonName] = img;
		});
	}

	loadMapIcons() {
		const maps = this.getAllMaps();
		maps.forEach(map => {
			const imagePath = process.env.PUBLIC_URL + `/maps/${map.image}_icon.jpg`;
			const img = new Image();
			img.src = imagePath;
			this.mapIcons[map.id] = img;
		});
	}

	setCategory(category) {
		this.currentCategory = category;
	}

	getCollectionMenuConfig() {
		return {
			title: 'COLLECTION',
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
					label: 'Pokemons',
					onHover: (engine) => {
						this.setCategory('pokemons');
					},
					action: (engine) => {}
				},
				{
					label: 'Items',
					onHover: (engine) => {
						this.setCategory('items');
					},
					action: (engine) => {}
				},
				{
					label: 'Map',
					onHover: (engine) => {
						this.setCategory('map');
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
		this.engine.menuManager.openMenu(this.getCollectionMenuConfig());
	}

	update(deltaTime) {
		this.engine.menuManager.update();
	}

	render(renderer) {
		this.renderCollection(renderer);
		this.engine.menuManager.render(renderer);
	}

	renderCollection(renderer) {
		const gridPadding = 40;
		const menuWidth = renderer.width / 4;
		const gridWidth = renderer.width - menuWidth - gridPadding * 2;
		const gridHeight = renderer.height - gridPadding * 2;
		const gridX = menuWidth + gridPadding;
		const gridY = gridPadding;

		renderer.drawRect(gridX, gridY, gridWidth, gridHeight, 'rgba(0, 0, 50, 0.6)');
		renderer.drawStrokeRect(gridX, gridY, gridWidth, gridHeight, '#fff', 3);

		const categoryTitles = {
			pokemons: 'POKEMONS',
			items: 'ITEMS',
			map: 'MAP'
		};
		renderer.drawText(categoryTitles[this.currentCategory], gridX + 30, gridY + 50, '28px', '#fff', 'left');

		const cols = 10;
		const cellSize = 60;
		const cellSpacing = 10;
		const startX = gridX + 30;
		let currentY = gridY + 80;

		if (this.currentCategory === 'pokemons') {
			const allPokemons = this.getAllPokemons();
			this.renderPokemonGrid(renderer, allPokemons, startX, currentY, cols, cellSize, cellSpacing);
		} else if (this.currentCategory === 'map') {
			const allMaps = this.getAllMaps();
			const collectionData = allMaps.map(map => ({
				id: map.id,
				name: map.name,
				image: map.image,
				unlocked: this.engine.playedMaps.has(map.id)
			}));
			this.renderMapGrid(renderer, collectionData, startX, currentY, cols, cellSize, cellSpacing);
		}
	}

	formatNumber(num) {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'k';
		}
		return num.toString();
	}

	renderPokemonGrid(renderer, pokemons, startX, startY, cols, cellSize, cellSpacing) {
		pokemons.forEach((pokemonName, index) => {
			const col = index % cols;
			const row = Math.floor(index / cols);
			const x = startX + col * (cellSize + cellSpacing);
			const y = startY + row * (cellSize + cellSpacing);

			const isPlayed = this.engine.playedPokemons.has(pokemonName);
			const isEncountered = this.engine.encounteredPokemons.has(pokemonName);
			const isUnlocked = isPlayed || isEncountered;

			if (isUnlocked) {
				renderer.drawRect(x, y, cellSize, cellSize, '#4a90e2');
				renderer.drawStrokeRect(x, y, cellSize, cellSize, isPlayed ? '#ffd700' : '#fff', 2);
				
				const pokemonImage = this.pokemonImages[pokemonName];
				if (pokemonImage && pokemonImage.complete && pokemonImage.naturalHeight > 0) {
					renderer.ctx.save();
					renderer.ctx.drawImage(pokemonImage, x + 2, y + 2, cellSize - 4, cellSize - 4);
					renderer.ctx.restore();
				}

				if (!isPlayed && this.engine.defeatedPokemonCounts[pokemonName]) {
					const count = this.engine.defeatedPokemonCounts[pokemonName];
					const countText = this.formatNumber(count);
					
					renderer.ctx.save();
					renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
					renderer.ctx.fillRect(x, y + cellSize - 16, cellSize, 16);
					
					renderer.ctx.fillStyle = '#fff';
					renderer.ctx.font = 'bold 10px Pokemon';
					renderer.ctx.textAlign = 'center';
					renderer.ctx.textBaseline = 'middle';
					renderer.ctx.fillText(countText, x + cellSize / 2, y + cellSize - 8);
					renderer.ctx.restore();
				}
			} else {
				renderer.drawRect(x, y, cellSize, cellSize, '#333');
				renderer.drawStrokeRect(x, y, cellSize, cellSize, '#555', 2);
				renderer.drawText('?', x + cellSize / 2, y + cellSize / 2 + 8, '24px', '#666', 'center');
			}
		});
	}

	renderMapGrid(renderer, maps, startX, startY, cols, cellSize, cellSpacing) {
		maps.forEach((map, index) => {
			const col = index % cols;
			const row = Math.floor(index / cols);
			const x = startX + col * (cellSize + cellSpacing);
			const y = startY + row * (cellSize + cellSpacing);

			if (map.unlocked) {
				renderer.drawRect(x, y, cellSize, cellSize, '#4a90e2');
				renderer.drawStrokeRect(x, y, cellSize, cellSize, '#fff', 2);
				
				const mapIcon = this.mapIcons[map.id];
				if (mapIcon && mapIcon.complete && mapIcon.naturalHeight > 0) {
					renderer.ctx.save();
					renderer.ctx.drawImage(mapIcon, x + 2, y + 2, cellSize - 4, cellSize - 4);
					renderer.ctx.restore();
				}
			} else {
				renderer.drawRect(x, y, cellSize, cellSize, '#333');
				renderer.drawStrokeRect(x, y, cellSize, cellSize, '#555', 2);
				renderer.drawText('?', x + cellSize / 2, y + cellSize / 2 + 8, '24px', '#666', 'center');
			}
		});
	}
}
