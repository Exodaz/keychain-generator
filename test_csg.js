import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Evaluator, Brush } from 'three-bvh-csg';

const loader = new FontLoader();
loader.load('http://localhost:5173/fonts/Roboto_Regular.json', (font) => {
  console.time('CSG Union 16 Copies');
  const baseGeom = new TextGeometry('Hello', { font: font, size: 8, depth: 1, curveSegments: 4, bevelEnabled: false });
  const evaluator = new Evaluator();
  evaluator.useGroups = false;
  
  let resultBrush = new Brush(baseGeom);
  resultBrush.updateMatrixWorld();
  
  const N = 16;
  const stroke = 2;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2;
    const clone = baseGeom.clone();
    clone.translate(Math.cos(angle) * stroke, Math.sin(angle) * stroke, 0);
    const brush = new Brush(clone);
    brush.updateMatrixWorld();
    
    resultBrush = evaluator.evaluate(resultBrush, brush, 0); // 0 = ADDITION
  }
  
  console.timeEnd('CSG Union 16 Copies');
  console.log("Vertices:", resultBrush.geometry.attributes.position.count);
});
