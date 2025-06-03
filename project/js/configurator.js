import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

async function setupConfigurator() {
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
    let carName = urlParams.get('car');
    let manufacturerName = urlParams.get('manufacturer');

    if (!carName || !manufacturerName) {
        window.location.href = "cars.html";
    }

    let manufacturers = {};
    await fetch('../data/cars.json')
        .then(response => response.json())
        .then(data => {
            manufacturers = data;
        });

    let manufacturer = manufacturers.find(m => m.name == manufacturerName)
    let car = manufacturer.models.find(c => c.name == carName);
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

        setTimeout(() => {
            camera.aspect = getWidth() / getHeight();
            camera.updateProjectionMatrix();
            renderer.setSize(getWidth(), getHeight());
        }, 1);
    });
    observer.observe(document.body);

    // Save image function e.g. saveImage('car.png');
    function saveImage(filename) {
        // Temporarily set a solid background color for the scene
        const originalBackground = scene.background;
        scene.background = new THREE.Color(0xffffff); // White background

        // Render the scene with the temporary background
        renderer.render(scene, camera);

        // Save the image
        const link = document.createElement('a');
        link.download = filename;
        link.href = renderer.domElement.toDataURL('image/png');
        link.click();
        link.remove();

        // Restore the original background
        scene.background = originalBackground;
    }

    window.saveImage = saveImage;


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
        }
    }

    window.toggleBodyPart = toggleBodyPart;

    // setup mods
    let mods = car.mods;
    let configList = document.getElementById("config-list");
    let colorHtml = "";
    mods.paintParts.forEach(paintPart => {
        colorHtml += `
            <h2 class="config-name" t-id="config-${paintPart.name}">${paintPart.label}</h2>
            <div id="config-${paintPart.name}" class="config-colors" style="width: 100%; display: flex; flex-direction: row; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        `
        paintPart.colors.forEach(colorName => {
            let color = manufacturer.colors[colorName];
            if (color) {
                colorHtml += `
                        <div class="config-color" id="config-${paintPart.name}-${colorName}" onclick="changeColor('${paintPart.name}', '${color.hex}', ${paintPart.colors.indexOf(colorName)})" style="background-color: ${color.hex}; aspect-ratio: 1 / 1; width: 30%;"></div>
                    `;
            }
        });
        colorHtml += `
            </div>
        `;
    });
    configList.innerHTML = colorHtml;

    // setup body parts
    let bodyPartsHtml = "<br>";
    if(mods.bodyParts) {
        mods.bodyParts.forEach(part => {
            toggleBodyPart(part.name, false);
            bodyPartsHtml += `
                <div class="config-body-part" id="config-${part.name}">
                    <h2 class="config-name">${part.label}</h2>
                    <input type="checkbox" id="config-${part.name}-checkbox" class="config-checkbox" onclick="toggleBodyPart('${part.name}', this.checked)">
                </div>
            `;
        });
    }
    configList.innerHTML += bodyPartsHtml;

    // add technical data
    let technicalData = document.getElementById("technical-data");
    let technicalDataHtml = `
        <h2 class="technical-data-title" t-id="technical-data-title">Technical Data</h2>
        <div class="technical-data-content">
            <p><strong t-id="technical-data-year">Year</strong><strong>:</strong> ${car.data.year}</p>
            <p><strong t-id="technical-data-price">Price</strong><strong>:</strong> ${car.data.price}€</p>
            <p><strong t-id="technical-data-weight">Weight</strong><strong>:</strong> ${car.data.weight}kg</p>
            <p><strong t-id="technical-data-top-speed">Top Speed</strong><strong>:</strong> ${car.data.topSpeed}km/h</p>
            
            <p><strong t-id="technical-data-engine">Engine</strong><strong>:</strong> ${car.data.engine.label}</p>
            <p><strong t-id="technical-data-horsepower">Horsepower</strong><strong>:</strong> ${car.data.engine.horsepower}</p>
            <p><strong t-id="technical-data-torque">Torque</strong><strong>:</strong> ${car.data.engine.torque} Nm</p>
            <p><strong t-id="technical-data-acceleration">0-100 km/h</strong><strong>:</strong> ${car.data.engine.acceleration} s</p>
            
        </div>
    `;
    technicalData.innerHTML = technicalDataHtml;
}

window.initConfigurator = setupConfigurator;