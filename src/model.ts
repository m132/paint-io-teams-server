import { EventEmitter } from 'events';

export interface Protocol extends EventEmitter {
    // FIXME: narrow it down
    // new (server_state: ServerState): void;
}

/* odd are assumed to be horizontal, even are consequently vertical */
export enum Direction {
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3
}

export type Coordinates = [x: number, y: number];

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
                Math.round(Math.random() * this.tileMap.width),
                Math.round(Math.random() * this.tileMap.height)
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

        /* interpolate coordinates of all players */
        this.players.forEach((player: Player) => {
            let coords = player.coordinates;
            let direction = player.direction;

            let distance = delta * player.velocity;
            let effectiveAxis = direction.effective % 2;
            let effectiveAxisMax = this.tileMap[effectiveAxis ? 'height' : 'width'];

            if (direction.effective & 2 ? 
                coords[effectiveAxis] === effectiveAxisMax : 
                coords[effectiveAxis] === 0)
                distance = 0;

            if (direction.requested % 2 === effectiveAxis)
                direction.effective = direction.requested;
            else {
                /* remaining blocks to move across before changing direction */
                let alignmentDelta = direction.effective & 2 ?
                    1 - coords[effectiveAxis] % 1 :
                    coords[effectiveAxis] % 1;

                if (alignmentDelta === 1)
                    alignmentDelta = 0;

                if (distance >= alignmentDelta) {
                    coords[effectiveAxis] = 
                        (direction.effective & 2 ? Math.ceil : Math.floor)
                        (coords[effectiveAxis]);
                    distance -= alignmentDelta;
                    direction.effective = direction.requested;
                }
            }

            if (distance) {
                coords[direction.effective % 2] +=
                    distance * (direction.effective & 2 ? 1 : -1);
    
                coords[direction.effective % 2] = Math.min(
                    Math.max(0, coords[direction.effective % 2]),
                    this.tileMap[direction.effective % 2 ? 'height' : 'width']
                );
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
