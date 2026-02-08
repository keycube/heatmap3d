// ===== IMPORTS =====
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===== SCÈNE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

// ===== CAMÉRA =====
const camera = new THREE.PerspectiveCamera(
  25, // Angle de vue réduit pour zoomer
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2, 2, 4);

// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== CONTRÔLES =====
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enabled = true;

// ===== LUMIÈRES =====
const ambientLight = new THREE.AmbientLight('white', 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('white', 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// ===== CUBE (TOUCHE) =====
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 'royalblue' });
const cube = new THREE.Mesh(geometry, material);
// NE PAS ajouter le cube directement à la scène : scene.add(cube);

// ===== GROUPE KEYCUBE (Cube principal + Touches) =====
const keycubeGroup = new THREE.Group();
keycubeGroup.add(cube); // Ajoute le cube principal au groupe

const keyMaterial = new THREE.MeshStandardMaterial({ color: 'orange' });
const keySize = 0.15; // Taille d'une touche
const keyGeometry = new THREE.BoxGeometry(keySize, keySize, keySize);
const spacing = 0.20; // Espacement entre les touches
const offset = 0.5; // Pour placer les touches à la surface du cube principal

// Définition des faces du cube
const faces = [
  { axis: 'y', sign: 1 },   // Face du dessus
  { axis: 'y', sign: -1 },  // Face du dessous
  { axis: 'x', sign: 1 },   // Face de droite
  { axis: 'x', sign: -1 },  // Face de gauche
  { axis: 'z', sign: 1 },   // Face avant
];

// Créer les touches pour 6 faces (4x4 par face)
faces.forEach(face => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      // On clone le matériau pour que chaque touche soit indépendante
      const individualKeyMaterial = keyMaterial.clone();
      const key = new THREE.Mesh(keyGeometry, individualKeyMaterial);

      // Calcule la position de la touche sur une grille 2D
      const u = -1.5 * spacing + i * spacing;
      const v = -1.5 * spacing + j * spacing;

      // Positionne la touche sur la bonne face du cube
      if (face.axis === 'y') {
        key.position.set(u, offset * face.sign, v);
      } else if (face.axis === 'x') {
        key.position.set(offset * face.sign, u, v);
      } else {
        key.position.set(u, v, offset * face.sign);
      }

      key.material = individualKeyMaterial; // Assigne le matériau cloné
      keycubeGroup.add(key);
    }
  }
});

scene.add(keycubeGroup); // Ajoute le groupe entier à la scène

// ===== INTERACTION (Raycaster) =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

let hoveredKey = null; // Variable pour mémoriser la touche survolée

// ===== ANIMATION =====
function animate() {
  requestAnimationFrame(animate);

  // Interaction survol
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(keycubeGroup.children);

  // Si on survole quelque chose
  if (intersects.length > 0 && intersects[0].object !== cube) {
    const newHoveredKey = intersects[0].object;

    // Si on survole une NOUVELLE touche
    if (hoveredKey !== newHoveredKey) {
      // On réinitialise l'ancienne touche survolée (si elle existe)
      if (hoveredKey) {
        hoveredKey.material.color.set('orange');
      }
      
      // On met à jour la nouvelle touche survolée et on change sa couleur
      hoveredKey = newHoveredKey;
      hoveredKey.material.color.set('lightgray');
    }
  } else { // Si on ne survole plus rien
    // S'il y avait une touche survolée, on la réinitialise
    if (hoveredKey) {
      hoveredKey.material.color.set('orange');
      hoveredKey = null;
    }
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
