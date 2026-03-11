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
  // Handedness buttons
  const handednessButtons = document.querySelectorAll('.handedness-btn');
  handednessButtons.forEach(button => {
    button.addEventListener('click', () => {
      const handedness = button.getAttribute('data-handedness');
      console.log('Handedness selected:', handedness);
      if (window.updateModel) {
        window.updateModel({ handedness: handedness });
      }
    });
  });

  // Color buttons
  const colorButtons = document.querySelectorAll('.color-btn');
  colorButtons.forEach(button => {
    button.addEventListener('click', () => {
      const color = button.getAttribute('data-color');
      console.log('Color selected:', color);
      if (window.updateModel) {
        window.updateModel({ color: color });
      }
    });
  });

  // Circumference slider
  const circumferenceSlider = document.getElementById('circumference');
  const circumferenceValue = document.getElementById('circumference-value');
  if (circumferenceSlider) {
    circumferenceSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      circumferenceValue.textContent = value;
      console.log('Circumference selected:', value);
      if (window.updateModel) {
        window.updateModel({ circumference: parseInt(value) });
      }
    });
  }

  // Length slider
  const lengthSlider = document.getElementById('length');
  const lengthValue = document.getElementById('length-value');
  if (lengthSlider) {
    lengthSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      lengthValue.textContent = value;
      console.log('Length selected:', value);
      if (window.updateModel) {
        window.updateModel({ length: parseInt(value) });
      }
    });
  }
});
</script>
