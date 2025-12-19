let prizeList = [];
let selectedPrize = null;
// =========================
// INDEX BD -------------------------------
// =========================
renderGachaRows();

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("FERewardDB", 1);

    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("Users")) {
        const store = db.createObjectStore("Users", {
          keyPath: "UserCode",
        });
      }
    };

    request.onsuccess = function (e) {
      resolve(e.target.result);
    };

    request.onerror = function () {
      reject("Không thể mở DB");
    };
  });
}
async function loadPrizeJson() {
  const res = await fetch("../json/gift.json");
  return await res.json();
}
async function loadUserJson() {
  const res = await fetch("../json/user.json");
  return await res.json();
}
function saveUsersToDB(db, users) {
  return new Promise((resolve) => {
    const tx = db.transaction("Users", "readwrite");
    const store = tx.objectStore("Users");

    users.forEach((user) => store.put(user));

    tx.oncomplete = () => resolve(true);
  });
}
async function initPrizeSelect() {
  prizeList = await loadPrizeJson();
  renderPrizeMenu(prizeList);
}
async function initializeUsers() {
  const db = await openDB();
  const count = await checkUserCount(db);
  if (count > 0) {
    console.log("DB đã có dữ liệu, không import từ JSON");
    return;
  }
  console.log("DB chưa có dữ liệu → Đọc user.json...");
  const users = await loadUserJson();
  await saveUsersToDB(db, users);
  console.log("Đã import JSON vào IndexedDB thành công!");
}

function checkUserCount(db) {
  return new Promise((resolve) => {
    const tx = db.transaction("Users", "readonly");
    const store = tx.objectStore("Users");
    const req = store.count();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(0);
  });
}

function renderPrizeMenu(prizes) {
  const menu = document.getElementById("fabMenu");
  menu.innerHTML = "";
  console.log("Prizes:", prizes);
  prizes.forEach((p) => {
    const div = document.createElement("div");
    div.className = "fab-item";
    div.textContent = `${p.name} (${p.slot} slot)`;
    div.onclick = () => {
      selectedPrize = p;
      toggleFabMenu();
      if (!selectedPrize) return;
      renderGachaRows(selectedPrize.slot == 10 ? 5 : selectedPrize.slot);
      // renderWinners();
      // renderPrize();
    };

    menu.appendChild(div);
  });
}

function toggleFabMenu() {
  document.getElementById("fabMenu").classList.toggle("show");
}

window.onload = function () {
  initializeUsers();
  initPrizeSelect();
};

function renderGachaRows(slotCount) {
  const container = document.getElementById("gachaRows");
  container.innerHTML = "";
  // row 5
  let div = document.createElement("div");
  div.className = "numbers-row";
  let html = "";
  for (let i = 1; i <= 6; i++) {
    html += `<div class="number" id="num_${4}_${i}">0</div>`;
  }
  div.innerHTML = html;
  container.appendChild(div);

  // row 3
  div = document.createElement("div");
  div.className = "numbers-row";
  html = "";
  for (let i = 1; i <= 6; i++) {
    html += `<div class="number" id="num_${2}_${i}">0</div>`;
  }
  div.innerHTML = html;
  container.appendChild(div);

  // row 1
  div = document.createElement("div");
  div.className = "numbers-row";
  html = "";
  for (let i = 1; i <= 6; i++) {
    html += `<div class="number" id="num_${0}_${i}">0</div>`;
  }
  div.innerHTML = html;
  container.appendChild(div);

  // row 2
  div = document.createElement("div");
  div.className = "numbers-row";
  html = "";
  for (let i = 1; i <= 6; i++) {
    html += `<div class="number" id="num_${1}_${i}">0</div>`;
  }
  div.innerHTML = html;
  container.appendChild(div);

  // row 4
  div = document.createElement("div");
  div.className = "numbers-row";
  html = "";
  for (let i = 1; i <= 6; i++) {
    html += `<div class="number" id="num_${3}_${i}">0</div>`;
  }

  div.innerHTML = html;
  container.appendChild(div);
}

// Update,Delete,get
///// get all User
function getUsersFromDB() {
  return new Promise(async (resolve) => {
    const db = await openDB(); // Hàm openDB từ trước
    const tx = db.transaction("Users", "readonly");
    const store = tx.objectStore("Users");

    const users = [];
    store.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;
      if (cursor) {
        users.push(cursor.value);
        cursor.continue();
      } else {
        resolve(users);
      }
    };
  });
}
///// update User
function updateUserInDB(user) {
  return new Promise(async (resolve) => {
    const db = await openDB();
    const tx = db.transaction("Users", "readwrite");
    const store = tx.objectStore("Users");
    store.put(user);
    tx.oncomplete = () => resolve(true);
  });
}

