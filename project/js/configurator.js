import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load the 3D model
function loadModel(url) {
    const loader = new GLTFLoader();
    let carModel;
    loader.load('assets/porsche_911_gt3_2022.glb', (gltf) => {
        carModel = gltf.scene;
        scene.add(carModel);
    });

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}


const urlParams = new URLSearchParams(window.location.search);
let carId = urlParams.get('car');
let manufactureId = urlParams.get('manufacture');
let car = manufactures.find(m => m.id === manufactureId).models.find(c => c.id === carId);
let glbUrl = car.glbUrl;
loadModel(glbUrl);