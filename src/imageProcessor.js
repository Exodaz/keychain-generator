import * as THREE from 'three';

export class ImageProcessor {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.currentImage = null;
    this.imageData = null;
  }

  loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.currentImage = img;
          resolve(img);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  getHeightmapData(resolution = 128) {
    if (!this.currentImage) return null;

    const img = this.currentImage;
    this.canvas.width = resolution;
    this.canvas.height = resolution;

    // Calculate aspect-fit dimensions
    const aspect = img.width / img.height;
    let drawW, drawH, offsetX, offsetY;
    if (aspect > 1) {
      drawW = resolution;
      drawH = resolution / aspect;
      offsetX = 0;
      offsetY = (resolution - drawH) / 2;
    } else {
      drawH = resolution;
      drawW = resolution * aspect;
      offsetX = (resolution - drawW) / 2;
      offsetY = 0;
    }

    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, resolution, resolution);
    this.ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

    this.imageData = this.ctx.getImageData(0, 0, resolution, resolution);
    return this.imageData;
  }

  generateGeometry(params = {}) {
    const {
      resolution = 128,
      width = 20,
      height = 20,
      depth = 1,
      threshold = 10,
      invert = false,
    } = params;

    const imgData = this.getHeightmapData(resolution);
    if (!imgData) return null;

    const pixels = imgData.data;
    const segmentsX = resolution - 1;
    const segmentsY = resolution - 1;

    const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const px = Math.floor((i % resolution));
      const py = Math.floor(i / resolution);
      const idx = (py * resolution + px) * 4;

      // Convert to grayscale
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];
      let brightness = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255);

      if (invert) brightness = 255 - brightness;

      // Apply threshold
      if (brightness < threshold) brightness = 0;

      // Normalize to depth
      const z = (brightness / 255) * depth;
      positions.setZ(i, z);
    }

    geometry.computeVertexNormals();
    return geometry;
  }

  generateSolidGeometry(params = {}) {
    const {
      resolution = 128,
      width = 20,
      height = 20,
      depth = 1,
      threshold = 10,
      invert = false,
      baseThickness = 0.2,
    } = params;

    const imgData = this.getHeightmapData(resolution);
    if (!imgData) return null;

    const pixels = imgData.data;

    // Build vertices and faces for a solid mesh
    const topVertices = [];
    const bottomVertices = [];
    const stepX = width / (resolution - 1);
    const stepY = height / (resolution - 1);

    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const idx = (y * resolution + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const a = pixels[idx + 3];
        let brightness = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255);
        if (invert) brightness = 255 - brightness;
        if (brightness < threshold) brightness = 0;

        const z = (brightness / 255) * depth;
        const px = x * stepX - width / 2;
        const py = -(y * stepY - height / 2);

        topVertices.push(px, py, z);
        bottomVertices.push(px, py, 0);
      }
    }

    // Create indexed geometry with top, bottom, and side faces
    const totalVerts = resolution * resolution;
    const positions = new Float32Array(totalVerts * 2 * 3);

    // Top vertices
    for (let i = 0; i < totalVerts * 3; i++) {
      positions[i] = topVertices[i];
    }
    // Bottom vertices
    for (let i = 0; i < totalVerts * 3; i++) {
      positions[totalVerts * 3 + i] = bottomVertices[i];
    }

    const indices = [];

    // Top face
    for (let y = 0; y < resolution - 1; y++) {
      for (let x = 0; x < resolution - 1; x++) {
        const a = y * resolution + x;
        const b = a + 1;
        const c = a + resolution;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    // Bottom face (reversed winding)
    for (let y = 0; y < resolution - 1; y++) {
      for (let x = 0; x < resolution - 1; x++) {
        const a = totalVerts + y * resolution + x;
        const b = a + 1;
        const c = a + resolution;
        const d = c + 1;
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    // Side faces (edges)
    // Top edge
    for (let x = 0; x < resolution - 1; x++) {
      const tl = x;
      const tr = x + 1;
      const bl = totalVerts + x;
      const br = totalVerts + x + 1;
      indices.push(tl, tr, bl);
      indices.push(tr, br, bl);
    }
    // Bottom edge
    for (let x = 0; x < resolution - 1; x++) {
      const row = resolution - 1;
      const tl = row * resolution + x;
      const tr = tl + 1;
      const bl = totalVerts + tl;
      const br = totalVerts + tr;
      indices.push(tl, bl, tr);
      indices.push(tr, bl, br);
    }
    // Left edge
    for (let y = 0; y < resolution - 1; y++) {
      const tl = y * resolution;
      const tr = (y + 1) * resolution;
      const bl = totalVerts + tl;
      const br = totalVerts + tr;
      indices.push(tl, bl, tr);
      indices.push(tr, bl, br);
    }
    // Right edge
    for (let y = 0; y < resolution - 1; y++) {
      const col = resolution - 1;
      const tl = y * resolution + col;
      const tr = (y + 1) * resolution + col;
      const bl = totalVerts + tl;
      const br = totalVerts + tr;
      indices.push(tl, tr, bl);
      indices.push(tr, br, bl);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  hasImage() {
    return this.currentImage !== null;
  }

  getPreviewDataUrl() {
    if (!this.currentImage) return null;
    const previewCanvas = document.createElement('canvas');
    const ctx = previewCanvas.getContext('2d');
    const size = 200;
    previewCanvas.width = size;
    previewCanvas.height = size;
    
    const img = this.currentImage;
    const aspect = img.width / img.height;
    let dw, dh, ox, oy;
    if (aspect > 1) {
      dw = size; dh = size / aspect;
      ox = 0; oy = (size - dh) / 2;
    } else {
      dh = size; dw = size * aspect;
      ox = (size - dw) / 2; oy = 0;
    }
    
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, ox, oy, dw, dh);
    return previewCanvas.toDataURL();
  }

  clear() {
    this.currentImage = null;
    this.imageData = null;
  }
}
