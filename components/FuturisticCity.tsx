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

// --- SHADER: SERVER RACK (Calmo & Pulito) ---
const serverVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    attribute float aInstanceSeed;
    varying float vSeed;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vSeed = aInstanceSeed;
        vec4 instancePos = instanceMatrix * vec4(position, 1.0);
        vWorldPos = (modelMatrix * instancePos).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * instancePos;
    }
`;

const serverFragmentShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying float vSeed;

    uniform vec3 colorBase;
    uniform vec3 colorActive;
    uniform float uTime;
    uniform float uLedTime;
    uniform float uHueShift;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    vec3 hueShift(vec3 color, float hue) {
        const vec3 k = vec3(0.57735, 0.57735, 0.57735);
        float cosAngle = cos(hue);
        return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
    }

    void main() {
        vec3 themeColor = hueShift(colorActive, uHueShift);

        // 1. Griglia Rack
        float rows = 12.0; // Meno righe per meno rumore
        float lineThickness = 0.08;
        float rackLine = step(lineThickness, fract(vUv.y * rows));

        // 2. LED Activity (MOLTO PIÙ LENTI E RARI)
        vec2 grid = vec2(floor(vUv.x * 4.0), floor(vUv.y * rows));
        
        // Randomize per building and time
        float timeOffset = vSeed * 100.0;
        float seedOffset = vSeed * 50.0;
        
        // Use uLedTime which is calculated in JS (base speed / 8 + exponential idle increase)
        float rnd = random(grid + vec2(seedOffset) + floor(uLedTime + timeOffset)); 
        
        // step 0.80 = Circa il 20% dei LED è acceso (1/5)
        float activeBit = step(0.80, rnd); 

        // 3. Scanline (Lenta e sottile)
        float scanPos = mod(uTime * 4.0, 200.0) - 50.0;
        float scanDist = abs(vWorldPos.y - scanPos);
        float scanBeam = step(scanDist, 1.0); // Linea sottile

        // Composizione
        vec3 darkMetal = colorBase * 0.2; 
        // Intensità LED ridotta a 2.5 (era 4.0)
        vec3 ledLight = themeColor * activeBit * rackLine * 2.5; 
        vec3 scanLight = vec3(1.0) * scanBeam * 0.5 * rackLine;

        // Rim Light molto tenue
        float rim = pow(1.0 - max(dot(normalize(vNormal), vec3(0,0,1)), 0.0), 4.0);
        
        gl_FragColor = vec4(darkMetal + ledLight + scanLight + (themeColor * rim * 0.1), 1.0);
    }
`;

// --- SHADER: DIGITAL RAIN ---
const rainVertexShader = `
    attribute float velocity;
    varying float vVelocity;
    void main() {
        vVelocity = velocity;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 2.0 * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const rainFragmentShader = `
    uniform vec3 color;
    uniform float uOpacity;
    varying float vVelocity;
    
    void main() {
        float strength = distance(gl_PointCoord, vec2(0.5));
        strength = 1.0 - strength;
        strength = pow(strength, 3.0);
        
        // Make it look like a streak
        float streak = 1.0 - abs(gl_PointCoord.y - 0.5) * 2.0;
        
        gl_FragColor = vec4(color, strength * uOpacity * streak);
    }
