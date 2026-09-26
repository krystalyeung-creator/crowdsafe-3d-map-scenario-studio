import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
import {mergeGeometries} from 'https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/utils/BufferGeometryUtils.js';
const $=id=>document.getElementById(id), world=$('world'), labels=$('labels'), overlay=$('overlay'), actions=$('actions'), prompt=$('prompt');
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb7d3df);scene.fog=new THREE.FogExp2(0xb7d3df,.006);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,260);let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch(error){$('intro').innerHTML='<div><h1>無法啟動 3D 畫面</h1><p>此瀏覽器未能建立 WebGL 畫面。請用最新版 Chrome 或 Edge 開啟此 HTML，並啟用硬件加速。</p></div>';throw error}renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.75));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.65;world.append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd6e9f6,0x74604d,2.3));const sun=new THREE.DirectionalLight(0xffd4a5,3.0);sun.position.set(-18,27,10);sun.castShadow=true;sun.shadow.mapSize.set(innerWidth<700?1024:1536,innerWidth<700?1024:1536);sun.shadow.camera.left=-46;sun.shadow.camera.right=46;sun.shadow.camera.top=48;sun.shadow.camera.bottom=-48;sun.shadow.bias=-.0004;scene.add(sun);const fireLight=new THREE.PointLight(0xff862e,3.8,18);fireLight.position.set(5,2,-9);scene.add(fireLight);
const M={stone:new THREE.MeshStandardMaterial({color:0x7b817e,roughness:.92}),floor:new THREE.MeshStandardMaterial({color:0x918a7a,roughness:.9}),wood:new THREE.MeshStandardMaterial({color:0x6c342a,roughness:.72}),red:new THREE.MeshStandardMaterial({color:0x9b3e31,roughness:.6}),darkRed:new THREE.MeshStandardMaterial({color:0x4a2421,roughness:.7}),teal:new THREE.MeshStandardMaterial({color:0x26575b,roughness:.58}),gold:new THREE.MeshStandardMaterial({color:0xb99453,metalness:.65,roughness:.35}),paper:new THREE.MeshStandardMaterial({color:0xf5e8c8,emissive:0x8b704a,emissiveIntensity:.2,side:THREE.DoubleSide}),roof:new THREE.MeshStandardMaterial({color:0x39474b,roughness:.75,side:THREE.DoubleSide}),water:new THREE.MeshStandardMaterial({color:0x366573,metalness:.4,roughness:.25,transparent:true,opacity:.83}),soil:new THREE.MeshStandardMaterial({color:0x45604a,roughness:1}),black:new THREE.MeshStandardMaterial({color:0x292c2b,metalness:.55,roughness:.48}),green:new THREE.MeshStandardMaterial({color:0x2d713a,roughness:.85,side:THREE.DoubleSide}),beef:new THREE.MeshStandardMaterial({color:0x9d3936,roughness:.8}),pear:new THREE.MeshStandardMaterial({color:0xbda75a,roughness:.66}),rice:new THREE.MeshStandardMaterial({color:0xe8d9b3,roughness:.85}),skin:new THREE.MeshStandardMaterial({color:0xd9b391,roughness:.85}),cream:new THREE.MeshStandardMaterial({color:0xd9c5a6,roughness:.9}),flame:new THREE.MeshBasicMaterial({color:0xffa323,transparent:true,opacity:.8,depthWrite:false}),smoke:new THREE.MeshBasicMaterial({color:0xbec8bc,transparent:true,opacity:.12,depthWrite:false})};
function mesh(g,m,x=0,y=0,z=0,parent=scene){let o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}function box(w,h,d,m,x,y,z,p=scene){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,p)}function cyl(r1,r2,h,m,x,y,z,p=scene,n=12){return mesh(new THREE.CylinderGeometry(r1,r2,h,n),m,x,y,z,p)}function ball(r,m,x,y,z,p=scene){return mesh(new THREE.SphereGeometry(r,14,10),m,x,y,z,p)}function line(a,b,r,m,p=scene){let d=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a));let o=mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m,0,0,0,p);o.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o}
// Courtyard, pond, bridge, gate and trees: all real world-space meshes.
box(95,.4,100,M.soil,0,-.3,12);box(65,.12,11,M.stone,0,.01,17);for(let z=2;z<43;z+=2)for(let x=-3;x<=3;x+=2){let tile=box(1.9,.04,1.9,M.floor,x,.1,z);tile.position.y+=Math.random()*.012}
for(let side of [-1,1]){let pond=box(16,.05,25,M.water,side*18,-.03,18);for(let j=0;j<13;j++){let x=side*(12+Math.random()*12),z=7+Math.random()*22;let leaf=cyl(.45,.45,.03,M.green,x,.03,z,scene,12);leaf.scale.z=.72;if(j%4===0)ball(.19,M.pear,x,.22,z)}for(let j=0;j<4;j++){let x=side*(15+j*3),z=6+j*7;cyl(.55,.8,1.2,M.stone,x,.6,z);box(.9,.08,.9,M.paper,x,1.23,z);let roof=cyl(.7,.45,.35,M.roof,x,1.43,z);roof.rotation.y=.3}}
function tree(x,z,s=1){cyl(.24*s,.36*s,3*s,M.wood,x,1.5*s,z);for(let i=0;i<4;i++)ball((1.35+i*.1)*s,M.green,x+(i%2?-.6:.6)*s,(2.7+(i%3)*.4)*s,z+(i-1.5)*.35*s)}for(let [x,z,s] of [[-25,32,1.4],[24,35,1.6],[-27,6,1.2],[29,2,1.3]])tree(x,z,s);
// Architectural detail informed by the supplied palace facade: raised stone base,
// coloured dancheong brackets, tiled eaves and layered roof silhouette.
for(let z of [1.7,2.35,3])box(24,.27,.55,M.stone,0,.16+(3-z)*.17,z);
const roofGroup=new THREE.Group();scene.add(roofGroup);
// Reusable roof surface, curved ends, crest, and batched ceramic courses.
const roofTiles=new THREE.MeshStandardMaterial({color:0x303b41,roughness:.78,metalness:.06});
const roofEdge=new THREE.MeshStandardMaterial({color:0x313c40,roughness:.76,side:THREE.DoubleSide});
const roofSoffit=new THREE.MeshStandardMaterial({color:0xa77950,roughness:.86,side:THREE.DoubleSide});
const roofFascia=new THREE.MeshStandardMaterial({color:0x39716e,roughness:.78,side:THREE.DoubleSide});
const paintedBlue=new THREE.MeshStandardMaterial({color:0x376b6b,roughness:.76});
const paintedGreen=new THREE.MeshStandardMaterial({color:0x49704e,roughness:.8});
const paintedOrange=new THREE.MeshStandardMaterial({color:0xc87843,roughness:.76});
// Hipped roof: ridge runs along X, with four sloping faces and lifted corners.
function roofHeight(x,z,cx,cz,halfW,halfD,ridge,eave){
 const u=Math.abs(x-cx)/halfW,v=Math.abs(z-cz)/halfD;
 const hip=Math.max(v,Math.max(0,(u-.60)/.40));
 return ridge-(ridge-eave)*Math.min(1,hip)**.72+.40*hip**8+.30*u**10*v**6;
}
function pitchedRoof(parent,cx,cz,halfW,halfD,ridge,eave){
 const firstChild=parent.children.length;
 const nx=48,nz=32,count=(nx+1)*(nz+1),vertices=[],indices=[];
 const at=(i,j)=>i*(nz+1)+j;
 for(let layer=0;layer<2;layer++)for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){
  const x=cx-halfW+2*halfW*i/nx,z=cz-halfD+2*halfD*j/nz;
  vertices.push(x,roofHeight(x,z,cx,cz,halfW,halfD,ridge,eave)-(layer?.18:0),z);
 }
 const face=(a,b,c,d)=>indices.push(a,b,c,a,c,d);
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=at(i,j),b=at(i+1,j),c=at(i+1,j+1),d=at(i,j+1);face(d,c,b,a)}
 const topCount=indices.length;
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=at(i,j),b=at(i+1,j),c=at(i+1,j+1),d=at(i,j+1);face(count+a,count+b,count+c,count+d)}
 const undersideCount=indices.length-topCount;
 for(let i=0;i<nx;i++){let a=at(i,0),b=at(i+1,0);face(a,b,count+b,count+a);a=at(i,nz);b=at(i+1,nz);face(b,a,count+a,count+b)}
 for(let j=0;j<nz;j++){let a=at(0,j),b=at(0,j+1);face(b,a,count+a,count+b);a=at(nx,j);b=at(nx,j+1);face(a,b,count+b,count+a)}
 const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geom.setIndex(indices);
 geom.addGroup(0,topCount,0);geom.addGroup(topCount,undersideCount,1);geom.addGroup(topCount+undersideCount,indices.length-topCount-undersideCount,2);geom.computeVertexNormals();geom.computeBoundingBox();
 const shell=mesh(geom,[roofEdge,roofSoffit,roofFascia],0,0,0,parent);shell.userData.roofShell=true;
 // Guard real coordinates, not just edge connectivity.
 if(geom.attributes.position.count!==count*2||!vertices.every(Number.isFinite)||Math.max(...indices)>=count*2)throw Error('Invalid palace roof coordinates');
 function tube(points,r,material){let o=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,r,6,false),material,0,0,0,parent);o.castShadow=false;return o}
 const point=(x,z,lift=.08)=>new THREE.Vector3(x,roofHeight(x,z,cx,cz,halfW,halfD,ridge,eave)+lift,z);
 // Continuous raised tile rolls follow each slope from ridge to eave.
 for(let x=cx-halfW+.16;x<cx+halfW;x+=.38)for(let side of [-1,1]){
  const pts=[];for(let j=0;j<=16;j++)pts.push(point(x,cz+side*halfD*j/16));tube(pts,.075,roofTiles);
  const end=pts[16];const cap=cyl(.105,.105,.06,M.stone,end.x,end.y,end.z,parent,10);cap.rotation.x=Math.PI/2;cap.castShadow=false;
 }
 for(let side of [-1,1]){
  const pts=[];for(let i=0;i<=24;i++)pts.push(point(cx-halfW+2*halfW*i/24,cz+side*halfD));tube(pts,.12,roofEdge);
  const edge=[];for(let i=0;i<=24;i++)edge.push(point(cx+side*halfW,cz-halfD+2*halfD*i/24));tube(edge,.12,roofEdge);
 }
 for(let sx of [-1,1])for(let sz of [-1,1]){
  const pts=[];for(let t=0;t<=16;t++){const f=t/16;pts.push(point(cx+sx*halfW*(.6+.4*f),cz+sz*halfD*f,.17))}tube(pts,.13,roofEdge);
  for(let k=0;k<4;k++){const f=.66+k*.085;const q=point(cx+sx*halfW*(.6+.4*f),cz+sz*halfD*f,.3);cyl(.075,.12,.23,roofEdge,q.x,q.y,q.z,parent,8)}
 }
 line([cx-halfW*.6,ridge+.19,cz],[cx+halfW*.6,ridge+.19,cz],.16,roofEdge,parent);
 for(let side of [-1,1]){let x=cx+side*halfW*.6;cyl(.15,.22,.48,roofEdge,x,ridge+.36,cz,parent,12)}
 // Batch static tile rolls and ornaments by material to reduce draw calls.
 const batches=new Map();for(const o of parent.children.slice(firstChild)){if(o===shell||!o.isMesh||Array.isArray(o.material))continue;o.updateMatrix();const g=o.geometry.clone().applyMatrix4(o.matrix).toNonIndexed();g.deleteAttribute('uv');g.deleteAttribute('normal');if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(g);parent.remove(o);}
 for(const [mat,geoms] of batches){const g=mergeGeometries(geoms,false);g.computeVertexNormals();const o=mesh(g,mat,0,0,0,parent);o.castShadow=false;for(const part of geoms)part.dispose()}
 return shell;
}
// Palace facade from the supplied reference: deep eaves, layered bracket rhythm,
// red structural bays, paper lattice and stone plinth. These are concept art forms.
pitchedRoof(roofGroup,0,-8,13.2,10.4,8.95,7.38);
// A second roof tier gives the hall the stepped palace silhouette in the
// supplied frontal photograph. Its enclosed volume intersects the lower roof.
// Open framed storey: walls are individual plaster panels, not an opaque slab.
box(14.7,.25,12,M.wood,0,8.22,-8,roofGroup);
for(let z of [-14.05,-1.95]){
 box(14.7,2.45,.13,M.cream,0,10.18,z,roofGroup);
 for(let y of [8.98,11.35])box(15.1,.18,.3,M.red,0,y,z,roofGroup)
}
for(let x of [-7.35,7.35]){
 box(.14,2.45,11.9,M.cream,x,10.18,-8,roofGroup);
 for(let y of [8.98,11.35])box(.27,.17,12.2,M.red,x,y,-8,roofGroup);
 for(let z=-12.6;z<=-3.4;z+=2.3){box(.18,2.35,.28,M.red,x,10.18,z,roofGroup);box(.06,1.18,1.45,M.paper,x+(x>0?.1:-.1),10.3,z,roofGroup)}
}
for(let x of [-6.7,-3.3,0,3.3,6.7])for(let z of [-13.9,-2.1]){
 cyl(.25,.27,3.15,M.red,x,9.65,z,roofGroup,12);box(.73,.14,.73,M.gold,x,11.2,z,roofGroup)
}
for(let z of [-14.15,-1.85])for(let x of [-4.9,-1.65,1.65,4.9]){
 box(2.4,1.12,.075,M.paper,x,10.34,z,roofGroup);
 for(let dx of [-.82,-.4,0,.4,.82])box(.045,1.16,.13,M.wood,x+dx,10.34,z+.08,roofGroup);
 for(let y of [9.98,10.34,10.7])box(2.5,.05,.13,M.wood,x,y,z+.085,roofGroup)
}
for(let x=-6.5;x<=6.5;x+=1.05){box(.7,.14,.67,paintedGreen,x,11.24,-1.88,roofGroup);box(.51,.1,.7,M.gold,x,11.02,-1.88,roofGroup)}
pitchedRoof(roofGroup,0,-8,9.1,7.1,13.15,11.35);

