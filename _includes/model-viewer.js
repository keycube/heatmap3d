// ===== IMPORTS =====
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'; // Import RoundedBoxGeometry

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
// Use RoundedBoxGeometry for smoother edges
// Args: width, height, depth, segments, radius
const geometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.1); 
const material = new THREE.MeshStandardMaterial({ color: 0xD2B48C }); // Tan / Darker Beige
const cube = new THREE.Mesh(geometry, material);
// DO NOT add the cube directly to the scene: scene.add(cube);

// ===== KEYCUBE GROUP (Main Cube + Keys) =====
const keycubeGroup = new THREE.Group();
keycubeGroup.add(cube); // Add the main cube to the group

const keyMaterial = new THREE.MeshStandardMaterial({ color: 'white' }); // Base material, will be colored per face
const keySize = 0.15; // Size of a key
const keyGeometry = new THREE.BoxGeometry(keySize, keySize, keySize);
const spacing = 0.20; // Spacing between keys
const offset = 0.5; // To place the keys on the surface of the main cube

// Definition of the cube faces mapped to data prefixes
// MAPPING ASSUMPTION:
// Top -> Y (Yellow)
// Bottom -> W (White)
// Right -> R (Red)
// Left -> B (Blue)
// Front -> G (Green)
const faces = [
  { axis: 'y', sign: 1, prefix: 'Y', color: 'yellow' },   // Top face
  { axis: 'y', sign: -1, prefix: 'W', color: 'white' },  // Bottom face
  { axis: 'x', sign: 1, prefix: 'R', color: 'red' },   // Right face
  { axis: 'x', sign: -1, prefix: 'B', color: 'blue' },  // Left face
  { axis: 'z', sign: 1, prefix: 'G', color: 'green' },   // Front face
];

// Create keys for 5 faces (4x4 per face)
faces.forEach(({ axis, sign, prefix, color }) => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const key = new THREE.Mesh(keyGeometry, keyMaterial.clone());
      key.material.color.set(color); // Set face color

      // Generate ID (e.g., R1, R2... R16)
      // Note: The order of i, j depends on how the CSV reads (row-major or column-major).
      // Here we assume row-major (1-4, 5-8, etc.)
      const keyIndex = (i * 4) + j + 1; // 1 to 16
      const keyID = `${prefix}${keyIndex}`;
      
      key.userData = { id: keyID, face: prefix, index: keyIndex, originalColor: color };
      key.name = keyID; // Useful for debugging or selecting by name

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
      hoveredKey.material.color.set(hoveredKey.userData.originalColor);
    }
    
    // Update the new hovered key and change its color
    if (newHoveredKey) {
      newHoveredKey.material.color.set('lightgray');
      console.log(`Hovered Key: ${newHoveredKey.userData.id}`); // Debug: Show ID in console
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
