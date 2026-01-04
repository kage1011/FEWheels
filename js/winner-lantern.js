const lanternLeft = document.getElementById('lantern-left');
const lanternRight = document.getElementById('lantern-right');
let isLanternVisible = false;

function showLanterns() {
    lanternLeft.classList.add('show');
    lanternRight.classList.add('show');
    isLanternVisible = true;
}

function closeLantern() {
    lanternLeft.classList.remove('show');
    lanternRight.classList.remove('show');
    isLanternVisible = false;
}

function handleCloseClick() {
    if (isLanternVisible) {
        closeLantern();
    } else {
        console.log("Lồng đèn đang ẩn");
    }
}