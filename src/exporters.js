import * as THREE from 'three';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import JSZip from 'jszip';

export class Exporters {
  constructor() {
    this.stlExporter = new STLExporter();
  }

  exportSTL(mesh, filename = 'keychain.stl') {
    const result = this.stlExporter.parse(mesh, { binary: true });
    const blob = new Blob([result], { type: 'application/octet-stream' });
    this._download(blob, filename);
  }

  async export3MF(geometry, filename = 'keychain.3mf') {
    const positions = geometry.attributes.position;
    const index = geometry.index;

    let vertexData = '';
    let triangleData = '';

    // Build vertices
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i).toFixed(6);
      const y = positions.getY(i).toFixed(6);
      const z = positions.getZ(i).toFixed(6);
      vertexData += `          <vertex x="${x}" y="${y}" z="${z}" />\n`;
    }

    // Build triangles
    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const v1 = index.getX(i);
        const v2 = index.getX(i + 1);
        const v3 = index.getX(i + 2);
        triangleData += `          <triangle v1="${v1}" v2="${v2}" v3="${v3}" />\n`;
      }
    } else {
      for (let i = 0; i < positions.count; i += 3) {
        triangleData += `          <triangle v1="${i}" v2="${i + 1}" v3="${i + 2}" />\n`;
      }
    }

    const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
  xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
  xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
${vertexData}        </vertices>
        <triangles>
${triangleData}        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1" />
  </build>
</model>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
</Types>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>`;

    const zip = new JSZip();
    zip.file('[Content_Types].xml', contentTypesXml);
    zip.file('_rels/.rels', relsXml);
    zip.file('3D/3dmodel.model', modelXml);

    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.ms-package.3dmanufacturing' });
    this._download(blob, filename);
  }

  _download(blob, filename) {
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }, 100);
  }
}
