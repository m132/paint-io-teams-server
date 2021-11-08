import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

import { Coordinates } from './coordinates.js';
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
            coordinates: new Coordinates(
                Math.round(Math.random() * (this.tileMap.width - 1)),
                Math.round(Math.random() * (this.tileMap.height - 1))
            ),
            stage: this,
            team: Math.round(1 + Math.random() * 3)
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
        this.emit('beforeTick', elapsedMs);

        for (let player of this.players) {
            let diff = player.interpolate(elapsedMs);
            player.direction.effective = diff.direction;
            player.coordinates = diff.coordinates;
        }

        this.emit('tick', elapsedMs);
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