for(let z of [-16.7,1.05]){
 box(25,.23,.9,M.darkRed,0,6.95,z);box(26.8,.14,1,M.teal,0,7.21,z);
 for(let x=-11.2;x<=11.2;x+=1.28){
  box(.16,.66,.8,M.red,x,6.4,z);box(.83,.16,.8,paintedBlue,x,6.77,z);box(.68,.12,.78,M.gold,x,6.56,z);box(.57,.13,.8,paintedGreen,x,6.36,z);
  box(.19,.28,.83,paintedOrange,x,6.18,z);ball(.075,M.gold,x,6.41,z+.45)
 }
}
for(let x of [-10.5,-5.3,0,5.3,10.5])for(let z of [-16.6,1]){for(let y of [2.7,4.8])cyl(.42,.42,.085,M.gold,x,y,z,scene,16);box(.95,.26,1.02,paintedGreen,x,6.58,z)}
// The facade is shown for outside inspection, then removed for open kitchen play.
const facade=new THREE.Group();scene.add(facade);
for(let x of [-8,-4.3,4.3,8]){
 box(3.1,4.05,.12,M.paper,x,3.93,1.18,facade);box(3.45,.17,.25,M.wood,x,6,1.26,facade);box(3.45,.17,.25,M.wood,x,1.89,1.26,facade);
 for(let dx=-1.4;dx<=1.4;dx+=.4)box(.045,4,.15,M.wood,x+dx,3.93,1.31,facade);
 for(let y=2.1;y<6;y+=.42)box(3.1,.042,.15,M.wood,x,y,1.32,facade)
}
for(let side of [-1,1]){box(.3,4.1,.32,M.red,side*1.6,3.92,1.25,facade);box(.07,3.9,.22,M.gold,side*1.42,3.92,1.33,facade)}
box(3.3,.21,.45,M.darkRed,0,6.06,1.23,facade);box(3.2,.43,.23,M.teal,0,5.74,1.24,facade);
for(let x of [-10.8,10.8])for(let z of [-15,-11,-7,-3]){box(.18,1.8,.65,M.wood,x,4.15,z);for(let y of [3.45,3.9,4.35,4.8])box(.2,.05,3.7,M.paper,x,y,z)}
// Receding side halls frame the main building instead of leaving a flat horizon.
const palaceWings=new THREE.Group();scene.add(palaceWings);
function sideHall(cx,cz){let halfW=6.7,halfD=9.3;
 box(13.6,.55,19.2,M.stone,cx,.08,cz,palaceWings);
 for(let z of [cz-8.9,cz+8.9]){box(12.8,5.35,.22,M.cream,cx,2.85,z,palaceWings);for(let y of [.6,3.25,5.45])box(13,.16,.3,M.red,cx,y,z,palaceWings)}
 for(let x of [cx-6.4,cx+6.4]){box(.22,5.35,17.8,M.cream,x,2.85,cz,palaceWings);for(let y of [.6,3.25,5.45])box(.31,.16,18,M.red,x,y,cz,palaceWings)}
 for(let x of [cx-5.5,cx,cx+5.5])for(let z of [cz-8,cz+8]){cyl(.25,.28,6,M.red,x,3.1,z,palaceWings,12);box(.77,.18,.77,M.gold,x,6.13,z,palaceWings)}
 for(let z of [cz-8,cz+8])for(let x=cx-4.4;x<=cx+4.4;x+=2.2){box(1.65,2.75,.07,M.paper,x,4,z+.36,palaceWings);for(let y=2.85;y<5.45;y+=.5)box(1.8,.06,.13,M.wood,x,y,z+.42,palaceWings);for(let dx of [-.55,0,.55])box(.055,2.8,.12,M.wood,x+dx,4,z+.43,palaceWings)}
 pitchedRoof(palaceWings,cx,cz,halfW,halfD,8.4,6.47);
 for(let z of [cz-8,cz+8])for(let x=cx-5.5;x<=cx+5.5;x+=1.1){box(.63,.17,.6,paintedBlue,x,6,z,palaceWings);box(.14,.3,.64,M.gold,x,5.8,z,palaceWings)}
}
sideHall(-22.4,-7);sideHall(22.4,-7);
// Pale stone forecourt, terrace, balustrades and rank stones.
box(57,.08,15,M.floor,0,-.02,8);
for(let x=-26;x<=26;x+=2)for(let z=2;z<=14;z+=2){box(1.94,.035,1.94,M.cream,x,.035,z)}
for(let side of [-1,1]){
 for(let x=4;x<=13;x+=1.5){cyl(.12,.16,.9,M.cream,side*x,.7,2.5);ball(.18,M.cream,side*x,1.2,2.5)}
 box(9,.12,.18,M.cream,side*8.5,1.03,2.5);
 for(let z of [5,8,11]){box(.55,.14,.6,M.stone,side*6,.15,z);box(.27,.75,.19,M.stone,side*6,.56,z)}
}
// Courtyard stone edging, linked railings and restrained garden planting.
for(let side of [-1,1]){
 for(let z=7;z<31;z+=2.5){let x=side*9.7;box(.24,1.18,.24,M.red,x,.65,z);box(.55,.12,.55,M.gold,x,1.32,z);box(.11,.11,2.5,M.red,x,1.07,z+1.25)}
 for(let z of [9,14,20,27])for(let j=0;j<3;j++){let x=side*(11.8+j*1.1);ball(.32,paintedGreen,x,.37,z+j*.5).scale.set(1.2,.5,1.15)}
}
const gateGroup=new THREE.Group();scene.add(gateGroup);
for(let x of [-8.5,-2.8,2.8,8.5]){cyl(.36,.4,6.2,M.red,x,3.1,16,gateGroup,16);box(.9,.25,.9,M.stone,x,.15,16,gateGroup);box(.9,.16,.9,M.gold,x,6.28,16,gateGroup)}
box(20,.38,.7,M.darkRed,0,6.23,16,gateGroup);box(20,.18,.9,M.teal,0,5.84,16,gateGroup);
for(let x=-8;x<=8;x+=1.2){box(.75,.17,.85,paintedBlue,x,5.7,16,gateGroup);box(.54,.1,.87,M.gold,x,5.5,16,gateGroup)}
pitchedRoof(gateGroup,0,16,10.9,2.7,7.92,6.55);
// Two hinged leaves make the entrance open on cue during the actual 3D intro.
const gateDoors=[];
for(let side of [-1,1]){
 const pivot=new THREE.Group();pivot.position.set(side*2.8,0,16);gateGroup.add(pivot);
 const center=-side*1.34;
 box(2.65,4.52,.24,M.red,center,2.42,0,pivot);
 for(let y of [.58,1.47,2.4,3.3,4.35])box(2.55,.1,.29,M.darkRed,center,y,.02,pivot);
 for(let x of [center-1.05,center+1.05])box(.13,4.55,.3,M.darkRed,x,2.42,.02,pivot);
 for(let y of [.9,2.1,3.3])for(let x of [center-.77,center+.77])ball(.052,M.gold,x,y,.18,pivot);
 const ring=mesh(new THREE.TorusGeometry(.18,.035,8,18),M.black,center-side*.77,2.4,.2,pivot);ring.rotation.x=.17;
 gateDoors.push({pivot,side})
}

// Hierarchy: the monumental hall is beyond the service compound; kitchen is single-storey.
roofGroup.position.z=-30;
const distantHall=new THREE.Group();scene.add(distantHall);distantHall.position.z=-30;
box(28,1.2,23,M.stone,0,.3,-8,distantHall);
for(let z of [-16.6,1])for(let x of [-10.5,-5.3,0,5.3,10.5]){cyl(.38,.42,7,M.red,x,3.5,z,distantHall);box(1,.3,1,M.stone,x,.3,z,distantHall)}
for(let z of [-16.6,1]){box(23,.35,.6,M.red,0,6.8,z,distantHall);for(let x=-10;x<11;x+=1.2){box(.7,.2,.8,paintedGreen,x,7.1,z,distantHall);box(.5,.17,1,M.gold,x,7.3,z,distantHall)}}
const hallFacade=facade.clone();distantHall.add(hallFacade);
// The kitchen's roof and rafters have their own load-bearing frame.
const kitchenRoof=new THREE.Group();scene.add(kitchenRoof);pitchedRoof(kitchenRoof,0,-8,12.5,10,8.9,7.3);
for(let x=-11;x<=11;x+=.7)for(let side of [-1,1])for(let j=0;j<10;j++){let z=-8+side*j*.98,z2=-8+side*(j+1)*.98;line([x,roofHeight(x,z,0,-8,12.5,10,8.9,7.3)-.3,z],[x,roofHeight(x,z2,0,-8,12.5,10,8.9,7.3)-.3,z2],.075,M.wood,kitchenRoof);}
// Inner gate divides service court and kitchen approach, without closing the central path.
const compound=new THREE.Group();scene.add(compound);
for(let side of [-1,1]){
 box(10,2.3,.4,M.cream,side*8,1.15,3,compound);box(10,.16,.55,M.wood,side*8,2.3,3,compound);
 for(let z=4;z<=13;z+=3){cyl(.14,.17,3,M.red,side*12,1.5,z,compound);box(.5,.14,.5,M.wood,side*12,3,z,compound)}
 box(2.7,.12,11,M.floor,side*12,.05,8,compound);
 pitchedRoof(compound,side*12,8,1.65,5.6,3.85,3.1);
}
for(let x of [-2.7,2.7]){cyl(.23,.26,4.2,M.red,x,2.1,3,compound);box(.7,.2,.7,M.stone,x,.1,3,compound)}
box(6,.25,.55,M.wood,0,4.15,3,compound);pitchedRoof(compound,0,3,3.5,1.6,5.6,4.35);
// Low service boundary behind kitchen separates it from royal residential precinct.
box(58,2.8,.5,M.cream,0,1.4,-21,compound);box(58,.22,.7,M.wood,0,2.85,-21,compound);
// Kitchen walls are open at the front so the orbit camera always sees the tasks.
box(23,.2,19,M.floor,0,0,-8);box(23,7,.6,M.cream,0,3.5,-17.5);for(let x of [-11.5,11.5])box(.6,7,19,M.cream,x,3.5,-8);
for(let y of [.55,2.9,6.25]){box(23,.2,.76,M.red,0,y,-17.15);for(let x of [-11.2,11.2])box(.78,.2,19,M.red,x,y,-8)}
for(let x of [-10.5,-5.3,0,5.3,10.5])box(.19,6.1,.78,M.red,x,3.5,-17.1);
for(let x of [-10.5,-5.3,0,5.3,10.5])for(let z of [-16.6,1]){cyl(.34,.37,7,M.red,x,3.5,z);box(.9,.25,.9,M.stone,x,.1,z);box(1.05,.18,1.05,M.gold,x,6.8,z)}for(let z of [-16.6,1]){box(23,.42,.65,M.red,0,6.8,z);box(23,.2,.8,M.teal,0,6.35,z)}
for(let x of [-7.3,0,7.3]){box(4.5,3.2,.08,M.paper,x,4.55,-17.12);for(let i=-2;i<=2;i++)box(.07,3.3,.11,M.wood,x+i*.85,4.55,-17);for(let j=0;j<4;j++)box(4.5,.07,.11,M.wood,x,3.3+j*.85,-17)}
for(let x of [-9,9])for(let z of [-13,-7]){box(2.1,3.3,.85,M.wood,x,1.7,z);for(let y of [1.15,2.25,3.25])box(2.2,.13,.95,M.gold,x,y,z);for(let j=0;j<5;j++){let y=1.4+Math.floor(j/2)*1.1;ball(.32,M.gold,x+((j%2)-.5)*.7,y,z)}}
// Layered storage and utensils, based on the provided interior reference.
M.porcelain=new THREE.MeshStandardMaterial({color:0xe4e0d2,roughness:.37,metalness:.04});
M.umber=new THREE.MeshStandardMaterial({color:0x765042,roughness:.68});
// Stone and brick perimeter, curved coping and fermentation jars frame the approach.
for(let side of [-1,1]){
 const wallX=side*34.8;
 box(1.1,2.2,38,M.stone,wallX,1.08,26);box(1.2,.55,38,M.darkRed,wallX,2.45,26);
 for(let z=8;z<44;z+=.9)box(1.25,.035,.55,M.floor,wallX,2.82,z);
 pitchedRoof(scene,wallX,26,1.05,19.3,3.2,2.6)
}
const jarGeometry=new THREE.LatheGeometry([new THREE.Vector2(.32,0),new THREE.Vector2(.7,.12),new THREE.Vector2(.96,.43),new THREE.Vector2(1.04,.9),new THREE.Vector2(.95,1.29),new THREE.Vector2(.7,1.55),new THREE.Vector2(.58,1.6)],24);
for(let side of [-1,1])for(let j=0;j<4;j++){
 const x=side*(29.2+(j%2)*1.2),z=16+j*5.2,scale=.65+(j%3)*.1;
 const jar=mesh(jarGeometry,M.umber,x,.08,z);jar.scale.setScalar(scale);
 cyl(.58*scale,.58*scale,.095,M.black,x,1.12*scale,z,scene,24);
 let lid=ball(.6*scale,M.umber,x,1.18*scale,z);lid.scale.y=.19
}

