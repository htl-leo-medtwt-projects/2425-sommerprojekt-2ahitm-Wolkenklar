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
    function changeColor(materialName, color, colorIndex) {
        if (carModel) {
            config.paintParts[materialName] = colorIndex;
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
    colorList.innerHTML = colorHtml;


    function encodeConfig(config, maxConfigs) {
        const base62chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (const key in config) {
            if (!(key in maxConfigs)) {
                return;
            }
        }

        let bitPos = 0;
        let value = 0;

        for (const key in maxConfigs) {
            if (!(key in config)) continue;

            let max = maxConfigs[key];
            let bits = Math.ceil(Math.log2(max + 1));
            let val = config[key];

            if (max === 1) {
                val = val ? 1 : 0;
            } else {
                if (typeof val !== 'number' || val > max) return;
            }

            value |= (val & ((1 << bits) - 1)) << bitPos;
            bitPos += bits;
        }

        let encoded = '';
        do {
            encoded = base62chars[value % 62] + encoded;
            value = Math.floor(value / 62);
        } while (value > 0);

        return encoded;
    }

    function decodeConfig(code, maxConfigs) {
        const base62chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        let value = 0;
        for (let i = 0; i < code.length; i++) {
            const index = base62chars.indexOf(code[i]);
            if (index === -1) return null;
            value = value * 62 + index;
        }

        const config = {};
        let bitPos = 0;

        for (const key in maxConfigs) {
            const max = maxConfigs[key];
            const bits = Math.ceil(Math.log2(max + 1));
            const mask = (1 << bits) - 1;

            const raw = (value >> bitPos) & mask;

            if (max === 1) {
                config[key] = !!raw;
            } else {
                config[key] = raw;
            }

            bitPos += bits;
        }

        return config;
    }


    let maxConfig = car.maxMods
    let config = maxConfig;
    console.log(config)

    function clickEncode() {
        console.log(config, maxConfig);
        let encoded = encodeConfig(config, maxConfig);
        console.log(encoded)
        if (encoded) {
            alert("Code: " + encoded);
        } else {
            console.error("Encoding failed");
        }
    }

    window.clickEncode = clickEncode;

    function clickDecode() {
        let code = prompt("Enter code to decode:");
        if (code) {
            let decoded = decodeConfig(code, maxConfig);
            if (decoded) {
                config = decoded;
                setUpConfig();
            } else {
                alert("Decoding failed");
            }
        }
    }

    window.clickDecode = clickDecode;

    function setUpConfig() {
        if(mods.paintParts) {
            mods.paintParts.forEach(paintPart => {
                let colorIndex = config.paintParts[paintPart.name];
                if (colorIndex !== undefined) {
                    changeColor(paintPart.name, paintPart.colors[colorIndex].hex, colorIndex);
                }
            });
        }

        if(mods.bodyParts) {
            mods.bodyParts.forEach(bodyPart => {
                let visible = config.bodyParts[bodyPart.name];
                toggleBodyPart(bodyPart.name, visible);
            });
        }
    }

    window.setUpConfig = setUpConfig;
}

window.initConfigurator = setupConfigurator;