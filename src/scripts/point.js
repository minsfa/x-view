export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get distance() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    static middle = (p1, p2) => new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);

    static subtract = (p1, p2) => new Point(p1.x - p2.x, p1.y - p2.y);
}
