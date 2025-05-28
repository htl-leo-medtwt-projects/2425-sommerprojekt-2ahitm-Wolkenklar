function fetchCars() {
    console.log("fetching cars");
    fetch('../data/cars.json')
        .then(response => response.json())
        .then(data => {
            setUpCars(data);
        });
}
window.initCars = fetchCars;

function setUpCars(manufacturers) {
    let manufacturerList = document.getElementById('manufacturerList');
    manufacturerList.innerHTML = "";
    let html = "";
    manufacturers.forEach(manufacturer => {
        html += `
            <div class="manufacturer" id="manufacturer-${manufacturer.name}" onclick="toggleManufacturerDropdown(this)">
                <div class="manufacturer-headline" id="manufacturer-${manufacturer.name}-headline">
                    <h2 class="manufacturer-name" id="manufacturer-${manufacturer.name}-name">${manufacturer.label}</h2>
                    <i class="fas fa-chevron-right manufacturer-dropdown-icon"></i>
                </div>
                <div class="manufacturer-cars" id="manufacturer-${manufacturer.name}-cars">
        `;

        manufacturer.models.forEach(car => {
            console.log(car)
            html += `
                    <div class="manufacturer-car" id="manufacturer-${manufacturer.name}-car-${car.name}">
                        <a href="configurator.html?manufacturer=${manufacturer.name}&car=${car.name}" class="manufacturer-car-link" data-init="Configurator"></a>
                        <img src="../assets/img/thumbnails/${car.name}.png" alt="Car ${car.label}" class="manufacturer-car-image">
                        <h2 class="manufacturer-car-name" id="manufacturer-${manufacturer.name}-car-${car.name}-name">${car.label}</h2>
                    </div>
            `
        })

        html += `
                </div>
            </div>
        `
    })

    manufacturerList.innerHTML = html;
}

function toggleManufacturerDropdown(parentElement) {
    // manufacturerCars is a div element
    let manufacturerCars = parentElement.querySelector('.manufacturer-cars');
    let dropdownIcon = parentElement.querySelector('.manufacturer-dropdown-icon');

    // per default manufacturerCars has a height of 0
    if (manufacturerCars.clientHeight === 0) {
        dropdownIcon.style.transform = "rotateZ(90deg)";
        manufacturerCars.style.height = manufacturerCars.scrollHeight + "px";
    } else {
        dropdownIcon.style.transform = "";
        manufacturerCars.style.height = "0px";
    }
}