// github: https://github.com/NesCafe62/screeps-flow-field

const DIRECTION_TO_OFFSET = [
	0, 0,
	0, -1,
	1, -1,
	1, 0,
	1, 1,
	0, 1,
	-1, 1,
	-1, 0,
	-1, -1,
];

global.FLOWFIELD_MAX_COST = 65535;
global.FLOWFIELD_MAX_COST_UINT8 = 255;

class FlowField {

	constructor(width, height, options = {}) {
		const {uint16 = false, directions = false} = options;
		this.width = width;
		this.height = height;
		this.uint16 = uint16;
		const length = width * height;
		this.data = uint16
			? new Uint16Array(length)
			: new Uint8Array(length);
		this.directions = directions
			? new Uint8Array(length)
			: undefined;
	}

	get(x, y) {
		return this.data[y * this.width + x];
	}

	getDirection(x, y) {
		return this.directions[y * this.width + x];
	}

	generate(sources, costCallback, maxCost) {
		const width = this.width;
		const height = this.height;

		const directions = this.directions;
		const data = this.data;

		data.fill(this.uint16 ? FLOWFIELD_MAX_COST : FLOWFIELD_MAX_COST_UINT8);
		if (directions) {
			directions.fill(0);
		}

		const queue = [];
		for (const {x, y, cost: sourceCost = 0} of sources) {
			data[y * width + x] = 0;
			const cost = costCallback(x, y) + sourceCost;
			queue.push(x, y, cost);
		}

		while (queue.length > 0) {
			const length = queue.length;
			for (let i = 0; i < length; i += 3) {
				const x = queue[i];
				const y = queue[i + 1];
				const posCost = queue[i + 2];

				const distance = data[y * width + x] + posCost;

				for (let direction = 1; direction <= 8; direction++) {
					const px = x + DIRECTION_TO_OFFSET[direction * 2];
					const py = y + DIRECTION_TO_OFFSET[direction * 2 + 1];
					if (px < 0 || py < 0 || px >= width || py >= height) {
						continue;
					}
					const cost = costCallback(px, py);
					if (cost >= 255) {
						continue;
					}
					const index = py * width + px;
					if (distance < data[index]) {
						data[index] = distance;
						if (directions) {
							directions[index] = direction;
						}
						if (distance <= maxCost) {
							queue.push(px, py, cost);
						}
					}
				}
			}
			queue.splice(0, length);
		}
	}

}
module.exports = FlowField;


// comment this line to disable registering PathingManager globally
global.FlowField = FlowField;
