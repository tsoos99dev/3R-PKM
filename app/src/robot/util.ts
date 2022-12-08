import { MotorPosition, RobotPosition } from "./api";
import { ROBOT_d, ROBOT_D, ROBOT_R } from "../robot/constants"

export declare type Vec2 = {
    x: number,
    y: number
};

export const scaleVec2 = (v: Vec2, s: number): Vec2 => {
    return {
        x: v.x * s,
        y: v.y * s,
    }
};

export const addVec2 = (v: Vec2, w: Vec2): Vec2 => {
    return {
        x: v.x + w.x,
        y: v.y + w.y,
    }
};

export const subtractVec2 = (v: Vec2, w: Vec2): Vec2 => {
    return {
        x: v.x - w.x,
        y: v.y - w.y,
    }
};

export const dotVec2 = (v: Vec2, w: Vec2): number => {
    return v.x * w.x + v.y * w.y;
};

export const crossVec2 = (v: Vec2, w: Vec2): number => {
    return v.x * w.y - v.y * w.x;
};

export const rotateVec2 = (vec: Vec2, angle: number): Vec2 => {
    const rad = Math.PI / 180 * angle;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return { 
        x: dotVec2({x: c, y: -s}, vec),
        y: dotVec2({x: s, y: c}, vec)
    }
};

export const normVec2 = (v: Vec2): number => {
    return Math.sqrt(dotVec2(v, v));
};

export const angleVec2 = (v: Vec2, w: Vec2): number => {
    return 180 / Math.PI * Math.atan2(crossVec2(v, w), dotVec2(v, w));
};

export const formatParam = (param: number | null | undefined) => {
    return param?.toFixed(2) ?? "--";
};

export const inverseKinematics = (pos: RobotPosition): MotorPosition => {
    const M = [...Array(3).keys()].map(n => rotateVec2({x: 0, y: ROBOT_D}, 120 * n));
    const P = [...Array(3).keys()].map(n => addVec2(rotateVec2({x: 0, y: ROBOT_d}, 120 * n), pos));
    const PM = P.map((p, i) => subtractVec2(p, M[i]));

    const Rp = PM.map(pm => {
        const k = ROBOT_R/normVec2(pm);
        const Rs = Math.sqrt(k*k-1);
        const halfPM = scaleVec2(pm, 0.5);
        return {
            x: dotVec2({x: 1, y: -Rs}, halfPM),
            y: dotVec2({x: Rs, y: 1}, halfPM),
        }
    });

    const angles = Rp.map((rp, i) => angleVec2(scaleVec2(M[i], -1), rp));
    
    return {
        theta1: angles[0],
        theta2: angles[1],
        theta3: angles[2]
    }
};