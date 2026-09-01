# CrowdSafe 3D — Map Scenario Studio V2

> **Amateur project / personal learning experiment.** This is an independently made Godot prototype, not an official police, government, engineering or academic product. It has not been professionally validated and must not be used to approve real crowd-safety plans.

A configurable Godot 4.7 crowd-flow education simulator with local screenshot import, scale calibration, map tracing and procedural 3D reconstruction.

## Why I made this

This small personal project explores whether a map screenshot can help a non-specialist sketch a street, mark feeder entrances and shops, and compare basic crowd-management ideas in a simple 3D scene. It is shared publicly for learning, discussion and experimentation—not as a claim of professional crowd-engineering accuracy.

## Map-to-3D workflow

1. Select **IMPORT PNG / JPG SCREENSHOT**.
2. Enter a known real-world distance in **Calibration distance**.
3. Select **1 CALIBRATE**, then click the two ends of that known distance.
4. Select **2 MAIN ALLEY**, then click the two ends of the principal crowd corridor.
5. Select **3 ENTRANCES** and click every feeder street, station exit or access point.
6. Select **4 SHOPS** and click relevant shop locations.
7. Right-click removes the most recent marker in the active tool.
8. Select **GENERATE 3D**.

The simulator derives the main-alley length from the calibrated screenshot, creates proportional feeder lanes on the correct side of the corridor, positions simplified shops, and spawns crowd agents through the mapped entrances. All source images remain local to the user's computer and are not embedded in the exported simulation package.

## Scenario controls

- Street width, calibrated street length and slope
- Starting crowd and continuous inflow
- Exit processing capacity
- Two-way or one-way walking
- Entrance metering
- Directional divider barriers
- Control staff
- Live 12-zone density heatmap, peak density, average speed and risk state

## MacBook controls

- Drag to orbit
- Two-finger vertical scroll or pinch to zoom
- `+` and `-` as keyboard fallback

## Important boundary

This is an educational and planning-concept tool, not engineering certification, legal evidence, an official accident reconstruction or operational approval. A screenshot cannot establish authoritative road boundaries, elevation, usable width, temporary obstacles or entrance capacity. Police and event-planning use requires validated GIS/site-survey geometry, measured elevations, observed crowd demand, emergency access requirements and qualified crowd-safety review.

Google map imagery may be subject to separate terms and attribution requirements. For production work, prefer OpenStreetMap or authorised government GIS data, retain required attribution, and do not represent traced screenshot geometry as an official dataset.

## Project status

- Amateur prototype; early V2
- Procedural low-poly graphics
- Simplified movement and density rules
- Structurally checked, but not live-tested in Godot in the build environment
- No real victim identities, injury animations or forensic claims
- No warranty and no operational safety approval

There is currently no open-source licence attached. The repository is public for viewing and discussion; normal copyright rules apply unless a licence is added later.
