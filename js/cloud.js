const cloud = document.getElementById("cloud-transition");

/* Mây mở ra khi load */
window.addEventListener("load", () => {
  setTimeout(() => {
    cloud.classList.add("hide");
  }, 1000);
});

/* CHỈ BẮT ENTER Ở INTRO */
if (window.location.pathname.includes("intro")) {
  let isTransitioning = false;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !isTransitioning) {
      isTransitioning = true;

      cloud.classList.remove("hide"); // mây che lại

      setTimeout(() => {
        window.location.href = "gacha.html";
      }, 1200);
    }
  });
}
