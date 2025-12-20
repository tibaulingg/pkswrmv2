import { MapEnemies, EnemyTypes } from '../Config/EnemyConfig.js';

export default class MapSelectionScene {
	constructor(engine) {
		this.engine = engine;
		this.maps = this.generateMapsData();
		this.selectedMapIndex = 0;
		this.pokemonImages = {};
		this.mapIcons = {};
		this.loadPokemonImages();
		this.loadMapIcons();
	}

	generateMapsData() {
		return [
			{ 
				id: 0, 
				name: 'Forêt Mystique', 
				unlocked: true, 
				difficulty: 1, 
				image: 'forest',
				pokemons: [1, 2, 3, 5, 8],
				boss: 12,
				bossTimer: 180000,
				bossType: 'boss_rattata'
			},
			{ 
				id: 1, 
				name: 'Montagne Givrée', 
				unlocked: false, 
				difficulty: 2, 
				image: 'mountain',
				pokemons: [4, 7, 12, 15],
				boss: 18,
				bossTimer: 180000,
				bossType: 'boss_rattata'
			},
			{ 
				id: 2, 
				name: 'Grotte Sombre', 
				unlocked: false, 
				difficulty: 3, 
				image: 'cave',
				pokemons: [6, 9, 11, 13, 18],
				boss: 25,
				bossTimer: 240000,
				bossType: 'boss_rattata'
			},
			{ 
				id: 3, 
				name: 'Désert Aride', 
				unlocked: false, 
				difficulty: 4, 
				image: 'desert',
				pokemons: [10, 14, 16, 20],
				boss: 30,
				bossTimer: 300000,
				bossType: 'boss_rattata'
			},
			{ 
				id: 4, 
				name: 'Volcan Ardent', 
				unlocked: false, 
				difficulty: 5, 
				image: 'volcano',
				pokemons: [17, 19, 22, 25, 30],
				boss: 50,
				bossTimer: 360000,
				bossType: 'boss_rattata'
			}
		];
	}

	setSelectedMap(index) {
		this.selectedMapIndex = index;
	}

	getMapPokemons(mapId) {
		const enemyPool = MapEnemies[mapId] || [];
		const pokemonSet = new Set();
		
		enemyPool.forEach(enemyData => {
			const enemyType = EnemyTypes[enemyData.type];
			if (enemyType && enemyType.pokemon) {
				pokemonSet.add(enemyType.pokemon);
			}
		});
		
		return Array.from(pokemonSet);
	}

	loadPokemonImages() {
		const allPokemonNames = new Set();
		
		Object.keys(MapEnemies).forEach(mapId => {
			const pokemons = this.getMapPokemons(parseInt(mapId));
			pokemons.forEach(pokemon => allPokemonNames.add(pokemon));
		});
		
		this.maps.forEach(map => {
			if (map.bossType) {
				const bossType = EnemyTypes[map.bossType];
				if (bossType && bossType.pokemon) {
					allPokemonNames.add(bossType.pokemon);
				}
			}
		});
		
		allPokemonNames.forEach(pokemonName => {
			const imagePath = process.env.PUBLIC_URL + `/sprites/pokemon/${pokemonName}/Normal.png`;
			const img = new Image();
			img.src = imagePath;
			this.pokemonImages[pokemonName] = img;
		});
	}

	loadMapIcons() {
		const maps = [
			{ id: 0, image: 'forest' },
			{ id: 1, image: 'mountain' },
			{ id: 2, image: 'cave' },
			{ id: 3, image: 'desert' },
			{ id: 4, image: 'volcano' }
		];
		maps.forEach(map => {
			const imagePath = process.env.PUBLIC_URL + `/maps/${map.image}_icon.jpg`;
			const img = new Image();
			img.src = imagePath;
			this.mapIcons[map.image] = img;
		});
	}

	getMapSelectionMenuConfig() {
		const mapOptions = this.maps.map((map, index) => ({
			label: map.name,
			disabled: !map.unlocked,
			onHover: (engine) => {
				this.setSelectedMap(index);
			},
			action: (engine) => {
				if (!map.unlocked) return;
				engine.menuManager.closeMenu();
				engine.sceneManager.popScene();
				engine.gameManager.startGame(map);
			}
		}));

		mapOptions.push({
			label: 'Retour',
			action: (engine) => {
				engine.menuManager.closeMenu();
				engine.sceneManager.popScene();
			}
		});

		return {
			title: 'MAPS',
			style: 'left',
			closeable: true,
			onClose: (engine) => {
				engine.sceneManager.popScene();
			},
			options: mapOptions
		};
	}

	init() {
		this.selectedMapIndex = 0;
		this.engine.menuManager.openMenu(this.getMapSelectionMenuConfig());
	}

	update(deltaTime) {
		this.engine.menuManager.update();
	}

	render(renderer) {
		this.renderMapDetails(renderer);
		this.engine.menuManager.render(renderer);
	}

