let transitionText = 'Home';
let transitionHref = 'Index';

document.addEventListener('click', (e) => {
    const link = e.target.closest('div.manufacturer-car') || e.target.closest('a[href]');
    if (link) {
        if(link.attributes["data-init"]) {
            transitionHref = link.attributes["data-init"].value;
        } else if (link.classList.contains('manufacturer-car')) {
            transitionHref = "Configurator";
        } else {
            transitionHref = link.href.split('/').pop().split('.')[0];
        }

        if(link.classList.contains('manufacturer-car')) {
            transitionText = link.querySelector('.manufacturer-car-name').innerText;
        } else {
            transitionText = link.innerText;
        }
    }
});

barba.init({
    transitions: [
        {
            async leave(data) {
                await pageTransitionIn();
            },
            async enter(data) {
                console.log(transitionHref)
                window["init" + transitionHref]?.()
                pageTransitionOut();
            }
        }
    ]
});

function pageTransitionIn() {
    document.querySelector('.transition-text').textContent = transitionText;
    return gsap.to('#transition-overlay', {
        duration: 0.8,
        left: '0%',
        ease: 'power2.inOut'
    });
}

function pageTransitionOut() {
    return gsap.to('#transition-overlay', {
        duration: 0.8,
        left: '100%',
        ease: 'power2.inOut',
        onComplete: () => {
            gsap.set('#transition-overlay', { left: '-100%' });
        }
    });
}