const bowlProfile=[new THREE.Vector2(.02,0),new THREE.Vector2(.25,.015),new THREE.Vector2(.35,.08),new THREE.Vector2(.45,.23),new THREE.Vector2(.48,.29),new THREE.Vector2(.43,.3),new THREE.Vector2(.38,.18),new THREE.Vector2(.27,.075),new THREE.Vector2(.02,.055)];
const bowlGeometry=new THREE.LatheGeometry(bowlProfile,24);
function bowl(x,y,z,r=1,p=scene){let o=mesh(bowlGeometry,M.porcelain,x,y,z,p);o.scale.setScalar(r);let line=mesh(new THREE.TorusGeometry(.43*r,.015*r,6,24),M.teal,x,y+.292*r,z,p);line.rotation.x=Math.PI/2;return o}
for(let side of [-1,1])for(let row=0;row<3;row++)for(let k=0;k<3-row;k++)bowl(side*9+(k-(2-row)/2)*.55,1.28+row*.42,-13.1,.72);
for(let x of [-9.9,-8.9,8.9,9.9])for(let z of [-7.3,-12]){let jar=cyl(.25,.33,.48,M.umber,x,.84,z,scene,16);cyl(.26,.26,.06,M.black,x,1.1,z,scene,16)}
for(let side of [-1,1])for(let j=0;j<3;j++){let x=side*10.2,z=-8-j*1.5;line([x,5.8,z],[x,4.25,z],.018,M.cream);for(let k=0;k<4;k++)ball(.12,M.cream,x+(k-1.5)*.13,4.26-(k%2)*.14,z)}
// Two hanging lamps, woven baskets and warm visual accents.
for(let x of [-5.4,5.4]){line([x,6.35,-3.7],[x,4.65,-3.7],.018,M.black);let lamp=cyl(.35,.58,.6,M.paper,x,4.35,-3.7,scene,12);lamp.castShadow=false;cyl(.59,.59,.08,M.wood,x,4.65,-3.7);cyl(.53,.53,.08,M.wood,x,4.04,-3.7)}
for(let x of [-7.8,-5.8]){cyl(.63,.51,.48,M.umber,x,.3,-10,scene,18);cyl(.67,.67,.05,M.gold,x,.55,-10,scene,18)}
box(4,.4,2.5,M.wood,-4,1.05,-7);for(let x of [-5.7,-2.3])for(let z of [-8,-6])box(.27,1.1,.27,M.darkRed,x,.55,z);box(3.1,.12,2,M.floor,-4,1.32,-7);
box(3.8,1.1,2.8,M.stone,5,.55,-9);box(2.6,.12,1.8,M.black,5,1.18,-9);let pot=cyl(1.22,.95,.9,M.black,5,1.66,-9,scene,24);cyl(1.31,1.31,.12,M.gold,5,2.12,-9,scene,24);ball(.78,M.black,5,2.13,-9).scale.y=.2;const fireGroup=new THREE.Group();fireGroup.position.set(5,.37,-7.56);scene.add(fireGroup);for(let i=0;i<7;i++){let flame=mesh(new THREE.ConeGeometry(.18+Math.random()*.12,.7+Math.random()*.5,7),M.flame,(Math.random()-.5)*1.8,.4,(Math.random()-.5)*.3,fireGroup);flame.userData.phase=Math.random()*10}
for(let i=0;i<3;i++){let log=cyl(.105,.13,1.15,M.wood,5+(i-1)*.35,.44,-7.46);log.rotation.z=(i-1)*.26;log.rotation.x=.25}for(let side of [-1,1]){let handle=mesh(new THREE.TorusGeometry(.23,.045,8,16),M.black,5+side*1.18,1.72,-9);handle.rotation.y=Math.PI/2}cyl(.13,.19,.21,M.gold,5,2.36,-9,scene,16);
let smoke=[];for(let i=0;i<8;i++){let o=ball(.22+Math.random()*.2,M.smoke,5,2.6+Math.random()*2,-9);o.castShadow=false;smoke.push(o)}
// White mortar joints and staggered stove bricks, as in the kitchen reference.
for(let row=0;row<4;row++)for(let j=0;j<7;j++){const x=3.22+j*.54+(row%2)*.2;if(x<6.85)box(.49,.21,.04,M.cream,x,.16+row*.26,-7.575)}
box(5.8,.16,.5,M.wood,0,4.8,-16.7);
for(let i=0;i<6;i++){const x=-2.4+i*.9;line([x,4.8,-16.35],[x,3.8,-16.35],.025,M.wood);let pan=mesh(new THREE.TorusGeometry(.24,.045,8,20),i%2?M.wood:M.black,x,3.61,-16.35);}
// Pantry baskets and food, each item is geometry rather than a flat icon.
box(5,.22,2,M.wood,-8,1,-12);for(let x of [-10,-6])for(let z of [-12.8,-11.2])box(.2,1,.2,M.wood,x,.5,z);
const ingredients=[];const foodNames={spinach:'菠菜',beef:'牛肉',pear:'亞洲梨',sesame:'芝麻油',soy:'醬油',garlic:'蒜',rice:'米',pine:'松子'};
function ingredient(id,x,y,z,size=1,parent=scene){let g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(size);parent.add(g);let o;switch(id){case'spinach':for(let i=0;i<7;i++){let a=i*2.4;let l=ball(.25,M.green,Math.sin(a)*.26,.24,Math.cos(a)*.25,g);l.scale.set(.6,1.65,.25);l.rotation.z=Math.sin(a)*.5}break;case'beef':o=box(.95,.42,.72,M.beef,0,.25,0,g);for(let i=0;i<4;i++)box(.05,.02,.6,M.cream,-.35+i*.2,.48,0,g);break;case'pear':o=ball(.38,M.pear,0,.4,0,g);o.scale.y=1.2;cyl(.035,.035,.2,M.wood,0,.9,0,g);break;case'sesame':case'soy':cyl(.25,.33,.7,id==='soy'?M.black:M.gold,0,.35,0,g);cyl(.12,.12,.25,M.darkRed,0,.82,0,g);break;case'garlic':for(let i=0;i<3;i++){o=ball(.25,M.cream,(i-1)*.28,.25,0,g);o.scale.y=1.1;cyl(.035,.07,.17,M.cream,(i-1)*.28,.59,0,g)}break;case'rice':cyl(.45,.38,.26,M.gold,0,.15,0,g);ball(.37,M.rice,0,.32,0,g).scale.y=.28;break;case'pine':for(let i=0;i<12;i++){let x=(Math.random()-.5)*.7,z=(Math.random()-.5)*.5;o=ball(.075,M.rice,x,.12+Math.random()*.12,z,g);o.scale.set(.65,1.5,.6)}break}g.userData.food=id;g.traverse(child=>child.userData.food=id);return g}
Object.keys(foodNames).forEach((id,i)=>ingredients.push(ingredient(id,-9.7+(i%4)*1.1,1.14,-12.5+Math.floor(i/4)*1.1,.8)));
// Layered chima and jeogori silhouettes with distinct roles; all forms are 3D.
function character(name,x,z,cloth,senior=false){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 const dress=new THREE.MeshStandardMaterial({color:cloth,roughness:.91,side:THREE.DoubleSide}),
 sleeveMat=new THREE.MeshStandardMaterial({color:senior?0x345964:name==='seo'?0x718a72:name==='yeon'?0x734c63:0xa45743,roughness:.87}),
 jacket=new THREE.MeshStandardMaterial({color:senior?0x324850:0xe6dac3,roughness:.87}),
 trim=new THREE.MeshStandardMaterial({color:senior?0xc4ad7d:0x362d2d,roughness:.75}),
 hair=new THREE.MeshStandardMaterial({color:0x242523,roughness:.85}),
 blush=new THREE.MeshStandardMaterial({color:0xb98375,roughness:1});
 // A rounder multi-panel skirt replaces the single rigid cone.
 cyl(.35,.84,1.3,dress,0,.78,0,g,24);
 for(let i=0;i<16;i++){let a=i*Math.PI/8;let x1=Math.sin(a)*.38,z1=Math.cos(a)*.38,x2=Math.sin(a)*.81,z2=Math.cos(a)*.81;let pleat=line([x1,1.41,z1],[x2,.16,z2],.012,i%2?dress:trim,g);pleat.castShadow=false}
 cyl(.44,.4,.27,sleeveMat,0,1.47,0,g,20);
 let bodice=cyl(.43,.46,.58,jacket,0,1.82,0,g,16);
 // Front waist apron, shoulder panels and a crisp crossed collar from the user's attire reference.
 if(!senior){box(.91,.72,.065,jacket,0,1.81,.46,g);for(let side of [-1,1]){box(.15,.82,.07,jacket,side*.39,1.84,.46,g);box(.43,.15,.045,trim,side*.23,2.1,.47,g)}}
 line([-.3,2.09,.38],[.1,1.61,.5],.045,trim,g);line([.27,2.09,.38],[-.09,1.65,.5],.06,M.cream,g);
 for(let side of [-1,1]){let arm=new THREE.Group();arm.position.set(side*.47,1.98,0);g.add(arm);let sleeve=cyl(.17,.34,.72,sleeveMat,side*.12,-.33,.01,arm,16);sleeve.rotation.z=side*.2;cyl(.33,.33,.12,trim,side*.2,-.7,.01,arm,16);ball(.105,M.skin,side*.2,-.81,.03,arm);if(side<0)g.userData.leftArm=arm;else g.userData.rightArm=arm}
 // Knot and two free ribbons are modeled separately for readable motion.
 ball(.075,trim,.15,1.68,.52,g);let ribbonA=box(.09,.52,.05,sleeveMat,.13,1.43,.53,g);ribbonA.rotation.z=.11;let ribbonB=box(.075,.4,.05,M.cream,.27,1.47,.52,g);ribbonB.rotation.z=-.17;g.userData.ribbonA=ribbonA;g.userData.ribbonB=ribbonB;
 let head=new THREE.Group();head.position.set(0,2.38,.04);g.add(head);g.userData.head=head;
 let face=ball(.31,M.skin,0,0,0,head);face.scale.set(.93,1.13,.83);
 // Hair cap, side locks, back bun, ears and facial details retain volume at oblique angles.
 let cap=ball(.315,hair,0,.27,-.055,head);cap.scale.set(1.03,.48,.98);
 for(let side of [-1,1]){ball(.09,hair,side*.255,.1,-.02,head).scale.set(.8,1.9,.9);ball(.055,M.skin,side*.3,-.025,0,head)}
 ball(.2,hair,0,.07,-.27,head).scale.set(1.15,1.08,.85);
 const eyes=[];
 for(let side of [-1,1]){let eye=ball(.028,M.black,side*.115,.025,.268,head);eyes.push(eye);ball(.009,M.paper,side*.12,.035,.288,head);box(.12,.018,.02,hair,side*.11,.13,.27,head)}
 ball(.037,M.skin,0,-.06,.285,head);let mouth=box(.095,.012,.017,blush,0,-.177,.269,head);mouth.rotation.z=-.025;
 if(senior){cyl(.21,.21,.035,M.gold,0,.12,-.48,head,16);line([-.45,.07,-.3],[.45,.07,-.3],.025,M.gold,head);box(.82,.12,.48,trim,0,1.36,.05,g)}
 for(let side of [-1,1]){let foot=box(.22,.16,.44,M.black,side*.24,.13,.11,g);foot.rotation.y=side*.08}
 g.userData.eyes=eyes;g.userData.name=name;g.traverse(o=>o.userData.npc=name);return g
}
const npcs=[{id:'han',name:'韓尚宮',obj:character('han',-2,-12,0x384b54,true),pos:new THREE.Vector3(-2,0,-12)},{id:'mi',name:'美真',obj:character('mi',-7,-4,0x8a5953),pos:new THREE.Vector3(-7,0,-4)},{id:'seo',name:'徐醫女',obj:character('seo',7,-13,0x617c70),pos:new THREE.Vector3(7,0,-13)},{id:'yeon',name:'金蓮',obj:character('yeon',7,-4,0x684b69),pos:new THREE.Vector3(7,0,-4)}];
const avatar=character('player',0,29,0x356268);avatar.scale.setScalar(.95);avatar.traverse(o=>o.userData.npc=null);
const interactables=[...npcs.map(n=>({id:n.id,name:n.name,pos:n.pos,object:n.obj})),{id:'pantry',name:'食材籃',pos:new THREE.Vector3(-8,0,-12),object:ingredients[0]},{id:'board',name:'案板',pos:new THREE.Vector3(-4,0,-7),object:null},{id:'stove',name:'爐灶',pos:new THREE.Vector3(5,0,-9),object:pot}];
// Floating quest marker follows the first useful conversation, then the workbench.
const guide=new THREE.Group();scene.add(guide);let guideRing=mesh(new THREE.TorusGeometry(.34,.045,8,24),M.gold,0,0,0,guide);guideRing.rotation.x=Math.PI/2;let guideArrow=mesh(new THREE.ConeGeometry(.2,.45,9),M.gold,0,.52,0,guide);guideArrow.rotation.z=Math.PI;
function guidePosition(){if(state.stage==='competition'&&state.c2){let c=state.c2;let sp=c2Spots.find(x=>x.id===(c.phase==='serve'||c.phase==='brief'?'han':c.phase==='cut'?'board':c.phase==='cook'?'stove':!c.inventory.includes('tteok')?'riceStore':c.inventory.length<4?'freshStore':'sauceStore'));return new THREE.Vector3(sp.p[0],3.7,sp.p[2])}if(state.stage==='courtyard')return new THREE.Vector3(0,4.2,3);if(state.stage==='explore'){let id=!state.seen.includes('han')?'han':!state.seen.includes('mi')?'mi':!state.seen.includes('seo')?'seo':'board';let p=interactables.find(x=>x.id===id)?.pos;return p?new THREE.Vector3(p.x,3.7,p.z):null}return null}
// Small physical serving tray used in the last scene.
const tray=new THREE.Group();tray.position.set(0,.8,-3);scene.add(tray);let trayBase=cyl(1.5,1.5,.12,M.wood,0,0,0,tray,32);cyl(.96,.7,.24,M.gold,0,.19,0,tray,32);tray.visible=false;
let state={stage:'courtyard',seen:[],clues:[],selected:[],soy:0,sesame:0,chops:0,heat:0,stable:0,trust:0,rumour:false,tasted:false,lang:'zh'};try{let prior=JSON.parse(localStorage.getItem('ahkii-3d-v1'));if(prior)state={...state,...prior}}catch{}if(state.stage==='courtyard'||state.stage==='explore')avatar.position.set(state.stage==='explore'?0:0,0,state.stage==='explore'?-1:29);
if(['present','ending'].includes(state.stage)){tray.visible=true;state.selected.slice(0,4).forEach((id,i)=>ingredient(id,Math.cos(i*1.57)*.55,.26,Math.sin(i*1.57)*.55,.5,tray));avatar.position.set(0,0,0)}
let inspecting=false,inspectAngle=0,dusk=false,inspectFocus=new THREE.Vector3(0,3,-7),inspectDist=31;
const inspectionViews=[{position:[0,4,-19],distance:52,yaw:.6,pitch:.48,zh:['宮殿與燒廚房院落','遠處大殿、低層廚房、內門與行廊分隔院落。按建築原則改編，並非中宗年代實測復原。'],ko:['궁궐과 소주방 마당','대전과 낮은 부엌, 안문과 행랑으로 마당을 구분했습니다. 건축 원리를 응용했으며 중종 시대의 실측 복원은 아닙니다.']},{position:[0,2,-8],distance:7,yaw:0,pitch:.22,zh:['御膳房內部','從敞開一面檢視案板、灶台、食材和人物的位置。'],ko:['수라간 내부','열린 쪽에서 도마, 아궁이, 재료와 인물의 위치를 살펴보세요.']},{position:[0,1,16],distance:31,yaw:.2,pitch:.22,zh:['宮道與入口','門扇在片頭開啟。兩側石牆、瓦頂與陶甕來自你提供的近景參考；院落佈局仍屬遊戲設計。'],ko:['궁길과 입구','인트로에서 문이 열립니다. 양쪽 석벽, 기와와 장독은 제공된 참고 사진을 바탕으로 했으며 배치는 게임 설정입니다.']}];
const save=()=>localStorage.setItem('ahkii-3d-v1',JSON.stringify(state));let yaw=0,pitch=.39,dist=12,drag=false,lastX=0,lastY=0,keys=new Set(),fuel=false,modalOpen=false,selectedObject=null;let focus=new THREE.Vector3(),cameraTarget=new THREE.Vector3();let clock=new THREE.Clock(),velocity=new THREE.Vector3();
const dialogues={han:{name:'韓尚宮',line:'「中殿娘娘今日胃口不好。午膳前，做一道她吃得下的菜。御膳不只求味道；先問，再想。」',clue:'韓尚宮：判斷與身體狀況同樣重要。',choices:[['昨日吃過甚麼？','「問得好。去問侍膳的人，還有醫女。」',1],['我照一張食譜做。','「食譜不知道娘娘今日的身體。」',0]]},mi:{name:'美真',line:'「娘娘昨日嫌菜太鹹。我聽說她愛牛肉……但我未親耳聽她講。」',clue:'昨日嫌菜太鹹；牛肉只是美真的傳聞。',choices:[['鹹是線索；牛肉要核實。','「對，我也只聽回來的。」',1],['那就做濃味牛肉。','「我未講過一定要呀。」',-1]]},seo:{name:'徐醫女',line:'「近日脾胃虛弱，少油、少刺激會較合適。這是今日的觀察，別把它說成診斷。」',clue:'徐醫女觀察：胃口弱，宜少油、少刺激。',choices:[['按觀察調整調味。','「你懂得分辨觀察與推論。」',1],['我會宣布娘娘患病。','「不要超出證據。」',-1]]},yeon:{name:'金蓮',line:'「我替你問過，娘娘要濃味肉。可別說是我講的。」她手上的侍膳托盤仍然乾淨。',clue:'金蓮聲稱娘娘要濃味肉，消息來源存疑。',choices:[['多謝，我再核實。','金蓮笑了笑，沒有再說。',1],['照你說的做。','「隨你。」',-1]]}};

