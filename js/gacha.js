let prizeList = [];
let selectedPrize = null;
// =========================
// INDEX BD -------------------------------
// =========================
initPrizeSelect();
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
  try {
    return prizesFENV;
  } catch (err) {
    console.error(err);
    return [];
  }
}
async function loadUserJson() {
  return userData;
}
async function initPrizeSelect() {
  prizeList = await loadPrizeJson();
  renderPrizeMenu(prizeList);
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
      resetEffect();
      renderGachaRows(selectedPrize.slot == 10 ? 5 : selectedPrize.slot);
      renderWinnerList(selectedPrize);

      const img = document.getElementById("selectedPrizeImage");
      const nameBanner = document.getElementById("prizeNamea");
      if (img && selectedPrize.image) {
        img.classList.remove("prize-bounce");
        void img.offsetWidth;
        img.src = `./assets/gift/${selectedPrize.image}`;
        nameBanner.textContent =
          selectedPrize.name +
          " ( " +
          selectedPrize.slot +
          " giải ) " +
          "\n" +
          selectedPrize.nameBanner;
        img.classList.add("prize-bounce");
      }
    };

    menu.appendChild(div);
  });
}

function toggleFabMenu() {
  document.getElementById("fabMenu").classList.toggle("show");
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

// async function spinGacha() {
//   if (!selectedPrize) {
//     alert("Vui lòng chọn giải thưởng trước!");
//     return;
//   }
//   // Số người cần tìm theo slot

//   const slotCount = selectedPrize.slot == 6 ? 3 : selectedPrize.slot;
//   const users = await getUsersFromDB();
//   // Lọc user hợp lệ
//   let availableUsers = users.filter((u) => u.IsReward == 0 && u.isJoin == 1);
//   let availableUsershaveprize = users.filter((u) => u.IsReward == 0 && u.isJoin == 1 && u.IsReward == selectedPrize.id);
//   let numberOfUserHavePrize = availableUsershaveprize.length;

//   if (availableUsers.length < slotCount) {
//     alert("Không đủ người để quay!");
//     return;
//   }

//   const element = document.querySelector(".handle-base");
//   // element.classList.add("rotating-image");
//   element.classList.add("lever-pull-animation");

//   setTimeout(() => {
//     element.classList.remove("lever-pull-animation");
//   }, 1200);

//   startQuestionRain(5000);
//   const winners = [];
//   for (let i = 0; i < slotCount; i++) {
//     const idx = Math.floor(Math.random() * availableUsers.length);
//     winners.push(availableUsers[idx]);
//     availableUsers.splice(idx, 1); // Xóa để không trùng
//   }

//   console.log("Winners:", winners);

//   // Render từng người theo từng hàng
//   winners.forEach((winner, row) => {
//     console.log("Winner:", row);
//     for (let i = 1; i <= 6; i++) {
//       const digit = winner.UserCode[i - 1] ?? "0";
//       document.getElementById(`num_${row}_${i}`).textContent = digit;
//     }
//   });

//   // Gọi animation
//   playJackpotAnimationMulti(winners, slotCount);
//   if (selectedPrize.id == 1 || selectedPrize.id == 2) {
//     const lixi = document.getElementById("lixi-w");
//     let cardHtml = "";
//     winners.forEach((winner, row) => {
//       cardHtml += `
//           <img src="../assets/users/${winner.UserCode}.jpg" alt="Winner Avatar" class="avatar" id="winner-avatar">
//           <div class="info">
//             <h2 id="winner-name">${winner.UserName}</h2>
//             <p id="winner-id">MSNV: ${winner.UserCode}</p>
//             <span class="badge" id="winner-dept">${winner.Department}</span>
//           </div>
//                 `;
//     });
//     lixi.innerHTML = cardHtml;
//   }

//   // Cập nhật trạng thái trúng
//   winners.forEach(async (w) => {
//     w.IsReward = selectedPrize.id;
//     await updateUserInDB(w);
//   });
//   if (selectedPrize.id == 1 || selectedPrize.id == 2 || selectedPrize.id == 3) {
//     setTimeout(function () {
//       startShow();
//       setTimeout(function () {
//         const stageSpotlight1 = document.getElementById("stage-spotlight");
//         stageSpotlight1.classList.remove("active", "searching");
//         fireConfetti();
//         showLanterns();
//       }, 7000);
//     }, 4000);
//   } else {
//     setTimeout(function () {
//       fireConfetti();
//     }, 5000);
//   }

//   setTimeout(async function () {
//     await renderWinnerList(selectedPrize);
//   }, 5000);
// }

async function renderWinnerList(selectedPrize) {
  const container = document.querySelector(".list-container");
  if (!container) return;

  // Xóa danh sách cũ trước khi render mới (nếu cần)
  container.innerHTML = "";
  const users = await getUsersFromDB();
  let winners = users.filter(
    (u) => u.IsReward == selectedPrize.id && u.isJoin == 1
  );
  winners.forEach((winner, index) => {
    let rankImageSrc = "";
    rankImageSrc = "./assets/users/" + winner.UserCode + ".jpg";
    // Tạo chuỗi HTML
    const winnerItem = document.createElement("div");
    winnerItem.className = "winner-item";

    // Thêm chút delay animation cho từng dòng để trông chuyên nghiệp hơn
    winnerItem.style.animationDelay = `${index * 0.1}s`;

    winnerItem.innerHTML = `
            <img class="winner-rank-img" src="${rankImageSrc}" alt="${winner.UserCode}">
            <div class="winner-info">
                <span class="user-name">${winner.UserName}</span>
                <div class="user-meta">
                    <span>#${winner.UserCode}</span>
                    <span class="user-dept">${winner.Department}</span>
                </div>
            </div>
        `;
    container.appendChild(winnerItem);
  });
  container.scrollTop = container.scrollHeight;
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
    const pCount = 5;

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
    q.innerHTML = `<img src="./assets/basics/question-yellow.png" style="width:120px;height:120px;">`;
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
    const scene = document.getElementById('scene');

    if (scene.style.zIndex == 14) {
      resetEffect();
      spinGacha();
    }

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

// Biến cờ để ngăn spam phím Enter khi đang quay
let isSpinning = false;

async function spinGacha() {
  // 1. Kiểm tra điều kiện cơ bản
  if (isSpinning) return; // Đang quay thì bỏ qua
  if (!selectedPrize) {
    alert("Vui lòng chọn giải thưởng trước!");
    return;
  }

  // Số slot tối đa của giải này
  const maxSlots = selectedPrize.slot;

  // Lấy dữ liệu mới nhất
  const users = await getUsersFromDB();

  // 2. Phân loại User
  // - Người ĐÃ trúng giải này rồi (để hiển thị các dòng bên trên)
  // Sửa lỗi logic cũ: Đã trúng thì IsReward phải bằng ID giải, không check IsReward == 0 nữa
  let existingWinners = users
    .filter((u) => u.IsReward == selectedPrize.id)
    .sort((a, b) => new Date(a.AttendanceDate) - new Date(b.AttendanceDate));

  // - Người CHƯA trúng giải nào (để quay dòng hiện tại)
  let candidates = users.filter((u) => u.IsReward == 0 && u.isJoin == 1);

  // 3. Xác định trạng thái quay
  const currentWinnerCount = existingWinners.length; // Số người đã trúng

  // Nếu đã đủ người trúng giải -> Thông báo và dừng
  if (currentWinnerCount >= maxSlots) {
    alert("Giải thưởng này đã đủ số lượng người trúng!");
    // Có thể gọi hàm hiển thị danh sách tổng kết tại đây nếu muốn
    renderWinnerList(selectedPrize);
    return;
  }

  // Nếu không còn ai để quay -> Dừng
  if (candidates.length === 0) {
    alert("Không đủ người hợp lệ để quay tiếp!");
    return;
  }

  // === BẮT ĐẦU QUAY ===
  isSpinning = true;

  // 4. Animation gạt cần (Lever)
  const element = document.querySelector(".handle-base");
  if (element) {
    element.classList.add("lever-pull-animation");
    setTimeout(() => {
      element.classList.remove("lever-pull-animation");
    }, 1200);
  }

  console.log("existingWinners", existingWinners);
  existingWinners.forEach((winner, row) => {
    renderSingleRowStatic(winner, row);
  });

  const activeRowIndex = currentWinnerCount;

  const randomIdx = Math.floor(Math.random() * candidates.length);
  const newWinner = candidates[randomIdx];

  console.log(`Đang quay dòng ${activeRowIndex + 1} cho:`, newWinner.UserName);

  startQuestionRain(5000);

  // 7. Gọi Animation CHỈ CHO DÒNG HIỆN TẠI
  // Lưu ý: Bạn cần sửa hàm playJackpotAnimationMulti để nó hỗ trợ quay 1 dòng cụ thể
  // Ở đây tôi giả định hàm playSingleRowAnimation(winner, rowIndex)
  // playSingleRowAnimation(newWinner, activeRowIndex);
  playJackpotRow1(activeRowIndex, newWinner);
  // 8. Cập nhật Database sau khi quay xong dòng này
  newWinner.IsReward = selectedPrize.id;
  newWinner.AttendanceDate = new Date().toISOString();
  updateUserInDB(newWinner);

  // Cập nhật lại danh sách winners cục bộ để xử lý UI tiếp theo
  const allWinnersNow = [...existingWinners, newWinner];

  // 9. Xử lý hiệu ứng trúng thưởng (Lì xì, pháo hoa)
  // Logic: Chỉ hiển thị hiệu ứng lớn khi quay xong slot CUỐI CÙNG hoặc tùy ý bạn
  // Ở đây tôi giữ logic hiển thị thông tin người vừa trúng
  if (selectedPrize.id == 1 || selectedPrize.id == 2) {
    updateLixiDisplay(allWinnersNow); // Hàm tách riêng update UI lixi
  }

  // Nếu đây là slot cuối cùng của giải -> Kích hoạt hiệu ứng kết thúc giải
  // if (allWinnersNow.length === maxSlots) {
  //   if (selectedPrize.id <= 2) {
  //     setTimeout(() => {
  //       startShow(); // Nhạc, spotlight
  //       setTimeout(() => {
  //         fireConfetti();
  //         showLanterns();
  //       }, 2000);
  //     }, 1000);
  //   } else {
  //     fireConfetti();
  //   }
  //   // Show bảng danh sách tổng kết
  //   setTimeout(async function () {
  //     await renderWinnerList(selectedPrize);
  //   }, 3000);
  // }

  if (selectedPrize.id == 1 || selectedPrize.id == 2) {
    setTimeout(function () {
      startShow();
      setTimeout(function () {
        const stageSpotlight1 = document.getElementById("stage-spotlight");
        stageSpotlight1.classList.remove("active", "searching");
        fireConfetti();
        showLanterns();
      }, 7000);
    }, 4000);
  } else {
    setTimeout(function () {
      fireConfetti();
    }, 5000);
  }
  if (selectedPrize.id == 1 || selectedPrize.id == 2) {
    setTimeout(async function () {
      await renderWinnerList(selectedPrize);
    }, 10000);
  } else {
    setTimeout(async function () {
      await renderWinnerList(selectedPrize);
    }, 5000);
  }
  isSpinning = false; // Mở khóa để cho phép nhấn Enter lần tiếp theo
}

// --- CÁC HÀM BỔ TRỢ (HELPER FUNCTIONS) ---

// Hàm hiển thị tĩnh giá trị (cho các dòng đã quay rồi)
function renderSingleRowStatic(winner, rowIndex) {
  for (let i = 1; i <= 6; i++) {
    const digit = winner.UserCode[i - 1] ?? "0";
    const el = document.getElementById(`num_${rowIndex}_${i}`);
    if (el) el.textContent = digit;
  }
  // Có thể thêm class để làm sáng dòng đã trúng
  // document.getElementById(`row_${rowIndex}`).classList.add('finished');
}

// Hàm cập nhật hiển thị Lì xì (Tách ra cho gọn)
function updateLixiDisplay(winners) {
  const lixi = document.getElementById("lixi-w");
  if (!lixi) return;

  let cardHtml = "";
  winners.forEach((winner) => {
    cardHtml += `
          <div class="winner-card-item"> <img src="../assets/users/${winner.UserCode}.jpg" alt="Avatar" class="avatar">
             <div class="info">
               <h2>${winner.UserName}</h2>
               <p>MSNV: ${winner.UserCode}</p>
               <span class="badge">${winner.Department}</span>
             </div>
          </div>`;
  });
  lixi.innerHTML = cardHtml;
}

// Hàm giả lập animation quay cho 1 dòng (Bạn cần điều chỉnh hàm cũ của bạn theo logic này)
function playSingleRowAnimation(winner, rowIndex) {
  console.log("Start animation row", rowIndex);
  renderSingleRowStatic(winner, rowIndex); // Hiển thị số
}

// 1. Hàm hiệu ứng số nhảy trên từng ô (Giữ nguyên)
function animateDigit1(element, targetDigit, duration) {
  let speed = 60; // Tốc độ ban đầu
  let totalTime = 0;

  // Bật hiệu ứng rung/lắc
  element.classList.add("spin-shake");

  const interval = setInterval(() => {
    // Random số giả trong lúc quay
    element.textContent = Math.floor(Math.random() * 10);
    totalTime += speed;

    // Giảm tốc từ từ (tăng speed nghĩa là chậm lại)
    if (speed < 200) speed += 4;

    // Khi hết thời gian
    if (totalTime >= duration) {
      clearInterval(interval);
      element.classList.remove("spin-shake");
      // Gán số thật (kết quả)
      element.textContent = targetDigit;
    }
  }, speed);
}

// 2. Hàm xử lý logic quay cho 1 dòng (Giữ nguyên logic cũ)
function animateRow1(rowIndex, digits) {
  for (let i = 1; i <= 6; i++) {
    const cell = document.getElementById(`num_${rowIndex}_${i}`);
    if (cell) {
      const digit = digits[i - 1] ?? "0";
      // Thời gian dừng từng ô: Ô 1 dừng trước, ô 6 dừng sau cùng
      animateDigit1(cell, digit, 1600 + i * 2000);
    }
  }
}

// 3. HÀM MỚI: Chỉ gọi quay cho 1 dòng cụ thể
// Input:
// - rowIndex: Số thứ tự dòng (0, 1, 2...)
// - winner: Object chứa thông tin người trúng (lấy UserCode)
function playJackpotRow1(rowIndex, winner) {
  if (!winner) {
    console.error("Không có dữ liệu người trúng cho dòng: " + rowIndex);
    return;
  }

  // Chuyển UserCode thành mảng ký tự
  const userCode = winner.UserCode.toString().split("");

  // Gọi hàm animateRow cho dòng chỉ định
  animateRow1(rowIndex, userCode);
}

// (Tùy chọn) Hàm cũ nếu bạn vẫn muốn giữ để quay tất cả 1 lúc (nếu cần)
function playJackpotAnimationMulti1(winners, slotCount) {
  for (let r = 0; r < slotCount; r++) {
    playJackpotRow1(r, winners[r]);
  }
}
