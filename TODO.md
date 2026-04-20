# 📝 Keychain Generator TODO List

This file tracks upcoming features, known issues, and future improvements for the 3D Keychain Generator.

## 🔴 High Priority / Bug Fixes
- [ ] **Re-enable 3MF Export**: The 3MF export button is currently disabled (`Coming soon`). The underlying topological issues (Non-manifold edges) have been addressed via `mergeVertices()`, but the export routine needs final verification before being unlocked for users.
- [ ] **3MF Color Data**: Upgrade the 3MF XML generator to inject `<m:color>` attributes so that the Base Plate, Stroke, and Text export with their respective colors. This will allow direct plug-and-play into multi-material slicers like Bambu Studio.

## 🟡 Medium Priority / Feature Enhancements
- [ ] **Text Alignment Support**: Currently, text is strictly center-aligned. Implement `Left`, `Center`, and `Right` alignment options, dynamically recalculating the bounding box and X-offsets.
- [ ] **Font Integration**: Build a robust Font Selector UI. Fetch and parse popular fonts directly from Google Fonts API instead of relying solely on the single default font.
- [ ] **Interactive 3D Controls**: Implement Three.js `Raycaster` to allow users to click and drag the keychain hole directly on the 3D canvas instead of just using sliders.
- [ ] **Save / Share Presets**: Allow users to generate a URL with encoded query parameters (e.g., `?text=Hello&font=Roboto&strokeWidth=2.5`) to easily share their designs.

## 🟢 Low Priority / UI Polishing
- [ ] **UI Accordions**: As the number of settings grows, convert the right-side control panel into collapsible accordion sections to save screen space and improve usability.
- [ ] **SVG/Image Import**: Allow users to upload a flat 2D SVG or image (like a company logo) to be embedded alongside the text.
- [ ] **Mobile Optimization**: Tweak the CSS layout to ensure the 3D canvas and parameter controls are fully usable on mobile devices.

---
*Generated during development to track upcoming milestones.*
