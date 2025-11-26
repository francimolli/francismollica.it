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
import { useFloatingSection } from "@/components/FloatingSectionContext";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";

// --- COMPONENT: VIRTUAL JOYSTICK ---
function Joystick({ onMove, label, className }: { onMove: (x: number, y: number) => void, label?: string, className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [touchId, setTouchId] = useState<number | null>(null);

    const handleStart = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling
        if (touchId !== null) return;
        const touch = e.changedTouches[0];
        setTouchId(touch.identifier);
        updatePos(touch);
    };

    const handleMove = (e: React.TouchEvent) => {
        e.preventDefault();
        if (touchId === null) return;
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
        if (touch) updatePos(touch);
    };

    const handleEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        if (touchId === null) return;
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
        if (touch) {
            setTouchId(null);
            setPos({ x: 0, y: 0 });
            onMove(0, 0);
        }
    };

    const updatePos = (touch: React.Touch) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const maxDist = rect.width / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }

        setPos({ x: dx, y: dy });
        // Normalize -1 to 1
        onMove(dx / maxDist, dy / maxDist);
    };

    return (
        <div
            ref={ref}
            className={`relative w-24 h-24 bg-black/30 border border-cyan-500/30 rounded-full backdrop-blur-sm touch-none ${className}`}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        >
            {/* Stick */}
            <div
                className="absolute w-10 h-10 bg-cyan-500/50 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-200/30"
                style={{
                    top: '50%', left: '50%',
                    transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                }}
            />
            {/* Decorators */}
            <div className="absolute inset-2 border border-dashed border-cyan-500/20 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {label && <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-cyan-400 font-mono tracking-widest uppercase opacity-70">{label}</div>}
        </div>
    );
}

// --- SHADER: GALACTIC DATA CRYSTAL ---
const crystalVertexShader = `
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

const crystalFragmentShader = `
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

        // Crystal Facets
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

        // Internal Glow / Pulse
        float timeOffset = vSeed * 100.0;
        float pulse = sin(uLedTime * 2.0 + timeOffset) * 0.5 + 0.5;
        
        // Data Activity (Sparkles)
        float sparkle = step(0.98, random(vUv + uTime * 0.1));

        // Composition
        vec3 baseGlow = colorBase * 0.1;
        vec3 activeGlow = themeColor * (fresnel + pulse * 0.5);
        vec3 dataSparkle = vec3(1.0) * sparkle * 2.0;

        gl_FragColor = vec4(baseGlow + activeGlow + dataSparkle, 0.8); // Slightly transparent feel
    }
