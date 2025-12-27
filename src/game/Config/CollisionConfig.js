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
		//3 tiles width on each side
		{ fromX: 0, fromY: 0, toX: 3, toY: 64 },
		{ fromX: 0, fromY: 0, toX: 64, toY: 3 },
		{ fromX: 62, fromY: 0, toX: 64, toY: 64 },
		{ fromX: 0, fromY: 62, toX: 64, toY: 64 },
	],
	forest_boss: [
		//{ fromX: 1, fromY: 1, toX: 500, toY: 500 }
	],
	montain: [],
	cave: [],
	desert: [],
	volcano: []
};

export const MapCollisionColors = {
	forest: 'rgba(100, 255, 100, 0.5)',
	montain: 'rgba(150, 150, 200, 0.5)',
	cave: 'rgba(100, 100, 150, 0.5)',
	desert: 'rgba(255, 200, 100, 0.5)',
	volcano: 'rgba(255, 100, 50, 0.5)'
};



