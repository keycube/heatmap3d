---
---
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

// Camera
const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 1000);
camera.position.set(2, 2, 4);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
const container = document.getElementById('model-container');
if (container) {
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);
  camera.aspect = container.offsetWidth / container.offsetHeight;
} else {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera.aspect = window.innerWidth / window.innerHeight;
}
camera.updateProjectionMatrix();

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(ambientLight, directionalLight);

// Main cube
const cubeGeometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.1);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

// Keycube group
const keycubeGroup = new THREE.Group();
keycubeGroup.add(cube);

// Key configuration
const keySize = 0.15;
const keyGeometry = new THREE.BoxGeometry(keySize, keySize, keySize);
const spacing = 0.20;
const offset = 0.5;

const faces = [
  { axis: 'y', sign: 1, prefix: 'Y', color: 'yellow' },
  { axis: 'y', sign: -1, prefix: 'W', color: 'white' },
  { axis: 'x', sign: 1, prefix: 'R', color: 'red' },
  { axis: 'x', sign: -1, prefix: 'B', color: 'blue' },
  { axis: 'z', sign: 1, prefix: 'G', color: 'green' }
];

// Create keys
faces.forEach(({ axis, sign, prefix, color }) => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const key = new THREE.Mesh(keyGeometry, new THREE.MeshStandardMaterial({ color }));
      const keyIndex = i * 4 + j + 1;
      const keyID = `${prefix}${keyIndex}`;
      
      key.userData = { id: keyID, face: prefix, index: keyIndex, originalColor: color };
      key.name = keyID;

      const u = (i - 1.5) * spacing;
      const v = (j - 1.5) * spacing;

      if (axis === 'y') {
        key.position.set(u, offset * sign, v);
      } else if (axis === 'x') {
        key.position.set(offset * sign, u, v);
      } else {
        key.position.set(u, v, offset * sign);
      }

      keycubeGroup.add(key);
    }
  }
});

scene.add(keycubeGroup);

// Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredKey = null;

function updateMousePosition(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

renderer.domElement.addEventListener('mousemove', updateMousePosition);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(keycubeGroup.children);
  const newHoveredKey = (intersects.length > 0 && intersects[0].object !== cube) ? intersects[0].object : null;

  if (hoveredKey !== newHoveredKey) {
    if (hoveredKey) {
      hoveredKey.material.color.set(hoveredKey.userData.originalColor);
    }
    if (newHoveredKey) {
      newHoveredKey.material.color.set('lightgray');
    }
    hoveredKey = newHoveredKey;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Window resize
window.addEventListener('resize', () => {
  const container = document.getElementById('model-container');
  if (container) {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  } else {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  camera.updateProjectionMatrix();
});

// Update model function
window.updateModel = function(data) {
  if (data.handedness) {
    keycubeGroup.scale.x = data.handedness === 'left' ? -1 : 1;
  }
  
  if (data.color) {
    keycubeGroup.children.forEach(child => {
      if (child.userData?.face === data.color) {
        child.material.color.set('orange');
      } else if (child.userData?.originalColor) {
        child.material.color.set(child.userData.originalColor);
      }
    });
  }
  
  if (data.circumference || data.length) {
    const circumferenceScale = data.circumference ? data.circumference / 200 : 1;
    const lengthScale = data.length ? data.length / 185 : 1;
    const scale = (circumferenceScale + lengthScale) / 2;
    keycubeGroup.scale.setScalar(scale);
  }
};
</script>
