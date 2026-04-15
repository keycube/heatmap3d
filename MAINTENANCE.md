# Maintenance Guide — Keycube Heatmap 3D

Documentation technique pour la maintenance de l'application.

---

## Architecture

```
heatmap3d/
├── index.html              # Page d'accueil (layout: landing)
├── preference.html         # Visualisation des préférences
├── reachability.html       # Visualisation de l'accessibilité
├── 404.html                # Page d'erreur
│
├── _layouts/
│   ├── landing.html        # Layout page d'accueil (header/footer keycube.io)
│   ├── dataviz.html        # Layout visualisation 3D (Three.js)
│   └── default.html        # Layout basique (404)
│
├── _includes/
│   ├── model-viewer.html       # Scène Three.js interactive
│   ├── model-viewer-static.html # Scène Three.js statique (landing)
│   └── dataviz-data.html       # Génération des données CSV → JS
│
├── _data/
│   ├── preferences.csv     # Données de préférence (22 participants)
│   └── reachability.csv    # Données d'accessibilité (22 × 10 doigts)
│
├── assets/
│   ├── css/
│   │   ├── landing.css     # Styles page d'accueil
│   │   ├── dataviz.css     # Styles visualisation
│   │   └── default.css     # Styles de base
│   ├── js/
│   │   └── dataviz.js      # Logique UI visualisation
│   └── img/
│       ├── k3logo.png      # Logo Keycube
│       └── favicon.png     # Favicon
│
└── _config.yml             # Configuration Jekyll
```

---

## Pages principales

### `/` — Page d'accueil
- **Fichier:** `index.html`
- **Layout:** `_layouts/landing.html`
- **CSS:** `assets/css/landing.css`
- **3D:** `_includes/model-viewer-static.html`

### `/preference` — Préférences
- **Fichier:** `preference.html`
- **Layout:** `_layouts/dataviz.html`
- **CSS:** `assets/css/dataviz.css`
- **JS:** `assets/js/dataviz.js`
- **3D:** `_includes/model-viewer.html`
- **Données:** `_data/preferences.csv`

### `/reachability` — Accessibilité
- **Fichier:** `reachability.html`
- **Layout:** `_layouts/dataviz.html`
- **CSS:** `assets/css/dataviz.css`
- **JS:** `assets/js/dataviz.js`
- **3D:** `_includes/model-viewer.html`
- **Données:** `_data/reachability.csv`

---

## Composants clés

### Three.js (`_includes/model-viewer.html`)

**Structure de la scène:**
- Camera: `(0, 2, -5)` — vue depuis derrière le cube
- Cube rotation: `-135°` — position diagonale (Figure 4 du paper)
- 80 touches: 5 faces × 16 touches (grille 4×4)

**Faces du cube:**
| Face | Couleur | Position | Code |
|------|---------|----------|------|
| R | Rouge | Haut (y+1) | Top |
| B | Bleu | z-1 | Main gauche externe |
| Y | Jaune | x+1 | Main droite externe |
| W | Blanc | x-1 | Main gauche interne |
| G | Vert | z+1 | Main droite interne |

**API `window.updateModel(data)`:**
```javascript
updateModel({
  heatmap: { R: [...], B: [...], ... },  // Couleurs heatmap
  heatmapMin: 0,
  heatmapMax: 10,
  heatmapInvert: true,          // true = préférence (1=vert), false = reachability
  showScores: true,             // Afficher scores sur touches
  scores: { R: [...], ... },    // Valeurs des scores
  isReachability: false,        // Mode reachability (ajuste taille police)
  reset: true                   // Réinitialiser couleurs
});
```

### Données (`_includes/dataviz-data.html`)

**Variables JavaScript générées:**
```javascript
window.participantsData     // Array[22] — données de préférence par participant
window.reachabilityData     // Object — données d'accessibilité par doigt
```

**Structure `participantsData[i]`:**
```javascript
{
  number: 1,
  handedness: "right",
  circumference: 195,
  length: 185,
  R: [7, 8, 5, ...],  // 16 scores pour face Rouge
  B: [...], G: [...], W: [...], Y: [...]
}
```

**Structure `reachabilityData`:**
```javascript
{
  LT: { R: [...], B: [...], ... },  // Left Thumb
  LI: { ... },  // Left Index
  LM: { ... },  // Left Middle
  LR: { ... },  // Left Ring
  LL: { ... },  // Left Little
  RT: { ... },  // Right Thumb
  RI: { ... },  // Right Index
  RM: { ... },  // Right Middle
  RR: { ... },  // Right Ring
  RL: { ... }   // Right Little
}
```

---

## Styles CSS

### Système de couleurs
```css
/* Keycube.io Research color */
--accent: #43AAD6;

/* Heatmap */
/* Préférence: 1 (vert) → 10 (rouge) */
/* Reachability: 0 (rouge) → max (vert) */
```

### Classes principales
| Classe | Usage |
|--------|-------|
| `.glass-panel` | Panneaux glassmorphism |
| `.overlay-controls` | Conteneur contrôles flottants |
| `.top-bar` | Barre supérieure (sélecteurs) |
| `.bottom-bar` | Barre inférieure (Playdate rotation) |
| `.side-panel` | Panneau latéral (info) |
| `.hand-analog` | Contrôle main (Playdate style) |
| `.finger-dot` | Bouton doigt |

### Breakpoints responsive
- `768px` — Tablette
- `480px` — Mobile

---

## Modification des données

### Ajouter un participant

1. Éditer `_data/preferences.csv`:
```csv
Number,Handedness,CircumferenceRightHand,LengthRightHand,R1,R2,...,Y16
23,right,190,180,7,8,6,...,5
```

2. Éditer `_data/reachability.csv`:
```csv
Number,LT-R1,LT-R2,...,RL-Y16
23,2,1,0,...,1
```

### Modifier les faces

Dans `_includes/model-viewer.html`, tableau `faces`:
```javascript
const faces = [
  { axis: 'y', sign: 1,  prefix: 'R', color: 'red' },
  { axis: 'z', sign: -1, prefix: 'B', color: 'blue' },
  // ...
];
```

---

## Déploiement

### GitHub Pages (automatique)
Push sur `main` → déploiement automatique sur `keycube.github.io/heatmap3d`

### Local
```bash
bundle install
bundle exec jekyll serve --livereload
# http://localhost:4000/heatmap3d
```

---

## Dépendances externes

| Dépendance | Version | CDN |
|------------|---------|-----|
| Three.js | 0.160.0 | unpkg.com |
| OrbitControls | 0.160.0 | unpkg.com (addons) |
| RoundedBoxGeometry | 0.160.0 | unpkg.com (addons) |

**Import map** (dans layouts):
```html
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  }
}
</script>
```

---

## Troubleshooting

### Le cube ne s'affiche pas
- Vérifier la console pour erreurs Three.js
- Vérifier que `#model-container` existe dans le HTML

### Les données ne chargent pas
- Vérifier le format CSV (virgules, pas point-virgules)
- Vérifier les noms de colonnes dans `dataviz-data.html`

### Les tooltips sont cachés
- Vérifier `z-index` dans dataviz.css
- `.hand-divider` doit avoir `z-index: 10`
- `:hover` doit avoir `z-index: 100`

### Le site ne se déploie pas
- Vérifier GitHub Actions dans l'onglet Actions
- Vérifier `baseurl: "/heatmap3d"` dans `_config.yml`
