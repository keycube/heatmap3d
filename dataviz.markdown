---
layout: default
title: Data Visualization
---

<style>
.nav-link {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #28a745;
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
  background: #1e7e34;
  transform: translateY(-2px);
}
.controls-section { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff; }
.controls-section h4 { margin-top: 0; color: #007bff; }
button { padding: 8px 16px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; transition: all 0.3s; font-size: 14px; position: relative; }
button:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
button.active { box-shadow: inset 0 3px 8px rgba(0,0,0,0.3), 0 0 0 2px #ffd700; transform: scale(0.95); }
.handedness-btn { background: #6c757d; color: white; }
.handedness-btn:hover { background: #5a6268; }
.handedness-btn.active { background: #495057; }
.color-btn:hover { opacity: 0.8; }
.color-btn.active { opacity: 1; border: 3px solid #333; }
.reset-btn:hover { background: #6c757d; }
input[type="range"] { width: 150px; margin: 0 10px; }
select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; width: 100%; max-width: 400px; }
.main-container {
  display: flex;
  height: 100vh;
  width: 100%;
}
#controls {
  width: 350px;
  padding: 1em;
  background: #f5f5f5;
  border-radius: 8px;
  overflow-y: auto;
}
#model-container {
  flex-grow: 1;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  height: 100%;
}
.button-group { display: flex; gap: 10px; flex-wrap: wrap; }
.measurement-controls { display: flex; gap: 20px; flex-wrap: wrap; }
.measurement-item { flex: 1; min-width: 200px; }

/* Collapsible Sections */
.controls-section h3 {
  cursor: pointer;
  position: relative;
  padding-right: 25px;
}
.controls-section h3::after {
  content: '+';
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  font-weight: bold;
}
.controls-section.active h3::after {
  content: '−';
}
.section-content {
  display: none;
  padding-top: 10px;
}
.controls-section.active .section-content {
  display: block;
}

/* Toggle Switch for Wireframe */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}
.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #2196F3;
}
input:checked + .slider:before {
  transform: translateX(26px);
}

/* Background Color Picker */
.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
input[type="color"] {
  -webkit-appearance: none;
  width: 40px;
  height: 40px;
  border: none;
  cursor: pointer;
  padding: 0;
}
input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}
input[type="color"]::-webkit-color-swatch {
  border: 1px solid #ccc;
  border-radius: 50%;
}

/* Display option layout */
.display-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

/* Tooltips */
[data-tooltip] {
  position: relative;
}
[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
}

/* Improved Sliders */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* Scene controls */
.scene-btn {
  background: #007bff;
  color: white;
  width: 100%;
  margin-bottom: 10px;
}
.scene-btn:hover {
  background: #0056b3;
}

/* Visualization Mode Buttons */
.mode-btn {
  background: #343a40;
  color: white;
  flex: 1;
  min-width: 80px;
  font-size: 12px;
  padding: 10px 8px;
}
.mode-btn:hover {
  background: #495057;
}
.mode-btn.active {
  background: #007bff;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.3), 0 0 0 2px #66b3ff;
}

/* Study Info */
.study-info { font-size: 13px; line-height: 1.6; }
.study-info .stat { color: #007bff; font-weight: bold; }
.study-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin: 10px 0;
}
.study-stat-item {
  background: #e9ecef;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}
.study-stat-item strong { display: block; font-size: 16px; color: #007bff; }

/* Heatmap Legend */
.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  font-size: 12px;
}
.heatmap-gradient {
  flex: 1;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(to right, #ff0000, #ff8800, #ffff00, #88ff00, #00ff00);
}

/* Finger selector */
.finger-select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; }

/* Mode description */
#mode-description { margin: 10px 0 0; padding: 8px; background: #e8f4fd; border-radius: 4px; font-size: 12px; border-left: 3px solid #007bff; }

/* Aggregate info */
.aggregate-info { padding: 8px; background: #f0f7e8; border-radius: 4px; font-size: 12px; border-left: 3px solid #28a745; margin-top: 8px; }

/* Responsive Design */
@media (max-width: 768px) {
  .controls-section { padding: 10px; margin-bottom: 15px; }
  .button-group { justify-content: center; }
  button { padding: 10px 14px; margin: 3px; font-size: 12px; min-width: 80px; }
  .measurement-controls { flex-direction: column; gap: 10px; }
  .measurement-item { min-width: 100%; }
  input[type="range"] { width: 120px; }
  #model-container { height: 60vh !important; }
  .controls-section h3 { font-size: 16px; }
  .controls-section h4 { font-size: 14px; }
}

@media (max-width: 480px) {
  .controls-section { padding: 8px; }
  button { padding: 8px 12px; margin: 2px; font-size: 11px; min-width: 70px; }
  .button-group { gap: 5px; }
  input[type="range"] { width: 100px; margin: 0 5px; }
  #model-container { height: 50vh !important; }
  .controls-section h3 { font-size: 14px; }
  select { font-size: 14px; }
}

@media (min-width: 1200px) {
  .measurement-controls { gap: 30px; }
  .controls-section { padding: 20px; }
}
</style>

<a href="{{ site.baseurl }}/" class="nav-link">Home</a>

<div class="main-container">
  <div id="controls">
    <div class="controls-section active">
      <h3>Visualization Mode</h3>
      <div class="section-content" style="display: block;">
        <div class="button-group">
          <button class="mode-btn active" data-mode="preference" data-tooltip="View individual participant preferences">Preference</button>
          <button class="mode-btn" data-mode="aggregate" data-tooltip="View mean across all 22 participants">Aggregate</button>
          <button class="mode-btn" data-mode="reachability" data-tooltip="View finger reachability heatmap">Reachability</button>
        </div>
        <div id="mode-description">Select a participant then click a face color to view their finger-to-key preferences (lower key = higher preference).</div>
        <div id="reachability-options" style="display:none;">
          <label for="finger-select"><strong>Finger filter:</strong></label>
          <select class="finger-select" id="finger-select">
            <option value="total">All Fingers (Total)</option>
            <optgroup label="Left Hand">
              <option value="LT">Left Thumb</option>
              <option value="LI">Left Index</option>
              <option value="LM">Left Middle</option>
              <option value="LR">Left Ring</option>
              <option value="LL">Left Little</option>
            </optgroup>
            <optgroup label="Right Hand">
              <option value="RT">Right Thumb</option>
              <option value="RI">Right Index</option>
              <option value="RM">Right Middle</option>
              <option value="RR">Right Ring</option>
              <option value="RL">Right Little</option>
            </optgroup>
          </select>
          <div class="heatmap-legend">
            <span>Low</span>
            <div class="heatmap-gradient"></div>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>

    <div class="controls-section active">
      <h3>Select Participant</h3>
      <div class="section-content" style="display: block;">
        <select id="participant-select">
          <option value="">Choose a participant...</option>
          {% for row in site.data.preferences %}
            <option value="{{ forloop.index0 }}" data-handedness="{{ row.Handedness }}" 
                    data-circumference="{{ row.CircumferenceRightHand }}" 
                    data-length="{{ row.LengthRightHand }}">
              Participant {{ row.Number }} ({{ row.Handedness | capitalize }}, {{ row.CircumferenceRightHand }}mm circumference)
            </option>
          {% endfor %}
        </select>
        <p><small>Select a participant to automatically load their hand measurements and preference data.</small></p>
      </div>
    </div>

    <div class="controls-section" id="participant-summary" style="display: none;">
      <h4>Participant Data Summary</h4>
      <p><strong>Handedness:</strong> <span id="summary-handedness"></span></p>
      <p><strong>Hand Circumference:</strong> <span id="summary-circumference"></span> mm</p>
      <p><strong>Hand Length:</strong> <span id="summary-length"></span> mm</p>
    </div>

    <div class="controls-section">
      <h3>Color Preferences Visualization</h3>
      <div class="section-content">
        <p><small>Click a color to visualize preference intensity. <strong>Lower keys = Higher preference</strong>. Key brightness also represents preference strength (1-10 scale).</small></p>
        <div class="button-group">
          <button class="color-btn" data-color="R" data-tooltip="Show red face preference data" style="background: #ff6b6b; color: white;">Red Keys (R1-R16)</button>
          <button class="color-btn" data-color="B" data-tooltip="Show blue face preference data" style="background: #4dabf7; color: white;">Blue Keys (B1-B16)</button>
          <button class="color-btn" data-color="G" data-tooltip="Show green face preference data" style="background: #51cf66; color: white;">Green Keys (G1-G16)</button>
          <button class="color-btn" data-color="W" data-tooltip="Show white face preference data" style="background: #f8f9fa; color: black; border: 1px solid #ccc;">White Keys (W1-W16)</button>
          <button class="color-btn" data-color="Y" data-tooltip="Show yellow face preference data" style="background: #ffd43b; color: black;">Yellow Keys (Y1-Y16)</button>
          <button class="reset-btn" data-tooltip="Reset all keys to original colors" style="background: #868e96; color: white;">Reset Colors</button>
        </div>
      </div>
    </div>

    <div class="controls-section">
      <h3>Manual Controls</h3>
      <div class="section-content">
        <div class="measurement-controls">
          <div>
            <h4>Handedness</h4>
            <div class="button-group">
              <button class="handedness-btn" data-tooltip="Mirror cube for right hand" data-handedness="right">Right</button>
              <button class="handedness-btn" data-tooltip="Mirror cube for left hand" data-handedness="left">Left</button>
            </div>
          </div>
          
          <div>
            <h4>Hand Measurements</h4>
            <div class="measurement-item">
              <label for="circumference">Circumference: </label>
              <input type="range" id="circumference" min="170" max="230" value="200">
              <span id="circumference-value">200</span>mm
            </div>
            <div class="measurement-item">
              <label for="length">Length: </label>
              <input type="range" id="length" min="160" max="210" value="185">
              <span id="length-value">185</span>mm
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="controls-section">
        <h3>Display Options</h3>
        <div class="section-content">
            <div class="display-option">
                <label for="wireframe-toggle">Wireframe</label>
                <label class="switch">
                    <input type="checkbox" id="wireframe-toggle">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="display-option">
                <label for="bg-color-picker">Background</label>
                <input type="color" id="bg-color-picker" value="#000000">
            </div>
        </div>
    </div>

    <div class="controls-section">
      <h3>Study Info</h3>
      <div class="section-content">
        <div class="study-info">
          <div class="study-stat-grid">
            <div class="study-stat-item"><strong>31</strong>Participants (Study 1)</div>
            <div class="study-stat-item"><strong>22</strong>Participants (Study 2)</div>
            <div class="study-stat-item"><strong>77.4%</strong>Preferred Diagonal</div>
            <div class="study-stat-item"><strong>80</strong>Keys (5 faces)</div>
          </div>
          <p><strong>Study 1:</strong> Identified preferred holding positions. <span class="stat">Diagonal position</span> chosen by 77.4% of participants (both hands, forearms bent, touchscreen down).</p>
          <p><strong>Study 2:</strong> Mapped finger-to-key preferences and reachability in diagonal position. Thumbs cover the widest area (red + internal faces).</p>
          <p><strong>Face orientation:</strong> Red (top), Blue &amp; Yellow (external), White &amp; Green (internal, facing body).</p>
        </div>
      </div>
    </div>

    <div class="controls-section">
        <h3>Scene &amp; View</h3>
        <div class="section-content">
            <button class="scene-btn" id="reset-view-btn" data-tooltip="Reset camera to default position">Reset View</button>
            <div class="display-option">
                <label for="light-intensity">Lighting</label>
                <input type="range" id="light-intensity" min="0" max="200" value="80">
                <span id="light-intensity-value">80</span>%
            </div>
        </div>
    </div>
  </div>
  <div id="model-container"></div>
</div>

<script>
document.addEventListener('DOMContentLoaded', (event) => {
  // Données CSV intégrées (généré par Jekyll)
  const participantsData = [
    {% for row in site.data.preferences %}
    {
      number: {{ row.Number }},
      handedness: "{{ row.Handedness }}",
      circumference: {{ row.CircumferenceRightHand }},
      length: {{ row.LengthRightHand }},
      R: [{{ row.R1 }},{{ row.R2 }},{{ row.R3 }},{{ row.R4 }},{{ row.R5 }},{{ row.R6 }},{{ row.R7 }},{{ row.R8 }},{{ row.R9 }},{{ row.R10 }},{{ row.R11 }},{{ row.R12 }},{{ row.R13 }},{{ row.R14 }},{{ row.R15 }},{{ row.R16 }}],
      B: [{{ row.B1 }},{{ row.B2 }},{{ row.B3 }},{{ row.B4 }},{{ row.B5 }},{{ row.B6 }},{{ row.B7 }},{{ row.B8 }},{{ row.B9 }},{{ row.B10 }},{{ row.B11 }},{{ row.B12 }},{{ row.B13 }},{{ row.B14 }},{{ row.B15 }},{{ row.B16 }}],
      G: [{{ row.G1 }},{{ row.G2 }},{{ row.G3 }},{{ row.G4 }},{{ row.G5 }},{{ row.G6 }},{{ row.G7 }},{{ row.G8 }},{{ row.G9 }},{{ row.G10 }},{{ row.G11 }},{{ row.G12 }},{{ row.G13 }},{{ row.G14 }},{{ row.G15 }},{{ row.G16 }}],
      W: [{{ row.W1 }},{{ row.W2 }},{{ row.W3 }},{{ row.W4 }},{{ row.W5 }},{{ row.W6 }},{{ row.W7 }},{{ row.W8 }},{{ row.W9 }},{{ row.W10 }},{{ row.W11 }},{{ row.W12 }},{{ row.W13 }},{{ row.W14 }},{{ row.W15 }},{{ row.W16 }}],
      Y: [{{ row.Y1 }},{{ row.Y2 }},{{ row.Y3 }},{{ row.Y4 }},{{ row.Y5 }},{{ row.Y6 }},{{ row.Y7 }},{{ row.Y8 }},{{ row.Y9 }},{{ row.Y10 }},{{ row.Y11 }},{{ row.Y12 }},{{ row.Y13 }},{{ row.Y14 }},{{ row.Y15 }},{{ row.Y16 }}]
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];

  // Reachability data (total per key, summed across all fingers per participant)
  {% assign fingers = "LT,LI,LM,LR,LL,RT,RI,RM,RR,RL" | split: "," %}
  {% assign faceNames = "R,B,G,W,Y" | split: "," %}
  const reachabilityData = [
    {% for row in site.data.reachability %}
    {
      number: {{ row.Number }},
      {% for face in faceNames %}
      {{ face }}: [{% for k in (1..16) %}{% assign total = 0 %}{% for f in fingers %}{% capture col %}{{ f }}-{{ face }}{{ k }}{% endcapture %}{% assign val = row[col] | plus: 0 %}{% assign total = total | plus: val %}{% endfor %}{{ total }}{% unless forloop.last %},{% endunless %}{% endfor %}]{% unless forloop.last %},{% endunless %}
      {% endfor %}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];

  // Per-finger reachability data
  const perFingerReachability = {};
  {% for f in fingers %}
  perFingerReachability['{{ f }}'] = [
    {% for row in site.data.reachability %}
    {
      {% for face in faceNames %}
      {{ face }}: [{% for k in (1..16) %}{% capture col %}{{ f }}-{{ face }}{{ k }}{% endcapture %}{{ row[col] | plus: 0 }}{% unless forloop.last %},{% endunless %}{% endfor %}]{% unless forloop.last %},{% endunless %}
      {% endfor %}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];
  {% endfor %}
  
  let currentParticipant = null;
  let currentMode = 'preference'; // 'preference', 'aggregate', 'reachability'

  // Compute aggregate mean preference across all participants
  const aggregatePreference = { R: [], B: [], G: [], W: [], Y: [] };
  ['R','B','G','W','Y'].forEach(face => {
    for (let i = 0; i < 16; i++) {
      let sum = 0;
      participantsData.forEach(p => { sum += p[face][i]; });
      aggregatePreference[face].push(+(sum / participantsData.length).toFixed(2));
    }
  });

  // Compute aggregate reachability (total across all participants, all fingers)
  const aggregateReachability = { R: [], B: [], G: [], W: [], Y: [] };
  ['R','B','G','W','Y'].forEach(face => {
    for (let i = 0; i < 16; i++) {
      let sum = 0;
      reachabilityData.forEach(p => { sum += p[face][i]; });
      aggregateReachability[face].push(sum);
    }
  });

  // Compute per-finger aggregate reachability
  function getFingerReachability(finger) {
    const result = { R: [], B: [], G: [], W: [], Y: [] };
    const fingerData = perFingerReachability[finger];
    if (!fingerData) return result;
    ['R','B','G','W','Y'].forEach(face => {
      for (let i = 0; i < 16; i++) {
        let sum = 0;
        fingerData.forEach(p => { sum += p[face][i]; });
        result[face].push(sum);
      }
    });
    return result;
  }

  // Find min/max across all faces of a dataset
  function getRange(data) {
    let min = Infinity, max = -Infinity;
    ['R','B','G','W','Y'].forEach(face => {
      data[face].forEach(v => {
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });
    return { min, max };
  }

  // Mode descriptions
  const modeDescriptions = {
    preference: 'Select a participant then click a face color to view their finger-to-key preferences (lower key = higher preference).',
    aggregate: 'Shows the mean preference values averaged across all 22 participants. Click a face to highlight it, or view all faces at once.',
    reachability: 'Heatmap of finger-to-key reachability scores. Green = easily reachable, Red = unreachable. Filter by specific finger below.'
  };

  // Mode switching
  const modeButtons = document.querySelectorAll('.mode-btn');
  const modeDescription = document.getElementById('mode-description');
  const reachabilityOptions = document.getElementById('reachability-options');

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-mode');
      modeDescription.textContent = modeDescriptions[currentMode];
      reachabilityOptions.style.display = currentMode === 'reachability' ? 'block' : 'none';

      // Reset model when switching modes
      if (window.updateModel) window.updateModel({ reset: true });
      colorButtons.forEach(b => b.classList.remove('active'));

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
      const range = getRange(aggregatePreference);
      window.updateModel({ heatmap: aggregatePreference, heatmapMin: range.min, heatmapMax: range.max });
    }
  }

  // Apply reachability heatmap
  function applyReachabilityView() {
    if (!window.updateModel) return;
    const finger = document.getElementById('finger-select').value;
    let data;
    if (finger === 'total') {
      data = aggregateReachability;
    } else {
      data = getFingerReachability(finger);
    }
    const range = getRange(data);
    window.updateModel({ heatmap: data, heatmapMin: range.min, heatmapMax: range.max });
  }

  // Finger filter for reachability
  document.getElementById('finger-select')?.addEventListener('change', () => {
    if (currentMode === 'reachability') applyReachabilityView();
  });

  // Participant selector
  const participantSelect = document.getElementById('participant-select');
  participantSelect?.addEventListener('change', (e) => {
    const index = e.target.value;
    if (index !== '') {
      currentParticipant = participantsData[index];
      applyParticipantData(currentParticipant);
      updateUIControls(currentParticipant);
    }
  });

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
    document.getElementById('circumference').value = participant.circumference;
    document.getElementById('circumference-value').textContent = participant.circumference;
    document.getElementById('length').value = participant.length;
    document.getElementById('length-value').textContent = participant.length;

    // Update summary
    const summaryPanel = document.getElementById('participant-summary');
    summaryPanel.style.display = 'block';
    document.getElementById('summary-handedness').textContent = participant.handedness;
    document.getElementById('summary-circumference').textContent = participant.circumference;
    document.getElementById('summary-length').textContent = participant.length;
  }

  // Handedness buttons
  const handednessButtons = document.querySelectorAll('.handedness-btn');
  handednessButtons.forEach(button => {
    button.addEventListener('click', () => {
      handednessButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const handedness = button.getAttribute('data-handedness');
      if (window.updateModel) {
        window.updateModel({ handedness: handedness });
      }
    });
  });

  // Color buttons - behavior depends on mode
  const colorButtons = document.querySelectorAll('.color-btn');
  colorButtons.forEach(button => {
    button.addEventListener('click', () => {
      colorButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const color = button.getAttribute('data-color');

      if (currentMode === 'aggregate') {
        applyAggregateView(color);
      } else if (currentMode === 'preference') {
        const colorData = currentParticipant ? currentParticipant[color] : null;
        if (window.updateModel) {
          window.updateModel({ color: color, colorData: colorData });
        }
      }
      // In reachability mode, color buttons don't apply (heatmap shows all faces)
    });
  });

  // Reset button
  const resetBtn = document.querySelector('.reset-btn');
  resetBtn?.addEventListener('click', () => {
    colorButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.handedness-btn').forEach(btn => btn.classList.remove('active'));
    if (window.updateModel) {
      window.updateModel({ reset: true });
    }
    // Re-apply mode view
    if (currentMode === 'aggregate') applyAggregateView();
    else if (currentMode === 'reachability') applyReachabilityView();
  });

  // Sliders
  const circumferenceSlider = document.getElementById('circumference');
  const circumferenceValue = document.getElementById('circumference-value');
  circumferenceSlider?.addEventListener('input', (e) => {
    const value = e.target.value;
    circumferenceValue.textContent = value;
    if (window.updateModel) {
      window.updateModel({ circumference: parseInt(value) });
    }
  });

  const lengthSlider = document.getElementById('length');
  const lengthValue = document.getElementById('length-value');
  lengthSlider?.addEventListener('input', (e) => {
    const value = e.target.value;
    lengthValue.textContent = value;
    if (window.updateModel) {
      window.updateModel({ length: parseInt(value) });
    }
  });

  // Make data available globally
  window.participantsData = participantsData;
  window.reachabilityData = reachabilityData;
  window.aggregatePreference = aggregatePreference;
  window.aggregateReachability = aggregateReachability;

  // Collapsible sections
  document.querySelectorAll('.controls-section h3').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('.controls-section');
      section.classList.toggle('active');
    });
  });

  // Display Options - Wireframe
  document.getElementById('wireframe-toggle')?.addEventListener('change', (e) => {
    if (window.updateModel) {
      window.updateModel({ wireframe: e.target.checked });
    }
  });

  // Display Options - Background Color
  document.getElementById('bg-color-picker')?.addEventListener('input', (e) => {
    if (window.updateModel) {
      window.updateModel({ backgroundColor: e.target.value });
    }
  });

  // Scene & View - Reset View
  document.getElementById('reset-view-btn')?.addEventListener('click', () => {
    if (window.updateModel) {
      window.updateModel({ resetView: true });
    }
  });

  // Scene & View - Lighting Intensity
  const lightSlider = document.getElementById('light-intensity');
  const lightValue = document.getElementById('light-intensity-value');
  lightSlider?.addEventListener('input', (e) => {
    const val = e.target.value;
    lightValue.textContent = val;
    if (window.updateModel) {
      window.updateModel({ lightingIntensity: parseInt(val) / 100 });
    }
  });
});
</script>
<script type="module" src="{{ site.baseurl }}/_includes/model-viewer.js"></script>
