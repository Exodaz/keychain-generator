import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.keychainGroup = new THREE.Group();
    this.scene.add(this.keychainGroup);

    this._setupRenderer();
    this._setupCamera();
    this._setupControls();
    this._setupLights();
    this._setupGrid();
    this._setupBackground();

    window.addEventListener('resize', () => this.onResize());
    this.onResize();
    this.animate();
  }

  _setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);
  }

  _setupCamera() {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.set(0, 40, 100);
    this.camera.lookAt(0, 0, 0);
  }

  _setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 300;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  _setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(50, 80, 60);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 200;
    mainLight.shadow.camera.left = -60;
    mainLight.shadow.camera.right = 60;
    mainLight.shadow.camera.top = 60;
    mainLight.shadow.camera.bottom = -60;
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x8ec5fc, 0.4);
    fillLight.position.set(-30, 40, -40);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe0c3fc, 0.3);
    rimLight.position.set(0, -20, -50);
    this.scene.add(rimLight);
  }

  _setupGrid() {
    const gridHelper = new THREE.GridHelper(200, 40, 0x333355, 0x222244);
    gridHelper.position.y = -20;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  _setupBackground() {
    this.scene.background = new THREE.Color(0x0d0d1a);
    this.scene.fog = new THREE.Fog(0x0d0d1a, 150, 350);
  }

  onResize() {
    const rect = this.container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  clearKeychain() {
    while (this.keychainGroup.children.length > 0) {
      const child = this.keychainGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      this.keychainGroup.remove(child);
    }
  }

  addToKeychain(mesh) {
    this.keychainGroup.add(mesh);
  }

  getKeychainGroup() {
    return this.keychainGroup;
  }
}
