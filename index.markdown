---
layout: default
title: Keycube 3D Model
---

<style>
.nav-link {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #007bff;
  color: white;
  padding: 12px 20px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  transition: all 0.3s;
}
.nav-link:hover {
  background: #0056b3;
  transform: translateY(-2px);
}
.info-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 15px;
  border-radius: 6px;
  max-width: 300px;
  z-index: 1000;
}
</style>

<a href="{{ '/dataviz' | relative_url }}" class="nav-link">📊 Data Visualization</a>

<div class="info-panel">
  <h3>🎮 Keycube 3D Model</h3>
  <p><strong>Controls:</strong><br>
  • Mouse: Rotate view<br>
  • Scroll: Zoom in/out<br>
  • Hover: Highlight keys</p>
  
  <p><strong>Want to visualize data?</strong><br>
  Click the "Data Visualization" button above to access participant data and interactive controls!</p>
</div>

<div id="model-container" style="width: 100%; height: 100vh;"></div>
