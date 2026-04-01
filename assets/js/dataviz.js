document.addEventListener('DOMContentLoaded', function () {
  var participantsData = window.participantsData;
  var reachabilityData = window.reachabilityData;
  var perFingerReachability = window.perFingerReachability;

  // Read the default mode from the page's meta tag
  // This allows each page (preference.html, aggregate.html, reachability.html) to specify its mode
  var defaultModeMeta = document.querySelector('meta[name="default-mode"]');
  var currentMode = defaultModeMeta ? defaultModeMeta.getAttribute('content') : 'preference';

  var currentParticipant = null;

  // Compute aggregate mean preference across all participants
  var aggregatePreference = { R: [], B: [], G: [], W: [], Y: [] };
  ['R','B','G','W','Y'].forEach(function (face) {
    for (var i = 0; i < 16; i++) {
      var sum = 0;
      participantsData.forEach(function (p) { sum += p[face][i]; });
      aggregatePreference[face].push(+(sum / participantsData.length).toFixed(2));
    }
  });

  // Compute aggregate reachability (total across all participants, all fingers)
  var aggregateReachability = { R: [], B: [], G: [], W: [], Y: [] };
  ['R','B','G','W','Y'].forEach(function (face) {
    for (var i = 0; i < 16; i++) {
      var sum = 0;
      reachabilityData.forEach(function (p) { sum += p[face][i]; });
      aggregateReachability[face].push(sum);
    }
  });

  // Compute per-finger aggregate reachability
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

  // Find min/max across all faces of a dataset
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

  // Mode descriptions
  var modeDescriptions = {
    preference: 'Select a participant then click a face color to view their finger-to-key preferences (lower key = higher preference).',
    aggregate: 'Shows the mean preference values averaged across all 22 participants. Click a face to highlight it, or view all faces at once.',
    reachability: 'Heatmap of finger-to-key reachability scores. Green = easily reachable, Red = unreachable. Filter by specific finger below.'
  };

  // Mode switching
  var modeButtons = document.querySelectorAll('.mode-btn');
  var modeDescription = document.getElementById('mode-description');
  var reachabilityOptions = document.getElementById('reachability-options');

  modeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      modeButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-mode');
      modeDescription.textContent = modeDescriptions[currentMode];
      reachabilityOptions.style.display = currentMode === 'reachability' ? 'block' : 'none';

      // Reset model when switching modes
      if (window.updateModel) window.updateModel({ reset: true });
      colorButtons.forEach(function (b) { b.classList.remove('active'); });

      // Auto-apply for aggregate and reachability
      if (currentMode === 'aggregate') {
        applyAggregateView();
      } else if (currentMode === 'reachability') {
        applyReachabilityView();
      }
    });
  });

  // Apply aggregate heatmap
  function applyAggregateView(face) {
    if (!window.updateModel) return;
    if (face) {
      // Show single face with aggregate data
      window.updateModel({ color: face, colorData: aggregatePreference[face] });
    } else {
      // Show all faces as heatmap
      var range = getRange(aggregatePreference);
      window.updateModel({ heatmap: aggregatePreference, heatmapMin: range.min, heatmapMax: range.max });
    }
  }

  // Apply reachability heatmap
  function applyReachabilityView() {
    if (!window.updateModel) return;
    var finger = document.getElementById('finger-select').value;
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

  // Participant selector
  var participantSelect = document.getElementById('participant-select');
  if (participantSelect) {
    participantSelect.addEventListener('change', function (e) {
      var index = e.target.value;
      if (index !== '') {
        currentParticipant = participantsData[index];
        applyParticipantData(currentParticipant);
        updateUIControls(currentParticipant);
      }
    });
  }

  function applyParticipantData(participant) {
    if (window.updateModel) {
      window.updateModel({
        handedness: participant.handedness,
        circumference: participant.circumference,
        length: participant.length,
        participantData: participant
      });
    }
  }

  function updateUIControls(participant) {
    var circumferenceEl = document.getElementById('circumference');
    var circumferenceValueEl = document.getElementById('circumference-value');
    var lengthEl = document.getElementById('length');
    var lengthValueEl = document.getElementById('length-value');

    if (circumferenceEl) circumferenceEl.value = participant.circumference;
    if (circumferenceValueEl) circumferenceValueEl.textContent = participant.circumference;
    if (lengthEl) lengthEl.value = participant.length;
    if (lengthValueEl) lengthValueEl.textContent = participant.length;

    // Update summary
    var summaryPanel = document.getElementById('participant-summary');
    if (summaryPanel) {
      summaryPanel.style.display = 'block';
      document.getElementById('summary-handedness').textContent = participant.handedness;
      document.getElementById('summary-circumference').textContent = participant.circumference;
      document.getElementById('summary-length').textContent = participant.length;
    }
  }

  // Handedness buttons
  var handednessButtons = document.querySelectorAll('.handedness-btn');
  handednessButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      handednessButtons.forEach(function (btn) { btn.classList.remove('active'); });
      button.classList.add('active');
      var handedness = button.getAttribute('data-handedness');
      if (window.updateModel) {
        window.updateModel({ handedness: handedness });
      }
    });
  });

  // Color buttons - behavior depends on mode
  var colorButtons = document.querySelectorAll('.color-btn');
  colorButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      colorButtons.forEach(function (btn) { btn.classList.remove('active'); });
      button.classList.add('active');
      var color = button.getAttribute('data-color');

      if (currentMode === 'aggregate') {
        applyAggregateView(color);
      } else if (currentMode === 'preference') {
        var colorData = currentParticipant ? currentParticipant[color] : null;
        if (window.updateModel) {
          window.updateModel({ color: color, colorData: colorData });
        }
      }
      // In reachability mode, color buttons don't apply (heatmap shows all faces)
    });
  });

  // Reset button
  var resetBtn = document.querySelector('.reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      colorButtons.forEach(function (btn) { btn.classList.remove('active'); });
      document.querySelectorAll('.handedness-btn').forEach(function (btn) { btn.classList.remove('active'); });
      if (window.updateModel) {
        window.updateModel({ reset: true });
      }
      // Re-apply mode view
      if (currentMode === 'aggregate') applyAggregateView();
      else if (currentMode === 'reachability') applyReachabilityView();
    });
  }

  // Sliders
  var circumferenceSlider = document.getElementById('circumference');
  var circumferenceValue = document.getElementById('circumference-value');
  if (circumferenceSlider) {
    circumferenceSlider.addEventListener('input', function (e) {
      var value = e.target.value;
      circumferenceValue.textContent = value;
      if (window.updateModel) {
        window.updateModel({ circumference: parseInt(value) });
      }
    });
  }

  var lengthSlider = document.getElementById('length');
  var lengthValue = document.getElementById('length-value');
  if (lengthSlider) {
    lengthSlider.addEventListener('input', function (e) {
      var value = e.target.value;
      lengthValue.textContent = value;
      if (window.updateModel) {
        window.updateModel({ length: parseInt(value) });
      }
    });
  }

  // Make data available globally
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

  // Scene & View - Reset View
  var resetViewBtn = document.getElementById('reset-view-btn');
  if (resetViewBtn) {
    resetViewBtn.addEventListener('click', function () {
      if (window.updateModel) {
        window.updateModel({ resetView: true });
      }
    });
  }

  // Scene & View - Lighting Intensity
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
  // Each page sets its own default_mode via a <meta> tag.
  // On load, we automatically activate the correct visualization.
  if (currentMode === 'aggregate') {
    applyAggregateView();
  } else if (currentMode === 'reachability') {
    applyReachabilityView();
  }
  // 'preference' mode waits for participant selection, no auto-apply needed.
});
