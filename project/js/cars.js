let manufactures = {}

fetch('../data/cars.json')
    .then(response => response.json())
    .then(data => {
        manufactures = data;
        setUpCars();
    });

function setUpCars() {
    let manufactureList = document.getElementById('manufactureList');
    manufactureList.innerHTML = "";
    let html = "";
    manufactures.forEach(manufacture => {
        html += `
            <div class="manufacture" id="manufacture-${manufacture.id}" onclick="toggleManufactureDropdown(this)">
                <div class="manufacture-headline" id="manufacture-${manufacture.id}-headline">
                    <h2 class="manufacture-name" id="manufacture-${manufacture.id}-name">${manufacture.label}</h2>
                    <i class="fas fa-chevron-right manufacture-dropdown-icon"></i>
                </div>
                <div class="manufacture-cars" id="manufacture-${manufacture.id}-cars">
        `;

        manufacture.models.forEach(car => {
            html += `
                    <div class="manufacture-car" id="manufacture-${manufacture.id}-car-${car.id}" onclick="window.location.href='car.html?car=${car.id}'">
                        <img src="../assets/img/thumbnails/${car.id}.png" alt="Car ${car.label}" class="manufacture-car-image">
                        <h2 class="manufacture-car-name" id="manufacture-${manufacture.id}-car-${car.id}-name">${car.label}</h2>
                    </div>
            `
        })

        html += `
                </div>
            </div>
        `
    })

    manufactureList.innerHTML = html;
}

function toggleManufactureDropdown(parentElement) {
    // manufactureCars is a div element
    let manufactureCars = parentElement.querySelector('.manufacture-cars');
    let dropdownIcon = parentElement.querySelector('.manufacture-dropdown-icon');

    // per default manufactureCars has a height of 0
    if (manufactureCars.clientHeight === 0) {
        dropdownIcon.style.transform = "rotateZ(90deg)";
        manufactureCars.style.height = manufactureCars.scrollHeight + "px";
    } else {
        dropdownIcon.style.transform = "";
        manufactureCars.style.height = "0px";
    }
}