const koFood={spinach:'시금치',beef:'쇠고기',pear:'배',sesame:'참기름',soy:'간장',garlic:'마늘',rice:'쌀',pine:'잣'};
const fn=id=>state.lang==='ko'?koFood[id]:foodNames[id];
const L=(zh,ko)=>state.lang==='ko'?ko:zh;
const namesKo={han:'한 상궁',mi:'미진',seo:'서 의녀',yeon:'금련',pantry:'식재료 바구니',board:'도마',stove:'아궁이'};
const dialoguesKo={
 han:{name:'한 상궁',line:'「중전마마께서 오늘 입맛이 없으시다. 점심 전까지 드실 수 있는 음식을 만들어라. 수라에는 맛만이 중요한 것이 아니다. 먼저 묻고, 생각해라.」',clue:'한 상궁: 판단과 몸 상태를 함께 고려해야 한다.',choices:[['어제 무엇을 드셨습니까?','「좋은 질문이다. 시중든 이와 의녀에게 물어보아라.」',1],['그냥 조리법대로 하겠습니다.','「조리법은 마마의 오늘 몸 상태를 모른다.」',0]]},
 mi:{name:'미진',line:'「어제 음식이 너무 짰대. 쇠고기를 좋아하신다는 말도 들었는데… 직접 들은 건 아니야.」',clue:'어제 음식이 짰다는 불평. 쇠고기 이야기는 전해 들은 소문.',choices:[['짠맛은 단서지만 쇠고기는 확인해야 해.','「맞아, 나도 들은 얘기뿐이야.」',1],['그럼 진한 쇠고기 요리를 만들게.','「꼭 그래야 한다고 말한 건 아니야.」',-1]]},
 seo:{name:'서 의녀',line:'「요즘 소화가 약하신 듯합니다. 기름지고 자극적인 것은 피하는 편이 좋겠지요. 오늘의 관찰일 뿐, 진단으로 말하지는 마세요.」',clue:'서 의녀의 관찰: 입맛이 약하고 기름기와 자극을 줄이는 편이 좋다.',choices:[['관찰에 맞춰 간을 조절하겠습니다.','「관찰과 추론을 구별할 줄 아는군요.」',1],['병을 앓고 계신다고 알리겠습니다.','「근거 이상으로 말하지 마세요.」',-1]]},
 yeon:{name:'금련',line:'「내가 물어봤는데 진한 고기 요리를 원하신대. 내가 말했다고는 하지 마.」 하지만 손에 든 시중용 쟁반은 아직 깨끗하다.',clue:'금련은 진한 고기 요리를 원하신다고 하지만 정보의 출처가 불분명하다.',choices:[['고마워. 다시 확인해 볼게.','금련이 웃고는 더 말하지 않는다.',1],['네 말대로 할게.','「마음대로 해.」',-1]]}
};
function refreshLanguage(){let ko=state.lang==='ko';$('lang').textContent=ko?'繁體中文':'한국어';$('music').textContent=musicOn?L('音樂：開','음악: 켬'):L('音樂：關','음악: 끔');$('inspect').textContent=ko?(inspecting?'탐험으로':'건축 보기'):(inspecting?'返回探索':'建築檢視');$('light').textContent=ko?(dusk?'낮':'황혼'):(dusk?'日光':'黃昏');if(inspecting)updateInspectCard();$('intro-lang').textContent=ko?'繁體中文':'한국어';$('notebook').textContent=ko?'기록 Tab':'筆記 Tab';$('menu').textContent=ko?'메뉴':'選單';$('chapter-label').textContent=ko?'제1장 · 입맛을 잃은 중전':'第一章 · 娘娘沒有胃口';$('brand-subtitle').textContent=ko?'아시아 기억 인터랙티브 아카이브':'亞洲記憶互動檔案';$('intro-kicker').textContent=ko?'한양 · 동트기 전':'漢陽 · 天將亮';$('help').textContent=ko?'WASD 이동 · 드래그로 시점 회전 · 휠 확대/축소 · E 대화 · Tab 기록':'WASD 行走 · 拖動滑鼠轉鏡頭 · 滾輪縮放 · E 互動 · Tab 筆記';$('intro-title').textContent=ko?'아기: 수라간':'阿琪：御膳房';$('intro-copy').textContent=ko?'궁에서 맛은 답의 절반일 뿐이다.':'「在宮中，味道只是答案的一半。」';$('begin').textContent=c2On()?L('繼續第二章 →','제2장 계속 →'):(ko?'첫 장 시작 →':'開始第一章 →');$('skip').textContent=ko?'영상 건너뛰기 →':'跳過動畫 →';if(!cutscene.classList.contains('hidden'))cutsceneText();$('heat-title').textContent=ko?'불 조절 · 장작':'火候 · 控制柴火';$('low-label').textContent=ko?'약불':'弱火';$('good-label').textContent=ko?'알맞은 불':'溫火';$('hot-label').textContent=ko?'과열':'過熱';$('stable-label').textContent=ko?'안정 시간':'穩定時間';$('target-reading').textContent=ko?'목표 40–68%':'目標 40–68%';for(let i of interactables){i.name=ko?namesKo[i.id]:({han:'韓尚宮',mi:'美真',seo:'徐醫女',yeon:'金蓮',pantry:'食材籃',board:'案板',stove:'爐灶'})[i.id];tagEls?.get(i.id)&&(tagEls.get(i.id).textContent=i.name)}ui()}

