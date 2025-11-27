"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import { useCityControls } from "@/components/CityControlsContext";
import { useFloatingSection } from "@/components/FloatingSectionContext";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "@/lib/translations";
import posthog from "posthog-js";

//VIRTUAL JOYSTICK
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
            posthog.capture('joystick_used', { label });
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
    attribute float aRandom;
    varying float vAlpha;
    varying float vRandom;
    void main() {
        vAlpha = aAlpha;
        vRandom = aRandom;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const starFragmentShader = `
    uniform vec3 color;
    uniform float uTime;
    varying float vAlpha;
    varying float vRandom;
    
    void main() {
        // Soft circular glow
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;
        
        // Non-linear glow falloff for realistic star look
        float strength = 1.0 - (dist * 2.0);
        strength = pow(strength, 2.0);
        
        // Twinkle effect based on time and random seed
        float twinkle = 0.7 + 0.3 * sin(uTime * 3.0 + vRandom * 10.0);
        
        gl_FragColor = vec4(color, strength * vAlpha * twinkle);
    }
`;

export function FuturisticOrbit() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [coordinates, setCoordinatesLocal] = useState({ lat: 0, long: 0 });
    const [isEscaping, setIsEscaping] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [showArtifactTutorial, setShowArtifactTutorial] = useState(false);
    const [unlockEffect, setUnlockEffect] = useState(false);
    const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
    const { language } = useLanguage();
    const { time, timeSpeed, fogDensity, trafficLevel, zoom, setZoom, systemStatus, cameraTarget, setCameraTarget, resetTrigger, regenerationTrigger, escapeTrigger, setCoordinates, invertYAxis, invertXAxis, boostActive, unlockSecret, unlockedSecrets, unlockVisualTrigger } = useCityControls();

    // Mobile Tutorial Logic
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        const seen = localStorage.getItem('orbit_tutorials_seen');
        if (isMobile && !seen) {
            setShowTutorial(false);
            const timer = setTimeout(() => {
                setShowArtifactTutorial(true);
            }, 2000); // Show after 2s on mobile
            return () => clearTimeout(timer);
        }
    }, []);

    // Check for persistent tutorial dismissal (Cookie/LocalStorage)
    useEffect(() => {
        const seen = localStorage.getItem('orbit_tutorials_seen');
        if (seen) {
            setShowTutorial(false);
            setShowArtifactTutorial(false);
        }
    }, []);

    // Auto-dismiss Artifact Tutorial after 10 seconds
    useEffect(() => {
        if (showArtifactTutorial) {
            const timer = setTimeout(() => {
                setShowArtifactTutorial(false);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [showArtifactTutorial]);

    // Unlock visual effect trigger
    useEffect(() => {
        if (unlockVisualTrigger > 0) {
            setUnlockEffect(true);
            posthog.capture('secret_unlocked', { secret_id: unlockVisualTrigger });
            const timer = setTimeout(() => {
                setUnlockEffect(false);
            }, 1500); // Effect duration
            return () => clearTimeout(timer);
        }
    }, [unlockVisualTrigger]);

    // Track Camera Target (Navigation)
    useEffect(() => {
        if (cameraTarget) {
            posthog.capture('navigation_poi_active', { target_id: cameraTarget });
        }
    }, [cameraTarget]);

    // Track System Reboot (Escape/Jailbreak)
    useEffect(() => {
        if (isEscaping) {
            posthog.capture('system_reboot_triggered', { type: 'escape_sequence' });
        }
    }, [isEscaping]);

    // Persist tutorial dismissal when Artifact Tutorial is closed
    const wasArtifactTutorialShown = useRef(false);
    useEffect(() => {
        if (showArtifactTutorial) {
            wasArtifactTutorialShown.current = true;
        } else if (wasArtifactTutorialShown.current) {
            // It was shown, now it's hidden -> User dismissed it
            localStorage.setItem('orbit_tutorials_seen', 'true');
        }
    }, [showArtifactTutorial]);
    const t = translations[language];
    const { setExpandedSection } = useFloatingSection();
    const lastTriggerMap = useRef<Record<string, number>>({});
    const sectionTargets = [
        { id: "about", x: 0, y: 110, z: -200 },
        { id: "projects", x: 200, y: 110, z: 0 },
        { id: "contact", x: -200, y: 110, z: 0 },
        { id: "music", x: 0, y: 110, z: 200 },
    ];
    const pendingSectionOpen = useRef<{ id: string, startTime: number, startPos: THREE.Vector3 } | null>(null);
    const stateRef = useRef({ time, timeSpeed, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger, escapeTrigger, boostActive, unlockedSecrets });
    useEffect(() => { stateRef.current = { time, timeSpeed, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger, escapeTrigger, boostActive, unlockedSecrets }; }, [time, timeSpeed, fogDensity, trafficLevel, zoom, systemStatus, cameraTarget, resetTrigger, escapeTrigger, boostActive, unlockedSecrets]);

    // --- NAVIGATION POIs ---
    const pois = [
        { id: 'home', label: 'F23A541289', pos: new THREE.Vector3(0, 0, 0), color: '#06b6d4' },
        { id: 'nova', label: 'Excelsa', pos: new THREE.Vector3(-2500, 500, -2500), color: '#ffffff' },
        { id: 'cyber', label: 'GOLV10110010110101101001100', pos: new THREE.Vector3(1600, 400, -1600), color: '#4400ff' },
        // { id: 'cyber', label: 'GOLV10110010110101101001100-10110111001101111001000000110110001100101011100110111010001101111011100100110110001100001', pos: new THREE.Vector3(1600, 400, -1600), color: '#4400ff' },
        { id: 'magma', label: 'M4GUNA', pos: new THREE.Vector3(-1800, -600, 1000), color: '#ff0055' },
        { id: 'toxic', label: 'stash', pos: new THREE.Vector3(800, 1200, 1800), color: '#00ffaa' },
    ];

    // --- SECRETS (Gamification) ---
    // Randomize positions near planets (pushed out to avoid clipping)
    const secretPositions = useRef([
        new THREE.Vector3(1600 + 200 + (Math.random() - 0.5) * 100, 400 + (Math.random() - 0.5) * 100, -1600 + (Math.random() - 0.5) * 100), // Near Cyber Prime
        new THREE.Vector3(-1800 - 250 + (Math.random() - 0.5) * 100, -600 + (Math.random() - 0.5) * 100, 1000 + (Math.random() - 0.5) * 100), // Near Magma Giant
        new THREE.Vector3(800 + 150 + (Math.random() - 0.5) * 100, 1200 + (Math.random() - 0.5) * 100, 1800 + (Math.random() - 0.5) * 100)   // Near Toxic Moon
    ]).current;

    const secrets = [
        { id: 'satellite', label: 'ANCIENT SATELLITE', pos: secretPositions[0], threshold: 300, message: (t as any).secrets.satellite.message },
        { id: 'monolith', label: 'BLACK MONOLITH', pos: secretPositions[1], threshold: 300, message: (t as any).secrets.monolith.message },
        { id: 'void_ship', label: 'DERELICT SHIP', pos: secretPositions[2], threshold: 350, message: (t as any).secrets.void_ship.message }
    ];

    const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: "", visible: false });

    // --- INTERACTION TRACKING ---
    const lastInteractionRef = useRef(Date.now());
    const ledTimeRef = useRef(0);
    const locallyUnlockedRef = useRef<Set<string>>(new Set());
    const tutorialTransitionRef = useRef(false);

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

        const isMobile = window.innerWidth < 768;

        const CONFIG = {
            colors: {
                bg: 0x020410, // Deep Space (Rich Dark Blue)
                base: baseColor,
                active: activeColor,
                poi1: new THREE.Color().setHSL(Math.random(), 1.0, 0.5),
                poi2: new THREE.Color().setHSL(Math.random(), 1.0, 0.5),
                poi3: new THREE.Color().setHSL(Math.random(), 1.0, 0.5),
            },
            starCount: isMobile ? 1000 : 3000 + Math.floor(Math.random() * 2000),
            packetCount: isMobile ? 800 : 3000
        };

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.colors.bg);
        // Galactic Fog: Sparse, deep color
        scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.002);

        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 20000);
        // Coordinates: -314.47 lon (x), -244.97 lat (z) -> x10 scale
        camera.position.set(-3144.7, 110, -2449.7);

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

        // --- Speed Distortion ---
        const rgbShiftPass = new ShaderPass(RGBShiftShader);
        rgbShiftPass.uniforms['amount'].value = 0.0015; // Base subtle shift
        composer.addPass(rgbShiftPass);

        composer.addPass(new OutputPass());

        // --- MATERIALS ---
        const poiMat = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.active,
            emissive: CONFIG.colors.active,
            emissiveIntensity: 3,
            roughness: 0.1,
            metalness: 0.9
        });

        // --- GALACTIC CRYSTALS---
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

        // --- ARTIFACT ---
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

        // --- Traffic ---
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

        // --- STARDUST ---
        const dustCount = 8000;
        const dustGeo = new THREE.BufferGeometry();
        const dustPos = new Float32Array(dustCount * 3);
        const dustSizes = new Float32Array(dustCount);
        const dustAlphas = new Float32Array(dustCount);
        const dustRandoms = new Float32Array(dustCount);

        for (let i = 0; i < dustCount; i++) {
            dustPos[i * 3] = (Math.random() - 0.5) * 1000;
            dustPos[i * 3 + 1] = (Math.random() - 0.5) * 400;
            dustPos[i * 3 + 2] = (Math.random() - 0.5) * 1000;
            dustSizes[i] = Math.random() * 2;
            dustAlphas[i] = Math.random() * 0.5 + 0.1;
            dustRandoms[i] = Math.random();
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        dustGeo.setAttribute('size', new THREE.InstancedBufferAttribute(dustSizes, 1));
        dustGeo.setAttribute('aAlpha', new THREE.InstancedBufferAttribute(dustAlphas, 1));
        dustGeo.setAttribute('aRandom', new THREE.InstancedBufferAttribute(dustRandoms, 1));

        const dustMat = new THREE.ShaderMaterial({
            vertexShader: starVertexShader,
            fragmentShader: starFragmentShader,
            uniforms: {
                color: { value: new THREE.Color(0xffffff) },
                uTime: { value: 0 }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const dustSystem = new THREE.Points(dustGeo, dustMat);
        scene.add(dustSystem);

        setLoading(false);

        // --- COMET SYSTEM ---
        const cometVertexShader = `
            attribute float aSize;
            attribute float aSpeed;
            attribute float aOffset;
            varying float vAlpha;
            uniform float uTime;
            void main() {
                vec3 pos = position;
                // Animate along Z axis
                float zPos = mod(pos.z + uTime * aSpeed + aOffset, 2000.0) - 1000.0;
                pos.z = zPos;
                
                // Fade in/out based on Z position
                float dist = abs(zPos);
                vAlpha = 1.0 - smoothstep(0.0, 800.0, dist);
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = aSize * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const cometFragmentShader = `
            uniform vec3 uColor;
            varying float vAlpha;
            void main() {
                // Soft particle
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if (dist > 0.5) discard;
                
                float strength = 1.0 - (dist * 2.0);
                strength = pow(strength, 2.0);
                
                gl_FragColor = vec4(uColor, strength * vAlpha);
            }
        `;

        const cometCount = 20;
        const cometGeo = new THREE.BufferGeometry();
        const cometPos = new Float32Array(cometCount * 3);
        const cometSizes = new Float32Array(cometCount);
        const cometSpeeds = new Float32Array(cometCount);
        const cometOffsets = new Float32Array(cometCount);

        for (let i = 0; i < cometCount; i++) {
            cometPos[i * 3] = (Math.random() - 0.5) * 1500; // Wide spread X
            cometPos[i * 3 + 1] = (Math.random() - 0.5) * 600; // Spread Y
            cometPos[i * 3 + 2] = (Math.random() - 0.5) * 2000; // Spread Z
            cometSizes[i] = Math.random() * 5 + 2; // Size 2-7
            cometSpeeds[i] = Math.random() * 100 + 50; // Speed 50-150
            cometOffsets[i] = Math.random() * 2000;
        }

        cometGeo.setAttribute('position', new THREE.BufferAttribute(cometPos, 3));
        cometGeo.setAttribute('aSize', new THREE.BufferAttribute(cometSizes, 1));
        cometGeo.setAttribute('aSpeed', new THREE.BufferAttribute(cometSpeeds, 1));
        cometGeo.setAttribute('aOffset', new THREE.BufferAttribute(cometOffsets, 1));

        const cometMat = new THREE.ShaderMaterial({
            vertexShader: cometVertexShader,
            fragmentShader: cometFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0xaaddff) } // Cyan-ish white
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const comets = new THREE.Points(cometGeo, cometMat);
        scene.add(comets);

        // --- NEW: REACTIVE SPACE DUST (Replacing old Stardust) ---
        // We'll reuse the existing dust system but make it denser and reactive
        // Removing old dust logic to avoid duplication if we were to just add new one
        // But since I can't easily delete the old block without context, I will MODIFY the existing dust parameters below
        // Actually, let's just add a SECOND layer of "Close Dust" for the reactive effect

        const reactiveDustCount = 2000;
        const reactiveDustGeo = new THREE.BufferGeometry();
        const reactiveDustPos = new Float32Array(reactiveDustCount * 3);
        const reactiveDustSizes = new Float32Array(reactiveDustCount);

        for (let i = 0; i < reactiveDustCount; i++) {
            reactiveDustPos[i * 3] = (Math.random() - 0.5) * 400; // Closer box
            reactiveDustPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
            reactiveDustPos[i * 3 + 2] = (Math.random() - 0.5) * 400;
            reactiveDustSizes[i] = Math.random() * 1.5;
        }

        reactiveDustGeo.setAttribute('position', new THREE.BufferAttribute(reactiveDustPos, 3));
        reactiveDustGeo.setAttribute('size', new THREE.BufferAttribute(reactiveDustSizes, 1));
        // Reuse star shaders but with different uniforms if needed, or just standard points
        // Let's use standard PointsMaterial for performance and simplicity on this layer
        const reactiveDustMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const reactiveDust = new THREE.Points(reactiveDustGeo, reactiveDustMat);
        scene.add(reactiveDust);

        // --- NEW: DISTANT STELLAR SYSTEM "NOVA PRIME" ---
        // A completely separate system far away to test scale and performance
        const novaSystemGroup = new THREE.Group();
        novaSystemGroup.position.set(-2500, 500, -2500); // Far away
        scene.add(novaSystemGroup);

        // 1. Central Star (White Dwarf / Neutron Star)
        const novaStarGeo = new THREE.SphereGeometry(80, 64, 64);
        const novaStarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const novaStar = new THREE.Mesh(novaStarGeo, novaStarMat);

        // Star Glow (Sprite)
        const spriteMat = new THREE.SpriteMaterial({
            map: new THREE.TextureLoader().load('/lensflare0.png'), // Fallback or procedural if no texture
            color: 0xaaddff,
            blending: THREE.AdditiveBlending
        });
        // Since we don't have the texture loaded, let's use a simple glow mesh instead
        const novaGlowGeo = new THREE.SphereGeometry(120, 32, 32);
        const novaGlowMat = new THREE.ShaderMaterial({
            uniforms: {
                c: { value: 0.2 },
                p: { value: 4.0 },
                glowColor: { value: new THREE.Color(0x88ccff) },
                viewVector: { value: camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    // FIX: Clamp base to 0 to avoid NaN from pow(negative) which corrupts screen
                    intensity = pow(max(0.0, c - dot(vNormal, vNormel)), p);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, 1.0);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const novaGlow = new THREE.Mesh(novaGlowGeo, novaGlowMat);
        novaStar.add(novaGlow);
        novaSystemGroup.add(novaStar);

        // 2. Orbiting Planets (Nova System)
        const novaPlanets: THREE.Mesh[] = [];
        const novaPlanetConfigs = [
            { dist: 300, size: 20, color: 0xffaa00, speed: 0.02 },
            { dist: 500, size: 40, color: 0xff0055, speed: 0.015 },
            { dist: 800, size: 30, color: 0x00ffaa, speed: 0.01 }
        ];

        novaPlanetConfigs.forEach(conf => {
            // Planet Mesh
            const geo = new THREE.IcosahedronGeometry(conf.size, 1);
            const mat = new THREE.MeshStandardMaterial({
                color: conf.color,
                emissive: conf.color,
                emissiveIntensity: 0.5,
                roughness: 0.4,
                metalness: 0.8
            });
            const mesh = new THREE.Mesh(geo, mat);

            // Orbit container for rotation
            const orbitContainer = new THREE.Group();
            orbitContainer.userData = { speed: conf.speed };

            mesh.position.set(conf.dist, 0, 0);
            orbitContainer.add(mesh);
            novaSystemGroup.add(orbitContainer);
            novaPlanets.push(orbitContainer as any); // Store container to rotate it

            // Orbit Line
            const lineGeo = new THREE.RingGeometry(conf.dist - 1, conf.dist + 1, 64);
            const lineMat = new THREE.MeshBasicMaterial({
                color: conf.color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.1
            });
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = Math.PI / 2;
            novaSystemGroup.add(line);
        });

        // 3. Nova System Debris Field (Instanced)
        const novaDebrisCount = 1000;
        const novaDebrisGeo = new THREE.TetrahedronGeometry(2, 0);
        const novaDebrisMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 });
        const novaDebris = new THREE.InstancedMesh(novaDebrisGeo, novaDebrisMat, novaDebrisCount);
        const debrisDummy = new THREE.Object3D();

        for (let i = 0; i < novaDebrisCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 200 + Math.random() * 800;
            const y = (Math.random() - 0.5) * 100;
            debrisDummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
            debrisDummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            const s = Math.random() * 2 + 0.5;
            debrisDummy.scale.set(s, s, s);
            debrisDummy.updateMatrix();
            novaDebris.setMatrixAt(i, debrisDummy.matrix);
        }
        novaDebris.instanceMatrix.needsUpdate = true;
        novaSystemGroup.add(novaDebris);

        // --- PROCEDURAL PLANET SHADER ---
        const planetVertexShader = `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPos;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPos = worldPosition.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
        `;

        const planetFragmentShader = `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPos;
            uniform float uTime;
            uniform vec3 uColorA;
            uniform vec3 uColorB;
            uniform vec3 uColorC;
            uniform float uSeed;

            // Simplex Noise (Reuse for consistency)
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i  = floor(v + dot(v, C.yyy) );
                vec3 x0 = v - i + dot(i, C.xxx) ;
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289(i);
                vec4 p = permute( permute( permute(
                            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                float n_ = 0.142857142857;
                vec3  ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_ );
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4( x.xy, y.xy );
                vec4 b1 = vec4( x.zw, y.zw );
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
            }

            void main() {
                // Gas Giant Bands
                float noise = snoise(vec3(vWorldPos.x * 0.02, vWorldPos.y * 0.05 + uSeed, vWorldPos.z * 0.02 + uTime * 0.05));
                float bands = sin(vUv.y * 20.0 + noise * 5.0);
                
                // Color Mixing
                vec3 color = mix(uColorA, uColorB, smoothstep(-1.0, 1.0, bands));
                color = mix(color, uColorC, smoothstep(0.0, 1.0, noise));

                // Atmosphere / Fresnel
                vec3 viewDir = normalize(cameraPosition - vWorldPos);
                float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.0);
                
                gl_FragColor = vec4(color + fresnel * uColorC * 2.0, 1.0);
            }
        `;

        // --- PLANET CREATION ---
        const planets: THREE.Mesh[] = [];
        const planetConfigs = [
            { pos: new THREE.Vector3(1600, 400, -1600), size: 120, colorA: 0x4400ff, colorB: 0x00ffff, colorC: 0xffffff, seed: 1.0 }, // Cyber Prime
            { pos: new THREE.Vector3(-1800, -600, 1000), size: 180, colorA: 0xff0055, colorB: 0xffaa00, colorC: 0xffddaa, seed: 2.0 }, // Magma Giant
            { pos: new THREE.Vector3(800, 1200, 1800), size: 90, colorA: 0x00ffaa, colorB: 0x004433, colorC: 0xaaffff, seed: 3.0 }   // Toxic Moon
        ];

        const planetGeo = new THREE.SphereGeometry(1, 64, 64);

        planetConfigs.forEach(config => {
            const mat = new THREE.ShaderMaterial({
                vertexShader: planetVertexShader,
                fragmentShader: planetFragmentShader,
                uniforms: {
                    uTime: { value: 0 },
                    uColorA: { value: new THREE.Color(config.colorA) },
                    uColorB: { value: new THREE.Color(config.colorB) },
                    uColorC: { value: new THREE.Color(config.colorC) },
                    uSeed: { value: config.seed }
                }
            });
            const mesh = new THREE.Mesh(planetGeo, mat);
            mesh.position.copy(config.pos);
            mesh.scale.set(config.size, config.size, config.size);
            scene.add(mesh);
            planets.push(mesh);
        });

        // --- NEW: PROCEDURAL NEBULA (Background) ---
        const nebulaVertexShader = `
            varying vec2 vUv;
            varying vec3 vWorldPos;
            void main() {
                vUv = uv;
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPos = worldPosition.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
        `;

        // --- VISIBLE ARTIFACTS (3D Models) ---

        // 1. ANCIENT SATELLITE (Near Cyber Prime)
        const visSatelliteGroup = new THREE.Group();
        visSatelliteGroup.position.copy(secretPositions[0]);

        // Core
        const satCoreGeo = new THREE.DodecahedronGeometry(15, 0);
        const satMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.8 });
        const satCore = new THREE.Mesh(satCoreGeo, satMat);
        visSatelliteGroup.add(satCore);

        // Panels
        const panelGeo = new THREE.BoxGeometry(40, 2, 10);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x3366ff, roughness: 0.2, metalness: 0.5, emissive: 0x112244 });
        const panel1 = new THREE.Mesh(panelGeo, panelMat);
        panel1.position.set(30, 0, 0);
        visSatelliteGroup.add(panel1);
        const panel2 = new THREE.Mesh(panelGeo, panelMat);
        panel2.position.set(-30, 0, 0);
        visSatelliteGroup.add(panel2);

        // Antenna
        const antGeo = new THREE.CylinderGeometry(1, 1, 20);
        const ant = new THREE.Mesh(antGeo, satMat);
        ant.position.set(0, 15, 0);
        visSatelliteGroup.add(ant);

        // Blink Light
        const blinkGeo = new THREE.SphereGeometry(2);
        const blinkMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const blink = new THREE.Mesh(blinkGeo, blinkMat);
        blink.position.set(0, 25, 0);
        visSatelliteGroup.add(blink);

        // Point Light for visibility
        const satLight = new THREE.PointLight(0x3366ff, 2, 300);
        visSatelliteGroup.add(satLight);

        // Animation for blink
        visSatelliteGroup.userData = { type: 'satellite', blinkMesh: blink };
        scene.add(visSatelliteGroup);


        // 2. BLACK MONOLITH (Near Magma Giant)
        const visMonolithGeo = new THREE.BoxGeometry(20, 60, 5);
        const visMonolithMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.1 });
        const visMonolith = new THREE.Mesh(visMonolithGeo, visMonolithMat);
        visMonolith.position.copy(secretPositions[1]);

        // Subtle glow aura
        const auraGeo = new THREE.BoxGeometry(22, 62, 7);
        const auraMat = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
        const aura = new THREE.Mesh(auraGeo, auraMat);
        visMonolith.add(aura);

        // Point Light for visibility
        const monolithLight = new THREE.PointLight(0xff0055, 2, 300);
        visMonolith.add(monolithLight);

        scene.add(visMonolith);


        // 3. DERELICT SHIP (Near Toxic Moon)
        const visShipGroup = new THREE.Group();
        visShipGroup.position.copy(secretPositions[2]);
        visShipGroup.rotation.set(Math.random(), Math.random(), Math.random()); // Tumble

        // Hull
        const hullGeo = new THREE.CylinderGeometry(10, 20, 60, 6);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.7, metalness: 0.6 });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.rotation.x = Math.PI / 2;
        visShipGroup.add(hull);

        // Broken Wing
        const wingGeo = new THREE.BoxGeometry(40, 2, 20);
        const wing = new THREE.Mesh(wingGeo, hullMat);
        wing.position.set(0, 0, 10);
        wing.rotation.z = 0.2;
        visShipGroup.add(wing);

        // Engine Glow (Flickering)
        const engineGeo = new THREE.CylinderGeometry(8, 5, 5);
        const engineMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
        const engine = new THREE.Mesh(engineGeo, engineMat);
        engine.position.set(0, -30, 0); // Back of ship (rotated)
        engine.rotation.x = Math.PI / 2;
        visShipGroup.add(engine);

        // Point Light for visibility
        const shipLight = new THREE.PointLight(0x00ffaa, 2, 300);
        visShipGroup.add(shipLight);

        visShipGroup.userData = { type: 'ship', engineMesh: engine };
        scene.add(visShipGroup);

        // Store artifacts for animation loop
        const visibleArtifacts = [visSatelliteGroup, visMonolith, visShipGroup];

        const nebulaFragmentShader = `
            varying vec2 vUv;
            varying vec3 vWorldPos;
            uniform float uTime;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform vec3 uColor3;

            // Simplex Noise 3D
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

                // First corner
                vec3 i  = floor(v + dot(v, C.yyy) );
                vec3 x0 = v - i + dot(i, C.xxx) ;

                // Other corners
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );

                //   x0 = x0 - 0.0 + 0.0 * C.xxx;
                //   x1 = x0 - i1  + 1.0 * C.xxx;
                //   x2 = x0 - i2  + 2.0 * C.xxx;
                //   x3 = x0 - 1.0 + 3.0 * C.xxx;
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
                vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

                // Permutations
                i = mod289(i);
                vec4 p = permute( permute( permute(
                            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

                // Gradients: 7x7 points over a square, mapped onto an octahedron.
                // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
                float n_ = 0.142857142857; // 1.0/7.0
                vec3  ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4( x.xy, y.xy );
                vec4 b1 = vec4( x.zw, y.zw );

                //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
                //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);

                //Normalise gradients
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

                // Mix final noise value
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                            dot(p2,x2), dot(p3,x3) ) );
            }

            void main() {
                // Slow moving noise
                float n1 = snoise(vWorldPos * 0.002 + uTime * 0.05);
                float n2 = snoise(vWorldPos * 0.005 - uTime * 0.02);
                
                float noise = n1 * 0.5 + n2 * 0.5;
                
                // Color mixing
                vec3 color = mix(uColor1, uColor2, n1 * 0.5 + 0.5);
                color = mix(color, uColor3, n2 * 0.5 + 0.5);
                
                // Fade out based on noise (transparency)
                float alpha = smoothstep(-0.2, 0.8, noise) * 0.4;
                
                gl_FragColor = vec4(color, alpha);
            }
        `;

        const nebulaMat = new THREE.ShaderMaterial({
            vertexShader: nebulaVertexShader,
            fragmentShader: nebulaFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color(0x000000) },
                uColor2: { value: new THREE.Color(0x000000) },
                uColor3: { value: new THREE.Color(0x000000) }
            },
            transparent: true,
            side: THREE.BackSide, // Render on inside of sphere
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            fog: false // Ignore scene fog so it doesn't turn black
        });

        const nebulaGeo = new THREE.SphereGeometry(1200, 64, 64);
        const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
        nebulaMesh.frustumCulled = false; // Prevent disappearing when camera moves inside/outside bounds
        scene.add(nebulaMesh);

        // --- GIANT ORBITAL RINGS ---
        const ringGroup = new THREE.Group();
        const giantRingGeo = new THREE.TorusGeometry(800, 2, 64, 200);
        const giantRingMat = new THREE.MeshBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });

        const ring1 = new THREE.Mesh(giantRingGeo, giantRingMat);
        ring1.rotation.x = Math.PI / 2;
        ringGroup.add(ring1);

        const ring2 = new THREE.Mesh(giantRingGeo, giantRingMat);
        ring2.rotation.x = Math.PI / 2.2;
        ring2.rotation.y = Math.PI / 6;
        ring2.scale.set(1.2, 1.2, 1.2);
        ringGroup.add(ring2);

        scene.add(ringGroup);

        // --- ASTEROID BELT ---
        const asteroidCount = 2000;
        const asteroidGeo = new THREE.IcosahedronGeometry(1, 0);
        const asteroidMat = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.8,
            metalness: 0.2
        });
        const asteroidBelt = new THREE.InstancedMesh(asteroidGeo, asteroidMat, asteroidCount);
        const asteroidDummy = new THREE.Object3D();

        for (let i = 0; i < asteroidCount; i++) {
            const angle = (i / asteroidCount) * Math.PI * 2;
            const radius = 600 + Math.random() * 200; // Belt between 600 and 800
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 40; // Flat belt

            asteroidDummy.position.set(x, y, z);
            const scale = Math.random() * 3 + 1;
            asteroidDummy.scale.set(scale, scale, scale);
            asteroidDummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            asteroidDummy.updateMatrix();
            asteroidBelt.setMatrixAt(i, asteroidDummy.matrix);
        }
        asteroidBelt.instanceMatrix.needsUpdate = true;
        scene.add(asteroidBelt);


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

            // Update Dust Twinkle
            dustMat.uniforms.uTime.value = elapsed;

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

            // (Secrets visuals moved to setup)

            // --- LIGHTING ---
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
                    .multiplyScalar(moveSpeed * (stateRef.current.boostActive ? 5.0 : 1.0)); // Increased to 5x

                controls.target.add(moveVec);
                camera.position.add(moveVec);

                // --- NEW: DYNAMIC FOV & WARP EFFECT ---
                // Calculate speed factor (0 to 1)
                const isMoving = moveRef.z !== 0 || moveRef.x !== 0;
                const baseFOV = 45;
                const targetFOV = isMoving ? (moveRef.z > 0 ? (stateRef.current.boostActive ? 85 : 60) : 50) : baseFOV; // Extreme FOV on boost
                camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.05);
                camera.updateProjectionMatrix();

                // RGB Shift based on speed
                const targetShift = isMoving ? (stateRef.current.boostActive ? 0.008 : 0.004) : 0.0015; // Double shift on boost
                rgbShiftPass.uniforms['amount'].value = THREE.MathUtils.lerp(rgbShiftPass.uniforms['amount'].value, targetShift, 0.05);

                // Shake effect on boost
                if (stateRef.current.boostActive && isMoving) {
                    camera.position.x += (Math.random() - 0.5) * 0.5;
                    camera.position.y += (Math.random() - 0.5) * 0.5;
                }

                // 2. Rotation (Look - FPS Style)
                if (moveRef.yaw !== 0 || moveRef.pitch !== 0) {
                    const lookSpeed = 0.01; // Reduced from 0.03 for smoother control

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

                // Enhanced Banking (More aggressive roll)
                camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, -moveRef.x * 0.15, 0.1);
            } else {
                // Reset Effects
                camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, 0.1);
                camera.fov = THREE.MathUtils.lerp(camera.fov, 45, 0.05);
                camera.updateProjectionMatrix();
                rgbShiftPass.uniforms['amount'].value = THREE.MathUtils.lerp(rgbShiftPass.uniforms['amount'].value, 0.0015, 0.05);
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

            // --- NEW: UPDATE NEBULA COLORS (WITH HEARTBEAT) ---
            // Use the same targetFog color logic but brighter for nebula
            const nebulaColor1 = crystalMat.uniforms.colorActive.value.clone().multiplyScalar(0.2);
            const nebulaColor2 = scene.fog instanceof THREE.FogExp2 ? scene.fog.color.clone().multiplyScalar(2.0) : new THREE.Color(0x000000);
            const nebulaColor3 = new THREE.Color(0x000000).lerp(nebulaColor1, 0.5);

            // Heartbeat Pulse (Slow, organic breathing)
            const heartbeat = (Math.sin(elapsed * 0.5) * 0.5 + 0.5) * 0.2 + 0.8; // Oscillates between 0.8 and 1.0

            nebulaMat.uniforms.uColor1.value.lerp(nebulaColor1.multiplyScalar(heartbeat), 0.05);
            nebulaMat.uniforms.uColor2.value.lerp(nebulaColor2.multiplyScalar(heartbeat), 0.05);
            nebulaMat.uniforms.uColor3.value.lerp(nebulaColor3.multiplyScalar(heartbeat), 0.05);
            nebulaMat.uniforms.uTime.value = elapsed;

            // --- NEW: NEBULA FOLLOWS CAMERA (Infinite Skybox) ---
            nebulaMesh.position.copy(camera.position);

            // Apply heartbeat to crystals too (Subtle glow pulse)
            crystalMat.uniforms.colorActive.value.multiplyScalar(heartbeat);

            // --- NEW: ANIMATE RINGS & ASTEROIDS ---
            ringGroup.rotation.y = elapsed * 0.02;
            ringGroup.rotation.z = Math.sin(elapsed * 0.1) * 0.05;
            asteroidBelt.rotation.y = elapsed * 0.01;

            // --- NEW: ANIMATE PLANETS ---
            planets.forEach((planet, i) => {
                planet.rotation.y = elapsed * 0.05;
                (planet.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
            });

            // --- NEW: ANIMATE COMETS ---
            cometMat.uniforms.uTime.value = elapsed;

            // --- NEW: ANIMATE REACTIVE DUST ---
            // Move dust opposite to camera movement to simulate speed
            // We need to access the positions array
            const dustPositions = reactiveDustGeo.attributes.position.array as Float32Array;
            // Calculate camera velocity (simple diff)
            // For simplicity, we just drift them slowly + react to camera position modulo
            for (let i = 0; i < reactiveDustCount; i++) {
                // Wrap around camera
                let x = dustPositions[i * 3];
                let y = dustPositions[i * 3 + 1];
                let z = dustPositions[i * 3 + 2];

                // Relative to camera
                const range = 400;
                // Check distance from camera
                const dx = x - camera.position.x;
                const dy = y - camera.position.y;
                const dz = z - camera.position.z;

                // Wrap logic
                if (dx > range / 2) dustPositions[i * 3] -= range;
                if (dx < -range / 2) dustPositions[i * 3] += range;
                if (dy > range / 2) dustPositions[i * 3 + 1] -= range;
                if (dy < -range / 2) dustPositions[i * 3 + 1] += range;
                if (dz > range / 2) dustPositions[i * 3 + 2] -= range;
                if (dz < -range / 2) dustPositions[i * 3 + 2] += range;
            }
            reactiveDustGeo.attributes.position.needsUpdate = true;

            // --- NEW: ANIMATE NOVA SYSTEM ---
            novaPlanets.forEach((planetGroup) => {
                planetGroup.rotation.y += planetGroup.userData.speed;
            });
            novaDebris.rotation.y -= 0.002; // Slow counter-rotation
            novaGlowMat.uniforms.viewVector.value = camera.position; // Update glow to face camera



            // --- FIX: RESIZE & SCISSOR HANDLING ---
            const width = container.clientWidth;
            const height = container.clientHeight;

            // Check if resize needed (Robust handling)
            const canvas = renderer.domElement;
            if (canvas.width !== width || canvas.height !== height) {
                renderer.setSize(width, height, false);
                composer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }

            // Ensure full screen rendering
            renderer.setScissorTest(false);

            // --- NEW: UPDATE HUD WAYPOINTS ---
            pois.forEach(poi => {
                const el = document.getElementById(`waypoint-${poi.id}`);
                if (el) {
                    // Clone to avoid modifying original
                    const pos = poi.pos.clone();

                    // Project to 2D screen space
                    pos.project(camera);

                    // Check if behind camera
                    const isBehind = pos.z > 1;

                    // Map to screen pixels
                    // Use current width/height from above
                    const widthHalf = width / 2;
                    const heightHalf = height / 2;

                    let x = (pos.x * widthHalf) + widthHalf;
                    let y = -(pos.y * heightHalf) + heightHalf;

                    // Handle off-screen / behind camera
                    if (isBehind || x < 0 || x > width || y < 0 || y > height) {
                        // Invert if behind
                        if (isBehind) {
                            x = width - x;
                            y = height - y;
                        }

                        // Clamp to edges
                        const padding = 40;
                        // Find angle to center
                        const dx = x - widthHalf;
                        const dy = y - heightHalf;
                        const angle = Math.atan2(dy, dx);

                        // Push to edge
                        // Simple box clamping
                        x = Math.max(padding, Math.min(width - padding, x));
                        y = Math.max(padding, Math.min(height - padding, y));

                        el.classList.add('opacity-50'); // Dim when off-screen
                    } else {
                        el.classList.remove('opacity-50');
                    }

                    // Update Position
                    el.style.transform = `translate(${x}px, ${y}px)`;

                    // Update Distance
                    const dist = camera.position.distanceTo(poi.pos);
                    const distEl = document.getElementById(`dist-${poi.id}`);
                    if (distEl) distEl.textContent = `${Math.round(dist / 10)} AU`; // Scale down for "AU" feel

                    // Hide if very close (< 100 units)
                    el.style.display = dist < 100 ? 'none' : 'flex';
                }
            });

            // Update "Return to Sector 0" Warning
            const distFromCenter = camera.position.length();
            const returnWarning = document.getElementById('return-warning');
            if (returnWarning) {
                if (distFromCenter > 2500) {
                    returnWarning.style.opacity = '1';
                } else {
                    returnWarning.style.opacity = '0';
                }
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
                    // Ensure color is deep cosmic blue
                    if (scene.fog.color.getHex() !== 0x020410) {
                        scene.fog.color.lerp(new THREE.Color(0x020410), 0.05);
                    }
                }
            }

            // --- SECRETS PROXIMITY CHECK ---
            const currentUnlocked = stateRef.current.unlockedSecrets;
            secrets.forEach(secret => {
                // Check both context state and local instant ref to prevent spam
                if (!currentUnlocked.includes(secret.id) && !locallyUnlockedRef.current.has(secret.id)) {
                    const dist = camera.position.distanceTo(secret.pos);
                    if (dist < secret.threshold) {
                        locallyUnlockedRef.current.add(secret.id); // Mark as unlocked instantly
                        unlockSecret(secret.id);
                        setToast({ message: secret.message, visible: true });
                        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 6000);
                    }
                }
            });

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
                        // Reduced distance to 15 (must enter it)
                        // Only trigger if user is actively interacting (prevents auto-rotate triggers)
                        const isInteracting = (now - lastInteractionRef.current) < 2000;
                        if (dist < 15 && isInteracting) {
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

            // --- ARTIFACT ANIMATIONS ---
            // Satellite Rotation & Blink
            if (visibleArtifacts[0]) {
                visibleArtifacts[0].rotation.y = elapsed * 0.2;
                visibleArtifacts[0].rotation.z = Math.sin(elapsed * 0.5) * 0.2;
                const blinkMesh = visibleArtifacts[0].userData.blinkMesh;
                if (blinkMesh) {
                    blinkMesh.material.color.setHex(Math.sin(elapsed * 5) > 0 ? 0xff0000 : 0x330000);
                }
            }

            // Monolith Pulse & Hover
            if (visibleArtifacts[1]) {
                visibleArtifacts[1].rotation.y = elapsed * 0.05;
                // visibleArtifacts[1].position.y = secretPositions[1].y + Math.sin(elapsed * 0.5) * 5; // Hover relative to base
                // Actually, position.copy(secretPositions[1]) sets the base. We should add to it.
                // But modifying position directly in loop overwrites base.
                // Better to use a group or offset.
                // For now, just rotation is fine, or simple bobbing if we tracked baseY.
                // Let's just do rotation and pulse.
                const aura = visibleArtifacts[1].children[0] as THREE.Mesh;
                if (aura) {
                    (aura.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(elapsed * 2) * 0.1;
                }
            }

            // Ship Tumble & Flicker
            if (visibleArtifacts[2]) {
                visibleArtifacts[2].rotation.x += 0.002;
                visibleArtifacts[2].rotation.y += 0.003;
                const engine = visibleArtifacts[2].userData.engineMesh;
                if (engine) {
                    engine.material.opacity = 0.5 + Math.random() * 0.5; // Flicker
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
            setPressedKeys(prev => ({ ...prev, [e.code]: true }));

            // Dismiss tutorial on first movement (after a delay)
            if (showTutorial && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                if (!tutorialTransitionRef.current) {
                    tutorialTransitionRef.current = true;
                    setTimeout(() => {
                        setShowTutorial(false);
                        const seen = localStorage.getItem('orbit_tutorials_seen');
                        if (!seen) {
                            setShowArtifactTutorial(true);
                        }
                    }, 5000);
                }
            }

            // Dismiss Artifact Tutorial on movement
            if (showArtifactTutorial && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                setShowArtifactTutorial(false);
            }

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }

            switch (e.code) {
                case 'KeyW': case 'ArrowUp': moveRef.z = 1; break;
                case 'KeyS': case 'ArrowDown': moveRef.z = -1; break;
                case 'KeyA': case 'ArrowLeft': moveRef.x = -1; break;
                case 'KeyD': case 'ArrowRight': moveRef.x = 1; break;
                case 'Space':
                    if (showTutorial) {
                        setShowTutorial(false);
                        const seen = localStorage.getItem('orbit_tutorials_seen');
                        if (!seen) {
                            setShowArtifactTutorial(true);
                        }
                    } else if (showArtifactTutorial) {
                        setShowArtifactTutorial(false);
                    }
                    break;
            }
        };
        const onKeyUp = (e: KeyboardEvent) => {
            setPressedKeys(prev => ({ ...prev, [e.code]: false }));
            switch (e.code) {
                case 'KeyW': case 'KeyS': case 'ArrowUp': case 'ArrowDown': moveRef.z = 0; break;
                case 'KeyA': case 'KeyD': case 'ArrowLeft': case 'ArrowRight': moveRef.x = 0; break;
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

        // Mobile Tutorial Logic
        if (showTutorial && (x !== 0 || z !== 0)) {
            if (!tutorialTransitionRef.current) {
                tutorialTransitionRef.current = true;
                setTimeout(() => {
                    setShowTutorial(false);
                    const seen = localStorage.getItem('orbit_tutorials_seen');
                    if (!seen) {
                        setShowArtifactTutorial(true);
                    }
                }, 5000);
            }
        }

        // Dismiss Artifact Tutorial on move
        if (showArtifactTutorial && (x !== 0 || z !== 0)) {
            setShowArtifactTutorial(false);
        }
    };

    return (
        <div className="fixed inset-0 z-0 bg-[#020410]">
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
                        onMove={(x, y) => handleMove(x, -y, 0, 0, 0)} // y inverted because screen y is down
                    />
                </div>

                {/* RIGHT: LOOK ARROWS */}
                <div className="absolute bottom-8 right-8 md:hidden pointer-events-auto z-50 flex flex-col items-center gap-1">
                    <button
                        className="w-12 h-12 bg-black/30 border border-cyan-500/30 rounded-t-lg backdrop-blur-sm active:bg-cyan-500/20 flex items-center justify-center"
                        onTouchStart={(e) => { e.preventDefault(); handleMove(0, 0, 0, 0, 1); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleMove(0, 0, 0, 0, 0); }}
                    >
                        <ChevronUp className="text-cyan-400" />
                    </button>
                    <div className="flex gap-1">
                        <button
                            className="w-12 h-12 bg-black/30 border border-cyan-500/30 rounded-l-lg backdrop-blur-sm active:bg-cyan-500/20 flex items-center justify-center"
                            onTouchStart={(e) => { e.preventDefault(); handleMove(0, 0, 0, invertXAxis ? -1 : 1, 0); }}
                            onTouchEnd={(e) => { e.preventDefault(); handleMove(0, 0, 0, 0, 0); }}
                        >
                            <ChevronLeft className="text-cyan-400" />
                        </button>
                        <button
                            className="w-12 h-12 bg-black/30 border border-cyan-500/30 rounded-r-lg backdrop-blur-sm active:bg-cyan-500/20 flex items-center justify-center"
                            onTouchStart={(e) => { e.preventDefault(); handleMove(0, 0, 0, invertXAxis ? 1 : -1, 0); }}
                            onTouchEnd={(e) => { e.preventDefault(); handleMove(0, 0, 0, 0, 0); }}
                        >
                            <ChevronRight className="text-cyan-400" />
                        </button>
                    </div>
                    <button
                        className="w-12 h-12 bg-black/30 border border-cyan-500/30 rounded-b-lg backdrop-blur-sm active:bg-cyan-500/20 flex items-center justify-center"
                        onTouchStart={(e) => { e.preventDefault(); handleMove(0, 0, 0, 0, -1); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleMove(0, 0, 0, 0, 0); }}
                    >
                        <ChevronDown className="text-cyan-400" />
                    </button>
                </div>
            </div>

            {/* Loading Screen */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
                    <div className="text-cyan-500 font-mono text-xl animate-pulse">{t.hud.initializing}</div>
                </div>
            )}

            {/* --- NEW: HUD WAYPOINTS --- */}
            {pois.map(poi => (
                <div
                    key={poi.id}
                    id={`waypoint-${poi.id}`}
                    className="absolute top-0 left-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300"
                    style={{ transform: 'translate(-50%, -50%)', willChange: 'transform' }}
                >
                    {/* Marker */}
                    <div className="w-4 h-4 border-2 border-current rounded-full flex items-center justify-center" style={{ color: poi.color }}>
                        <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                    </div>
                    {/* Label */}
                    <div className="mt-1 flex flex-col items-center">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-white/80 whitespace-nowrap drop-shadow-md bg-black/50 px-1 rounded">
                            {poi.label}
                        </span>
                        <span id={`dist-${poi.id}`} className="text-[9px] font-mono text-cyan-400/80">
                            0 AU
                        </span>
                    </div>
                </div>
            ))}

            {/* --- NEW: RETURN WARNING (Friendly) --- */}
            <div
                id="return-warning"
                className="absolute top-64 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-500 opacity-0"
            >
                {/* <div className="text-cyan-400 font-black tracking-widest text-xl animate-pulse bg-black/50 px-4 py-1 border border-cyan-500/50 rounded shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    {t.hud.spaceExploration}
                </div> */}
                <div className="text-cyan-200/80 font-mono text-xs tracking-wider">
                    {t.hud.enjoyTheJourney}
                </div>
            </div>

            {/* --- COLLISION WARNING OVERLAY (Rebooting) --- */}
            <AnimatePresence>
                {systemStatus === 'REBOOTING' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-red-900/40 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none overflow-hidden"
                    >
                        {/* Glitch Background */}
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 via-transparent to-red-900/50" />

                        {/* Warning Text */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                            className="relative z-10 flex flex-col items-center gap-4 p-12 bg-black/30 rounded-xl border border-red-500/30 backdrop-blur-md"
                        >
                            <div className="text-6xl md:text-9xl font-black text-red-500 tracking-tighter uppercase glitch-text" data-text="COLLISION">
                                COLLISION
                            </div>
                            <div className="text-2xl md:text-4xl font-mono font-bold text-red-400 tracking-[1em] uppercase animate-pulse">
                                DETECTED
                            </div>
                        </motion.div>

                        {/* Scanlines */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- GAMIFICATION TOAST --- */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 p-4 bg-cyan-950/80 border border-cyan-500 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.5)] backdrop-blur-md"
                    >
                        <div className="p-2 bg-cyan-500 rounded-full animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-cyan-400 tracking-widest uppercase">{t.secrets.alert.wow}</div>
                            <div className="text-sm font-bold text-white font-mono">{toast.message}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- UNLOCK VISUAL EFFECT --- */}
            <AnimatePresence>
                {unlockEffect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 z-[95] pointer-events-none flex items-center justify-center"
                    >
                        {/* Radial pulse */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="absolute w-64 h-64 rounded-full border-2 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.8)]"
                        />

                        {/* Center glow */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: [0, 1, 0] }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-500/30 blur-xl"
                        />

                        {/* Particle bursts */}
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    x: Math.cos((i / 8) * Math.PI * 2) * 120,
                                    y: Math.sin((i / 8) * Math.PI * 2) * 120,
                                    opacity: [1, 1, 0]
                                }}
                                transition={{ duration: 1, delay: 0.1 }}
                                className="absolute w-2 h-2 bg-cyan-300 rounded-full"
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- NAVIGATION TUTORIAL --- */}
            <AnimatePresence>
                {showTutorial && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] flex flex-col items-center gap-6 p-8 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] pointer-events-none hidden md:flex"
                    >
                        <div className="flex flex-col items-center gap-2">
                            {/* W / UP */}
                            <div className={`w-12 h-12 flex items-center justify-center border rounded transition-all duration-200 ${pressedKeys['KeyW'] || pressedKeys['ArrowUp'] ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-110' : 'bg-black/50 text-cyan-500 border-cyan-900/50'}`}>
                                <span className="font-mono font-bold text-lg">W</span>
                            </div>
                            <div className="flex gap-2">
                                {/* A / LEFT */}
                                <div className={`w-12 h-12 flex items-center justify-center border rounded transition-all duration-200 ${pressedKeys['KeyA'] || pressedKeys['ArrowLeft'] ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-110' : 'bg-black/50 text-cyan-500 border-cyan-900/50'}`}>
                                    <span className="font-mono font-bold text-lg">A</span>
                                </div>
                                {/* S / DOWN */}
                                <div className={`w-12 h-12 flex items-center justify-center border rounded transition-all duration-200 ${pressedKeys['KeyS'] || pressedKeys['ArrowDown'] ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-110' : 'bg-black/50 text-cyan-500 border-cyan-900/50'}`}>
                                    <span className="font-mono font-bold text-lg">S</span>
                                </div>
                                {/* D / RIGHT */}
                                <div className={`w-12 h-12 flex items-center justify-center border rounded transition-all duration-200 ${pressedKeys['KeyD'] || pressedKeys['ArrowRight'] ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-110' : 'bg-black/50 text-cyan-500 border-cyan-900/50'}`}>
                                    <span className="font-mono font-bold text-lg">D</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="text-cyan-400 font-mono text-xs tracking-[0.2em] animate-pulse">
                                {t.hud.tutorial?.move || "USE KEYS TO MOVE"}
                            </div>
                            <div className="text-cyan-700 font-mono text-[10px] tracking-widest">
                                {t.hud.tutorial?.dismiss || "PRESS SPACE TO DISMISS"}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- ARTIFACTS & LOGBOOK TUTORIAL --- */}
            <AnimatePresence>
                {showArtifactTutorial && !loading && (
                    <>
                        {/* Full-screen click handler */}
                        <div
                            className="absolute inset-0 z-[89] cursor-pointer"
                            onClick={() => setShowArtifactTutorial(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-[90%] max-w-md flex flex-col gap-6 p-8 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] pointer-events-none"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-4 border-b border-cyan-900/50 pb-4">
                                <div className="p-3 bg-cyan-500/20 rounded-full border border-cyan-500/50 animate-pulse">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-widest uppercase">
                                    {t.hud.tutorial?.artifacts?.title || "ARTIFACTS & SECRETS"}
                                </h3>
                            </div>

                            {/* Content */}
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="text-cyan-400 text-2xl">✦</div>
                                    <p className="text-sm text-gray-300 leading-relaxed font-mono">
                                        {t.hud.tutorial?.artifacts?.description || "Explore the cosmos to find ancient artifacts..."}
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <div className="text-cyan-400 text-2xl">❖</div>
                                    <div>
                                        <h4 className="text-sm font-bold text-cyan-200 uppercase mb-1">
                                            {t.hud.tutorial?.logbook?.title || "CAPTAIN'S LOG"}
                                        </h4>
                                        <p className="text-xs text-gray-400 leading-relaxed font-mono">
                                            {t.hud.tutorial?.logbook?.description || "Track your discoveries..."}
                                        </p>
                                    </div>
                                </div>
                            </div>


                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}