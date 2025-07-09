import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import * as SimplexNoise from 'simplex-noise';
import seedrandom from 'seedrandom';

// --- Inferno color scale (black → purple → magenta → orange → yellow) ---
function getInfernoColor(t: number): THREE.Color {
  t = Math.max(0, Math.min(1, t));
  // Approximate inferno with 5 stops
  const c = [
    [0, 0, 0],         // black
    [0.18, 0, 0.32],   // purple
    [0.6, 0, 0.5],     // magenta
    [1, 0.45, 0],      // orange
    [1, 1, 0.2],       // yellow
  ];
  const idx = Math.floor(t * (c.length - 1));
  const frac = t * (c.length - 1) - idx;
  const a = c[idx] || c[0];
  const b = c[Math.min(idx + 1, c.length - 1)] || c[c.length - 1];
  return new THREE.Color(
    a[0] * (1 - frac) + b[0] * frac,
    a[1] * (1 - frac) + b[1] * frac,
    a[2] * (1 - frac) + b[2] * frac
  );
}

// Accept risks as a prop
interface RiskType {
  label?: string;
  name?: string;
  score?: number;
  description?: string;
}
interface Heatmap3DViewProps {
  onClose: () => void;
  risks: RiskType[];
  seed?: string;
}

const Heatmap3DView: React.FC<Heatmap3DViewProps> = ({ onClose, risks, seed: propSeed }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; name: string; score: number | null; description: string }>({ visible: false, x: 0, y: 0, name: '', score: null, description: '' });
  const fallbackRisks: RiskType[] = [
    { label: 'Privacy', score: 6, description: "The agreement allows for monitoring and surveillance of the employee's digital communications and device usage." },
    { label: 'Career Options', score: 8, description: "The non-compete clause restricts the employee's ability to work for a competing business." },
    { label: 'Job Security', score: 4, description: "The at-will employment clause allows the company to terminate the employee's employment at any time." }
  ];
  const initialRisks = Array.isArray(risks) && risks.length ? [...risks] : fallbackRisks;
  const [riskDataState] = useState<RiskType[]>(initialRisks);
  // Generate a random seed if not provided
  const [seed] = useState<string>(() => propSeed || Math.random().toString(36).slice(2));

  useEffect(() => {
    if (!mountRef.current) return;
    (mountRef.current as HTMLDivElement).innerHTML = '';
    // Three.js setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor('#000');
    renderer.setSize(window.innerWidth, window.innerHeight);
    (mountRef.current as HTMLDivElement).appendChild(renderer.domElement);
    // Scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0, 10, 24);
    camera.lookAt(0, 0, 0);
    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 10;
    controls.maxDistance = 40;
    controls.target.set(0, 0, 0);
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.7);
    dir.position.set(10, 20, 10);
    scene.add(dir);
    // Postprocessing: Bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.45, // strength (reduced)
      0.25, // radius (reduced)
      0.0  // threshold
    );
    composer.addPass(bloomPass);
    // Raycaster for hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    // Seeded noise setup
    const rng: () => number = seedrandom(seed);
    const noise2D = SimplexNoise.createNoise2D(rng);
    const gridN = 160;
    const size = 22;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    let minY = Infinity, maxY = -Infinity;
    // Store peaks for risk names
    const peaks: { x: number; y: number; z: number; i: number; yval: number }[] = [];
    for (let z = 0; z < gridN; z++) {
      for (let x = 0; x < gridN; x++) {
        const u = x / (gridN - 1);
        const v = z / (gridN - 1);
        const px = (u - 0.5) * size;
        const pz = (v - 0.5) * size;
        // Smoother, more organic height
        const y =
          noise2D(px * 0.13, pz * 0.13) * 3.2 +
          noise2D(px * 0.32, pz * 0.32) * 1.1 +
          noise2D(px * 0.06, pz * 0.06) * 1.7;
        positions.push(px, y, pz); // X, Y, Z
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        peaks.push({ x: px, y: y, z: pz, i: z * gridN + x, yval: y });
      }
    }
    for (let z = 0; z < gridN - 1; z++) {
      for (let x = 0; x < gridN - 1; x++) {
        const i = z * gridN + x;
        indices.push(i, i + 1, i + gridN);
        indices.push(i + 1, i + gridN + 1, i + gridN);
      }
    }
    // Enhanced inferno colormap
    for (let z = 0; z < gridN; z++) {
      for (let x = 0; x < gridN; x++) {
        const i = z * gridN + x;
        const y = positions[i * 3 + 1]; // Y is up
        let t = (y - minY) / (maxY - minY + 1e-6);
        t = Math.pow(t, 1.18); // more contrast
        const color = getInfernoColor(t);
        colors.push(color.r, color.g, color.b);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: false, roughness: 0.6, metalness: 0.18 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.rotation.x = Math.PI; // Flip 180 degrees around X axis
    scene.add(mesh);
    // Scale and center the mesh to fill the screen
    mesh.scale.set(1.35, 1.1, 1.35); // scale up in X, Y, Z
    mesh.position.y = 0; // center vertically
    mesh.position.x = 0;
    mesh.position.z = 0;
    // Adjust camera for a closer, fuller view
    camera.position.set(0, 7, 16);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    // Responsive resize
    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);
    // Use real risks prop if provided, otherwise fallback
    console.log('riskData:', riskDataState);
    // Sort by score descending if available
    if (riskDataState[0] && typeof riskDataState[0].score === 'number') {
      riskDataState.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    peaks.sort((a, b) => b.yval - a.yval);
    const peakMap: { [key: number]: RiskType } = {};
    for (let i = 0; i < riskDataState.length; i++) {
      peakMap[peaks[i].i] = riskDataState[i];
    }
    console.log('riskData:', riskDataState);
    // Raycast on mouse move
    function onPointerMove(e: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(mesh);
      if (intersects.length > 0) {
        // Find closest vertex
        const idx = intersects[0].face?.a;
        if (typeof idx !== 'number') return;
        const risk = peakMap[idx];
        if (risk) {
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            name: risk.name || '',
            score: risk.score ?? null,
            description: risk.description || ''
          });
          return;
        }
      }
      setTooltip(t => ({ ...t, visible: false }));
    }
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', () => setTooltip(t => ({ ...t, visible: false })));
    // Animation loop (auto-rotate + controls + bloom)
    let frameId: number;
    function animate() {
      mesh.rotation.y += 0.0015;
      controls.update();
      composer.render();
      frameId = requestAnimationFrame(animate);
    }
    animate();
    // Cleanup for this block
    const cleanup = () => {
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      if (frameId) cancelAnimationFrame(frameId);
      controls.dispose();
      composer.dispose();
      window.removeEventListener('resize', onResize);
    };
    if (typeof window !== 'undefined') {
      (window as any)._arview_cleanup = cleanup;
    }
    // Cleanup
    return () => {
      if (typeof window !== 'undefined' && (window as any)._arview_cleanup) {
        (window as any)._arview_cleanup();
        delete (window as any)._arview_cleanup;
      }
    };
  }, [riskDataState, seed]);

  // Tooltip overlay
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#000' }}>
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', color: '#fff', background: '#222d', padding: '12px 32px', borderRadius: 12, fontSize: 18, zIndex: 10, fontWeight: 600, fontFamily: 'sans-serif' }}>
        3D Visual Preview
      </div>
      <div
        ref={mountRef}
        style={{
          width: '100vw',
          height: '100vh',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 10,
        }}
      />
      {tooltip.visible && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y + 12,
          background: 'rgba(30,0,40,0.96)',
          color: '#fff',
          padding: '8px 18px',
          borderRadius: 8,
          fontSize: 18,
          pointerEvents: 'none',
          zIndex: 10001,
          fontFamily: 'sans-serif',
          boxShadow: '0 2px 12px #000a'
        }}>
          <div><b>{tooltip.name}</b></div>
          {tooltip.score !== null && <div>Score: {tooltip.score}</div>}
          {tooltip.description && <div style={{ fontSize: 15, opacity: 0.85 }}>{tooltip.description}</div>}
        </div>
      )}
      {/* Only show all risk titles as overlays at the top, not from 3D peaks */}
      {riskDataState && riskDataState.map((risk, i) => {
        const title = (risk.label || risk.name || '').trim();
        if (!title) return null;
        return (
          <div key={i} style={{
            position: 'fixed',
            left: '50%',
            top: 80 + i * 48,
            transform: 'translateX(-50%)',
            color: '#fff',
            fontWeight: 900,
            fontSize: 32,
            textShadow: '0 2px 8px #000, 0 0 2px #fff',
            pointerEvents: 'none',
            zIndex: 10002,
            fontFamily: 'sans-serif',
            whiteSpace: 'nowrap',
            background: 'rgba(0,0,0,0.3)',
            padding: '2px 14px',
            borderRadius: 8,
            marginBottom: 8,
          }}>{title}</div>
        );
      })}
      <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, zIndex: 10, background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 18, cursor: 'pointer', opacity: 0.85, fontFamily: 'sans-serif' }}>Close Visual</button>
    </div>
  );
};

export default Heatmap3DView; 