function show(title,body,buttons=[],sub=L('御膳房','수라간')){modalOpen=true;overlay.innerHTML=`<div class="modal-wrap"><div class="modal"><span class="sub">${sub}</span><h2>${title}</h2>${body}${buttons.map((b,i)=>`<button class="${b.primary?'primary':''}" data-answer="${i}">${b.label}</button>`).join('')}</div></div>`;overlay.querySelectorAll('[data-answer]').forEach((btn,i)=>btn.onclick=buttons[i].click)}function close(){overlay.innerHTML='';modalOpen=false;if(state.stage==='choose'){state.stage='explore';save();ui()}}
function objective(title,text){$('objective-title').textContent=title;$('objective-text').textContent=text}
function ui(){
 if(typeof c2Hud!=='undefined'){c2Hud.hidden=!c2On();c2World.visible=c2On();if(c2On()){c2UI();return}}
 actions.innerHTML='';$('heat-hud').classList.toggle('hidden',state.stage!=='heat');
 if(state.stage==='courtyard')objective(L('先找韓尚宮','먼저 한 상궁을 찾으세요'),L('沿宮道向前，穿過紅柱門，進入御膳房。','궁길을 따라 붉은 기둥 사이로 들어가 수라간으로 가세요.'));
 if(state.stage==='explore')objective(L('娘娘沒有胃口','입맛을 잃은 중전'),L(`先向韓尚宮領任務，再問美真與徐醫女。線索 ${state.clues.length}/4。`,`먼저 한 상궁에게 임무를 듣고 미진과 서 의녀에게 물으세요. 단서 ${state.clues.length}/4개.`));
 if(state.stage==='choose')objective(L('選材','재료 고르기'),L(`食材揀 2 至 4 樣：${state.selected.map(fn).join('、')||'未有'}。`,`재료 2~4가지를 고르세요: ${state.selected.map(fn).join(' · ')||'없음'}.`));
 if(state.stage==='chop'){objective(L('刀工','칼질'),L('按「落刀」或 Space，切十刀。','「칼질」 또는 Space를 열 번 누르세요.'));addAction(L('落刀 / Space','칼질 / Space'),chop);addAction(L('下一步：爐火','다음: 불 조절'),()=>{if(state.chops>=10){state.stage='heat';avatar.position.set(4,0,-6);save();ui()}else show(L('刀工未完成','칼질 미완료'),`<p>${L('尚宮看著未切好的食材，沒有說話。','상궁은 아직 다 썰지 못한 재료를 말없이 바라본다.')}</p>`,[{label:L('繼續','계속'),click:close}])})}
 if(state.stage==='heat'){objective(L('火候','불 조절'),L('按住「添柴」或 Space 升溫，保持指針在金色區間。','「장작 넣기」 또는 Space를 누르고 황금색 구간을 유지하세요.'));addAction(L('按住添柴 / Space','장작 넣기 / Space'),()=>{},'fuel');updateHeatHud()}
 if(state.stage==='season'){objective(L('調味','간 맞추기'),L('每次只加一點，落咗不能撤回。','한 번에 조금씩. 넣은 양은 되돌릴 수 없습니다.'));addAction(L('倒醬油','간장 넣기'),()=>pour('soy'));addAction(L('倒芝麻油','참기름 넣기'),()=>pour('sesame'));addAction(L('試味','맛보기'),taste);addAction(L('盛盤','담아 올리기'),present)}
 if(['present','ending'].includes(state.stage)){objective(L('呈膳','수라 올리기'),L('韓尚宮拿起筷子，廚房靜下來。','한 상궁이 젓가락을 든다. 수라간이 조용해진다.'));if(state.stage==='present')addAction(L('聽評語','평가 듣기'),ending)}
}
function updateHeatHud(){if(state.stage!=='heat')return;$('heat-needle').style.left=state.heat+'%';$('heat-reading').textContent=L('火力 ','화력 ')+Math.round(state.heat)+'%';$('stable-time').textContent=Math.floor(state.stable)+' / 8';$('stable-fill').style.width=(state.stable/8*100)+'%';$('heat-status').textContent=state.heat<39?L('火太弱：鍋裏幾乎冇聲。','불이 약합니다. 솥이 조용합니다.'):state.heat<=68?L('溫和細沸：保持呢個火候。','잔잔하게 끓습니다. 이 불을 유지하세요.'):L('過熱：放開添柴，等火降下。','과열! 장작을 멈추고 불을 낮추세요.');if(state.stable>=8&&!actions.querySelector('[data-finished]')){let b=document.createElement('button');b.dataset.finished='true';b.textContent=L('起鍋調味','간 맞추기');b.onclick=()=>{state.stage='season';save();ui()};actions.append(b)}}

function addAction(label,fn,type){let b=document.createElement('button');b.textContent=label;actions.append(b);if(type==='fuel'){b.addEventListener('pointerdown',e=>{b.setPointerCapture(e.pointerId);fuel=true});for(let event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>fuel=false)}else b.onclick=fn}
function walkTo(id){
 if(dialogues[id]){let d=state.lang==='ko'?dialoguesKo[id]:dialogues[id];show(d.name,`<p>${d.line}</p>`,d.choices.map(([label,reply,trust])=>({label,click:()=>{if(!state.seen.includes(id)){state.seen.push(id);state.clues.push(d.clue)}state.trust+=trust;if(id==='yeon'&&trust<0)state.rumour=true;save();show(d.name,`<p>${reply}</p><div class="note">${L('筆記','기록')}: ${d.clue}</div>`,[{label:L('繼續探索','탐색 계속'),click:()=>{close();ui()}}])}})),id==='han'?L('掌膳尚宮','수라간 상궁'):L('廚房見聞','수라간 이야기'));return}
 if(id==='pantry')show(L('食材籃','식재료 바구니'),`<p>${L('菠菜、牛肉、梨、米與調味料。食材的性質會影響這一餐。','시금치, 쇠고기, 배, 쌀과 양념. 재료의 성질이 한 끼를 바꿉니다.')}</p>`,[{label:L('回到廚房','수라간으로'),click:close}]);
 if(id==='board')choose();if(id==='stove'&&state.stage==='explore')show(L('爐灶','아궁이'),`<p>${L('先到案板選材，才知道如何用火。','먼저 도마에서 재료를 골라야 불을 조절할 수 있습니다.')}</p>`,[{label:L('返回','돌아가기'),click:close}])
}
function choose(){state.stage='choose';save();ui();let buttons=Object.keys(foodNames).map(id=>({label:`${state.selected.includes(id)?'✓ ':'　'}${fn(id)}`,click:()=>{if(state.selected.includes(id))state.selected=state.selected.filter(x=>x!==id);else if(state.selected.length<4)state.selected.push(id);save();choose()}}));buttons.push({label:L('開始切菜 →','칼질 시작 →'),primary:true,click:()=>{if(state.selected.length<2){show(L('至少選兩樣','최소 두 가지'),`<p>${L('一種材料未必夠做成一道菜。','한 가지 재료만으로는 한 그릇을 만들기 어렵습니다.')}</p>`,[{label:L('返回選材','재료로 돌아가기'),click:choose}]);return}state.stage='chop';close();avatar.position.set(-3,0,-4);save();ui()}});show(L('選材','재료 고르기'),`<p>${L('揀兩至四樣。已選：','두 가지에서 네 가지를 고르세요. 선택: ')}${state.selected.map(fn).join(' · ')||L('未有','없음')}。</p>`,buttons,L('韓尚宮的考題','한 상궁의 과제'))}
function chop(){if(state.stage!=='chop')return;state.chops=Math.min(10,state.chops+1);knifeAnim=1;let cutter=ingredient(state.selected[0],-4,1.5,-7,1.1,scene);cutter.scale.setScalar(1.1-state.chops*.08);setTimeout(()=>scene.remove(cutter),260);save();ui();if(state.chops===10)show(L('刀工完成','칼질 완료'),`<p>${L('切口整齊，食材更容易均勻受熱。尚宮望向爐邊。','고르게 썰어야 고르게 익습니다. 상궁이 아궁이를 바라봅니다.')}</p>`,[{label:L('開始控火','불 조절 시작'),click:()=>{close();state.stage='heat';avatar.position.set(4,0,-6);save();ui()}}])}
let knife=box(.06,.52,1,M.gold,-4,2.15,-7);knife.rotation.x=.4,knifeAnim=0;
function pour(which){state[which]=Math.min(8,state[which]+1);save();ui();show(L('調味','간 맞추기'),`<p>${which==='soy'?(state.soy>=5?L('湯色變得很深。','국물 빛이 아주 진해졌습니다.'):L('湯色漸漸加深。','국물 빛이 조금 진해졌습니다.')):(state.sesame>=3?L('油光覆蓋了表面。','기름기가 표면을 덮습니다.'):L('輕微香氣浮起。','은은한 향이 올라옵니다.'))}</p>`,[{label:L('返回爐邊','계속'),click:close}])}
function taste(){state.tasted=true;save();show(L('試味','맛보기'),`<p>${state.soy>=5?L('鹹味蓋過食材。','짠맛이 재료를 덮습니다.'):state.soy>=2?L('鹹鮮漸漸浮現。','간장 맛이 조금 올라옵니다.'):L('食材本味還很清楚。','재료 본연의 맛이 살아 있습니다.')} ${state.sesame>=3?L('油香留在口中。','기름 향이 오래 남습니다.'):state.sesame?L('尾段有點芝麻香。','끝에 참기름 향이 납니다.'):''}</p>`,[{label:L('繼續','계속'),click:close}])}
function present(){state.stage='present';tray.visible=true;state.selected.slice(0,4).forEach((id,i)=>ingredient(id,Math.cos(i*1.57)*.55,.26,Math.sin(i*1.57)*.55,.5,tray));avatar.position.set(0,0,0);save();ui();show(L('呈膳','수라 올리기'),`<p>${L('韓尚宮先看盤色，再聞香，最後只嚐了一口。','한 상궁은 빛깔을 보고 향을 맡은 뒤 한 입만 맛봅니다.')}</p>`,[{label:L('聽她評語','평가 듣기'),click:()=>{close();ending()}}],L('御膳房 · 午前','수라간 · 점심 전'))}
function ending(){state.stage='ending';save();ui();let salty=state.soy>=5,oily=state.sesame>=3||state.selected.includes('beef')&&state.selected.includes('pine'),mild=state.selected.some(x=>['spinach','rice','pear'].includes(x));let good=mild&&!salty&&!oily;let judgement=good&&state.clues.length>=2?L('懂得聽，也懂得分辨。','듣고 분별할 줄 아는구나.'):state.rumour&&state.selected.includes('beef')?L('你聽見了話，卻未問話從何來。','말은 들었으나 출처는 묻지 않았구나.'):state.clues.length<2?L('你下手很快，卻未問清她的狀況。','손은 빨랐지만 마마의 상태는 묻지 않았구나.'):L('你已看見問題；下一次讓決定更一致。','문제는 보았다. 다음에는 판단을 더 일관되게 하거라.');show(L('韓尚宮評語','한 상궁의 평가'),`<p>「${good?L('娘娘或許吃得下。','중전마마께서 드실 수도 있겠구나.'):L('這碗菜，是為誰做的？','이 음식은 누구를 위해 만든 것이냐?')}」</p><div class="note">${L('刀工','칼질')}: ${state.chops>=10?L('整齊','고름'):L('仍需練習','연습 필요')}</div><div class="note">${L('火候','불 조절')}: ${state.stable>=8?L('穩，留住本味。','안정적, 본연의 맛을 살림.'):L('略急','조금 급함')}</div><div class="note">${L('調味','간')}: ${salty?L('偏鹹','짜다'):oily?L('略厚重','조금 무겁다'):L('柔和','부드럽다')}</div><div class="note">${L('判斷','판단')}: ${judgement}</div><p>「${L('明日再來','내일 다시 오너라')}。」</p>`,[{label:L('第二章：晉升試','제2장: 승급 시험'),primary:true,click:c2Start},{label:L('重新試第一章','첫 장 다시 하기'),primary:true,click:restart}],L('第一章 · 終','제1장 · 끝'))}

