init()

function init() {
    setupLanguage();
    setupLanguageOptions();
}

// toggleNav with optional parameter toggle to force a state
function toggleNav(toggle) {
    let nav = document.getElementById("nav");

    if (toggle === true || (toggle === undefined && (nav.style.display === "none" || nav.style.display === ""))) {
        nav.style.display = "block";
        setTimeout(() => {
            nav.style.left = "0px";
        }, 10);
    } else {
        nav.style.left = "-35vw";
        setTimeout(() => {
            nav.style.display = "none";
        }, 500);
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