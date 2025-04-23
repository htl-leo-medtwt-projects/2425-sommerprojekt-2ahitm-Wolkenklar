import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

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

// Load HDR environment map
const hdrLoader = new RGBELoader();
hdrLoader.load('../assets/hdr/docklands_02_2k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
});

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
await fetch('../data/cars.json')
    .then(response => response.json())
    .then(data => {
        manufactures = data;
    });

let manufacture = manufactures.find(m => m.id == manufactureId)
let car = manufacture.models.find(c => c.id == carId);
let glbUrl = car.glbUrl;
loadModel(glbUrl);

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


// Change color function e.g. changeColor('CarPaint', '#ff0000');
function changeColor(materialName, color) {
    if (carModel) {
        carModel.traverse((child) => {
            if (child.isMesh && child.material.name === materialName) {
                child.material.color.set(color);
            }
        });
    }
}

window.changeColor = changeColor;

// toggle body parts function e.g. toggleBodyPart('CarBody', true);
function toggleBodyPart(partName, visible) {
    if (carModel) {
        carModel.traverse((child) => {
            if (child.isMesh && child.name === partName) {
                child.visible = visible;
            }
        });

        let conflictingParts = car.mods.addons.find(p => p.name === partName).conflictingParts;
        if (conflictingParts) {
            carModel.traverse((child) => {
                if (child.isMesh && conflictingParts.includes(child.name)) {
                    child.visible = !visible;
                }
            });
        }
    }
}

window.toggleBodyPart = toggleBodyPart;

// setup mods
let mods = car.mods;
let colorList = document.getElementById("config-list");
let colorHtml = "";
mods.paintParts.forEach(paintPart => {
    colorHtml += `
        <h2 class="config-name" t-id="config-${paintPart.name}">${paintPart.label}</h2>
        <div id="config-${paintPart.name}" class="config-colors">
    `
        paintPart.colors.forEach(colorName => {
            let color = manufacture.colors[colorName];
            if (color) {
                colorHtml += `
                    <div class="config-color" id="config-${paintPart.name}-${colorName}" onclick="changeColor('${paintPart.name}', '${color.hex}')" style="background-color: ${color.hex}">
                    </div>
                `;
            }
        });
    colorHtml += `
        </div>
    `;
});
colorList.innerHTML = colorHtml;