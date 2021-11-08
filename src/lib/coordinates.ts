import { Direction } from '.';

export class Coordinates extends Array<number> {
    /** 
     * Returns tile-aligned coordinates with regard to the direction.
     * @param direction Effective direction the entity is headed in.
     * @param coordinates Coordinates to align.
     * @param target If true, target coordinates are returned.
     * @returns Aligned coordinates.
     */
    aligned(direction: Direction, target?: boolean) {
        let [x, y] = this;
        let round = direction & 2 ^ (target ? 2 : 0) ? Math.floor : Math.ceil;
        return new Coordinates(...(direction % 2 ? [x, round(y)] : [round(x), y]));
    }

    align(direction: Direction, target?: boolean) {
        return this.set(this.aligned(direction, target));
    }

    clone() {
        return new Coordinates(...this)
    }

    set(coordinates: Coordinates | [number, number]) {
        coordinates.forEach((coordinate, index) => this[index] = coordinate);
        return this;
    }

    add(coordinates: Coordinates | [number, number]) {
        coordinates.forEach((coordinate, index) => this[index] += coordinate);
        return this;
    }

    subtract(coordinates: Coordinates | [number, number]) {
        coordinates.forEach((coordinate, index) => this[index] -= coordinate);
        return this;
    }

    equalTo(coordinates: Coordinates | [number, number]) {
        return coordinates.every((coordinate, index) => coordinate === this[index]);
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }
}
