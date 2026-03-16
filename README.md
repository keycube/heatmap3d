# Keycube Heatmap — Project Report

**Project:** 3D Interactive Visualization of Keycube User Study Data  
**Repository:** [keycube/heatmap3d](https://github.com/keycube/heatmap3d)  
**Technology Stack:** Jekyll (Ruby) · Three.js (WebGL) · GitHub Pages  
**Date:** March 2026

---

## 1. Project Overview

This project is a web-based interactive 3D data visualization tool built to explore and present user study data collected from the **Keycube** — a cubic text-entry device with 80 touch-sensitive keys distributed across 5 faces. The application renders a 3D model of the Keycube using Three.js and allows users to interactively visualize preference and reachability data gathered from two formal user studies.

The application is deployed as a static website via **GitHub Pages**, using **Jekyll** for data processing (CSV → JavaScript) and **Three.js** for real-time 3D rendering.

---

## 2. Research Context

### 2.1 Study 1 — Holding Positions (31 participants)

The first study investigated how users naturally hold the Keycube. Participants were asked to choose their preferred holding position from several options. Key findings:

- **31 participants** participated
- **77.4% preferred the diagonal position** — holding the cube with both hands, forearms slightly bent, with the touchscreen facing downward
- This result established the **canonical holding posture** used as the basis for Study 2

### 2.2 Study 2 — Finger-to-Key Preferences & Reachability (22 participants)

The second study mapped which fingers users prefer to reach each of the 80 keys, and how easily each key can be reached, using the diagonal holding position identified in Study 1. Key details:

- **22 participants** (19 right-handed, 3 left-handed)
- **Hand measurements** recorded: circumference (172–230 mm) and length (162–206 mm)
- Each participant rated **preference** for each key on each face (scale 1–10)
- Each participant rated **reachability** per finger per key (0 = unreachable, 1 = reachable with effort, 2 = easily reachable)
- **10 fingers** analyzed: Left Thumb (LT), Left Index (LI), Left Middle (LM), Left Ring (LR), Left Little (LL), Right Thumb (RT), Right Index (RI), Right Middle (RM), Right Ring (RR), Right Little (RL)

### 2.3 Keycube Face Layout

| Face Color | Code | Position        |
|-----------|------|-----------------|
| Red       | R    | Top (x+)        |
| Blue      | B    | External (x-)   |
| Green     | G    | Internal (z+)   |
| White     | W    | Internal (y-)   |
| Yellow    | Y    | External (y+)   |

Each face contains **16 keys** in a 4×4 grid (e.g., R1–R16, B1–B16, etc.), totaling **80 keys**.

---

## 3. Architecture & Technical Implementation

### 3.1 Technology Stack

| Component        | Technology           | Purpose                                      |
|-----------------|---------------------|----------------------------------------------|
| Static Site     | Jekyll + GitHub Pages | Hosting, Liquid templating, CSV data processing |
| 3D Rendering    | Three.js (ES module) | WebGL-based interactive 3D keycube model      |
| Data Format     | CSV (`_data/`)       | User study data storage                       |
| Styling         | Custom CSS           | Responsive layout, controls, heatmap legend   |
| Version Control | Git + GitHub         | Source management and deployment               |

### 3.2 Project Structure

```
├── index.markdown          # Landing page with auto-redirect
├── dataviz.markdown        # Main visualization page (controls + 3D model)
├── _includes/
│   └── model-viewer.js     # Three.js 3D scene and rendering logic
├── _data/
│   ├── preferences.csv     # Study 2: participant preference data (22 rows × 80+ columns)
│   └── reachability.csv    # Study 2: per-finger reachability data (22 rows × 800+ columns)
├── _layouts/
│   └── default.html        # Base HTML layout
├── assets/
│   └── css/main.css        # Homepage styles
├── _config.yml             # Jekyll configuration
└── REPORT.md               # This report
```

### 3.3 Data Pipeline

1. **CSV files** are placed in `_data/` and automatically parsed by Jekyll
2. **Liquid templates** in `dataviz.markdown` iterate over CSV rows and generate JavaScript arrays at build time
3. Preference data becomes `participantsData[]` — an array of 22 objects with per-face key arrays
4. Reachability data goes through nested Liquid loops to compute:
   - `reachabilityData[]` — total reachability per key (sum across all 10 fingers)
   - `perFingerReachability{}` — individual finger reachability arrays
5. **Aggregate computations** are performed in JavaScript: mean preference and total reachability across all participants

### 3.4 3D Model Implementation (`model-viewer.js`)

The 3D scene is built with Three.js and consists of:

- **Scene:** Black background, perspective camera at position (2, 2, 4)
- **Cube body:** RoundedBoxGeometry (1×1×1) with a tan material
- **80 keys:** BoxGeometry (0.15³ each), positioned in 4×4 grids on 5 faces with correct axis offsets
- **80 text labels:** Canvas-based sprites floating above each key, displaying the key ID (e.g., "R1", "B12", "G5"), always facing the camera for readability
- **Lighting:** Ambient light (0.6) + directional light (adjustable intensity)
- **Controls:** OrbitControls for rotation and zoom

The `window.updateModel(data)` function accepts a data object and supports:

| Parameter       | Effect                                                |
|----------------|-------------------------------------------------------|
| `handedness`   | Mirrors the cube (scale.x = -1 for left hand)         |
| `reset`        | Restores all keys to original colors and scales        |
| `color + colorData` | Preference visualization: brightens keys + adjusts height |
| `heatmap`      | HSL heatmap: red (0) → yellow (0.5) → green (1)       |
| `wireframe`    | Toggles wireframe rendering                            |
| `backgroundColor` | Changes scene background color                      |
| `resetView`    | Resets camera to initial position                      |
| `lightingIntensity` | Adjusts directional light intensity              |
| `circumference / length` | Scales the cube based on hand measurements  |

---

## 4. Visualization Modes

The application offers **three visualization modes**, selectable via buttons in the control panel:

### 4.1 Preference Mode (Default)

- Select a participant from a dropdown (22 participants available)
- Click a face color button (Red, Blue, Green, White, Yellow) to visualize that participant's preference data
- **Visual encoding:** Key brightness represents preference intensity (1–10 scale); key height is inversely proportional to preference (lower key = higher preference)
- Participant hand measurements (circumference, length) are loaded automatically and scale the cube

### 4.2 Aggregate Mode

- Displays the **mean preference** across all 22 participants
- Uses a **heatmap** visualization (HSL color mapping): red = low preference → yellow → green = high preference
- Key height also encodes the aggregated value
- Can click individual faces to isolate them

### 4.3 Reachability Mode

- Displays a **finger-to-key reachability heatmap**
- Filter by specific finger using a dropdown (10 finger options + "All Fingers")
- HSL color scale: **green = easily reachable**, **red = unreachable**
- Data is the sum of reachability scores across all 22 participants per key
- Supports per-finger analysis (e.g., show only Left Thumb or Right Index reachability)

---

## 5. User Interface Features

### 5.1 Layout

- **Split-panel design:** Control panel (350px, left) + 3D model viewer (flex-grow, right)
- **Collapsible sections** with +/− indicators for organized control groups
- **Responsive design:** Adapts to mobile (768px) and small screens (480px)

### 5.2 Control Sections

1. **Visualization Mode** — Mode switching (Preference / Aggregate / Reachability) + mode description + finger filter (reachability) + heatmap legend
2. **Select Participant** — Dropdown with participant info (handedness, hand circumference)
3. **Participant Data Summary** — Displays selected participant's measurements
4. **Color Preferences Visualization** — Face color buttons (R/B/G/W/Y) + reset
5. **Manual Controls** — Handedness toggle + hand measurement sliders
6. **Display Options** — Wireframe toggle + background color picker
7. **Study Info** — Statistics grid (31 participants, 22 participants, 77.4% diagonal, 80 keys) + study descriptions
8. **Scene & View** — Reset view button + lighting intensity slider

### 5.3 3D Interaction

- **Orbit controls:** Click and drag to rotate, scroll to zoom
- **Key labels:** Each of the 80 keys displays its ID (e.g., "R1") as a floating sprite that always faces the camera
- **No hover interaction:** The model state changes only through the control panel (by design, to keep the visualization deterministic)

---

## 6. Data Files Description

### 6.1 `_data/preferences.csv`

| Column              | Description                        |
|--------------------|------------------------------------|
| Number             | Participant ID (1–22)              |
| Handedness         | "right" or "left"                  |
| CircumferenceRightHand | Hand circumference in mm       |
| LengthRightHand    | Hand length in mm                  |
| R1–R16             | Preference scores for Red face     |
| B1–B16             | Preference scores for Blue face    |
| G1–G16             | Preference scores for Green face   |
| W1–W16             | Preference scores for White face   |
| Y1–Y16             | Preference scores for Yellow face  |

**22 rows, 84 columns.** Values represent preference intensity on a 1–10 scale.

### 6.2 `_data/reachability.csv`

| Column Pattern      | Description                                        |
|--------------------|----------------------------------------------------|
| Number             | Participant ID (1–22)                               |
| {Finger}-{Face}{Key} | Reachability score (e.g., `LT-R1`, `RI-B12`)    |

**22 rows, 800+ data columns.** Each column follows the pattern `{Finger}-{Face}{KeyNumber}` where:
- Finger ∈ {LT, LI, LM, LR, LL, RT, RI, RM, RR, RL}
- Face ∈ {R, B, G, W, Y}
- Key ∈ {1, 2, ..., 16}

Values: **0** = unreachable, **1** = reachable with effort, **2** = easily reachable.

---

## 7. Development History

| Commit | Description |
|--------|-------------|
| `927220e` | Initial commit |
| `1264728` | Phase 3 finished (initial Three.js integration) |
| `26190a1` | Jekyll integration |
| `5c698a3` | Full refactoring, data integration, visualization options |
| `02b8653` | Responsive design optimization and visualization options |
| `63de7fd` | Homepage ↔ Visualization page interaction setup |
| `f912fc4` | Visualization page upgrade |
| `a98dfd3` | Base URL fix for GitHub Pages |
| `7782504` | Visualization page reset |
| `b28c6df` | Data visualization improvement |
| `4efbd29` | Homepage transition + title bar removal |
| `96e0f5b` | Upgrade 1 — Layout restructuring, collapsible sections |
| `328246b` | Upgrade 1.1 — Display options (wireframe, background) |
| `50e953c` | Upgrade 2 — Scene controls, enhanced styling |
| `ba3faa9` | Upgrade 3 — Study data integration (3 visualization modes, reachability heatmap, aggregate computation, study info panel) |
| `b33b7e6` | Removed raycaster hover interaction |
| `8d142e7` | Added floating text labels on each key |

---

## 8. How to Run Locally

```bash
# Prerequisites: Ruby, Bundler, Jekyll
bundle install
bundle exec jekyll serve
# Open http://localhost:4000 in a browser
```

The site is also deployed automatically via GitHub Pages at the repository URL.

---

## 9. Summary

This project transforms raw user study data from two Keycube experiments into an interactive 3D visualization tool. It allows researchers and evaluators to:

1. **Explore individual participant data** — selecting any of the 22 participants and viewing their finger-to-key preferences per face
2. **Analyze aggregate trends** — viewing mean preference heatmaps across all participants to identify globally preferred keys
3. **Investigate finger reachability** — filtering by specific fingers to understand which keys are most/least accessible, critical for ergonomic keyboard layout design
4. **Manipulate the 3D model** — rotating, zooming, adjusting lighting, toggling wireframe, and reading key labels from any angle

The tool bridges the gap between tabular study data and spatial understanding, making it possible to visually correlate key positions on the cube's faces with user preference and reachability metrics.