	renderMapDetails(renderer) {
		const gridPadding = 40;
		const menuWidth = renderer.width / 4;
		const gridWidth = renderer.width - menuWidth - gridPadding * 2;
		const gridHeight = (renderer.height - gridPadding * 2) / 2.5;
		const gridX = menuWidth + gridPadding;
		const gridY = gridPadding;

		renderer.drawRect(gridX, gridY, gridWidth, gridHeight, 'rgba(0, 0, 50, 0.6)');
		renderer.drawStrokeRect(gridX, gridY, gridWidth, gridHeight, '#fff', 3);

		const selectedMap = this.maps[this.selectedMapIndex];

		if (!selectedMap) return;

		const isLocked = !selectedMap.unlocked;
		const contentX = gridX + 40;
		const contentY = gridY + 40;

		const imageSize = 80;
		renderer.drawRect(contentX, contentY, imageSize, imageSize, '#0f3460');
		renderer.drawStrokeRect(contentX, contentY, imageSize, imageSize, '#2c5aa0', 2);
		
		renderer.ctx.save();
		if (isLocked) {
			renderer.ctx.globalAlpha = 0.4;
		}
		
		const mapIcon = this.mapIcons[selectedMap.image];
		if (mapIcon && mapIcon.complete && mapIcon.naturalHeight > 0) {
			renderer.drawImage(mapIcon, contentX, contentY, imageSize, imageSize);
		} else {
			renderer.drawText('[Map]', contentX + imageSize / 2, contentY + imageSize / 2 - 5, '12px', '#666', 'center');
			renderer.drawText(selectedMap.image, contentX + imageSize / 2, contentY + imageSize / 2 + 12, '10px', '#555', 'center');
		}
		renderer.ctx.restore();

		const titleX = contentX + imageSize + 20;
		const titleColor = isLocked ? '#666' : '#fff';
		renderer.drawText(selectedMap.name.toUpperCase(), titleX, contentY + 70, '28px', titleColor, 'left');

		const difficultyY = contentY + imageSize + 20;
		const starSize = 22;
		
		for (let i = 0; i < 5; i++) {
			const filled = i < selectedMap.difficulty;
			const starX = contentX + i * (starSize + 6);
			
			renderer.drawRect(starX, difficultyY, starSize, starSize, filled ? '#ffd700' : '#333');
			renderer.drawStrokeRect(starX, difficultyY, starSize, starSize, filled ? '#ffed4e' : '#555', 2);
			
			if (filled) {
				renderer.drawRect(starX + 6, difficultyY + 4, 8, 8, '#ffed4e');
				renderer.drawRect(starX + 4, difficultyY + 6, 4, 4, '#fff');
			}
		}
		
		const difficultyTextX = contentX + 5 * (starSize + 6) + 10;
		const difficultyTextColor = isLocked ? '#555' : '#aaa';
		renderer.drawText('Difficulté', difficultyTextX, difficultyY + 16, '16px', difficultyTextColor, 'left');

		const pokemonY = difficultyY + starSize + 20;
		const pokemonCellSize = 45;
		const pokemonSpacing = 8;
		
		const mapPokemons = this.getMapPokemons(selectedMap.id);
		
		renderer.ctx.save();
		if (isLocked) {
			renderer.ctx.globalAlpha = 0.4;
		}
		
		mapPokemons.forEach((pokemonName, index) => {
			const x = contentX + index * (pokemonCellSize + pokemonSpacing);
			
			renderer.drawRect(x, pokemonY, pokemonCellSize, pokemonCellSize, '#4a90e2');
			renderer.drawStrokeRect(x, pokemonY, pokemonCellSize, pokemonCellSize, '#fff', 2);
			
			const pokemonImage = this.pokemonImages[pokemonName];
			if (pokemonImage && pokemonImage.complete && pokemonImage.naturalHeight > 0) {
				renderer.drawImage(pokemonImage, x + 2, pokemonY + 2, pokemonCellSize - 4, pokemonCellSize - 4);
			} else {
				renderer.drawText('?', x + pokemonCellSize / 2, pokemonY + pokemonCellSize / 2 + 5, '14px', '#fff', 'center');
			}
		});

		const bossX = contentX + mapPokemons.length * (pokemonCellSize + pokemonSpacing);
		
		renderer.drawRect(bossX, pokemonY, pokemonCellSize, pokemonCellSize, '#1a0a0a');
		renderer.drawStrokeRect(bossX, pokemonY, pokemonCellSize, pokemonCellSize, '#cc4444', 3);
		
		renderer.ctx.save();
		renderer.ctx.shadowColor = '#cc4444';
		renderer.ctx.shadowBlur = 10;
		renderer.ctx.strokeStyle = '#cc4444';
		renderer.ctx.lineWidth = 3;
		renderer.ctx.strokeRect(bossX, pokemonY, pokemonCellSize, pokemonCellSize);
		renderer.ctx.restore();
		
		if (selectedMap.bossType) {
			const bossType = EnemyTypes[selectedMap.bossType];
			if (bossType && bossType.pokemon) {
				const bossPokemonImage = this.pokemonImages[bossType.pokemon];
				if (bossPokemonImage && bossPokemonImage.complete && bossPokemonImage.naturalHeight > 0) {
					renderer.drawImage(bossPokemonImage, bossX + 2, pokemonY + 2, pokemonCellSize - 4, pokemonCellSize - 4);
				} else {
					renderer.drawText('?', bossX + pokemonCellSize / 2, pokemonY + pokemonCellSize / 2 + 5, '14px', '#ff4444', 'center');
				}
			} else {
				renderer.drawText(selectedMap.boss.toString(), bossX + pokemonCellSize / 2, pokemonY + pokemonCellSize / 2 + 5, '16px', '#ff4444', 'center');
			}
		} else {
			renderer.drawText(selectedMap.boss.toString(), bossX + pokemonCellSize / 2, pokemonY + pokemonCellSize / 2 + 5, '16px', '#ff4444', 'center');
		}
		renderer.ctx.restore();
	}
}

