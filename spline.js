const divId = "web-you-3d-container";
let container = document.getElementById( divId);
const paintingPath = container.dataset.url;
const paintingW = parseFloat(container.dataset.width)/10;
const paintingH = parseFloat(container.dataset.height)/10;
var stats;

var camera, scene, renderer, splineCamera, cameraHelper, cameraEye,SplineControls,boundingBox;

var binormal = new THREE.Vector3();
var normal = new THREE.Vector3();
function init() {

// Получаем ссылки на кнопки
const animationOnButton = document.getElementById("animationOnButton");
const animationOffButton = document.getElementById("animationOffButton");

// Обработчики событий для кнопок
animationOnButton.addEventListener("click", function() {
    params.animationView = true;
    animateCamera(); // Вызываем функцию для обновления камеры
});

animationOffButton.addEventListener("click", function() {
    params.animationView = false;
    animateCamera(); // Вызываем функцию для обновления камеры
});


// camera
const halfCubeWidth = paintingW * 0.5;
const halfCubeHeight = paintingH * 0.5;
const offset = paintingW/paintingH/paintingH*0.1;
console.log(offset)
const perimetrSpline = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-halfCubeWidth - offset, -halfCubeHeight - offset, 0),
        new THREE.Vector3(-halfCubeWidth - offset, -halfCubeHeight - offset * 0.5, 0), // Новая точка
        new THREE.Vector3(-halfCubeWidth - offset*2, halfCubeHeight + offset * 0.5, 0), // Новая точка
        new THREE.Vector3(-halfCubeWidth - offset, halfCubeHeight + offset*2, 0),
        new THREE.Vector3(halfCubeWidth + offset, halfCubeHeight + offset, 0),
        new THREE.Vector3(halfCubeWidth + offset*2, halfCubeHeight + offset * 0.5, 0), // Новая точка
        new THREE.Vector3(halfCubeWidth + offset, -halfCubeHeight - offset , 0), // Новая точка
        new THREE.Vector3(halfCubeWidth + offset, -halfCubeHeight - offset, 0)

    ],
    true, // Не замыкать сплайн
    'centripetal', // Тип кривой
    0.4 // Напряженность
);

splines.PerimetrSpline = perimetrSpline;
camera = new THREE.PerspectiveCamera( 50, container.clientWidth / container.clientHeight, 0.01, 10000000 );


// scene

scene = new THREE.Scene();
scene.background = new THREE.Color( 0xf0f0f0 );
const paintingTexture = new THREE.TextureLoader().load(paintingPath);
const paintingMaterial = new THREE.MeshBasicMaterial({ map: paintingTexture, side: THREE.DoubleSide });
const paintingGeometry = new THREE.BoxGeometry(paintingW, paintingH, 0.1);
const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);
scene.add(painting);
const blackMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF ,DoubleSide:true});
const frame_geometry = new THREE.BoxGeometry(paintingW * 1.05, paintingH * 1.05, 0.05);
const frame_cube = new THREE.Mesh(frame_geometry, blackMaterial);
frame_cube.position.set(0, 0, -0.2)
scene.add(frame_cube);
// light
boundingBox = new THREE.Box3().setFromObject(painting);
const objectSize = boundingBox.getSize(new THREE.Vector3()).length();
const fov = camera.fov * (Math.PI / 180);
var distance = objectSize / (2 * Math.tan(fov / 2));

camera.position.copy(boundingBox.getCenter(new THREE.Vector3()));
camera.position.z += distance * 0.8;
camera.lookAt(boundingBox.getCenter(new THREE.Vector3()));

var light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 0, 0, 1 );
scene.add( light );

// tube

parent = new THREE.Object3D();
scene.add( parent );

splineCamera = new THREE.PerspectiveCamera( 84, container.clientWidth / container.clientHeight, 0.01, 1000 );
parent.add( splineCamera );


cameraHelper = new THREE.CameraHelper( splineCamera );
scene.add( cameraHelper );

addTube();

// debug camera

