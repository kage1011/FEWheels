const envelope = document.getElementById('envelope');
const halo = document.getElementById('halo');
const scene = document.getElementById('scene');
let isOpened = false;
let isAnimating = false;
let spotlightInterval;
const stageSpotlight = document.getElementById('stage-spotlight');

function startReveal() {
    if (isAnimating) return;
    isAnimating = true;
    resetEffect();
    scene.style.zIndex = 99999;
    envelope.classList.add('entrance');
    envelope.addEventListener('animationend', onEntranceComplete, { once: true });
}

function onEntranceComplete() {
    setTimeout(() => {
        envelope.classList.add('open');
        halo.classList.add('active');
        isOpened = true;
        isAnimating = false;
    }, 100);
}

function closeAndExit() {
    if (!isOpened || isAnimating) return;
    isAnimating = true;
    envelope.classList.remove('open');
    halo.classList.remove('active');
    setTimeout(() => {
        envelope.classList.remove('entrance');
        envelope.classList.add('exit');

        envelope.addEventListener('animationend', () => {
            isAnimating = false;
            isOpened = false;
            scene.style.zIndex = 14;
            console.log("Đã bay đi xong, sẵn sàng lượt mới");
        }, { once: true });

    }, 800);
    stageSpotlight.classList.remove('active', 'searching');
    closeLantern();
}

function resetEffect() {
    scene.style.zIndex = 14;
    envelope.classList.remove('entrance', 'exit', 'open');
    halo.classList.remove('active');
    void envelope.offsetWidth;
}
// document.addEventListener('keydown', (e) => {
//     // Nhấn Enter để quay số
//     if (e.code === 'Space') {
//         // startReveal();
//         startShow();
//     }
// });



// SPOTLIGT STAGE


function startShow() {
    moveSpotlightsRandomly();
    stageSpotlight.classList.add('active', 'searching');
    let counter = 0;

    spotlightInterval = setInterval(() => {
        moveSpotlightsRandomly();
        counter += 600;
        // 4. SAU 5 GIÂY -> FOCUS
        if (counter >= 5000) {
            clearInterval(spotlightInterval);
            focusSpotlightAndReveal();
        }
    }, 600);
}

function moveSpotlightsRandomly() {
    const x1 = Math.random() * 60;
    const y1 = Math.random() * 80 + 10;
    const x2 = Math.random() * 60 + 40;
    const y2 = Math.random() * 80 + 10;
    updateLights(x1, y1, x2, y2);
}

function updateLights(x1, y1, x2, y2) {
    stageSpotlight.style.setProperty('--x1', x1 + '%');
    stageSpotlight.style.setProperty('--y1', y1 + '%');
    stageSpotlight.style.setProperty('--x2', x2 + '%');
    stageSpotlight.style.setProperty('--y2', y2 + '%');
}

// Giai đoạn chót: Focus và hiện Bao lì xì
function focusSpotlightAndReveal() {
    updateLights(50, 50, 50, 50);
    setTimeout(() => {
        startReveal();
    }, 800);
}