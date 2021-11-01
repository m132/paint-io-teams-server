import { EventEmitter } from 'events';

export interface ServerState {
    protocols: Protocol[],
    stages: Stage[]
}

export interface Protocol {
    // FIXME: narrow it down
    // new (server_state: ServerState): void;
}

export enum Direction {
    LEFT,
    UP,
    RIGHT,
    DOWN
}

export type Coordinates = [x: number, y: number];

export class Player {
    coordinates: Coordinates = [0, 0];
    direction: Direction = Direction.DOWN;
    velocity: number = 4;

    ping: number = 0;

    // FIXME: it shouldn't be possible to create a Player directly
    constructor(
        public id: string,
        public name: string,
        public country: string,
        public characterId: number
    ) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.characterId = characterId;
    }

    update(state: object): void {
        Object.assign(this, state);
    }
}

export class TileMap {
    constructor(
        public width: number,
        public height: number,
        public blockSize: number
    ) {
        this.width = width;
        this.height = height;
        this.blockSize = blockSize;
    }
}

export class Stage extends EventEmitter {
    players: Player[];
    tileMap: TileMap;

    #lastTick: number = 0;
    #interval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        super();
        this.players = [];
        this.tileMap = new TileMap(64, 64, 32);

        this.#lastTick = performance.now();
    }

    createPlayer(id: string, name: string, country: string, characterId: number): Player {
        let player = new Player(id, name, country, characterId);

        player.update({
            coordinates: [
                Math.random() * this.tileMap.width,
                Math.random() * this.tileMap.height
            ]
        });

        this.players.push(player);
        this.emit('playerJoined', player);
        return player;
    }

    destroyPlayer(player: Player): void {
        this.players.splice(this.players.indexOf(player), 1);
        this.emit('playerLeft', player);
    }

    tick(elapsedMs: number): this {
        let delta = elapsedMs / 1000;
        this.emit('beforeTick', delta);

        // interpolate coordinates of all players
        this.players.forEach((player: Player) => {
            switch (player.direction) {
                case Direction.LEFT:
                    player.coordinates[0] = Math.max(
                        0, player.coordinates[0] - (delta * player.velocity)
                    );
                    break;
                case Direction.UP:
                    player.coordinates[1] = Math.max(
                        0, player.coordinates[1] - (delta * player.velocity)
                    );
                    break;
                case Direction.RIGHT:
                    player.coordinates[0] = Math.min(
                        player.coordinates[0] + (delta * player.velocity), this.tileMap.width
                    );
                    break;
                case Direction.DOWN:
                    player.coordinates[1] = Math.min(
                        player.coordinates[1] + (delta * player.velocity), this.tileMap.height
                    );
                    break;
            }
        });

        this.emit('tick', delta);
        return this;
    }

    start(tickIntervalMs: number): this {
        this.stop();
        this.#interval = setInterval(() => {
            let now = performance.now();
            this.tick(now - this.#lastTick);
            this.#lastTick = now;
        }, tickIntervalMs);

        return this;
    }

    stop(): this {
        if (this.#interval) {
            clearInterval(this.#interval);
            this.#interval = null;
        }

        return this;
    }
}
