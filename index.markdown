---
layout: default
title: Keycube 3D Model
---

<div id="model-container" style="width: 100%; height: 100vh;"></div>

<script>
  const overlay = document.getElementById('intro-overlay');
  
  function dismissOverlay() {
    overlay.style.transform = 'translateY(-100%)'; // Slide up effect
    // Optional: remove element from DOM after transition matches CSS duration
    setTimeout(() => {
        overlay.style.display = 'none'; 
    }, 1000); 
  }

  // Auto dismiss after 1.5 seconds (1000ms + buffer)
  setTimeout(dismissOverlay, 4500);

  // Click to dismiss immediately
  overlay.addEventListener('click', dismissOverlay);
</script>
