document.addEventListener('DOMContentLoaded', function () {
  var participantsData = window.participantsData;
  var reachabilityData = window.reachabilityData;
  var perFingerReachability = window.perFingerReachability;

  // Read the default mode from the page's meta tag
  var defaultModeMeta = document.querySelector('meta[name="default-mode"]');
  var currentMode = defaultModeMeta ? defaultModeMeta.getAttribute('content') : 'preference';

  var currentParticipant = null;  // null = no selection, 'aggregate' = mean, or participant object
  var currentFace = null;         // null = all faces, or 'R','B','G','W','Y'

  // ─── Compute aggregate mean preference (1-10 scale) ───
  var aggregatePreference = { R: [], B: [], G: [], W: [], Y: [] };
  ['R','B','G','W','Y'].forEach(function (face) {
    for (var i = 0; i < 16; i++) {
      var sum = 0;
      participantsData.forEach(function (p) { sum += p[face][i]; });
      aggregatePreference[face].push(+(sum / participantsData.length).toFixed(2));
    }
  });

  // ─── Compute aggregate reachability (total across all participants × all fingers) ───
  var aggregateReachability = { R: [], B: [], G: [], W: [], Y: [] };
  ['R','B','G','W','Y'].forEach(function (face) {
    for (var i = 0; i < 16; i++) {
      var sum = 0;
      reachabilityData.forEach(function (p) { sum += p[face][i]; });
      aggregateReachability[face].push(sum);
    }
  });

  // ─── Per-finger aggregate reachability ───
  function getFingerReachability(finger) {
    var result = { R: [], B: [], G: [], W: [], Y: [] };
    var fingerData = perFingerReachability[finger];
    if (!fingerData) return result;
    ['R','B','G','W','Y'].forEach(function (face) {
      for (var i = 0; i < 16; i++) {
        var sum = 0;
        fingerData.forEach(function (p) { sum += p[face][i]; });
        result[face].push(sum);
      }
    });
    return result;
  }

  // ─── Range utility ───
  function getRange(data) {
    var min = Infinity, max = -Infinity;
    ['R','B','G','W','Y'].forEach(function (face) {
      data[face].forEach(function (v) {
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });
    return { min: min, max: max };
  }

  // ═══════════════════════════════════════════════════════
  //  PREFERENCE MODE — unified individual + aggregate
  // ═══════════════════════════════════════════════════════

  function getPreferenceData() {
    // Returns the preference dataset for the current selection
    if (currentParticipant === 'aggregate') return aggregatePreference;
    if (currentParticipant && typeof currentParticipant === 'object') return currentParticipant;
    return null;
  }

  function applyPreferenceView() {
    if (!window.updateModel) return;
    var data = getPreferenceData();
    if (!data) {
      // No participant selected — reset to original colors
      window.updateModel({ reset: true });
      return;
    }

    if (currentFace) {
      // Show single face heatmap, dim the others
      var faceData = data[currentFace];
      if (!faceData) return;
      // Build a single-face heatmap object
      var singleFace = {};
      singleFace[currentFace] = faceData;
      window.updateModel({ heatmapSingleFace: singleFace, heatmapMin: 1, heatmapMax: 10, heatmapInvert: true });
    } else {
      // Show all faces as heatmap
      // For individual participants, data has R/B/G/W/Y arrays
      var heatmap = currentParticipant === 'aggregate' ? aggregatePreference : {
        R: data.R, B: data.B, G: data.G, W: data.W, Y: data.Y
      };
      window.updateModel({ heatmap: heatmap, heatmapMin: 1, heatmapMax: 10, heatmapInvert: true });
    }
  }

  // Update the selection badge display
  function updateSelectionBadge(icon, text) {
    var selectionIcon = document.getElementById('selection-icon');
    var selectionText = document.getElementById('selection-text');
    if (selectionIcon) selectionIcon.textContent = icon;
    if (selectionText) selectionText.textContent = text;
  }

  // ─── Participant selector (includes "Aggregate" option) ───
  var participantSelect = document.getElementById('participant-select');
  if (participantSelect) {
    participantSelect.addEventListener('change', function (e) {
      var val = e.target.value;
      currentFace = null; // reset face filter on participant change
      colorButtons.forEach(function (b) { b.classList.remove('active'); });

      var summaryPanel = document.getElementById('participant-summary');

      if (val === 'aggregate') {
        currentParticipant = 'aggregate';
        if (summaryPanel) summaryPanel.style.display = 'none';
        updateSelectionBadge('📊', 'Aggregate (Mean of 22 participants)');
        // Reset cube scale for aggregate
        if (window.updateModel) window.updateModel({ reset: true });
        applyPreferenceView();
      } else if (val !== '') {
        currentParticipant = participantsData[parseInt(val)];
        // Apply hand data to cube
        if (window.updateModel) {
          window.updateModel({
            reset: true
          });
          window.updateModel({
            handedness: currentParticipant.handedness,
            circumference: currentParticipant.circumferenceRight,
            length: currentParticipant.lengthRight,
            span: currentParticipant.spanRight,
            circumferenceLeft: currentParticipant.circumferenceLeft,
            lengthLeft: currentParticipant.lengthLeft,
            spanLeft: currentParticipant.spanLeft
          });
        }
        // Update summary panel
        if (summaryPanel) {
          summaryPanel.style.display = 'block';
          var sh = document.getElementById('summary-handedness');
          var sc = document.getElementById('summary-circumference');
          var sl = document.getElementById('summary-length');
          var ss = document.getElementById('summary-span');
          if (sh) sh.textContent = currentParticipant.handedness;
          if (sc) sc.textContent = currentParticipant.circumferenceRight;
          if (sl) sl.textContent = currentParticipant.lengthRight;
          if (ss) ss.textContent = currentParticipant.spanRight;
        }
        updateSelectionBadge('👤', 'Participant ' + currentParticipant.number +
          ' (' + currentParticipant.handedness + ')');
        applyPreferenceView();
      } else {
        currentParticipant = null;
        if (summaryPanel) summaryPanel.style.display = 'none';
        updateSelectionBadge('🎯', 'No participant selected');
        if (window.updateModel) window.updateModel({ reset: true });
      }
    });
  }

  // ─── Face color buttons (work for both individual and aggregate) ───
  var colorButtons = document.querySelectorAll('.color-btn');
  colorButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (currentMode === 'preference') {
        if (!currentParticipant) return; // no data to show
        colorButtons.forEach(function (b) { b.classList.remove('active'); });
        button.classList.add('active');
        currentFace = button.getAttribute('data-color');
        applyPreferenceView();
      }
    });
  });

  // ─── Reset / Show All button ───
  var resetBtn = document.querySelector('.reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      colorButtons.forEach(function (b) { b.classList.remove('active'); });
      currentFace = null;
      if (currentMode === 'preference') {
        applyPreferenceView();
      } else if (currentMode === 'reachability') {
        applyReachabilityView();
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  //  REACHABILITY MODE
  // ═══════════════════════════════════════════════════════

  function applyReachabilityView() {
    if (!window.updateModel) return;
    var fingerEl = document.getElementById('finger-select');
    if (!fingerEl) return;
    var finger = fingerEl.value;
    var data;
    if (finger === 'total') {
      data = aggregateReachability;
    } else {
      data = getFingerReachability(finger);
    }
    var range = getRange(data);
    window.updateModel({ heatmap: data, heatmapMin: range.min, heatmapMax: range.max });
  }

  // Finger filter for reachability
  var fingerSelect = document.getElementById('finger-select');
  if (fingerSelect) {
    fingerSelect.addEventListener('change', function () {
      if (currentMode === 'reachability') applyReachabilityView();
    });
  }

  // ═══════════════════════════════════════════════════════
  //  SHARED CONTROLS
  // ═══════════════════════════════════════════════════════

  // Make data available globally (for reachability inline scripts)
  window.aggregatePreference = aggregatePreference;
  window.aggregateReachability = aggregateReachability;

  // Collapsible sections
  document.querySelectorAll('.controls-section h3').forEach(function (header) {
    header.addEventListener('click', function () {
      var section = header.closest('.controls-section');
      section.classList.toggle('active');
    });
  });

  // Display Options - Wireframe
  var wireframeToggle = document.getElementById('wireframe-toggle');
  if (wireframeToggle) {
    wireframeToggle.addEventListener('change', function (e) {
      if (window.updateModel) {
        window.updateModel({ wireframe: e.target.checked });
      }
    });
  }

  // Display Options - Background Color
  var bgColorPicker = document.getElementById('bg-color-picker');
  if (bgColorPicker) {
    bgColorPicker.addEventListener('input', function (e) {
      if (window.updateModel) {
        window.updateModel({ backgroundColor: e.target.value });
      }
    });
  }

  // Scene - Reset View
  var resetViewBtn = document.getElementById('reset-view-btn');
  if (resetViewBtn) {
    resetViewBtn.addEventListener('click', function () {
      if (window.updateModel) {
        window.updateModel({ resetView: true });
      }
    });
  }

  // Scene - Lighting Intensity
  var lightSlider = document.getElementById('light-intensity');
  var lightValueSpan = document.getElementById('light-intensity-value');
  if (lightSlider) {
    lightSlider.addEventListener('input', function (e) {
      var val = e.target.value;
      lightValueSpan.textContent = val;
      if (window.updateModel) {
        window.updateModel({ lightingIntensity: parseInt(val) / 100 });
      }
    });
  }

  // ─── Auto-apply default mode on page load ───
  if (currentMode === 'reachability') {
    applyReachabilityView();
  }
  // preference mode waits for participant selection
});
