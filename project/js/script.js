init()

function init() {
    setupLanguage();
    setupLanguageOptions();
    loadTheme();
    document.querySelector(".theme-controller").addEventListener("change", function() {
        console.log(this);
        safeTheme(this);
    });
}

// toggleNav with optional parameter toggle to force a state
function toggleNav(toggle) {
    let nav = document.getElementById("nav");

    if (toggle === true || (toggle === undefined && (nav.style.left === "-35vw" || nav.style.left === ""))) {
        // nav.style.display = "block";
        // setTimeout(() => {
        //     if(nav.style.display === "block") {
                nav.style.left = "0px";
        //     }
        // }, 10);
    } else {
        nav.style.left = "-35vw";
        // setTimeout(() => {
        //     if(nav.style.left === "-35vw") {
        //         nav.style.display = "none";
        //     }
        // }, 500);
    }
}

function setupLanguage() {
    let lang = navigator.language.split("-")[0];

    const storedLang = localStorage.getItem("lang");
    if (storedLang) {
        lang = storedLang;
    }

    changeLanguage(lang);
}

function setupLanguageOptions() {
    const langSelect = document.getElementById("lang-select");
    langSelect.innerHTML = "";

    for (const lang in languages) {
        const langOption = document.createElement("option");
        langOption.value = lang;
        langOption.innerHTML = languages[lang].flag + " " + languages[lang].name;

        langSelect.appendChild(langOption);
    }

    langSelect.value = localStorage.getItem("lang") || navigator.language.split("-")[0];
    langSelect.addEventListener("change", () => changeLanguage(langSelect.value));
}

function safeTheme(controller) {
    localStorage.setItem("dark-mode", controller.checked);
}

function loadTheme() {
    const darkMode = localStorage.getItem("dark-mode");
    const themeControllers = document.getElementsByClassName("theme-controller");

    for (const themeController of themeControllers) {
        themeController.checked = darkMode === "true";
    }
}