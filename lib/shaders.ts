// GLSL shaders for the Market section.
// - Real 3D simplex noise (Ashima / Stefan Gustavson) -> curl noise for the
//   particle field (divergence-free, organic swirl).
// - A domain-warped fbm flow-field for the reactive background.

const SIMPLEX_3D = /* glsl */ `
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Curl of a noise-based potential field -> divergence-free flow.
vec3 curlNoise(vec3 p){
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  // Sample the three potential components at +/- offsets.
  float a0 = snoise(p + dy); float a1 = snoise(p - dy);
  float b0 = snoise(p + dz); float b1 = snoise(p - dz);
  float c0 = snoise(p + dz + vec3(31.4)); float c1 = snoise(p - dz + vec3(31.4));
  float d0 = snoise(p + dx + vec3(31.4)); float d1 = snoise(p - dx + vec3(31.4));
  float e0 = snoise(p + dx + vec3(57.1)); float e1 = snoise(p - dx + vec3(57.1));
  float f0 = snoise(p + dy + vec3(57.1)); float f1 = snoise(p - dy + vec3(57.1));

  float x = (a0 - a1) - (c0 - c1);
  float y = (b0 - b1) - (e0 - e1);
  float z = (d0 - d1) - (f0 - f1);
  return normalize(vec3(x, y, z) / (2.0 * e) + 1e-5);
}
`;

export const PARTICLE_VERT = /* glsl */ `
${SIMPLEX_3D}
uniform float uTime;
uniform float uTurbulence;
uniform float uSwirl;
uniform float uRadius;
uniform float uIntensity;
attribute float aPhase;
varying float vDisp;
varying float vGlow;

void main(){
  vec3 dir = normalize(position);
  vec3 base = dir * uRadius;
  // Animated curl flow around the shell.
  vec3 flow = curlNoise(dir * 1.5 + vec3(0.0, 0.0, uTime * (0.05 + uSwirl)));
  float amp = uTurbulence * (0.6 + 0.4 * sin(uTime * (1.0 + uIntensity * 3.0) + aPhase));
  vec3 displaced = base + flow * amp;

  vDisp = clamp(length(flow * amp) / max(uTurbulence, 0.001), 0.0, 1.0);
  vGlow = 0.5 + 0.5 * sin(uTime * 2.0 + aPhase);

  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = (6.0 + uIntensity * 22.0) * (1.0 + vDisp);
  gl_PointSize = size * (1.0 / -mv.z);
}
`;

export const PARTICLE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColorA; // calm / down
uniform vec3 uColorB; // hot / up
uniform float uMix;   // momentum 0..1 (0 = down, 1 = up)
varying float vDisp;
varying float vGlow;

void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uColorA, uColorB, clamp(uMix + vDisp * 0.4, 0.0, 1.0));
  col += vGlow * 0.15;
  gl_FragColor = vec4(col, alpha * (0.35 + vDisp * 0.55));
}
`;

export const FLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const FLOW_FRAG = /* glsl */ `
${SIMPLEX_3D}
precision highp float;
uniform float uTime;
uniform float uMomentum;   // -1..1
uniform float uIntensity;  // 0..1
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;

float fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < 5; i++){
    v += a * snoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = (vUv - 0.5) * 2.0;
  float t = uTime * (0.04 + uIntensity * 0.12);
  // Domain warp for that flowing, liquid look.
  vec3 q = vec3(uv * 1.4, t);
  vec2 warp = vec2(fbm(q), fbm(q + vec3(5.2, 1.3, 0.0)));
  float field = fbm(vec3(uv * 1.6 + warp * 1.5, t * 1.5));

  float m = uMomentum * 0.5 + 0.5;
  vec3 col = mix(uColorA, uColorB, clamp(m + field * 0.3, 0.0, 1.0));
  // Vignette so the centre piece stays the focus.
  float vig = smoothstep(1.4, 0.2, length(uv));
  col *= 0.10 + field * 0.10 + uIntensity * 0.05;
  gl_FragColor = vec4(col * vig, 1.0);
}
`;
