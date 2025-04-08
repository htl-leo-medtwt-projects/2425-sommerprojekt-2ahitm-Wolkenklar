import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let carView = document.getElementById("car-view");

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, carView.clientWidth / carView.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(carView.clientWidth, carView.clientHeight);
carView.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight1.position.set(10, 10, 10);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-10, 10, -10);
scene.add(directionalLight2);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let carModel;
const loader = new GLTFLoader();

// Load the 3D model
function loadModel(url) {
    loader.load(url, (gltf) => {
        carModel = gltf.scene;
        scene.add(carModel);
    });

    camera.position.z = 5;

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}


const urlParams = new URLSearchParams(window.location.search);
let carId = urlParams.get('car');
let manufactureId = urlParams.get('manufacture');

if(!carId || !manufactureId) {
    window.location.href = "cars.html";
}

let manufactures = {};
await fetch('../../data/cars.json')
    .then(response => response.json())
    .then(data => {
        manufactures = data;
    });

let car = manufactures.find(m => m.id == manufactureId).models.find(c => c.id == carId);
let glbUrl = "../" + car.glbUrl;
loadModel(glbUrl);

// Change color function e.g. changeColor('CarPaint', '#ff0000');
function changeColor(materialName, color) {
    if (carModel) {
        carModel.traverse((child) => {
            if (child.isMesh && child.material.name === materialName) {
                child.material.color.set(color);
            }
        });
    //     change the color of the material with the name materialName not the mesh
    }
}

window.changeColor = changeColor;

function getWidth() {
    return parseInt(window.getComputedStyle(carView).width);
}

function getHeight() {
    return parseInt(window.getComputedStyle(carView).height);
}


const observer = new ResizeObserver(entries => {
    // I don't know why but the camera and renderer size has to be set twice
    camera.aspect = getWidth() / getHeight();
    camera.updateProjectionMatrix();
    renderer.setSize(getWidth(), getHeight());

    setTimeout( () => {
        camera.aspect = getWidth() / getHeight();
        camera.updateProjectionMatrix();
        renderer.setSize(getWidth(), getHeight());
    }, 1);
});
observer.observe(document.body);