// Chapter 2: deterministic, recoverable sabotage; original fictional promotion trial.
const C2FOOD={tteok:['白年糕','가래떡'],beef:['牛肉','쇠고기'],mushroom:['香菇','표고버섯'],greens:['蔬菜','채소'],soy:['醬油','간장'],sesame:['芝麻油','참기름']};
const c2name=id=>L(...C2FOOD[id]);
const c2World=new THREE.Group();scene.add(c2World);
const c2Spots=[{id:'riceStore',p:[-7,0,9],zh:'米糕庫',ko:'떡 창고',items:['tteok']},{id:'freshStore',p:[7,0,9],zh:'鮮料庫',ko:'식재료 창고',items:['beef','mushroom','greens']},{id:'sauceStore',p:[-7,0,4],zh:'醬料架',ko:'양념 선반',items:['soy','sesame']},{id:'board',p:[-4,0,-7],zh:'切配案板',ko:'도마'},{id:'stove',p:[5,0,-9],zh:'烹煮爐灶',ko:'아궁이'},{id:'han',p:[-2,0,-12],zh:'韓尚宮',ko:'한 상궁'},{id:'yeon',p:[7,0,-4],zh:'金宮女',ko:'금련'}];
function c2Food(id,x,y,z,parent=c2World){let g=new THREE.Group();g.position.set(x,y,z);parent.add(g);if(id==='tteok'){for(let i=0;i<5;i++){let o=cyl(.10,.10,.63,M.rice,(i-2)*.17,.13,0,g,12);o.rotation.x=Math.PI/2;}}else if(id==='mushroom'){for(let i=0;i<3;i++){cyl(.07,.09,.3,M.cream,(i-1)*.3,.15,0,g);ball(.22,M.umber,(i-1)*.3,.33,0,g).scale.y=.45}}else if(id==='greens'){for(let i=0;i<5;i++){let o=box(.10,.08,.65,M.green,(i-2)*.13,.1,0,g);o.rotation.y=i*.2}}else ingredient(id,0,0,0,.65,g);return g}
for(let sp of c2Spots.filter(x=>x.items)){let [x,,z]=sp.p;box(2.4,.16,1.35,M.wood,x,1,z,c2World);for(let dx of [-1,1])box(.13,1,.9,M.wood,x+dx,.5,z,c2World);sp.items.forEach((id,i)=>c2Food(id,x+(i-(sp.items.length-1)/2)*.68,1.1,z));}
const c2Dish=new THREE.Group();c2Dish.position.set(5,2.3,-9);c2World.add(c2Dish);for(let i=0;i<12;i++){let o=c2Food(i<7?'tteok':i<10?'beef':'greens',Math.cos(i*2.4)*.62,.02,Math.sin(i*2.4)*.62,c2Dish);o.scale.setScalar(.5)}
const stolenBundle=c2Food('tteok',0,1.7,.65,npcs[3].obj);stolenBundle.scale.setScalar(.7);stolenBundle.visible=false;
const c2Salt=cyl(.22,.26,.43,M.porcelain,-3,1.6,-7,c2World,16);const c2Seal=box(.12,.04,.55,M.red,-3,1.84,-7,c2World);
const c2Hud=document.createElement('section');c2Hud.id='competition-hud';document.body.append(c2Hud);
const c2Style=document.createElement('style');c2Style.textContent='#competition-hud{position:fixed;right:18px;top:100px;width:245px;background:#172c2beF;border:1px solid #b99c63;color:#f6ebd5;padding:14px;border-radius:10px;font:14px/1.5 system-ui;pointer-events:none;z-index:8}#competition-hud progress{width:100%;accent-color:#d6b370}#competition-hud small{display:block;color:#d8c9a9}.c2-note{color:#f2c56c} @media(max-width:700px){#competition-hud{top:125px;right:8px;width:175px;font-size:11px;padding:8px}}';document.head.append(c2Style);
function c2On(){return state.stage==='competition'&&!!state.c2}
function c2Start(){close();finishCutscene();if(musicOn)score.play().catch(()=>{});tray.visible=false;c2Dish.position.set(5,2.3,-9);state.stage='competition';state.c2={phase:'brief',inventory:[],cuts:0,cutQuality:0,clock:0,heat:15,stable:0,burn:0,stirs:0,lastStir:-10,soy:0,oil:0,salt:0,swapped:false,checked:false,replaced:false,theft:'idle',theftTime:0,missing:false,evidence:false,usedFake:false,done:false};avatar.position.set(0,0,-7);save();ui();c2Talk('han')}
function c2Message(zh,ko){state.c2.message=[zh,ko];save();c2UI()}
function c2Nearest(){let best=null;for(let sp of c2Spots){let p=sp.id==='yeon'?npcs[3].obj.position:new THREE.Vector3(...sp.p),d=avatar.position.distanceTo(p);if(!best||d<best.distance)best={...sp,name:L(sp.zh,sp.ko),distance:d}}return best}
function c2Talk(id){const c=state.c2;if(!c)return;const dismiss={label:L('繼續','계속'),click:close};
 if(id==='han'){if(c.phase==='serve')return c2Judge();if(c.phase==='brief'){c.phase='gather';save();}show(L('晉升試：宮中炒年糕','승급 시험: 궁중떡볶이'),`<p>${L('阿琪與金宮女各做一盤。食材完整、刀工、火候、調味各佔 25 分；至少 75 分並超過金宮女，晉升資深宮女。','아기와 금련이 한 접시씩 만든다. 재료, 칼질, 불 조절, 간 맞추기 각 25점. 75점 이상이며 금련보다 높으면 선임 궁녀로 승급한다.')}</p><p>${L('先往院中三個庫架收齊六樣材料，回案板切配，再到爐灶烹煮。醬油 2 匙、芝麻油 1 匙，鹽可不加。','마당의 세 창고에서 재료 여섯 가지를 모으고 도마에서 썬 뒤 아궁이에서 볶아라. 간장 2술, 참기름 1술. 소금은 넣지 않아도 된다.')}</p><p>${L('留意金宮女與被動過的封口。此晉升制度與故事為遊戲創作。','금련의 움직임과 뜯긴 봉인을 살펴라. 승급 제도와 이야기는 게임 창작이다.')}</p>`,[dismiss]);return}
 const sp=c2Spots.find(x=>x.id===id);
 if(sp?.items){show(L(sp.zh,sp.ko),`<p>${L('按需領取；遺失年糕可回此補領。','필요한 재료를 받으세요. 떡을 잃으면 다시 받을 수 있습니다.')}</p>`,[...sp.items.map(item=>({label:(c.inventory.includes(item)?L('已取得：','보유: '):L('領取：','받기: '))+c2name(item),click:()=>{if(!c.inventory.includes(item)){c.inventory.push(item);if(item==='tteok')c.missing=false;if(c.inventory.length>=3&&c.theft==='idle'){c.theft='approach';c.theftTime=0;c.message=['金宮女正走近你的材料籃……','금련이 재료 바구니로 다가온다…'];}save();}close();c2UI()}})),dismiss]);return}
 if(id==='yeon'){if(c.theft==='approach'){c.theft='blocked';c.message=['你及時叫住金宮女，保住材料。','금련을 제때 불러 재료를 지켰다.'];}else if(c.missing){c.inventory.push('tteok');c.missing=false;c.theft='recovered';c.evidence=true;c.message=['金宮女托盤下藏著你的年糕，已取回。','금련의 쟁반 아래 숨긴 떡을 되찾았다.'];}else c.message=['金宮女：「勝負還未分呢。」','금련: “아직 승부는 끝나지 않았어.”'];save();c2UI();return}
 if(id==='board'){if(c.inventory.length<6){c2Message('材料未齊，先補領缺少的材料。','부족한 재료를 먼저 받으세요.');return}if(c.phase==='gather'){c.phase='cut';avatar.position.set(-4,0,-5);save();}c2UI();return}
 if(id==='stove'){if(c.cuts<12){c2Message('先在案板完成十二刀。','도마에서 열두 번 썰어 주세요.');return}if(c.inventory.length<6){c2Message('材料被偷了！找金宮女或回米糕庫補領。','재료가 사라졌어요! 금련을 찾거나 떡 창고에서 다시 받으세요.');return}if(['cut','gather'].includes(c.phase)){c.phase='cook';avatar.position.set(4,0,-6);save();}c2UI();}
}
function c2Cut(){let c=state.c2;if(!c2On()||c.phase!=='cut'||c.cuts>=12||modalOpen)return;let quality=Math.abs(Math.sin(c.clock*2.5))<.48;c.cuts++;if(quality)c.cutQuality++;knifeAnim=1;if(c.cuts===6){c.swapUntil=c.clock+6;c.swapped=true;c.checked=false;c.message=['金宮女剛離開案板；鹽罐封條方向變了。','금련이 도마를 떠났다. 소금통 봉인이 바뀌었다.'];}if(c.cuts===12)c.message=['切配完成。先檢查鹽罐，再到爐灶。','썰기 완료. 소금통을 확인한 뒤 아궁이로 가세요.'];save();c2UI()}
function c2Check(){let c=state.c2;c.checked=true;save();show(L('封口檢查','봉인 확인'),`<p>${c.swapped&&!c.replaced?L('封條斷了，罐內顆粒與備用鹽不同。不能憑標籤判斷；換一罐封口完整的鹽。','봉인이 뜯겼고 알갱이가 예비 소금과 다릅니다. 라벨만 믿지 말고 봉인된 새 소금통으로 바꾸세요.'):L('封條完整，可以使用。','봉인이 온전합니다.')}</p>`,[{label:L('換用封口完整的鹽','봉인된 소금으로 교체'),click:()=>{c.replaced=true;c.evidence=true;close();save();c2UI()}},{label:L('暫不更換','그대로 두기'),click:close}])}
function c2Season(id){let c=state.c2;if(id==='salt'){c.salt++;if(c.swapped&&!c.replaced)c.usedFake=true;}else c[id]++;save();c2UI()}
function c2Stir(){let c=state.c2;if(c.clock-c.lastStir<.8)return;c.lastStir=c.clock;c.stirs++;c2Dish.rotation.y+=.5;save();}
function c2Judge(){let c=state.c2;let scores=[Math.round(c.inventory.length/6*25),Math.min(25,13+c.cutQuality),Math.max(0,Math.round(25-c.burn*.7)),Math.max(0,25-Math.abs(c.soy-2)*7-Math.abs(c.oil-1)*7-c.salt*4-(c.usedFake?20:0))];let total=scores.reduce((a,b)=>a+b),rival=74,win=total>=75&&total>rival;c.done=true;c.phase='result';c.promoted=win;c.scores=scores;save();c2UI();show(win?L('晉升：資深宮女','승급: 선임 궁녀'):L('晉升試評語','승급 시험 평가'),`<p>${L('阿琪','아기')} ${total}/100 · ${L('金宮女','금련')} ${rival}/100</p>${[L('食材','재료'),L('刀工','칼질'),L('火候','불 조절'),L('調味','간')].map((x,i)=>`<div class="note">${x}: ${scores[i]}/25</div>`).join('')}<p>${win?L('韓尚宮：「勝在手藝，也勝在細心。今日起，你帶領新來的宮女。」','한 상궁: “솜씨도 세심함도 좋구나. 오늘부터 새 궁녀들을 이끌어라.”'):L('韓尚宮：「把食材、火候與調味顧好，再試一次。」','한 상궁: “재료와 불, 간을 살펴 다시 도전하거라.”')}</p><p>${c.usedFake?L('換鹽未被發現，調味受影響。','바뀐 소금을 알아채지 못해 간이 흐트러졌다.'):c.evidence?L('你核實了異常，沒有靠傳聞指控。','이상한 점을 확인하고 소문만으로 단정하지 않았다.'):L('你完成了這次試煉。','이번 시험을 마쳤다.')}</p>`,[{label:L('重試第二章','제2장 다시 하기'),click:c2Start},{label:L('返回院落','마당으로'),click:close}]);}
function c2UI(){document.body.classList.toggle('competition-mode',c2On());if(!c2On()){c2Hud.hidden=true;c2World.visible=false;return}let c=state.c2;if(['serve','result'].includes(c.phase))c2Dish.position.set(0,1.15,-3);c2World.visible=true;c2Hud.hidden=false;$('chapter-label').textContent=L('第二章 · 晉升試','제2장 · 승급 시험');$('heat-hud').classList.toggle('hidden',c.phase!=='cook');actions.innerHTML='';let text=c.phase==='gather'?L('院中領取六樣材料；留意金宮女。','마당에서 재료 여섯 가지를 모으세요. 금련을 살피세요.'):c.phase==='cut'?L('節奏指針進入金色區時落刀，共十二刀。','박자 바늘이 금색 구간에 오면 써세요. 총 12번.'):c.phase==='cook'?L('火候 40–68，翻炒六次，穩定十二秒。','화력 40–68, 여섯 번 볶기, 12초 유지.'):c.phase==='serve'?L('走到韓尚宮面前，按 E 呈膳。','한 상궁에게 가서 E로 음식을 올리세요.'):L('先找韓尚宮。','먼저 한 상궁을 찾으세요.');objective(L('宮中炒年糕 · 晉升試','궁중떡볶이 · 승급 시험'),text);
 if(c.phase==='cut'){addAction(L('返回備料／前往爐灶','이동하기'),()=>{c.phase='gather';save();c2UI()});addAction(L('落刀 / Space','칼질 / Space'),c2Cut);addAction(L('檢查鹽罐','소금통 확인'),c2Check)}
 if(c.phase==='cook'){addAction(L('按住添柴 / Space','장작 넣기 / Space'),()=>{},'fuel');addAction(L('翻炒','볶기'),c2Stir);addAction(L('醬油 +1','간장 +1'),()=>c2Season('soy'));addAction(L('芝麻油 +1','참기름 +1'),()=>c2Season('oil'));addAction(L('鹽 +1','소금 +1'),()=>c2Season('salt'));addAction(L('檢查鹽罐','소금통 확인'),c2Check);addAction(L('盛盤','담기'),()=>{if(c.stable<12||c.stirs<6){c2Message('還需穩定十二秒及翻炒六次。','12초 유지와 볶기 6회가 필요합니다.');return}c.phase='serve';c2Dish.position.set(0,1.15,-3);fuel=false;keys.delete(' ');avatar.position.set(4,0,-6);save();c2UI()});}
 if(c.phase==='result')addAction(L('重試晉升試','승급 시험 다시 하기'),c2Start);
 c2RenderHud();
}
function c2RenderHud(){let c=state.c2;c2Hud.innerHTML=`<small>${L('最近位置：','가까운 곳: ')}${c2Nearest()?.name||''} · E</small><strong>${c.promoted?L('阿琪 · 資深宮女','아기 · 선임 궁녀'):L('阿琪 對 金宮女','아기 대 금련')}</strong><small>${L('金宮女備膳進度','금련의 조리 진행')} ${Math.min(100,Math.floor(c.clock/1.8))}%</small><small>${L('評分目標：75，對手：74','목표: 75점 / 상대: 74점')}</small><div>${Object.keys(C2FOOD).map(id=>(c.inventory.includes(id)?'✓ ':'— ')+c2name(id)).join(' · ')}</div><small>${L('刀工','칼질')} ${c.cuts}/12 · ${L('翻炒','볶기')} ${c.stirs}/6</small>${c.phase==='cut'?`<div style="height:10px;position:relative;background:linear-gradient(to right,#53625c 26%,#c59f59 26%,#c59f59 74%,#53625c 74%)"><i style="position:absolute;height:15px;width:3px;background:white;left:${(Math.sin(c.clock*2.5)+1)*50}%"></i></div><small>${L('金色節奏區：中央 26–74%','박자 구간: 중앙 26–74%')}</small>`:''}<small>${L('醬油 / 油 / 鹽','간장 / 기름 / 소금')}: ${c.soy} / ${c.oil} / ${c.salt}</small><div class="c2-note">${c.message?L(...c.message):L('備料 → 切配 → 烹煮 → 呈膳','재료 → 썰기 → 볶기 → 올리기')}</div>`;}
function c2Tick(dt,t,active){c2World.visible=c2On();c2Hud.hidden=!c2On()||inspecting;if(!c2On())return;let c=state.c2;c2Seal.rotation.y=c.swapped&&!c.replaced?.8:0;c2Dish.visible=['cook','serve','result'].includes(c.phase);if(!active||c.done)return;c.clock+=dt;
 stolenBundle.visible=c.missing;const rival=npcs[3].obj;if(c.swapUntil>c.clock){rival.position.lerp(new THREE.Vector3(-3,0,-6),Math.min(1,dt*2));rival.userData.rightArm.rotation.x=-1.1;}else if(c.theft==='approach'){c.theftTime+=dt;const target=new THREE.Vector3(-6,0,9);rival.position.lerp(target,Math.min(1,dt*.45));if(c.theftTime>8){c.theft='stolen';c.inventory=c.inventory.filter(x=>x!=='tteok');c.missing=true;c.message=['材料籃少了年糕！找金宮女，或回米糕庫補領。','떡이 없어졌어요! 금련을 찾거나 떡 창고에서 다시 받으세요.'];save();c2UI();}}else{rival.position.lerp(new THREE.Vector3(7,0,-4),Math.min(1,dt*.5));}npcs[3].pos.copy(rival.position);
 if(c.phase==='cook'){c.heat=THREE.MathUtils.clamp(c.heat+((fuel||keys.has(' '))?27:-10)*dt,0,100);if(c.heat>=40&&c.heat<=68)c.stable=Math.min(12,c.stable+dt);if(c.heat>80)c.burn+=dt;state.heat=c.heat;$('heat-reading').textContent=L('火力 ','화력 ')+Math.round(c.heat)+'%';$('heat-needle').style.left=c.heat+'%';$('stable-time').textContent=c.stable.toFixed(1)+' / 12';$('stable-fill').style.width=c.stable/12*100+'%';$('heat-status').textContent=c.heat>68?L('太熱！放開添柴。','너무 뜨거워요! 장작을 멈추세요.'):c.heat<40?L('火太弱，按住添柴。','불이 약해요. 장작을 넣으세요.'):L('火候適中，記得翻炒。','알맞은 불입니다. 저어 주세요.');c2Dish.children.forEach((o,i)=>o.position.y=.02+(c.clock-c.lastStir<.5?Math.abs(Math.sin((c.clock-c.lastStir)*Math.PI*2))*.35:0));}
 if(Math.floor(t*5)!==Math.floor((t-dt)*5))c2RenderHud();if(Math.floor(t)!==Math.floor(t-dt))save();
}

