let prizeList = [];
let selectedPrize = null;

// =========================
// Load danh sách người từ localStorage
// =========================
let winners = JSON.parse(localStorage.getItem("rewardUsers") || "[]");
const winnerList = document.getElementById("winnerList");

async function renderWinners() {
  const users = await getUsersFromDB();
  const container = document.getElementById("winnerList");
  container.innerHTML = "";

  if (selectedPrize != null) {
    let index = 0;

    users
      .filter((u) => u.IsReward != 0 && u.isJoin == 1 && u.IsReward == selectedPrize.id)
      .forEach((u) => {
        const item = document.createElement("div");
        item.className = "winner-item";

        // delay xuất hiện từng người
        item.style.animationDelay = `${index * 0.2}s`;
        index++;

        item.innerHTML = `
          <div class="winner-avatar" style="background-image:url('../assets/users/${u.UserCode + ".JPG" || "020439.JPG"}')"></div>
          <div class="winner-info">
            <div class="name">${u.UserName}</div>
            <div class="code">Mã NV: ${u.UserCode}</div>
            <div class="dept">Phòng ban: ${u.Department}</div>
          </div>
        `;

        container.appendChild(item);
      });
  }
}
function renderPrize() {
  const prizesBox = document.getElementById("prizesBox");
  prizesBox.innerHTML = "";
  const img = document.createElement("img");
  img.src = "../assets/gift/" + "lixi.png";
  img.alt = "Giải thưởng";
  img.className = "prize-item soft-bounce";

  prizesBox.appendChild(img);
  setTimeout(() => {
    img.classList.add("show");
  }, 10);
}

renderWinners();
renderGachaRows();
// =========================
// Quay Gacha 6 số từ 0-6
// =========================
// async function spinGacha() {
//   // 1. Lấy danh sách tất cả user
//   const users = await getUsersFromDB();

//   // 2. Lọc danh sách user chưa trúng
//   const availableUsers = users.filter((u) => u.IsReward == 0 && u.isJoin == 1);
//   if (availableUsers.length === 0) {
//     alert("Tất cả người chơi đã trúng thưởng!");
//     return;
//   }

//   // 3. Chọn ngẫu nhiên 1 user
//   const randomIndex = Math.floor(Math.random() * availableUsers.length);
//   const winner = availableUsers[randomIndex];

//   for (let i = 0; i < 6; i++) {
//     const num = charAtSafe(winner.UserCode, i);
//     console.log(num.toString());
//     document.getElementById("num" + (i + 1)).textContent = num.toString();
//   }

//   // 5. Update isReward = 1 trong DB
//   // winner.IsReward = 1;
//   // await updateUserInDB(winner);

//   console.log("User đã trúng:", winner);
//   fireConfetti();
// }
function charAtSafe(str, i) {
  if (!str) return "";
  if (i < 0 || i >= str.length) return "";
  return str.charAt(i);
}
// =========================
// INDEX BD -------------------------------
// =========================

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
// Check User have data or not
function checkUserCount(db) {
  return new Promise((resolve) => {
    const tx = db.transaction("Users", "readonly");
    const store = tx.objectStore("Users");
    const req = store.count();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(0);
  });
}
//read json file
async function loadUserJson() {
  const res = await fetch("../json/user.json");
  return await res.json();
}
// Save user data to DB
function saveUsersToDB(db, users) {
  return new Promise((resolve) => {
    const tx = db.transaction("Users", "readwrite");
    const store = tx.objectStore("Users");

    users.forEach((user) => store.put(user));

    tx.oncomplete = () => resolve(true);
  });
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
window.onload = function () {
  initializeUsers();
};

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
function renderGachaRows(slotCount) {
  const container = document.getElementById("gachaRows");
  container.innerHTML = "";

  // for (let row = 0; row < slotCount; row++) {
  //     const div = document.createElement("div");
  //     div.className = "numbers-row";

  //     let html = "";
  //     for (let i = 1; i <= 6; i++) {
  //         html += `<div class="number" id="num_${row}_${i}">0</div>`;
  //     }

  //     div.innerHTML = html;
  //     container.appendChild(div);
  // }

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
function onPrizeChange() {
  const id = document.getElementById("prizeSelect").value;
  selectedPrize = prizeList.find((p) => p.id == id);

  if (!selectedPrize) return;

  renderGachaRows(selectedPrize.slot == 10 ? 5 : selectedPrize.slot);
  renderWinners();
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
}
async function loadPrizeJson() {
  const res = await fetch("../json/gift.json");
  return await res.json();
}

// Hiển thị dropdown giải
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
window.onload = function () {
  initializeUsers();
  initPrizeSelect();
};

// animation

function animateDigit(element, targetDigit, duration) {
  let speed = 60; // tốc độ ban đầu
  let totalTime = 0;

  // Bật hiệu ứng
  // element.classList.add("spin-blur");
  element.classList.add("spin-shake");

  const interval = setInterval(() => {
    // chạy số ngẫu nhiên
    element.textContent = Math.floor(Math.random() * 10);
    totalTime += speed;
    // giảm tốc từ từ
    if (speed < 200) speed += 4;
    if (totalTime >= duration) {
      clearInterval(interval);
      // tắt blur + shake
      // element.classList.remove("spin-blur");
      element.classList.remove("spin-shake");
      // gán số thật
      element.textContent = targetDigit;
    }
  }, speed);
}
async function playJackpotAnimation(winnerCode, rowCount) {
  for (let row = 0; row < rowCount; row++) {
    for (let i = 1; i <= 6; i++) {
      const element = document.getElementById(`num_${row}_${i}`);
      const digit = winnerCode[i - 1] ?? "0";
      // mỗi số dừng lệch nhau 200ms
      animateDigit(element, digit, 1600 + i * 2000);
    }
  }
}

function toggleFabMenu() {
  document.getElementById("fabMenu").classList.toggle("show");
}

// Render các giải vào menu
function renderPrizeMenu(prizes) {
  const menu = document.getElementById("fabMenu");
  menu.innerHTML = "";
  prizes.forEach((p) => {
    const div = document.createElement("div");
    div.className = "fab-item";
    div.textContent = `${p.name} (${p.slot} slot)`;
    div.onclick = () => {
      selectedPrize = p;
      toggleFabMenu();
      if (!selectedPrize) return;
      renderGachaRows(selectedPrize.slot == 10 ? 5 : selectedPrize.slot);
      renderWinners();
      renderPrize();
    };

    menu.appendChild(div);
  });
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
  const duration = 2 * 1000; // 2s
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });

    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
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
    q.innerHTML = `<img src="./assets/basics/question.png" style="width:80px;height:80px;">`;


    // vị trí xuất hiện ngẫu nhiên trên chiều ngang màn hình
    q.style.left = Math.random() * 100 + "vw";

    // thời gian rơi ngẫu nhiên từ 2–4 giây
    q.style.animationDuration = (2 + Math.random() * 2) + "s";

    // xoay ngẫu nhiên cho đẹp
    q.style.transform = `rotate(${Math.random() * 360}deg)`;

    rain.appendChild(q);

    // xóa khi rơi xong
    setTimeout(() => q.remove(), 5000);
  }, 100);

  // dừng sau duration
  setTimeout(() => {
    clearInterval(interval);
    rain.remove();
  }, duration);
}