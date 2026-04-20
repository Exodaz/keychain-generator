import ClipperLib from 'clipper-lib';

console.log('ClipperLib version:', ClipperLib.version);

const co = new ClipperLib.ClipperOffset();
const path = [{X:0, Y:0}, {X:100, Y:0}, {X:100, Y:100}, {X:0, Y:100}];
co.AddPath(path, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);

const polyTree = new ClipperLib.PolyTree();
co.Execute(polyTree, 10);

console.log('PolyTree childs:', polyTree.ChildCount());
for (let i=0; i < polyTree.ChildCount(); i++) {
  const child = polyTree.Childs()[i];
  console.log('IsHole:', child.IsHole(), 'Contour len:', child.Contour().length);
}
