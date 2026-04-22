# Maintenance Notes — Keycube Heatmap 3D

Document technique secondaire pour la maintenance du projet.

Le point d'entrée principal reste [README.md](README.md). Ce fichier sert surtout de référence technique plus ciblée.

## État actuel du projet

L'application expose deux vues autonomes:

- `/preference/`
- `/reachability/`

La racine `/` redirige vers `/preference/`.

Le workflow local recommandé n'est pas Jekyll. Le workflow recommandé est:

1. générer un build statique avec `scripts/build_local_site.py`
2. servir `.local_site/` avec un serveur HTTP local

## Architecture actuelle

```text
heatmap3d/
├── index.html                  # Redirection / -> /preference/
├── preference.html             # Vue Preference
├── reachability.html           # Vue Reachability
├── preference-fr.html          # Variante FR Preference
├── reachability-fr.html        # Variante FR Reachability
├── 404.html                    # Page d'erreur
├── _layouts/
│   ├── dataviz.html            # Shell des pages interactives 3D
│   └── default.html            # Layout minimal
├── _includes/
│   ├── model-viewer.html       # Viewer Three.js principal
│   ├── model-viewer-static.html# Viewer statique historique
│   └── dataviz-data.html       # Génération des données JS depuis CSV
├── _data/
│   ├── preferences.csv
│   └── reachability.csv
├── assets/
│   ├── css/
│   │   ├── dataviz.css
│   │   └── default.css
│   ├── js/
│   │   └── dataviz.js
│   └── img/
├── scripts/
│   └── build_local_site.py     # Build statique local
└── .local_site/                # Sortie générée
```

## Build local

### Commandes

```bash
python3 scripts/build_local_site.py
python3 -m http.server 4000 --directory .local_site
```

### Ce que fait `build_local_site.py`

Le script:

- lit les fichiers source HTML
- lit les layouts et includes
- lit les CSV de `_data/`
- injecte les données dans le HTML final
- copie les assets
- génère une version directement servable dans `.local_site/`

### Pourquoi ce workflow est le principal

Il évite les problèmes de compatibilité Ruby/Bundler pour un run local simple. La structure Jekyll existe encore dans le dépôt, mais le chemin supporté pour le développement courant est le build statique Python.

## Viewer 3D

Le viewer principal vit dans `_includes/model-viewer.html`.

Points utiles:

- le cube contient 80 touches
- les couleurs et labels sont pilotés par `window.updateModel(...)`
- le mode `Preference` et le mode `Reachability` réutilisent le même viewer

Exemple d'appel:

```javascript
window.updateModel({
  heatmap: { R: [...], B: [...], G: [...], W: [...], Y: [...] },
  heatmapMin: 0,
  heatmapMax: 10,
  heatmapInvert: true,
  scores: { R: [...], B: [...], G: [...], W: [...], Y: [...] },
  showScores: true,
  isReachability: false
});
```

## Données injectées au frontend

`_includes/dataviz-data.html` génère les variables globales utilisées côté navigateur.

Variables principales:

- `window.participantsData`
- `window.reachabilityData`
- `window.perFingerReachability`
- `window.preferenceAggregate`

Couplage important:

- si la structure des CSV change, il faut vérifier `_includes/dataviz-data.html`
- si les noms des structures JS changent, il faut vérifier `assets/js/dataviz.js`

## Sources de données

### Préférences

Fichier: `_data/preferences.csv`

Contient:

- métadonnées participant
- scores par face
- colonnes `R1..R16`, `B1..B16`, `G1..G16`, `W1..W16`, `Y1..Y16`

### Reachability

Fichier: `_data/reachability.csv`

Contient des colonnes par:

- doigt
- face
- index de touche

Exemples:

- `LT-R1`
- `LI-B4`
- `RM-Y12`

## Fichiers à vérifier selon le type de changement

### Changement de structure de page

- `preference.html`
- `reachability.html`
- `_layouts/dataviz.html`

### Changement de comportement

- `assets/js/dataviz.js`
- `_includes/model-viewer.html`

### Changement de données

- `_data/preferences.csv`
- `_data/reachability.csv`
- `_includes/dataviz-data.html`

### Changement de style

- `assets/css/dataviz.css`
- `assets/css/default.css`

## Dépendances runtime externes

Chargées côté navigateur:

- `https://unpkg.com/three@0.160.0/build/three.module.js`
- `https://unpkg.com/three@0.160.0/examples/jsm/`

Sans accès à `unpkg.com`, le viewer 3D ne démarre pas.

## Jekyll

Le dépôt contient encore:

- `_layouts/`
- `_includes/`
- `_config.yml`
- `Gemfile`

Mais Jekyll doit être considéré comme workflow secondaire.

Si tu veux quand même l'utiliser:

- Ruby 3.x recommandé
- Bundler
- gems installables depuis `rubygems.org`

Ce chemin n'est pas celui à privilégier pour la maintenance courante.

## Déploiement

Déploiement attendu:

- push sur `main`
- publication GitHub Pages sur `keycube.github.io/heatmap3d`

## Troubleshooting rapide

### Le build local est bien généré mais les changements n'apparaissent pas

- relancer `python3 scripts/build_local_site.py`
- faire un hard refresh du navigateur

### Le viewer 3D n'apparaît pas

- vérifier la console navigateur
- vérifier WebGL
- vérifier l'accès à `unpkg.com`

### Les données affichées semblent incorrectes

- vérifier les colonnes CSV
- vérifier `_includes/dataviz-data.html`
- vérifier `assets/js/dataviz.js`
