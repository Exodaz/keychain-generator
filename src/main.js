import './style.css';
import * as THREE from 'three';
import { SceneManager } from './scene.js';
import { KeychainBuilder } from './keychain.js';
import { FontManager } from './fontManager.js';
import { ImageProcessor } from './imageProcessor.js';
import { Exporters } from './exporters.js';
import { UI } from './ui.js';

class App {
  constructor() {
    this.sceneManager = new SceneManager(document.getElementById('viewport'));
    this.keychainBuilder = new KeychainBuilder();
    this.fontManager = new FontManager();
    this.imageProcessor = new ImageProcessor();
    this.exporters = new Exporters();
    this.currentImageGeometry = null;

    this.ui = new UI(this);

    // Load initial font and build
    this.changeFont('Roboto');
  }

  async changeFont(fontName) {
    this.ui.showFontLoading();
    try {
      const font = await this.fontManager.loadFont(fontName);
      this.keychainBuilder.setFont(font);
      this.rebuild();
      this.ui.showToast(`Font "${fontName}" loaded`);
    } catch (e) {
      console.error('Font loading failed:', e);
      this.ui.showToast(`Failed to load "${fontName}"`, 'error');
    } finally {
      this.ui.hideFontLoading();
    }
  }

  async loadImage(file) {
    try {
      await this.imageProcessor.loadImage(file);
      const previewUrl = this.imageProcessor.getPreviewDataUrl();
      this.ui.showImageControls(previewUrl);
      this.rebuild();
      this.ui.showToast('Image loaded');
    } catch (e) {
      console.error('Image loading failed:', e);
      this.ui.showToast('Failed to load image', 'error');
    }
  }

  removeImage() {
    this.imageProcessor.clear();
    this.currentImageGeometry = null;
    this.rebuild();
    this.ui.showToast('Image removed');
  }

  rebuild() {
    const params = this.ui.getParams();
    this.keychainBuilder.setParams(params);

    // Regenerate image geometry if image is loaded
    if (this.imageProcessor.hasImage()) {
      this.currentImageGeometry = this.imageProcessor.generateGeometry({
        resolution: params.imageResolution,
        width: 20,
        height: 20,
        depth: params.imageDepth,
        threshold: params.imageThreshold,
        invert: params.imageInvert,
      });
    } else {
      this.currentImageGeometry = null;
    }

    // Clear and rebuild
    this.sceneManager.clearKeychain();
    const meshes = this.keychainBuilder.build(this.currentImageGeometry);
    meshes.forEach(mesh => this.sceneManager.addToKeychain(mesh));
  }

  exportSTL() {
    try {
      const params = this.ui.getParams();
      this.keychainBuilder.setParams(params);

      const exportGeometry = this.keychainBuilder.buildExportGeometry(this.currentImageGeometry);
      const exportMesh = new THREE.Mesh(exportGeometry);

      const filename = `keychain_${(params.text || 'model').replace(/[^a-zA-Z0-9]/g, '_')}.stl`;
      this.exporters.exportSTL(exportMesh, filename);
      this.ui.showToast('STL exported!');
    } catch (e) {
      console.error('STL export failed:', e);
      this.ui.showToast('Export failed', 'error');
    }
  }

  async export3MF() {
    try {
      const params = this.ui.getParams();
      this.keychainBuilder.setParams(params);

      const exportGeometry = this.keychainBuilder.buildExportGeometry(this.currentImageGeometry);

      // Ensure geometry is non-indexed for 3MF if needed, or keep indexed
      const filename = `keychain_${(params.text || 'model').replace(/[^a-zA-Z0-9]/g, '_')}.3mf`;
      await this.exporters.export3MF(exportGeometry, filename);
      this.ui.showToast('3MF exported!');
    } catch (e) {
      console.error('3MF export failed:', e);
      this.ui.showToast('Export failed', 'error');
    }
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
