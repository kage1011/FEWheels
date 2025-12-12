document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    window.location.href = "index.html";
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