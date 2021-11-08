import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { inspect } from 'util';

import { logger as parentLogger } from './log/index.js';
import { Coordinates } from './coordinates.js';
import { DeathNews, Team } from './index.js';
import { Player } from './player.js';
import { TileMap } from './tilemap.js';

const logger = parentLogger.sub('Stage');

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
            spawned: performance.now(),
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

        let diffs = this.players.map(player => player.interpolate(elapsedMs));
        let events: [number, number, Player][][] = []

        for (let [index, diff] of diffs.entries()) {
            let player = this.players[index];

            if (!diff.traversed.length) {
                let tile = player.coordinates.aligned(player.direction.effective);
                if (events[0] == null)
                    events[0] = [[tile.x, tile.y, player]];
                else
                    events[0].push([tile.x, tile.y, player]);
                continue;
            }

            for (let tile of diff.traversed) {
                let time = player.coordinatesToTime(tile);

                if (time == null) {
                    logger.err(
                        `Unable to resolve the time offset for player ${player.id} at ${tile}!\n` +
                        `Player: ${inspect(player)}\n` +
                        `Difference: ${inspect(diff)}`)
                    continue;
                }

                if (time < 0) {
                    logger.warn(
                        `Negative time offset for player ${player.id} at ${tile}!\n` +
                        `Player: ${inspect(player)}\n` +
                        `Difference: ${inspect(diff)}`)
                    time = 0;
                }

                time = Math.round(time);

                if (events[time] == null)
                    events[time] = [[tile.x, tile.y, player]];
                else
                    events[time].push([tile.x, tile.y, player]);
            }
        }

        let conquered: [number, number, Player][] = [];
        let tails: [number, number, Player, boolean][] = [];
        let dead: DeathNews = [];

        events.forEach((eventList, time) => {
            for (let event of eventList) {
                let [x, y, player] = event;

                if (player.spawned > this.#lastTick + elapsedMs)
                    continue;

                let tileMapEntry = this.tileMap.state[y][x];

                if (tileMapEntry[0] === player.team) {
                    let tile;
                    while (tile = player.tail.shift()) {
                        this.tileMap.state[tile.y][tile.x][0] = player.team;
                        this.tileMap.state[tile.y][tile.x][1].splice(
                            this.tileMap.state[tile.y][tile.x][1].indexOf(player), 1
                        );
                        tails.push([tile.x, tile.y, player, false]);
                        conquered.push([tile.x, tile.y, player]);
                    }
                } else if (tileMapEntry[1].indexOf(player) === -1) {
                    tileMapEntry[1].push(player);
                    player.tail.push(new Coordinates(x, y));
                    tails.push([x, y, player, true]);
                }

                for (let victim of tileMapEntry[1]) {
                    if (victim.team === player.team)
                        continue;

                    let tile;
                    while (tile = victim.tail.shift()) {
                        this.tileMap.state[tile.y][tile.x][1].splice(
                            this.tileMap.state[tile.y][tile.x][1].indexOf(player), 1
                        );
                        tails.push([x, y, player, false]);
                    }
                    victim.spawned = this.#lastTick + time + victim.respawnMs;
                    victim.coordinates = new Coordinates(
                        Math.round(Math.random() * (this.tileMap.width - 1)),
                        Math.round(Math.random() * (this.tileMap.height - 1))
                    );
                    dead.push({
                        coordinates: new Coordinates(x, y),
                        attacker: player,
                        victim: victim,
                    });
                }
            }
        });

        for (let [index, diff] of diffs.entries()) {
            if (this.players[index].spawned > this.#lastTick + elapsedMs)
                continue;

            this.players[index].direction.effective = diff.direction;
            this.players[index].coordinates = diff.coordinates;
        }

        this.emit('tick', elapsedMs);

        if (tails.length)
            this.emit('tailsUpdated', tails);
        if (conquered.length)
            this.emit('territoryConquered', conquered);
        if (dead.length)
            this.emit('playersDead', dead);

        let respawned = this.players.filter(p =>
            this.#lastTick < p.spawned && p.spawned <= this.#lastTick + elapsedMs);
        if (respawned.length)
            this.emit('playersRespawned', respawned);

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
