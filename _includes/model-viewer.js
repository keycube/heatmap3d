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
const initialCameraPosition = camera.position.clone();

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
controls.saveState();

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

// Window resize and orientation change
function handleResize() {
  const container = document.getElementById('model-container');
  if (container) {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  } else {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
  setTimeout(handleResize, 100); // Delay for orientation change
});

// Update model function
window.updateModel = function(data) {
  console.log('Updating model with data:', data);
  
  if (data.handedness) {
    keycubeGroup.scale.x = data.handedness === 'left' ? -1 : 1;
  }
  
  if (data.reset) {
    // Reset all colors and scales to original
    keycubeGroup.children.forEach(child => {
      if (child.userData?.originalColor) {
        child.material.color.set(child.userData.originalColor);
        // Reset any scale modifications
        child.scale.set(1, 1, 1);
        child.position.copy(child.userData.originalPosition || child.position);
      }
    });
    keycubeGroup.scale.setScalar(1);
    keycubeGroup.scale.x = 1;
    return;
  }
  
  if (data.color && data.colorData) {
    // Reset all keys to original state first
    keycubeGroup.children.forEach(child => {
      if (child.userData?.originalColor) {
        child.material.color.set(child.userData.originalColor);
        child.scale.set(1, 1, 1);
        // Store original position if not stored yet
        if (!child.userData.originalPosition) {
          child.userData.originalPosition = child.position.clone();
        }
      }
    });
    
    // Apply new visualization - LOWER height for HIGHER preferences
    const prefix = data.color;
    keycubeGroup.children.forEach(child => {
      if (child.userData?.face === prefix && child.userData?.index) {
        const intensity = data.colorData[child.userData.index - 1]; // Arrays are 0-indexed
        
        // Map intensity (1-10) to visual feedback
        const normalizedIntensity = Math.max(0.3, intensity / 10);
        
        // Brighten color based on preference
        const tempColor = new THREE.Color(child.userData.originalColor);
        tempColor.multiplyScalar(normalizedIntensity + 0.5);
        child.material.color.set(tempColor);
        
        // LOWER the key for HIGHER preferences (inverted scale)
        // High preference (9-10) = lower position (0.3-0.4)
        // Low preference (1-2) = normal position (0.8-1.0)
        const heightScale = 1.1 - (intensity / 10) * 0.8; // Range: 0.3 to 1.1
        child.scale.y = heightScale;
        
        // Slightly adjust position to keep keys from overlapping
        const originalY = child.userData.originalPosition.y;
        child.position.y = originalY + (heightScale - 1) * 0.1;
        
      } else if (child.userData?.face && child.userData.face !== prefix) {
        // Dim other faces but keep normal height
        const tempColor = new THREE.Color(child.userData.originalColor);
        tempColor.multiplyScalar(0.3);
        child.material.color.set(tempColor);
        child.scale.set(1, 1, 1);
      }
    });
  } else if (data.color) {
    // Simple color highlight without data
    keycubeGroup.children.forEach(child => {
      if (child.userData?.face === data.color) {
        child.material.color.set('orange');
        child.scale.set(1, 1, 1);
      } else if (child.userData?.originalColor) {
        child.material.color.set(child.userData.originalColor);
        child.scale.set(1, 1, 1);
      }
    });
  }
  
  if (data.circumference || data.length) {
    const circumferenceScale = data.circumference ? data.circumference / 200 : 1;
    const lengthScale = data.length ? data.length / 185 : 1;
    const scale = (circumferenceScale + lengthScale) / 2;
    const currentScaleX = keycubeGroup.scale.x; // Preserve handedness
    keycubeGroup.scale.setScalar(scale);
    keycubeGroup.scale.x = currentScaleX;
  }

  if (data.wireframe !== undefined) {
    scene.traverse(function (child) {
        if (child.isMesh) {
            child.material.wireframe = data.wireframe;
        }
    });
  }

  if (data.backgroundColor) {
      renderer.setClearColor(data.backgroundColor);
  }

  if (data.resetView) {
    camera.position.copy(initialCameraPosition);
    camera.lookAt(0, 0, 0);
    controls.reset();
  }

  if (data.lightingIntensity !== undefined) {
    directionalLight.intensity = data.lightingIntensity;
  }

  // Heatmap visualization (for aggregate/reachability modes)
  if (data.heatmap) {
    const heatmapData = data.heatmap; // { R: [values], B: [...], G: [...], W: [...], Y: [...] }
    const min = data.heatmapMin !== undefined ? data.heatmapMin : 0;
    const max = data.heatmapMax !== undefined ? data.heatmapMax : 1;
    const range = max - min || 1;

    keycubeGroup.children.forEach(child => {
      if (child.userData?.face && child.userData?.index && heatmapData[child.userData.face]) {
        const value = heatmapData[child.userData.face][child.userData.index - 1];
        const normalized = Math.max(0, Math.min(1, (value - min) / range));

        // Store original position
        if (!child.userData.originalPosition) {
          child.userData.originalPosition = child.position.clone();
        }

        // Heatmap color: red (0) -> yellow (0.5) -> green (1)
        const hue = normalized * 0.33; // 0 = red, 0.17 = yellow, 0.33 = green
        const color = new THREE.Color();
        color.setHSL(hue, 0.9, 0.5);
        child.material.color.set(color);

        // Scale height based on value
        const heightScale = 0.4 + normalized * 0.8;
        child.scale.y = heightScale;
        const originalY = child.userData.originalPosition.y;
        child.position.y = originalY + (heightScale - 1) * 0.05;
      } else if (child !== cube && child.userData?.originalColor) {
        child.material.color.set(child.userData.originalColor);
        child.scale.set(1, 1, 1);
      }
    });
  }
};
</script>
