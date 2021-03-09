import {PBRMaterial} from "./materials/pbrmaterial";

declare namespace ColorFunc{
    const NAMES: {
        black: string;
        white: string;
        red: string;
        green: string;
        blue: string;
        fuchsia: string;
        cyan: string;
        yellow: string;
        orange: string;
    };
    export type ColorNames = keyof (typeof NAMES);
    export function hexToRGB(hex: any): number[];
    export function numberToRGB(num: any): number[];
    export function parseColor(color?: any): IArguments | number[];
    export { };
}

declare namespace EulerFunc {
    export function fromRotationMatrix(out: any, m: any, order?: string): any;
}

declare namespace Mat3Func {
    /**
     * Copies the upper-left 3x3 values into the given mat3.
     *
     * @param {mat3} out the receiving 3x3 matrix
     * @param {mat4} a   the source 4x4 matrix
     * @returns {mat3} out
     */
    export function fromMat4(out: any, a: any): any;
    /**
     * Calculates a 3x3 matrix from the given quaternion
     *
     * @param {mat3} out mat3 receiving operation result
     * @param {quat} q Quaternion to create matrix from
     *
     * @returns {mat3} out
     */
    export function fromQuat(out: any, q: any): any;
    /**
     * Copy the values from one mat3 to another
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the source matrix
     * @returns {mat3} out
     */
    export function copy(out: any, a: any): any;
    /**
     * Set the components of a mat3 to the given values
     *
     * @param {mat3} out the receiving matrix
     * @returns {mat3} out
     */
    export function set(out: any, m00: any, m01: any, m02: any, m10: any, m11: any, m12: any, m20: any, m21: any, m22: any): any;
    /**
     * Set a mat3 to the identity matrix
     *
     * @param {mat3} out the receiving matrix
     * @returns {mat3} out
     */
    export function identity(out: any): any;
    /**
     * Transpose the values of a mat3
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the source matrix
     * @returns {mat3} out
     */
    export function transpose(out: any, a: any): any;
    /**
     * Inverts a mat3
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the source matrix
     * @returns {mat3} out
     */
    export function invert(out: any, a: any): any;
    /**
     * Calculates the determinant of a mat3
     *
     * @param {mat3} a the source matrix
     * @returns {Number} determinant of a
     */
    export function determinant(a: any): number;
    /**
     * Multiplies two mat3's
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the first operand
     * @param {mat3} b the second operand
     * @returns {mat3} out
     */
    export function multiply(out: any, a: any, b: any): any;
    /**
     * Translate a mat3 by the given vector
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the matrix to translate
     * @param {vec2} v vector to translate by
     * @returns {mat3} out
     */
    export function translate(out: any, a: any, v: any): any;
    /**
     * Rotates a mat3 by the given angle
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat3} out
     */
    export function rotate(out: any, a: any, rad: any): any;
    /**
     * Scales the mat3 by the dimensions in the given vec2
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the matrix to rotate
     * @param {vec2} v the vec2 to scale the matrix by
     * @returns {mat3} out
     **/
    export function scale(out: any, a: any, v: any): any;
    /**
     * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
     *
     * @param {mat3} out mat3 receiving operation result
     * @param {mat4} a Mat4 to derive the normal matrix from
     *
     * @returns {mat3} out
     */
    export function normalFromMat4(out: any, a: any): any;
    /**
     * Generates a 2D projection matrix with the given bounds
     *
     * @param {mat3} out mat3 frustum matrix will be written into
     * @param {number} width Width of your gl context
     * @param {number} height Height of gl context
     * @returns {mat3} out
     */
    export function projection(out: any, width: any, height: any): any;
    /**
     * Adds two mat3's
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the first operand
     * @param {mat3} b the second operand
     * @returns {mat3} out
     */
    export function add(out: any, a: any, b: any): any;
    /**
     * Subtracts matrix b from matrix a
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the first operand
     * @param {mat3} b the second operand
     * @returns {mat3} out
     */
    export function subtract(out: any, a: any, b: any): any;
    /**
     * Multiply each element of the matrix by a scalar.
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the matrix to scale
     * @param {Number} b amount to scale the matrix's elements by
     * @returns {mat3} out
     */
    export function multiplyScalar(out: any, a: any, b: any): any;
}

