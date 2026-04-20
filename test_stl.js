import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const loader = new FontLoader();
loader.load('http://localhost:5173/fonts/Roboto_Regular.json', (font) => {
  const createGeom = (segs) => {
    return new TextGeometry('Hello', {
      font: font, size: 8, depth: 1, curveSegments: 4,
      bevelEnabled: true, bevelThickness: 0.1, bevelSize: 1, bevelSegments: segs
    });
  };
  
  try {
    const g0 = createGeom(0);
    const g1 = createGeom(1);
    const g6 = createGeom(6);
    console.log("Geometries created:", g0.attributes.position.count, g1.attributes.position.count, g6.attributes.position.count);
  } catch(e) {
    console.error("Error creating geometry:", e);
  }
});
