export const HubCollisions = [
	{ x: 0, y: 0, width: 350, height: 450 },
    { x: 0, y: 450, width: 75, height: 250 },
    { x:0, y: 725, width: 350, height: 500 },
    { x: 470, y: 0, width: 375, height: 450 },
    { x: 750, y: 450, width: 100, height: 600 },
    { x: 475, y: 725, width: 500, height: 500 },
];

export const HubEvents = [
	{
		id: 'leave_hub',
		x: 350,
		y: 975,
		width: 120,
		height: 50,
		label: 'Quitter le village',
		color: 'rgba(0, 255, 0, 0.3)'
	},
	{
		id: 'map_selection',
		x: 350,
		y: 0,
		width: 120,
		height: 50,
		label: 'Sélection de Map',
		color: 'rgba(0, 100, 255, 0.3)'
	},
	{
		id: 'shop',
		x: 100,
		y: 500,
		width: 80,
		height: 80,
		label: 'Boutique',
		color: 'rgba(255, 255, 0, 0.3)'
	}
];

const TILE_SIZE = 32;

function expandTileRanges(tiles) {
	const expandedTiles = [];
	
	for (const tile of tiles) {
		if (tile.fromX !== undefined || tile.x1 !== undefined || tile.toX !== undefined || tile.x2 !== undefined) {
			const fromX = tile.fromX ?? tile.x1 ?? tile.x;
			const fromY = tile.fromY ?? tile.y1 ?? tile.y;
			const toX = tile.toX ?? tile.x2 ?? tile.x;
			const toY = tile.toY ?? tile.y2 ?? tile.y;
			
			const minX = Math.min(fromX, toX);
			const maxX = Math.max(fromX, toX);
			const minY = Math.min(fromY, toY);
			const maxY = Math.max(fromY, toY);
			
			for (let x = minX; x <= maxX; x++) {
				for (let y = minY; y <= maxY; y++) {
					expandedTiles.push({ x, y });
				}
			}
		} else {
			expandedTiles.push(tile);
		}
	}
	
	return expandedTiles;
}

export function tilesToCollisionRects(tiles, tileSize = TILE_SIZE) {
	const expandedTiles = expandTileRanges(tiles);
	return expandedTiles.map(tile => ({
		x: (tile.x - 1) * tileSize,
		y: (tile.y - 1) * tileSize,
		width: tileSize,
		height: tileSize
	}));
}

export const MapTileCollisions = {
	forest: [
		{ fromX: 0, fromY: 0, toX: 16, toY: 7 },
		{ fromX: 0, fromY: 6, toX: 14, toY: 9 },
		{ fromX: 0, fromY: 8, toX: 10, toY: 11 },
		{ fromX: 0, fromY: 10, toX: 8, toY: 15 },
		{ fromX: 0, fromY: 15, toX: 6, toY: 17 },
		{ fromX: 0, fromY: 17, toX: 4, toY: 64 },
		{ fromX: 4, fromY: 26, toX: 6, toY: 33 },
		{ fromX: 4, fromY: 44, toX: 6, toY: 64 },
		{ fromX: 4, fromY: 47, toX: 8, toY: 64 },
		{ fromX: 4, fromY: 49, toX: 10, toY: 64 },
		{ fromX: 4, fromY: 51, toX: 12, toY: 64 },
		{ fromX: 4, fromY: 51, toX: 14, toY: 64 },
		{ fromX: 4, fromY: 53, toX: 16, toY: 64 },
		{ fromX: 17, fromY: 61, toX: 64, toY: 64 },
		{ fromX: 57, fromY: 51, toX: 64, toY: 64 },
		{ fromX: 59, fromY: 45, toX: 64, toY: 50 },
		{ fromX: 61, fromY: 0, toX: 64, toY: 44 },
		{ fromX: 16, fromY: 0, toX: 64, toY: 3 },
		{ fromX: 16, fromY: 3, toX: 40, toY: 5 },
		{ fromX: 19, fromY: 5, toX: 34, toY: 7 },
		{ fromX: 21, fromY: 7, toX: 32, toY: 9 },
		{ fromX: 53, fromY: 3, toX: 60, toY: 5 },
		{ fromX: 55, fromY: 5, toX: 61, toY: 19 },
		
		{ fromX: 57, fromY: 20, toX: 60, toY: 21 },
		{ fromX: 59, fromY: 22, toX: 60, toY: 23 },
	
		{ fromX: 17, fromY: 53, toX: 57, toY: 64 },
		
	],
	mountain: [],
	cave: [],
	desert: [],
	volcano: []
};

export const MapCollisionColors = {
	forest: 'rgba(100, 255, 100, 0.5)',
	mountain: 'rgba(150, 150, 200, 0.5)',
	cave: 'rgba(100, 100, 150, 0.5)',
	desert: 'rgba(255, 200, 100, 0.5)',
	volcano: 'rgba(255, 100, 50, 0.5)'
};



