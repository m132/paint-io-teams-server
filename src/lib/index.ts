
export { Player } from './player.js';
export { Server } from './server.js';
export { Stage } from './stage.js';
export { TileMap } from './tilemap.js';
export { VERSION } from './generated/version.js';

export type Coordinates = [x: number, y: number];

/* odd are assumed to be horizontal, even are consequently vertical */
export enum Direction {
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3
}
