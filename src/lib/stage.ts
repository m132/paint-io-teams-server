import { EventEmitter } from 'events';

import { Player } from './player.js';
import { TileMap } from './tilemap.js';

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
        this.tileMap = new TileMap(110, 110);

        this.#lastTick = performance.now();
    }

    addPlayer(player: Player): Stage {
        player.update({
            coordinates: [
                Math.round(Math.random() * (this.tileMap.width - 1)),
                Math.round(Math.random() * (this.tileMap.height - 1))
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
            let effectiveAxisMax = this.tileMap[effectiveAxis ? 'height' : 'width'] - 1;

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
                    this.tileMap[direction.effective % 2 ? 'height' : 'width'] - 1
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
