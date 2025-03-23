FlowField JavaScript implementation. Generally built for use in screeps game.

# Installation

Copy `flowField.js` into your screeps branch directory.

# Usage

```js
const FlowField = require('flowField');
// require('flowField'); - or just like that if you keep registered FlewField class as global

// basic usage
const flowField = new FlowField(50, 50, {directions: true});

// define array of sources/targets (supports multiple sources)
const sources = [
	{x: 25, y: 25, cost: 0} // cost - initial cost. It is optional, by default will be 0
];

// if want to use costMatrix
const matrix = new PathFinder.CostMatrix();

// if want to use room terrain
const terrain = new Room.Terrain(roomName);
const terrainCost = {
	0: 1, // plainCost
	[TERRAIN_MASK_SWAMP]: 5, // swampCost
	[TERRAIN_MASK_WALL]: 255,
	[TERRAIN_MASK_WALL | TERRAIN_MASK_SWAMP]: 255,
};
const costCallback = (x, y) => {
	// use value from CostMatrix
	return matrix.get(x, y);
	
	// or use value from terrain
	// return terrainCost[terrain.get(x, y)];
};
const maxCost = 255;

// run flowField generation (can run multiple times with different callbacks and sources. data will be cleared before run)
flowField.generate(
	// array of sources
	sources,
	
	// cost callback for terrain data. 255 or larger values treated as unpathable
	costCallback,
	
	// max cost (will not propagate further from tiles that reach this cost or higher).
	// optional, by default sets to 255 or 65535 (if option uint16 is true)
	maxCost
);

const direction = flowField.getDirection(x, y); // get direction for any given coords (if directions option set to true)
const distance = flowField.getDistance(x, y); // get distance for any given coords
```

## Options

### uint16

Default: `false`

Sets distance array type as Uint16Array (instead of Uint8Array). Can store distance up to 65535 instead of just 255. Use for potential large costs values or for large flowFields.

```js
const flowField = new FlowField(50, 50, {uint16: true});

// larger size flowField
const flowField2 = new FlowField(147, 147, {uint16: true});
```

### directions

Default: `false`

Set to `true` if want to use directions (retreived via `getDirection(x, y)`). By default it's disabled.

```js
const flowField = new FlowField(50, 50, {directions: true});
flowField.generate(/* ... */);

const direction = flowField.getDirection(x, y);
```

## Visualize FlowFIeld

```js
const DIRECTION_TO_OFFSET = [
	[0, 0],
	[0, -1],
	[1, -1],
	[1, 0],
	[1, 1],
	[0, 1],
	[-1, 1],
	[-1, 0],
	[-1, -1],
];

const visual = new RoomVisual(roomName);

// visualize directions (only if option 'directions' was set to true)
for (let x = 1; x < 49; x++) {
	for (let y = 1; y < 49; y++) {
		const direction = flowField.getDirection(x, y);
		if (direction > 0) {
			const [dx, dy] = DIRECTION_TO_OFFSET[direction];
			visual.line(x, y, x + 0.4 * dx, y + 0.4 * dy, {color: 'white', width: 0.1, opacity: 0.6});
		}
	}
}

// visualize distance (pick on or the other unless they will visually interfere)
const maxCost = 255; // can change this value
for (let x = 1; x < 49; x++) {
	for (let y = 1; y < 49; y++) {
		const value = flowField.getDistance(x, y);
		if (value < 255) {
			const hue = Math.floor(360 * value / maxCost);
			visual.circle(x, y, {radius: 0.2, fill: `hsl(${hue}, 100%, 50%)`, opacity: 0.6});
		}
	}
}
```
