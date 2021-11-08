import { Coordinates } from './coordinates.js';
import { Direction, Team } from './index.js';
import { Stage } from './stage.js';

export class Player {
    id: string = '';
    name: string = '';
    country: string = '';
    characterId: number = 0;

    team: Team = Team.FIRST;
    coordinates: Coordinates;
    direction: {
        effective: Direction,
        requested: Direction
    };
    velocity: number = 4;
    stage: Stage | null = null;

    ping: number = 0;

    constructor() {
        this.coordinates = new Coordinates(0, 0);
        this.direction = {
            effective: Direction.DOWN,
            requested: Direction.DOWN
        }
    }

    /* TODO: refactor the following behemoths */
    interpolate(elapsedMs: number) {
        if (this.stage == null)
            throw new TypeError('Cannot interpolate player\'s parameters: stage is not set');

        let direction = this.direction;
        let state = {
            coordinates: this.coordinates.clone(),
            direction: direction.effective,
            traversed: [] as Coordinates[]
        }

        let distance = elapsedMs / 1000 * this.velocity;
        let effectiveAxis = state.direction % 2;
        let effectiveAxisMax = this.stage.tileMap[effectiveAxis ? 'height' : 'width'] - 1;

        if (state.direction & 2 ?
            state.coordinates[effectiveAxis] === effectiveAxisMax :
            state.coordinates[effectiveAxis] === 0)
            distance = 0;

        if (direction.requested % 2 === effectiveAxis)
            state.direction = direction.requested;
        else {
            let alignmentDelta = Math.abs(
                state.coordinates
                    .aligned(state.direction, true)
                    .subtract(state.coordinates)
                    [state.direction % 2]
            );

            if (distance >= alignmentDelta) {
                state.coordinates.align(state.direction, true);
                state.direction = direction.requested;
                state.traversed.push(state.coordinates.clone());
                distance -= alignmentDelta;
            }
        }

        if (distance) {
            let sign = state.direction & 2 ? 1 : -1;
            let coord = state.direction % 2;
            let pretranslated = state.coordinates.clone();

            state.coordinates[coord] += distance * sign;

            state.coordinates[coord] = Math.min(
                Math.max(0, state.coordinates[coord]),
                this.stage.tileMap[coord ? 'height' : 'width'] - 1
            );

            if (pretranslated.equalTo(pretranslated.aligned(state.direction, true)))
                pretranslated[coord] += sign;
            else
                pretranslated.align(state.direction, true);

            while (state.direction & 2 ?
                pretranslated[coord] <= state.coordinates[coord] :
                pretranslated[coord] >= state.coordinates[coord]) {
                state.traversed.push(pretranslated.clone());
                pretranslated[coord] += sign;
            }
        }

        return state;
    }

    coordinatesToTime(destination: Coordinates) {
        let alignmentDelta = 0;
        let source = this.coordinates.clone();

        if (source[this.direction.effective % 2 ? 0 : 1] ===
            destination[this.direction.effective % 2 ? 0 : 1])
        {
            /* given coordinates fall under the alignment period */
            if (this.direction.requested % 2 !== this.direction.effective % 2 &&
                this.direction.effective & 2 ?
                    Math.ceil(source[this.direction.effective % 2]) >= destination[this.direction.effective % 2] &&
                    destination[this.direction.effective % 2] >= source[this.direction.effective % 2] :
                    Math.floor(source[this.direction.effective % 2]) <= destination[this.direction.effective % 2] &&
                    destination[this.direction.effective % 2] <= source[this.direction.effective % 2])
            {
                if (this.direction.effective & 2)
                    return (destination[this.direction.effective % 2] -
                        source[this.direction.effective % 2]) * 1000 / this.velocity;
                else
                    return (source[this.direction.effective % 2] -
                        destination[this.direction.effective % 2]) * 1000 / this.velocity;
            }
        }

        if (this.direction.requested % 2 !== this.direction.effective % 2) {
            alignmentDelta = Math.abs(
                source
                    .aligned(this.direction.effective, true)
                    .subtract(source)
                    [this.direction.effective % 2]
            );
            source.align(this.direction.effective, true);
        }

        /* linear movement or post-alignment period */
        if (source[this.direction.requested % 2 ? 0 : 1] !==
            destination[this.direction.requested % 2 ? 0 : 1])
            return null;

        if (this.direction.requested & 2)
            return (destination[this.direction.requested % 2] -
                source[this.direction.requested % 2] + alignmentDelta) * 1000 / this.velocity;
        else
            return (source[this.direction.requested % 2] -
                destination[this.direction.requested % 2] + alignmentDelta) * 1000 / this.velocity;
    }

    update(state: object): void {
        Object.assign(this, state);
    }
}
