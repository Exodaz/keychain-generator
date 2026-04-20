import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { Evaluator, Brush } from 'three-bvh-csg';
import ClipperLib from 'clipper-lib';

export const DEFAULT_PARAMS = {
  text: 'Hello',
  baseWidth: 70,
  baseHeight: 30,
  baseThickness: 3,
  cornerRadius: 3,
  textSize: 8,
  textDepth: 1.5,
  textOffsetX: 0,
  textOffsetY: 0,
  textStrokeWidth: 1.5,
  textStrokeJoin: 'round',
  textStrokeResolution: 32,
  holeDiameter: 4,
  holeOffsetX: -25,
  holeOffsetY: 0,
  holeAutoPosition: true,
  showBase: false,
  imageDepth: 1,
  imageScale: 50,
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageResolution: 64,
  imageThreshold: 10,
  imageInvert: false,
};

export class KeychainBuilder {
  constructor() {
    this.params = { ...DEFAULT_PARAMS };
    this.font = null;
    this.material = new THREE.MeshPhysicalMaterial({
      color: 0x8ec5fc,
      metalness: 0.1,
      roughness: 0.3,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
      side: THREE.DoubleSide,
    });
    this.textMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe0c3fc,
      metalness: 0.2,
      roughness: 0.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
    });
    this.strokeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.3,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
    });
    this.imageMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5d0fe,
      metalness: 0.15,
      roughness: 0.25,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
    });
  }

  setFont(font) {
    this.font = font;
  }

  setParams(params) {
    Object.assign(this.params, params);
  }

  setColor(hex) {
    this.material.color.set(hex);
  }

  setTextColor(hex) {
    this.textMaterial.color.set(hex);
  }

  setStrokeColor(hex) {
    this.strokeMaterial.color.set(hex);
  }

  _createRoundedRectShape(width, height, radius) {
    const shape = new THREE.Shape();
    const w = width / 2;
    const h = height / 2;
    const r = Math.min(radius, w, h);

    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);

    return shape;
  }

  _createBaseGeometry() {
    if (!this.params.showBase) return null;
    const { baseWidth, baseHeight, baseThickness, cornerRadius } = this.params;
    const shape = this._createRoundedRectShape(baseWidth, baseHeight, cornerRadius);

    const extrudeSettings = {
      depth: baseThickness,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 3,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  _getActualHolePosition(textWidth = 0) {
    const { holeAutoPosition, holeOffsetX, holeOffsetY, textOffsetX, textOffsetY, holeDiameter } = this.params;
    if (holeAutoPosition && textWidth > 0) {
      // Position the hole right next to the left side of the text, matching text's Y offset
      const padding = 2;
      return {
        hx: textOffsetX - (textWidth / 2) - (holeDiameter / 2) - padding,
        hy: textOffsetY
      };
    }
    return { hx: holeOffsetX, hy: holeOffsetY };
  }

  _createHoleGeometry(textWidth = 0) {
    const { holeDiameter, baseThickness, showBase } = this.params;
    const holeRadius = holeDiameter / 2;
    const { hx, hy } = this._getActualHolePosition(textWidth);

    const ringOuter = holeRadius + 2;
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, ringOuter, 0, Math.PI * 2, false);
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    ringShape.holes.push(holePath);

    const ringGeometry = new THREE.ExtrudeGeometry(ringShape, {
      depth: baseThickness,
      bevelEnabled: false,
    });
    ringGeometry.translate(hx, hy, 0);
    return ringGeometry;
  }

  _createHoleSubtractGeometry(textWidth = 0) {
    const { holeDiameter, baseThickness, showBase } = this.params;
    const holeRadius = holeDiameter / 2;
    const { hx, hy } = this._getActualHolePosition(textWidth);

    // Increase radius slightly (0.05) to ensure clean CSG cut and prevent coplanar face artifacts
    const holeGeometry = new THREE.CylinderGeometry(holeRadius + 0.05, holeRadius + 0.05, baseThickness + 4, 32);
    holeGeometry.rotateX(Math.PI / 2);
    holeGeometry.translate(hx, hy, baseThickness / 2);

    return { geometry: holeGeometry, position: { x: hx, y: hy } };
  }

  _createTextGeometry() {
    if (!this.font || !this.params.text) return null;

    const { text, textSize, textDepth, textOffsetX, textOffsetY, baseThickness, showBase } = this.params;

    try {
      // If showing base, sink into base by 0.1mm for perfect CSG overlap
      // If no base, sink into stroke by 0.1mm
      const zOffset = showBase ? baseThickness - 0.1 : baseThickness - 0.1;
      const actualDepth = textDepth + 0.1; // Compensate for the 0.1mm sink

      const textGeometry = new TextGeometry(text, {
        font: this.font,
        size: textSize,
        depth: actualDepth,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 3,
      });

      textGeometry.computeBoundingBox();
      const bb = textGeometry.boundingBox;
      const textWidth = bb.max.x - bb.min.x;
      const textHeight = bb.max.y - bb.min.y;

      textGeometry.translate(
        -textWidth / 2 + textOffsetX,
        -textHeight / 2 + textOffsetY,
        zOffset
      );

      return { geometry: textGeometry, width: textWidth, height: textHeight };
    } catch (e) {
      console.warn('Text geometry creation failed:', e);
      return null;
    }
  }

  _createTextStrokeGeometry(mainTextWidth, mainTextHeight) {
    if (!this.font || !this.params.text || this.params.textStrokeWidth <= 0) return null;
    const { text, textSize, textDepth, textOffsetX, textOffsetY, baseThickness, textStrokeWidth, textStrokeJoin, showBase } = this.params;

    // If showing base, stroke acts as a middle layer. Sink it into base by 0.1mm.
    // If no base, stroke acts as the base itself (from Z=0).
    const depth = showBase ? (textDepth * 0.5) + 0.1 : baseThickness;
    const zOffset = showBase ? baseThickness - 0.1 : 0;

    try {
      const shapes = this.font.generateShapes(text, textSize);
      const scale = 1000; // Clipper uses integer coordinates
      
      let clipperJoinType;
      if (textStrokeJoin === 'round') {
        clipperJoinType = ClipperLib.JoinType.jtRound;
      } else if (textStrokeJoin === 'bevel') {
        clipperJoinType = ClipperLib.JoinType.jtSquare;
      } else {
        clipperJoinType = ClipperLib.JoinType.jtMiter;
      }

      // We can control the roundness resolution using ArcTolerance
      // Smaller tolerance = smoother curves.
      const arcTolerance = this.params.textStrokeResolution ? 0.25 * (32 / this.params.textStrokeResolution) : 0.25;
      const offseter = new ClipperLib.ClipperOffset(2, arcTolerance);

      for (const shape of shapes) {
        const points = shape.extractPoints(6); 
        
        const outerPath = points.shape.map(p => ({ X: Math.round(p.x * scale), Y: Math.round(p.y * scale) }));
        offseter.AddPath(outerPath, clipperJoinType, ClipperLib.EndType.etClosedPolygon);
        
        for (const hole of points.holes) {
          const holePath = hole.map(p => ({ X: Math.round(p.x * scale), Y: Math.round(p.y * scale) }));
          offseter.AddPath(holePath, clipperJoinType, ClipperLib.EndType.etClosedPolygon);
        }
      }

      const polyTree = new ClipperLib.PolyTree();
      offseter.Execute(polyTree, textStrokeWidth * scale);

      const resultShapes = [];

      function addNodes(node) {
        if (!node.IsHole()) {
          const shape = new THREE.Shape();
          const path = node.Contour();
          if (path.length > 0) {
            shape.moveTo(path[0].X / scale, path[0].Y / scale);
            for (let i = 1; i < path.length; i++) {
              shape.lineTo(path[i].X / scale, path[i].Y / scale);
            }
          }
          
          for (const child of node.Childs()) {
            const holePath = child.Contour();
            if (holePath.length > 0) {
              const hole = new THREE.Path();
              hole.moveTo(holePath[0].X / scale, holePath[0].Y / scale);
              for (let i = 1; i < holePath.length; i++) {
                hole.lineTo(holePath[i].X / scale, holePath[i].Y / scale);
              }
              shape.holes.push(hole);
              
              for (const island of child.Childs()) {
                addNodes(island);
              }
            }
          }
          
          resultShapes.push(shape);
        }
      }

      for (const child of polyTree.Childs()) {
        addNodes(child);
      }

      const strokeGeom = new THREE.ExtrudeGeometry(resultShapes, {
        depth: depth,
        bevelEnabled: false,
        curveSegments: 12
      });

      strokeGeom.translate(
        -mainTextWidth / 2 + textOffsetX,
        -mainTextHeight / 2 + textOffsetY,
        zOffset
      );
      
      strokeGeom.computeVertexNormals();
      return strokeGeom;
    } catch (e) {
      console.warn('Text stroke geometry creation failed:', e);
      return null;
    }
  }

  build(imageGeometry = null) {
    const meshes = [];

    // Text (Needs to be generated first to know dimensions for auto-hole position)
    const textResult = this._createTextGeometry();
    const textWidth = textResult ? textResult.width : 0;
    
    if (textResult) {
      const textMesh = new THREE.Mesh(textResult.geometry, this.textMaterial);
      textMesh.castShadow = true;
      meshes.push(textMesh);

      // Text stroke
      const strokeGeometry = this._createTextStrokeGeometry(textResult.width, textResult.height);
      if (strokeGeometry) {
        const strokeMesh = new THREE.Mesh(strokeGeometry, this.strokeMaterial);
        strokeMesh.castShadow = true;
        meshes.push(strokeMesh);
      }
    }

    // Base plate
    const baseGeometry = this._createBaseGeometry();
    if (baseGeometry) {
      const baseMesh = new THREE.Mesh(baseGeometry, this.material);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      meshes.push(baseMesh);
    }

    // Hole ring
    const ringGeometry = this._createHoleGeometry(textWidth);
    const ringMesh = new THREE.Mesh(ringGeometry, this.params.showBase ? this.material : this.strokeMaterial);
    ringMesh.castShadow = true;
    meshes.push(ringMesh);

    // Hole indicator (dark cylinder to show the hole visually)
    const holeInfo = this._createHoleSubtractGeometry(textWidth);
    const holeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0d0d1a,
      metalness: 0,
      roughness: 0.8,
      transparent: true,
      opacity: 0.9,
    });
    const holeMesh = new THREE.Mesh(holeInfo.geometry, holeMaterial);
    meshes.push(holeMesh);

    // Image relief
    if (imageGeometry) {
      const { imageScale, imageOffsetX, imageOffsetY, baseThickness, baseWidth, baseHeight } = this.params;
      const scale = imageScale / 100;
      const imgMesh = new THREE.Mesh(imageGeometry, this.imageMaterial);
      
      const maxDim = Math.min(baseWidth, baseHeight) * 0.8;
      imgMesh.scale.set(
        scale * maxDim / 20,
        scale * maxDim / 20,
        1
      );
      imgMesh.position.set(imageOffsetX, imageOffsetY, baseThickness + 0.3);
      imgMesh.castShadow = true;
      meshes.push(imgMesh);
    }

    return meshes;
  }

  buildExportGeometry(imageGeometry = null) {
    const geometries = [];

    // Text
    const textResult = this._createTextGeometry();
    const textWidth = textResult ? textResult.width : 0;
    
    if (textResult) {
      geometries.push(textResult.geometry);
      const strokeGeometry = this._createTextStrokeGeometry(textResult.width, textResult.height);
      if (strokeGeometry) geometries.push(strokeGeometry);
    }

    // Base plate
    const baseGeometry = this._createBaseGeometry();
    if (baseGeometry) {
      geometries.push(baseGeometry);
    }

    // Ring
    const ringGeometry = this._createHoleGeometry(textWidth);
    geometries.push(ringGeometry);

    // Image
    if (imageGeometry) {
      const { imageScale, imageOffsetX, imageOffsetY, baseThickness, baseWidth, baseHeight } = this.params;
      const scale = imageScale / 100;
      const maxDim = Math.min(baseWidth, baseHeight) * 0.8;
      const cloned = imageGeometry.clone();
      
      const matrix = new THREE.Matrix4();
      matrix.compose(
        new THREE.Vector3(imageOffsetX, imageOffsetY, baseThickness + 0.3),
        new THREE.Quaternion(),
        new THREE.Vector3(scale * maxDim / 20, scale * maxDim / 20, 1)
      );
      cloned.applyMatrix4(matrix);
      geometries.push(cloned);
    }

    // Hole subtract geometry
    const holeInfo = this._createHoleSubtractGeometry(textWidth);
    const holeGeo = holeInfo.geometry;

    try {
      const evaluator = new Evaluator();
      evaluator.useGroups = false;
      let finalBrush = null;

      // Union all positive geometries
      for (const geom of geometries) {
        const clean = new THREE.BufferGeometry();
        clean.setAttribute('position', geom.getAttribute('position').clone());
        if (geom.index) {
          clean.setIndex(geom.index.clone());
        } else {
          const count = clean.getAttribute('position').count;
          const indices = new Uint32Array(count);
          for (let i = 0; i < count; i++) indices[i] = i;
          clean.setIndex(new THREE.BufferAttribute(indices, 1));
        }

        const brush = new Brush(clean);
        brush.updateMatrixWorld();

        if (!finalBrush) {
          finalBrush = brush;
        } else {
          finalBrush = evaluator.evaluate(finalBrush, brush, 0); // ADDITION
        }
      }

      // Subtract the hole
      if (finalBrush && holeGeo) {
        const cleanHole = new THREE.BufferGeometry();
        cleanHole.setAttribute('position', holeGeo.getAttribute('position').clone());
        if (holeGeo.index) {
          cleanHole.setIndex(holeGeo.index.clone());
        } else {
          const count = cleanHole.getAttribute('position').count;
          const indices = new Uint32Array(count);
          for (let i = 0; i < count; i++) indices[i] = i;
          cleanHole.setIndex(new THREE.BufferAttribute(indices, 1));
        }
        
        const holeBrush = new Brush(cleanHole);
        holeBrush.updateMatrixWorld();
        finalBrush = evaluator.evaluate(finalBrush, holeBrush, 1); // SUBTRACTION
      }

      if (finalBrush) {
        let resultGeom = finalBrush.geometry;
        
        // Critically important for 3MF: Weld vertices to close any topological seams left by CSG
        resultGeom = mergeVertices(resultGeom, 1e-5);
        resultGeom.computeVertexNormals();
        return resultGeom;
      }
      return baseGeometry;
    } catch (e) {
      console.warn('CSG Merge failed, falling back to simple merge:', e);
      const cleanGeometries = geometries.map(g => {
        const clean = new THREE.BufferGeometry();
        clean.setAttribute('position', g.getAttribute('position').clone());
        if (g.index) clean.setIndex(g.index.clone());
        return clean;
      });
      
      const merged = mergeGeometries(cleanGeometries, false);
      if (merged) merged.computeVertexNormals();
      return merged;
    }
  }
}
