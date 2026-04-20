import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
console.log("Testing text geometry bevel segments...");
try {
  // We can't easily load a font synchronously here, but we can test ExtrudeGeometry directly
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(10, 0);
  shape.lineTo(10, 10);
  shape.lineTo(0, 10);
  shape.lineTo(0, 0);

  const testExtrude = (segments) => {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 2,
      bevelSegments: segments
    });
    console.log(`bevelSegments ${segments} works. Vertices: ${geo.attributes.position.count}`);
  };

  testExtrude(3);
  testExtrude(1);
  testExtrude(0);
} catch(e) {
  console.error("Error:", e);
}
