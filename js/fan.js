function toggleFan() {
    document.getElementById('fan').classList.toggle('active');
}

function hideFan() {
    const fan = document.getElementById('fan');
    fan.classList.remove('active');
    const oldCards = document.querySelectorAll('.winner-card');
    oldCards.forEach(card => card.remove());
    const background = document.querySelector('.winner-wraper');
    background.classList.add('winner-hide');
}