declare namespace Mat4Func {
    /**
     * Copy the values from one vec2 to another
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the source vector
     * @returns {vec2} out
     */
    export function copy(out: any, a: any): any;
    /**
     * Set the components of a vec2 to the given values
     *
     * @param {vec2} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @returns {vec2} out
     */
    export function set(out: any, x: any, y: any): any;
    /**
     * Adds two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    export function add(out: any, a: any, b: any): any;
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    export function subtract(out: any, a: any, b: any): any;
    /**
     * Multiplies two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    export function multiply(out: any, a: any, b: any): any;
    /**
     * Divides two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    export function divide(out: any, a: any, b: any): any;
    /**
     * Scales a vec2 by a scalar number
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec2} out
     */
    export function scale(out: any, a: any, b: any): any;
    /**
     * Calculates the euclidian distance between two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} distance between a and b
     */
    export function distance(a: any, b: any): number;
    /**
     * Calculates the squared euclidian distance between two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} squared distance between a and b
     */
    export function squaredDistance(a: any, b: any): number;
    /**
     * Calculates the length of a vec2
     *
     * @param {vec2} a vector to calculate length of
     * @returns {Number} length of a
     */
    export function length(a: any): number;
    /**
     * Calculates the squared length of a vec2
     *
     * @param {vec2} a vector to calculate squared length of
     * @returns {Number} squared length of a
     */
    export function squaredLength(a: any): number;
    /**
     * Negates the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to negate
     * @returns {vec2} out
     */
    export function negate(out: any, a: any): any;
    /**
     * Returns the inverse of the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to invert
     * @returns {vec2} out
     */
    export function inverse(out: any, a: any): any;
    /**
     * Normalize a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to normalize
     * @returns {vec2} out
     */
    export function normalize(out: any, a: any): any;
    /**
     * Calculates the dot product of two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} dot product of a and b
     */
    export function dot(a: any, b: any): number;
    /**
     * Computes the cross product of two vec2's
     * Note that the cross product returns a scalar
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} cross product of a and b
     */
    export function cross(a: any, b: any): number;
    /**
     * Performs a linear interpolation between two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vec2} out
     */
    export function lerp(out: any, a: any, b: any, t: any): any;
    /**
     * Transforms the vec2 with a mat2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat2} m matrix to transform with
     * @returns {vec2} out
     */
    export function transformMat2(out: any, a: any, m: any): any;
    /**
     * Transforms the vec2 with a mat2d
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat2d} m matrix to transform with
     * @returns {vec2} out
     */
    export function transformMat2d(out: any, a: any, m: any): any;
    /**
     * Transforms the vec2 with a mat3
     * 3rd vector component is implicitly '1'
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat3} m matrix to transform with
     * @returns {vec2} out
     */
    export function transformMat3(out: any, a: any, m: any): any;
    /**
     * Transforms the vec2 with a mat4
     * 3rd vector component is implicitly '0'
     * 4th vector component is implicitly '1'
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vec2} out
     */
    export function transformMat4(out: any, a: any, m: any): any;
    /**
     * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
     *
     * @param {vec2} a The first vector.
     * @param {vec2} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    export function exactEquals(a: any, b: any): boolean;
}

declare namespace Vec2Func {
    /**
     * Copy the values from one vec2 to another
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the source vector
     * @returns {vec2} out
     */
    export function copy(out: any, a: any): any;
    /**
     * Set the components of a vec2 to the given values
     *
     * @param {vec2} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @returns {vec2} out
     */
    export function set(out: any, x: any, y: any): any;
    /**
     * Adds two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    export function add(out: any, a: any, b: any): any;
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    export function subtract(out: any, a: any, b: any): any;
    /**
     * Multiplies two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    export function multiply(out: any, a: any, b: any): any;
    /**
     * Divides two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    export function divide(out: any, a: any, b: any): any;
    /**
     * Scales a vec2 by a scalar number
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec2} out
     */
    export function scale(out: any, a: any, b: any): any;
    /**
     * Calculates the euclidian distance between two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} distance between a and b
     */
    export function distance(a: any, b: any): number;
    /**
     * Calculates the squared euclidian distance between two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} squared distance between a and b
     */
    export function squaredDistance(a: any, b: any): number;
    /**
     * Calculates the length of a vec2
     *
     * @param {vec2} a vector to calculate length of
     * @returns {Number} length of a
     */
    export function length(a: any): number;
    /**
     * Calculates the squared length of a vec2
     *
     * @param {vec2} a vector to calculate squared length of
     * @returns {Number} squared length of a
     */
    export function squaredLength(a: any): number;
    /**
     * Negates the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to negate
     * @returns {vec2} out
     */
    export function negate(out: any, a: any): any;
    /**
     * Returns the inverse of the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to invert
     * @returns {vec2} out
     */
    export function inverse(out: any, a: any): any;
    /**
     * Normalize a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to normalize
     * @returns {vec2} out
     */
    export function normalize(out: any, a: any): any;
    /**
     * Calculates the dot product of two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} dot product of a and b
     */
    export function dot(a: any, b: any): number;
    /**
     * Computes the cross product of two vec2's
     * Note that the cross product returns a scalar
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} cross product of a and b
     */
    export function cross(a: any, b: any): number;
    /**
     * Performs a linear interpolation between two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vec2} out
     */
    export function lerp(out: any, a: any, b: any, t: any): any;
    /**
     * Transforms the vec2 with a mat2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat2} m matrix to transform with
     * @returns {vec2} out
     */
    export function transformMat2(out: any, a: any, m: any): any;
    /**
     * Transforms the vec2 with a mat2d
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat2d} m matrix to transform with
     * @returns {vec2} out
     */
    export function transformMat2d(out: any, a: any, m: any): any;
    /**
     * Transforms the vec2 with a mat3
     * 3rd vector component is implicitly '1'
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat3} m matrix to transform with
     * @returns {vec2} out
     */
    export function transformMat3(out: any, a: any, m: any): any;
    /**
     * Transforms the vec2 with a mat4
     * 3rd vector component is implicitly '0'
     * 4th vector component is implicitly '1'
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vec2} out
     */
    export function transformMat4(out: any, a: any, m: any): any;
    /**
     * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
     *
     * @param {vec2} a The first vector.
     * @param {vec2} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    export function exactEquals(a: any, b: any): boolean;
}

declare namespace Vec3Func {
    /**
     * Calculates the length of a vec3
     *
     * @param {vec3} a vector to calculate length of
     * @returns {Number} length of a
     */
    export function length(a: any): number;
    /**
     * Copy the values from one vec3 to another
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the source vector
     * @returns {vec3} out
     */
    export function copy(out: any, a: any): any;
    /**
     * Set the components of a vec3 to the given values
     *
     * @param {vec3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} out
     */
    export function set(out: any, x: any, y: any, z: any): any;
    /**
     * Adds two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    export function add(out: any, a: any, b: any): any;
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    export function subtract(out: any, a: any, b: any): any;
    /**
     * Multiplies two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    export function multiply(out: any, a: any, b: any): any;
    /**
     * Divides two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    export function divide(out: any, a: any, b: any): any;
    /**
     * Scales a vec3 by a scalar number
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec3} out
     */
    export function scale(out: any, a: any, b: any): any;
    /**
     * Calculates the euclidian distance between two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} distance between a and b
     */
    export function distance(a: any, b: any): number;
    /**
     * Calculates the squared euclidian distance between two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} squared distance between a and b
     */
    export function squaredDistance(a: any, b: any): number;
    /**
     * Calculates the squared length of a vec3
     *
     * @param {vec3} a vector to calculate squared length of
     * @returns {Number} squared length of a
     */
    export function squaredLength(a: any): number;
    /**
     * Negates the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to negate
     * @returns {vec3} out
     */
    export function negate(out: any, a: any): any;
    /**
     * Returns the inverse of the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to invert
     * @returns {vec3} out
     */
    export function inverse(out: any, a: any): any;
    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to normalize
     * @returns {vec3} out
     */
    export function normalize(out: any, a: any): any;
    /**
     * Calculates the dot product of two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} dot product of a and b
     */
    export function dot(a: any, b: any): number;
    /**
     * Computes the cross product of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    export function cross(out: any, a: any, b: any): any;
    /**
     * Performs a linear interpolation between two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vec3} out
     */
    export function lerp(out: any, a: any, b: any, t: any): any;
    /**
     * Transforms the vec3 with a mat4.
     * 4th vector component is implicitly '1'
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vec3} out
     */
    export function transformMat4(out: any, a: any, m: any): any;
    /**
     * Same as above but doesn't apply translation.
     * Useful for rays.
     */
    export function scaleRotateMat4(out: any, a: any, m: any): any;
    /**
     * Transforms the vec3 with a mat3.
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {mat3} m the 3x3 matrix to transform with
     * @returns {vec3} out
     */
    export function transformMat3(out: any, a: any, m: any): any;
    /**
     * Transforms the vec3 with a quat
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {quat} q quaternion to transform with
     * @returns {vec3} out
     */
    export function transformQuat(out: any, a: any, q: any): any;
    /**
     * Get the angle between two 3D vectors
     * @param {vec3} a The first operand
     * @param {vec3} b The second operand
     * @returns {Number} The angle in radians
     */
    export const angle: (a: any, b: any) => number;
    /**
     * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
     *
     * @param {vec3} a The first vector.
     * @param {vec3} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    export function exactEquals(a: any, b: any): boolean;
}

declare namespace Vec4Func {
    /**
     * Copy the values from one vec4 to another
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the source vector
     * @returns {vec4} out
     */
    export function copy(out: any, a: any): any;
    /**
     * Set the components of a vec4 to the given values
     *
     * @param {vec4} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @param {Number} w W component
     * @returns {vec4} out
     */
    export function set(out: any, x: any, y: any, z: any, w: any): any;
    /**
     * Adds two vec4's
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {vec4} out
     */
    export function add(out: any, a: any, b: any): any;
    /**
     * Scales a vec4 by a scalar number
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec4} out
     */
    export function scale(out: any, a: any, b: any): any;
    /**
     * Calculates the length of a vec4
     *
     * @param {vec4} a vector to calculate length of
     * @returns {Number} length of a
     */
    export function length(a: any): number;
    /**
     * Normalize a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a vector to normalize
     * @returns {vec4} out
     */
    export function normalize(out: any, a: any): any;
    /**
     * Calculates the dot product of two vec4's
     *
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {Number} dot product of a and b
     */
    export function dot(a: any, b: any): number;
    /**
     * Performs a linear interpolation between two vec4's
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vec4} out
     */
    export function lerp(out: any, a: any, b: any, t: any): any;
}

