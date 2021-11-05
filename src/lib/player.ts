import { Coordinates, Direction } from './index.js';
import { Stage } from './stage.js';

export class Player {
    id: string = '';
    name: string = '';
    country: string = '';
    characterId: number = 0;

    coordinates: Coordinates;
    direction: {
        effective: Direction,
        requested: Direction
    };
    velocity: number = 4;
    stage: Stage | null = null;

    ping: number = 0;

    constructor() {
        this.coordinates = [0, 0];
        this.direction = {
            effective: Direction.DOWN,
            requested: Direction.DOWN
        }
    }

    update(state: object): void {
        Object.assign(this, state);
    }
}
