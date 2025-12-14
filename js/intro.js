document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    goToPage('index.html')
  }
});

document.querySelectorAll('.fade-letters .line').forEach(line => {
  let letters = line.textContent.split('');

  line.innerHTML = letters.map((char, index) => {
    if (char === " ") char = "&nbsp;";
    return `<span style="animation-delay:${index * 0.12}s">${char}</span>`;
  }).join('');
});


document.querySelectorAll('.fade-letters .line-2').forEach(line => {
  let letters = line.textContent.split('');

  line.innerHTML = letters.map((char, index) => {
    if (char === " ") char = "&nbsp;";
    return `<span style="animation-delay:${index * 0.12}s">${char}</span>`;
  }).join('');
});

document.querySelectorAll('.fade-letters .line-3').forEach(line => {
  let letters = line.textContent.split('');

  line.innerHTML = letters.map((char, index) => {
    if (char === " ") char = "&nbsp;";
    return `<span style="animation-delay:${index * 0.12}s">${char}</span>`;
  }).join('');
});

function renderCircles() {
  const container = document.querySelector(".circles");
  container.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const div = document.createElement("div");
    if (i == 0) {
      div.className = "circle-item-1";
    }
    if (i == 1) {
      div.className = "circle-item-2";
    } if (i == 2) {
      div.className = "circle-item-3";
    } if (i == 3) {
      div.className = "circle-item-4";
    } if (i == 4) {
      div.className = "circle-item-5";
    } if (i == 5) {
      div.className = "circle-item-6";
    } if (i == 6) {
      div.className = "circle-item-7";
    }
    container.appendChild(div);
  }
}

renderCircles();