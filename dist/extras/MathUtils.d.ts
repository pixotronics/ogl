import { Vec2 } from "../ogl";
export declare function randomizeArray(array: Array<Vec2>): Vec2[];
export declare function popRandom_(list: any[] | Vec2[]): any;
export declare function uniformDistribution(): number;
export declare function insideRectangle(x: number, y: number, w?: number, h?: number): boolean;
export declare function insideCircle(x: number, y: number, radius?: number): boolean;
export declare function generateRandomPointAround_(point: Vec2, minDist: number): Vec2;
export declare function generateQuasiRandomPoints(numPoints: number, minDistance: number, distributionFunction: (arg0: number) => number, domainTestFunction: (arg0: number, arg1: number, arg2?: number, arg3?: number) => boolean): any;
//# sourceMappingURL=MathUtils.d.ts.map