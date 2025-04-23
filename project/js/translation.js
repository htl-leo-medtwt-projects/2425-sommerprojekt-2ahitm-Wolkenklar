const languages = {
    "de": {
        name: "Deutsch",
        flag: "🇩🇪"
    },
    "en": {
        name: "English",
        flag: "🇬🇧"
    },
};

const translations = {
    "general": {
        "company-name": "Velox Custom",
    },
    "de": {
        "nav-home": "Startseite",
        "nav-cars": "Autos",
        "nav-imprint": "Impressum",
        "cars-headline": "Unser Katalog",
        "configurator-title": "Konfigurator",
    },
    "en": {
        "nav-home": "Home",
        "nav-cars": "Cars",
        "nav-imprint": "Imprint",
        "cars-headline": "Our Catalog",
        "configurator-title": "Configurator",
    }
}

const carTranslations = {
    "de": {
        "config-body": "Karosserie",
        "config-wheel_accent": "Radakzent",
        "config-interior": "Innenraum",
    },
    "en": {
        "config-body": "Body",
        "config-wheel_accent": "Wheel Accent",
        "config-interior": "Interior",
    }
}


function changeLanguage(lang) {
    const elements = document.querySelectorAll("[t-id]");
    elements.forEach(element => {
        const id = element.getAttribute("t-id");

        element.innerHTML = translations[lang][id] || translations["general"][id] || carTranslations[lang][id] || carTranslations["general"][id] || "TRANSLATION MISSING PLEASE CONTACT AN ADMIN";
    });

    localStorage.setItem("lang", lang);
}