import { EventEmitter } from 'events';

export interface Protocol extends EventEmitter {
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
    id: string = '';
    name: string = '';
    country: string = '';
    characterId: number = 0;

    coordinates: Coordinates;
    direction: Direction = Direction.DOWN;
    velocity: number = 4;
    stage: Stage | null = null;

    ping: number = 0;

    constructor() {
        this.coordinates = [0, 0];
    }

    update(state: object): void {
        Object.assign(this, state);
    }
}

export class TileMap {
    constructor(
        public width: number,
        public height: number,
    ) {
        this.width = width;
        this.height = height;
    }
}

export class Stage extends EventEmitter {
    players: Player[];
    tileMap: TileMap;

    #lastTick: number = 0;
    #interval: ReturnType<typeof setInterval> | null = null;

    constructor(
        public id: string
    ) {
        super();

        this.id = id;
        this.players = [];
        this.tileMap = new TileMap(109, 109);

        this.#lastTick = performance.now();
    }

    addPlayer(player: Player): Stage {
        player.update({
            coordinates: [
                Math.random() * this.tileMap.width,
                Math.random() * this.tileMap.height
            ],
            stage: this
        });

        this.players.push(player);
        this.emit('playerJoined', player);
        return this;
    }

    removePlayer(player: Player): Stage {
        player.stage = null;
        this.players.splice(this.players.indexOf(player), 1);
        this.emit('playerLeft', player);
        return this;
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

export class Server {
    #protocols: Protocol[];
    #stages: Stage[];

    constructor() {
        this.#protocols = [];
        this.#stages = [];
    }

    registerProtocol(protocol: Protocol): Server {
        this.#protocols.push(protocol);

        for (let stage of this.#stages)
            protocol.emit('stageRegistered', stage);

        return this;
    }

    registerStage(stage: Stage): Server {
        this.#stages.push(stage);

        for (let protocol of this.#protocols)
            protocol.emit('stageRegistered', stage);

        return this;
    }
}