declare namespace QuatFunc {
    import vec4 = Vec4Func;
    /**
     * Set a quat to the identity quaternion
     *
     * @param {quat} out the receiving quaternion
     * @returns {quat} out
     */
    export function identity(out: any): any;
    /**
     * Sets a quat from the given angle and rotation axis,
     * then returns it.
     *
     * @param {quat} out the receiving quaternion
     * @param {vec3} axis the axis around which to rotate
     * @param {Number} rad the angle in radians
     * @returns {quat} out
     **/
    export function setAxisAngle(out: any, axis: any, rad: any): any;
    /**
     * Multiplies two quats
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @returns {quat} out
     */
    export function multiply(out: any, a: any, b: any): any;
    /**
     * Rotates a quaternion by the given angle about the X axis
     *
     * @param {quat} out quat receiving operation result
     * @param {quat} a quat to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {quat} out
     */
    export function rotateX(out: any, a: any, rad: any): any;
    /**
     * Rotates a quaternion by the given angle about the Y axis
     *
     * @param {quat} out quat receiving operation result
     * @param {quat} a quat to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {quat} out
     */
    export function rotateY(out: any, a: any, rad: any): any;
    /**
     * Rotates a quaternion by the given angle about the Z axis
     *
     * @param {quat} out quat receiving operation result
     * @param {quat} a quat to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {quat} out
     */
    export function rotateZ(out: any, a: any, rad: any): any;
    /**
     * Performs a spherical linear interpolation between two quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {quat} out
     */
    export function slerp(out: any, a: any, b: any, t: any): any;
    /**
     * Calculates the inverse of a quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quat to calculate inverse of
     * @returns {quat} out
     */
    export function invert(out: any, a: any): any;
    /**
     * Calculates the conjugate of a quat
     * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quat to calculate conjugate of
     * @returns {quat} out
     */
    export function conjugate(out: any, a: any): any;
    /**
     * Creates a quaternion from the given 3x3 rotation matrix.
     *
     * NOTE: The resultant quaternion is not normalized, so you should be sure
     * to renormalize the quaternion yourself where necessary.
     *
     * @param {quat} out the receiving quaternion
     * @param {mat3} m rotation matrix
     * @returns {quat} out
     * @function
     */
    export function fromMat3(out: any, m: any): any;
    /**
     * Creates a quaternion from the given euler angle x, y, z.
     *
     * @param {quat} out the receiving quaternion
     * @param {vec3} euler Angles to rotate around each axis in degrees.
     * @param {String} order detailing order of operations. Default 'XYZ'.
     * @returns {quat} out
     * @function
     */
    export function fromEuler(out: any, euler: any, order?: string): any;
    /**
     * Copy the values from one quat to another
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the source quaternion
     * @returns {quat} out
     * @function
     */
    export const copy: typeof vec4.copy;
    /**
     * Set the components of a quat to the given values
     *
     * @param {quat} out the receiving quaternion
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @param {Number} w W component
     * @returns {quat} out
     * @function
     */
    export const set: typeof vec4.set;
    /**
     * Adds two quat's
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @returns {quat} out
     * @function
     */
    export const add: typeof vec4.add;
    /**
     * Scales a quat by a scalar number
     *
     * @param {quat} out the receiving vector
     * @param {quat} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {quat} out
     * @function
     */
    export const scale: typeof vec4.scale;
    /**
     * Calculates the dot product of two quat's
     *
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @returns {Number} dot product of a and b
     * @function
     */
    export const dot: typeof vec4.dot;
    /**
     * Performs a linear interpolation between two quat's
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {quat} out
     * @function
     */
    export const lerp: typeof vec4.lerp;
    /**
     * Calculates the length of a quat
     *
     * @param {quat} a vector to calculate length of
     * @returns {Number} length of a
     */
    export const length: typeof vec4.length;
    /**
     * Normalize a quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quaternion to normalize
     * @returns {quat} out
     * @function
     */
    export const normalize: typeof vec4.normalize;
}


// #region Color
export class Color extends Array<number> {
    constructor();
    constructor(color: [number, number, number]);
    constructor(color: number, g: number, b: number);
    constructor(color: string);
    constructor(color: ColorFunc.ColorNames);
    constructor(color: number);
    get r(): number;
    get g(): number;
    get b(): number;
    set r(v: number);
    set g(v: number);
    set b(v: number);
    set(color: any): this;
    copy(v: any): this;
}
// #endregion

// #region Euler
export class Euler extends Array<number> {
    onChange: () => void;
    order: string;
    constructor(x?: number, y?: number, z?: number, order?: string);
    get x(): number;
    get y(): number;
    get z(): number;
    set x(v: number);
    set y(v: number);
    set z(v: number);
    set(x: any, y?: any, z?: any): this;
    copy(v: any): this;
    reorder(order: any): this;
    fromRotationMatrix(m: any, order?: string): this;
    fromQuaternion(q: any, order?: string): this;
}
// #endregion

// #region Mat3
export class Mat3 extends Array<number> {
    constructor(m00?: number, m01?: number, m02?: number, m10?: number, m11?: number, m12?: number, m20?: number, m21?: number, m22?: number);
    set(m00: any, m01: any, m02: any, m10: any, m11: any, m12: any, m20: any, m21: any, m22: any): this;
    translate(v: any, m?: this): this;
    rotate(v: any, m?: this): this;
    scale(v: any, m?: this): this;
    multiply(ma: any, mb: any): this;
    identity(): this;
    copy(m: any): this;
    fromMatrix4(m: any): this;
    fromQuaternion(q: any): this;
    fromBasis(vec3a: any, vec3b: any, vec3c: any): this;
    inverse(m?: this): this;
    getNormalMatrix(m: any): this;
}
// #endregion

