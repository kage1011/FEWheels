function renderWinners(winners) {
    const background = document.querySelector('.winner-wraper');
    const oldCards = document.querySelectorAll('.winner-card');
    oldCards.forEach(card => card.remove());
    oldCards.forEach(card => card.classList.remove('winner-card-animation'));
    const positions = [
        'pos-top-center',
        'pos-left',
        'pos-right',
        'pos-bottom-left',
        'pos-bottom-right'
    ];

    winners.forEach((winner, index) => {
        const card = document.createElement('div');
        card.className = `winner-card ${positions[index]}`;
        card.innerHTML = `
            <img src="../assets/users/${winner.UserCode}.png" alt="${winner.UserCode}">
            <div class="info">
                <div style="font-weight: bold; color: #ffd700;">${winner.UserCode}</div>
                <div style="font-size: 0.9em;">${winner.UserName}</div>
            </div>
        `;
        background.appendChild(card);
    });
    setTimeout(function () {
        background.classList.remove('winner-hide');
        const newCards = document.querySelectorAll('.winner-card');
        newCards.forEach(card => card.classList.add('winner-card-animation'));
    }, 2000);

}