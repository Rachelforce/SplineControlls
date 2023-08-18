const divId = "web-you-3d-painting";
let canvas = document.getElementById(divId);
const paintingPath = canvas.dataset.url;
const paintingW = parseFloat(canvas.dataset.width) / 100;
const paintingH = parseFloat(canvas.dataset.height) / 100;

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

let controls, camera, cameraOnSpline, splinePoints, splineTime = 0, closedSpline;
let firstCameraActive = true, distance, boundingBox, tubeGeometry,binormal,normal;

function main() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio * 2);
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2;
    renderer.outputEncoding = THREE.LinearEncoding;
    renderer.setClearColor(0x0000000, 0);
    canvas.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.001, 5000);

    const texture = new THREE.TextureLoader().load(paintingPath);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const geometry = new THREE.BoxGeometry(paintingW, paintingH, 0.01);
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const blackMaterial = new THREE.MeshBasicMaterial({ color: 0xffffffff });
    const frame_geometry = new THREE.BoxGeometry(paintingW *1.05, paintingH *1.05, 0.01);
    const frame_cube = new THREE.Mesh(frame_geometry, blackMaterial);
    frame_cube.position.set(0, 0, -0.02)
    scene.add(frame_cube);

    boundingBox = new THREE.Box3().setFromObject(cube);
    const objectSize = boundingBox.getSize(new THREE.Vector3()).length();
    const fov = camera.fov * (Math.PI / 180);
    distance = objectSize / (2 * Math.tan(fov / 2));

    camera.position.copy(boundingBox.getCenter(new THREE.Vector3()));
    camera.position.z += distance * 0.8;
    camera.lookAt(boundingBox.getCenter(new THREE.Vector3()));
    const halfCubeWidth = paintingW * 0.5;
    const halfCubeHeight = paintingH * 0.5;
    const offset = 0.1;


    
    var light = new THREE.HemisphereLight('#FFFFFF', '#757575', 0.5);
    scene.add(light);

    light = new THREE.SpotLight(0xc3c3c3, 0.5);
    light.position.set(-4, 4, -1);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 1024 * 4;
    light.shadow.mapSize.height = 1024 * 4;
    scene.add(light);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    animate();


    window.addEventListener('resize', onWindowResize, false);
}

function setupSecondCamera() {
    cameraOnSpline = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.001, 5000);


}


function addGeometry( geometry ) {
    var material = new THREE.MeshLambertMaterial( { color: 0xff00ff } );

var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );
var mesh = new THREE.Mesh( geometry, material );
var wireframe = new THREE.Mesh( geometry, wireframeMaterial );
mesh.add( wireframe );

scene.add( mesh );

}
function animate() {
    if (firstCameraActive) {
        controls.update();
    } else {
       
       
    }
   

    renderer.render(scene, firstCameraActive ? camera : cameraOnSpline);

    requestAnimationFrame(animate);
}

function onWindowResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

main();