async function spinGacha() {
  if (!selectedPrize) {
    alert("Vui lòng chọn giải thưởng trước!");
    return;
  }
  // Số người cần tìm theo slot

  const slotCount = selectedPrize.slot == 10 ? 5 : selectedPrize.slot;
  const users = await getUsersFromDB();
  // Lọc user hợp lệ
  let availableUsers = users.filter((u) => u.IsReward == 0 && u.isJoin == 1);

  if (availableUsers.length < slotCount) {
    alert("Không đủ người để quay!");
    return;
  }

  const element = document.querySelector(".handle-base");
  // element.classList.add("rotating-image");
  element.classList.add("lever-pull-animation");

  setTimeout(() => {
    element.classList.remove("lever-pull-animation");
  }, 1200);

  startQuestionRain(5000);
  const winners = [];
  for (let i = 0; i < slotCount; i++) {
    const idx = Math.floor(Math.random() * availableUsers.length);
    winners.push(availableUsers[idx]);
    availableUsers.splice(idx, 1); // Xóa để không trùng
  }

  console.log("Winners:", winners);

  // Render từng người theo từng hàng
  winners.forEach((winner, row) => {
    console.log("Winner:", row);
    for (let i = 1; i <= 6; i++) {
      const digit = winner.UserCode[i - 1] ?? "0";
      document.getElementById(`num_${row}_${i}`).textContent = digit;
    }
  });

  // Gọi animation
  playJackpotAnimationMulti(winners, slotCount);

  // Cập nhật trạng thái trúng
  // winners.forEach(async w => {
  //     w.IsReward = 1;
  //     await updateUserInDB(w);
  // });
  setTimeout(function () {
    fireConfetti();
  }, 5000);

  setTimeout(function () {
    toggleFan();
    setTimeout(function () {
      renderWinners(winners);
    }, 2000);
  }, 10000);
}

function animateDigit(element, targetDigit, duration) {
  let speed = 60; // tốc độ ban đầu
  let totalTime = 0;

  // Bật hiệu ứng
  element.classList.add("spin-shake");

  const interval = setInterval(() => {
    element.textContent = Math.floor(Math.random() * 10);
    totalTime += speed;
    // giảm tốc từ từ
    if (speed < 200) speed += 4;
    if (totalTime >= duration) {
      clearInterval(interval);
      element.classList.remove("spin-shake");
      // gán số thật
      element.textContent = targetDigit;
    }
  }, speed);
}
function playJackpotAnimationMulti(winners, slotCount) {
  for (let r = 0; r < slotCount; r++) {
    const userCode = winners[r].UserCode.split("");
    animateRow(r, userCode);
  }
}

function animateRow(rowIndex, digits) {
  for (let i = 1; i <= 6; i++) {
    const cell = document.getElementById(`num_${rowIndex}_${i}`);
    const digit = digits[i - 1] ?? "0";
    animateDigit(cell, digit, 1600 + i * 2000);
  }
}
function fireConfetti() {
  const duration = 4 * 1000; // Tăng thời gian bắn lên 4 giây cho rực rỡ
  const end = Date.now() + duration;

  (function frame() {
    // Tăng mật độ hạt mỗi lần bắn
    const pCount = 15;

    // Pháo bắn từ bên TRÁI
    confetti({
      particleCount: pCount,
      angle: 60, // Góc bắn chéo lên
      spread: 80, // Độ xòe rộng hơn
      origin: { x: -0.1, y: 0.8 }, // Bắn hơi lệch ngoài màn hình một chút
      ticks: 500, // Tăng ticks cực cao để hạt không biến mất sớm
      gravity: 0.7, // Trọng lực tự nhiên để tạo quỹ đạo hình vòng cung
      startVelocity: 60, // LỰC BẮN: Càng cao pháo càng bay XA
      scalar: 1.5, // Hạt pháo TO rõ rệt
      colors: ["#ff0000", "#ffd700", "#ffffff", "#ffcccb"],
    });

    // Pháo bắn từ bên PHẢI
    confetti({
      particleCount: pCount,
      angle: 120,
      spread: 80,
      origin: { x: 1.1, y: 0.8 },
      ticks: 500,
      gravity: 0.7,
      startVelocity: 60, // Tăng lực bắn đồng bộ
      scalar: 1.5,
      colors: ["#ff0000", "#ffd700", "#ffffff", "#ffcccb"],
    });

    confetti({
      particleCount: pCount, // Một phát nổ 200 hạt
      spread: 160,
      origin: { y: 0.6 },
      startVelocity: 50,
      scalar: 2,
      ticks: 400,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

function startQuestionRain(duration = 6000) {
  const rain = document.createElement("div");
  rain.className = "question-rain";
  document.body.appendChild(rain);

  const interval = setInterval(() => {
    const q = document.createElement("div");
    q.className = "question";
    q.innerHTML = `<img src="./assets/basics/question.png" style="width:120px;height:120px;">`;
    q.style.left = Math.random() * 100 + "vw";
    q.style.animationDuration = 2 + Math.random() * 2 + "s";
    q.style.transform = `rotate(${Math.random() * 360}deg)`;

    rain.appendChild(q);
    setTimeout(() => q.remove(), 5000);
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    rain.remove();
  }, duration);
}
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    spinGacha();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const wrapper = document.getElementById("confetti-wrapper");
  const confettiCount = 300;
  const colors = ["#ffd700", "#ff0000", "#ffffff", "#ff4500", "#ffcc00"];

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "p-confetti";

    const left = Math.random() * 100;
    const size = Math.random() * 8 + 4;
    const duration = Math.random() * 4 + 4;
    const delay = Math.random() * 8;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const borderRadius = Math.random() > 0.5 ? "50%" : "0%";

    confetti.style.left = left + "%";
    confetti.style.width = size + "px";
    confetti.style.height = size + "px";
    confetti.style.backgroundColor = color;
    confetti.style.borderRadius = borderRadius;
    confetti.style.animationDuration = duration + "s";
    confetti.style.animationDelay = "-" + delay + "s";

    wrapper.appendChild(confetti);
  }
});

initializeUsers();
initPrizeSelect();
