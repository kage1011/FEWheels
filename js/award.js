let jsonData = [];
let jsonPrize = [];
let jsonUserData = [];
let jsonUserAllData = [];

// --- KHỞI CHẠY ---
document.addEventListener("DOMContentLoaded", async () => {
  const users = await loadUsers();
  const prizes = await loadPrizes();
  jsonPrize = prizes;
  jsonUserAllData = users;
  jsonUserData = users.filter((u) => u.isJoin == 1 && u.IsReward != 0);
  jsonData = mapUserWithPrize(jsonUserData, jsonPrize);
  if (jsonData && jsonData.length > 0) {
    // Thêm độ trễ giả lập để thấy hiệu ứng loading (tuỳ chọn)
    setTimeout(() => {
      renderPrizes(jsonData, jsonPrize);
    }, 800);
  } else {
    document.getElementById("result-container").innerHTML =
      '<div style="color:#fff; text-align:center">Chưa có dữ liệu</div>';
  }
});
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

async function loadUsers() {
  try {
    const users = await getUsersFromDB();
    return users;
  } catch (err) {
    return [];
  }
}
async function loadPrizes() {
  try {
    return prizesFENV;
  } catch (err) {
    console.error(err);
    return [];
  }
}
function mapUserWithPrize(users, prizes) {
  return users.map((user) => {
    const prize = prizes.find((p) => p.id == user.IsReward);
    return {
      ...user,
      prizeName: prize ? prize.name : "",
    };
  });
}

///// get all User
async function getUsersFromDB() {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();

      if (!db.objectStoreNames.contains("Users")) {
        console.warn("Store 'Users' không tồn tại!");
        return resolve([]);
      }

      const tx = db.transaction("Users", "readonly");
      const store = tx.objectStore("Users");
      const users = [];

      tx.onerror = (err) => reject("Lỗi Transaction: " + err.target.error);

      const request = store.openCursor();

      request.onsuccess = function (e) {
        const cursor = e.target.result;
        if (cursor) {
          users.push(cursor.value);
          cursor.continue();
        } else {
          resolve(users);
        }
      };

      request.onerror = (err) => reject("Lỗi Cursor: " + err.target.error);
    } catch (err) {
      console.error("Lỗi khởi tạo DB:", err);
      reject(err);
    }
  });
}

function renderPrizes(winners, config) {
  const container = document.getElementById("result-container");
  container.innerHTML = "";

  let currentIndex = 0;

  config.forEach((prize, index) => {
    const prizeWinners = winners.filter((u) => u.IsReward == prize.id);
    currentIndex += prize.slots;

    if (prizeWinners.length === 0) return;

    const wideClass = prize.slots > 5 ? "wide-layout" : "";

    let iconDecor = "🎁";
    if (index === 0) iconDecor = "🌸"; // Giải 1
    else if (index === 1) iconDecor = "🌸"; // Giải 2
    else if (index === 2) iconDecor = "🌸"; // Giải 3

    // Tạo danh sách HTML
    const listHtml = prizeWinners
      .map(
        (winner) => `
                    <li class="winner-item">
                        <div class="w-info">
                            <span class="w-name"><span class="icon-gold">${iconDecor}</span>${winner.UserName
          }</span>
                            <span class="w-dept">${winner.Department || "Phòng ban"
          }</span>
                        </div>
                        <span class="w-code">${winner.UserCode}</span>
                    </li>
                `
      )
      .join("");

    const cardHtml = `
                    <div class="tet-card ${wideClass}">
                        <div class="card-header">
                            <div class="prize-name">${prize.name}</div>
                        </div>
                        <div class="card-body">
                            <img src="./assets/gift/${prize.image}" alt="${prize.name}" class="product-img">
                            <ul class="winner-list">
                                ${listHtml}
                            </ul>
                        </div>
                    </div>
                `;

    container.insertAdjacentHTML("beforeend", cardHtml);
  });
}