cameraEye = new THREE.Mesh( new THREE.SphereBufferGeometry( 5 ), new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
parent.add( cameraEye );

cameraHelper.visible = params.cameraHelper;
cameraEye.visible = params.cameraHelper;

// renderer

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio(window.devicePixelRatio * 2);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.gammaOutput = true;
//renderer.gammaFactor = 2;
renderer.outputEncoding = THREE.LinearEncoding;
renderer.setClearColor(0xffffff, 0);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild( renderer.domElement );
SplineControls = new THREE.OrbitControls(splineCamera, renderer.domElement);
// stats

//stats = new Stats();
//container.appendChild( stats.dom );

// dat.GUI
if(false){
    var gui = new dat.GUI( { width: 300 } );

    var folderGeometry = gui.addFolder( 'Geometry' );
    folderGeometry.add( params, 'spline', Object.keys( splines ) ).onChange( function () {

        addTube();

    } );
    folderGeometry.add( params, 'scale', 0, 10 ).step( 0.1 ).onChange( function () {

        setScale();

    } );
    folderGeometry.add( params, 'extrusionSegments', 50, 500 ).step( 50 ).onChange( function () {

        addTube();

    } );
    folderGeometry.add( params, 'radiusSegments', 2, 12 ).step( 1 ).onChange( function () {

        addTube();

    } );
    folderGeometry.add( params, 'closed' ).onChange( function () {

        addTube();

    } );
    folderGeometry.open();

    var folderCamera = gui.addFolder( 'Camera' );
    folderCamera.add( params, 'animationView' ).onChange( function () {

        animateCamera();

    } );
    folderCamera.add( params, 'lookAhead' ).onChange( function () {

        animateCamera();

    } );
    folderCamera.add( params, 'cameraHelper' ).onChange( function () {

        animateCamera();

    } );
    folderCamera.open();
}
var controls = new THREE.OrbitControls( camera, renderer.domElement );

window.addEventListener( 'resize', onWindowResize, false );

}





var sampleClosedSpline = new THREE.CatmullRomCurve3( [
new THREE.Vector3( 0, - 40, - 40 ),
new THREE.Vector3( 0, 40, - 40 ),
new THREE.Vector3( 0, 140, - 40 ),
new THREE.Vector3( 0, 40, 40 ),
new THREE.Vector3( 0, - 40, 40 )
] );

// Keep a dictionary of Curve instances
var splines = {
PerimetrSpline: sampleClosedSpline
};

var parent, tubeGeometry, mesh;

var params = {
spline: 'PerimetrSpline',
scale: 1,
extrusionSegments: 100,
radiusSegments: 3,
closed: true,
animationView: false,
lookAhead: false,
cameraHelper: false,
};

var material = new THREE.MeshLambertMaterial( { color: 0xff00ff, opacity: 0.0, transparent: true } );

var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.0, wireframe: true, transparent: true } );

function addTube() {

if ( mesh !== undefined ) {

    parent.remove( mesh );
    mesh.geometry.dispose();

}

var extrudePath = splines[ params.spline ];

tubeGeometry = new THREE.TubeBufferGeometry( extrudePath, params.extrusionSegments, 0.2, params.radiusSegments, params.closed );

addGeometry( tubeGeometry );

setScale();

}

function setScale() {

mesh.scale.set( params.scale, params.scale, params.scale );

}


function addGeometry( geometry ) {

// 3D shape

mesh = new THREE.Mesh( geometry, material );
var wireframe = new THREE.Mesh( geometry, wireframeMaterial );
mesh.add( wireframe );

parent.add( mesh );

}

function animateCamera() {

cameraHelper.visible = params.cameraHelper;
cameraEye.visible = params.cameraHelper;

}

init();
animate();


function onWindowResize() {

camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

requestAnimationFrame( animate );
SplineControls.update();
render();
//stats.update();

}

function render() {
// ...

var time = Date.now();
var looptime = 20 * 1000;
var t = (time % looptime) / looptime;

var pos = tubeGeometry.parameters.path.getPointAt(t);
pos.multiplyScalar(params.scale);

var segments = tubeGeometry.tangents.length;
var pickt = t * segments;
var pick = Math.floor(pickt);
var pickNext = (pick + 1) % segments;

binormal.subVectors(tubeGeometry.binormals[pickNext], tubeGeometry.binormals[pick]);
binormal.multiplyScalar(pickt - pick).add(tubeGeometry.binormals[pick]);

var dir = tubeGeometry.parameters.path.getTangentAt(t);
var offset = 0;

normal.copy(binormal).cross(dir);

pos.add(normal.clone().multiplyScalar(offset));

splineCamera.position.copy(pos);
cameraEye.position.copy(pos);

var lookAt = tubeGeometry.parameters.path.getPointAt((t + 30 / tubeGeometry.parameters.path.getLength()) % 1).multiplyScalar(params.scale);

// Rotate the direction vector by 90 degrees around the Y axis
var angle = Math.PI/2 ;
var axis = pos.cross(binormal).cross(new THREE.Vector3(0,1,0)); // Y axis


// Rotate the lookAt vector by 90 degrees around the Y axis
// dir.applyAxisAngle(axis, angle);

if (!params.lookAhead) lookAt.copy(pos).add(dir);
splineCamera.lookAt(new THREE.Vector3(0,0,0));
splineCamera.updateMatrixWorld();

cameraHelper.update();

renderer.render(scene, params.animationView === true ? splineCamera : camera);
//console.log(splineCamera.rotation)
}

