let prizeList = [];
let selectedPrize = null;


// =========================
// Load danh sách người từ localStorage
// =========================
let winners = JSON.parse(localStorage.getItem("rewardUsers") || "[]");
const winnerList = document.getElementById("winnerList");

function renderWinners() {
    const container = document.getElementById("winnerList");
    container.innerHTML = "";

    winners
        .filter((u) => u.isReward === 0)
        .forEach((u) => {
            const item = document.createElement("div");
            item.className = "winner-item";

            item.innerHTML = `
        <div class="winner-avatar" style="background-image:url('../assets/users/${u.UserCode + ".JPG" || "020439.JPG"
                }')"></div>

        <div class="winner-info">
          <div class="name">${u.UserName}</div>
          <div class="code">Mã NV: ${u.UserCode}</div>
          <div class="dept">Phòng ban: ${u.Department}</div>
        </div>
      `;

            container.appendChild(item);
        });
}

renderWinners();

// =========================
// Quay Gacha 6 số từ 0-6
// =========================
async function spinGacha() {
    // 1. Lấy danh sách tất cả user
    const users = await getUsersFromDB();

    // 2. Lọc danh sách user chưa trúng
    const availableUsers = users.filter(
        (u) => u.IsReward == 0 && u.isJoin == 1
    );
    if (availableUsers.length === 0) {
        alert("Tất cả người chơi đã trúng thưởng!");
        return;
    }

    // 3. Chọn ngẫu nhiên 1 user
    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    const winner = availableUsers[randomIndex];

    for (let i = 0; i < 6; i++) {
        const num = charAtSafe(winner.UserCode, i);
        console.log(num.toString());
        document.getElementById("num" + (i + 1)).textContent = num.toString();
    }

    // 5. Update isReward = 1 trong DB
    // winner.IsReward = 1;
    // await updateUserInDB(winner);

    console.log("User đã trúng:", winner);
}
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
        store.put(user); // put sẽ insert hoặc update
        tx.oncomplete = () => resolve(true);
    });
}
function renderGachaRows(slotCount) {
    const container = document.getElementById("gachaRows");
    container.innerHTML = "";

    for (let row = 0; row < slotCount; row++) {
        const div = document.createElement("div");
        div.className = "numbers-row";

        let html = "";
        for (let i = 1; i <= 6; i++) {
            html += `<div class="number" id="num_${row}_${i}">0</div>`;
        }

        div.innerHTML = html;
        container.appendChild(div);
    }
}
function onPrizeChange() {
    const id = document.getElementById("prizeSelect").value;
    selectedPrize = prizeList.find((p) => p.id == id);

    if (!selectedPrize) return;

    renderGachaRows(selectedPrize.slot == 10 ? 5 : selectedPrize.slot);
}
async function spinGacha() {
    const slotCount = selectedPrize.slot == 10 ? 5 : selectedPrize.slot;
    if (!selectedPrize) {
        alert("Vui lòng chọn giải thưởng trước!");
        return;
    }
    const users = await getUsersFromDB();
    // Lọc user hợp lệ
    const availableUsers = users.filter(
        (u) => u.IsReward == 0 && u.isJoin == 1
    );

    if (availableUsers.length === 0) {
        alert("Không còn người nào đủ điều kiện quay!");
        return;
    }

    // Random 1 user
    const winner = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    // → Hiển thị code cho tất cả hàng
    for (let row = 0; row < slotCount; row++) {
        for (let i = 1; i <= 6; i++) {
            const digit = winner.UserCode[i - 1] ?? "0";
            document.getElementById(`num_${row}_${i}`).textContent = digit;
        }
    }

    // Cập nhật trạng thái trúng
    // winner.isReward = 1;
    // await updateUserInDB(winner);
    playJackpotAnimation(winner.UserCode, slotCount);

    console.log("Winner:", winner);
}

// Load prize.json
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
    // renderPrizeMenu(prizes);
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

            // mỗi số dừng lệch nhau 200ms → hiệu ứng rất thật
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

    prizes.forEach(p => {
        const div = document.createElement("div");
        div.className = "fab-item";
        div.textContent = `${p.name} (${p.slot} slot)`;

        div.onclick = () => {
            selectedPrize = p;
            console.log("Đã chọn giải:", p);

            // Tắt menu
            toggleFabMenu();

            // Thay đổi máy quay theo slot

            if (!selectedPrize) return;

            renderGachaRows(selectedPrize.slot == 10 ? 5 : selectedPrize.slot);
        };

        menu.appendChild(div);
    });
}