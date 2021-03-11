import {Vec2} from "../ogl";

class Grid_ {

    private width_: number;
    private height_: number;
    private cellSize_: number;
    private array_: Array < Array < Vec2 >> ;

    constructor(width: number, height: number, cellSize: number) {
        this.width_ = width;
        this.height_ = height;
        this.cellSize_ = cellSize;
        this.array_ = new Array(width);
        for (let i = 0; i < width; i++) {
            this.array_[i] = new Array(height);
        }
    }

    public insert_(point: Vec2) {
        const nx = Math.floor(point.x / this.cellSize_);
        const ny = Math.floor(point.y / this.cellSize_);
        this.array_[nx][ny] = point;
    }

    public isInNeighbourhood_(point: Vec2, minDist: number) {
        const nx = Math.floor(point.x / this.cellSize_);
        const ny = Math.floor(point.y / this.cellSize_);
        const offsetCellCount = 5;

        for (let i = nx - offsetCellCount; i < nx + offsetCellCount; i++) {
            for (let j = ny - offsetCellCount; j < ny + offsetCellCount; j++) {
                if (i >= 0 && i < this.width_ && j >= 0 && j < this.height_) {
                    const p = this.array_[i][j];
                    let distance = 1e10;
                    if (p !== undefined) {
                        distance = p.distance(point);
                    }
                    if (distance < minDist) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

}

export function randomizeArray(array: Array<Vec2>) {
    let currentId = array.length, temp, randomId;
    while (currentId !== 0) {
        randomId = Math.floor(Math.random() * currentId);
        currentId -= 1;
        temp = array[currentId];
        array[currentId] = array[randomId];
        array[randomId] = temp;
    }
    return array;
}

export function popRandom_(list: any[] | Vec2[]) {
    const id = Math.floor(Math.random() * list.length);
    const point = list[id];
    list.splice(id, 1);
    return point;
}

export function uniformDistribution() {
    return 1.;
}

export function insideRectangle(x: number, y: number, w ?: number, h ?: number) {
    w = w !== undefined ? w : 1;
    h = h !== undefined ? h : 1;
    return x >= 0 && y >= 0 && x <= w && y <= h;
}

export function insideCircle(x: number, y: number, radius ? : number) {
    radius = radius !== undefined ? radius : 0.5;
    const fx = x - 0.5;
    const fy = y - 0.5;
    return (fx * fx + fy * fy) <= radius * radius;
}

export function generateRandomPointAround_(point: Vec2, minDist: number) {
    const r = Math.random();
    const theta = Math.random();

    const radius = minDist * (r + 1.0);
    const angle = 2 * 3.141592653589 * theta;

    const x = point.x + radius * Math.cos(angle);
    const y = point.y + radius * Math.sin(angle);
    return new Vec2(x, y);
}

export function generateQuasiRandomPoints(numPoints: number, minDistance: number, distributionFunction: (arg0: number) => number,
                                          domainTestFunction: (arg0: number, arg1: number, arg2 ? : number, arg3 ? : number) => boolean) {

    numPoints = numPoints === undefined ? 30 : numPoints;
    minDistance = minDistance === undefined ? -1 : minDistance;

    // @ts-ignore
    distributionFunction = distributionFunction ? distributionFunction : this.uniformDistribution;
    // @ts-ignore
    domainTestFunction = domainTestFunction ? domainTestFunction : this.insideCircle;

    if (minDistance < 0.0) {
        minDistance = Math.sqrt(numPoints) / numPoints;
    }
    const samplePoints: any = [];
    const processList: any = [];

    const cellSize = minDistance / Math.sqrt(2.0);
    const gridWidth = Math.ceil(1.0 / cellSize);
    const gridHeight = Math.ceil(1.0 / cellSize);

    const grid = new Grid_(gridWidth, gridHeight, cellSize);

    const entryPoint = new Vec2(0.5, 0.5);
    let inDomain = false;
    do {
        entryPoint.x = Math.random();
        entryPoint.y = Math.random();
        inDomain = domainTestFunction(entryPoint.x, entryPoint.y);
    } while (!inDomain);

    processList.push(entryPoint);
    samplePoints.push(entryPoint);
    grid.insert_(entryPoint);
    const newPointsCount = 30;

    while ((processList.length !== 0) && (samplePoints.length < numPoints)) {
        const point = popRandom_(processList);

        for (let i = 0; i < newPointsCount; i++) {
            const dx = point.x - 0.5;
            const dy = point.y - 0.5;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const distribution = distributionFunction(distance);
            const newPoint = generateRandomPointAround_(point, distribution * minDistance);
            const insideDomain = domainTestFunction(newPoint.x, newPoint.y);

            if (insideDomain && !grid.isInNeighbourhood_(newPoint, distribution * minDistance)) {
                processList.push(newPoint);
                samplePoints.push(newPoint);
                grid.insert_(newPoint);
                continue;
            }
        }
    }
    return samplePoints;
}