// #region Mat4
export class Mat4 extends Array<number> {
    constructor(m00?: number, m01?: number, m02?: number, m03?: number, m10?: number, m11?: number, m12?: number, m13?: number, m20?: number, m21?: number, m22?: number, m23?: number, m30?: number, m31?: number, m32?: number, m33?: number);
    get x(): number;
    get y(): number;
    get z(): number;
    get w(): number;
    set x(v: number);
    set y(v: number);
    set z(v: number);
    set w(v: number);
    set(m00: any, m01: any, m02: any, m03: any, m10: any, m11: any, m12: any, m13: any, m20: any, m21: any, m22: any, m23: any, m30: any, m31: any, m32: any, m33: any): this;
    translate(v: any, m?: this): this;
    rotate(v: any, axis: any, m?: this): this;
    scale(v: any, m?: this): this;
    multiply(ma: any, mb: any): this;
    identity(): this;
    copy(m: any): this;
    fromPerspective({ fov, aspect, near, far, }?: Partial<{
        fov: number;
        aspect: number;
        near: number;
        far: number;
    }>): this;
    fromOrthogonal({ left, right, bottom, top, near, far }: {
        left: any;
        right: any;
        bottom: any;
        top: any;
        near: any;
        far: any;
    }): this;
    fromQuaternion(q: any): this;
    setPosition(v: any): this;
    inverse(m?: this): this;
    compose(q: any, pos: any, scale: any): this;
    getRotation(q: any): this;
    getTranslation(pos: any): this;
    getScaling(scale: any): this;
    getMaxScaleOnAxis(): number;
    lookAt<T extends number[]>(eye: T, target: any, up: any): this;
    determinant(): number;
    fromArray(a: any, o?: number): this;
    toArray(a?: any[], o?: number): any[];
}
// #endregion

// #region Quat
export class Quat extends Array<number> {
    onChange: () => void;
    constructor(x?: number, y?: number, z?: number, w?: number);
    get x(): number;
    get y(): number;
    get z(): number;
    get w(): number;
    set x(v: number);
    set y(v: number);
    set z(v: number);
    set w(v: number);
    identity(): this;
    set(x: any, y: any, z: any, w: any): this;
    rotateX(a: any): this;
    rotateY(a: any): this;
    rotateZ(a: any): this;
    inverse(q?: this): this;
    conjugate(q?: this): this;
    copy(q: any): this;
    normalize(q?: this): this;
    multiply(qA: any, qB: any): this;
    dot(v: any): number;
    fromMatrix3(matrix3: any): this;
    fromEuler(euler: any): this;
    fromAxisAngle(axis: any, a: any): this;
    slerp(q: any, t: any): this;
    fromArray(a: any, o?: number): this;
    toArray(a?: any[], o?: number): any[];
}
// #endregion

// #region Vec2
export class Vec2 extends Array<number> {
    constructor(x?: number, y?: number);
    get x(): number;
    get y(): number;
    set x(v: number);
    set y(v: number);
    set(x: any, y?: any): this;
    copy(v: any): this;
    add(va: any, vb: any): this;
    sub(va: any, vb: any): this;
    multiply(v: any): this;
    divide(v: any): this;
    inverse(v?: this): this;
    len(): number;
    distance(v: any): number;
    squaredLen(): number;
    squaredDistance(v?: any): number;
    negate(v?: this): this;
    cross(va: any, vb: any): number;
    scale(v: any): this;
    normalize(): this;
    dot(v: any): number;
    equals(v: any): boolean;
    applyMatrix3(mat3: any): this;
    applyMatrix4(mat4: any): this;
    lerp(v: any, a: any): void;
    clone(): Vec2;
    fromArray(a: any, o?: number): this;
    toArray(a?: any[], o?: number): any[];
}
// #endregion

// #region Vec3
export class Vec3 extends Array<number> {
    constant: number;
    constructor(x?: number, y?: number, z?: number);
    get x(): number;
    get y(): number;
    get z(): number;
    set x(v: number);
    set y(v: number);
    set z(v: number);
    set(x: number | Array<number>, y?: number | number[], z?: number | number[]): this;
    copy(v: any): this;
    add(va: any, vb?: Vec3): this;
    sub(va: any, vb?: Vec3): this;
    multiply(v: any): this;
    divide(v: any): this;
    inverse(v?: this): this;
    len(): number;
    distance(v?: Vec3): number;
    squaredLen(): number;
    squaredDistance(v?: Vec3): number;
    negate(v?: this): this;
    cross(va: any, vb?: any): this;
    scale(v: any): this;
    normalize(): this;
    dot(v: any): number;
    equals(v: any): boolean;
    applyMatrix4(mat4: any): this;
    scaleRotateMatrix4(mat4: any): this;
    applyQuaternion(q: any): this;
    angle(v: any): number;
    lerp(v: any, t: any): this;
    clone(): Vec3;
    fromArray(a: any, o?: number): this;
    toArray(a?: Float32Array | Array<number>, o?: number): number[] | Float32Array;
    transformDirection(mat4: any): this;
}
// #endregion

// #region Vec4
export class Vec4 extends Array<number> {
    constructor(x?: number, y?: number, z?: number, w?: number);
    get x(): number;
    get y(): number;
    get z(): number;
    get w(): number;
    set x(v: number);
    set y(v: number);
    set z(v: number);
    set w(v: number);
    set(x: any, y: any, z: any, w: any): this;
    copy(v: any): this;
    normalize(): this;
    fromArray(a: any, o?: number): this;
    toArray(a?: any[], o?: number): any[];
}
// #endregion

// #region Camera
export type CameraOptions = {
    near: number;
    far: number;
    fov: number;
    aspect: number;
    left: number;
    right: number;
    bottom: number;
    top: number;
    zoom: number;
};

export class Camera extends Transform {
    near: number;
    far: number;
    fov: number;
    aspect: number;
    left: number;
    right: number;
    bottom: number;
    top: number;
    zoom: number;
    projectionMatrix: Mat4;
    viewMatrix: Mat4;
    projectionViewMatrix: Mat4;
    worldPosition: Vec3;
    type: 'perspective' | 'orthographic';
    frustum: Vec3[];
    constructor(gl: OGLRenderingContext, { near, far, fov, aspect, left, right, bottom, top, zoom }?: Partial<CameraOptions>);
    perspective({ near, far, fov, aspect }?: {
        near?: number;
        far?: number;
        fov?: number;
        aspect?: number;
    }): this;
    orthographic({ near, far, left, right, bottom, top, zoom, }?: {
        near?: number;
        far?: number;
        left?: number;
        right?: number;
        bottom?: number;
        top?: number;
        zoom?: number;
    }): this;
    updateMatrixWorld(): this;
    lookAt<T extends number[]>(target: T): this;
    project(v: any): this;
    unproject(v: any): this;
    updateFrustum(): void;
    frustumIntersectsMesh(node: any): boolean;
    frustumIntersectsSphere(center: any, radius: any): boolean;
}
// #endregion

// #region Geometry

export type AttributeMap = {
    [key: string]: Partial<Attribute>;
};

export type Attribute = {
    size: number;
    data: ArrayLike<number> | ArrayBufferView;
    instanced?: null | number;
    type: GLenum;
    normalized: boolean;
    target?: number;
    id?: number;
    buffer?: WebGLBuffer;
    stride: number;
    offset: number;
    count?: number;
    divisor?: number;
    needsUpdate?: boolean;
    min?: any;
    max?: any;
};

export type Bounds = {
    min: Vec3;
    max: Vec3;
    center: Vec3;
    scale: Vec3;
    radius: number;
};

