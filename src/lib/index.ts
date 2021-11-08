
import { Coordinates } from './coordinates.js';
import { Player } from './player.js';
export { Player };
export { Server } from './server.js';
export { Stage } from './stage.js';
export { TileMap } from './tilemap.js';
export { VERSION } from './generated/version.js';

/* odd are assumed to be horizontal, even are consequently vertical */
export enum Direction {
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3
}

export enum Team {
    SPECTATOR = 99,
    NEUTRAL = 0,
    FIRST = 1,
    SECOND = 2,
    THIRD = 3,
    FOURTH = 4
}

export type DeathNews = {
    attacker: Player,
    victim: Player,
    coordinates: Coordinates
}[];
