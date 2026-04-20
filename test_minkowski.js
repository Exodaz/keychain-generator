import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const loader = new FontLoader();
loader.load('http://localhost:5173/fonts/Roboto_Regular.json', (font) => {
  const baseGeom = new TextGeometry('Hello', { font: font, size: 8, depth: 1, curveSegments: 4, bevelEnabled: false });
  const geometries = [baseGeom];
  const N = 12;
  const stroke = 2;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2;
    const clone = baseGeom.clone();
    clone.translate(Math.cos(angle) * stroke, Math.sin(angle) * stroke, 0);
    geometries.push(clone);
  }
  
  try {
    const merged = mergeGeometries(geometries, false);
    console.log("Minkowski geometry created successfully. Vertices:", merged.attributes.position.count);
  } catch(e) {
    console.error("Merge failed:", e);
  }
});
