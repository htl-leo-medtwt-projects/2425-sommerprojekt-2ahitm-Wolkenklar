let transitionText = 'Loading...';
let transitionHref = 'Index';

document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (link) {
        if(link.attributes["data-init"]) {
            transitionHref = link.attributes["data-init"].value;
        } else if(link.innerText) {
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
                console.log("enter", transitionHref);
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