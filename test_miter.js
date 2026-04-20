import * as THREE from 'three';
const shape = new THREE.Shape();
shape.moveTo(0, 0); shape.lineTo(10, 0); shape.lineTo(10, 10); shape.lineTo(0, 10); shape.lineTo(0, 0);

const checkExtrude = (segs) => {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 2, bevelSegments: segs });
  geo.computeBoundingBox();
  console.log(`segs: ${segs}, width: ${geo.boundingBox.max.x - geo.boundingBox.min.x}`);
};
checkExtrude(3);
checkExtrude(1);
checkExtrude(0);
