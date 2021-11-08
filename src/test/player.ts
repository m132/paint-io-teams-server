import { Direction, Player, Stage } from '../lib/index.js';
import { Coordinates } from '../lib/coordinates.js';

let stage = new Stage('main');
let player = new Player();

/* FIXME: time for coordinates close to the wall isn't computed correctly yet */
let x = 16 + Math.round((stage.tileMap.width - 32) * Math.random());
let y = 16 + Math.round((stage.tileMap.height - 32) * Math.random());
let offset = Math.random();

console.info(`Using [${x}, ${y}] as the base coordinates with an alignment offset of ${offset}`);
stage.addPlayer(player);

for (let align of [true, false])
for (let clockwise of [null, true, false])
for (let direction of [0, 1, 2, 3]) 
    test(
        (align ? 'aligned ' : 'unaligned ') +
        (clockwise == null ? '' : 
            clockwise ? 'clockwise ' : 'counter-clockwise ') +
        Direction[direction].toLowerCase() + (clockwise == null ? 'ward movement' : ' turn'), 
        () => {
            let axis, diff, time;

            player.direction.effective = player.direction.requested = direction;
            if (clockwise != null)
                player.direction.effective = (direction + (clockwise ? 3 : 1)) % 4;
            player.coordinates = new Coordinates(x, y);

            if (!align) {
                axis = player.direction.effective % 2;
                if ([x, y][axis] === [stage.tileMap.width, stage.tileMap.height][axis])
                    player.coordinates[axis] -= offset;
                else
                    player.coordinates[axis] += offset;
            }

            let time_checks = [
                0, /* no movement */
                offset * 500 / player.velocity, /* middle of the offset */
                offset * 1000 / player.velocity, /* fully aligned */
                1000 / player.velocity, /* one block */
                1000 /* one second */
            ];

            for (time of time_checks) {
                diff = player.interpolate(time);
                if (time * player.velocity >= 1000)
                    expect(diff.direction).toBe(player.direction.requested);
                expect(player.coordinatesToTime(diff.coordinates)).toBeCloseTo(time, 4);
            }
    });