export class Geometry {
    gl: OGLRenderingContext;
    id: number;
    attributes: AttributeMap;
    VAOs: {};
    drawRange: {
        start: number;
        count: number;
    };
    instancedCount: number;
    glState: RenderState;
    isInstanced: boolean;
    bounds: Bounds;
    raycast: 'sphere' | 'box';
    constructor(gl: OGLRenderingContext, attributes?: {
        [key: string]: Partial<Attribute>;
    });
    addAttribute(key: string, attr: Partial<Attribute>): number;
    updateAttribute(attr: any): void;
    setIndex(value: Attribute): void;
    setDrawRange(start: number, count: number): void;
    setInstancedCount(value: number): void;
    createVAO(program: Program): void;
    bindAttributes(program: Program): void;
    draw({ program, mode }: {
        program: any;
        mode?: number;
    }): void;
    getPositionArray(): true | ArrayBufferView | ArrayLike<number>;
    computeBoundingBox(array?: any): void;
    computeBoundingSphere(array?: any): void;
    computeVertexNormals(): void;
    normalizeNormals(): void;
    remove(): void;
}
// #endregion

// #region Mesh
export interface MeshOptions {
    geometry: Geometry;
    program: Program;
    mode: GLenum;
    frustumCulled: boolean;
    renderOrder: number;
}
export interface DrawOptions {
    camera: Camera;
}
export class Mesh extends Transform {
    name: string;
    numInstances: any;
    gl: OGLRenderingContext;
    id: number;
    geometry: Geometry;
    program: Program;
    material?: PBRMaterial;
    // material?: any;
    mode: GLenum;
    frustumCulled: boolean;
    renderOrder: number;
    modelViewMatrix: Mat4;
    normalMatrix: Mat3;
    beforeRenderCallbacks: Array<any>;
    afterRenderCallbacks: Array<any>;
    hit: Partial<{
        localPoint: Vec3;
        distance: number;
        point: Vec3;
        faceNormal: Vec3;
        localFaceNormal: Vec3;
        uv: Vec2;
        localNormal: Vec3;
        normal: Vec3;
    }>;
    constructor(gl: OGLRenderingContext, { geometry, program, mode, frustumCulled, renderOrder }?: Partial<MeshOptions>);
    onBeforeRender(f: any): this;
    onAfterRender(f: any): this;
    draw({ camera }?: Partial<DrawOptions>): void;
}
// #endregion

// #region Program
export type ProgramOptions = {
    vertex: string;
    fragment: string;
    uniforms: {
        [name: string]: {
            value: any;
        };
    };
    transparent: boolean;
    cullFace: GLenum | false;
    frontFace: GLenum;
    depthTest: boolean;
    depthWrite: boolean;
    depthFunc: GLenum;
};
export interface BlendFunc {
    src?: GLenum;
    dst?: GLenum;
    srcAlpha?: number;
    dstAlpha?: number;
}
export interface BlendEquation {
    modeRGB?: number;
    modeAlpha?: number;
}
export interface UniformInfo extends WebGLActiveInfo {
    uniformName: string;
    isStruct: boolean;
    isStructArray: boolean;
    structIndex: number;
    structProperty: string;
}
export class Program {
    gl: OGLRenderingContext;
    uniforms: {
        [name: string]: {
            value: any;
        };
    };
    id: number;
    transparent: boolean;
    cullFace: GLenum | false;
    frontFace: GLenum;
    depthTest: boolean;
    depthWrite: boolean;
    depthFunc: GLenum;
    blendFunc: BlendFunc;
    blendEquation: BlendEquation;
    program: WebGLProgram;
    uniformLocations: Map<any, any>;
    attributeLocations: Map<any, any>;
    attributeOrder: string;
    gltfMaterial: any;
    constructor(gl: OGLRenderingContext, { vertex, fragment, uniforms, transparent, cullFace, frontFace, depthTest, depthWrite, depthFunc, }?: Partial<ProgramOptions>);
    setBlendFunc(src: number, dst: number, srcAlpha?: number, dstAlpha?: number): void;
    setBlendEquation(modeRGB: any, modeAlpha: any): void;
    applyState(): void;
    use({ flipFaces }?: {
        flipFaces?: boolean;
    }): void;
    remove(): void;
}
// #endregion

// #region Renderer
export interface RendererOptions {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    dpr: number;
    alpha: boolean;
    depth: boolean;
    stencil: boolean;
    antialias: boolean;
    premultipliedAlpha: boolean;
    preserveDrawingBuffer: boolean;
    powerPreference: string;
    autoClear: boolean;
    webgl: number;
}
export type OGLRenderingContext = {
    renderer: Renderer;
    canvas: HTMLCanvasElement;
} & (WebGL2RenderingContext | WebGLRenderingContext);
export type DeviceParameters = {
    maxTextureUnits?: number;
    maxAnisotropy?: number;
};
export type RenderState = {
    blendFunc?: {
        src: GLenum;
        dst: GLenum;
        srcAlpha?: any;
        dstAlpha?: any;
    };
    blendEquation?: {
        modeRGB: GLenum;
        modeAlpha?: any;
    };
    cullFace?: number;
    frontFace?: number;
    depthMask?: boolean;
    depthFunc?: number;
    premultiplyAlpha?: boolean;
    flipY?: boolean;
    unpackAlignment?: number;
    viewport?: {
        width: number | null;
        height: number | null;
    };
    textureUnits?: Array<number>;
    activeTextureUnit?: number;
    framebuffer?: any;
    boundBuffer?: any;
    uniformLocations?: Map<number, WebGLUniformLocation>;
};
export type RenderExtensions = {
    [key: string]: any;
};
export class Renderer {
    dpr: number;
    alpha: boolean;
    color: boolean;
    depth: boolean;
    stencil: boolean;
    premultipliedAlpha: boolean;
    autoClear: boolean;
    gl: OGLRenderingContext;
    isWebgl2: boolean;
    width: number;
    height: number;
    parameters: DeviceParameters;
    state: RenderState;
    extensions: RenderExtensions;
    vertexAttribDivisor: Function;
    drawArraysInstanced: Function;
    drawElementsInstanced: Function;
    createVertexArray: Function;
    bindVertexArray: Function;
    deleteVertexArray: Function;
    drawBuffers: Function;
    currentProgram: number;
    currentGeometry: string | null;
    get id(): number;
    private _id;
    constructor({ canvas, width, height, dpr, alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer, powerPreference, autoClear, webgl, }?: Partial<RendererOptions>);
    setSize(width: number, height: number): void;
    setViewport(width: number, height: number): void;
    enable(id: GLenum): void;
    disable(id: GLenum): void;
    setBlendFunc(src: GLenum, dst: GLenum, srcAlpha: GLenum, dstAlpha: GLenum): void;
    setBlendEquation(modeRGB: GLenum, modeAlpha: GLenum): void;
    setCullFace(value: GLenum): void;
    setFrontFace(value: GLenum): void;
    setDepthMask(value: GLboolean): void;
    setDepthFunc(value: GLenum): void;
    activeTexture(value: number): void;
    bindFramebuffer({ target, buffer }?: {
        target?: number;
        buffer?: any;
    }): void;
    getExtension(extension: string, webgl2Func?: keyof WebGL2RenderingContext, extFunc?: string): any;
    sortOpaque(a: any, b: any): number;
    sortTransparent(a: any, b: any): number;
    sortUI(a: any, b: any): number;
    getRenderList({ scene, camera, frustumCull, sort }: {
        scene: Transform;
        camera: Camera;
        frustumCull: boolean;
        sort: boolean;
    }): any[];
    render({ scene, camera, target, update, sort, frustumCull, clear, }: Partial<{
        scene: Transform;
        camera: Camera;
        target: RenderTarget|null;
        update: boolean;
        sort: boolean;
        frustumCull: boolean;
        clear: boolean;
    }>): void;
}
// #endregion

