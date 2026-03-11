---
layout: default
title: Data Visualization
---

<h2>Data Visualization</h2>

<div id="model-container" style="width: 100%; height: 80vh; position: relative;"></div>

<div id="controls" style="padding: 1em;">
  <h3>Handedness</h3>
  <button class="handedness-btn" data-handedness="right">Right</button>
  <button class="handedness-btn" data-handedness="left">Left</button>

  <h3>Hand Measurements</h3>
  <div>
    <label for="circumference">Circumference:</label>
    <input type="range" id="circumference" name="circumference" min="170" max="230" value="200">
    <span id="circumference-value">200</span>
  </div>
  <div>
    <label for="length">Length:</label>
    <input type="range" id="length" name="length" min="160" max="210" value="185">
    <span id="length-value">185</span>
  </div>

  <h3>Color Preferences</h3>
  <button class="color-btn" data-color="R">Red</button>
  <button class="color-btn" data-color="B">Blue</button>
  <button class="color-btn" data-color="G">Green</button>
  <button class="color-btn" data-color="W">White</button>
  <button class="color-btn" data-color="Y">Yellow</button>
</div>

<script>
document.addEventListener('DOMContentLoaded', (event) => {
  const buttons = document.querySelectorAll('.data-btn');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const handedness = button.getAttribute('data-handedness');
      console.log('Handedness selected:', handedness);
      // We will add the interaction with the 3D model here
      if (window.updateModel) {
        window.updateModel({ handedness: handedness });
      }
    });
  });
});
</script>
