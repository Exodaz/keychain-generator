import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const points = [
  new THREE.Vector2(0, 0),
  new THREE.Vector2(10, 0),
  new THREE.Vector2(10, 10)
];

const geom = SVGLoader.pointsToStroke(points, {
  strokeWidth: 2,
  strokeLineJoin: 'round', // 'miter', 'bevel', 'round'
  strokeLineCap: 'round'
});

console.log("Vertices:", geom.attributes.position.count);