// #region RenderTarget
export interface RenderTargetOptions {
    width: number;
    height: number;
    target: GLenum;
    color: number;
    depth: boolean;
    stencil: boolean;
    depthTexture: boolean;
    wrapS: GLenum;
    wrapT: GLenum;
    minFilter: GLenum;
    magFilter: GLenum;
    type: GLenum;
    format: GLenum;
    internalFormat: GLenum;
    unpackAlignment: number;
    premultiplyAlpha: boolean;
}
export class RenderTarget {
    gl: OGLRenderingContext;
    width: number;
    height: number;
    depth: boolean;
    buffer: WebGLFramebuffer;
    target: number;
    textures: Texture[];
    texture: Texture;
    depthTexture: Texture;
    depthBuffer: WebGLRenderbuffer;
    stencilBuffer: WebGLRenderbuffer;
    depthStencilBuffer: WebGLRenderbuffer;
    constructor(gl: OGLRenderingContext, { width, height, target, color, // number of color attachments
        depth, stencil, depthTexture, // note - stencil breaks
        wrapS, wrapT, minFilter, magFilter, type, format, internalFormat, unpackAlignment, premultiplyAlpha
    }?: Partial<RenderTargetOptions>);
}
// #endregion

// #region Texture
export interface TextureOptions {
    image: HTMLImageElement | HTMLVideoElement | HTMLImageElement[] | ArrayBufferView;
    target: number;
    type: number;
    format: number;
    internalFormat: number;
    wrapS: number;
    wrapT: number;
    generateMipmaps: boolean;
    minFilter: number;
    magFilter: number;
    premultiplyAlpha: boolean;
    unpackAlignment: number;
    flipY: boolean;
    level: number;
    width: number;
    height: number;
    anisotropy: number;
}
export type CompressedImage = {
    isCompressedTexture?: boolean;
} & {
    data: Uint8Array;
    width: number;
    height: number;
}[];
export class Texture {
    ext: string;
    gl: OGLRenderingContext;
    id: number;
    name: string;
    image: HTMLImageElement | HTMLVideoElement | HTMLImageElement[] | ArrayBufferView | CompressedImage;
    target: number;
    type: number;
    format: number;
    internalFormat: number;
    wrapS: number;
    wrapT: number;
    generateMipmaps: boolean;
    minFilter: number;
    magFilter: number;
    premultiplyAlpha: boolean;
    unpackAlignment: number;
    flipY: boolean;
    level: number;
    width: number;
    height: number;
    anisotropy: number;
    texture: WebGLTexture;
    store: {
        image: any;
    };
    glState: RenderState;
    state: {
        minFilter: number;
        magFilter: number;
        wrapS: number;
        wrapT: number;
        anisotropy: number;
    };
    needsUpdate: Boolean;
    onUpdate?: () => void;
    constructor(gl: OGLRenderingContext,
                { image, target, type, format, internalFormat, wrapS, wrapT, generateMipmaps, minFilter, magFilter, premultiplyAlpha, unpackAlignment, flipY, anisotropy, level, width, // used for RenderTargets or Data Textures
                    height, }?: Partial<TextureOptions>);
    bind(): void;
    update(textureUnit?: number): void;
}
// #endregion

// #region Transform
export class Transform {
    parent: Transform;
    children: Transform[];
    visible: boolean;
    matrix: Mat4;
    worldMatrix: Mat4;
    matrixAutoUpdate: boolean;
    worldMatrixNeedsUpdate: boolean;
    position: Vec3;
    scale: Vec3;
    up: Vec3;
    quaternion: Quat;
    rotation: Euler;
    constructor();
    setParent(parent: Transform, notifyParent?: boolean): void;
    addChild(child: Transform, notifyChild?: boolean): void;
    removeChild(child: Transform, notifyChild?: boolean): void;
    updateMatrixWorld(force?: boolean): void;
    updateMatrix(): void;
    traverse(callback: (node: Transform) => boolean | void): void;
    decompose(): void;
    lookAt<T extends number[]>(target: T, invert?: boolean): void;
}
// #endregion

// #region Animation
export interface AnimationOptions {
    objects: BoneTransform[];
    data: any;
}
export class Animation {
    objects: BoneTransform[];
    data: any;
    elapsed: number;
    weight: number;
    duration: number;
    constructor({ objects, data }: AnimationOptions);
    update(totalWeight: number, isSet: any): void;
}
// #endregion

// #region Box
export type BoxOptions = {
    width: number;
    height: number;
    depth: number;
    widthSegments: number;
    heightSegments: number;
    depthSegments: number;
    attributes: AttributeMap;
};
export class Box extends Geometry {
    constructor(gl: OGLRenderingContext, { width, height, depth, widthSegments, heightSegments, depthSegments, attributes }?: Partial<BoxOptions>);
}
// #endregion

// #region Curve
export interface CurveOptions {
    points: Vec3[];
    divisions: number;
    type: 'catmullrom' | 'cubicbezier';
}
export class Curve {
    static CATMULLROM: 'catmullrom';
    static CUBICBEZIER: 'cubicbezier';
    static QUADRATICBEZIER: 'quadraticbezier';
    type: 'catmullrom' | 'cubicbezier' | 'quadraticbezier';
    private points;
    private divisions;
    constructor({ points, divisions, type, }?: Partial<CurveOptions>);
    _getQuadraticBezierPoints(divisions?: number): Vec3[];
    _getCubicBezierPoints(divisions?: number): Vec3[];
    _getCatmullRomPoints(divisions?: number, a?: number, b?: number): Vec3[];
    getPoints(divisions?: number, a?: number, b?: number): Vec3[];
}
// #endregion

// #region Cylinder
export type CylinderOptions = {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radialSegments: number;
    heightSegments: number;
    openEnded: boolean;
    thetaStart: number;
    thetaLength: number;
    attributes: AttributeMap;
};
export class Cylinder extends Geometry {
    constructor(gl: OGLRenderingContext, { radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength, attributes, }?: Partial<CylinderOptions>);
}
// #endregion

// #region Flowmap
export interface FlowmapOptions {
    size: number;
    falloff: number;
    alpha: number;
    dissipation: number;
    type: number;
}
export class Flowmap {
    gl: OGLRenderingContext;
    uniform: {
        value: any;
    };
    mask: {
        read: any;
        write: any;
        swap: () => void;
    };
    aspect: number;
    mouse: Vec2;
    velocity: Vec2;
    mesh: Mesh;
    constructor(gl: OGLRenderingContext, { size, // default size of the render targets
        falloff, // size of the stamp, percentage of the size
        alpha, // opacity of the stamp
        dissipation, // affects the speed that the stamp fades. Closer to 1 is slower
        type, }?: Partial<FlowmapOptions>);
    update(): void;
}
// #endregion

