
class Segments {
    constructor(points) {
        this.points = points.landmarks._positions;
    }

    getSeries(indexs) {
        if (indexs.length === 1) return { points: this.points[indexs[0]] };
        const segment = [];

        let topLeft = this.points[indexs[0]];
        let bottomRight = this.points[indexs[indexs.length - 1]];

        for (let i = 0; i < indexs.length; i++) {
            const index = indexs[i];
            const point = this.points[index];

            if (topLeft._x > point._x) topLeft._x = point._x;
            if (topLeft._y > point._y) topLeft._y = point._y;
            if (bottomRight._x < point._x) bottomRight._x = point._x;
            if (bottomRight._y < point._y) bottomRight._y = point._y;

            segment.push(point)
        }
        return {
            points: segment,
            width: bottomRight._x - topLeft._x,
            height: bottomRight._y - topLeft._y,
            angle: Math.atan2(bottomRight._y - topLeft._y, bottomRight._x - topLeft._x)
        };
    }

    get() {
        return {
     
            rightBrow: this.getSeries([22, 24, 26]),
            leftBrow: this.getSeries([17, 19, 21]),

            leftEyeBrowSpace: this.getSeries([17, 21, 38, 37]),
            rightEyeBrowSpace: this.getSeries([22, 26, 44, 43]),
            leftEye: this.getSeries([37, 38, 40, 41]),

            rightEye: this.getSeries([43, 44, 47, 46]),
        }
    }
}

export default Segments;