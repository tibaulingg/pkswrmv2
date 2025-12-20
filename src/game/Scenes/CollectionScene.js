import { PokemonSprites } from '../Config/SpriteConfig.js';
import { MapEnemies, EnemyTypes } from '../Config/EnemyConfig.js';

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
				engine.sceneManager.popScene();
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
						engine.sceneManager.popScene();
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

		let collectionData = [];
		if (this.currentCategory === 'pokemons') {
			const allPokemons = this.getAllPokemons();
			collectionData = allPokemons.map(pokemonName => ({
				id: pokemonName,
				name: pokemonName,
				unlocked: this.engine.encounteredPokemons.has(pokemonName) || this.engine.playedPokemons.has(pokemonName),
				played: this.engine.playedPokemons.has(pokemonName)
			}));
		} else if (this.currentCategory === 'map') {
			const allMaps = this.getAllMaps();
			collectionData = allMaps.map(map => ({
				id: map.id,
				name: map.name,
				image: map.image,
				unlocked: this.engine.playedMaps.has(map.id)
			}));
		} else {
			collectionData = [];
		}

		const cols = 10;
		const cellSize = 60;
		const cellSpacing = 10;
		const startX = gridX + 30;
		const startY = gridY + 80;

		collectionData.forEach((item, index) => {
			const col = index % cols;
			const row = Math.floor(index / cols);
			const x = startX + col * (cellSize + cellSpacing);
			const y = startY + row * (cellSize + cellSpacing);

			if (item.unlocked) {
				renderer.drawRect(x, y, cellSize, cellSize, '#4a90e2');
				renderer.drawStrokeRect(x, y, cellSize, cellSize, item.played ? '#ffd700' : '#fff', 2);
				
				if (this.currentCategory === 'pokemons') {
					const pokemonImage = this.pokemonImages[item.name];
					if (pokemonImage && pokemonImage.complete && pokemonImage.naturalHeight > 0) {
						renderer.ctx.save();
						renderer.ctx.drawImage(pokemonImage, x + 2, y + 2, cellSize - 4, cellSize - 4);
						renderer.ctx.restore();
					}
				} else if (this.currentCategory === 'map') {
					const mapIcon = this.mapIcons[item.id];
					if (mapIcon && mapIcon.complete && mapIcon.naturalHeight > 0) {
						renderer.ctx.save();
						renderer.ctx.drawImage(mapIcon, x + 2, y + 2, cellSize - 4, cellSize - 4);
						renderer.ctx.restore();
					}
				}
			} else {
				renderer.drawRect(x, y, cellSize, cellSize, '#333');
				renderer.drawStrokeRect(x, y, cellSize, cellSize, '#555', 2);
				renderer.drawText('?', x + cellSize / 2, y + cellSize / 2 + 8, '24px', '#666', 'center');
			}
		});
	}
}
