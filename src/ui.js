import { FONT_LIST } from './fontManager.js';
import { DEFAULT_PARAMS } from './keychain.js';

export class UI {
  constructor(app) {
    this.app = app;
    this.params = { ...DEFAULT_PARAMS };
    this.isDrawerOpen = false;
    this._buildUI();
    this._bindEvents();
    this._setupMobileDrawer();
  }

  _buildUI() {
    const panel = document.getElementById('control-panel');
    panel.innerHTML = `
      <div class="panel-header" id="panel-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          Controls
        </h2>
        <button class="drawer-handle" id="drawer-toggle" aria-label="Toggle controls">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      </div>
      <div class="panel-body" id="panel-body">

        <!-- TEXT SECTION -->
        <div class="section">
          <div class="section-title" data-section="text">
            <span>📝 Text</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="section-content" id="section-text">
            <div class="control-group">
              <label for="input-text">Text</label>
              <input type="text" id="input-text" value="${this.params.text}" placeholder="Enter text..." />
            </div>
            <div class="control-group">
              <label for="input-text-size">Text Size <span class="value-display" id="val-text-size">${this.params.textSize}mm</span></label>
              <input type="range" id="input-text-size" min="3" max="20" step="0.5" value="${this.params.textSize}" />
            </div>
            <div class="control-group">
              <label for="input-text-depth">Text Depth <span class="value-display" id="val-text-depth">${this.params.textDepth}mm</span></label>
              <input type="range" id="input-text-depth" min="0.5" max="5" step="0.1" value="${this.params.textDepth}" />
            </div>
            <div class="control-group">
              <label for="input-text-offset-x">Position X <span class="value-display" id="val-text-offset-x">${this.params.textOffsetX}mm</span></label>
              <input type="range" id="input-text-offset-x" min="-30" max="30" step="0.5" value="${this.params.textOffsetX}" />
            </div>
            <div class="control-group">
              <label for="input-text-offset-y">Position Y <span class="value-display" id="val-text-offset-y">${this.params.textOffsetY}mm</span></label>
              <input type="range" id="input-text-offset-y" min="-20" max="20" step="0.5" value="${this.params.textOffsetY}" />
            </div>
            <div class="control-group">
              <label for="input-text-stroke-width">Text Stroke Width <span class="value-display" id="val-text-stroke-width">${this.params.textStrokeWidth}mm</span></label>
              <input type="range" id="input-text-stroke-width" min="0" max="4" step="0.1" value="${this.params.textStrokeWidth}" />
            </div>
            <div class="control-group">
              <label>Stroke Style (Join)</label>
              <div class="style-picker" id="stroke-style-picker">
                <button class="style-btn ${this.params.textStrokeJoin === 'miter' ? 'active' : ''}" data-value="miter" title="Miter">Miter</button>
                <button class="style-btn ${this.params.textStrokeJoin === 'round' ? 'active' : ''}" data-value="round" title="Round">Round</button>
                <button class="style-btn ${this.params.textStrokeJoin === 'bevel' ? 'active' : ''}" data-value="bevel" title="Bevel">Bevel</button>
              </div>
            </div>
            <div id="stroke-roundness-controls" class="${this.params.textStrokeJoin === 'round' ? '' : 'hidden'}">
              <div class="control-group">
                <label for="input-text-stroke-resolution">Round Smoothness <span class="value-display" id="val-text-stroke-resolution">${this.params.textStrokeResolution}</span></label>
                <input type="range" id="input-text-stroke-resolution" min="8" max="64" step="4" value="${this.params.textStrokeResolution}" />
              </div>
            </div>
          </div>
        </div>

        <!-- FONT SECTION -->
        <div class="section">
          <div class="section-title" data-section="font">
            <span>🔤 Font</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="section-content" id="section-font">
            <div class="control-group">
              <label for="input-font">Font Family</label>
              <select id="input-font">
                ${FONT_LIST.map(f => `<option value="${f.name}" ${f.name === 'Roboto' ? 'selected' : ''}>${f.name}</option>`).join('')}
              </select>
            </div>
            <div id="font-loading-indicator" class="loading-indicator hidden">
              <div class="spinner"></div>
              <span>Loading font...</span>
            </div>
          </div>
        </div>

        <!-- IMAGE SECTION -->
        <div class="section">
          <div class="section-title" data-section="image">
            <span>🖼️ Image</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="section-content" id="section-image">
            <div class="control-group">
              <label class="file-upload-label" for="input-image" id="upload-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Upload Image</span>
              </label>
              <input type="file" id="input-image" accept="image/*" class="hidden-file-input" />
            </div>
            <div id="image-preview-container" class="hidden">
              <img id="image-preview" alt="Preview" />
              <button id="remove-image" class="btn-icon" title="Remove image">✕</button>
            </div>
            <div id="image-controls" class="hidden">
              <div class="control-group">
                <label for="input-image-depth">Relief Depth <span class="value-display" id="val-image-depth">${this.params.imageDepth}mm</span></label>
                <input type="range" id="input-image-depth" min="0.2" max="3" step="0.1" value="${this.params.imageDepth}" />
              </div>
              <div class="control-group">
                <label for="input-image-scale">Scale <span class="value-display" id="val-image-scale">${this.params.imageScale}%</span></label>
                <input type="range" id="input-image-scale" min="10" max="100" step="1" value="${this.params.imageScale}" />
              </div>
              <div class="control-group">
                <label for="input-image-offset-x">Position X <span class="value-display" id="val-image-offset-x">${this.params.imageOffsetX}mm</span></label>
                <input type="range" id="input-image-offset-x" min="-30" max="30" step="0.5" value="${this.params.imageOffsetX}" />
              </div>
              <div class="control-group">
                <label for="input-image-offset-y">Position Y <span class="value-display" id="val-image-offset-y">${this.params.imageOffsetY}mm</span></label>
                <input type="range" id="input-image-offset-y" min="-20" max="20" step="0.5" value="${this.params.imageOffsetY}" />
              </div>
              <div class="control-group">
                <label for="input-image-resolution">Resolution <span class="value-display" id="val-image-resolution">${this.params.imageResolution}px</span></label>
                <input type="range" id="input-image-resolution" min="32" max="256" step="16" value="${this.params.imageResolution}" />
              </div>
              <div class="control-group checkbox-group">
                <label for="input-image-invert">
                  <input type="checkbox" id="input-image-invert" ${this.params.imageInvert ? 'checked' : ''} />
                  <span>Invert heightmap</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- DIMENSIONS SECTION -->
        <div class="section">
          <div class="section-title" data-section="dimensions">
            <span>📐 Dimensions</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="section-content" id="section-dimensions">
            <div class="control-group checkbox-group">
              <label for="input-show-base">
                <input type="checkbox" id="input-show-base" ${this.params.showBase ? 'checked' : ''} />
                <span>Show Base Plate</span>
              </label>
            </div>
            <div id="base-controls" class="${this.params.showBase ? '' : 'hidden'}">
              <div class="control-group">
                <label for="input-base-width">Width <span class="value-display" id="val-base-width">${this.params.baseWidth}mm</span></label>
                <input type="range" id="input-base-width" min="30" max="120" step="1" value="${this.params.baseWidth}" />
              </div>
              <div class="control-group">
                <label for="input-base-height">Height <span class="value-display" id="val-base-height">${this.params.baseHeight}mm</span></label>
                <input type="range" id="input-base-height" min="15" max="60" step="1" value="${this.params.baseHeight}" />
              </div>
              <div class="control-group">
                <label for="input-corner-radius">Corner Radius <span class="value-display" id="val-corner-radius">${this.params.cornerRadius}mm</span></label>
                <input type="range" id="input-corner-radius" min="0" max="15" step="0.5" value="${this.params.cornerRadius}" />
              </div>
            </div>
            <div class="control-group">
              <label for="input-base-thickness">Thickness <span class="value-display" id="val-base-thickness">${this.params.baseThickness}mm</span></label>
              <input type="range" id="input-base-thickness" min="1" max="8" step="0.5" value="${this.params.baseThickness}" />
            </div>
            <div class="control-group">
              <label for="input-hole-diameter">Hole Diameter <span class="value-display" id="val-hole-diameter">${this.params.holeDiameter}mm</span></label>
              <input type="range" id="input-hole-diameter" min="2" max="8" step="0.5" value="${this.params.holeDiameter}" />
            </div>
            <div class="control-group checkbox-group">
              <label for="input-hole-auto-position">
                <input type="checkbox" id="input-hole-auto-position" ${this.params.holeAutoPosition ? 'checked' : ''} />
                <span>Auto Position Hole (next to text)</span>
              </label>
            </div>
            <div id="hole-position-controls" class="${this.params.holeAutoPosition ? 'hidden' : ''}">
              <div class="control-group">
                <label for="input-hole-offset-x">Position X <span class="value-display" id="val-hole-offset-x">${this.params.holeOffsetX}mm</span></label>
                <input type="range" id="input-hole-offset-x" min="-50" max="50" step="1" value="${this.params.holeOffsetX}" />
              </div>
              <div class="control-group">
                <label for="input-hole-offset-y">Position Y <span class="value-display" id="val-hole-offset-y">${this.params.holeOffsetY}mm</span></label>
                <input type="range" id="input-hole-offset-y" min="-30" max="30" step="1" value="${this.params.holeOffsetY}" />
              </div>
            </div>
          </div>
        </div>

        <!-- COLOR SECTION -->
        <div class="section">
          <div class="section-title" data-section="colors">
            <span>🎨 Colors</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="section-content" id="section-colors">
            <div class="control-group">
              <label for="input-base-color">Base Color</label>
              <input type="color" id="input-base-color" value="#8ec5fc" />
            </div>
            <div class="control-group">
              <label for="input-stroke-color">Stroke Color</label>
              <input type="color" id="input-stroke-color" value="#ffffff" />
            </div>
            <div class="control-group">
              <label for="input-text-color">Text Color</label>
              <input type="color" id="input-text-color" value="#e0c3fc" />
            </div>
          </div>
        </div>

        <!-- EXPORT SECTION -->
        <div class="section export-section">
          <div class="section-title" data-section="export">
            <span>💾 Export</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="section-content" id="section-export">
            <div class="export-buttons">
              <button id="btn-export-stl" class="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export STL
              </button>
              <button id="btn-export-3mf" class="btn btn-secondary" disabled style="opacity: 0.6; cursor: not-allowed;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export 3MF (Coming soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    // Text inputs
    const textInput = document.getElementById('input-text');
    let textDebounce;
    textInput.addEventListener('input', (e) => {
      clearTimeout(textDebounce);
      textDebounce = setTimeout(() => {
        this.params.text = e.target.value;
        this.app.rebuild();
      }, 300);
    });

    // Stroke style buttons
    document.querySelectorAll('#stroke-style-picker .style-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#stroke-style-picker .style-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.params.textStrokeJoin = e.target.getAttribute('data-value');
        
        const roundnessControls = document.getElementById('stroke-roundness-controls');
        if (this.params.textStrokeJoin === 'round') roundnessControls.classList.remove('hidden');
        else roundnessControls.classList.add('hidden');
        
        this.app.rebuild();
      });
    });

    // Range sliders
    const sliderBindings = [
      { id: 'input-text-size', param: 'textSize', display: 'val-text-size', unit: 'mm' },
      { id: 'input-text-depth', param: 'textDepth', display: 'val-text-depth', unit: 'mm' },
      { id: 'input-text-offset-x', param: 'textOffsetX', display: 'val-text-offset-x', unit: 'mm' },
      { id: 'input-text-offset-y', param: 'textOffsetY', display: 'val-text-offset-y', unit: 'mm' },
      { id: 'input-text-stroke-width', param: 'textStrokeWidth', display: 'val-text-stroke-width', unit: 'mm' },
      { id: 'input-text-stroke-resolution', param: 'textStrokeResolution', display: 'val-text-stroke-resolution', unit: '' },
      { id: 'input-base-width', param: 'baseWidth', display: 'val-base-width', unit: 'mm' },
      { id: 'input-base-height', param: 'baseHeight', display: 'val-base-height', unit: 'mm' },
      { id: 'input-base-thickness', param: 'baseThickness', display: 'val-base-thickness', unit: 'mm' },
      { id: 'input-corner-radius', param: 'cornerRadius', display: 'val-corner-radius', unit: 'mm' },
      { id: 'input-hole-diameter', param: 'holeDiameter', display: 'val-hole-diameter', unit: 'mm' },
      { id: 'input-hole-offset-x', param: 'holeOffsetX', display: 'val-hole-offset-x', unit: 'mm' },
      { id: 'input-hole-offset-y', param: 'holeOffsetY', display: 'val-hole-offset-y', unit: 'mm' },
      { id: 'input-image-depth', param: 'imageDepth', display: 'val-image-depth', unit: 'mm' },
      { id: 'input-image-scale', param: 'imageScale', display: 'val-image-scale', unit: '%' },
      { id: 'input-image-offset-x', param: 'imageOffsetX', display: 'val-image-offset-x', unit: 'mm' },
      { id: 'input-image-offset-y', param: 'imageOffsetY', display: 'val-image-offset-y', unit: 'mm' },
      { id: 'input-image-resolution', param: 'imageResolution', display: 'val-image-resolution', unit: 'px' },
    ];

    sliderBindings.forEach(({ id, param, display, unit }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.params[param] = val;
        document.getElementById(display).textContent = val + unit;
        this.app.rebuild();
      });
    });

    // Selects
    document.getElementById('input-font').addEventListener('change', (e) => {
      this.app.changeFont(e.target.value);
    });



    // Colors
    document.getElementById('input-base-color').addEventListener('input', (e) => {
      this.app.keychainBuilder.setColor(e.target.value);
    });
    document.getElementById('input-stroke-color').addEventListener('input', (e) => {
      this.app.keychainBuilder.setStrokeColor(e.target.value);
    });
    document.getElementById('input-text-color').addEventListener('input', (e) => {
      this.app.keychainBuilder.setTextColor(e.target.value);
    });

    // Checkboxes
    document.getElementById('input-show-base').addEventListener('change', (e) => {
      this.params.showBase = e.target.checked;
      const controls = document.getElementById('base-controls');
      if (this.params.showBase) controls.classList.remove('hidden');
      else controls.classList.add('hidden');
      this.app.rebuild();
    });

    document.getElementById('input-hole-auto-position').addEventListener('change', (e) => {
      this.params.holeAutoPosition = e.target.checked;
      const controls = document.getElementById('hole-position-controls');
      if (this.params.holeAutoPosition) controls.classList.add('hidden');
      else controls.classList.remove('hidden');
      this.app.rebuild();
    });

    // Image upload
    document.getElementById('input-image').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.app.loadImage(file);
      }
    });

    document.getElementById('remove-image').addEventListener('click', () => {
      this.app.removeImage();
      this.hideImageControls();
    });

    // Image invert
    document.getElementById('input-image-invert').addEventListener('change', (e) => {
      this.params.imageInvert = e.target.checked;
      this.app.rebuild();
    });

    // Export buttons
    document.getElementById('btn-export-stl').addEventListener('click', () => {
      this.app.exportSTL();
    });
    document.getElementById('btn-export-3mf').addEventListener('click', () => {
      this.app.export3MF();
    });

    // Section collapsing
    document.querySelectorAll('.section-title').forEach(title => {
      title.addEventListener('click', () => {
        const sectionId = title.getAttribute('data-section');
        const content = document.getElementById(`section-${sectionId}`);
        const chevron = title.querySelector('.chevron');
        
        if (content) {
          content.classList.toggle('collapsed');
          chevron.classList.toggle('rotated');
        }
      });
    });
  }

  _setupMobileDrawer() {
    const toggle = document.getElementById('drawer-toggle');
    const panel = document.getElementById('control-panel');
    const body = document.getElementById('panel-body');

    toggle.addEventListener('click', () => {
      this.isDrawerOpen = !this.isDrawerOpen;
      panel.classList.toggle('drawer-open', this.isDrawerOpen);
      toggle.classList.toggle('flipped', this.isDrawerOpen);
    });

    // Swipe to close on mobile
    let startY = 0;
    body.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    body.addEventListener('touchmove', (e) => {
      const deltaY = e.touches[0].clientY - startY;
      if (deltaY > 60 && this.isDrawerOpen) {
        this.isDrawerOpen = false;
        panel.classList.remove('drawer-open');
        toggle.classList.remove('flipped');
      }
    }, { passive: true });
  }

  showImageControls(previewUrl) {
    document.getElementById('image-preview-container').classList.remove('hidden');
    document.getElementById('image-controls').classList.remove('hidden');
    document.getElementById('image-preview').src = previewUrl;
    document.getElementById('upload-label').querySelector('span').textContent = 'Change Image';
  }

  hideImageControls() {
    document.getElementById('image-preview-container').classList.add('hidden');
    document.getElementById('image-controls').classList.add('hidden');
    document.getElementById('input-image').value = '';
    document.getElementById('upload-label').querySelector('span').textContent = 'Upload Image';
  }

  showFontLoading() {
    document.getElementById('font-loading-indicator').classList.remove('hidden');
  }

  hideFontLoading() {
    document.getElementById('font-loading-indicator').classList.add('hidden');
  }

  showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  getParams() {
    return { ...this.params };
  }
}