`;

export function FuturisticCity() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    const { time, fogDensity, trafficLevel, zoom, setZoom, systemStatus, cameraTarget, resetTrigger } = useCityControls();

    const stateRef = useRef({ time, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger });
    useEffect(() => { stateRef.current = { time, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger }; }, [time, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger]);

    // --- INTERACTION TRACKING FOR LED SPEED ---
    const lastInteractionRef = useRef(Date.now());
    const ledTimeRef = useRef(0);

    useEffect(() => {
        const updateInteraction = () => { lastInteractionRef.current = Date.now(); };
        window.addEventListener('mousemove', updateInteraction);
        window.addEventListener('mousedown', updateInteraction);
        window.addEventListener('keydown', updateInteraction);
        window.addEventListener('touchstart', updateInteraction);
        window.addEventListener('wheel', updateInteraction);

        return () => {
            window.removeEventListener('mousemove', updateInteraction);
            window.removeEventListener('mousedown', updateInteraction);
            window.removeEventListener('keydown', updateInteraction);
            window.removeEventListener('touchstart', updateInteraction);
            window.removeEventListener('wheel', updateInteraction);
        };
    }, []);

    // --- SESSION TIMER (Cookie Based) ---
    const [sessionDuration, setSessionDuration] = useState("00:00:00");

    useEffect(() => {
        const cookieName = "neo_session_start";
        let start = Date.now();

        // Try to read existing cookie
        const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
        if (match) {
            start = parseInt(match[2]);
        } else {
            // Set new cookie (Session cookie)
            document.cookie = `${cookieName}=${start}; path=/`;
        }

        const timer = setInterval(() => {
            const now = Date.now();
            const diff = now - start;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setSessionDuration(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // --- NAVIGATION STATE ---
    const [moveDirection, setMoveDirection] = useState({ x: 0, z: 0 });
    const moveSpeed = 2.0;

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const CONFIG = {
            colors: {
                bg: 0x020205,
                base: new THREE.Color(0x0a1018),
                active: new THREE.Color(0x00ffaa),
                poi1: new THREE.Color(0xff00ff), // Magenta
                poi2: new THREE.Color(0xffaa00), // Orange
                poi3: new THREE.Color(0x00aaff), // Cyan
            },
            gridSize: 34,
            cellSize: 22,
            packetCount: 5000
        };

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.colors.bg);
        scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.02);

        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
        camera.position.set(-140, 110, 140);

        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: "high-performance",
            stencil: false
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.maxDistance = 500;
        controls.enablePan = true; // Enable panning for manual control

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));

        // --- BLOOM ---
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.2;
        bloomPass.strength = 0.8;
        bloomPass.radius = 0.4;
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());

        // --- POI: POINTS OF INTEREST ---
        const poiMat = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.active,
            emissive: CONFIG.colors.active,
            emissiveIntensity: 2,
            roughness: 0.2,
            metalness: 0.8
        });

        // --- POI: ESOTERIC ARTIFACTS (Randomized) ---
        const artifactGeos = [
            new THREE.TorusKnotGeometry(10, 3, 100, 16),
            new THREE.OctahedronGeometry(15, 0),
            new THREE.IcosahedronGeometry(12, 0),
            new THREE.TetrahedronGeometry(15, 0),
            new THREE.DodecahedronGeometry(12, 0)
        ];

        const artifacts: THREE.Mesh[] = [];

        // 1. RANDOM ARTIFACTS
        for (let i = 0; i < 6; i++) {
            const geo = artifactGeos[Math.floor(Math.random() * artifactGeos.length)];
            const mat = poiMat.clone();

            // Random Color from Palette
            const colors = [CONFIG.colors.poi1, CONFIG.colors.poi2, CONFIG.colors.poi3];
            const col = colors[Math.floor(Math.random() * colors.length)];
            mat.color.set(col);
            mat.emissive.set(col);

            const mesh = new THREE.Mesh(geo, mat);

            // Random Position (avoiding center 0,0)
            let ax = (Math.random() - 0.5) * 400;
            let az = (Math.random() - 0.5) * 400;
            if (Math.abs(ax) < 50) ax += 50;
            if (Math.abs(az) < 50) az += 50;

            mesh.position.set(ax, 20 + Math.random() * 40, az);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

            scene.add(mesh);
            artifacts.push(mesh);
        }

        // 2. SUPER-HYPER-MAGIC BEACONS (Cardinal Points)
        const beaconCoords = [
            { x: 0, z: -120, color: CONFIG.colors.poi1 }, // North (Who am I)
            { x: 120, z: 0, color: CONFIG.colors.poi2 },  // East (Projects)
            { x: -120, z: 0, color: CONFIG.colors.poi3 }, // West (Contact)
            { x: 0, z: 120, color: CONFIG.colors.active } // South (Home)
        ];

        const beaconGeo = new THREE.OctahedronGeometry(8, 0);

        beaconCoords.forEach(coord => {
            const mat = poiMat.clone();
            mat.color.set(coord.color);
            mat.emissive.set(coord.color);
            mat.emissiveIntensity = 3; // Extra bright

            const mesh = new THREE.Mesh(beaconGeo, mat);
            mesh.position.set(coord.x, 30, coord.z); // Float at 30

            // Add a "Halo" ring
            const ringGeo = new THREE.TorusGeometry(12, 0.5, 8, 32);
            const ring = new THREE.Mesh(ringGeo, mat);
            ring.rotation.x = Math.PI / 2;
            mesh.add(ring);

            scene.add(mesh);
            artifacts.push(mesh); // Add to animation loop
        });

        // SERVER RACKS
        const serverMat = new THREE.ShaderMaterial({
            vertexShader: serverVertexShader,
            fragmentShader: serverFragmentShader,
            uniforms: {
                colorBase: { value: CONFIG.colors.base },
                colorActive: { value: CONFIG.colors.active },
                uTime: { value: 0 },
                uLedTime: { value: 0 },
                uHueShift: { value: 0 }
            }
        });
        const serverGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
        const servers = new THREE.InstancedMesh(serverGeo, serverMat, 2500);
        scene.add(servers);

        // GENERAZIONE PROCEDURALE
        const simplex = new SimplexNoise();
        const dummy = new THREE.Object3D();
        let idx = 0;
        const busLanes: any[] = [];
        const seeds = new Float32Array(2500);

        for (let x = -CONFIG.gridSize; x <= CONFIG.gridSize; x++) {
            for (let z = -CONFIG.gridSize; z <= CONFIG.gridSize; z++) {
                // Skip POI areas
                if (Math.abs(x * CONFIG.cellSize) < 20 && Math.abs(z * CONFIG.cellSize) < 20) continue; // Core
                if (Math.abs(x * CONFIG.cellSize + 80) < 30 && Math.abs(z * CONFIG.cellSize - 80) < 30) continue; // Vault
                if (Math.abs(x * CONFIG.cellSize - 80) < 20 && Math.abs(z * CONFIG.cellSize + 80) < 20) continue; // Spire

                if (x % 4 === 0 || z % 4 === 0) {
                    if (Math.random() > 0.15) {
                        busLanes.push({ x: x * CONFIG.cellSize, z: z * CONFIG.cellSize, dir: x % 4 === 0 ? 'z' : 'x' });
                    }
                    continue;
                }
                const n = simplex.noise(x * 0.08, z * 0.08);
                if (n < -0.2) continue;

                const h = Math.pow((n * 0.5 + 0.5), 3) * 90 + 4;
                dummy.position.set(x * CONFIG.cellSize, 0, z * CONFIG.cellSize);
                dummy.scale.set(CONFIG.cellSize * 0.8, h, CONFIG.cellSize * 0.8);
                dummy.updateMatrix();
                servers.setMatrixAt(idx, dummy.matrix);
                seeds[idx] = Math.random();
                idx++;
            }
        }
        servers.instanceMatrix.needsUpdate = true;
        serverGeo.setAttribute('aInstanceSeed', new THREE.InstancedBufferAttribute(seeds, 1));

        // TRAFFIC
        const packetGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.packetCount * 6);
        const colors = new Float32Array(CONFIG.packetCount * 6);
        const packets: any[] = [];

        for (let i = 0; i < CONFIG.packetCount; i++) {
            if (busLanes.length === 0) break;
            const lane = busLanes[Math.floor(Math.random() * busLanes.length)];
            const isX = lane.dir === 'x';
            const offset = (Math.random() - 0.5) * 12;

            // Aerial Traffic Logic
            const isFlying = Math.random() > 0.8; // 20% flying
            const height = isFlying ? 15 + Math.random() * 60 : 1.0; // Fly between 15 and 75 units high

            packets.push({
                speed: 1.0 + Math.random() * 2.0,
                axis: lane.dir,
                baseX: isX ? 0 : lane.x + offset,
                baseZ: isX ? lane.z + offset : 0,
                height: height
            });

            const col = new THREE.Color(Math.random() > 0.8 ? 0xffffff : CONFIG.colors.active);
            for (let j = 0; j < 6; j++) { colors[i * 6 + j] = (j % 3 === 0) ? col.r : (j % 3 === 1) ? col.g : col.b; }
        }
        packetGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        packetGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const packetMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            linewidth: 2
        });
        const packetLines = new THREE.LineSegments(packetGeo, packetMat);
        scene.add(packetLines);

        // FLOOR
        const gridHelper = new THREE.GridHelper(2500, 100, 0x1a2a3a, 0x050510);
        gridHelper.position.y = 0.1;
        scene.add(gridHelper);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        scene.add(floor);

        // --- DIGITAL RAIN SYSTEM ---
        const rainCount = 15000;
        const rainGeo = new THREE.BufferGeometry();
        const rainPositions = new Float32Array(rainCount * 3);
        const rainVelocities = new Float32Array(rainCount);

        for (let i = 0; i < rainCount; i++) {
            rainPositions[i * 3] = (Math.random() - 0.5) * 1000; // X
            rainPositions[i * 3 + 1] = Math.random() * 400;      // Y
            rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000; // Z
            rainVelocities[i] = 2 + Math.random() * 3; // Fall speed
        }

        rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
        rainGeo.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 1));

        const rainMat = new THREE.ShaderMaterial({
            vertexShader: rainVertexShader,
            fragmentShader: rainFragmentShader,
            uniforms: {
                color: { value: new THREE.Color(0x00ffff) },
                uOpacity: { value: 0.0 } // Starts invisible, controlled by fog
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const rainSystem = new THREE.Points(rainGeo, rainMat);
        scene.add(rainSystem);

        setLoading(false);

        const clock = new THREE.Clock();
        let animationId: number;

        // Ref for movement to access inside animate
        const moveRef = { x: 0, z: 0 };
        let lastResetTrigger = resetTrigger;

        // Reset Animation State
        const resetAnimation = {
            active: false,
            startTime: 0,
            startPos: new THREE.Vector3(),
            startTarget: new THREE.Vector3()
        };

        function animate() {
            animationId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();
            const { time, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger } = stateRef.current;

            // --- RESET LOGIC ---
            // --- RESET LOGIC (SMOOTH TRANSPORTATION) ---
            if (resetTrigger > lastResetTrigger) {
                // Initialize Reset Animation
                resetAnimation.active = true;
                resetAnimation.startTime = elapsed;
                resetAnimation.startPos.copy(camera.position);
                resetAnimation.startTarget.copy(controls.target);

                // Reset Movement State
                moveRef.x = 0;
                moveRef.z = 0;
                setMoveDirection({ x: 0, z: 0 });

                // Disable auto rotate during reset
                controls.autoRotate = false;
                controls.enablePan = false;

                lastResetTrigger = resetTrigger;
            }

            if (resetAnimation.active) {
                const duration = 2.0; // 2 seconds for smooth transport
                const t = Math.min((elapsed - resetAnimation.startTime) / duration, 1.0);

                // Ease out cubic
                const ease = 1 - Math.pow(1 - t, 3);

                // Interpolate Position
                camera.position.lerpVectors(resetAnimation.startPos, new THREE.Vector3(-140, 110, 140), ease);

                // Interpolate Target
                controls.target.lerpVectors(resetAnimation.startTarget, new THREE.Vector3(0, 0, 0), ease);

                if (t >= 1.0) {
                    resetAnimation.active = false;
                    controls.autoRotate = true;
                    controls.enablePan = true;
                }
            }

            // --- NAVIGATION LOGIC ---
            if (cameraTarget) {
                // --- WARP MODE (Auto Navigation) ---
                controls.autoRotate = false;
                controls.enablePan = false; // Disable manual pan during warp

                // Target position
                const targetX = cameraTarget.x;
                const targetZ = cameraTarget.z;

                // Calculate distance to target
                const dist = Math.sqrt(Math.pow(targetX - camera.position.x, 2) + Math.pow(targetZ - camera.position.z, 2));

                // Parabolic Flight: Higher when far, lower when close
                // Max height 150 when dist is large, min height 40 when close
                const flightHeight = 40 + Math.min(dist * 0.5, 120);

                // Smooth Fly
                camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
                camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
                camera.position.y = THREE.MathUtils.lerp(camera.position.y, flightHeight, 0.05);

                // Move controls target ahead of camera to look forward
                controls.target.x = THREE.MathUtils.lerp(controls.target.x, targetX, 0.05);
                controls.target.z = THREE.MathUtils.lerp(controls.target.z, targetZ, 0.05);

                // Banking Effect (Roll)
                const bankAngle = (targetX - camera.position.x) * -0.002;
                camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, bankAngle, 0.1);

            } else if (moveRef.x !== 0 || moveRef.z !== 0) {
                // --- MANUAL WASD MODE ---
                // Disable auto rotate if moving
                controls.autoRotate = false;
                controls.enablePan = true;

                // Calculate camera forward/right vectors (flattened to XZ plane)
                const forward = new THREE.Vector3();
                camera.getWorldDirection(forward);
                forward.y = 0;
                forward.normalize();

                const right = new THREE.Vector3();
                right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

                // Apply movement relative to camera view
                const moveVec = new THREE.Vector3()
                    .addScaledVector(right, moveRef.x)
                    .addScaledVector(forward, moveRef.z)
                    .normalize()
                    .multiplyScalar(moveSpeed);

                controls.target.add(moveVec);
                camera.position.add(moveVec);

                // Reset roll
                camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, 0.1);
            } else {
                // Idle
                camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, 0.1);
            }

            // Animate Artifacts
            artifacts.forEach((art, i) => {
                art.rotation.x += 0.005 * (i % 2 === 0 ? 1 : -1);
                art.rotation.y += 0.01;
                art.position.y += Math.sin(elapsed * 2 + i) * 0.05; // Float
            });

            // --- SYSTEM STATUS LOGIC ---
            if (systemStatus === 'BLACKOUT') {
                // RED ALERT - Constant Red
                serverMat.uniforms.colorActive.value.setHex(0xff0000);
                serverMat.uniforms.uHueShift.value = 0;
                packetLines.visible = false;
                bloomPass.strength = 0.2;
            } else if (systemStatus === 'REBOOTING') {
                // PULSING RED (Smoother)
                serverMat.uniforms.colorActive.value.setHex(0xff0000);

                // Sine wave pulse instead of random flicker (Slower: * 3)
                const pulse = Math.sin(elapsed * 3) * 0.5 + 0.5; // 0 to 1

                packetLines.visible = true; // Keep visible
                packetMat.opacity = 0.3 + pulse * 0.5; // Pulse opacity instead of blinking
                bloomPass.strength = 0.5 + pulse * 0.3; // Gentler bloom pulse
            } else {
                // NORMAL OPERATION - DYNAMIC LIGHTING COMPOSITIONS

                // Define Palettes
                const PALETTES = {
                    DAWN: {   // 05:00 - 09:00
                        active: new THREE.Color(0xffaa55), // Soft Orange
                        fog: new THREE.Color(0x221133)     // Deep Purple
                    },
                    DAY: {    // 09:00 - 17:00
                        active: new THREE.Color(0x00ffff), // Cyan
                        fog: new THREE.Color(0x112233)     // Blue Grey
                    },
                    SUNSET: { // 17:00 - 21:00
                        active: new THREE.Color(0xff0055), // Magenta/Red
                        fog: new THREE.Color(0x330011)     // Dark Red
                    },
                    NIGHT: {  // 21:00 - 05:00
                        active: new THREE.Color(0x00ffaa), // Neon Green
                        fog: new THREE.Color(0x020205)     // Deep Black
                    }
                };

                let targetActive = PALETTES.NIGHT.active;
                let targetFog = PALETTES.NIGHT.fog;
                let lerpFactor = 0;

                // Determine Phase and Interpolation
                if (time >= 5 && time < 9) {
                    // Dawn -> Day
                    targetActive = PALETTES.DAWN.active.clone().lerp(PALETTES.DAY.active, (time - 5) / 4);
                    targetFog = PALETTES.DAWN.fog.clone().lerp(PALETTES.DAY.fog, (time - 5) / 4);
                } else if (time >= 9 && time < 17) {
                    // Day (Stable)
                    targetActive = PALETTES.DAY.active;
                    targetFog = PALETTES.DAY.fog;
                } else if (time >= 17 && time < 21) {
                    // Day -> Sunset
                    targetActive = PALETTES.DAY.active.clone().lerp(PALETTES.SUNSET.active, (time - 17) / 4);
                    targetFog = PALETTES.DAY.fog.clone().lerp(PALETTES.SUNSET.fog, (time - 17) / 4);
                } else if (time >= 21 || time < 5) {
                    // Sunset -> Night (or Night stable)
                    if (time >= 21) {
                        targetActive = PALETTES.SUNSET.active.clone().lerp(PALETTES.NIGHT.active, (time - 21) / 4);
                        targetFog = PALETTES.SUNSET.fog.clone().lerp(PALETTES.NIGHT.fog, (time - 21) / 4);
                    } else {
                        // Night -> Dawn
                        targetActive = PALETTES.NIGHT.active.clone().lerp(PALETTES.DAWN.active, time / 5);
                        targetFog = PALETTES.NIGHT.fog.clone().lerp(PALETTES.DAWN.fog, time / 5);
                    }
                }

                // Apply Colors
                serverMat.uniforms.colorActive.value.copy(targetActive);
                serverMat.uniforms.uHueShift.value = 0; // Disable old shift

                // Fog Color Blend
                const fog = scene.fog as THREE.FogExp2;
                fog.color.lerp(targetFog, 0.05);

                packetLines.visible = true;
                packetMat.opacity = 0.9;
                bloomPass.strength = 0.8;
            }



            // --- LED TIME CALCULATION ---
            const now = Date.now();
            const idleSeconds = (now - lastInteractionRef.current) / 1000;

            // Base speed: 0.5 (original) / 8 = 0.0625
            const baseSpeed = 0.0625;

            // Exponential increase: starts at 1x, doubles every ~10s of idle time
            // Cap at some reasonable max to prevent seizure-inducing flashing (e.g., 50x speed)
            const speedMultiplier = Math.min(50.0, Math.exp(idleSeconds / 10.0));

            const delta = clock.getDelta(); // Use getDelta for accumulation
            // Note: getElapsedTime() is used elsewhere, but for accumulation we need delta. 
            // However, calling getDelta() resets it, so we must be careful if other parts use it.
            // Since we only use getElapsedTime() above, we should calculate delta manually from elapsed to be safe
            // or just use a separate clock for delta if needed. 
            // Actually, getElapsedTime() does NOT reset delta. But getDelta() does.
            // Let's use a manual delta calculation to avoid messing with internal clock state if used elsewhere.
            // But wait, clock.getDelta() is standard. Let's just use it, but we need to make sure we don't call it multiple times per frame.
            // We haven't called getDelta() yet in this frame.

            ledTimeRef.current += delta * baseSpeed * speedMultiplier;
            serverMat.uniforms.uLedTime.value = ledTimeRef.current;
            serverMat.uniforms.uTime.value = elapsed;

            const targetFogDensity = 0.002 + (fogDensity / 100) * 0.03;
            const fog = scene.fog as THREE.FogExp2;
            fog.density = THREE.MathUtils.lerp(fog.density, targetFogDensity, 0.1);

            // Note: Fog color is now handled in the palette logic above for NORMAL status
            if (systemStatus !== 'NORMAL') {
                fog.color.setHex(0x100000);
            }

            const activePackets = Math.floor(CONFIG.packetCount * (trafficLevel / 100));
            packetLines.geometry.setDrawRange(0, activePackets * 2);

            const posArr = packetLines.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < activePackets; i++) {
                const p = packets[i];
                const limit = 1200;
                let loc = (elapsed * p.speed * 60 + i * 10) % (limit * 2) - limit;
                const tail = 40; // Increased tail length for better visibility

                if (p.axis === 'x') {
                    posArr[i * 6] = loc; posArr[i * 6 + 1] = p.height; posArr[i * 6 + 2] = p.baseZ;
                    posArr[i * 6 + 3] = loc - tail; posArr[i * 6 + 4] = p.height; posArr[i * 6 + 5] = p.baseZ;
                } else {
                    posArr[i * 6] = p.baseX; posArr[i * 6 + 1] = p.height; posArr[i * 6 + 2] = loc;
                    posArr[i * 6 + 3] = p.baseX; posArr[i * 6 + 4] = p.height; posArr[i * 6 + 5] = loc - tail;
                }
            }
            packetLines.geometry.attributes.position.needsUpdate = true;

            // --- RAIN ANIMATION ---
            // Link rain opacity to fog density (more fog = more rain)
            // Fog 0-100 -> Opacity 0.0 - 0.8
            const rainOpacity = (fogDensity / 100) * 0.8;
            rainMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(rainMat.uniforms.uOpacity.value, rainOpacity, 0.05);

            if (rainOpacity > 0.01) {
                const rainPos = rainGeo.attributes.position.array as Float32Array;
                const rainVels = rainGeo.attributes.velocity.array as Float32Array;

                for (let i = 0; i < rainCount; i++) {
                    // Move down
                    rainPos[i * 3 + 1] -= rainVels[i];

                    // Reset if below ground
                    if (rainPos[i * 3 + 1] < 0) {
                        rainPos[i * 3 + 1] = 300 + Math.random() * 100;
                        rainPos[i * 3] = (Math.random() - 0.5) * 1000; // Reset X to keep distribution
                        rainPos[i * 3 + 2] = (Math.random() - 0.5) * 1000; // Reset Z
                    }
                }
                rainGeo.attributes.position.needsUpdate = true;
            }

            camera.zoom = THREE.MathUtils.lerp(camera.zoom, zoom, 0.05);
            camera.updateProjectionMatrix();

            controls.update();
            composer.render();
        }
        animate();

        // Expose moveRef updater to external scope if needed, or just use a listener
        // But since we are inside the component, we can use a ref that we update from the UI
        (container as any)._updateMove = (x: number, z: number) => {
            moveRef.x = x;
            moveRef.z = z;
        };

        const handleResize = () => {
            if (!container) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            composer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // --- WASD CONTROLS ---
        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW': moveRef.z = 1; break;
                case 'KeyS': moveRef.z = -1; break;
                case 'KeyA': moveRef.x = -1; break;
                case 'KeyD': moveRef.x = 1; break;
            }
        };
        const onKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW':
                case 'KeyS': moveRef.z = 0; break;
                case 'KeyA':
                case 'KeyD': moveRef.x = 0; break;
            }
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            scene.clear();
        };
    }, []);

    // Helper to update movement
    const handleMove = (x: number, z: number) => {
        setMoveDirection({ x, z });
        if (containerRef.current && (containerRef.current as any)._updateMove) {
            (containerRef.current as any)._updateMove(x, z);
        }
    };

    // --- TIME-BASED MESSAGING SYSTEM ---
    const getTimeMessage = (t: number) => {
        if (t >= 5 && t < 9) return "SYSTEM_WAKEUP_SEQUENCE_INITIATED. OPTIMIZING_COGNITIVE_FUNCTIONS.";
        if (t >= 9 && t < 18) return "PRODUCTIVITY_PROTOCOL_ACTIVE. SYSTEMS_NOMINAL.";
        if (t >= 18 && t < 22) return "SUNSET_SUBROUTINE_ENGAGED. VISUAL_AESTHETICS_ENHANCED.";
        return "NIGHT_MODE_ENABLED. STEALTH_OPERATIONS_AUTHORIZED.";
    };

    return (
        <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-xl border border-white/5 bg-black shadow-2xl">
            <div ref={containerRef} className="absolute inset-0 w-full h-full" />

            {/* --- GRAPHIC PRESENTATION TEXT --- */}
            {/* Moved down to top-32 to avoid Header overlap */}
            <div className={`hidden md:block absolute top-32 left-10 z-10 pointer-events-none mix-blend-screen transition-opacity duration-300 ${systemStatus !== 'NORMAL' ? 'opacity-20' : 'opacity-80'}`}>
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tighter drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    ORBIT
                </h1>
                <div className="mt-2 h-1 w-32 bg-cyan-500 shadow-[0_0_10px_#00ffff]" />
                <div className="mt-1 text-xs text-cyan-300 font-mono tracking-[0.5em]">
                    SIMULATION
                </div>
            </div>

            {/* --- HUD & CLOCK --- */}
            {/* Moved down to top-28 to avoid Header overlap */}
            <div className="absolute top-28 right-4 font-mono text-right pointer-events-none select-none z-10">
                <div className={`text-5xl font-bold tracking-tighter mb-2 transition-colors duration-200 ${systemStatus === 'NORMAL' ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.9)] animate-pulse'}`}>
                    {(() => {
                        const hours = Math.floor(time).toString().padStart(2, '0');
                        const minutes = Math.floor((time % 1) * 60);

                        if (minutes >= 45) return <>{hours}<span className="text-3xl align-top ml-1">¾</span></>;
                        if (minutes >= 30) return <>{hours}<span className="text-3xl align-top ml-1">½</span></>;
                        if (minutes >= 15) return <>{hours}<span className="text-3xl align-top ml-1">¼</span></>;
                        return hours;
                    })()}
                </div>

                <div className="text-[10px] text-cyan-400/80 space-y-1 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/5 shadow-lg inline-block">
                    {/* <div className={systemStatus !== 'NORMAL' ? 'text-red-500' : ''}>
                        // SYSTEM_{systemStatus}
                    </div>
                    <div>_ TRAFFIC_DENSITY: {systemStatus === 'BLACKOUT' ? 'ERR' : 'HIGH'}</div> */}
                    <div className="text-cyan-300">_ UPTIME: {sessionDuration}</div>

                    {/* <div className="text-red-400/70 pt-2 text-[8px] leading-tight">
                        * TECH_COOKIE: 'neo_session_start'<br />
                        DETECTED. DELETE TO RESET.
                    </div> */}

                    {/* Time-based System Message */}
                    <div className="mt-4 text-[9px] text-cyan-200/90 font-mono tracking-widest border-t border-cyan-500/30 pt-2 max-w-[200px] ml-auto">
                        {getTimeMessage(time)}
                    </div>
                </div>
            </div>

            {/* --- NAVIGATION CONTROLLER (D-PAD) --- */}
            <div className="absolute bottom-8 right-8 z-20 flex flex-col items-center gap-1 pointer-events-auto">
                {/* ZOOM CONTROLS */}
                <div className="flex gap-1 mb-2">
                    <button
                        className="w-10 h-10 bg-black/50 border border-cyan-500/30 rounded hover:bg-cyan-500/20 active:bg-cyan-500/40 text-cyan-400 transition-colors flex items-center justify-center backdrop-blur-sm font-bold text-xl"
                        onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                        title="Zoom Out"
                    >
                        -
                    </button>
                    <button
                        className="w-10 h-10 bg-black/50 border border-cyan-500/30 rounded hover:bg-cyan-500/20 active:bg-cyan-500/40 text-cyan-400 transition-colors flex items-center justify-center backdrop-blur-sm font-bold text-xl"
                        onClick={() => setZoom(Math.min(zoom + 0.1, 2.0))}
                        title="Zoom In"
                    >
                        +
                    </button>
                </div>

                <button
                    className="w-10 h-10 bg-black/50 border border-cyan-500/30 rounded hover:bg-cyan-500/20 active:bg-cyan-500/40 text-cyan-400 transition-colors flex items-center justify-center backdrop-blur-sm"
                    onPointerDown={() => handleMove(0, 1)} onPointerUp={() => handleMove(0, 0)} onPointerLeave={() => handleMove(0, 0)}
                >
                    ▲
                </button>
                <div className="flex gap-1">
                    <button
                        className="w-10 h-10 bg-black/50 border border-cyan-500/30 rounded hover:bg-cyan-500/20 active:bg-cyan-500/40 text-cyan-400 transition-colors flex items-center justify-center backdrop-blur-sm"
                        onPointerDown={() => handleMove(-1, 0)} onPointerUp={() => handleMove(0, 0)} onPointerLeave={() => handleMove(0, 0)}
                    >
                        ◀︎
                    </button>
                    <button
                        className="w-10 h-10 bg-black/50 border border-cyan-500/30 rounded hover:bg-cyan-500/20 active:bg-cyan-500/40 text-cyan-400 transition-colors flex items-center justify-center backdrop-blur-sm"
                        onPointerDown={() => handleMove(0, -1)} onPointerUp={() => handleMove(0, 0)} onPointerLeave={() => handleMove(0, 0)}
                    >
                        ▼
                    </button>
                    <button
                        className="w-10 h-10 bg-black/50 border border-cyan-500/30 rounded hover:bg-cyan-500/20 active:bg-cyan-500/40 text-cyan-400 transition-colors flex items-center justify-center backdrop-blur-sm"
                        onPointerDown={() => handleMove(1, 0)} onPointerUp={() => handleMove(0, 0)} onPointerLeave={() => handleMove(0, 0)}
                    >
                        ▶︎
                    </button>
                </div>
                <div className="mt-2 text-[10px] font-mono text-cyan-500/50 tracking-widest">NAV_SYSTEM</div>
            </div>

            {/* --- SYSTEM FAILURE OVERLAY --- */}
            {systemStatus !== 'NORMAL' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-black/20">
                    <div className="text-center">
                        <div className="text-red-500 font-black text-6xl tracking-widest animate-pulse drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">
                            {systemStatus === 'BLACKOUT' ? 'SYSTEM FAILURE' : 'REBOOTING...'}
                        </div>
                        <div className="text-red-400 font-mono text-sm mt-4 tracking-[0.5em]">
                            UNAUTHORIZED ACCESS DETECTED
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                    <div className="text-emerald-500 font-mono text-xs tracking-[0.2em]">
                        LOADING...
                    </div>
                </div>
            )}

            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
        </div>
    );
}