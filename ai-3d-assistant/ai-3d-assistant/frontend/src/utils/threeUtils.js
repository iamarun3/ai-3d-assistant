/**
 * utils/threeUtils.js
 * Three.js scene setup helpers for the 3D model viewer.
 * Handles both live GLB loading and procedural demo models.
 */

import * as THREE from "three";
import { VIEWER_CONFIG } from "./config.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// ── Scene bootstrap ─────────────────────────────────────────────────────

/**
 * Create and mount a Three.js scene inside a DOM container.
 * Returns a cleanup function to dispose all resources.
 *
 * @param {HTMLElement} container  - DOM node to render into
 * @param {string|null} imageUrl   - Image URL to texture the demo model
 * @param {string|null} modelUrl   - GLB URL (if available from API)
 * @returns {() => void}           - Cleanup / dispose function
 */
export function mountThreeScene(container, imageUrl = null, modelUrl = null) {
  if (!container) return () => {};

  // ── Renderer ──────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);

  // ── Scene & camera ────────────────────────────────────────────────────
  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0d18);
  scene.fog        = new THREE.Fog(0x0a0d18, 9, 22);

  const camera = new THREE.PerspectiveCamera(
    VIEWER_CONFIG.fov,
    container.clientWidth / container.clientHeight,
    VIEWER_CONFIG.near,
    VIEWER_CONFIG.far
  );
  camera.position.set(0, VIEWER_CONFIG.cameraY, VIEWER_CONFIG.cameraZ);

  // ── Lighting ──────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x334466, 0.9));

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
  dirLight.position.set(3, 5, 3);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width  = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  const backLight = new THREE.DirectionalLight(0x4466ff, 0.7);
  backLight.position.set(-3, 2, -3);
  scene.add(backLight);

  const fillLight = new THREE.PointLight(0x8899ff, 0.6, 12);
  fillLight.position.set(0, 3, 0);
  scene.add(fillLight);

  // ── Environment geometry ──────────────────────────────────────────────
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({ color: 0x090d1a, roughness: 0.95 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.15;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(12, 24, 0x1a2340, 0x1a2340);
  grid.position.y = -1.14;
  scene.add(grid);

  // ── Build procedural model (demo) ─────────────────────────────────────
  const group = new THREE.Group();
  scene.add(group);

  const buildDemoModel = (texture) => {
    // Main mesh
    const geo = new THREE.BoxGeometry(1.6, 1.6, 1.6, 8, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      map:       texture || null,
      color:     texture ? 0xffffff : 0x4488ee,
      roughness: 0.35,
      metalness: 0.45,
      envMapIntensity: 1,
    });
    const box = new THREE.Mesh(geo, mat);
    box.castShadow = true;
    group.add(box);

    // Wire overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x44aaff, wireframe: true,
      transparent: true, opacity: 0.06,
    });
    group.add(new THREE.Mesh(geo, wireMat));

    // Pedestal
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.12, 36),
      new THREE.MeshStandardMaterial({ color: 0x101828, roughness: 0.85 })
    );
    ped.position.y = -1.0;
    ped.receiveShadow = true;
    group.add(ped);

    // Floating particles
    const pGeo = new THREE.BufferGeometry();
    const N    = 350;
    const pos  = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 7;
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(
      new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: 0x4488ff, size: 0.022, transparent: true, opacity: 0.45 })
      )
    );
  };

  // Load texture from image, build model
  // ── LOAD REAL 3D MODEL (GLB) ─────────────────────────────
if (modelUrl) {
  console.log("🔥 Loading GLB model:", modelUrl);

  const loader = new GLTFLoader();

  loader.load(
    modelUrl,
    (gltf) => {
      const model = gltf.scene;

      // clear demo objects
      group.clear();

      // center model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // scale nicely
      const size = box.getSize(new THREE.Vector3()).length();
      const scale = 2 / size;
      model.scale.setScalar(scale);

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      group.add(model);
      console.log("✅ GLB Loaded successfully");
    },
    undefined,
    (error) => {
      console.error("❌ GLB Load Error:", error);

      // fallback to demo model
      if (imageUrl) {
        new THREE.TextureLoader().load(
          imageUrl,
          (tex) => buildDemoModel(tex),
          undefined,
          () => buildDemoModel(null)
        );
      } else {
        buildDemoModel(null);
      }
    }
  );

} else {
  console.log("⚠️ No modelUrl → showing demo model");

  if (imageUrl) {
    new THREE.TextureLoader().load(
      imageUrl,
      (tex) => buildDemoModel(tex),
      undefined,
      () => buildDemoModel(null)
    );
  } else {
    buildDemoModel(null);
  }
}

  // ── Orbit controls (manual, no OrbitControls dep) ────────────────────
  let isDragging = false;
  let prevMouse  = { x: 0, y: 0 };
  let rotation   = { x: 0.18, y: 0 };
  let autoRotate = true;
  let camZ       = VIEWER_CONFIG.cameraZ;
  let userRotY   = 0;

  const onMouseDown = (e) => {
    isDragging = true;
    autoRotate = false;
    prevMouse  = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    rotation.y += (e.clientX - prevMouse.x) * 0.012;
    rotation.x += (e.clientY - prevMouse.y) * 0.012;
    rotation.x  = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotation.x));
    prevMouse   = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp   = () => { isDragging = false; };
  const onWheel     = (e) => {
    camZ = Math.max(1.8, Math.min(8.5, camZ + e.deltaY * 0.008));
  };

  // Touch support
  let lastTouch = null;
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDragging = true; autoRotate = false;
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const onTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    rotation.y += (e.touches[0].clientX - lastTouch.x) * 0.012;
    rotation.x += (e.touches[0].clientY - lastTouch.y) * 0.012;
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = () => { isDragging = false; };

  renderer.domElement.addEventListener("mousedown",  onMouseDown);
  renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
  renderer.domElement.addEventListener("touchmove",  onTouchMove,  { passive: true });
  renderer.domElement.addEventListener("touchend",   onTouchEnd);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup",   onMouseUp);
  renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

  // ── Resize handler ────────────────────────────────────────────────────
  const onResize = () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener("resize", onResize);

  // ── Animation loop ────────────────────────────────────────────────────
  let frameId;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    if (group.children.length > 0) {
      if (autoRotate) rotation.y += VIEWER_CONFIG.autoRotateSpeed;
      group.rotation.x = rotation.x;
      group.rotation.y = rotation.y + userRotY;
    }
    camera.position.z += (camZ - camera.position.z) * 0.08; // smooth zoom
    renderer.render(scene, camera);
  };
  animate();

  // ── Cleanup & API ─────────────────────────────────────────────────────
  const dispose = () => {
    cancelAnimationFrame(frameId);
    renderer.domElement.removeEventListener("mousedown",  onMouseDown);
    renderer.domElement.removeEventListener("touchstart", onTouchStart);
    renderer.domElement.removeEventListener("touchmove",  onTouchMove);
    renderer.domElement.removeEventListener("touchend",   onTouchEnd);
    renderer.domElement.removeEventListener("wheel",      onWheel);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup",   onMouseUp);
    window.removeEventListener("resize",    onResize);
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
    renderer.dispose();
    if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
  };

  return {
    dispose,
    setTransform: (sizeArr, rotYDegrees) => {
      // Base array is [50, 45, 60] approx for 1.0 scale
      if (group) {
        group.scale.set(sizeArr[0] / 50, sizeArr[1] / 45, sizeArr[2] / 60);
      }
      userRotY = rotYDegrees * (Math.PI / 180);
    }
  };
}
