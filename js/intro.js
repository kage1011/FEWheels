document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    window.location.href = "index.html";
  }
});
