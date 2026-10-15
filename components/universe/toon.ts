import * as THREE from "three";

let cachedGradient: THREE.DataTexture | null = null;

// Gradient map a 4 gradini per MeshToonMaterial: cel shading morbido,
// condivisa da tutti i materiali toon della scena.
export function getToonGradient(): THREE.DataTexture {
    if (cachedGradient) return cachedGradient;
    const steps = new Uint8Array([100, 160, 215, 255]);
    const tex = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    cachedGradient = tex;
    return tex;
}

const UP = new THREE.Vector3(0, 1, 0);

// Posizione e orientamento (up = normale) sulla superficie di una sfera
// centrata nell'origine. lat/lon in gradi.
export function onSurface(latDeg: number, lonDeg: number, radius: number) {
    const lat = THREE.MathUtils.degToRad(latDeg);
    const lon = THREE.MathUtils.degToRad(lonDeg);
    const normal = new THREE.Vector3(
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        Math.cos(lat) * Math.sin(lon),
    );
    return {
        position: normal.clone().multiplyScalar(radius),
        quaternion: new THREE.Quaternion().setFromUnitVectors(UP, normal),
        normal,
    };
}

export const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
