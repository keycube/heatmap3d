# Heatmap 3D - Three.js Cube

This project involves designing and developing a web application for the interactive three-dimensional visualization of a cubic keyboard. It integrates experimental data from research on finger usage and preferences during typing.

The data, provided by the project supervisor, describes the finger-to-key association preferences observed during user experiments. The goal is to leverage this data to create a visual and analytical representation of these preferences using the Three.js library in JavaScript.

The application is designed to be generic and reusable, allowing it to be adapted for other similar datasets in the future without major changes to the software architecture.

This document explains the role of each Three.js feature used in this project.

---

## Table of Contents
1.  [Core Components](#1-core-components)
2.  [Camera & Controls](#2-camera--controls)
3.  [Lighting](#3-lighting)
4.  [Objects & Geometry](#4-objects--geometry)
5.  [Interaction & Raycasting](#5-interaction--raycasting)
6.  [Animation Loop](#6-animation-loop)
7.  [Responsiveness](#7-responsiveness)

---

### 1. Core Components

These are the three essential building blocks of any Three.js application.

-   `THREE.Scene`: This is the root container for all 3D objects in the project. The blue cube, the orange keys, the lights, and the camera are all added to this scene.
    ```javascript
    const scene = new THREE.Scene();
    ```

-   `THREE.WebGLRenderer`: This is the engine responsible for drawing the scene onto the screen. It takes the scene and camera information and renders a 2D image on an HTML `<canvas>` element. The `{ antialias: true }` option is used to smooth the edges of the objects, resulting in a cleaner look.
    ```javascript
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    ```

-   `THREE.Color`: Used to set the background color of the scene to black, providing a neutral, high-contrast backdrop for the colored objects.
    ```javascript
    scene.background = new THREE.Color('black');
    ```

### 2. Camera & Controls

This section defines how the user views and interacts with the scene.

-   `THREE.PerspectiveCamera`: This camera mimics how the human eye sees. Objects farther away appear smaller.
    -   `25`: The field of view (fov). A smaller angle like 25 degrees creates a "zoomed-in" effect.
    -   `window.innerWidth / window.innerHeight`: The aspect ratio, ensuring objects are not stretched or squashed.
    -   `0.1` and `1000`: The near and far clipping planes. Objects closer than 0.1 or farther than 1000 units from the camera will not be rendered.
    ```javascript
    const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2, 2, 4); // Initial camera position
    ```

-   `OrbitControls`: An add-on that allows the user to "orbit" the camera around a target point (the center of the scene by default) using the mouse.
    -   `controls.enableDamping = true`: This creates a smooth, inertial effect. When the user stops dragging, the camera gently decelerates instead of stopping abruptly. This requires `controls.update()` to be called in the animation loop.
    ```javascript
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    ```

### 3. Lighting

Lighting is crucial for making 3D objects visible and giving them depth. This project uses a combination of two lights.

-   `THREE.AmbientLight`: Provides a soft, base level of light that illuminates all objects in the scene equally, from all directions. It prevents any part of the scene from being completely black.
    ```javascript
    const ambientLight = new THREE.AmbientLight('white', 0.6);
    scene.add(ambientLight);
    ```

-   `THREE.DirectionalLight`: Simulates a distant light source, like the sun. It casts light from a specific direction, creating highlights and shadows. This gives the cube and keys a more defined, 3D appearance.
    ```javascript
    const directionalLight = new THREE.DirectionalLight('white', 0.8);
    directionalLight.position.set(5, 5, 5); // Light comes from this direction
    scene.add(directionalLight);
    ```

### 4. Objects & Geometry

This section covers the creation of the visible objects in the scene.

-   `THREE.BoxGeometry`: A class for defining a rectangular cuboid shape. It is used to create both the large central cube and the smaller keys.
    ```javascript
    const geometry = new THREE.BoxGeometry(1, 1, 1); // For the main cube
    const keyGeometry = new THREE.BoxGeometry(keySize, keySize, keySize); // For the keys
    ```

-   `THREE.MeshStandardMaterial`: A realistic material that reacts to light. It's used for the cube and keys, allowing them to be properly lit by the `DirectionalLight`. The `.clone()` method is used on the key material to ensure each key can have its color changed independently.
    ```javascript
    const material = new THREE.MeshStandardMaterial({ color: 'royalblue' });
    const keyMaterial = new THREE.MeshStandardMaterial({ color: 'orange' });
    ```

-   `THREE.Mesh`: The final object that combines a `Geometry` (the shape) with a `Material` (the appearance). The project creates one mesh for the central cube and many meshes for the keys inside a loop.
    ```javascript
    const cube = new THREE.Mesh(geometry, material);
    const key = new THREE.Mesh(keyGeometry, keyMaterial.clone());
    ```

-   `THREE.Group`: A container used to group multiple objects together. In this project, the main cube and all the small keys are added to `keycubeGroup`. This allows us to treat the entire assembly as a single unit for positioning and for raycasting.
    ```javascript
    const keycubeGroup = new THREE.Group();
    keycubeGroup.add(cube); // Add the main cube
    // ...loop to add all keys...
    scene.add(keycubeGroup); // Add the entire group to the scene
    ```

### 5. Interaction & Raycasting

This is how the application detects when the mouse is over an object.

-   `THREE.Raycaster`: This utility "shoots" a virtual ray from the camera's position through the mouse cursor's position into the 3D scene. It can then report which objects this ray intersects.
    ```javascript
    const raycaster = new THREE.Raycaster();
    ```

-   `THREE.Vector2`: A simple 2D vector used here to store the mouse's position in normalized device coordinates (from -1 to +1), which is the format the `Raycaster` requires.
    ```javascript
    const mouse = new THREE.Vector2();
    ```

-   `raycaster.setFromCamera(mouse, camera)`: This function updates the raycaster, positioning the ray based on the current mouse coordinates and camera position.

-   `raycaster.intersectObjects(...)`: This function performs the actual intersection test and returns an array of all objects that the ray hits, sorted by distance. This is used to determine which key is being hovered over. The logic is optimized to handle changing the hovered key's color and resetting the previously hovered one in a clean and efficient way.
    ```javascript
    // In the animate loop:
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(keycubeGroup.children);
    const newHoveredKey = (intersects.length > 0 && intersects[0].object !== cube) ? intersects[0].object : null;

    if (hoveredKey !== newHoveredKey) {
      if (hoveredKey) {
        hoveredKey.material.color.set('orange'); // Reset old key
      }
      if (newHoveredKey) {
        newHoveredKey.material.color.set('lightgray'); // Highlight new key
      }
      hoveredKey = newHoveredKey;
    }
    ```

### 6. Animation Loop

The `animate` function creates a loop that renders the scene repeatedly, creating the illusion of motion and interactivity.

-   `requestAnimationFrame(animate)`: This is a browser API that tells the browser to call the `animate` function again before the next repaint. It creates a smooth, efficient loop.

-   `controls.update()`: When damping is enabled on `OrbitControls`, this function must be called in the animation loop to apply the smooth deceleration effect to the camera's movement.

-   `renderer.render(scene, camera)`: This is the final step in each frame, where the renderer draws the current state of the scene from the camera's perspective.

### 7. Responsiveness

This code ensures that the 3D scene adapts correctly when the browser window is resized.

-   `window.addEventListener('resize', ...)`: This sets up a listener that executes code whenever the window size changes.
-   `camera.aspect = ...`: Updates the camera's aspect ratio to match the new window dimensions, preventing object distortion.
-   `camera.updateProjectionMatrix()`: Applies the change in aspect ratio to the camera. This is a mandatory step after changing most camera properties.
-   `renderer.setSize(...)`: Resizes the renderer's canvas to fit the new window dimensions.