function restart(){localStorage.removeItem('ahkii-3d-v1');location.reload()}
function notebook(){if(c2On()){show(L('宮中炒年糕筆記','궁중떡볶이 기록'),`<p>${L('院中三處領料 → 案板十二刀 → 爐灶火力 40–68，穩定十二秒、翻炒六次 → 韓尚宮評分。','마당 세 곳에서 재료 받기 → 도마에서 12번 썰기 → 화력 40–68로 12초, 볶기 6회 → 한 상궁 평가.')}</p><p>${L('醬油兩匙、芝麻油一匙。鹽可不加；封口異常先更換。材料不見了，找金宮女或補領。','간장 2술, 참기름 1술. 소금은 생략 가능. 봉인이 이상하면 교체하세요. 재료가 없으면 금련을 찾거나 다시 받으세요.')}</p>`,[{label:L('收起','닫기'),click:close}]);return}let list=state.seen.map(id=>state.lang==='ko'?dialoguesKo[id].clue:dialogues[id].clue);show(L('阿琪的筆記','아기의 기록'),`<p>${L('把觀察與傳聞分開。','관찰과 소문을 구별하세요.')}</p>${list.length?list.map(c=>`<div class="note">${c}</div>`).join(''):`<p>${L('未有線索，去問廚房裏的人。','단서가 없습니다. 수라간 사람들에게 물어보세요.')}</p>`}`, [{label:L('收起','닫기'),click:close}],L(`已聽 ${state.seen.length}/4 人`,`대화 ${state.seen.length}/4명`))}
function updateInspectCard(){let v=inspectionViews[inspectAngle],copy=state.lang==='ko'?v.ko:v.zh;$('inspect-title').textContent=copy[0];$('inspect-copy').textContent=copy[1];$('inspect-kicker').textContent=L('御膳房模型 · 檢視','수라간 모형 · 보기');$('inspect-note').textContent=L('朝鮮宮廷啟發的虛構場景，並非考證復原。','조선 궁궐에서 영감을 받은 가상 공간이며 고증 복원은 아닙니다.');$('inspect-next').textContent=L('下一個視角 →','다음 시점 →')}
function setInspectView(index){inspectAngle=index;let v=inspectionViews[index];inspectFocus.set(...v.position);inspectDist=v.distance;yaw=v.yaw;pitch=v.pitch;updateInspectCard()}
$('inspect').onclick=()=>{if(modalOpen||!$('intro').classList.contains('hidden')||!cutscene.classList.contains('hidden'))return;inspecting=!inspecting;document.body.classList.toggle('inspect-mode',inspecting);$('inspect-card').classList.toggle('hidden',!inspecting);$('inspect').textContent=inspecting?L('返回探索','탐험으로'):L('建築檢視','건축 보기');if(inspecting){setInspectView(0);keys.clear();velocity.set(0,0,0)}else{dist=12;focus.copy(avatar.position).add(new THREE.Vector3(0,2,0))}};
$('inspect-next').onclick=()=>setInspectView((inspectAngle+1)%inspectionViews.length);
$('light').onclick=()=>{dusk=!dusk;sun.color.setHex(dusk?0xffa56e:0xffd4a5);sun.intensity=dusk?1.5:3;sun.position.set(dusk?-26:-18,dusk?9:27,10);scene.background.setHex(dusk?0x4b6271:0x91a5a2);scene.fog.color.copy(scene.background);renderer.toneMappingExposure=dusk?1.35:1.65;$('light').textContent=dusk?L('日光','낮'):L('黃昏','황혼')};
function menu(){show(L('選單','메뉴'),`<p>${L('拖動滑鼠可轉鏡頭，滾輪縮放。進度自動儲存。','드래그로 시점을 돌리고 휠로 확대하세요. 진행 상황은 자동 저장됩니다.')}</p>`,[{label:L('繼續','계속'),click:close},{label:L('第二章：晉升試','제2장: 승급 시험'),click:c2Start},{label:L('重新開始','다시 시작'),click:restart}])}

