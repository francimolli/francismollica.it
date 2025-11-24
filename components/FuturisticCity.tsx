"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import { useCityControls } from "@/components/CityControlsContext";

// --- SHADERS (Invariati ma ottimizzati per ricevere uHue) ---

const buildingVertexShader = `
    varying vec2 vUv;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    varying float vHeight;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vHeight = (instanceMatrix * vec4(position, 1.0)).y;
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const buildingFragmentShader = `
    varying vec2 vUv;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    varying float vHeight;

    uniform vec3 colorTop;
    uniform vec3 colorBottom;
    uniform float uTime;
    uniform float uHueShift; // Nuovo: per cambiare colore col tempo

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    vec3 hueShift(vec3 color, float hue) {
        const vec3 k = vec3(0.57735, 0.57735, 0.57735);
        float cosAngle = cos(hue);
        return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
    }

    void main() {
        vec3 baseColor = mix(colorBottom, colorTop, clamp(vHeight / 100.0, 0.0, 1.0));
        
        vec2 gridUV = vUv * vec2(2.0, 10.0);
        vec2 gridId = floor(gridUV);
        
        float noiseVal = random(gridId + floor(uTime * 0.2));
        float window = step(0.8, random(gridId)) * step(0.1, fract(gridUV.x)) * step(0.1, fract(gridUV.y));
        
        // Finestre cambiano colore in base all'orario (uHueShift)
        vec3 winColorBase = mix(vec3(0.0, 1.0, 1.0), vec3(1.0, 0.0, 1.0), random(gridId));
        vec3 windowColor = hueShift(winColorBase, uHueShift);
        
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float rim = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
        vec3 rimColor = hueShift(vec3(0.4, 0.6, 1.0), uHueShift) * rim * 2.0;

        vec3 finalColor = baseColor + (windowColor * window * 2.0 * step(5.0, vHeight)) + rimColor;
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

export function FuturisticCity() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    const { time, fogDensity, trafficLevel, zoom } = useCityControls();

    // Refs per passare i valori al loop di animazione senza ri-renderizzare React
    const stateRef = useRef({ time, fogDensity, trafficLevel, zoom });

    useEffect(() => {
        stateRef.current = { time, fogDensity, trafficLevel, zoom };
    }, [time, fogDensity, trafficLevel, zoom]);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const CONFIG = {
            colors: {
                sky: 0x050510,
                fog: 0x020205,
                buildingTop: new THREE.Color(0x1a1a2e),
                buildingBottom: new THREE.Color(0x000000),
            },
            gridSize: 30,
            cellSize: 25,
            trafficCount: 4000
        };

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.colors.sky);
        // Usiamo FogExp2 per una nebbia realistica
        scene.fog = new THREE.FogExp2(CONFIG.colors.fog, 0.002);

        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
        camera.position.set(-150, 120, 150);

        const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ReinhardToneMapping;
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Post Processing
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.1; bloomPass.strength = 1.8; bloomPass.radius = 0.5;
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());

        // Buildings
        const buildingMat = new THREE.ShaderMaterial({
            vertexShader: buildingVertexShader,
            fragmentShader: buildingFragmentShader,
            uniforms: {
                colorTop: { value: CONFIG.colors.buildingTop },
                colorBottom: { value: CONFIG.colors.buildingBottom },
                uTime: { value: 0 },
                uHueShift: { value: 0 } // Controllato dal Time Slider
            }
        });
        const buildingGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
        const instancedMesh = new THREE.InstancedMesh(buildingGeo, buildingMat, 2000);
        scene.add(instancedMesh);

        // Generation Logic (Semplificata per brevità, uguale a prima)
        const simplex = new SimplexNoise();
        const dummy = new THREE.Object3D();
        let idx = 0;
        const roadLanes: any[] = [];

        for (let x = -CONFIG.gridSize; x <= CONFIG.gridSize; x++) {
            for (let z = -CONFIG.gridSize; z <= CONFIG.gridSize; z++) {
                if (x % 4 === 0 || z % 4 === 0) {
                    if (Math.random() > 0.2) roadLanes.push({ x: x * CONFIG.cellSize, z: z * CONFIG.cellSize, dir: x % 4 === 0 ? 'z' : 'x' });
                    continue;
                }
                const n = simplex.noise(x * 0.08, z * 0.08);
                if (n < -0.3) continue;
                const h = Math.pow((n * 0.5 + 0.5), 2) * 80 * (1 - Math.sqrt(x * x + z * z) / CONFIG.gridSize) * 2 + 5;
                dummy.position.set(x * CONFIG.cellSize, 0, z * CONFIG.cellSize);
                dummy.scale.set(CONFIG.cellSize * 0.85, h, CONFIG.cellSize * 0.85);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(idx++, dummy.matrix);
            }
        }
        instancedMesh.instanceMatrix.needsUpdate = true;

        // Traffic System
        const trafficGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.trafficCount * 6); // 2 points * 3 coords
        const colors = new Float32Array(CONFIG.trafficCount * 6);
        const speeds: any[] = [];

        for (let i = 0; i < CONFIG.trafficCount; i++) {
            if (roadLanes.length === 0) break;
            const lane = roadLanes[Math.floor(Math.random() * roadLanes.length)];
            const isX = lane.dir === 'x';
            const offset = (Math.random() - 0.5) * 15;
            speeds.push({ speed: 0.5 + Math.random() * 1.5, axis: lane.dir, baseX: isX ? 0 : lane.x + offset, baseZ: isX ? lane.z + offset : 0 });

            const col = new THREE.Color(Math.random() > 0.5 ? 0x00ffff : 0xff0055);
            for (let j = 0; j < 6; j += 3) { colors[i * 6 + j] = col.r; colors[i * 6 + j + 1] = col.g; colors[i * 6 + j + 2] = col.b; }
        }
        trafficGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        trafficGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const trafficLines = new THREE.LineSegments(trafficGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6 }));
        scene.add(trafficLines);

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 2000).rotateX(-Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.8 })
        );
        floor.position.y = -0.1;
        scene.add(floor);

        setLoading(false);

        // --- ANIMATION LOOP ---
        // --- ANIMATION LOOP ---
        const clock = new THREE.Clock();
        let animationId: number;

        function animate() {
            animationId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();

            // Leggiamo i valori aggiornati dal Ref
            const { time, fogDensity, trafficLevel, zoom } = stateRef.current;

            // --- 1. UPDATE TIME (Funzionava già) ---
            const hueShiftVal = (time - 12) * 0.1;
            buildingMat.uniforms.uTime.value = elapsed;
            buildingMat.uniforms.uHueShift.value = hueShiftVal;
            const skyColor = new THREE.Color(CONFIG.colors.sky).offsetHSL(hueShiftVal * 0.05, 0, 0);
            scene.background = skyColor;

            // --- 2. UPDATE FOG (FIXED) ---
            // Il valore arriva 0-100. Dobbiamo convertirlo in 0.000 - 0.015
            const fog = scene.fog as THREE.FogExp2;
            const targetFogDensity = (fogDensity / 100) * 0.015; // <--- SCALA IL VALORE

            // Lerp per transizione fluida
            fog.density = THREE.MathUtils.lerp(fog.density, targetFogDensity, 0.05);
            fog.color.lerp(skyColor, 0.1); // La nebbia prende il colore del cielo

            // --- 3. UPDATE TRAFFIC (FIXED) ---
            // Calcoliamo quante auto mostrare (0-100%)
            const totalDrones = CONFIG.trafficCount;
            const activeDrones = Math.floor(totalDrones * (trafficLevel / 100)); // <--- SCALA IL VALORE

            // Nascondiamo le linee in eccesso
            trafficLines.geometry.setDrawRange(0, activeDrones * 2);

            // Aggiorniamo la posizione SOLO delle auto visibili
            const posArr = trafficLines.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < activeDrones; i++) {
                const s = speeds[i];
                const limit = 1000;
                // Movimento auto
                let p = (elapsed * s.speed * 50 + i * 10) % (limit * 2) - limit;

                if (s.axis === 'x') {
                    posArr[i * 6] = p; posArr[i * 6 + 1] = 1.5; posArr[i * 6 + 2] = s.baseZ;
                    posArr[i * 6 + 3] = p - 15; posArr[i * 6 + 4] = 1.5; posArr[i * 6 + 5] = s.baseZ;
                } else {
                    posArr[i * 6] = s.baseX; posArr[i * 6 + 1] = 1.5; posArr[i * 6 + 2] = p;
                    posArr[i * 6 + 3] = s.baseX; posArr[i * 6 + 4] = 1.5; posArr[i * 6 + 5] = p - 15;
                }
            }
            trafficLines.geometry.attributes.position.needsUpdate = true;

            // --- 4. UPDATE ZOOM ---
            camera.zoom = THREE.MathUtils.lerp(camera.zoom, zoom, 0.05);
            camera.updateProjectionMatrix();

            controls.update();
            composer.render();
        }
        animate();

        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            composer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            // Clean up simplified
        };
    }, []);

    return (
        <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
            <div ref={containerRef} className="absolute inset-0 w-full h-full" />
            {loading && <div className="absolute inset-0 flex items-center justify-center text-cyan-500 font-mono tracking-widest">LOADING CITY_DATA...</div>}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]"></div>
        </div>
    );
}