// #region GLTFAnimation
export class GLTFAnimation {
    private data;
    private elapsed;
    private weight;
    private loop;
    private duration;
    constructor(data: any, weight?: number);
    update(totalWeight: number, isSet: any): void;
    cubicSplineInterpolate(t: any, prevVal: any, prevTan: any, nextTan: any, nextVal: any): any;
}
// #endregion

// #region GLTFLoader
export class GLTFLoader {
    static load(gl: OGLRenderingContext, src: string): Promise<{
        json: any;
        buffers: [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown];
        bufferViews: any;
        images: any;
        textures: any;
        materials: any;
        meshes: any;
        nodes: any;
        animations: any;
        scenes: any;
        scene: any;
    }>;
    static parse(gl: any, desc: any, dir: any): Promise<{
        json: any;
        buffers: [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown];
        bufferViews: any;
        images: any;
        textures: any;
        materials: any;
        meshes: any;
        nodes: any;
        animations: any;
        scenes: any;
        scene: any;
    }>;
    static parseDesc(src: any): Promise<any>;
    static unpackGLB(glb: any): any;
    static resolveURI(uri: any, dir: any): string;
    static loadBuffers(desc: any, dir: any): Promise<[unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
    static parseBufferViews(gl: any, desc: any, buffers: any): any;
    static parseImages(gl: any, desc: any, dir: any, bufferViews: any): any;
    static parseTextures(gl: any, desc: any, images: any): any;
    static parseMaterials(gl: any, desc: any, textures: any): any;
    static parseSkins(gl: any, desc: any, bufferViews: any): any;
    static parseMeshes(gl: any, desc: any, bufferViews: any, materials: any, skins: any): any;
    static parsePrimitives(gl: any, primitives: any, desc: any, bufferViews: any, materials: any, numInstances: any): any;
    static parseAccessor(index: any, desc: any, bufferViews: any): {
        data: any;
        size: any;
        type: any;
        normalized: any;
        buffer: any;
        stride: any;
        offset: any;
        count: any;
        min: any;
        max: any;
    };
    static parseNodes(gl: any, desc: any, meshes: any, skins: any): any;
    static populateSkins(skins: any, nodes: any): void;
    static parseAnimations(gl: any, desc: any, nodes: any, bufferViews: any): any;
    static parseScenes(desc: any, nodes: any): any;
}
// #endregion

// #region GLTFSkin
export interface GLTFSkinOptions {
    skeleton: any;
    geometry: any;
    program: any;
    mode: any;
}
export class GLTFSkin extends Mesh {
    skeleton: any;
    animations: any;
    boneMatrices: Float32Array;
    boneTextureSize: number;
    boneTexture: Texture;
    constructor(gl: any, { skeleton, geometry, program, mode }?: Partial<GLTFSkinOptions>);
    createBoneTexture(): void;
    updateUniforms(): void;
    draw({ camera }?: {
        camera?: Camera;
    }): void;
}
// #endregion

// #region GPGPU
export interface GPGPUpass {
    mesh: Mesh;
    program: Program;
    uniforms: any;
    enabled: any;
    textureUniform: any;
}
export class GPGPU {
    gl: OGLRenderingContext;
    passes: GPGPUpass[];
    geometry: Triangle;
    dataLength: number;
    size: number;
    coords: Float32Array;
    uniform: {
        value: any;
    };
    fbo: {
        read: RenderTarget;
        write: RenderTarget;
        swap: () => void;
    };
    constructor(gl: OGLRenderingContext, { data, geometry, type, }: {
        data?: Float32Array;
        geometry?: Triangle;
        type?: any;
    });
    addPass({ vertex, fragment, uniforms, textureUniform, enabled }?: {
        vertex?: string;
        fragment?: string;
        uniforms?: {};
        textureUniform?: string;
        enabled?: boolean;
    }): {
        mesh: Mesh;
        program: Program;
        uniforms: {};
        enabled: boolean;
        textureUniform: string;
    };
    render(): void;
}
// #endregion

// #region KTXTexture
export interface KTXTextureOptions {
    buffer: ArrayBuffer;
    src: string;
    wrapS: number;
    wrapT: number;
    anisotropy: number;
    minFilter: number;
    magFilter: number;
}
export class KTXTexture extends Texture {
    constructor(gl: any, { buffer, wrapS, wrapT, anisotropy, minFilter, magFilter }?: Partial<KTXTextureOptions>);
    parseBuffer(buffer: ArrayBuffer): void;
}
// #endregion

// #region NormalProgram
export function NormalProgram(gl: any): Program;
// #endregion

// #region Orbit
export type OrbitOptions = {
    element: HTMLElement
    enabled: boolean
    target: Vec3
    ease: number
    inertia: number
    enableRotate: boolean
    rotateSpeed: number
    autoRotate: boolean
    autoRotateSpeed: number
    enableZoom: boolean
    zoomSpeed: number
    enablePan: boolean
    panSpeed: number
    minPolarAngle: number
    maxPolarAngle: number
    minAzimuthAngle: number
    maxAzimuthAngle: number
    minDistance: number
    maxDistance: number
}
export class Orbit {
    target: Vec3;
    forcePosition(): void;
    constructor(
        object: Transform & {
            fov: number
        }, // TODO: fov property only be used in pan()
        {
            element,
            enabled,
            target,
            ease,
            inertia,
            enableRotate,
            rotateSpeed,
            autoRotate,
            autoRotateSpeed,
            enableZoom,
            zoomSpeed,
            enablePan,
            panSpeed,
            minPolarAngle,
            maxPolarAngle,
            minAzimuthAngle,
            maxAzimuthAngle,
            minDistance,
            maxDistance,
        }?: Partial<OrbitOptions>,
    )