`;

// --- SHADER: STARDUST / PHOTON STREAMS ---
const starVertexShader = `
    attribute float size;
    attribute float aAlpha;
    varying float vAlpha;
    void main() {
        vAlpha = aAlpha;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const starFragmentShader = `
    uniform vec3 color;
    varying float vAlpha;
    
    void main() {
        float strength = distance(gl_PointCoord, vec2(0.5));
        strength = 1.0 - strength;
        strength = pow(strength, 3.0);
        
        gl_FragColor = vec4(color, strength * vAlpha);
    }
`;

export function FuturisticOrbit() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [coordinates, setCoordinatesLocal] = useState({ lat: 0, long: 0 });
    const [isEscaping, setIsEscaping] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const { language } = useLanguage();
    const t = translations[language];
    const { setExpandedSection } = useFloatingSection();
    const lastTriggerMap = useRef<Record<string, number>>({});
    const sectionTargets = [
        { id: "about", x: 0, y: 110, z: -200 },
        { id: "projects", x: 200, y: 110, z: 0 },
        { id: "contact", x: -200, y: 110, z: 0 },
        { id: "music", x: 0, y: 110, z: 200 },
    ];

    const { time, timeSpeed, fogDensity, trafficLevel, zoom, setZoom, systemStatus, cameraTarget, setCameraTarget, resetTrigger, regenerationTrigger, escapeTrigger, setCoordinates, invertYAxis } = useCityControls();
    const pendingSectionOpen = useRef<{ id: string, startTime: number, startPos: THREE.Vector3 } | null>(null);
    const stateRef = useRef({ time, timeSpeed, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger, escapeTrigger });
    useEffect(() => { stateRef.current = { time, timeSpeed, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger, escapeTrigger }; }, [time, timeSpeed, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger, escapeTrigger]);

    // --- INTERACTION TRACKING ---
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

    // --- SESSION TIMER ---
    const [sessionDuration, setSessionDuration] = useState("00:00:00");
    useEffect(() => {
        const cookieName = "galactic_session_start";
        let start = Date.now();
        const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
        if (match) start = parseInt(match[2]);
        else document.cookie = `${cookieName}=${start}; path=/`;

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

        // Randomize Galaxy Theme on Regeneration
        const hueShift = Math.random() * Math.PI * 2;
        const baseColor = new THREE.Color().setHSL(Math.random(), 0.5, 0.1);
        const activeColor = new THREE.Color().setHSL((Math.random() + 0.5) % 1, 1.0, 0.5);

        const CONFIG = {
            colors: {
                bg: 0x000000, // Deep Space
                base: baseColor,
                active: activeColor,
                poi1: new THREE.Color().setHSL(Math.random(), 1.0, 0.5),
                poi2: new THREE.Color().setHSL(Math.random(), 1.0, 0.5),
                poi3: new THREE.Color().setHSL(Math.random(), 1.0, 0.5),
            },
            starCount: 3000 + Math.floor(Math.random() * 2000),
            packetCount: 3000
        };

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.colors.bg);
        // Galactic Fog: Sparse, deep color
        scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.002);

        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 3000);
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
        controls.autoRotateSpeed = 0.2; // Slower rotation for space
        controls.maxDistance = 1000;
        controls.enablePan = true;

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));

        const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.1; // Lower threshold for stars
        bloomPass.strength = 1.2;  // Stronger glow
        bloomPass.radius = 0.5;
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());

        // --- MATERIALS ---
        const poiMat = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.active,
            emissive: CONFIG.colors.active,
            emissiveIntensity: 3,
            roughness: 0.1,
            metalness: 0.9
        });

        // --- GALACTIC CRYSTALS (The "Buildings") ---
        const crystalMat = new THREE.ShaderMaterial({
            vertexShader: crystalVertexShader,
            fragmentShader: crystalFragmentShader,
            uniforms: {
                colorBase: { value: CONFIG.colors.base },
                colorActive: { value: CONFIG.colors.active },
                uTime: { value: 0 },
                uLedTime: { value: 0 },
                uHueShift: { value: 0 }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const crystalGeo = new THREE.OctahedronGeometry(1, 0);
        const crystals = new THREE.InstancedMesh(crystalGeo, crystalMat, CONFIG.starCount);

        const dummy = new THREE.Object3D();
        const seeds = new Float32Array(CONFIG.starCount);
        const simplex = new SimplexNoise();

        // Generate Galaxy Distribution
        // Randomize shape parameters
        const spiralTightness = 0.1 + Math.random() * 0.5;
        const armCount = 2 + Math.floor(Math.random() * 4);

        for (let i = 0; i < CONFIG.starCount; i++) {
            // Spiral Galaxy Distribution
            const angle = Math.random() * Math.PI * 2 * armCount; // More arms?
            const radius = 50 + Math.random() * 400; // Hole in middle
            const spiralOffset = radius * spiralTightness; // Twist

            const x = Math.cos(angle + spiralOffset) * radius;
            const z = Math.sin(angle + spiralOffset) * radius;

            // Vertical spread (Disk)
            const y = (Math.random() - 0.5) * 60 * (1 - radius / 500); // Thicker at center

            // Noise for clumping
            const n = simplex.noise(x * 0.01, z * 0.01);
            const scale = 1 + Math.max(0, n) * 5;

            dummy.position.set(x, y, z);
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            dummy.scale.set(scale, scale * (1 + Math.random()), scale);
            dummy.updateMatrix();

            crystals.setMatrixAt(i, dummy.matrix);
            seeds[i] = Math.random();
        }
        crystals.instanceMatrix.needsUpdate = true;
        crystalGeo.setAttribute('aInstanceSeed', new THREE.InstancedBufferAttribute(seeds, 1));
        scene.add(crystals);

        // --- ARTIFACTS (Beacons) ---
        const artifacts: THREE.Mesh[] = [];
        const beaconCoords = [
            { x: 0, z: -200, color: CONFIG.colors.poi1 }, // North
            { x: 200, z: 0, color: CONFIG.colors.poi2 },  // East
            { x: -200, z: 0, color: CONFIG.colors.poi3 }, // West
            { x: 0, z: 200, color: CONFIG.colors.active } // South
        ];

        const beaconGeo = new THREE.IcosahedronGeometry(6, 1);

        beaconCoords.forEach(coord => {
            const mat = poiMat.clone();
            mat.color.set(coord.color);
            mat.emissive.set(coord.color);

            const mesh = new THREE.Mesh(beaconGeo, mat);
            mesh.position.set(coord.x, 0, coord.z); // Float at 0 plane
            mesh.scale.set(1.5, 1.5, 1.5); // 1.5x Size

            // Orbital Rings
            const ringGeo = new THREE.TorusGeometry(15, 0.2, 16, 100);
            const ring = new THREE.Mesh(ringGeo, mat);
            ring.rotation.x = Math.PI / 2;
            mesh.add(ring);

            const ring2 = new THREE.Mesh(ringGeo, mat);
            ring2.rotation.x = Math.PI / 3;
            ring2.scale.set(0.8, 0.8, 0.8);
            mesh.add(ring2);

            scene.add(mesh);
            artifacts.push(mesh);
        });

        // --- PHOTON STREAMS (Traffic) ---
        const packetGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.packetCount * 6);
        const colors = new Float32Array(CONFIG.packetCount * 6);
        const packets: any[] = [];

        for (let i = 0; i < CONFIG.packetCount; i++) {
            // Random start/end points in the galaxy
            const r1 = 100 + Math.random() * 300;
            const a1 = Math.random() * Math.PI * 2;
            const start = new THREE.Vector3(Math.cos(a1) * r1, (Math.random() - 0.5) * 20, Math.sin(a1) * r1);

            const r2 = 100 + Math.random() * 300;
            const a2 = a1 + (Math.random() - 0.5); // Close-ish angle
            const end = new THREE.Vector3(Math.cos(a2) * r2, (Math.random() - 0.5) * 20, Math.sin(a2) * r2);

            const dir = new THREE.Vector3().subVectors(end, start).normalize();
            const dist = start.distanceTo(end);

            packets.push({
                speed: 2.0 + Math.random() * 3.0,
                start: start,
                dir: dir,
                dist: dist,
                offset: Math.random() * 1000
            });

            const col = new THREE.Color(Math.random() > 0.8 ? 0xffffff : CONFIG.colors.active);
            for (let j = 0; j < 6; j++) { colors[i * 6 + j] = (j % 3 === 0) ? col.r : (j % 3 === 1) ? col.g : col.b; }
        }
        packetGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        packetGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const packetMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const packetLines = new THREE.LineSegments(packetGeo, packetMat);
        scene.add(packetLines);

        // --- STARDUST (Rain) ---
        const dustCount = 8000;
        const dustGeo = new THREE.BufferGeometry();
        const dustPos = new Float32Array(dustCount * 3);
        const dustSizes = new Float32Array(dustCount);
        const dustAlphas = new Float32Array(dustCount);

        for (let i = 0; i < dustCount; i++) {
            dustPos[i * 3] = (Math.random() - 0.5) * 1000;
            dustPos[i * 3 + 1] = (Math.random() - 0.5) * 400;
            dustPos[i * 3 + 2] = (Math.random() - 0.5) * 1000;
            dustSizes[i] = Math.random() * 2;
            dustAlphas[i] = Math.random() * 0.5 + 0.1;
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        dustGeo.setAttribute('size', new THREE.InstancedBufferAttribute(dustSizes, 1));
        dustGeo.setAttribute('aAlpha', new THREE.InstancedBufferAttribute(dustAlphas, 1));

        const dustMat = new THREE.ShaderMaterial({
            vertexShader: starVertexShader,
            fragmentShader: starFragmentShader,
            uniforms: {
                color: { value: new THREE.Color(0xffffff) }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const dustSystem = new THREE.Points(dustGeo, dustMat);
        scene.add(dustSystem);

        setLoading(false);

        // --- ANIMATION LOOP ---
        const clock = new THREE.Clock();
        let animationId: number;
        const moveRef = { x: 0, z: 0, y: 0, yaw: 0, pitch: 0 };
        const resetAnimation = { active: false, startTime: 0, startPos: new THREE.Vector3(), startTarget: new THREE.Vector3(), endPos: new THREE.Vector3(), lastTrigger: resetTrigger };
        const escapeAnimation = { active: false, startTime: 0, startPos: new THREE.Vector3(), startTarget: new THREE.Vector3(), targetPos: new THREE.Vector3(), approachPos: new THREE.Vector3(), reEntryColor: new THREE.Color(), lastTrigger: escapeTrigger };

        function animate() {
            animationId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();
            const delta = clock.getDelta();
            const { time, timeSpeed, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger, escapeTrigger } = stateRef.current;

            // --- ESCAPE ANIMATION ---
            if (escapeTrigger > escapeAnimation.lastTrigger) {
                escapeAnimation.active = true;
                setIsEscaping(true);
                escapeAnimation.startTime = elapsed;
                escapeAnimation.startPos.copy(camera.position);
                escapeAnimation.startTarget.copy(controls.target);
                escapeAnimation.reEntryColor.setHSL(Math.random(), 1.0, 0.5); // Random vibrant color
                if (cameraTarget) {
                    escapeAnimation.targetPos.set(cameraTarget.x, cameraTarget.y || 110, cameraTarget.z);
                    // Calculate approach position (Dynamic distance for realism)
                    const dist = escapeAnimation.startPos.distanceTo(escapeAnimation.targetPos);
                    const approachDist = Math.min(dist * 0.3, 400); // Stop 400 units away or 30% of trip
                    const dir = new THREE.Vector3().subVectors(escapeAnimation.startPos, escapeAnimation.targetPos).normalize();
                    if (dir.lengthSq() === 0) dir.set(0, 0, 1);
                    escapeAnimation.approachPos.copy(escapeAnimation.targetPos).add(dir.multiplyScalar(approachDist));
                }
                escapeAnimation.lastTrigger = escapeTrigger;
                controls.autoRotate = false;
                controls.enablePan = false;
            }

            if (escapeAnimation.active) {
                const duration = 8.5; // Extended for Re-entry phase
                const t = (elapsed - escapeAnimation.startTime) / duration;

                if (t >= 1.0) {
                    escapeAnimation.active = false;
                    setIsEscaping(false);
                    bloomPass.strength = 1.5;
                    bloomPass.radius = 0.4;
                    camera.fov = 75;
                    camera.updateProjectionMatrix();
                    // Snap to target
                    camera.position.copy(escapeAnimation.targetPos);
                    controls.target.set(0, 0, 0); // Look at Galactic Core
                    // Clear target to release control
                    if ((containerRef.current as any)._clearTarget) {
                        (containerRef.current as any)._clearTarget();
                    }
                    controls.autoRotate = true;
                    controls.enablePan = true;

                    // Reset Fog immediately to be safe
                    if (scene.fog instanceof THREE.FogExp2) {
                        scene.fog.color.setHex(0x000000);
                        scene.fog.density = 0.002;
                    }
                } else {
                    // 1. Charge (0 - 12%) -> 1s
                    if (t < 0.12) {
                        const charge = t / 0.12;
                        // Shake - INTENSIFIED
                        camera.position.x = escapeAnimation.startPos.x + (Math.random() - 0.5) * charge * 10;
                        camera.position.y = escapeAnimation.startPos.y + (Math.random() - 0.5) * charge * 10;
                        camera.position.z = escapeAnimation.startPos.z + (Math.random() - 0.5) * charge * 10;
                        // Bloom buildup
                        bloomPass.strength = 1.5 + charge * 10.0;
                    }
                    // 2. Explosion (12% - 14%) -> 0.2s
                    else if (t < 0.14) {
                        bloomPass.strength = 50.0; // BLINDING WHITE
                        bloomPass.radius = 3.0;
                        camera.position.copy(escapeAnimation.startPos); // Reset shake
                    }
                    // 3. Travel (14% - 53%) -> 3.3s -> To Approach Pos
                    else if (t < 0.53) {
                        const travelT = (t - 0.14) / (0.53 - 0.14);
                        // Ease in out cubic
                        const ease = travelT < 0.5 ? 4 * travelT * travelT * travelT : 1 - Math.pow(-2 * travelT + 2, 3) / 2;

                        camera.position.lerpVectors(escapeAnimation.startPos, escapeAnimation.approachPos, ease);
                        controls.target.lerpVectors(escapeAnimation.startTarget, new THREE.Vector3(0, 0, 0), ease); // Look at Core

                        // Warp effect - INTENSIFIED
                        bloomPass.strength = 5.0 + Math.sin(travelT * 20) * 2.0;
                        camera.fov = 75 + Math.sin(travelT * Math.PI) * 85; // Extreme FOV warp (up to 160)
                        camera.updateProjectionMatrix();
                    }
                    // 4. Re-entry (53% - 82%) -> 2.5s -> Colored Fog
                    else if (t < 0.82) {
                        const reEntryT = (t - 0.53) / (0.82 - 0.53);

                        // Fog Color: Lerp to random vibrant color
                        if (scene.fog instanceof THREE.FogExp2) {
                            scene.fog.color.lerp(escapeAnimation.reEntryColor, 0.1);
                            scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, 0.02, 0.1); // Thick colored fog
                        }

                        // Bloom: High and pulsing
                        bloomPass.strength = 10.0 + Math.sin(reEntryT * 10) * 5.0;

                        // Camera: Slow drift from ApproachPos (10% progress)
                        const subTarget = new THREE.Vector3().lerpVectors(escapeAnimation.approachPos, escapeAnimation.targetPos, 0.2);
                        camera.position.lerpVectors(escapeAnimation.approachPos, subTarget, reEntryT);

                        // FOV: High turbulence
                        camera.fov = 140 + Math.sin(reEntryT * 5) * 10;
                        camera.updateProjectionMatrix();
                    }
                    // 5. Clear (82% - 100%) -> 1.5s -> Gyroscopic Spin & Fade
                    else {
                        const clearT = (t - 0.82) / (1.0 - 0.82);
                        const ease = 1 - Math.pow(1 - clearT, 3);

                        // Fog: Opaque -> Clear
                        if (scene.fog instanceof THREE.FogExp2) {
                            scene.fog.color.lerp(new THREE.Color(0x000000), 0.1);
                            // Start very dense (0.5) and clear up
                            scene.fog.density = 0.5 * (1 - ease) + 0.002;
                        }

                        // Bloom: Fade
                        bloomPass.strength = 5.0 * (1 - clearT) + 1.5;

                        // FOV: Restore
                        camera.fov = 140 - (clearT * 65); // 140 -> 75
                        camera.updateProjectionMatrix();

                        // Gyroscopic Rotation
                        const speed = 15.0 * (1 - clearT); // Decaying speed

                        // Rotate around multiple axes (Tumbling)
                        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), speed * delta); // Y (Yaw)
                        camera.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), speed * delta * 0.5); // X (Pitch)

                        // Drift to Target Radius/Height
                        const targetRadius = new THREE.Vector3(escapeAnimation.targetPos.x, 0, escapeAnimation.targetPos.z).length();
                        const currentRadius = new THREE.Vector3(camera.position.x, 0, camera.position.z).length();
                        const newRadius = THREE.MathUtils.lerp(currentRadius, targetRadius, 0.05);
                        const newY = THREE.MathUtils.lerp(camera.position.y, escapeAnimation.targetPos.y, 0.05);

                        const flat = new THREE.Vector3(camera.position.x, 0, camera.position.z).normalize().multiplyScalar(newRadius);
                        camera.position.set(flat.x, newY, flat.z);

                        camera.lookAt(0, 0, 0);
                        controls.target.set(0, 0, 0);
                    }
                }

                // Skip normal navigation
                composer.render();
                return;
            }

            // Update Coordinates
            const lat = (camera.position.z / 10).toFixed(2);
            const long = (camera.position.x / 10).toFixed(2);
            const coords = { lat: parseFloat(lat), long: parseFloat(long) };
            setCoordinates(coords);
            setCoordinatesLocal(coords);

            // --- RESET LOGIC ---
            if (resetTrigger > resetAnimation.lastTrigger) {
                resetAnimation.active = true;
                setIsResetting(true);
                resetAnimation.startTime = elapsed;
                resetAnimation.startPos.copy(camera.position);
                resetAnimation.startTarget.copy(controls.target);
                moveRef.x = 0; moveRef.z = 0; moveRef.y = 0; moveRef.yaw = 0; moveRef.pitch = 0;
                setMoveDirection({ x: 0, z: 0 }); // Keep for compatibility, though less used now
                controls.autoRotate = false;
                controls.enablePan = false;
                resetAnimation.lastTrigger = resetTrigger;
            }

            if (resetAnimation.active) {
                const duration = 2.0;
                const t = Math.min((elapsed - resetAnimation.startTime) / duration, 1.0);
                const ease = 1 - Math.pow(1 - t, 3);

                camera.position.lerpVectors(resetAnimation.startPos, new THREE.Vector3(-140, 110, 140), ease);
                controls.target.lerpVectors(resetAnimation.startTarget, new THREE.Vector3(0, 0, 0), ease);

                // Entropy Explosion Effect
                if (t < 0.5) {
                    const explosionT = t / 0.5;
                    // Flash
                    bloomPass.strength = 20.0 * (1 - explosionT) + 1.5;
                    bloomPass.radius = 1.0 * (1 - explosionT) + 0.4;

                    // Shake
                    const shake = (1 - explosionT) * 2.0;
                    camera.position.x += (Math.random() - 0.5) * shake;
                    camera.position.y += (Math.random() - 0.5) * shake;
                    camera.position.z += (Math.random() - 0.5) * shake;
                } else {
                    bloomPass.strength = 1.5;
                    bloomPass.radius = 0.4;
                }

                if (t >= 1.0) {
                    resetAnimation.active = false;
                    setIsResetting(false);
                    controls.autoRotate = true;
                    controls.enablePan = true;
                }
            }

            // --- NAVIGATION ---
            if (cameraTarget) {
                controls.autoRotate = false;
                controls.enablePan = false;
                const targetX = cameraTarget.x;
                const targetY = cameraTarget.y || 110; // Use provided Y or default
                const targetZ = cameraTarget.z;

                // Calculate distance to target
                const dist = Math.sqrt(
                    Math.pow(targetX - camera.position.x, 2) +
                    Math.pow(targetY - camera.position.y, 2) +
                    Math.pow(targetZ - camera.position.z, 2)
                );

                // If we're very close to the target, release control
                if (dist < 5) {
                    controls.autoRotate = true;
                    controls.enablePan = true;
                    // Clear target to allow user control
                    if ((containerRef.current as any)._clearTarget) {
                        (containerRef.current as any)._clearTarget();
                    }
                } else {
                    // Space Flight: Smoother, floatier
                    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.03);
                    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.03);
                    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.03);

                    controls.target.x = THREE.MathUtils.lerp(controls.target.x, targetX, 0.03);
                    controls.target.z = THREE.MathUtils.lerp(controls.target.z, targetZ, 0.03);

                    // Roll
                    const bankAngle = (targetX - camera.position.x) * -0.001;
                    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, bankAngle, 0.05);
                }


            } else if (moveRef.x !== 0 || moveRef.z !== 0 || moveRef.y !== 0 || moveRef.yaw !== 0 || moveRef.pitch !== 0) {
                controls.autoRotate = false;
                controls.enablePan = true;

                // 1. Movement (X/Z - 3D Flight)
                const forward = new THREE.Vector3();
                camera.getWorldDirection(forward);
                // forward.y = 0; // REMOVED: Allow 3D flight (fly where you look)
                forward.normalize();

                const right = new THREE.Vector3();
                right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

                const moveVec = new THREE.Vector3()
                    .addScaledVector(right, moveRef.x)
                    .addScaledVector(forward, moveRef.z)
                    .normalize()
                    .multiplyScalar(moveSpeed);

                controls.target.add(moveVec);
                camera.position.add(moveVec);

                // 2. Rotation (Look - FPS Style)
                if (moveRef.yaw !== 0 || moveRef.pitch !== 0) {
                    const lookSpeed = 0.03;

                    // Rotate TARGET around CAMERA
                    const offset = new THREE.Vector3().subVectors(controls.target, camera.position);

                    // Yaw (World Y)
                    if (moveRef.yaw !== 0) {
                        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -moveRef.yaw * lookSpeed);
                    }

                    // Pitch (Local Right)
                    if (moveRef.pitch !== 0) {
                        const localRight = new THREE.Vector3().crossVectors(offset, new THREE.Vector3(0, 1, 0)).normalize();
                        offset.applyAxisAngle(localRight, moveRef.pitch * lookSpeed);
                    }

                    controls.target.copy(camera.position).add(offset);
                }

                camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, -moveRef.x * 0.05, 0.1);
            } else {
                camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, 0.1);
            }

            // --- ARTIFACTS ANIMATION ---
            artifacts.forEach((art, i) => {
                art.rotation.x += 0.002;
                art.rotation.y += 0.005;
                // Orbital float
                art.position.y = Math.sin(elapsed * 0.5 + i) * 5;
            });

            // --- STATUS & COLORS ---
            if (systemStatus === 'BLACKOUT') {
                crystalMat.uniforms.colorActive.value.setHex(0xff0000);
                crystalMat.uniforms.uHueShift.value = 0;
                packetLines.visible = false;
                bloomPass.strength = 0.2;
            } else if (systemStatus === 'REBOOTING') {
                crystalMat.uniforms.colorActive.value.setHex(0xff0000);
                const pulse = Math.sin(elapsed * 3) * 0.5 + 0.5;
                packetLines.visible = true;
                packetMat.opacity = 0.3 + pulse * 0.5;
                bloomPass.strength = 0.5 + pulse * 0.5;
            } else {
                // DYNAMIC PALETTES (Space Theme)
                const PALETTES = {
                    DAWN: { active: new THREE.Color(0xffaa55), fog: new THREE.Color(0x220033) }, // Nebula Orange
                    DAY: { active: new THREE.Color(0x00ffff), fog: new THREE.Color(0x001133) },  // Blue Star
                    SUNSET: { active: new THREE.Color(0xff0055), fog: new THREE.Color(0x330011) }, // Red Giant
                    NIGHT: { active: new THREE.Color(0x00ffaa), fog: new THREE.Color(0x000000) }   // Deep Void
                };

                let targetActive = PALETTES.NIGHT.active;
                let targetFog = PALETTES.NIGHT.fog;

                // Time Logic (Same as before)
                if (time >= 5 && time < 9) {
                    targetActive = PALETTES.DAWN.active.clone().lerp(PALETTES.DAY.active, (time - 5) / 4);
                    targetFog = PALETTES.DAWN.fog.clone().lerp(PALETTES.DAY.fog, (time - 5) / 4);
                } else if (time >= 9 && time < 17) {
                    targetActive = PALETTES.DAY.active;
                    targetFog = PALETTES.DAY.fog;
                } else if (time >= 17 && time < 21) {
                    targetActive = PALETTES.DAY.active.clone().lerp(PALETTES.SUNSET.active, (time - 17) / 4);
                    targetFog = PALETTES.DAY.fog.clone().lerp(PALETTES.SUNSET.fog, (time - 17) / 4);
                } else if (time >= 21 || time < 5) {
                    if (time >= 21) {
                        targetActive = PALETTES.SUNSET.active.clone().lerp(PALETTES.NIGHT.active, (time - 21) / 4);
                        targetFog = PALETTES.SUNSET.fog.clone().lerp(PALETTES.NIGHT.fog, (time - 21) / 4);
                    } else {
                        targetActive = PALETTES.NIGHT.active.clone().lerp(PALETTES.DAWN.active, time / 5);
                        targetFog = PALETTES.NIGHT.fog.clone().lerp(PALETTES.DAWN.fog, time / 5);
                    }
                }

                crystalMat.uniforms.colorActive.value.copy(targetActive);
                crystalMat.uniforms.uHueShift.value = 0;
                if (scene.fog) {
                    scene.fog.color.lerp(targetFog, 0.05);
                }
                packetLines.visible = true;
                packetMat.opacity = 0.6;
                bloomPass.strength = 1.2;
            }

            // --- INTERACTION SPEED ---
            const now = Date.now();
            const idleSeconds = (now - lastInteractionRef.current) / 1000;
            const speedMultiplier = Math.min(50.0, Math.exp(idleSeconds / 10.0));
            // delta is already defined at top of animate
            ledTimeRef.current += delta * 0.05 * speedMultiplier;

            crystalMat.uniforms.uLedTime.value = ledTimeRef.current;
            crystalMat.uniforms.uTime.value = elapsed;

            // Fog Density & Color
            if (!escapeAnimation.active) {
                const targetFogDensity = 0.0005 + (fogDensity / 100) * 0.005; // Much less fog in space
                if (scene.fog instanceof THREE.FogExp2) {
                    scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, targetFogDensity, 0.1);
                    // Ensure color is black
                    if (scene.fog.color.getHex() !== 0x000000) {
                        scene.fog.color.lerp(new THREE.Color(0x000000), 0.05);
                    }
                }
            }

            // --- PHOTON STREAMS ANIMATION ---
            const activePackets = Math.floor(CONFIG.packetCount * (trafficLevel / 100));
            packetLines.geometry.setDrawRange(0, activePackets * 2);
            const posArr = packetLines.geometry.attributes.position.array as Float32Array;

            for (let i = 0; i < activePackets; i++) {
                const p = packets[i];
                const totalDist = p.dist + 200; // Add buffer
                const speed = p.speed * 20;
                let currentDist = (elapsed * speed + p.offset) % totalDist;

                // Calculate current position along the direction vector
                const currentPos = new THREE.Vector3().copy(p.start).addScaledVector(p.dir, currentDist);
                const tailPos = new THREE.Vector3().copy(p.start).addScaledVector(p.dir, currentDist - 40); // Tail length

                posArr[i * 6] = currentPos.x; posArr[i * 6 + 1] = currentPos.y; posArr[i * 6 + 2] = currentPos.z;
                posArr[i * 6 + 3] = tailPos.x; posArr[i * 6 + 4] = tailPos.y; posArr[i * 6 + 5] = tailPos.z;
            }
            packetLines.geometry.attributes.position.needsUpdate = true;

            // --- STARDUST ANIMATION ---
            // Rotate the dust system slowly
            dustSystem.rotation.y = elapsed * 0.02;

            camera.zoom = THREE.MathUtils.lerp(camera.zoom, zoom, 0.05);
            camera.updateProjectionMatrix();

            // Sync rotation with time speed
            if (!escapeAnimation.active && !resetAnimation.active) {
                controls.autoRotateSpeed = 0.2 * timeSpeed;

                // --- PROXIMITY TRIGGERS ---
                // --- PROXIMITY TRIGGERS ---
                const now = Date.now();

                if (pendingSectionOpen.current) {
                    // COLLAPSE ANIMATION
                    const { id, startTime, startPos } = pendingSectionOpen.current;
                    const progress = (elapsed - startTime) / 0.8; // 0.8s duration

                    if (progress >= 1) {
                        setExpandedSection(id);
                        pendingSectionOpen.current = null;
                        bloomPass.strength = 1.2; // Reset bloom
                        camera.rotation.z = 0; // Reset roll
                    } else {
                        // Suck into the black hole (artifact center)
                        const target = sectionTargets.find(s => s.id === id);
                        if (target) {
                            const t = progress * progress; // Ease in
                            // Move towards center
                            camera.position.lerpVectors(startPos, new THREE.Vector3(target.x, target.y, target.z), t * 0.05);
                            // Spin effect
                            camera.rotation.z += 0.2;
                            // Flash
                            bloomPass.strength = 1.2 + progress * 3.0;
                        }
                    }
                } else {
                    for (const section of sectionTargets) {
                        // Check cooldown (45s)
                        const lastTrigger = lastTriggerMap.current[section.id] || 0;
                        if (now - lastTrigger < 45000) continue;

                        const dist = Math.sqrt(
                            Math.pow(camera.position.x - section.x, 2) +
                            Math.pow(camera.position.y - section.y, 2) +
                            Math.pow(camera.position.z - section.z, 2)
                        );
                        // Reduced distance to 15 (must enter it)
                        if (dist < 15) {
                            pendingSectionOpen.current = {
                                id: section.id,
                                startTime: elapsed,
                                startPos: camera.position.clone()
                            };
                            lastTriggerMap.current[section.id] = now;
                            break;
                        }
                    }
                }
            }

            controls.update();
            composer.render();
        }
        animate();

        (container as any)._updateMove = (x: number, z: number, y: number = 0, yaw: number = 0, pitch: number = 0) => {
            moveRef.x = x;
            moveRef.z = z;
            moveRef.y = y;
            moveRef.yaw = yaw;
            moveRef.pitch = pitch;
        };

        (container as any)._clearTarget = () => {
            setCameraTarget(null);
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
                case 'KeyW': case 'KeyS': moveRef.z = 0; break;
                case 'KeyA': case 'KeyD': moveRef.x = 0; break;
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
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [regenerationTrigger]); // Re-run when regenerationTrigger changes

    const handleMove = (x: number, z: number, y: number = 0, yaw: number = 0, pitch: number = 0) => {
        // setMoveDirection({ x, z }); // Optional update for React state if needed
        if (containerRef.current && (containerRef.current as any)._updateMove) {
            (containerRef.current as any)._updateMove(x, z, y, yaw, pitch);
        }
    };

    return (
        <div className="fixed inset-0 z-0 bg-black">
            <div ref={containerRef} className="w-full h-full" />

            {/* --- HUD OVERLAY --- */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]" />

                {/* Mobile Coordinates (Top-Left) */}
                <div className="absolute top-32 left-8 lg:hidden flex items-center gap-2 text-xs text-cyan-400 bg-black/40 backdrop-blur-sm p-2 rounded border border-cyan-900/30">
                    <span>{coordinates.lat.toFixed(2)}°N</span>
                    <span>{coordinates.long.toFixed(2)}°E</span>
                </div>

                {/* Session Timer */}
                <div className="absolute top-32 right-8 flex flex-col items-end gap-1 pointer-events-none z-20">
                    <div className="text-[10px] text-cyan-600 font-mono tracking-widest uppercase">{t.hud.missionTime}</div>
                    <div className="text-xl font-bold text-cyan-400 font-mono tracking-widest drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
                        {sessionDuration}
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute top-32 left-8 hidden md:flex items-center gap-3 bg-black/40 backdrop-blur-sm p-3 rounded border border-cyan-900/30">
                    <div className={`w-2 h-2 rounded-full ${systemStatus === 'NORMAL' ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
                    <span className={`text-xs font-mono tracking-widest ${systemStatus === 'NORMAL' ? 'text-cyan-400' : 'text-red-500'}`}>
                        {t.hud.systemStatus}: {systemStatus}
                    </span>
                </div>

                {/* Mobile Controls (Dual Joysticks) */}
                <div className="absolute bottom-8 left-8 md:hidden pointer-events-auto z-50">
                    <Joystick
                        label={t.hud.move}
                        onMove={(x, y) => handleMove(x, -y, 0, 0)} // y inverted because screen y is down
                    />
                </div>
                <div className="absolute bottom-8 right-8 md:hidden pointer-events-auto z-50">
                    <Joystick
                        label={t.hud.lookFly}
                        onMove={(x, y) => handleMove(0, 0, 0, x, invertYAxis ? -y : y)} // Invert Look Y support
                    />
                </div>
            </div>

            {/* Loading Screen */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
                    <div className="text-cyan-500 font-mono text-xl animate-pulse">{t.hud.initializing}</div>
                </div>
            )}
        </div>
    );
}