const score=$('score');score.volume=.45;let musicOn=true;$('music').onclick=()=>{musicOn=!musicOn;$('music').setAttribute('aria-pressed',String(musicOn));$('music').textContent=musicOn?L('音樂：開','음악: 켬'):L('音樂：關','음악: 끔');if(musicOn)score.play().catch(()=>{});else score.pause()};$('notebook').onclick=notebook;$('menu').onclick=menu;const toggleLanguage=()=>{state.lang=state.lang==='zh'?'ko':'zh';save();refreshLanguage();if(modalOpen)close()};$('lang').onclick=toggleLanguage;$('intro-lang').onclick=toggleLanguage;const cutscene=$('cinematic');let cutsceneDone=false,cinematicTime=0,cinematicBeat=-1;
const storyBeats=[
 {end:4.5,zh:'漢陽，天剛亮。阿琪第一次走進宮門。',ko:'한양, 동이 트는 아침. 아기가 처음 궁문에 들어선다.',tagZh:'漢陽 · 清晨',tagKo:'한양 · 새벽'},
 {end:9,zh:'院落深處，御膳房已經點起爐火。',ko:'궁 깊은 곳, 수라간에는 벌써 불이 피어오른다.',tagZh:'御膳房',tagKo:'수라간'},
 {end:14,zh:'中殿娘娘沒有胃口。午膳前，做一道她吃得下的菜。',ko:'중전마마께서 입맛을 잃으셨다. 점심 전에 드실 음식을 만들어라.',tagZh:'今日任務',tagKo:'오늘의 임무'},
 {end:19,zh:'先聽清楚，再下判斷。韓尚宮正在等你。',ko:'먼저 듣고, 그다음 판단하라. 한 상궁이 기다린다.',tagZh:'第一章',tagKo:'제1장'}
];
// The introduction is rendered from the same animated 3D world, rather than moving stills.
const cinematicShots=[
 {start:0,end:4.5,from:[28,17,48],to:[8,11,24],aimFrom:[0,4,12],aimTo:[0,3,1],roof:true},
 {start:4.5,end:9,from:[5,5,25],to:[-3,4,8],aimFrom:[0,3,2],aimTo:[0,3,-9],roof:true},
 {start:9,end:14,from:[-4,4,-3],to:[-5,3,-6],aimFrom:[-2,2,-10],aimTo:[-2,2,-12],roof:false},
 {start:14,end:19,from:[9,4,-5],to:[3,4,-2],aimFrom:[5,1.8,-9],aimTo:[-2,2,-12],roof:false}
];
function cutsceneText(){let i=storyBeats.findIndex(b=>cinematicTime<b.end);i=Math.max(0,i<0?storyBeats.length-1:i);if(i!==cinematicBeat){cinematicBeat=i;$('cinematic-copy').animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,fill:'both'})}let b=storyBeats[i];$('cinematic-copy').textContent=state.lang==='ko'?b.ko:b.zh;$('cinematic-heading').textContent=state.lang==='ko'?b.tagKo:b.tagZh;$('cinematic-progress').style.width=Math.min(100,cinematicTime/19*100)+'%'}
function finishCutscene(){if(cutsceneDone)return;cutsceneDone=true;cutscene.classList.add('hidden');document.body.classList.remove('cinematic-mode');$('intro').classList.add('hidden');avatar.position.set(0,0,state.stage==='courtyard'?29:-1);camera.position.set(0,6,40);focus.copy(avatar.position);scene.background.setHex(dusk?0x4b6271:0x91a5a2);scene.fog.color.copy(scene.background);sun.intensity=dusk?1.5:3;sun.position.set(dusk?-26:-18,dusk?9:27,10);renderer.toneMappingExposure=dusk?1.35:1.65;ui()}
$('begin').onclick=()=>{if(c2On()){finishCutscene();avatar.position.set(0,0,-1);c2UI();return}cutsceneDone=false;cinematicTime=0;cinematicBeat=-1;$('intro').classList.add('hidden');cutscene.classList.remove('hidden');document.body.classList.add('cinematic-mode');if(musicOn)score.play().catch(()=>{});cutsceneText()};$('skip').onclick=finishCutscene;$('touch-e').onclick=interact;
function interact(){if(modalOpen||inspecting)return;if(c2On()){let n=c2Nearest();if(n&&n.distance<3.6)c2Talk(n.id);return}let n=nearest();if(n&&n.distance<3.6)walkTo(n.id)}function nearest(){if(c2On())return c2Nearest();let list=interactables.filter(i=>state.stage==='explore'||(state.stage==='courtyard'&&i.id==='han'));let best=null;for(let item of list){let d=avatar.position.distanceTo(item.pos);if(!best||d<best.distance)best={...item,distance:d}}return best}
renderer.domElement.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.006;pitch=THREE.MathUtils.clamp(pitch+dy*.004,.1,1.15)});renderer.domElement.addEventListener('pointerup',e=>{drag=false;renderer.domElement.releasePointerCapture(e.pointerId)});renderer.domElement.addEventListener('wheel',e=>{if(inspecting)inspectDist=THREE.MathUtils.clamp(inspectDist+e.deltaY*.018,8,65);else dist=THREE.MathUtils.clamp(dist+e.deltaY*.012,4,25)},{passive:true});
window.addEventListener('keydown',e=>{let k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys.add(k);if(k==='e'&&!e.repeat&&!inspecting)interact();if(k==='tab'){e.preventDefault();modalOpen?close():notebook()}if(k==='escape')close();if(k===' '&&!e.repeat&&c2On()&&!inspecting)c2Cut();if(k===' '&&!e.repeat&&state.stage==='chop'&&!inspecting)chop()});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));for(let b of document.querySelectorAll('[data-move]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.move)};for(let ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.move))}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
let tagEls=new Map();for(let i of interactables){let el=document.createElement('div');el.className='label';el.textContent=i.name;labels.append(el);tagEls.set(i.id,el)}
function animate(){requestAnimationFrame(animate);let dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;let active=!inspecting&&!modalOpen&&$('intro').classList.contains('hidden')&&cutscene.classList.contains('hidden');if(active&&(['courtyard','explore'].includes(state.stage)||(c2On()&&!['cook','cut'].includes(state.c2.phase)))){let f=(keys.has('w')||keys.has('arrowup')||keys.has('forward')?1:0)-(keys.has('s')||keys.has('arrowdown')||keys.has('back')?1:0),r=(keys.has('d')||keys.has('arrowright')||keys.has('right')?1:0)-(keys.has('a')||keys.has('arrowleft')||keys.has('left')?1:0);let v=new THREE.Vector3(-Math.sin(yaw)*f+Math.cos(yaw)*r,0,-Math.cos(yaw)*f-Math.sin(yaw)*r);if(v.lengthSq())v.normalize();velocity.lerp(v.multiplyScalar(5.7),1-Math.exp(-dt*9));if(velocity.lengthSq()>.015){let before=avatar.position.clone();avatar.position.addScaledVector(velocity,dt);
 if((Math.abs(avatar.position.z-3)<.5&&Math.abs(avatar.position.x)>2.3&&Math.abs(avatar.position.x)<13.3)||(Math.abs(avatar.position.z-1.2)<.45&&Math.abs(avatar.position.x)>1.15&&Math.abs(avatar.position.x)<11.5)||(avatar.position.z<1&&Math.abs(avatar.position.x)>10.7&&Math.abs(avatar.position.x)<12))avatar.position.copy(before);
avatar.rotation.y=THREE.MathUtils.lerp(avatar.rotation.y,Math.atan2(velocity.x,velocity.z),Math.min(1,dt*12));avatar.position.y=Math.abs(Math.sin(t*10))*.045;avatar.position.x=THREE.MathUtils.clamp(avatar.position.x,-40,40);avatar.position.z=THREE.MathUtils.clamp(avatar.position.z,-16,48);if(avatar.position.z<1&&state.stage==='courtyard'){state.stage='explore';save();ui()}}else avatar.position.y=0}
c2Tick(dt,t,active);roofGroup.visible=true;facade.visible=true;let opening=cutsceneDone?1:cutscene.classList.contains('hidden')?0:THREE.MathUtils.smoothstep(cinematicTime,4.7,8.2);for(let door of gateDoors)door.pivot.rotation.y=door.side*opening*1.18;let gp=guidePosition();guide.visible=!inspecting&&cutscene.classList.contains('hidden')&&!!gp;if(gp){guide.position.copy(gp);guide.position.y+=Math.sin(t*2.8)*.12;guideRing.rotation.z=t*.9}for(let [i,n] of npcs.entries()){let actor=n.obj,phase=t*1.3+i*1.7;actor.rotation.z=Math.sin(phase)*.006;actor.userData.head.rotation.y=Math.sin(phase*.55)*.11+(cinematicTime>9&&!cutscene.classList.contains('hidden')&&n.id==='han'?.22:0);actor.userData.leftArm.rotation.x=Math.sin(phase)*.09;actor.userData.rightArm.rotation.x=-Math.sin(phase)*.07+(cinematicTime>12&&cinematicTime<16&&!cutscene.classList.contains('hidden')&&n.id==='han'?.27:0)+(cinematicTime>9&&cinematicTime<13&&!cutscene.classList.contains('hidden')&&n.id==='mi'?.36:0);let blink=Math.sin(t*.73+i*2.1)>.997?.12:1;for(let eye of actor.userData.eyes)eye.scale.y=blink;actor.userData.ribbonA.rotation.z=.11+Math.sin(phase)*.035}let stride=velocity.lengthSq()>.15&&cutscene.classList.contains('hidden')?Math.sin(t*11)*.16:0;avatar.userData.leftArm.rotation.x=stride;avatar.userData.rightArm.rotation.x=-stride;
let look=avatar.position.clone();look.y=2;if(c2On()&&['cook','cut'].includes(state.c2.phase))look.set(state.c2.phase==='cut'?-4:5,1.5,state.c2.phase==='cut'?-7:-9);if(state.stage==='present'||state.stage==='ending')look.set(0,1.3,-3);if(['chop','heat','season'].includes(state.stage))look.set(state.stage==='chop'?-4:5,1.5,state.stage==='chop'?-7:-9);focus.lerp(inspecting?inspectFocus:look,Math.min(1,dt*3));let viewDist=inspecting?inspectDist:dist;let desired=new THREE.Vector3(focus.x+Math.sin(yaw)*Math.cos(pitch)*viewDist,focus.y+Math.sin(pitch)*viewDist,focus.z+Math.cos(yaw)*Math.cos(pitch)*viewDist);if(!inspecting&&cutscene.classList.contains('hidden')&&avatar.position.z<0){desired.x=THREE.MathUtils.clamp(desired.x,-10.7,10.7);desired.z=THREE.MathUtils.clamp(desired.z,-16.7,.28);desired.y=Math.min(desired.y,6.75)}camera.position.lerp(desired,Math.min(1,dt*4));camera.lookAt(focus);
if(!cutscene.classList.contains('hidden')){
 cinematicTime+=dt;cutsceneText();let shot=cinematicShots.find(x=>cinematicTime<x.end)||cinematicShots.at(-1);let daylight=THREE.MathUtils.clamp(cinematicTime/19,0,1);scene.background.setRGB(.28+daylight*.29,.38+daylight*.26,.46+daylight*.18);scene.fog.color.copy(scene.background);sun.intensity=1.8+daylight*1.2;sun.position.set(-25+daylight*7,9+daylight*18,10);renderer.toneMappingExposure=1.4+daylight*.25;let u=THREE.MathUtils.clamp((cinematicTime-shot.start)/(shot.end-shot.start),0,1);u=u*u*(3-2*u);
 camera.position.set(...shot.from).lerp(new THREE.Vector3(...shot.to),u);let aim=new THREE.Vector3(...shot.aimFrom).lerp(new THREE.Vector3(...shot.aimTo),u);camera.lookAt(aim);
 // Ah Kii crosses the threshold and Han turns toward her during the scene.
 if(cinematicTime>4.5&&cinematicTime<9){avatar.position.set(0,Math.abs(Math.sin(cinematicTime*7))*.04,23-(cinematicTime-4.5)*3.2);avatar.rotation.y=Math.PI}
 if(cinematicTime>=19)finishCutscene();
}
for(let [j,flame] of fireGroup.children.entries()){flame.scale.y=(.6+Math.sin(t*8+flame.userData.phase)*.2+state.heat*.006);flame.rotation.z=Math.sin(t*4+j)*.1}fireLight.intensity=2.5+Math.sin(t*11)*.5+state.heat*.07;for(let [j,o] of smoke.entries()){o.position.y=2.4+((t*.4+j*.19)%2.4);o.position.x=5+Math.sin(t+j)*.3}
if(state.stage==='heat'&&active){let fueling=fuel||keys.has(' ');state.heat=THREE.MathUtils.clamp(state.heat+(fueling?32:-13)*dt,0,100);if(state.heat>39&&state.heat<68)state.stable=Math.min(8,state.stable+dt);else if(state.heat>80)state.stable=Math.max(0,state.stable-dt*.5);updateHeatHud();if(Math.floor(t)!==Math.floor(t-dt))save()}
if(knifeAnim>0){knifeAnim-=dt*4;knife.rotation.x=.4+Math.sin((1-knifeAnim)*Math.PI)*1.1}
let near=nearest();prompt.classList.toggle('hidden',inspecting||!near||near.distance>=3.6||!['courtyard','explore','competition'].includes(state.stage));if(near&&near.distance<3.6)prompt.textContent=L(`E · 與${near.name}互動`,dialogues[near.id]?`E · ${near.name}에게 말 걸기`:`E · ${near.name} 살펴보기`);
for(let i of interactables){let el=tagEls.get(i.id);let visible=!inspecting&&(state.stage==='explore'||(state.stage==='courtyard'&&i.id==='han'&&avatar.position.z<9));if(!visible){el.style.display='none';continue}let v=i.pos.clone();v.y=3.15;v.project(camera);let inFrame=v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1;el.style.display=inFrame?'block':'none';el.style.left=(v.x*.5+.5)*innerWidth+'px';el.style.top=(-v.y*.5+.5)*innerHeight+'px';el.classList.toggle('near',near?.id===i.id&&near.distance<3.6)}renderer.render(scene,camera)}
window.startChapter2=c2Start;refreshLanguage();animate();