    update(): void;
}
// #endregion

// #region Plane
export type PlaneOptions = {
    width: number;
    height: number;
    widthSegments: number;
    heightSegments: number;
    attributes: AttributeMap;
};
export class Plane extends Geometry {
    constructor(gl: OGLRenderingContext, { width, height, widthSegments, heightSegments, attributes }?: Partial<PlaneOptions>);
    static buildPlane(position: Float32Array, normal: Float32Array, uv: Float32Array, index: Uint32Array | Uint16Array, width: number, height: number, depth: number, wSegs: number, hSegs: number, u?: number, v?: number, w?: number, uDir?: number, vDir?: number, i?: number, ii?: number): void;
}
// #endregion

// #region Polyline
export interface PolylineOptions {
    points: Vec3[];
    vertex: string;
    fragment: string;
    uniforms: {
        [key: string]: {
            value: any;
        };
    };
    attributes: {
        [key: string]: any;
    };
}
export class Polyline {
    gl: OGLRenderingContext;
    points: Vec3[];
    count: number;
    position: Float32Array;
    prev: Float32Array;
    next: Float32Array;
    geometry: Geometry;
    resolution: {
        value: Vec2;
    };
    dpr: {
        value: number;
    };
    thickness: {
        value: number;
    };
    color: {
        value: Color;
    };
    miter: {
        value: number;
    };
    program: Program;
    mesh: Mesh;
    constructor(gl: OGLRenderingContext, { points, // Array of Vec3s
        vertex, fragment, uniforms, attributes, }: Partial<PolylineOptions>);
    updateGeometry(): void;
    resize(): void;
}
// #endregion

// // #region Post
export interface PostOptions {
    width: number;
    height: number;
    dpr: number;
    wrapS: GLenum;
    wrapT: GLenum;
    minFilter: GLenum;
    magFilter: GLenum;
    geometry: Triangle;
    targetOnly: any;
}
// export interface Pass {
//     mesh: Mesh;
//     program: Program;
//     uniforms: any;
//     enabled: boolean;
//     textureUniform: any;
//     vertex?: string;
//     fragment?: string;
// }
export class Post {
    gl: OGLRenderingContext;
    options: {
        wrapS: GLenum;
        wrapT: GLenum;
        minFilter: GLenum;
        magFilter: GLenum;
        width?: number;
        height?: number;
    };
    // passes: Pass[];
    // addPass(pass: Pass): Pass;
    geometry: Triangle;
    uniform: {
        value: any;
    };
    targetOnly: any;
    fbo: any;
    dpr: number;
    width: number;
    height: number;
    constructor(gl: OGLRenderingContext, { width, height, dpr, wrapS, wrapT, minFilter, magFilter, geometry, targetOnly, }?: Partial<PostOptions>);
    resize({ width, height, dpr }?: Partial<{
        width: number;
        height: number;
        dpr: number;
    }>): void;
    render({ scene, camera, target, update, sort, frustumCull }: {
        scene?: Transform;
        camera?: Camera;
        target?: RenderTarget;
        update?: boolean;
        sort?: boolean;
        frustumCull?: boolean;
    }): void;
}
// // #endregion

// #region Rayscast
export class Raycast {
    gl: OGLRenderingContext;
    origin: Vec3;
    direction: Vec3;
    constructor(gl: OGLRenderingContext);
    castMouse(camera: Camera, mouse?: number[]): void;
    intersectBounds(meshes: Mesh | Mesh[], { maxDistance, output }?: {
        maxDistance?: number;
        output?: Array<Mesh>;
    }): Mesh[];
    intersectMeshes(meshes: any, { cullFace, maxDistance, includeUV, includeNormal, output }?: {
        cullFace?: boolean;
        maxDistance?: any;
        includeUV?: boolean;
        includeNormal?: boolean;
        output?: any[];
    }): Mesh[];
    intersectSphere(sphere: any, origin?: Vec3, direction?: Vec3): number;
    intersectBox(box: any, origin?: Vec3, direction?: Vec3): any;
    intersectTriangle(a: any, b: any, c: any, backfaceCulling?: boolean, origin?: Vec3, direction?: Vec3, normal?: Vec3): number;
    getBarycoord(point: any, a: any, b: any, c: any, target?: Vec3): Vec3;
}
// #endregion

// #region Shadow
export class Shadow {
    gl: OGLRenderingContext;
    light: Camera;
    target: RenderTarget;
    depthProgram: Program;
    castMeshes: Mesh[];
    constructor(gl: OGLRenderingContext, { light, width, height }: {
        light?: Camera;
        width?: number;
        height?: any;
    });
    add({ mesh, receive, cast, vertex, fragment, uniformProjection, uniformView, uniformTexture, }: {
        mesh: any;
        receive?: boolean;
        cast?: boolean;
        vertex?: string;
        fragment?: string;
        uniformProjection?: string;
        uniformView?: string;
        uniformTexture?: string;
    }): void;
    render({ scene }: {
        scene: any;
    }): void;
}
// #endregion

// #region Skin
export interface SkinOptions {
    rig: any;
    geometry: Geometry;
    program: Program;
    mode: GLenum;
}
export interface BoneTransform extends Transform {
    name: string;
    bindInverse: Mat4;
}
export class Skin extends Mesh {
    animations: Animation[];
    boneTexture: Texture;
    boneTextureSize: number;
    boneMatrices: Float32Array;
    root: Transform;
    bones: BoneTransform[];
    constructor(gl: OGLRenderingContext, { rig, geometry, program, mode }?: Partial<SkinOptions>);
    createBones(rig: any): void;
    createBoneTexture(): void;
    addAnimation(data: any): Animation;
    update(): void;
    draw({ camera }?: {
        camera?: Camera;
    }): void;
}
// #endregion

// #region Sphere
export type SphereOptions = {
    radius: number;
    widthSegments: number;
    heightSegments: number;
    phiStart: number;
    phiLength: number;
    thetaStart: number;
    thetaLength: number;
    attributes: AttributeMap;
};
export class Sphere extends Geometry {
    constructor(gl: OGLRenderingContext, { radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength, attributes, }?: Partial<SphereOptions>);
}
// #endregion

// #region Text
export function Text({ font, text, width, align, size, letterSpacing, lineHeight, wordSpacing, wordBreak, }: {
    font: any;
    text: any;
    width?: number;
    align?: string;
    size?: number;
    letterSpacing?: number;
    lineHeight?: number;
    wordSpacing?: number;
    wordBreak?: boolean;
}): void;
// #endregion

// #region TextureLoader
export interface TextureLoaderOptions {
    src: Partial<{
        pvrtc: string;
        s3tc: string;
        etc: string;
        etc1: string;
        astc: string;
        webp: string;
        jpg: string;
        png: string;
    }> | string;
    wrapS: number;
    wrapT: number;
    anisotropy: number;
    format: number;
    internalFormat: number;
    generateMipmaps: boolean;
    minFilter: number;
    magFilter: number;
    premultiplyAlpha: boolean;
    unpackAlignment: number;
    flipY: boolean;
}
export class TextureLoader {
    static load<T extends Texture>(gl: OGLRenderingContext, { src, // string or object of extension:src key-values
        wrapS, wrapT, anisotropy, format, internalFormat, generateMipmaps, minFilter, magFilter, premultiplyAlpha, unpackAlignment, flipY, }?: Partial<TextureLoaderOptions>): T;
    static getSupportedExtensions(gl: OGLRenderingContext): any[];
    static loadKTX(src: string, texture: KTXTexture): Promise<void>;
    static loadImage(gl: any, src: string, texture: Texture): Promise<HTMLImageElement>;
    static clearCache(): void;
}
// #endregion

// #region Torus
export class Torus extends Geometry {
    constructor(gl: any, { radius, tube, radialSegments, tubularSegments, arc, attributes }?: {
        radius?: number;
        tube?: number;
        radialSegments?: number;
        tubularSegments?: number;
        arc?: number;
        attributes?: {};
    });
}
// #endregion

// #region Triangle
export class Triangle extends Geometry {
    constructor(gl: any, { attributes }?: {
        attributes?: {};
    });
}
// #endregion
