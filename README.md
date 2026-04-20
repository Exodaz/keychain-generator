# 3D Keychain Name Generator 🗝️

A web-based, real-time 3D keychain generator built specifically for **3D Printing**. This tool allows users to dynamically generate custom text keychains with advanced typography, stroke settings, and precise dimensional control, outputting perfectly manifold (solid) STL files ready for your 3D slicer.

![Keychain Generator UI](https://raw.githubusercontent.com/Exodaz/keychain-generator/main/public/favicon.svg) <!-- You can replace this with an actual screenshot -->

## ✨ Features

- **Real-Time 3D Preview**: Powered by Three.js, view your customized keychain from any angle instantly.
- **Advanced 2D Stroke Algorithms**: Uses `clipper-lib` to generate perfect 2D vector offsets for your text's stroke, completely avoiding 3D artifacting.
- **Stroke Join Styles**: Choose between **Round**, **Bevel**, or **Miter** joins for your text stroke.
- **Dynamic Hole Positioning**: The keychain attachment hole auto-calculates its position to always stay attached to the edge of the text, or can be positioned manually.
- **Customizable Dimensions**: Control depth, thickness, scaling, offsets, and hole diameter with precision (in millimeters).
- **Floating Text Design**: Toggle the base plate to create beautiful "floating" text designs held together only by the stroke contour.
- **Manifold Mesh Export (CSG)**: Uses `three-bvh-csg` (Constructive Solid Geometry) to perform true mathematical boolean unions and subtractions under the hood. This guarantees that exported STL files are 100% solid, free from internal intersecting geometry, and will not throw "non-manifold edge" errors in Cura, PrusaSlicer, or Bambu Studio.

## 🛠️ Technology Stack

- **[Vite](https://vitejs.dev/)** - Fast frontend build tool.
- **[Three.js](https://threejs.org/)** - Core 3D rendering and geometry generation.
- **[ClipperLib](http://www.angusj.com/delphi/clipper.php)** - Industry-standard library used for true 2D vector polygon offsetting (Stroke).
- **[three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg)** - Lightning-fast CSG boolean operations to guarantee 3D printable meshes.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Exodaz/keychain-generator.git
   cd keychain-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/`.

## 🖨️ 3D Printing Tips

- **Export Format**: The app currently exports clean **STL** files. (3MF support is coming soon!).
- **Orientation**: The generated STL is oriented flat on the XY plane. You can drop it directly into your slicer without rotating.
- **Slicer Settings**: The models are highly optimized. Standard 0.2mm or 0.16mm layer heights work perfectly. 

## 📝 License

This project is open-source and available under the MIT License.
