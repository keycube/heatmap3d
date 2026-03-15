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
    <div class="controls-section">
      <h3>Select Participant</h3>
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

    <div class="controls-section" id="participant-summary" style="display: none;">
      <h4>Participant Data Summary</h4>
      <p><strong>Handedness:</strong> <span id="summary-handedness"></span></p>
      <p><strong>Hand Circumference:</strong> <span id="summary-circumference"></span> mm</p>
      <p><strong>Hand Length:</strong> <span id="summary-length"></span> mm</p>
    </div>

    <div class="controls-section">
      <h3>Color Preferences Visualization</h3>
      <p><small>Click a color to visualize preference intensity. <strong>Lower keys = Higher preference</strong>. Key brightness also represents preference strength (1-10 scale).</small></p>
      <div class="button-group">
        <button class="color-btn" data-color="R" style="background: #ff6b6b; color: white;">Red Keys (R1-R16)</button>
        <button class="color-btn" data-color="B" style="background: #4dabf7; color: white;">Blue Keys (B1-B16)</button>
        <button class="color-btn" data-color="G" style="background: #51cf66; color: white;">Green Keys (G1-G16)</button>
        <button class="color-btn" data-color="W" style="background: #f8f9fa; color: black; border: 1px solid #ccc;">White Keys (W1-W16)</button>
        <button class="color-btn" data-color="Y" style="background: #ffd43b; color: black;">Yellow Keys (Y1-Y16)</button>
        <button class="reset-btn" style="background: #868e96; color: white;">Reset Colors</button>
      </div>
    </div>

    <div class="controls-section">
      <h3>Manual Controls</h3>
      <div class="measurement-controls">
        <div>
          <h4>Handedness</h4>
          <div class="button-group">
            <button class="handedness-btn" data-handedness="right">Right</button>
            <button class="handedness-btn" data-handedness="left">Left</button>
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
  
  let currentParticipant = null;

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
      // Remove active state from all handedness buttons
      handednessButtons.forEach(btn => btn.classList.remove('active'));
      // Add active state to clicked button
      button.classList.add('active');
      
      const handedness = button.getAttribute('data-handedness');
      if (window.updateModel) {
        window.updateModel({ handedness: handedness });
      }
    });
  });

  // Color buttons with data visualization
  const colorButtons = document.querySelectorAll('.color-btn');
  colorButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active state from all color buttons
      colorButtons.forEach(btn => btn.classList.remove('active'));
      // Add active state to clicked button
      button.classList.add('active');
      
      const color = button.getAttribute('data-color');
      const colorData = currentParticipant ? currentParticipant[color] : null;
      if (window.updateModel) {
        window.updateModel({ color: color, colorData: colorData });
      }
    });
  });

  // Reset button
  const resetBtn = document.querySelector('.reset-btn');
  resetBtn?.addEventListener('click', () => {
    // Remove active state from all buttons
    colorButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.handedness-btn').forEach(btn => btn.classList.remove('active'));
    
    if (window.updateModel) {
      window.updateModel({ reset: true });
    }
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

  // Make participant data available globally
  window.participantsData = participantsData;
});
</script>
