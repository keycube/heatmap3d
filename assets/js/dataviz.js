document.addEventListener('DOMContentLoaded', function () {
  var participantsData = window.participantsData;
  var reachabilityData = window.reachabilityData;
  var perFingerReachability = window.perFingerReachability;

  var defaultModeMeta = document.querySelector('meta[name="default-mode"]');
  var currentMode = defaultModeMeta ? defaultModeMeta.getAttribute('content') : 'preference';
  var currentParticipant = null;
  var currentFace = null;
  var FACES = ['R','B','G','W','Y'];

  // ─── Utility: compute aggregate data ───
  function computeAggregate(dataArray) {
    var result = {};
    FACES.forEach(function (face) {
      result[face] = [];
      for (var i = 0; i < 16; i++) {
        var sum = 0;
        dataArray.forEach(function (p) { sum += p[face][i]; });
        result[face].push(sum);
      }
    });
    return result;
  }

  function computeAggregateMean(dataArray) {
    var result = computeAggregate(dataArray);
    var count = dataArray.length;
    FACES.forEach(function (face) {
      result[face] = result[face].map(function (v) { return +(v / count).toFixed(2); });
    });
    return result;
  }

  var aggregatePreference = computeAggregateMean(participantsData);
  var aggregateReachability = computeAggregate(reachabilityData);

  // ─── Per-finger aggregate reachability ───
  function getFingerReachability(finger) {
    var fingerData = perFingerReachability[finger];
    return fingerData ? computeAggregate(fingerData) : { R: [], B: [], G: [], W: [], Y: [] };
  }

  // ─── Range utility ───
  function getRange(data) {
    var min = Infinity, max = -Infinity;
    FACES.forEach(function (face) {
      data[face].forEach(function (v) {
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });
    return { min: min, max: max };
  }

  // ═══════════════════════════════════════════════════════
  //  PREFERENCE MODE
  // ═══════════════════════════════════════════════════════

  function getPreferenceData() {
    if (currentParticipant === 'aggregate') return aggregatePreference;
    if (currentParticipant && typeof currentParticipant === 'object') return currentParticipant;
    return null;
  }

  function applyPreferenceView() {
    if (!window.updateModel) return;
    var data = getPreferenceData();
    if (!data) {
      window.updateModel({ reset: true, hideScores: true });
      return;
    }

    var scores = { R: data.R, B: data.B, G: data.G, W: data.W, Y: data.Y };
    var opts = { heatmapMin: 1, heatmapMax: 10, heatmapInvert: true, scores: scores, showScores: true };

    if (currentFace) {
      var singleFace = {};
      singleFace[currentFace] = data[currentFace];
      opts.heatmapSingleFace = singleFace;
    } else {
      opts.heatmap = scores;
    }
    window.updateModel(opts);
  }

  function updateSelectionBadge(icon, text) {
    var selectionIcon = document.getElementById('selection-icon');
    var selectionText = document.getElementById('selection-text');
    if (selectionIcon) selectionIcon.textContent = icon;
    if (selectionText) selectionText.textContent = text;
  }

  // ─── Participant selector ───
  var participantSelect = document.getElementById('participant-select');
  var colorButtons = document.querySelectorAll('.color-btn');
  
  if (participantSelect) {
    participantSelect.addEventListener('change', function (e) {
      var val = e.target.value;
      currentFace = null;
      colorButtons.forEach(function (b) { b.classList.remove('active'); });
      var summaryPanel = document.getElementById('participant-summary');

      if (val === 'aggregate') {
        currentParticipant = 'aggregate';
        if (summaryPanel) summaryPanel.style.display = 'none';
        updateSelectionBadge('📊', 'Aggregate (Mean of 22 participants)');
        if (window.updateModel) window.updateModel({ reset: true, hideScores: true });
        applyPreferenceView();
      } else if (val !== '') {
        currentParticipant = participantsData[parseInt(val)];
        if (window.updateModel) {
          window.updateModel({ reset: true, handedness: currentParticipant.handedness });
        }
        if (summaryPanel) {
          summaryPanel.style.display = 'block';
          ['handedness', 'circumferenceRight', 'lengthRight', 'spanRight'].forEach(function (key, i) {
            var ids = ['summary-handedness', 'summary-circumference', 'summary-length', 'summary-span'];
            var el = document.getElementById(ids[i]);
            if (el) el.textContent = currentParticipant[key];
          });
        }
        updateSelectionBadge('👤', 'Participant ' + currentParticipant.number + ' (' + currentParticipant.handedness + ')');
        applyPreferenceView();
      } else {
        currentParticipant = null;
        if (summaryPanel) summaryPanel.style.display = 'none';
        updateSelectionBadge('🎯', 'No participant selected');
        if (window.updateModel) window.updateModel({ reset: true, hideScores: true });
      }
    });
  }

  // ─── Face color buttons ───
  colorButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (currentMode !== 'preference' || !currentParticipant) return;
      colorButtons.forEach(function (b) { b.classList.remove('active'); });
      button.classList.add('active');
      currentFace = button.getAttribute('data-color');
      applyPreferenceView();
    });
  });

  // ─── Reset / Show All button ───
  var resetBtn = document.querySelector('.reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      colorButtons.forEach(function (b) { b.classList.remove('active'); });
      currentFace = null;
      if (currentMode === 'preference') applyPreferenceView();
      else if (currentMode === 'reachability') applyReachabilityView();
    });
  }

  // ═══════════════════════════════════════════════════════
  //  REACHABILITY MODE
  // ═══════════════════════════════════════════════════════

  function applyReachabilityView() {
    if (!window.updateModel) return;
    var fingerEl = document.getElementById('finger-select');
    if (!fingerEl) return;
    var data = fingerEl.value === 'total' ? aggregateReachability : getFingerReachability(fingerEl.value);
    var range = getRange(data);
    window.updateModel({ 
      heatmap: data, 
      heatmapMin: range.min, 
      heatmapMax: range.max,
      scores: data,
      showScores: true,
      isReachability: true
    });
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

  // Make data available globally
  window.aggregatePreference = aggregatePreference;
  window.aggregateReachability = aggregateReachability;

  // Collapsible sections
  document.querySelectorAll('.controls-section h3').forEach(function (header) {
    header.addEventListener('click', function () {
      header.closest('.controls-section').classList.toggle('active');
    });
  });

  // Helper for simple control bindings
  function bindControl(id, event, handler) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  }

  bindControl('wireframe-toggle', 'change', function (e) {
    if (window.updateModel) window.updateModel({ wireframe: e.target.checked });
  });

  bindControl('bg-color-picker', 'input', function (e) {
    if (window.updateModel) window.updateModel({ backgroundColor: e.target.value });
  });

  bindControl('reset-view-btn', 'click', function () {
    if (window.updateModel) window.updateModel({ resetView: true });
  });

  var lightValueSpan = document.getElementById('light-intensity-value');
  bindControl('light-intensity', 'input', function (e) {
    if (lightValueSpan) lightValueSpan.textContent = e.target.value;
    if (window.updateModel) window.updateModel({ lightingIntensity: parseInt(e.target.value) / 100 });
  });

  // Auto-apply default mode on page load
  if (currentMode === 'reachability') applyReachabilityView();
});
