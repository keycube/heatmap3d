// ===== IMPORTS =====
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(
  25, // Reduced viewing angle to zoom in
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2, 2, 4);

// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== CONTROLS =====
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enabled = true;

// ===== LIGHTS =====
const ambientLight = new THREE.AmbientLight('white', 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('white', 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// ===== CUBE (KEY) =====
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 'royalblue' });
const cube = new THREE.Mesh(geometry, material);
// DO NOT add the cube directly to the scene: scene.add(cube);

// ===== KEYCUBE GROUP (Main Cube + Keys) =====
const keycubeGroup = new THREE.Group();
keycubeGroup.add(cube); // Add the main cube to the group

const keyMaterial = new THREE.MeshStandardMaterial({ color: 'orange' });
const keySize = 0.15; // Size of a key
const keyGeometry = new THREE.BoxGeometry(keySize, keySize, keySize);
const spacing = 0.20; // Spacing between keys
const offset = 0.5; // To place the keys on the surface of the main cube

// Definition of the cube faces
const faces = [
  { axis: 'y', sign: 1 },   // Top face
  { axis: 'y', sign: -1 },  // Bottom face
  { axis: 'x', sign: 1 },   // Right face
  { axis: 'x', sign: -1 },  // Left face
  { axis: 'z', sign: 1 },   // Front face
];

// Create keys for 5 faces (4x4 per face)
faces.forEach(({ axis, sign }) => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const key = new THREE.Mesh(keyGeometry, keyMaterial.clone());

      // Calculate the position of the key on a 2D grid
      const u = (i - 1.5) * spacing;
      const v = (j - 1.5) * spacing;

      // Position the key on the correct face of the cube
      if (axis === 'y') {
        key.position.set(u, offset * sign, v);
      } else if (axis === 'x') {
        key.position.set(offset * sign, u, v);
      } else { // axis === 'z'
        key.position.set(u, v, offset * sign);
      }

      keycubeGroup.add(key);
    }
  }
});

scene.add(keycubeGroup); // Add the entire group to the scene

// ===== INTERACTION (Raycaster) =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

let hoveredKey = null; // Variable to store the hovered key

// ===== ANIMATION =====
function animate() {
  requestAnimationFrame(animate);

  // Hover interaction
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(keycubeGroup.children);

  const newHoveredKey = (intersects.length > 0 && intersects[0].object !== cube) ? intersects[0].object : null;

  if (hoveredKey !== newHoveredKey) {
    // Reset the old hovered key (if it exists)
    if (hoveredKey) {
      hoveredKey.material.color.set('orange');
    }
    
    // Update the new hovered key and change its color
    if (newHoveredKey) {
      newHoveredKey.material.color.set('lightgray');
    }
    hoveredKey = newHoveredKey;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ===== RESPONSIVE =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
