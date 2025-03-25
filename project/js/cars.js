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